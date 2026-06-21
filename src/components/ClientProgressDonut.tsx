import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { ProjectStage } from '../types';

interface ClientProgressDonutProps {
  stages: ProjectStage[];
  requestId: string;
  isEn: boolean;
}

export const ClientProgressDonut: React.FC<ClientProgressDonutProps> = ({
  stages,
  requestId,
  isEn,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Filter and map the stages for this project
  const activeStages = stages.filter(s => s.requestId === requestId);

  if (activeStages.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center text-gray-400 text-xs font-bold">
        {isEn ? 'No stages details are available to plot.' : 'لا توجد تفاصيل مراحل متاحة للرسم البياني حالياً.'}
      </div>
    );
  }

  // Calculate overall average progress
  const sumProgress = activeStages.reduce((sum, stg) => sum + stg.progress, 0);
  const overallProgress = Math.round(sumProgress / activeStages.length);

  // Color palette for the stages
  const COLORS = {
    completed: '#10B981', // Rich Emerald
    active: '#3B82F6',    // Electric Blue
    pending: '#94A3B8',   // Cool Slate
    troubled: '#EF4444',  // Coral Red
  };

  // Helper to translate stage status labels
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return isEn ? '✓ Completed & Verified' : '✓ معتمد ومكتمل';
      case 'UNDER_REVIEW':
        return isEn ? '⏳ Under Review' : '⏳ قيد المراجعة الفنية';
      case 'REJECTED':
        return isEn ? '⚠️ Action Required' : '⚠️ بحاجة لتعليق فني';
      default:
        return isEn ? '○ Scheduled' : '○ مجدول للبدء';
    }
  };

  // Translate stage name if necessary
  const getStageName = (rawName: string) => {
    if (isEn) {
      if (rawName.includes('سباكة') || rawName.toLowerCase().includes('plumb')) return 'Plumbing & Drainage';
      if (rawName.includes('كهرباء') || rawName.toLowerCase().includes('electr')) return 'Electrical Wiring';
      if (rawName.includes('محارة') || rawName.toLowerCase().includes('plas') || rawName.toLowerCase().includes('ceil')) return 'Plastering & Ceilings';
      if (rawName.includes('دهان') || rawName.toLowerCase().includes('paint')) return 'Painting & Final Touches';
      return rawName;
    }
    return rawName;
  };

  // Build data specifically for Recharts Pie
  // Since some progress could be 0, we represent the absolute scale
  // But to make the Donut look visually perfect as a progressive partition of 4 main phases:
  // We can assign each phase equal weight (e.g. value: 25) so each quarter is a neat slice,
  // then color it proportionally as a gradient or based on its state!
  const pieData = activeStages.map((stg, index) => {
    const rawName = stg.name;
    const transName = getStageName(rawName);
    const progressVal = stg.progress || 0;

    // Determine status color based on completion & state
    let color = COLORS.pending;
    if (stg.progress === 100 || stg.status === 'APPROVED') {
      color = COLORS.completed;
    } else if (stg.progress > 0) {
      color = COLORS.active;
    } else if (stg.complaintText) {
      color = COLORS.troubled;
    }

    return {
      id: stg.id,
      name: transName,
      rawName: stg.name,
      value: 25, // Equal weight to represent a structured clock-face of 4 phases of construction
      progress: progressVal,
      status: stg.status,
      color: color,
      statusLabel: getStatusLabel(stg.status),
    };
  });

  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handlePieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div 
      className="bg-white rounded-3xl border border-gray-150 p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-center gap-6"
      style={{ direction: isEn ? 'ltr' : 'rtl' }}
    >
      
      {/* Donut Chart visual column */}
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center font-sans">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={76}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={handlePieEnter}
              onMouseLeave={handlePieLeave}
              cursor="pointer"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${entry.id}`} 
                  fill={entry.color} 
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
                  stroke={activeIndex === index ? '#1E293B' : '#FFFFFF'}
                  strokeWidth={activeIndex === index ? 2 : 1.5}
                  className="transition-all duration-300"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-2xl text-[10.5px] space-y-1 text-center shadow-xl font-sans shrink-0">
                      <p className="font-ex-bold text-amber-400 font-black">{data.name}</p>
                      <p className="font-extrabold text-[#113C30] text-[9.5px] font-sans">
                        {isEn ? 'Completion:' : 'نسبة الإنجاز:'}{' '}
                        <span className="font-mono text-emerald-400 font-black">{data.progress}%</span>
                      </p>
                      <p className="text-gray-400 text-[8.5px]">{data.statusLabel}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label inside the Donut showing overall global rate */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            {isEn ? 'Overall Progress' : 'نسبة الإنجاز'}
          </span>
          <span className="text-3xl font-black text-[#2B4D89] font-mono leading-none my-1 animate-shimmer">
            {overallProgress}%
          </span>
          <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-full border ${
            overallProgress >= 50 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
              : 'bg-blue-50 text-blue-700 border-blue-150'
          }`}>
            {overallProgress === 100 
              ? (isEn ? 'Verified Done' : 'مكتمل بالكامل ✓') 
              : (isEn ? 'Active Build' : 'التنفيذ جاري 🛠️')}
          </span>
        </div>
      </div>

      {/* Info & Stages Progress List Column */}
      <div className="flex-1 space-y-3.5 w-full">
        <div>
          <h4 className="font-black text-[13px] sm:text-sm text-slate-800 flex items-center gap-1.5 justify-start">
            <span className="text-lg">📊</span>
            <span>{isEn ? 'Comprehensive Milestone Progress View' : 'الرصد الفني لمراحل التشطيب وبنود المقايسة'}</span>
          </h4>
          <p className="text-[10px] text-gray-500 leading-normal">
            {isEn 
              ? 'This chart details real-time checklist completion ratios audit by Shattabha consulting supervisor.'
              : 'تمثل السعة الدائرية وزن البنود وتوزيعها الزمني، ونسبة الإنجاز الحالية مقاسة وفق تقارير المطابقة الميدانية.'}
          </p>
        </div>

        {/* Detailed custom interactive list of stages resembling legends */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
          {pieData.map((stg, index) => {
            const isHovered = activeIndex === index;
            return (
              <div 
                key={stg.id}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isHovered 
                    ? 'bg-slate-50 border-slate-300 shadow-xs translate-x-1 sm:translate-none' 
                    : 'bg-white border-gray-150 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Circle Indicator matching chart colors */}
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 flex-none" 
                      style={{ backgroundColor: stg.color }} 
                    />
                    <span className="text-[10.5px] font-extrabold text-gray-800 truncate font-sans">
                      {stg.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-black font-mono text-[#2B4D89] shrink-0">
                    {stg.progress}%
                  </span>
                </div>
                
                {/* Horizontal simple progress bar for the stage itself inside the item list for dual clarity */}
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-150 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stg.progress}%`,
                        backgroundColor: stg.color
                      }}
                    />
                  </div>
                  <span className="text-[8px] text-gray-400 font-bold shrink-0">{stg.statusLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
