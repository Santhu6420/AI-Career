import React, { useState, useEffect, useRef } from 'react';
import { 
  Presentation, 
  Sparkles, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Mic, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Layers, 
  Plus, 
  Trash2,
  Tv,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Sliders,
  Vote,
  GitBranch,
  Edit3,
  Eye,
  FileSpreadsheet,
  MousePointer,
  PenTool,
  Volume2,
  VolumeX,
  Clock,
  Palette,
  Sparkle,
  ArrowRight,
  TrendingUp,
  Layout,
  Share2,
  BookOpen,
  ArrowUp,
  ArrowDown,
  CopyPlus,
  HelpCircle,
  Award,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  FileUp,
  UploadCloud,
  FileCheck,
  Printer,
  Loader2,
  FileDown,
  FileText
} from 'lucide-react';
import { AdvancedExplainerModal } from './AdvancedExplainerModal';
import { PdfToSlidesModal } from './PdfToSlidesModal';
import { SlideImageModal } from './SlideImageModal';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import confetti from 'canvas-confetti';
import pptxgen from 'pptxgenjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PresentationData, SlideItem, SlideLayoutType, SlideChartPoint, SlideProcessStep, SlidePollData } from '../types';

// Theme Palettes
export interface ThemeConfig {
  id: string;
  name: string;
  bgClass: string;
  cardBgClass: string;
  accentText: string;
  accentBadge: string;
  glowColor: string;
  chartColors: string[];
}

const THEMES: Record<string, ThemeConfig> = {
  indigo: {
    id: 'indigo',
    name: 'Modern Slate & Indigo',
    bgClass: 'bg-slate-950 text-white border-slate-800',
    cardBgClass: 'bg-slate-900/90 border-slate-800 text-slate-200',
    accentText: 'text-indigo-400',
    accentBadge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    glowColor: 'bg-indigo-600/15',
    chartColors: ['#6366f1', '#38bdf8', '#818cf8', '#c084fc', '#4ade80'],
  },
  emerald: {
    id: 'emerald',
    name: 'Quantum Emerald',
    bgClass: 'bg-zinc-950 text-white border-zinc-800',
    cardBgClass: 'bg-zinc-900/90 border-emerald-900/40 text-zinc-200',
    accentText: 'text-emerald-400',
    accentBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    glowColor: 'bg-emerald-600/15',
    chartColors: ['#10b981', '#34d399', '#059669', '#6ee7b7', '#3b82f6'],
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Cyan & Purple',
    bgClass: 'bg-[#090d16] text-white border-cyan-900/40',
    cardBgClass: 'bg-slate-900/90 border-cyan-500/30 text-cyan-50',
    accentText: 'text-cyan-400',
    accentBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    glowColor: 'bg-cyan-500/15',
    chartColors: ['#06b6d4', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6'],
  },
  crimson: {
    id: 'crimson',
    name: 'Executive Crimson',
    bgClass: 'bg-[#140b0d] text-white border-rose-950',
    cardBgClass: 'bg-stone-900/90 border-rose-900/40 text-stone-200',
    accentText: 'text-rose-400',
    accentBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    glowColor: 'bg-rose-600/15',
    chartColors: ['#f43f5e', '#fb7185', '#e11d48', '#f59e0b', '#fb923c'],
  },
  light: {
    id: 'light',
    name: 'Quartz Studio (Light)',
    bgClass: 'bg-white text-slate-900 border-slate-200 shadow-md',
    cardBgClass: 'bg-slate-50 border-slate-200 text-slate-800',
    accentText: 'text-indigo-600',
    accentBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    glowColor: 'bg-indigo-100/50',
    chartColors: ['#4f46e5', '#0284c7', '#16a34a', '#d97706', '#9333ea'],
  },
};

const initialPresentation: PresentationData = {
  deckTitle: "AI Autonomous Agents: The Next Computing Paradigm",
  deckSubtitle: "Strategic Overview, Visual Analytics & 12-Month Rollout",
  theme: "indigo",
  totalSlides: 6,
  slides: [
    {
      slideNumber: 1,
      layout: "title_slide",
      headline: "AI Autonomous Agents: The Next Computing Paradigm",
      subhead: "Architectural Foundations, Market Impact & Autonomous Interactive Systems",
      bullets: [
        "From Passive Chatbots to Proactive Autonomous Multi-Agent Systems",
        "Deterministic Workflows Powered by Type-Safe Structured Schemas",
        "Unlocking 10x Operational Velocity Across Knowledge Workers",
      ],
      statCallout: { number: "10x", label: "Enterprise Velocity Acceleration" },
      speakerNotes:
        "Good morning everyone. Today we examine how generative AI is shifting from conversational text generators into autonomous task execution agents that work alongside human teams.",
      visualBadge: "Executive Keynote",
      visualTheme: "indigo",
    },
    {
      slideNumber: 2,
      layout: "two_column_compare",
      headline: "The Paradigm Shift: Legacy SaaS vs Autonomous AI Stack",
      subhead: "Why standard static workflows are being replaced by dynamic intelligence",
      leftColumnTitle: "Traditional Manual Stack",
      leftColumnItems: [
        "Rigid, hardcoded workflows requiring constant human intervention",
        "Fragmented tools requiring manual copy-paste context switching",
        "Slow feedback loops: days or weeks for data synthesis",
        "High human cognitive fatigue and repetitive documentation burden",
      ],
      rightColumnTitle: "Autonomous AI Agent Stack",
      rightColumnItems: [
        "Self-correcting iterative loops with automated quality verification",
        "End-to-end multi-tool orchestration with structured JSON APIs",
        "Sub-second real-time streaming answers grounded in company data",
        "Deterministic client-side calculation engines ensuring zero hallucinations",
      ],
      speakerNotes:
        "Notice the stark divergence here. The legacy paradigm treats software as passive forms. The AI-native stack treats software as autonomous collaborators.",
      visualBadge: "Strategic Comparison",
      visualTheme: "indigo",
    },
    {
      slideNumber: 3,
      layout: "interactive_chart",
      headline: "Performance Velocity & Output Growth Projections",
      subhead: "Quarterly output velocity comparing automated AI tools vs traditional manual workflows",
      chartType: "area",
      chartData: [
        { name: "Q1", value: 120, target: 80 },
        { name: "Q2", value: 240, target: 130 },
        { name: "Q3", value: 410, target: 190 },
        { name: "Q4", value: 680, target: 260 },
        { name: "Q5 (Est)", value: 950, target: 340 },
      ],
      statCallout: { number: "+280%", label: "Annual Velocity Growth" },
      bullets: [
        "Automated slide generation reduces authoring cycle time from 4h to 2min",
        "Sub-second DAX formula compilation with zero syntax mistakes",
        "Interactive live data manipulation directly inside presentation slides",
      ],
      speakerNotes:
        "This interactive visual highlights the exponential divergence in team output when equipped with intelligent agents.",
      visualBadge: "Interactive Visual Chart",
      visualTheme: "indigo",
    },
    {
      slideNumber: 4,
      layout: "process_diagram",
      headline: "End-to-End Autonomous Execution Pipeline",
      subhead: "The 4-stage pipeline translating natural language intent into interactive presentation visuals",
      processSteps: [
        { step: 1, title: "Intent & Context Ingestion", description: "Captures audience profile, topic requirements, and style directives.", tag: "Input Stage" },
        { step: 2, title: "Structured Schema Synthesis", description: "Gemini formats data into type-safe JSON with visual tokens and numerical metrics.", tag: "AI Engine" },
        { step: 3, title: "Interactive Canvas Binding", description: "Frontend binds reactive charts, voting widgets, and SVG flow diagrams.", tag: "UI Rendering" },
        { step: 4, title: "Multi-Format Export", description: "Export to editable PowerPoint (.pptx), Markdown, or present full-screen.", tag: "Export" },
      ],
      speakerNotes:
        "Here is the architectural sequence that ensures every generated slide is both mathematically valid and dynamically interactive.",
      visualBadge: "Process Diagram",
      visualTheme: "indigo",
    },
    {
      slideNumber: 5,
      layout: "live_poll",
      headline: "Audience Interactive Poll: Priority Use Case",
      subhead: "Which AI accelerator will have the highest immediate impact in your workflow?",
      pollData: {
        question: "Which tool will your organization deploy first?",
        options: [
          { id: "opt1", label: "AI ATS Resume & Career Optimizer", votes: 42 },
          { id: "opt2", label: "Interactive Visual Presentation / PPT Engine", votes: 94 },
          { id: "opt3", label: "Power BI DAX & M-Code Architect", votes: 68 },
          { id: "opt4", label: "Excel Formula Genius & VBA Generator", votes: 55 },
        ],
      },
      speakerNotes:
        "Let's get real-time feedback from everyone in the room. Click your choice to see live voting results with real-time percentages.",
      visualBadge: "Live Audience Poll",
      visualTheme: "indigo",
    },
    {
      slideNumber: 6,
      layout: "timeline_quote",
      headline: "90-Day Implementation Plan & Next Milestones",
      subhead: "Actionable milestones for immediate deployment",
      bullets: [
        "Month 1: Pilot core AI tools across engineering, analytics, and HR teams",
        "Month 2: Integrate custom data schemas and company brand templates",
        "Month 3: Roll out company-wide access with automated telemetry and feedback loops",
      ],
      statCallout: { number: "90 Days", label: "Full Enterprise Deployment" },
      speakerNotes:
        "To conclude, our rollout is pragmatic and low-risk. Within 90 days, every department will have access to tailor-made AI tools that elevate output quality.",
      visualBadge: "Roadmap to Launch",
      visualTheme: "indigo",
    },
  ],
};

// Play audio chime for slide advance
function playSlideChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

export const PptCreator: React.FC = () => {
  const [deck, setDeck] = useState<PresentationData>(initialPresentation);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [topic, setTopic] = useState("AI Autonomous Agents: The Next Computing Paradigm");
  const [targetAudience, setTargetAudience] = useState("Executive Leadership & Tech Investors");
  const [slideCount, setSlideCount] = useState<number | string>(6);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('indigo');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingAiSlide, setIsAddingAiSlide] = useState(false);
  const [singleSlidePrompt, setSingleSlidePrompt] = useState("");
  const [showAiSlideModal, setShowAiSlideModal] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  
  // Interactive view modes
  const [activeVisualMode, setActiveVisualMode] = useState<'canvas' | 'chart_tuner' | 'infographic' | 'editor' | 'mastery_guide'>('canvas');
  
  // Interactive presenter tools
  const [laserMode, setLaserMode] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);

  // Canvas drawing ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const presenterContainerRef = useRef<HTMLDivElement | null>(null);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);

  const currentSlide = deck.slides[currentSlideIdx] || deck.slides[0];
  const activeTheme = THEMES[selectedThemeId] || THEMES.indigo;

  // Presentation Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresenting) return;
      if (e.key === "ArrowRight" || e.key === "Space") {
        advanceSlide(1);
      } else if (e.key === "ArrowLeft") {
        advanceSlide(-1);
      } else if (e.key === "Escape") {
        setIsPresenting(false);
      } else if (e.key === "l" || e.key === "L") {
        setLaserMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresenting, deck.slides.length, currentSlideIdx, soundEnabled]);

  const advanceSlide = (delta: number) => {
    setCurrentSlideIdx((prev) => {
      const next = Math.max(0, Math.min(deck.slides.length - 1, prev + delta));
      if (next !== prev && soundEnabled) {
        playSlideChime();
      }
      return next;
    });
    clearCanvas();
  };

  // AI Full Deck Generation (Unlimited slides support)
  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const targetCount = Number(slideCount) || 6;
      const res = await fetch("/api/tools/ppt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetAudience,
          slideCount: targetCount,
          styleTheme: activeTheme.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDeck(data.data);
        setCurrentSlideIdx(0);
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error("PPT API error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // AI Single Slide Generator for Unlimited Additions
  const handleGenerateSingleSlide = async () => {
    if (!singleSlidePrompt.trim()) return;
    setIsAddingAiSlide(true);
    try {
      const nextSlideNum = deck.slides.length + 1;
      const res = await fetch("/api/tools/ppt/single-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: deck.deckTitle,
          slideIntent: singleSlidePrompt,
          slideNumber: nextSlideNum,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const newSlide: SlideItem = {
          ...data.data,
          slideNumber: nextSlideNum,
          visualTheme: selectedThemeId,
        };
        setDeck((prev) => ({
          ...prev,
          totalSlides: prev.slides.length + 1,
          slides: [...prev.slides, newSlide],
        }));
        setCurrentSlideIdx(deck.slides.length);
        setShowAiSlideModal(false);
        setSingleSlidePrompt("");
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error("Single slide error:", err);
    } finally {
      setIsAddingAiSlide(false);
    }
  };

  // Quick Append 5 More Slides
  const handleAppendBatchSlides = async (count: number = 5) => {
    setIsLoading(true);
    try {
      const startNum = deck.slides.length;
      const newBatch: SlideItem[] = [];
      
      const layouts: SlideLayoutType[] = ['interactive_chart', 'process_diagram', 'two_column_compare', 'metrics_highlight', 'live_poll'];
      const topics = [
        "Deep Architectural Breakdown",
        "Financial ROI & Cost Savings",
        "Competitive Landscape Matrix",
        "Risk Mitigation & Compliance",
        "Strategic 3-Year Vision",
      ];

      for (let i = 0; i < count; i++) {
        const slideNum = startNum + i + 1;
        const layout = layouts[i % layouts.length];
        newBatch.push({
          slideNumber: slideNum,
          layout: layout,
          headline: `${topics[i % topics.length]}: Pillar ${slideNum}`,
          subhead: "Comprehensive execution details and quantitative benchmarks",
          bullets: [
            "Establish systematic milestones and automated verification checkpoints",
            "Accelerate cross-functional team productivity with dedicated AI tooling",
            "Maintain continuous performance analytics and iterative feedback loops",
          ],
          statCallout: { number: `${(i + 2) * 2.5}x`, label: "Target Efficiency Milestone" },
          chartType: 'area',
          chartData: [
            { name: "M1", value: 100 + i * 20, target: 80 },
            { name: "M2", value: 180 + i * 30, target: 120 },
            { name: "M3", value: 290 + i * 40, target: 170 },
            { name: "M4", value: 450 + i * 50, target: 220 },
          ],
          processSteps: [
            { step: 1, title: "Ingestion & Discovery", description: "Audit legacy pipelines and identify bottlenecks.", tag: "Discovery" },
            { step: 2, title: "Model Orchestration", description: "Deploy Gemini schema generators with validation.", tag: "AI Engine" },
            { step: 3, title: "Telemetry & QA", description: "Automated regression testing and latency tracing.", tag: "Observability" },
            { step: 4, title: "Global Rollout", description: "Gradual multi-region deployment with zero downtime.", tag: "Release" },
          ],
          pollData: {
            question: "What is your primary milestone requirement?",
            options: [
              { id: `opt_${slideNum}_1`, label: "Latency Reduction (<100ms)", votes: 38 },
              { id: `opt_${slideNum}_2`, label: "Cost Optimization ($/Token)", votes: 52 },
              { id: `opt_${slideNum}_3`, label: "Zero-Hallucination Schemas", votes: 89 },
            ],
          },
          speakerNotes: `Slide ${slideNum} highlights key organizational priorities for scaling. Emphasize metrics and governance.`,
          visualBadge: "Strategic Milestone",
          visualTheme: selectedThemeId,
        });
      }

      setDeck((prev) => ({
        ...prev,
        totalSlides: prev.slides.length + newBatch.length,
        slides: [...prev.slides, ...newBatch],
      }));
      setCurrentSlideIdx(startNum);
      confetti({ particleCount: 50, spread: 60 });
    } finally {
      setIsLoading(false);
    }
  };

  // Reorder slides
  const handleMoveSlide = (fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= deck.slides.length) return;

    const newSlides = [...deck.slides];
    const [moved] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, moved);

    // Re-index slide numbers
    const reindexed = newSlides.map((s, i) => ({ ...s, slideNumber: i + 1 }));
    setDeck({ ...deck, slides: reindexed });
    setCurrentSlideIdx(toIndex);
  };

  // Duplicate slide
  const handleDuplicateSlide = (idx: number) => {
    const target = deck.slides[idx];
    const duplicated: SlideItem = {
      ...JSON.parse(JSON.stringify(target)),
      headline: `${target.headline} (Copy)`,
      slideNumber: idx + 2,
    };

    const newSlides = [...deck.slides];
    newSlides.splice(idx + 1, 0, duplicated);

    const reindexed = newSlides.map((s, i) => ({ ...s, slideNumber: i + 1 }));
    setDeck({ ...deck, totalSlides: reindexed.length, slides: reindexed });
    setCurrentSlideIdx(idx + 1);
  };

  // Export real PPTX PowerPoint presentation
  const handleExportPptx = async () => {
    try {
      const pptx = new pptxgen();
      pptx.layout = "LAYOUT_16x9";
      pptx.author = "AI Presentation Genius";
      pptx.title = deck.deckTitle;

      deck.slides.forEach((s) => {
        const slide = pptx.addSlide();
        slide.background = { color: selectedThemeId === 'light' ? "F8FAFC" : "0F172A" };

        if (s.visualBadge) {
          slide.addText(s.visualBadge.toUpperCase(), {
            x: 0.8,
            y: 0.6,
            w: 4.0,
            h: 0.3,
            fontSize: 10,
            bold: true,
            color: "6366F1",
          });
        }

        slide.addText(s.headline, {
          x: 0.8,
          y: 1.0,
          w: 8.5,
          h: 0.9,
          fontSize: 22,
          bold: true,
          color: selectedThemeId === 'light' ? "0F172A" : "FFFFFF",
        });

        if (s.subhead) {
          slide.addText(s.subhead, {
            x: 0.8,
            y: 1.9,
            w: 8.5,
            h: 0.5,
            fontSize: 13,
            color: selectedThemeId === 'light' ? "475569" : "94A3B8",
          });
        }

        if (s.layout === 'two_column_compare' && s.leftColumnItems && s.rightColumnItems) {
          slide.addText(s.leftColumnTitle || "Before", { x: 0.8, y: 2.7, w: 4.0, fontSize: 13, bold: true, color: "F43F5E" });
          slide.addText(s.leftColumnItems.map(item => ({ text: item, options: { bullet: true, color: "E2E8F0" } })), {
            x: 0.8, y: 3.1, w: 4.0, h: 3.0, fontSize: 11,
          });

          slide.addText(s.rightColumnTitle || "After", { x: 5.2, y: 2.7, w: 4.0, fontSize: 13, bold: true, color: "10B981" });
          slide.addText(s.rightColumnItems.map(item => ({ text: item, options: { bullet: true, color: "E2E8F0" } })), {
            x: 5.2, y: 3.1, w: 4.0, h: 3.0, fontSize: 11,
          });
        } else if (s.statCallout) {
          slide.addText(s.statCallout.number, {
            x: 0.8,
            y: 2.8,
            w: 3.0,
            h: 0.8,
            fontSize: 32,
            bold: true,
            color: "38BDF8",
          });
          slide.addText(s.statCallout.label, {
            x: 0.8,
            y: 3.6,
            w: 3.0,
            h: 0.4,
            fontSize: 11,
            color: "94A3B8",
          });

          if (s.bullets && s.bullets.length > 0) {
            slide.addText(s.bullets.map(b => ({ text: b, options: { bullet: true, color: "CBD5E1" } })), {
              x: 4.2, y: 2.8, w: 5.0, h: 3.0, fontSize: 12,
            });
          }
        } else if (s.bullets && s.bullets.length > 0) {
          slide.addText(s.bullets.map(b => ({ text: b, options: { bullet: true, color: "CBD5E1" } })), {
            x: 0.8, y: 2.6, w: 8.5, h: 3.5, fontSize: 13,
          });
        }

        if (s.speakerNotes) {
          slide.addNotes(s.speakerNotes);
        }
      });

      await pptx.writeFile({ fileName: `${deck.deckTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.pptx` });
      confetti({ particleCount: 40, spread: 60 });
    } catch (error) {
      console.error("PPTX Export Error:", error);
      alert("Failed to export PPTX. Please try again.");
    }
  };

  // Export full multi-page PDF presentation with high resolution
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1280, 720],
      });

      const offscreenContainer = document.getElementById('all-slides-pdf-container');
      if (offscreenContainer) {
        const slideNodes = offscreenContainer.querySelectorAll<HTMLElement>('.pdf-slide-page');
        for (let i = 0; i < slideNodes.length; i++) {
          if (i > 0) {
            pdf.addPage([1280, 720], 'landscape');
          }
          const canvas = await html2canvas(slideNodes[i], {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: selectedThemeId === 'light' ? '#ffffff' : '#020617',
          });
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(imgData, 'JPEG', 0, 0, 1280, 720);
        }
        pdf.save(`${deck.deckTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`);
        confetti({ particleCount: 60, spread: 70 });
      } else {
        const activeCanvas = document.getElementById('slide-canvas-main');
        if (activeCanvas) {
          const canvas = await html2canvas(activeCanvas, {
            scale: 2,
            useCORS: true,
            logging: false,
          });
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(imgData, 'JPEG', 0, 0, 1280, 720);
          pdf.save(`${deck.deckTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}_slide_${currentSlideIdx + 1}.pdf`);
          confetti({ particleCount: 40, spread: 50 });
        }
      }
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to export PDF. Please check your browser settings or try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCopyMarkdown = () => {
    let md = `# ${deck.deckTitle}\n*${deck.deckSubtitle}*\n\n---\n\n`;
    deck.slides.forEach((s) => {
      md += `## Slide ${s.slideNumber}: ${s.headline}\n*${s.subhead || ""}*\n\n`;
      if (s.statCallout) {
        md += `> **${s.statCallout.number}** — ${s.statCallout.label}\n\n`;
      }
      if (s.bullets) {
        s.bullets.forEach((b) => (md += `- ${b}\n`));
      }
      if (s.leftColumnItems && s.rightColumnItems) {
        md += `\n### ${s.leftColumnTitle}\n`;
        s.leftColumnItems.forEach((item) => (md += `- ${item}\n`));
        md += `\n### ${s.rightColumnTitle}\n`;
        s.rightColumnItems.forEach((item) => (md += `- ${item}\n`));
      }
      md += `\n**Speaker Notes:**\n${s.speakerNotes}\n\n---\n\n`;
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Interactive Live Poll Vote
  const handleVote = (optionId: string) => {
    setVotedOptionId(optionId);
    setDeck((prev) => {
      const newSlides = [...prev.slides];
      const targetSlide = { ...newSlides[currentSlideIdx] };
      if (targetSlide.pollData) {
        const updatedOptions = targetSlide.pollData.options.map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        targetSlide.pollData = {
          ...targetSlide.pollData,
          options: updatedOptions,
          totalVotes: (targetSlide.pollData.totalVotes || 0) + 1,
        };
        newSlides[currentSlideIdx] = targetSlide;
      }
      return { ...prev, slides: newSlides };
    });
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
  };

  // Chart data value update
  const handleUpdateChartPoint = (index: number, field: 'value' | 'target', newVal: number) => {
    setDeck((prev) => {
      const newSlides = [...prev.slides];
      const targetSlide = { ...newSlides[currentSlideIdx] };
      if (targetSlide.chartData) {
        const newPoints = [...targetSlide.chartData];
        newPoints[index] = { ...newPoints[index], [field]: newVal };
        targetSlide.chartData = newPoints;
        newSlides[currentSlideIdx] = targetSlide;
      }
      return { ...prev, slides: newSlides };
    });
  };

  // Toggle chart type
  const handleSwitchChartType = (type: 'bar' | 'area' | 'line' | 'pie') => {
    setDeck((prev) => {
      const newSlides = [...prev.slides];
      newSlides[currentSlideIdx] = {
        ...newSlides[currentSlideIdx],
        chartType: type,
        layout: 'interactive_chart',
      };
      return { ...prev, slides: newSlides };
    });
  };

  // Drawing Canvas logic
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingMode) return;
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (laserMode) {
      setLaserPos({ x, y });
    }

    if (drawingMode && isDrawingRef.current) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleCanvasMouseUp = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Add blank slide
  const handleAddSlide = () => {
    const newSlide: SlideItem = {
      slideNumber: deck.slides.length + 1,
      layout: 'bullet_cards',
      headline: 'New Strategic Objective',
      subhead: 'Key strategic objectives and implementation directives',
      bullets: [
        'Define core functional milestones and deliverables',
        'Establish automated quality verification guardrails',
        'Scale execution across cross-functional units',
      ],
      speakerNotes: 'Briefly explain the rationale behind this new strategic pillar and its impact on the roadmap.',
      visualBadge: 'Custom Pillar',
      visualTheme: selectedThemeId,
    };
    setDeck({
      ...deck,
      totalSlides: deck.slides.length + 1,
      slides: [...deck.slides, newSlide],
    });
    setCurrentSlideIdx(deck.slides.length);
  };

  // Delete slide
  const handleDeleteSlide = (idx: number) => {
    if (deck.slides.length <= 1) return;
    const newSlides = deck.slides
      .filter((_, i) => i !== idx)
      .map((s, i) => ({ ...s, slideNumber: i + 1 }));
    setDeck({
      ...deck,
      totalSlides: newSlides.length,
      slides: newSlides,
    });
    setCurrentSlideIdx(Math.max(0, idx - 1));
  };

  // Format timer
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSec).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shadow-xs">
              <Presentation className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interactive PPT to Visuals Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
              Unlimited Slides
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Build and deliver unlimited interactive presentation slides with live charts, audience polls, step diagrams, executive frameworks, and editable PPTX export.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Theme Selector */}
          <div className="flex items-center space-x-1 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
            {Object.values(THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedThemeId(t.id)}
                title={t.name}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedThemeId === t.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* PDF & Document Ingestion Button */}
          <button
            id="import-pdf-deck-btn"
            onClick={() => setShowPdfModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            title="Upload and convert any PDF, report, or document into interactive visual slides"
          >
            <FileUp className="w-4 h-4" />
            <span>Interact with Any PDF</span>
          </button>

          <button
            id="start-presentation-mode-btn"
            onClick={() => {
              setIsPresenting(true);
              setIsTimerRunning(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-sm cursor-pointer"
          >
            <Tv className="w-4 h-4" />
            <span>Present Stage</span>
          </button>

          {/* Download PDF Button */}
          <button
            id="download-pdf-btn"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Download complete multi-page PDF presentation of all slides"
          >
            {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            <span>{isExportingPdf ? 'Exporting PDF...' : 'Download PDF'}</span>
          </button>

          <button
            id="export-pptx-btn"
            onClick={handleExportPptx}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            title="Download real Microsoft PowerPoint (.pptx) file"
          >
            <Download className="w-4 h-4" />
            <span>Export .PPTX</span>
          </button>

          <button
            id="copy-deck-md-btn"
            onClick={handleCopyMarkdown}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-medium text-xs sm:text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied" : "Markdown"}</span>
          </button>
        </div>
      </div>

      {/* AI Presentation Generator Input Card (Unlimited Slides Supported) */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm text-white">Synthesize Unlimited Interactive Presentation Slides</span>
          </div>
          <span className="text-xs text-indigo-300 font-mono">Supports Any Slide Count (1 to 50+)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-6">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Presentation Topic or Raw Text</label>
            <input
              id="ppt-topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Generative AI Multi-Agent Workflows in Enterprise SaaS"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
            <input
              id="ppt-audience-input"
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Executive Board, Investors, Engineers"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Number of Slides (Unlimited)
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="ppt-slidecount-input"
                type="number"
                min={1}
                max={100}
                value={slideCount}
                onChange={(e) => setSlideCount(Math.max(1, Number(e.target.value)))}
                className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white font-mono text-center focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
                {[4, 6, 8, 12, 16, 20].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSlideCount(count)}
                    className={`px-2 py-1 text-[11px] rounded font-mono cursor-pointer transition-colors ${
                      Number(slideCount) === count
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span>Includes:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">Live Recharts</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">Interactive Polls</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">Process Flows</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-300 font-mono">Speaker Teleprompter</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-upload-pdf-ppt"
              onClick={() => setShowPdfModal(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-sm"
            >
              <FileUp className="w-4 h-4 text-cyan-400" />
              <span>Convert from PDF</span>
            </button>

            <button
              id="btn-generate-ppt"
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isLoading ? `Synthesizing ${slideCount} Slides...` : `Generate ${slideCount} Interactive Slides`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs & Quick Slide Adders */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveVisualMode('canvas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeVisualMode === 'canvas'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Interactive Slide Canvas</span>
          </button>

          <button
            onClick={() => setActiveVisualMode('chart_tuner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeVisualMode === 'chart_tuner'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Live Data Chart Tuner</span>
          </button>

          <button
            onClick={() => setActiveVisualMode('infographic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeVisualMode === 'infographic'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full Deck Infographic Grid ({deck.slides.length})</span>
          </button>

          <button
            onClick={() => setActiveVisualMode('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeVisualMode === 'editor'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Visual Content Editor</span>
          </button>

          <button
            onClick={() => setActiveVisualMode('mastery_guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeVisualMode === 'mastery_guide'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Presentation Mastery Vault</span>
          </button>
        </div>

        {/* Unlimited Slide Creation Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAiSlideModal(true)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Add Specific Slide</span>
          </button>

          <button
            onClick={() => handleAppendBatchSlides(5)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
            title="Instantly generate 5 additional structured slides"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+5 Slides</span>
          </button>

          <button
            onClick={handleAddSlide}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slide</span>
          </button>
        </div>
      </div>

      {/* Modal: AI Generate Specific Slide */}
      {showAiSlideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <Sparkles className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-slate-900 text-base">Generate Custom AI Slide</h3>
              </div>
              <button
                onClick={() => setShowAiSlideModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Describe what content, charts, or workflow you want this slide to visualize. It will be added directly to your deck as slide #{deck.slides.length + 1}.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Slide Topic / Objective</label>
              <input
                type="text"
                value={singleSlidePrompt}
                onChange={(e) => setSingleSlidePrompt(e.target.value)}
                placeholder="e.g. 5-Year Enterprise ROI Forecast with quarterly bar chart comparison"
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAiSlideModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateSingleSlide}
                disabled={isAddingAiSlide || !singleSlidePrompt.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAddingAiSlide ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isAddingAiSlide ? "Synthesizing Slide..." : "Add to Slide Deck"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Slide Deck Workspace */}
      {activeVisualMode === 'mastery_guide' ? (
        /* Presentation Mastery & Executive Frameworks Deep Dive */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="border-b border-slate-200 pb-5">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Presentation Mastery & Executive Frameworks Knowledge Vault
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              The foundational principles, cognitive psychology, and storytelling frameworks behind world-class keynote slides and executive pitch decks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Framework 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">01</span>
                <h3 className="font-bold text-slate-900 text-base">The 10-20-30 Rule</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pioneered by Guy Kawasaki for venture capital pitches:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span><strong>10 Slides Max:</strong> The optimal number of concepts an executive audience can retain in a single sitting.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span><strong>20 Minutes Duration:</strong> Leaves 40 minutes in a 1-hour meeting for interactive Q&A and discussion.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span><strong>30pt Font Minimum:</strong> Forces you to write clean summary headlines instead of reading dense paragraphs.</span>
                </li>
              </ul>
            </div>

            {/* Framework 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">02</span>
                <h3 className="font-bold text-slate-900 text-base">The Minto Pyramid Principle</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                McKinsey executive communication framework: Lead with the conclusion first (Top-Down Communication).
              </p>
              <div className="space-y-1 text-xs text-slate-700">
                <div className="p-2 rounded bg-white border border-slate-200 font-medium">
                  <strong>S - Situation:</strong> Establish undisputed context.
                </div>
                <div className="p-2 rounded bg-white border border-slate-200 font-medium">
                  <strong>C - Complication:</strong> What went wrong or shifted in the market?
                </div>
                <div className="p-2 rounded bg-white border border-slate-200 font-medium">
                  <strong>Q - Question:</strong> What must we do to capture the opportunity?
                </div>
                <div className="p-2 rounded bg-white border border-slate-200 font-medium text-emerald-700 font-bold">
                  <strong>A - Answer:</strong> Our proposed solution & roadmap.
                </div>
              </div>
            </div>

            {/* Framework 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs">03</span>
                <h3 className="font-bold text-slate-900 text-base">The 6x6 Cognitive Load Rule</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Human short-term working memory holds 4–7 chunks of information simultaneously (Miller's Law).
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Never place more than <strong>6 bullet points</strong> on a single slide.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Keep each bullet to a maximum of <strong>6 words</strong>.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Use <strong>bold anchor tokens</strong> at the start of bullets to enable 2-second visual scanning.</span>
                </li>
              </ul>
            </div>

            {/* Framework 4 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700 font-bold text-xs">04</span>
                <h3 className="font-bold text-slate-900 text-base">Data Storytelling Commandments</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rules for selecting chart layouts that drive immediate comprehension:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Area / Line Charts:</strong> Use exclusively for time-series continuous trends and growth velocity.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Bar Charts:</strong> Ideal for discrete categorical comparisons and target vs actual metrics.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Process Flows:</strong> Best for explaining system architectures, user journeys, and rollout pipelines.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Live Polls:</strong> Break audience passivity at minute 10 to calibrate attendee sentiment.</span>
                </li>
              </ul>
            </div>

            {/* Framework 5 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">05</span>
                <h3 className="font-bold text-slate-900 text-base">Keynote Delivery & Vocal Dynamics</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Techniques used by top keynote speakers (Steve Jobs, Simon Sinek):
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-rose-600 font-bold">•</span>
                  <span><strong>The 3-Second Pause:</strong> After clicking a new slide, pause for 3 seconds so audience reads headline before you speak.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-rose-600 font-bold">•</span>
                  <span><strong>Laser Pointer Rule:</strong> Only point at specific data anomalies or chart spikes, never circle aimlessly.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-rose-600 font-bold">•</span>
                  <span><strong>Teleprompter Anchor:</strong> Glance at speaker notes for 1 second, then return eyes 100% to the room.</span>
                </li>
              </ul>
            </div>

            {/* Framework 6 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">06</span>
                <h3 className="font-bold text-slate-900 text-base">Typography & Contrast Hierarchy</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mathematical ratios for professional presentation visuals:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Headline to Body Ratio:</strong> Maintain at least 1.618 (Golden Ratio) between slide titles and bullets.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Dark vs Light Stage:</strong> Dark backgrounds (Slate-950) look sleek on large LED walls; light themes print better.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Stat Callouts:</strong> Stat numbers must be at least 3x the size of their explanatory label.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : activeVisualMode === 'infographic' ? (
        /* Full Deck Infographic Grid View (Unlimited Slides Grid) */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl text-xs text-slate-700">
            <span className="font-semibold">Showing all {deck.slides.length} slides in presentation sequence.</span>
            <span>Click any slide card to open in full interactive canvas.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {deck.slides.map((slide, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCurrentSlideIdx(idx);
                  setActiveVisualMode('canvas');
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative overflow-hidden group hover:shadow-md ${activeTheme.bgClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${activeTheme.accentBadge}`}>
                    Slide {slide.slideNumber} • {slide.layout.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSlide(idx);
                      }}
                      title="Duplicate Slide"
                      className="p-1 hover:bg-white/10 rounded text-slate-300"
                    >
                      <CopyPlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlide(idx);
                      }}
                      title="Delete Slide"
                      className="p-1 hover:bg-rose-500/20 text-rose-300 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2">{slide.headline}</h3>
                {slide.subhead && <p className="text-xs text-slate-400 line-clamp-2">{slide.subhead}</p>}
                
                {slide.statCallout && (
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                    <div className="text-xl font-black text-cyan-400">{slide.statCallout.number}</div>
                    <div className="text-[10px] text-slate-400">{slide.statCallout.label}</div>
                  </div>
                )}
                {slide.chartData && (
                  <div className="h-20 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={slide.chartData}>
                        <Bar dataKey="value" fill={activeTheme.chartColors[0]} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {slide.bullets && (
                  <div className="space-y-1 text-[11px] text-slate-400 line-clamp-3">
                    {slide.bullets.slice(0, 2).map((b, i) => (
                      <div key={i} className="flex items-start space-x-1.5">
                        <span className={activeTheme.accentText}>•</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : activeVisualMode === 'editor' ? (
        /* Visual Slide Content Editor */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span>Edit Slide {currentSlide.slideNumber} of {deck.slides.length}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">
                  {currentSlide.layout}
                </span>
              </h2>
              <p className="text-xs text-slate-500">Fine-tune slide text, layout format, metrics, and presenter notes.</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                disabled={currentSlideIdx === 0}
                onClick={() => handleMoveSlide(currentSlideIdx, 'left')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 disabled:opacity-30 cursor-pointer"
                title="Move Slide Left in Sequence"
              >
                <ArrowUp className="w-3.5 h-3.5 rotate-270" />
                <span>Move Left</span>
              </button>

              <button
                disabled={currentSlideIdx === deck.slides.length - 1}
                onClick={() => handleMoveSlide(currentSlideIdx, 'right')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 disabled:opacity-30 cursor-pointer"
                title="Move Slide Right in Sequence"
              >
                <ArrowDown className="w-3.5 h-3.5 rotate-270" />
                <span>Move Right</span>
              </button>

              <button
                onClick={() => handleDuplicateSlide(currentSlideIdx)}
                className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <CopyPlus className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={() => handleDeleteSlide(currentSlideIdx)}
                className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
              <input
                type="text"
                value={currentSlide.headline}
                onChange={(e) => {
                  const newSlides = [...deck.slides];
                  newSlides[currentSlideIdx] = { ...newSlides[currentSlideIdx], headline: e.target.value };
                  setDeck({ ...deck, slides: newSlides });
                }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subhead</label>
              <input
                type="text"
                value={currentSlide.subhead || ""}
                onChange={(e) => {
                  const newSlides = [...deck.slides];
                  newSlides[currentSlideIdx] = { ...newSlides[currentSlideIdx], subhead: e.target.value };
                  setDeck({ ...deck, slides: newSlides });
                }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Visual Layout Type</label>
              <select
                value={currentSlide.layout}
                onChange={(e) => {
                  const newSlides = [...deck.slides];
                  newSlides[currentSlideIdx] = { ...newSlides[currentSlideIdx], layout: e.target.value as SlideLayoutType };
                  setDeck({ ...deck, slides: newSlides });
                }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="title_slide">Title Slide</option>
                <option value="bullet_cards">Bullet Cards Grid</option>
                <option value="two_column_compare">Two Column Compare</option>
                <option value="metrics_highlight">Metrics Highlight</option>
                <option value="interactive_chart">Interactive Data Chart</option>
                <option value="process_diagram">Step-by-Step Flow Diagram</option>
                <option value="live_poll">Live Audience Poll</option>
                <option value="timeline_quote">Timeline & Key Takeaway</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Visual Category Badge</label>
              <input
                type="text"
                value={currentSlide.visualBadge || ""}
                onChange={(e) => {
                  const newSlides = [...deck.slides];
                  newSlides[currentSlideIdx] = { ...newSlides[currentSlideIdx], visualBadge: e.target.value };
                  setDeck({ ...deck, slides: newSlides });
                }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bullet Points (One per line)</label>
            <textarea
              rows={4}
              value={currentSlide.bullets?.join("\n") || ""}
              onChange={(e) => {
                const newSlides = [...deck.slides];
                newSlides[currentSlideIdx] = {
                  ...newSlides[currentSlideIdx],
                  bullets: e.target.value.split("\n").filter((b) => b.trim().length > 0),
                };
                setDeck({ ...deck, slides: newSlides });
              }}
              className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-900 font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Executive Speaker Notes (Teleprompter)</label>
            <textarea
              rows={3}
              value={currentSlide.speakerNotes}
              onChange={(e) => {
                const newSlides = [...deck.slides];
                newSlides[currentSlideIdx] = { ...newSlides[currentSlideIdx], speakerNotes: e.target.value };
                setDeck({ ...deck, slides: newSlides });
              }}
              className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      ) : activeVisualMode === 'chart_tuner' ? (
        /* Live Chart Tuner & Metrics Simulator */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>Interactive Chart & Metric Tuner</span>
              </h2>
              <p className="text-xs text-slate-500">
                Adjust values in real-time to simulate performance metrics directly on slide {currentSlide.slideNumber} of {deck.slides.length}.
              </p>
            </div>

            {/* Chart type switcher */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => handleSwitchChartType('bar')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  currentSlide.chartType === 'bar' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Bar</span>
              </button>
              <button
                onClick={() => handleSwitchChartType('area')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  currentSlide.chartType === 'area' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
                <span>Area</span>
              </button>
              <button
                onClick={() => handleSwitchChartType('line')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  currentSlide.chartType === 'line' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Line</span>
              </button>
              <button
                onClick={() => handleSwitchChartType('pie')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  currentSlide.chartType === 'pie' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                <PieChartIcon className="w-3.5 h-3.5" />
                <span>Pie</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Chart Preview (7 cols) */}
            <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-white flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-bold text-indigo-400 uppercase tracking-wider">Live Chart Canvas</span>
                <span className="text-slate-400 font-mono">{currentSlide.headline}</span>
              </div>

              <div className="h-64 w-full py-4">
                {currentSlide.chartData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {currentSlide.chartType === 'area' ? (
                      <AreaChart data={currentSlide.chartData}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={activeTheme.chartColors[0]} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={activeTheme.chartColors[0]} stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="value" stroke={activeTheme.chartColors[0]} fillOpacity={1} fill="url(#areaGrad)" />
                        {currentSlide.chartData[0]?.target !== undefined && (
                          <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} />
                        )}
                      </AreaChart>
                    ) : currentSlide.chartType === 'line' ? (
                      <LineChart data={currentSlide.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="value" stroke={activeTheme.chartColors[0]} strokeWidth={3} dot={{ r: 5 }} />
                        {currentSlide.chartData[0]?.target !== undefined && (
                          <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} />
                        )}
                      </LineChart>
                    ) : currentSlide.chartType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={currentSlide.chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {currentSlide.chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={activeTheme.chartColors[index % activeTheme.chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      </PieChart>
                    ) : (
                      <BarChart data={currentSlide.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                        <Bar dataKey="value" fill={activeTheme.chartColors[0]} radius={[6, 6, 0, 0]} />
                        {currentSlide.chartData[0]?.target !== undefined && (
                          <Bar dataKey="target" fill="#64748b" radius={[6, 6, 0, 0]} />
                        )}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                    No chart dataset for this slide. Switch layout to "Interactive Data Chart".
                  </div>
                )}
              </div>

              <div className="text-center text-xs text-slate-400">
                Data updates dynamically bind to slide presentation in real-time.
              </div>
            </div>

            {/* Metric Sliders & Points (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Live Data Points ({currentSlide.chartData?.length || 0})
              </h3>

              {currentSlide.chartData && currentSlide.chartData.length > 0 ? (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {currentSlide.chartData.map((point, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{point.name}</span>
                        <span className="text-indigo-600 font-mono">{point.value}</span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-medium flex justify-between">
                          <span>Value</span>
                          <span>{point.value}</span>
                        </label>
                        <input
                          type="range"
                          min={10}
                          max={1500}
                          value={point.value}
                          onChange={(e) => handleUpdateChartPoint(idx, 'value', Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                  <p className="text-xs text-slate-500">This slide does not currently contain chart data.</p>
                  <button
                    onClick={() => {
                      const newSlides = [...deck.slides];
                      newSlides[currentSlideIdx] = {
                        ...newSlides[currentSlideIdx],
                        layout: 'interactive_chart',
                        chartType: 'area',
                        chartData: [
                          { name: "Phase 1", value: 120, target: 80 },
                          { name: "Phase 2", value: 260, target: 150 },
                          { name: "Phase 3", value: 430, target: 210 },
                          { name: "Phase 4", value: 720, target: 300 },
                        ],
                      };
                      setDeck({ ...deck, slides: newSlides });
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Initialize Dataset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Interactive Slide Canvas Mode */
        <div className="space-y-4">
          {/* Slide Navigator & Thumbnail Strip (Supports Unlimited Slides) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center space-x-2 text-xs text-slate-300 font-semibold">
                <span>Slide Strip ({deck.slides.length} Total Slides)</span>
                <span className="text-slate-500">•</span>
                <span className="text-indigo-400 font-mono">Viewing #{currentSlideIdx + 1}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs">
                <button
                  onClick={() => advanceSlide(-1)}
                  disabled={currentSlideIdx === 0}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium disabled:opacity-30 cursor-pointer"
                >
                  Prev
                </button>
                <span className="font-mono text-slate-400 px-1">
                  {currentSlideIdx + 1} / {deck.slides.length}
                </span>
                <button
                  onClick={() => advanceSlide(1)}
                  disabled={currentSlideIdx === deck.slides.length - 1}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium disabled:opacity-30 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Thumbnail Scroll Area */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
              {deck.slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentSlideIdx(idx);
                    if (soundEnabled) playSlideChime();
                  }}
                  className={`shrink-0 w-36 h-20 p-2 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    currentSlideIdx === idx
                      ? 'border-indigo-500 bg-slate-800 ring-2 ring-indigo-500/40 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] w-full">
                    <span className="font-bold text-indigo-400">#{s.slideNumber}</span>
                    <span className="truncate max-w-[65px] text-slate-500 text-[9px] uppercase font-mono">
                      {s.layout.split('_')[0]}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-white truncate w-full">
                    {s.headline}
                  </div>
                </button>
              ))}

              {/* Quick Inline Add Slide Button */}
              <button
                onClick={handleAddSlide}
                className="shrink-0 w-24 h-20 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/40 hover:bg-slate-800 text-slate-400 hover:text-white flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer"
                title="Add New Slide"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-bold">Add Slide</span>
              </button>
            </div>
          </div>

          {/* Document Ingestion & Analysis Indicator Banner */}
          {deck.sourceDocumentName && (
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 border border-indigo-500/30 rounded-2xl p-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2.5">
                <span className="p-1.5 rounded-lg bg-indigo-600/40 text-cyan-300">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-bold text-white">Source Document: {deck.sourceDocumentName}</span>
                  {deck.pdfAnalysisSummary && (
                    <p className="text-slate-300 text-[11px] line-clamp-1">{deck.pdfAnalysisSummary}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowPdfModal(true)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-cyan-300 rounded-lg font-bold text-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
              >
                Ingest Another PDF
              </button>
            </div>
          )}

          {/* Active Interactive Slide Canvas Screen (16:9 Aspect Ratio) */}
          <div
            id="slide-canvas-main"
            className={`w-full rounded-3xl p-6 sm:p-8 border transition-all relative overflow-hidden shadow-xl min-h-[500px] flex flex-col justify-between ${activeTheme.bgClass}`}
          >
            {/* Background Glow & Optional Background Image */}
            {currentSlide.imageUrl && currentSlide.imagePlacement === 'background' ? (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
                style={{ backgroundImage: `url(${currentSlide.imageUrl})` }}
              ></div>
            ) : (
              <div className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none ${activeTheme.glowColor}`}></div>
            )}

            {/* Slide Header Banner & Quick Interactive Controls */}
            <div className="relative z-10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${activeTheme.accentBadge}`}>
                    {currentSlide.visualBadge || `Slide ${currentSlide.slideNumber}`}
                  </span>
                  <span className="text-xs opacity-60 font-mono">
                    {currentSlide.layout.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                {/* Quick Slide Actions: Add Image & Switch Layout */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer border border-white/10 text-white"
                    title="Add or edit slide image / visual media"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{currentSlide.imageUrl ? "Edit Visual" : "Add Image"}</span>
                  </button>

                  <select
                    value={currentSlide.layout}
                    onChange={(e) => {
                      const newSlides = [...deck.slides];
                      newSlides[currentSlideIdx] = {
                        ...newSlides[currentSlideIdx],
                        layout: e.target.value as SlideLayoutType,
                      };
                      setDeck({ ...deck, slides: newSlides });
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer focus:outline-none"
                  >
                    <option value="bullet_cards">Layout: Bullet Cards</option>
                    <option value="image_split">Layout: Side Image Split</option>
                    <option value="image_showcase">Layout: Hero Visual Banner</option>
                    <option value="interactive_chart">Layout: Recharts Metric</option>
                    <option value="process_diagram">Layout: Process Pipeline</option>
                    <option value="two_column_compare">Layout: Before vs After</option>
                    <option value="live_poll">Layout: Live Audience Poll</option>
                    <option value="metrics_highlight">Layout: KPI Metric Highlight</option>
                    <option value="title_slide">Layout: Executive Hook</option>
                  </select>

                  <span className="text-xs opacity-50 font-mono pl-1">
                    {currentSlide.slideNumber} / {deck.slides.length}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {currentSlide.headline}
              </h2>
              {currentSlide.subhead && (
                <p className="text-sm sm:text-base opacity-75 font-normal max-w-4xl">
                  {currentSlide.subhead}
                </p>
              )}
            </div>

            {/* Slide Layout Body Rendering */}
            <div className="relative z-10 my-6 flex-1 flex flex-col justify-center">
              {/* Image Split / Showcase Layout */}
              {(currentSlide.layout === 'image_split' || (currentSlide.imageUrl && (currentSlide.imagePlacement === 'split' || currentSlide.imagePlacement === 'right' || currentSlide.imagePlacement === 'left'))) ? (
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-center ${currentSlide.imagePlacement === 'left' ? 'lg:flex-row-reverse' : ''}`}>
                  <div className="lg:col-span-7 space-y-4">
                    {currentSlide.statCallout && (
                      <div className={`p-4 rounded-2xl border flex items-center space-x-4 ${activeTheme.cardBgClass}`}>
                        <div className="text-3xl font-black text-cyan-400">{currentSlide.statCallout.number}</div>
                        <div className="text-xs opacity-80">{currentSlide.statCallout.label}</div>
                      </div>
                    )}
                    <div className="space-y-2.5">
                      {currentSlide.bullets?.map((b, i) => (
                        <div key={i} className="flex items-start space-x-3 text-xs sm:text-sm opacity-90 leading-relaxed">
                          <span className={`${activeTheme.accentText} font-bold text-base mt-0.5`}>•</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image Container with Zoom & Caption */}
                  <div className="lg:col-span-5 relative group">
                    <div className="rounded-2xl overflow-hidden border border-white/20 shadow-lg relative bg-slate-950">
                      <img
                        src={currentSlide.imageUrl || "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80"}
                        alt={currentSlide.headline}
                        referrerPolicy="no-referrer"
                        className="w-full h-56 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {currentSlide.imageCaption && (
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xs p-2.5 text-[11px] text-slate-300 border-t border-white/10">
                          {currentSlide.imageCaption}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : currentSlide.layout === 'image_showcase' || (currentSlide.imageUrl && currentSlide.imagePlacement === 'hero') ? (
                <div className="space-y-4">
                  {currentSlide.imageUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-lg max-h-52 w-full bg-slate-950">
                      <img
                        src={currentSlide.imageUrl}
                        alt={currentSlide.headline}
                        referrerPolicy="no-referrer"
                        className="w-full h-44 sm:h-52 object-cover"
                      />
                      {currentSlide.imageCaption && (
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 text-xs text-slate-300">
                          {currentSlide.imageCaption}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentSlide.bullets?.map((b, i) => (
                      <div key={i} className={`p-3.5 rounded-xl border text-xs sm:text-sm ${activeTheme.cardBgClass}`}>
                        <span className={activeTheme.accentText}>• </span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : currentSlide.layout === 'title_slide' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                  <div className="sm:col-span-2 space-y-4">
                    {currentSlide.bullets?.map((bullet, i) => (
                      <div key={i} className="flex items-start space-x-3 text-sm sm:text-base opacity-90">
                        <span className={`${activeTheme.accentText} font-bold text-lg`}>•</span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                  {currentSlide.statCallout && (
                    <div className={`p-6 rounded-2xl border text-center space-y-1 ${activeTheme.cardBgClass}`}>
                      <div className="text-4xl sm:text-5xl font-black text-cyan-400">{currentSlide.statCallout.number}</div>
                      <div className="text-xs opacity-75">{currentSlide.statCallout.label}</div>
                    </div>
                  )}
                </div>
              ) : currentSlide.layout === 'two_column_compare' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-900/40 space-y-3">
                    <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                      <span>{currentSlide.leftColumnTitle || "Traditional Manual Method"}</span>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                      {currentSlide.leftColumnItems?.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-rose-400">✕</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-900/40 space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                      <span>{currentSlide.rightColumnTitle || "Autonomous AI Acceleration"}</span>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                      {currentSlide.rightColumnItems?.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-emerald-400">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : currentSlide.layout === 'interactive_chart' && currentSlide.chartData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div className="lg:col-span-2 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {currentSlide.chartType === 'area' ? (
                        <AreaChart data={currentSlide.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="name" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="value" stroke={activeTheme.chartColors[0]} fill={activeTheme.chartColors[0]} fillOpacity={0.4} />
                        </AreaChart>
                      ) : (
                        <BarChart data={currentSlide.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="name" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                          <Bar dataKey="value" fill={activeTheme.chartColors[0]} radius={[6, 6, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {currentSlide.statCallout && (
                      <div className={`p-4 rounded-xl border text-center ${activeTheme.cardBgClass}`}>
                        <div className="text-3xl font-black text-cyan-400">{currentSlide.statCallout.number}</div>
                        <div className="text-xs opacity-75">{currentSlide.statCallout.label}</div>
                      </div>
                    )}
                    {currentSlide.bullets?.map((b, i) => (
                      <div key={i} className="text-xs opacity-85 flex items-start space-x-2">
                        <span className={activeTheme.accentText}>•</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : currentSlide.layout === 'process_diagram' && currentSlide.processSteps ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentSlide.processSteps.map((step, i) => (
                    <div key={i} className={`p-4 rounded-2xl border space-y-2 relative overflow-hidden ${activeTheme.cardBgClass}`}>
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          {step.step}
                        </span>
                        {step.tag && <span className="text-[10px] uppercase font-mono opacity-60">{step.tag}</span>}
                      </div>
                      <h4 className="font-bold text-sm">{step.title}</h4>
                      <p className="text-xs opacity-75 leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              ) : currentSlide.layout === 'live_poll' && currentSlide.pollData ? (
                <div className="max-w-2xl mx-auto w-full space-y-3">
                  <div className="text-center font-bold text-sm sm:text-base mb-2">
                    {currentSlide.pollData.question}
                  </div>
                  {currentSlide.pollData.options.map((opt) => {
                    const totalVotes = currentSlide.pollData?.options.reduce((acc, o) => acc + o.votes, 0) || 1;
                    const pct = Math.round((opt.votes / totalVotes) * 100);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleVote(opt.id)}
                        className={`p-3.5 rounded-xl border relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${activeTheme.cardBgClass}`}
                      >
                        <div
                          className="absolute top-0 bottom-0 left-0 bg-indigo-600/30 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                        <div className="flex items-center justify-between relative z-10 text-xs sm:text-sm font-semibold">
                          <span className="flex items-center space-x-2">
                            <span>{opt.label}</span>
                            {votedOptionId === opt.id && <span className="text-emerald-400 text-xs font-bold">(Voted)</span>}
                          </span>
                          <span className="font-mono text-indigo-300 font-bold">{pct}% ({opt.votes})</span>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-center text-[10px] opacity-60">Click any option to simulate live audience voting</p>
                </div>
              ) : currentSlide.layout === 'metrics_highlight' && currentSlide.statCallout ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-500/40 text-center space-y-2">
                    <div className="text-5xl font-black text-cyan-300">{currentSlide.statCallout.number}</div>
                    <div className="text-xs text-indigo-200 font-semibold">{currentSlide.statCallout.label}</div>
                  </div>
                  <div className="sm:col-span-2 space-y-3">
                    {currentSlide.bullets?.map((b, i) => (
                      <div key={i} className="text-sm opacity-90 flex items-start space-x-3">
                        <span className={`${activeTheme.accentText} font-bold text-lg`}>•</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Default Bullet Cards Layout */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentSlide.bullets?.map((b, i) => (
                    <div key={i} className={`p-4 rounded-2xl border space-y-1.5 ${activeTheme.cardBgClass}`}>
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs">
                          {i + 1}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Pillar</span>
                      </div>
                      <p className="text-xs sm:text-sm opacity-90 leading-relaxed">{b}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slide Footer */}
            <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-xs opacity-60">
              <span>{deck.deckTitle}</span>
              <div className="flex items-center space-x-4">
                <span>Presenter Mode Active</span>
                <span className="font-mono">{selectedThemeId.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Speaker Notes / Teleprompter Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400">
                <Mic className="w-4 h-4" />
                <span>Executive Speaker Teleprompter (Slide {currentSlide.slideNumber})</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentSlide.speakerNotes ? `${currentSlide.speakerNotes.split(' ').length} words (~${Math.round(currentSlide.speakerNotes.split(' ').length / 2.5)}s speech)` : 'No notes'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic bg-slate-950 p-3 rounded-xl border border-slate-800">
              "{currentSlide.speakerNotes || "Good morning everyone. This slide outlines our strategic objectives and implementation milestones."}"
            </p>
          </div>
        </div>
      )}

      {/* Full-Screen Presentation Stage Overlay */}
      {isPresenting && (
        <div
          ref={presenterContainerRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none"
        >
          {/* Laser Pointer Dot */}
          {laserMode && laserPos && (
            <div
              className="fixed pointer-events-none z-50 w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e] -translate-x-1/2 -translate-y-1/2"
              style={{ left: laserPos.x, top: laserPos.y }}
            ></div>
          )}

          {/* Annotation Drawing Canvas */}
          <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            className="fixed inset-0 pointer-events-auto z-40"
          />

          {/* Presenter Top Bar */}
          <div className="relative z-50 flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-indigo-400 text-sm">{deck.deckTitle}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Slide {currentSlideIdx + 1} / {deck.slides.length}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Timer */}
              <div className="flex items-center space-x-1 font-mono text-xs bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>

              {/* Laser Toggle */}
              <button
                onClick={() => setLaserMode((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer ${
                  laserMode ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span>Laser (L)</span>
              </button>

              {/* Draw Toggle */}
              <button
                onClick={() => setDrawingMode((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer ${
                  drawingMode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Draw</span>
              </button>

              {drawingMode && (
                <button
                  onClick={clearCanvas}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs cursor-pointer"
                >
                  Clear
                </button>
              )}

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Exit Presentation */}
              <button
                onClick={() => {
                  setIsPresenting(false);
                  setIsTimerRunning(false);
                }}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Exit Stage (Esc)
              </button>
            </div>
          </div>

          {/* Full-Screen Presenter Stage Body */}
          <div className="relative z-50 flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full py-8">
            <div className="space-y-3 text-center mb-8">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
                {currentSlide.visualBadge || `Slide ${currentSlide.slideNumber}`}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{currentSlide.headline}</h1>
              {currentSlide.subhead && <p className="text-lg text-slate-300 max-w-3xl mx-auto">{currentSlide.subhead}</p>}
            </div>

            {/* Layout rendering inside stage */}
            <div className="w-full">
              {currentSlide.layout === "two_column_compare" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
                  <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-900 space-y-4">
                    <h3 className="font-bold text-rose-400 text-lg">{currentSlide.leftColumnTitle}</h3>
                    <ul className="space-y-2 text-slate-200">
                      {currentSlide.leftColumnItems?.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-rose-400">✕</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-900 space-y-4">
                    <h3 className="font-bold text-emerald-400 text-lg">{currentSlide.rightColumnTitle}</h3>
                    <ul className="space-y-2 text-slate-200">
                      {currentSlide.rightColumnItems?.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-emerald-400">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : currentSlide.layout === "interactive_chart" && currentSlide.chartData ? (
                <div className="h-80 w-full max-w-4xl mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentSlide.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : currentSlide.layout === "process_diagram" && currentSlide.processSteps ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {currentSlide.processSteps.map((step, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-left">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {step.step}
                      </div>
                      <h4 className="font-bold text-sm text-white">{step.title}</h4>
                      <p className="text-xs text-slate-300">{step.description}</p>
                    </div>
                  ))}
                </div>
              ) : currentSlide.layout === "live_poll" && currentSlide.pollData ? (
                <div className="max-w-2xl mx-auto space-y-3">
                  {currentSlide.pollData.options.map((opt) => {
                    const totalVotes = currentSlide.pollData?.options.reduce((acc, o) => acc + o.votes, 0) || 1;
                    const pct = Math.round((opt.votes / totalVotes) * 100);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleVote(opt.id)}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left relative overflow-hidden cursor-pointer hover:border-indigo-500 transition-colors"
                      >
                        <div className="absolute top-0 bottom-0 left-0 bg-indigo-600/30" style={{ width: `${pct}%` }}></div>
                        <div className="flex items-center justify-between relative z-10 text-sm font-semibold">
                          <span>{opt.label}</span>
                          <span className="font-mono text-indigo-300 font-bold">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : currentSlide.layout === "metrics_highlight" && currentSlide.statCallout ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-center pt-4">
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-500/40 text-center space-y-2">
                    <div className="text-6xl font-black text-cyan-300">{currentSlide.statCallout.number}</div>
                    <div className="text-sm text-indigo-200 font-semibold">{currentSlide.statCallout.label}</div>
                  </div>
                  <div className="sm:col-span-2 space-y-3 text-left">
                    {currentSlide.bullets?.map((b, i) => (
                      <div key={i} className="text-base text-slate-200 flex items-start space-x-3">
                        <span className="text-indigo-400 font-bold text-lg">•</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl mx-auto pt-4 text-left">
                  {currentSlide.bullets?.map((b, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-base text-slate-200 flex items-start space-x-4"
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="leading-relaxed">{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Presenter Controls */}
          <div className="relative z-50 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
            <span>Arrow keys / Spacebar to navigate • Press L for Laser • Esc to exit</span>
            <div className="flex items-center space-x-3">
              <button
                disabled={currentSlideIdx === 0}
                onClick={() => advanceSlide(-1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentSlideIdx === deck.slides.length - 1}
                onClick={() => advanceSlide(1)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold disabled:opacity-30 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF / Document Ingestion & Slide Generator Modal */}
      <PdfToSlidesModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        onDeckGenerated={(newDeck) => {
          setDeck(newDeck);
          setCurrentSlideIdx(0);
          confetti({ particleCount: 50 });
        }}
      />

      {/* Slide Image & Media Customizer Modal */}
      <SlideImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        slide={currentSlide}
        onUpdateSlide={(updated) => {
          const newSlides = [...deck.slides];
          newSlides[currentSlideIdx] = {
            ...newSlides[currentSlideIdx],
            ...updated,
          };
          setDeck({ ...deck, slides: newSlides });
        }}
      />

      {/* Offscreen Multi-Slide PDF Capture Container */}
      <div id="all-slides-pdf-container" className="fixed left-[-9999px] top-0 pointer-events-none opacity-0">
        {deck.slides.map((s, idx) => (
          <div
            key={idx}
            className={`pdf-slide-page w-[1280px] h-[720px] p-12 flex flex-col justify-between relative overflow-hidden ${activeTheme.bgClass}`}
            style={{ boxSizing: 'border-box' }}
          >
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${activeTheme.accentBadge}`}>
                  {s.visualBadge || `Slide ${s.slideNumber}`}
                </span>
                <span className="text-sm opacity-60 font-mono">
                  Slide {s.slideNumber} of {deck.slides.length}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">{s.headline}</h1>
              {s.subhead && <p className="text-base opacity-75 max-w-4xl">{s.subhead}</p>}
            </div>

            {/* Body */}
            <div className="my-auto flex-1 flex flex-col justify-center">
              {s.imageUrl && (s.layout === 'image_split' || s.imagePlacement === 'split' || s.imagePlacement === 'right' || s.imagePlacement === 'left') ? (
                <div className="grid grid-cols-12 gap-8 items-center">
                  <div className="col-span-7 space-y-4">
                    {s.bullets?.map((b, i) => (
                      <div key={i} className="flex items-start space-x-3 text-base opacity-90">
                        <span className={`${activeTheme.accentText} font-bold text-lg`}>•</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                  <div className="col-span-5 rounded-2xl overflow-hidden border border-white/20">
                    <img src={s.imageUrl} alt={s.headline} className="w-full h-64 object-cover" />
                    {s.imageCaption && (
                      <div className="p-2 text-xs bg-black/60 text-white">{s.imageCaption}</div>
                    )}
                  </div>
                </div>
              ) : s.imageUrl && (s.layout === 'image_showcase' || s.imagePlacement === 'hero') ? (
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-white/20 max-h-56">
                    <img src={s.imageUrl} alt={s.headline} className="w-full h-56 object-cover" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {s.bullets?.map((b, i) => (
                      <div key={i} className={`p-4 rounded-xl border text-sm ${activeTheme.cardBgClass}`}>
                        <span className={activeTheme.accentText}>• </span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : s.layout === 'two_column_compare' ? (
                <div className="grid grid-cols-2 gap-8">
                  <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-900 space-y-3">
                    <h3 className="font-bold text-rose-400 text-base">{s.leftColumnTitle || 'Before'}</h3>
                    <ul className="space-y-2 text-sm text-slate-200">
                      {s.leftColumnItems?.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-rose-400">✕</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-900 space-y-3">
                    <h3 className="font-bold text-emerald-400 text-base">{s.rightColumnTitle || 'After'}</h3>
                    <ul className="space-y-2 text-sm text-slate-200">
                      {s.rightColumnItems?.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-emerald-400">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : s.statCallout ? (
                <div className="grid grid-cols-3 gap-8 items-center">
                  <div className="p-8 rounded-3xl bg-indigo-900/60 border border-indigo-500/40 text-center space-y-2">
                    <div className="text-5xl font-black text-cyan-300">{s.statCallout.number}</div>
                    <div className="text-sm text-indigo-200">{s.statCallout.label}</div>
                  </div>
                  <div className="col-span-2 space-y-3">
                    {s.bullets?.map((b, i) => (
                      <div key={i} className="text-base opacity-90 flex items-start space-x-3">
                        <span className={`${activeTheme.accentText} font-bold text-lg`}>•</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {s.bullets?.map((b, i) => (
                    <div key={i} className={`p-6 rounded-2xl border space-y-2 ${activeTheme.cardBgClass}`}>
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                          {i + 1}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Pillar</span>
                      </div>
                      <p className="text-base opacity-90 leading-relaxed">{b}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs opacity-60">
              <span>{deck.deckTitle}</span>
              <span>Generated with AI Interactive Visuals</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
