"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// ===== STEP 1: EDIT THIS SECTION ONLY =====
// Put your real participants & criteria here (from the Excel).
// You are NOT changing your Excel, just mirroring its data in the app.

type Section = "Best Paper" | "Young Researcher";

type Participant = {
  id: string;
  name: string;
  title: string;
};

const PARTICIPANTS: Participant[] = [
  { id: "P01", name: "Akhil Sukumar P", title: "Research Paper Title" },
  { id: "P02", name: "Rashmi R Nath", title: "Research Paper Title" },
  { id: "P03", name: "Siji R", title: "Research Paper Title" },
  { id: "P04", name: "Chaithra Dinesh", title: "Research Paper Title" },
  { id: "P05", name: "Muhammad Puzhakkala Veettil", title: "Research Paper Title" },
  { id: "P06", name: "Sandra Kv", title: "Research Paper Title" },
  { id: "P07", name: "Remya K", title: "Research Paper Title" },
  { id: "P08", name: "Hridya G", title: "Research Paper Title" },
  { id: "P09", name: "Chandni Pm", title: "Research Paper Title" },
  { id: "P10", name: "Joshna M", title: "Research Paper Title" },
  { id: "P11", name: "Sreelakshmi Suresh", title: "Research Paper Title" },
  { id: "P12", name: "Saniya Sudhan", title: "Research Paper Title" },
  { id: "P13", name: "Shayana P", title: "Research Paper Title" },
];

const JUDGES = [
  "Dr. Meghana M. Reddy",
  "Dr. Anu Mary Chacko",
  "Dr. Sameera Salam",
  "Dr. K. Nagaraju",
];

type Criterion = {
  id: string;
  label: string;
  description: string;
  max: number;
};

// Criteria for Best Paper Award (Score 1-5 for each criterion)
const BEST_PAPER_CRITERIA: Criterion[] = [
  {
    id: "research_quality",
    label: "Research Quality & Originality",
    description: "Novelty of the research idea, contribution to knowledge, originality of methods.",
    max: 5,
  },
  {
    id: "technical_depth",
    label: "Technical Depth & Methodology",
    description: "Soundness of research design, rigor of experiments, validity of results.",
    max: 5,
  },
  {
    id: "practical_relevance",
    label: "Practical Relevance & Impact",
    description: "Applicability to real-world problems, societal/industrial impact.",
    max: 5,
  },
  {
    id: "clarity_quality",
    label: "Clarity & Quality of Paper",
    description: "Organization, readability, formatting, proper references.",
    max: 5,
  },
  {
    id: "presentation",
    label: "Presentation & Delivery",
    description: "Clarity of oral presentation, ability to answer questions, audience engagement.",
    max: 5,
  },
];

// Criteria for Young Researcher Award (Score 1-5 for each criterion)
const YOUNG_RESEARCHER_CRITERIA: Criterion[] = [
  {
    id: "novelty_innovation",
    label: "Novelty & Innovation",
    description: "Creativity in research idea, exploration of emerging domains.",
    max: 5,
  },
  {
    id: "research_potential",
    label: "Research Potential & Contribution",
    description: "Long-term value, contribution to AI/ML/IoT/Emerging Tech.",
    max: 5,
  },
  {
    id: "methodological_approach",
    label: "Methodological Approach",
    description: "Appropriateness, interdisciplinary techniques, scientific rigor.",
    max: 5,
  },
  {
    id: "presentation_skills",
    label: "Presentation Skills",
    description: "Clarity, confidence, delivery, Q&A handling.",
    max: 5,
  },
  {
    id: "future_research",
    label: "Future Research Scope",
    description: "Relevance for sustainable development, industry collaboration.",
    max: 5,
  },
];

// ===== END OF CONFIG SECTION =====

type ScoreRecord = {
  id: string;
  participantId: string;
  judge: string;
  section: Section;
  scores: Record<string, number>; // criterionId -> score
  total: number;
  createdAt: string;
};

export default function HomePage() {
  const [selectedJudge, setSelectedJudge] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<Section>("Best Paper");
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");
  const [criterionScores, setCriterionScores] = useState<Record<string, string>>({});
  const [scoreRecords, setScoreRecords] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);

  // Get criteria based on selected section
  const currentCriteria =
    selectedSection === "Best Paper"
      ? BEST_PAPER_CRITERIA
      : YOUNG_RESEARCHER_CRITERIA;

  const maxTotal = currentCriteria.reduce((sum, c) => sum + c.max, 0);

  // Load scores from Supabase on mount
  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading scores:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const mapped: ScoreRecord[] = data.map((row: any) => ({
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
      setLoading(false);
    };

    fetchScores();
  }, []);

  const handleScoreChange = (criterionId: string, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    setCriterionScores((prev) => ({ ...prev, [criterionId]: value }));
  };

  const handleSubmitScore = async () => {
    if (!selectedJudge) {
      alert("Please select a judge.");
      return;
    }
    if (!selectedParticipantId) {
      alert("Please select a participant.");
      return;
    }

    // Validate & clamp scores
    const numericScores: Record<string, number> = {};
    for (const c of currentCriteria) {
      const raw = criterionScores[c.id];
      if (!raw) {
        alert(`Please enter score for "${c.label}".`);
        return;
      }
      const num = Number(raw);
      if (isNaN(num)) {
        alert(`Invalid score for "${c.label}".`);
        return;
      }
      if (num < 0 || num > c.max) {
        alert(`Score for "${c.label}" must be between 0 and ${c.max}.`);
        return;
      }
      numericScores[c.id] = num;
    }

    const total = Object.values(numericScores).reduce((sum, v) => sum + v, 0);

    setSaving(true);
    const { data, error } = await supabase
      .from("scores")
      .insert({
        participant_id: selectedParticipantId,
        judge: selectedJudge,
        section: selectedSection,
        scores: numericScores,
        total,
      })
      .select("*")
      .single();

    setSaving(false);

    if (error) {
      console.error("Error saving score:", error);
      alert(`Error saving score: ${error.message}\n\nDetails: ${error.details || 'No additional details'}\n\nPlease check the console for more information.`);
      return;
    }

    const newRecord: ScoreRecord = {
      id: data.id,
      participantId: data.participant_id,
      judge: data.judge,
      section: data.section as Section,
      scores: data.scores || {},
      total: Number(data.total),
      createdAt: data.created_at,
    };

    setScoreRecords((prev) => [newRecord, ...prev]);
    // Clear scores only, keep judge/participant selection for faster entry
    setCriterionScores({});
  };

  const handleClearAll = async () => {
    // Password protection
    const password = prompt("⚠️ Enter password to clear all scores:");
    if (password !== "1234") {
      if (password !== null) {
        alert("❌ Incorrect password. Access denied.");
      }
      return;
    }

    if (!confirm("Clear ALL scores from the online database? This cannot be undone!")) return;
    
    setClearing(true);
    const { error } = await supabase.from("scores").delete().neq("id", "");
    setClearing(false);

    if (error) {
      console.error("Error clearing scores:", error);
      alert("Error clearing scores. Please try again.");
      return;
    }

    setScoreRecords([]);
    alert("✅ All scores have been cleared successfully.");
  };

  const handleExportCSV = () => {
    if (scoreRecords.length === 0) {
      alert("No scores to export.");
      return;
    }

    // Build CSV content
    const headers = [
      "Participant ID",
      "Participant Name",
      "Paper Title",
      "Judge",
      "Section",
      ...currentCriteria.map((c) => c.label),
      "Total Score",
      "Submitted At",
    ];

    const rows = scoreRecords.map((record) => {
      const participant = PARTICIPANTS.find((p) => p.id === record.participantId);
      const criteria =
        record.section === "Best Paper"
          ? BEST_PAPER_CRITERIA
          : YOUNG_RESEARCHER_CRITERIA;

      return [
        record.participantId,
        participant?.name || "Unknown",
        participant?.title || "Unknown",
        record.judge,
        record.section,
        ...criteria.map((c) => record.scores[c.id] || 0),
        record.total,
        new Date(record.createdAt).toLocaleString(),
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ICCIET_2025_Scores_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportXLSX = () => {
    if (scoreRecords.length === 0) {
      alert("No scores to export.");
      return;
    }

    // Build worksheet data
    const headers = [
      "Participant ID",
      "Participant Name",
      "Paper Title",
      "Judge",
      "Section",
      ...BEST_PAPER_CRITERIA.map((c) => c.label),
      "Total Score",
      "Submitted At",
    ];

    const rows = scoreRecords.map((record) => {
      const participant = PARTICIPANTS.find((p) => p.id === record.participantId);
      const criteria =
        record.section === "Best Paper"
          ? BEST_PAPER_CRITERIA
          : YOUNG_RESEARCHER_CRITERIA;

      return [
        record.participantId,
        participant?.name || "Unknown",
        participant?.title || "Unknown",
        record.judge,
        record.section,
        ...criteria.map((c) => record.scores[c.id] || 0),
        record.total,
        new Date(record.createdAt).toLocaleString(),
      ];
    });

    // Create simple XLSX format (XML-based)
    const worksheet = [headers, ...rows];
    
    // Convert to HTML table for Excel
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><meta charset="utf-8"/></head><body><table>';
    
    worksheet.forEach((row, idx) => {
      html += '<tr>';
      row.forEach((cell) => {
        const tag = idx === 0 ? 'th' : 'td';
        html += `<${tag}>${String(cell).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${tag}>`;
      });
      html += '</tr>';
    });
    
    html += '</table></body></html>';

    // Download
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ICCIET_2025_Scores_${new Date().toISOString().split("T")[0]}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  type RankingRow = {
    participant: Participant;
    avgScore: number;
    judgeCount: number;
  };

  // Compute rankings for each section
  const rankings: Record<Section, RankingRow[]> = useMemo(() => {
    const result: Record<Section, RankingRow[]> = {
      "Best Paper": [],
      "Young Researcher": [],
    };

    (["Best Paper", "Young Researcher"] as Section[]).forEach((section) => {
      const perParticipant: Record<
        string,
        { totalSum: number; count: number }
      > = {};

      for (const record of scoreRecords) {
        if (record.section !== section) continue;
        if (!perParticipant[record.participantId]) {
          perParticipant[record.participantId] = { totalSum: 0, count: 0 };
        }
        perParticipant[record.participantId].totalSum += record.total;
        perParticipant[record.participantId].count += 1;
      }

      const rows: RankingRow[] = Object.entries(perParticipant)
        .map(([participantId, { totalSum, count }]) => {
          const participant = PARTICIPANTS.find((p) => p.id === participantId);
          if (!participant) return null;
          return {
            participant,
            avgScore: totalSum / count,
            judgeCount: count,
          };
        })
        .filter((row): row is RankingRow => row !== null)
        .sort((a, b) => b.avgScore - a.avgScore);

      result[section] = rows;
    });

    return result;
  }, [scoreRecords]);

  // Clear score inputs when section changes
  useEffect(() => {
    setCriterionScores({});
  }, [selectedSection]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 flex flex-col">
      <header className="relative bg-gradient-to-r from-black via-gray-900 to-black px-6 py-5 flex flex-col gap-1 md:flex-row md:items-center md:justify-between shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Animated decorative blurs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gray-700/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-800/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/3 to-white/5 backdrop-blur-md"></div>
        
        {/* Content */}
        <div className="relative z-10 group">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight drop-shadow-lg transition-all duration-300 group-hover:scale-105 bg-white px-4 py-2 rounded-lg inline-block">
            <span className="text-[#ba324f] hover:text-[#ba324f]/90 transition-colors">ICCIET</span>{" "}
            <span className="text-[#ba324f] hover:text-[#ba324f]/90 transition-colors">2025</span>{" "}
            <span className="text-[#175676] hover:text-[#175676]/90 transition-colors">– Judging Portal</span>
          </h1>
          <p className="text-sm text-white/90 font-medium backdrop-blur-sm mt-2">
            International Conference on Computational Intelligence & Emerging Technologies
          </p>
          {loading && (
            <p className="text-xs text-white/80 mt-1">
              ⏳ Loading scores from secure database...
            </p>
          )}
        </div>
        <div className="relative z-10 mt-2 md:mt-0 flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            className="text-xs px-4 py-2 rounded-xl border-2 border-white/50 text-white hover:bg-white/20 hover:border-white hover:scale-105 hover:shadow-lg transition-all duration-300 font-bold backdrop-blur-md"
          >
            📊 Export CSV
          </button>
          <button
            onClick={handleExportXLSX}
            className="text-xs px-4 py-2 rounded-xl border-2 border-white/50 text-white hover:bg-white/20 hover:border-white hover:scale-105 hover:shadow-lg transition-all duration-300 font-bold backdrop-blur-md"
          >
            📈 Export Excel
          </button>
          <button
            onClick={handleClearAll}
            disabled={clearing}
            className="text-xs px-4 py-2 rounded-xl border-2 border-white/50 text-white hover:bg-white/20 hover:border-white hover:scale-105 hover:shadow-lg transition-all duration-300 font-bold backdrop-blur-md disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {clearing ? "Clearing..." : "🗑️ Clear all"}
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Left: Scoring form */}
        <section className="relative bg-white backdrop-blur-xl border-2 border-[#175676]/30 rounded-2xl p-4 sm:p-6 shadow-2xl hover:shadow-[#175676]/20 transition-all duration-300 overflow-hidden group">
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#ba324f]/10 to-[#175676]/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          
          <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#175676]/20">
            <div className="w-1.5 h-6 bg-gradient-to-b from-[#ba324f] to-[#175676] rounded-full shadow-lg"></div>
            <h2 className="text-lg font-bold text-[#175676] flex-1">
              Judge Scoring Panel
            </h2>
            <span className="text-xs font-bold text-[#175676] bg-[#175676]/10 px-3 py-1 rounded-full shadow-sm">
              Max: {maxTotal} pts
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 mb-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide text-[#175676] font-bold">
                👨‍⚖️ Judge
              </label>
              <select
                className="bg-white border-2 border-[#175676]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ba324f] focus:border-[#ba324f] hover:border-[#175676] transition-all duration-300 font-medium shadow-sm"
                value={selectedJudge}
                onChange={(e) => setSelectedJudge(e.target.value)}
              >
                <option value="">Select judge</option>
                {JUDGES.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide text-[#175676] font-bold">
                📂 Section
              </label>
              <div className="flex bg-white border-2 border-[#175676]/30 rounded-lg overflow-hidden text-xs shadow-sm">
                {(["Best Paper", "Young Researcher"] as Section[]).map(
                  (sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSelectedSection(sec)}
                      className={`flex-1 px-2 py-2 transition-all duration-300 font-semibold ${
                        selectedSection === sec
                          ? "bg-[#175676] text-white shadow-lg scale-105"
                          : "text-[#175676] hover:bg-[#175676]/10 hover:scale-102"
                      }`}
                    >
                      {sec}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide text-[#175676] font-bold">
                👤 Participant
              </label>
              <select
                className="bg-white border-2 border-[#175676]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ba324f] focus:border-[#ba324f] hover:border-[#175676] transition-all duration-300 font-medium shadow-sm"
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(e.target.value)}
              >
                <option value="">Select participant</option>
                {PARTICIPANTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} – {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Participant info */}
          {selectedParticipantId && (
            <div className="mb-5 text-xs sm:text-sm bg-gradient-to-r from-[#ba324f]/5 via-white to-[#175676]/5 border-2 border-[#175676]/30 rounded-xl px-4 py-3 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm">
              {(() => {
                const p = PARTICIPANTS.find(
                  (x) => x.id === selectedParticipantId
                );
                if (!p) return null;
                return (
                  <>
                    <div className="font-bold text-[#175676]">✨ {p.name}</div>
                    <div className="text-gray-700 font-medium">📄 {p.title}</div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Criteria inputs */}
          <div className="space-y-3">
            {currentCriteria.map((c) => {
              const value = criterionScores[c.id] ?? "";

              return (
                <div
                  key={c.id}
                  className="group flex flex-col gap-2 bg-white border-2 border-[#175676]/20 rounded-xl px-3 py-3 hover:border-[#ba324f] hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-bold text-[#175676] group-hover:text-[#ba324f] transition-all duration-300">
                        {c.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5 group-hover:text-gray-700 transition-colors">
                        {c.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={value}
                        onChange={(e) => handleScoreChange(c.id, e.target.value)}
                        className="w-20 bg-white border-2 border-[#175676]/30 rounded-lg px-2 py-1.5 text-sm text-right font-bold focus:outline-none focus:ring-2 focus:ring-[#ba324f] focus:border-[#ba324f] hover:border-[#175676] transition-all duration-300 shadow-sm"
                        placeholder="0"
                      />
                      <span className="text-xs text-[#175676] font-semibold whitespace-nowrap">
                        / {c.max}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t-2 border-[#175676]/20">
            <div className="text-xs text-gray-600 font-medium">
              💡 Scores are stored in a secure online database and used to
              compute averages and rankings across all judges.
            </div>
            <button
              type="button"
              onClick={handleSubmitScore}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#ba324f] text-white text-sm font-bold hover:bg-[#ba324f]/90 hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {saving ? "Saving..." : "💾 Save Score"}
            </button>
          </div>
        </section>

        {/* Right: Rankings */}
        <section className="space-y-6">
          {(["Best Paper", "Young Researcher"] as Section[]).map((section) => {
            const rows = rankings[section];
            return (
              <div
                key={section}
                className="relative bg-white backdrop-blur-xl border-2 border-[#175676]/30 rounded-2xl p-4 sm:p-5 shadow-2xl hover:shadow-[#ba324f]/20 transition-all duration-300 overflow-hidden group"
              >
                {/* Decorative blur */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#ba324f]/10 to-[#175676]/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                
                <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-[#175676]/20">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-[#ba324f] to-[#175676] rounded-full shadow-lg"></div>
                  <h2 className="text-lg font-bold text-[#175676] flex-1">
                    🏆 {section} Ranking
                  </h2>
                  <span className="text-xs font-bold text-[#175676] bg-[#175676]/10 px-3 py-1 rounded-full shadow-sm">
                    {rows.length} scored
                  </span>
                </div>
                {rows.length === 0 ? (
                  <p className="text-sm text-[#175676] font-medium">
                    📊 No scores yet for this section.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="text-left text-[#175676] border-b-2 border-[#175676]/20 font-bold">
                          <th className="py-2 pr-2">Rank</th>
                          <th className="py-2 pr-2">Participant</th>
                          <th className="py-2 pr-2">Paper title</th>
                          <th className="py-2 pr-2 text-right">
                            Avg / {maxTotal}
                          </th>
                          <th className="py-2 pr-2 text-right">
                            Judges
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => (
                          <tr
                            key={row.participant.id}
                            className="border-b border-[#175676]/10 last:border-0 hover:bg-[#175676]/5 hover:scale-[1.01] transition-all duration-300"
                          >
                            <td className="py-2 pr-2 align-top">
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shadow-lg hover:scale-110 transition-transform duration-300 ${
                                  idx === 0
                                    ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 animate-pulse"
                                    : idx === 1
                                    ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900"
                                    : idx === 2
                                    ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                                    : "bg-[#175676]/20 text-[#175676]"
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-2 pr-2 align-top whitespace-nowrap">
                              <div className="font-bold text-[#175676]">
                                {row.participant.name}
                              </div>
                              <div className="text-[11px] text-gray-600 font-medium">
                                {row.participant.id}
                              </div>
                            </td>
                            <td className="py-2 pr-2 align-top">
                              <div className="line-clamp-2 text-gray-700 font-medium">
                                {row.participant.title}
                              </div>
                            </td>
                            <td className="py-2 pr-2 align-top text-right font-bold text-[#ba324f]">
                              {row.avgScore.toFixed(2)}
                            </td>
                            <td className="py-2 pr-2 align-top text-right text-[#175676] font-semibold">
                              {row.judgeCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          {/* Recent submissions mini-log */}
          <div className="relative bg-white backdrop-blur-xl border-2 border-[#175676]/30 rounded-2xl p-4 sm:p-5 shadow-2xl hover:shadow-[#175676]/20 transition-all duration-300 overflow-hidden group">
            {/* Decorative blur */}
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-[#ba324f]/10 to-[#175676]/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-[#175676]/20">
              <div className="w-1.5 h-5 bg-gradient-to-b from-[#ba324f] to-[#175676] rounded-full shadow-lg"></div>
              <h2 className="text-sm font-bold text-[#175676]">
                📋 Recent Submissions
              </h2>
            </div>
            {scoreRecords.length === 0 ? (
              <p className="text-xs text-[#175676] font-medium">⏳ No scores recorded yet.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                {scoreRecords.slice(0, 20).map((record) => {
                  const p = PARTICIPANTS.find(
                    (x) => x.id === record.participantId
                  );
                  if (!p) return null;
                  return (
                    <div
                      key={record.id}
                      className="border-2 border-[#175676]/20 rounded-lg px-2.5 py-1.5 bg-white hover:border-[#ba324f] hover:shadow-md hover:scale-[1.02] transition-all duration-300"
                    >
                      <div className="flex justify-between gap-2">
                        <span className="font-bold text-[#175676]">{record.judge}</span>
                        <span className="text-[#175676] font-bold text-[10px] bg-[#175676]/10 px-1.5 py-0.5 rounded shadow-sm">
                          {record.section}
                        </span>
                      </div>
                      <div className="text-[#175676] font-medium">
                        {p.id} – {p.name}
                      </div>
                      <div className="flex justify-between text-gray-600 mt-0.5">
                        <span className="truncate max-w-[14rem]">
                          {p.title}
                        </span>
                        <span className="font-bold text-[#ba324f]">
                          {record.total.toFixed(1)} / {maxTotal}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="bg-gradient-to-r from-black via-gray-900 to-black px-6 py-4 text-[11px] flex flex-col sm:flex-row justify-between gap-2 shadow-2xl">
        <span className="font-bold text-white">
          <span className="text-white">ICCIET 2025</span> Judging Portal · International Conference on Computational Intelligence & Emerging Technologies
        </span>
        <span className="font-bold text-white">
          ☁️ Scores synced via secure Supabase database
        </span>
      </footer>
    </main>
  );
}
