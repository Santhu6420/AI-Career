export type ActiveTool = 'architecture' | 'resume' | 'roadmap' | 'powerbi' | 'excel' | 'ppt' | 'playground' | 'advanced';

// --- Advanced Deep Explainer Types ---
export interface AdvancedExecutionStep {
  step: number;
  phase: string;
  whatHappens: string;
  engineState: string;
}

export interface AdvancedPitfall {
  pitfall: string;
  symptom: string;
  rootCause: string;
  prevention: string;
  severity: 'Critical' | 'High' | 'Medium';
}

export interface AdvancedComparativeBenchmark {
  alternative: string;
  performanceVsAlternative: string;
  memoryVsAlternative: string;
  recommendedWhen: string;
}

export interface AdvancedProductionCode {
  language: string;
  filename?: string;
  code: string;
  annotations: string[];
}

export interface AdvancedExplainerData {
  title: string;
  conceptClassification: string;
  depthLevel: string;
  executiveSummary: string;
  firstPrinciplesTheory: {
    title: string;
    mathFormulaOrNotation?: string;
    explanation: string;
    coreTenets: string[];
  };
  executionMechanics: {
    title: string;
    stepByStepFlow: AdvancedExecutionStep[];
    memoryAndCpuImpact: string;
  };
  productionPitfallsAndEdgeCases: AdvancedPitfall[];
  comparativeBenchmark?: AdvancedComparativeBenchmark;
  productionCodeOrScript?: AdvancedProductionCode;
  advancedMasteryChecklist: string[];
  keyTakeaways: string[];
}

// --- Resume Builder Types ---
export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface WorkExperienceItem {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
  gpaOrHonors?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  bullets: string[];
}

export interface ResumeData {
  atsScore: number;
  atsSuggestions: string[];
  personalInfo: PersonalInfo;
  summary: string;
  skills: SkillCategory[];
  experience: WorkExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
}

// --- Roadmap Generator Types ---
export interface RoadmapResource {
  title: string;
  url: string;
  type: string;
}

export interface RoadmapTopic {
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  keyConcepts: string[];
  practicalTasks: string[];
  resources?: RoadmapResource[];
}

export interface MilestoneProject {
  title: string;
  description: string;
  deliverables: string[];
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  description: string;
  estimatedWeeks: string;
  badgeColor: string;
  topics: RoadmapTopic[];
  milestoneProject: MilestoneProject;
}

export interface RoadmapData {
  title: string;
  overview: string;
  targetRole: string;
  estimatedTotalWeeks: number;
  prerequisites: string[];
  phases: RoadmapPhase[];
}

// --- Power BI Types ---
export interface DaxMeasure {
  measureName: string;
  category: string;
  formula: string;
  explanation: string;
  returnType: string;
  performanceTip?: string;
}

export interface PowerQueryMCode {
  tableName: string;
  description: string;
  mCode: string;
}

export interface DataModelTable {
  name: string;
  type: string;
  columns: string[];
}

export interface DataModelRelationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  cardinality: string;
  crossFilterDirection?: string;
}

export interface DashboardWidget {
  title: string;
  visualType: 'kpi_card' | 'bar_chart' | 'line_chart' | 'pie_chart';
  primaryValue: string;
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  chartData?: Array<{
    name: string;
    value: number;
    target?: number;
  }>;
}

export interface PowerBIData {
  dashboardTitle: string;
  summary: string;
  daxMeasures: DaxMeasure[];
  powerQueryMCode?: PowerQueryMCode[];
  dataModel: {
    tables: DataModelTable[];
    relationships: DataModelRelationship[];
  };
  dashboardWidgets: DashboardWidget[];
}

// --- Excel & Sheets Types ---
export interface SyntaxPart {
  part: string;
  meaning: string;
}

export interface SampleGrid {
  headers: string[];
  rows: string[][];
}

export interface ExcelData {
  title: string;
  primaryFormula: string;
  legacyFormula?: string;
  googleSheetsFormula?: string;
  explanation: string;
  syntaxBreakdown: SyntaxPart[];
  commonPitfalls?: string[];
  vbaCode?: string;
  appsScriptCode?: string;
  sampleGrid?: SampleGrid;
}

// --- PPT / Presentation Types ---
export interface SlideStat {
  number: string;
  label: string;
}

export interface SlideChartPoint {
  name: string;
  value: number;
  target?: number;
  secondary?: number;
}

export interface SlideProcessStep {
  step: number;
  title: string;
  description: string;
  tag?: string;
}

export interface SlidePollOption {
  id: string;
  label: string;
  votes: number;
}

export interface SlidePollData {
  question: string;
  options: SlidePollOption[];
  totalVotes?: number;
}

export type SlideLayoutType =
  | 'title_slide'
  | 'bullet_cards'
  | 'two_column_compare'
  | 'metrics_highlight'
  | 'timeline_quote'
  | 'interactive_chart'
  | 'process_diagram'
  | 'live_poll'
  | 'image_showcase'
  | 'image_split'
  | 'pdf_visual_deck';

export interface SlideItem {
  slideNumber: number;
  layout: SlideLayoutType;
  headline: string;
  subhead?: string;
  bullets?: string[];
  statCallout?: SlideStat;
  leftColumnTitle?: string;
  leftColumnItems?: string[];
  rightColumnTitle?: string;
  rightColumnItems?: string[];
  speakerNotes: string;
  visualBadge?: string;
  // Interactive visual extensions
  chartData?: SlideChartPoint[];
  chartType?: 'bar' | 'area' | 'line' | 'pie';
  processSteps?: SlideProcessStep[];
  pollData?: SlidePollData;
  visualTheme?: string;
  // Image & Visual Media extensions
  imageUrl?: string;
  imageCaption?: string;
  imagePlacement?: 'right' | 'left' | 'hero' | 'background' | 'card';
}

export interface PresentationData {
  deckTitle: string;
  deckSubtitle: string;
  theme: string;
  totalSlides: number;
  slides: SlideItem[];
  sourceDocumentName?: string;
  pdfAnalysisSummary?: string;
}
