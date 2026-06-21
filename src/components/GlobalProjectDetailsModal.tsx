import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { 
  X, Info, Building2, Calendar, CheckCircle2, ShieldCheck, 
  AlertTriangle, DollarSign, MapPin, Layers, Clock, FileText, 
  User as UserIcon, HelpCircle, Eye, Compass, LayoutDashboard, Sparkles, Receipt, HardHat
} from 'lucide-react';
import { ClientRequest, Offer, Company, Contract, Inspector, ProjectStage, WarrantyRecord, WarrantyComplaint } from '../types';
import { Language } from '../lib/translations';

interface GlobalProjectDetailsModalProps {
  requestId: string;
  requests: ClientRequest[];
  offers: Offer[];
  companies: Company[];
  contracts: Contract[];
  inspectors: Inspector[];
  stages: ProjectStage[];
  warranties: WarrantyRecord[];
  complaints: WarrantyComplaint[];
  lang: Language;
  activeView?: string;
  onClose: () => void;
  onGoToDashboard: (view: 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR', selectedRequestId?: string) => void;
}

export const GlobalProjectDetailsModal: React.FC<GlobalProjectDetailsModalProps> = ({
  requestId,
  requests,
  offers,
  companies,
  contracts,
  inspectors,
  stages,
  warranties,
  complaints,
  lang,
  activeView,
  onClose,
  onGoToDashboard
}) => {
  const isEn = lang === 'en';
  
  // Find the target request
  const request = requests.find(r => r.id === requestId);
  
  const isContractor = activeView === 'COMPANY' || activeView === 'PORTAL_COMPANY';
  const isContractSigned = request && (request.status === 'ACTIVE' || request.status === 'CONTRACT_SIGNED' || request.status === 'CONTRACTED' || request.status === 'COMPLETED');
  
  if (!request) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <div className="text-amber-500 text-5xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold mb-2 text-slate-800">
            {isEn ? 'Project Not Found' : 'لم يتم العثور على المشروع'}
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            {isEn ? `The project with ID ${requestId} does not exist in the system.` : `رمز المشروع أو الطلب ${requestId} غير موجود بالمنظومة حالياً.`}
          </p>
          <button 
            onClick={onClose}
            className="w-full bg-[#2B4D89] text-white py-2 rounded-xl text-xs font-bold cursor-pointer"
          >
            {isEn ? 'Close' : 'إغلاق النافذة'}
          </button>
        </div>
      </div>
    );
  }

  // Related Entities data lookup
  const relatedContract = contracts.find(c => c.requestId === request.id);
  const relatedOffers = offers.filter(o => o.requestId === request.id);
  const relatedStages = stages.filter(s => s.requestId === request.id);
  const assignedInspector = inspectors.find(i => i.id === request.assignedInspectorId);
  const relatedWarranty = warranties.find(w => w.requestId === request.id);
  const relatedComplaints = complaints.filter(wc => wc.requestId === request.id);

  const acceptedOffer = offers.find(o => o.id === request.selectedOfferId);
  const acceptedCompany = companies.find(c => c.id === (acceptedOffer?.companyId || request.selectedCompanyId));

  // Active Tab state inside modal
  const [activeTab, setActiveTab] = useState<'INFO' | 'OFFERS' | 'CONTRACT' | 'STAGES' | 'WARRANTY'>('INFO');
  const [isAcceptedOfferExpanded, setIsAcceptedOfferExpanded] = useState<boolean>(false);

  // Status mapping for visual aesthetics (All themed in professional blue/slate tones)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { ar: '🎉 مكتمل ومسلم', en: 'Completed & Signed', bg: 'bg-emerald-50 text-emerald-800 border-emerald-150' };
      case 'ACTIVE':
      case 'CONTRACT_SIGNED':
      case 'CONTRACTED':
        return { ar: '🚧 جاري التنفيذ ميدانياً', en: 'Live Under-way', bg: 'bg-[#2B4D89]/10 text-[#2B4D89] border-[#2B4D89]/20' };
      case 'CLIENT_SELECTED':
      case 'COORDINATION':
        return { ar: '🤝 تم الاختيار وقيد التنسيق', en: 'Bid Accepted - Coordinating', bg: 'bg-indigo-50 text-indigo-800 border-indigo-150' };
      case 'UNDER_PRICING':
      case 'BIDDING_OPEN':
        return { ar: '⏳ مطروح للمناقصة والمزايدة', en: 'Bidding Open - Under Pricing', bg: 'bg-[#2B4D89]/10 text-[#2B4D89] border-[#2B4D89]/25' };
      case 'PENDING_REVIEW':
      case 'SUBMITTED':
      case 'UNDER_TECHNICAL_REVIEW':
        return { ar: '🔎 قيد الفحص الإداري والفني', en: 'Under Revision & Verification', bg: 'bg-blue-50 text-blue-800 border-blue-150' };
      default:
        return { ar: status, en: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const statusInfo = getStatusBadge(request.status);

  // Determine appropriate dashboard role for redirection
  const getTargetDashboardRoles = () => {
    if (request.status === 'PENDING_REVIEW' || request.status === 'SUBMITTED' || request.status === 'UNDER_TECHNICAL_REVIEW') {
      return { role: 'ADMIN' as const, labelAr: 'لوحة الإدارة للاعتماد والتعيين', labelEn: 'Admin Workspace to verify' };
    }
    if (request.clientId === 'CLIENT-1' || request.clientId === 'ID#4092' || request.clientId.startsWith('ID#') || request.clientName.includes('الرشيدي')) {
      return { role: 'CLIENT' as const, labelAr: 'لوحة العميل لمتابعة الدفعات', labelEn: 'Client Portal to approve' };
    }
    if (request.assignedInspectorId === 'INSP-1') {
      return { role: 'INSPECTOR' as const, labelAr: 'لوحة فحص المشرف الميداني', labelEn: 'Inspector On-site hub' };
    }
    return { role: 'COMPANY' as const, labelAr: 'لوحة شركة المقاولات المنفذة', labelEn: 'Contractor dashboard' };
  };

  const targetRedirect = getTargetDashboardRoles();

  // Custom high-fidelity materials description builder matching the finishingLevel
  const getFinishingMaterialsDetail = (level: string) => {
    const normLevel = level.trim();
    if (normLevel === 'اقتصادي') {
      return {
        title: isEn ? 'Economic Quality Materials Package' : 'باقة الخامات الاقتصادية والعملية الهندسية',
        electricity: isEn ? 'Certified local copper cables, standard robust conduits, durable switch outlets' : 'أسلاك نحاس معتمدة محلية، خراطيم طرية عملية، مفاتيح توزيع وحماية قياسية ماركة أساسية.',
        plumbing: isEn ? 'Certified local water pipes & drains with basic testing certificates (e.g., Al-Sherif)' : 'مواسير تغذية مياه وصرف معتمدة محلياً بضمان من جهة الصناعة للتشغيل الآمن (مثل: الشريف).',
        finishing: isEn ? 'Flattened cement mortar finishing without suspended gypsum ceilings' : 'محارة أسمنتية مستوية بالكامل بدون أسقف معلقة، معالجة فواصل الجدران بدقة.',
        paint: isEn ? 'Multi-layered coating putty with protective base coats (Sipes or matching brands)' : 'معجون وجهين مع دهانات بطانات تجميلية بمنتجات عملية آمنة (سايبس أو ما يعادلها).',
        flooring: isEn ? 'Standard ceramic flooring & walls for bathroom/kitchen surfaces' : 'أرضيات وحوائط سيراميك فرز أول أو ثاني للغرف والمطبخ والحمام.',
        insulation: isEn ? 'Basic chemical waterproofing for bathrooms and moisture critical surfaces' : 'عزل كيميائي أساسي للمطابخ والحمامات حماية كافية ضد تسريبات المياه والصوت.'
      };
    } else if (normLevel === 'لوكس' || normLevel === 'Lux' || normLevel === 'Standard') {
      return {
        title: isEn ? 'Premium Lux Certified Materials Package' : 'باقة الخامات لوكس القياسية المعتمدة والمطابقة لمقاييس شطبها',
        electricity: isEn ? 'Original Elsewedy electric wires, smart switches, and electrical panel distribution' : 'أسلاك السويدي المعتمدة الأصلية بالكامل الكاشفة للرطوبة، مفاتيح كهرباء ماركة فينو أو ساس ولوحة تفرع.',
        plumbing: isEn ? 'High quality Banninger/Aquatherm feeding and drain pipes with manufacturer warranty' : 'مواسير مياه وصرف صحي معتمدة بضمان الوكيل الرسمي وضمان شطبها المباشر (أكواثيرم أو باننجر) أو الشريف.',
        finishing: isEn ? 'Smooth plaster walls with decorative soft gypsum cornice details' : 'مصيص ناصع للأسقف، كرانيش وممرات جبسية تقليدية ناعمة مع زوايا محارة مستوية.',
        paint: isEn ? 'Triple-layered high durability Jotun Fenomastic paint colors computer-mixed' : 'معجون دابل ٣ طبقات من المعجون الفاخر، ودهانات جوتن فينوماستيك ألوان كمبيوتر مرنة ومقاومة للأتربة.',
        flooring: isEn ? 'First-tier Cleopatra or Royal ceramic floorings and tiles' : 'سيراميك كليوباترا أو رويال فرز أول للأرضيات بالكامل وجدران المطابخ والحمامات.',
        insulation: isEn ? 'Double cementitious Italian waterproofing with direct pressure tests' : 'عزل أسمنتي إيطالي مزدوج مع فحص مستمر واختبار ضغط شبكات السباكة تحت إشراف المنصة.'
      };
    } else if (normLevel === 'سوبر لوكس' || normLevel === 'Super Lux' || normLevel === 'High Lux') {
      return {
        title: isEn ? 'Supreme Super Lux Superior Materials Package' : 'باقة الخامات سوبر لوكس الراقية المتميزة لمشاريع الهندسية',
        electricity: isEn ? 'Heavy-duty Elsewedy copper cables, Schneider or Legrand tactile switches, certified safe board' : 'كابلات السويدي الأصلية بالكامل النحاسية، مفاتيح تلمسية من شنايدر أو ليجراند، لوحة تفرعات معتمدة آمنة.',
        plumbing: isEn ? 'Al-Sherif or PPS certified pipes, double coat cementitious Italian Sika 107 waterproof' : 'تأسيس شبكات تغذية وصرف الشريف أو بي بي إس مسبقة الصلاحية والاختبار، عزل طلاء أسمنتي مزدوج ماركة سيكا.',
        finishing: isEn ? 'German-grade Knauf moisture-resistant suspended ceilings with integrated LED profiles' : 'أسقف معلقة جبسيوم بورد كناوف (Knauf) بمواصفات ألمانية مقاومة للرطوبة مع ممرات ليد وإضاءة مخفية.',
        paint: isEn ? 'Jotun Fenomastic Matte/Silk color coats with moisture and humidity resistant sealants' : 'طلاء جوتن فينوماستيك مطفي أو ربع لمعة عالي المقاومة للغسيل والماء، تأسيس طبقات حماية ضد الرطوبة.',
        flooring: isEn ? 'First class local Porcelain for salons, first grade Cleopatra/Gawhara for rooms and walls' : 'أرضيات بورسلين فاخر للصالون والاستقبال، وسيراميك فرز أول كليوباترا أو الجوهرة للغرف والحمامات.',
        insulation: isEn ? 'High fidelity multi-layer waterproofing with technical inspection compliance checks' : 'عزل مائي وحراري متكامل للمطابخ والحمامات والشرفات باستخدام رقاقات عزل مخصصة وسيكا ١٠٧.'
      };
    } else {
      // بريميوم / Premium
      return {
        title: isEn ? 'Royal Premium Ultra Luxury Materials Package' : 'باقة الخامات البريميوم الملكية الفاخرة للقصور والفلل وملاك التميز',
        electricity: isEn ? 'Elsewedy thick power lines, Italian Schneider/Legrand Artuor designer switches, smart audio & smart-home prep' : 'كابلات السويدي المعتمدة الكثيفة بأحمال مستقلة، مفاتيح إيطالية شنايدر إلكتريك أو ليجراند أرتيور، تأسيس أنظمة صوتية وولوج ذكي.',
        plumbing: isEn ? 'German Rehau pipes, Grohe built-in concealed valves, rain-shower layouts and premium connections' : 'مواسير التغذية الذكية بالكامل (Rehau الألمانية) مع تأسيس خلاطات دفن جروهي (Grohe) الألمانية ورين شاور مدمج.',
        finishing: isEn ? 'Perfect alignments with steel angles, Knauf green water-resistant gypsum board, elegant magnet lighting tracks' : 'تربيع وتأكيس وبؤج وأوتار لكامل مساحات الشقة، أسقف معلقة كناوف أخضر مقاوم للرطوبة وممرات إضاءة مغناطيسية حديثة (Magnetic Tracks).',
        paint: isEn ? 'Odorless Jotun Premium coats, custom luxury stucco, marble textures, or high-end wooden cladding surfaces' : 'دهانات جوتن بريميوم الفاخرة خالية من الروائح أو دهانات ديكورية خاصة (أفكت، ماربل ستوكو، قطيفة، تجاليد خشبية فاخرة).',
        flooring: isEn ? 'Imported natural Carrara/Travertino marble for reception, custom anti-scratch Atlantic wood floors for bedrooms' : 'رخام طبيعي مستورد (كرارة إيطالي أو ترافيرتينو) للاستقبال، باركيه خشب طبيعي معالج للغرف وبورسلين مستورد قياسات ضخمة.',
        insulation: isEn ? 'Hydraulic double elastic membrane waterproofing (Sika Top Lastic) with protective light foam screed' : 'عزل مائي هيدروليكي مزدوج إيطالي (Sika Top Lastic) مع عزل حراري إضافي وطبقة صبة فوم حماية للأسطح.'
      };
    }
  };

  const materialsInfo = getFinishingMaterialsDetail(request.finishingLevel);

  return (
    <div className="global-project-modal-container fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-5 overflow-y-auto animate-fade-in font-sans">
      <div 
        className="bg-white border border-[#2B4D89]/20 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden relative text-slate-800"
        dir={isEn ? 'ltr' : 'rtl'}
      >
        {/* Header Block in signature brand blue color (#2B4D89) */}
        <div className="p-4 sm:p-5 border-b border-[#2B4D89]/20 bg-[#2B4D89] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#D8B448] text-[#1E3A68] flex items-center gap-1 shadow-sm">
                📌 {isEn ? 'REQUEST ID' : 'رقم الطلب'}: {request.id}
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-white/10 text-white border-white/20`}>
                {isEn ? statusInfo.en : statusInfo.ar}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                📋 {request.finishingLevel}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5 pt-1">
              <Layers className="w-5 h-5 text-[#D8B448]" />
              {isEn ? 'Technical & Materials Specifications of the Request' : 'مواصفات وتفاصيل طلب التشطيب الفنية والمالية المعتمدة'}
            </h2>
            <p className="text-[11px] text-blue-105">
              {isEn ? 'Detailed engineering specifications, materials list, and active financial tracking console.' : 'سجل استعلام حوكمة مواصفات الطلب، جودة وتوصيف الخامات، والتدقيق المالي لتوقيع العقد وإطلاق المرحلة.'}
            </p>
          </div>
          
          <button 
            onClick={onClose} 
            className="absolute sm:relative top-3 sm:top-0 left-3 sm:left-0 bg-white/10 hover:bg-white/20 hover:scale-105 text-white p-2 rounded-full cursor-pointer transition-all border border-white/5 shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Headers in Brand Blue styling */}
        <div className="flex border-b border-gray-150 bg-slate-50 overflow-x-auto text-[11px] sm:text-xs font-bold shrink-0 no-scrollbar">
          <button 
            onClick={() => setActiveTab('INFO')}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 border-b-2 cursor-pointer transition-all shrink-0 ${activeTab === 'INFO' ? 'border-[#2B4D89] text-[#2B4D89] bg-white font-black' : 'border-transparent text-gray-500 hover:text-slate-900'}`}
          >
            <Info className="w-4 h-4 shrink-0" />
            {isEn ? 'Specifications & Materials' : 'مواصفات الطلب وتوصيف الخامات'}
          </button>

          <button 
            onClick={() => setActiveTab('OFFERS')}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 border-b-2 cursor-pointer transition-all shrink-0 ${activeTab === 'OFFERS' ? 'border-[#2B4D89] text-[#2B4D89] bg-white font-black' : 'border-transparent text-gray-500 hover:text-slate-900'} relative`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            {isEn ? 'Competitive Pricing Bids' : 'أسعار عروض الشركات المتنافسة'}
            {relatedOffers.length > 0 && (
              <span className="bg-[#2B4D89] text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold">
                {relatedOffers.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('CONTRACT')}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 border-b-2 cursor-pointer transition-all shrink-0 ${activeTab === 'CONTRACT' ? 'border-[#2B4D89] text-[#2B4D89] bg-white font-black' : 'border-transparent text-gray-500 hover:text-slate-900'}`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            {isEn ? 'Platform Escrow Status' : 'حساب الضمان المالي والتعاقد'}
          </button>

          <button 
            onClick={() => setActiveTab('STAGES')}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 border-b-2 cursor-pointer transition-all shrink-0 ${activeTab === 'STAGES' ? 'border-[#2B4D89] text-[#2B4D89] bg-white font-black' : 'border-transparent text-gray-500 hover:text-slate-900'} relative`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            {isEn ? 'Quality Auditing Steps' : 'خطوات ومحاضر الاستلام الميداني'}
            {relatedStages.filter(s => s.status === 'INSPECTION_REQUESTED').length > 0 && (
              <span className="absolute top-1 right-1 bg-amber-500 ring-2 ring-white w-2 h-2 rounded-full" />
            )}
          </button>

          <button 
            onClick={() => setActiveTab('WARRANTY')}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 border-b-2 cursor-pointer transition-all shrink-0 ${activeTab === 'WARRANTY' ? 'border-[#2B4D89] text-[#2B4D89] bg-white font-black' : 'border-transparent text-gray-500 hover:text-slate-900'}`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {isEn ? 'Warranty Certificates' : 'شهادة الضمان الذهبي وبلاغات الصيانة'}
            {relatedComplaints.length > 0 && (
              <span className="bg-red-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">
                {relatedComplaints.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Content Workspace */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#2B4D89]/5 text-xs sm:text-sm">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: Specs and Detailed Materials Configurator (COMPLETELY REDESIGNED, CLEANER & NO PERSONAL DATA OR WINNING BUILDER DETAILS) */}
            {activeTab === 'INFO' && (
              <motion.div 
                key="tab-info"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-5"
              >
                {/* Visual grid representing the original fields exactly as submitted by the customer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Panel A: Property Structural Specs */}
                  <div className="bg-white border border-[#2B4D89]/10 p-4 rounded-2xl shadow-3xs space-y-3.5">
                    <h3 className="font-extrabold text-[#2B4D89] border-b border-[#2B4D89]/10 pb-1.5 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#2B4D89] shrink-0" />
                      {isEn ? 'Structural & Layout Specifications' : 'البيانات الهندسية ومقاييس المساحة الموثقة للوحدة'}
                    </h3>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-slate-700">
                      <div>
                        <span className="text-gray-400 text-[10px] block">{isEn ? 'Unit Style' : 'نوع الوحدة العقارية'}</span>
                        <span className="font-extrabold text-slate-900">{request.unitType}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">{isEn ? 'Total Area' : 'المساحة الإجمالية المقررة'}</span>
                        <span className="font-black text-[#2B4D89] font-mono">{request.area} م²</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">{isEn ? 'Finishing Level Selected' : 'فئة ومستوى التشطيب'}</span>
                        <span className="font-black text-[#2B4D89] text-[11px] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                          {request.finishingLevel}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">{isEn ? 'Bedrooms' : 'عدد غرف النوم'}</span>
                        <span className="font-bold text-slate-800">{request.bedroomsCount || '3'} غرف</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">{isEn ? 'Bathrooms' : 'دورات المياه والمرافق'}</span>
                        <span className="font-bold text-slate-800">{request.bathroomsCount || '2'} حمام</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">{isEn ? 'Kitchens' : 'المطابخ المسجلة'}</span>
                        <span className="font-bold text-slate-800">{request.kitchensCount || '1'} مطبخ</span>
                      </div>
                    </div>
                  </div>

                  {/* Panel B: Geological & Coordinates Info */}
                  <div className="bg-white border border-[#2B4D89]/10 p-4 rounded-2xl shadow-3xs space-y-3.5">
                    <h3 className="font-extrabold text-[#2B4D89] border-b border-[#2B4D89]/10 pb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#2B4D89] shrink-0" />
                      {isEn ? 'Location & Address Parameters' : 'الموقع الجغرافي والولوج الميداني للموقع'}
                    </h3>
                    <div className="space-y-2 text-slate-700">
                      <div>
                        <span className="text-gray-400 text-[10px] block">{isEn ? 'Governorate / City' : 'المحافظة والمدينة المسجلة بالطلب'}</span>
                        <span className="font-extrabold text-slate-900">{request.city} — {request.governorate}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">{isEn ? 'Detailed Address' : 'العنوان التفصيلي الدقيق'}</span>
                        {(!isContractor || isContractSigned) ? (
                          <span className="font-semibold text-xs text-slate-755 block leading-snug line-clamp-2">
                            {request.detailedLocationText || (isEn ? 'Not specified' : 'القاهرة الجديدة، المجاورة الرابعة عشر')}
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-extrabold bg-amber-50 border border-amber-200/40 px-2 py-1 rounded-xl inline-block mt-0.5">
                            🔒 {isEn ? 'Hidden until contract signed' : 'مخفي: يظهر العنوان بالتفصيل فور توقيع العقد وثلاثي الأطراف'}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">{isEn ? 'Coordinates GPS Link' : 'إحداثيات تتبع الموقع عبر الخرائط'}</span>
                        {(!isContractor || isContractSigned) ? (
                          <a 
                            href={`https://maps.google.com/?q=${request.mapCoordinates || '30.01284,31.44021'}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="font-mono text-[10.5px] text-[#2B4D89] hover:underline font-bold flex items-center gap-0.5"
                          >
                            📍 {request.mapCoordinates || '30.01284, 31.44021'}
                          </a>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-extrabold bg-amber-50 border border-amber-200/40 px-2 py-1 rounded-xl inline-block mt-0.5">
                            🔒 {isEn ? 'Coordinate features locked' : 'مغلق: يتطلب تفعيل العقد والبدء الفعلي للمطابقة الميدانية'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📄 CLIENT ACCEPTED BID OFFER DETAIL CONNECTOR */}
                {acceptedOffer ? (
                  <div className="bg-white border-2 border-[#D8B448]/60 p-5 rounded-2xl shadow-sm space-y-4 relative overflow-hidden">
                    {/* Golden subtle watermark badge for premium feel */}
                    <div className="absolute top-0 right-0 w-28 h-28 bg-[#D8B448]/5 rounded-bl-full pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">🏆</span>
                          <h3 className="font-extrabold text-sm text-[#2B4D89]">
                            {isEn ? 'Accepted Price Offer Details' : 'تفاصيل عرض السعر ومقايسة الترسية التي قبلها العميل'}
                          </h3>
                        </div>
                        <p className="text-[10.5px] text-gray-400 mt-0.5">
                          {isEn 
                            ? 'This is the winning bid offer selected by the client for this contract.' 
                            : 'هذا هو العرض المالي والفني المفتوح المعتمد من العميل للتوجيه وحساب الضمان.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAcceptedOfferExpanded(!isAcceptedOfferExpanded)}
                        className="bg-[#2B4D89] hover:bg-[#1E3A68] text-white font-black text-[11px] px-3.5 py-1.5 rounded-xl transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1.5 self-start sm:self-center shrink-0 shadow-xs"
                      >
                        <span>📄</span>
                        {isAcceptedOfferExpanded 
                          ? (isEn ? 'Collapse Offer Details 🔼' : 'طي تفاصيل المقايسة 🔼') 
                          : (isEn ? 'Show Offer Details 🔽' : 'استعراض تفاصيل العرض المقبول 🔽')}
                      </button>
                    </div>

                    {/* Summary row for primary details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-right bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                      <div>
                        <span className="text-[9.5px] text-gray-400 block mb-0.5">🏢 {isEn ? 'Contractor Partner' : 'الشركة والمقاول المنفذ:'}</span>
                        <span className="font-extrabold text-[#2B4D89] text-[12.5px] block">{acceptedCompany?.companyName || 'شريك معتمد'}</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-gray-400 block mb-0.5">💰 {isEn ? 'Final Bidding Price' : 'إجمالي سعر المقايسة المقبول:'}</span>
                        <span className="font-black text-emerald-700 text-sm block font-mono">{acceptedOffer.price.toLocaleString()} ج.م</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-gray-400 block mb-0.5">⚡ {isEn ? 'Timeframe SLA' : 'فترة التنفيذ والتسليم:'}</span>
                        <span className="font-extrabold text-slate-800 text-xs block"> خلال {acceptedOffer.durationDays} يوم عمل</span>
                      </div>
                    </div>

                    {/* Collapsible Details Content */}
                    <AnimatePresence>
                      {isAcceptedOfferExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pt-2 overflow-hidden"
                        >
                          <div className="border border-slate-155 bg-[#FAFBFB] p-4 rounded-xl space-y-3.5 text-xs text-slate-700 leading-relaxed font-sans">
                            <div>
                              <span className="font-black text-[#2B4D89] block mb-1.5">📝 التفاصيل وبنود العمل المذكورة بالمقايسة:</span>
                              <div className="bg-white border border-slate-200/80 p-3.5 rounded-lg whitespace-pre-wrap text-[11px] font-semibold text-slate-650 leading-relaxed">
                                {acceptedOffer.description}
                              </div>
                            </div>
                            
                            {acceptedOffer.materialsDetail && (
                              <div>
                                <span className="font-black text-[#2B4D89] block mb-1">🔍 جودة وتوصيف المواد المستخدمة:</span>
                                <p className="bg-white border border-slate-200/80 p-2 text-[10.5px] rounded-lg text-slate-600 font-semibold">{acceptedOffer.materialsDetail}</p>
                              </div>
                            )}

                            {acceptedOffer.warrantyDetail && (
                              <div>
                                <span className="font-black text-[#2B4D89] block mb-1">🛡️ شروط الالتزام وفترة الضمان:</span>
                                <p className="bg-white border border-slate-200/80 p-2 text-[10.5px] rounded-lg text-slate-600 font-semibold">{acceptedOffer.warrantyDetail}</p>
                              </div>
                            )}

                            {/* 📊 Detailed Itemized Prices and Quantities for Contract Award Administration & Client Assurance */}
                            <div className="space-y-2 pt-1 text-right" dir="rtl">
                              <span className="font-black text-[#2B4D89] block mb-1">📊 جدول تفاصيل الكميات والبنود التقديرية والمقايسة:</span>
                              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white overflow-x-auto shadow-3xs">
                                <table className="w-full text-right border-collapse text-[10.5px]">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-700 font-black">
                                      <th className="p-2.5">اسم البند الفني</th>
                                      <th className="p-2.5 text-center">الكمية المقدرة</th>
                                      <th className="p-2.5 text-center">الوحدة</th>
                                      <th className="p-2.5 text-center">متوسط فئة السعر</th>
                                      <th className="p-2.5">مواصفات الخامات المعتمدة للمقايسة</th>
                                      <th className="p-2.5 text-left font-mono">الإجمالي (ج.م)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                    {(() => {
                                      const areaVal = request.area || 120;
                                      const totalPrice = acceptedOffer.price;
                                      const level = request.finishingLevel || "لوكس";

                                      const getItemsBreakdown = () => {
                                        if (level === "اقتصادي") {
                                          return [
                                            { name: "أعمال التأسيس والصرف والسباكة المائية", qty: 1, unit: "مقطوعية", rate: totalPrice * 0.18, specs: "مواسير تغذية مياه وصرف معتمدة محلياً (الشريف) مع عزل أسمنتي كيميائي خفيف.", total: totalPrice * 0.18 },
                                            { name: "تأسيس شبكة الكهرباء والإنارة والتوزيع", qty: Math.round(areaVal * 3), unit: "متر طولي", rate: Math.round((totalPrice * 0.18) / (areaVal * 3)), specs: "أسلاك نحاس معتمدة محلية، خراطيم طرية عملية، ومفاتيح توزيع وحماية قياسية.", total: totalPrice * 0.18 },
                                            { name: "أعمال المحارة والأسقف الجبسية", qty: Math.round(areaVal * 2.5), unit: "متر مسطح", rate: Math.round((totalPrice * 0.18) / (areaVal * 2.5)), specs: "إعداد بياض المحارة بمونة طوب سميكة بدون تجاديل مع معالجة الملوحة.", total: totalPrice * 0.18 },
                                            { name: "تثبيت الأرضيات، السيراميك والبلاط", qty: areaVal, unit: "متر مسطح", rate: Math.round((totalPrice * 0.23) / areaVal), specs: "تركيب سيراميك فرز ثاني آمن، غراء لصق قياسي محلي الصنع.", total: totalPrice * 0.23 },
                                            { name: "أعمال الدهانات النهائية والتشطيب", qty: Math.round(areaVal * 2.8), unit: "متر مسطح", rate: Math.round((totalPrice * 0.23) / (areaVal * 2.8)), specs: "تأسيس دهانات وجه معمع وجهين تشطيب (طلاء سايبس أو ما يعادله).", total: totalPrice * 0.23 }
                                          ];
                                        } else if (level === "لوكس" || level === "Standard" || level === "Lux") {
                                          return [
                                            { name: "أعمال تأسيس السباكة والتغذية الكيميائية المزدوجة", qty: 1, unit: "مقطوعية", rate: totalPrice * 0.22, specs: "مواسير أكواثيرم أو باننجر الألمانية بضمان شطبها المباشر وعزل أسمنتي سيكا ١٠٧.", total: totalPrice * 0.22 },
                                            { name: "تأسيس الكهرباء، الإنارة الموزعة وكابلات السيراميك", qty: Math.round(areaVal * 3.5), unit: "متر طولي", rate: Math.round((totalPrice * 0.20) / (areaVal * 3.5)), specs: "أسلاك كابلات السويدي الأصلية النحاسية بالكامل الكاشفة للرطوبة، لقاطيع فينو أو ساس.", total: totalPrice * 0.20 },
                                            { name: "تأسيس المحارة والأسقف المعلقة بالجبسم بورد", qty: Math.round(areaVal * 2.5), unit: "متر مسطح", rate: Math.round((totalPrice * 0.16) / (areaVal * 2.5)), specs: "زوايا فلوكس لحماية الأركان، كواشف محارة بالبؤج والتوتير الهندسي المتقاطع.", total: totalPrice * 0.16 },
                                            { name: "تركيب الأرضيات، سيراميك كليوباترا ليزر قاطيع", qty: areaVal, unit: "متر مسطح", rate: Math.round((totalPrice * 0.22) / areaVal), specs: "بلاطات ليزر كليوباترا أو رويال جودة فرز أول ممتاز وصناديق تركيب آمنة.", total: totalPrice * 0.22 },
                                            { name: "دهانات جوتن وتأسيس عينات فينوماستيك المرنة", qty: Math.round(areaVal * 2.8), unit: "متر مسطح", rate: Math.round((totalPrice * 0.20) / (areaVal * 2.8)), specs: "تأسيس دابل مع طبقات طلاء جوتن فينوماستيك المقاومة للماء والأتربة بألوان كمبيوتر.", total: totalPrice * 0.20 }
                                          ];
                                        } else if (level === "سوبر لوكس" || level === "Super Lux") {
                                          return [
                                            { name: "شبكات تغذية السباكة والصرف المائي والعزل المتكامل", qty: 1, unit: "مقطوعية", rate: totalPrice * 0.22, specs: "خراطيم ومواسير الشريف المسبقة الصلاحية والاختبار بالكامل، عزل أسمنتي مزدوج ماركة سيكا.", total: totalPrice * 0.22 },
                                            { name: "تأسيس لوحات شنايدر وكابلات السويدي بأحمال معزولة", qty: Math.round(areaVal * 4), unit: "متر طولي", rate: Math.round((totalPrice * 0.21) / (areaVal * 4)), specs: "كابلات السويدي النحاسية السميكة الأصلية، مفاتيح تلمسية من شنايدر آمنة مائة بالمائة.", total: totalPrice * 0.21 },
                                            { name: "محارة هندسية بالبوج والأوتار وأسقف معلقة مقاومة للرطوبة", qty: Math.round(areaVal * 2.6), unit: "متر مسطح", rate: Math.round((totalPrice * 0.15) / (areaVal * 2.6)), specs: "تأسيس زوايا كرانيش هندسية مدمجة بالجبس الأبيض المعتمد كنيف فرز مميز.", total: totalPrice * 0.15 },
                                            { name: "أرضيات بورسلين مستورد وتكسية حمامات ديكورية", qty: areaVal, unit: "متر مسطح", rate: Math.round((totalPrice * 0.22) / areaVal), specs: "تركيب بورسلين ليزر قطع ممتاز مع زوايا ومقاييس لصق مستورد عالي الضمان.", total: totalPrice * 0.22 },
                                            { name: "دهانات وصنفرة طبقات معجون جوتن فينوماستيك الحريري", qty: Math.round(areaVal * 2.8), unit: "متر مسطح", rate: Math.round((totalPrice * 0.20) / (areaVal * 2.8)), specs: "معجون دابل ذكي، سنفرة أوتوماتيكية باللمبة، وطلاء جوتن فينوماستيك مطفي أو ربع لمعة عالي الغسيل.", total: totalPrice * 0.20 }
                                          ];
                                        } else {
                                          return [
                                            { name: "تغذية وصرف Rehau الألمانية وخلاطات دفن جروهي وصرف مخفي", qty: 1, unit: "مقطوعية", rate: totalPrice * 0.22, specs: "خراطيم ومواسير Rehau الألمانية مع تأسيس خلاطات دفن Grohe وعزل هيدروليكي مزدوج Sika Top Lastic.", total: totalPrice * 0.22 },
                                            { name: "لوحة تحكم ذكية، كابلات السويدي الكثيفة ومفاتيح شنايدر تلمسية", qty: Math.round(areaVal * 4.5), unit: "متر طولي", rate: Math.round((totalPrice * 0.22) / (areaVal * 4.5)), specs: "تأسيس أحمال مستقلة ذكية للمكيفات، كابلات السويدي المعتمدة الكثيفة ومفاتيح إيطالية ليجراند أرتيور.", total: totalPrice * 0.22 },
                                            { name: "كرانيش وأسقف جبسية معلقة بتصاميم وتجاويف إنارة مخفية ليد", qty: Math.round(areaVal * 2.8), unit: "متر مسطح", rate: Math.round((totalPrice * 0.14) / (areaVal * 2.8)), specs: "ألواح جبسم بورد معزولة Knauf كنيف مع تأسيس تجاويف ومسارات إنارة مخفية جاهزة.", total: totalPrice * 0.14 },
                                            { name: "أرضيات بورسلين إسباني وهندي نخب أول ممتاز وتجاليد خشبية", qty: areaVal, unit: "متر مسطح", rate: Math.round((totalPrice * 0.22) / areaVal), specs: "تركيب بورسلين فاخر قطع ليزر نخب أول ممتاز عالي الجودة مع وزرات وتطعيم ديكوري.", total: totalPrice * 0.22 },
                                            { name: "دهانات جوتن بريميوم خالية من الروائح وتجاليد ديكورية خاصة", qty: Math.round(areaVal * 2.8), unit: "متر مسطح", rate: Math.round((totalPrice * 0.20) / (areaVal * 2.8)), specs: "دهانات جوتن بريميوم الفاخرة مع تأسيس طبقات حماية رطوبة إضافية ومؤثرات كود ديكور جاهزة.", total: totalPrice * 0.20 }
                                          ];
                                        }
                                      };

                                      const items = getItemsBreakdown();
                                      return (
                                        <>
                                          {items.map((it, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                              <td className="p-2 text-blue-900 font-extrabold">{it.name}</td>
                                              <td className="p-2 text-center font-mono font-bold text-slate-800">{it.qty.toLocaleString()}</td>
                                              <td className="p-2 text-center text-gray-500">{it.unit}</td>
                                              <td className="p-2 text-center font-mono text-gray-600">{it.rate.toLocaleString()} ج.م</td>
                                              <td className="p-2 text-slate-550 text-[10px] leading-relaxed max-w-xs">{it.specs}</td>
                                              <td className="p-2 text-left font-mono font-black text-emerald-700">{it.total.toLocaleString()} ج.م</td>
                                            </tr>
                                          ))}
                                          <tr className="bg-slate-100 font-black text-[#2B4D89] text-[11px] border-t border-[#2B4D89]/20">
                                            <td className="p-2.5" colSpan={3}>الإجمالي الشامل لترسية العقد المعتمده:</td>
                                            <td className="p-2.5 text-center font-mono text-gray-400 font-bold">م². {areaVal}</td>
                                            <td className="p-2.5">باقة: {level}</td>
                                            <td className="p-2.5 text-left font-mono text-emerald-850 font-black">{totalPrice.toLocaleString()} ج.م</td>
                                          </tr>
                                        </>
                                      );
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl shadow-3xs text-center text-slate-500">
                    <p className="text-[11.5px] font-semibold mb-1">
                      {isEn ? 'No Accepted Bidding Offer Linked Yet' : '⏳ لا يوجد عرض مقبول معتمد حالياً لهذا الطلب'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {isEn 
                        ? 'Details of the price offer accepted by the client will appear here once selected.' 
                        : 'فور قبول العميل لأحد عروض الأسعار التنافسية، سيظهر هنا زر مخصص لاستعراض بنود المقايسة وتفاصيل العرض المقبول لتسهيل ترابط البيانات.'}
                    </p>
                  </div>
                )}

                {/* Panel C: Client Promotional & Audit Fee Info (PROMOTIONAL DETAILS AND FIELD SUPERVISOR SPEC) */}
                <div className="bg-white border border-[#2B4D89]/10 p-4 rounded-2xl shadow-3xs space-y-4">
                  <h3 className="font-extrabold text-[#2B4D89] border-b border-[#2B4D89]/10 pb-1.5 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-[#2B4D89] shrink-0" />
                    {isEn ? 'Financial Parameters & Platform Audit Booking' : 'تفاصيل الرسوم الإدارية وقسائم الخصم وعقد شطبها'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-slate-700 text-xs">
                    <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-right">
                      <span className="text-gray-400 text-[10px] block mb-0.5">{isEn ? 'Client Estimated Budget' : 'الميزانية المرصودة للطلب'}</span>
                      <span className="font-black text-[#2B4D89] font-mono text-sm">{request.budget.toLocaleString()} ج.م</span>
                    </div>

                    <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-right">
                      <span className="text-gray-400 text-[10px] block mb-0.5">{isEn ? 'Promo Code Applied' : 'كود الخصم الترويجي المطبق'}</span>
                      <span className="font-extrabold text-[#2B4D89] uppercase font-mono tracking-wider">{request.usedPromoCode || (isEn ? 'None' : 'بدون كود')}</span>
                    </div>

                    <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-right">
                      <span className="text-gray-400 text-[10px] block mb-0.5">{isEn ? 'Discount Value' : 'خصم قسيمة الترويج'}</span>
                      <span className="font-black text-rose-600 font-mono">{request.promoDiscountAmount ? `${request.promoDiscountAmount.toLocaleString()} ج.م` : '0 ج.م'}</span>
                    </div>

                    <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-150 text-right">
                      <span className="text-gray-400 text-[10px] block mb-0.5">{isEn ? 'Gov Audit Fee Paid' : 'رسوم الإشراف والمعاينة الكلية'}</span>
                      <span className="font-black text-[#2B4D89] font-mono text-sm">{request.finalInspectionFee ? `${request.finalInspectionFee.toLocaleString()} ج.م` : 'مدرجة مع العقد'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 rounded-xl gap-2.5 text-xs text-slate-700 border border-slate-150">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1">
                      <span>🕵️</span>
                      {isEn ? 'Shattabha Independent Engineering Supervision Required?' : 'هل تطلب خدمة المشرف الفني المستقل لحوكمة وضمان الجودة (عمولة 1%) ؟'}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[10.5px] font-black ${request.requireInspector ? 'bg-indigo-100 text-[#2B4D89] border border-indigo-200' : 'bg-slate-200 text-gray-500'}`}>
                      {request.requireInspector ? (isEn ? 'YES — Fully Covered & Inspected' : 'نعم — العميل يطلب الحوكمة والإشراف المهني كلياً') : (isEn ? 'NO' : 'لا')}
                    </span>
                  </div>
                </div>

                {/* Panel D: Client requirements note and upload details */}
                <div className="bg-white border border-[#2B4D89]/10 p-4 rounded-2xl shadow-3xs space-y-3">
                  <h3 className="font-extrabold text-[#2B4D89] flex items-center gap-1.5 border-b border-[#2B4D89]/10 pb-1.5">
                    <FileText className="w-4 h-4 text-[#2B4D89] shrink-0" />
                    {isEn ? 'Client Notes & Layout Drawings' : 'تفضيلات العميل المدونة والمخططات الهندسية'}
                  </h3>
                  <div className="text-slate-700 space-y-3 leading-relaxed">
                    <div>
                      <span className="text-gray-400 text-[10px] block mb-1">{isEn ? 'Personal Desired Specs / Custom Notes' : 'ملاحظات العميل والتطلعات الإضافية المرفقة بالطلب:'}</span>
                      <p className="bg-slate-50 border border-gray-200 rounded-xl p-3 text-[11.5px] italic text-slate-850 font-semibold leading-relaxed">
                        "{request.notes || (isEn ? 'No technical notes declared.' : 'لا توجد ملاحظات تكميلية إضافية.')}"
                      </p>
                    </div>
                    
                    <div className="border border-gray-150 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🗺️</span>
                        <div>
                          <span className="text-[11px] block font-extrabold text-slate-800">{isEn ? 'Layout Architectural Drawing File' : 'رسم كروكي لمقاييس الوحدة والمخططات المعمارية'}</span>
                          <span className="text-[9.5px] text-gray-400 font-mono block">BLUEPRINT-140SQM.PDF</span>
                        </div>
                      </div>
                      <span className="text-[9.5px] bg-[#2B4D89]/10 border border-[#2B4D89]/20 text-[#2B4D89] px-2 py-0.5 rounded-sm font-bold">
                        {isEn ? 'STORED ON SECURE CLOUD' : 'مؤمن في سحابة شطبها'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}


            {/* TAB 2: Competitive Offers List (Pure numerical & bid technical comparisons, NO client metadata and NO builder identification info except numbers for pure meritocracy) */}
            {activeTab === 'OFFERS' && (
              <motion.div 
                key="tab-offers"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="bg-[#2B4D89] border border-[#2B4D89] p-4 rounded-2xl text-white text-[11px] sm:text-xs">
                  <h3 className="font-black text-[#D8B448] flex items-center gap-1.5 mb-1 text-sm">
                    <Compass className="w-4.5 h-4.5" />
                    {isEn ? 'Secure Sealed-Bidding Operations Hub' : 'نظام المناقصة المغلقة وحوكمة كشافات الأسعار الفنية'}
                  </h3>
                  <p className="leading-relaxed text-blue-105">
                    {isEn 
                      ? 'To maintain proper meritocracy, contractors placement is sealed. Actual identities and phones are resolved upon final security payment.'
                      : 'حفاظاً على نزاهة التنافس والبعد عن مكالمات الحث الإشهاري المزعجة، يتم إيداع عروض المغاريم مغلقة وبصفة مطموسة الهوية أمام العميل. تظهر أرقام العروض والمواصفات للتسعير فقط، ويتم كشف التفاصيل تباعاً عقب القبول القانوني للاتفاقية.'
                    }
                  </p>
                </div>

                {relatedOffers.length === 0 ? (
                  <div className="bg-white border border-[#2B4D89]/10 p-8 rounded-2xl text-center text-gray-500">
                    <p className="text-sm font-semibold mb-1">
                      {isEn ? 'No pricing bids received yet.' : 'لا توجد عروض أسعار جارية مرسلة حتى الآن.'}
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono">
                      {request.status === 'UNDER_PRICING' 
                        ? (isEn ? 'Tender is open, companies are calculating pricing parameters.' : 'الطلب معلن لشركات المقاولة المعتمدة وبانتظار تقديم كشف الحساب والجدولة.')
                        : (isEn ? 'Awaiting administrative approval to open bidding.' : 'بانتظار مصادقة الإدارة وتفعيل إرسال المناقصة للشركات.')
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {relatedOffers.map((offer, idx) => {
                      const isWinning = request.selectedOfferId === offer.id;
                      const bidName = isWinning 
                        ? (isEn ? '🏆 Winners Awarded Bidding Offer' : '🏆 العرض الفني المختار من العميل للترسية') 
                        : `${isEn ? '🏢 Partner Pitch' : '🏢 عرض سعر شريك معتمد'} #${idx + 1}`;
                      
                      return (
                        <div 
                          key={offer.id}
                          className={`bg-white border text-slate-800 rounded-2xl p-4 transition-all shadow-3xs space-y-4 ${
                            isWinning 
                              ? 'ring-2 ring-[#2B4D89] border-[#2B4D89]/30' 
                              : 'border-slate-205 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <h4 className="font-extrabold text-[12px] text-slate-900 flex items-center gap-1.5">
                                {bidName}
                                {isWinning && (
                                  <span className="bg-[#2B4D89]/10 text-[#2B4D89] text-[9px] px-2 py-0.5 rounded-full font-black">
                                    ✓ {isEn ? 'Approved' : 'تم اختيار البند'}
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                OFFER-REF-NUM: {offer.id.substring(0, 8).toUpperCase()} • {isEn ? 'Filed at' : 'تاريخ تقديم المقايسة'}: {offer.createdAt}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 self-start sm:self-center">
                              <div className="text-right">
                                <span className="text-[10px] text-gray-400 block">{isEn ? 'Proposed Budget' : 'عرض السعر الفني المقترح'}</span>
                                <span className="font-mono font-black text-[#2B4D89] text-sm tracking-tight sm:text-base">
                                  {offer.price.toLocaleString()} ج.م
                                </span>
                              </div>
                              <div className="h-8 w-px bg-slate-200" />
                              <div className="text-right">
                                <span className="text-[10px] text-gray-400 block">{isEn ? 'Handoff SLA Period' : 'فترة التسليم الملتزم بها'}</span>
                                <span className="font-bold text-slate-700 text-xs sm:text-sm">
                                  ⚡ {offer.durationDays} {isEn ? 'Days' : 'يوم كامل'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-400 text-[10px] block mb-1">{isEn ? 'Execution Details Provided:' : 'تفاصيل وبنود العمل المذكورة بالمقايسة:'}</span>
                              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[11.5px] text-slate-700 leading-relaxed font-sans space-y-1">
                                {offer.description.split('\n').map((line, lIdx) => (
                                  <p key={lIdx}>{line}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: Contract documents and Escrow Financial status */}
            {activeTab === 'CONTRACT' && (
              <motion.div 
                key="tab-contract"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-5"
              >
                {!relatedContract ? (
                  <div className="bg-white border border-[#2B4D89]/10 p-8 rounded-2xl text-center text-gray-500 space-y-2">
                    <p className="text-sm font-semibold mb-1">
                      {isEn ? 'Contract phase not initiated yet.' : 'لم يتم توقيع العقد النهائي فنيًا وماديا بقوائم الدفع بعد.'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {isEn 
                        ? 'Contracts are formulated within 24 hours of client bid acceptance.' 
                        : 'يتم تنسيق البنود وجدولة الدفعات فور إصدار العقد وإمضاء شروط الضمان الثلاثي المعياري.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Legal Meeting Schedule */}
                      <div className="bg-white border border-[#2B4D89]/10 rounded-2xl p-4 shadow-3xs space-y-3">
                        <h3 className="font-extrabold text-[#2B4D89] border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#2B4D89]" />
                          {isEn ? 'Legal Signatures Verification' : 'تحرير العقود وجلسات استلام الموقع'}
                        </h3>
                        <div className="space-y-2 text-slate-700">
                          <div className="flex justify-between border-b border-slate-50 pb-1 text-[11.5px]">
                            <span className="text-gray-400">{isEn ? 'Document Ref' : 'رقم وثيقة التنسيق والمقايسة:'}</span>
                            <span className="font-mono font-bold text-slate-900">{relatedContract.id}</span>
                          </div>
                          
                          <div className="flex justify-between border-b border-slate-50 pb-1 text-[11.5px]">
                            <span className="text-gray-400">{isEn ? 'First Site Inspection Date' : 'تاريخ زيارة الرفع الميدانية:'}</span>
                            <span className="font-bold text-slate-800">{relatedContract.inspectionDate}</span>
                          </div>

                          <div className="flex justify-between border-b border-slate-50 pb-1 text-[11.5px]">
                            <span className="text-gray-400">{isEn ? 'Scheduled Contract Signing' : 'توقيع وبدء الأعمال مبرمج:'}</span>
                            <span className="font-bold text-slate-800">{relatedContract.meetingDate}</span>
                          </div>

                          <div className="flex justify-between text-[11.5px]">
                            <span className="text-gray-400">{isEn ? 'Contract Legal status' : 'حالة العقد والاعتمادات:'}</span>
                            <span className={`font-black ${relatedContract.isSigned ? 'text-[#2B4D89]' : 'text-amber-700'}`}>
                              {relatedContract.isSigned 
                                ? (isEn ? '✓ Co-signed & Verified' : '🤝 مبرم إلكترونياً ومسجل باللوحة') 
                                : (isEn ? '📝 Under drafting validation' : '📝 قيد الصياغة وحساب الضوابط')
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Escrow Calculations Panel */}
                      <div className="bg-white border border-[#2B4D89]/10 rounded-2xl p-4 shadow-3xs space-y-3">
                        <h3 className="font-extrabold text-[#2B4D89] border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-[#2B4D89]" />
                          {isEn ? 'Escrow & platform commission accounting' : 'الحسابات البنكية وإيداعات الضمان'}
                        </h3>
                        <div className="space-y-2 text-slate-700">
                          <div className="flex justify-between border-b border-slate-50 pb-1 text-[11.5px]">
                            <span className="text-gray-400">{isEn ? 'Total Final Price' : 'إجمالي القيمة الإنشائية والترسية:'}</span>
                            <span className="font-mono font-black text-slate-900">
                              {(relatedContract.finalContractPrice || relatedContract.totalAmount).toLocaleString()} ج.م
                            </span>
                          </div>

                          <div className="flex justify-between border-b border-slate-50 pb-1 text-[11.5px]">
                            <span className="text-gray-400">{isEn ? 'Commission Rate (Shattabha 5%)' : 'رسوم منصة شطبها المقتطعة (5%):'}</span>
                            <span className="font-mono font-bold text-slate-700">
                              {relatedContract.commissionAmt.toLocaleString()} ج.م
                            </span>
                          </div>

                          <div className="flex justify-between border-b border-slate-50 pb-1 text-[11.5px]">
                            <span className="text-gray-400">{isEn ? 'Earnest/Performance Bond' : 'مقدم جدية الأعمال المسترد:'}</span>
                            <span className="font-mono font-bold text-[#2B4D89] bg-blue-50 px-2 py-0.5 rounded">
                              {(relatedContract.commissionAmt * 2).toLocaleString()} ج.م
                            </span>
                          </div>

                          <div className="flex justify-between text-[11.5px]">
                            <span className="text-gray-400">{isEn ? 'Delay Liquidated Damage per day' : 'غرامات وعقوبات التأخير المعتمدة:'}</span>
                            <span className="font-bold text-red-600 font-mono">
                              ⚡ {relatedContract.delayPenaltyPerDay || '500'} ج.م / يوم تأخير
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Escrow Rule Banner */}
                    <div className="bg-[#2B4D89]/5 border border-[#2B4D89]/25 p-4 rounded-xl flex gap-3 text-slate-700 text-[11.5px] items-start">
                      <ShieldCheck className="w-5 h-5 text-[#2B4D89] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-[#2B4D89] mb-1">
                          {isEn ? 'Platform Escrow Protection Guidelines' : 'تنظيم حماية التدفقات النقدية والأرصدة المستحقة بمرحلة شطبها'}
                        </h4>
                        <p className="leading-relaxed text-slate-600">
                          {isEn 
                            ? 'The project funds is escrowed under safe bank protection. Milestones are released progressively upon inspector digital quality report validation.'
                            : 'أموال المشروع والتجهيز تودع بصفة مؤمنة بنظام Escrow بالمنصة. يمنع من الصرف لأي جهة بشكل مسبق، بل يتم سداده لشركات المقاولة تباعاً فور رفع المهندس الاستشاري المشرف لتقارير المطابقة والصور الفنية والتأكد من مطابقة الخامات المستخدمة بالكامل.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: Active Construction Stages with Live Inspectors validations */}
            {activeTab === 'STAGES' && (() => {
              // Calculate cumulative progress data for each stage
              let totalDeclaredPercentage = 0;
              relatedStages.forEach(s => {
                if (s.paymentPercentage) totalDeclaredPercentage += s.paymentPercentage;
              });

              const stagesWithWeights = relatedStages.map(s => {
                let weight = 0;
                if (totalDeclaredPercentage > 0 && s.paymentPercentage) {
                  weight = (s.paymentPercentage / totalDeclaredPercentage) * 100;
                } else {
                  weight = 100 / (relatedStages.length || 1);
                }
                return { ...s, weight };
              });

              let runningProgressTotal = 0;
              const cumulativeData = stagesWithWeights.map((s, idx) => {
                const contribution = (s.progress / 100) * s.weight;
                runningProgressTotal += contribution;
                
                const name = isEn 
                  ? (s.name === 'تأسيس السباكة والصرف' ? 'Plumbing' : 
                     s.name === 'تأسيس الكهرباء والإنارة' ? 'Electricity' : 
                     s.name === 'أعمال المحارة والأسقف' ? 'Plastering' : 
                     s.name === 'الدهانات والتشطيب النهائي' ? 'Painting' : s.name) 
                  : s.name;

                return {
                  rawName: s.name,
                  name,
                  progress: s.progress,
                  status: s.status,
                  weight: Math.round(s.weight),
                  cumulativeProgress: Math.min(100, Math.round(runningProgressTotal))
                };
              });

              return (
                <motion.div 
                  key="tab-stages"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  {/* 📊 PROGRESS CHART: CUMULATIVE PROJECT STAGES PROGRESS CHART CARD */}
                  {relatedStages.length > 0 && (
                    <div className="bg-white border border-[#2B4D89]/10 p-5 rounded-2xl shadow-3xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="font-extrabold text-[#2B4D89] text-[13px] flex items-center gap-1.5">
                            <span className="text-lg">📊</span>
                            {isEn ? 'Cumulative Project Stages Progress Chart' : 'مخطط ومؤشر تقدم مراحل المشروع التراكمي (Progress Chart)'}
                          </h4>
                          <p className="text-[10px] text-gray-450">
                            {isEn 
                              ? 'Visualizes the sequential completion curve and cumulative performance of construction stages.'
                              : 'استعراض بصري للمسار التراكمي ونسب إنجاز مهام البناء المعتمدة ميدانياً للطلب.'}
                          </p>
                        </div>
                        
                        {(() => {
                          const overallProgress = cumulativeData.length > 0 ? cumulativeData[cumulativeData.length - 1].cumulativeProgress : 0;
                          return (
                            <div className="bg-[#2B4D89]/10 hover:bg-[#2B4D89]/15 text-[#2B4D89] rounded-xl px-3.5 py-1.5 font-black text-[11px] font-mono flex items-center gap-1 self-start sm:self-center transition-colors border border-[#2B4D89]/15">
                              <span>{isEn ? 'Total Handoff Progress:' : 'معدل الإنجاز التراكمي الإجمالي:'}</span>
                              <span className="text-[12.5px] font-black">{overallProgress}%</span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Responsive Recharts Area Chart */}
                      <div className="h-44 sm:h-48 font-sans text-[10px] select-none" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={cumulativeData}
                            margin={{ top: 10, right: 15, left: -25, bottom: 5 }}
                          >
                            <defs>
                              <linearGradient id="colorCumulativeProgress" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2B4D89" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#2B4D89" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis 
                              dataKey="name" 
                              stroke="#64748B" 
                              tickLine={false} 
                              axisLine={false}
                              tick={{ fontSize: 9, fontWeight: 700 }}
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
                                    <div className="bg-slate-900 border border-slate-800 text-white p-3.5 rounded-2xl shadow-xl space-y-1.5 text-right font-sans" style={{ direction: 'rtl' }}>
                                      <p className="font-extrabold text-[11px] text-[#D8B448]">{isEn ? 'Stage:' : 'المرحلة:'} {data.rawName}</p>
                                      
                                      <div className="text-[10px] flex items-center justify-between gap-4">
                                        <span className="text-gray-300">{isEn ? 'Stage Weight:' : 'الوزن المالي للمرحلة:'}</span>
                                        <span className="font-mono font-bold text-white">{data.weight}%</span>
                                      </div>

                                      <div className="text-[10px] flex items-center justify-between gap-4">
                                        <span className="text-gray-300">{isEn ? 'Item Completion:' : 'نسبة الإنجاز بهذا البند:'}</span>
                                        <span className="font-mono font-bold text-slate-200">{data.progress}%</span>
                                      </div>

                                      <div className="text-[10px] pt-1.5 border-t border-slate-800 font-extrabold text-white flex items-center justify-between gap-4">
                                        <span>{isEn ? 'Cumulative Progress:' : 'الإنجاز التراكمي الكلي:'}</span>
                                        <span className="font-mono text-emerald-400 font-black">{data.cumulativeProgress}%</span>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="cumulativeProgress" 
                              stroke="#2B4D89" 
                              strokeWidth={2.5}
                              fillOpacity={1} 
                              fill="url(#colorCumulativeProgress)" 
                              dot={{ r: 4, strokeWidth: 1 }}
                              activeDot={{ r: 6 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Interactive Visual Step indicators */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pb-1 text-right" style={{ direction: isEn ? 'ltr' : 'rtl' }}>
                        {cumulativeData.map((stg, sIdx) => {
                          const isCompleted = stg.progress === 100 || stg.status === 'CLOSED' || stg.status === 'PAID';
                          const isCurrent = stg.progress > 0 && stg.progress < 100;
                          return (
                            <div 
                              key={sIdx} 
                              className={`p-3 rounded-2xl border transition-all ${
                                isCompleted 
                                  ? 'bg-emerald-50/40 border-emerald-150 text-slate-804' 
                                  : isCurrent 
                                    ? 'bg-blue-50/40 border-blue-150 ring-1 ring-blue-100/50' 
                                    : 'bg-white border-slate-200 text-slate-804'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                                <span className="text-[10.5px] font-black text-slate-905 truncate block">
                                  {stg.name}
                                </span>
                                <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full ${
                                  isCompleted 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : isCurrent 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-slate-100/80 text-slate-500'
                                }`}>
                                  {isCompleted ? (isEn ? 'Passed' : 'منتهي') : isCurrent ? (isEn ? 'Active' : 'جاري') : (isEn ? 'Pending' : 'مخطط')}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-baseline text-[9.5px]">
                                <span className="text-[#2B4D89] font-bold">
                                  {isEn ? 'Cum.': 'تراكمي:'} <strong className="font-mono text-[11px] text-slate-900">{stg.cumulativeProgress}%</strong>
                                </span>
                                <span className="text-gray-450 font-semibold font-mono">
                                  W: {stg.weight}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-[#2B4D89]/10 p-4 rounded-2xl shadow-3xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <h3 className="font-extrabold text-[#2B4D89] flex items-center gap-1.5">
                          <HardHat className="w-4.5 h-4.5 text-[#2B4D89]" />
                          {isEn ? 'Independent Site Field Auditor' : 'المهندس الاستشاري المشرف والمعين للمطابقة'}
                        </h3>
                        <p className="text-[10px] text-gray-400">
                          {isEn ? 'Responsible for testing elements, verification and approving release funds.' : 'المكلف من قبل المنصة بالنزول للمطابقة ورفع صور الواقع لضمان مطابقة الخامات المستعملة.'}
                        </p>
                      </div>
                      {assignedInspector ? (
                        <div className="bg-blue-50 border border-[#2B4D89]/15 rounded-xl px-3.5 py-2 flex items-center gap-2.5 self-start sm:self-center text-[11.5px]">
                          <span className="text-xl">🕵️</span>
                          <div>
                            <span className="font-black text-[#2B4D89] block">م/ {assignedInspector.name}</span>
                            <span className="text-gray-550 text-[10px] font-mono block">ID: {assignedInspector.id} • {assignedInspector.phone}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] font-extrabold text-amber-800 bg-amber-50 border border-amber-150 px-3 py-1.5 rounded-xl self-start sm:self-center">
                          ⏳ {isEn ? 'Awaiting Inspector appointment' : 'بانتظار مصادقة وتعيين المشرف من الإدارة لتخطيط مراحل الفحص والمطابقة.'}
                        </span>
                      )}
                    </div>

                    {relatedStages.length === 0 ? (
                      <p className="text-center text-gray-450 p-8 text-xs font-bold">
                        {isEn ? 'No structured project stages registered yet.' : 'لا توجد بنود ومراحل فحص مسجلة حالياً لجداول هذا المشروع.'}
                      </p>
                    ) : (
                      <div className="space-y-3.5">
                        {relatedStages.map((stage, sIdx) => {
                          let statusColor = 'bg-slate-100 text-slate-650 border-slate-200';
                          let label = isEn ? 'Planned' : 'مخطط ومجدول بالجدول الزمني';

                          if (stage.status === 'CLOSED' || stage.status === 'PAID') {
                            statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-250';
                            label = isEn ? 'Paid & Handoff' : '✓ مستلم بالكامل ومصروف هندسياً ومادياً';
                          } else if (stage.status === 'AWAITING_PAYMENT' || stage.status === 'INSPECTION_APPROVED' || stage.status === 'APPROVED') {
                            statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-205';
                            label = isEn ? 'Quality Approved' : '✓ معتمد ومطابق فنيًا وبانتظار أمر الصرف';
                          } else if (stage.status === 'INSPECTION_FAILED' || stage.status === 'REJECTED') {
                            statusColor = 'bg-red-100 text-red-800 border-red-250';
                            label = isEn ? 'Rejected / Faulty' : '⚠️ عيوب ومخالفات بالأعمال - بند مرفوض فنيًا';
                          } else if (stage.status === 'INSPECTION_REQUESTED') {
                            statusColor = 'bg-amber-100 text-amber-800 border-amber-250';
                            label = isEn ? 'Audit Requested' : '🔍 المهندس المشرف معلق الفحص وتدقيق الجودة حاليا';
                          } else if (stage.status === 'IN_PROGRESS' || stage.status === 'UNDER_WAY') {
                            statusColor = 'bg-blue-105 text-blue-800 border-blue-200';
                            label = isEn ? 'Execution in progress' : '🚧 قيد العمل الإنشائي الفعلي تحت التشييد';
                          }

                          return (
                            <div 
                              key={stage.id} 
                              className="bg-[#2B4D89]/5 border border-[#2B4D89]/10 rounded-xl p-3.5 hover:bg-slate-50 transition-colors space-y-3"
                            >
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div className="space-y-0.5">
                                  <h4 className="font-extrabold text-[12px] text-slate-900">
                                    {sIdx + 1}. {stage.name}
                                  </h4>
                                  <span className="text-[9.5px] text-gray-450 font-mono block">
                                    STAGE-REF-ID: {stage.id} • {isEn ? 'Max period' : 'المدة المقدرة'}: {stage.totalDurationDays || 15} {isEn ? 'Days' : 'يوم'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 self-start sm:self-center">
                                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                                    {label}
                                  </span>
                                  <span className="text-[11px] font-bold font-mono text-[#2B4D89] bg-white border border-[#2B4D89]/15 px-2 py-0.5 rounded">
                                    {stage.progress}%
                                  </span>
                                </div>
                              </div>

                              {/* Progression Bar Layout */}
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-[#2B4D89] h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${stage.progress}%` }}
                                />
                              </div>

                              {/* Reports & faults logging from live inspect records if present */}
                              {(stage.reportText || stage.rejectedNotes || stage.complaintText) && (
                                <div className="bg-white border border-[#2B4D89]/15 rounded-xl p-3 text-[10.5px] leading-relaxed space-y-2">
                                  {stage.reportText && (
                                    <p className="text-slate-700">
                                      <strong className="text-emerald-700">📝 {isEn ? 'Engineer Handoff Comments' : 'تقارير وقرارات مهندس الموقع:'}</strong> "{stage.reportText}"
                                    </p>
                                  )}
                                  {stage.rejectedNotes && (
                                    <p className="text-red-750 font-semibold bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                                      <strong className="text-red-800">❌ {isEn ? 'Direct Fault Disapproval Notes' : 'مخالفات وملاحظات رصدت أثناء عمل المطابقة فنيًا:'}</strong> "{stage.rejectedNotes}"
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()}

            {/* TAB 5: Triple Warranty certificate and active Complaints resolution */}
            {activeTab === 'WARRANTY' && (
              <motion.div 
                key="tab-warranty"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                {!relatedWarranty ? (
                  <div className="bg-white border border-[#2B4D89]/10 p-8 rounded-2xl text-center text-slate-500 space-y-3.5">
                    <ShieldCheck className="w-12 h-12 text-[#2B4D89]/30 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-extrabold text-slate-800">
                        {isEn ? 'Triple Golden Warranty Certificate Inactive' : 'شهادة الضمان الذهبي فنيًا وبخدمة الصيانة غير مفعلة حتى الآن'}
                      </p>
                      <p className="text-[11px] text-gray-400 max-w-md mx-auto leading-relaxed">
                        {isEn 
                          ? 'Shattabhas premium 3-year warranty covers mechanical, electrical, paint and plumbing. It activates automatically right after full site handoff and final administrative certification.'
                          : 'الضمان المبرم من شطبها يمتد لـ ٣ سنوات كاملة لتأمين السلامة الهندسية وتخفيف مخاطر الملاك ضد عيوب الكهرباء والمحارة والسباكة والدهانات بموثوقية عالية. يتم إصداره رقميًا تلقائياً فور فحص وتسلّم البند الأخير.'
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in font-sans">
                    {/* Visual Gold Hashed Certificate Board */}
                    <div className="bg-[#1E3A68] border-2 border-[#D8B448] p-5 rounded-3xl text-white relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 p-16 bg-[#D8B448]/8 rounded-full blur-2xl" />
                      <div className="relative space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🛡️</span>
                            <div>
                              <h4 className="font-extrabold text-sm sm:text-base text-[#D8B448] uppercase tracking-wider">
                                {isEn ? 'Shattabha Gold Triple Warranty Cover' : 'صك شهادة وثيقة الضمان الذهبي الثلاثية'}
                              </h4>
                              <p className="text-[9px] text-[#E7C665] font-mono">TOKEN REFERENCE ID: {relatedWarranty.id}</p>
                            </div>
                          </div>
                          <span className="text-[#D8B448] font-mono text-[9px] font-black border border-[#D8B448]/30 px-2 py-0.5 rounded">
                            3-YEAR COVERAGE ACTIVE
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-350 items-start text-[11px]">
                          <div>
                            <span className="text-[10px] text-[#E7C665] block mb-0.5">{isEn ? 'Authorized Project' : 'رقم كود الموقع بالضمان'}</span>
                            <span className="font-black text-white">{request.id}</span>
                          </div>
                          
                          <div>
                            <span className="text-[10px] text-[#E7C665] block mb-0.5">{isEn ? 'Level Quality' : 'فئة مستوى جودة التشطيب بالرخصة'}</span>
                            <span className="font-extrabold text-white text-[11.5px]">{request.finishingLevel}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-[#E7C665] block mb-0.5">{isEn ? 'Cover Start Date' : 'تاريخ بداية التأمين والسريان'}</span>
                            <span className="font-bold text-white font-mono">{relatedWarranty.startDate}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-[#E7C665] block mb-0.5">{isEn ? 'Expiry Date' : 'نهاية الترخيص وتاريخ التغطية'}</span>
                            <span className="font-bold text-[#D8B448] font-mono">{relatedWarranty.endDate}</span>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-white/10 pt-3.5 flex items-center justify-between text-[10px] text-gray-400">
                          <p>
                            {isEn 
                              ? '🔒 Hashed on Platform Vault. Safe funds reserve allocated for maintenance defects.'
                              : '🔒 مؤمن بضمانة الأرصدة التراكمية وسند التحكيم والتعويض الفوري ضد العيوب الطارئة بمرحلة الضمان.'
                            }
                          </p>
                          <span className="font-mono bg-emerald-555/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-bold">
                            ✓ {isEn ? 'ACTIVE' : 'رخصة سارية مفعّلة'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Complaint Filing Logs under active warranty */}
                    <div className="bg-white border border-[#2B4D89]/10 rounded-2xl p-4 shadow-3xs space-y-3">
                      <h3 className="font-extrabold text-[#2B4D89] border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        {isEn ? 'Disputes & Emergency Maintenance claims' : 'سجل البلاغات والاتصالات الطارئة تحت رخصة الضمان'}
                      </h3>

                      {relatedComplaints.length === 0 ? (
                        <p className="text-gray-400 text-center py-4 text-[11px] font-semibold">
                          {isEn ? 'No quality disputes or warranty claims recorded.' : 'سجل نظيف! لم يتم تقديم بلاغات صيانة طارئة أو تلفيات هندسية حتى الآن.'}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {relatedComplaints.map(claim => (
                            <div key={claim.id} className="border border-slate-150 bg-slate-50/50 rounded-xl p-3 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-xs text-slate-800">🚨 {claim.title}</span>
                                <span className="text-[9px] font-black uppercase tracking-wider bg-rose-50 border border-rose-200 text-rose-800 px-2.5 py-0.5 rounded-full">
                                  {claim.status}
                                </span>
                              </div>
                              <p className="text-[11.5px] text-gray-655 italic">
                                "{claim.description}"
                              </p>
                              <div className="text-[9.5px] text-gray-400 font-mono text-left">
                                CLAIMID: {claim.id} • {isEn ? 'Area of issue' : 'مكان المشكلة الفعلي'}: {claim.locationOfProblem}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Modal Bottom Action bar Footer */}
        <div className="p-4 border-t border-gray-150 bg-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2B4D89] animate-pulse shrink-0" />
            <p className="text-[10px] text-gray-500 leading-snug">
              {isEn 
                ? 'Central database is fully synchronized. Action changes are registered on system audits logs.'
                : 'الأرشيف الفني للمقايسة والترسية مراقب من منصة "شطبها". أي تعديلات ومصادقات تجري حوكمتها في التقرير العام.'
              }
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* Go to Active Dashboard button */}
            <button
              onClick={() => {
                onGoToDashboard(targetRedirect.role, request.id);
                onClose();
              }}
              className="flex-1 sm:flex-initial bg-[#2B4D89] text-[#F8FAFC] hover:bg-[#1E3A68] px-4.5 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 text-xs shadow-xs"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>
                {isEn ? targetRedirect.labelEn : targetRedirect.labelAr}
              </span>
            </button>
            
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-initial bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 px-4.5 py-2 rounded-xl font-bold cursor-pointer transition-all text-xs text-center"
            >
              {isEn ? 'Dismiss' : 'إغلاق واستكمال التصفح'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
