"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

type Section = "Best Paper" | "Young Researcher";

type Participant = {
  id: string;
  name: string;
  title: string;
};

type ScoreRecord = {
  id: string;
  participantId: string;
  judge: string;
  section: Section;
  scores: Record<string, number>;
  total: number;
  remark?: string;
  createdAt: string;
};

type RankingRow = {
  participant: Participant;
  avgScore: number;
  judgeCount: number;
  allScores: { judge: string; total: number; remark?: string }[];
};

export default function ResultsPage() {
  const [scoreRecords, setScoreRecords] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [manualBestPaperWinnerId, setManualBestPaperWinnerId] = useState<string>("");
  const [manualYoungResearcherWinnerId, setManualYoungResearcherWinnerId] = useState<string>("");
  const [judgeWhyTexts, setJudgeWhyTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [scoresResult, participantsResult] = await Promise.all([
        supabase
          .from("scores")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("participants")
          .select("*")
          .order("id", { ascending: true }),
      ]);

      if (scoresResult.error) {
        console.error("Error loading scores:", scoresResult.error);
      } else if (scoresResult.data) {
        const mapped: ScoreRecord[] = scoresResult.data.map((row: any) => ({
          id: row.id,
          participantId: row.participant_id,
          judge: row.judge,
          section: row.section as Section,
          scores: row.scores || {},
          total: Number(row.total),
          remark: row.remark || "",
          createdAt: row.created_at,
        }));
        setScoreRecords(mapped);
      }

      if (participantsResult.error) {
        console.error("Error loading participants:", participantsResult.error);
      } else if (participantsResult.data) {
        setParticipants(
          participantsResult.data.map((row: any) => ({
            id: row.id,
            name: row.name,
            title: row.title,
          }))
        );
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const getRankings = (section: Section): RankingRow[] => {
    const perParticipant: Record<
      string,
      {
        totalSum: number;
        count: number;
        scores: { judge: string; total: number; remark?: string }[];
      }
    > = {};

    for (const record of scoreRecords) {
      if (record.section !== section) continue;
      if (!perParticipant[record.participantId]) {
        perParticipant[record.participantId] = {
          totalSum: 0,
          count: 0,
          scores: [],
        };
      }
      perParticipant[record.participantId].totalSum += record.total;
      perParticipant[record.participantId].count += 1;
      perParticipant[record.participantId].scores.push({
        judge: record.judge,
        total: record.total,
        remark: record.remark,
      });
    }

    const rows: RankingRow[] = Object.entries(perParticipant)
      .map(([participantId, { totalSum, count, scores }]) => {
        const participant = participants.find((p) => p.id === participantId);
        if (!participant) return null;
        return {
          participant,
          avgScore: totalSum / count,
          judgeCount: count,
          allScores: scores,
        };
      })
      .filter((row): row is RankingRow => row !== null)
      .sort((a, b) => b.avgScore - a.avgScore);

    return rows;
  };

  const bestPaperRankings = getRankings("Best Paper");
  const youngResearcherRankings = getRankings("Young Researcher");

  // Helper to group rankings by average score (for tie detection)
  const groupByAvgScore = (rows: RankingRow[]) => {
    const groups: { score: number; items: RankingRow[] }[] = [];
    const EPS = 0.0001; // handle floating point

    for (const row of rows) {
      // Try to find an existing group with same avgScore (within EPS)
      let group = groups.find((g) => Math.abs(g.score - row.avgScore) < EPS);
      if (!group) {
        group = { score: row.avgScore, items: [] };
        groups.push(group);
      }
      group.items.push(row);
    }

    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#175676] mb-2">Loading Results...</div>
          <div className="text-gray-600">Please wait while we fetch the data</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
      <header className="relative bg-gradient-to-r from-black via-gray-900 to-black px-6 py-5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              ICCIET 2025 – Final Results
            </h1>
            <p className="text-sm text-white/80 mt-1">
              Complete Rankings & Winners
            </p>
          </div>
          <Link
            href="/"
            className="text-xs px-6 py-3 rounded-xl border-2 border-white/50 text-white hover:bg-white/20 hover:border-white hover:scale-105 hover:shadow-lg transition-all duration-300 font-bold backdrop-blur-md text-center"
          >
            Back to Judging Panel
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Winners Section */}
        <section className="grid md:grid-cols-[2fr,2fr,1.5fr] gap-6 items-start">
          {/* Best Paper Winner */}
          <div className="relative bg-gradient-to-br from-yellow-50 to-yellow-100 border-4 border-yellow-400 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/30 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-5xl">🏆</div>
                <div>
                  <h2 className="text-2xl font-bold text-yellow-900">Best Paper Award</h2>
                  <p className="text-sm text-yellow-700">Winner</p>
                </div>
              </div>
              {bestPaperRankings.length > 0 ? (
                (() => {
                  const autoWinner = bestPaperRankings[0];
                  const manualWinner =
                    manualBestPaperWinnerId &&
                    bestPaperRankings.find((r) => r.participant.id === manualBestPaperWinnerId);
                  const displayWinner = manualWinner || autoWinner;

                  return (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-300">
                      <div className="text-xl font-bold text-[#175676] mb-1">
                        {displayWinner.participant.name}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {displayWinner.participant.id}
                      </div>
                      <div className="text-sm text-gray-700 mb-3">
                        {displayWinner.participant.title}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-yellow-200">
                        <span className="text-sm text-gray-600">Average Score:</span>
                        <span className="text-2xl font-bold text-[#ba324f]">
                          {displayWinner.avgScore.toFixed(2)} / 25
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Judged by {displayWinner.judgeCount} judges
                      </div>
                      {manualWinner && (
                        <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-100 border border-yellow-300 text-[11px] font-semibold text-yellow-900 uppercase tracking-wide">
                          Manual First Position (Tie Breaker)
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <p className="text-yellow-800">No scores available yet</p>
              )}
            </div>
          </div>

          {/* Young Researcher Winner */}
          <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-blue-400 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300/30 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-5xl">🌟</div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-900">Young Researcher Award</h2>
                  <p className="text-sm text-blue-700">Winner</p>
                </div>
              </div>
              {youngResearcherRankings.length > 0 ? (
                (() => {
                  const autoWinner = youngResearcherRankings[0];
                  const manualWinner =
                    manualYoungResearcherWinnerId &&
                    youngResearcherRankings.find((r) => r.participant.id === manualYoungResearcherWinnerId);
                  const displayWinner = manualWinner || autoWinner;

                  return (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-300">
                      <div className="text-xl font-bold text-[#175676] mb-1">
                        {displayWinner.participant.name}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {displayWinner.participant.id}
                      </div>
                      <div className="text-sm text-gray-700 mb-3">
                        {displayWinner.participant.title}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                        <span className="text-sm text-gray-600">Average Score:</span>
                        <span className="text-2xl font-bold text-[#ba324f]">
                          {displayWinner.avgScore.toFixed(2)} / 25
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Judged by {displayWinner.judgeCount} judges
                      </div>
                      {manualWinner && (
                        <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 border border-blue-300 text-[11px] font-semibold text-blue-900 uppercase tracking-wide">
                          Manual First Position (Tie Breaker)
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <p className="text-blue-800">No scores available yet</p>
              )}
            </div>
          </div>

          {/* Manual First Position Override Panel */}
          <div className="bg-white border-2 border-[#175676]/20 rounded-2xl p-4 shadow-lg space-y-4">
            <h3 className="text-lg font-bold text-[#175676] border-b border-gray-200 pb-2">
              Manual First Position (Tie Breaker)
            </h3>

            <div className="space-y-2 text-xs text-gray-600">
              <p>
                Use this panel to choose a manual first position for each category when there are ties or special
                considerations. This acts as a tie-breaker for publishing the final results and does not modify the
                underlying scores.
              </p>
            </div>

            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Best Paper - Manual First Position
                </label>
                <select
                  className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#175676] focus:border-[#175676] bg-white"
                  value={manualBestPaperWinnerId}
                  onChange={(e) => setManualBestPaperWinnerId(e.target.value)}
                >
                  <option value="">-- None / Auto Only --</option>
                  {bestPaperRankings.map((row) => (
                    <option key={row.participant.id} value={row.participant.id}>
                      {row.participant.id}  b7 {row.participant.name}
                    </option>
                  ))}
                </select>
                {manualBestPaperWinnerId && (
                  <div className="mt-1 text-[11px] text-green-700">
                    Selected: {
                      bestPaperRankings.find((r) => r.participant.id === manualBestPaperWinnerId)?.participant.name ||
                      manualBestPaperWinnerId
                    }
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Young Researcher - Manual First Position
                </label>
                <select
                  className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#175676] focus:border-[#175676] bg-white"
                  value={manualYoungResearcherWinnerId}
                  onChange={(e) => setManualYoungResearcherWinnerId(e.target.value)}
                >
                  <option value="">-- None / Auto Only --</option>
                  {youngResearcherRankings.map((row) => (
                    <option key={row.participant.id} value={row.participant.id}>
                      {row.participant.id}  b7 {row.participant.name}
                    </option>
                  ))}
                </select>
                {manualYoungResearcherWinnerId && (
                  <div className="mt-1 text-[11px] text-green-700">
                    Selected: {
                      youngResearcherRankings.find((r) => r.participant.id === manualYoungResearcherWinnerId)?.participant
                        .name || manualYoungResearcherWinnerId
                    }
                  </div>
                )}
              </div>

              {/* Side display cards */}
              <div className="mt-3 space-y-3">
                {manualBestPaperWinnerId && (
                  <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-3">
                    <div className="text-[11px] font-semibold text-yellow-800 mb-1 uppercase tracking-wide">
                      Best Paper - Manual First Position
                    </div>
                    <div className="text-xs font-bold text-[#175676]">
                      {
                        bestPaperRankings.find((r) => r.participant.id === manualBestPaperWinnerId)?.participant
                          .name || manualBestPaperWinnerId
                      }
                    </div>
                    <div className="text-[11px] text-gray-600">
                      {
                        bestPaperRankings.find((r) => r.participant.id === manualBestPaperWinnerId)?.participant
                          .id || ""
                      }
                    </div>
                  </div>
                )}

                {manualYoungResearcherWinnerId && (
                  <div className="border border-blue-300 bg-blue-50 rounded-lg p-3">
                    <div className="text-[11px] font-semibold text-blue-800 mb-1 uppercase tracking-wide">
                      Young Researcher - Manual First Position
                    </div>
                    <div className="text-xs font-bold text-[#175676]">
                      {
                        youngResearcherRankings.find((r) => r.participant.id === manualYoungResearcherWinnerId)?.participant
                          .name || manualYoungResearcherWinnerId
                      }
                    </div>
                    <div className="text-[11px] text-gray-600">
                      {
                        youngResearcherRankings.find((r) => r.participant.id === manualYoungResearcherWinnerId)?.participant
                          .id || ""
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* Why text from judges for manual decision */}
              <div className="pt-3 mt-2 border-t border-gray-200 space-y-4">
                {manualBestPaperWinnerId && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                      Why (Best Paper judges who scored selected manual position)
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {Array.from(
                        new Set(
                          scoreRecords
                            .filter((r) => r.participantId === manualBestPaperWinnerId)
                            .map((r) => r.judge)
                        )
                      ).map((judge) => (
                        <div key={judge} className="space-y-1">
                          <div className="text-[11px] font-semibold text-gray-600 flex items-center justify-between">
                            <span>Judge: {judge}</span>
                          </div>
                          <textarea
                            className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#175676] focus:border-[#175676] bg-white resize-none"
                            rows={2}
                            placeholder="Why did you support this manual first position for Best Paper?"
                            value={judgeWhyTexts[judge] || ""}
                            onChange={(e) =>
                              setJudgeWhyTexts((prev) => ({
                                ...prev,
                                [judge]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {manualYoungResearcherWinnerId && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                      Why (Young Researcher judges who scored selected manual position)
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {Array.from(
                        new Set(
                          scoreRecords
                            .filter((r) => r.participantId === manualYoungResearcherWinnerId)
                            .map((r) => r.judge)
                        )
                      ).map((judge) => (
                        <div key={judge} className="space-y-1">
                          <div className="text-[11px] font-semibold text-gray-600 flex items-center justify-between">
                            <span>Judge: {judge}</span>
                          </div>
                          <textarea
                            className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#175676] focus:border-[#175676] bg-white resize-none"
                            rows={2}
                            placeholder="Why did you support this manual first position for Young Researcher?"
                            value={judgeWhyTexts[judge] || ""}
                            onChange={(e) =>
                              setJudgeWhyTexts((prev) => ({
                                ...prev,
                                [judge]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Complete Rankings */}
        {(["Best Paper", "Young Researcher"] as Section[]).map((section) => {
          const rankings = section === "Best Paper" ? bestPaperRankings : youngResearcherRankings;
          const tieGroups = groupByAvgScore(rankings);

          return (
            <section key={section} className="bg-white rounded-2xl p-6 shadow-xl border-2 border-[#175676]/20">
              <h2 className="text-2xl font-bold text-[#175676] mb-6 pb-3 border-b-2 border-[#175676]/20">
                {section} - Complete Rankings
              </h2>

              {rankings.length === 0 ? (
                <p className="text-gray-600">No scores available for this category yet.</p>
              ) : (
                <div className="space-y-4">
                  {rankings.map((row, idx) => {
                    const tieGroup = tieGroups.find((g) => g.items.some((r) => r.participant.id === row.participant.id));
                    const isTie = tieGroup && tieGroup.items.length > 1;

                    // Aggregate remarks from all judges for this participant
                    const aggregatedRemark = row.allScores
                      .map((s) => s.remark?.trim())
                      .filter((r): r is string => !!r && r.length > 0)
                      .join(" | ");

                    return (
                      <div
                        key={row.participant.id}
                        className={`border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${idx === 0
                          ? "border-yellow-400 bg-yellow-50"
                          : idx === 1
                            ? "border-gray-400 bg-gray-50"
                            : idx === 2
                              ? "border-amber-600 bg-amber-50"
                              : "border-gray-200 bg-white hover:border-[#175676]"
                        }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold shadow-lg ${idx === 0
                                ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900"
                                : idx === 1
                                  ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900"
                                  : idx === 2
                                    ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                                    : "bg-[#175676]/20 text-[#175676]"
                              }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-lg font-bold text-[#175676]">
                              {row.participant.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {row.participant.id} • {row.participant.title}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#ba324f]">
                              {row.avgScore.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">Avg Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-[#175676]">
                              {row.judgeCount}
                            </div>
                            <div className="text-xs text-gray-500">Judges</div>
                          </div>
                        </div>
                      </div>
                      {/* Tie Remark Section (auto from judges) */}
                      {isTie && aggregatedRemark && (
                        <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-900">
                          <div className="font-semibold mb-1">Tie Remark (aggregated from judges):</div>
                          <div className="italic line-clamp-3 break-words">{aggregatedRemark}</div>
                        </div>
                      )}

                      {/* Individual Judge Scores */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-xs font-bold text-gray-600 mb-2">Individual Scores:</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {row.allScores.map((score, scoreIdx) => (
                            <div
                              key={scoreIdx}
                              className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
                            >
                              <div className="text-xs text-gray-600 truncate">{score.judge}</div>
                              <div className="text-sm font-bold text-[#175676]">
                                {score.total.toFixed(1)} / 25
                              </div>
                              {score.remark && (
                                <div className="mt-1 text-sm text-gray-700 italic bg-white/70 px-2.5 py-1.5 rounded border border-gray-100 line-clamp-3">
                                  "{score.remark}"
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <footer className="bg-gradient-to-r from-black via-gray-900 to-black px-6 py-4 text-xs text-white text-center mt-8">
        <p className="font-bold">
          ICCIET 2025 Judging Portal • International Conference on Computational Intelligence & Emerging Technologies
        </p>
      </footer>
    </main>
  );
}
