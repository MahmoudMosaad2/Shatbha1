import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  MapPin, 
  Layers, 
  Award, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Phone,
  FileText,
  Building,
  Check,
  Zap,
  GraduationCap,
  Camera,
  Calendar,
  Shield,
  Eye,
  ArrowRight,
  TrendingUp,
  X,
  Lock,
  Search,
  CheckSquare,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { ShattabhaLogo } from './ShattabhaLogo';

// ==========================================
// 1. HOW SHATTABHA WORKS
// ==========================================
interface HowShattabhaWorksProps {
  isEn: boolean;
  howItWorksSteps: any[];
}

export const HowShattabhaWorks: React.FC<HowShattabhaWorksProps> = ({ isEn, howItWorksSteps }) => {
  return (
    <section id="how-it-works" className="relative py-20 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden border-y border-slate-100">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-200/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-100/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#2B4D89]/5 text-[#2B4D89] text-xs font-black px-4 py-2 rounded-full border border-[#2B4D89]/10 shadow-sm"
          >
            <Shield className="w-4 h-4 text-[#D8B448]" />
            <span>{isEn ? 'Shattabha Shield Charter' : 'ميثاق الأمان والريادة لراحتك'}</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl font-extrabold text-[#2B4D89] tracking-tight leading-tight"
          >
            {isEn ? 'How Shattabha Platform Works' : 'رحلة مشروعك وخطوات العمل الآمن مع شطبها'}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-xs sm:text-sm font-bold leading-relaxed max-w-2xl mx-auto"
          >
            {isEn 
              ? 'Five simple engineering segments that eliminate middleman fraud, secure your money, and match payouts with physical verified approvals.' 
              : 'خمس مراحل هندسية متتالية وموثقة، تغلق ثغرات التلاعب وهدر خامات التشطيب وتضمن إسناد دفعاتك للمواصفة الصحيحة بالمللي.'}
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-4 relative">
          
          {/* Dash line in background for desktop only */}
          <div className="absolute top-[40px] left-[10%] right-[10%] h-[2px] border-t-2 border-dashed border-[#2B4D89]/15 hidden md:block z-0" />

          {howItWorksSteps.map((step, idx) => {
            const StepIcon = step.icon;
            
            const stepLabelsAr = [
              'خطوتك الأولى والمواصفات',
              'فحص وتوزيع المناقصة كتم',
              'مقارنة الخامات شفافة',
              'تعاقد ثلاثي مع المنصة',
              'فحص أصول وقبول الدفعة'
            ];
            const stepLabelsEn = [
              'Specifications Input',
              'Blind Tender Distribution',
              'Transparent Comparison',
              'Tripartite Smart Bond',
              'Site Audit Sign-Off'
            ];

            return (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative bg-white border border-slate-150 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between z-10 text-right group self-stretch"
                dir={isEn ? 'ltr' : 'rtl'}
              >
                {/* Header background with deep blue to teal gradients */}
                <div className="bg-gradient-to-br from-[#1E3254] to-[#2B4D89] p-5 text-white space-y-3 relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-[#D8B448]/5 blur-lg pointer-events-none group-hover:scale-125 transition-transform" />
                  
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-[#D8B448] flex items-center justify-center shadow-inner group-hover:bg-[#D8B448] group-hover:text-white transition-all duration-300">
                      <StepIcon className="w-5 h-5 shrink-0 transition-transform duration-500 group-hover:rotate-12" />
                    </div>
                    
                    <span className="text-xl font-black text-white/50 group-hover:text-[#D8B448] transition-colors font-mono">
                      {isEn ? `0${step.id}` : `٠${step.id}`}
                    </span>
                  </div>

                  <div className="inline-block mt-1">
                    <span className="text-[10px] font-black tracking-wide bg-white/10 text-[#D8B448] border border-white/5 px-2 py-0.5 rounded">
                      {isEn ? stepLabelsEn[idx] : stepLabelsAr[idx]}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-white leading-snug group-hover:text-[#D8B448] transition-colors pt-1">
                    {isEn ? step.titleEn : step.titleAr}
                  </h3>
                </div>

                {/* Body details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-slate-50/50">
                  <p className="text-slate-600 text-xs font-bold leading-relaxed">
                    {isEn ? step.descEn : step.descAr}
                  </p>

                  <div className="pt-3 border-t border-slate-200/65 flex items-center justify-between text-[11px]">
                    <span className="text-[#2B4D89] font-black tracking-wide">
                      {isEn ? 'Escrow Protection Active' : 'مؤمن بحساب الضمان 🔒'}
                    </span>
                    <span className="w-6 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#D8B448] group-hover:w-10 transition-all duration-350" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 2. FEATURED PROJECTS PORTFOLIO
// ==========================================
interface FeaturedProjectsProps {
  isEn: boolean;
  HOME_FEATURED_PROJECTS: any[];
  activeFeaturedProject: number;
  setActiveFeaturedProject: (idx: number) => void;
  activePhotoIndex: number;
  setActivePhotoIndex: (idx: number) => void;
  setModalType: (type: any) => void;
}

export const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({
  isEn,
  HOME_FEATURED_PROJECTS,
  activeFeaturedProject,
  setActiveFeaturedProject,
  activePhotoIndex,
  setActivePhotoIndex,
  setModalType
}) => {
  const selectedProj = HOME_FEATURED_PROJECTS[activeFeaturedProject];

  return (
    <section id="featured-projects" className="py-20 bg-[#FAFBFD] border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block bg-[#264273]/10 text-[#2B4D89] text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
            🏛️ {isEn ? 'Verified Portfolios & Real Audits' : 'مشاريع حية جرى تفقدها بختم الجودة'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B4D89] tracking-tight">
            {isEn ? 'Finished Projects Under Active Engineering Auditing' : 'مشاريع تسليم هندسي وميداني موثقة بمصر'}
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm font-bold max-w-2xl mx-auto leading-relaxed">
            {isEn 
              ? 'Browse physical success stories finished inside local neighborhoods, matching high construction codes under Shattabha guidelines.' 
              : 'اضغط على التبويبات بالأسفل لمشاهدة صور واقعية وعقد تفاصيل تشطيب معتمد بالصور والفحص لمشاريع مميزة تمت في مصر:'}
          </p>
        </div>

        {/* Dynamic Project Tabs Switcher (Top layout, tidy and elegant) */}
        <div className="flex flex-wrap gap-2.5 justify-center bg-slate-100/70 p-2 rounded-2xl max-w-2xl mx-auto">
          {HOME_FEATURED_PROJECTS.map((proj, idx) => {
            const isTabActive = activeFeaturedProject === idx;
            return (
              <button 
                key={proj.id}
                onClick={() => {
                  setActiveFeaturedProject(idx);
                  setActivePhotoIndex(0);
                }}
                className={`px-5 py-3 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
                  isTabActive 
                    ? 'bg-white text-[#2B4D89] shadow-sm font-extrabold scale-[1.02]' 
                    : 'text-gray-500 hover:text-slate-800 hover:bg-white/30'
                }`}
              >
                {isEn ? proj.nameEn.split('-')[0] : proj.nameAr.split('-')[0]}
              </button>
            );
          })}
        </div>

        {/* Visual Showcase Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Gallery View Column (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
            <div className="relative h-80 sm:h-[420px] rounded-[24px] overflow-hidden shadow-md group border border-slate-100">
              
              {/* Image element */}
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activePhotoIndex + '-' + activeFeaturedProject}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  src={selectedProj?.images[activePhotoIndex]} 
                  alt="Shattabha completed projects" 
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Gradient layer */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
              
              {/* Absolute label bottom */}
              <div className="absolute bottom-6 right-6 text-white text-right space-y-1.5" dir={isEn ? 'ltr' : 'rtl'}>
                <div className="inline-flex items-center gap-1.5 bg-emerald-600/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>{isEn ? 'Audit Certified ✓' : 'حائز على ختم الفحص الفني والقبول ✓'}</span>
                </div>
                <p className="text-sm font-black text-gray-150">
                  {isEn ? selectedProj?.locationEn : selectedProj?.locationAr}
                </p>
              </div>

              {/* Photos Navigation Overlay */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
                <button 
                  onClick={() => {
                    const len = selectedProj.images.length;
                    setActivePhotoIndex((activePhotoIndex - 1 + len) % len);
                  }}
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center font-bold pointer-events-auto active:scale-95 transition-transform"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    const len = selectedProj.images.length;
                    setActivePhotoIndex((activePhotoIndex + 1) % len);
                  }}
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center font-bold pointer-events-auto active:scale-95 transition-transform"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>

            {/* Thumbnails list row */}
            <div className="grid grid-cols-3 gap-3">
              {selectedProj?.images.map((img: string, i: number) => {
                const isImgActive = activePhotoIndex === i;
                return (
                  <button 
                    key={i} 
                    onClick={() => setActivePhotoIndex(i)}
                    className={`h-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all relative ${
                      isImgActive 
                        ? 'border-[#2B4D89] scale-[0.98] shadow-md' 
                        : 'border-transparent opacity-75 hover:opacity-100 hover:border-slate-350'
                    }`}
                  >
                    <img src={img} alt="Shattabha project gallery preview" className="w-full h-full object-cover" />
                    {isImgActive && (
                      <div className="absolute inset-0 bg-[#2B4D89]/10" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Content Card Column (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 text-right relative z-10" dir={isEn ? 'ltr' : 'rtl'}>
            
            <div className="space-y-4">
              {/* Category standard badge */}
              <div className="inline-block">
                <span className="bg-[#D8B448]/10 text-[#8F7425] text-[11px] font-black px-4 py-1.5 rounded-lg border border-[#D8B448]/20 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#D8B448]" />
                  <span>{isEn ? selectedProj?.levelEn : selectedProj?.levelAr}</span>
                </span>
              </div>

              {/* Project Headline */}
              <h3 className="text-xl sm:text-2.5xl font-extrabold text-[#2B4D89] tracking-tight hover:text-[#1E3254] transition-colors leading-tight">
                {isEn ? selectedProj?.nameEn : selectedProj?.nameAr}
              </h3>

              {/* Area & Location Parameters pills */}
              <div className="flex flex-wrap gap-2 text-xs font-bold text-gray-500">
                <span className="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isEn ? selectedProj?.locationEn : selectedProj?.locationAr}</span>
                </span>
                <span className="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isEn ? selectedProj?.areaEn : selectedProj?.areaAr}</span>
                </span>
              </div>

              {/* Description body */}
              <p className="text-gray-600 text-xs sm:text-[13px] leading-relaxed font-bold">
                {isEn ? selectedProj?.descEn : selectedProj?.descAr}
              </p>
            </div>

            {/* Verified Specifications Checklist Box */}
            <div dir={isEn ? "ltr" : "rtl"} className={`bg-white border border-[#2B4D89]/10 p-5 rounded-2xl shadow-xs space-y-4 ${isEn ? 'text-left' : 'text-right'}`}>
              <h4 className="text-xs sm:text-sm font-black text-[#2B4D89] flex items-center justify-start gap-1.5 border-b border-slate-100 pb-2">
                <CheckSquare className="w-4.5 h-4.5 text-[#D8B448]" />
                <span>{isEn ? 'Inspected Material Audits' : 'بنود الاستلام المعماري والمدني للمشروع:'}</span>
              </h4>
              
              <div className="space-y-4 text-[11px] sm:text-xs font-bold text-gray-500">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#2B4D89] font-black flex items-center gap-1.5 shrink-0">
                    <span>✓</span>
                    <span>{isEn ? 'Electrical grid' : 'شبكة الكهرباء'}</span>
                  </span>
                  <span className={`text-slate-500 font-extrabold ${isEn ? 'text-right' : 'text-left'}`}>{isEn ? 'Elsewedy authentic cables' : 'كابلات السويدي النحاسية المعتمدة'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#2B4D89] font-black flex items-center gap-1.5 shrink-0">
                    <span>✓</span>
                    <span>{isEn ? 'Bathrooms & kitchens insulation' : 'عزل الحمامات والمطابخ'}</span>
                  </span>
                  <span className={`text-slate-500 font-extrabold ${isEn ? 'text-right' : 'text-left'}`}>{isEn ? 'Sika chemical moisture isolation' : 'عزل مائي متطور بالبيتومين وسيكا'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#2B4D89] font-black flex items-center gap-1.5 shrink-0">
                    <span>✓</span>
                    <span>{isEn ? 'Sanitary fittings' : 'الصحية وخلاطات معتمدة'}</span>
                  </span>
                  <span className={`text-slate-500 font-extrabold ${isEn ? 'text-right' : 'text-left'}`}>{isEn ? 'Duravit smart sanitaries' : 'أطقم كليوباترا أو ديورافيت فرز أول'}</span>
                </div>
              </div>
            </div>

            {/* Call to action button */}
            <div className="pt-2">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModalType('CLIENT')}
                className="w-full bg-[#2B4D89] hover:bg-[#1E3A68] text-white p-4 rounded-xl font-extrabold text-xs cursor-pointer shadow-md shadow-[#2B4D89]/10 transition-all flex items-center justify-center gap-2"
              >
                <span>{isEn ? 'Submit Finishing Request Like This' : 'اطلب عروض أسعار مماثلة لوحدتك الآن'}</span>
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

// ==========================================
// 3. COMPARISON SECTION (PROBLEM vs SOLUTION)
// ==========================================
interface ComparisonProps {
  isEn: boolean;
  HOME_COMPARISON: any;
  compareActiveTab: string;
  setCompareActiveTab: (tab: string) => void;
}

export const Comparison: React.FC<ComparisonProps> = ({
  isEn,
  HOME_COMPARISON: rawHomeComparison,
  compareActiveTab,
  setCompareActiveTab
}) => {
  const HOME_COMPARISON = React.useMemo(() => {
    if (!rawHomeComparison) return { ar: {}, en: {} };
    
    const arLocal = rawHomeComparison.ar || {};
    const enLocal = rawHomeComparison.en || {};
    if (arLocal.traditional && enLocal.traditional) {
      return rawHomeComparison;
    }
    
    return {
      ar: {
        title: arLocal.title || "مقارنة صريحة: التشطيب التقليدي مقابل التشطيب الذكي مع شطبها",
        subtitle: arLocal.subtitle || "لماذا يحتاج مالك العقار إلى شطبها من الأساس لتجنب أزمات ومخاطر السوق؟",
        traditional: {
          title: "التشطيب بالطريقة التقليدية (حيرة ومخاطرة)",
          items: (arLocal.rows || []).map((r: any) => ({
            title: r.item || "",
            text: r.trad || ""
          }))
        },
        shattabha: {
          title: "التشطيب مع منصة شطبها (أمان وجودة وراحة بال)",
          items: (arLocal.rows || []).map((r: any) => ({
            title: r.item || "",
            text: r.shatibha || ""
          }))
        }
      },
      en: {
        title: enLocal.title || "Traditional vs Smart Finishing comparison",
        subtitle: enLocal.subtitle || "Why property owners need Shattabha to avoid market crises and risks.",
        traditional: {
          title: "Traditional Contracting (Vague & High Risk)",
          items: (enLocal.rows || []).map((r: any) => ({
            title: r.item || "",
            text: r.trad || ""
          }))
        },
        shattabha: {
          title: "Finishing with Shatibha (Security, Quality & Trust)",
          items: (enLocal.rows || []).map((r: any) => ({
            title: r.item || "",
            text: r.shatibha || ""
          }))
        }
      }
    };
  }, [rawHomeComparison]);

  return (
    <section id="why-shatibha" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAFBFD] via-white to-slate-50 border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-[#D8B448]/10 text-[#856515] text-[11px] font-black px-4 py-1.5 rounded-full border border-[#D8B448]/20 shadow-xs">
            ⚖️ {isEn ? 'Traditional vs Smart Finishing' : 'المشكلة والحل في سوق التشطيبات المطور'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B4D89] tracking-tight leading-tight">
            {isEn ? HOME_COMPARISON.en.title : HOME_COMPARISON.ar.title}
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm font-bold leading-relaxed max-w-2xl mx-auto">
            {isEn ? HOME_COMPARISON.en.subtitle : HOME_COMPARISON.ar.subtitle}
          </p>
        </div>

        {/* Dual Mode comparative card wrapper */}
        <div className="bg-gradient-to-br from-[#1E3254] to-[#122442] rounded-[32px] p-6 md:p-10 text-white relative shadow-2xl overflow-hidden border border-white/5 text-right">
          
          {/* Ambient lighting decorators */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D8B448]/[0.02] rounded-full blur-3xl pointer-events-none" />

          {/* Interactive Toggle tabs */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex bg-slate-950/45 p-2 rounded-2xl border border-white/10 gap-2">
              <button 
                onClick={() => setCompareActiveTab('shatibha')}
                className={`py-2.5 px-6 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
                  compareActiveTab === 'shatibha' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                🛡️ {isEn ? HOME_COMPARISON.en.shattabha.title : HOME_COMPARISON.ar.shattabha.title}
              </button>
              <button 
                onClick={() => setCompareActiveTab('trad')}
                className={`py-2.5 px-6 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
                  compareActiveTab === 'trad' 
                    ? 'bg-[#E54848] text-white shadow-md' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                ⚠️ {isEn ? HOME_COMPARISON.en.traditional.title : HOME_COMPARISON.ar.traditional.title}
              </button>
            </div>
          </div>

          {/* Comparative features rows details */}
          <div dir={isEn ? "ltr" : "rtl"} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {compareActiveTab === 'trad' ? (
              // Traditional issues mapping
              (isEn ? HOME_COMPARISON.en.traditional.items : HOME_COMPARISON.ar.traditional.items || []).map((item: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: isEn ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="p-5 bg-red-950/20 border border-red-500/20 hover:border-red-500/40 rounded-2xl transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 border border-red-500/15">
                      <X className="w-4 h-4" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h4 className={`font-extrabold text-sm text-[#FF8585] ${isEn ? 'text-left' : 'text-right'}`}>
                        {item.title}
                      </h4>
                      <p className={`text-gray-300 text-xs sm:text-[13px] leading-relaxed font-semibold ${isEn ? 'text-left' : 'text-right'}`}>
                        {item.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              // Shatrabha safeguards mapping
              (isEn ? HOME_COMPARISON.en.shattabha.items : HOME_COMPARISON.ar.shattabha.items || []).map((item: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: isEn ? 15 : -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="p-5 bg-emerald-950/15 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/15">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h4 className={`font-extrabold text-sm text-emerald-400 ${isEn ? 'text-left' : 'text-right'}`}>
                        {item.title}
                      </h4>
                      <p className={`text-gray-300 text-xs sm:text-[13px] leading-relaxed font-semibold ${isEn ? 'text-left' : 'text-right'}`}>
                        {item.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

// ==========================================
// 4. PAYMENT SHIELD / ESCROW DURESS
// ==========================================
interface PaymentShieldProps {
  isEn: boolean;
}

export const PaymentShield: React.FC<PaymentShieldProps> = ({ isEn }) => {
  return (
    <section id="payment-shield" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-[#0F6F51] text-[11px] font-black px-4 py-1.5 rounded-full border border-emerald-500/20">
            💸 {isEn ? 'Milestone Escrow Framework' : 'هكذا نحمي مدخراتك من تعنت وجشع المقاولين'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B4D89] tracking-tight text-center">
            {isEn ? 'Double-Blind Escrow Fund Governance Flow' : 'نظام حساب الضمان المالي الآمن لمالك العقار'}
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm font-bold max-w-2xl mx-auto leading-relaxed text-center">
            {isEn 
              ? 'Your money is not transferred to the contractor in advance. It flows through a quad-stage verification protocol conditional on strict sign-off.' 
              : 'لن تحتاج لإعطاء دفعات مالية ضخمة مقدماً للمقاول ثم ترك جودة البنود للصدف؛ شطبها تنشئ جدار حماية رباعي فعال:'}
          </p>
        </div>

        {/* Steps cards grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-right" dir={isEn ? 'ltr' : 'rtl'}>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#FAFBFD] border border-slate-200 p-6 rounded-3xl relative shadow-sm hover:shadow-md transition-all duration-300"
          >
            <span className="absolute -top-4 right-6 w-9 h-9 bg-[#2B4D89] text-white flex items-center justify-center rounded-full text-xs font-black border-4 border-white shadow">
              ١
            </span>
            <div className="mt-2 space-y-2">
              <h4 className="font-extrabold text-sm text-[#2B4D89]">{isEn ? '1. Completion Notice' : '١. طلب تفتيش المرحلة'}</h4>
              <p className="text-gray-500 text-xs sm:text-[13px] leading-relaxed font-bold">
                {isEn ? 'The contractor files a handover request on their secure dashboard after finishing a stage.' : 'يقوم المقاول برفع إقرار بانتهاء مرحلة معينة بموقعك ويطلب بشكل رسمي نزول المشرف للمعاينة.'}
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#FAFBFD] border border-slate-200 p-6 rounded-3xl relative shadow-sm hover:shadow-md transition-all duration-300"
          >
            <span className="absolute -top-4 right-6 w-9 h-9 bg-[#D8B448] text-white flex items-center justify-center rounded-full text-xs font-black border-4 border-white shadow">
              ٢
            </span>
            <div className="mt-2 space-y-2">
              <h4 className="font-extrabold text-sm text-[#2B4D89]">{isEn ? '2. Engineering Audit Visit' : '٢. معاينة المشرف الميداني'}</h4>
              <p className="text-gray-500 text-xs sm:text-[13px] leading-relaxed font-bold">
                {isEn ? 'An independent certified Shatibha engineer visits your unit to verify build codes.' : 'ينزل مهندس الفحص المتخصص من شطبها إلى موقع وحدتك لإجراء المعاينة والتاكد من مطابقة أصول الصنع.'}
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#FAFBFD] border border-slate-200 p-6 rounded-3xl relative shadow-sm hover:shadow-md transition-all duration-300"
          >
            <span className="absolute -top-4 right-6 w-9 h-9 bg-[#2B4D89] text-white flex items-center justify-center rounded-full text-xs font-black border-4 border-white shadow">
              ٣
            </span>
            <div className="mt-2 space-y-2">
              <h4 className="font-extrabold text-sm text-[#2B4D89]">{isEn ? '3. Certified Report Issued' : '٣. تقرير الاعتماد والصور الفنية'}</h4>
              <p className="text-gray-500 text-xs sm:text-[13px] leading-relaxed font-bold">
                {isEn ? 'The engineer loads detailed quality reports with snapshots directly inside your panel.' : 'يرفع المهندس تقرير استلام للمراحل مدعوماً بلب الصور التوثيقية الدقيقة لإعلان مطابقة البنود.'}
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#FAFBFD] border border-slate-200 p-6 rounded-3xl relative shadow-sm hover:shadow-md transition-all duration-300"
          >
            <span className="absolute -top-4 right-6 w-9 h-9 bg-emerald-600 text-white flex items-center justify-center rounded-full text-xs font-black border-4 border-white shadow animate-pulse">
              ٤
            </span>
            <div className="mt-2 space-y-2">
              <h4 className="font-extrabold text-sm text-emerald-700">{isEn ? '4. Safe Escrow Release' : '٤. تحرير الميزانية المربوطة'}</h4>
              <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed font-bold">
                {isEn ? 'Meeting code parameters automatically unlocks the segment directly to the contractor.' : 'بمجرد تأكدك من سلامة العمل وصدور تقرير المهندس، يتم الإفراج عن الكاش وبطوع رغبتك لاستكمال ما يليه.'}
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

// ==========================================
// 5. INDEPENDENT ENGINEERING SUPERVISION
// ==========================================
interface EngineeringSupervisionProps {
  isEn: boolean;
}

export const EngineeringSupervision: React.FC<EngineeringSupervisionProps> = ({ isEn }) => {
  return (
    <section id="engineering-supervision" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAFBFD] via-white to-[#F4F6F9]/40 border-b border-slate-100 relative overflow-hidden" dir={isEn ? 'ltr' : 'rtl'}>
      {/* Blueprint background grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800b_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch relative z-10">
        
        {/* Content Column (lg:col-span-6) */}
        <div className={`lg:col-span-6 space-y-8 flex flex-col justify-center ${isEn ? 'text-left' : 'text-right'}`}>
          <div>
            <span className="inline-flex items-center gap-2 bg-[#2B4D89]/5 text-[#2B4D89] text-[11px] sm:text-xs font-black px-4 py-1.5 rounded-full border border-[#2B4D89]/10 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8B448] animate-pulse" />
              {isEn ? 'Certified Site Inspectors' : 'قوة الكشف والرقابة الهندسية الميدانية'}
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B4D89] leading-tight tracking-tight">
              {isEn ? 'Independent Engineering Site Inspectors Stand with You' : 'لماذا الإشراف الهندسي المستقل من شطبها يحمي منزلك وعقارك؟'}
            </h2>
            <p className="text-gray-500 text-xs sm:text-[13.5px] leading-relaxed font-bold">
              {isEn 
                ? 'Your home represents an expensive life investment. Placing it blindly in builders hands without independent code checking risks costly leaks or wiring failures. Shattabhas inspectors act as your professional eyes, auditing alignment and specifications.' 
                : 'استثمارك المالي في شقتك أو فيلتك هو الأكبر في حياتك. تسليم المخططات والميزانية لمقاول دون استشاري ومفتش مستقل يعني مواجهة مشاكل السباكة الخفية والكهرباء والدهانات الرديئة. مهندسو الفحص من شطبها يقفون معك داخل الموقع كطرف مستقل تمامًا ومحايد؛ غايتهم القصوى استلام المواد وفق الأكواد القياسية قبل استحقاق أي دفعة مالية للمقاول.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4.5 bg-white border border-slate-100 rounded-2xl flex items-start gap-4 shadow-sm hover:border-[#2B4D89]/15 hover:shadow-md transition-all duration-300">
              <div className="p-2.5 bg-[#2B4D89]/5 text-[#2B4D89] rounded-xl shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-right">
                <h4 className="font-extrabold text-[#2B4D89] text-xs sm:text-sm">{isEn ? 'Site Inspection Routines' : 'جدولة زيارات الفحص الفني'}</h4>
                <p className="text-[10px] text-gray-400 font-bold leading-normal">{isEn ? 'Inspecting during major plumbing & casting works.' : 'معاينة مهندسي شطبها في لحظات الصب الحرجة وتأسيس الخامات.'}</p>
              </div>
            </div>

            <div className="p-4.5 bg-white border border-slate-100 rounded-2xl flex items-start gap-4 shadow-sm hover:border-[#2B4D89]/15 hover:shadow-md transition-all duration-300">
              <div className="p-2.5 bg-[#D8B448]/10 text-[#D8B448] rounded-xl shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-right">
                <h4 className="font-extrabold text-[#2B4D89] text-xs sm:text-sm">{isEn ? 'Rich Visual Diagnostics' : 'تقارير فحص مدعومة بالصور'}</h4>
                <p className="text-[10px] text-gray-400 font-bold leading-normal">{isEn ? 'Pristine logs uploaded inside your user panel.' : 'توثيق هندسي دقيق لكل ماسورة عزل أو سلك ممدد صوراً وفيديوهات.'}</p>
              </div>
            </div>

          </div>
        </div>

        {/* High-tech interactive digital inspection panel (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-[#2B4D89] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-white/10 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-all duration-700" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#D8B448]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col h-full justify-between z-10 relative space-y-6">
            
            {/* Live Inspection Header status bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono tracking-wider text-emerald-300 font-bold">
                  {isEn ? 'ON-SITE CODE PASS' : 'الاستلام مطابق للكود المصري 🟢'}
                </span>
              </div>
              
              <span className="text-[10px] bg-[#D8B448]/20 text-[#FFDF79] px-2.5 py-1 rounded border border-[#D8B448]/30 font-black">
                {isEn ? 'SHATTABHA CERTIFIED AUDITING' : 'مكتب الإشراف الهندسي المباشر'}
              </span>
            </div>

            {/* Info header block */}
            <div className={`space-y-1.5 ${isEn ? 'text-left' : 'text-right'}`}>
              <h3 className="text-base sm:text-lg font-black text-white">
                {isEn ? 'Standard Inspection Duties Administered' : 'مفتش الجودة من شطبها: رفيقك الميداني الموثوق'}
              </h3>
              <p className="text-blue-100/80 text-xs leading-relaxed font-bold">
                {isEn 
                  ? 'We verify brand validity, material thickness, drop ceiling elevations, and alignment parameters.'
                  : 'تتضمن مهام المشرف الهندسي الفحص السلوكي الشامل وإصدار إقرارات القبول والمطابقة للبنود التالية:'}
              </p>
            </div>

            {/* Checklist of services */}
            <div className="bg-slate-950/20 rounded-2xl border border-white/5 p-4.5 space-y-3.5 text-right">
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0 border border-emerald-400/30">
                  <Check className="w-3 h-3 text-emerald-300" />
                </div>
                <span className="text-xs text-white font-bold flex-1 leading-snug">
                  {isEn ? 'Checking copper cords, wall switches, and electrical leak limits.' : 'فحص كوابل النحاس، لوحة المفاتيح والارتداد والتسريب لشبكة الكهرباء.'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0 border border-emerald-400/30">
                  <Check className="w-3 h-3 text-emerald-300" />
                </div>
                <span className="text-xs text-white font-bold flex-1 leading-snug">
                  {isEn ? 'Testing plumbing pipelines pressure under standard limits.' : 'كبس واختبار شبكة السباكة وتأكيد جودة العزل المائي بالحمامات.'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0 border border-emerald-400/30">
                  <Check className="w-3 h-3 text-emerald-300" />
                </div>
                <span className="text-xs text-white font-bold flex-1 leading-snug">
                  {isEn ? 'Inspecting wall horizontal alignment and gypsum board suspension.' : 'فحص استقامة المحارة والجدران بالقدة وضبط مناسيب الأسقف المعلقة.'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#D8B448]/20 flex items-center justify-center shrink-0 border border-[#D8B448]/30">
                  <Check className="w-3 h-3 text-[#FFDF79]" />
                </div>
                <span className="text-xs text-white font-bold flex-1 leading-snug">
                  {isEn ? 'Verifying raw materials brands on site before construction deployment.' : 'مطابقة خامات البناء الواردة للموقع مع الماركات المدونة بالاتفاق السعري.'}
                </span>
              </div>

            </div>

            {/* QA Gauge slider element */}
            <div className="space-y-2 font-black">
              <div className="flex justify-between text-[10px] font-mono text-blue-100/90">
                <span>{isEn ? 'Shattabha Inspector Standard' : 'مؤشرات جودة المعاينة واستحقاق الدفعات'}</span>
                <span className="font-black text-[#FFDF79]">100% Guaranteed Quality</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 via-[#D8B448] to-[#FFDF79] w-full" />
              </div>
            </div>

            {/* Bottom notification tag */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <span className="text-xl shrink-0">💎</span>
              <div className="flex-1 space-y-0.5 text-right">
                <h4 className="font-extrabold text-xs text-[#FFDF79]">
                  {isEn ? 'The Value Result:' : 'النتيجة المضمونة لمالك الوحدات:'}
                </h4>
                <p className="text-xs text-white/95 font-semibold leading-relaxed">
                  {isEn 
                    ? 'Higher quality, zero execution setbacks, and supreme legal audit security.' 
                    : 'جدار هندسي حامٍ يمنع هدر أموالك في تعديلات لاحقة باهظة التكلفة، لتعود لبيتك وأنت مطمئن البال.'}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 6. TRIPARTITE BID SECURITY
// ==========================================
interface TripartiteBidSecurityProps {
  isEn: boolean;
}

export const TripartiteBidSecurity: React.FC<TripartiteBidSecurityProps> = ({ isEn }) => {
  return (
    <section id="tender-security" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-[#2B4D89]/5 text-[#2B4D89] text-[11px] sm:text-xs font-black px-4 py-1.5 rounded-full border border-[#2B4D89]/10 shadow-sm">
            🛡️ {isEn ? 'Tripartite Platform Security Model' : 'أركان الأمان والمصداقية في منصة شطبها'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B4D89] tracking-tight">
            {isEn ? 'Unified Security for Bidding Platform Parties' : 'أمان كامل يحكم جميع أطراف عملية التشطيب'}
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm font-bold leading-relaxed max-w-2xl mx-auto">
            {isEn 
              ? 'Shattabha is not just a digital list directory, but an integrated engineering, supervisory, and financial control network.' 
              : 'شطبها ليست مجرد وسيط أو دليل لجهات التشطيب، بل هي منصة حوكمة هندسية ومالية متكاملة تضمن إسناد مشروعك لجهات موثوقة وعقود مدعمة.'}
          </p>
        </div>

        {/* Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          
          {/* Card 1: Privacy / Hiding numbers */}
          <div className="bg-[#FAFBFD] rounded-3xl p-8 border border-slate-150 hover:border-[#2B4D89]/30 hover:shadow-xl transition-all duration-300 flex flex-col justify-start items-center text-center space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-[#2B4D89] group-hover:bg-[#2B4D89] group-hover:text-white transition-all duration-300 shadow-sm">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#2B4D89]">
              {isEn ? 'Anonymity & Contact Privacy Mask' : 'خصوصية مشفرة وحجب أرقام الهاتف'}
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-bold">
              {isEn 
                ? 'We block contact spam or broker disturbance. Your specifications are showcased anonymously, and tenders appear inside your personal dashboard.' 
                : 'نحاذر من جلب الإزعاج والمكالمات الترويجية المنهكة لك. رقم هاتفك يظل مشفراً ومحجوباً بالكامل؛ مواصفات شقتك تطرح كحالة مجهولة حتى تختار العرض المناسب بنفسك.'}
            </p>
          </div>

          {/* Card 2: Legal Contracts */}
          <div className="bg-[#FAFBFD] rounded-3xl p-8 border border-slate-150 hover:border-[#2B4D89]/30 hover:shadow-xl transition-all duration-300 flex flex-col justify-start items-center text-center space-y-4 group font-sans">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-[#D8B448] group-hover:bg-[#D8B448] group-hover:text-white transition-all duration-300 shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#2B4D89]">
              {isEn ? 'Rigid Tripartite Contract Blueprints' : 'عقد ثلاثي ملزم يحفظ حقوق الطرفين'}
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-bold">
              {isEn 
                ? 'A strict tripartite legal formulation sponsor-signed by Shattabha locks execution parameters, material matrices, and avoids cost surprise.' 
                : 'صياغة قانونية محكمة برعاية وإشراف "شطبها" كشاهد وضامن فني، توثق جدول البنود التفصيلي بالتسعير الثابت دون ترك أي ثغرة للزيادات المفاجئة.'}
            </p>
          </div>

          {/* Card 3: Vetted Firms */}
          <div className="bg-[#FAFBFD] rounded-3xl p-8 border border-slate-150 hover:border-[#2B4D89]/30 hover:shadow-xl transition-all duration-300 flex flex-col justify-start items-center text-center space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#2B4D89]">
              {isEn ? 'Contractors Vetted with Legal Paperwork' : 'شركات ومكاتب معتمدة بالسجل التجاري'}
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-bold">
              {isEn 
                ? 'We strictly enforce legal vetting checks on registers, TAX files, and studio capabilities to fully block raw individual labor threats.' 
                : 'نقصي تماماً العشوائية ومخاطر الهروب أو قلة الأمان المهني. جميع المنشآت والشركات المقبولة بالمنصة تملك بطاقات ضريبية وسجلات تجارية سارية ومعاينة ميدانياً.'}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

// ==========================================
// 7. FINISHING PACKAGES & CALCULATOR
// ==========================================
interface FinishingPackagesAndCalculatorProps {
  isEn: boolean;
  HOME_PACKAGES: any[];
  selectedPkgId: string;
  setSelectedPkgId: (id: string) => void;
  calcArea: number;
  setCalcArea: (area: number | ((prev: number) => number)) => void;
  setModalType: (type: any) => void;
}

export const FinishingPackagesAndCalculator: React.FC<FinishingPackagesAndCalculatorProps> = ({
  isEn,
  HOME_PACKAGES,
  selectedPkgId,
  setSelectedPkgId,
  calcArea,
  setCalcArea,
  setModalType
}) => {
  const activePkg = HOME_PACKAGES.find(p => p.id === selectedPkgId) || HOME_PACKAGES[1] || HOME_PACKAGES[0];
  
  // Pricing lookup map
  const priceMap: Record<string, number> = {
    'pkg-eco': 4500,
    'pkg-lux': 6500,
    'pkg-super': 9000,
    'pkg-premium': 13000
  };
  const ratePerMeter = priceMap[selectedPkgId] || 6500;
  const estimatedCost = ratePerMeter * calcArea;

  return (
    <section id="finishing-packages" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAFBFD] border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block bg-[#2B4D89]/10 text-[#2B4D89] text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
            ✨ {isEn ? 'Finishing Packages & Cost Estimators' : 'الباقات ومستويات التشطيب الفاخرة وحاسبة الميزانية'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B4D89]">
            {isEn ? 'Certified Material Standards & Specifications' : 'باقات ومعايير الخامات الموثقة بالمسامير والماركات'}
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm font-bold max-w-2xl mx-auto leading-relaxed">
            {isEn 
              ? 'Explore custom finishing bundles locking exact brands under tripartite transparency. Adjust build metrics below to calculate costs.' 
              : 'نوثّق تفاصيل خامات كل فئة بالمسامير وماركات الأسلاك وعزل الرطوبة. استخدم الحاسبة الذكية في الأسفل لتعديل ميزانية عقارك فورياً ومباشرة.'}
          </p>
        </div>

        {/* 1. Dynamic Presets Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOME_PACKAGES.map((pkg) => {
            const isActive = selectedPkgId === pkg.id;
            return (
              <motion.div 
                key={pkg.id}
                onClick={() => setSelectedPkgId(pkg.id)}
                whileHover={{ y: -5 }}
                className={`bg-white rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between hover:shadow-xl cursor-pointer relative ${
                  isActive 
                    ? 'border-[#D8B448] ring-4 ring-[#D8B448]/5 shadow-md scale-[1.02]' 
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#D8B448] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-sm z-10 whitespace-nowrap">
                    🎯 {isEn ? 'Linked To Calculator' : 'محددة في الحاسبة'}
                  </span>
                )}

                <div className="space-y-4 text-right">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-2">
                    <span className="text-sm">⭐️</span>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#2B4D89] text-right w-full">
                      {isEn ? pkg.nameEn : pkg.nameAr}
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold block">{isEn ? 'Average cost rate / sqm:' : 'متوسط سعر المتر:'}</span>
                    <span className="text-[#D8B448] text-lg sm:text-xl font-black">
                      {isEn ? pkg.priceEn : pkg.priceAr}
                    </span>
                  </div>

                  <ul className="space-y-2 text-[11px] sm:text-xs font-bold text-gray-500 text-right py-2 border-t border-slate-100 mt-2">
                    {(isEn ? pkg.featuresEn : pkg.featuresAr).map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 justify-end">
                        <span className="flex-1 leading-relaxed">{feat}</span>
                        <Check className="w-3.5 h-3.5 text-[#D8B448] shrink-0 mt-0.5" />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPkgId(pkg.id);
                    }}
                    className={`w-full py-2.5 rounded-xl text-[11px] font-black transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'bg-[#2B4D89] text-white shadow-md' 
                        : 'bg-slate-50 text-[#2B4D89] border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isActive ? (isEn ? 'Active Selection ✓' : 'الباقة قيد التدقيق بالموازنة ✓') : (isEn ? 'Sync with Calculator' : 'احسب التكلفة بهذه الباقة')}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 2. Interactive Smart Cost Estimator Panel */}
        <div className="bg-gradient-to-br from-[#1E3354] to-[#122442] rounded-[32px] p-6 lg:p-10 text-white relative shadow-2xl overflow-hidden border border-white/5">
          <div className="absolute top-[-50px] left-[-50px] w-72 h-72 bg-[#D8B448]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-[#2B4D89]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Calculation output display (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-center">
              <div>
                <span className="bg-[#D8B448]/20 text-[#FFDF79] text-[10px] sm:text-[11px] font-black px-4 py-1.5 rounded-full border border-[#D8B448]/30 uppercase tracking-widest inline-block">
                  💰 {isEn ? 'Estimated Total Finishing Budget' : 'إجمالي الميزانية التقديرية لوحدتك'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-gray-300 font-bold block">{isEn ? 'Cost calculation output range:' : 'التكلفة الإجمالية التقديرية الحية:'}</span>
                <span className="text-2xl sm:text-4.5xl font-black text-[#D8B448] tracking-tight block font-mono">
                  {estimatedCost.toLocaleString('ar-EG')} {isEn ? 'EGP' : 'جنية مصري'}
                </span>
                <span className="text-[10px] text-slate-350 font-medium block">
                  {isEn ? '* Based on pure code matching and market averages' : '* تقدير تقريبي حي وفقاً لأسعار السوق الحالية وخامات الفئة المدونة.'}
                </span>
              </div>

              <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-950/25 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-300 font-black block">{isEn ? 'Unit Area' : 'مساحة الوحدة'}</span>
                  <span className="text-xs sm:text-sm font-black text-white">{calcArea} {isEn ? 'm²' : 'متر مربع'}</span>
                </div>
                <div className="bg-slate-950/25 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-300 font-black block">{isEn ? 'Finishing Level' : 'الفئة والتشبيك'}</span>
                  <span className="text-[11px] font-black text-[#D8B448] block leading-snug truncate">
                    {isEn ? activePkg?.nameEn.split('Package')[0] : activePkg?.nameAr.split('📋')[0].split('👷')[0].split('✨')[0].split('👑')[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Slider UI input controls (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6 text-right">
              <div className="space-y-1.5">
                <span className="text-amber-400 text-xs font-bold block">{isEn ? 'INTERACTIVE LIVE ESTIMATOR' : 'الحاسبة الذكية الفورية'}</span>
                <h3 className="text-xl sm:text-2.5xl font-extrabold text-white">{isEn ? 'Shattabha Smart Estimator' : 'خطط ميزانية تشطيب منزلك في ثوانٍ'}</h3>
                <p className="text-gray-300 text-xs sm:text-[13px] leading-relaxed font-bold">
                  {isEn 
                    ? 'Adjust the area slider to match your exact apartment or clinic size. Switch finishing bundles to sync estimated budgets instantly.' 
                    : 'اسحب شريط القياس لتحديد المساحة الصافية لوحدتك العقارية بمصر، ثم اختر مستوى التشطيب لتحديث حسابات الميزانية فورياً وتفادياً لمفاجآت التكلفة.'}
                </p>
              </div>

              {/* Area Range Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-[#D8B448] font-mono text-sm sm:text-base">{calcArea} {isEn ? 'sqm' : 'متر مربع'}</span>
                  <span className="text-gray-200">{isEn ? 'Built Area Measure:' : 'المساحة الإجمالية لوحدتك:'}</span>
                </div>

                <input 
                  type="range"
                  min="50"
                  max="500"
                  step="5"
                  value={calcArea}
                  onChange={(e) => setCalcArea(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D8B448] focus:outline-none"
                />

                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>٥٠٠ م²</span>
                  <span>٢٥٠ م²</span>
                  <span>٥٠ م²</span>
                </div>
              </div>

              {/* Presets Grid Toggle tabs */}
              <div className="space-y-2">
                <span className="block text-xs font-black text-gray-200">💡 {isEn ? 'Choose Finishing Standard:' : 'اختر فئة ومستوى التشطيب:'}</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/40 p-1 rounded-xl border border-white/5">
                  {HOME_PACKAGES.map((pkg) => {
                    const isSelect = selectedPkgId === pkg.id;
                    return (
                      <button 
                        key={pkg.id}
                        onClick={() => setSelectedPkgId(pkg.id)}
                        className={`p-2 rounded-lg text-[10px] sm:text-[11px] font-black transition-all cursor-pointer text-center truncate ${
                          isSelect 
                            ? 'bg-[#D8B448] text-slate-950 font-bold' 
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {isEn 
                          ? pkg.nameEn.split('Package')[0].replace('📋', '').replace('👷', '').replace('✨', '').replace('👑', '') 
                          : pkg.nameAr.replace('📋', '').replace('👷', '').replace('✨', '').replace('👑', '')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Apply trigger with micro interaction */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-end">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModalType('CLIENT')}
                  className="bg-[#D8B448] hover:bg-yellow-500 text-slate-950 font-black px-8 py-3.5 rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all border border-[#D8B448]/30"
                >
                  <span>🎯 {isEn ? 'Submit Request to Bids' : 'اطرح عقاري في مناقصة مغلقة بهذا السعر مجاناً'}</span>
                </motion.button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 8. TRUST METRICS / BENCHMARKS
// ==========================================
interface TrustMetricsProps {
  isEn: boolean;
}

export const TrustMetrics: React.FC<TrustMetricsProps> = ({ isEn }) => {
  return (
    <section id="trust-metrics" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#192f52] to-[#2B4D89] text-white overflow-hidden border-b border-white/5 shadow-inner">
      <div className="max-w-7xl mx-auto text-center space-y-12">
        
        {/* Core Header description */}
        <div className="max-w-2xl mx-auto space-y-3 text-center">
          <span className="text-[10px] sm:text-xs text-[#D8B448] font-black uppercase tracking-widest block font-sans">
            🛡️ {isEn ? 'Platform Integrity Index' : 'مؤشرات الأمان ومقاييس الأداء للمنصة'}
          </span>
          <h3 className="text-xl sm:text-2.5xl font-black text-white text-center">
            {isEn ? 'Shattabha Financial & Engineering Safeguards' : 'أرقام وحقائق الضمان الشامل لمالك العقار'}
          </h3>
          <p className="text-gray-300 text-xs sm:text-sm font-bold leading-relaxed text-center">
            {isEn 
              ? 'Comprehensive governance metrics protecting residential and commercial properties across Egypt.' 
              : 'نمنع المشاكل النمطية ومظاهر النصب وتجاوز الميزانيات؛ بخلق جدار حوكمة متين يضمن جدارتك وخصوصيتك:'}
          </p>
        </div>

        {/* Facts grids */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2 hover:border-[#D8B448] hover:bg-white/10 transition-all duration-350 text-center"
          >
            <span className="text-3xl block text-[#D8B448]">🏠</span>
            <h4 className="text-2xl sm:text-3.5xl font-black text-[#D8B448] font-mono">٣٠٠+</h4>
            <p className="text-[11px] text-gray-150 font-bold">{isEn ? 'Finished Units' : 'شقة ووحدة معتمدة'}</p>
            <p className="text-[9px] text-white/40 font-bold">{isEn ? 'Under Site Inspection' : 'تم استلامها مأذونة فحص'}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2 hover:border-[#D8B448] hover:bg-white/10 transition-all duration-355 text-center"
          >
            <span className="text-3xl block text-[#D8B448]">👷</span>
            <h4 className="text-2xl sm:text-3.5xl font-black text-[#D8B448] font-mono">٢٠+</h4>
            <p className="text-[11px] text-gray-150 font-bold">{isEn ? 'Certified Inspectors' : 'مهندس تفتيش استشاري'}</p>
            <p className="text-[9px] text-white/40 font-bold">{isEn ? 'For Code Handovers' : 'لتحكيم مواصفة أصول الصنع'}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2 hover:border-[#D8B448] hover:bg-white/10 transition-all duration-360 text-center"
          >
            <span className="text-3xl block text-[#D8B448]">🏢</span>
            <h4 className="text-2xl sm:text-3.5xl font-black text-[#D8B448] font-mono">١٢+</h4>
            <p className="text-[11px] text-gray-150 font-bold">{isEn ? 'Studios Vetted' : 'شركة ومكتب تشطيب معتمد'}</p>
            <p className="text-[9px] text-white/40 font-bold">{isEn ? 'Vetted Registers' : 'بأوراق تجارية معلنة وسارية'}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2 hover:border-[#D8B448] hover:bg-white/10 transition-all duration-365 text-center"
          >
            <span className="text-3xl block text-[#D8B448]">🔒</span>
            <h4 className="text-2xl sm:text-3.5xl font-black text-[#D8B448] font-mono">٠٪</h4>
            <p className="text-[11px] text-gray-150 font-bold">{isEn ? 'Overpricing Risks' : 'مخاطر هروب أو سرقة كاش'}</p>
            <p className="text-[9px] text-white/40 font-bold">{isEn ? 'Milestone Escrow Protect' : 'لحفظ دفعاتك بحساب الضمان'}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2 hover:border-[#D8B448] hover:bg-white/10 transition-all duration-370 text-center col-span-2 md:col-span-1"
          >
            <span className="text-3xl block text-[#D8B448]">🛡️</span>
            <h4 className="text-2xl sm:text-3.5xl font-black text-[#D8B448] font-mono">١٠٠٪</h4>
            <p className="text-[11px] text-gray-150 font-bold">{isEn ? 'Phone Number masked' : 'حماية لبيانات الاتصال'}</p>
            <p className="text-[9px] text-white/40 font-bold">{isEn ? 'No broker phone spams' : 'رقمك لا يظهر للشركات مطلقاً'}</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

// ==========================================
// 9. CLIENT TESTIMONIALS SLIDER
// ==========================================
interface TestimonialsAndStatsProps {
  isEn: boolean;
  HOME_TESTIMONIALS: any[];
  currentTestimonialIndex: number;
  setCurrentTestimonialIndex: (index: number | ((prev: number) => number)) => void;
  setModalType: (type: any) => void;
}

export const TestimonialsAndStats: React.FC<TestimonialsAndStatsProps> = ({
  isEn,
  HOME_TESTIMONIALS,
  currentTestimonialIndex,
  setCurrentTestimonialIndex,
  setModalType
}) => {
  const currentTestimonial = HOME_TESTIMONIALS[currentTestimonialIndex];

  return (
    <section id="testimonials-stats" className="py-20 bg-[#FAFBFD] border-b border-slate-100 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#2B4D89]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D8B448]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Column layout (lg:col-span-12 to lg:col-span-5) */}
          <div className={`lg:col-span-5 space-y-6 flex flex-col justify-center ${isEn ? 'text-left' : 'text-right'}`}>
            <div className="space-y-3 text-right">
              <div className="inline-flex items-center gap-2 bg-[#2B4D89]/5 text-[#2B4D89] text-xs font-black px-4 py-2 rounded-full border border-[#2B4D89]/10">
                <Sparkles className="w-3.5 h-3.5 text-[#D8B448]" />
                <span>{isEn ? 'Verified Evaluations' : 'آراء وقصص النجاح لمالكي الوحدات'}</span>
              </div>
              
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B4D89] leading-tight text-right w-full">
                {isEn ? 'What Do They Say About Shattabha?' : 'بصمات الرضا وتقارير التسليم المعتمدة'}
              </h2>
              
              <p className="text-gray-500 text-xs sm:text-sm font-bold leading-relaxed text-right w-full">
                {isEn 
                  ? 'Real, verified evaluations left by homeowners, villa occupants, and startup workspace developers.' 
                  : 'مراجعات وتجارب واقعية لمالكين سلموا شققهم وعياداتهم لشركاتنا تحت إشراف طاقمنا وعقد حساب الضمان الآمن:'}
              </p>
            </div>

            {/* General rating statistics block */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-right space-y-4">
              <div className="flex items-center gap-4 justify-end">
                <div className="text-right">
                  <div className="flex items-center gap-0.5 text-amber-500 mb-1 justify-end">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-amber-500" />
                    ))}
                  </div>
                  <p className="text-[11px] text-[#2B4D89] font-black">
                    {isEn ? 'Based on +350 physical site handovers' : 'بناءً على أكثر من ٣٥٠ إقرار تسليم هندسي معتمد'}
                  </p>
                </div>
                <span className="text-3xl sm:text-5xl font-black text-[#2B4D89] font-mono">4.9</span>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <p className="text-xs sm:text-sm font-black text-emerald-600">100%</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{isEn ? 'Verified Audits' : 'فحص هندسي كامل'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <p className="text-xs sm:text-sm font-black text-[#D8B448]">0 %</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{isEn ? 'Contractor Spam calls' : 'مكالمات إزعاج وسمسرة'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Testimonials Slide (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300 relative group text-right">
              
              <span className="absolute top-4 left-6 text-slate-150 font-serif text-7xl select-none leading-none pointer-events-none">
                ”
              </span>

              {/* Verified Badge Header of review */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 relative z-10" dir={isEn ? 'ltr' : 'rtl'}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isEn ? 'Verified Evaluation Record' : 'تقرير تسليم وتقييم هندسي موثق'}</span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {currentTestimonial && Array.from({ length: currentTestimonial.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-amber-500" />
                  ))}
                </div>
              </div>

              {/* Testimonial Core text area */}
              <div className="py-8 min-h-[140px] flex flex-col justify-center relative z-10 text-right">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={currentTestimonialIndex}
                    initial={{ opacity: 0, scale: 0.99, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.99, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-slate-600 text-xs sm:text-[14.5px] font-bold leading-relaxed text-right"
                  >
                    "{isEn ? currentTestimonial?.textEn : currentTestimonial?.textAr}"
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Controls and user profile row */}
              <div className="flex flex-wrap items-center justify-between pt-6 border-t border-slate-100 gap-4 relative z-10" dir={isEn ? 'ltr' : 'rtl'}>
                
                {/* Profile info left */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2B4D89] to-[#1E3A68] text-white flex items-center justify-center text-xs sm:text-sm font-black border-2 border-white shadow-md shrink-0">
                    <span>{currentTestimonial?.initial}</span>
                  </div>
                  <div className={`${isEn ? 'text-left' : 'text-right'}`}>
                    <h4 className="text-xs sm:text-sm font-black text-[#2B4D89] leading-tight">
                      {isEn ? currentTestimonial?.nameEn : currentTestimonial?.nameAr}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      {isEn ? currentTestimonial?.locationEn : currentTestimonial?.locationAr}
                    </p>
                  </div>
                </div>

                {/* slide controls right */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-bold font-sans select-none tracking-wider">
                    {(currentTestimonialIndex + 1).toString().padStart(2, '0')} / {HOME_TESTIMONIALS.length.toString().padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setCurrentTestimonialIndex((prev) => (prev - 1 + HOME_TESTIMONIALS.length) % HOME_TESTIMONIALS.length)}
                      className="w-9 h-9 rounded-full border border-slate-200 text-slate-600 hover:border-[#2B4D89] hover:bg-slate-50 hover:text-[#2B4D89] bg-white transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-3xs"
                    >
                      {isEn ? <ChevronLeft className="w-4.5 h-4.5" /> : <ChevronRight className="w-4.5 h-4.5" />}
                    </button>
                    <button 
                      onClick={() => setCurrentTestimonialIndex((prev) => (prev + 1) % HOME_TESTIMONIALS.length)}
                      className="w-9 h-9 rounded-full border border-slate-200 text-slate-600 hover:border-[#2B4D89] hover:bg-slate-50 hover:text-[#2B4D89] bg-white transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-3xs"
                    >
                      {isEn ? <ChevronRight className="w-4.5 h-4.5" /> : <ChevronLeft className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Stats Bottom Banner Strip */}
      <div className="w-full bg-[#1E3254] text-white py-12 mt-16 shadow-inner border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-center justify-items-center text-center">
          
          <div className="space-y-1 w-full text-center">
            <h3 className="text-2xl sm:text-3.5xl font-black text-[#D8B448] tracking-tight font-serif flex items-center justify-center gap-1">
              <span>+١٥٠</span>
            </h3>
            <p className="text-xs sm:text-[13px] font-bold text-white/95">
              {isEn ? 'Finishing studios and contractors vetted' : 'شركة ومكاتب تشطيبات واستشاري معتمد'}
            </p>
          </div>

          <div className="space-y-1 w-full text-center md:border-r md:border-l md:border-white/10 px-4">
            <h3 className="text-2xl sm:text-3.5xl font-black text-[#D8B448] tracking-tight font-serif">
              ١،٢٠٠+
            </h3>
            <p className="text-xs sm:text-[13px] font-bold text-white/95">
              {isEn ? 'Tender offers completed across Egypt' : 'عطاء ومناقصة أسعار مكتمل بـ حساب الضمان'}
            </p>
          </div>

          <div className="space-y-1 w-full text-center">
            <h3 className="text-2xl sm:text-3.5xl font-black text-[#D8B448] tracking-tight font-serif">
              ٥٠٠+
            </h3>
            <p className="text-xs sm:text-[13px] font-bold text-white/95">
              {isEn ? 'Delighted property owners contracted securely' : 'مالك وحدة وثق عمل تشطيبه وبدأ التعاقد آمن'}
            </p>
          </div>

        </div>
      </div>

    </section>
  );
};
