import React from 'react';
import { ClientRequest, Offer, Company } from '../types';

interface BidComparisonDashboardProps {
  request: ClientRequest;
  offers: Offer[]; // All available active offers for this request
  companies: Company[];
  isEn: boolean;
  selectedCompareOfferIds: string[];
  setSelectedCompareOfferIds: React.Dispatch<React.SetStateAction<string[]>>;
  comparisonPriority: 'BALANCED' | 'PRICE' | 'DURATION' | 'RATING' | 'MATERIALS';
  setComparisonPriority: (p: 'BALANCED' | 'PRICE' | 'DURATION' | 'RATING' | 'MATERIALS') => void;
  onViewOfferDetails: (off: Offer) => void;
  onSelectProfileCompany: (comp: Company) => void;
  allRequests?: ClientRequest[]; // 🌟 Historical requests for pricing transparency
}

export const BidComparisonDashboard: React.FC<BidComparisonDashboardProps> = ({
  request,
  offers,
  companies,
  isEn,
  selectedCompareOfferIds,
  setSelectedCompareOfferIds,
  comparisonPriority,
  setComparisonPriority,
  onViewOfferDetails,
  onSelectProfileCompany,
  allRequests = []
}) => {
  const sortedByPrice = [...offers].sort((a, b) => a.price - b.price);
  const sortedByDuration = [...offers].sort((a, b) => a.durationDays - b.durationDays);
  const sortedByRating = [...offers].sort((a, b) => {
    const compA = companies.find(c => c.id === a.companyId);
    const compB = companies.find(c => c.id === b.companyId);
    return (compB?.rating || 0) - (compA?.rating || 0);
  });

  const bestPriceOffer = sortedByPrice[0] || offers[0];
  const fastestOffer = sortedByDuration[0] || offers[0];
  const bestRatedOffer = sortedByRating[0] || offers[0];

  // Helper function to calculate scores dynamically
  const getScoreBreakdown = (off: Offer) => {
    if (!bestPriceOffer || !fastestOffer) {
      return { priceScore: 100, durationScore: 100, ratingScore: 100, materialsScore: 100, overall: 100, hasPremiumBrands: false };
    }
    // 1. Price Score (inverse relation with price)
    const priceScore = Math.round((bestPriceOffer.price / off.price) * 100);
    // 2. Duration Score (inverse relation with days)
    const durationScore = Math.round((fastestOffer.durationDays / off.durationDays) * 100);
    // 3. Rating Score (ratio out of 5)
    const comp = companies.find(c => c.id === off.companyId);
    const compRating = comp?.rating || 4.7;
    const ratingScore = Math.round((compRating / 5) * 100);
    // 4. Materials Score (content evaluation)
    const descLower = off.description.toLowerCase();
    const hasPremiumBrands = descLower.includes('سويدي') || descLower.includes('سافيتو') || descLower.includes('جوتن') || descLower.includes('elsewedy') || descLower.includes('jotun');
    const materialsScore = hasPremiumBrands ? 98 : 82;

    // Calculate overall weighted score based on chosen priority
    let overall = 0;
    if (comparisonPriority === 'BALANCED') {
      overall = Math.round(0.25 * priceScore + 0.25 * durationScore + 0.25 * ratingScore + 0.25 * materialsScore);
    } else if (comparisonPriority === 'PRICE') {
      overall = Math.round(0.55 * priceScore + 0.15 * durationScore + 0.15 * ratingScore + 0.15 * materialsScore);
    } else if (comparisonPriority === 'DURATION') {
      overall = Math.round(0.15 * priceScore + 0.55 * durationScore + 0.15 * ratingScore + 0.15 * materialsScore);
    } else if (comparisonPriority === 'RATING') {
      overall = Math.round(0.15 * priceScore + 0.15 * durationScore + 0.55 * ratingScore + 0.15 * materialsScore);
    } else if (comparisonPriority === 'MATERIALS') {
      overall = Math.round(0.15 * priceScore + 0.15 * durationScore + 0.15 * ratingScore + 0.55 * materialsScore);
    }

    return {
      priceScore,
      durationScore,
      ratingScore,
      materialsScore,
      overall,
      hasPremiumBrands
    };
  };

  // State elements for AI Deep pricing transparency report
  const [pricingAnalysis, setPricingAnalysis] = React.useState<any>(null);
  const [pricingLoading, setPricingLoading] = React.useState<boolean>(false);
  const [pricingError, setPricingError] = React.useState<string | null>(null);

  const finalComparedOffers = offers.filter(o => selectedCompareOfferIds.includes(o.id));

  React.useEffect(() => {
    const fetchPricingAnalysis = async () => {
      if (!request || !finalComparedOffers || finalComparedOffers.length === 0) {
        setPricingAnalysis(null);
        return;
      }
      setPricingLoading(true);
      setPricingError(null);
      try {
        const response = await fetch('/api/ai/analyze-pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request,
            offers: finalComparedOffers,
            allRequests,
            companies
          })
        });
        if (!response.ok) {
          throw new Error('Failed to analyze pricing.');
        }
        const resData = await response.json();
        if (resData.success && resData.data) {
          setPricingAnalysis(resData.data);
        } else {
          throw new Error('Analysis failed');
        }
      } catch (err: any) {
        console.error("Pricing analyzer error:", err);
        setPricingError(isEn ? 'Pricing check temporarily unavailable.' : 'تحليل التسعير بمتوسطات السوق غير متوفر حالياً.');
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricingAnalysis();
  }, [request?.id, selectedCompareOfferIds.join(',')]);

  const [aiAnalysis, setAiAnalysis] = React.useState<any>(null);
  const [aiLoading, setAiLoading] = React.useState<boolean>(false);
  const [aiError, setAiError] = React.useState<string | null>(null);

  const handleAIClick = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/compare-bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request,
          offers: finalComparedOffers,
          priority: comparisonPriority
        })
      });
      if (!response.ok) {
        throw new Error('Failed to generate analysis.');
      }
      const resData = await response.json();
      if (resData.success && resData.data) {
        setAiAnalysis(resData.data);
      } else {
        throw new Error(resData.error || 'Server error');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(isEn ? 'Could not generate AI Analysis. Please try again.' : 'تعذر تحميل مستند تحليل الذكاء الاصطناعي الفني حالياً. يرجى المحاولة لاحقاً.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFDFB] rounded-3xl border border-[#AFDEC9] p-5 md:p-6 space-y-6 shadow-xs text-right">
      
      {/* 🧭 Interactive Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#AFDEC9]/35 flex-row-reverse">
        <div className="text-right">
          <h3 className="font-black text-sm md:text-base text-[#123E32] flex items-center gap-2 justify-end flex-row-reverse">
            <span>📊</span> {isEn ? 'Interactive Bid Comparison Dashboard' : 'لوحة مقارنة عروض الأسعار التفاعلية'}
          </h3>
          <p className="text-[10px] text-gray-500 font-medium">
            {isEn ? 'Select specific quotes to compare side-by-side, tune priority parameters, and view technical ratings instantly.' : 'اختر عروض أسعار محددة ومقارنتها جنباً إلى جنب لتصفح كلفة الباقات ومواصفات خامات العمل لتسهيل قرارك.'}
          </p>
        </div>
        <span className="bg-[#123E32] text-emerald-300 text-[9px] font-black px-2.5 py-1 rounded-full shrink-0">
          {isEn ? '⚡ Active Comparison' : '⚡ مفاضلة تفاعلية حية'}
        </span>
      </div>

      {/* 🔍 Interactive Quote Selector Panel */}
      <div className="bg-white border border-gray-150 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2 flex-row-reverse">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-black block text-right">
            📌 {isEn ? 'Select price quotes to compare:' : 'اختر عروض الأسعار التي ترغب بضمها في المقارنة لعقـد المفاضلة السريعة:'}
          </span>
          <div className="flex items-center gap-2" dir="ltr">
            <button
              type="button"
              onClick={() => setSelectedCompareOfferIds(offers.map(o => o.id))}
              className="text-[#2B4D89] text-[9.5px] font-black hover:underline px-2.5 py-1 rounded-md hover:bg-slate-50 cursor-pointer border border-[#2B4D89]/20"
            >
              {isEn ? 'Select All' : 'تحديد الكل'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCompareOfferIds([])}
              className="text-red-600 text-[9.5px] font-black hover:underline px-2.5 py-1 rounded-md hover:bg-red-50 cursor-pointer border border-red-250"
            >
              {isEn ? 'Deselect All' : 'إلغاء التحديد'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 animate-fade-in" dir="rtl">
          {offers.map((off, idx) => {
            const isSelected = selectedCompareOfferIds.includes(off.id);
            const comp = companies.find(c => c.id === off.companyId);
            const breakdown = getScoreBreakdown(off);
            return (
              <div
                key={off.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedCompareOfferIds(prev => prev.filter(id => id !== off.id));
                  } else {
                    setSelectedCompareOfferIds(prev => [...prev, off.id]);
                  }
                }}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden text-right hover:shadow-xs hover:scale-[1.01] ${
                  isSelected 
                    ? 'bg-emerald-50/20 border-emerald-500 shadow-3xs ring-1 ring-emerald-500/10' 
                    : 'bg-white border-gray-150 hover:border-gray-350'
                }`}
              >
                {/* Top bar with tag */}
                <div className="flex items-center justify-between gap-1.5 flex-row-reverse">
                  <div className="flex items-center gap-1.5 flex-row-reverse">
                    <span className={`w-4 h-4 rounded border flex items-center justify-center text-[9px] ${
                      isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-250 text-transparent'
                    }`}>
                      ✓
                    </span>
                    <span className="font-extrabold text-[11px] text-gray-800">
                      {isEn ? `Quote #${idx + 1}` : `عرض سعر #${idx + 1}`}
                    </span>
                  </div>
                  <span className="bg-slate-100 text-slate-800 text-[8.5px] font-bold px-1.5 py-0.5 rounded font-mono">
                    {breakdown.overall}% ملاءمة
                  </span>
                </div>

                {/* Core numbers */}
                <div className="space-y-0.5 mt-1">
                  <div className="text-sm font-black text-emerald-800">
                    {off.price.toLocaleString()} {isEn ? 'EGP' : 'ج.م'}
                  </div>
                  <div className="text-[9.5px] font-bold text-gray-500">
                     {isEn ? `Timeline: ${off.durationDays} days` : `الجدول: ${off.durationDays} يوماً`}
                  </div>
                </div>

                {/* Contractor rate & name */}
                <div className="flex items-center justify-between text-[8.5px] text-gray-400 font-bold border-t border-gray-100/85 pt-1.5 flex-row-reverse mt-1">
                  <span>⭐ {comp?.rating || '4.8'} / 5</span>
                  <span className="truncate max-w-[110px] text-slate-600 font-semibold direct-rtl text-right">
                    {comp?.companyName ? comp.companyName.replace(/^(شركة|مكتب|مؤسسة|مجموعة|مؤسسه|مكتب الاستشارات الهندسية|Company|Office|Group|Studio)\s+/, '').trim().slice(0, 4) + '...' : `عرض سعر ${idx + 1}`}
                  </span>
                </div>

                {/* Small diagonal flag if cheapest/fastest */}
                {bestPriceOffer?.id === off.id && (
                  <div className="absolute top-0 left-0 bg-emerald-600 text-white text-[7.5px] px-1.5 font-bold rounded-br">
                    {isEn ? 'BEST BUDGET' : '💰 الأوفر'}
                  </div>
                )}
                {fastestOffer?.id === off.id && bestPriceOffer?.id !== off.id && (
                  <div className="absolute top-0 left-0 bg-blue-600 text-white text-[7.5px] px-1.5 font-bold rounded-br">
                    {isEn ? 'FASTEST' : '⚡ الأسرع'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 🎛️ Interactive Comparison Priority Switcher */}
      <div className="bg-[#FAFDFB] border border-gray-150 p-4 rounded-xl space-y-3">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold block text-right">
          🎯 {isEn ? 'Customize Weights & Priority Focus factors:' : 'تخصيص قواعد المطابقة: اضغط لتعديل مبدأ الأولوية المرجحة للمفاضلة فوراً:'}
        </span>
        <div className="flex flex-col gap-2" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              onClick={() => setComparisonPriority('BALANCED')}
              className={`px-2 py-2.5 rounded-xl text-[10px] sm:text-[11px] text-center leading-snug font-black cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 ${
                comparisonPriority === 'BALANCED' 
                  ? 'bg-[#123E32] text-white shadow-xs' 
                  : 'bg-white hover:bg-gray-50 border border-gray-250 text-gray-600'
              }`}
            >
              <span className="text-sm">⚖️</span> <span>{isEn ? 'Balanced View' : 'مبدأ التوزان العام (متكافئ)'}</span>
            </button>
            <button
              onClick={() => setComparisonPriority('PRICE')}
              className={`px-2 py-2.5 rounded-xl text-[10px] sm:text-[11px] text-center leading-snug font-black cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 ${
                comparisonPriority === 'PRICE' 
                  ? 'bg-[#0F7453] text-white shadow-xs' 
                  : 'bg-white hover:bg-gray-50 border border-gray-250 text-gray-600'
              }`}
            >
              <span className="text-sm">💰</span> <span>{isEn ? 'Budget Focus' : 'أولوية وفر الميزانية (أقل تكلفة)'}</span>
            </button>
            <button
              onClick={() => setComparisonPriority('DURATION')}
              className={`px-2 py-2.5 rounded-xl text-[10px] sm:text-[11px] text-center leading-snug font-black cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 ${
                comparisonPriority === 'DURATION' 
                  ? 'bg-blue-700 text-white shadow-xs' 
                  : 'bg-white hover:bg-gray-50 border border-gray-250 text-gray-600'
              }`}
            >
              <span className="text-sm">⚡</span> <span>{isEn ? 'Fastest Handover Limit' : 'أولوية سرعة الإنجاز والجدول الزمني'}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:px-[16.666%]">
            <button
              onClick={() => setComparisonPriority('RATING')}
              className={`px-2 py-2.5 rounded-xl text-[10px] sm:text-[11px] text-center leading-snug font-black cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 ${
                comparisonPriority === 'RATING' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'bg-white hover:bg-gray-50 border border-gray-250 text-gray-600'
               }`}
             >
               <span className="text-sm">⭐</span> <span>{isEn ? 'Provider Ratings & Record' : 'أولوية تقييم الشركة وبنود الثقة الفنية'}</span>
             </button>
             <button
               onClick={() => setComparisonPriority('MATERIALS')}
               className={`px-2 py-2.5 rounded-xl text-[10px] sm:text-[11px] text-center leading-snug font-black cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 ${
                 comparisonPriority === 'MATERIALS' 
                   ? 'bg-purple-700 text-white shadow-xs' 
                   : 'bg-white hover:bg-gray-50 border border-gray-250 text-gray-600'
               }`}
             >
               <span className="text-sm">🧱</span> <span>{isEn ? 'Premium Material Brands' : 'أولوية نوع وجودة الخامات (السويدي وجوتن)'}</span>
             </button>
          </div>
        </div>
      </div>

      {/* Quick Alert if 0 offers selected */}
      {finalComparedOffers.length === 0 ? (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-8 text-center space-y-3 text-amber-900 shadow-xs">
          <div className="text-3xl">⚠️</div>
          <h4 className="font-extrabold text-xs">
            {isEn ? 'No Bids Selected for Comparison' : 'لم يتم اختيار أي عروض مقارنة'}
          </h4>
          <p className="text-[10px] leading-relaxed max-w-md mx-auto font-bold text-gray-500">
            {isEn 
              ? 'Please select/activate at least one price quote from the dynamic selector above to begin side-by-side technical and financial analysis.'
              : 'يرجى تفعيل أو النقر على عرض سعر واحد على الأقل من شريط المربعات في الأعلى لإظهار وتحليل محددات المفاضلة وباقات التشطيب المالي.'}
          </p>
          <button
            type="button"
            onClick={() => setSelectedCompareOfferIds(offers.map(o => o.id))}
            className="bg-[#123E32] hover:bg-opacity-95 text-white font-black text-[10px] px-5 py-2.5 rounded-xl border border-[#AFDEC9]/30 transition-all cursor-pointer"
          >
            {isEn ? 'Compare All Available Quotes' : 'مقارنة كافة العروض المستلمة فوراً'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Highlight Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-250 flex items-start gap-2.5 shadow-2xs">
              <div className="p-2 bg-[#F0F3F7] rounded-xl text-emerald-700 shrink-0 select-none">
                💰
              </div>
              <div className="space-y-0.5 text-right w-full min-w-0">
                <span className="text-[9px] text-gray-400 font-bold block truncate">{isEn ? 'Best Financial Savings' : 'أفضل وفر مالي (أرخص سعر)'}</span>
                <p className="text-xs font-black text-[#123E32] truncate">
                  {isEn ? `Quote #${offers.indexOf(bestPriceOffer) + 1}` : `عرض رقم ${offers.indexOf(bestPriceOffer) + 1}`}
                </p>
                <p className="text-[11px] font-bold text-emerald-600 truncate">
                  {bestPriceOffer.price.toLocaleString()} {isEn ? 'EGP' : 'ج.م'}
                </p>
              </div>
            </div>

            {/* Duration Highlight */}
            <div className="bg-white p-3.5 rounded-2xl border border-blue-200 flex items-start gap-2.5 shadow-2xs">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-700 shrink-0 select-none">
                ⚡
              </div>
              <div className="space-y-0.5 text-right w-full min-w-0">
                <span className="text-[9px] text-gray-400 font-bold block truncate">{isEn ? 'Fastest Handover Track' : 'أسرع تسليم (أقصر مدة)'}</span>
                <p className="text-xs font-black text-gray-800 truncate">
                  {isEn ? `Quote #${offers.indexOf(fastestOffer) + 1}` : `عرض رقم ${offers.indexOf(fastestOffer) + 1}`}
                </p>
                <p className="text-[11px] font-bold text-blue-600 truncate">
                  {fastestOffer.durationDays} {isEn ? 'days limit' : 'يوماً فقط'}
                </p>
              </div>
            </div>

            {/* Rating Highlight */}
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200 flex items-start gap-2.5 shadow-2xs">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-700 shrink-0 select-none">
                ⭐
              </div>
              <div className="space-y-0.5 text-right w-full min-w-0">
                <span className="text-[9px] text-gray-400 font-bold block truncate">{isEn ? 'Highest Reviewed Quality' : 'الأعلى مراجعة (الأعلى تقييماً)'}</span>
                <p className="text-xs font-black text-gray-800 truncate">
                  {isEn ? `Quote #${offers.indexOf(bestRatedOffer) + 1}` : `عرض رقم ${offers.indexOf(bestRatedOffer) + 1}`}
                </p>
                <div className="text-[11px] font-bold text-amber-600 flex items-center justify-end flex-row-reverse gap-1 mt-0.5 min-w-0" dir="rtl">
                  <span className="flex text-amber-500 font-serif shrink-0">
                    {"★".repeat(Math.round(companies.find(c => c.id === bestRatedOffer.companyId)?.rating || 5))}
                    {"☆".repeat(5 - Math.round(companies.find(c => c.id === bestRatedOffer.companyId)?.rating || 5))}
                  </span>
                  <span className="font-bold text-gray-750 text-xs shrink-0">({companies.find(c => c.id === bestRatedOffer.companyId)?.rating || 4.9})</span>
                </div>
              </div>
            </div>
          </div>

          {/* 📊 AI Market Price Transparency Analyst (مستشار شفافية تسعير السوق) */}
          {finalComparedOffers.length > 0 && (
            <div className="bg-[#FAFBFD] rounded-2xl border border-blue-200/60 p-4 sm:p-5 space-y-4 shadow-3xs text-right">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-gray-150 flex-row-reverse">
                <div className="text-right">
                  <h4 className="font-extrabold text-[#2B4D89] text-xs sm:text-sm flex items-center gap-1.5 justify-end">
                    <span className="text-base">🔍</span> <span>{isEn ? 'AI Pricing Transparency Analyzer & Market Baseline' : 'مستشار شفافية تسعير السوق والمطابقة الفنية'}</span>
                  </h4>
                  <p className="text-[9.5px] text-gray-500 font-medium">
                    {isEn ? 'Reviews incoming rates against platform historic projects to ensure fair market estimation.' : 'معايرة ذكية تسحب تلقائياً متوسطات ميزانيات المشاريع المماثلة وباقات عقود المنصة للتأكد من خلو العرض من التضخم.'}
                  </p>
                </div>
                {pricingLoading && (
                  <span className="animate-spin text-xs inline-block border-2 border-[#2B4D89] border-t-transparent rounded-full w-4 h-4 shrink-0"></span>
                )}
              </div>

              {pricingError && (
                <div className="bg-red-50 text-red-650 p-2.5 rounded-lg text-[10px] text-center font-bold">
                  ⚠️ {pricingError}
                </div>
              )}

              {pricingAnalysis && (
                <div className="space-y-4 animate-fade-in" dir="rtl">
                  {/* Core metrics comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-gray-200 text-right">
                      <span className="text-[9px] text-gray-400 font-bold block">{isEn ? 'Shattabha Std Market Avg:' : 'متوسط سعر المتر في السوق:'}</span>
                      <p className="text-sm font-black text-[#2B4D89] mt-0.5">
                        {pricingAnalysis.marketAverageSqm?.toLocaleString()} <span className="text-[10px] text-gray-400 font-bold">{isEn ? 'EGP / m²' : 'ج.م / م²'}</span>
                      </p>
                      <span className="text-[8px] text-gray-400 block mt-0.5">
                        {isEn ? 'Calibrated across similar requests' : `تمت المعايرة عبر ميزانيات مشاريع مماثلة`}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200 text-right">
                      <span className="text-[9px] text-gray-400 font-bold block">{isEn ? 'Fair Project estimate:' : 'السعر الإجمالي العادل لطلبك:'}</span>
                      <p className="text-sm font-black text-emerald-800 mt-0.5">
                        {pricingAnalysis.marketAverageTotal?.toLocaleString()} <span className="text-[10px] text-gray-400 font-bold">{isEn ? 'EGP' : 'ج.م'}</span>
                      </p>
                      <span className="text-[8px] text-[#0F7453] font-bold block mt-0.5">
                        {isEn ? `Based on ${request.area}m² Area` : `على أساس مساحة طلبك ${request.area}م²`}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-200 text-right">
                      <span className="text-[9px] text-gray-400 font-bold block">{isEn ? 'Similar platform baselines:' : 'النماذج المسجلة للمعايرة:'}</span>
                      <p className="text-sm font-black text-gray-700 mt-0.5">
                        {pricingAnalysis.matchedRequestsCount || 0} {isEn ? 'Historical Projects' : 'مشاريع مسجلة مماثلة'}
                      </p>
                      <span className="text-[8px] text-gray-400 block mt-0.5">
                        {isEn ? `Finishing level: ${request.finishingLevel}` : `تشطيب فئة: ${request.finishingLevel}`}
                      </span>
                    </div>
                  </div>

                  {/* Warnings and bids highlights */}
                  <div className="space-y-2">
                    <span className="text-[9.5px] font-black text-[#2B4D89] block">{isEn ? 'TRANS-MARKET COMPARATIVE STATUS:' : 'وضعية عروض الأسعار المستلمة حيال شفافية السوق:'}</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {finalComparedOffers.map(off => {
                        const offDetails = pricingAnalysis.bidsPricingAnalysis?.find((b: any) => b.offerId === off.id);
                        if (!offDetails) return null;

                        let tagBg = "bg-emerald-50 text-emerald-850 border-emerald-250";
                        let tagLabelAr = "متوازن مع متوسط السوق 🟢";
                        let tagLabelEn = "Fair market price";

                        if (offDetails.pricingTag === "SIGNIFICANTLY_HIGH") {
                          tagBg = "bg-red-50 text-red-050 text-red-800 border-red-200 animate-pulse";
                          tagLabelAr = "سعر مرتفع مبالغ فيه ⚠️";
                          tagLabelEn = "Significantly Higher Rate";
                        } else if (offDetails.pricingTag === "SIGNIFICANTLY_LOW") {
                          tagBg = "bg-amber-50 text-amber-050 text-amber-850 border-amber-250 animate-pulse";
                          tagLabelAr = "سعر منخفض مريب ⚠️";
                          tagLabelEn = "Risk of Under-tendering";
                        }

                        return (
                          <div key={off.id} className="bg-white p-3 rounded-xl border border-gray-150 flex flex-col justify-between gap-1.5 text-right font-sans">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-1 flex-row-reverse">
                              <span className="font-extrabold text-[10.5px] text-gray-800">
                                {isEn ? `Quote #${offers.indexOf(off) + 1}` : `العرض المالي للشركة (#${offers.indexOf(off) + 1})`}
                              </span>
                              <span className={`${tagBg} text-[8.5px] font-black px-2 py-0.5 rounded border shadow-3xs`}>
                                {isEn ? tagLabelEn : tagLabelAr}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-gray-500 font-bold flex-row-reverse">
                              <span>{isEn ? 'Offer sqm rate:' : 'سعر المتر في العرض:'}</span>
                              <span className="font-mono text-[#2B4D89] text-[10.5px]">
                                {offDetails.sqmRate?.toLocaleString()} {isEn ? 'EGP / m²' : 'ج.م / م²'}
                              </span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-gray-650 font-medium font-sans">
                              {isEn ? offDetails.transparencyWarningEn : offDetails.transparencyWarning}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Calibration Sources Info Box */}
                  {pricingAnalysis.sources && pricingAnalysis.sources.length > 0 && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200 text-right">
                      <span className="text-[9px] text-[#2B4D89] font-black block">⚙️ {isEn ? 'Calibration source index:' : 'مصادر بيانات القياس المدخلة:'}</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                        {pricingAnalysis.sources.map((src: string, i: number) => (
                          <p key={i} className="text-[8.5px] text-gray-500 font-bold">• {src}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expert Verdict banner */}
                  <div className="bg-[#2B4D89]/5 p-3 rounded-xl border-r-4 border-[#2B4D89] text-[#2B4D89] flex items-start gap-2 text-right">
                    <span className="text-sm shrink-0 mt-0.5">⚖️</span>
                    <div>
                      <span className="text-[8.5px] text-gray-450 font-black block">{isEn ? 'MARKET CALIBRATION ADVICE:' : 'توصية معايرة القيمة من حاسب كميات شطبها:'}</span>
                      <p className="text-[10.5px] font-bold text-gray-800 leading-relaxed font-sans mt-0.5">
                        {isEn ? pricingAnalysis.expertVerdictEn : pricingAnalysis.expertVerdictAr}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Side-by-side Table */}
          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-[11px] border-collapse" dir={isEn ? 'ltr' : 'rtl'}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-extrabold font-sans">
                    <th className="p-3 w-1/4 text-right">{isEn ? 'Comparison Metrics' : 'محددات المفاضلة والمقارنة'}</th>
                    {finalComparedOffers.map((off, idx) => (
                      <th key={off.id} className="p-3 text-center border-r border-gray-150 whitespace-nowrap">
                        {isEn ? `Quote #${offers.indexOf(off) + 1}` : `عرض سعر #${offers.indexOf(off) + 1}`} {bestPriceOffer.id === off.id && '🏅'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-[#232F3F]">
                  
                  {/* Compatibility Score */}
                  <tr className="bg-amber-55/10 font-bold border-b border-gray-200">
                    <td className="p-3 bg-gray-50/40 text-blue-900 text-right">
                      💯 {isEn ? 'Compatibility Match Score:' : 'مؤشر الملاءمة والقبول ذكي مخصص:'}
                      <span className="block text-[8px] font-bold text-gray-400 font-mono">
                        {isEn ? 'Weighted based on selected Override Priority' : 'تقدير ذكي تفاعلي طبقاً للأولوية النشطة بمستويات الثقة'}
                      </span>
                    </td>
                    {finalComparedOffers.map((off) => {
                      const breakdown = getScoreBreakdown(off);
                      let scoreBg = "bg-emerald-50 text-emerald-800 border-emerald-200/50 shadow-3xs";
                      if (breakdown.overall < 80) scoreBg = "bg-amber-50 text-amber-800 border-amber-200/50 shadow-3xs";
                      return (
                        <td key={off.id} className="p-3 text-center border-r border-gray-150 text-xs">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className={`px-2.5 py-1 rounded-xl border font-black text-xs ${scoreBg}`}>
                              {breakdown.overall} %
                            </span>
                            <span className="text-[7.5px] font-extrabold text-[#123E32]">
                              {comparisonPriority === 'BALANCED' ? '⚖️ موازنة متكافئة' : comparisonPriority === 'PRICE' ? '💰 وفر الموازنة' : comparisonPriority === 'DURATION' ? '⚡ سرعة التسليم' : comparisonPriority === 'RATING' ? '⭐ تقييم وخبرة' : '🧱 خامات واعتماد'}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Bidder name masked */}
                  <tr>
                    <td className="p-3 bg-gray-50/40 text-gray-500 font-bold text-right">{isEn ? 'Contractor / Company' : 'الشركة وصاحب العرض'}</td>
                    {finalComparedOffers.map((off) => {
                      const comp = companies.find(c => c.id === off.companyId);
                      const isContracted = request?.status === 'ACTIVE';
                      const compRealName = comp?.companyName || '';
                      const first3 = compRealName ? compRealName.replace(/^(شركة|مكتب|مؤسسة|مجموعة|مؤسسه|مكتب الاستشارات الهندسية|Company|Office|Group|Studio)\s+/, '').trim().slice(0, 3) : '';
                      const displayObfuscated = first3 ? `${isEn ? 'Studio' : 'شركة'} ${first3}...` : (isEn ? `Bid Offer ${offers.indexOf(off) + 1}` : `شركة عرض ${offers.indexOf(off) + 1}`);
                      return (
                        <td key={off.id} className="p-3 text-center border-r border-gray-150 text-emerald-800 font-bold whitespace-nowrap">
                          {isContracted ? (comp?.companyName || (isEn ? `Offer ${offers.indexOf(off) + 1}` : `شركة عرض ${offers.indexOf(off) + 1}`)) : (isEn ? `Offer (${offers.indexOf(off) + 1}) - ${displayObfuscated}` : `عرض رقم (${offers.indexOf(off) + 1}) - ${displayObfuscated}`)}
                          {comp && (
                            <button 
                              type="button"
                              onClick={() => onSelectProfileCompany(comp)}
                              className="block text-[8px] mx-auto text-blue-650 underline font-black mt-1 cursor-pointer hover:text-blue-800"
                            >
                              {isEn ? 'View gallery & reviews' : 'سابقة الأعمال والتقييمات الفنية ➔'}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Total Price */}
                  <tr>
                    <td className="p-3 bg-gray-50/40 text-gray-500 font-bold">{isEn ? 'Total Pricing' : 'القيمة المالية الإجمالية الكلية'}</td>
                    {finalComparedOffers.map((off) => (
                      <td key={off.id} className="p-3 text-center border-r border-gray-150 font-black text-xs">
                        <div className="space-y-0.5">
                          <span className={bestPriceOffer.id === off.id ? 'text-[#0F7453]' : 'text-gray-700'}>
                            {off.price.toLocaleString()} {isEn ? 'EGP' : 'ج.م'}
                          </span>
                          {bestPriceOffer.id === off.id && (
                            <span className="block text-[8px] font-black text-emerald-500 bg-[#F0F3F7] rounded px-1 max-w-max mx-auto">
                              {isEn ? 'Best Price 💰' : 'الأوفر سعراً 💰'}
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Price per SqM */}
                  <tr>
                    <td className="p-3 bg-gray-50/40 text-gray-550 font-bold">{isEn ? 'Approx. Price per SqM' : 'السعر التقريبي للمتر المربع'}</td>
                    {finalComparedOffers.map((off) => {
                      const areaSqM = request?.area || 120;
                      const pSqm = Math.round(off.price / areaSqM);
                      return (
                        <td key={off.id} className="p-3 text-center border-r border-gray-150 font-semibold text-[10.5px] text-gray-650">
                          <span>{pSqm.toLocaleString()} {isEn ? 'EGP/m²' : 'ج.م/م٢'}</span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Budget Compliance status */}
                  <tr>
                    <td className="p-3 bg-gray-50/40 text-gray-550 font-bold">{isEn ? 'Budget Compliance status' : 'درجة المطابقة والتوافق للميزانية'}</td>
                    {finalComparedOffers.map((off) => {
                      const targetBudget = request?.budget || 500000;
                      const diff = off.price - targetBudget;
                      const pct = Math.round((off.price / targetBudget) * 100);
                      let msg = isEn ? 'Within budget' : 'تطابق تام (ضمن الميزانية)';
                      let color = 'text-emerald-700 bg-emerald-50 border-emerald-100';
                      if (diff > 100000) {
                        msg = isEn ? `${pct}% of target (Higher)` : `${pct}% من المطلوب (تجاوز كبير)`;
                        color = 'text-red-700 bg-red-50 border-red-100';
                      } else if (diff > 0) {
                        msg = isEn ? 'Slightly higher' : 'تجاوز بسيط للمستهدف';
                        color = 'text-amber-700 bg-amber-50 border-amber-100';
                      }
                      return (
                        <td key={off.id} className="p-3 text-center border-r border-gray-150">
                          <span className={`inline-block px-2 py-0.5 rounded-md border text-[9px] font-bold ${color}`}>
                            {msg}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Practical duration */}
                  <tr>
                    <td className="p-3 bg-gray-50/40 text-gray-550 font-bold">{isEn ? 'Timeline & Duration' : 'فترة التنفيذ المخططة وتاريخ التسليم'}</td>
                    {finalComparedOffers.map((off) => (
                      <td key={off.id} className="p-3 text-center border-r border-gray-150">
                        <div className="space-y-0.5">
                          <span className={fastestOffer.id === off.id ? 'text-blue-600 font-bold' : ''}>
                            {off.durationDays} {isEn ? 'days' : 'يوماً'}
                          </span>
                          {fastestOffer.id === off.id && (
                            <span className="block text-[8px] font-black text-blue-500 bg-blue-50 rounded px-1 max-w-max mx-auto">
                              {isEn ? 'Fastest Handover ⚡' : 'الأسرع تسليماً ⚡'}
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Finishing level types */}
                  <tr>
                    <td className="p-3 bg-gray-50/40 text-gray-550 font-bold">{isEn ? 'Company Finishing Packages' : 'باقات ومستويات التشطيب وتوصيف المواد'}</td>
                    {finalComparedOffers.map((off) => {
                      const comp = companies.find(c => c.id === off.companyId);
                      const typesStr = comp?.finishingTypes ? comp.finishingTypes.join(' ، ') : (isEn ? 'Lux, Deluxe' : 'لوكس، سوبرلوكس');
                      return (
                        <td key={off.id} className="p-3 text-center border-r border-gray-150 text-[10px] text-slate-705 leading-normal max-w-[180px]">
                          <div className="flex flex-col gap-1 items-center justify-center">
                            <span className="bg-blue-50 text-blue-800 text-[8.5px] px-2 py-0.5 border border-blue-150/50 rounded-sm font-extrabold max-w-max">
                              {request?.finishingLevel || (isEn ? 'Superlux' : 'سوبر لوكس')}
                            </span>
                            <span className="text-[8px] text-gray-400 font-bold leading-tight block text-center truncate max-w-full">
                              {isEn ? 'Supports: ' : 'يدعم الفئات: '}{typesStr}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Provider stats and metrics */}
                  <tr>
                    <td className="p-3 bg-gray-50/40 text-gray-550 font-bold">{isEn ? 'Contractor Trust KPI %' : 'مؤشرات أداء وسجل أعمال الثقة للمكتب'}</td>
                    {finalComparedOffers.map((off) => {
                      const comp = companies.find(c => c.id === off.companyId);
                      const timing = comp?.timingCommitment || 95;
                      const inspectorRate = comp?.inspectorApprovalRate || 92;
                      return (
                        <td key={off.id} className="p-3 text-center border-r border-gray-150 text-[9px] text-gray-500 leading-relaxed font-semibold">
                          <div className="space-y-1 text-right max-w-max mx-auto">
                            <div className="flex items-center justify-between gap-1 flex-row-reverse">
                              <span className="text-gray-400 font-bold">{isEn ? 'Timing KPI:' : 'الالتزام بالجدول:'}</span>
                              <span className="text-emerald-700 font-black font-sans">{timing}%</span>
                            </div>
                            <div className="flex items-center justify-between gap-1 flex-row-reverse">
                              <span className="text-gray-400 font-bold">{isEn ? 'Auditor KPI:' : 'اعتماد المشرف:'}</span>
                              <span className="text-blue-700 font-black font-sans">{inspectorRate}%</span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Material Quality */}
                  <tr>
                    <td className="p-3 bg-gray-50/40 text-gray-550 font-bold">{isEn ? 'Material Quality' : 'جودة الخامات وماركات التأسيس'}</td>
                    {finalComparedOffers.map((off) => {
                      const descRaw = off.description;
                      const descEn = descRaw.includes('أقترح استخدام أسلاك السويدي') 
                        ? 'Proposed Elsewedy cables, premium Savuto plumbing pipes, thermal insulation, luxury Jotun paint.' 
                        : descRaw;
                      const breakdown = getScoreBreakdown(off);
                      return (
                        <td key={off.id} className="p-3 text-center border-r border-gray-150 text-[10px] text-gray-500 leading-normal max-w-[200px]">
                          <div className="space-y-1.5 text-right font-semibold">
                            <p className="line-clamp-3 text-right">
                              {isEn ? (descEn.length > 85 ? descEn.substring(0, 85) + '...' : descEn) : (descRaw.length > 85 ? descRaw.substring(0, 85) + '...' : descRaw)}
                            </p>
                            <div className="flex justify-end">
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${breakdown.hasPremiumBrands ? 'bg-[#FAFDFB] text-[#0F7453] border border-[#AFDEC9]/35' : 'bg-gray-100 text-gray-550'}`}>
                                {breakdown.hasPremiumBrands ? '💡 خامات متميزة (السويدي الأصلي وجوتن)' : '⚠️ مواصفة قياسية فنية وبنود معتدلة'}
                              </span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* AI advisor recommendation */}
                  <tr className="bg-[#F0F3F7]/10">
                    <td className="p-3 bg-gray-50/40 text-[#123E32] font-black">{isEn ? 'Dynamic Advice Decision' : 'قرار التوصية الذكي ومبدأ الملاءمة'}</td>
                    {finalComparedOffers.map((off) => {
                      const isBestPrice = bestPriceOffer.id === off.id;
                      const isFastest = fastestOffer.id === off.id;
                      const isBestRated = bestRatedOffer.id === off.id;
                      return (
                        <td key={off.id} className="p-3 text-center border-r border-gray-150">
                          <div className="flex flex-col gap-1 items-center justify-center">
                            {isBestPrice && (
                              <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm">
                                {isEn ? 'Best Cost Savings' : 'خيار التوفير الميزانية الممتازة 💰'}
                              </span>
                            )}
                            {isFastest && !isBestPrice && (
                              <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm">
                                {isEn ? 'Ultimate Handover Speed' : 'خيار ميعاد التسليم الأسرع ⚡'}
                              </span>
                            )}
                            {isBestRated && !isBestPrice && !isFastest && (
                              <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm">
                                {isEn ? 'Verified Top Rating' : 'خيار الموثوقية الهندسية ومستوى الثقة ⭐'}
                              </span>
                            )}
                            {!isBestPrice && !isFastest && !isBestRated && (
                              <span className="text-gray-400 text-[8px] font-bold">
                                {isEn ? 'Standard Compliant Option' : 'خيار متزن ومطابق للمواصفات'}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* ActionAccept row */}
                  <tr className="bg-emerald-50/10 border-t border-gray-150">
                    <td className="p-3 bg-[#EAF2EC] text-[#0F7453] font-black">{isEn ? 'Direct Action' : 'الإجراء الفني وعقد المعاينة'}</td>
                    {finalComparedOffers.map((off) => {
                      const isContracted = request?.status === 'ACTIVE' || request?.status === 'COORDINATION';
                      return (
                        <td key={off.id} className="p-3 text-center border-r border-gray-150">
                          {isContracted ? (
                            <span className="text-emerald-700 font-extrabold text-[10px] bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded">
                              {isEn ? '✓ Selected & Signed' : '✓ تم الاختيار وبدء المشروع المعين'}
                            </span>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => onViewOfferDetails(off)}
                              className="bg-[#2B4D89] hover:bg-[#1E3A68] text-white text-[9px] font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105 shadow-3xs cursor-pointer block mx-auto whitespace-nowrap"
                            >
                              🔍 {isEn ? 'Offer Details & Accept' : 'معاينة تامة وقبول العرض ➔'}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          {/* Bento Summary Comparison Cards below table */}
          <div className="space-y-3 pt-2" dir="rtl">
            <h4 className="text-xs font-black text-gray-800 flex items-center gap-1.5 justify-start">
              <span>💡</span> <span>{isEn ? 'Dynamic Summary Insights on Selected Offers:' : 'التحليل التوجيهي والملاحظات الفنية لعروضك المشتركة في المقارنة:'}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-right">
              {finalComparedOffers.map((off) => {
                const comp = companies.find(c => c.id === off.companyId);
                const breakdown = getScoreBreakdown(off);
                const idxNum = offers.indexOf(off) + 1;
                
                // Pro/Con calculations
                let pro = isEn ? "Balanced cost & scope" : "سعر متزن يتماشى مع البنود المطلوبة وتصميم المساحة";
                let con = isEn ? "Standard review pending" : "تتطلب مطابقة الكروكي ودفعة البداية مع مهندس شطبها";
                
                if (bestPriceOffer?.id === off.id) {
                  pro = isEn ? "Absolute best price, massive budget savings!" : "القيمة السعرية الأوفر على الإطلاق، وفر حقيقي للميزانية الكلية!";
                  con = isEn ? "Longer execution timeline to complete works on site" : "مدة تنفيذ معتدلة قد تحتاج تتبع مستمر للتوريد والتشطيب";
                } else if (fastestOffer?.id === off.id) {
                  pro = isEn ? "Lightning fast handover timeline with penalty compliance" : "الموعد الأسرع لتسليم المفتاح والانتهاء من التشطيب الفعلي!";
                  con = isEn ? "Pricing package is relatively premium cost" : "التكلفة تزيد نسبياً لتعجيل فرق العمل وتوصيل المواد والأطقم";
                } else if (bestRatedOffer?.id === off.id) {
                  pro = isEn ? "Unparalleled historical customer ratings & engineering trust" : "أعلى مرونة في التقييم وسجل أعمال رائع ومطابقة مثالية!";
                  con = isEn ? "Standard review pending technical alignment" : "تتطلب سرعة تحديد دفعة التسييل لبدء فحص عينات المواد الأسبوعي";
                } else if (breakdown.hasPremiumBrands) {
                  pro = isEn ? "Premium electrical/paint brands integrated seamlessly" : "تضم خامات ممتازة ونوعيات فاخرة (أسلاك السويدي ومعجون جوتن الأصلي)";
                  con = isEn ? "Requires standard inspection fee validation is required" : "تطلب مطابقة سريعة لاعتماد مورد المادة المعتمدة";
                }

                return (
                  <div key={off.id} className="p-4 bg-white rounded-2xl border border-gray-150 flex flex-col justify-between gap-3 shadow-3xs hover:border-emerald-350 transition-all text-right animate-fade-in">
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100 flex-row-reverse">
                        <span className="text-xs font-black text-[#2B4D89]">
                          {isEn ? `Quote #${idxNum}` : `عرض المقارنة رقم #${idxNum}`}
                        </span>
                        <div className="text-[10px] font-black text-emerald-850 bg-emerald-50 px-2 py-0.5 rounded">
                          {breakdown.overall}% ملاءمة
                        </div>
                      </div>
                      <div className="space-y-2 mt-2 leading-snug">
                        <div className="flex items-start gap-1.5 flex-row-reverse text-start">
                          <span className="text-emerald-600 text-xs shrink-0 mt-0.5">🟢</span>
                          <div>
                            <span className="text-[9px] text-gray-400 font-extrabold block">{isEn ? 'PROS / STRENGTH:' : 'أبرز مميزات وعناصر القوة:'}</span>
                            <p className="text-[10.5px] font-bold text-gray-800 leading-tight">{pro}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-1.5 flex-row-reverse text-start">
                          <span className="text-red-500 text-xs shrink-0 mt-0.5">🔴</span>
                          <div>
                            <span className="text-[9px] text-gray-400 font-extrabold block">{isEn ? 'CONS / MITIGATION:' : 'توصية ونقاط للمراعاة والوزن:'}</span>
                            <p className="text-[10.5px] font-bold text-gray-750 leading-tight">{con}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-500 flex-row-reverse">
                      <span>⭐ {comp?.rating || '4.8'} تقييم العملاء</span>
                      <span>👥 {comp?.projectsCompleted || 10} مشروع منفذ</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ✨ AI Smart Estimation & Bid Analyst Panel */}
          <div className="bg-gradient-to-br from-[#123E32]/95 to-[#0E3128] rounded-3xl border border-[#AFDEC9]/30 p-5 md:p-6 text-white text-right space-y-4 shadow-lg overflow-hidden relative">
            {/* Ambient Background Decorative Graphics */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/60 flex-row-reverse relative z-10">
              <div>
                <h4 className="font-extrabold text-sm md:text-base flex items-center gap-1.5 justify-end">
                  <span className="text-xl animate-pulse">🪄</span> <span>{isEn ? 'AI Deep Engineering analysis' : 'مساعد المهندس الفني الذكي بالذكاء الاصطناعي'}</span>
                </h4>
                <p className="text-[10px] text-emerald-300/75 font-medium mt-0.5">
                  {isEn ? 'Leverage our advanced estimators to evaluate pricing fairness, material matching, and risk analysis.' : 'مقارنة فنية مالية ذكية ومحايدة لعروض الأسعار مع مطابقة كفاءة الخامات وكشف الحيل السعرية بدقة السوق.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAIClick}
                disabled={aiLoading}
                className="bg-emerald-400 hover:bg-[#34D399] tracking-tight disabled:bg-emerald-800 disabled:text-emerald-555 text-[#123E32] font-black text-[10.5px] px-5 py-2.5 rounded-xl border border-emerald-300 transition-all cursor-pointer shadow-xs flex items-center gap-1.5 justify-center z-10 self-end sm:self-auto"
              >
                {aiLoading ? (
                  <>
                    <span className="animate-spin text-xs inline-block border-2 border-current border-t-transparent rounded-full w-3.5 h-3.5 mr-1 align-middle"></span>
                    <span>{isEn ? 'Analyzing Bids...' : 'جاري تحليل وتدقيق الخامات...'}</span>
                  </>
                ) : (
                  <>
                    <span>🪄</span>
                    <span>{aiAnalysis ? (isEn ? 'Re-Analyze with AI' : 'إعادة التحديث الفوري ♻️') : (isEn ? 'بدء التحليل الفني بالذكاء الاصطناعي 🪄' : 'بدء التحليل الفني بالذكاء الاصطناعي 🪄')}</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="bg-red-950/40 border border-red-800/85 p-3 rounded-xl text-red-300 text-[10px] font-bold text-center">
                ⚠️ {aiError}
              </div>
            )}

            {!aiAnalysis && !aiLoading && (
              <div className="py-6 text-center space-y-2 relative z-10">
                <div className="text-3xl text-emerald-400/40 opacity-75">📊</div>
                <p className="text-[11px] font-bold text-emerald-200/80 max-w-lg mx-auto leading-relaxed">
                  {isEn 
                    ? 'Click the button to compare your selected bids with our active AI Consultant database. We evaluate every material item, pricing point, and warranty conditions.'
                    : 'اضغط على زر التحليل لرفع مواصفات طلب التشطيب ومطابقتها مقابل العروض المستلمة. سنقوم باحتساب موثوقية ماركات التأسيس، الأمان، والتثبت من خلو العرض من أي أسعار مبالغ فيها.'}
                </p>
              </div>
            )}

            {aiLoading && (
              <div className="py-8 space-y-3 text-center relative z-10">
                <div className="flex justify-center">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[10.5px] text-emerald-200 font-bold animate-pulse">
                  {isEn ? 'Evaluating pricing curves, warranty intervals, and electric brands...' : 'المهندس الافتراضي يحلل أسلاك الكهرباء، مواسير السباكة، ويفحص فترات الضمان في البنود المستلمة...'}
                </p>
              </div>
            )}

            {aiAnalysis && !aiLoading && (
              <div className="space-y-5 text-right relative z-10 animate-fade-in text-[11.5px]">
                
                {/* 🏆 Best AI Recommendation Banner */}
                <div className="bg-emerald-900/50 border border-emerald-400/30 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between flex-row-reverse border-b border-emerald-800/50 pb-1.5">
                    <span className="bg-emerald-400 text-slate-900 text-[8.5px] font-black px-2 py-0.5 rounded-full">
                      ⭐ {isEn ? 'ENGINEERING RECOMMENDED' : 'التوصية الهندسية المعتمدة 🏆'}
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold font-mono">
                      {isEn ? `Recommended Quote: #${offers.findIndex(o => o.id === aiAnalysis.recommendationId) + 1}` : `عرض السعر المعتمد: رقم #${offers.findIndex(o => o.id === aiAnalysis.recommendationId) + 1}`}
                    </span>
                  </div>
                  <p className="text-emerald-100 leading-relaxed font-bold">
                    {aiAnalysis.recommendationReason}
                  </p>
                </div>

                {/* 📋 Side-by-side Deep Comparative Cards */}
                <div className="space-y-2.5">
                  <span className="text-[10px] text-emerald-350 block font-black uppercase tracking-wider text-right">
                    🔍 {isEn ? 'OFFERS AUDIT SHEET:' : 'أوراق تدقيق وفحص العروض هندسياً:'}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {finalComparedOffers.map(off => {
                      const analysis = aiAnalysis.bidsAnalysis?.find((b: any) => b.offerId === off.id) || {};
                      const idxNum = offers.indexOf(off) + 1;
                      
                      // Fairness styling
                      let fairnessText = isEn ? 'Fair value market price' : 'سعر سوقي عادل 🟢';
                      let fairnessColor = 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50';
                      if (analysis.pricingFairness === 'OVERPRICED') {
                        fairnessText = isEn ? 'Potentially Overpriced / High Margin ⚠️' : 'سعر مرتفع ومبالغ فيه نسبياً ⚠️';
                        fairnessColor = 'bg-red-950/50 text-red-300 border-red-800/50';
                      } else if (analysis.pricingFairness === 'UNDERPRICED') {
                        fairnessText = isEn ? 'Suspiciously Low / Check materials authenticity ⚠️' : 'سعر منخفض جداً (مخاطرة بالخامات) ⚠️';
                        fairnessColor = 'bg-amber-950/50 text-amber-300 border-amber-800/50';
                      }

                      return (
                        <div key={off.id} className="bg-emerald-950/20 border border-emerald-800/40 p-3.5 rounded-xl space-y-3 text-right">
                          <div className="flex items-center justify-between border-b border-emerald-900/60 pb-1.5 flex-row-reverse">
                            <span className="font-extrabold text-[#AFDEC9]">
                              {isEn ? `Quote #${idxNum}` : `تفاصيل العرض رقم #${idxNum}`}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8.5px] border font-black ${fairnessColor}`}>
                              {fairnessText}
                            </span>
                          </div>

                          {/* Meterials progress metric */}
                          <div className="space-y-1 text-right">
                            <div className="flex justify-between items-center flex-row-reverse text-[9px] font-bold text-emerald-300">
                              <span>{isEn ? 'Material Quality Spec Index:' : 'مؤشر جودة وتوصيف الخامات:'}</span>
                              <span className="font-mono">{analysis.materialsScore || 85}%</span>
                            </div>
                            <div className="w-full bg-emerald-950/60 h-1.5 rounded-full overflow-hidden border border-emerald-900">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${analysis.materialsScore || 85}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2 pt-1 leading-normal text-right">
                            {/* Strengths */}
                            <div className="space-y-1">
                              <span className="text-[8.5px] text-emerald-400 font-extrabold block">✨ {isEn ? 'Praisepoints & Strengths:' : 'مواطن القوة والمزايا في المقاولة:'}</span>
                              <div className="space-y-0.5 pr-2 border-r border-emerald-600/30">
                                {(analysis.praisePoints || []).map((pt: string, i: number) => (
                                  <p key={i} className="text-[10px] text-emerald-105 font-medium">✓ {pt}</p>
                                ))}
                              </div>
                            </div>
                            {/* Disadvantages */}
                            <div className="space-y-1 pt-1">
                              <span className="text-[8.5px] text-rose-300 font-extrabold block">⚠️ {isEn ? 'Cautions & Weakness:' : 'تخطيط عيوب أو ثغرات للمجاراة والحل:'}</span>
                              <div className="space-y-0.5 pr-2 border-r border-rose-600/30 text-rose-100">
                                {(analysis.criticismPoints || []).map((pt: string, i: number) => (
                                  <p key={i} className="text-[10px] text-rose-200/90 font-semibold">• {pt}</p>
                                ))}
                              </div>
                            </div>
                          </div>

                          {analysis.riskAssessment && (
                            <div className="bg-emerald-950/50 p-2 rounded-lg border border-emerald-900/60 text-[9.5px] text-emerald-200 font-medium">
                              🕵️ <span className="font-bold">{isEn ? 'Platform Engineer Risk Note:' : 'تقييم المخاطرة الميدانية:'}</span> {analysis.riskAssessment}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 🧱 Materials Summary Compare */}
                {aiAnalysis.materialsSummaryComparison && (
                  <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/30 text-emerald-200">
                    <span className="text-[9.5px] text-emerald-400 block font-black pb-1">
                      🧱 {isEn ? 'GENERAL RAW MATERIALS VERITABLE METRIC:' : 'مذكرة فروقات المواد وعلامات التوريد المعتمدة:'}
                    </span>
                    <p className="leading-relaxed text-emerald-100 font-medium">{aiAnalysis.materialsSummaryComparison}</p>
                  </div>
                )}

                {/* Concluding Speech */}
                {aiAnalysis.aiVerdict && (
                  <div className="border-r-2 border-emerald-405 pr-3.5 italic text-emerald-200 font-semibold bg-emerald-950/10 py-1.5 leading-snug">
                    "{aiAnalysis.aiVerdict}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Guarantee and terms list */}
          <div className="bg-white border border-gray-200/85 p-4 rounded-2xl space-y-3 text-right">
            <h4 className="text-xs font-black text-gray-800 flex items-center gap-1.5 justify-start">
              <span className="text-sm">🏷️</span> <span>{isEn ? 'Guaranteed Comparison Terms & Compliance Guidelines:' : 'شروط ومعايير المقارنة المدعومة بالضمان والمطابقة الهندسية:'}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3" dir={isEn ? "ltr" : "rtl"}>
              <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100/60 space-y-1 text-start">
                <span className="text-[10px] font-black text-[#0F7453] block">{isEn ? '🏅 Final Budget Without Increases:' : '🏅 ميزانية معتمدة بلا زيادات مفاجئة:'}</span>
                <p className="text-[9px] leading-relaxed text-gray-600 font-semibold">{isEn ? 'Matching ensures foundational pricing stability, and specifying materials records the contract via Escrow.' : 'المطابقة تضمن ثبات الأسعار قبل المعاينة لتبدأ بالتأسيس والمحارة بلا نفقات مستترة.'}</p>
              </div>
              <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100/60 space-y-1 text-start">
                <span className="text-[10px] font-black text-blue-800 block">{isEn ? '📅 Full Compliance with Duration:' : '📅 الالتزام بمواعيد المدد والبنود:'}</span>
                <p className="text-[9px] leading-relaxed text-gray-650 font-semibold">{isEn ? 'Shatibha contracts include a 0.5% delay penalty from the phase payment directly deducted in favor of the client upon breach.' : 'تتضمن عقود المنصة غرامة تأخير تصل إلى 0.5% يومياً من قيمة دفعة المرحلة تسيل لصالح العميل فوراً عند التأخير.'}</p>
              </div>
              <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100/60 space-y-1 text-start">
                <span className="text-[10px] font-black text-purple-800 block">{isEn ? '🛠️ Material Matching and Approval:' : '🛠️ فحص المواد ومنع العيوب الهندسية:'}</span>
                <p className="text-[9px] leading-relaxed text-gray-650 font-semibold">{isEn ? 'Samples (e.g., Elsewedy cables, Jotun electrostatic) are inspected by a technical engineer to prevent commercial fraud.' : 'يقوم المشرف الميداني بفحص واعتماد عينات حديد الكهرباء ومعجون الجدران والأنابيب لضمان مطابقتها للمواصفة.'}</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
