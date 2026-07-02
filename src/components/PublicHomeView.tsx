import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Star, 
  Clock, 
  Layers, 
  Lock, 
  Award, 
  ShieldAlert, 
  CheckCircle, 
  Info, 
  FileText, 
  Search, 
  Briefcase, 
  ClipboardList, 
  Handshake,
  ChevronDown,
  ChevronUp,
  Check,
  Coins,
  ThumbsUp,
  MapPin,
  Activity,
  Sparkles,
  Phone,
  HelpCircle,
  Building,
  Home,
  Paintbrush,
  ArrowLeftRight,
  Mail,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Zap,
  Facebook,
  Instagram,
  Chrome,
  Apple
} from 'lucide-react';
import { Company, ClientRequest } from '../types';
import { Language, getTranslation } from '../lib/translations';
import { ShattabhaLogo } from './ShattabhaLogo';
import { motion, AnimatePresence } from 'motion/react';
import { socialSignIn, signUpWithEmail, signInWithEmail, getUserProfile } from '../lib/firebaseAuth';
import { 
  HOME_DEFAULT_SLIDES as RAW_HOME_DEFAULT_SLIDES, 
  HOME_COMPARISON as RAW_HOME_COMPARISON, 
  HOME_FEATURED_PROJECTS as RAW_HOME_FEATURED_PROJECTS, 
  HOME_TESTIMONIALS as RAW_HOME_TESTIMONIALS, 
  HOME_FAQ as RAW_HOME_FAQ, 
  HOME_PACKAGES as RAW_HOME_PACKAGES,
  FeaturedProject 
} from './homeData';
import {
  HowShattabhaWorks,
  FeaturedProjects,
  Comparison,
  PaymentShield,
  EngineeringSupervision,
  TripartiteBidSecurity,
  FinishingPackagesAndCalculator,
  TrustMetrics,
  TestimonialsAndStats
} from './HomeSections';

// Governorates list
const governorateOptions = [
  { value: 'القاهرة', labelAr: 'القاهرة', labelEn: 'Cairo' },
  { value: 'الجيزة', labelAr: 'الجيزة', labelEn: 'Giza' },
  { value: 'الإسكندرية', labelAr: 'الإسكندرية', labelEn: 'Alexandria' },
  { value: 'القليوبية', labelAr: 'القليوبية', labelEn: 'Qalyubia' },
  { value: 'الشرقية', labelAr: 'الشرقية', labelEn: 'Sharqia' },
  { value: 'الغربية', labelAr: 'الغربية', labelEn: 'Gharbia' },
  { value: 'البحيرة', labelAr: 'البحيرة', labelEn: 'Beheira' },
  { value: 'الدقهلية', labelAr: 'الدقهلية', labelEn: 'Dakahlia' },
  { value: 'المنوفية', labelAr: 'المنوفية', labelEn: 'Monufia' },
];

interface PublicHomeViewProps {
  onNavigateToDashboard: (role: 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR' | 'CLIENT_TERMS' | 'COMPANY_TERMS') => void;
  onAddCompany: (company: Company) => void;
  onRegisterClient: (clientName: string, email: string, phone: string) => void;
  companiesCount: number;
  lang: Language;
  setLang?: (lang: Language) => void;
}

export const PublicHomeView: React.FC<PublicHomeViewProps> = ({
  onNavigateToDashboard,
  onAddCompany,
  onRegisterClient,
  companiesCount,
  lang,
  setLang
}) => {
  // Modal states
  const [modalType, setModalType] = useState<'NONE' | 'LOGIN' | 'CLIENT' | 'COMPANY'>('NONE');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [clientModalMode, setClientModalMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  

  
  // Interactive Slider
  const [showAfter, setShowAfter] = useState<boolean>(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [mobileActiveSlide, setMobileActiveSlide] = useState(0);
  const [showMobileLanding, setShowMobileLanding] = useState(false);

  // Loaded slides list (backed by customizable CMS)
  const [slides, setSlides] = useState(() => {
    try {
      const stored = localStorage.getItem('shatibha_homepage_slides');
      return stored ? JSON.parse(stored) : RAW_HOME_DEFAULT_SLIDES;
    } catch {
      return RAW_HOME_DEFAULT_SLIDES;
    }
  });

  const [faqs, setFaqs] = useState(() => {
    try {
      const stored = localStorage.getItem('shatibha_homepage_faq');
      return stored ? JSON.parse(stored) : RAW_HOME_FAQ;
    } catch {
      return RAW_HOME_FAQ;
    }
  });

  const [packages, setPackages] = useState(() => {
    try {
      const stored = localStorage.getItem('shatibha_homepage_packages');
      return stored ? JSON.parse(stored) : RAW_HOME_PACKAGES;
    } catch {
      return RAW_HOME_PACKAGES;
    }
  });

  const [testimonials, setTestimonials] = useState(() => {
    try {
      const stored = localStorage.getItem('shatibha_homepage_testimonials');
      return stored ? JSON.parse(stored) : RAW_HOME_TESTIMONIALS;
    } catch {
      return RAW_HOME_TESTIMONIALS;
    }
  });

  const [featuredProjects, setFeaturedProjects] = useState(() => {
    try {
      const stored = localStorage.getItem('shatibha_homepage_featured_projects');
      if (stored) {
        const parsed = JSON.parse(stored);
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
      }
      return RAW_HOME_FEATURED_PROJECTS;
    } catch {
      return RAW_HOME_FEATURED_PROJECTS;
    }
  });

  const [comparison, setComparison] = useState(() => {
    try {
      const stored = localStorage.getItem('shatibha_homepage_comparison');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.ar?.rows && parsed?.en?.rows) return parsed;
      }
    } catch (e) {}
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

  // Hot sync with admin modifications
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const storedSlides = localStorage.getItem('shatibha_homepage_slides');
        if (storedSlides) setSlides(JSON.parse(storedSlides));

        const storedFaq = localStorage.getItem('shatibha_homepage_faq');
        if (storedFaq) setFaqs(JSON.parse(storedFaq));

        const storedPkg = localStorage.getItem('shatibha_homepage_packages');
        if (storedPkg) setPackages(JSON.parse(storedPkg));

        const storedTest = localStorage.getItem('shatibha_homepage_testimonials');
        if (storedTest) setTestimonials(JSON.parse(storedTest));

        const storedProj = localStorage.getItem('shatibha_homepage_featured_projects');
        if (storedProj) setFeaturedProjects(JSON.parse(storedProj));

        const storedComp = localStorage.getItem('shatibha_homepage_comparison');
        if (storedComp) {
          const parsed = JSON.parse(storedComp);
          if (parsed?.ar?.rows && parsed?.en?.rows) setComparison(parsed);
        }
      } catch (e) {
        console.error("Error refreshing home details in client viewport:", e);
      }
    };

    window.addEventListener('shatibha-text-changed', handleUpdate);
    return () => {
      window.removeEventListener('shatibha-text-changed', handleUpdate);
    };
  }, []);

  // Shadow variables for original constants to ensure zero-effort bind to static views
  const loadedSlides = slides;
  const HOME_PACKAGES = packages;
  const HOME_FAQ = faqs;
  const HOME_TESTIMONIALS = testimonials;
  const HOME_FEATURED_PROJECTS = featuredProjects;
  const HOME_COMPARISON = comparison;

  // Testimonials slide show
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState<number>(0);

  // Rotating Slogan State
  const [sloganIndex, setSloganIndex] = useState<number>(0);
  const slogansAr = [
    "نضمن جودة التنفيذ بالكود الهندسي ومفتشي الجودة 🏗️",
    "نحمي دفعاتك المالية بحساب الضمان الآمن والمستقل بالكامل 🔒",
    "نطرح عقارك في مناقصة مغلقة مجهولة الهوية لتضمن أفضل سعر ⚖️"
  ];
  const slogansEn = [
    "Certified field inspections double-checking quality codes 🏗️",
    "Absolute escrow accounts protecting milestones step-by-step 🔒",
    "Closed anonymous tenders ensuring competitive rates securely ⚖️"
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Interactive UI states for custom sections
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [compareActiveTab, setCompareActiveTab] = useState<'trad' | 'shatibha'>('trad');

  React.useEffect(() => {
    setCompareActiveTab('trad');
  }, []);

  const [activeFeaturedProject, setActiveFeaturedProject] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [faqSearch, setFaqSearch] = useState('');

  // Custom interactive sections states
  const [selectedPkgId, setSelectedPkgId] = useState<string>('pkg-lux');
  const [calcArea, setCalcArea] = useState<number>(120);

  // Form states - Company registration
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [selectedGovernorates, setSelectedGovernorates] = useState<string[]>(['القاهرة']);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['سوبر لوكس']);
  const [commercialRegFile, setCommercialRegFile] = useState<string>('');
  const [taxCardFile, setTaxCardFile] = useState<string>('');
  const [isCompSubmitting, setIsCompSubmitting] = useState(false);
  const [compSuccessMsg, setCompSuccessMsg] = useState(false);
  const [isGovDropdownOpen, setIsGovDropdownOpen] = useState(false);
  const [compError, setCompError] = useState('');

  // Form states - Client registration
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [isClientSuccess, setIsClientSuccess] = useState(false);
  const [clientAgree, setClientAgree] = useState(false);
  const [companyAgree, setCompanyAgree] = useState(false);
  const [showClientTermsModal, setShowClientTermsModal] = useState(false);
  const [showCompanyTermsModal, setShowCompanyTermsModal] = useState(false);

  // Contact Us form states
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [isContactSuccess, setIsContactSuccess] = useState(false);

  // Interval timers
  useEffect(() => {
    const slideTimer = setInterval(() => {
      if (loadedSlides.length > 0) {
        setSlideIndex((prev) => (prev + 1) % loadedSlides.length);
      }
    }, 5500);

    const testTimer = setInterval(() => {
      if (HOME_TESTIMONIALS.length > 0) {
        setCurrentTestimonialIndex((prev) => (prev + 1) % HOME_TESTIMONIALS.length);
      }
    }, 6000);

    return () => {
      clearInterval(slideTimer);
      clearInterval(testTimer);
    };
  }, [loadedSlides.length, HOME_TESTIMONIALS.length]);

  // Reset photo index when active project changes
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [activeFeaturedProject]);

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompError('');
    const isEn = lang === 'en';

    if (!companyName.trim()) {
      setCompError(isEn ? 'Please enter company name.' : 'برجاء إدخال اسم الشركة.');
      return;
    }
    if (!companyEmail.trim()) {
      setCompError(isEn ? 'Please enter corporate email.' : 'برجاء إدخال البريد الإلكتروني.');
      return;
    }
    if (!companyPhone.trim()) {
      setCompError(isEn ? 'Please enter mobile number.' : 'برجاء إدخال رقم هاتف المندوب.');
      return;
    }
    if (selectedGovernorates.length === 0) {
      setCompError(isEn ? 'Please select at least one governorate.' : 'برجاء اختيار محافظة واحدة على الأقل.');
      return;
    }
    if (selectedLevels.length === 0) {
      setCompError(isEn ? 'Please select at least one finishing standard.' : 'برجاء اختيار مستوى تشطيب واحد على الأقل.');
      return;
    }
    if (!commercialRegFile) {
      setCompError(isEn ? 'Please upload Commercial Register copy' : 'برجاء رفع صورة السجل التجاري.');
      return;
    }
    if (!taxCardFile) {
      setCompError(isEn ? 'Please upload Official Tax Card copy' : 'برجاء رفع البطاقة الضريبية.');
      return;
    }
    if (!companyAgree) {
      setCompError(isEn ? 'Please accept the Partner Terms and Conditions to complete registration.' : 'يرجى قبول الشروط وضوابط الانضمام للشركات ومكاتب التشطيب لتسجيل الحساب.');
      return;
    }

    setIsCompSubmitting(true);
    setTimeout(() => {
      const newCompany: Company = {
        id: `COMP-${Date.now()}`,
        userId: `USER-${Date.now()}`,
        companyName,
        commercialReg: commercialRegFile || 'CR-UPLOADED.pdf',
        taxCard: taxCardFile || 'TC-UPLOADED.pdf',
        status: 'PENDING_APPROVAL',
        finishingTypes: selectedLevels,
        governorates: selectedGovernorates,
        cities: ['القاهرة الجديدة', 'الشيخ زايد', 'مدينة نصر'],
        rating: 5.0,
        projectsCompleted: 0,
        email: companyEmail,
        phone: companyPhone
      };
      
      onAddCompany(newCompany);
      setIsCompSubmitting(false);
      setCompSuccessMsg(true);
      setCompError('');
      setCompanyAgree(false);
      
      setCompanyName('');
      setCompanyEmail('');
      setCompanyPhone('');
    }, 1200);
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone || !clientPassword) return;
    if (!clientAgree) {
      alert(isEn ? "Please accept the Terms and Conditions to complete registration." : "يرجى قبول الشروط والأحكام لإتمام التسجيل.");
      return;
    }
    
    try {
      await signUpWithEmail(clientEmail, clientPassword, clientName, clientPhone, 'CLIENT');
      
      localStorage.setItem('shattabba_client_name', clientName);
      localStorage.setItem('shattabba_client_email', clientEmail);
      
      onRegisterClient(clientName, clientEmail, clientPhone);
      setIsClientSuccess(true);
      setTimeout(() => {
        setIsClientSuccess(false);
        setModalType('NONE');
        // Reset agreement state
        setClientAgree(false);
        onNavigateToDashboard('CLIENT');
      }, 1200);
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert(isEn ? `Registration failed: ${error.message}` : `فشل تسجيل الحساب: ${error.message}`);
    }
  };

  const handleSocialRegister = async (provider: string) => {
    try {
      const result = await socialSignIn(provider as 'Google' | 'Facebook' | 'Apple');
      if (result) {
        const { user } = result;
        const displayName = user.displayName || (lang === 'en' ? 'Client' : 'العميل');
        const userEmail = user.email || `user_${user.uid}@gmail.com`;
        
        localStorage.setItem('shattabba_client_name', displayName);
        localStorage.setItem('shattabba_client_email', userEmail);
        
        if (authMode === 'REGISTER') {
          onRegisterClient(displayName, userEmail, '01000000000');
        }
        
        setModalType('NONE');
        onNavigateToDashboard('CLIENT');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const isEn = lang === 'en';
      let errorDets = error.message || String(error);
      if (error.code === 'auth/operation-not-allowed') {
        errorDets = isEn 
          ? `Currently, ${provider} login is not enabled in the Firebase Console. You must enable it under Authentication -> Sign-in method.` 
          : `تسجيل الدخول عبر ${provider} غير مفعّل في منصة فايربيس (Firebase Console). يجب تفعيل ميزة ${provider} من قسم Authentication.`;
      }
      alert(`⚠️ ${isEn ? 'Authentication Error' : 'حدث خطأ في المصادقة'}:\n${errorDets}`);
    }
  };



  const handleQuickDemoAccess = (email: string) => {
    let role: 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR' = 'CLIENT';
    if (email === 'admin@shattabha.com' || email.includes('admin')) {
      role = 'ADMIN';
    } else if (email === 'inspector@shattabha.com' || email.includes('inspector')) {
      role = 'INSPECTOR';
    } else if (email.includes('luxspace')) {
      role = 'COMPANY';
    } else {
      role = 'CLIENT';
      localStorage.setItem('shattabba_client_email', email);
      if (email === 'ahmed.rashidy@gmail.com') {
        localStorage.setItem('shattabba_client_name', 'أحمد محمود الرشيدي');
      }
    }
    setLoginEmail(email);
    setLoginPassword('12345678');
    setModalType('NONE');
    onNavigateToDashboard(role);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPhone.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      return;
    }
    setIsContactSubmitting(true);
    setTimeout(() => {
      setIsContactSubmitting(false);
      setIsContactSuccess(true);
      setContactPhone('');
      setContactEmail('');
      setContactMessage('');
    }, 1200);
  };

  const isEn = lang === 'en';

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const getInputStyling = (fieldValue: string, fieldKey: string) => {
    if (isEn) {
      return {
        className: "text-left placeholder:text-left",
        dir: "ltr" as const
      };
    }
    const isFocusedOrFilled = fieldValue !== '' || focusedField === fieldKey;
    if (isFocusedOrFilled) {
      return {
        className: "text-left placeholder:text-right font-sans",
        dir: "ltr" as const
      };
    } else {
      return {
        className: "text-right placeholder:text-right font-sans",
        dir: "rtl" as const
      };
    }
  };

  // Filter FAQs based on real-time search
  const filteredFaqs = faqSearch.trim() === ''
    ? HOME_FAQ
    : HOME_FAQ.filter(faq => {
        const q = isEn ? faq.qEn : faq.qAr;
        const a = isEn ? faq.aEn : faq.aAr;
        return q.toLowerCase().includes(faqSearch.toLowerCase()) || 
               a.toLowerCase().includes(faqSearch.toLowerCase());
      });

  const howItWorksSteps = [
    {
      id: 1,
      numAr: '١',
      numEn: '1',
      titleAr: 'قدم طلب التشطيب',
      titleEn: 'Submit Finishing Request',
      descAr: 'املأ تفاصيل ومساحة وميزانية وحدتك السكنية، وأضف مخططك الكروكي في ثوانٍ معدودة.',
      descEn: 'Specify your unit size, division, and budget details, then upload your layout sketch in seconds.',
      icon: ClipboardList,
    },
    {
      id: 2,
      numAr: '٢',
      numEn: '2',
      titleAr: 'استقبل العروض السعرية',
      titleEn: 'Receive Competitive Offers',
      descAr: 'نقوم بمراجعة طلبك وعرضه لشركات التشطيب المعتمدة في منطقتك بخصوصية تامة ودون إزعاج.',
      descEn: 'Our admin team reviews your request and shares it with certified contractors nearby.',
      icon: Mail,
    },
    {
      id: 3,
      numAr: '٣',
      numEn: '3',
      titleAr: 'قارن واختر الأنسب لك',
      titleEn: 'Compare & Choose Best Bid',
      descAr: 'قارن العروض الفنية والمالية بوضوح تام، واختر السعر الأنسب لميزانيتك وتطلعاتك بضغطة زر.',
      descEn: 'Compare all received bids side-by-side with complete details of materials, timeline, and cost.',
      icon: ArrowLeftRight,
    },
    {
      id: 4,
      numAr: '٤',
      numEn: '4',
      titleAr: 'المعاينة والتعاقد',
      titleEn: 'Site Inspection & Contract',
      descAr: 'حدد عرضك المفضل لنقوم بتنسيق المعاينة الميدانية وتوقيع العقد الثلاثي لضمان حقوقك المباشرة.',
      descEn: 'Confirm your favorite bid to schedule the site inspection visit and sign the tripartite contract.',
      icon: Handshake,
    },
    {
      id: 5,
      numAr: '٥',
      numEn: '5',
      titleAr: 'الإشراف الهندسي والمتابعة',
      titleEn: 'Engineering Site Supervision',
      descAr: 'عين مشرفاً هندسياً معتمداً من شطبها لمتابعة مقاول التشطيب وضمان أعلى جودة بموقعك.',
      descEn: 'Assign a certified engineering supervisor from our team to inspect finishing works step-by-step.',
      icon: ShieldCheck,
    }
  ];

  return (
    <div className={`${isEn ? 'text-left' : 'text-right'} font-sans antialiased min-h-screen overflow-x-hidden`} style={{ direction: isEn ? 'ltr' : 'rtl' }}>
      
      {/* MOBILE IMMERSIVE LAYOUT (FIVERR-INSPIRED SHATBHA PREMIUM LOOK) */}
      <div className={`${showMobileLanding ? 'hidden' : 'block md:hidden'} bg-[#0A162D] text-white min-h-screen flex flex-col justify-between overflow-x-hidden relative font-sans`} style={{ direction: isEn ? 'ltr' : 'rtl' }}>
        
        {/* Background Image with elegant brand-themed overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1080&auto=format&fit=crop&q=80" 
            alt="Luxurious Modern Home Interior" 
            className="w-full h-full object-cover opacity-20 filter contrast-125"
            referrerPolicy="no-referrer"
          />
          {/* Shatbha signature royal navy blue gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A162D]/60 via-[#0A162D]/95 to-[#050C18] z-0" />
          {/* Subtle brand glow light effects */}
          <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] rounded-full bg-[#2B4D89]/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[50%] rounded-full bg-[#D8B448]/5 blur-3xl pointer-events-none" />
        </div>

        {/* Header with Language switch */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-5">
          {setLang && (
            <button 
              onClick={() => setLang(isEn ? 'ar' : 'en')}
              className="bg-[#2B4D89]/20 backdrop-blur-md border border-[#2B4D89]/30 text-white p-1.5 px-3.5 rounded-full text-[11px] font-bold hover:bg-[#2B4D89]/40 transition-colors cursor-pointer"
            >
              {isEn ? 'العربية' : 'English'}
            </button>
          )}
          
          <div className="flex items-center gap-1.5">
            <span className="text-[9.5px] text-[#D8B448] font-black tracking-wider uppercase">● {isEn ? 'SECURE ESCROW' : 'حساب ضمان آمن'}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-5">
          
          {/* Shatbha Logo Card in the Center - Perfect Circle (132px x 132px) */}
          <div 
            onClick={() => onNavigateToDashboard('CLIENT')}
            className="w-[132px] h-[132px] min-w-[132px] min-h-[132px] max-w-[132px] max-h-[132px] bg-white rounded-full shadow-[0_20px_50px_rgba(10,22,45,0.5)] flex flex-col items-center justify-center border border-white/20 active:scale-95 transition-all duration-300 cursor-pointer mx-auto relative z-10 shrink-0"
          >
            <ShattabhaLogo className="w-15 h-15" iconOnly={true} />
            <div className="flex flex-col select-none items-center mt-0.5">
              <span className="font-extrabold text-[15px] text-[#2B4D89] tracking-tight leading-none">شطبها</span>
              <span className="text-[8px] text-[#2B4D89]/80 tracking-[0.22em] uppercase font-black mt-0.5 leading-none">SHATBHA</span>
            </div>
          </div>

          {/* Slogan - Exactly 4 Words */}
          <h1 className="text-2.5xl sm:text-3xl font-extrabold text-center text-white mt-5 leading-tight px-6">
            {isEn ? (
              <>
                Shatbha... <span className="text-[#D8B448] font-black">Finishing with Safety.</span>
              </>
            ) : (
              <>
                شطبها... <span className="text-[#D8B448] font-black">تشطيب بأمان.</span>
              </>
            )}
          </h1>

          {/* Checklist Points (Ultra short) */}
          <div className="flex flex-col gap-2.5 mx-auto max-w-xs mt-4" dir={isEn ? "ltr" : "rtl"}>
            {[
              { ar: "تخطيط هندسي دقيق.", en: "Precise engineering planning." },
              { ar: "متابعة تنفيذ دورية.", en: "Regular execution follow-up." },
              { ar: "ضمان استلام آمن.", en: "Secure reception guarantee." },
              { ar: "توفير وقتك وجهدك.", en: "Saving your time & effort." }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-white/95 text-[14px] font-bold">
                <CheckCircle className="w-[18px] h-[18px] text-[#D8B448] shrink-0" />
                <span>{isEn ? item.en : item.ar}</span>
              </div>
            ))}
          </div>

          {/* Horizontally swiping Carousel (Middle features Section) */}
          <div className="mt-6 w-full overflow-hidden">
            <div 
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3.5 px-6 py-2 w-full"
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                if (width > 0) {
                  const newIndex = Math.round(Math.abs(scrollLeft) / width);
                  setMobileActiveSlide(newIndex);
                }
              }}
              dir={isEn ? "ltr" : "rtl"}
            >
              {[
                {
                  titleAr: "تقارير فنية دقيقة",
                  titleEn: "Accurate Site Audit Reports",
                  descAr: "متابعة دورية خطوة بخطوة بالصور للتأكد من الجودة.",
                  descEn: "Step-by-step follow-up with photos to ensure high quality.",
                  icon: ClipboardList,
                },
                {
                  titleAr: "ربط الدفعات بالاستلام",
                  titleEn: "Escrow Linked to Approvals",
                  descAr: "لا يتم صرف أي دفعة للمقاول إلا بعد الموافقة الفنية.",
                  descEn: "No payment released without technical engineering approval.",
                  icon: Lock,
                },
                {
                  titleAr: "شركات معتمدة ومسجلة",
                  titleEn: "Certified Registered Contractors",
                  descAr: "نتحقق بدقة من السجل التجاري والبطاقة الضريبية لكل شركة.",
                  descEn: "We verify commercial records and tax cards.",
                  icon: ShieldCheck,
                },
                {
                  titleAr: "وفر حتى 20% من التكاليف",
                  titleEn: "Save up to 20% on Execution",
                  descAr: "من خلال مناقصة شفافة وعروض تنافسية من مقاولين متعددين.",
                  descEn: "Through transparent bidding and competitive contractor offers.",
                  icon: Coins,
                }
              ].map((slide, idx) => (
                <div 
                  key={idx}
                  className="snap-center shrink-0 w-[calc(100vw-3rem)] bg-white rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xl transition-all duration-300 border border-slate-100"
                  dir={isEn ? "ltr" : "rtl"}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-[#2B4D89]/5 border border-[#2B4D89]/10 shrink-0">
                      <slide.icon className="w-5 h-5 text-[#2B4D89]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-[#2B4D89] text-[13px] leading-tight">
                        {isEn ? slide.titleEn : slide.titleAr}
                      </h4>
                      <p className="text-slate-500 text-[10px] mt-0.5 leading-normal font-medium truncate max-w-[170px] sm:max-w-xs">
                        {isEn ? slide.descEn : slide.descAr}
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-4.5 h-4.5 text-[#D8B448] shrink-0" />
                </div>
              ))}
            </div>

            {/* Slider Dots Indicator */}
            <div className="flex justify-center gap-1.5 mt-2.5">
              {[0, 1, 2, 3].map((idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${mobileActiveSlide === idx ? 'w-5 bg-[#D8B448]' : 'w-1.5 bg-white/20'}`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* STICKY/FIXED BOTTOM SECTION (FIVERR STYLE) */}
        <div className="relative z-10 w-full px-6 pb-6 pt-2 mt-auto">
          
          {/* Action Buttons Grid - Side-by-Side (2 Columns) */}
          <div className="grid grid-cols-2 gap-3.5 mb-5" dir={isEn ? "ltr" : "rtl"}>
            
            {/* Right Card in RTL: Company/Contractor with Paintbrush icon for decoration */}
            <div 
              onClick={() => setModalType('COMPANY')}
              className="bg-[#12233F]/95 backdrop-blur-md active:scale-98 border border-[#2B4D89]/40 rounded-2xl p-4.5 flex flex-col items-center justify-center text-center min-h-[135px] cursor-pointer group hover:bg-[#182F54] hover:border-[#D8B448]/50 hover:shadow-[0_10px_25px_rgba(216,180,72,0.2)] transition-all duration-300 shadow-xl"
            >
              <div className="bg-[#2B4D89]/25 border border-[#2B4D89]/30 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-inner mb-3">
                <Paintbrush className="w-7 h-7 text-[#D8B448]" />
              </div>
              <div className="flex flex-col items-center justify-center">
                <h3 className="font-extrabold text-[13px] sm:text-[14px] text-white leading-tight">
                  {isEn ? 'Register Company' : 'سجل شركتك'}
                </h3>
              </div>
            </div>

            {/* Left Card in RTL: Client with Home icon */}
            <div 
              onClick={() => setModalType('CLIENT')}
              className="bg-[#12233F]/95 backdrop-blur-md active:scale-98 border border-[#2B4D89]/40 rounded-2xl p-4.5 flex flex-col items-center justify-center text-center min-h-[135px] cursor-pointer group hover:bg-[#182F54] hover:border-[#2B4D89]/70 hover:shadow-[0_10px_25px_rgba(84,150,255,0.2)] transition-all duration-300 shadow-xl"
            >
              <div className="bg-[#2B4D89]/25 border border-[#2B4D89]/30 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-inner mb-3">
                <Home className="w-7 h-7 text-[#5496FF]" />
              </div>
              <div className="flex flex-col items-center justify-center">
                <h3 className="font-extrabold text-[13px] sm:text-[14px] text-white leading-tight">
                  {isEn ? 'Submit Request' : 'قدم طلب تشطيب'}
                </h3>
              </div>
            </div>

          </div>

          {/* Under buttons: Skip on the right (RTL), Sign In on the left (RTL) */}
          <div className="flex items-center justify-between px-2" dir={isEn ? "ltr" : "rtl"}>
            <button 
              onClick={() => setShowMobileLanding(true)}
              className="text-white/60 hover:text-[#D8B448] text-xs font-black underline underline-offset-4 cursor-pointer transition-colors"
            >
              {isEn ? 'Skip' : 'تخطي'}
            </button>

            <button 
              onClick={() => setModalType('LOGIN')}
              className="text-white/60 hover:text-[#D8B448] text-xs font-black underline underline-offset-4 cursor-pointer transition-colors"
            >
              {isEn ? 'Sign In' : 'تسجيل دخول'}
            </button>
          </div>

        </div>

      </div>

      {/* DESKTOP LAYOUT (OR MOBILE FULL LANDING) */}
      <div className={`${showMobileLanding ? 'block' : 'hidden md:block'} bg-[#F4F6F9] pb-12 min-h-screen`}>
        
        {/* NAVBAR */}
        <nav className="bg-white shadow-sm sticky top-0 left-0 right-0 z-50 px-3 sm:px-8 border-b border-gray-150">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-[56px] sm:h-[72px]">
          
          <div 
            className="flex items-center gap-1 sm:gap-3 cursor-pointer shrink-0" 
            onClick={() => {
              if (showMobileLanding) {
                setShowMobileLanding(false);
              } else {
                onNavigateToDashboard('CLIENT');
              }
            }}
          >
            <ShattabhaLogo className="w-7 h-7 sm:w-11 sm:h-11 shrink-0" />
            <div className={`flex flex-col select-none ${isEn ? 'items-start' : 'items-end'} shrink-0`}>
              <span className="font-extrabold text-[10px] sm:text-lg text-[#2B4D89] leading-tight tracking-tight">
                {getTranslation('platformName', lang)}
              </span>
              <span className="text-[6px] sm:text-[9px] text-[#2B4D89] tracking-wider uppercase font-bold leading-none">SHATTABHA</span>
            </div>
          </div>

          <ul className="hidden lg:flex items-center gap-8 list-none text-xs sm:text-sm font-extrabold text-gray-600">
            <li><a href="#why-shatibha" className="hover:text-[#2B4D89] transition-colors">{isEn ? 'Why Us' : 'لماذا شطبها؟'}</a></li>
            <li><a href="#payment-shield" className="hover:text-[#2B4D89] transition-colors">{isEn ? 'Escrow Protection' : 'حماية أموالك'}</a></li>
            <li><a href="#featured-projects" className="hover:text-[#2B4D89] transition-colors">{isEn ? 'Completed Works' : 'سابقة الأعمال'}</a></li>
            <li><a href="#faq" className="hover:text-[#2B4D89] transition-colors">{isEn ? 'FAQ' : 'الأسئلة الشائعة'}</a></li>
          </ul>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {setLang && (
              <button 
                onClick={() => setLang(isEn ? 'ar' : 'en')}
                className="p-1 px-1.5 sm:px-2.5 border border-gray-200 text-gray-500 rounded-lg text-[9px] sm:text-xs font-bold hover:bg-gray-50 hover:text-[#2B4D89] transition-colors cursor-pointer shrink-0"
              >
                <span className="hidden sm:inline">{isEn ? 'العربية' : 'English'}</span>
                <span className="sm:hidden">{isEn ? 'العربية' : 'EN'}</span>
              </button>
            )}
            <button 
              onClick={() => setModalType('LOGIN')}
              className="px-2 sm:px-3.5 py-1 sm:py-1.5 border border-[#2B4D89]/35 text-[#2B4D89] text-[9px] sm:text-xs font-extrabold rounded-xl hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              {isEn ? 'Login' : 'تسجيل دخول'}
            </button>
            <button 
              onClick={() => setModalType('CLIENT')}
              className="bg-[#2B4D89] text-white px-2 sm:px-5 py-1.5 sm:py-2 text-[9px] sm:text-xs font-extrabold rounded-xl hover:bg-[#1E3A68] transition-all shadow-md shadow-[#2B4D89]/20 hover:-translate-y-0.5 cursor-pointer flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap"
            >
              <span>
                <span className="hidden sm:inline">{isEn ? 'Request Finishing' : 'اطلب تشطيب الآن'}</span>
                <span className="sm:hidden">{isEn ? 'Request' : 'اطلب تشطيب'}</span>
              </span> 
              <ArrowRight className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${isEn ? '' : 'scale-x-[-1]'}`} />
            </button>
          </div>

        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100/70 py-12 md:py-16 px-4 sm:px-8 border-b border-gray-150 overflow-hidden">
        {/* Decorative Ambient Flares */}
        <div className="absolute top-10 left-[-150px] w-96 h-96 bg-[#2B4D89]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] right-10 w-[500px] h-[500px] bg-[#D8B448]/5 rounded-full blur-3xl pointer-events-none" />
        {/* Technical Blueprint Layout Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_36px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10">
          
          {/* Content Column (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-stretch text-right space-y-6">
            
            {/* Automatic Rotating Slogan Banner */}
            <div className="min-h-[46px] flex items-center justify-start w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={sloganIndex}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 bg-[#2B4D89]/5 text-[#2B4D89] px-4 py-2 rounded-full text-[11px] font-black border border-[#2B4D89]/10 shadow-3xs self-start"
                >
                  <Sparkles className="w-4 h-4 text-[#D8B448] shrink-0 animate-pulse" />
                  <span>{isEn ? slogansEn[sloganIndex] : slogansAr[sloganIndex]}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Luxurious Brand Message */}
            <h1 className="text-3.5xl sm:text-5xl font-black text-[#2B4D89] leading-[1.22] tracking-tight w-full text-right font-sans">
              {isEn ? (
                <>
                  Shattabha... Your Partner to <br />
                  <span className="text-[#D8B448]">Finish Your Property</span> Securely
                </>
              ) : (
                <>
                  شطبها... شريكك الأول <br />
                  <span className="text-[#D8B448]">لتشطيب عقارات مصر بأمان</span>
                </>
              )}
            </h1>

            {/* Clear, bold value proposition paragraph */}
            <p className="text-gray-600 text-xs sm:text-[14px] leading-relaxed text-right w-full font-bold">
              {isEn 
                ? 'Get precise bids from certified contracting companies in Egypt. We verify commercial registers, secure your funds in escrow, and match payments step-by-step with verified physical engineering approvals.' 
                : 'احصل على عروض أسعار مفصلة ودقيقة من شركات تشطيب معتمدة ومسجلة مقترنة بحماية مالية متكاملة، مع توفير خيار الإشراف الهندسي الميداني وربط دفعاتك بالاستلام الفني المطابق للكود.'}
            </p>

            {/* Microactive CTA Buttons Row */}
            <div className="grid grid-cols-2 gap-2.5 w-full pt-3">
              <motion.button 
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => setModalType('CLIENT')}
                className="bg-gradient-to-r from-[#2B4D89] to-[#1E3A68] text-white text-[11px] min-[360px]:text-[12px] sm:text-sm font-black py-4 px-2 rounded-xl shadow-md shadow-[#2B4D89]/15 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center text-center select-none"
              >
                <span className="w-full text-center block truncate">{isEn ? 'Order Finishing' : 'اطلب تشطيب الآن'}</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => setModalType('COMPANY')}
                className="bg-slate-50 border border-[#2B4D89]/15 text-[#2B4D89] text-[11px] min-[360px]:text-[12px] sm:text-sm font-black py-4 px-2 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer flex items-center justify-center text-center select-none"
              >
                <span className="w-full text-center block truncate">{isEn ? 'Register Partner' : 'سجل كشركة معتمدة'}</span>
              </motion.button>
            </div>

            {/* Elegant Trust Badges like the original but perfectly formatted */}
            <div 
              className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-3.5 pt-5 border-t border-gray-200/60 w-full"
              dir={isEn ? 'ltr' : 'rtl'}
            >
              {/* Right Column (RTL) - Two sentences stacked under each other */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D8B448] shrink-0" />
                  <span className="text-gray-700 leading-none text-[9.5px] min-[360px]:text-[10.5px] min-[400px]:text-[11.5px] sm:text-xs font-black whitespace-nowrap">
                    {isEn ? 'Verified Studios only' : 'شركات مسجلة تجارياً ورسمياً'}
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D8B448] shrink-0" />
                  <span className="text-gray-700 leading-none text-[9.5px] min-[360px]:text-[10.5px] min-[400px]:text-[11.5px] sm:text-xs font-black whitespace-nowrap">
                    {isEn ? 'Certified Site Audit' : 'تقارير فحص وصور دورية'}
                  </span>
                </div>
              </div>

              {/* Left Column (RTL) - Third sentence opposite them */}
              <div className="flex flex-col gap-3 justify-start">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D8B448] shrink-0" />
                  <span className="text-gray-700 leading-none text-[9.5px] min-[360px]:text-[10.5px] min-[400px]:text-[11.5px] sm:text-xs font-black whitespace-nowrap">
                    {isEn ? 'Escrow Protection' : 'ربط الدفعات بالاستلام الهندسي'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Before-After Sliding View Card (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-6 w-full">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-150 w-full hover:shadow-2xl transition-shadow duration-300">
              
              <div className="relative h-64 sm:h-[300px] md:h-[350px] lg:h-[370px] xl:h-[390px] rounded-2xl overflow-hidden shadow-inner mb-4 w-full border border-slate-100">
                
                {/* 1. BEFORE IMAGE LAYER */}
                <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${!showAfter ? 'opacity-100 scale-100' : 'opacity-0 scale-102 pointer-events-none'}`}>
                  <img 
                    src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1200&auto=format&fit=crop&q=80" 
                    alt="Before Finishing" 
                    className="w-full h-full object-cover grayscale brightness-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#2B4D89]/45 mix-blend-overlay" />
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-red-950/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-xl border border-red-500/10">
                    {isEn ? 'Stage 1: Raw Concrete & Red Brick Unit 🧱' : 'مظهر الوحدة قبل التشطيب: على الطوب الأحمر الخرساني 🧱'}
                  </div>
                </div>

                {/* 2. AFTER IMAGE LAYER */}
                <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${showAfter ? 'opacity-100 scale-100' : 'opacity-0 scale-102 pointer-events-none'}`}>
                  <img 
                    src={loadedSlides[slideIndex].url} 
                    alt="After Finishing" 
                    className="w-full h-full object-cover animate-fade-in"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#1E3254]/95 backdrop-blur-md text-white text-[10px] sm:text-xs font-black px-3.5 py-2 rounded-xl border border-white/10 max-w-[85%] text-right font-sans">
                    {isEn ? loadedSlides[slideIndex].labelEn : loadedSlides[slideIndex].labelAr}
                  </div>
                </div>

                {/* Verified certification seal bottom left / right (opposite of absolute top overlay to prevent overlaps) */}
                <div className={`absolute bottom-3 sm:bottom-4 ${isEn ? 'left-3 sm:left-4' : 'right-3 sm:right-4'} bg-white/95 backdrop-blur-sm px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center gap-2 shadow-lg border border-slate-100 text-right`}>
                  <span className="w-2 rounded-full bg-emerald-500 animate-pulse shrink-0 aspect-square" />
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-black text-[#2B4D89] block leading-none">{isEn ? '300+ Verified Handovers' : '٣٠٠+ شقة تم معاينتها وتسليمها'}</span>
                    <span className="text-[8px] sm:text-[9px] text-[#D8B448] font-black block mt-0.5">✓ حاصل على درع الاستلام الهندسي</span>
                  </div>
                </div>

              </div>

              {/* Slider View Control Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3.5 border-t border-slate-100" dir={isEn ? 'ltr' : 'rtl'}>
                
                <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-right w-full sm:w-auto">
                  <span className="text-gray-500 font-extrabold text-xs">
                    {isEn 
                      ? (showAfter ? 'Unit appearance: After finishing' : 'Unit appearance: Before finishing') 
                      : (showAfter ? 'بصمة ومظهر الوحدة بعد التشطيب:' : 'بصمة ومظهر الوحدة قبل التشطيب:')}
                  </span>
                </div>

                <div className="flex gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
                  <button 
                    onClick={() => setShowAfter(false)}
                    className={`px-4 py-2.5 rounded-xl transition-all text-xs font-black cursor-pointer flex-1 sm:flex-none text-center ${
                      !showAfter 
                        ? 'bg-[#E54848] text-white shadow-md shadow-[#E54848]/20' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {isEn ? 'Before: Raw Brick' : 'قبل التشطيب 🧱'}
                  </button>
                  <button 
                    onClick={() => setShowAfter(true)}
                    className={`px-4 py-2.5 rounded-xl transition-all text-xs font-black cursor-pointer flex-1 sm:flex-none text-center ${
                      showAfter 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {isEn ? 'After: Super Lux' : 'بعد التشطيب ✨'}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </header>

      {/* 2. HOW SHATTABHA WORKS */}
      <HowShattabhaWorks isEn={isEn} howItWorksSteps={howItWorksSteps} />

      {/* 3. FEATURED PROJECTS PORTFOLIO */}
      <FeaturedProjects 
        isEn={isEn} 
        HOME_FEATURED_PROJECTS={HOME_FEATURED_PROJECTS} 
        activeFeaturedProject={activeFeaturedProject}
        setActiveFeaturedProject={setActiveFeaturedProject}
        activePhotoIndex={activePhotoIndex}
        setActivePhotoIndex={setActivePhotoIndex}
        setModalType={setModalType}
      />

      {/* 4. COMPARISON DUAL WORKSPACE */}
      <Comparison 
        isEn={isEn} 
        HOME_COMPARISON={HOME_COMPARISON} 
        compareActiveTab={compareActiveTab}
        setCompareActiveTab={setCompareActiveTab}
      />

      {/* 5. PAYMENT SHIELD */}
      <PaymentShield isEn={isEn} />

      {/* 6. INDEPENDENT ENGINEERING SUPERVISION */}
      <EngineeringSupervision isEn={isEn} />

      {/* 7. TRIPARTITE BID SECURITY */}
      <TripartiteBidSecurity isEn={isEn} />

      {/* 8. FINISHING PACKAGES & SMART CALCULATOR */}
      <FinishingPackagesAndCalculator 
        isEn={isEn} 
        HOME_PACKAGES={HOME_PACKAGES} 
        selectedPkgId={selectedPkgId}
        setSelectedPkgId={setSelectedPkgId}
        calcArea={calcArea}
        setCalcArea={setCalcArea}
        setModalType={setModalType}
      />

      {/* 9. PLATFORM INTEGRITY/STATS BENCHMARKS */}
      <TrustMetrics isEn={isEn} />

      {/* 10. CUSTOMER TESTIMONIALS */}
      <TestimonialsAndStats 
        isEn={isEn} 
        HOME_TESTIMONIALS={HOME_TESTIMONIALS} 
        currentTestimonialIndex={currentTestimonialIndex}
        setCurrentTestimonialIndex={setCurrentTestimonialIndex}
        setModalType={setModalType}
      />

      {/* DISABLE OLD DUPLICATE INLINE SECTIONS */}
      {false && (
        <>
          {/* SECTION 3: INDEPENDENT ENGINEERING SUPERVISION (الرقابة الهندسية المستقلة) */}
          <section id="engineering-supervision" className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#F4F6F9]/60 border-b border-[#2B4D89]/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          <div className="lg:col-span-6 space-y-6 text-right flex flex-col justify-center">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-[#2B4D89]/5 text-[#2B4D89] text-[11px] sm:text-xs font-black px-5 py-1.5 rounded-full border border-[#2B4D89]/10 shadow-3xs">
                🌟 {isEn ? 'Certified Site Inspectors' : 'الرقابة الهندسية المستقلة هي الأساس'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B4D89] leading-tight tracking-tight">
              {isEn ? 'Why Customers Hire Independent Shatibha Inspectors' : 'لماذا يختار العملاء الإشراف الهندسي الميداني المستقل من شطبها؟'}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-bold">
              {isEn 
                ? 'Your home represents an expensive life investment. Placing it blindly in builders hands without code checking risks costly plumbing leaks or faulty wiring that shows up later. Shatibhas independent engineers act as your professional eyes on site, auditing materials, thickness, and alignment.' 
                : 'تشطيب عقارك هو استثمارك الأهم ، لكن متابعة المقاول والعمال يوميًا تتطلب وقتًا كبيرًا وخبرة هندسية متخصصة. فحتى إذا كان لديك الوقت، قد لا تتمكن من اكتشاف الأخطاء الفنية أو تقييم جودة التنفيذ بالشكل الصحيح.\nلذلك يوفر لك فريق شطبها للإشراف الهندسي المستقل راحة البال الكاملة، حيث يمثل مصالحك داخل الموقع، ويتابع جميع مراحل التنفيذ، ويتأكد من الالتزام بالمواصفات الفنية ومعايير الجودة قبل استلام الأعمال.\nمع شطبها، لن تعتمد فقط على وعود المقاول، بل ستحصل على عين هندسية محترفة تراقب التنفيذ نيابةً عنك، وتحميك من الأخطاء المكلفة ومشاكل الجودة، لتضمن تنفيذ تشطيبك بالشكل الصحيح من أول مرة'}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200/50 rounded-2xl flex items-center justify-between text-right shadow-3xs hover:border-[#2B4D89]/30 hover:shadow-xs transition-all duration-300">
                <span className="text-2xl">🚗</span>
                <div className="flex-1 pr-3">
                  <h4 className="font-extrabold text-xs text-[#2B4D89]">{isEn ? 'Field Inspection Visits' : 'زيارات ميدانية دورية'}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-0.5">{isEn ? 'Engineer on site' : 'تواجد المهندس في أهم مراحل الصب وتأسيس السباكة والكهرباء'}</p>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200/50 rounded-2xl flex items-center justify-between text-right shadow-3xs hover:border-[#2B4D89]/30 hover:shadow-xs transition-all duration-300">
                <span className="text-2xl">📸</span>
                <div className="flex-1 pr-3">
                  <h4 className="font-extrabold text-xs text-[#2B4D89]">{isEn ? 'Photo & Video Reports' : 'تقارير فنية موثقة بالصور'}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-0.5">{isEn ? 'Direct to your panel' : 'تقارير بالصور للاستلام خطوة بخطوة'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#162B4E] text-white p-5 sm:p-6 rounded-lg shadow-xl relative overflow-hidden border border-[#2B4D89]/40 flex flex-col justify-between h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#D8B448]/[0.02] rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col h-full justify-between z-10 relative space-y-4">
              {/* Header with high contrast badge */}
              <div className="space-y-3">
                <div className="flex items-center justify-between" dir={isEn ? 'ltr' : 'rtl'}>
                  <span className="text-[10px] font-black tracking-wider uppercase bg-[#D8B448]/10 text-[#D8B448] px-2.5 py-1 rounded border border-[#D8B448]/20">
                    {isEn ? 'ON-SITE SUPERVISION' : 'إشراف ميداني متكامل'}
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-[#D8B448] text-start tracking-tight">
                  {isEn ? 'Shattabha Site Engineer Services' : 'مهندس شطبها: رفيقك الميداني الموثوق'}
                </h3>

                <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-semibold text-start">
                  {isEn 
                    ? 'Monitors implementation step-by-step, reviews materials and works, detects errors before they turn into additional costs, and documents each stage with photos and technical reports.'
                    : 'يتابع التنفيذ خطوة بخطوة، يراجع الخامات والأعمال، يكتشف الأخطاء قبل أن تتحول إلى تكاليف إضافية، ويوثق كل مرحلة بالصور والتقارير الفنية.'}
                </p>
              </div>

              {/* Minimalist Structured Specs Grid instead of large spacious list */}
              <div className="bg-slate-950/25 rounded-md border border-white/5 divide-y divide-white/5 overflow-hidden">
                <div className="p-3 flex items-center gap-3 transition-colors hover:bg-white/[0.02]">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-200 font-bold leading-normal text-start">
                    {isEn ? 'Inspecting electricity, plumbing, and insulation before sealing the works.' : 'فحص الكهرباء والسباكة والعزل قبل إغلاق الأعمال.'}
                  </span>
                </div>
                <div className="p-3 flex items-center gap-3 transition-colors hover:bg-white/[0.02]">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-200 font-bold leading-normal text-start">
                    {isEn ? 'Reviewing execution quality and alignment of walls, ceilings, and floors.' : 'مراجعة جودة التنفيذ واستقامة الجدران والأسقف والأرضيات.'}
                  </span>
                </div>
                <div className="p-3 flex items-center gap-3 transition-colors hover:bg-white/[0.02]">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-200 font-bold leading-normal text-start">
                    {isEn ? 'Ensuring materials comply with the agreed-upon technical specifications.' : 'التأكد من مطابقة الخامات للمواصفات المتفق عليها.'}
                  </span>
                </div>
                <div className="p-3 flex items-center gap-3 transition-colors hover:bg-white/[0.02]">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-200 font-bold leading-normal text-start">
                    {isEn ? 'Documenting execution progress with photos and reports within the platform.' : 'توثيق التنفيذ بالتقارير والصور داخل المنصة.'}
                  </span>
                </div>
                <div className="p-3 flex items-center gap-3 transition-colors hover:bg-white/[0.02]">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-200 font-bold leading-normal text-start">
                    {isEn ? 'Approving or rejecting stages before transitioning to the next phase.' : 'اعتماد أو رفض المراحل قبل الانتقال للمرحلة التالية.'}
                  </span>
                </div>
              </div>

              {/* Perfect result highlight to anchor the bottom section */}
              <div className="bg-[#D8B448]/10 border border-[#D8B448]/30 rounded-md p-3.5 flex items-start sm:items-center gap-3">
                <span className="text-lg shrink-0">💎</span>
                <div className="flex-1" dir={isEn ? 'ltr' : 'rtl'}>
                  <div className="flex items-center gap-1.5 justify-start mb-0.5">
                    <h4 className="font-black text-xs text-[#D8B448]">
                      {isEn ? 'The Value Result:' : 'النتيجة المضمونة:'}
                    </h4>
                  </div>
                  <p className="text-xs text-amber-200 font-extrabold leading-relaxed text-start">
                    {isEn 
                      ? 'Higher quality, fewer errors, and ultimate peace of mind throughout the finishing journey.' 
                      : 'جودة أعلى، أخطاء أقل، وراحة بال أكبر طوال رحلة التشطيب.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: COMPARISON DUAL WORKSPACE (التشطيب التقليدي والتشطيب الذكي) */}
      <section id="why-shatibha" className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#F4F6F9]/60 border-b border-[#2B4D89]/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16 space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-[#D8B448]/10 text-amber-800 text-[11px] sm:text-xs font-black px-5 py-1.5 rounded-full border border-[#D8B448]/20 shadow-3xs">
              ⚖️ {isEn ? 'Traditional vs Smart Finishing comparison' : 'مقارنة صريحة: التشطيب التقليدي والتشطيب الذكي'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B4D89] tracking-tight">
              {isEn ? HOME_COMPARISON.en.title : HOME_COMPARISON.ar.title}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm max-w-2xl mx-auto font-bold leading-relaxed">
              {isEn ? HOME_COMPARISON.en.subtitle : HOME_COMPARISON.ar.subtitle}
            </p>
          </div>

          <div className="bg-gradient-to-r from-[#1E3A68] to-[#2B4D89] rounded-[32px] p-6 md:p-10 text-white relative shadow-xl overflow-hidden border border-[#2B4D89]/25">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="text-center mb-8">
              <div className="inline-flex bg-slate-900/40 p-1.5 rounded-xl border border-white/10 gap-2">
                <button 
                  onClick={() => setCompareActiveTab('trad')}
                  className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${compareActiveTab === 'trad' ? 'bg-[#E54848] text-white shadow-md' : 'text-gray-300 hover:text-white'}`}
                >
                  ⚠️ {isEn ? 'Traditional Work' : 'التشطيب التقليدي المرهق'}
                </button>
                <button 
                  onClick={() => setCompareActiveTab('shatibha')}
                  className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${compareActiveTab === 'shatibha' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:text-white'}`}
                >
                  🛡️ {isEn ? 'With Shatibha Guard' : 'التشطيب المضمون مع شطبها'}
                </button>
              </div>
            </div>

            {/* Render comparative features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {((isEn ? HOME_COMPARISON.en.rows : HOME_COMPARISON.ar.rows) || []).map((row: any, idx: number) => {
                const title = row.item;
                const text = compareActiveTab === 'trad' ? row.trad : row.shatibha;
                return (
                  <div 
                    key={idx} 
                    className={`p-5 rounded-2xl border transition-all duration-300 ${
                      compareActiveTab === 'trad' 
                        ? 'bg-red-950/20 border-red-500/20 hover:border-red-500/50' 
                        : 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 justify-end">
                      <span className="font-extrabold text-sm">{title}</span>
                      <span className={`text-base ${compareActiveTab === 'trad' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {compareActiveTab === 'trad' ? '✕' : '✓'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed text-right font-semibold">
                      {text}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* NEW SECTION: TRIPARTITE BID SECURITY (أمان كامل لأطراف المناقصة) */}
      <section id="tender-security" className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#2B4D89]/10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-[#2B4D89]/5 text-[#2B4D89] text-[11px] sm:text-xs font-black px-5 py-1.5 rounded-full border border-[#2B4D89]/10 shadow-3xs">
              🛡️ {isEn ? 'Tripartite Platform Security' : 'أمان المنصة الثلاثي'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B4D89] tracking-tight">
              {isEn ? 'Complete Security for Bidding Parties' : 'أمان كامل لأطراف المناقصة'}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-bold">
              {isEn 
                ? 'Shattabha platform is not just a directory, but an integrated engineering, supervisory, and financial system that guarantees assigning your project to verified parties while safeguarding your money and using independent consultant inspection.' 
                : 'منصة شطبها ليست مجرد دليل، بل هي منظومة هندسية رقابية ومالية متكاملة تضمن إسناد مشروعك لجهات موثقة مع حفظ أموالك وتفتيش استشاري مستقل.'}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            
            {/* Card 1: Privacy / Hiding Info */}
            <div className="bg-[#F8FAFC] rounded-3xl p-8 border border-slate-200/80 hover:border-[#2B4D89]/35 hover:shadow-lg transition-all duration-300 flex flex-col justify-start items-center text-center space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform duration-300 shadow-3xs">
                <Phone className="w-7 h-7 text-pink-500" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#2B4D89] leading-tight">
                {isEn ? 'Anonymity & Contact Privacy' : 'حجب هويات وبيانات التواصل'}
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-extrabold mt-2">
                {isEn 
                  ? 'We prevent platform bypass or client disturbance with promotional phone calls and random offers from anonymous finishing companies. Your data remains safe, hidden, and only under your personal choice.' 
                  : 'نمنع تجاوز المنصة أو إزعاج العميل بمكالمات ترويجية هاتفية وعروض عشوائية من شركات تشطيب مجهولة. بياناتك تظل آمنة ومحجوبة وتبقى فقط رهن اختيارك الشخصي.'}
              </p>
            </div>

            {/* Card 2: Tripartite Legal Contract */}
            <div className="bg-[#F8FAFC] rounded-3xl p-8 border border-slate-200/80 hover:border-[#2B4D89]/35 hover:shadow-lg transition-all duration-300 flex flex-col justify-start items-center text-center space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#D8B448]/10 flex items-center justify-center text-[#D8B448] group-hover:scale-110 transition-transform duration-300 shadow-3xs">
                <FileText className="w-7 h-7 text-[#D8B448]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#2B4D89] leading-tight">
                {isEn ? 'Tripartite Contract Guarantees Your Legal Rights' : 'عقد ثلاثي يضمن حقوقك القانونية'}
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-extrabold mt-2">
                {isEn 
                  ? 'A tripartite legal formulation under the sponsorship and supervision of "Shattabha" guarantees execution stages and raw materials accounting according to the agreed price without any subsequent cost surprises.' 
                  : 'صياغة قانونية ثلاثية برعاية وإشراف "شطبها" تضمن مراحل التنفيذ ومحاسبة بنود الخامات وفقا للسعر المتفق عليه دون مفاجآت في التكاليف اللاحقة.'}
              </p>
            </div>

            {/* Card 3: Verified Contractors */}
            <div className="bg-[#F8FAFC] rounded-3xl p-8 border border-slate-200/80 hover:border-[#2B4D89]/35 hover:shadow-lg transition-all duration-300 flex flex-col justify-start items-center text-center space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300 shadow-3xs">
                <Building className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#2B4D89] leading-tight">
                {isEn ? 'Contractors Verified with Registration & Tax Files' : 'شركات مقاولات موثقة بالأوراق والملف الضريبي'}
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-extrabold mt-2">
                {isEn 
                  ? 'We only accept accredited legal establishments that possess a valid commercial register and commercial tax card to strictly eliminate random labor and non-serious companies.' 
                  : 'لا نقبل إلا المنشآت القانونية المعتمدة التي تملك سجل تجاري ساري وبطاقة ضريبية معلنة للتخلص وبصرامة من العمالة العشوائية والشركات غير الجادة.'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* NEW SECTION A: INTERACTIVE FINISHING PACKAGES & SMART CALCULATOR */}
      <section id="finishing-packages" className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#F4F6F9]/60 border-b border-[#2B4D89]/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16 space-y-3">
            <span className="inline-block bg-[#2B4D89]/10 text-[#2B4D89] text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
              ✨ {isEn ? 'Finishing Packages & Interactive Estimates' : 'باقات ومستويات التشطيب وحاسبة التكلفة'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#2B4D89]">
              {isEn ? 'Explore Certified Finishing Standards' : 'باقات وفئات التشطيب الفاخرة المعتمدة'}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm max-w-2xl mx-auto font-bold leading-relaxed">
              {isEn 
                ? 'Review material standards under the tripartite agreement. Use our digital calculator to personalize your estimate.' 
                : 'نوثّق بنود كل فئة بالمسامير والماركات ونوع الكوابل وعزل الرطوبة. استخدم الحاسبة المباشرة بالأسفل لتقدير ميزانية منزلك الحية.'}
            </p>
          </div>

          {/* 1. Dynamic Presets Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {HOME_PACKAGES.map((pkg) => {
              const isActiveInCalc = selectedPkgId === pkg.id;
              const priceMap: Record<string, number> = {
                'pkg-eco': 4500,
                'pkg-lux': 6500,
                'pkg-super': 9000,
                'pkg-premium': 13000
              };
              return (
                <div 
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`bg-white rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 cursor-pointer relative ${
                    isActiveInCalc 
                      ? 'border-[#D8B448] ring-2 ring-[#D8B448]/10' 
                      : 'border-gray-200/50 hover:border-gray-300'
                  }`}
                >
                  {isActiveInCalc && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D8B448] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
                      🎯 {isEn ? 'Active Selection' : 'محددة بالحاسبة'}
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-4">
                      <h3 className="font-extrabold text-sm text-[#2B4D89] text-right">
                        {isEn ? pkg.nameEn : pkg.nameAr}
                      </h3>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold block">{isEn ? 'Average Rate:' : 'متوسط سعر المتر:'}</span>
                      <span className="text-[#D8B448] text-lg sm:text-xl font-black">
                        {isEn ? pkg.priceEn : pkg.priceAr}
                      </span>
                    </div>

                    <ul className="space-y-2 text-[10.5px] font-bold text-gray-500 text-right py-2 border-t border-gray-100 mt-2">
                      {(isEn ? pkg.featuresEn : pkg.featuresAr).map((feat, i) => (
                        <li key={i} className="flex items-start gap-1.5 justify-end">
                          <span className="flex-1 leading-snug">{feat}</span>
                          <Check className="w-3.5 h-3.5 text-[#D8B448] shrink-0 mt-0.5" />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPkgId(pkg.id);
                      }}
                      className={`w-full py-2.5 rounded-xl text-[11px] font-black transition-all ${
                        isActiveInCalc 
                          ? 'bg-[#2B4D89] text-white' 
                          : 'bg-slate-50 text-[#2B4D89] border border-gray-150 hover:bg-slate-100'
                      }`}
                    >
                      {isActiveInCalc ? (isEn ? 'Calculating Live Output ✓' : 'جاري احتساب هذه الباقة ✓') : (isEn ? 'Calculate With This Tier' : 'احسب التكلفة بهذه الباقة')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Interactive Smart Cost Estimator */}
          <div className="bg-gradient-to-br from-[#1E3A68] to-[#122442] rounded-[32px] p-6 lg:p-10 text-white relative shadow-2xl overflow-hidden border border-white/5">
            <div className="absolute top-[-50px] left-[-50px] w-72 h-72 bg-[#D8B448]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-[#2B4D89]/30 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Left Column: Output metrics dashboard */}
              <div className="lg:col-span-5 bg-slate-900/45 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6 text-right" dir="rtl">
                <div className="border-b border-white/10 pb-4">
                  <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wide block">
                    📈 {isEn ? 'Live Estimated Budget Breakdown' : 'تقرير تكاليف الميزانية التقديرية الحية'}
                  </span>
                  <h4 className="text-sm font-black text-white mt-1">
                    {isEn ? 'Property Parameters Results:' : 'تفصيل ميزانيتك المقدرة:'}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9.5px] text-gray-400 font-bold block">مساحة العقار الحالية:</span>
                    <span className="text-xs sm:text-sm font-extrabold text-white">{calcArea} متر مربع</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9.5px] text-gray-400 font-bold block">فئة التشطيب المحددة:</span>
                    <span className="text-xs sm:text-sm font-extrabold text-amber-400">
                      {isEn 
                        ? HOME_PACKAGES.find(p => p.id === selectedPkgId)?.nameEn.replace('📋', '').replace('👷', '').replace('✨', '').replace('👑', '') 
                        : HOME_PACKAGES.find(p => p.id === selectedPkgId)?.nameAr.replace('📋', '').replace('👷', '').replace('✨', '').replace('👑', '')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-xs text-gray-350 font-bold block">التكلفة الإجمالية التقديرية للتشطيب كامل:</span>
                  <div className="flex items-baseline gap-1.5 justify-start">
                    <span className="text-[#D8B448] text-xl sm:text-2xl font-black">
                      {(calcArea * (selectedPkgId === 'pkg-eco' ? 4500 : selectedPkgId === 'pkg-lux' ? 6500 : selectedPkgId === 'pkg-super' ? 9000 : 13000)).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-300 font-extrabold">جنيه مصري</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-gray-400 font-bold block flex items-center justify-end gap-1">
                      حساب الضمان (دفعة ١ • ٢٠٪): <Coins className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                    <span className="text-white text-xs sm:text-sm font-black">
                      {((calcArea * (selectedPkgId === 'pkg-eco' ? 4500 : selectedPkgId === 'pkg-lux' ? 6500 : selectedPkgId === 'pkg-super' ? 9000 : 13000)) * 0.20).toLocaleString()} ج.م
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-gray-400 font-bold block flex items-center justify-end gap-1">
                      الزيارات الفنية والاستلام: <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                    <span className="text-white text-xs sm:text-sm font-black">
                      {Math.min(12, Math.max(4, Math.round(calcArea / 25)))} زيارات فحص هندسي ✓
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-gray-400 flex items-center gap-1.5 justify-end font-semibold">
                  <span>أرصدتك مؤمنة ومحفوظة بالكامل في نظام حماية الضمان ضد تبديد الكاش</span>
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
              </div>

              {/* Right Column: Interaction inputs and sliders */}
              <div className="lg:col-span-7 space-y-6 text-right">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#D8B448]">
                    {isEn ? 'Interactive Estimator' : 'احسب وقدر تكلفة التشطيب فورياً'}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed font-semibold mt-1">
                    {isEn 
                      ? 'Adjust your home space parameter slider and switch preset tiers to dynamically inspect pricing models.' 
                      : 'حدد المساحة بوحدتك بالمتر المربع ومستوى الباقة لتكشف تكلفة الاستحواذ على عروض معمارية دقيقة خالية من السماسرة.'}
                  </p>
                </div>

                {/* AREA SELECTOR (SLIDER & COMPUTE INPUT) */}
                <div className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between text-xs text-gray-300 font-black">
                    <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                      <input 
                        type="number"
                        min="50"
                        max="500"
                        value={calcArea}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            setCalcArea(Math.min(500, Math.max(50, val)));
                          }
                        }}
                        className="bg-transparent text-amber-300 w-14 font-black text-center focus:outline-none"
                      />
                      <span>{isEn ? 'sqm' : 'متر مربع'}</span>
                    </div>
                    <span>🏠 {isEn ? 'Property Area:' : 'مساحة منزلك أو شقتك بالمتر المربع:'}</span>
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

                  <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                    <span>٥٠٠ م²</span>
                    <span>٢٥٠ م²</span>
                    <span>٥٠ م²</span>
                  </div>
                </div>

                {/* LIVE PRESENTS CHANGER TAB BUTTONS */}
                <div className="space-y-2">
                  <span className="block text-xs font-black text-gray-300">💡 {isEn ? 'Choose Finishing Standard:' : 'اختر فئة التشطيب المعتمدة:'}</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/40 p-1.5 rounded-xl border border-white/5">
                    {HOME_PACKAGES.map((pkg) => {
                      const isChoose = selectedPkgId === pkg.id;
                      return (
                        <button 
                          key={pkg.id}
                          onClick={() => setSelectedPkgId(pkg.id)}
                          className={`p-2 rounded-lg text-[10.5px] font-black transition-all text-center ${
                            isChoose 
                              ? 'bg-[#D8B448] text-gray-900 shadow-md font-bold' 
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

                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-end">
                  <button 
                    onClick={() => setModalType('CLIENT')}
                    className="bg-[#D8B448] hover:bg-yellow-500 text-slate-950 font-black px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <span>🎯 {isEn ? 'Apply Package & Order Bids' : 'تطبيق الباقة وطرح طلبي للمناقصة مجاناً'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: HOW WE PROTECT YOUR MONEY (كيف نحمي أموالك؟) */}
      <section id="payment-shield" className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#2B4D89]/10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center mb-16 space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-800 text-[11px] sm:text-xs font-black px-5 py-1.5 rounded-full border border-emerald-500/20 shadow-3xs">
              💸 {isEn ? '💸 Unique Escrow Governance Flow' : '💸 كيف نحمي أموالك؟ نموذج الحوكمة الفريد'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B4D89] tracking-tight">
              {isEn ? 'How Shatibha Guards Your Finances' : 'مستقبل التشطيب الآمن: الميزانية المربوطة بالاستلام'}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm max-w-2xl mx-auto font-bold leading-relaxed">
              {isEn 
                ? 'We strictly enforce client-first escrow protection. Follow this four-stage secure channel that guarantees maximum accountability.' 
                : 'أموالك لا تذهب للمقاول مسبقاً كي تجري وراءه؛ بل تمر بدورة حوكمة رباعية مسبقة الاستلام تمنع النصب كلياً:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-right" dir={isEn ? 'ltr' : 'rtl'}>
            
            <div className="bg-[#F8FAFC] border border-slate-200/60 p-6 rounded-3xl relative shadow-xs hover:shadow-md hover:border-[#D8B448]/45 transition-all duration-300 group">
              <span className="absolute -top-4 right-6 w-9 h-9 bg-[#2B4D89] text-white flex items-center justify-center rounded-full text-xs font-black border-4 border-white shadow-sm">
                ١
              </span>
              <div className="mt-2 space-y-2">
                <h4 className="font-extrabold text-sm text-[#2B4D89]">{isEn ? '1. Completion Notice' : '١. طلب استلام مرحلة'}</h4>
                <p className="text-gray-500 text-[11px] sm:text-xs leading-relaxed font-bold">
                  {isEn ? 'The contractor files a handover request on their dashboard after completing a stage.' : 'يقوم المقاول برفع إقرار بانتهاء مرحلة معينة (مثل تأسيس شبكة الكهرباء بالكامل) ويطلب الاستلام.'}
                </p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200/60 p-6 rounded-3xl relative shadow-xs hover:shadow-md hover:border-[#D8B448]/45 transition-all duration-300 group animate-fade-in">
              <span className="absolute -top-4 right-6 w-9 h-9 bg-[#D8B448] text-white flex items-center justify-center rounded-full text-xs font-black border-4 border-white shadow-sm">
                ٢
              </span>
              <div className="mt-2 space-y-2">
                <h4 className="font-extrabold text-sm text-[#2B4D89]">{isEn ? '2. Inspector Visit' : '٢. معاينة المشرف الميداني'}</h4>
                <p className="text-gray-500 text-[11px] sm:text-xs leading-relaxed font-bold">
                  {isEn ? 'An independent certified Shatibha engineer visits your unit on-site to verify standards.' : 'ينزل مهندس استشاري ومفتش فني متخصص من شطبها إلى موقع وحدتك لإجراء فحص شامل للمرحلة بالمللي.'}
                </p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200/60 p-6 rounded-3xl relative shadow-xs hover:shadow-md hover:border-[#D8B448]/45 transition-all duration-300 group">
              <span className="absolute -top-4 right-6 w-9 h-9 bg-[#2B4D89] text-white flex items-center justify-center rounded-full text-xs font-black border-4 border-white shadow-sm">
                ٣
              </span>
              <div className="mt-2 space-y-2">
                <h4 className="font-extrabold text-sm text-[#2B4D89]">{isEn ? '3. Certified Reports' : '٣. تقرير الاعتماد والصور'}</h4>
                <p className="text-gray-500 text-[11px] sm:text-xs leading-relaxed font-bold">
                  {isEn ? 'The engineer issues a detailed quality report with clear photo documentation to your panel.' : 'يرفع المهندس تقريراً هندسياً بصور عالية الدقة وتوثيق حي للمطابقة مع مواصفات أصول الصناعة وبنود العقد.'}
                </p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200/60 p-6 rounded-3xl relative shadow-xs hover:shadow-md hover:border-[#D8B448]/45 transition-all duration-300 group">
              <span className="absolute -top-4 right-6 w-9 h-9 bg-emerald-600 text-white flex items-center justify-center rounded-full text-xs font-black border-4 border-white shadow-sm">
                ٤
              </span>
              <div className="mt-2 space-y-2">
                <h4 className="font-extrabold text-sm text-emerald-700">{isEn ? '4. Secured Payout Release' : '٤. الإفراج عن الدفعة ماليًا'}</h4>
                <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed font-bold">
                  {isEn ? 'Fulfilling quality parameters unlocks the segment from escrow directly to the contractor.' : 'بمجرد موافقتك واطمئنانك للتقرير الفني، يتم تحرير دفعة المرحلة الآمنة مباشرة لرصيد المقاول ليستكمل المرحلة التالية.'}
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>



      {/* NEW SECTION B: STATS & PROOF BENCHMARKS (مؤشرات الثقة وحقائق المعاينة الميدانية) */}
      <section id="trust-metrics" className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#192f52] to-[#2B4D89] text-white overflow-hidden border-b border-[#2B4D89]/10">
        <div className="max-w-7xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-[10px] sm:text-xs text-[#D8B448] font-black uppercase tracking-widest block font-sans">
              🛡️ {isEn ? 'Platform Integrity Index' : 'مؤشرات أمان وحوكمة التشطيب'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {isEn ? 'Shatibha Security Benchmarks' : 'أرقام وحقائق الضمان الشامل لمالك العقار'}
            </h3>
            <p className="text-gray-300 text-xs font-semibold leading-relaxed">
              {isEn 
                ? 'Trusted engineering networks enforcing double-blind transparency and escrow limits across Egypt.' 
                : 'نمنع المشاكل النمطية ومظاهر النصب بخلق جدار حوكمة مزدوج الأطراف يضمن لك الجودة والخصوصية:'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 hover:border-[#D8B448] hover:bg-white/8 transition-all duration-300 text-center">
              <span className="text-2xl block text-[#D8B448]">🏠</span>
              <h4 className="text-lg sm:text-xl font-extrabold text-[#D8B448]">٣٠٠+</h4>
              <p className="text-[10px] text-gray-200 font-bold">{isEn ? 'Completed Units' : 'شقة ووحدة مستلمة'}</p>
              <p className="text-[9px] text-gray-400 font-semibold">{isEn ? 'Under Site Audit' : 'بفحص وإقرارات معتمدة'}</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 hover:border-[#D8B448] hover:bg-white/8 transition-all duration-300 text-center">
              <span className="text-2xl block text-[#D8B448]">👷</span>
              <h4 className="text-lg sm:text-xl font-extrabold text-[#D8B448]">٢٠+</h4>
              <p className="text-[10px] text-gray-200 font-bold">{isEn ? 'Civil Site Inspectors' : 'مهندس فحص ميداني'}</p>
              <p className="text-[9px] text-gray-400 font-semibold">{isEn ? 'For Code Approvals' : 'لاستلام مطابقة الكود'}</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 hover:border-[#D8B448] hover:bg-white/8 transition-all duration-300 text-center">
              <span className="text-2xl block text-[#D8B448]">🏢</span>
              <h4 className="text-lg sm:text-xl font-extrabold text-[#D8B448]">١٢+</h4>
              <p className="text-[10px] text-gray-200 font-bold">{isEn ? 'Verified Studios' : 'أوديو وشركة مسجلة'}</p>
              <p className="text-[9px] text-gray-400 font-semibold">{isEn ? '100% Vetted Papers' : 'بسجلات تجارية سارية'}</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 hover:border-[#D8B448] hover:bg-white/8 transition-all duration-300 text-center">
              <span className="text-2xl block text-[#D8B448]">🛡️</span>
              <h4 className="text-lg sm:text-xl font-extrabold text-[#D8B448]">٠٪</h4>
              <p className="text-[10px] text-gray-200 font-bold">{isEn ? 'Financial Fraud' : 'مخاطر النصب والهروب'}</p>
              <p className="text-[9px] text-gray-400 font-semibold">{isEn ? 'Meticulous Escrow' : 'لحفظ دفعات حساب الضمان'}</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 hover:border-[#D8B448] hover:bg-white/8 transition-all duration-300 text-center col-span-2 md:col-span-1">
              <span className="text-2xl block text-[#D8B448]">🔒</span>
              <h4 className="text-lg sm:text-xl font-extrabold text-[#D8B448]">١٠٠٪</h4>
              <p className="text-[10px] text-gray-200 font-bold">{isEn ? 'Private Identity' : 'حظر إظهار أرقام هاتف'}</p>
              <p className="text-[9px] text-gray-400 font-semibold">{isEn ? 'No Broker Spamming' : 'تمنع تماماً إزعاج السماسرة'}</p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 1: FEATURED PROJECTS (مشاريع حية جرى تفقدها وتسليمها) */}
      <section id="featured-projects" className="py-10 px-4 sm:px-8 bg-slate-50 border-b border-gray-150">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16 space-y-3">
            <span className="inline-block bg-[#2B4D89]/10 text-[#2B4D89] text-[11px] font-black px-4 py-1 rounded-full">
              {isEn ? 'Portfolio Showcase' : 'سابقة أعمال مميزة'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#2B4D89]">
              {isEn ? 'Featured Projects Executed in Egypt' : 'مشاريع حية جرى تفقدها وتسليمها'}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm max-w-2xl mx-auto font-bold leading-relaxed">
              {isEn 
                ? 'Check out some physical success stories engineered under Shatibhas strict inspection routines.' 
                : 'معرض تفاعلي لمشاريع حقيقية بمصر نالت ختم الجودة الفنية والاستلام الميداني المعتمد خطوة بخطوة:'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Gallery Image Display */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative h-80 sm:h-96 rounded-[28px] overflow-hidden shadow-md group border border-gray-100">
                <img 
                  src={HOME_FEATURED_PROJECTS[activeFeaturedProject].images[activePhotoIndex]} 
                  alt="Featured design" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-5 right-5 text-white pr-2 border-r-2 border-[#D8B448]">
                  <p className="text-[11px] font-bold text-[#D8B448]">{isEn ? 'Site inspected & Approved' : 'تم مراجعة مواصفات الفحص الفني ✓'}</p>
                  <p className="text-xs font-semibold text-gray-200 mt-0.5">
                    {isEn ? HOME_FEATURED_PROJECTS[activeFeaturedProject].locationEn : HOME_FEATURED_PROJECTS[activeFeaturedProject].locationAr}
                  </p>
                </div>
              </div>

              {/* Thumbnails row */}
              <div className="grid grid-cols-3 gap-3">
                {HOME_FEATURED_PROJECTS[activeFeaturedProject].images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActivePhotoIndex(i)}
                    className={`h-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all ${activePhotoIndex === i ? 'border-[#2B4D89] scale-[0.98]' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Project Parameters Side Card */}
            <div className="lg:col-span-5 space-y-6 text-right">
              
              {/* Tabs buttons to switch projects */}
              <div className="flex flex-wrap gap-2 mb-2 bg-slate-100 p-1.5 rounded-xl justify-end">
                {HOME_FEATURED_PROJECTS.map((proj, idx) => (
                  <button 
                    key={proj.id}
                    onClick={() => setActiveFeaturedProject(idx)}
                    className={`px-3 py-2 text-[10.5px] font-black rounded-lg transition-all ${activeFeaturedProject === idx ? 'bg-white text-[#2B4D89] shadow-sm' : 'text-gray-500 hover:text-slate-800'}`}
                  >
                    {isEn ? proj.nameEn.split('-')[0] : proj.nameAr.split('-')[0]}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-[#2B4D89]">
                  {isEn ? HOME_FEATURED_PROJECTS[activeFeaturedProject].nameEn : HOME_FEATURED_PROJECTS[activeFeaturedProject].nameAr}
                </h3>
                <div className="flex flex-wrap items-center gap-4 justify-end text-xs font-bold text-gray-500 mt-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {isEn ? HOME_FEATURED_PROJECTS[activeFeaturedProject].locationEn : HOME_FEATURED_PROJECTS[activeFeaturedProject].locationAr}</span>
                  <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {isEn ? HOME_FEATURED_PROJECTS[activeFeaturedProject].areaEn : HOME_FEATURED_PROJECTS[activeFeaturedProject].areaAr}</span>
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-[#D8B448]" /> {isEn ? HOME_FEATURED_PROJECTS[activeFeaturedProject].levelEn : HOME_FEATURED_PROJECTS[activeFeaturedProject].levelAr}</span>
                </div>
              </div>

              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-semibold">
                {isEn ? HOME_FEATURED_PROJECTS[activeFeaturedProject].descEn : HOME_FEATURED_PROJECTS[activeFeaturedProject].descAr}
              </p>

              {/* Verified badges details */}
              <div className="bg-white border border-gray-150 p-4 rounded-xl space-y-2 text-xs font-bold text-[#2B4D89]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-extrabold">{isEn ? 'Elsewedy cables authenticated' : 'كابلات السويدي الأصلية النحاسية'}</span>
                  <span className="text-[#D8B448] font-black">✓ تأسيس الكهرباء معتمد</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-extrabold">{isEn ? 'Sika waterproof isolation certificate' : 'عزل مائي بالبيتومين بضمان سيكا'}</span>
                  <span className="text-[#D8B448] font-black">✓ فحص العزل معتمد</span>
                </div>
              </div>

              <button 
                onClick={() => setModalType('CLIENT')}
                className="bg-[#2B4D89] text-white hover:bg-[#1E3A68] px-6 py-3 rounded-xl font-bold text-xs"
              >
                {isEn ? 'Get Similar Quotes' : 'اطلب تسعير مماثل لوحدتك'}
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* SECTION: CUSTOMER TESTIMONIALS - HIGHLY POLISHED SPLIT LAYOUT */}
      <section id="testimonials-stats" className="py-14 bg-white border-b border-gray-150 relative">
        {/* Subtle decorative background lights */}
        <div className="absolute top-10 left-10 w-48 h-48 bg-[#2B4D89]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#D8B448]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10 px-4 sm:px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Context & Overall Trust Score */}
            <div className={`col-span-1 lg:col-span-5 space-y-6 ${isEn ? 'text-left' : 'text-right'}`}>
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-[#2B4D89]/5 text-[#2B4D89] text-[10px] uppercase tracking-wide font-black px-3 py-1.5 rounded-full border border-[#2B4D89]/10">
                  <Sparkles className="w-3 h-3 text-[#D8B448]" />
                  <span>{isEn ? 'Customer Success' : 'آراء وقصص النجاح'}</span>
                </div>
                
                <h2 className="text-xl sm:text-3xl font-black text-[#2B4D89] leading-tight">
                  {isEn ? 'What Do They Say About Shattabha?' : 'ماذا يقولون عن شطبها؟'}
                </h2>
                
                <p className="text-gray-500 text-xs sm:text-[13px] leading-relaxed font-bold">
                  {isEn 
                    ? 'Read genuine evaluation logs submitted by real apartment, villa, and office owners across Egypt.' 
                    : 'تقييمات واقعية لمالكي وحدات في مصر، تعكس جودة التشطيب والتزام المقاولين وعقود حماية حسابات الضمان.'}
                </p>
              </div>

              {/* Minimalist Trust Badge Card */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl sm:text-4xl font-black text-[#2B4D89]">4.9</span>
                  <div>
                    <div className="flex items-center gap-0.5 text-amber-500 mb-1">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-[10.5px] text-slate-500 font-extrabold">
                      {isEn ? 'Based on +350 audits' : 'استناداً لأكثر من 350 عملية تسليم هندسية مبرمة'}
                    </p>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-200 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                    <p className="text-xs font-black text-emerald-700 block">100%</p>
                    <p className="text-[9.5px] font-black text-slate-500 mt-0.5">{isEn ? 'Certified Audit' : 'مطابق للمواصفات'}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                    <p className="text-xs font-black text-[#D8B448] block">0%</p>
                    <p className="text-[9.5px] font-black text-slate-500 mt-0.5">{isEn ? 'Spam broker calls' : 'اتصالات عشوائية'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sleek Interactive Testimonial Slider Card (Clean, Spaced & Uncluttered) */}
            <div className="col-span-1 lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-300 relative group">
                
                {/* Tiny refined quote watermark inside top corner */}
                <span className="absolute top-4 left-6 text-slate-100 font-serif text-6xl select-none leading-none pointer-events-none">
                  ”
                </span>

                {/* Header of review: Verified badge */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 relative z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black">
                    <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                    {isEn ? 'Verified Evaluation Record' : 'تقرير تقييم وتسليم موثق'}
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: HOME_TESTIMONIALS[currentTestimonialIndex].rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Testimonial Core Body */}
                <div className="py-6 min-h-[130px] flex flex-col justify-center relative z-10">
                  <p className={`text-slate-600 text-xs sm:text-[13px] font-extrabold leading-relaxed ${isEn ? 'text-left' : 'text-right'}`}>
                    "{isEn ? HOME_TESTIMONIALS[currentTestimonialIndex].textEn : HOME_TESTIMONIALS[currentTestimonialIndex].textAr}"
                  </p>
                </div>

                {/* Testimonial Active User Details & Slider Nav Row */}
                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 gap-4 relative z-10">
                  
                  {/* Profile info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2B4D89] to-[#1E3A68] text-white flex items-center justify-center text-xs sm:text-sm font-black border border-white shadow-xs shrink-0">
                      <span>{HOME_TESTIMONIALS[currentTestimonialIndex].initial}</span>
                    </div>
                    <div className={`${isEn ? 'text-left' : 'text-right'}`}>
                      <h4 className="text-xs sm:text-[13px] font-black text-[#2B4D89]">
                        {isEn ? HOME_TESTIMONIALS[currentTestimonialIndex].nameEn : HOME_TESTIMONIALS[currentTestimonialIndex].nameAr}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-extrabold mt-0.5">
                        {isEn ? HOME_TESTIMONIALS[currentTestimonialIndex].locationEn : HOME_TESTIMONIALS[currentTestimonialIndex].locationAr}
                      </p>
                    </div>
                  </div>

                  {/* Compact Slide Controls (Simple & Professional) */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-bold font-sans select-none tracking-wider">
                      {(currentTestimonialIndex + 1).toString().padStart(2, '0')} / {HOME_TESTIMONIALS.length.toString().padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setCurrentTestimonialIndex((prev) => (prev - 1 + HOME_TESTIMONIALS.length) % HOME_TESTIMONIALS.length)}
                        className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 hover:border-[#2B4D89] hover:bg-slate-50 hover:text-[#2B4D89] bg-white transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                        title={isEn ? "Previous" : "السابق"}
                      >
                        {isEn ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => setCurrentTestimonialIndex((prev) => (prev + 1) % HOME_TESTIMONIALS.length)}
                        className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 hover:border-[#2B4D89] hover:bg-slate-50 hover:text-[#2B4D89] bg-white transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                        title={isEn ? "Next" : "التالي"}
                      >
                        {isEn ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Dynamic Highlight Stats Strip (Blue background bottom banner) */}
        <div className="w-full bg-[#2B4D89] text-white py-10 mt-16 shadow-inner border-t border-b border-[#203a6a]">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 items-center justify-items-center text-center">
            
            {/* Stat 1 */}
            <div className="space-y-1.5 flex flex-col items-center justify-center w-full">
              <h3 className="text-2xl sm:text-3xl font-black text-[#D8B448] tracking-tight">
                {isEn ? '+150' : '+150'}
              </h3>
              <p className="text-xs sm:text-[13px] font-extrabold text-white/90">
                {isEn ? 'Professional finishing companies & certified contractors' : 'شركة تشطيب فنية ومقاول مرخص'}
              </p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-1.5 flex flex-col items-center justify-center w-full md:border-r md:border-l md:border-white/10 px-4">
              <h3 className="text-2xl sm:text-3xl font-black text-[#D8B448] tracking-tight">
                {isEn ? '1,200+' : '1,200+'}
              </h3>
              <p className="text-xs sm:text-[13px] font-extrabold text-white/90">
                {isEn ? 'Completed price quotes across governorates' : 'طلب أسعار مكتمل في مختلف المحافظات'}
              </p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-1.5 flex flex-col items-center justify-center w-full">
              <h3 className="text-2xl sm:text-3xl font-black text-[#D8B448] tracking-tight">
                {isEn ? '500+' : '500+'}
              </h3>
              <p className="text-xs sm:text-[13px] font-extrabold text-white/90">
                {isEn ? 'Clients who trusted our platform & contracted' : 'عميل وثق مشاريع تشطيبه وبدأ التعاقد'}
              </p>
            </div>

          </div>
        </div>
      </section>
      </>
      )}

      {/* NEW SECTION: ABOUT US & SERVICE CHARTER (من نحن وميثاق الخدمة) */}
      <section id="about-us" className="py-10 px-4 sm:px-8 bg-slate-50/50 border-b border-gray-150">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Right Column: Platform Intro, Mission, and Key Features (lg:col-span-7) */}
            <div className={`space-y-6 lg:col-span-7 ${isEn ? 'text-left' : 'text-right'}`}>
              
              {/* Little Pill Badge */}
              <div className="inline-block">
                <span className="bg-white text-[#2B4D89] text-[11px] font-black px-5 py-1.5 rounded-full border border-[#2B4D89]/20 shadow-2xs">
                  {isEn ? 'Who We Are' : 'من نحن'}
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl sm:text-3.5xl font-black text-[#2B4D89] leading-tight tracking-tight">
                {isEn 
                  ? 'Shattabha Platform, the Engineering & Supervisory Team, and Service Charter' 
                  : 'منصة شطبها وفريق العمل الهندسي والرقابي وميثاق الخدمة'}
              </h2>

              {/* Description Paragraph */}
              <p className="text-gray-600 text-[12.5px] sm:text-sm leading-relaxed font-semibold">
                {isEn 
                  ? 'Shattabha was founded by a specialized elite of consultant engineers, construction & contracting experts, and project management professionals in Egypt, with a clear vision to bridge the gap, deliver absolute security, and safeguard the privacy of residential and commercial property owners from unverified brokers and companies. Shattabha employs an independent on-site team of site inspectors who inspect and verify finishing stages to guarantee the highest level of craftsmanship and protect your budget.' 
                  : 'تأسست منصة شطبها على يد نخبة متخصصة من كبار المهندسين الاستشاريين وخبراء التشييد والمقاولات وإدارة المشاريع بمصر، برؤية واضحة تهدف لسد الفجوة وبناء الأمان المطلق وحفظ خصوصية مالكي الوحدات السكنية والإدارية من بطش السماسرة والشركات مجهولة الاسم. يعمل في شطبها طاقم ميداني من المهندسين المستقلين (Site Inspectors) الذين يقومون باستلام مراحل التشطيب بالتفتيش ومطابقة المواصفات لضمان أعلى درجات الإتقان وحفظ ميزانيتك.'}
              </p>

              {/* Sub features list row (Pills/Mini-cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                
                {/* Mini Card 1: Strict Codes */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-3xs flex items-center gap-4 hover:border-[#2B4D89]/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-[#2B4D89]/5 flex items-center justify-center text-[#2B4D89] shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-[13px] font-black text-[#2B4D89]">
                      {isEn ? 'Strict Engineering Codes' : 'أكواد هندسية صارمة'}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold leading-normal">
                      {isEn ? 'Material auditing & site code matching' : 'مراجعة خامات ومطابقة الكود الميداني'}
                    </p>
                  </div>
                </div>

                {/* Mini Card 2: Support & Solutions */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-3xs flex items-center gap-4 hover:border-[#2B4D89]/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-[13px] font-black text-[#2B4D89]">
                      {isEn ? 'Instant Technical Support & Solutions' : 'دعم وحلول فنية فورية'}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold leading-normal">
                      {isEn ? 'Fast follow-up to establish safety & transparency' : 'متابعة وتدخل سريع لإقرار السلامة والشفافية'}
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Left Column: Dark Blue Card of Principles & Goals (lg:col-span-5) */}
            <div className="lg:col-span-1" /> {/* Spacer column for alignment layout */}
            
            <div className="lg:col-span-4 lg:w-full">
              <div className="bg-[#1E3254] rounded-[32px] p-8 sm:p-9 text-white shadow-xl border border-slate-700 relative overflow-hidden flex flex-col justify-between">
                
                {/* Subtle visual decoration or glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
                
                <div className="space-y-6 relative z-10">
                  
                  {/* Underlined/Styled Section Title */}
                  <h3 className="text-sm sm:text-base font-black text-[#D8B448] tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
                    <span>{isEn ? 'Principles & Goals of Shattabha Team:' : 'مبادئ وأهداف فريق شطبها:'}</span>
                  </h3>

                  {/* Bullet List */}
                  <div className="space-y-6">
                    
                    {/* Bullet 1 */}
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1 text-right">
                        <h4 className="text-xs sm:text-[13.5px] font-black text-[#D8B448] leading-tight">
                          {isEn ? 'Absolute Neutrality & Objectivity:' : 'الحياد والموضوعية التامة:'}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-white/80 leading-relaxed font-bold">
                          {isEn 
                            ? 'The site inspector is an independent referee to certify quality outputs and maintain financial justice.' 
                            : 'المشرف الميداني حكم هندسي مستقل لضمان مخرجات الجودة والأمان المالي.'}
                        </p>
                      </div>
                    </div>

                    {/* Bullet 2 */}
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1 text-right">
                        <h4 className="text-xs sm:text-[13.5px] font-black text-[#D8B448] leading-tight">
                          {isEn ? 'Safe Escrow & Milestone Payments:' : 'إيداع وحفظ مستحقات آمن:'}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-white/80 leading-relaxed font-bold">
                          {isEn 
                            ? 'Securing your payments and ensuring builder milestones are only released conditional on your direct approval and consultant certification.' 
                            : 'تأمين أموالك وضمان دفعات المقاول رهن باعتمادك وبطوع تقرير الاستشاري.'}
                        </p>
                      </div>
                    </div>

                    {/* Bullet 3 */}
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1 text-right">
                        <h4 className="text-xs sm:text-[13.5px] font-black text-[#D8B448] leading-tight">
                          {isEn ? '100% Protected Phone Number:' : 'رقم هاتف محمي 100%:'}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-white/80 leading-relaxed font-bold">
                          {isEn 
                            ? 'Banning the generation of visual numbers to bypass annoying broker phone calls before your final choice.' 
                            : 'حظر إنشاء أي أرقام هواتف لتجنب مكالمات السماسرة المزعجين قبل الاختيار.'}
                        </p>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: REDESIGNED FREQUENTLY ASKED QUESTIONS (الأسئلة الشائعة - تصميم احترافي وجديد) */}
      <section id="faq" className="py-10 px-4 sm:px-8 bg-white border-b border-gray-150">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16 space-y-3">
            <span className="inline-block bg-[#264273]/10 text-[#2B4D89] text-[11px] font-black px-4 py-1 rounded-full">
              {isEn ? 'Information & Technical Desk' : 'تفاصيل فنية معتمدة'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#2B4D89]">
              {isEn ? 'Frequently Asked Questions' : 'كل ما تود معرفته عن منصة شطبها'}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm max-w-2xl mx-auto font-bold leading-relaxed">
              {isEn 
                ? 'Search through questions solved by our core consulting engineers or browse by topic.' 
                : 'دليلك المالي والهندسي لفهم الحقوق والواجبات والمواصفات التي تمنحك تشطيباً بدون مخاطر:'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left sidebar card with Help Info & Search bar */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-gradient-to-br from-[#1E3A68] to-[#2B4D89] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden" dir="rtl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">💡</div>
                <h3 className="text-lg font-black text-[#D8B448]">مركز الدعم والاستفسارات الجارية</h3>
                <p className="text-xs text-gray-250 leading-relaxed font-semibold">
                  اكتب أي كلمة مفتاحية (مثل "الضمان" أو "سلك" أو "عزل") وسوف نقوم بتصفية قائمة الأسئلة فوراً لمساعدتك في العثور على الإجابة الهندسية.
                </p>

                {/* SEARCH INPUT BAR */}
                <div className="relative pt-2">
                  <Search className="absolute right-3.5 top-5.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="ابحث في الأسئلة الشائعة..." 
                    value={faqSearch}
                    onChange={e => setFaqSearch(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-white text-slate-800 placeholder-gray-400 border border-transparent rounded-xl text-xs sm:text-sm font-bold text-right outline-none focus:ring-2 focus:ring-[#D8B448] transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 md:mt-0 space-y-3">
                <p className="text-[10px] text-gray-300 font-bold">لم تجد إجابة لسؤالك؟ تواصل معنا فوراً على خدمة الدعم المباشر المهندسين:</p>
                <div className="flex gap-2">
                  <a 
                    href="https://wa.me/201012345678" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-[10px] font-black text-center transition-all block shadow-sm border border-emerald-500/30"
                  >
                    💬 واتساب المهندسين
                  </a>
                  <button 
                    onClick={() => setModalType('CLIENT')}
                    className="flex-1 bg-[#D8B448] hover:bg-yellow-500 text-gray-900 py-2 rounded-xl text-[10px] font-black text-center transition-all shadow-sm"
                  >
                    📝 اطلب الاستشارة
                  </button>
                </div>
              </div>
            </div>

            {/* Right side interactive accordion list */}
            <div className="lg:col-span-8 space-y-4">
              {filteredFaqs.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 border border-gray-150 rounded-2xl flex flex-col items-center justify-center space-y-2">
                  <HelpCircle className="w-10 h-10 text-gray-400 animate-bounce" />
                  <p className="text-gray-500 text-xs sm:text-sm font-black">لا توجد نتائج تطابق بحثك الكلمي</p>
                  <p className="text-gray-400 text-[11px] font-semibold">جرب كتابة عبارات أخرى، أو راسلنا بالدعم المباشر</p>
                </div>
              ) : (
                filteredFaqs.map((faq, index) => {
                  const isOpen = faqOpenIndex === index;
                  return (
                    <div 
                      key={index} 
                      className={`group bg-white border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${
                        isOpen 
                          ? 'border-[#2B4D89] ring-1 ring-[#2B4D89]/10 border-r-4 border-r-[#D8B448]' 
                          : 'border-slate-100 hover:border-gray-200'
                      }`}
                    >
                      <button 
                        onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                        className="w-full p-4.5 sm:p-5 flex items-center justify-between text-right font-extrabold text-[#2B4D89] transition-colors focus:bg-slate-50/50"
                      >
                        {/* Plus / Minus indicator button inside interactive accordion */}
                        <span className={`w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center border border-gray-100 text-xs text-amber-600 transition-all duration-300 font-bold ${isOpen ? 'rotate-180 bg-amber-50' : 'rotate-0'}`}>
                          {isOpen ? '−' : '＋'}
                        </span>
                        
                        <span className="text-right flex-1 pr-4 text-xs sm:text-sm font-extrabold text-neutral-800 leading-snug">
                          {isEn ? faq.qEn : faq.qAr}
                        </span>
                      </button>
                      
                      <div 
                        className={`transition-all duration-350 ease-in-out ${
                          isOpen ? 'max-h-96 opacity-100 border-t border-slate-50' : 'max-h-0 opacity-0 overflow-hidden'
                        }`}
                      >
                        <div className="px-5 pb-5 pt-3.5 text-gray-600 text-xs sm:text-sm leading-relaxed bg-white font-medium text-right shadow-inner">
                          {isEn ? faq.aEn : faq.aAr}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      </section>

      {/* NEW SECTION: CONTACT & INQUIRY FORM (اتصل بنا) */}
      <section id="contact-us" className="py-10 px-4 sm:px-8 bg-slate-50/70 border-b border-gray-150">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="inline-block bg-[#D8B448] text-slate-900 text-[11px] font-black px-6 py-1.5 rounded-full shadow-2xs uppercase tracking-wider">
              {isEn ? 'Contact Us' : 'اتصل بنا'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2B4D89] tracking-tight">
              {isEn ? 'Have any questions? Send us an instant message & we will get in touch' : 'لديك أي استفسار؟ أرسل لنا رسالة فورية وسنتواصل معك'}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-bold">
              {isEn 
                ? 'Register your email, phone, and message, and one of Shattabha\'s core engineers will contact you immediately to provide free support and solutions.' 
                : 'سجل بريدك وهاتفك ورسالتك وسيتصل بك أحد مهندسي شطبها فوراً لتقديم الدعم والحلول مجاناً.'}
            </p>
          </div>

          {/* Two Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* RIGHT COLUMN in Arabic/RTL (Channels Card) - Columns: lg:col-span-12 -> lg:col-span-5 */}
            <div className="lg:col-span-5 bg-white rounded-[32px] p-6 sm:p-8 border border-slate-200/60 shadow-sm flex flex-col justify-between">
              
              <div className="space-y-6">
                {/* Channels Badge Row */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 text-xs">
                  <span className="text-gray-400 font-bold">
                    {isEn ? 'Response Center' : 'مركز الاستجابة'}
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isEn ? 'Our Channels Active & Verified' : 'قنواتنا نشطة وموثقة'}</span>
                  </div>
                </div>

                {/* Title & description */}
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-black text-[#2B4D89]">
                    {isEn ? 'Official Communication Channels' : 'قنوات التواصل الرسمية'}
                  </h3>
                  <p className="text-xs text-gray-500 font-extrabold leading-relaxed">
                    {isEn 
                      ? 'Contact us directly for site inspections, or join our community on Facebook and Instagram to receive direct decor material and item price updates.' 
                      : 'تواصل معنا مباشرة للمعاينة، أو انضم لأسرتنا على فيسبوك وإنستجرام لتصلك تحديثات أسعار مواد وبنود الديكور أولاً بأول.'}
                  </p>
                </div>

                {/* The 3 interactive channel boxes */}
                <div className="space-y-3">
                  
                  {/* Channel 1: Facebook */}
                  <a 
                    href="https://facebook.com/shattabha" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    dir={isEn ? "ltr" : "rtl"}
                    className="flex items-center gap-3.5 p-4 bg-white border border-slate-200 rounded-2xl hover:border-[#2B4D89] hover:shadow-2xs transition-all duration-300 group"
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2B4D89] shrink-0 group-hover:scale-110 transition-transform">
                      <Facebook className="w-5 h-5" />
                    </div>

                    {/* Text Container */}
                    <div className="flex-1 min-w-0 space-y-0.5 text-right ltr:text-left">
                      <div className="flex items-center gap-1.5 flex-wrap justify-start">
                        <span className="text-xs font-black text-[#2B4D89]">
                          {isEn ? 'Our Official Facebook Page' : 'صفحتنا الرسمية على فيسبوك'}
                        </span>
                        <span className="text-blue-500 text-[10px]" title="موثق">✓</span>
                      </div>
                      <div className="text-[11px] text-gray-400 font-bold truncate">
                        facebook.com/shattabha
                      </div>
                    </div>

                    {/* Chevron */}
                    <div className="text-slate-400 group-hover:text-[#2B4D89] transition-all shrink-0">
                      <ChevronLeft className={`w-4 h-4 transition-transform ${isEn ? 'rotate-180' : ''}`} />
                    </div>
                  </a>

                  {/* Channel 2: Instagram */}
                  <a 
                    href="https://instagram.com/shattabha" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    dir={isEn ? "ltr" : "rtl"}
                    className="flex items-center gap-3.5 p-4 bg-white border border-slate-200 rounded-2xl hover:border-[#2B4D89] hover:shadow-2xs transition-all duration-300 group"
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 shrink-0 group-hover:scale-110 transition-transform">
                      <Instagram className="w-5 h-5" />
                    </div>

                    {/* Text Container */}
                    <div className="flex-1 min-w-0 space-y-0.5 text-right ltr:text-left">
                      <div className="flex items-center gap-1.5 flex-wrap justify-start">
                        <span className="text-xs font-black text-[#2B4D89]">
                          {isEn ? 'Our Official Instagram Account' : 'حسابنا الرسمي على إنستجرام'}
                        </span>
                        <span className="bg-pink-50 text-pink-600 text-[9px] font-black px-2 py-0.5 rounded-md shrink-0">
                          {isEn ? 'Live Coverage' : 'تغطية حيّة'}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 font-bold truncate">
                        instagram.com/shattabha
                      </div>
                    </div>

                    {/* Chevron */}
                    <div className="text-slate-400 group-hover:text-[#2B4D89] transition-all shrink-0">
                      <ChevronLeft className={`w-4 h-4 transition-transform ${isEn ? 'rotate-180' : ''}`} />
                    </div>
                  </a>

                  {/* Channel 3: WhatsApp Support */}
                  <a 
                    href="https://wa.me/201012345678" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    dir={isEn ? "ltr" : "rtl"}
                    className="flex items-center gap-3.5 p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-2xs transition-all duration-300 group"
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
                      <Phone className="w-5 h-5" />
                    </div>

                    {/* Text Container */}
                    <div className="flex-1 min-w-0 space-y-0.5 text-right ltr:text-left">
                      <div className="flex items-center gap-1.5 flex-wrap justify-start">
                        <span className="text-xs font-black text-[#2B4D89]">
                          {isEn ? 'Support & Live Chat on WhatsApp' : 'الدعم والمحادثة عبر واتساب'}
                        </span>
                        <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-md animate-pulse shrink-0">
                          {isEn ? 'Available Now' : 'متاح الآن'}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-black truncate">
                        <span>{isEn ? 'Instant Contact: ' : 'تواصل فوري: '}</span>
                        <span dir="ltr">+20 101 234 5678</span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <div className="text-slate-400 group-hover:text-emerald-500 transition-all shrink-0">
                      <ChevronLeft className={`w-4 h-4 transition-transform ${isEn ? 'rotate-180' : ''}`} />
                    </div>
                  </a>

                </div>

              </div>

            </div>

            {/* LEFT COLUMN in Arabic/RTL (Interactive Form Card) - Columns: lg:col-span-7 */}
            <div className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-10 border border-slate-200/60 shadow-sm flex flex-col justify-between font-sans">
              
              {isContactSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl shadow-inner animate-bounce font-black">
                    ✓
                  </div>
                  <h3 className="text-xl font-black text-emerald-600">
                    {isEn ? 'Message Sent Successfully!' : 'تم إرسال رسالتك بنجاح!'}
                  </h3>
                  <p className="text-sm text-gray-550 font-bold leading-relaxed max-w-md">
                    {isEn 
                      ? 'Thank you for reaching out. One of Shattabha\'s senior consulting engineers will review your inquiry and call you very soon.' 
                      : 'نشكرك على تواصلك معنا. سيقوم أحد كبار مهندسينا الاستشاريين بمراجعة استفسارك والاتصال بك هاتفياً في أقرب وقت لتقديم الدعم الفني لك.'}
                  </p>
                  <button 
                    onClick={() => setIsContactSuccess(false)}
                    className="bg-[#2B4D89] hover:bg-[#1E3254] text-white px-6 py-2.5 rounded-xl text-xs font-black transition-all"
                  >
                    {isEn ? 'Send Another Message' : 'إرسال رسالة أخرى'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6 animate-none">
                  
                  {/* Horizontal Two Elements Fields on desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Email Input */}
                    <div className="space-y-2 text-right">
                      <label className="block text-xs font-black text-gray-700">
                        {isEn ? 'Email Address *' : 'البريد الإلكتروني *'}
                      </label>
                      <input 
                        type="email" 
                        required
                        placeholder="yourname@domain.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#2B4D89]/20 focus:border-[#2B4D89] transition-all font-bold text-right"
                      />
                    </div>
                    
                    {/* Phone Input */}
                    <div className="space-y-2 text-right">
                      <label className="block text-xs font-black text-gray-700">
                        {isEn ? 'Phone Number *' : 'رقم الهاتف *'}
                      </label>
                      <input 
                        type="tel" 
                        required
                        placeholder="01xxxxxxxxx"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#2B4D89]/20 focus:border-[#2B4D89] transition-all font-bold text-right"
                      />
                    </div>

                  </div>

                  {/* Message Area */}
                  <div className="space-y-2 text-right">
                    <label className="block text-xs font-black text-gray-700">
                      {isEn ? 'Message Body *' : 'نص الرسالة *'}
                    </label>
                    <textarea 
                      required
                      rows={5}
                      placeholder={isEn ? 'How can we help you? Project details...' : 'كيف يمكننا مساعدتك؟ تفاصيل طلبك...'}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#2B4D89]/20 focus:border-[#2B4D89] transition-all font-bold text-right resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      disabled={isContactSubmitting}
                      className="bg-[#2B4D89] text-white hover:bg-[#1E3254] text-xs sm:text-sm font-black px-8 py-3.5 rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-75 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isContactSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{isEn ? 'Sending...' : 'جاري الإرسال...'}</span>
                        </>
                      ) : (
                        <>
                          <span>🚀</span>
                          <span>{isEn ? 'Send Message' : 'إرسال الرسالة'}</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* CALL TO ACTION FOR FREE REGISTRATION */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#1E3254] via-[#2B4D89] to-[#1E3254] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <ShattabhaLogo className="w-12 h-12 mx-auto animate-bounce" />
          <h2 className="text-2xl sm:text-4xl font-black text-[#D8B448]">
            {isEn ? 'Start Finishing Your Unit With Total Peace of Mind' : 'ابدأ مشروعك الآن ووفر عقبات ومخاطر التشطيب'}
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm max-w-xl mx-auto font-bold">
            {isEn 
              ? 'Join Shatibha today. Submit details anonymously, compare tenders side-by-side, and hire independent engineering eyes.' 
              : 'قدم طلب تشطيب مجاني مجهول الهوية، قارن العروض الفنية والمالية، واحصل على مشرف هندسي ميداني يستلم البنود بنداً بنداً.'}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
            <button 
              onClick={() => setModalType('CLIENT')}
              className="bg-[#D8B448] text-gray-900 border border-[#D8B448] text-xs sm:text-sm font-black px-8 py-3.5 rounded-xl hover:bg-yellow-500 transition-all cursor-pointer"
            >
              {isEn ? 'Request My Finishing Bids' : 'اطلب عروض الأسعار لوحدتك'}
            </button>
            <button 
              onClick={() => setModalType('COMPANY')}
              className="bg-transparent border-2 border-white hover:bg-white/10 text-white text-xs sm:text-sm font-black px-8 py-3.5 rounded-xl transition-all cursor-pointer"
            >
              {isEn ? 'Register Company Account' : 'سجل شركتك كمقاول معتمد'}
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-14 px-4 sm:px-8 border-t border-slate-800 text-right">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 justify-end">
              <ShattabhaLogo className="w-8 h-8" />
              <div className="flex flex-col items-end">
                <span className="font-extrabold text-xs sm:text-base text-[#D8B448]">{getTranslation('platformName', lang)}</span>
                <span className="text-[7px] text-gray-400">SHATTABHA</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              {isEn 
                ? 'Shatibha is Egypt first comprehensive double-blind finishing platform. We enforce professional on-site civil inspections, secure your milestone funds in escrow, and guard property owners interests legally.' 
                : 'شطبها هي أول منظومة معتمدة لحوكمة تشطيبات وتجهيز العقارات بمصر. نعمل على فحص السجلات التجارية، وحجز الأموال بحساب الضمان، وجلب عروض أسعار تنافسية بخصوصية حقيقية.'}
            </p>
          </div>

          <div className="space-y-3 font-semibold text-xs">
            <h4 className="font-black text-[#D8B448] text-sm">{isEn ? 'Sitemap Directory' : 'روابط سريعة'}</h4>
            <ul className="space-y-2 text-gray-400 list-none p-0 m-0">
              <li><a href="#why-shatibha" className="hover:text-[#D8B448] transition-colors">{isEn ? 'Why Shatibha' : 'من نحن وهدفنا'}</a></li>
              <li><a href="#payment-shield" className="hover:text-[#D8B448] transition-colors">{isEn ? 'Escrow Protection' : 'نظام حماية الأموال'}</a></li>
              <li><a href="#faq" className="hover:text-[#D8B448] transition-colors">{isEn ? 'FAQ Accordion' : 'الأسئلة الشائعة'}</a></li>
            </ul>
          </div>

          <div className="space-y-3 font-semibold text-xs">
            <h4 className="font-black text-[#D8B448] text-sm">{isEn ? 'Platform Policies' : 'الشروط والأحكام'}</h4>
            <ul className="space-y-2 text-gray-400 list-none p-0 m-0">
              <li>
                <span 
                  onClick={() => onNavigateToDashboard('CLIENT_TERMS')}
                  className="cursor-pointer hover:text-[#D8B448] transition-colors block"
                >
                  {isEn ? '👤 Client Terms & Conditions' : '👤 الشروط والأحكام للعملاء'}
                </span>
              </li>
              <li>
                <span 
                  onClick={() => onNavigateToDashboard('COMPANY_TERMS')}
                  className="cursor-pointer hover:text-[#D8B448] transition-colors block"
                >
                  {isEn ? '🏢 Contractor Terms & Rules' : '🏢 الشروط والأحكام للمقاولين والشركات'}
                </span>
              </li>
              <li><span className="cursor-pointer hover:text-[#D8B448] transition-colors">{isEn ? 'Privacy Assurance policy' : 'سياسة الخصوصية وحق البيانات'}</span></li>
              <li><span className="cursor-pointer hover:text-[#D8B448] transition-colors">{isEn ? 'Supervision Charter' : 'ميثاق الإشراف الفني'}</span></li>
            </ul>
          </div>

          <div className="space-y-3 font-semibold text-xs">
            <h4 className="font-black text-[#D8B448] text-sm">{isEn ? 'Official Communication' : 'تواصل رسمي'}</h4>
            <p className="text-gray-400 leading-relaxed">
              {isEn ? 'Get in touch for details:' : 'لتقديم الاستشارات أو الحصول على المزيد من التفاصيل:'}
            </p>
            <p className="text-emerald-400 font-mono">whats: <span dir="ltr">+20 101 234 5678</span></p>
            <p className="text-gray-400">info@shattabha.com</p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p 
            onDoubleClick={() => onNavigateToDashboard('ADMIN_LOGIN')} 
            className="cursor-default select-none transition-colors hover:text-gray-300"
          >
            {isEn ? '© 2026 Shatibha. Engineered for absolute quality and financial safety.' : '© ٢٠٢٦ منصة شطبها. كافة الحقوق محفوظة لمجلس الإدارة والدعم الهندسي المعتمد بجودة عالية.'}
          </p>
          <div className="flex gap-4 mt-2 sm:mt-0 font-medium">
            <span className="cursor-pointer hover:text-white transition-colors">Facebook</span>
            <span className="cursor-pointer hover:text-white transition-colors">Instagram</span>
            <span className="cursor-pointer hover:text-white transition-colors">LinkedIn</span>
          </div>
        </div>
      </footer>
    </div>

      {/* MODAL 1: LOGIN & DEMO SHORTCUT HELPERS */}
      {modalType === 'LOGIN' && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-right">
          <div className="bg-white rounded-[28px] shadow-2xl pt-6 px-6 pb-6 sm:pt-8 sm:px-8 sm:pb-8 w-full max-w-[480px] relative border border-slate-100 max-h-[98vh] overflow-y-auto">
            
            <button 
              onClick={() => setModalType('NONE')}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold z-10 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center justify-center gap-3 mt-0 mb-5" dir={isEn ? "ltr" : "rtl"}>
              <ShattabhaLogo className="w-11 h-11 shrink-0" />
              <div className="flex flex-col select-none items-center text-center">
                <span className="font-extrabold text-lg sm:text-xl text-[#2B4D89] leading-tight tracking-tight">
                  {isEn ? 'Shattabha' : 'شطبها'}
                </span>
                <span className="text-[10px] text-gray-400 tracking-wider uppercase font-bold leading-none mt-0.5">SHATTABHA</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="font-extrabold text-sm sm:text-base text-[#2B4D89]">
                {authMode === 'LOGIN' ? (isEn ? 'Welcome to Shattabha' : 'مرحباً بك في شطبها') : (isEn ? 'Join Shattabha' : 'انضم إلى شطبها')}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1 font-semibold">
                {isEn ? 'Access our verified demo features instantly' : 'سجل هويتك لمتابعة عروض الشركات بخصوصية كاملة'}
              </p>
            </div>

            {authMode === 'LOGIN' ? (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const email = loginEmail.trim().toLowerCase();
                  
                  try {
                    const user = await signInWithEmail(email, loginPassword);
                    const profile = await getUserProfile(user.uid);
                    
                    let role: 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR' = 'CLIENT';
                    if (profile) {
                      role = profile.role;
                      localStorage.setItem('shattabba_client_name', profile.name);
                      localStorage.setItem('shattabba_client_email', profile.email);
                    } else {
                      if (email === 'admin@shattabha.com' || email.includes('admin')) {
                        role = 'ADMIN';
                      } else if (email === 'inspector@shattabha.com' || email.includes('inspector')) {
                        role = 'INSPECTOR';
                      } else if (email.includes('luxspace')) {
                        role = 'COMPANY';
                      } else {
                        role = 'CLIENT';
                        localStorage.setItem('shattabba_client_email', email);
                      }
                    }
                    setModalType('NONE');
                    onNavigateToDashboard(role);
                  } catch (err: any) {
                    console.error('Firebase sign in failed:', err);
                    const isDemo = email === 'admin@shattabha.com' || email.includes('admin') || email.includes('inspector') || email.includes('luxspace') || email === 'ahmed.rashidy@gmail.com' || email === 'client@shattabha.com';
                    
                    if (isDemo && (loginPassword === '12345678' || loginPassword === 'admin123456')) {
                      let role: 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR' = 'CLIENT';
                      if (email === 'admin@shattabha.com' || email.includes('admin')) {
                        role = 'ADMIN';
                      } else if (email === 'inspector@shattabha.com' || email.includes('inspector')) {
                        role = 'INSPECTOR';
                      } else if (email.includes('luxspace')) {
                        role = 'COMPANY';
                      } else {
                        role = 'CLIENT';
                        localStorage.setItem('shattabba_client_email', email);
                      }
                      setModalType('NONE');
                      onNavigateToDashboard(role);
                    } else {
                      alert(isEn ? `Login failed: ${err.message}` : `فشل تسجيل الدخول: ${err.message}`);
                    }
                  }
                }} 
                className="space-y-4"
                dir={isEn ? "ltr" : "rtl"}
              >
                <div>
                  <input 
                    type="email" 
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    onFocus={() => setFocusedField('loginEmail')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={isEn ? "Email Address" : "البريد الإلكتروني للعميل أو الشركة"}
                    className={`w-full p-3 bg-gray-50/80 border border-gray-200 rounded-2xl outline-none focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/20 text-xs sm:text-sm font-semibold text-slate-800 transition-all ${
                      getInputStyling(loginEmail, 'loginEmail').className
                    }`} 
                    dir={getInputStyling(loginEmail, 'loginEmail').dir}
                  />
                </div>
                <div>
                  <input 
                    type="password" 
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    onFocus={() => setFocusedField('loginPassword')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={isEn ? "Password" : "كلمة المرور الخاصة بك"}
                    className={`w-full p-3 bg-gray-50/80 border border-gray-200 rounded-2xl outline-none focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/20 text-xs sm:text-sm font-semibold text-slate-800 transition-all ${
                      getInputStyling(loginPassword, 'loginPassword').className
                    }`}
                    dir={getInputStyling(loginPassword, 'loginPassword').dir}
                  />
                </div>
                <button type="submit" className="w-full py-3 mt-2 bg-[#2B4D89] text-white hover:bg-[#1E3A68] rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer shadow-sm active:scale-[0.98]">
                  {isEn ? 'Continue to App' : 'متابعة الدخول'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleClientSubmit} className="space-y-4" dir={isEn ? "ltr" : "rtl"}>
                <input 
                  type="text" 
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  onFocus={() => setFocusedField('clientName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={isEn ? "Full Name" : "الاسم الثنائي لمقدم الطلب"} 
                  className={`w-full p-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/20 font-semibold text-slate-800 transition-all ${
                    getInputStyling(clientName, 'clientName').className
                  }`} 
                  dir={getInputStyling(clientName, 'clientName').dir}
                />
                <input 
                  type="email" 
                  required
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  onFocus={() => setFocusedField('clientEmail')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={isEn ? "Email Address" : "البريد الإلكتروني للعميل"} 
                  className={`w-full p-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/20 font-semibold text-slate-800 transition-all ${
                    getInputStyling(clientEmail, 'clientEmail').className
                  }`} 
                  dir={getInputStyling(clientEmail, 'clientEmail').dir}
                />
                <input 
                  type="tel" 
                  required
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  onFocus={() => setFocusedField('clientPhone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={isEn ? "Mobile Number (e.g. 01xxxxxxxxx)" : "رقم الموبايل (مثال: 01xxxxxxxxx)"} 
                  className={`w-full p-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/20 font-semibold text-slate-800 transition-all ${
                    getInputStyling(clientPhone, 'clientPhone').className
                  }`} 
                  dir={getInputStyling(clientPhone, 'clientPhone').dir}
                />
                <input 
                  type="password" 
                  required
                  value={clientPassword}
                  onChange={e => setClientPassword(e.target.value)}
                  onFocus={() => setFocusedField('clientPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={isEn ? "Choose Password" : "اختر كلمة مرور حسابك"} 
                  className={`w-full p-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/20 font-semibold text-slate-800 transition-all ${
                    getInputStyling(clientPassword, 'clientPassword').className
                  }`} 
                  dir={getInputStyling(clientPassword, 'clientPassword').dir}
                />
                
                <div className="flex items-start gap-2 max-w-sm mt-1" dir={isEn ? 'ltr' : 'rtl'}>
                  <input 
                    type="checkbox" 
                    id="clientAgreeCheckModal"
                    checked={clientAgree}
                    onChange={e => setClientAgree(e.target.checked)}
                    required
                    className="mt-0.5 w-4.5 h-4.5 text-[#2B4D89] rounded border-gray-300 focus:ring-[#2B4D89] cursor-pointer shrink-0"
                  />
                  <label htmlFor="clientAgreeCheckModal" className="text-xs font-semibold text-gray-600 cursor-pointer select-none leading-relaxed">
                    {isEn ? (
                      <>I approve the <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowClientTermsModal(true); }} className="text-[#2B4D89] underline font-bold cursor-pointer hover:text-blue-700 font-sans mr-1">Client Terms</span> and responsibilities.</>
                    ) : (
                      <>أوافق على <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowClientTermsModal(true); }} className="text-[#2B4D89] underline font-bold cursor-pointer hover:text-blue-700">الشروط والأحكام الخاصة بالعملاء</span> والمسؤوليات المترتبة.</>
                    )}
                  </label>
                </div>

                <button type="submit" className="w-full py-3 mt-2 bg-[#2B4D89] text-white hover:bg-[#1E3A68] rounded-2xl font-black text-sm sm:text-base cursor-pointer shadow-sm active:scale-[0.98] transition-all">
                  {isEn ? 'Create Client Account' : 'حفظ البيانات وبدء الطلب'}
                </button>
              </form>
            )}

            {/* Social Logins */}
            <div className="my-5 space-y-3 mt-6">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-gray-400 text-[10px] sm:text-xs uppercase font-bold tracking-wider font-sans">
                  {authMode === 'LOGIN' 
                    ? (isEn ? 'Or continue with' : 'أو الدخول بواسطة') 
                    : (isEn ? 'Or register with' : 'أو التسجيل بواسطة')}
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => handleSocialRegister('Google')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 border border-gray-200 hover:border-[#2B4D89] hover:bg-slate-50 rounded-2xl transition-all cursor-pointer text-xs font-black text-gray-700 shadow-xs active:scale-95 duration-150"
                  title={isEn ? "Sign in with Google" : "تسجيل الدخول باستخدام جوجل"}
                >
                  <Chrome className="w-4 h-4 text-[#EA4335]" />
                  <span className="text-[10px] sm:text-xs font-black">Google</span>
                </button>

                {/* Facebook Button */}
                <button
                  type="button"
                  onClick={() => handleSocialRegister('Facebook')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 border border-gray-200 hover:border-[#2B4D89] hover:bg-slate-50 rounded-2xl transition-all cursor-pointer text-xs font-black text-gray-700 shadow-xs active:scale-95 duration-150"
                  title={isEn ? "Sign in with Facebook" : "تسجيل الدخول باستخدام فيسبوك"}
                >
                  <Facebook className="w-4 h-4 text-[#1877F2]" />
                  <span className="text-[10px] sm:text-xs font-black">Facebook</span>
                </button>

                {/* Apple Button */}
                <button
                  type="button"
                  onClick={() => handleSocialRegister('Apple')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 border border-gray-200 hover:border-[#2B4D89] hover:bg-slate-50 rounded-2xl transition-all cursor-pointer text-xs font-black text-gray-700 shadow-xs active:scale-95 duration-150"
                  title={isEn ? "Sign in with Apple" : "تسجيل الدخول باستخدام حساب أبل"}
                >
                  <Apple className="w-4 h-4 text-black" />
                  <span className="text-[10px] sm:text-xs font-black">Apple</span>
                </button>
              </div>
            </div>

            <div className="relative mt-6 mb-3 text-center select-none text-[10px] sm:text-xs text-gray-400 font-bold">
              <span>{isEn ? 'Or Fast Demo Login:' : 'أو تجربة محاكاة الدخول الفوري السريع:'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-gray-200">
              <button 
                onClick={() => handleQuickDemoAccess('ahmed.rashidy@gmail.com')}
                className="p-1 px-2 border border-gray-200 bg-white hover:border-[#2B4D89] rounded-xl text-[10px] sm:text-xs font-black text-gray-700 truncate shadow-xs cursor-pointer"
              >
                👤 {isEn ? 'Client' : 'عميل (أحمد)'}
              </button>
              <button 
                onClick={() => handleQuickDemoAccess('luxspace@gmail.com')}
                className="p-1 px-2 border border-gray-200 bg-white hover:border-[#2B4D89] rounded-xl text-[10px] sm:text-xs font-black text-gray-700 truncate shadow-xs cursor-pointer"
              >
                🏢 {isEn ? 'Company' : 'شركة (LuxSpace)'}
              </button>
            </div>

            <div className="flex justify-between items-center text-sm sm:text-base pt-4 mt-6 border-t border-gray-200 font-sans">
              <button 
                onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                className="text-[#2B4D89] hover:text-[#1E3A68] hover:underline font-black outline-none"
              >
                {authMode === 'LOGIN' ? (isEn ? 'Sign up' : 'إنشاء حساب جديد') : (isEn ? 'Sign in' : 'تسجيل دخول')}
              </button>
              {authMode === 'LOGIN' && (
                <button 
                  onClick={() => { setLoginEmail('ahmed.rashidy@gmail.com'); setLoginPassword('12345678'); }}
                  className="text-gray-400 hover:text-gray-600 font-bold hover:underline outline-none"
                >
                  {isEn ? 'Forgot Password?' : 'نسيت كلمة المرور؟'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: CLIENT FINISHING REQUEST */}
      {modalType === 'CLIENT' && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-right">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-[390px] relative max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setModalType('NONE')}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold font-sans cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <span className="text-3xl">👤</span>
              <h3 className="font-extrabold text-[#2B4D89] text-base mt-2">
                {clientModalMode === 'REGISTER' 
                  ? (isEn ? 'Start Finishing Request' : 'طلب عروض أسعار تشطيب جديدة')
                  : (isEn ? 'Client Sign In' : 'تسجيل الدخول لحساب العميل')
                }
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                {clientModalMode === 'REGISTER'
                  ? (isEn ? 'Fill details to compare bids without exposing your raw mobile number' : 'سجل هويتك وبيانات وحدتك وسنبدأ بطرح طلبك للمناقصة')
                  : (isEn ? 'Access your verified client control center instantly' : 'سجل دخولك المباشر لمتابعة عروض أسعار مشاريعك')
                }
              </p>
            </div>

            {isClientSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-full text-2xl mx-auto">✓</div>
                <h4 className="font-black text-[#2B4D89] text-base">{isEn ? 'Success!' : 'تم تسجيل طلبك وحسابك بنجاح!'}</h4>
                <p className="text-xs text-gray-500">{isEn ? 'Redirecting to your secured client control center...' : 'جاري تشغيل لوحة التحكم فوراً لتقييم العروض...'}</p>
              </div>
            ) : (
              <>
                {clientModalMode === 'REGISTER' ? (
                  <form onSubmit={handleClientSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{isEn ? 'Owner Name' : 'اسم مالك العقار بالكامل'}</label>
                      <input 
                        type="text" 
                        required
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        placeholder={isEn ? "Ahmed Mohamed" : "مثال: أحمد محمد مصطفى"} 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#2B4D89]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{isEn ? 'Corporate Email' : 'عنوان البريد الإلكتروني'}</label>
                      <input 
                        type="email" 
                        required
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                        placeholder="example@workmail.com" 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-left outline-none focus:border-[#2B4D89]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{isEn ? 'Secure Protected Phone No' : 'رقم الموبايل المحمي (تشفير ١٠٠٪)'}</label>
                      <input 
                        type="tel" 
                        required
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        placeholder="01xxxxxxxxx" 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-left outline-none focus:border-[#2B4D89]" 
                      />
                    </div>
                    <div className="flex items-start gap-2.5 my-3 text-right" dir={isEn ? 'ltr' : 'rtl'}>
                      <input 
                        type="checkbox" 
                        id="clientAgreeCheckRequest"
                        checked={clientAgree}
                        onChange={e => setClientAgree(e.target.checked)}
                        required
                        className="mt-0.5 w-4 h-4 text-[#2B4D89] rounded border-gray-300 focus:ring-[#2B4D89] cursor-pointer"
                      />
                      <label htmlFor="clientAgreeCheckRequest" className="text-[11px] font-semibold text-gray-600 cursor-pointer select-none leading-relaxed">
                        {isEn ? (
                          <>I approve the <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowClientTermsModal(true); }} className="text-[#2B4D89] underline font-bold cursor-pointer hover:text-blue-700">Client Terms & Conditions</span> of using the platform.</>
                        ) : (
                          <>أوافق على <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowClientTermsModal(true); }} className="text-[#2B4D89] underline font-bold cursor-pointer hover:text-blue-700">الشروط والأحكام الخاصة بالعملاء</span> والمسؤوليات المترتبة.</>
                        )}
                      </label>
                    </div>

                    <button type="submit" className="w-full bg-[#2B4D89] text-white py-3 rounded-xl font-bold text-xs shadow-lg hover:bg-[#1E3A68] cursor-pointer transition-colors">
                      {isEn ? 'Confirm and Start Project' : 'تأكيد وحفظ بيانات حساب العميل'}
                    </button>
                  </form>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const email = clientEmail.trim().toLowerCase();
                      let role: 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR' = 'CLIENT';
                      
                      if (email === 'admin@shattabha.com' || email.includes('admin')) {
                        role = 'ADMIN';
                      } else if (email === 'inspector@shattabha.com' || email.includes('inspector')) {
                        role = 'INSPECTOR';
                      } else if (email.includes('luxspace')) {
                        role = 'COMPANY';
                      } else {
                        role = 'CLIENT';
                        localStorage.setItem('shattabba_client_email', email);
                      }
                      setModalType('NONE');
                      onNavigateToDashboard(role);
                    }} 
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{isEn ? 'Email Address' : 'عنوان البريد الإلكتروني للعميل'}</label>
                      <input 
                        type="email" 
                        required
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                        placeholder="example@workmail.com" 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-left outline-none focus:border-[#2B4D89]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{isEn ? 'Password' : 'كلمة المرور'}</label>
                      <input 
                        type="password" 
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-left outline-none focus:border-[#2B4D89]" 
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#2B4D89] text-white py-3 rounded-xl font-bold text-xs shadow-lg hover:bg-[#1E3A68] cursor-pointer transition-colors">
                      {isEn ? 'Continue to Account' : 'متابعة الدخول الفوري'}
                    </button>
                  </form>
                )}

                {/* Social logins */}
                <div className="my-4 space-y-3">
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-gray-150"></div>
                    <span className="flex-shrink mx-3 text-gray-400 text-[10px] uppercase font-bold tracking-wider font-sans">
                      {clientModalMode === 'REGISTER'
                        ? (isEn ? 'Or register with' : 'أو التسجيل بواسطة')
                        : (isEn ? 'Or continue with' : 'أو الدخول بواسطة')
                      }
                    </span>
                    <div className="flex-grow border-t border-gray-150"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Google */}
                    <button
                      type="button"
                      onClick={() => handleSocialRegister('Google')}
                      className="flex items-center justify-center gap-1 py-1.5 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all cursor-pointer text-[10px] font-bold text-gray-700 active:scale-95 duration-150"
                      title={isEn ? "Sign in with Google" : "تسجيل الدخول باستخدام جوجل"}
                    >
                      <Chrome className="w-3 h-3 text-[#EA4335]" />
                      <span>Google</span>
                    </button>

                    {/* Facebook */}
                    <button
                      type="button"
                      onClick={() => handleSocialRegister('Facebook')}
                      className="flex items-center justify-center gap-1 py-1.5 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all cursor-pointer text-[10px] font-bold text-gray-700 active:scale-95 duration-150"
                      title={isEn ? "Sign in with Facebook" : "تسجيل الدخول باستخدام فيسبوك"}
                    >
                      <Facebook className="w-3 h-3 text-[#1877F2]" />
                      <span className="font-sans">Facebook</span>
                    </button>

                    {/* Apple */}
                    <button
                      type="button"
                      onClick={() => handleSocialRegister('Apple')}
                      className="flex items-center justify-center gap-1 py-1.5 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all cursor-pointer text-[10px] font-bold text-gray-700 active:scale-95 duration-150"
                      title={isEn ? "Sign in with Apple" : "تسجيل الدخول باستخدام حساب أبل"}
                    >
                      <Apple className="w-3 h-3 text-black" />
                      <span className="font-sans">Apple</span>
                    </button>
                  </div>
                </div>

                {/* Register Toggle Option */}
                <div className="text-center pt-3 mt-3 border-t border-gray-150">
                  <button 
                    type="button"
                    onClick={() => {
                      setClientModalMode(clientModalMode === 'REGISTER' ? 'LOGIN' : 'REGISTER');
                      // Clear forms upon toggle
                      setClientEmail('');
                      setClientName('');
                      setClientPhone('');
                    }}
                    className="text-[#2B4D89] hover:underline text-[11px] font-black cursor-pointer"
                  >
                    {clientModalMode === 'REGISTER' 
                      ? (isEn ? 'Already have an account? Sign In ➔' : 'لدي حساب بالفعل؟ تسجيل الدخول لحسابك ➔')
                      : (isEn ? "Don't have an account? Register New Option ➔" : 'ليس لديك حساب؟ تسجيل حساب جديد وطلب تشطيب ➔')
                    }
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* MODAL 3: REGISTER COMPANY */}
      {modalType === 'COMPANY' && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-right">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setModalType('NONE')}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <ShattabhaLogo className="w-12 h-12 mx-auto mb-2" />
              <h3 className="font-extrabold text-lg text-[#2B4D89]">
                {isEn ? 'Register Contractor / Studio' : 'تسجيل وتوثيق شركة تشطيب جديدة'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {isEn ? 'Requires active Commercial Register & Tax Card audit' : 'تطلب ملفات قانونية رسمية ومطبوعات سارية للموافقة والتفعيل'}
              </p>
            </div>

            {compSuccessMsg ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 flex items-center justify-center rounded-full text-2xl mx-auto animate-bounce">✓</div>
                <h4 className="font-black text-emerald-600 text-base">
                  {isEn ? 'Application Submitted Successfully!' : 'تم تقديم طلب التسجيل بنجاح!'}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isEn 
                    ? 'Thank you for registering with Shattabha. Your company profile is now under review. Our engineering audit committee will verify your commercial register and tax card within 24 hours. You will receive an email notification as soon as your account is approved and activated.' 
                    : 'نشكركم على الانضمام لمنصة شطبها. تم استلام ملف شركتكم الفني وهو الآن قيد الفحص والمراجعة الدقيقة. ستقوم اللجنة الهندسية المختصة بالتحقق من السجل التجاري والبطاقة الضريبية وتفعيل حسابكم خلال 24 ساعة، وسيتم إرسال إشعار فوري لبريدكم الإلكتروني المعتمد بمجرد إتمام التفعيل لتتمكنوا من الدخول وتقديم عروض الأسعار للعملاء.'}
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => { setModalType('NONE'); setCompSuccessMsg(false); }}
                    className="w-full bg-[#2B4D89] hover:bg-[#2B4D89]/90 text-white font-black py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                  >
                    {isEn ? 'Back to Homepage' : 'العودة للرئيسية'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCompanySubmit} className="space-y-4 text-right">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">{isEn ? 'Finishing Company Name' : 'اسم مقاول أو شركة الديكور'}</label>
                    <input 
                      type="text" 
                      required 
                      value={companyName} 
                      onChange={e => setCompanyName(e.target.value)} 
                      placeholder="الأندلس للمقاولات والديكور"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">{isEn ? 'Email' : 'البريد الإلكتروني للمؤسسة'}</label>
                    <input 
                      type="email" 
                      required 
                      value={companyEmail} 
                      onChange={e => setCompanyEmail(e.target.value)} 
                      placeholder="design@andalus.com"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-left" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">{isEn ? 'Representative phone' : 'رقم الهاتف للتواصل المعتمد'}</label>
                    <input 
                      type="tel" 
                      required 
                      value={companyPhone} 
                      onChange={e => setCompanyPhone(e.target.value)} 
                      placeholder="0100xxxxxxx"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-left" 
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-600 mb-1">{isEn ? 'Geographical Scope' : 'المحافظات المغطاة للعمل'}</label>
                    <button 
                      type="button" 
                      onClick={() => setIsGovDropdownOpen(!isGovDropdownOpen)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs flex items-center justify-between font-bold"
                    >
                      <span>▼</span>
                      <span className="truncate pr-2 block">{selectedGovernorates.join('، ')}</span>
                    </button>
                    {isGovDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-30 max-h-40 overflow-y-auto space-y-1 text-right">
                        {governorateOptions.map(opt => {
                          const has = selectedGovernorates.includes(opt.value);
                          return (
                            <label key={opt.value} className="flex items-center gap-2 py-1 justify-end cursor-pointer text-xs font-semibold">
                              <span>{isEn ? opt.labelEn : opt.labelAr}</span>
                              <input 
                                type="checkbox" 
                                checked={has} 
                                onChange={() => {
                                  if (has) {
                                    setSelectedGovernorates(selectedGovernorates.filter(g => g !== opt.value));
                                  } else {
                                    setSelectedGovernorates([...selectedGovernorates, opt.value]);
                                  }
                                }} 
                                className="accent-[#2B4D89]" 
                              />
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-gray-150 space-y-3">
                  <span className="block text-[11px] font-black text-gray-500 mb-1">📁 {isEn ? 'Official documentation copies:' : 'رفع الصور القانونية للمستندات والتوثيق:'}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] text-gray-400 mb-1">{isEn ? 'Commercial Register' : 'صورة السجل التجاري المعاصرة'}</span>
                      <input 
                        type="file" 
                        required 
                        onChange={e => setCommercialRegFile(e.target.files?.[0]?.name || 'CR_ANDALUS.pdf')} 
                        className="w-full p-1 bg-white border rounded text-[10px]" 
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 mb-1">{isEn ? 'Tax Card Copy' : 'صورة البطاقة الضريبية الرسمية'}</span>
                      <input 
                        type="file" 
                        required 
                        onChange={e => setTaxCardFile(e.target.files?.[0]?.name || 'TC_ANDALUS.pdf')} 
                        className="w-full p-1 bg-white border rounded text-[10px]" 
                      />
                    </div>
                  </div>
                </div>

                {compError && (
                  <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg font-bold">
                    <span>{compError}</span>
                  </div>
                )}

                <div className="flex items-start gap-2.5 my-3 text-right" dir={isEn ? 'ltr' : 'rtl'}>
                  <input 
                    type="checkbox" 
                    id="companyAgreeCheck"
                    checked={companyAgree}
                    onChange={e => setCompanyAgree(e.target.checked)}
                    required
                    className="mt-0.5 w-4 h-4 text-[#2B4D89] rounded border-gray-300 focus:ring-[#2B4D89] cursor-pointer"
                  />
                  <label htmlFor="companyAgreeCheck" className="text-[11px] font-semibold text-gray-600 cursor-pointer select-none leading-relaxed">
                    {isEn ? (
                      <>I approve the <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCompanyTermsModal(true); }} className="text-[#2B4D89] underline font-bold cursor-pointer hover:text-blue-700">Contractor Terms & Conditions</span> of partnering.</>
                    ) : (
                      <>أوافق على <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCompanyTermsModal(true); }} className="text-[#2B4D89] underline font-bold cursor-pointer hover:text-blue-700">وثيقة شروط الانضمام والتشغيل</span> لشركات التشطيب.</>
                    )}
                  </label>
                </div>

                <button type="submit" disabled={isCompSubmitting} className="w-full bg-[#2B4D89] text-white py-3.5 rounded-xl font-bold text-xs shadow">
                  {isCompSubmitting ? (isEn ? 'Saving papers...' : 'جاري معالجة البيانات...') : (isEn ? 'Submit Profile' : 'تقديم ملفات الشركة للمراجعة')}
                </button>

              </form>
            )}

          </div>
        </div>
      )}

      {/* Client Terms Overlay Modal */}
      {showClientTermsModal && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-right">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-[480px] relative border border-slate-100 max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setShowClientTermsModal(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold font-sans cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 justify-end border-b border-gray-100 pb-3 mb-4">
              <span className="font-extrabold text-[#2B4D89] text-sm">{isEn ? 'Client Terms of Service' : 'شروط الخدمة والتعاقد للعملاء'}</span>
              <span className="text-xl">👤</span>
            </div>
            <div className="text-xs text-gray-750 leading-relaxed max-h-[50vh] overflow-y-auto pr-2 text-right whitespace-pre-line font-medium space-y-2">
              <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-900 border border-amber-100 mb-2">
                📢 {isEn ? 'Review the following binding terms and conditions:' : 'يرجى مراجعة وتفهم البنود والشروط الملزمة التالية قبل تأكيد تسجيل الحساب:'}
              </div>
              {getTranslation('clientTermsText', lang)}
            </div>
            <button 
              onClick={() => { setClientAgree(true); setShowClientTermsModal(false); }}
              className="w-full mt-5 bg-[#2B4D89] text-white py-2.5 rounded-xl font-bold text-xs"
            >
              {isEn ? 'Accept & Continue' : 'أوافق وأرغب في المتابعة'}
            </button>
          </div>
        </div>
      )}

      {/* Company Terms Overlay Modal */}
      {showCompanyTermsModal && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-right">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-[480px] relative border border-slate-100 max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setShowCompanyTermsModal(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold font-sans cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 justify-end border-b border-gray-100 pb-3 mb-4">
              <span className="font-extrabold text-[#2B4D89] text-sm">{isEn ? 'Contractor Terms of Partnering' : 'شروط وضوابط انضمام شركات التشطيب'}</span>
              <span className="text-xl">🏢</span>
            </div>
            <div className="text-xs text-gray-750 leading-relaxed max-h-[50vh] overflow-y-auto pr-2 text-right whitespace-pre-line font-medium space-y-2">
              <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-900 border border-blue-100 mb-2">
                📢 {isEn ? 'Review official directives for certified studios:' : 'بصفتك شركة تشطيب شريكة، يرجى قراءة ميثاق وضوابط التشغيل التالية والالتزام بها:'}
              </div>
              {getTranslation('contractorTermsText', lang)}
            </div>
            <button 
              onClick={() => { setCompanyAgree(true); setShowCompanyTermsModal(false); }}
              className="w-full mt-5 bg-[#2B4D89] text-white py-2.5 rounded-xl font-bold text-xs"
            >
              {isEn ? 'Accept & Continue' : 'أوافق ومستعد للمتابعة'}
            </button>
          </div>
        </div>
      )}



    </div>
  );
};
