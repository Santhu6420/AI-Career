import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ExternalLink, 
  Award, 
  RefreshCw, 
  CheckSquare, 
  Square, 
  Copy, 
  Check, 
  Download,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RoadmapData, RoadmapPhase, RoadmapTopic } from '../types';
import { AdvancedExplainerModal } from './AdvancedExplainerModal';
import { Zap } from 'lucide-react';

const defaultRoadmap: RoadmapData = {
  title: "Modern AI & Full Stack Engineering Master Roadmap",
  overview: "A comprehensive, step-by-step curriculum engineered to take you from fundamentals to production-grade proficiency. Master the modern TypeScript ecosystem, cloud services, and real-time Gemini AI integration.",
  targetRole: "Full Stack & AI Systems Engineer",
  estimatedTotalWeeks: 24,
  prerequisites: ["Basic JavaScript/TypeScript syntax", "Command-line terminal comfort", "Problem solving mindset"],
  phases: [
    {
      phaseNumber: 1,
      title: "Phase 1: Foundations, Modern TypeScript & Core CS",
      description: "Master advanced TypeScript type systems, asynchronous event loops, data structures, and Git branching workflows.",
      estimatedWeeks: "Weeks 1-4 (4 Weeks)",
      badgeColor: "emerald",
      topics: [
        {
          name: "Modern TypeScript & Advanced Type Gymnastics",
          difficulty: "Beginner",
          summary: "Master generics, union types, template literals, conditional types, and strict null safety.",
          keyConcepts: ["Generics & Type Inference", "Discriminated Unions", "Async/Await Event Loop", "Zod Validation"],
          practicalTasks: [
            "Build a type-safe API client utility with runtime Zod schema validation",
            "Implement custom asynchronous retry utilities with exponential backoff",
          ],
          resources: [
            { title: "TypeScript Handbook (Official)", url: "https://www.typescriptlang.org/docs/", type: "Documentation" },
            { title: "Execute Program: TypeScript Exercises", url: "https://www.executeprogram.com/", type: "Interactive" },
          ],
        },
        {
          name: "Git Workflows & Team Collaboration Standards",
          difficulty: "Beginner",
          summary: "Master interactive rebasing, branch protection, conventional commits, and automated pull-request CI pipelines.",
          keyConcepts: ["Git Rebase vs Merge", "Conventional Commits", "Automated Linting Hooks (Husky)", "PR Review Standards"],
          practicalTasks: [
            "Set up a GitHub repo with branch rules, GitHub Actions CI, and commit validation",
          ],
          resources: [
            { title: "Pro Git Free Handbook", url: "https://git-scm.com/book/en/v2", type: "Book" },
          ],
        },
      ],
      milestoneProject: {
        title: "Milestone 1: Production-Ready CLI Task Utility",
        description: "Build a modular CLI developer tool published to npm with automated tests, semantic versioning, and documentation.",
        deliverables: ["Tested CLI package with tsx", "README with usage GIFs", "Automated GitHub Actions CI passing"],
      },
    },
    {
      phaseNumber: 2,
      title: "Phase 2: React 19, Modern State Machines & UI Systems",
      description: "Build fast, accessible interfaces with Tailwind CSS, optimistic UI updates, and server state caching.",
      estimatedWeeks: "Weeks 5-10 (6 Weeks)",
      badgeColor: "blue",
      topics: [
        {
          name: "Component Architecture & Performance",
          difficulty: "Intermediate",
          summary: "Construct accessible component hierarchies, memoization boundaries, and design systems.",
          keyConcepts: ["React 19 Hooks", "Render Profiling & Memoization", "WCAG 2.1 AA Accessibility", "Tailwind Design Tokens"],
          practicalTasks: [
            "Create a reusable Design System component library with tokens",
            "Build an accessible virtualized data table rendering 10,000 items smoothly",
          ],
          resources: [
            { title: "React Official Docs (Beta)", url: "https://react.dev", type: "Documentation" },
          ],
        },
        {
          name: "Server State & Real-Time Sync",
          difficulty: "Intermediate",
          summary: "Master client-side caching, optimistic updates, stale-while-revalidate, and WebSockets.",
          keyConcepts: ["TanStack Query", "Client State Stores (Zustand)", "Cache Invalidation", "WebSocket Reconnection"],
          practicalTasks: [
            "Implement a real-time notification stream with offline buffering and auto-reconnect",
          ],
          resources: [
            { title: "TanStack Query Guides", url: "https://tanstack.com/query", type: "Tutorial" },
          ],
        },
      ],
      milestoneProject: {
        title: "Milestone 2: Real-Time Collaborative Workspace",
        description: "Develop a multi-board Kanban application with drag-and-drop, optimistic UI updates, and instant filtering.",
        deliverables: ["Live deployed application", "Interactive board with sub-tasks", "Lighthouse 95+ performance score"],
      },
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Resilient Backend APIs, Databases & Security",
      description: "Engineer Express/Node microservices, PostgreSQL star-schemas, ACID transactions, and token security.",
      estimatedWeeks: "Weeks 11-16 (6 Weeks)",
      badgeColor: "indigo",
      topics: [
        {
          name: "Secure API Design & Architecture",
          difficulty: "Intermediate",
          summary: "Build authenticated endpoints with JWT rotation, rate limiting, and OpenAPI specifications.",
          keyConcepts: ["JWT & Session Auth", "CORS & CSP Headers", "Rate Limiting & Redis", "OpenAPI / Swagger"],
          practicalTasks: [
            "Create a multi-tenant authentication service with refresh token rotation and bcrypt hashing",
          ],
          resources: [
            { title: "OWASP API Security Top 10", url: "https://owasp.org", type: "Guide" },
          ],
        },
        {
          name: "Database Modeling & Query Optimization",
          difficulty: "Advanced",
          summary: "Star-schema modeling, indexing strategies, migrations, and transactions under concurrent load.",
          keyConcepts: ["B-Tree & GIN Indexes", "ACID Transactions", "Connection Pooling", "EXPLAIN ANALYZE"],
          practicalTasks: [
            "Benchmark and optimize slow SQL queries from 1.2s to 18ms using indexed lookups",
          ],
          resources: [
            { title: "Use The Index, Luke (SQL Guide)", url: "https://use-the-index-luke.com", type: "Reference" },
          ],
        },
      ],
      milestoneProject: {
        title: "Milestone 3: High-Scale Inventory & Order Engine",
        description: "Build an ACID-compliant inventory reservation and payment processing backend handling concurrent checkouts.",
        deliverables: ["Microservices architecture", "PostgreSQL database migrations", "Docker Compose setup"],
      },
    },
    {
      phaseNumber: 4,
      title: "Phase 4: Generative AI, Cloud DevOps & Production Scale",
      description: "Incorporate Gemini 3.7 Flash SDK, structured JSON output schemas, Docker deployments, and telemetry.",
      estimatedWeeks: "Weeks 17-24 (8 Weeks)",
      badgeColor: "purple",
      topics: [
        {
          name: "Generative AI Integration (@google/genai)",
          difficulty: "Advanced",
          summary: "Master structured JSON responses, system prompts, grounding, and streaming token pipelines.",
          keyConcepts: ["Gemini 3.7 Flash SDK", "Strict responseSchema", "Prompt Persona Engineering", "Fallback Handling"],
          practicalTasks: [
            "Build an AI-powered automated code reviewer with structured feedback and security scoring",
          ],
          resources: [
            { title: "Google Gen AI SDK Docs", url: "https://ai.google.dev", type: "Documentation" },
          ],
        },
        {
          name: "Cloud Deployment & Production Telemetry",
          difficulty: "Advanced",
          summary: "Multi-stage Docker builds, Google Cloud Run deployment, zero-downtime releases, and observability.",
          keyConcepts: ["Docker Multi-Stage", "Cloud Run Containers", "Secrets Management", "Structured Logging"],
          practicalTasks: [
            "Deploy containerized full-stack service to Cloud Run with automatic scaling and health monitoring",
          ],
          resources: [
            { title: "Google Cloud Run Documentation", url: "https://cloud.google.com/run/docs", type: "Documentation" },
          ],
        },
      ],
      milestoneProject: {
        title: "Milestone 4: Capstone SaaS AI Platform",
        description: "A complete, production-grade SaaS product featuring user auth, Gemini AI capabilities, and telemetry.",
        deliverables: ["Production web app", "Architecture diagram & technical case study", "100% CI/CD automated deployment"],
      },
    },
  ],
};

export const RoadmapGenerator: React.FC = () => {
  const [roadmap, setRoadmap] = useState<RoadmapData>(defaultRoadmap);
  const [topic, setTopic] = useState("Modern AI & Full Stack Engineering");
  const [experienceLevel, setExperienceLevel] = useState("Beginner to Advanced");
  const [timeframe, setTimeframe] = useState("6 Months");
  const [focusGoal, setFocusGoal] = useState("Become job-ready with production-grade portfolio projects");
  const [isLoading, setIsLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    "0-0-0": true,
    "0-0-1": true,
    "0-1-0": true,
  });
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'learning_vault'>('timeline');
  const [explainerTopic, setExplainerTopic] = useState<string>('');
  const [explainerContext, setExplainerContext] = useState<string>('');
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);

  const openAdvancedExplainer = (topic: string, context?: string) => {
    setExplainerTopic(topic);
    setExplainerContext(context || '');
    setIsExplainerOpen(true);
  };

  // Preset topics
  const presets = [
    { title: "AI & LLM Engineer", topic: "Generative AI, Gemini SDK, Python, FastAPI & Vector DBs" },
    { title: "Full Stack Web Dev", topic: "React 19, TypeScript, Node.js, PostgreSQL & Tailwind" },
    { title: "Power BI & Data Analyst", topic: "Power BI, DAX, Power Query M-Code, SQL & Star Schema" },
    { title: "Cloud & DevOps Architect", topic: "Docker, Kubernetes, GCP Cloud Run, Terraform & CI/CD" },
  ];

  const handleGenerateRoadmap = async (customTopic?: string) => {
    const targetTopic = customTopic || topic;
    setIsLoading(true);
    try {
      const res = await fetch("/api/tools/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: targetTopic,
          experienceLevel,
          timeframe,
          focusGoal,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRoadmap(data.data);
        setCompletedTasks({});
      }
    } catch (err) {
      console.error("Roadmap API error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    const updated = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    setCompletedTasks(updated);

    // Calculate if completed all
    let totalTasks = 0;
    let completedCount = 0;
    roadmap.phases.forEach((p, pIdx) => {
      p.topics.forEach((t, tIdx) => {
        t.practicalTasks.forEach((_, kIdx) => {
          totalTasks++;
          const id = `${pIdx}-${tIdx}-${kIdx}`;
          if (updated[id]) completedCount++;
        });
      });
    });

    if (totalTasks > 0 && completedCount === totalTasks) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Calculate overall progress
  let totalTasks = 0;
  let completedCount = 0;
  roadmap.phases.forEach((p, pIdx) => {
    p.topics.forEach((t, tIdx) => {
      t.practicalTasks.forEach((_, kIdx) => {
        totalTasks++;
        const id = `${pIdx}-${tIdx}-${kIdx}`;
        if (completedTasks[id]) completedCount++;
      });
    });
  });

  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const handleCopyMarkdown = () => {
    let md = `# ${roadmap.title}\n\n**Target Role:** ${roadmap.targetRole}\n**Estimated Time:** ${roadmap.estimatedTotalWeeks} Weeks\n\n${roadmap.overview}\n\n`;
    roadmap.phases.forEach((phase) => {
      md += `## ${phase.title} (${phase.estimatedWeeks})\n${phase.description}\n\n`;
      phase.topics.forEach((topic) => {
        md += `### ${topic.name} [${topic.difficulty}]\n${topic.summary}\n\n**Practical Tasks:**\n`;
        topic.practicalTasks.forEach((task) => {
          md += `- [ ] ${task}\n`;
        });
        md += `\n`;
      });
      md += `**Milestone Capstone:** ${phase.milestoneProject.title}\n${phase.milestoneProject.description}\n\n---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Interactive Roadmap Generator
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Personalized, milestone-driven technical and career learning pathways with interactive task check-offs.
          </p>
        </div>

        {/* Progress & Action */}
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              {progressPercent}%
            </div>
            <div>
              <div className="text-xs text-indigo-900 font-medium">Roadmap Progress</div>
              <div className="text-xs text-indigo-700 font-semibold">{completedCount} of {totalTasks} Tasks Completed</div>
            </div>
          </div>
          <button
            id="copy-roadmap-md-btn"
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-medium text-xs sm:text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied" : "Export Markdown"}</span>
          </button>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm text-white">Generate Custom Learning Roadmap</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Gemini 3.7 Flash Engine</span>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Popular Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(p.topic);
                handleGenerateRoadmap(p.topic);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
            >
              {p.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Career Goal / Subject</label>
            <input
              id="roadmap-topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Modern AI & Full Stack Engineering"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="Beginner">Beginner (Zero experience)</option>
              <option value="Beginner to Advanced">Beginner to Advanced</option>
              <option value="Intermediate">Intermediate Developer</option>
              <option value="Advanced / Staff Engineer">Advanced / Staff Engineer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="3 Months (Fast Track)">3 Months (Fast Track)</option>
              <option value="6 Months (Comprehensive)">6 Months (Comprehensive)</option>
              <option value="12 Months (Mastery)">12 Months (Mastery)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            id="btn-generate-roadmap"
            onClick={() => handleGenerateRoadmap()}
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isLoading ? "Generating Curriculum..." : "Generate Master Roadmap"}</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            viewMode === 'timeline'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Interactive Roadmap Timeline & Task Checklist</span>
        </button>

        <button
          onClick={() => setViewMode('learning_vault')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            viewMode === 'learning_vault'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Learning Science & Tech Interview Mastery Vault</span>
        </button>
      </div>

      {viewMode === 'learning_vault' ? (
        /* Comprehensive Learning Science & Career Architecture Vault */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Technical Learning Science & Engineering Interview Framework
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Evidence-based cognitive learning systems, spaced repetition algorithms, and system design interview benchmarks for high-velocity software engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vault Card 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">01</span>
                <h3 className="font-bold text-slate-900 text-base">The 70-20-10 Learning Model</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Center for Creative Leadership framework for rapid engineering competence:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span><strong>70% Hands-on Building:</strong> Shipping real projects, debugging production crashes, and writing tests.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span><strong>20% Code Reviews & Mentorship:</strong> Reviewing peer PRs, architecture brown-bags, and feedback.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span><strong>10% Formal Documentation:</strong> Reading official docs, specs, and conceptual books.</span>
                </li>
              </ul>
            </div>

            {/* Vault Card 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">02</span>
                <h3 className="font-bold text-slate-900 text-base">The Feynman Technique</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Master complex distributed systems and algorithms by eliminating jargon:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                <li>Pick a topic (e.g. Raft Consensus, React Reconciliation, Indexing).</li>
                <li>Teach it to a non-technical peer in simple plain English.</li>
                <li>Identify your knowledge gaps when you struggle to explain why.</li>
                <li>Review the source docs and refine your mental model.</li>
              </ol>
            </div>

            {/* Vault Card 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700 font-bold text-xs">03</span>
                <h3 className="font-bold text-slate-900 text-base">System Design Interview Rubric</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                FAANG / Tier-1 engineering interview scoring criteria:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Requirements Clarification (5 min):</strong> Functional vs non-functional (Latency, Availability, Consistency).</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Back-of-the-Envelope Math (5 min):</strong> QPS, storage bandwidth, read/write ratios.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>High-Level Architecture (15 min):</strong> Load balancers, API gateways, database schemas, caches.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Deep Dive & Bottlenecks (15 min):</strong> Partitioning, failover, idempotency keys, rate limiters.</span>
                </li>
              </ul>
            </div>

            {/* Vault Card 4 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs">04</span>
                <h3 className="font-bold text-slate-900 text-base">Capstone Portfolio Proof Standards</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                What transforms a hobby project into a hiring manager magnet:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Live Production URL:</strong> 1-click live demo with zero setup requirements.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Engineering README:</strong> Architecture diagram, load test benchmarks, and design trade-offs.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>CI/CD & Tests:</strong> Automated GitHub Actions badge with &gt;80% test coverage.</span>
                </li>
              </ul>
            </div>

            {/* Vault Card 5 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">05</span>
                <h3 className="font-bold text-slate-900 text-base">The Dreyfus Model of Mastery</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track your cognitive progression across 5 defined stages:
              </p>
              <div className="space-y-1 text-xs text-slate-700">
                <div><strong>1. Novice:</strong> Follows strict recipes without situational context.</div>
                <div><strong>2. Advanced Beginner:</strong> Recognizes recurring patterns across tasks.</div>
                <div><strong>3. Competent:</strong> Prioritizes tasks and solves multi-step system problems.</div>
                <div><strong>4. Proficient:</strong> Sees holistic architectures intuitively.</div>
                <div><strong>5. Expert:</strong> Works from tacit knowledge and invents new paradigms.</div>
              </div>
            </div>

            {/* Vault Card 6 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">06</span>
                <h3 className="font-bold text-slate-900 text-base">Spaced Repetition & Coding Recall</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Counter the Ebbinghaus Forgetting Curve with scheduled review intervals:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Day 1:</strong> Initial code implementation and unit test writing.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Day 3:</strong> Re-implement from memory without viewing original solution.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Day 7 & Day 30:</strong> Solve variation challenge under simulated time constraint.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* Roadmap Header Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Active Curriculum</span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{roadmap.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{roadmap.overview}</p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>~{roadmap.estimatedTotalWeeks} Weeks</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>{roadmap.targetRole}</span>
            </div>
          </div>
        </div>

        {/* Prerequisites */}
        {roadmap.prerequisites && roadmap.prerequisites.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-500">Recommended Prerequisites:</span>
            {roadmap.prerequisites.map((pre, idx) => (
              <span key={idx} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium">
                {pre}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar visual */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Overall Completion</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Sequential Phases Timeline */}
      <div className="space-y-8 relative">
        {roadmap.phases.map((phase, pIdx) => {
          return (
            <div
              key={pIdx}
              id={`phase-card-${pIdx}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Phase Header Banner */}
              <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                      Phase {phase.phaseNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {phase.estimatedWeeks}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">{phase.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                    {phase.description}
                  </p>
                </div>
              </div>

              {/* Topics Grid */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {phase.topics.map((topic, tIdx) => (
                    <div
                      key={tIdx}
                      className="bg-slate-50/80 rounded-xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between hover:border-indigo-300 transition-all"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-base">{topic.name}</h4>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                            {topic.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{topic.summary}</p>

                        {/* Key Concepts */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {topic.keyConcepts.map((kc, kIdx) => (
                            <span
                              key={kIdx}
                              className="text-[11px] px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md font-medium"
                            >
                              {kc}
                            </span>
                          ))}
                        </div>

                        {/* Practical Tasks with Interactive Checkboxes */}
                        <div className="space-y-2 pt-2 border-t border-slate-200/80">
                          <span className="text-xs font-bold text-slate-900 block">Practical Action Tasks:</span>
                          <div className="space-y-1.5">
                            {topic.practicalTasks.map((task, kIdx) => {
                              const taskId = `${pIdx}-${tIdx}-${kIdx}`;
                              const isDone = Boolean(completedTasks[taskId]);
                              return (
                                <button
                                  key={kIdx}
                                  id={`task-toggle-${taskId}`}
                                  onClick={() => toggleTask(taskId)}
                                  className={`w-full text-left flex items-start space-x-2.5 p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                                    isDone
                                      ? "bg-emerald-50 text-emerald-900 font-medium"
                                      : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/60"
                                  }`}
                                >
                                  {isDone ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                  )}
                                  <span className={isDone ? "line-through text-emerald-700" : ""}>{task}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Advanced Explainer Button */}
                        <button
                          onClick={() =>
                            openAdvancedExplainer(
                              `Engineering Topic Architecture: ${topic.name}`,
                              `Phase: ${phase.title}\nTopic: ${topic.name}\nDifficulty: ${topic.difficulty}\nSummary: ${topic.summary}\nKey Concepts: ${topic.keyConcepts.join(', ')}\nPractical Tasks: ${topic.practicalTasks.join('; ')}`
                            )
                          }
                          className="w-full py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors border border-indigo-200/80 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Explain at Advanced Level</span>
                        </button>
                      </div>

                      {/* Resource links */}
                      {topic.resources && topic.resources.length > 0 && (
                        <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-500">Resources:</span>
                          {topic.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1 hover:underline"
                            >
                              <span>{res.title}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Milestone Capstone Project for the Phase */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-900 font-extrabold text-sm">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <span>{phase.milestoneProject.title}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {phase.milestoneProject.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-bold text-slate-600">Proof Deliverables:</span>
                    {phase.milestoneProject.deliverables.map((del, dIdx) => (
                      <span
                        key={dIdx}
                        className="text-xs px-2.5 py-1 bg-white border border-indigo-200 text-indigo-900 rounded-md font-medium shadow-xs"
                      >
                        ✓ {del}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}

      {/* Advanced Technical Explainer Modal */}
      <AdvancedExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        initialTopic={explainerTopic}
        sourceTool="Learning Roadmap Architecture"
        contextSnippet={explainerContext}
      />
    </div>
  );
};
