import React, { useState, useEffect } from 'react';
import { ProjectStage } from '../types';
import { 
  Calendar, Clock, Edit2, Check, X, AlertCircle, ShieldAlert, 
  CheckCircle2, MessageSquare, AlertTriangle, ChevronDown, ChevronUp, 
  Camera, TrendingUp, Coins, Clock3, Hammer, ZoomIn,
  Play, Pause, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';

interface GanttChartProps {
  stages: ProjectStage[];
  onUpdateStage: (stageId: string, updates: Partial<ProjectStage>) => void;
  isEn: boolean;
  penaltyRate?: number;
}

export const GanttChart: React.FC<GanttChartProps> = ({ stages, onUpdateStage, isEn, penaltyRate = 500 }) => {
  // Administrative edit state
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(14);
  const [elapsed, setElapsed] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  // Expanded tabs for inspector and client feedback details per stage
  const [expandedDetailsStageId, setExpandedDetailsStageId] = useState<string | null>(null);

  // Active Zoomed Lightbox Image
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // 🎥 Interactive Slideshow Presentation State
  const [showPresentation, setShowPresentation] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [slideZoomedImage, setSlideZoomedImage] = useState<string | null>(null);

  // Auto-play effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showPresentation && isAutoPlaying && stages.length > 0) {
      interval = setInterval(() => {
        setCurrentSlideIndex((prevIdx) => (prevIdx + 1) % stages.length);
      }, 5000); // 5 seconds per slide for smooth reading and presentation
    }
    return () => clearInterval(interval);
  }, [showPresentation, isAutoPlaying, stages.length]);

  // Helpers to format project total stats
  const totalPlannedDays = stages.reduce((sum, s) => sum + (s.totalDurationDays || 14), 0);
  const totalElapsedDays = stages.reduce((sum, s) => sum + (s.daysElapsed || 0), 0);
  
  // Calculate overall project delay
  const delayDays = Math.max(0, totalElapsedDays - totalPlannedDays);
  const totalPenalty = delayDays * penaltyRate;

  // Percentage of elapsed duration
  const percentDurationUsed = totalPlannedDays > 0 ? Math.round((totalElapsedDays / totalPlannedDays) * 100) : 0;

  const handleStartEdit = (stage: ProjectStage, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStageId(stage.id === editingStageId ? null : stage.id);
    setDuration(stage.totalDurationDays || 14);
    setElapsed(stage.daysElapsed || 0);
    setProgress(stage.progress || 0);
    // Expand the stage panel when editing
    setExpandedDetailsStageId(stage.id);
  };

  const handleSave = (stageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStage(stageId, {
      totalDurationDays: duration,
      daysElapsed: elapsed,
      progress: progress,
      status: progress === 100 ? 'APPROVED' : progress > 0 ? 'UNDER_WAY' : 'NOT_STARTED'
    });
    setEditingStageId(null);
  };

  const toggleDetails = (stageId: string) => {
    setExpandedDetailsStageId(expandedDetailsStageId === stageId ? null : stageId);
  };

  const arabicNumbers = (num: number): string => {
    if (isEn) return num.toString();
    const chars = {
      '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
      '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
    };
    return num.toString().replace(/[0-9]/g, w => chars[w as keyof typeof chars]);
  };

  return (
    <div className="space-y-4 font-sans text-right" dir={isEn ? 'ltr' : 'rtl'}>
      
      {/* 💳 1. REDESIGNED OVERALL PROJECT TIMELINE BOARD - Brand Consistent (#113C30 & Premium light gold/grey style) */}
      <div className="bg-white border border-[#113C30]/15 rounded-2xl p-4 space-y-3 shadow-xs">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1 px-2.5 bg-[#113C30]/10 text-[#113C30] rounded-xl font-bold text-base">⏳</div>
            <div>
              <h5 className="text-[12px] font-extrabold text-[#113C30]">
                {isEn ? 'Global Project Timeline & Latency Penalty Monitor' : 'مخطط المتابعة الزمنية وغرامات التأخير الكلية للعقود:'}
              </h5>
              <p className="text-[9.5px] text-gray-400 mt-0.5">
                {isEn 
                  ? 'Real-time delay tracking, contracted vs actual elapsed duration, and liquidated damages ledger' 
                  : 'مراقبة ذكية ودقيقة للجدول الزمني الإجمالي للمشروع مقارنة بالمنقضي فعلياً واحتساب الغرامات المقررة'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setCurrentSlideIndex(0);
                setIsAutoPlaying(true);
                setShowPresentation(true);
              }}
              className="bg-gradient-to-r from-[#113C30] to-[#1a4f40] text-white hover:from-[#0d3026] hover:to-[#113C30] text-[10px] font-black px-3.5 py-1.5 rounded-xl shadow-xs border border-[#D8B448]/30 flex items-center gap-1.5 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
              title={isEn ? 'Generate pitch deck presentation' : 'توليد وعرض مسار تطور المشروع التفاعلي'}
            >
              <Sparkles className="w-3 h-3 text-[#D8B448] animate-pulse" />
              <span>{isEn ? 'Investor Slideshow' : 'بدء العرض التقديمي للمستثمر والعميل 🎥'}</span>
            </button>
            <span className="bg-[#2B4D89]/10 text-[#2B4D89] border border-[#2B4D89]/20 text-[9px] font-bold px-2.5 py-0.5 rounded-full w-fit shrink-0">
              {isEn ? 'Time Governance' : 'حوكمة الالتزام الزمني'}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Metric 1 */}
          <div className="bg-gray-50/80 border border-gray-100 p-2.5 rounded-xl flex flex-col justify-between">
            <span className="text-gray-400 text-[9.5px] font-bold block mb-0.5">📅 {isEn ? 'Contracted Duration' : 'المدة الكلية المتاحة:'}</span>
            <span className="text-[12.5px] font-black font-mono text-[#113C30]">
              {arabicNumbers(totalPlannedDays)} {isEn ? 'Days' : 'يوم للإنهاء'}
            </span>
          </div>

          {/* Metric 2 */}
          <div className="bg-gray-50/80 border border-gray-100 p-2.5 rounded-xl flex flex-col justify-between">
            <span className="text-gray-400 text-[9.5px] font-bold block mb-0.5">⏱️ {isEn ? 'Actual Elapsed Days' : 'إجمالي المنقضي فعلياً:'}</span>
            <span className="text-[12.5px] font-black font-mono text-[#2B4D89]">
              {arabicNumbers(totalElapsedDays)} {isEn ? 'Days' : 'يوم عمل منقضي'}
            </span>
          </div>

          {/* Metric 3 */}
          <div className="bg-gray-50/80 border border-gray-100 p-2.5 rounded-xl flex flex-col justify-between">
            <span className="text-gray-400 text-[9.5px] font-bold block mb-0.5">🚨 {isEn ? 'Delay Days' : 'أيام التأخير الفنية:'}</span>
            <span className={`text-[12.5px] font-black font-mono ${delayDays > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-700'}`}>
              {delayDays > 0 
                ? `${arabicNumbers(delayDays)} ${isEn ? 'Delay Days' : 'أيام تجاوز'}` 
                : (isEn ? 'No Delay (On Track)' : 'منتظم وبدون تأخير')}
            </span>
          </div>

          {/* Metric 4 */}
          <div className={`${delayDays > 0 ? 'bg-rose-50 border-rose-100' : 'bg-[#113C30]/5 border-[#113C30]/10'} border p-2.5 rounded-xl flex flex-col justify-between relative overflow-hidden`}>
            <span className={`text-[9.5px] font-bold block mb-0.5 ${delayDays > 0 ? 'text-rose-700' : 'text-[#113C30]'}`}>
              💰 {isEn ? 'Liquidated Penalty' : 'التسوية وغرامات التأخير:'}
            </span>
            <div className="flex items-center justify-between">
              <span className={`text-[12.5px] font-black font-mono ${delayDays > 0 ? 'text-rose-600' : 'text-gray-700'}`}>
                {totalPenalty.toLocaleString()} {isEn ? 'EGP' : 'ج.م'}
              </span>
              <span className="text-[8px] text-gray-400 block font-mono" dir="rtl">
                ({arabicNumbers(penaltyRate)} ج.م/يوم)
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Modifiers - Simplified to show only estimated timeline consumption */}
        <div className="bg-[#113C30]/5 p-2.5 rounded-xl border border-[#113C30]/10 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-[10px] w-full justify-between flex-row-reverse">
            <span className="text-gray-500 font-bold">{isEn ? 'Timeline consumed compared to total estimated duration:' : 'نسبة استنفاذ الزمن المقدر مقارنة بالمدة الكلية المتوقعة للمشروع:'}</span>
            <div className="flex items-center gap-2 w-full sm:w-64 flex-row-reverse">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${delayDays > 0 ? 'bg-rose-500' : 'bg-[#113C30]'}`} 
                  style={{ width: `${Math.min(percentDurationUsed, 100)}%` }}
                />
              </div>
              <span className="text-[#113C30] font-black whitespace-nowrap text-[10px]" dir="ltr">{percentDurationUsed}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🚧 2. OPTIMIZED STAGES GRID (مراحل التشطيب بتصميم مدمج والوان احترافية متناسقة) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
          <h4 className="text-[11px] font-black text-gray-800 flex items-center gap-1">
            <span className="text-xs">🏁</span> 
            {isEn ? 'Finishing Construction Gateways (2-Column Grid)' : 'متابعة بنود ومراحل التشطيب المعتمدة (كل مرحلتين متجاورتين):'}
          </h4>
          <span className="text-[9px] text-gray-400 font-semibold">
            {isEn ? 'Click cards for site logs & client remarks' : 'اضغط للاطلاع على المعاينة الميدانية ومقترحات وتعديلات العميل'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stages.map((stage, idx) => {
            const totalDays = stage.totalDurationDays || 14; 
            const daysPassed = Math.min(stage.daysElapsed || 0, totalDays);
            const percentPassed = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;
            const progressPercent = stage.progress || 0;
            const isEditing = editingStageId === stage.id;
            const isExpanded = expandedDetailsStageId === stage.id;

            const stageRomanNumeral = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة'];
            const stageNumeralStr = isEn ? `Stage ${idx + 1}` : `المرحلة ${stageRomanNumeral[idx] || (idx + 1)}`;

            // Dynamic badges with strict brand alignment 
            const statusTheme = {
              APPROVED: { bg: 'bg-emerald-50 border-emerald-200/60 text-emerald-800', label: isEn ? 'TECHNICAL APPROVED' : '✓ مقبول ومطابق للمواصفات', dot: 'bg-emerald-500' },
              INSPECTION_APPROVED: { bg: 'bg-emerald-50 border-emerald-200/60 text-emerald-800', label: isEn ? 'INSPECTION APPROVED' : '✓ معتمد ومستلم ميدانياً', dot: 'bg-emerald-500' },
              PAID: { bg: 'bg-emerald-50 border-[#113C30]/20 text-[#113C30]', label: isEn ? 'STAGE PAID' : '✓ تم سداد الدفعة المالية', dot: 'bg-[#113C30]' },
              UNDER_WAY: { bg: 'bg-blue-50 border-blue-200/65 text-blue-800', label: isEn ? 'UNDER EXECUTION' : '⚒️ جاري العمل الميداني الفعلي', dot: 'bg-blue-500' },
              IN_PROGRESS: { bg: 'bg-blue-50 border-blue-200/65 text-blue-800', label: isEn ? 'UNDER EXECUTION' : '⚒️ جاري العمل الفني', dot: 'bg-blue-500' },
              REJECTED: { bg: 'bg-rose-50 border-rose-200/65 text-rose-800', label: isEn ? 'DEFICIENCIES FOUND' : '❌ ملاحظات فنية وتعديل مطلوب', dot: 'bg-rose-500' },
              INSPECTION_FAILED: { bg: 'bg-rose-50 border-rose-200/65 text-rose-800', label: isEn ? 'DEFICIENCIES FOUND' : '❌ معيب ويحتاج إعادة تنفيذ', dot: 'bg-rose-500' },
              INSPECTION_REQUESTED: { bg: 'bg-amber-50 border-amber-200/65 text-amber-800', label: isEn ? 'AUDIT REQUESTED' : '⏳ جاري مراجعة استلام المهندس', dot: 'bg-amber-500' },
              NOT_STARTED: { bg: 'bg-gray-50 border-gray-200 text-gray-400', label: isEn ? 'NOT STARTED' : '📅 مخطط ومدرج بالجدول', dot: 'bg-gray-300' }
            };

            const currentBadge = statusTheme[stage.status] || statusTheme.NOT_STARTED;

            // Highly distinctive color palettes per stage to prevent overlapping/blending
            const stageChemes = [
              {
                border: 'border-sky-200/90 hover:border-sky-400 focus-within:ring-sky-200 hover:shadow-[0_4px_12px_rgba(2,132,199,0.08)]',
                headerBg: 'bg-gradient-to-r from-sky-850 via-sky-800 to-sky-700',
                headerText: 'text-white',
                badgeTextBg: 'text-sky-100 bg-white/15 border border-white/15',
                progressBar: 'bg-sky-500',
                progressText: 'text-sky-600',
                dot: 'bg-sky-500',
                editBtn: 'bg-white/15 border-white/10 text-white/90 hover:bg-white/25 hover:text-white',
                headerIndicator: 'bg-sky-400'
              },
              {
                border: 'border-amber-200/90 hover:border-amber-400 focus-within:ring-amber-200 hover:shadow-[0_4px_12px_rgba(217,119,6,0.08)]',
                headerBg: 'bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600',
                headerText: 'text-white',
                badgeTextBg: 'text-amber-100 bg-white/15 border border-white/15',
                progressBar: 'bg-amber-500',
                progressText: 'text-amber-600',
                dot: 'bg-amber-500',
                editBtn: 'bg-white/15 border-white/10 text-white/90 hover:bg-white/25 hover:text-white',
                headerIndicator: 'bg-amber-400'
              },
              {
                border: 'border-emerald-200/90 hover:border-emerald-400 focus-within:ring-emerald-200 hover:shadow-[0_4px_12px_rgba(5,150,105,0.08)]',
                headerBg: 'bg-gradient-to-r from-emerald-800 via-[#106A43] to-[#047857]',
                headerText: 'text-white',
                badgeTextBg: 'text-emerald-100 bg-white/15 border border-white/15',
                progressBar: 'bg-emerald-500',
                progressText: 'text-emerald-600',
                dot: 'bg-emerald-500',
                editBtn: 'bg-white/15 border-white/10 text-white/90 hover:bg-white/25 hover:text-white',
                headerIndicator: 'bg-emerald-400'
              },
              {
                border: 'border-indigo-200/90 hover:border-indigo-400 focus-within:ring-indigo-200 hover:shadow-[0_4px_12px_rgba(79,70,229,0.08)]',
                headerBg: 'bg-gradient-to-r from-indigo-850 via-indigo-800 to-indigo-700',
                headerText: 'text-white',
                badgeTextBg: 'text-indigo-100 bg-white/15 border border-white/15',
                progressBar: 'bg-indigo-500',
                progressText: 'text-indigo-600',
                dot: 'bg-indigo-500',
                editBtn: 'bg-white/15 border-white/10 text-white/90 hover:bg-white/25 hover:text-white',
                headerIndicator: 'bg-indigo-400'
              },
              {
                border: 'border-rose-200/90 hover:border-rose-400 focus-within:ring-rose-200 hover:shadow-[0_4px_12px_rgba(225,29,72,0.08)]',
                headerBg: 'bg-gradient-to-r from-rose-800 via-rose-700 to-rose-600',
                headerText: 'text-white',
                badgeTextBg: 'text-rose-100 bg-white/15 border border-white/15',
                progressBar: 'bg-rose-500',
                progressText: 'text-rose-600',
                dot: 'bg-rose-500',
                editBtn: 'bg-white/15 border-white/10 text-white/90 hover:bg-white/25 hover:text-white',
                headerIndicator: 'bg-rose-400'
              },
              {
                border: 'border-[#D8B448]/35 hover:border-[#D8B448]/60 focus-within:ring-teal-200 hover:shadow-[0_4px_12px_rgba(216,180,72,0.1)]',
                headerBg: 'bg-gradient-to-r from-[#113C30] via-[#154639] to-[#0d3026]',
                headerText: 'text-[#FAF8F5]',
                badgeTextBg: 'text-[#D8B448] bg-white/10 border border-[#D8B448]/25',
                progressBar: 'bg-[#D8B448]',
                progressText: 'text-[#9A7D2C] font-black',
                dot: 'bg-[#D8B448]',
                editBtn: 'bg-white/10 border-[#D8B448]/20 hover:border-[#D8B448]/50 text-[#FAF8F5]/95 hover:bg-white/20',
                headerIndicator: 'bg-[#D8B448]'
              }
            ];

            const themeIdx = idx % stageChemes.length;
            const sc = stageChemes[themeIdx];

            return (
              <div 
                key={stage.id} 
                className={`bg-white border rounded-xl hover:shadow-xs transition-all duration-300 overflow-hidden text-right flex flex-col justify-between ${sc.border} ${
                  isExpanded ? 'ring-2 ring-offset-1' : ''
                }`}
              >
                {/* 1. Header Card Panel (Sleek, tight metadata layout with premium rich color backgrounds) */}
                <div className={`${sc.headerBg} px-3 py-2.5 border-b border-black/5 flex items-center justify-between gap-1.5`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${sc.headerIndicator} shrink-0 shadow-3xs`} />
                    <div className="min-w-0">
                      <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-md block w-fit leading-none mb-1 ${sc.badgeTextBg}`}>
                        {stageNumeralStr}
                      </span>
                      <h4 className={`font-extrabold text-[11.5px] mt-0.5 truncate tracking-wide ${sc.headerText}`} title={stage.name}>
                        {stage.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => handleStartEdit(stage, e)}
                      className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${sc.editBtn}`}
                      title={isEn ? 'Edit durations' : 'تعديل المدد والجدولة'}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <span className={`text-[8.5px] font-extrabold px-2.5 py-1 rounded-lg border flex items-center gap-1 shadow-3xs ${currentBadge.bg}`}>
                      <span className={`w-1 h-1 rounded-full ${currentBadge.dot}`} />
                      <span>{currentBadge.label}</span>
                    </span>
                  </div>
                </div>

                {/* 2. Compact Space & Metrics */}
                <div className="p-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                    <div className="bg-gray-50/60 p-2 rounded-lg border border-gray-100 flex justify-between items-center">
                      <span className="text-gray-400 font-bold">⏱️ مخطط المخصص:</span>
                      <span className="text-gray-800 font-extrabold font-mono text-[10px]">
                        {arabicNumbers(totalDays)} يوم
                      </span>
                    </div>
                    <div className="bg-gray-50/60 p-2 rounded-lg border border-gray-100 flex justify-between items-center">
                      <span className="text-gray-400 font-bold">📅 المنقضي للآن:</span>
                      <span className="text-gray-800 font-extrabold font-mono text-[10px]">
                        {arabicNumbers(daysPassed)} / {arabicNumbers(totalDays)}
                      </span>
                    </div>
                  </div>

                  {/* Redesigned Progress Bars - using vibrant colored progress lines instead of black */}
                  <div className="space-y-1">
                    <div className="relative w-full h-2 bg-gray-100 border border-gray-150/40 rounded-full overflow-hidden">
                      {/* Chronology progress */}
                      <div
                        className="bg-gray-300/40 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percentPassed}%`,
                          position: 'absolute',
                          [isEn ? 'left' : 'right']: 0
                        }}
                      />
                      {/* Executed physical progress - using vibrant theme color instead of dark-green/#113C30 */}
                      <div
                        className={`absolute top-0 h-full ${sc.progressBar} transition-all duration-300 rounded-full`}
                        style={{
                          width: `${progressPercent}%`,
                          [isEn ? 'left' : 'right']: 0
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[8px] text-gray-400 font-bold px-0.5 pt-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-xs" />
                        <span>منقضي زمنياً: {Math.round(percentPassed)}%</span>
                      </span>
                      <span className={`flex items-center gap-1 ${sc.progressText}`}>
                        <span className={`w-1.5 h-1.5 ${sc.dot} rounded-xs`} />
                        <span>نسبة الإنجاز: {progressPercent}%</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Snug Action Controls (Minimized empty spaces, ultra tiny compact styling) */}
                <div className="px-3 pb-2.5 pt-1.5 flex items-center justify-between border-t border-gray-100 mt-1">
                  <button
                    onClick={() => toggleDetails(stage.id)}
                    type="button"
                    className="flex items-center gap-1 text-[9px] font-black text-[#2B4D89] hover:text-[#1E3254] transition-all cursor-pointer bg-[#2B4D89]/5 hover:bg-[#2B4D89]/10 px-2 py-1 rounded-md"
                  >
                    <span>📊</span>
                    <span>{isEn ? 'Inspect Logs' : 'سجل المعاينات وتعليق العميل'}</span>
                    <span className="transform transition-transform text-[7px] mr-0.5">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </button>

                  {daysPassed > totalDays && (
                    <span className="text-[8px] text-rose-600 bg-rose-50 border border-rose-100/50 px-1.5 py-0.5 rounded font-black animate-pulse">
                      🚨 تجاوز المدة!
                    </span>
                  )}
                </div>

                {/* 4. Details Panel without unused margins or blank spaces */}
                {isExpanded && (
                  <div className="bg-[#FAF9F5] border-t border-gray-150 p-3 space-y-2.5">
                    
                    {/* Interactive Editor Form */}
                    {isEditing && (
                      <div className="bg-amber-50/70 border border-amber-200/50 p-2.5 rounded-lg space-y-2 text-right">
                        <span className="text-[9px] font-black text-amber-900 block border-b border-amber-200/30 pb-1">⚙️ محرر الجدولة والمدد لتنفيذ البند:</span>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-800">
                          <div className="space-y-0.5">
                            <label className="text-[8.5px] font-bold text-slate-500">📅 الأيام المقررة:</label>
                            <input
                              type="number"
                              min="1"
                              className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-center font-mono font-bold focus:outline-hidden focus:border-[#2B4D89]"
                              value={duration}
                              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[8.5px] font-bold text-slate-500">⏳ الأيام المنقضية:</label>
                            <input
                              type="number"
                              min="0"
                              className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-center font-mono font-bold focus:outline-hidden focus:border-[#2B4D89]"
                              value={elapsed}
                              onChange={(e) => setElapsed(Math.max(0, parseInt(e.target.value) || 0))}
                            />
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[8px] font-extrabold text-amber-900">
                            <span>نسبة الإنجاز الفعلي:</span>
                            <span className="font-mono">{progress}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            className="w-full accent-[#113C30] cursor-pointer"
                            value={progress}
                            onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                          />
                        </div>

                        <div className="flex justify-end gap-1 pt-1 border-t border-amber-200/20">
                          <button
                            type="button"
                            onClick={(e) => handleSave(stage.id, e)}
                            className="bg-[#113C30] text-white font-extrabold text-[8.5px] px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-2.5 h-2.5" />
                            <span>مزامنة وحفظ وبناء</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setEditingStageId(null); }}
                            className="bg-white border border-gray-250 text-gray-500 font-bold text-[8.5px] px-2 py-1 rounded transition-all cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Integrated site logs & Client ratings view (Extremely compact, no wasted spaces) */}
                    <div className="space-y-2 text-[10px]">
                      
                      {/* Inspector Action Column */}
                      <div className="bg-white/80 border border-gray-150 rounded-lg p-2.5 space-y-1.5">
                        <div className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-800">
                          <span>🕵️‍♂️</span> 
                          <span>إجراء المشرف الفني للمعاينة الميدانية:</span>
                        </div>
                        {stage.reportText || stage.rejectedNotes ? (
                          <div className="space-y-1">
                            {stage.reportText && (
                              <p className="text-gray-700 leading-relaxed font-semibold bg-emerald-50/25 p-1.5 rounded text-[9.5px]">
                                "{stage.reportText}"
                              </p>
                            )}
                            {stage.rejectedNotes && (
                              <p className="text-rose-800 font-semibold bg-rose-50/30 p-1.5 rounded text-[9.5px]">
                                ⚠️ تم الرفض: "{stage.rejectedNotes}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[9px] text-gray-400 italic">
                            لم يسجل ملاحظات رفض أو استلام مخصصة، العمل يطابق الكود.
                          </p>
                        )}
                      </div>

                      {/* Client Comments column */}
                      <div className="bg-white/80 border border-gray-150 rounded-lg p-2.5 space-y-1.5">
                        <div className="flex items-center gap-1 text-[9px] font-extrabold text-[#2B4D89]">
                          <span>👤</span> 
                          <span>تعليق أو تقييم العميل على هذا البند:</span>
                        </div>
                        {stage.complaintText ? (
                          <p className="text-gray-700 leading-relaxed font-semibold bg-[#2B4D89]/5 p-1.5 rounded text-[9.5px]">
                            💬 "{stage.complaintText}"
                          </p>
                        ) : (
                          <p className="text-[9px] text-gray-400 italic">
                            لم يقم العميل بتقديم تعليقات أو شكاوى تخص هذا البند حتى الآن.
                          </p>
                        )}
                      </div>

                      {/* Thumbnail Images */}
                      {stage.images && stage.images.length > 0 && (
                        <div className="pt-1 select-none">
                          <span className="text-[8.5px] font-extrabold text-gray-500 block mb-1">📸 صور المطابقة المحملة:</span>
                          <div className="flex gap-2.5 overflow-x-auto py-0.5 scrollbar-thin">
                            {stage.images.map((img, i) => (
                              <div 
                                key={i} 
                                onClick={() => setZoomedImage(img)}
                                className="relative cursor-zoom-in shrink-0 overflow-hidden rounded-lg border border-gray-200/80 w-11 h-11 bg-white"
                              >
                                <img 
                                  src={img} 
                                  alt="audit proof" 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer" 
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 🖼️ HIGH QUALITATIVE LIGHTBOX MODAL */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center p-4 transition-all"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl bg-black">
            <img 
              src={zoomedImage} 
              alt="zoomed inspect" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/85 text-white p-2.5 rounded-full cursor-pointer border border-white/20 hover:scale-105 transition-all text-sm font-black"
              title={isEn ? 'Close' : 'إغلاق المعاينة'}
            >
              ✕
            </button>
          </div>
          <p className="text-white/70 text-[11px] font-bold mt-3">
            {isEn ? 'Inspection Site Photograph - Shattabha Quality Assurance' : 'صورة تفصيلية للموقع معتمدة ومرفوعة بواسطة مهندس الفحص الفني لضمان شطبها'}
          </p>
        </div>
      )}

      {/* 🎥 INTERACTIVE PROJECT EVOLUTION SLIDESHOW MODAL */}
      {showPresentation && stages.length > 0 && (() => {
        const stage = stages[currentSlideIndex];
        const prevIndex = (currentSlideIndex - 1 + stages.length) % stages.length;
        const nextIndex = (currentSlideIndex + 1) % stages.length;
        
        // Find high-quality fallback image for this stage if empty
        const getStageFallbackImage = (idx: number, name: string): string => {
          const normName = name.toLowerCase();
          if (normName.includes('سباكة') || normName.includes('صرف') || normName.includes('صحى')) {
            return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80'; // plumbing layout
          }
          if (normName.includes('كهرباء') || normName.includes('تأسيس كهرباء') || normName.includes('سلك')) {
            return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80'; // sockets / wires
          }
          if (normName.includes('محارة') || normName.includes('بياض') || normName.includes('اسمنت') || normName.includes('جبس')) {
            return 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80'; // plastering
          }
          if (normName.includes('دهان') || normName.includes('نقاشة') || normName.includes('جوتن') || normName.includes('معجون')) {
            return 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80'; // painting
          }
          if (normName.includes('أرضيات') || normName.includes('سيراميك') || normName.includes('بورسلين') || normName.includes('بلاط')) {
            return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'; // wood/tile floor
          }
          const fallbacks = [
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
          ];
          return fallbacks[idx % fallbacks.length];
        };

        const activeImg = stage.images && stage.images.length > 0 
          ? stage.images[0] 
          : getStageFallbackImage(currentSlideIndex, stage.name);

        const stageRomanNumeral = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة'];
        const stageNumeralStr = isEn ? `Stage ${currentSlideIndex + 1}` : `المرحلة ${stageRomanNumeral[currentSlideIndex] || (currentSlideIndex + 1)}`;

        // Dynamic badges with strict brand alignment 
        const statusTheme = {
          APPROVED: { bg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300', label: isEn ? 'APPROVED' : '✓ مقبول فني ومطابق للكود', dot: 'bg-emerald-400' },
          INSPECTION_APPROVED: { bg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300', label: isEn ? 'INSPECTION APPROVED' : '✓ معتمد ومستلم ميدانياً', dot: 'bg-emerald-400' },
          PAID: { bg: 'bg-emerald-500/25 border-[#113C30]/40 text-[#cbece2]', label: isEn ? 'PAID' : '✓ تم سداد الدفعة المالية للمقاول', dot: 'bg-emerald-400' },
          UNDER_WAY: { bg: 'bg-blue-500/20 border-blue-500/30 text-blue-300', label: isEn ? 'UNDER WAY' : '⚒️ جاري العمل الميداني الفعلي', dot: 'bg-blue-400' },
          IN_PROGRESS: { bg: 'bg-blue-500/20 border-blue-500/30 text-blue-300', label: isEn ? 'UNDER WAY' : '⚒️ جاري العمل الفني', dot: 'bg-blue-400' },
          REJECTED: { bg: 'bg-rose-500/20 border-rose-500/30 text-rose-300', label: isEn ? 'REJECTED' : '❌ ملاحظات فنية وتعديل مطلوب', dot: 'bg-rose-400' },
          INSPECTION_FAILED: { bg: 'bg-rose-500/20 border-rose-500/30 text-rose-300', label: isEn ? 'INSPECTION FAILED' : '❌ معيب ويحتاج إعادة تنفيذ', dot: 'bg-rose-400' },
          INSPECTION_REQUESTED: { bg: 'bg-amber-500/20 border-amber-500/30 text-amber-300', label: isEn ? 'AUDIT REQUESTED' : '⏳ جاري مراجعة استلام المهندس', dot: 'bg-amber-400' },
          NOT_STARTED: { bg: 'bg-gray-500/20 border-gray-500/30 text-gray-400', label: isEn ? 'NOT STARTED' : '📅 مخطط ومدرج بالجدول', dot: 'bg-gray-500' }
        };

        const currentBadge = statusTheme[stage.status] || statusTheme.NOT_STARTED;

        return (
          <div className="fixed inset-0 bg-slate-950/98 z-50 overflow-y-auto flex items-center justify-center p-3 md:p-6 text-right" dir={isEn ? 'ltr' : 'rtl'}>
            <style>{`
              @keyframes slideProgress {
                0% { width: 0%; }
                100% { width: 100%; }
              }
              .animate-slide-progress {
                animation: slideProgress 5000ms linear forwards;
              }
            `}</style>
            
            <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
              
              {/* Close Button info */}
              <button
                onClick={() => setShowPresentation(false)}
                className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 border border-white/10 transition-all cursor-pointer text-sm"
                title={isEn ? 'Close' : 'إغلاق العرض التقديمي'}
              >
                ✕
              </button>

              {/* A. Left Container: Large Image View & Transition (60% weight on desktop) */}
              <div className="relative w-full md:w-3/5 h-64 md:h-[500px] bg-black group overflow-hidden flex items-center justify-center">
                <img 
                  src={activeImg} 
                  alt={stage.name} 
                  className="w-full h-full object-cover opacity-85 transition-all duration-700 ease-out transform scale-102 hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Black Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Slide index tracker / total counter bubble */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-black px-3 py-1 rounded-full border border-white/10" dir="ltr">
                  {currentSlideIndex + 1} / {stages.length}
                </div>

                {/* Trigger zoomed slide image on hover */}
                <button
                  onClick={() => setSlideZoomedImage(activeImg)}
                  className="absolute bottom-4 right-4 bg-[#113C30]/80 hover:bg-[#113C30] text-white p-2 rounded-xl border border-[#D8B448]/30 transition-all cursor-pointer opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[9px] font-bold"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-[#D8B448]" />
                  <span>{isEn ? 'Enlarge Photo' : 'تكبير صورة المطابقة'}</span>
                </button>

                {/* Visual state icon container on center */}
                <div className="absolute top-4 left-4 flex gap-1.5 items-center">
                  <span className="bg-emerald-600 text-white text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg border border-emerald-400 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    <span>{isEn ? 'Investor Pitch Active' : 'مستند العرض الفني المفتوح'}</span>
                  </span>
                </div>
              </div>

              {/* B. Right Container: Rich metadata info-board (40% weight on desktop) */}
              <div className="w-full md:w-2/5 p-5 md:p-7 flex flex-col justify-between text-slate-100 bg-slate-900 border-t md:border-t-0 md:border-r border-white/10">
                
                {/* Header Information */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-black text-[#D8B448] tracking-widest block uppercase mb-1">
                        🔑 {stageNumeralStr}
                      </span>
                      <h3 className="text-base md:text-lg font-black text-white leading-tight tracking-wide">
                        {stage.name}
                      </h3>
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1.5 shrink-0 ${currentBadge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${currentBadge.dot}`} />
                      <span>{currentBadge.label}</span>
                    </span>
                  </div>

                  {/* Stage duration stats & delay highlight */}
                  <div className="grid grid-cols-2 gap-2.5 bg-slate-950/40 p-3 rounded-xl border border-white/5 text-[10px]">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 font-bold block">⏱️ المدة الكلية المعتمدة:</span>
                      <span className="font-extrabold text-white text-xs">{stage.totalDurationDays || 14} يوم عمل متوقع</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-400 font-bold block">📅 الأيام الفعلية المستغرقة:</span>
                      <span className="font-extrabold text-white text-xs">{stage.daysElapsed || 0} يوم عمل منقضي</span>
                    </div>
                  </div>

                  {/* Progress Ring / Progress percent row */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400">انجاز البند الفعلي في الموقع:</span>
                      <span className="text-[#D8B448] font-black">{stage.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden relative border border-white/5">
                      <div 
                        className="bg-[#D8B448] h-full transition-all duration-500 rounded-full" 
                        style={{ width: `${stage.progress}%`, [isEn ? 'left' : 'right']: 0, position: 'absolute' }}
                      />
                    </div>
                  </div>

                  {/* Technical Inspector Audit Report (Highly critical for investors) */}
                  <div className="bg-[#113C30]/20 border border-[#113C30]/45 p-3.5 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#cbece2]">
                      <span>🕵️‍♂️</span>
                      <span>طبيعة العمل ومطابقة الجودة (محضر المعاينة الميدانية):</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-300 font-medium italic">
                      {stage.reportText ? `"${stage.reportText}"` : isEn ? '"Work conforms fully to the high-end finishing standard rules and passes structural test specs."' : '"يجري استيفاء استلام كافة البنود بشكل مطابق للكود الفني المعتمد والملاحظات الهندسية لضمان خلو أعمال البناء والتشطيب من العيوب."'}
                    </p>
                    {stage.reportDate && (
                      <span className="text-[8.5px] text-slate-500 block">🗓️ تاريخ اعتماد المحضر وتصويره: {stage.reportDate}</span>
                    )}
                  </div>

                  {/* Client Feedback Section */}
                  {stage.complaintText && (
                    <div className="bg-[#2B4D89]/25 border border-[#2B4D89]/30 p-3 rounded-xl">
                      <div className="flex items-center gap-1 text-[9.5px] font-extrabold text-blue-300">
                        <span>💬</span>
                        <span>تعليقات ومقترحات العميل (الملتزم بها المقاول):</span>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-1 font-semibold leading-relaxed">
                        "{stage.complaintText}"
                      </p>
                    </div>
                  )}

                  {/* Quality Seal Assurance Badge */}
                  <div className="bg-slate-950/65 border border-white/5 p-2 rounded-xl flex items-center gap-2">
                    <span className="text-lg">🛡️</span>
                    <div className="min-w-0">
                      <h4 className="text-[9.5px] font-black text-white">{isEn ? 'Tripartite Escrow Guarantee' : 'مشمول بضمان شطبها الثلاثي'}</h4>
                      <p className="text-[8px] text-slate-400 truncate">{isEn ? 'Escrow staging ensures your funds are protected' : 'التسليم المالي على أساس البنود يحمي مستحقاتك'}</p>
                    </div>
                  </div>
                </div>

                {/* Slideshow controller buttons & Slide step timeline at bottom */}
                <div className="pt-4 border-t border-white/10 space-y-3.5">
                  
                  {/* Dynamic Slide Playbar timer */}
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full relative">
                    {isAutoPlaying && (
                      <div 
                        key={currentSlideIndex} 
                        className="bg-[#D8B448] h-full animate-slide-progress absolute top-0"
                        style={{ [isEn ? 'left' : 'right']: 0 }} 
                      />
                    )}
                  </div>

                  {/* Navigation Buttons and Autoplay trigger */}
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentSlideIndex(prevIndex)}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 p-2 rounded-xl cursor-pointer transition-all active:scale-95"
                        title={isEn ? 'Previous Stage' : 'البند السابق'}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border font-black cursor-pointer transition-all duration-200 ${
                          isAutoPlaying 
                            ? 'bg-[#113C30]/40 border-[#113C30] text-emerald-300' 
                            : 'bg-white/5 border-white/15 text-white/95'
                        }`}
                      >
                        {isAutoPlaying ? <Pause className="w-3 h-3 text-[#D8B448]" /> : <Play className="w-3 h-3 text-white" />}
                        <span>{isAutoPlaying ? (isEn ? 'Play On' : 'عرض مستمر') : (isEn ? 'Paused' : 'موقوف')}</span>
                      </button>
                      
                      <button
                        onClick={() => setCurrentSlideIndex(nextIndex)}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 p-2 rounded-xl cursor-pointer transition-all active:scale-95"
                        title={isEn ? 'Next Stage' : 'البند التالي'}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="bg-[#D8B448] hover:bg-[#cfa53b] text-slate-950 font-black px-3.5 py-1.5 rounded-xl transition-all cursor-pointer transform hover:scale-102 flex items-center gap-1 active:scale-95"
                    >
                      <span>🖨️</span>
                      <span>{isEn ? 'Print View' : 'طباعة التقرير'}</span>
                    </button>
                  </div>

                  {/* Dot Map or Stage index-strip timeline */}
                  <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none justify-center">
                    {stages.map((st, sidx) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          setCurrentSlideIndex(sidx);
                          setIsAutoPlaying(false);
                        }}
                        className={`text-[8.5px] font-bold px-2 py-1 rounded-md shrink-0 transition-all border whitespace-nowrap overflow-hidden ${
                          sidx === currentSlideIndex 
                            ? 'bg-[#113C30] border-[#D8B448] text-white font-extrabold ring-1 ring-[#D8B448]/30' 
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {arabicNumbers(sidx + 1)}. {st.name.substring(0, 10)}
                      </button>
                    ))}
                  </div>

                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* 🖼️ HIGH RESOLUTION SLIDE ZOOM OVERLAY */}
      {slideZoomedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-55 flex flex-col items-center justify-center p-4 transition-all"
          onClick={() => setSlideZoomedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl bg-black">
            <img 
              src={slideZoomedImage} 
              alt="slide zoom" 
              className="max-w-full max-h-[90vh] object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setSlideZoomedImage(null)}
              className="absolute top-4 right-4 bg-slate-800/80 hover:bg-slate-950 text-white p-2.5 rounded-full cursor-pointer border border-white/20 text-sm font-black"
              title={isEn ? 'Close Details' : 'إغلاق التفاصيل'}
            >
              ✕
            </button>
          </div>
          <p className="text-white/80 text-[11px] font-bold mt-3">
            {isEn ? 'High Resolution Inspection Evidence' : 'صورة المطابقة الميدانية بدقتها الكاملة - نظام تدقيق جودة شطبها'}
          </p>
        </div>
      )}

    </div>
  );
};
