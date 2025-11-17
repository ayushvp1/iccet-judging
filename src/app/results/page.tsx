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
  createdAt: string;
};

type RankingRow = {
  participant: Participant;
  avgScore: number;
  judgeCount: number;
  allScores: { judge: string; total: number }[];
};

export default function ResultsPage() {
  const [scoreRecords, setScoreRecords] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [participants, setParticipants] = useState<Participant[]>([]);

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
      { totalSum: number; count: number; scores: { judge: string; total: number }[] }
    > = {};

    for (const record of scoreRecords) {
      if (record.section !== section) continue;
      if (!perParticipant[record.participantId]) {
        perParticipant[record.participantId] = { totalSum: 0, count: 0, scores: [] };
      }
      perParticipant[record.participantId].totalSum += record.total;
      perParticipant[record.participantId].count += 1;
      perParticipant[record.participantId].scores.push({
        judge: record.judge,
        total: record.total,
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
        <section className="grid md:grid-cols-2 gap-6">
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
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-300">
                  <div className="text-xl font-bold text-[#175676] mb-1">
                    {bestPaperRankings[0].participant.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {bestPaperRankings[0].participant.id}
                  </div>
                  <div className="text-sm text-gray-700 mb-3">
                    {bestPaperRankings[0].participant.title}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-yellow-200">
                    <span className="text-sm text-gray-600">Average Score:</span>
                    <span className="text-2xl font-bold text-[#ba324f]">
                      {bestPaperRankings[0].avgScore.toFixed(2)} / 25
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Judged by {bestPaperRankings[0].judgeCount} judges
                  </div>
                </div>
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
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-300">
                  <div className="text-xl font-bold text-[#175676] mb-1">
                    {youngResearcherRankings[0].participant.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {youngResearcherRankings[0].participant.id}
                  </div>
                  <div className="text-sm text-gray-700 mb-3">
                    {youngResearcherRankings[0].participant.title}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                    <span className="text-sm text-gray-600">Average Score:</span>
                    <span className="text-2xl font-bold text-[#ba324f]">
                      {youngResearcherRankings[0].avgScore.toFixed(2)} / 25
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Judged by {youngResearcherRankings[0].judgeCount} judges
                  </div>
                </div>
              ) : (
                <p className="text-blue-800">No scores available yet</p>
              )}
            </div>
          </div>
        </section>

        {/* Complete Rankings */}
        {(["Best Paper", "Young Researcher"] as Section[]).map((section) => {
          const rankings = section === "Best Paper" ? bestPaperRankings : youngResearcherRankings;
          
          return (
            <section key={section} className="bg-white rounded-2xl p-6 shadow-xl border-2 border-[#175676]/20">
              <h2 className="text-2xl font-bold text-[#175676] mb-6 pb-3 border-b-2 border-[#175676]/20">
                {section} - Complete Rankings
              </h2>
              
              {rankings.length === 0 ? (
                <p className="text-gray-600">No scores available for this category yet.</p>
              ) : (
                <div className="space-y-4">
                  {rankings.map((row, idx) => (
                    <div
                      key={row.participant.id}
                      className={`border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
                        idx === 0
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
                            className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold shadow-lg ${
                              idx === 0
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
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
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
