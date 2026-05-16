import { motion } from "framer-motion";

import type {
  Workflow,
  UINode,
} from "../../types";

import { severityColors } from "../constants/severityColors";
export default function UIRecursiveRenderer({ node, workflow, maxVal, density }: { node: UINode; workflow: Workflow; maxVal: number; density: "high"|"medium"|"low" }) {
  const gapClass = density==="high"?"gap-1.5":density==="low"?"gap-4":"gap-2.5";
  if(node.type==="col") return <div className={`flex flex-col ${gapClass} w-full`}>{node.children?.map((c,i)=><UIRecursiveRenderer key={i} node={c} workflow={workflow} maxVal={maxVal} density={density}/>)}</div>;
  if(node.type==="row") return <div className={`flex flex-row ${gapClass} w-full items-stretch`}>{node.children?.map((c,i)=><UIRecursiveRenderer key={i} node={c} workflow={workflow} maxVal={maxVal} density={density}/>)}</div>;
  if(node.type==="grid_2") return <div className={`grid grid-cols-2 ${gapClass} w-full`}>{node.children?.map((c,i)=><UIRecursiveRenderer key={i} node={c} workflow={workflow} maxVal={maxVal} density={density}/>)}</div>;

  const realChartData = workflow.chartData || [];

  switch(node.type) {
    case "alert_chip":
      return (
        <div className={`border px-2 py-0.5 rounded flex items-center gap-1.5 w-fit select-none font-mono text-[8px] uppercase tracking-wider ${severityColors[workflow.severity]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${workflow.severity==="critical"?"bg-rose-500 animate-pulse" : "bg-current"}`}/>
          {workflow.severity} Priority State
        </div>
      );
    case "kpi_block": {
      if (workflow.primaryMetric === "—") return null; 
      return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className={`bg-zinc-950/80 border border-zinc-900/60 rounded-lg flex flex-col justify-center flex-1 min-w-[100px] ${density==="high"?"p-2.5":"p-4"} backdrop-blur-md`}>
          <motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} className={`${density==="high"?"text-lg":"text-xl"} font-extrabold text-white tracking-tight truncate`}>{workflow.primaryMetric}</motion.p>
          <p className="text-zinc-600 text-[9px] tracking-tight mt-0.5 truncate">{workflow.secondaryMetric}</p>
        </motion.div>
      );
    }
    case "scatter_plot": {
      if (realChartData.length < 3) return null; 
      return (
        <div className="bg-zinc-950 border border-zinc-900/60 p-2.5 rounded-lg h-14 relative overflow-hidden flex flex-col justify-end flex-1">
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_#3b82f6_1px,_transparent_1px)] [background-size:8px_8px]"/>
          <div className="z-10 flex gap-1.5 w-full justify-between items-end h-full">
            {realChartData.slice(0,10).map((d,i)=>(
              <motion.div 
                key={i} 
                initial={{scale:0,opacity:0}} 
                animate={{y:-(d/maxVal)*28,scale:1,opacity:1}} 
                transition={{duration:0.4,delay:i*0.02}} 
                className="w-1.5 h-1.5 rounded-full bg-blue-500/80 shrink-0"
              />
            ))}
          </div>
        </div>
      );
    }
    case "trend_sparkline": {
      if (realChartData.length < 3) return null; 
      return (
        <div className="bg-zinc-950 border border-zinc-900/60 p-2 rounded-lg h-14 relative flex items-end gap-[1px] flex-1 overflow-hidden">
          {realChartData.map((val,i)=>(
            <motion.div 
              key={i} 
              initial={{height:0}} 
              animate={{height:`${(val/maxVal)*100}%`}} 
              transition={{duration:0.4,delay:i*0.015}} 
              className="flex-1 bg-gradient-to-t from-violet-600/40 to-violet-400/30 hover:from-violet-500/60 rounded-t-[1px] transition-colors"
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 to-transparent pointer-events-none"/>
        </div>
      );
    }
    case "bar_chart": {
      if (realChartData.length < 3) return null; 
      return (
        <div className="bg-zinc-950 border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-center gap-1.5 flex-1">
          {realChartData.slice(0,4).map((val,i)=>(
            <div key={i} className="space-y-0.5">
              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                <motion.div initial={{width:0}} animate={{width:`${(val/maxVal)*100}%`}} className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full"/>
              </div>
            </div>
          ))}
        </div>
      );
    }
    case "stat_grid": {
      if (!workflow.quickStats || Object.keys(workflow.quickStats).length === 0) return null; 
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 w-full">
          {Object.entries(workflow.quickStats).map(([k,v])=>(
            <div key={k} className="bg-zinc-950 border border-zinc-900/50 p-1.5 rounded" title={`${k}: ${v}`}>
              <p className="text-zinc-600 text-[8px] uppercase tracking-wider mb-0.5 truncate">{k}</p>
              <p className="text-zinc-300 font-bold text-[10px] truncate">{v}</p>
            </div>
          ))}
        </div>
      );
    }
    case "semantic_tags": {
      if (workflow.detectedColumns.length === 0) return null; 
      return (
        <div className="flex gap-1 flex-wrap text-[8px] font-mono select-none">
          {workflow.detectedColumns.slice(0,3).map(c=><span key={c} className="bg-zinc-900 text-zinc-500 border border-zinc-800 px-1 py-0.5 rounded">{c}</span>)}
          {workflow.tags.slice(0,2).map(t=><span key={t} className="border border-zinc-900 text-zinc-600 px-1 py-0.5 rounded">{t}</span>)}
        </div>
      );
    }
    case "data_table": {
      const headers=(node.meta?.headers as string[])||[], rows=(node.meta?.rows as string[][])||[];
      if (headers.length === 0) return null;
      return (
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden w-full text-[8px] font-mono">
          <table className="w-full text-left">
            <thead className="bg-zinc-900 border-b border-zinc-800">
              <tr>{headers.map((h,i)=><th key={i} className="px-2 py-1 text-zinc-500 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(0,3).map((r,i)=><tr key={i} className="border-b border-zinc-900/50 hover:bg-zinc-900/20">{r.map((c,j)=><td key={j} className="px-2 py-1 text-zinc-400">{c}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      );
    }
    case "insight_cluster":
      return (
        <div className="bg-zinc-950 border-l-2 border-blue-500/60 p-2 rounded-r-lg w-full text-[10px]">
          <p className="text-blue-400 font-bold mb-0.5">{(node.meta?.title as string)||"Real Insight Vector"}</p>
          <p className="text-zinc-500 leading-normal">{(node.meta?.body as string)||"Active covariance limits validated."}</p>
        </div>
      );
    default: return null;
  }
}