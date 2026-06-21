import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { ProjectStage } from '../types';

interface ProjectProgressChartProps {
  stages: ProjectStage[];
  requestId: string;
  isEn: boolean;
}

export const ProjectProgressChart: React.FC<ProjectProgressChartProps> = ({
  stages,
  requestId,
  isEn
}) => {
  const activeStages = stages.filter(s => s.requestId === requestId);

  if (activeStages.length === 0) {
    return null;
  }

  // Map data to represent completion percent vs physical elapsed timeline ration
  const chartData = activeStages.map(stg => {
    // Translate stage name if necessary
    const rawName = stg.name;
    const transName = isEn 
      ? (rawName === 'تأسيس السباكة والصرف' ? 'Plumbing & Drainage' : 
         rawName === 'تأسيس الكهرباء والإنارة' ? 'Electric & Lighting' : 
         rawName === 'أعمال المحارة والأسقف' ? 'Plastering & Ceiling' : 
         rawName === 'الدهانات والتشطيب النهائي' ? 'Final Painting' : rawName) 
      : rawName;

    const actualProgress = stg.progress || 0;
    
    // Duration math: elapsed vs total planned duration
    const totalDays = stg.totalDurationDays || 15;
    const elapsedDays = stg.daysElapsed || 0;
    
    // Schedule elapsed ratio (planned percent of time used)
    const schedulePercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

    // Calculate delta (positive is good/ahead of schedule, negative is warning/delayed)
    const delta = actualProgress - schedulePercent;
    
    return {
      name: transName,
      actualProgress,
      schedulePercent,
      elapsedDays,
      totalDays,
      status: stg.status,
      delta
    };
  });

  // Calculate high-level summary indicators
  const averageActual = Math.round(chartData.reduce((acc, curr) => acc + curr.actualProgress, 0) / chartData.length);
  const averagePlanned = Math.round(chartData.reduce((acc, curr) => acc + curr.schedulePercent, 0) / chartData.length);
  const overallStatus = averageActual >= averagePlanned 
    ? (isEn ? 'On Track / Ahead' : 'ملتزم بالجدول الزمني 📈') 
    : (isEn ? 'Behind Schedule' : 'مستأخر عن الجدول الزمني ⚠️');

  return (
    <div id="project-timeline-chart-card" className="bg-white rounded-3xl border border-gray-150 p-5 md:p-6 shadow-sm space-y-4">
      
      {/* Title & Stats Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-right" style={{ direction: isEn ? 'ltr' : 'rtl' }}>
        <div>
          <h4 className="font-black text-sm text-[#0F172A] flex items-center gap-1.5 justify-start">
            <span className="text-xl">📊</span>
            <span>{isEn ? 'On-Site Execution vs. Planned Timeline' : 'مؤشر أداء الإنجاز الفعلي مقارنة بالخطة الزمنية'}</span>
          </h4>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {isEn 
              ? 'Real-time synchronization of engineering milestones against scheduled contractual duration.'
              : 'مقارنة فنية حية لنسب تنفيذ البنود بالموقع مع جدول توزيع الأيام المتفق عليه بالعقد.'}
          </p>
        </div>

        {/* Dynamic Badge for Transparency */}
        <div className="flex items-center gap-2 select-none justify-start">
          <div className={`px-3 py-1.5 rounded-xl text-[10.5px] font-black border ${
            averageActual >= averagePlanned 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <span className="opacity-75">{isEn ? 'Project Health: ' : 'حالة الجدول الزمني: '}</span>
            <span>{overallStatus}</span>
          </div>
        </div>
      </div>

      {/* Visual Indicator Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" style={{ direction: isEn ? 'ltr' : 'rtl' }}>
        <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-2xl">
          <span className="text-[10px] text-gray-500 font-bold block">{isEn ? 'Avg Actual Progress' : 'متوسط الإنجاز الفعلي'}</span>
          <span className="text-sm font-black text-[#3154CD] inline-flex items-center gap-1">
            {averageActual}%
            <span className="text-[10px] text-gray-400 font-normal">({isEn ? 'of work' : 'من الأعمال'})</span>
          </span>
        </div>

        <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-2xl">
          <span className="text-[10px] text-gray-500 font-bold block">{isEn ? 'Avg Time Elapsed' : 'متوسط الزمن المنقضي'}</span>
          <span className="text-sm font-black text-[#E5A910] inline-flex items-center gap-1">
            {averagePlanned}%
            <span className="text-[10px] text-gray-400 font-normal">({isEn ? 'of schedule' : 'من الوقت'})</span>
          </span>
        </div>

        <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-2xl col-span-2 sm:col-span-1 flex items-center justify-between sm:block">
          <span className="text-[10px] text-gray-500 font-bold block">{isEn ? 'Schedules Alignment' : 'تطابق الخطة'}</span>
          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg inline-block ${
            averageActual >= averagePlanned 
              ? 'text-emerald-700 bg-emerald-100/50' 
              : 'text-amber-700 bg-amber-100/50'
          }`}>
            {averageActual >= averagePlanned 
              ? (isEn ? `+${averageActual - averagePlanned}% Ahead` : `متقدم بـ +${averageActual - averagePlanned}%`)
              : (isEn ? `${averageActual - averagePlanned}% Delayed` : `متأخر بـ ${averageActual - averagePlanned}%`)
            }
          </span>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="h-60 sm:h-64 font-sans text-[10.5px]" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              stroke="#64748B" 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 10, fontWeight: 700 }}
            />
            <YAxis 
              stroke="#64748B" 
              tickLine={false} 
              axisLine={false}
              domain={[0, 100]}
              tick={{ fontSize: 9 }}
              unit="%"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-700 text-right space-y-1.5 shadow-xl font-sans" style={{ direction: 'rtl' }}>
                      <p className="font-extrabold text-xs text-amber-400 border-b border-slate-700 pb-1">{data.name}</p>
                      
                      <p className="text-[10px] flex items-center justify-between gap-3">
                        <span className="text-gray-300 font-bold">{isEn ? 'Actual Work Done:' : 'الإنجاز الفعلي بالموقع:'}</span>
                        <span className="font-mono text-emerald-400 font-black">{data.actualProgress}%</span>
                      </p>

                      <p className="text-[10px] flex items-center justify-between gap-3">
                        <span className="text-gray-300 font-bold">{isEn ? 'Time Limit Used:' : 'المستهلك من زمن المرحلة:'}</span>
                        <span className="font-mono text-amber-400 font-black">{data.schedulePercent}% ({data.elapsedDays}/{data.totalDays} {isEn ? 'days' : 'يوم'})</span>
                      </p>

                      <p className="text-[10px] pt-1 border-t border-slate-700 font-extrabold text-white flex items-center justify-between gap-3">
                        <span>{isEn ? 'Status:' : 'الحالة:'}</span>
                        <span className={`${
                          data.delta >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {data.delta >= 0 
                            ? (isEn ? `Ahead of timeline (+${data.delta}%)` : `متقدم ومطابق للمواصفات (+${data.delta}%)`)
                            : (isEn ? `Delayed under risk (${data.delta}%)` : `تأخير تقني يستلزم متابعة (${data.delta}%)`)}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            <Legend 
              wrapperStyle={{ fontSize: '10.5px', fontWeight: 600, paddingTop: '10px' }}
              iconSize={10}
            />

            {/* Actual Work Done is represented as a Premium Blue Bar with high visual contrast */}
            <Bar 
              name={isEn ? "Actual Work Completed (%)" : "نسبة الإنجاز الفعلي (%)"} 
              dataKey="actualProgress" 
              fill="#3154CD" 
              radius={[6, 6, 0, 0]}
              barSize={28}
            />

            {/* Planned Schedule progress is represented as a Radiant Amber Solid Line */}
            <Line 
              name={isEn ? "Planned Time Elapsed (%)" : "المستهلك من زمن المرحلة (%)"} 
              type="monotone" 
              dataKey="schedulePercent" 
              stroke="#E5A910" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 1 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Micro Info Note in subtle Mono Type */}
      <div className="flex items-center gap-1.5 justify-end text-[9px] text-gray-500 font-bold" style={{ direction: isEn ? 'ltr' : 'rtl' }}>
        <span>ℹ️</span>
        <span>
          {isEn
            ? 'Engineering metrics are compiled under escrow guidelines to calculate precise on-site milestones.'
            : 'يتم احتساب هذه المؤشرات آلياً من خلال تقارير المطابقة الفنية الصادرة من مهندس الموقع المعتمد.'}
        </span>
      </div>
    </div>
  );
};
