import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import Papa from "papaparse";

// ============================================================
// TYPES
// ============================================================

import type {
  GlobalDashboard,
  InteractionMemory,
  SynthesisState,
  ColumnProfile,
  CausalRelation,
} from "./types/index";

// ============================================================
// ANALYTICS
// ============================================================

import {
  calculateCausalRelations,
} from "./analytics/correlations";

import {
  profileDataset,
} from "./analytics/profiling";

// ============================================================
// LLM
// ============================================================

import {
  generateAgenticDashboard,
} from "./llm/mistral";

import {
  AVAILABLE_MODELS,
  getModelTier,
} from "./llm/modelTier";

import {
  LLM_CONFIG,
} from "./llm/config";

// ============================================================
// DASHBOARD
// ============================================================

import {
  generateFallbackDashboard,
  FALLBACK_REASON_LABELS,
} from "./dashboard/fallbackGenerator";

// ============================================================
// UI
// ============================================================

import UIRecursiveRenderer
  from "./ui/renderers/UIRecursiveRenderer";

import ParticleField
  from "./ui/animations/ParticleField";

import CursorGlow
  from "./ui/animations/CursorGlow";

import MorphLogo
  from "./ui/layouts/MorphLogo";

import LoadingPhases
  from "./ui/panels/LoadingPhases";

import {
  severityColors,
} from "./ui/constants/severityColors";

// ============================================================
// UTILS
// ============================================================

import {
  emit,
} from "./utils/logger";

import type {
  CleanedColumn,
  SemanticRole,
  OperationalDomain,
} from "./types/index";


// ============================================================
// OBSERVABILITY LOGGER
// ============================================================


// ============================================================
// ADVANCED DETERMINISTIC ANALYTICS ENGINE
// ============================================================





// ============================================================
// COVARIANCE MATRIX & MUTUAL CAUSAL ANALYSIS
// ============================================================



// ============================================================
// ZOD SCHEMAS
// ============================================================



// ============================================================
// ONTOLOGY + PROFILING
// ============================================================

const IGNORED_PATTERNS = ["id","personid","index","serial","no","uuid","key","pk","rowid"];
const ONTOLOGY_GRAPH = [
  { domain:"health", role:"BEHAVIORAL", keywords:["sleep","stress","exercise","activity","step","calorie","habit","active"] },
  { domain:"health", role:"METRIC", keywords:["hr","pulse","bp","diastolic","systolic","bmi","weight","glucose","temp"] },
  { domain:"financial", role:"METRIC", keywords:["sales","profit","revenue","income","price","cost","margin","tax","txn","amt","amount","balance"] },
  { domain:"logistics", role:"METRIC", keywords:["quantity","unit","order","ship","inventory","stock","qty","latency","throughput"] },
  { domain:"hr", role:"CATEGORICAL", keywords:["department","dept","role","tier","team","performance","attrition"] },
  { domain:"agnostic", role:"CATEGORICAL", keywords:["status","region","city","state","type","category","segment","grp","priority"] },
  { domain:"agnostic", role:"TEMPORAL", keywords:["date","time","timestamp","year","month","day","qtr","quarter","epoch","created_at","updated_at"] },
  { domain:"agnostic", role:"IDENTITY", keywords:["name","user","customer","email","phone","contact","profile","hash"] },
] as const;

function processColumns(rawHeaders: string[]): CleanedColumn[] {
  return rawHeaders
    .filter(header => !IGNORED_PATTERNS.some(p => header.toLowerCase().includes(p)))
    .map(rawHeader => {
      const rawKey = rawHeader;
      const cleanName = rawHeader
        .replace(/[_-]/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .trim();
      const lowerHeader = rawHeader.toLowerCase();

      let role: SemanticRole = "METRIC";
      let domain: OperationalDomain = "agnostic";

      for (const entry of ONTOLOGY_GRAPH) {
        if (entry.keywords.some(kw => lowerHeader.includes(kw))) {
          role = entry.role;
          domain = entry.domain;
          break;
        }
      }

      return { rawName: rawHeader, rawKey, cleanName, role, domain };
    });
}


// ============================================================
// MODEL CAPABILITY MAP
// ============================================================


// ============================================================
// PROMPT BUILDER
// ============================================================


// ============================================================
// JSON EXTRACTION + REPAIR
// ============================================================


// ============================================================
// ZOD VALIDATION + NORMALIZATION
// ============================================================





// ============================================================
// LLM STREAMING CALL
// ============================================================



// ============================================================
// RETRY ORCHESTRATOR
// ============================================================



// ============================================================
// FALLBACK GENERATOR
// ============================================================





// ============================================================
// ANIMATED BACKGROUND PARTICLES
// ============================================================



// ============================================================
// ANIMATED LOGO
// ============================================================

const letters = "MorphUI".split("");


// ============================================================
// SCAN LINE LOADING ANIMATION
// ============================================================

function ScanLine() {
  return (
    <motion.div
      className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    />
  );
}

// ============================================================
// STREAM PROGRESS BAR
// ============================================================



// ============================================================
// SEVERITY SYSTEM
// ============================================================



// ============================================================
// RECURSIVE UI RENDERER
// ============================================================



// ============================================================
// SYNTHESIS BADGE
// ============================================================

function SynthesisBadge({ synthesisState }: { synthesisState: SynthesisState }) {
  if(synthesisState.source==="llm") return (
    <motion.span initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest border bg-emerald-500/5 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"/>Autonomous Interface Compiler
    </motion.span>
  );
  return (
    <motion.span initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} title={synthesisState.failureReason?FALLBACK_REASON_LABELS[synthesisState.failureReason]:""} className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest border bg-amber-500/5 text-amber-400 border-amber-500/20 flex items-center gap-1">
      <span className="w-1 h-1 rounded-full bg-amber-400"/>Deterministic System Core
    </motion.span>
  );
}

// ============================================================
// CURSOR GLOW
// ============================================================


// ============================================================
// LOADING OVERLAY
// ============================================================

const LOADING_PHASES = [
  "Executing deterministic analytics engine…",
  "Compiling Shannon information entropy bands…",
  "Executing multivariable covariance analysis…",
  "Measuring Pearson R linear variances…",
  "Synthesizing global causal relation structures…",
  "Validating parsed telemetry schemas…",
  "Resolving autonomous layouts…"
];



// ============================================================
// COLUMN CHIP REVEAL
// ============================================================

function ColumnChips({ columns }: { columns: string[] }) {
  return (
    <motion.div
      className="flex flex-wrap justify-center gap-1.5 mt-4 max-w-xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
    >
      {columns.slice(0, 12).map((col) => (
        <motion.span
          key={col}
          variants={{ hidden:{opacity:0,scale:0.9,y:5}, visible:{opacity:1,scale:1,y:0} }}
          className="bg-zinc-950 border border-zinc-900 text-[10px] font-mono text-zinc-500 px-2.5 py-0.5 rounded transition-colors"
        >
          {col}
        </motion.span>
      ))}
      {columns.length > 12 && (
        <span className="text-zinc-600 font-mono text-[9px] py-0.5 px-1.5">+{columns.length-12} more columns</span>
      )}
    </motion.div>
  );
}

// ============================================================
// MAIN APPLICATION
// ============================================================

export default function App() {
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"idle"|"preview"|"dashboard">("idle");
  const [dashboard, setDashboard] = useState<GlobalDashboard | null>(null);
  const [uploadedColumns, setUploadedColumns] = useState<string[]>([]);
  const [predictedDataset, setPredictedDataset] = useState("");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [synthesisState, setSynthesisState] = useState<SynthesisState>({ source:"idle" });
  const [streamingTokens, setStreamingTokens] = useState(0);
  const [streamingAttempt, setStreamingAttempt] = useState(0);
  const [selectedModel, setSelectedModel] = useState<string>(LLM_CONFIG.defaultModel);
  const [isDragOver, setIsDragOver] = useState(false);

  const [interactionMemory, setInteractionMemory] = useState<InteractionMemory>({ approvedTags:[], rejectedTags:[], preferredLayouts:[], preferredDensity:"high" });
  const [cachedProfiles, setCachedProfiles] = useState<ColumnProfile[]>([]);
  const [cachedCausalChains, setCachedCausalChains] = useState<CausalRelation[]>([]);

  const workflowRef = useRef<HTMLDivElement | null>(null);
  const predictionRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const runAnalysis = useCallback(async (file: File) => {
    const cleanTitle = file.name.replace(".csv","").replaceAll("_"," ").replaceAll("-"," ").replace(/\b\w/g,c=>c.toUpperCase());
    setPredictedDataset(cleanTitle);
    
    const rawText = await file.text();
    const lines = rawText.split(/\r?\n/);
    let firstValidRowIndex = 0;
    for(let i=0;i<Math.min(lines.length,20);i++) { 
      const vt=lines[i].split(",").map(v=>v.trim()).filter(Boolean); 
      if(vt.length>1){firstValidRowIndex=i;break;} 
    }
    const sanitizedCsvText = lines.slice(firstValidRowIndex).join("\n");
    const parsed = Papa.parse(sanitizedCsvText,{header:true,skipEmptyLines:true});
    if(!parsed.meta.fields||parsed.data.length===0) { alert("Invalid CSV format."); return; }
    
    const cleanedColumns = processColumns(parsed.meta.fields);
    if(cleanedColumns.length<2) { alert("Dataset requires at least two valid variables."); return; }
    
    setUploadedColumns(cleanedColumns.map(c=>c.cleanName));
    setLoading(true);
    setStreamingTokens(0);
    setStreamingAttempt(0);

    setTimeout(async () => {
      const dataRows = parsed.data as Record<string,unknown>[];
      
      emit({ stage:"ANALYTICS_ENGINE", level:"info", message:"Running Advanced Mathematical Core..." });
      const profiles = profileDataset(cleanedColumns,dataRows);
      const causalChains = calculateCausalRelations(profiles,dataRows);
      
      setCachedProfiles(profiles); 
      setCachedCausalChains(causalChains);
      
      emit({ stage:"RENDER", level:"info", message:`Profiled ${profiles.length} attributes, synthesized ${causalChains.length} causal correlation pathways.` });
      
      const { dashboard:llmDash, source, reason } = await generateAgenticDashboard(
        profiles,
        causalChains,
        interactionMemory,
        selectedModel,
        (attempt,tokens)=>{setStreamingAttempt(attempt);setStreamingTokens(tokens);}
      );
      
      let finalDash: GlobalDashboard;
      if(llmDash) { 
        finalDash=llmDash; 
        setSynthesisState({source:"llm"}); 
      } else { 
        finalDash=generateFallbackDashboard(profiles,causalChains,reason); 
        setSynthesisState({source:"fallback",failureReason:reason}); 
      }
      
      emit({ stage:"RENDER", level:"info", message:"Generative Interface complete.", data:finalDash });
      setDashboard(finalDash);
      setLoading(false);
      setPhase("preview");
      setTimeout(()=>predictionRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),100);
    }, 80);
  }, [interactionMemory, selectedModel]);

  const handleAnalyze = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if(!file) return;
    await runAnalysis(file);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if(file?.name.endsWith(".csv")) await runAnalysis(file);
  }, [runAnalysis]);

  const handleEvolve = async () => {
    if(!dashboard) return;
    setLoading(true); setExpandedCard(null); setStreamingTokens(0); setStreamingAttempt(0);
    
    // 🟢 FIXED: Updated parameters from cachedDependencies to cachedCausalChains to resolve the synthesis crash
    const { dashboard:llmDash, source, reason } = await generateAgenticDashboard(
      cachedProfiles,
      cachedCausalChains, 
      interactionMemory,
      selectedModel,
      (attempt,tokens)=>{setStreamingAttempt(attempt);setStreamingTokens(tokens);}
    );
    
    let evolvedDash: GlobalDashboard;
    if(llmDash) { 
      evolvedDash=llmDash; 
      setSynthesisState({source:"llm"}); 
    } else { 
      evolvedDash=generateFallbackDashboard(cachedProfiles,cachedCausalChains,reason); 
      setSynthesisState({source:"fallback",failureReason:reason}); 
    }
    setDashboard(evolvedDash); 
    setLoading(false);
  };

  const handleAction = (index: number, action: "approve"|"reject") => {
    if(!dashboard) return;
    const workflow = dashboard.workflows[index];
    setInteractionMemory(prev => {
      const nm={...prev};
      if(action==="approve") { 
        nm.approvedTags=Array.from(new Set([...prev.approvedTags,...workflow.tags])); 
        nm.preferredLayouts=Array.from(new Set([...prev.preferredLayouts,workflow.layoutMode])); 
      } else { 
        nm.rejectedTags=Array.from(new Set([...prev.rejectedTags,...workflow.tags])); 
      }
      return nm;
    });
    setExpandedCard(null);
  };

  const handleClear = () => {
    setPredictedDataset(""); setDashboard(null); setUploadedColumns([]);
    setSynthesisState({source:"idle"}); setPhase("idle");
    if(fileInputRef.current) fileInputRef.current.value="";
  };

  const currentModelTier = getModelTier(selectedModel);

  const orderedWorkflows = useMemo(() => {
    if (!dashboard) return [];
    return [...dashboard.workflows].sort((a,b) => {
      const aWeight = a.confidence * (a.severity === "critical" ? 1.5 : a.severity === "high" ? 1.25 : 1);
      const bWeight = b.confidence * (b.severity === "critical" ? 1.5 : b.severity === "high" ? 1.25 : 1);
      return bWeight - aWeight;
    });
  }, [dashboard]);

  const layoutGridClass = useMemo(() => {
    if (!dashboard) return "grid-cols-1 md:grid-cols-2";
    switch (dashboard.dashboardLayoutMode) {
      case "COMPACT":
        return "grid-cols-1 max-w-xl mx-auto";
      case "TIMELINE_FIRST":
        return "grid-cols-1 md:grid-cols-3";
      case "GRAPH_FIRST":
        return "grid-cols-1 md:grid-cols-2";
      case "INTELLIGENCE_GRID":
      default:
        return "grid-cols-1 md:grid-cols-2";
    }
  }, [dashboard]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden select-none font-sans tracking-tight antialiased">
      <CursorGlow />
      <ParticleField />

      <main className="relative z-10 flex justify-center px-4 py-16">
        <div className="w-full max-w-5xl">

          {/* ===== HEADER ===== */}
          <motion.div
            initial={{ opacity:0, y:-10 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6 }}
            className="text-center mb-12"
          >
            <MorphLogo />
            <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-zinc-500 font-mono text-[10px] mt-2.5 tracking-[0.4em] uppercase">
              Autonomous Compiler & Mathematical Core
            </motion.p>
          </motion.div>

          {/* ===== UPLOAD ZONE ===== */}
          <motion.div
            initial={{ opacity:0, y:15 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.8 }}
            className="relative"
          >
            <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-8 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-zinc-700 rounded-tl-xl"/>
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-zinc-700 rounded-tr-xl"/>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-zinc-700 rounded-bl-xl"/>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-zinc-700 rounded-br-xl"/>

              {/* Drop zone */}
              <motion.div
                onClick={() => !loading && fileInputRef.current?.click()}
                onDragOver={e=>{e.preventDefault();setIsDragOver(true);}}
                onDragLeave={()=>setIsDragOver(false)}
                onDrop={handleDrop}
                animate={{ borderColor: isDragOver ? "rgba(59,130,246,0.4)" : "rgba(63,63,70,0.2)" }}
                className="border border-dashed border-zinc-800 rounded-lg p-10 cursor-pointer transition-all relative overflow-hidden"
                whileHover={!loading ? { borderColor:"rgba(59,130,246,0.3)" } : {}}
              >
                {loading && <ScanLine />}
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center">
                      <LoadingPhases streamingTokens={streamingTokens} streamingAttempt={streamingAttempt}/>
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center">
                      <p className="text-zinc-400 text-sm">Drop raw .csv log file here or <span className="text-blue-500 hover:text-blue-400 transition-colors">browse telemetry files</span></p>
                      <p className="text-zinc-600 font-mono text-[9px] mt-1.5 uppercase tracking-wider">Supports complex multivariate operational vectors</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Model selector */}
              <div className="mt-5 flex items-center justify-center gap-4">
                <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Execution Compiler</span>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={e=>setSelectedModel(e.target.value)}
                    disabled={loading}
                    className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 text-[10px] rounded px-3 py-1.5 pr-6 focus:outline-none focus:border-zinc-600 transition-colors appearance-none cursor-pointer disabled:opacity-40"
                  >
                    {AVAILABLE_MODELS.map(m=>(
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[8px]">▼</div>
                </div>
                <AnimatePresence>
                  <motion.span
                    key={currentModelTier}
                    initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    className={`text-[8px] font-mono px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${currentModelTier==="advanced" ? "text-violet-400 border-violet-500/20 bg-violet-500/5" : "text-zinc-500 border-zinc-800 bg-zinc-900/30"}`}
                  >
                    {currentModelTier} Core
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleAnalyze}/>

          {/* ===== SCREENS ===== */}
          <AnimatePresence mode="wait">

            {/* PREVIEW SCREEN */}
            {phase==="preview" && !loading && dashboard && (
              <motion.div
                key="preview"
                ref={predictionRef}
                initial={{ opacity:0, y:20 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-10 }}
                transition={{ duration:0.6 }}
                className="mt-12 text-center"
              >
                <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-[0.3em] mb-1.5">
                  Compilation Completed
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  {predictedDataset}
                </h2>
                <ColumnChips columns={uploadedColumns}/>

                {/* Stats row */}
                <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                  <div className="text-center"><p className="text-lg font-extrabold text-white">{uploadedColumns.length}</p><p className="text-zinc-600 font-mono text-[9px] uppercase">Telemetry Indices</p></div>
                  <div className="w-px h-6 bg-zinc-900"/>
                  <div className="text-center"><p className="text-lg font-extrabold text-white">{cachedCausalChains.length}</p><p className="text-zinc-600 font-mono text-[9px] uppercase">Pearson couplings</p></div>
                  <div className="w-px h-6 bg-zinc-900"/>
                  <div className="text-center"><p className="text-lg font-extrabold text-white">{dashboard.workflows.length}</p><p className="text-zinc-600 font-mono text-[9px] uppercase">Execution blocks</p></div>
                </div>

                <div className="flex items-center justify-center gap-3 mt-8">
                  <motion.button
                    whileHover={{ scale:1.01 }} whileTap={{ scale:0.99 }}
                    onClick={()=>{setPhase("dashboard");setTimeout(()=>workflowRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),400);}}
                    className="px-6 py-2.5 bg-white text-black font-bold rounded hover:bg-zinc-100 transition-colors text-xs font-mono tracking-wider uppercase"
                  >
                    Load Synthetic Grid
                  </motion.button>
                  <motion.button
                    whileHover={{ scale:1.01 }} whileTap={{ scale:0.99 }}
                    onClick={handleClear}
                    className="px-5 py-2.5 border border-zinc-900 hover:border-zinc-800 rounded transition-colors text-xs text-zinc-500 hover:text-zinc-300 font-mono uppercase"
                  >
                    Reset
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* DASHBOARD SCREEN */}
            {phase==="dashboard" && dashboard && (
              <motion.div
                key="dashboard"
                ref={workflowRef}
                initial={{ opacity:0, y:30 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-20 }}
                transition={{ duration:0.8 }}
                className="mt-12 space-y-4"
              >
                {/* GLOBAL HEADER */}
                <motion.div
                  initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                  className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 justify-between items-start backdrop-blur-md"
                >
                  <div className="z-10 flex-1">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <p className="text-blue-500 font-mono text-[9px] font-bold tracking-[0.2em] uppercase">Autonomous Execution Environment</p>
                      <SynthesisBadge synthesisState={synthesisState}/>
                    </div>
                    <h2 className="text-2xl font-extrabold leading-tight tracking-tight mb-4">{dashboard.globalSummary}</h2>

                    <div className="bg-zinc-950 border-l border-blue-500 pl-3.5 py-2 pr-3 rounded-r-md max-w-2xl">
                      <p className="text-zinc-400 font-mono text-[9px] font-semibold mb-0.5 uppercase tracking-wider">Agentic Synthesis Reasoning</p>
                      <p className="text-zinc-500 text-[10px] leading-relaxed italic">"{dashboard.agenticState.situationalAwareness} {dashboard.agenticState.selfCritique}"</p>
                      {synthesisState.source==="fallback" && synthesisState.failureReason && (
                        <p className="text-amber-500/60 font-mono text-[8px] mt-1.5 uppercase tracking-wider">{synthesisState.failureReason.replace(/_/g," ")} active</p>
                      )}
                    </div>

                    <div className="flex gap-2.5 items-center mt-4 flex-wrap text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border ${dashboard.globalSeverity==="critical"?"bg-rose-500/10 text-rose-400 border-rose-500/20":dashboard.globalSeverity==="elevated"?"bg-orange-500/10 text-orange-400 border-orange-500/20":"bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                        Macro Severity: {dashboard.globalSeverity}
                      </span>
                      <span className="text-zinc-500 font-mono">{dashboard.workflows.length} active routes</span>
                      <span className="text-zinc-700">•</span>
                      <span className="text-zinc-500 font-mono">Layout Mode: {dashboard.dashboardLayoutMode}</span>
                    </div>
                  </div>

                  {/* MEMORY CONTROL */}
                  <div className="z-10 bg-zinc-950 border border-zinc-900 p-4.5 rounded-lg flex flex-col gap-3 min-w-[180px] backdrop-blur-sm">
                    <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Continuous Tuning</p>
                    <div className="flex gap-4">
                      <div><p className="text-emerald-400 text-lg font-mono font-bold">{interactionMemory.approvedTags.length}</p><p className="text-zinc-600 font-mono text-[8px] uppercase">Approved</p></div>
                      <div><p className="text-rose-400 text-lg font-mono font-bold">{interactionMemory.rejectedTags.length}</p><p className="text-zinc-600 font-mono text-[8px] uppercase">Rejected</p></div>
                    </div>
                    <motion.button
                      whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                      onClick={handleEvolve}
                      disabled={loading||(interactionMemory.approvedTags.length===0&&interactionMemory.rejectedTags.length===0)}
                      className="w-full py-1.5 bg-white text-black font-bold rounded font-mono text-[10px] uppercase tracking-wider disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? "Evolving..." : "Evolve UI"}
                    </motion.button>
                  </div>
                </motion.div>

                {/* ============================================================ */}
                {/* HERO INSIGHT ENGINE (DOMINANT "AI CONCLUSION" CARD)          */}
                {/* ============================================================ */}
                <motion.div
                  initial={{ opacity:0, y:15 }}
                  animate={{ opacity:1, y:0 }}
                  className={`border rounded-xl p-5 relative overflow-hidden backdrop-blur-md ${
                    dashboard.heroInsight.severity === "critical"
                      ? "border-rose-800/40 bg-gradient-to-br from-rose-950/20 to-black"
                      : "border-blue-900/40 bg-gradient-to-br from-blue-950/20 to-black"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.02] rounded-full blur-2xl pointer-events-none"/>
                  <div className="absolute top-3 right-3 select-none text-[8px] font-mono font-bold text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded">
                    HERO INTEL ENGINE
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${dashboard.heroInsight.severity === "critical" ? "bg-rose-500 animate-pulse" : "bg-blue-500 animate-ping"}`}/>
                        <p className="text-zinc-400 font-mono text-[9px] uppercase tracking-widest font-bold">Primary System Synthesis</p>
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight leading-snug">{dashboard.heroInsight.headline}</h3>
                      <p className="text-zinc-500 text-xs leading-relaxed max-w-2xl">{dashboard.heroInsight.supportingStatement}</p>
                      
                      {dashboard.heroInsight.affectedVectors.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <p className="text-[8px] font-mono text-zinc-600 uppercase">Affected Vectors:</p>
                          <div className="flex gap-1">
                            {dashboard.heroInsight.affectedVectors.map(v => (
                              <span key={v} className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[8px] px-1.5 py-0.5 rounded">{v}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-zinc-950/80 border border-zinc-900/80 p-4 rounded-lg flex flex-col justify-center min-w-[140px] text-center md:text-left">
                      <p className="text-zinc-600 font-mono text-[8px] uppercase tracking-wider mb-1">{dashboard.heroInsight.metricLabel}</p>
                      <p className="text-2xl font-black tracking-tighter text-white font-mono">{dashboard.heroInsight.primaryMetricValue}</p>
                      <p className="text-zinc-500 text-[9px] leading-tight mt-1 font-mono italic">{dashboard.heroInsight.causalLink}</p>
                    </div>
                  </div>
                </motion.div>

                {/* WORKFLOW GRID */}
                <div className={`grid ${layoutGridClass} gap-4 items-start`}>
                  {orderedWorkflows.map((workflow, index) => {
                    const maxVal = Math.max(...(workflow.chartData||[1]),1);
                    const isExpanded = expandedCard===index;
                    const confidencePercent = workflow.confidence;
                    
                    return (
                      <motion.div
                        key={`${workflow.title}-${index}`}
                        initial={{ opacity:0, y:15 }}
                        animate={{ opacity:1, y:0 }}
                        transition={{ duration:0.4, delay:index*0.05 }}
                        onClick={()=>setExpandedCard(isExpanded?null:index)}
                        className={`bg-zinc-950/40 border rounded-xl p-4.5 cursor-pointer flex flex-col backdrop-blur-md relative overflow-hidden transition-all group ${
                          workflow.severity === "critical" 
                            ? "border-rose-900/40 hover:border-rose-800/60 md:col-span-2" 
                            : confidencePercent > 90 
                            ? "border-zinc-800 hover:border-zinc-700/80" 
                            : "border-zinc-900 hover:border-zinc-800/80"
                        }`}
                      >
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
                          style={{
                            background: `radial-gradient(400px at 50% 0%, ${
                              workflow.severity === "critical" 
                                ? "rgba(244,63,94,0.015)" 
                                : "rgba(59,130,246,0.015)"
                            }, transparent)`
                          }}
                        />

                        <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${
                          workflow.severity==="critical"
                            ? "bg-rose-600/50"
                            : workflow.severity==="high"
                            ? "bg-orange-500/40"
                            : workflow.severity==="medium"
                            ? "bg-amber-500/30"
                            : "bg-zinc-800"
                        }`}/>

                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-widest">{workflow.archetype}</p>
                            <h2 className="text-base font-bold tracking-tight text-zinc-100">{workflow.title}</h2>
                          </div>
                          <div className="flex flex-col items-end gap-1 font-mono">
                            <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${severityColors[workflow.severity]}`}>
                              {workflow.severity}
                            </span>
                            <span className="text-zinc-600 text-[9px]">{confidencePercent}% conf</span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col relative z-10 space-y-3.5">
                          <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2">{workflow.description}</p>
                          
                          <UIRecursiveRenderer 
                            node={workflow.uiBlueprint} 
                            workflow={workflow} 
                            maxVal={maxVal} 
                            density={dashboard.agenticState.cognitiveDensity}
                          />

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                                transition={{duration:0.3}}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 pt-3.5 border-t border-zinc-900/80 space-y-3 text-[11px]">
                                  <div>
                                    <p className="text-blue-500 font-mono text-[8px] font-bold uppercase tracking-wider mb-0.5">Statistical Reasoning</p>
                                    <p className="text-zinc-300 leading-relaxed font-mono text-[10px]">{workflow.reasoning}</p>
                                  </div>
                                  <div>
                                    <p className="text-blue-500 font-mono text-[8px] font-bold uppercase tracking-wider mb-0.5">System Impact Optimization</p>
                                    <p className="text-zinc-400 leading-relaxed font-mono text-[10px]">{workflow.businessContext}</p>
                                  </div>
                                  <div className="flex gap-2 pt-1 font-mono">
                                    <button
                                      onClick={e=>{e.stopPropagation();handleAction(index,"approve");}}
                                      className="bg-zinc-100 hover:bg-white text-black font-bold px-3 py-1 rounded text-[9px] uppercase tracking-wider"
                                    >
                                      Accept Path
                                    </button>
                                    <button
                                      onClick={e=>{e.stopPropagation();handleAction(index,"reject");}}
                                      className="border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300 text-zinc-500 px-3 py-1 rounded text-[9px] uppercase tracking-wider"
                                    >
                                      Suppress Signal
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex justify-center pt-8">
                  <button onClick={()=>setPhase("preview")} className="text-zinc-600 hover:text-zinc-400 font-mono text-[10px] uppercase tracking-wider transition-colors">
                    ← Back to parameters
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}