import React, { useState } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  Check, 
  Trash2, 
  Layers, 
  Layout, 
  Eye, 
  Compass, 
  Cpu, 
  BarChart3, 
  Network, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { SlideItem } from '../types';

interface SlideImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: SlideItem;
  onUpdateSlide: (updated: Partial<SlideItem>) => void;
}

const PRESET_STOCK_IMAGES = [
  {
    title: "AI Autonomous Agents & Neural Architecture",
    category: "AI & Tech",
    url: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
    caption: "Autonomous multi-agent orchestration and dynamic transformer reasoning.",
  },
  {
    title: "Data Analytics & Real-Time Dashboards",
    category: "Analytics",
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    caption: "Real-time KPI telemetry, time-series metrics, and business intelligence.",
  },
  {
    title: "Cloud Infrastructure & Global Network",
    category: "Cloud & DevOps",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    caption: "Distributed microservices, edge computing, and zero-trust perimeter.",
  },
  {
    title: "Executive Strategy & Corporate Vision",
    category: "Strategy",
    url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
    caption: "Strategic alignment, executive roadmaps, and stakeholder milestones.",
  },
  {
    title: "Team Collaboration & Agile Delivery",
    category: "Product",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    caption: "Cross-functional agile pods executing sprint goals with high velocity.",
  },
  {
    title: "Cybersecurity & Risk Governance",
    category: "Security",
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    caption: "Multi-layered cryptographic verification and audit compliance.",
  },
];

export const SlideImageModal: React.FC<SlideImageModalProps> = ({
  isOpen,
  onClose,
  slide,
  onUpdateSlide,
}) => {
  const [imageUrl, setImageUrl] = useState<string>(slide.imageUrl || '');
  const [imageCaption, setImageCaption] = useState<string>(slide.imageCaption || '');
  const [imagePlacement, setImagePlacement] = useState<'right' | 'left' | 'hero' | 'background' | 'card'>(
    slide.imagePlacement || 'right'
  );

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
        if (!imageCaption) {
          setImageCaption(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof PRESET_STOCK_IMAGES[0]) => {
    setImageUrl(preset.url);
    setImageCaption(preset.caption);
  };

  const handleApply = () => {
    onUpdateSlide({
      imageUrl: imageUrl.trim() || undefined,
      imageCaption: imageCaption.trim() || undefined,
      imagePlacement: imagePlacement,
      // If adding image to a default bullet layout, optionally make it split or showcase
      layout: slide.layout === 'bullet_cards' && imageUrl ? 'image_split' : slide.layout,
    });
    onClose();
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageCaption('');
    onUpdateSlide({
      imageUrl: undefined,
      imageCaption: undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                Slide #{slide.slideNumber} Media Studio
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Add / Edit Slide Visual & Image
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Preset Visuals Gallery */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Curated High-Resolution Visual Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_STOCK_IMAGES.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className={`rounded-xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.02] text-left group relative ${
                    imageUrl === preset.url
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                      : 'border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-20 object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="p-2 bg-slate-900 text-white">
                    <div className="text-[11px] font-bold truncate">{preset.title}</div>
                    <div className="text-[9px] text-slate-400 uppercase">{preset.category}</div>
                  </div>
                  {imageUrl === preset.url && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Direct File Upload & URL Input */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Or Upload Custom Image / Enter Image URL
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* File Upload Box */}
              <div className="relative border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-3.5 text-center bg-slate-50 hover:bg-indigo-50/40 transition-colors cursor-pointer flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-indigo-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">Upload Image File</span>
                <span className="text-[10px] text-slate-500">PNG, JPG, WebP, SVG</span>
              </div>

              {/* Image URL Input */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-600">Image Web URL</span>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Placement & Caption Settings */}
          {imageUrl && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Placement Options */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Visual Layout Placement
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'right' as const, label: 'Split (Right)' },
                      { id: 'left' as const, label: 'Split (Left)' },
                      { id: 'hero' as const, label: 'Top Hero' },
                      { id: 'card' as const, label: 'Card Badge' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setImagePlacement(mode.id)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          imagePlacement === mode.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Caption Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Image Caption / Description
                  </label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="e.g. Architectural blueprint of autonomous agents"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center space-x-4">
                <img
                  src={imageUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-24 h-16 object-cover rounded-lg border border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Live Preview</div>
                  <p className="text-xs text-slate-300 truncate">{imageCaption || 'No caption provided'}</p>
                  <span className="text-[10px] text-slate-500 font-mono">Placement: {imagePlacement.toUpperCase()}</span>
                </div>
                <button
                  onClick={() => setImageUrl('')}
                  className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer"
                  title="Clear Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <div>
            {slide.imageUrl && (
              <button
                onClick={handleRemoveImage}
                className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Image from Slide</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Apply to Slide</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
