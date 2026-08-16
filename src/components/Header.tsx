import React, { useState } from 'react';
import { 
  FileText, 
  Compass, 
  BarChart3, 
  Sheet, 
  Presentation, 
  Cpu, 
  Sparkles,
  Zap,
  UserCheck
} from 'lucide-react';
import { ActiveTool } from '../types';
import { CreatorProfileModal } from './CreatorProfileModal';

interface HeaderProps {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTool, setActiveTool, hasApiKey }) => {
  const [showCreatorModal, setShowCreatorModal] = useState(false);

  const navItems = [
    { id: 'architecture' as ActiveTool, label: 'How AI Tools Run', icon: Cpu, badge: 'Guide & Blueprint' },
    { id: 'advanced' as ActiveTool, label: 'Advanced Explainer', icon: Zap, badge: 'Deep Intelligence' },
    { id: 'resume' as ActiveTool, label: 'Resume Builder', icon: FileText, badge: 'ATS AI' },
    { id: 'roadmap' as ActiveTool, label: 'Roadmaps', icon: Compass, badge: 'Career Path' },
    { id: 'powerbi' as ActiveTool, label: 'Power BI Architect', icon: BarChart3, badge: 'DAX & BI' },
    { id: 'excel' as ActiveTool, label: 'Excel & Sheets', icon: Sheet, badge: 'Formulas & VBA' },
    { id: 'ppt' as ActiveTool, label: 'Slide Deck PPT', icon: Presentation, badge: 'Deck Creator' },
    { id: 'playground' as ActiveTool, label: 'AI Playground', icon: Sparkles, badge: 'Tester' },
  ];

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div 
              id="brand-logo-btn" 
              onClick={() => setActiveTool('architecture')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight text-white">AI Tools Studio</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    Gemini 3.7
                  </span>
                </div>
                <p className="text-xs text-slate-400">Resume • Roadmaps • PowerBI • Excel • PPT</p>
              </div>
            </div>

            {/* Right Status Badge & Creator Profile Button */}
            <div className="flex items-center space-x-2.5">
              <button
                id="header-creator-details-btn"
                onClick={() => setShowCreatorModal(true)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/90 to-cyan-600/90 hover:from-indigo-600 hover:to-cyan-600 border border-indigo-400/40 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                title="View Creator Contact Details (Payili Santhosh)"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-black text-[10px]">
                  PS
                </div>
                <span className="hidden sm:inline">Payili Santhosh</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 uppercase">Contact</span>
              </button>

              <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`}></span>
                <span className="font-medium">{hasApiKey ? 'Live Gemini Engine Connected' : 'High-Speed Smart Engine Active'}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTool === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTool(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Creator Profile Modal */}
      <CreatorProfileModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
        onNavigateToTool={setActiveTool}
      />
    </>
  );
};

