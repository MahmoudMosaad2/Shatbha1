// src/components/ContentManagementView.tsx
import React, { useState, useEffect } from 'react';
import { 
  Globe, Search, Save, RotateCcw, ShieldCheck, ShieldAlert, 
  Users, History, AlignLeft, Info, HelpCircle, ArrowRight, Check,
  Edit2, Plus, AlertCircle, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Language, i18n } from '../lib/translations';
import { 
  HOME_FAQ, 
  HOME_PACKAGES, 
  HOME_TESTIMONIALS, 
  HOME_FEATURED_PROJECTS, 
  HOME_COMPARISON,
  FAQItem,
  FeaturedProject,
  Testimonial
} from './homeData';

interface ContentManagementViewProps {
  lang: Language;
  onRefreshTranslation: () => void; // Called to notify App/Views to re-render
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  langCode: 'ar' | 'en';
  key: string;
  oldVal: string;
  newVal: string;
}

interface Moderator {
  id: string;
  name: string;
  email: string;
  role: string;
  allowedPages: string[];
  status: 'ACTIVE' | 'SUSPENDED';
}

const DEFAULT_SLIDES = [
  {
    id: 'slide-1',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'تصميم ليفينج روم راقي بإضاءة دافئة مسلطة ✨',
    labelEn: 'Stage 1: Premium luxury interior living room with warm lights ✨'
  },
  {
    id: 'slide-2',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'فيلا مودرن ساحرة مع جدران زجاجية وتصميم معاصر 🏡',
    labelEn: 'Stage 2: Breathtaking modern villa dining and high glass design 🏡'
  },
  {
    id: 'slide-3',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'غرفة نوم رئيسية مع تكسيات خشبية مخصصة وجدران أنيقة 🪵',
    labelEn: 'Stage 3: High-end custom wood cladding master bedroom & paneling 🪵'
  },
  {
    id: 'slide-4',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'صالون سوبر لوكس فائق النقاء برخام فاخر وألوان متناسقة 🌟',
    labelEn: 'Stage 4: Sleek minimalistic polished white stone & steel-blue salon 🌟'
  },
  {
    id: 'slide-5',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'ريسبشن متكامل بأثاث أنيق وتشطيب فائق الدقة ✨',
    labelEn: 'Fully Completed Super Lux reception with custom furniture ✨'
  },
  {
    id: 'slide-6',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'مطبخ أمريكي عصري مجهز بالكامل من الرخام الأسود الفاخر 🖤',
    labelEn: 'Sleek luxury modern open kitchen with black marble counters 🖤'
  },
  {
    id: 'slide-7',
    url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'حمام ماستر مفتوح على دريسنج روم بتوزيع ذكي للإضاءة 🛁',
    labelEn: 'Master bathroom open concept layout with smart custom vanity 🛁'
  },
  {
    id: 'slide-8',
    url: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'صالون مودرن دافئ بألوان ترابية وملمس مريح للجدران 🤎',
    labelEn: 'Warm luxury cozy salon space with premium fabric coatings 🤎'
  },
  {
    id: 'slide-9',
    url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'ممر داخلي وتصميم جدران مودرن بإضاءات مخفية ذكية 💡',
    labelEn: 'Polished minimal modern foyer entrance with bespoke paneling 💡'
  },
  {
    id: 'slide-10',
    url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop&q=80',
    labelAr: 'جلسة صالون بوهيمية راقية تجمع بين كلاسيكية الخشب وحديث القماش 🪵',
    labelEn: 'Aesthetic lounge and luxury terrace design with high finishes 🪵'
  }
];

export const ContentManagementView: React.FC<ContentManagementViewProps> = ({ lang, onRefreshTranslation }) => {
  const isEn = lang === 'en';

  // We define translation page categories 
  const categories = [
    { id: 'visitor', nameAr: '🌐 الموقع العام للزوار', nameEn: '🌐 Visitor Home Page' },
    { id: 'client', nameAr: '👤 لوحة العميل وأصحاب الوحدات', nameEn: '👤 Client Dashboard' },
    { id: 'contractor', nameAr: '🏢 لوحة المقاول وشركات التشطيبات', nameEn: '🏢 Contractor Space' },
    { id: 'inspector', nameAr: '🔬 لوحة الفحص والمطابقة الفنية', nameEn: '🔬 Quality Inspection' },
    { id: 'admin', nameAr: '🛡️ لوحة الإدارة والرقابة المركزية', nameEn: '🛡️ Administrative Command' },
    { id: 'analytics', nameAr: '📊 التقارير وتحليلات تطوير الأعمال', nameEn: '📊 Growth Reports' },
    { id: 'common', nameAr: '⚙️ الأزرار العامة والنصوص المشتركة', nameEn: '⚙️ Common Buttons & Layout' },
  ];

  // We assign which translation key belongs to which category
  const keyMapping: { [key: string]: string } = {
    // Visitor Category
    heroTitle: 'visitor', heroSubtitle: 'visitor', requestFinishing: 'visitor', registerCompany: 'visitor',
    statisticsTitle: 'visitor', completedProjects: 'visitor', currentTenders: 'visitor', verifiedContractors: 'visitor',
    workingGovs: 'visitor', whyShatibha: 'visitor', whyDesc: 'visitor', step1Title: 'visitor', step1Desc: 'visitor',
    step2Title: 'visitor', step2Desc: 'visitor', step3Title: 'visitor', step3Desc: 'visitor', howShatibhaTitle: 'visitor',
    paymentProtectionTitle: 'visitor', paymentProtectionDesc: 'visitor', fieldQualityTitle: 'visitor', fieldQualityDesc: 'visitor',
    pricingTransparencyTitle: 'visitor', pricingTransparencyDesc: 'visitor', testimonialsTitle: 'visitor', clientTestimonial: 'visitor',
    contractorTestimonial: 'visitor',

    // Client Category
    personalDashboard: 'client', overviewSubtitle: 'client', myRequests: 'client', addNewRequest: 'client',
    unspecified: 'client', requestApproved: 'client', requestUnderReview: 'client', requestClosed: 'client',
    unitSpecs: 'client', budgetRange: 'client', location: 'client', finishingLevelLabel: 'client',
    clientNotes: 'client', contractStatus: 'client', contractDetailText: 'client', contractDateLabel: 'client',
    siteVisitDate: 'client', escrowDepositState: 'client', deposited: 'client', inspectorsEscort: 'client',
    notAssignedYet: 'client', constructionProgress: 'client', constructionDesc: 'client', bidsReceived: 'client',
    bidsDesc: 'client', bestPrice: 'client', fastestDelivery: 'client', highestRated: 'client',
    offerPrice: 'client', duration: 'client', acceptOffer: 'client', day: 'client',
    clientTermsText: 'client',

    // Contractor Category
    contractorTitle: 'contractor', contractorSubtitle: 'contractor', matchingRequests: 'contractor', matchingRequestsDesc: 'contractor',
    submitBidOffer: 'contractor', enterPriceLabel: 'contractor', enterDurationLabel: 'contractor', enterDescriptionLabel: 'contractor',
    samplePortfolioLabel: 'contractor', submitBidButton: 'contractor', activeContractsDashboard: 'contractor', stagesQualityControl: 'contractor',
    requestStageInspection: 'contractor', inspectorAssignedForJob: 'contractor', newPortfolioProject: 'contractor',
    contractorTermsText: 'contractor',

    // Inspector Category
    inspectorTitle: 'inspector', inspectorSubtitle: 'inspector', assignedProjects: 'inspector', projectsTrackDesc: 'inspector',
    clientContactInfo: 'inspector', activeProgressTracker: 'inspector', notStartedYet: 'inspector', underWayInspectorState: 'inspector',
    inspectionWaiting: 'inspector', underCorrectionState: 'inspector', stageApprovedOk: 'inspector', detailsAndReportAction: 'inspector',
    activeEscrowState: 'inspector', frozenState: 'inspector', releasedSuccess: 'inspector', cameraIntegration: 'inspector',
    simulateSnapshot: 'inspector', reportTechnicalVerdict: 'inspector', approveLaunchRefund: 'inspector', rejectFlagFaults: 'inspector',
    technicalFaultsLog: 'inspector', noFaultsLoggedYet: 'inspector',

    // Admin Category
    adminCentralPanel: 'admin', tendersManagement: 'admin', systemAtAGlance: 'admin', approvedInstitutions: 'admin',
    totalOffersSubmitted: 'admin', totalContractsVolume: 'admin', platformRevenue: 'admin', clientsRequestsHub: 'admin',
    clientsRequestsHubDesc: 'admin', approveAndExpose: 'admin', approvedPricingState: 'admin', escrowAndVisitsCoordination: 'admin',
    coordinationDesc: 'admin', coSignedState: 'admin', unSignedState: 'admin', assignInspectorBtn: 'admin',
    chooseInspectorSelect: 'admin', financialVolumeLabel: 'admin', inspectorAssignedLabel: 'admin', licensedCompaniesHub: 'admin',
    licensedCompaniesHubDesc: 'admin', verifiedPartner: 'admin', activateAndVerifyBtn: 'admin', activeInspectorReadiness: 'admin',
    inspectorSpeedText: 'admin', activeProjectsLabel: 'admin', assignedInspectorGoalText: 'admin', inspectorStateReady: 'admin',
    inspectorStateBusy: 'admin',

    // Reports / Analytics Category
    liveAnalyticsPanel: 'analytics', liveAnalyticsDesc: 'analytics', targetJuneCommission: 'analytics', commissionGoalRemaining: 'analytics',
    competitivenessIndex: 'analytics', averageOfferDelivery: 'analytics', clientSatisfactionRate: 'analytics', inspectorReadinessHeader: 'analytics',
    inspectorHintText: 'analytics', commissionTargetHeader: 'analytics', businessGrowthHub: 'analytics',

    // Common Category
    platformName: 'common', demoDashboard: 'common', demoNotice: 'common', frontendDemo: 'common',
    visitorSite: 'common', clientDashboard: 'common', contractorDashboard: 'common', fieldInspector: 'common',
    adminDashboard: 'common', reinit: 'common', toastHide: 'common',
  };

  // State managers
  const [selectedCategory, setSelectedCategory] = useState<string>('visitor');
  
  // Dynamic Pricing Panel state managers
  const [pricingData, setPricingData] = useState<{
    materials: any[];
    labor: any[];
    packages: any;
  } | null>(null);
  const [isPricingLoading, setIsPricingLoading] = useState<boolean>(false);
  const [isPricingSaving, setIsPricingSaving] = useState<boolean>(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState<string | null>(null);

  const [selectedMaterialToEdit, setSelectedMaterialToEdit] = useState<any | null>(null);
  const [selectedLaborToEdit, setSelectedLaborToEdit] = useState<any | null>(null);
  const [selectedPackageToEdit, setSelectedPackageToEdit] = useState<string | null>(null);

  const fetchPricingData = async () => {
    setIsPricingLoading(true);
    setPricingError(null);
    try {
      const res = await fetch('/api/prices');
      if (!res.ok) throw new Error('فشل جلب قائمة الأسعار من الخادم.');
      const data = await res.json();
      setPricingData(data);
      if (data && data.materials && data.materials.length > 0 && !selectedMaterialToEdit) {
        setSelectedMaterialToEdit(data.materials[0]);
      }
    } catch (err: any) {
      console.error(err);
      setPricingError(err.message || 'عزراً، لم نتمكن من جلب أسعار الخامات والعمالة من الخادم.');
    } finally {
      setIsPricingLoading(false);
    }
  };

  const handleSavePricingData = async (updatedData: typeof pricingData) => {
    if (!updatedData) return;
    setIsPricingSaving(true);
    setPricingError(null);
    setPricingSuccessMsg(null);
    try {
      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('فشل في حفظ وتعميم البيانات في الخادم.');
      const data = await res.json();
      setPricingSuccessMsg('تم تعميم وتحديث أسعار مواد البناء، بنود العمالة وباقات المتر المربع بنجاح وتلقينها لآدم!');
      setPricingData(updatedData);

      // Add audit logs
      const logId = `LOG-${Date.now()}`;
      setAuditLogs(prev => [
        {
          id: logId,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'الأدمن الرئيسي - م/ محمد شهاب',
          langCode: 'ar',
          key: 'PRICING_DATABASE_UPDATE',
          oldVal: 'أسعار وقيم قديمة',
          newVal: 'تحديث وتطهير بورصة أسعار خامات ومصنعيات منصة شطبها الميدانية'
        },
        ...prev
      ]);

      setTimeout(() => setPricingSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setPricingError(err.message || 'فشل في الاتصال بالخادم لحفظ البيانات.');
    } finally {
      setIsPricingSaving(false);
    }
  };

  useEffect(() => {
    if (selectedCategory === 'pricing_manager') {
      fetchPricingData();
    }
  }, [selectedCategory]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedAr, setEditedAr] = useState<string>('');
  const [editedEn, setEditedEn] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [activeEditorLang, setActiveEditorLang] = useState<'ar' | 'en'>('ar');
  
  // Backups & history tracking
  const [originalBackup, setOriginalBackup] = useState<{ [lang: string]: { [key: string]: string } }>({});
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'LOG-1',
      timestamp: '2026-06-04 11:24:10',
      user: 'الأدمن الرئيسي - م/ محمد شهاب',
      langCode: 'ar',
      key: 'heroTitle',
      oldVal: 'شطّب وحدتك بأمان ونظام المناقصات المغلقة',
      newVal: 'شطّب شقتك بأول منظومة مناقصات هندسية آمنة في مصر'
    }
  ]);

  // Secondary moderators simulation
  const [moderators, setModerators] = useState<Moderator[]>([
    {
      id: 'MOD-1',
      name: 'أمنية الجمال',
      email: 'omniaswat@shatibha.com',
      role: 'كاتبة محتوى تسويقي',
      allowedPages: ['visitor', 'common'],
      status: 'ACTIVE'
    },
    {
      id: 'MOD-2',
      name: 'م/ عادل مصطفى',
      email: 'adelm@shatibha.com',
      role: 'مشرف جودة المصطلحات الفنية',
      allowedPages: ['client', 'inspector', 'contractor'],
      status: 'ACTIVE'
    }
  ]);

  // Moderator creation inputs
  const [showAddMod, setShowAddMod] = useState(false);
  const [newModName, setNewModName] = useState('');
  const [newModEmail, setNewModEmail] = useState('');
  const [newModRole, setNewModRole] = useState('');
  const [newModPages, setNewModPages] = useState<string[]>(['visitor']);

  // Slideshow States
  const [slides, setSlides] = useState(() => {
    const saved = localStorage.getItem('shatibha_homepage_slides');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use fallback below
      }
    }
    return DEFAULT_SLIDES;
  });

  const [slideInterval, setSlideInterval] = useState(() => {
    const saved = localStorage.getItem('shatibha_slideshow_interval');
    if (saved) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val > 0) return val;
    }
    return 5; // default 5 seconds
  });

  // Slide form state
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newSlideLabelAr, setNewSlideLabelAr] = useState('');
  const [newSlideLabelEn, setNewSlideLabelEn] = useState('');

  // Editing state
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editingSlideUrl, setEditingSlideUrl] = useState('');
  const [editingSlideLabelAr, setEditingSlideLabelAr] = useState('');
  const [editingSlideLabelEn, setEditingSlideLabelEn] = useState('');

  const updateSlidesInStorage = (updatedSlides: any[]) => {
    setSlides(updatedSlides);
    localStorage.setItem('shatibha_homepage_slides', JSON.stringify(updatedSlides));
    onRefreshTranslation(); // Notify all listening views
  };

  // --- FAQs States ---
  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    const saved = localStorage.getItem('shatibha_homepage_faq');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return HOME_FAQ;
  });

  const [editingFaqIdx, setEditingFaqIdx] = useState<number | null>(null);
  const [newFaqQAr, setNewFaqQAr] = useState('');
  const [newFaqQEn, setNewFaqQEn] = useState('');
  const [newFaqAAr, setNewFaqAAr] = useState('');
  const [newFaqAEn, setNewFaqAEn] = useState('');

  // --- Packages States ---
  const [packages, setPackages] = useState<any[]>(() => {
    const saved = localStorage.getItem('shatibha_homepage_packages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return HOME_PACKAGES;
  });

  const [editingPkgIdx, setEditingPkgIdx] = useState<number | null>(null);
  const [pkgNameAr, setPkgNameAr] = useState('');
  const [pkgNameEn, setPkgNameEn] = useState('');
  const [pkgPriceAr, setPkgPriceAr] = useState('');
  const [pkgPriceEn, setPkgPriceEn] = useState('');
  const [pkgFeaturesAr, setPkgFeaturesAr] = useState<string>('');
  const [pkgFeaturesEn, setPkgFeaturesEn] = useState<string>('');

  // --- Testimonials States ---
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('shatibha_homepage_testimonials');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return HOME_TESTIMONIALS;
  });

  const [editingTestIdx, setEditingTestIdx] = useState<number | null>(null);
  const [testInitial, setTestInitial] = useState('');
  const [testNameAr, setTestNameAr] = useState('');
  const [testNameEn, setTestNameEn] = useState('');
  const [testLocAr, setTestLocAr] = useState('');
  const [testLocEn, setTestLocEn] = useState('');
  const [testTextAr, setTestTextAr] = useState('');
  const [testTextEn, setTestTextEn] = useState('');
  const [testRating, setTestRating] = useState<number>(5);

  // --- Featured Projects States ---
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>(() => {
    const saved = localStorage.getItem('shatibha_homepage_featured_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let updated = false;
        const migrated = parsed.map((p: any) => {
          if (p.id === 'proj-3') {
            const hasBroken = p.images.some((img: string) => img.includes('photo-1617806118233-18e1db207f62') || img.includes('photo-1600607687939-ce8a6c25118c'));
            if (hasBroken) {
              updated = true;
              return {
                ...p,
                images: [
                  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80'
                ]
              };
            }
          }
          return p;
        });
        if (updated) {
          localStorage.setItem('shatibha_homepage_featured_projects', JSON.stringify(migrated));
          return migrated;
        }
        return parsed;
      } catch (e) {}
    }
    return HOME_FEATURED_PROJECTS;
  });

  const [editingProjIdx, setEditingProjIdx] = useState<number | null>(null);
  const [projNameAr, setProjNameAr] = useState('');
  const [projNameEn, setProjNameEn] = useState('');
  const [projLocAr, setProjLocAr] = useState('');
  const [projLocEn, setProjLocEn] = useState('');
  const [projAreaAr, setProjAreaAr] = useState('');
  const [projAreaEn, setProjAreaEn] = useState('');
  const [projLevelAr, setProjLevelAr] = useState('');
  const [projLevelEn, setProjLevelEn] = useState('');
  const [projDescAr, setProjDescAr] = useState('');
  const [projDescEn, setProjDescEn] = useState('');
  const [projImages, setProjImages] = useState('');

  // --- Comparison States ---
  const [comparison, setComparison] = useState<any>(() => {
    const saved = localStorage.getItem('shatibha_homepage_comparison');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.ar?.rows && parsed?.en?.rows) return parsed;
      } catch (e) {}
    }
    return {
      ar: {
        title: "مقارنة صريحة: التشطيب التقليدي مقابل التشطيب الذكي مع شطبها",
        subtitle: "لماذا يحتاج مالك العقار إلى شطبها من الأساس لتجنب أزمات ومخاطر السوق؟",
        rows: [
          {
            item: "التسعير والتكلفة",
            trad: "زيادات مستمرة ومفاجئة وتفاجأ بمطالب تكميلية مراراً وتكراراً بعد بدء العمل.",
            shatibha: "مقايسة هندسية دقيقة وثابتة مع تحديد أسعار البنود والمصنعيات مسبقاً وبشفافية."
          },
          {
            item: "الدفع والضمان",
            trad: "دفع مبالغ ضخمة مقدماً دون حماية قانونية أو ربط حقيقي بمراحل التنفيذ والاستلام.",
            shatibha: "نظام مستخلصات مجدولة ومربوطة مباشرة بنسب الإنجاز الفعلي والموافقة الفنية."
          },
          {
            item: "الفحص والاستلام",
            trad: "الاستلام معتمداً على الكلمة الشفهية وعشوائية الصنايعية دون فحص متخصص دقيق.",
            shatibha: "فحص هندسي صارم من جهة الإشراف واستلام لكل مرحلة طبقاً لأعلى الأكواد الهندسية."
          },
          {
            item: "الاتصال والشفافية",
            trad: "مكالمات مهدرة، مواعيد غير منضبطة وصعوبة مستمرة في تتبع الموقف الإنشائي الفعلي.",
            shatibha: "متابعة وتقارير حية، تفاصيل لوجستية واضحة وجدول زمني دقيق لكافة المراحل."
          }
        ]
      },
      en: {
        title: "Traditional vs Smart Finishing comparison",
        subtitle: "Why property owners need Shattabha to avoid market crises and risks.",
        rows: [
          {
            item: "Pricing & Cost",
            trad: "Continuous surprise increases and demands for extra cash after signing.",
            shatibha: "Precise, stable engineering bill of quantities with flat-rate transparent pricing."
          },
          {
            item: "Payment & Guarantee",
            trad: "Large upfront deposits paid directly to contractors without strict contract bonds.",
            shatibha: "Escrow-like milestone payments tied only to physical verification and approval."
          },
          {
            item: "Quality Inspection",
            trad: "Unsupervised handovers relying purely on contractor promises with hidden flaws.",
            shatibha: "Rigorous technical inspection by dedicated supervisors conforming to luxury codes."
          },
          {
            item: "Communication",
            trad: "Wasted phone calls, delayed schedules, and lack of visual construction logs.",
            shatibha: "Real-time updates, clear progress reports, and highly punctual handovers."
          }
        ]
      }
    };
  });

  const [compTitleAr, setCompTitleAr] = useState('');
  const [compTitleEn, setCompTitleEn] = useState('');
  const [compSubtitleAr, setCompSubtitleAr] = useState('');
  const [compSubtitleEn, setCompSubtitleEn] = useState('');

  // --- FAQs Handlers ---
  const saveFaqsInStorage = (updated: FAQItem[]) => {
    setFaqs(updated);
    localStorage.setItem('shatibha_homepage_faq', JSON.stringify(updated));
    onRefreshTranslation();
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    const newFaq: FAQItem = {
      qAr: newFaqQAr,
      qEn: newFaqQEn,
      aAr: newFaqAAr,
      aEn: newFaqAEn
    };
    if (editingFaqIdx !== null) {
      const updated = [...faqs];
      updated[editingFaqIdx] = newFaq;
      saveFaqsInStorage(updated);
      setEditingFaqIdx(null);
    } else {
      saveFaqsInStorage([...faqs, newFaq]);
    }
    setNewFaqQAr(''); setNewFaqQEn('');
    setNewFaqAAr(''); setNewFaqAEn('');
  };

  // --- Packages Handlers ---
  const savePackagesInStorage = (updated: any[]) => {
    setPackages(updated);
    localStorage.setItem('shatibha_homepage_packages', JSON.stringify(updated));
    onRefreshTranslation();
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const splitFeatsAr = pkgFeaturesAr.split('\n').map(x => x.trim()).filter(Boolean);
    const splitFeatsEn = pkgFeaturesEn.split('\n').map(x => x.trim()).filter(Boolean);
    const newPkg = {
      id: editingPkgIdx !== null ? packages[editingPkgIdx].id : `pkg-${Date.now()}`,
      nameAr: pkgNameAr,
      nameEn: pkgNameEn,
      priceAr: pkgPriceAr,
      priceEn: pkgPriceEn,
      featuresAr: splitFeatsAr,
      featuresEn: splitFeatsEn
    };

    if (editingPkgIdx !== null) {
      const updated = [...packages];
      updated[editingPkgIdx] = newPkg;
      savePackagesInStorage(updated);
      setEditingPkgIdx(null);
    } else {
      savePackagesInStorage([...packages, newPkg]);
    }
    setPkgNameAr(''); setPkgNameEn('');
    setPkgPriceAr(''); setPkgPriceEn('');
    setPkgFeaturesAr(''); setPkgFeaturesEn('');
  };

  // --- Testimonials Handlers ---
  const saveTestimonialsInStorage = (updated: Testimonial[]) => {
    setTestimonials(updated);
    localStorage.setItem('shatibha_homepage_testimonials', JSON.stringify(updated));
    onRefreshTranslation();
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    const newTest: Testimonial = {
      initial: testInitial || testNameAr[0] || 'أ',
      nameAr: testNameAr,
      nameEn: testNameEn,
      locationAr: testLocAr,
      locationEn: testLocEn,
      textAr: testTextAr,
      textEn: testTextEn,
      rating: testRating
    };

    if (editingTestIdx !== null) {
      const updated = [...testimonials];
      updated[editingTestIdx] = newTest;
      saveTestimonialsInStorage(updated);
      setEditingTestIdx(null);
    } else {
      saveTestimonialsInStorage([...testimonials, newTest]);
    }
    setTestInitial(''); setTestNameAr(''); setTestNameEn('');
    setTestLocAr(''); setTestLocEn('');
    setTestTextAr(''); setTestTextEn(''); setTestRating(5);
  };

  // --- Featured Projects Handlers ---
  const saveProjectsInStorage = (updated: FeaturedProject[]) => {
    setFeaturedProjects(updated);
    localStorage.setItem('shatibha_homepage_featured_projects', JSON.stringify(updated));
    onRefreshTranslation();
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    const splitImgs = projImages.split(',').map(x => x.trim()).filter(Boolean);
    const newProj: FeaturedProject = {
      id: editingProjIdx !== null ? featuredProjects[editingProjIdx].id : `proj-${Date.now()}`,
      nameAr: projNameAr,
      nameEn: projNameEn,
      locationAr: projLocAr,
      locationEn: projLocEn,
      areaAr: projAreaAr,
      areaEn: projAreaEn,
      levelAr: projLevelAr,
      levelEn: projLevelEn,
      descAr: projDescAr,
      descEn: projDescEn,
      images: splitImgs.length > 0 ? splitImgs : ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80']
    };

    if (editingProjIdx !== null) {
      const updated = [...featuredProjects];
      updated[editingProjIdx] = newProj;
      saveProjectsInStorage(updated);
      setEditingProjIdx(null);
    } else {
      saveProjectsInStorage([...featuredProjects, newProj]);
    }
    setProjNameAr(''); setProjNameEn('');
    setProjLocAr(''); setProjLocEn('');
    setProjAreaAr(''); setProjAreaEn('');
    setProjLevelAr(''); setProjLevelEn('');
    setProjDescAr(''); setProjDescEn('');
    setProjImages('');
  };

  // --- Comparison Handlers ---
  const saveComparisonInStorage = (updated: any) => {
    setComparison(updated);
    localStorage.setItem('shatibha_homepage_comparison', JSON.stringify(updated));
    onRefreshTranslation();
  };

  // Load from local storage and initialize original backup
  useEffect(() => {
    // Deep clone the official translations object as the source of truth backup
    const backup: any = { ar: {}, en: {} };
    for (const k in i18n.ar) {
      backup.ar[k] = (i18n.ar as any)[k];
    }
    for (const k in i18n.en) {
      backup.en[k] = (i18n.en as any)[k];
    }
    setOriginalBackup(backup);

    // Load any offline content modifications saved previously
    const savedAr = localStorage.getItem('shatibha_modified_ar');
    const savedEn = localStorage.getItem('shatibha_modified_en');
    const savedLogs = localStorage.getItem('shatibha_audit_logs');
    const savedMods = localStorage.getItem('shatibha_moderators');

    if (savedAr) {
      const parsedAr = JSON.parse(savedAr);
      for (const k in parsedAr) {
        (i18n.ar as any)[k] = parsedAr[k];
      }
    }
    if (savedEn) {
      const parsedEn = JSON.parse(savedEn);
      for (const k in parsedEn) {
        (i18n.en as any)[k] = parsedEn[k];
      }
    }
    if (savedLogs) {
      setAuditLogs(JSON.parse(savedLogs));
    }
    if (savedMods) {
      setModerators(JSON.parse(savedMods));
    }
  }, []);

  const saveToLocalStorage = (updatedAr: any, updatedEn: any, newLogs: AuditLogEntry[]) => {
    localStorage.setItem('shatibha_modified_ar', JSON.stringify(updatedAr));
    localStorage.setItem('shatibha_modified_en', JSON.stringify(updatedEn));
    localStorage.setItem('shatibha_audit_logs', JSON.stringify(newLogs));
  };

  // Switch to edit key
  const handleStartEdit = (key: string) => {
    setEditingKey(key);
    const arVal = (i18n.ar as any)[key] || '';
    const enVal = (i18n.en as any)[key] || '';
    setEditedAr(arVal);
    setEditedEn(enVal);
    setPreviewContent(activeEditorLang === 'ar' ? arVal : enVal);
  };

  // Handle live WYSIWYG insert decoration
  const insertWYSIWYGDecoration = (tag: string) => {
    const activeText = activeEditorLang === 'ar' ? editedAr : editedEn;
    let decoratedText = '';

    if (tag === 'bold') {
      decoratedText = `${activeText} **نص عريض**`;
    } else if (tag === 'success') {
      decoratedText = `✅ ${activeText}`;
    } else if (tag === 'warning') {
      decoratedText = `⚠️ ${activeText}`;
    } else if (tag === 'bullet') {
      decoratedText = `${activeText}\n• `;
    } else if (tag === 'sparkle') {
      decoratedText = `✨ ${activeText} ✨`;
    }

    if (activeEditorLang === 'ar') {
      setEditedAr(decoratedText);
      setPreviewContent(decoratedText);
    } else {
      setEditedEn(decoratedText);
      setPreviewContent(decoratedText);
    }
  };

  // Live text update handlers
  const handleArTextChange = (txt: string) => {
    setEditedAr(txt);
    if (activeEditorLang === 'ar') {
      setPreviewContent(txt);
    }
  };

  const handleEnTextChange = (txt: string) => {
    setEditedEn(txt);
    if (activeEditorLang === 'en') {
      setPreviewContent(txt);
    }
  };

  // Commit edit changes to global translations map
  const handleSaveEdit = (key: string) => {
    const oldAr = (i18n.ar as any)[key] || '';
    const oldEn = (i18n.en as any)[key] || '';

    // Update system state in memory
    (i18n.ar as any)[key] = editedAr;
    (i18n.en as any)[key] = editedEn;

    // Create log logs entries
    const newLogs: AuditLogEntry[] = [...auditLogs];

    if (oldAr !== editedAr) {
      newLogs.unshift({
        id: `LOG-${Date.now()}-AR`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'الأدمن الرئيسي - م/ محمد شهاب',
        langCode: 'ar',
        key: key,
        oldVal: oldAr,
        newVal: editedAr
      });
    }

    if (oldEn !== editedEn) {
      newLogs.unshift({
        id: `LOG-${Date.now()}-EN`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'الأدمن الرئيسي - م/ محمد شهاب',
        langCode: 'en',
        key: key,
        oldVal: oldEn,
        newVal: editedEn
      });
    }

    setAuditLogs(newLogs);

    // Save and capture
    const currentCustomAr: any = {};
    const currentCustomEn: any = {};
    for (const k in keyMapping) {
      if ((i18n.ar as any)[k] !== (originalBackup.ar as any)?.[k]) {
        currentCustomAr[k] = (i18n.ar as any)[k];
      }
      if ((i18n.en as any)[k] !== (originalBackup.en as any)?.[k]) {
        currentCustomEn[k] = (i18n.en as any)[k];
      }
    }

    saveToLocalStorage(currentCustomAr, currentCustomEn, newLogs);
    setEditingKey(null);
    onRefreshTranslation(); // Command views to reflect new text changes instantly
  };

  // Revert one specific key to default state
  const handleRevertKey = (key: string) => {
    if (!originalBackup.ar || !originalBackup.en) return;
    
    const defaultAr = originalBackup.ar[key] || '';
    const defaultEn = originalBackup.en[key] || '';

    const oldAr = (i18n.ar as any)[key] || '';
    const oldEn = (i18n.en as any)[key] || '';

    (i18n.ar as any)[key] = defaultAr;
    (i18n.en as any)[key] = defaultEn;

    // Log the revert as a clear action
    const newLogs: AuditLogEntry[] = [
      {
        id: `LOG-${Date.now()}-REVERT`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'الأدمن الرئيسي (استعادة الافتراضي)',
        langCode: 'ar',
        key: key,
        oldVal: oldAr,
        newVal: defaultAr
      },
      ...auditLogs
    ];
    setAuditLogs(newLogs);

    // Update storage
    const currentCustomAr: any = {};
    const currentCustomEn: any = {};
    for (const k in keyMapping) {
      if ((i18n.ar as any)[k] !== (originalBackup.ar as any)?.[k]) {
        currentCustomAr[k] = (i18n.ar as any)[k];
      }
      if ((i18n.en as any)[k] !== (originalBackup.en as any)?.[k]) {
        currentCustomEn[k] = (i18n.en as any)[k];
      }
    }

    saveToLocalStorage(currentCustomAr, currentCustomEn, newLogs);
    if (editingKey === key) {
      setEditedAr(defaultAr);
      setEditedEn(defaultEn);
      setPreviewContent(activeEditorLang === 'ar' ? defaultAr : defaultEn);
    }
    onRefreshTranslation();
  };

  // Restore from direct history log
  const handleRestoreFromHistory = (log: AuditLogEntry) => {
    if (log.langCode === 'ar') {
      (i18n.ar as any)[log.key] = log.oldVal;
    } else {
      (i18n.en as any)[log.key] = log.oldVal;
    }

    const newLogs: AuditLogEntry[] = [
      {
        id: `LOG-${Date.now()}-UNDO`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'إعداد الإدارة (تراجع عن تعديل)',
        langCode: log.langCode,
        key: log.key,
        oldVal: log.newVal,
        newVal: log.oldVal
      },
      ...auditLogs
    ];
    setAuditLogs(newLogs);

    const currentCustomAr: any = {};
    const currentCustomEn: any = {};
    for (const k in keyMapping) {
      if ((i18n.ar as any)[k] !== (originalBackup.ar as any)?.[k]) {
        currentCustomAr[k] = (i18n.ar as any)[k];
      }
      if ((i18n.en as any)[k] !== (originalBackup.en as any)?.[k]) {
        currentCustomEn[k] = (i18n.en as any)[k];
      }
    }

    saveToLocalStorage(currentCustomAr, currentCustomEn, newLogs);
    onRefreshTranslation();
  };

  // Manage simulated moderators
  const handleAddModerator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModName || !newModEmail || !newModRole) return;

    const newMod: Moderator = {
      id: `MOD-${Date.now()}`,
      name: newModName,
      email: newModEmail,
      role: newModRole,
      allowedPages: newModPages,
      status: 'ACTIVE'
    };

    const updated = [...moderators, newMod];
    setModerators(updated);
    localStorage.setItem('shatibha_moderators', JSON.stringify(updated));

    // Clear form
    setNewModName('');
    setNewModEmail('');
    setNewModRole('');
    setNewModPages(['visitor']);
    setShowAddMod(false);
  };

  const toggleModStatus = (id: string) => {
    const updated = moderators.map(m => {
      if (m.id === id) {
        return { ...m, status: m.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' as const };
      }
      return m;
    });
    setModerators(updated);
    localStorage.setItem('shatibha_moderators', JSON.stringify(updated));
  };

  const deleteModerator = (id: string) => {
    const updated = moderators.filter(m => m.id !== id);
    setModerators(updated);
    localStorage.setItem('shatibha_moderators', JSON.stringify(updated));
  };

  // Filtering keys dynamically by category and query
  const allLanguageKeys = Object.keys(keyMapping);
  
  const filteredTranslationKeys = allLanguageKeys.filter(key => {
    const categoryMatches = selectedCategory === 'all' || keyMapping[key] === selectedCategory;
    
    if (!categoryMatches) return false;

    if (!searchQuery) return true;

    // Sub-string search in Key ID, Arabic value, or English value
    const keyLower = key.toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    const arVal = ((i18n.ar as any)[key] || '').toLowerCase();
    const enVal = ((i18n.en as any)[key] || '').toLowerCase();

    return keyLower.includes(queryLower) || arVal.includes(queryLower) || enVal.includes(queryLower);
  });

  // Calculate Metrics
  const totalKeysCount = Object.keys(keyMapping).length;
  const modifiedKeysCount = Object.keys(keyMapping).filter(key => {
    const arModified = (originalBackup.ar && (i18n.ar as any)[key] !== (originalBackup.ar as any)?.[key]);
    const enModified = (originalBackup.en && (i18n.en as any)[key] !== (originalBackup.en as any)?.[key]);
    return arModified || enModified;
  }).length;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 🔮 INTERACTIVE BANNER */}
      <div className="bg-gradient-to-r from-teal-900 to-[#1E293B] text-white rounded-3xl p-6 border border-teal-800/20 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="bg-teal-500/20 p-3.5 rounded-2xl border border-teal-400/30">
              <Globe className="w-7 h-7 text-[#D8B448]" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                {isEn ? 'Dual-Language Content Management System (CMS)' : 'نظام التحكم الإلكتروني وصياغة محتوى الواجهات والموقع 📝'}
              </h3>
              <p className="text-xs text-teal-100/80 leading-relaxed mt-1">
                {isEn 
                  ? 'Manage and alter all client-facing and company-facing text blocks instantly without diving into codebase. Built with revision log fallback protection.'
                  : 'أداة الإدارة والتبديل لكافة حقول النصوص، العناوين، ونماذج التفاعل بالمنصة. يمكنك التعديل وتحديث الكلمات مباشرة للغتين العربية والإنجليزية مع إمكانية التراجع الفوري وربط صلاحيات المعلقين.'}
              </p>
            </div>
          </div>
          
          <div className="bg-[#111827]/40 px-5 py-3 rounded-2xl border border-slate-700 text-center shrink-0 min-w-[200px]">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase">الحساب المنشئ الحالي</span>
            <div className="text-xs font-black text-[#D8B448] flex items-center justify-center gap-1.5 mt-0.5">
              <span>🛡️ أدمن المنصة المعتمد</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 PLATFORM CMS STATISTICS CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-4.5 border border-gray-200/60 shadow-xs">
          <span className="text-xl">✍️</span>
          <p className="text-[10px] text-gray-500 font-bold mt-1">إجمالي الحقول القابلة للتحرير</p>
          <p className="text-xl font-black text-gray-850 mt-1">{totalKeysCount} <span className="text-xs font-semibold text-gray-400">مفتاح ترجمة</span></p>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-gray-200/60 shadow-xs">
          <span className="text-xl">✨</span>
          <p className="text-[10px] text-gray-500 font-bold mt-1">حقول تم تعديلها حالياً</p>
          <p className="text-xl font-black text-teal-600 mt-1">{modifiedKeysCount} <span className="text-xs font-semibold text-gray-400">حقل مخصص</span></p>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-gray-200/60 shadow-xs">
          <span className="text-xl">📜</span>
          <p className="text-[10px] text-gray-500 font-bold mt-1">عمليات التعديل المسجلة بالكامل</p>
          <p className="text-xl font-black text-purple-650 mt-1">{auditLogs.length} <span className="text-xs font-semibold text-gray-400">عملية مراجعة</span></p>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-gray-200/60 shadow-xs">
          <span className="text-xl">👥</span>
          <p className="text-[10px] text-gray-500 font-bold mt-1">مساعدين ومديري محتوى نشطين</p>
          <p className="text-xl font-black text-amber-600 mt-1">{moderators.filter(m => m.status === 'ACTIVE').length} <span className="text-xs font-semibold text-gray-400">محرر مفوّض</span></p>
        </div>

      </div>

      {/* 🧭 SECTIONS NAVIGATION TABS */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs space-y-5">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          
          {/* Sub Tab selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setEditingKey(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all select-none ${
                  selectedCategory === cat.id 
                    ? 'bg-[#1E293B] text-white shadow-xs' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-250/20'
                }`}
              >
                {isEn ? cat.nameEn : cat.nameAr}
              </button>
            ))}
            
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('slideshow');
                setEditingKey(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all select-none ${
                selectedCategory === 'slideshow' 
                  ? 'bg-teal-600 text-white shadow-xs' 
                  : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/30'
              }`}
            >
              🖼️ {isEn ? 'Homepage Slideshow' : 'معرض صور الرئيسية 🖼️'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('faq');
                setEditingKey(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all select-none ${
                selectedCategory === 'faq' 
                  ? 'bg-[#1D4A3D] text-white shadow-xs' 
                  : 'bg-[#1D4A3D]/5 hover:bg-[#1D4A3D]/10 text-[#1D4A3D] border border-emerald-250/20'
              }`}
            >
              ❓ {isEn ? 'Edit FAQ' : 'الأسئلة الشائعة ❓'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('packages');
                setEditingKey(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all select-none ${
                selectedCategory === 'packages' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-705 border border-indigo-250/25'
              }`}
            >
              📦 {isEn ? 'Edit Packages' : 'باقات التشطيب 📦'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('testimonials');
                setEditingKey(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all select-none ${
                selectedCategory === 'testimonials' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-705 border border-amber-250/25'
              }`}
            >
              👥 {isEn ? 'Edit Testimonials' : 'آراء العملاء والشركاء 👥'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('featured_projects');
                setEditingKey(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all select-none ${
                selectedCategory === 'featured_projects' 
                  ? 'bg-cyan-600 text-white shadow-xs' 
                  : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-705 border border-cyan-250/25'
              }`}
            >
              🏗️ {isEn ? 'Featured Projects' : 'سابقة الأعمال والمنفذة 🏗️'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('comparison');
                setEditingKey(null);
                setCompTitleAr(comparison.ar.title);
                setCompTitleEn(comparison.en.title);
                setCompSubtitleAr(comparison.ar.subtitle);
                setCompSubtitleEn(comparison.en.subtitle);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all select-none ${
                selectedCategory === 'comparison' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-705 border border-emerald-250/25'
              }`}
            >
              ⚖️ {isEn ? 'Comparison section' : 'مقارنة التشطيب التقليدي ⚖️'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setEditingKey(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all select-none ${
                selectedCategory === 'all' 
                  ? 'bg-purple-800 text-white shadow-xs' 
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/30'
              }`}
            >
              🔍 {isEn ? 'Show All Keys' : 'رؤية كافة الحقول'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('moderators');
                setEditingKey(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all select-none ${
                selectedCategory === 'moderators' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/30'
              }`}
            >
              🔑 {isEn ? 'Manage Roles' : 'أذونات المساعدين'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('audit_log');
                setEditingKey(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all select-none ${
                selectedCategory === 'audit_log' 
                  ? 'bg-rose-700 text-white shadow-xs' 
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/30'
              }`}
            >
              📜 {isEn ? 'Trace Log' : 'سجل التغييرات الكامل'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('pricing_manager');
                setEditingKey(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all select-none ${
                selectedCategory === 'pricing_manager' 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-250/20'
              }`}
            >
              💰 {isEn ? 'Pricing DB' : 'إدارة البورصة والتكلفة 💰'}
            </button>
          </div>

          {/* Quick Search */}
          {(!['moderators', 'audit_log', 'slideshow', 'faq', 'packages', 'testimonials', 'featured_projects', 'comparison', 'pricing_manager'].includes(selectedCategory)) && (
            <div className="relative w-full lg:w-72 shrink-0">
              <span className="absolute right-3.5 top-2.5 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن نص أو معرف بالمنصة..."
                className="w-full pl-4 pr-10 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans text-right"
              />
            </div>
          )}
        </div>

        {/* 🔑 VIEW 1: MODERATORS ROLE MANAGEMENT */}
        {selectedCategory === 'moderators' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-amber-50/50 border border-amber-200/70 p-4 rounded-2xl flex items-start gap-3.5 text-right">
              <span className="text-xl">🔑</span>
              <div>
                <p className="font-extrabold text-xs text-amber-850">إسناد وتصنيف صلاحيات مشرفي المحتوى (Security Permissions)</p>
                <p className="text-[10px] text-amber-750/90 mt-1 leading-relaxed">
                  يسمح للمسؤول الرئيسي بتعيين موظفين آخرين وتحديد الأقسام والصفحات المصرح لهم بتعديل نصوصها فقط تلافياً لأي خطأ.
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Creators list table */}
              <div className="flex-1 overflow-x-auto">
                <h4 className="font-extrabold text-xs text-gray-700 mb-3">قائمة المحررين وصلاحيات الصفحات:</h4>
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold text-[10px]">
                      <th className="p-3 text-right">المساعد</th>
                      <th className="p-3 text-right">المسمى الوظيفي</th>
                      <th className="p-3 text-right">الصفحات المصرح له بها</th>
                      <th className="p-3 text-center">الحالة</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {moderators.map(mod => (
                      <tr key={mod.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3">
                          <p className="font-extrabold text-gray-850">{mod.name}</p>
                          <p className="text-[10px] text-gray-400 font-sans font-medium mt-0.5">{mod.email}</p>
                        </td>
                        <td className="p-3 font-semibold text-gray-600">{mod.role}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {mod.allowedPages.map(pageId => {
                              const match = categories.find(c => c.id === pageId);
                              return (
                                <span key={pageId} className="bg-slate-100 text-slate-700 text-[9px] px-2 py-0.5 rounded-md font-extrabold">
                                  {match ? match.nameAr.replace(/^[^\s]+\s+/, '') : pageId}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold ${
                            mod.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {mod.status === 'ACTIVE' ? 'نشط ومفوّض' : 'موقوف الصلاحية'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleModStatus(mod.id)}
                              className="text-amber-600 hover:text-amber-800 font-extrabold hover:underline"
                            >
                              {mod.status === 'ACTIVE' ? 'تجميد' : 'تفعيل'}
                            </button>
                            <span className="text-gray-350">|</span>
                            <button
                              type="button"
                              onClick={() => deleteModerator(mod.id)}
                              className="text-red-600 hover:text-red-800 font-extrabold hover:underline"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add form */}
              <div className="w-full lg:w-96 bg-gray-50/60 p-4 rounded-2xl border border-gray-200">
                <h4 className="font-black text-xs text-slate-800 mb-3 flex items-center gap-1.5">
                  <span>➕</span> إضافة محرر محتوى جديد
                </h4>
                
                <form onSubmit={handleAddModerator} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">اسم المحرر الثلاثي:</label>
                    <input
                      type="text"
                      required
                      value={newModName}
                      onChange={(e) => setNewModName(e.target.value)}
                      placeholder="مثال: ياسمين الخطيب"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-right font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">البريد الإلكتروني المهني:</label>
                    <input
                      type="email"
                      required
                      value={newModEmail}
                      onChange={(e) => setNewModEmail(e.target.value)}
                      placeholder="yasmin@shatibha.com"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-left font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">الصفة أو القسم الوظيفي:</label>
                    <input
                      type="text"
                      required
                      value={newModRole}
                      onChange={(e) => setNewModRole(e.target.value)}
                      placeholder="مطور واجهات / منسق تسويق"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-right font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">الصفحات المصرح له بتعديلها:</label>
                    <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-150 max-h-48 overflow-y-auto">
                      {categories.map(cat => (
                        <label key={cat.id} className="flex items-center gap-2 text-xs select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newModPages.includes(cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewModPages([...newModPages, cat.id]);
                              } else {
                                setNewModPages(newModPages.filter(p => p !== cat.id));
                              }
                            }}
                            className="rounded text-amber-550 focus:ring-0 w-3.5 h-3.5"
                          />
                          <span className="font-semibold text-gray-700">{cat.nameAr}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer select-none"
                  >
                    تفويض الصلاحية وتأكيد الحساب
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* 📜 VIEW 2: TRACE AUDIT LOGS & DIFF COMPARISON */}
        {selectedCategory === 'audit_log' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-xs text-gray-700">سجل عمليات التحرير والتدقيق (Security Audit Trail)</h4>
                <p className="text-[10px] text-gray-400 mt-1">يحتفظ بكافة التبديلات في نصوص المنصة، مع معلومات دقيقة لسهولة رصد العيوب الفنية واسترجاع المحتوى.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuditLogs([]);
                  localStorage.removeItem('shatibha_audit_logs');
                }}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
              >
                مسح السجل للتبييض 🧹
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-150">
              <table className="w-full text-xs text-right border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-250 text-gray-500 font-bold text-[10px]">
                    <th className="p-3 text-right">التاريخ والوقت</th>
                    <th className="p-3 text-right">المشرف المسؤول</th>
                    <th className="p-3 text-center">اللغة</th>
                    <th className="p-3 text-right">مفتاح الحقل</th>
                    <th className="p-3 text-right">السياق القديم Old Value</th>
                    <th className="p-3 text-right">السياق الجديد New Value</th>
                    <th className="p-3 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 font-sans">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs font-semibold text-gray-400">
                        لا توجد تعديلات مسجلة بعد. السجل فارغ ونظيف تماماً!
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 text-[10px] text-gray-400 whitespace-nowrap font-mono">{log.timestamp}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[9px] font-medium font-sans">
                            {log.user}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black font-mono ${
                            log.langCode === 'ar' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {log.langCode.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-[10px] font-mono text-indigo-700 whitespace-nowrap font-bold">{log.key}</td>
                        <td className="p-3">
                          <div className="max-w-[200px] text-[10px] line-clamp-2 bg-rose-50 text-rose-800 p-1.5 rounded-lg border border-rose-100 text-right whitespace-pre-wrap font-sans font-medium leading-relaxed">
                            {log.oldVal}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="max-w-[200px] text-[10px] line-clamp-2 bg-emerald-50 text-emerald-800 p-1.5 rounded-lg border border-emerald-100 text-right whitespace-pre-wrap font-sans font-bold leading-relaxed">
                            {log.newVal}
                          </div>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleRestoreFromHistory(log)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 mx-auto select-none"
                          >
                            <RotateCcw className="w-3 h-3 text-indigo-600" />
                            <span>استرجاع المحتوى القديم</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🖼️ VIEW: HOMEPAGE SLIDESHOW MANAGER */}
        {selectedCategory === 'slideshow' && (
          <div className="space-y-6 animate-fade-in" style={{ direction: isEn ? 'ltr' : 'rtl' }}>
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50/30 p-5 rounded-2xl border border-teal-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                  <span>🖼️</span>
                  <span>{isEn ? 'Homepage Slideshow Gallery Management' : 'إدارة معرض الصور الدوار بالصفحة الرئيسية'}</span>
                </h3>
                <p className="text-xs text-teal-700/80 mt-1 max-w-2xl leading-relaxed">
                  {isEn 
                    ? 'Manage the slideshow of gorgeous high-end units on the homepage. They cycle automatically with smooth transitions. You can add up to 10 or more images, edit their Arabic/English captions, specify transition timers, or restore templates.'
                    : 'تحكم بالكامل بالصور المتاحة في المعرض الدوار الفخم للريسبشن والتشطيب الفاخر بالصفحة الرئيسية بالسرعة التي تحددها. تظهر هذه الصور بتأثير التلاشي الحركي في الهاتف والكمبيوتر وتدعم الترجمتين العربية والإنجليزية.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(isEn ? 'Are you sure you want to restore the 10 original default luxury slides?' : 'هل أنت متأكد من رغبتك في إعادة تعيين الـ 10 صور الأصلية الفاخرة للافتراضي؟')) {
                    updateSlidesInStorage(DEFAULT_SLIDES);
                  }
                }}
                className="bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shrink-0 shadow-xs flex items-center gap-1.5"
              >
                <span>🔄</span>
                <span>{isEn ? 'Reset to Default 10 Slides' : 'إعادة التعيين لـ 10 صور افتراضية'}</span>
              </button>
            </div>

            {/* Config & Timer section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Box 1: Timer control */}
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <span>⏱️</span>
                    <span>{isEn ? 'Transition Interval Timer' : 'موقت تبديل عرض الصور التلقائي'}</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-4 font-sans">
                    {isEn 
                      ? 'Define how long each gorgeous luxury slide stays active on screen before automatically cross-fading to the next. Currently set to 5 seconds by request.'
                      : 'حدد عدد الثواني لبقاء كل صورة معروضة على الشاشة قبل تبديلها للتي تليها بنعومة. مبرمج تلقائياً على وضوح 5 ثواني وتستطيع رفعه أو خفضه.'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2"
                    max="15"
                    value={slideInterval}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 15);
                      setSlideInterval(val);
                      localStorage.setItem('shatibha_slideshow_interval', String(val));
                      onRefreshTranslation();
                    }}
                    className="w-full h-2 bg-gray-105 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <span className="bg-teal-50 text-teal-700 text-xs font-extrabold px-3 py-1.5 rounded-lg border border-teal-150/40 shrink-0 select-none font-sans">
                    {slideInterval} {isEn ? 'sec' : 'ثواني'}
                  </span>
                </div>
              </div>

              {/* Box 2: Manual Add slide form */}
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
                <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2 mb-3">
                  <span>➕</span>
                  <span>{isEn ? 'Add Customized Image Slide' : 'إضافة صورة وموقع مخصص للمعرض 🖼️'}</span>
                </h4>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newSlideUrl) return alert(isEn ? 'Please type a valid Image Unsplash/web URL.' : 'يرجى إدخال رابط الصورة بشكل صحيح.');
                    const newSlide = {
                      id: `slide-${Date.now()}`,
                      url: newSlideUrl,
                      labelAr: newSlideLabelAr || (isEn ? 'وحدة سوبر لوكس تم تسليمها' : 'تشطيب كامل سوبر لوكس ✨'),
                      labelEn: newSlideLabelEn || (isEn ? 'Fully Completed Super Lux ✨' : 'وحدة سوبر لوكس تم تسليمها')
                    };
                    updateSlidesInStorage([...slides, newSlide]);
                    setNewSlideUrl('');
                    setNewSlideLabelAr('');
                    setNewSlideLabelEn('');
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
                    <div>
                      <label className="block text-[11px] font-black text-gray-700 mb-1">
                        {isEn ? 'Image URL Address' : 'رابط الصورة المباشر'}
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newSlideUrl}
                        onChange={(e) => setNewSlideUrl(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[11px] focus:bg-white focus:outline-teal-600 focus:border-teal-600 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-gray-700 mb-1">
                        {isEn ? 'Arabic Caption Text' : 'عنوان الصورة باللغة العربية'}
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: ريسبشن راقي تشطيب سوبر لوكس.."
                        value={newSlideLabelAr}
                        onChange={(e) => setNewSlideLabelAr(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[11px] focus:bg-white focus:outline-teal-600 focus:border-teal-600 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-gray-700 mb-1">
                        {isEn ? 'English Caption Text' : 'عنوان الصورة باللغة الإنجليزية'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Master Bedroom custom wood design..."
                        value={newSlideLabelEn}
                        onChange={(e) => setNewSlideLabelEn(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[11px] focus:bg-white focus:outline-teal-600 focus:border-teal-600 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-xs"
                    >
                      <span>✨</span>
                      <span>{isEn ? 'Add image to slideshow' : 'إضافة الصورة الآن للقائمة 🖼️'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Active Slides Manager */}
            <div>
              <h4 className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5 mb-4 px-1">
                <span>📁</span>
                <span>{isEn ? 'Active Slides count' : 'قائمة المعرض الفعالة حالياً'} ({slides.length} {isEn ? 'slides' : 'صور'})</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 font-sans">
                {slides.map((slide: any, idx: number) => {
                  const isEditingThis = editingSlideId === slide.id;
                  return (
                    <div 
                      key={slide.id || idx}
                      className="bg-white rounded-3xl border border-gray-150 shadow-xs overflow-hidden flex flex-col justify-between group hover:border-gray-350 transition-all"
                    >
                      {/* Image Thumbnail with Overlay indexes */}
                      <div className="h-44 sm:h-48 relative overflow-hidden bg-slate-100 shrink-0">
                        <img 
                          src={slide.url} 
                          alt="preview" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
                          #{idx + 1}
                        </div>
                        {/* Slide Caption indicators */}
                        <div className="absolute bottom-3 right-3 left-3 text-right">
                          <p className="text-[10px] font-extrabold text-white leading-relaxed line-clamp-1">{slide.labelAr}</p>
                          <p className="text-[9px] font-medium text-gray-200 leading-relaxed line-clamp-1 mt-0.5">{slide.labelEn}</p>
                        </div>
                      </div>

                      {/* Edit Fields */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-right">
                        {isEditingThis ? (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[10px] font-extrabold text-gray-600 mb-0.5">رابط الصورة</label>
                              <input 
                                type="url" 
                                value={editingSlideUrl}
                                onChange={(e) => setEditingSlideUrl(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-mono focus:bg-white text-left font-sans"
                                style={{ direction: 'ltr' }}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-extrabold text-gray-600 mb-0.5">العنوان باللغة العربية</label>
                              <input 
                                type="text" 
                                value={editingSlideLabelAr}
                                onChange={(e) => setEditingSlideLabelAr(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[10px] focus:bg-white font-sans"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-extrabold text-gray-600 mb-0.5">العنوان بالإنجليزية</label>
                              <input 
                                type="text" 
                                value={editingSlideLabelEn}
                                onChange={(e) => setEditingSlideLabelEn(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[10px] focus:bg-white font-sans text-left"
                                style={{ direction: 'ltr' }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-500 leading-relaxed font-mono truncate select-all bg-gray-50 rounded-lg p-2 max-w-full text-left" style={{ direction: 'ltr' }}>
                            {slide.url}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2 border-t border-gray-100 flex-row">
                          {isEditingThis ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = slides.map((s: any) => {
                                    if (s.id === slide.id) {
                                      return {
                                        ...s,
                                        url: editingSlideUrl,
                                        labelAr: editingSlideLabelAr,
                                        labelEn: editingSlideLabelEn
                                      };
                                    }
                                    return s;
                                  });
                                  updateSlidesInStorage(updated);
                                  setEditingSlideId(null);
                                }}
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold py-1.5 rounded-lg cursor-pointer transition-all font-sans"
                              >
                                {isEn ? 'Save' : 'تأكيد الحفظ ✔️'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSlideId(null)}
                                className="bg-gray-150 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition-all font-sans"
                              >
                                {isEn ? 'Cancel' : 'إلغاء'}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSlideId(slide.id);
                                  setEditingSlideUrl(slide.url);
                                  setEditingSlideLabelAr(slide.labelAr);
                                  setEditingSlideLabelEn(slide.labelEn);
                                }}
                                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/50 text-[10px] font-bold py-1.5 rounded-lg cursor-pointer transition-all font-sans"
                              >
                                ✏️ {isEn ? 'Edit Text/Url' : 'تعديل النصوص'}
                              </button>
                              <button
                                type="button"
                                disabled={slides.length <= 1}
                                onClick={() => {
                                  if (slides.length <= 1) {
                                    return alert(isEn ? 'You must keep at least one slide' : 'يجب الإبقاء على صورة واحدة على الأقل بالمعرض.');
                                  }
                                  if (confirm(isEn ? 'Delete this image from homepage slideshow?' : 'هل نريد حذف هذه الصورة من المعرض الرئيسي؟')) {
                                    const updated = slides.filter((s: any) => s.id !== slide.id);
                                    updateSlidesInStorage(updated);
                                  }
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                                  slides.length <= 1 
                                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' 
                                    : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200/50'
                                }`}
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preset templates for quick addition */}
            <div className="bg-slate-50 border border-gray-200/60 p-5 rounded-2xl">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 mb-2">
                <span>🎨</span>
                <span>{isEn ? 'Preset Fine Luxury Designs Templates' : 'نماذج مصممة مسبقاً (مستلهمة من Unsplash) للإضافة السريعة'}</span>
              </h4>
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-sans">
                {isEn 
                  ? 'We have handpicked 12 breathtaking ultra-modern luxury interior designs. You can add them immediately with a single click to test your slideshow rotation!'
                  : 'لقد قمنا بتنظيم وتصنيف 12 صورة تشطيب كلاسيك ومودرن سوبر لوكس لمشاريع فيلات ومنازل فخمة ومريحة للعين. يمكنك إدراج أي صورة منها بضغطة زر واحدة لتجربة دوران المعرض!'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 font-sans">
                {[
                  {
                    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
                    titleAr: 'تصميم ليفينج روم راقي بإضاءة دافئة مسلطة ✨',
                    titleEn: 'Premium luxury living room warm lighting design'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&auto=format&fit=crop&q=80',
                    titleAr: 'فيلا مودرن ساحرة مع جدران زجاجية وتصميم معاصر 🏡',
                    titleEn: 'Breathtaking modern high-glass dining interior'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&auto=format&fit=crop&q=80',
                    titleAr: 'غرفة نوم رئيسية مع تكسيات خشبية فاخرة وجدران أنيقة 🪵',
                    titleEn: 'Luxury master bedroom custom wood paneling'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
                    titleAr: 'صالون سوبر لوكس رخامي بألوان فخمة متناسقة 🌟',
                    titleEn: 'Polished white marble stone minimalistic salon'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80',
                    titleAr: 'ريسبشن متكامل بأثاث أنيق وتشطيب فائق الدقة ✨',
                    titleEn: 'Super Lux fully furnished reception hall'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
                    titleAr: 'مطبخ أمريكي عصري مجهز من الرخام الأسود الفاخر 🖤',
                    titleEn: 'Bespoke open kitchen layout with custom counter styles'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80',
                    titleAr: 'حمام ماستر مفتوح على دريسنج روم بتوزيع ذكي للإضاءة 🛁',
                    titleEn: 'Open bathroom custom vanity & walk-in dressing space'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?w=1200&auto=format&fit=crop&q=80',
                    titleAr: 'صالون مودرن دافئ بألوان ترابية وملمس مريح للجدران 🤎',
                    titleEn: 'Warm luxury cozy salon space style'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1200&auto=format&fit=crop&q=80',
                    titleAr: 'ممر داخلي وتصميم جدران مودرن بإضاءات مخفية ذكية 💡',
                    titleEn: 'Interior entrance foyer with hidden led cladding features'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop&q=80',
                    titleAr: 'جلسة صالون فخمة تجمع كلاسيكية الأخشاب برقاء الأقمشة 🪵',
                    titleEn: 'Aesthetic luxury lounge and wooden panel decoration'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
                    titleAr: 'ركن قراءة واستوديو هادئ دافئ بأفكار عصرية 📚',
                    titleEn: 'Cozy boho reading den / creative studio apartment highlight'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80',
                    titleAr: 'مطبخ عائلي دافئ بخطوط كلاسيكية وأرضيات من الحجر 🧱',
                    titleEn: 'Cozy wooden cabinet family kitchen space classic layout'
                  }
                ].map((item, pIdx) => {
                  const alreadyExists = slides.some((s: any) => s.url === item.url);
                  return (
                    <div 
                      key={pIdx}
                      className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-2xs flex flex-col justify-between"
                    >
                      <div className="h-24 bg-gray-50 relative overflow-hidden">
                        <img src={item.url} className="w-full h-full object-cover" alt="preset" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/55 p-1 text-center">
                          <span className="text-[8px] text-white font-extrabold max-w-full line-clamp-1 truncate block">{isEn ? item.titleEn : item.titleAr}</span>
                        </div>
                      </div>
                      <div className="p-2 shrink-0">
                        <button
                          type="button"
                          disabled={alreadyExists}
                          onClick={() => {
                            const newSlide = {
                              id: `slide-${Date.now()}-${pIdx}`,
                              url: item.url,
                              labelAr: item.titleAr,
                              labelEn: item.titleEn
                            };
                            updateSlidesInStorage([...slides, newSlide]);
                          }}
                          className={`w-full py-1 rounded-lg text-[9px] font-black cursor-pointer transition-all text-center select-none ${
                            alreadyExists 
                              ? 'bg-gray-150 text-gray-400 border border-gray-250/20 cursor-not-allowed' 
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {alreadyExists ? (isEn ? 'Added' : 'مضاف حالياً') : (isEn ? 'Add' : '➕ إضافة')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ❓ VIEW: FAQ EDITOR */}
        {selectedCategory === 'faq' && (
          <div className="space-y-6 animate-fade-in font-sans">
            <div className="bg-[#1D4A3D]/5 border border-emerald-500/20 p-6 rounded-3xl">
              <h3 className="text-sm font-black text-[#1D4A3D] mb-2 flex items-center gap-2">
                <span>❓</span>
                <span>{isEn ? 'Manage Homepage FAQ Component' : 'إدارة ومراجعة الأسئلة الشائعة وعالم الإجابات ❓'}</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                {isEn 
                  ? 'Add, edit or reorganize the interactive sliding accordion questions of our visitors on Shatibha.'
                  : 'تساعد الأسئلة الشائعة العملاء على فهم نموذج شطبها الهندسي، تضمن التشييد بالدفع المعزول وحراسة الفحص. يمكنك تحريرها بالكامل.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form (Left block) */}
              <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-150 shadow-xs">
                <h4 className="text-xs font-bold text-gray-850 flex items-center gap-2 mb-4">
                  <span>{editingFaqIdx !== null ? '✏️' : '➕'}</span>
                  <span>{editingFaqIdx !== null ? (isEn ? 'Edit FAQ' : 'تعديل السؤال الحالي') : (isEn ? 'Create New FAQ' : 'إضافة سؤال وجواب جديد')}</span>
                </h4>
                <form onSubmit={handleSaveFaq} className="space-y-3.5 text-right">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-650 mb-1">السؤال (باللغة العربية)</label>
                    <input 
                      type="text" 
                      value={newFaqQAr} 
                      onChange={(e) => setNewFaqQAr(e.target.value)} 
                      required
                      placeholder="كيف أضمن أموالي مع منظومة شطبها؟"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-left">Question (in English)</label>
                    <input 
                      type="text" 
                      value={newFaqQEn} 
                      onChange={(e) => setNewFaqQEn(e.target.value)} 
                      required
                      placeholder="e.g., How does Shatibha protect payments?"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none text-left"
                      style={{ direction: 'ltr' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-650 mb-1">الجواب المفصل (باللغة العربية)</label>
                    <textarea 
                      rows={3}
                      value={newFaqAAr} 
                      onChange={(e) => setNewFaqAAr(e.target.value)} 
                      required
                      placeholder="اكتب الإجابة الفنية الشاملة هنا..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-left">Detailed Answer (in English)</label>
                    <textarea 
                      rows={3}
                      value={newFaqAEn} 
                      onChange={(e) => setNewFaqAEn(e.target.value)} 
                      required
                      placeholder="Type the full matching English description here..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none text-left"
                      style={{ direction: 'ltr' }}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black py-2 rounded-xl cursor-pointer transition-all"
                    >
                      {editingFaqIdx !== null ? (isEn ? 'Save Updates' : 'حفظ التغييرات ✔️') : (isEn ? 'Add to Site' : 'إدراج في الأسئلة')}
                    </button>
                    {editingFaqIdx !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFaqIdx(null);
                          setNewFaqQAr(''); setNewFaqQEn('');
                          setNewFaqAAr(''); setNewFaqAEn('');
                        }}
                        className="bg-gray-150 hover:bg-gray-200 text-gray-700 text-[11px] font-bold px-3 py-2 rounded-xl"
                      >
                        {isEn ? 'Cancel' : 'إلغاء'}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List of FAQ */}
              <div className="lg:col-span-7 space-y-3 font-sans">
                <div className="bg-slate-100 p-3 rounded-2xl flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-700">عدد الأسئلة الحالي: {faqs.length}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      if (confirm(isEn ? 'Reset FAQ list?' : 'هل تود استعادة الأسئلة القياسية؟')) {
                        saveFaqsInStorage(HOME_FAQ);
                      }
                    }}
                    className="text-[9px] font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg"
                  >
                    🔄 {isEn ? 'Reset Default' : 'استعادة الافتراضي'}
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-150 hover:border-gray-300 transition-all text-right space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h5 className="text-[11px] font-black text-emerald-800 leading-relaxed">
                            {idx + 1}. {faq.qAr}
                          </h5>
                          <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-0.5 text-left" style={{ direction: 'ltr' }}>
                            {faq.qEn}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFaqIdx(idx);
                              setNewFaqQAr(faq.qAr);
                              setNewFaqQEn(faq.qEn);
                              setNewFaqAAr(faq.aAr);
                              setNewFaqAEn(faq.aEn);
                            }}
                            className="p-1 px-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(isEn ? 'Delete FAQ?' : 'هل تود حذف هذا السؤال المردج؟')) {
                                const updated = faqs.filter((_, fIdx) => fIdx !== idx);
                                saveFaqsInStorage(updated);
                              }
                            }}
                            className="p-1 px-2 text-[10px] font-bold text-red-605 hover:bg-red-50 border border-red-100 rounded-lg"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-dashed border-gray-100 font-sans">
                        <p className="text-[11.5px] text-gray-650 leading-relaxed">{faq.aAr}</p>
                        <p className="text-[10px] text-gray-400 leading-relaxed text-left mt-1" style={{ direction: 'ltr' }}>{faq.aEn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 📦 VIEW: PACKAGES EDITOR */}
        {selectedCategory === 'packages' && (
          <div className="space-y-6 animate-fade-in font-sans">
            <div className="bg-indigo-50 border border-indigo-200/50 p-6 rounded-3xl">
              <h3 className="text-sm font-black text-indigo-900 mb-2 flex items-center gap-2">
                <span>📦</span>
                <span>{isEn ? 'Manage Finishing Packages' : 'إدارة وتسعير باقات التشطيب الفندقي والهندسي 📦'}</span>
              </h3>
              <p className="text-xs text-indigo-700 leading-relaxed max-w-2xl">
                {isEn 
                  ? 'Edit prices and feature lists for various finishing classes available on our platform.'
                  : 'تتحكم هذه اللوحة في أسعار وميزات الباقات (الفاخرة، الذكية، والالترا لوكس). سيشاهد أصحاب الوحدات هذه التفاصيل في حاسبة سعر التشطيب وحساب العائد.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
              {/* Form */}
              <div className="lg:col-span-12 bg-white p-5 rounded-3xl border border-gray-150 shadow-xs">
                <h4 className="text-xs font-bold text-gray-850 flex items-center gap-2 mb-4">
                  <span>{editingPkgIdx !== null ? '✏️' : '➕'}</span>
                  <span>{editingPkgIdx !== null ? (isEn ? 'Edit Package' : 'تعديل الباقة المحددة') : (isEn ? 'Create Custom Package' : 'إنشاء باقة تمليك جديدة')}</span>
                </h4>
                <form onSubmit={handleSavePackage} className="space-y-3.5 text-right">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1">اسم الباقة (عربي)</label>
                      <input 
                        type="text" 
                        value={pkgNameAr} 
                        onChange={(e) => setPkgNameAr(e.target.value)} 
                        required
                        placeholder="باقتنا الفاخرة"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-left">Package Name (En)</label>
                      <input 
                        type="text" 
                        value={pkgNameEn} 
                        onChange={(e) => setPkgNameEn(e.target.value)} 
                        required
                        placeholder="Luxury Elite"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:bg-white focus:outline-none text-left font-sans"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1">سعر المتر بالتكلفة (عربي)</label>
                      <input 
                        type="text" 
                        value={pkgPriceAr} 
                        onChange={(e) => setPkgPriceAr(e.target.value)} 
                        required
                        placeholder="7,000 ج.م"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-left">Cost Per Meter (En)</label>
                      <input 
                        type="text" 
                        value={pkgPriceEn} 
                        onChange={(e) => setPkgPriceEn(e.target.value)} 
                        required
                        placeholder="7,000 EGP"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:bg-white focus:outline-none text-left font-sans"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1">الميزات والأشغال المرفقة (عربي - عنصر في كل سطر)</label>
                      <textarea 
                        rows={4}
                        value={pkgFeaturesAr} 
                        onChange={(e) => setPkgFeaturesAr(e.target.value)} 
                        required
                        placeholder="تأسيس سباكة إيطالي بالكامل&#10;دهانات جوتن درجة أولى&#10;أرضيات بورسلين كليوباترا فاخر"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-left">Included Features (English - One entry per line)</label>
                      <textarea 
                        rows={4}
                        value={pkgFeaturesEn} 
                        onChange={(e) => setPkgFeaturesEn(e.target.value)} 
                        required
                        placeholder="Jotun paints first grade&#10;Full premium plumbing Italian&#10;Luxury Cleopetra porcelain"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none font-sans text-left"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 justify-end">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black px-6 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      {editingPkgIdx !== null ? (isEn ? 'Save Package' : 'حفظ التعديل الباقة ✔️') : (isEn ? 'Create Package' : 'إضافة الباقة')}
                    </button>
                    {editingPkgIdx !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPkgIdx(null);
                          setPkgNameAr(''); setPkgNameEn('');
                          setPkgPriceAr(''); setPkgPriceEn('');
                          setPkgFeaturesAr(''); setPkgFeaturesEn('');
                        }}
                        className="bg-gray-150 hover:bg-gray-200 text-gray-750 text-[11px] font-bold px-3 py-2 rounded-xl"
                      >
                        {isEn ? 'Cancel' : 'إلغاء'}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Items List */}
              <div className="lg:col-span-12 space-y-3 font-sans">
                <div className="bg-slate-100 p-3 rounded-2xl flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-700">باقات التشطيب النشطة بالرئيسية: {packages.length}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      if (confirm(isEn ? 'Reset Packages list?' : 'هل تود استعادة الباقات القياسية؟')) {
                        savePackagesInStorage(HOME_PACKAGES);
                      }
                    }}
                    className="text-[9px] font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-250 px-2.5 py-1 rounded-lg animate-fade-in"
                  >
                    🔄 {isEn ? 'Reset Default' : 'استعادة الافتراضي'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packages.map((pkg, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-150 relative hover:border-indigo-300 hover:shadow-xs transition-all text-right flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-lg font-mono">{pkg.id}</span>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPkgIdx(idx);
                                setPkgNameAr(pkg.nameAr);
                                setPkgNameEn(pkg.nameEn);
                                setPkgPriceAr(pkg.priceAr);
                                setPkgPriceEn(pkg.priceEn);
                                setPkgFeaturesAr(pkg.featuresAr.join('\n'));
                                setPkgFeaturesEn(pkg.featuresEn.join('\n'));
                              }}
                              className="p-1 px-2 text-[10px] bg-slate-50 border rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(isEn ? 'Delete this Package?' : 'هل تود إزالة هذه الباقة تماماً؟')) {
                                  const updated = packages.filter((_, pIdx) => pIdx !== idx);
                                  savePackagesInStorage(updated);
                                }
                              }}
                              className="p-1 px-2 text-[10px] bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 cursor-pointer"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <h5 className="text-[13px] font-black text-indigo-950 mb-1">{pkg.nameAr}</h5>
                        <p className="text-[10px] text-gray-400 font-medium font-sans mb-3 text-left" style={{ direction: 'ltr' }}>{pkg.nameEn}</p>
                        
                        <div className="my-2 bg-indigo-50/50 p-2.5 rounded-2xl text-center">
                          <span className="text-sm font-black text-indigo-850">{pkg.priceAr} / متر</span>
                          <span className="block text-[9px] text-gray-500 font-mono mt-0.5" style={{ direction: 'ltr' }}>{pkg.priceEn} / sqm</span>
                        </div>

                        <ul className="space-y-1.5 mt-4 text-[11px] text-gray-650 font-sans border-t border-dashed border-gray-150 pt-3">
                          {pkg.featuresAr.map((f: string, fIdx: number) => (
                            <li key={fIdx} className="flex items-center gap-1.5 justify-end text-right font-medium">
                              <span>{f}</span>
                              <span className="text-emerald-500 font-bold">✔</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 👥 VIEW: TESTIMONIALS EDITOR */}
        {selectedCategory === 'testimonials' && (
          <div className="space-y-6 animate-fade-in font-sans">
            <div className="bg-amber-55 border border-amber-500/20 p-6 rounded-3xl bg-amber-50">
              <h3 className="text-sm font-black text-amber-900 mb-2 flex items-center gap-2">
                <span>👥</span>
                <span>{isEn ? 'Manage Testimonials & Feedback' : 'مراجعة وتحرير آراء العملاء والشركاء بالرئيسية 👥'}</span>
              </h3>
              <p className="text-xs text-amber-700 leading-relaxed max-w-2xl">
                {isEn 
                  ? 'Add feedback with customer names, locations, and direct ratings to display slider testimonials in a simple format.'
                  : 'عبرت آراء أصحاب الوحدات بالمنظومة الشفافة والتقييمات الممتازة عن نجاحات شطبها. يمكنك صياغة وإضافة أي مراجعة في ثوان.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
              {/* Form */}
              <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-150 shadow-xs">
                <h4 className="text-xs font-bold text-gray-850 flex items-center gap-2 mb-4">
                  <span>{editingTestIdx !== null ? '✏️' : '➕'}</span>
                  <span>{editingTestIdx !== null ? (isEn ? 'Edit Feedback' : 'تعديل التقييم المحدد') : (isEn ? 'Add New Testimonial' : 'إضافة رأي عميل جديد')}</span>
                </h4>
                <form onSubmit={handleSaveTestimonial} className="space-y-3 text-right">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1">الحرف الأول</label>
                      <input 
                        type="text" 
                        maxLength={2}
                        value={testInitial} 
                        onChange={(e) => setTestInitial(e.target.value)} 
                        placeholder="أ"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-center font-bold"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-right">التقييم بالنجوم (1-5)</label>
                      <select
                        value={testRating}
                        onChange={(e) => setTestRating(parseInt(e.target.value, 10))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-sans font-bold"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                        <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                        <option value={3}>⭐⭐⭐ (3/5)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1">اسم العميل (عربي)</label>
                      <input 
                        type="text" 
                        value={testNameAr} 
                        onChange={(e) => setTestNameAr(e.target.value)} 
                        required
                        placeholder="أحمد شهاب"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-left">Client Name (En)</label>
                      <input 
                        type="text" 
                        value={testNameEn} 
                        onChange={(e) => setTestNameEn(e.target.value)} 
                        required
                        placeholder="Ahmed Shehab"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-left font-sans"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1">الموقع/الوحدة (عربي)</label>
                      <input 
                        type="text" 
                        value={testLocAr} 
                        onChange={(e) => setTestLocAr(e.target.value)} 
                        required
                        placeholder="مالك كمبوند الباتيو، القاهرة الجديدة"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-left">Location/Unit (En)</label>
                      <input 
                        type="text" 
                        value={testLocEn} 
                        onChange={(e) => setTestLocEn(e.target.value)} 
                        required
                        placeholder="Owner at El Patio, New Cairo"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-left font-sans"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-650 mb-1">الرأي أو المراجعة (عربي)</label>
                    <textarea 
                      rows={3}
                      value={testTextAr} 
                      onChange={(e) => setTestTextAr(e.target.value)} 
                      required
                      placeholder="منظومة هندسية دقيقة حميتني من استغلال ومطبات شركات التشطيب التقليدية والمقاولين الفرديين..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-sans font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-left">Review/Quote (English)</label>
                    <textarea 
                      rows={3}
                      value={testTextEn} 
                      onChange={(e) => setTestTextEn(e.target.value)} 
                      required
                      placeholder="Very accurate engineering execution that protected me..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-sans font-medium text-left"
                      style={{ direction: 'ltr' }}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[11.5px] font-black py-2 rounded-xl transition-all cursor-pointer"
                    >
                      {editingTestIdx !== null ? (isEn ? 'Save' : 'حفظ التعديل الرأي ✔️') : (isEn ? 'Publish Feedback' : 'إضافة المراجعة للموقع')}
                    </button>
                    {editingTestIdx !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTestIdx(null);
                          setTestInitial(''); setTestNameAr(''); setTestNameEn('');
                          setTestLocAr(''); setTestLocEn('');
                          setTestTextAr(''); setTestTextEn(''); setTestRating(5);
                        }}
                        className="bg-gray-150 hover:bg-gray-200 text-gray-750 text-xs px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        {isEn ? 'Cancel' : 'إلغاء'}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Grid of testimonials */}
              <div className="lg:col-span-7 space-y-3 font-sans">
                <div className="bg-slate-100 p-3 rounded-2xl flex items-center justify-between col-span-full">
                  <span className="text-[10px] font-extrabold text-slate-700">المراجعات المدرجة بالرئيسية: {testimonials.length}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      if (confirm(isEn ? 'Revert to original templates?' : 'هل تود استرجاع باقة الآراء القياسية الفنية؟')) {
                        saveTestimonialsInStorage(HOME_TESTIMONIALS);
                      }
                    }}
                    className="text-[9px] font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-250 px-2.5 py-1 rounded-lg animate-fade-in"
                  >
                    🔄 {isEn ? 'Reset Default' : 'استعادة الآراء القياسية'}
                  </button>
                </div>

                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {testimonials.map((test, idx) => (
                    <div key={idx} className="bg-white p-4.5 rounded-3xl border border-gray-150 text-right space-y-2 relative hover:border-amber-400 hover:shadow-2xs transition-all">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {test.initial}
                          </div>
                          <div>
                            <h5 className="text-[12.5px] font-black text-amber-950">{test.nameAr}</h5>
                            <p className="text-[10px] text-gray-500 font-sans mt-0.5">{test.locationAr}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTestIdx(idx);
                              setTestInitial(test.initial);
                              setTestNameAr(test.nameAr);
                              setTestNameEn(test.nameEn);
                              setTestLocAr(test.locationAr);
                              setTestLocEn(test.locationEn);
                              setTestTextAr(test.textAr);
                              setTestTextEn(test.textEn);
                              setTestRating(test.rating);
                            }}
                            className="p-1 text-[10px] bg-slate-50 border rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(isEn ? 'Remove feedback?' : 'هل ترغب بحذف مراجعة العميل هذه؟')) {
                                const updated = testimonials.filter((_, tIdx) => tIdx !== idx);
                                saveTestimonialsInStorage(updated);
                              }
                            }}
                            className="p-1 text-[10px] bg-rose-50 text-rose-500 border border-rose-100 rounded-lg hover:bg-rose-100 cursor-pointer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="flex text-amber-500 text-xs py-1">
                        {'★'.repeat(test.rating)}{'☆'.repeat(5 - test.rating)}
                      </div>

                      <p className="text-[11.5px] text-gray-700 leading-relaxed font-sans">{test.textAr}</p>
                      <p className="text-[10px] text-gray-405 leading-relaxed font-sans text-left mt-1 border-t border-dashed border-gray-100 pt-1.5" style={{ direction: 'ltr' }}>{test.textEn}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🏗️ VIEW: FEATURED PROJECTS EDITOR */}
        {selectedCategory === 'featured_projects' && (
          <div className="space-y-6 animate-fade-in font-sans">
            <div className="bg-cyan-50 border border-cyan-200/50 p-6 rounded-3xl">
              <h3 className="text-sm font-black text-cyan-900 mb-2 flex items-center gap-2 font-sans">
                <span>🏗️</span>
                <span>{isEn ? 'Manage Portfolio & Featured Projects' : 'تحرير سابقة الأعمال والمشاريع المنفذة الفاخرة بالمنصة 🏗️'}</span>
              </h3>
              <p className="text-xs text-cyan-705 leading-relaxed max-w-2xl">
                {isEn 
                  ? 'Add photo galleries, specifications, level details, area and description to inspire visitor Trust on Shatibha.'
                  : 'تستعرض سابقة الأعمال نماذج من الفيلل والريسبشن تم إنجازها لتشهد لمطابقة المواصفات الفنية والجودة الهندسية العالية.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
              {/* Form */}
              <div className="lg:col-span-12 bg-white p-5 rounded-3xl border border-gray-150 shadow-xs animate-fade-in">
                <h4 className="text-xs font-bold text-gray-850 flex items-center gap-2 mb-4">
                  <span>{editingProjIdx !== null ? '✏️' : '➕'}</span>
                  <span>{editingProjIdx !== null ? (isEn ? 'Edit Project' : 'تعديل مشروع سابقة الأعمال المختار') : (isEn ? 'Add Showcase Project' : 'إنشاء سجل فوتوغرافي جديد بمشروع')}</span>
                </h4>
                <form onSubmit={handleSaveProject} className="space-y-3.5 text-right font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1">اسم المشروع (عربي)</label>
                      <input 
                        type="text" 
                        value={projNameAr} 
                        onChange={(e) => setProjNameAr(e.target.value)} 
                        required
                        placeholder="ريسبشن داي حور وتكسية جدران"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-left">Project Name (En)</label>
                      <input 
                        type="text" 
                        value={projNameEn} 
                        onChange={(e) => setProjNameEn(e.target.value)} 
                        required
                        placeholder="Modern cladding lounge interior"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-left"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1">الكمبوند / المنطقة</label>
                      <input 
                        type="text" 
                        value={projLocAr} 
                        onChange={(e) => setProjLocAr(e.target.value)} 
                        required
                        placeholder="كمبوند هايد بارك، التجمع الخامس"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-left">Compound/Area (En)</label>
                      <input 
                        type="text" 
                        value={projLocEn} 
                        onChange={(e) => setProjLocEn(e.target.value)} 
                        required
                        placeholder="Hyde Park Compound, New Cairo"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-left"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1">المساحة (عربي)</label>
                      <input 
                        type="text" 
                        value={projAreaAr} 
                        onChange={(e) => setProjAreaAr(e.target.value)} 
                        required
                        placeholder="٢٢٠ متر مربع"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-left">Area (En)</label>
                      <input 
                        type="text" 
                        value={projAreaEn} 
                        onChange={(e) => setProjAreaEn(e.target.value)} 
                        required
                        placeholder="220 sqm"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-left"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1">فئة ومستوى التشطيب</label>
                      <input 
                        type="text" 
                        value={projLevelAr} 
                        onChange={(e) => setProjLevelAr(e.target.value)} 
                        required
                        placeholder="تشطيب ألترا مودرن فندقي"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-left">Finishing Level (En)</label>
                      <input 
                        type="text" 
                        value={projLevelEn} 
                        onChange={(e) => setProjLevelEn(e.target.value)} 
                        required
                        placeholder="Ultra Modern Luxury"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-left"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-650 mb-1">روابط صور المطبخ/الريسبشن (أدخل روابط Unsplash تفصل بينها فاصلة)</label>
                    <textarea 
                      rows={2}
                      value={projImages} 
                      onChange={(e) => setProjImages(e.target.value)} 
                      placeholder="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800, https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono text-left focus:bg-white focus:outline-none"
                      style={{ direction: 'ltr' }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1">تفاصيل ومصادقة الوحدة (عربي)</label>
                      <textarea 
                        rows={2}
                        value={projDescAr} 
                        onChange={(e) => setProjDescAr(e.target.value)} 
                        required
                        placeholder="أشرف على هذا المشروع المركز الفني لتأكيد جودة الزوايا والرخام بالاستعانة بمجفف الرطوبة..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-650 mb-1 text-left font-sans">Verification Details (En)</label>
                      <textarea 
                        rows={2}
                        value={projDescEn} 
                        onChange={(e) => setProjDescEn(e.target.value)} 
                        required
                        placeholder="Verified alignment of corners, top level premium finishing inspection..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-sans text-left"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 justify-end">
                    <button
                      type="submit"
                      className="bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-black px-6 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      {editingProjIdx !== null ? (isEn ? 'Save Project' : 'حفظ التعديل ✔️') : (isEn ? 'Publish Project' : 'إدراج المشروع بالرئيسية')}
                    </button>
                    {editingProjIdx !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProjIdx(null);
                          setProjNameAr(''); setProjNameEn(''); setProjLocAr(''); setProjLocEn('');
                          setProjAreaAr(''); setProjAreaEn(''); setProjLevelAr(''); setProjLevelEn('');
                          setProjDescAr(''); setProjDescEn(''); setProjImages('');
                        }}
                        className="bg-gray-150 hover:bg-gray-200 text-gray-755 text-xs px-3 py-2 rounded-xl cursor-pointer"
                      >
                        {isEn ? 'Cancel' : 'إلغاء'}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Showcase list container */}
              <div className="lg:col-span-12 space-y-3 font-sans">
                <div className="bg-slate-100 p-3 rounded-2xl flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-700">عدد المشاريع المنفذة المعروضة: {featuredProjects.length}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      if (confirm(isEn ? 'Reset showcased list?' : 'هل تود استرجاع باقة معارض الأعمال الافتراضية؟')) {
                        saveProjectsInStorage(HOME_FEATURED_PROJECTS);
                      }
                    }}
                    className="text-[9px] font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-250 px-2.5 py-1 rounded-lg animate-fade-in"
                  >
                    🔄 {isEn ? 'Reset Default' : 'استعادة المشاريع الافتراضية'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredProjects.map((proj, idx) => (
                    <div key={idx} className="bg-white p-4.5 rounded-3xl border border-gray-150 text-right grid grid-cols-1 md:grid-cols-12 gap-4 items-start hover:border-cyan-400 transition-all">
                      <div className="md:col-span-4 relative h-28 rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                        <img src={proj.images[0]} className="w-full h-full object-cover font-sans" alt="primary preview" />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-sans px-1.5 py-0.5 rounded-lg">{proj.images.length} صور</span>
                      </div>
                      <div className="md:col-span-8 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-[12.5px] font-black text-cyan-950">{proj.nameAr}</h5>
                            <p className="text-[10px] text-gray-400 font-sans">{proj.locationAr}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProjIdx(idx);
                                setProjNameAr(proj.nameAr);
                                setProjNameEn(proj.nameEn);
                                setProjLocAr(proj.locationAr);
                                setProjLocEn(proj.locationEn);
                                setProjAreaAr(proj.areaAr);
                                setProjAreaEn(proj.areaEn);
                                setProjLevelAr(proj.levelAr);
                                setProjLevelEn(proj.levelEn);
                                setProjDescAr(proj.descAr);
                                setProjDescEn(proj.descEn);
                                setProjImages(proj.images.join(', '));
                              }}
                              className="p-1 px-1.5 text-[10px] bg-slate-50 border rounded hover:bg-slate-100 cursor-pointer"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(isEn ? 'Delete item?' : 'هل تود السحب النهائي لهذا المشروع؟')) {
                                  const updated = featuredProjects.filter((_, pIdx) => pIdx !== idx);
                                  saveProjectsInStorage(updated);
                                }
                              }}
                              className="p-1 px-1.5 text-[10px] bg-rose-50 text-rose-600 border border-rose-100 rounded hover:bg-rose-100 cursor-pointer"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-3 text-[9px] text-gray-550 border-t border-b border-dashed border-gray-150 py-1 font-mono">
                          <span>المساحة: <strong>{proj.areaAr}</strong></span>
                          <span>المستوى: <strong>{proj.levelAr}</strong></span>
                        </div>

                        <p className="text-[11px] text-gray-650 leading-relaxed max-w-full font-sans line-clamp-2 mt-1">{proj.descAr}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ⚖️ VIEW: COMPARISON EDITOR */}
        {selectedCategory === 'comparison' && (
          <div className="space-y-6 animate-fade-in font-sans">
            <div className="bg-emerald-50 border border-emerald-250/20 p-6 rounded-3xl bg-emerald-50">
              <h3 className="text-sm font-black text-emerald-950 mb-2 flex items-center gap-2">
                <span>⚖️</span>
                <span>{isEn ? 'Classical vs. Smart Shatibha Comparison' : 'تخصيص مقارنة التشطيب التقليدي مقابل نظام شطبها الهندسي ⚖️'}</span>
              </h3>
              <p className="text-xs text-emerald-705 leading-relaxed max-w-2xl">
                {isEn 
                  ? 'Update subtitles, titles and table rows to highlight how our engineering system outperforms traditional contracting.'
                  : 'تُظهر هذه المقارنة الخلافات الدقيقة: مثل دفع المستخلصات المجدولة، الفحص بالكاميرات الحية والمهندسين بدلاً من وعود المقاولين الشفهية.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-150 space-y-6 text-right font-sans">
              {/* Header Title configuration block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-gray-700">العنوان الرئيسي والفرعي باللغة العربية:</h4>
                  <div>
                    <label className="block text-[9px] text-gray-400 mb-0.5">العنوان العربي</label>
                    <input 
                      type="text" 
                      value={compTitleAr} 
                      onChange={(e) => setCompTitleAr(e.target.value)} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 mb-0.5">العنوان الفرعي العربي</label>
                    <input 
                      type="text" 
                      value={compSubtitleAr} 
                      onChange={(e) => setCompSubtitleAr(e.target.value)} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-705 text-left" style={{ direction: 'ltr' }}>English Title & Subtitle:</h4>
                  <div>
                    <label className="block text-[9px] text-gray-400 mb-0.5 text-left" style={{ direction: 'ltr' }}>English Title</label>
                    <input 
                      type="text" 
                      value={compTitleEn} 
                      onChange={(e) => setCompTitleEn(e.target.value)} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-left focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 mb-0.5 text-left" style={{ direction: 'ltr' }}>English Subtitle</label>
                    <input 
                      type="text" 
                      value={compSubtitleEn} 
                      onChange={(e) => setCompSubtitleEn(e.target.value)} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-left focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-gray-100 pt-4 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ar: {
                        title: compTitleAr,
                        subtitle: compSubtitleAr,
                        rows: comparison.ar.rows
                      },
                      en: {
                        title: compTitleEn,
                        subtitle: compSubtitleEn,
                        rows: comparison.en.rows
                      }
                    };
                    saveComparisonInStorage(updated);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black px-5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  {isEn ? 'Save Header Texts' : 'تحديث نصوص الهيدر والمقدمة بالرئيسية ✔️'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(isEn ? 'Revert comparison matrix?' : 'إعادة مقارنة الباليتات الافتراضية؟')) {
                      saveComparisonInStorage(HOME_COMPARISON);
                      setCompTitleAr(HOME_COMPARISON.ar.title);
                      setCompTitleEn(HOME_COMPARISON.en.title);
                      setCompSubtitleAr(HOME_COMPARISON.ar.subtitle);
                      setCompSubtitleEn(HOME_COMPARISON.en.subtitle);
                    }
                  }}
                  className="bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-[11px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  🔄 {isEn ? 'Reset All Matrix' : 'استرجاع المقارنة للأصل'}
                </button>
              </div>

              {/* Rows management detail list */}
              <div className="border-t border-gray-150 pt-5 font-sans">
                <h4 className="text-xs font-black text-gray-850 mb-3 block">📋 بنود المقارنة وعواميد المقارنات الحالية:</h4>
                <div className="overflow-x-auto rounded-2xl border border-gray-150">
                  <table className="w-full text-[11.5px] border-collapse text-right">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-150">
                        <th className="p-3 text-gray-700 font-extrabold">{isEn ? 'Compare Item (Ar/En)' : 'بند المقارنة'}</th>
                        <th className="p-3 text-red-700 font-extrabold">{isEn ? 'Traditional Cliché' : 'مخاطر التشطيب التقليدي'}</th>
                        <th className="p-3 text-teal-800 font-extrabold">{isEn ? 'Shatibha Smart Way' : 'الأمان والضمان مع شطبها'}</th>
                        <th className="p-3 text-center">{isEn ? 'Actions' : 'الإجراءات'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans">
                      {comparison.ar.rows.map((row: any, rIdx: number) => {
                        const rowEn = comparison.en.rows[rIdx] || { item: '', trad: '', shatibha: '' };
                        return (
                          <tr key={rIdx} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <span className="font-bold text-slate-805 block">{row.item}</span>
                              <span className="text-[10px] text-gray-400 block font-mono" style={{ direction: 'ltr' }}>{rowEn.item}</span>
                            </td>
                            <td className="p-3 text-rose-700/90 leading-relaxed">
                              <span className="block font-medium">{row.trad}</span>
                              <span className="text-[10px] text-gray-450 block" style={{ direction: 'ltr' }}>{rowEn.trad}</span>
                            </td>
                            <td className="p-3 text-emerald-850 font-medium leading-relaxed">
                              <span className="block font-bold">{row.shatibha}</span>
                              <span className="text-[10px] text-emerald-700/80 block" style={{ direction: 'ltr' }}>{rowEn.shatibha}</span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const customItemAr = prompt(isEn ? 'Item title (AR):' : 'يرجى إدخال اسم البند بالعربية:', row.item);
                                  const customItemEn = prompt(isEn ? 'Item title (EN):' : 'يرجى إدخال اسم البند بالإنجليزية:', rowEn.item);
                                  const customTradAr = prompt(isEn ? 'Traditional (AR):' : 'طريقة المقارنة التقليدية (عربي):', row.trad);
                                  const customTradEn = prompt(isEn ? 'Traditional (EN):' : 'طريقة المقارنة التقليدية (إنجليزي):', rowEn.trad);
                                  const customShatibhaAr = prompt(isEn ? 'Shatibha (AR):' : 'طعام الجودة مع شطبها (عربي):', row.shatibha);
                                  const customShatibhaEn = prompt(isEn ? 'Shatibha (EN):' : 'طعام الجودة مع شطبها (إنجليزي):', rowEn.shatibha);

                                  if (customItemAr && customItemEn && customTradAr && customTradEn && customShatibhaAr && customShatibhaEn) {
                                    const updatedArRows = [...comparison.ar.rows];
                                    const updatedEnRows = [...comparison.en.rows];

                                    updatedArRows[rIdx] = { item: customItemAr, trad: customTradAr, shatibha: customShatibhaAr };
                                    updatedEnRows[rIdx] = { item: customItemEn, trad: customTradEn, shatibha: customShatibhaEn };

                                    saveComparisonInStorage({
                                      ar: { ...comparison.ar, rows: updatedArRows },
                                      en: { ...comparison.en, rows: updatedEnRows }
                                    });
                                  }
                                }}
                                className="px-2.5 py-1 text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-150 rounded cursor-pointer"
                              >
                                {isEn ? 'Quick Edit' : '📝 تعديل السطر'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 📝 VIEW 3: MAIN LIST OF PAGES & TEXT KEYS GANG */}
        {(!['moderators', 'audit_log', 'slideshow', 'faq', 'packages', 'testimonials', 'featured_projects', 'comparison', 'pricing_manager'].includes(selectedCategory)) && (
          <div className="space-y-6 animate-fade-in">
            {filteredTranslationKeys.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/60 rounded-2xl border-2 border-dashed border-gray-200">
                <span className="text-3xl">🔍</span>
                <p className="text-xs text-gray-400 font-extrabold mt-2">
                  لا توجد حقول تتطابق مع بحثك. جرب كتابة كلمات أخرى..
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Visual keys hierarchy list (Left outer column) */}
                <div className={`col-span-1 lg:col-span-4 space-y-3.5 max-h-[700px] overflow-y-auto pr-1 ${isEn ? 'order-first' : ''}`}>
                  <h4 className="font-extrabold text-xs text-gray-650 flex items-center justify-between mb-2 px-1">
                    <span>📚 الحقول وقيمها باللغتين:</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">{filteredTranslationKeys.length} حقل</span>
                  </h4>

                  {filteredTranslationKeys.map(key => {
                    const isEditing = editingKey === key;
                    const arVal = (i18n.ar as any)[key] || '';
                    const enVal = (i18n.en as any)[key] || '';

                    // Check if customized
                    const arMod = (originalBackup.ar && arVal !== (originalBackup.ar as any)?.[key]);
                    const enMod = (originalBackup.en && enVal !== (originalBackup.en as any)?.[key]);
                    const isCustomized = arMod || enMod;

                    return (
                      <div 
                        key={key}
                        onClick={() => handleStartEdit(key)}
                        className={`p-3.5 rounded-2xl border transition-all text-right cursor-pointer shadow-2xs ${
                          isEditing 
                            ? 'bg-[#E2E8F0]/30 border-blue-500/40 ring-1 ring-blue-550/20' 
                            : 'bg-white hover:bg-gray-50/50 border-gray-200/80 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2.5 mb-2.5">
                          <span className="font-mono text-[10px] font-black text-slate-500 bg-gray-50/60 px-2.5 py-1 rounded-lg border border-slate-200/10 truncate max-w-[200px]" title={key}>
                            {key}
                          </span>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isCustomized && (
                              <span className="bg-teal-100 text-teal-800 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold shadow-3xs" title="تم تعديله من الإدارة">
                                مخصص ✏️
                              </span>
                            )}
                            <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase font-sans">
                              {keyMapping[key] || 'general'}
                            </span>
                          </div>
                        </div>

                        {/* Arabic Clip */}
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-extrabold text-gray-700 flex items-center gap-1">
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-black">عربي</span>
                            <span className="line-clamp-1 font-medium text-[10px] text-gray-550 leading-relaxed">{arVal}</span>
                          </p>
                          
                          {/* English Clip */}
                          <p className="text-[10px] font-extrabold text-gray-700 flex items-center gap-1">
                            <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-black">EN</span>
                            <span className="line-clamp-1 font-mono text-[9px] text-gray-450 leading-relaxed truncate text-left">{enVal}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live WYSIWYG Editor Drawer & Visual Mock Renderer (Right column) */}
                <div className="col-span-1 lg:col-span-8 bg-slate-50/30 p-5 rounded-3xl border border-gray-250/20 space-y-5">
                  {editingKey ? (() => {
                    const mappedPage = keyMapping[editingKey] || 'general';
                    const arOriginal = (originalBackup.ar as any)?.[editingKey] || '';
                    const enOriginal = (originalBackup.en as any)?.[editingKey] || '';

                    return (
                      <div className="space-y-5 animate-fade-in text-right">
                        
                        {/* Selected Key Title info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-150 shadow-3xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-slate-900 text-[#D8B448] px-2.5 py-1 rounded-xl font-mono font-black">{editingKey}</span>
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-extrabold">محرر النصوص</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">
                              الصفحة المستهدفة: {categories.find(c => c.id === mappedPage)?.nameAr || mappedPage}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRevertKey(editingKey)}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-250/50 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none"
                            title="استعادة النص الافتراضي للمنصة"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                            <span>استعادة الافتراضي للمنصة</span>
                          </button>
                        </div>

                        {/* Input editors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          
                          {/* Arabic editor container */}
                          <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                              <span className="bg-amber-150 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 shadow-3xs">
                                🇸🇦 المحتوى العربي (Arabic)
                              </span>
                              <span className="text-[9px] text-gray-400 font-mono">
                                {editedAr.length} حرف | {editedAr.split(/\s+/).filter(Boolean).length} كلمة
                              </span>
                            </div>

                            <textarea
                              rows={5}
                              value={editedAr}
                              onChange={(e) => handleArTextChange(e.target.value)}
                              placeholder="أدخل النص العربي الجديد هنا..."
                              className="w-full p-3 border border-gray-200 rounded-xl text-xs font-sans text-right focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed font-semibold bg-gray-50/10 placeholder-gray-300"
                            />

                            {/* Original reference info */}
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-150 text-right">
                              <span className="text-[9px] text-gray-400 font-bold block mb-1">المصطلح الأصلي كود التأسيس:</span>
                              <p className="text-[10px] text-gray-550 leading-relaxed line-clamp-2" title={arOriginal}>
                                {arOriginal || 'لا يوجد قيمة افتراضية مسجلة.'}
                              </p>
                            </div>
                          </div>

                          {/* English editor container */}
                          <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                              <span className="bg-[#1D4A3D]/10 text-[#1D4A3D] px-2.5 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 shadow-3xs uppercase">
                                🇬🇧 English Value
                              </span>
                              <span className="text-[9px] text-gray-400 font-mono">
                                {editedEn.length} chars | {editedEn.split(/\s+/).filter(Boolean).length} words
                              </span>
                            </div>

                            <textarea
                              rows={5}
                              value={editedEn}
                              onChange={(e) => handleEnTextChange(e.target.value)}
                              placeholder="Type English translation here..."
                              className="w-full p-3 border border-gray-200 rounded-xl text-xs font-mono text-left focus:outline-none focus:ring-1 focus:ring-[#2C4D89]/20 leading-relaxed bg-[#FAFDFC]/50 placeholder-gray-300"
                              dir="ltr"
                            />

                            {/* Original reference info */}
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-150 text-left" dir="ltr">
                              <span className="text-[9px] text-gray-400 font-bold block mb-1">Original platform reference:</span>
                              <p className="text-[10px] text-gray-550 leading-relaxed line-clamp-2" title={enOriginal}>
                                {enOriginal || 'No default entry.'}
                              </p>
                            </div>
                          </div>

                        </div>

                        {/* WYSIWYG STYLING HELPER TOOLBAR */}
                        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-3xs">
                          <h5 className="text-[10px] font-extrabold text-[#2C4D89] mb-2 flex items-center gap-1">
                            <span>🛠️</span> منسق النصوص الذكي (WYSIWYG Assistant):
                          </h5>
                          
                          {/* Toggle language focus of wysiwyg */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-400 font-bold">تطبيق التنسيق على حقل:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveEditorLang('ar');
                                  setPreviewContent(editedAr);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                                  activeEditorLang === 'ar' ? 'bg-amber-100 text-amber-800 font-bold border border-amber-200' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                العربي
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveEditorLang('en');
                                  setPreviewContent(editedEn);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                                  activeEditorLang === 'en' ? 'bg-blue-105 text-blue-800 font-bold border border-blue-200' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                الإنجليزي
                              </button>
                            </div>

                            {/* Insertion tags */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => insertWYSIWYGDecoration('bold')}
                                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-gray-200 px-2.5 py-1 rounded-lg text-[10px] font-black select-none cursor-pointer"
                              >
                                <b>✍️ ناص عريض</b>
                              </button>
                              <button
                                type="button"
                                onClick={() => insertWYSIWYGDecoration('success')}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-black select-none cursor-pointer"
                              >
                                ✅ رمز النجاح
                              </button>
                              <button
                                type="button"
                                onClick={() => insertWYSIWYGDecoration('warning')}
                                className="bg-yellow-50 hover:bg-yellow-105 text-yellow-850 border border-yellow-200 px-2.5 py-1 rounded-lg text-[10px] font-black select-none cursor-pointer"
                              >
                                ⚠️ رمز التنبيه
                              </button>
                              <button
                                type="button"
                                onClick={() => insertWYSIWYGDecoration('sparkle')}
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-lg text-[10px] font-black select-none cursor-pointer"
                              >
                                ✨ رمز تمييز
                              </button>
                              <button
                                type="button"
                                onClick={() => insertWYSIWYGDecoration('bullet')}
                                className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg text-[10px] font-black select-none cursor-pointer"
                              >
                                • نقطة تعداد
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* WYSIWYG PREVIEW BOX */}
                        <div className="bg-white p-4.5 rounded-3xl border-2 border-dashed border-gray-200">
                          <h5 className="text-[10px] font-extrabold text-[#111827] mb-2 flex items-center justify-between">
                            <span>🔍 معاينة بصرية حية لظهور المحتوى في صفحات المنصة:</span>
                            <span className="text-[9px] text-[#2C4D89] font-sans font-bold bg-[#FAFDFC] px-2 py-0.5 rounded border border-blue-105">
                              {activeEditorLang === 'ar' ? 'معاينة الواجهة العربية 🇸🇦' : 'English Real-Time Layout Screen 🇬🇧'}
                            </span>
                          </h5>

                          <div 
                            className={`p-4 bg-gray-50/60 rounded-2xl border border-gray-150 min-h-[80px] leading-relaxed select-none ${
                              activeEditorLang === 'ar' ? 'text-right font-sans text-xs' : 'text-left font-mono text-[11px]'
                            }`}
                          >
                            <span className="text-gray-900 font-extrabold whitespace-pre-wrap">
                              {previewContent || 'أدخل بعض الكلمات أعلاه لتشاهد المعاينة والاصطلاح هنا'}
                            </span>
                          </div>
                        </div>

                        {/* Editor Action buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingKey(null)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-500 border border-gray-300 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none"
                          >
                            إلغاء التعديل ❌
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(editingKey)}
                            className="bg-[#1D4A3D] hover:bg-[#1D4A3D]/90 text-white px-7 py-2.5 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer select-none"
                          >
                            <Save className="w-4 h-4 text-emerald-300" />
                            <span>حفظ التعديلات وتحديث المنصة فوراً 💾</span>
                          </button>
                        </div>

                      </div>
                    );
                  })() : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-gray-200 p-8 flex flex-col items-center justify-center space-y-4 shadow-3xs select-none">
                      <div className="bg-[#FAFDFC] p-4 rounded-full border border-blue-105/40 text-blue-500 animate-bounce">
                        <Edit2 className="w-8 h-8 text-[#2C4D89]" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-sm text-slate-800">تعديل وصياغة نصوص الواجهات</h4>
                        <p className="text-[10px] text-gray-500 max-w-sm mx-auto leading-relaxed">
                          اختر أي مفتاح ترجمة (مثل <span className="font-mono text-purple-700 bg-slate-50 px-1 py-0.5 rounded font-bold">heroTitle</span>) من القائمة المجاورة لبدء صياغته بأدوات المعالجة WYSIWYG والطباعة المزدوجة باللغتين فورا!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {selectedCategory === 'pricing_manager' && (
          <div className="space-y-6 animate-fade-in text-right">
            <div className="bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] text-white p-6 rounded-3xl shadow-sm border border-indigo-800/20 relative overflow-hidden">
               <div className="absolute top-0 left-0 bg-blue-500/10 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
               <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-sans">
                 <div>
                   <span className="bg-emerald-500/20 text-emerald-300 text-[10px] uppercase tracking-wide font-black px-3 py-1 rounded-full border border-emerald-500/20">البورصة المركزية شطبها 💰</span>
                   <h3 className="text-xl font-black mt-2 font-sans">بوابة الرقابة وتحديث أسعار التكاليف والخامات</h3>
                   <p className="text-xs text-blue-200/80 mt-1 leading-relaxed">
                     هذه اللوحة تمنحك التحكم الكامل في تحديث أسعار الحديد، الأسمنت، الدهانات، وبنود المصنعيات وتعميمها فوراً على المساعد الذكي "آدم" وكل الآلات الحاسبة وتوصيات مقارنة عروض الأسعار بالمنصة.
                   </p>
                 </div>
                 <div className="shrink-0 flex items-center gap-2">
                   <button
                     type="button"
                     onClick={fetchPricingData}
                     className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2 px-4 rounded-xl border border-white/10 transition-all select-none cursor-pointer flex items-center gap-1.5"
                   >
                     🔄 تحديث البيانات
                   </button>
                 </div>
               </div>
            </div>

            {/* Error & Success Messages */}
            {pricingError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold leading-relaxed shadow-3xs flex items-center gap-2 font-sans">
                <span>🚨</span> {pricingError}
              </div>
            )}
            {pricingSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-xs font-bold leading-relaxed shadow-3xs flex items-center gap-2 font-sans">
                <span>✅</span> {pricingSuccessMsg}
              </div>
            )}

            {isPricingLoading ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-250/20 font-sans">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A] mx-auto"></div>
                <p className="text-xs text-gray-500 mt-4 font-extrabold">يرجى الانتظار، جاري التواصل مع الخادم لجلب أسعار البورصة الفورية...</p>
              </div>
            ) : pricingData ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
                
                {/* Controls and forms (Right column matching page structure) */}
                <div className="col-span-1 lg:col-span-4 space-y-4">
                  
                  {/* Package Price Tier Editor card */}
                  <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs space-y-4">
                    <h4 className="font-extrabold text-xs text-gray-700 flex items-center gap-1 border-b border-gray-105 pb-2">
                      <span>📦</span> سعر المتر لباقات التشطيب (سعر المتر المربع):
                    </h4>
                    
                    <div className="space-y-3">
                      {['economic', 'lux', 'superLux', 'premium'].map((tierId) => {
                        const tier = pricingData.packages[tierId] || {};
                        const namesAr: Record<string, string> = {
                          economic: 'الباقة الاقتصادية 1️⃣',
                          lux: 'باقة لوكس المتوسطة 2️⃣',
                          superLux: 'باقة سوبر لوكس الفاخرة 3️⃣',
                          premium: 'الباقة الفائقة بريميوم VIP 4️⃣'
                        };
                        return (
                          <div 
                            key={tierId}
                            onClick={() => setSelectedPackageToEdit(tierId)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer text-right flex items-center justify-between ${
                              selectedPackageToEdit === tierId 
                                ? 'bg-indigo-50/50 border-indigo-500/50 ring-1 ring-indigo-550/20' 
                                : 'bg-gray-50/50 hover:bg-gray-55 border-gray-150'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-black text-gray-800">{namesAr[tierId] || tierId}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{tier.range || 'غير محدد'}</p>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-black font-mono">
                              تعديل
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {selectedPackageToEdit && (() => {
                      const tier = pricingData.packages[selectedPackageToEdit];
                      const namesAr: Record<string, string> = {
                        economic: 'الباقة الاقتصادية',
                        lux: 'باقة لوكس المتوسطة',
                        superLux: 'باقة سوبر لوكس الفاخرة',
                        premium: 'الباقة الفائقة بريميوم VIP'
                      };
                      return (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200 space-y-3 animate-fade-in text-right">
                          <p className="text-[10px] font-black text-[#2C4D89]">📝 تعديل نطاق باقة المتر المربع: ({namesAr[selectedPackageToEdit]})</p>
                          
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">اسم الفئة بالعربية:</label>
                            <input 
                              type="text"
                              value={tier.nameAr || ''}
                              onChange={(e) => {
                                const copy = { ...pricingData };
                                copy.packages[selectedPackageToEdit].nameAr = e.target.value;
                                setPricingData(copy);
                              }}
                              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-white"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">اسم الفئة بالإنجليزية:</label>
                            <input 
                              type="text"
                              value={tier.nameEn || ''}
                              onChange={(e) => {
                                const copy = { ...pricingData };
                                copy.packages[selectedPackageToEdit].nameEn = e.target.value;
                                setPricingData(copy);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-left font-mono border border-gray-200 rounded-xl bg-white text-slate-800"
                              dir="ltr"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-550 block mb-1">نطاق السعر للمتر المربع:</label>
                            <input 
                              type="text"
                              value={tier.range || ''}
                              onChange={(e) => {
                                const copy = { ...pricingData };
                                copy.packages[selectedPackageToEdit].range = e.target.value;
                                setPricingData(copy);
                              }}
                              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-white text-slate-800 font-extrabold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-555 block mb-1">متوسط التكلفة للآلة الحاسبة (ج.م):</label>
                            <input 
                              type="number"
                              value={tier.averageSqmPrice || 0}
                              onChange={(e) => {
                                const copy = { ...pricingData };
                                copy.packages[selectedPackageToEdit].averageSqmPrice = Number(e.target.value) || 0;
                                setPricingData(copy);
                              }}
                              className="w-full px-3 py-1.5 text-xs font-mono text-left border border-gray-250 rounded-xl bg-white text-slate-800 font-black"
                            />
                          </div>

                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleSavePricingData(pricingData)}
                              disabled={isPricingSaving}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer select-none"
                            >
                              {isPricingSaving ? 'جاري الحفظ...' : '💾 حفظ المستويات'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedPackageToEdit(null)}
                              className="bg-gray-150 hover:bg-gray-200 text-gray-700 text-[10px] px-2.5 py-1.5 rounded-xl select-none"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Labor Rates Quick adjustments */}
                  <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs space-y-4">
                    <h4 className="font-extrabold text-xs text-gray-700 flex items-center gap-1 border-b border-gray-105 pb-2">
                      <span>🔨</span> أسعار مصنعيات وبنود العمالة الميدانية:
                    </h4>

                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                      {pricingData.labor.map((lab: any) => (
                        <div 
                          key={lab.id}
                          onClick={() => setSelectedLaborToEdit(lab)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer text-right flex items-center justify-between ${
                            selectedLaborToEdit?.id === lab.id 
                              ? 'bg-amber-50/50 border-amber-500/50 ring-1 ring-amber-500/10' 
                              : 'bg-gray-50/40 hover:bg-gray-55 border-gray-150'
                          }`}
                        >
                          <div>
                            <p className="text-[11px] font-black text-gray-800">{lab.nameAr}</p>
                            <p className="text-[10px] font-mono text-amber-600 font-bold mt-0.5">{lab.price} {lab.unit}</p>
                          </div>
                          <span className="text-[9px] text-gray-400">تعديل</span>
                        </div>
                      ))}
                    </div>

                    {selectedLaborToEdit && (
                      <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 space-y-3 text-right">
                        <p className="text-[10px] font-black text-amber-900 font-sans">🔧 تعديل سطر مصنعية عمالة:</p>
                        
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1">اسم البند الفني بالعربية:</label>
                          <input 
                            type="text"
                            value={selectedLaborToEdit.nameAr}
                            onChange={(e) => {
                              const updated = pricingData.labor.map((l: any) => l.id === selectedLaborToEdit.id ? { ...l, nameAr: e.target.value } : l);
                              setPricingData({ ...pricingData, labor: updated });
                              setSelectedLaborToEdit({ ...selectedLaborToEdit, nameAr: e.target.value });
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-800 border border-gray-200 rounded-xl bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">سعر اليد العاملة:</label>
                            <input 
                              type="number"
                              value={selectedLaborToEdit.price}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                const updated = pricingData.labor.map((l: any) => l.id === selectedLaborToEdit.id ? { ...l, price: val } : l);
                                setPricingData({ ...pricingData, labor: updated });
                                setSelectedLaborToEdit({ ...selectedLaborToEdit, price: val });
                              }}
                              className="w-full px-3 py-1.5 text-xs font-mono border border-gray-250 rounded-xl bg-white text-slate-800 font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">وحدة القياس:</label>
                            <input 
                              type="text"
                              value={selectedLaborToEdit.unit}
                              onChange={(e) => {
                                const updated = pricingData.labor.map((l: any) => l.id === selectedLaborToEdit.id ? { ...l, unit: e.target.value } : l);
                                setPricingData({ ...pricingData, labor: updated });
                                setSelectedLaborToEdit({ ...selectedLaborToEdit, unit: e.target.value });
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-800 border border-gray-200 rounded-xl bg-white"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSavePricingData(pricingData)}
                            disabled={isPricingSaving}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer select-none"
                          >
                            {isPricingSaving ? 'جاري الحفظ...' : '💾 حفظ التعديل'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedLaborToEdit(null)}
                            className="bg-gray-150 hover:bg-gray-200 text-gray-700 text-[10px] px-2.5 py-1.5 rounded-xl select-none"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Raw Materials Database grid (Left column) */}
                <div className="col-span-1 lg:col-span-8 bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-105 pb-3">
                    <h4 className="font-extrabold text-sm text-gray-800 flex items-center gap-1.5 font-sans">
                      <span>🧱</span> القائمة المتكاملة لأسعار وتوريدات بضائع مواد البناء (بورصة الأسواق الميدانية اليوم):
                    </h4>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `MAT-${Date.now()}`;
                        const customMat = {
                          id: newId,
                          nameAr: 'خامة تشييد جديدة',
                          nameEn: 'Custom construction material',
                          category: 'cement',
                          manufacturer: 'الشركة المصرية للتوريدات',
                          model: 'معايير مصرية قياسية',
                          specifications: 'رتبة معتمدة للفلل والأبراج الفاخرة',
                          usage: 'صب الأسقف وأعمال التشييد والمحارة الأساسية',
                          priceEgp: 2000,
                          unit: 'طن',
                          lastUpdate: new Date().toISOString().substring(0, 10)
                        };
                        const updated = [customMat, ...pricingData.materials];
                        setPricingData({ ...pricingData, materials: updated });
                        setSelectedMaterialToEdit(customMat);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 select-none shadow-sm"
                    >
                      ➕ إضافة مادة جديدة للبورصة
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Material Items List */}
                    <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                      {pricingData.materials.map((mat: any) => (
                        <div 
                          key={mat.id}
                          onClick={() => setSelectedMaterialToEdit(mat)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-right flex flex-col justify-between relative shadow-xs ${
                            selectedMaterialToEdit?.id === mat.id 
                              ? 'bg-emerald-500/5 border-emerald-500/40 ring-1 ring-emerald-500/15' 
                              : 'bg-white hover:bg-gray-50/50 border-gray-250'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div>
                              <span className="text-[9px] font-mono text-gray-400 bg-gray-50 border border-gray-150 px-1.5 py-0.5 rounded uppercase">{mat.id}</span>
                              <h5 className="font-bold text-xs text-gray-800 mt-1.5 leading-relaxed">{mat.nameAr}</h5>
                            </div>
                            <span className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl font-bold font-mono">
                              {mat.priceEgp?.toLocaleString()} ج.م
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-gray-100 text-[10px] text-gray-550 leading-relaxed font-semibold">
                            <div>
                              <span className="text-gray-400 font-bold block mb-0.5">الوحدة:</span>
                              {mat.unit}
                            </div>
                            <div>
                              <span className="text-gray-400 font-bold block mb-0.5">الصانع:</span>
                              <span className="truncate block" title={mat.manufacturer}>{mat.manufacturer}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 font-bold block mb-0.5">التصنيف:</span>
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-black text-[9px] uppercase">
                                {mat.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Material Item Editor Form Detail */}
                    <div className="bg-slate-50 p-5 rounded-2.5xl border border-gray-200 space-y-4 h-fit sticky top-4">
                      {selectedMaterialToEdit ? (
                        <div className="space-y-3.5 animate-fade-in text-right">
                          <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                            <span className="text-xs bg-slate-900 text-[#D8B448] px-2.5 py-1 rounded-xl font-mono font-black uppercase">{selectedMaterialToEdit.id}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg font-black font-sans">محرر تفاصيل الخامة</span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] text-gray-500 font-bold block mb-1">اسم المادة بالعربية (السوق):</label>
                              <input 
                                type="text"
                                value={selectedMaterialToEdit.nameAr}
                                onChange={(e) => {
                                  const updated = pricingData.materials.map((m: any) => m.id === selectedMaterialToEdit.id ? { ...m, nameAr: e.target.value } : m);
                                  setPricingData({ ...pricingData, materials: updated });
                                  setSelectedMaterialToEdit({ ...selectedMaterialToEdit, nameAr: e.target.value });
                                }}
                                className="w-full px-3.5 py-2 text-xs text-slate-800 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-gray-500 font-bold block mb-1">اسم المادة بالإنجليزية (للأنظمة):</label>
                              <input 
                                type="text"
                                value={selectedMaterialToEdit.nameEn}
                                onChange={(e) => {
                                  const updated = pricingData.materials.map((m: any) => m.id === selectedMaterialToEdit.id ? { ...m, nameEn: e.target.value } : m);
                                  setPricingData({ ...pricingData, materials: updated });
                                  setSelectedMaterialToEdit({ ...selectedMaterialToEdit, nameEn: e.target.value });
                                }}
                                className="w-full px-3.5 py-2 text-xs text-slate-800 text-left font-mono border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                dir="ltr"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] text-gray-550 block mb-1">السعر (ج.م):</label>
                                <input 
                                  type="number"
                                  value={selectedMaterialToEdit.priceEgp}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    const updated = pricingData.materials.map((m: any) => m.id === selectedMaterialToEdit.id ? { ...m, priceEgp: val } : m);
                                    setPricingData({ ...pricingData, materials: updated });
                                    setSelectedMaterialToEdit({ ...selectedMaterialToEdit, priceEgp: val });
                                  }}
                                  className="w-full px-3.5 py-1.5 text-xs text-slate-800 font-mono border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-black"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-550 block mb-1">وحدة المقايسة:</label>
                                <input 
                                  type="text"
                                  value={selectedMaterialToEdit.unit}
                                  onChange={(e) => {
                                    const updated = pricingData.materials.map((m: any) => m.id === selectedMaterialToEdit.id ? { ...m, unit: e.target.value } : m);
                                    setPricingData({ ...pricingData, materials: updated });
                                    setSelectedMaterialToEdit({ ...selectedMaterialToEdit, unit: e.target.value });
                                  }}
                                  className="w-full px-3.5 py-1.5 text-xs text-slate-800 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] text-gray-555 block mb-1">المصنع / المورد:</label>
                                <input 
                                  type="text"
                                  value={selectedMaterialToEdit.manufacturer}
                                  onChange={(e) => {
                                    const updated = pricingData.materials.map((m: any) => m.id === selectedMaterialToEdit.id ? { ...m, manufacturer: e.target.value } : m);
                                    setPricingData({ ...pricingData, materials: updated });
                                    setSelectedMaterialToEdit({ ...selectedMaterialToEdit, manufacturer: e.target.value });
                                  }}
                                  className="w-full px-3.5 py-1.5 text-xs text-slate-800 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-555 block mb-1">الفئة الرئيسية:</label>
                                <select
                                  value={selectedMaterialToEdit.category}
                                  onChange={(e) => {
                                    const updated = pricingData.materials.map((m: any) => m.id === selectedMaterialToEdit.id ? { ...m, category: e.target.value } : m);
                                    setPricingData({ ...pricingData, materials: updated });
                                    setSelectedMaterialToEdit({ ...selectedMaterialToEdit, category: e.target.value });
                                  }}
                                  className="w-full px-3.5 py-1.5 text-xs text-slate-800 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                  <option value="steel">steel (حديد)</option>
                                  <option value="cement">cement (أسمنت ومواد أساسية)</option>
                                  <option value="paints">paints (دهانات وبستلات)</option>
                                  <option value="ceramics">ceramics (سيراميك وبورسلين)</option>
                                  <option value="plumbing">plumbing (سباكة وعزل)</option>
                                  <option value="electricity">electricity (أسلاك ومفاتيح)</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-gray-550 block mb-1">بند الاستخدام بالمشاريع:</label>
                              <textarea
                                rows={2}
                                value={selectedMaterialToEdit.usage}
                                onChange={(e) => {
                                  const updated = pricingData.materials.map((m: any) => m.id === selectedMaterialToEdit.id ? { ...m, usage: e.target.value } : m);
                                  setPricingData({ ...pricingData, materials: updated });
                                  setSelectedMaterialToEdit({ ...selectedMaterialToEdit, usage: e.target.value });
                                }}
                                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-sans text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-slate-800"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-gray-550 block mb-1">المواصفات وكود الفحص:</label>
                              <textarea
                                rows={2}
                                value={selectedMaterialToEdit.specifications}
                                onChange={(e) => {
                                  const updated = pricingData.materials.map((m: any) => m.id === selectedMaterialToEdit.id ? { ...m, specifications: e.target.value } : m);
                                  setPricingData({ ...pricingData, materials: updated });
                                  setSelectedMaterialToEdit({ ...selectedMaterialToEdit, specifications: e.target.value });
                                }}
                                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-sans text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-slate-800"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(isEn ? 'Confirm deleting this material?' : 'هل أنت متأكد من رغبتك بحذف هذه المادة من البورصة تماماً؟')) {
                                  const updated = pricingData.materials.filter((m: any) => m.id !== selectedMaterialToEdit.id);
                                  handleSavePricingData({ ...pricingData, materials: updated });
                                  setSelectedMaterialToEdit(null);
                                }
                              }}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all flex items-center gap-1 select-none"
                            >
                              🗑️ حذف المادة
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSavePricingData(pricingData)}
                              disabled={isPricingSaving}
                              className="bg-emerald-600 hover:bg-emerald-705 text-white font-extrabold text-[10px] px-6 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 select-none"
                            >
                              {isPricingSaving ? 'جاري الحفظ...' : '💾 تعميم ونشر السعر لآدم'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <span className="text-3xl">🧱</span>
                          <p className="text-xs text-gray-400 font-extrabold mt-2">انقر فوق أي مادة بناء لتفصيل كود الفحص، السعر، والمواصفات المعيارية.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

      </div>

    </div>
  );
};
