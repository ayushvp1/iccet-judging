"use client";
import { Analytics } from "@vercel/analytics/next"
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

const STATIC_PARTICIPANTS: Participant[] = [
  { id: "P01", name: "Anulal P", title: "DeepReveal: An Explainable AI Framework for Robust Deepfake Detection" },
  { id: "P02", name: "Muhammed Rashid", title: "Research Paper Title" },
  { id: "P03", name: "Sainadh V", title: "Traffic sign detection using yolov8" },
  { id: "P04", name: "Amaya M", title: "Enhancing Eye Disease Classification with Transformer-Based Vision Model" },
  { id: "P05", name: "Ayush V P", title: "YOLOv8-GSAF: Lightweight Ghost and SimAM Enhanced Road Damage Detection Framework" },
  { id: "P06", name: "Fathima Safna C P", title: "Beyond Pixels: A Multi-Sensor Fusion Approach for Intelligent Wildfire Detection Using YOLO Architectures" },
  { id: "P07", name: "Ashitha P Sujith", title: "ENHANCED ALZHEIMER'S DETECTION USING VISION TRANSFORMERS AND EXPLAINABLE AI TECHNIQUES ON PREPROCESSED MRI SCANS" },
  { id: "P08", name: "Asher Vargheese K", title: "Transformer-Integrated YOLO-Air with Super-Resolution Preprocessing for Enhanced Small Object Detection in UAV Imagery" },
  { id: "P09", name: "Sandra KV", title: "A Literature Review on the Evolution of IoT-Enabled Smart Home Automation for Secure, Scalable, and Intelligent Environments" },
  { id: "P10", name: "Aravind P", title: "Stock market price prediction using LSTM and Random forest and sentimental analysis via FinBERT" },
  { id: "P11", name: "Govind Hans V", title: "Enhancing Prediction on Imbalanced Medical Datasets: An Evaluation of Gradient Boosting Models with the SMOTE-MRS Technique" },
  { id: "P12", name: "Gokul krishna A M", title: "Research Paper Title" },
  { id: "P13", name: "Sourav K", title: "Hybrid Weather forecasting using Machine Learning and Traditional Forecasting techniques" },
  { id: "P14", name: "Akhil Sukumar P", title: "Machine Learning–Enabled Framework for Adaptive Resource Allocation in Next-Generation Wireless Networks" },
  { id: "P15", name: "Rashmi R Nath", title: "Optimized Deep Learning with Wavelet Features for Multi-Class EEG-Based Alzheimer's Disease Detection" },
  { id: "P16", name: "Siji R", title: "The Role of Sign Language in Inclusive Education – Challenges and Technological Intervention" },
  { id: "P17", name: "Chaithra dinesh", title: "Integrating computational intelligence and medical imaging for lifestyle diseases management in India" },
  { id: "P18", name: "Muhammed Puzhakkala Veettil", title: "Deep Learning and Hybrid Cryptographic Approaches for Securing Wireless Sensor Networks: A Comprehensive" },
  { id: "P19", name: "Remya K", title: "A Review on Secure Machine-to-Machine Communication in Industrial IoT: Challenges and Computational Intelligence Approaches" },
  { id: "P20", name: "Hridya G", title: "GlaucoNet: A Novel Multi-Scale Attention Network for Robust Glaucoma Classification from Noisy Fundus Images" },
  { id: "P21", name: "Chandini P M", title: "A Comparative Analysis of Traditional Machine Learning and Deep Learning for Early Disease Detection from Leaf Textures" },
  { id: "P22", name: "Joshna M", title: "AI for Green 6G: A Review of Energy-Aware Routing Techniques" },
  { id: "P23", name: "Shayana P", title: "Smart organ donation and disease management system: an explainable AI Literature Review" },
  { id: "P24", name: "Akshara P B", title: "BFLBreacher: Exposing Privacy Vulnerabilities in Federated Learning" },
  { id: "P25", name: "Rasheed NK", title: "Research Paper Title" },
];

const JUDGES = [
  "Dr. Meghana M. Reddy",
  "Dr. Anu Mary Chacko",
  "Dr. Sameera Salam",
  "Dr. K. Nagaraju",
  "Dr. Premjith B",
  "Dr. Vimala Mathew",
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
  remark?: string;
  createdAt: string;
};

export default function HomePage() {
  const [selectedJudge, setSelectedJudge] = useState<string>("");
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");
  const [bestPaperScores, setBestPaperScores] = useState<Record<string, string>>({});
  const [youngResearcherScores, setYoungResearcherScores] = useState<Record<string, string>>({});
  const [remark, setRemark] = useState<string>("");
  const [scoreRecords, setScoreRecords] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingBestPaper, setSavingBestPaper] = useState<boolean>(false);
  const [savingYoungResearcher, setSavingYoungResearcher] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);
  const [showAddParticipant, setShowAddParticipant] = useState<boolean>(false);
  const [newParticipant, setNewParticipant] = useState({ id: "", name: "", title: "" });
  const [showEditParticipants, setShowEditParticipants] = useState<boolean>(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);


  const maxTotal = 25; // Each section has 5 criteria × 5 points = 25 max

  // Load scores and participants from Supabase on mount
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
        // Fallback to static list if DB not ready
        setParticipants(STATIC_PARTICIPANTS);
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

  const handleScoreChange = (section: Section, criterionId: string, value: string) => {
    if (section === "Best Paper") {
      setBestPaperScores((prev) => ({ ...prev, [criterionId]: value }));
    } else {
      setYoungResearcherScores((prev) => ({ ...prev, [criterionId]: value }));
    }
  };

  const handleSubmitAllScores = async () => {
    if (!selectedJudge) {
      alert("Please select a judge.");
      return;
    }
    if (!selectedParticipantId) {
      alert("Please select a participant.");
      return;
    }

    // Validate Best Paper scores
    const bestPaperNumericScores: Record<string, number> = {};
    for (const c of BEST_PAPER_CRITERIA) {
      const raw = bestPaperScores[c.id];
      if (!raw) {
        alert(`Please enter score for "${c.label}" in Best Paper section.`);
        return;
      }
      const num = Number(raw);
      if (isNaN(num)) {
        alert(`Invalid score for "${c.label}" in Best Paper section.`);
        return;
      }
      if (num < 0 || num > c.max) {
        alert(`Score for "${c.label}" must be between 0 and ${c.max}.`);
        return;
      }
      bestPaperNumericScores[c.id] = num;
    }

    // Validate Young Researcher scores
    const youngResearcherNumericScores: Record<string, number> = {};
    for (const c of YOUNG_RESEARCHER_CRITERIA) {
      const raw = youngResearcherScores[c.id];
      if (!raw) {
        alert(`Please enter score for "${c.label}" in Young Researcher section.`);
        return;
      }
      const num = Number(raw);
      if (isNaN(num)) {
        alert(`Invalid score for "${c.label}" in Young Researcher section.`);
        return;
      }
      if (num < 0 || num > c.max) {
        alert(`Score for "${c.label}" must be between 0 and ${c.max}.`);
        return;
      }
      youngResearcherNumericScores[c.id] = num;
    }

    const bestPaperTotal = Object.values(bestPaperNumericScores).reduce((sum, v) => sum + v, 0);
    const youngResearcherTotal = Object.values(youngResearcherNumericScores).reduce((sum, v) => sum + v, 0);

    setSavingBestPaper(true);
    setSavingYoungResearcher(true);

    // Remove any existing scores for this judge + participant so the new submission replaces the old one
    const { error: deleteError } = await supabase
      .from("scores")
      .delete()
      .eq("participant_id", selectedParticipantId)
      .eq("judge", selectedJudge);

    if (deleteError) {
      console.error("Error clearing previous scores for this judge and participant:", deleteError);
      alert("Error clearing previous scores for this judge and participant. Please try again.");
      setSavingBestPaper(false);
      setSavingYoungResearcher(false);
      return;
    }

    // Save both scores
    const bestPaperInsert: any = {
      participant_id: selectedParticipantId,
      judge: selectedJudge,
      section: "Best Paper",
      scores: bestPaperNumericScores,
      total: bestPaperTotal,
    };
    if (remark) bestPaperInsert.remark = remark;

    const { data: bestPaperData, error: bestPaperError } = await supabase
      .from("scores")
      .insert(bestPaperInsert)
      .select("*")
      .single();

    const youngResearcherInsert: any = {
      participant_id: selectedParticipantId,
      judge: selectedJudge,
      section: "Young Researcher",
      scores: youngResearcherNumericScores,
      total: youngResearcherTotal,
    };
    if (remark) youngResearcherInsert.remark = remark;

    const { data: youngResearcherData, error: youngResearcherError } = await supabase
      .from("scores")
      .insert(youngResearcherInsert)
      .select("*")
      .single();

    setSavingBestPaper(false);
    setSavingYoungResearcher(false);

    if (bestPaperError || youngResearcherError) {
      console.error("Error saving scores:", bestPaperError, youngResearcherError);
      const errorMsg = bestPaperError?.message || youngResearcherError?.message || "Unknown error";
      const errorDetails = bestPaperError?.details || youngResearcherError?.details || "";
      console.error("Error details:", errorMsg, errorDetails);
      alert(`Error saving scores: ${errorMsg}\n\nPlease check the console for more details.`);
      return;
    }

    // Add both records to the list, after removing any older ones for this judge + participant
    const newRecords: ScoreRecord[] = [];

    if (bestPaperData) {
      newRecords.push({
        id: bestPaperData.id,
        participantId: bestPaperData.participant_id,
        judge: bestPaperData.judge,
        section: bestPaperData.section as Section,
        scores: bestPaperData.scores || {},
        total: Number(bestPaperData.total),
        remark: bestPaperData.remark || "",
        createdAt: bestPaperData.created_at,
      });
    }

    if (youngResearcherData) {
      newRecords.push({
        id: youngResearcherData.id,
        participantId: youngResearcherData.participant_id,
        judge: youngResearcherData.judge,
        section: youngResearcherData.section as Section,
        scores: youngResearcherData.scores || {},
        total: Number(youngResearcherData.total),
        remark: youngResearcherData.remark || "",
        createdAt: youngResearcherData.created_at,
      });
    }

    setScoreRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.participantId === selectedParticipantId && r.judge === selectedJudge)
      );
      return [...newRecords, ...filtered];
    });

    // Clear all scores
    setBestPaperScores({});
    setYoungResearcherScores({});
    setRemark("");

    alert("✅ Both scores saved successfully!");
  };

  const handleClearAll = async () => {
    if (!selectedParticipantId) {
      alert("Please select a participant whose scores you want to clear.");
      return;
    }

    // Password protection
    const password = prompt("⚠️ Enter password to clear this participant's scores:");
    if (password !== "1234") {
      if (password !== null) {
        alert("❌ Incorrect password. Access denied.");
      }
      return;
    }

    if (!confirm(`Clear ALL scores for participant ${selectedParticipantId}? This cannot be undone!`)) return;

    setClearing(true);
    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("participant_id", selectedParticipantId);
    setClearing(false);

    if (error) {
      console.error("Error clearing scores:", error);
      alert("Error clearing scores. Please try again.");
      return;
    }

    setScoreRecords((prev) => prev.filter((r) => r.participantId !== selectedParticipantId));
    alert(`✅ All scores for participant ${selectedParticipantId} have been cleared successfully.`);
  };

  const handleAddParticipant = async () => {
    if (!newParticipant.id || !newParticipant.name || !newParticipant.title) {
      alert("Please fill in all fields.");
      return;
    }

    // Check if ID already exists in current list
    if (participants.find(p => p.id === newParticipant.id)) {
      alert("Participant ID already exists.");
      return;
    }

    const { error } = await supabase
      .from("participants")
      .insert({
        id: newParticipant.id,
        name: newParticipant.name,
        title: newParticipant.title,
      });

    if (error) {
      console.error("Error adding participant:", error);
      alert("Error adding participant. Please try again.");
      return;
    }

    setParticipants((prev) => [...prev, { ...newParticipant }]);
    setNewParticipant({ id: "", name: "", title: "" });
    setShowAddParticipant(false);
    alert(`✅ Participant ${newParticipant.id} added successfully!`);
  };

  const handleOpenEditParticipants = () => {
    const password = prompt("⚠️ Enter password to edit participants:");
    if (password !== "1234") {
      if (password !== null) {
        alert("❌ Incorrect password. Access denied.");
      }
      return;
    }
    setShowEditParticipants(true);
  };

  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant({ ...participant });
  };

  const handleSaveEdit = async () => {
    if (!editingParticipant) return;

    if (!editingParticipant.name || !editingParticipant.title) {
      alert("Please fill in all fields.");
      return;
    }

    const { error } = await supabase
      .from("participants")
      .update({
        name: editingParticipant.name,
        title: editingParticipant.title,
      })
      .eq("id", editingParticipant.id);

    if (error) {
      console.error("Error updating participant:", error);
      alert("Error updating participant. Please try again.");
      return;
    }

    setParticipants((prev) =>
      prev.map((p) =>
        p.id === editingParticipant.id ? { ...editingParticipant } : p
      )
    );
    setEditingParticipant(null);
    alert(`✅ Participant ${editingParticipant.id} updated successfully!`);
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!confirm(`Delete participant ${participantId}? This cannot be undone!`)) return;

    const { error } = await supabase
      .from("participants")
      .delete()
      .eq("id", participantId);

    if (error) {
      console.error("Error deleting participant:", error);
      alert("Error deleting participant. Please try again.");
      return;
    }

    setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    alert(`✅ Participant ${participantId} deleted successfully!`);
  };

  const handleExportXLSX = () => {
    if (scoreRecords.length === 0) {
      alert("No scores to export.");
      return;
    }

    // Calculate rankings for both sections
    const calculateRankings = (section: Section) => {
      const perParticipant: Record<
        string,
        {
          totalSum: number;
          count: number;
        }
      > = {};

      for (const record of scoreRecords) {
        if (record.section !== section) continue;
        if (!perParticipant[record.participantId]) {
          perParticipant[record.participantId] = { totalSum: 0, count: 0 };
        }
        perParticipant[record.participantId].totalSum += record.total;
        perParticipant[record.participantId].count += 1;
      }

      return Object.entries(perParticipant)
        .map(([participantId, { totalSum, count }]) => {
          const participant = participants.find((p) => p.id === participantId);
          if (!participant) return null;
          return {
            participant,
            avgScore: totalSum / count,
            judgeCount: count,
          };
        })
        .filter((row): row is { participant: Participant; avgScore: number; judgeCount: number } => row !== null)
        .sort((a, b) => b.avgScore - a.avgScore);
    };

    const bestPaperRankings = calculateRankings("Best Paper");
    const youngResearcherRankings = calculateRankings("Young Researcher");

    // Build worksheet data with scores
    const scoresHeaders = [
      "Participant ID",
      "Participant Name",
      "Paper Title",
      "Judge",
      "Section",
      ...BEST_PAPER_CRITERIA.map((c) => c.label),
      "Total Score",
      "Remark",
      "Submitted At",
    ];

    const scoresRows = scoreRecords.map((record) => {
      const participant = participants.find((p) => p.id === record.participantId);
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
        record.remark || "",
        new Date(record.createdAt).toLocaleString(),
      ];
    });

    // Convert to HTML with multiple tables for Excel
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><meta charset="utf-8"/>';
    html += '<style>';
    html += 'body { font-family: Arial, sans-serif; }';
    html += 'h2 { color: #175676; margin-top: 30px; margin-bottom: 10px; }';
    html += 'table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }';
    html += 'th { background-color: #175676; color: white; font-weight: bold; padding: 10px; border: 1px solid #ddd; text-align: left; }';
    html += 'td { padding: 8px; border: 1px solid #ddd; }';
    html += 'tr:nth-child(even) { background-color: #f9f9f9; }';
    html += '.rank-1 { background-color: #ffd700; font-weight: bold; }';
    html += '.rank-2 { background-color: #c0c0c0; font-weight: bold; }';
    html += '.rank-3 { background-color: #cd7f32; font-weight: bold; }';
    html += '.participant-id { background-color: #e3f2fd; font-weight: bold; }';
    html += '.participant-name { background-color: #fff3e0; }';
    html += '.judge { background-color: #f3e5f5; }';
    html += '.section { background-color: #e8f5e9; font-weight: bold; }';
    html += '.score { background-color: #fff9c4; text-align: center; }';
    html += '.total { background-color: #ffccbc; font-weight: bold; text-align: center; }';
    html += '.winner { background-color: #ffd700; font-weight: bold; font-size: 14px; }';
    html += '</style>';
    html += '</head><body>';

    // Add Rankings Section
    html += '<h2>ICCIET 2025 - FINAL RANKINGS</h2>';

    // Best Paper Rankings
    html += '<h3>Best Paper Award - Rankings</h3>';
    html += '<table>';
    html += '<tr><th>Rank</th><th>Participant ID</th><th>Participant Name</th><th>Paper Title</th><th>Average Score</th><th>Judges Count</th></tr>';
    bestPaperRankings.forEach((row, idx) => {
      const rankClass = idx === 0 ? 'rank-1 winner' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : '';
      html += `<tr class="${rankClass}">`;
      html += `<td>${idx + 1}</td>`;
      html += `<td>${row.participant.id}</td>`;
      html += `<td>${row.participant.name}</td>`;
      html += `<td>${row.participant.title}</td>`;
      html += `<td>${row.avgScore.toFixed(2)} / 25</td>`;
      html += `<td>${row.judgeCount}</td>`;
      html += '</tr>';
    });
    html += '</table>';

    // Young Researcher Rankings
    html += '<h3>Young Researcher Award - Rankings</h3>';
    html += '<table>';
    html += '<tr><th>Rank</th><th>Participant ID</th><th>Participant Name</th><th>Paper Title</th><th>Average Score</th><th>Judges Count</th></tr>';
    youngResearcherRankings.forEach((row, idx) => {
      const rankClass = idx === 0 ? 'rank-1 winner' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : '';
      html += `<tr class="${rankClass}">`;
      html += `<td>${idx + 1}</td>`;
      html += `<td>${row.participant.id}</td>`;
      html += `<td>${row.participant.name}</td>`;
      html += `<td>${row.participant.title}</td>`;
      html += `<td>${row.avgScore.toFixed(2)} / 25</td>`;
      html += `<td>${row.judgeCount}</td>`;
      html += '</tr>';
    });
    html += '</table>';

    // Add Detailed Scores Section
    html += '<h2>DETAILED SCORES BY JUDGE</h2>';
    html += '<table>';

    [scoresHeaders, ...scoresRows].forEach((row, idx) => {
      html += '<tr>';
      row.forEach((cell, colIdx) => {
        if (idx === 0) {
          html += `<th>${String(cell).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</th>`;
        } else {
          let className = '';
          if (colIdx === 0) className = 'participant-id';
          else if (colIdx === 1) className = 'participant-name';
          else if (colIdx === 3) className = 'judge';
          else if (colIdx === 4) className = 'section';
          else if (colIdx >= 5 && colIdx < row.length - 2) className = 'score';
          else if (colIdx === row.length - 2) className = 'total';

          html += `<td class="${className}">${String(cell).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
        }
      });
      html += '</tr>';
    });

    html += '</table>';
    html += '</body></html>';

    // Download
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ICCIET_2025_Complete_Report_${new Date().toISOString().split("T")[0]}.xls`);
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
        {
          totalSum: number;
          count: number;
        }
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
          const participant = participants.find((p) => p.id === participantId);
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
  }, [scoreRecords, participants]);

  // Count distinct participants who have been scored
  const distinctParticipantsScored = useMemo(() => {
    const uniqueParticipants = new Set(scoreRecords.map(r => r.participantId));
    return uniqueParticipants.size;
  }, [scoreRecords]);



  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 text-gray-900 flex flex-col">
      <header className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-6 py-6 flex flex-col gap-1 md:flex-row md:items-center md:justify-between shadow-2xl overflow-hidden">
        {/* Animated decorative blurs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl"></div>
        </div>

        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/3 to-white/5 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10 group">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight drop-shadow-2xl transition-all duration-300 group-hover:scale-[1.02] bg-gradient-to-r from-white to-blue-50 px-5 py-3 rounded-2xl inline-block shadow-xl">
            <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">ICCIET</span>{" "}
            <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">2025</span>{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">– Judging Portal</span>
          </h1>
          <p className="text-sm text-white/95 font-semibold backdrop-blur-sm mt-2 drop-shadow-lg">
            International Conference on Computational Intelligence & Emerging Technologies
          </p>
          {loading && (
            <p className="text-xs text-cyan-300 mt-1 animate-pulse">
              Loading scores from secure database...
            </p>
          )}
        </div>
        <div className="relative z-10 mt-2 md:mt-0 flex flex-wrap gap-2">
          <a
            href="/results"
            className="text-xs px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:scale-105 hover:shadow-2xl transition-all duration-300 font-bold shadow-lg"
          >
            View Results
          </a>
          <button
            onClick={handleExportXLSX}
            className="text-xs px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 hover:scale-105 hover:shadow-2xl transition-all duration-300 font-bold shadow-lg"
          >
            Export Excel
          </button>
          <button
            onClick={handleClearAll}
            disabled={clearing}
            className="text-xs px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:scale-105 hover:shadow-2xl transition-all duration-300 font-bold shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg disabled:cursor-not-allowed"
          >
            {clearing ? "Clearing..." : "Clear participant scores"}
          </button>
          <button
            onClick={() => setShowAddParticipant(true)}
            className="text-xs px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-2xl transition-all duration-300 font-bold shadow-lg"
          >
            Add Participant
          </button>
          <button
            onClick={handleOpenEditParticipants}
            className="text-xs px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 hover:scale-105 hover:shadow-2xl transition-all duration-300 font-bold shadow-lg"
          >
            Edit Participants
          </button>
        </div>
      </header>

      {/* Add Participant Modal */}
      {showAddParticipant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setShowAddParticipant(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Add New Participant
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Participant ID (e.g., P28)
                </label>
                <input
                  type="text"
                  value={newParticipant.id}
                  onChange={(e) => setNewParticipant({ ...newParticipant, id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="P28"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Participant Name
                </label>
                <input
                  type="text"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Research Paper Title
                </label>
                <textarea
                  value={newParticipant.title}
                  onChange={(e) => setNewParticipant({ ...newParticipant, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[100px]"
                  placeholder="Enter the full research paper title..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddParticipant}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Add Participant
              </button>
              <button
                onClick={() => setShowAddParticipant(false)}
                className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Participants Modal */}
      {showEditParticipants && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-gray-200">
              <button
                onClick={() => setShowEditParticipants(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                Edit Participants
              </h2>
              <p className="text-sm text-gray-600 mt-1">Click on a participant to edit their details</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-lg">
                            {participant.id}
                          </span>
                          <span className="text-base font-bold text-gray-800">
                            {participant.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{participant.title}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditParticipant(participant)}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteParticipant(participant.id)}
                          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold text-sm transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8 border-t border-gray-200">
              <button
                onClick={() => setShowEditParticipants(false)}
                className="w-full px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Single Participant Modal */}
      {editingParticipant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setEditingParticipant(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent mb-6">
              Edit Participant {editingParticipant.id}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Participant ID
                </label>
                <input
                  type="text"
                  value={editingParticipant.id}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Participant Name
                </label>
                <input
                  type="text"
                  value={editingParticipant.name}
                  onChange={(e) => setEditingParticipant({ ...editingParticipant, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Research Paper Title
                </label>
                <textarea
                  value={editingParticipant.title}
                  onChange={(e) => setEditingParticipant({ ...editingParticipant, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingParticipant(null)}
                className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Left: Scoring form */}
        <section className="relative bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-3xl p-5 sm:p-7 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden group">
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl -z-10 group-hover:scale-125 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl -z-10 group-hover:scale-125 transition-transform duration-700"></div>

          <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 rounded-full shadow-lg"></div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent flex-1">
              Judge Scoring Panel
            </h2>
            <span className="text-xs font-bold text-blue-700 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-1.5 rounded-full shadow-md">
              Both Sections
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-blue-700 font-bold">
                Judge
              </label>
              <select
                className="bg-gradient-to-br from-white to-blue-50/50 border-2 border-blue-200/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl cursor-pointer"
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

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-purple-700 font-bold">
                Participant
              </label>
              <select
                className="bg-gradient-to-br from-white to-purple-50/50 border-2 border-purple-200/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl cursor-pointer"
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(e.target.value)}
              >
                <option value="">Select participant</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} – {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Participant info */}
          {selectedParticipantId && (
            <div className="mb-6 text-sm bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200/60 rounded-2xl px-5 py-4 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm">
              {(() => {
                const p = participants.find(
                  (x) => x.id === selectedParticipantId
                );
                if (!p) return null;
                return (
                  <>
                    <div className="font-bold text-blue-800 text-base">{p.name}</div>
                    <div className="text-gray-700 font-medium mt-1">{p.title}</div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Best Paper Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-yellow-400">
              <div className="w-1 h-5 bg-yellow-400 rounded-full"></div>
              <h3 className="text-md font-bold text-yellow-700">Best Paper Award</h3>
            </div>
            <div className="space-y-2">
              {BEST_PAPER_CRITERIA.map((c) => {
                const value = bestPaperScores[c.id] ?? "";
                const numValue = value ? parseFloat(value) : 0;

                return (
                  <div
                    key={c.id}
                    className="group flex flex-col gap-2 bg-yellow-50 border-2 border-yellow-200 rounded-xl px-3 py-2 hover:border-yellow-400 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-bold text-yellow-800">
                        {c.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {c.description}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleScoreChange("Best Paper", c.id, score.toString())}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${numValue === score
                            ? "bg-yellow-600 text-white shadow-lg scale-110"
                            : "bg-white text-gray-700 hover:bg-yellow-600 hover:text-white hover:scale-105"
                            }`}
                        >
                          {score.toFixed(1)}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleScoreChange("Best Paper", c.id, "")}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-yellow-800">
                        Selected: {value || "0"} / {c.max}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Young Researcher Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-blue-400">
              <div className="w-1 h-5 bg-blue-400 rounded-full"></div>
              <h3 className="text-md font-bold text-blue-700">Young Researcher Award</h3>
            </div>
            <div className="space-y-2">
              {YOUNG_RESEARCHER_CRITERIA.map((c) => {
                const value = youngResearcherScores[c.id] ?? "";
                const numValue = value ? parseFloat(value) : 0;

                return (
                  <div
                    key={c.id}
                    className="group flex flex-col gap-2 bg-blue-50 border-2 border-blue-200 rounded-xl px-3 py-2 hover:border-blue-400 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-bold text-blue-800">
                        {c.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {c.description}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleScoreChange("Young Researcher", c.id, score.toString())}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${numValue === score
                            ? "bg-blue-600 text-white shadow-lg scale-110"
                            : "bg-white text-gray-700 hover:bg-blue-600 hover:text-white hover:scale-105"
                            }`}
                        >
                          {score.toFixed(1)}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleScoreChange("Young Researcher", c.id, "")}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-800">
                        Selected: {value || "0"} / {c.max}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remarks Section - TEMPORARILY DISABLED */}
          {/* Uncomment after running: ALTER TABLE scores ADD COLUMN IF NOT EXISTS remark TEXT; */}
          {<div className="mb-6">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-purple-400">
              <div className="w-1 h-5 bg-purple-400 rounded-full"></div>
              <h3 className="text-md font-bold text-purple-700">Remarks (Optional)</h3>
            </div>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[80px] text-sm"
              placeholder="Enter any additional comments or feedback..."
            />
          </div>}

          {/* Single Save Button for Both Sections */}
          <div className="mt-8 pt-6 border-t-2 border-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
            <div className="text-sm text-gray-600 font-semibold text-center mb-5 bg-blue-50/50 rounded-xl py-3 px-4">
              Please complete all scores for both sections before saving.
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={handleSubmitAllScores}
                disabled={savingBestPaper || savingYoungResearcher}
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-base font-bold hover:scale-105 hover:shadow-2xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {(savingBestPaper || savingYoungResearcher) ? "Saving Both Scores..." : "💾 Save All Scores"}
              </button>
            </div>
            <div className="text-xs text-gray-500 font-medium text-center mt-4">
              This will save scores for both Best Paper and Young Researcher sections
            </div>
          </div>
        </section>

        {/* Right: Participant Scoring History */}
        <section className="space-y-6">
          {/* All Participants Scores */}
          <div className="relative bg-gradient-to-br from-slate-50/80 via-blue-50/70 to-cyan-50/80 backdrop-blur-2xl border border-blue-200/60 rounded-3xl p-5 sm:p-6 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 overflow-hidden group">
            {/* Animated gradient orbs */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-300/20 via-cyan-300/15 to-slate-300/20 rounded-full blur-3xl -z-10 group-hover:scale-125 transition-transform duration-700 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-cyan-300/15 via-blue-300/10 to-slate-300/15 rounded-full blur-3xl -z-10 group-hover:scale-125 transition-transform duration-700 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 rounded-full blur-3xl -z-10"></div>

            <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gradient-to-r from-blue-200 to-cyan-200">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full shadow-lg"></div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent flex-1">
                Participant Scores
              </h2>
              <span className="text-xs font-bold text-blue-700 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-1.5 rounded-full shadow-md">
                {distinctParticipantsScored} scored
              </span>
            </div>

            {scoreRecords.length === 0 ? (
              <div className="relative text-center py-16 px-6 rounded-2xl bg-gradient-to-br from-blue-100/40 via-cyan-100/30 to-slate-100/40 border-2 border-dashed border-blue-300/50">
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent rounded-2xl"></div>
                <div className="relative z-10">
                  <div className="text-7xl mb-4 opacity-40 animate-pulse">📊</div>
                  <p className="text-base text-blue-700 font-bold mb-1">
                    No scores recorded yet
                  </p>
                  <p className="text-sm text-blue-600/70">
                    Start scoring participants above
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {participants.map((participant) => {
                  const participantScores = scoreRecords.filter(
                    (r) => r.participantId === participant.id
                  );

                  if (participantScores.length === 0) return null;

                  // Calculate separate averages for each section
                  const bestPaperScores = participantScores.filter(s => s.section === "Best Paper");
                  const youngResearcherScores = participantScores.filter(s => s.section === "Young Researcher");

                  const bestPaperAvg = bestPaperScores.length > 0
                    ? bestPaperScores.reduce((sum, r) => sum + r.total, 0) / bestPaperScores.length
                    : 0;

                  const youngResearcherAvg = youngResearcherScores.length > 0
                    ? youngResearcherScores.reduce((sum, r) => sum + r.total, 0) / youngResearcherScores.length
                    : 0;

                  return (
                    <div
                      key={participant.id}
                      className="relative border-2 border-blue-200/60 rounded-2xl p-4 bg-gradient-to-br from-white via-blue-50/40 via-cyan-50/30 to-slate-50/40 hover:border-blue-400 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group overflow-hidden backdrop-blur-sm"
                    >
                      {/* Decorative gradient overlays */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/25 via-cyan-400/20 to-slate-400/25 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/20 to-blue-400/15 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[10px] font-bold rounded-md shadow-sm">
                                {participant.id}
                              </span>
                              <div className="font-bold text-[#175676] text-sm leading-tight">
                                {participant.name}
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                              {participant.title}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {bestPaperScores.length > 0 && (
                              <div className="text-center bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl px-3 py-2 shadow-md border border-yellow-300">
                                <div className="text-base font-bold text-yellow-700">
                                  {bestPaperAvg.toFixed(1)}
                                </div>
                                <div className="text-[9px] text-yellow-600 font-semibold uppercase tracking-wide">
                                  BP Avg
                                </div>
                              </div>
                            )}
                            {youngResearcherScores.length > 0 && (
                              <div className="text-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl px-3 py-2 shadow-md border border-blue-300">
                                <div className="text-base font-bold text-blue-700">
                                  {youngResearcherAvg.toFixed(1)}
                                </div>
                                <div className="text-[9px] text-blue-600 font-semibold uppercase tracking-wide">
                                  YR Avg
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Individual judge scores */}
                        <div className="space-y-2 mt-3 pt-3 border-t border-blue-200/50">
                          <div className="text-[10px] uppercase tracking-wider text-blue-600 font-bold mb-2">
                            Judge Scores ({participantScores.length})
                          </div>

                          {Array.from(
                            Object.values(
                              participantScores.reduce((acc: Record<string, { judge: string; scores: typeof participantScores; remark?: string }>, s) => {
                                const key = s.judge;
                                if (!acc[key]) {
                                  acc[key] = { judge: s.judge, scores: [], remark: undefined } as any;
                                }
                                (acc[key].scores as any).push(s);
                                if (!acc[key].remark && s.remark) {
                                  acc[key].remark = s.remark;
                                }
                                return acc;
                              }, {} as any)
                            )
                          ).map((group, groupIdx) => (
                            <div key={groupIdx} className="flex flex-col gap-1">
                              {group.scores.map((score) => (
                                <div
                                  key={score.id}
                                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs shadow-sm border transition-all duration-200 hover:scale-[1.02] ${score.section === "Best Paper"
                                    ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 border-yellow-200 hover:border-yellow-400"
                                    : "bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200 hover:border-blue-400"
                                    }`}
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <span className={`font-bold truncate max-w-[140px] ${score.section === "Best Paper" ? "text-yellow-800" : "text-blue-800"
                                      }`}>
                                      {score.judge.split(' ').slice(-2).join(' ')}
                                    </span>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm ${score.section === "Best Paper"
                                      ? "bg-yellow-400 text-yellow-900"
                                      : "bg-blue-400 text-blue-900"
                                      }`}>
                                      {score.section === "Best Paper" ? "BP" : "YR"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-lg font-bold ${score.section === "Best Paper" ? "text-yellow-700" : "text-blue-700"
                                      }`}>
                                      {score.total.toFixed(1)}
                                    </span>
                                    <span className="text-gray-400 text-[10px] font-medium">
                                      / {maxTotal}
                                    </span>
                                  </div>
                                </div>
                              ))}

                              {group.remark && (
                                <div className="ml-2 text-sm text-gray-700 italic bg-white/70 px-2.5 py-1.5 rounded border border-gray-100">
                                  "{group.remark}"
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-blue-200/50 text-[10px] text-gray-500 flex justify-between items-center">
                          <span className="font-medium">
                            {bestPaperScores.length > 0 && `BP: ${bestPaperScores.length} judge${bestPaperScores.length > 1 ? 's' : ''}`}
                            {bestPaperScores.length > 0 && youngResearcherScores.length > 0 && ' • '}
                            {youngResearcherScores.length > 0 && `YR: ${youngResearcherScores.length} judge${youngResearcherScores.length > 1 ? 's' : ''}`}
                          </span>
                          <span className="font-bold text-blue-600">
                            {participantScores.length} total
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="bg-gradient-to-r from-slate-100 via-blue-100 to-cyan-100 px-6 py-5 text-xs flex flex-col sm:flex-row justify-between gap-2 shadow-2xl border-t border-blue-200">
        <span className="font-semibold text-gray-700">
          <span className="text-blue-700 font-bold">ICCIET 2025</span> Judging Portal · International Conference on Computational Intelligence & Emerging Technologies
        </span>
        <span className="font-semibold text-gray-700">
          <span className="text-emerald-600">✓</span> Scores synced via secure Supabase database
        </span>
      </footer>
    </main>
  );
}
