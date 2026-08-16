import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  User, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Code2, 
  Cpu, 
  FileText, 
  BarChart3,
  Presentation,
  Send
} from 'lucide-react';
import { ActiveTool } from '../types';

interface CreatorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTool?: (tool: ActiveTool) => void;
}

export const CreatorProfileModal: React.FC<CreatorProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTool,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transform transition-all">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-1 shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center font-black text-2xl text-cyan-400">
                PS
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified Creator & Architect</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Payili Santhosh</h2>
              <p className="text-xs text-indigo-200 font-medium">AI Solutions Architect & Full-Stack Platform Engineer</p>
            </div>
          </div>
        </div>

        {/* Contact Information Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Direct Contact Details
            </h3>

            {/* Email Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-indigo-300 transition-colors">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</div>
                  <a
                    href="mailto:payilisanthosh@gmail.com"
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline truncate block"
                  >
                    payilisanthosh@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={() => handleCopy('payilisanthosh@gmail.com', 'email')}
                  className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
                  title="Copy Email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px] hidden sm:inline">{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>

                <a
                  href="mailto:payilisanthosh@gmail.com"
                  className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Send</span>
                </a>
              </div>
            </div>

            {/* Phone Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-indigo-300 transition-colors">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone / Mobile</div>
                  <a
                    href="tel:6300655960"
                    className="text-sm font-bold text-emerald-700 hover:text-emerald-900 hover:underline truncate block"
                  >
                    6300655960 <span className="text-xs font-normal text-slate-500">(+91 6300655960)</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={() => handleCopy('6300655960', 'phone')}
                  className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
                  title="Copy Phone Number"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px] hidden sm:inline">{copiedPhone ? 'Copied' : 'Copy'}</span>
                </button>

                <a
                  href="tel:6300655960"
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Call</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Tool Links for Payili Santhosh's Profile */}
          <div className="pt-2 border-t border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 block">Explore Payili Santhosh's Work in this Studio:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onNavigateToTool?.('resume');
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-left text-xs font-bold text-slate-800 hover:text-indigo-900 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">ATS Resume Builder</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigateToTool?.('ppt');
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-left text-xs font-bold text-slate-800 hover:text-indigo-900 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <Presentation className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">PPT & Visual Studio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>AI Tools Studio • Portfolio Platform</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
