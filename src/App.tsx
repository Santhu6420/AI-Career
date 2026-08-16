import React, { useState, useEffect } from 'react';
import { ActiveTool } from './types';
import { Header } from './components/Header';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { ResumeBuilder } from './components/ResumeBuilder';
import { RoadmapGenerator } from './components/RoadmapGenerator';
import { PowerBiAssistant } from './components/PowerBiAssistant';
import { ExcelSheetGenius } from './components/ExcelSheetGenius';
import { PptCreator } from './components/PptCreator';
import { AiPlayground } from './components/AiPlayground';
import { AdvancedExplainer } from './components/AdvancedExplainer';
import { 
  Cpu, 
  FileText, 
  Compass, 
  BarChart3, 
  Sheet, 
  Presentation, 
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [activeTool, setActiveTool] = useState<ActiveTool>('architecture');
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Quick health check on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasApiKey !== undefined) {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Header activeTool={activeTool} setActiveTool={setActiveTool} hasApiKey={hasApiKey} />

      {/* Main Workspace Area */}
      <main className="flex-1">
        {activeTool === 'architecture' && (
          <ArchitectureGuide onSelectTool={setActiveTool} setActiveTool={setActiveTool} />
        )}
        {activeTool === 'resume' && <ResumeBuilder />}
        {activeTool === 'roadmap' && <RoadmapGenerator />}
        {activeTool === 'powerbi' && <PowerBiAssistant />}
        {activeTool === 'excel' && <ExcelSheetGenius />}
        {activeTool === 'ppt' && <PptCreator />}
        {activeTool === 'advanced' && <AdvancedExplainer onNavigateToTool={setActiveTool} />}
        {activeTool === 'playground' && <AiPlayground />}
      </main>

      {/* Bottom Tool Switcher Bar & Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Quick Launch Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pb-6 border-b border-slate-800">
            {[
              { id: 'advanced' as ActiveTool, label: 'Advanced Deep Explainer', icon: Zap },
              { id: 'resume' as ActiveTool, label: 'Resume ATS Builder', icon: FileText },
              { id: 'roadmap' as ActiveTool, label: 'Learning Roadmaps', icon: Compass },
              { id: 'powerbi' as ActiveTool, label: 'Power BI DAX Architect', icon: BarChart3 },
              { id: 'excel' as ActiveTool, label: 'Excel & Sheet Formulas', icon: Sheet },
              { id: 'ppt' as ActiveTool, label: 'Slide Deck Creator', icon: Presentation },
              { id: 'architecture' as ActiveTool, label: 'Architecture Guide', icon: Cpu },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveTool(tool.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer group"
                >
                  <Icon className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 shrink-0" />
                  <span className="truncate">{tool.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="font-semibold text-slate-300">AI Productivity Tools Studio</span>
              <span>— Structured JSON Pipelines with Gemini 3.7 Flash</span>
            </div>
            <p className="text-slate-400">
              Deterministic UI Generators • ATS Scoring • DAX Optimization • Star Schema • Formula Breakdown
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
