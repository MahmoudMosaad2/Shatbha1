import React, { useState, useEffect } from 'react';
import { 
  Plus, CheckCircle, Clock, Search, Layers, FileText, 
  MapPin, Award, Trash2, ShieldCheck, Image as ImageIcon, Sparkles,
  AlertTriangle, CheckCircle2, Activity, User, PhoneCall, ChevronRight,
  ChevronLeft, Download, Filter, Printer, Globe, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Company, ClientRequest, Offer, ProjectStage, Contract } from '../types';
import { Language, getTranslation } from '../lib/translations';
import { TenderCountdown } from './TenderCountdown';

// Helper to normalize and map bi-lingual governorate & finishingType values to standard forms
const normalizeValue = (val: string) => {
  if (!val) return '';
  let s = val.trim().toLowerCase();
  
  // Apply Arabic normalization and space removal first to ensure robust matching!
  s = s
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, '');

  // Map English/Arabic equivalents
  if (s === 'cairo' || s === 'القاهره' || s === 'القاهرة') return 'cairo';
  if (s === 'giza' || s === 'الجيزه' || s === 'الجيزة') return 'giza';
  if (s === 'alexandria' || s === 'alex' || s === 'الاسكندربه' || s === 'الاسكندريه' || s === 'الاسكندرية') return 'alexandria';
  
  if (s === 'lux' || s === 'deluxe' || s === 'لوكس') return 'lux';
  if (s === 'superlux' || s === 'سوبرلوكس' || s === 'سوبرلوكس') return 'superlux';
  if (s === 'premium' || s === 'بريميوم' || s === 'بريميم') return 'premium';
  if (s === 'economic' || s === 'اقتصادي' || s === 'اقتصادى') return 'economic';

  return s;
};

export interface PreviousWork {
  id: string;
  category: 'شقة' | 'فيلا' | 'مكتب';
  title: string;
  description: string;
  images: string[];
  budget?: number;
  area?: number;
  location?: string;
}

export interface CompanyDashboardViewProps {
  companies: Company[];
  requests: ClientRequest[];
  offers: Offer[];
  onSubmitOffer: (newOffer: Offer) => void;
  onUpdateOffer?: (updatedOffer: Offer) => void;
  stages: ProjectStage[];
  onUpdateStage: (stageId: string, updates: Partial<ProjectStage>) => void;
  lang: Language;
  setLang?: (lang: Language) => void;
  contracts?: Contract[];
  onUpdateRequest?: (requestId: string, updates: Partial<ClientRequest>) => void;
  onSignOut?: () => void;
  onUpdateCompany?: (companyId: string, updates: Partial<Company>) => void;
}

// Stateful component to handle the ticking live countdown of the warranty
const WarrantyCountdown: React.FC<{ deliveryDateStr: string; isEn: boolean }> = ({ deliveryDateStr, isEn }) => {
  const deliveryDate = new Date(deliveryDateStr);
  // Add 3 years to delivery date to define the legal warranty end date
  const warrantyEndDate = new Date(deliveryDate);
  warrantyEndDate.setFullYear(deliveryDate.getFullYear() + 3);

  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = warrantyEndDate.getTime() - now.getTime();
    
    if (difference <= 0) {
      return null;
    }

    const seconds = Math.floor((difference / 1000) % 60);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    
    const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365);
    const remainingDaysAfterYears = totalDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const days = remainingDaysAfterYears % 30;

    return { years, months, days, hours, minutes, seconds, totalDays };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deliveryDateStr]);

  if (!timeLeft) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl text-center text-rose-800 font-extrabold text-xs">
        {isEn ? '⚠️ Dual Quality Warranty Period Has Expired' : '⚠️ انتهت فترة الضمان والصيانة المجانية لهذا المشروع'}
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] border border-amber-500/25 p-5 rounded-2.5xl space-y-4 shadow-sm relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
      
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          {isEn ? 'Triple Warranty Plan Active' : 'حماية الضمان الثلاثي الذهبي مفعّلة'}
        </span>
        <span className="text-[10px] font-mono font-bold text-gray-400">
          {isEn ? 'Warranty Live Countdown' : 'عداد تنازلي حي'}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-right">
        {timeLeft.years > 0 && (
          <div className="bg-white border border-gray-150 p-2 rounded-xl text-center">
            <span className="block text-xl font-black text-amber-950 font-mono leading-none">{timeLeft.years}</span>
            <span className="text-[9px] text-gray-400 font-bold block mt-1">{isEn ? 'Years' : 'سنوات'}</span>
          </div>
        )}
        <div className="bg-white border border-gray-150 p-2 rounded-xl text-center">
          <span className="block text-xl font-black text-[#2B4D89] font-mono leading-none">{timeLeft.months}</span>
          <span className="text-[9px] text-gray-400 font-bold block mt-1">{isEn ? 'Months' : 'أشهر'}</span>
        </div>
        <div className="bg-white border border-gray-150 p-2 rounded-xl text-center">
          <span className="block text-xl font-black text-[#2B4D89] font-mono leading-none">{timeLeft.days}</span>
          <span className="text-[9px] text-gray-400 font-bold block mt-1">{isEn ? 'Days' : 'أيام'}</span>
        </div>
        <div className="bg-white border border-gray-150 p-2 rounded-xl text-center">
          <span className="block text-xl font-black text-[#2B4D89] font-mono leading-none">{timeLeft.hours}</span>
          <span className="text-[9px] text-gray-400 font-bold block mt-1">{isEn ? 'Hours' : 'ساعة'}</span>
        </div>
        <div className="bg-white border border-gray-150 p-2 rounded-xl text-center">
          <span className="block text-xl font-black text-[#2B4D89] font-mono leading-none">{timeLeft.minutes}</span>
          <span className="text-[9px] text-gray-400 font-bold block mt-1">{isEn ? 'Mins' : 'دقيقة'}</span>
        </div>
        <div className="bg-white border border-rose-100 p-2 rounded-xl text-center">
          <span className="block text-xl font-black text-rose-600 font-mono leading-none animate-pulse">{timeLeft.seconds}</span>
          <span className="text-[9px] text-gray-400 font-bold block mt-1">{isEn ? 'Secs' : 'ثانية'}</span>
        </div>
      </div>

      <div className="text-[10px] text-gray-500 font-bold border-t border-dashed border-gray-200 pt-3 flex flex-col sm:flex-row justify-between gap-1">
        <span className="text-[#2B4D89] font-black">
          {isEn ? 'Duration Coverage:' : 'فترة الضمان الكلية:'} {isEn ? '3 Years (36 Months)' : '٣ سنوات كاملة (٣٦ شهراً)'}
        </span>
        <span className="text-gray-400">
          {isEn ? 'Expiration Date:' : 'تاريخ الانتهاء المعتمد:'} {warrantyEndDate.toLocaleDateString(isEn ? 'en-US' : 'ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
};

export const CompanyDashboardView: React.FC<CompanyDashboardViewProps> = ({
  companies,
  requests,
  offers,
  onSubmitOffer,
  onUpdateOffer,
  stages,
  onUpdateStage,
  lang,
  setLang,
  contracts = [],
  onUpdateRequest,
  onSignOut,
  onUpdateCompany
}) => {
  const isEn = lang === 'en';
  // Dynamic active company ID for testing multi-company bidding
  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => {
    const loggedCompanyId = localStorage.getItem('shattabba_logged_company_id');
    if (loggedCompanyId && companies.some(c => c.id === loggedCompanyId)) {
      return loggedCompanyId;
    }
    const loggedEmail = localStorage.getItem('shattabba_client_email') || '';
    const foundByEmail = companies.find(c => c.email?.toLowerCase() === loggedEmail.toLowerCase());
    if (foundByEmail) {
      return foundByEmail.id;
    }
    return 'COMP-1';
  });
  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0];

  const [ignoredRequestIds, setIgnoredRequestIds] = useState<string[]>([]);

  // States for Swipe Navigation on contractor-side project stages tracking
  const [companyViewMode, setCompanyViewMode] = useState<'SWIPE' | 'LIST'>('SWIPE');
  const [companyActiveStageIndex, setCompanyActiveStageIndex] = useState<number>(0);

  const myContractedProjects = requests.filter(r => 
    (r.status === 'ACTIVE' || r.status === 'CONTRACT_SIGNED' || r.status === 'CONTRACTED') &&
    (r.companyId === activeCompany.id || contracts.some(c => c.requestId === r.id && c.companyId === activeCompany.id))
  );

  // Stats navigation tab state
  const [activeTab, setActiveTab] = useState<'NEW_REQUESTS' | 'ACTIVE_PROJECTS' | 'SUBMITTED_BIDS' | 'WON_BIDS' | 'COMPLETED_PROJECTS' | 'COMPANY_PROFILE'>('NEW_REQUESTS');

  // Synchronize with external selection triggers (like clicking on a request code inside details modal)
  useEffect(() => {
    const handleActiveChanged = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const targetId = customEvent.detail;
      if (!targetId) return;
      
      const req = requests.find(r => r.id === targetId);
      if (!req) return;
      
      if (req.status === 'COMPLETED') {
        setActiveTab('COMPLETED_PROJECTS');
        setSelectedCompletedProjectId(targetId);
      } else if (req.status === 'ACTIVE' || req.status === 'CONTRACTED' || req.status === 'CONTRACT_SIGNED') {
        setActiveTab('ACTIVE_PROJECTS');
        setSelectedContractedId(targetId);
      } else {
        setActiveTab('NEW_REQUESTS');
        const rItem = requests.find(item => item.id === targetId);
        if (rItem) {
          setSelectedDetailItem(rItem);
          setTargetRequest(rItem);
        }
      }
    };
    window.addEventListener('shatibha-active-request-changed', handleActiveChanged);
    return () => {
      window.removeEventListener('shatibha-active-request-changed', handleActiveChanged);
    };
  }, [requests]);

  // Periodic performance report download handler
  const handleDownloadPerformanceReport = () => {
    const reportDate = new Date().toLocaleDateString(isEn ? 'en-US' : 'ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const totalOffers = offers.filter(o => o.companyId === activeCompany.id).length;
    const activeProjectsCount = myContractedProjects.length;
    const completedProjectsCount = requests.filter(r => r.status === 'COMPLETED' && (r.companyId === activeCompany.id || contracts.some(c => c.requestId === r.id && c.companyId === activeCompany.id))).length;
    const totalBidsWon = offers.filter(o => o.companyId === activeCompany.id && requests.some(r => r.id === o.requestId && (r.status === 'ACTIVE' || r.status === 'CONTRACTED' || r.status === 'CONTRACT_SIGNED' || r.status === 'COMPLETED'))).length;
    const portfolioCount = (activeCompany.portfolio || []).length;
    const packagesCount = (activeCompany.packages || []).length;
    
    let reportText = "";
    
    if (isEn) {
      reportText = `========================================================
             SHATIBHA CONTRACTOR PERFORMANCE REPORT
========================================================
Report Generated On : ${reportDate}
Company Profile     : ${activeCompany.companyName}
Company ID          : ${activeCompany.id}
Current Peer Rating : ${activeCompany.rating || 4.8} / 5.0
Verification Status : ${activeCompany.isVerified ? 'VERIFIED PARTNER (Blue Badge)' : 'REGISTERED CONTRACTOR'}
Active Governorates : ${activeCompany.governorates.join(', ')}
Office Address      : ${activeCompany.officeAddress || 'N/A'}
Contact Details     : Phone: ${activeCompany.phone || 'N/A'} | Email: ${activeCompany.email || 'N/A'}

--------------------------------------------------------
                KEY PERFORMANCE METRICS
--------------------------------------------------------
Total Bids Dispatched   : ${totalOffers} bids
Total Successful / Won  : ${totalBidsWon} bids
Active Site Projects    : ${activeProjectsCount} projects
Completed / Delivered   : ${completedProjectsCount} projects
Rating Performance      : ${activeCompany.rating || 4.8} Stars (Highly Rated)

--------------------------------------------------------
                OPERATIONAL PORTFOLIO
--------------------------------------------------------
Registered Portfolio items: ${portfolioCount}
${(activeCompany.portfolio || []).map((p: any, idx: number) => `\n[${idx + 1}] ${p.projectName} (${p.projectType})
    Location   : ${p.governorate}
    Year       : ${p.executionYear}
    Description: ${p.description || 'No description provided'}`).join('\n')}

--------------------------------------------------------
                PRICING PACKAGES
--------------------------------------------------------
Active Packages Online    : ${packagesCount}
${(activeCompany.packages || []).map((p: any, idx: number) => `\n[${idx + 1}] ${p.name} Package
    Price per sqm: ${p.pricePerSqm} EGP
    Description  : ${p.description || 'No description'}
    Key Features : ${p.features ? p.features.join(', ') : 'Default high level builds'}`).join('\n')}

========================================================
   Shatibha Engineering & Construction Platform @ 2026
========================================================`;
    } else {
      reportText = `========================================================
             تقرير الأداء الدوري لشركة المقاولات - شطبها
========================================================
تاريخ إصدار التقرير  : ${reportDate}
اسم الشركة والمنشأة  : ${activeCompany.companyName}
الرقم التعريفي الموحد : ${activeCompany.id}
التقييم الفني الحالي  : ${activeCompany.rating || 4.8} من 5.0 ★
حالة التوثيق القانوني : ${activeCompany.isVerified ? 'شريك بلاتيني معتمد وموثق (الشارة الزرقاء)' : 'مقاول هندسي مسجل'}
نطاق المحافظات النشطة: ${activeCompany.governorates.join('، ')}
مقر المكتب الفني     : ${activeCompany.officeAddress || 'غير محدد'}
بيانات التواصل الرسمية: هاتف: ${activeCompany.phone || 'غير محدد'} | بريد: ${activeCompany.email || 'غير محدد'}

--------------------------------------------------------
                 مؤشرات الأداء التشغيلي والتعاقدات
--------------------------------------------------------
عدد العطاءات المقدمة    : ${totalOffers} عرض سعر منافس
إجمالي العروض المقبولة   : ${totalBidsWon} عرض معتمد ومختار
المشاريع الجارية حالياً : ${activeProjectsCount} موقع قيد التشطيب والتنفيذ
المشاريع المسلمة بالكامل : ${completedProjectsCount} شقة/فيلا مستلمة هندسياً
مستوى رضا العملاء       : ${activeCompany.rating || 4.8} من 5.0 (أداء ممتاز)

--------------------------------------------------------
                 سجل سابقة الأعمال المنفذة (معرض الأعمال)
--------------------------------------------------------
إجمالي بنود سابقة الأعمال: ${portfolioCount} أعمال معروضة للجمهور
${(activeCompany.portfolio || []).map((p: any, idx: number) => `\n[${idx + 1}] ${p.projectName} - ${p.projectType}
    المحافظة: ${p.governorate}
    سنة التنفيذ: ${p.executionYear}
    الوصف الفني: ${p.description || 'لا يوجد وصف مضاف'}`).join('\n')}

--------------------------------------------------------
                 باقات التشطيب والأسعار الفورية المتاحة
--------------------------------------------------------
إجمالي الباقات النشطة   : ${packagesCount} باقات تشغيلية
${(activeCompany.packages || []).map((p: any, idx: number) => `\n[${idx + 1}] باقة ${p.name}
    سعر المتر المربع: ${p.pricePerSqm} ج.م
    نبذة الباقة: ${p.description || 'لا يوجد نبذة'}
    المواصفات المشروحة: ${p.features ? p.features.join('، ') : 'تأسيس وتشطيب متكامل'}`).join('\n')}

========================================================
صادر عن المنصة الهندسية الرقمية المعتمدة - شطبها © 2026
========================================================`;
    }
    
    const element = document.createElement("a");
    const file = new Blob([reportText], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = isEn ? `Shatibha_Performance_Report_${activeCompany.id}.txt` : `تقرير_أداء_شطبها_${activeCompany.companyName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Localized states for company profile editing
  const [companyCoverUrl, setCompanyCoverUrl] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [companyEstablishedYear, setCompanyEstablishedYear] = useState(2020);
  const [companyAboutText, setCompanyAboutText] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWhatsapp, setCompanyWhatsapp] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyOfficeAddress, setCompanyOfficeAddress] = useState('');
  
  // Package adding/editing states
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [profilePkgName, setProfilePkgName] = useState('');
  const [profilePkgPrice, setProfilePkgPrice] = useState(1500);
  const [profilePkgDesc, setProfilePkgDesc] = useState('');
  const [profilePkgFeatures, setProfilePkgFeatures] = useState<string[]>([]);
  const [profileTmpFeature, setProfileTmpFeature] = useState('');

  // Portfolio items adding states
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
  const [newPortName, setNewPortName] = useState('');
  const [newPortType, setNewPortType] = useState('سكني');
  const [newPortGov, setNewPortGov] = useState('القاهرة');
  const [newPortYear, setNewPortYear] = useState(2025);
  const [newPortDesc, setNewPortDesc] = useState('');
  const [newPortImg, setNewPortImg] = useState('');
  const [newPortBeforeImg, setNewPortBeforeImg] = useState('');
  const [newPortAfterImg, setNewPortAfterImg] = useState('');

  // Sync profile editing fields whenever activeCompany changes
  React.useEffect(() => {
    if (activeCompany) {
      setCompanyCoverUrl(activeCompany.coverUrl || '');
      setCompanyLogoUrl(activeCompany.logoUrl || '');
      setCompanyEstablishedYear(activeCompany.establishedYear || 2020);
      setCompanyAboutText(activeCompany.aboutText || '');
      setCompanyPhone(activeCompany.phone || '01004882911');
      setCompanyWhatsapp(activeCompany.whatsapp || '01004882911');
      setCompanyEmail(activeCompany.email || 'partner@shattabba.com');
      setCompanyWebsite(activeCompany.website || 'www.shattabba-partner.com');
      setCompanyOfficeAddress(activeCompany.officeAddress || 'شارع التسعين، التجمع الخامس');
    }
  }, [activeCompanyId, activeCompany]);

  // Handlers for company edits
  const handleSaveProfileAttributes = () => {
    if (onUpdateCompany) {
      onUpdateCompany(activeCompany.id, {
        coverUrl: companyCoverUrl,
        logoUrl: companyLogoUrl,
        establishedYear: companyEstablishedYear,
        aboutText: companyAboutText,
        phone: companyPhone,
        whatsapp: companyWhatsapp,
        email: companyEmail,
        website: companyWebsite,
        officeAddress: companyOfficeAddress
      });
    }
    alert(isEn ? 'Company profile updated successfully! All clients can view the changes in real-time.' : 'تم تحديث الملف التعريفي للشركة بنجاح! يمكن لجميع العملاء وتطبيق شطبها رؤية الباقات وإعدادات الهوية الفورية حالياً.');
  };

  const handleAddPackage = () => {
    if (!profilePkgName || !profilePkgPrice) return;
    const newPkg = {
      id: `PKG-${Date.now()}`,
      name: profilePkgName,
      pricePerSqm: profilePkgPrice,
      description: profilePkgDesc,
      features: profilePkgFeatures.length > 0 ? profilePkgFeatures : ['تأسيس سباكة معتمد', 'تجهيز دهانات جوتن', 'بنود تشطيب فاخرة']
    };
    
    const updatedPkgs = [...(activeCompany.packages || []), newPkg];
    if (onUpdateCompany) {
      onUpdateCompany(activeCompany.id, { packages: updatedPkgs });
    }
    
    setIsAddingPackage(false);
    setProfilePkgName('');
    setProfilePkgPrice(1500);
    setProfilePkgDesc('');
    setProfilePkgFeatures([]);
  };

  const handleDeletePackage = (pkgId: string) => {
    const updatedPkgs = (activeCompany.packages || []).filter((p: any) => p.id !== pkgId);
    if (onUpdateCompany) {
      onUpdateCompany(activeCompany.id, { packages: updatedPkgs });
    }
  };

  const handleAddPortfolioItem = () => {
    if (!newPortName) return;
    const newItem = {
      id: `PORT-${Date.now()}`,
      projectName: newPortName,
      projectType: newPortType,
      governorate: newPortGov,
      executionYear: newPortYear,
      description: newPortDesc,
      images: [newPortImg || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'],
      beforeImages: [newPortBeforeImg || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'],
      afterImages: [newPortAfterImg || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80']
    };

    const updatedPortfolio = [...(activeCompany.portfolio || []), newItem];
    if (onUpdateCompany) {
      onUpdateCompany(activeCompany.id, { portfolio: updatedPortfolio });
    }

    setIsAddingPortfolio(false);
    setNewPortName('');
    setNewPortDesc('');
    setNewPortImg('');
    setNewPortBeforeImg('');
    setNewPortAfterImg('');
  };

  const handleDeletePortfolioItem = (portId: string) => {
    const updatedPortfolio = (activeCompany.portfolio || []).filter((p: any) => p.id !== portId);
    if (onUpdateCompany) {
      onUpdateCompany(activeCompany.id, { portfolio: updatedPortfolio });
    }
  };

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState('');
  const [finishingLevelFilter, setFinishingLevelFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showAllActiveTenders, setShowAllActiveTenders] = useState(true);

  // Overlay page toggle ('PW' for previous works, 'PKG' for packages, null for requests main view)
  const [viewOverlay, setViewOverlay] = useState<'PW' | 'PKG' | null>(null);

  // Selected contracted project under execution
  const [selectedContractedId, setSelectedContractedId] = useState<string>('');

  // Selected completed project ID for depth-dive detailed warranty page
  const [selectedCompletedProjectId, setSelectedCompletedProjectId] = useState<string | null>(null);

  // Selected request for details dialog view or bidding
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(true);
  const [targetRequest, setTargetRequest] = useState<ClientRequest | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Offer fields
  const [price, setPrice] = useState<number>(230000);
  const [durationDays, setDurationDays] = useState<number>(120);
  const [description, setDescription] = useState('');
  const [materialsDetail, setMaterialsDetail] = useState('');
  const [warrantyDetail, setWarrantyDetail] = useState('');
  const [hasWarranty, setHasWarranty] = useState<boolean>(true);
  const [warrantyYears, setWarrantyYears] = useState<number>(5);
  const [selectedPortfolioPics, setSelectedPortfolioPics] = useState<string[]>(['🛋️ ريسبشن فاخر', '🍳 مطبخ مجهز']);

  const [isAIOptimizingDescription, setIsAIOptimizingDescription] = useState(false);
  const [isAIOptimizingMaterials, setIsAIOptimizingMaterials] = useState(false);
  const [aiOptimizeError, setAiOptimizeError] = useState<string | null>(null);

  const handleAIOptimize = async (isMaterials: boolean) => {
    const textToOptimize = isMaterials ? materialsDetail : description;
    if (!textToOptimize || textToOptimize.trim().length < 5) {
      alert(isEn ? "Please type a few rough words or bullets first, then click AI Optimize." : "يرجى كتابة بعض الكلمات البسيطة أو الملاحظات أولاً في الخانة ليتسنى للذكاء الاصطناعي صياغتها باحترافية وبشكل مفصل.");
      return;
    }

    if (isMaterials) setIsAIOptimizingMaterials(true);
    else setIsAIOptimizingDescription(true);
    setAiOptimizeError(null);

    try {
      const response = await fetch('/api/ai/optimize-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: textToOptimize,
          budget: targetRequest?.budget || price,
          area: targetRequest?.area || 120,
          unitType: targetRequest?.unitType || "شقة",
          isMaterials
        })
      });

      if (!response.ok) {
        throw new Error('Failed to optimize description');
      }

      const resData = await response.json();
      if (resData.success && resData.optimizedText) {
        if (isMaterials) {
          setMaterialsDetail(resData.optimizedText);
        } else {
          setDescription(resData.optimizedText);
        }
      } else {
        throw new Error('No optimized text was returned');
      }
    } catch (err: any) {
      console.error(err);
      setAiOptimizeError(isEn ? "Could not optimize the text. Please try again." : "عفوًا، تعذر تهيئة النص بالذكاء الاصطناعي حاليًا. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsAIOptimizingDescription(false);
      setIsAIOptimizingMaterials(false);
    }
  };

  // Dynamic state for Previous Works supporting up to 10 images with titles & descriptions
  const [previousWorks, setPreviousWorks] = useState<PreviousWork[]>([
    {
      id: 'PW-1',
      category: 'فيلا',
      title: 'فيلا نيوكلاسيك متكاملة بالتجمع',
      description: 'تشطيب فيلا راقية بمسطح 400 متر مربع بنظام كلاسيك كلاسيكي، رخام تندرا جراي في الاستقبال والصلونات الرئيسية، حديقة خارجية مدرجة.',
      images: ['🛋️ ريسبشن فاخر', '🏡 الواجهة الخارجية', '🛁 حمام مخصص', '🛏️ غرف نوم هادئة'],
      budget: 850000,
      area: 400,
      location: 'التجمع الخامس، القاهرة'
    },
    {
      id: 'PW-2',
      category: 'شقة',
      title: 'شقة اسكندنافي مودرن بالشيخ زايد',
      description: 'أرضيات باركيه طبيعي دافئ، مطبخ أمريكان مفتوح بفتحات تهوية وإضاءة خفية، جبس بورد مدمج لأسقف الغرف.',
      images: ['🍳 مطبخ مجهز', '🛋️ ريسبشن فاخر', '🪵 أرضيات باركيه'],
      budget: 350000,
      area: 120,
      location: 'الشيخ زايد، الجيزة'
    },
    {
      id: 'PW-3',
      category: 'مكتب',
      title: 'مقر إداري ومساحة عمل مشتركة بالمعادي',
      description: 'تصميم جدران عازلة للصوت، تمديدات شبكات سريعة وخفية لخدمة الموظفين، صالون استقبال كلاسيك لاستقبال العملاء والزوار.',
      images: ['🏢 صالة الاستقبال', '💼 مكتب رئيس مجلس الإدارة', '💡 أسقف بورد ليد'],
      budget: 620000,
      area: 250,
      location: 'المعادي، القاهرة'
    }
  ]);

  // Compatibility states for offer custom selections
  const [portfolioItems, setPortfolioItems] = useState([
    { id: '1', title: 'غرفة معيشة — لوكس', type: '🛋️ ريسبشن فاخر' },
    { id: '2', title: 'مطبخ — سوبر لوكس', type: '🍳 مطبخ مجهز' },
    { id: '3', title: 'حمام — سوبر بريميوم', type: '🛁 حمام مخصص' },
    { id: '4', title: 'غرفة نوم رئيسية مريحة', type: '🛏️ غرف نوم هادئة' }
  ]);
  const [newPortfolioTitle, setNewPortfolioTitle] = useState('');
  const [newPortfolioType, setNewPortfolioType] = useState('🛋️ ريسبشن فاخر');

  // Form states - New Previous Work
  const [newWorkCategory, setNewWorkCategory] = useState<'شقة' | 'فيلا' | 'مكتب'>('شقة');
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkDescription, setNewWorkDescription] = useState('');
  const [newWorkBudget, setNewWorkBudget] = useState<number>(300000);
  const [newWorkArea, setNewWorkArea] = useState<number>(120);
  const [newWorkLocation, setNewWorkLocation] = useState('');
  const [uploadedWorkImages, setUploadedWorkImages] = useState<string[]>([]);
  const [imageSelectorInputValue, setImageSelectorInputValue] = useState('');

  // Sabiqat-Al-Aamal scene suggestions for easy select up to 10
  const sceneSuggestions = [
    '🛋️ ريسبشن فاخر', '🍳 مطبخ مجهز', '🛁 حمام مخصص', '🛏️ غرف نوم هادئة', 
    '🏡 الواجهة الخارجية', '🍃 تراس ومساحة خارجية', '🪵 أرضيات باركيه', '💡 أسقف بورد ليد', 
    '🚪 تجاليد جدران خشبية', '🏢 صالة الاستقبال', '💼 مكتب رئيس مجلس الإدارة'
  ];

  // Pricing Packages state
  const [packages, setPackages] = useState([
    {
      id: 'PKG-1',
      name: isEn ? 'Classic Package' : 'الباقة الكلاسيكية (Classic)',
      description: isEn 
        ? 'Basic plush wall finishing, simple drop gypsum ceilings, Cleopatra first-class tiles, basic plumbing.'
        : 'تشطيب جدران قطيفة، أسقف جبس بورد بسيطة، سيراميك كليوباترا فرز أول، سباكة أساسية بضمان.',
      pricePerMeter: 3500,
      deliveryTime: isEn ? '90 Days' : '90 يوم',
      warrantyPeriod: isEn ? '5 Years' : '5 سنوات'
    },
    {
      id: 'PKG-2',
      name: isEn ? 'Silver Package' : 'الباقة الفضية (Silver)',
      description: isEn 
        ? 'Premium interior design, glowing LED ceiling levels, Cleopatra premium porcelain, certified plumbing.'
        : 'دهانات قطيفة وساتان حديثة، مستويات جبس بورد بإضاءات ليد، أرضيات بروسلين غرف وصالون، تأسيس سباكة معتمد.',
      pricePerMeter: 4800,
      deliveryTime: isEn ? '75 Days' : '75 يوم',
      warrantyPeriod: isEn ? '10 Years' : '10 سنوات'
    },
    {
      id: 'PKG-3',
      name: isEn ? 'Platinum Package' : 'الباقة البلاتينية (Platinum)',
      description: isEn 
        ? 'Luxury Italian style porcelain, fully customized gypsum shapes, original Jotun coats, Elsewedy electricity cabling.'
        : 'أرضيات بورسلين مستورد، أسقف جبس بورد مضيئة بكامل الوحدة، دهانات جوتن، معالجة وعزل، تأسيس ألماني وسويدي.',
      pricePerMeter: 6900,
      deliveryTime: isEn ? '60 Days' : '60 يوم',
      warrantyPeriod: isEn ? '15 Years' : '15 سنة'
    }
  ]);

  // Form states - New Package
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgDesc, setNewPkgDesc] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState<number>(3000);
  const [newPkgDelivery, setNewPkgDelivery] = useState('90 يوم');
  const [newPkgWarranty, setNewPkgWarranty] = useState('5 سنوات');

  // Edit existing pending offer helper
  const handleOpenEditOffer = (req: ClientRequest, offer: Offer | undefined) => {
    if (!offer) return;
    setTargetRequest(req);
    setEditingOffer(offer);
    setPrice(offer.price);
    setDurationDays(offer.durationDays);
    setDescription(offer.description);
    setMaterialsDetail(offer.materialsDetail || '');
    
    // Determine warranty state from the text
    const yearsMatch = offer.warrantyDetail?.match(/(\d+)\s*(سنوات|سنة|Years|Year)/i);
    if (yearsMatch) {
      setHasWarranty(true);
      setWarrantyYears(parseInt(yearsMatch[1], 10));
    } else if (offer.warrantyDetail?.includes('لا يوجد') || offer.warrantyDetail?.includes('No warranty')) {
      setHasWarranty(false);
    } else {
      setHasWarranty(true);
      setWarrantyYears(5);
    }

    setIsOfferModalOpen(true);
  };

  // Submit Offer
  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRequest) return;

    const calculatedWarranty = hasWarranty 
      ? (isEn ? `Yes, comprehensive warranty of ${warrantyYears} Years.` : `نعم، يوجد ضمان شامل لكافة أعمال التأسيس والتشطيب لمدة ${warrantyYears} سنوات.`)
      : (isEn ? 'No warranty provided.' : 'لا يوجد ضمان على هذا العرض.');

    if (editingOffer) {
      const updatedOffer: Offer = {
        ...editingOffer,
        price: Number(price),
        durationDays: Number(durationDays),
        description,
        materialsDetail,
        warrantyDetail: calculatedWarranty,
        createdAt: new Date().toISOString().split('T')[0]
      };
      if (onUpdateOffer) {
        onUpdateOffer(updatedOffer);
      }
    } else {
      const newOffer: Offer = {
        id: `OFFER-${Date.now()}`,
        requestId: targetRequest.id,
        companyId: activeCompany.id,
        companyName: activeCompany.companyName,
        price: Number(price),
        durationDays: Number(durationDays),
        description,
        materialsDetail,
        warrantyDetail: calculatedWarranty,
        portfolio: [], // Removed option to attach portfolio samples as requested
        createdAt: new Date().toISOString().split('T')[0]
      };

      onSubmitOffer(newOffer);
    }

    setIsOfferModalOpen(false);
    setEditingOffer(null);
    setDescription('');
    setMaterialsDetail('');
    setPrice(230000);
    setDurationDays(120);
    setHasWarranty(true);
    setWarrantyYears(5);
    setTargetRequest(null);
  };

  // Geo-Matching matching filter criteria in compliance with PDF page 4
  const matchedRequests = requests.filter(req => {
    if (ignoredRequestIds.includes(req.id)) return false;
    // 1. Matches governorates with bilingual/whitespace normalizer
    const matchesGov = activeCompany.governorates.some(gov => normalizeValue(gov) === normalizeValue(req.governorate));
    // 2. Matches finishing levels with bilingual/whitespace normalizer
    const matchesLevel = activeCompany.finishingTypes.some(level => normalizeValue(level) === normalizeValue(req.finishingLevel));
    // 3. Status is live pricing
    const isLive = req.status === 'UNDER_PRICING' || req.status === 'OFFERS_RECEIVED' || req.status === 'APPROVED_FOR_BIDDING' || req.status === 'BIDDING_OPEN';

    if (showAllActiveTenders) {
      return isLive;
    }
    return matchesGov && matchesLevel && isLive;
  });

  // Submitted offers from COMP-1
  const mySubmittedOffers = offers.filter(o => o.companyId === activeCompany.id);

  // Search, property type, and finishing level matching helper
  const matchTextAndFilters = (req: ClientRequest) => {
    if (unitTypeFilter && req.unitType !== unitTypeFilter) return false;
    if (finishingLevelFilter && req.finishingLevel !== finishingLevelFilter) return false;
    if (locationFilter) {
      const govVal = req.governorate || '';
      const cityVal = req.city || '';
      const isGovMatch = govVal.toLowerCase().includes(locationFilter.toLowerCase());
      const isCityMatch = cityVal.toLowerCase().includes(locationFilter.toLowerCase());
      if (!isGovMatch && !isCityMatch) return false;
    }
    
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      req.id.toLowerCase().includes(term) ||
      req.governorate.toLowerCase().includes(term) ||
      (req.city && req.city.toLowerCase().includes(term)) ||
      req.unitType.toLowerCase().includes(term) ||
      req.finishingLevel.toLowerCase().includes(term) ||
      (req.clientName && req.clientName.toLowerCase().includes(term))
    );
  };

  // 1. New Requests Tab - Geo-matched and active pricing status
  const filteredNewRequests = matchedRequests.filter(matchTextAndFilters);

  // 2. Active Projects Tab - ACTIVE status with standard filters
  const filteredActiveProjects = requests.filter(req => 
    (req.status === 'ACTIVE' || req.status === 'CONTRACT_SIGNED' || req.status === 'CONTRACTED') && matchTextAndFilters(req)
  );

  // 3. Submitted Bids Tab - Active proposals submitted by COMP-1
  const filteredSubmittedBids = requests.filter(req => 
    mySubmittedOffers.some(o => o.requestId === req.id) && matchTextAndFilters(req)
  );

  // 4. Won Bids Tab - offers accepted (CLIENT_SELECTED or COORDINATION or ACTIVE from COMP-1)
  const filteredWonBids = requests.filter(req => 
    (req.status === 'CLIENT_SELECTED' || req.status === 'COORDINATION' || req.status === 'WAITING_FOR_INSPECTION' || ((req.status === 'ACTIVE' || req.status === 'CONTRACT_SIGNED' || req.status === 'CONTRACTED') && (mySubmittedOffers.some(o => o.requestId === req.id) || contracts.some(c => c.requestId === req.id && c.companyId === activeCompany.id)))) && matchTextAndFilters(req)
  );

  // 5. Completed Projects Tab - completed contracts for COMP-1
  const filteredCompletedProjects = requests.filter(req => 
    req.status === 'COMPLETED' && (contracts.some(c => c.requestId === req.id && c.companyId === activeCompany.id) || req.id === 'REQ-005' || req.id === 'REQ-006') && matchTextAndFilters(req)
  );

  // CSV Report Generator and Downloader compliant with PDF Page 4
  const handleExportReport = (tab: string) => {
    let itemsToExport: ClientRequest[] = [];
    let reportTitle = "Contractor_Report";

    if (tab === 'NEW_REQUESTS') {
      itemsToExport = filteredNewRequests;
      reportTitle = "New_Requests_Report";
    } else if (tab === 'ACTIVE_PROJECTS') {
      itemsToExport = filteredActiveProjects;
      reportTitle = "Active_Projects_Report";
    } else if (tab === 'SUBMITTED_BIDS') {
      itemsToExport = filteredSubmittedBids;
      reportTitle = "Submitted_Bids_Report";
    } else if (tab === 'WON_BIDS') {
      itemsToExport = filteredWonBids;
      reportTitle = "Won_Bids_Report";
    } else {
      itemsToExport = filteredCompletedProjects;
      reportTitle = "Completed_Projects_Report";
    }

    const headers = "Project ID,Region,Property Type,Finishing Level,Budget,Area,Status\n";
    const rows = itemsToExport.map(item => 
      `"${item.id}","${item.governorate} - ${item.city || ''}","${item.unitType}","${item.finishingLevel}",${item.budget || 0},${item.area || 0},"${item.status}"`
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `${reportTitle}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Counts
  const matchedCount = filteredNewRequests.length;
  const activeBidsCount = filteredSubmittedBids.length;
  const wonBidsCount = filteredWonBids.length;
  const completedProjectsCount = filteredCompletedProjects.length;

  return (
    <div className={`${isEn ? 'dir-ltr text-left' : 'dir-rtl text-right'} font-sans min-h-screen bg-[#F0F3F7] pb-20`}>
      {/* MOBILE & DESKTOP TOP HEADER BAR */}
      <div className="bg-[#232F3F] text-white px-4 py-3 flex items-center justify-between border-b border-[#D8B448] shadow-sm z-30 w-full shrink-0 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏢</span>
          <div className="text-right">
            <h1 className="text-sm font-black text-white">
              {isEn ? "Shatibha Contractor Portal" : "لوحة تحكم شركة المقاولات"}
            </h1>
            <p className="text-[9px] text-gray-400">
              {isEn ? "Secure Competitive Bidding" : "عروض الأسعار وضمان الجودة الهندسية"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {setLang && (
            <button
              onClick={() => setLang(isEn ? 'ar' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[11px] font-black hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <Globe className="w-3 h-3 text-[#D8B448]" />
              <span>{isEn ? 'العربية' : 'English'}</span>
            </button>
          )}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-black hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>{isEn ? 'Sign Out' : 'تسجيل الخروج'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom print CSS for seamless printable reports */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-report-area {
            position: absolute;
            right: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            direction: rtl !important;
          }
        }
      `}} />
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-150 px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm no-print">
        <div className={isEn ? 'text-left' : 'text-right'}>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-black text-[#2B4D89] flex items-center gap-2">
              <span>🏢</span> {isEn ? `Contractor Board: ${activeCompany.companyName}` : `لوحة تحكم شركة المقاولات: ${activeCompany.companyName}`}
            </h2>
            {activeCompany.isVerified && (
              <span className="bg-blue-500 text-white rounded-full p-0.5 inline-flex items-center justify-center font-sans text-[11px] font-black w-4.5 h-4.5 shadow-sm" title={isEn ? "Premium Verified" : "شركة موثقة ومعتمدة بالعلامة الزرقاء"}>
                ✓
              </span>
            )}

            {/* Rating Stars */}
            <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-100 text-xs text-amber-700">
              <div className="flex text-amber-500 font-serif leading-none mt-0.5 font-bold">
                {"★".repeat(Math.round(activeCompany.rating || 5))}
                {"☆".repeat(5 - Math.round(activeCompany.rating || 5))}
              </div>
              <span className="font-mono text-[11px] font-black">({activeCompany.rating || 4.8})</span>
            </div>

            {/* Dynamic Company Switcher for testing multi-company competitive bidding */}
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl text-right">
              <span className="text-[11px] font-bold text-orange-800">{isEn ? 'Switch Active Company (Simulate Multi-Bids):' : 'تغيير شركة المقاولات للتجربة والمقارنة:'}</span>
              <select
                value={activeCompanyId}
                onChange={e => setActiveCompanyId(e.target.value)}
                className="bg-white border border-orange-200 text-xs rounded-lg px-2 py-1 font-black text-orange-900 outline-none cursor-pointer shadow-xs"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} {c.id === 'COMP-1' ? '⚙️' : c.id === 'COMP-2' ? '📐' : c.id === 'COMP-3' ? '🎨' : '🏗️'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 mt-1 font-semibold">
            {activeCompany.isVerified
              ? (isEn ? `🛡️ Official Shattebha Verified Corporate Partner • Active Governorates: ${activeCompany.governorates.map(g => g === 'القاهرة' ? 'Cairo' : 'Giza').join(', ')}` : `🛡️ شريك شركات رسمي معتمد لدى شطبها • النطاق الجغرافي النشط: ${activeCompany.governorates.join('، ')}`)
              : (isEn ? `Registered Contractor • Active Governorates: ${activeCompany.governorates.map(g => g === 'القاهرة' ? 'Cairo' : 'Giza').join(', ')}` : `مقاول مسجل • النطاق الجغرافي النشط: ${activeCompany.governorates.join('، ')}`)}
          </p>
        </div>

        {/* Action Buttons to Toggle Previous Works and Packages */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setViewOverlay(viewOverlay === 'PW' ? null : 'PW')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 duration-150 border ${
              viewOverlay === 'PW'
                ? 'bg-[#2B4D89] text-white border-[#2B4D89] scale-102 ring-2 ring-[#2B4D89]/20'
                : 'bg-white hover:bg-gray-50 text-[#2B4D89] border-gray-200 hover:border-[#2B4D89]/40'
            }`}
          >
            <span className="text-sm">🖼️</span>
            <span>{isEn ? 'Company Portfolio' : 'معرض سابقة أعمال الشركة'}</span>
          </button>

          <button
            onClick={() => setViewOverlay(viewOverlay === 'PKG' ? null : 'PKG')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 duration-150 border ${
              viewOverlay === 'PKG'
                ? 'bg-amber-600 text-white border-amber-600 scale-102 ring-2 ring-amber-600/20'
                : 'bg-white hover:bg-gray-50 text-amber-700 border-gray-200 hover:border-amber-600/40'
            }`}
          >
            <span className="text-sm">🏷️</span>
            <span>{isEn ? 'Pricing Packages' : 'باقات التشطيب والأسعار'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPerformanceReport}
            className="px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 duration-150 border bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 border-emerald-250 hover:border-emerald-400 group"
            title={isEn ? 'Generate downloadable periodic company performance log' : 'تنزيل وتحميل تقرير النشاط والتقييم والمشروعات المنفذة للشركة'}
          >
            <Download className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition-transform" />
            <span>{isEn ? 'Download Performance Report' : 'تحميل تقرير الأداء 📊'}</span>
          </button>
          
          <div className="bg-[#F0F3F7] text-[#1D4A3D] border border-emerald-500/20 px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            {isEn ? 'Subbidding Active' : 'حساب العطاءات نشط'}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
        
        {/* Waiting for Technical Inspection Warning Banner */}
        {requests.some(r => r.status === 'WAITING_FOR_INSPECTION') && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/70 rounded-3xl p-5 flex items-start gap-4 shadow-xs text-right animate-fade-in animate-pulse no-print">
            <span className="text-2xl mt-0.5 shrink-0 select-none">⏳</span>
            <div className="flex-1">
              <h5 className="font-extrabold text-xs text-amber-850">
                {isEn ? 'Finishing Projects Awaiting Admin Approval & Technical Auditing' : 'تنبيه: مشاريع في انتظار المعاينة الفنية والاعتماد من الإدارة 🛠️'}
              </h5>
              <p className="text-[10px] text-amber-750/90 mt-1 leading-relaxed font-bold">
                {isEn 
                  ? 'There are property finishing projects awaiting critical on-site inspection and contract approval. You will be notified immediately once approved and activated by the platform admin.'
                  : 'تنبيه لشركتكم: يوجد مشاريع معلقة بانتظار قيام مشرف شطبها الفني بالمعاينة الهندسية وتدقيق البنود والأسعار. سيتم إطلاق المشروع لشركتكم لبدء العمل واستلام الدفعات فور اعتماد الإدارة للتعاقد.'}
              </p>
            </div>
          </div>
        )}

        {/* STATS ROW & CATEGORY NAVIGATOR - HIGHLY POLISHED CLICKABLE SQUARES AS REQUESTED */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8 no-print">
          {/* Card 1: طلبات جديدة */}
          <button
            onClick={() => {
              setActiveTab('NEW_REQUESTS');
              setSearchTerm('');
              setSelectedCompletedProjectId(null);
              setViewOverlay(null);
            }}
            className={`p-4 rounded-2xl border transition-all text-right flex items-center justify-between min-h-[92px] w-full cursor-pointer group ${
              activeTab === 'NEW_REQUESTS' && viewOverlay === null
                ? 'bg-[#2B4D89] text-white border-[#2B4D89] shadow-lg shadow-blue-900/10 scale-[1.01]'
                : 'bg-white text-gray-700 border-gray-150 hover:border-gray-300 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              {/* Large Logo */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${
                activeTab === 'NEW_REQUESTS' && viewOverlay === null ? 'bg-white/15 text-white' : 'bg-[#2B4D89]/10 text-[#2B4D89]'
              }`}>
                📥
              </div>
              {/* Title and Value underneath */}
              <div className="space-y-0.5 text-right flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-extrabold leading-tight ${activeTab === 'NEW_REQUESTS' && viewOverlay === null ? 'text-blue-105' : 'text-gray-805'}`}>
                  {isEn ? 'New Requests' : 'طلبات عاجلة مطابقة'}
                </p>
                <p className={`text-2xl font-black leading-none mt-1.5 ${activeTab === 'NEW_REQUESTS' && viewOverlay === null ? 'text-white' : 'text-[#2B4D89]'}`}>
                  {matchedCount}
                </p>
              </div>
            </div>
            {activeTab === 'NEW_REQUESTS' && viewOverlay === null && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block animate-pulse shrink-0"></span>
            )}
          </button>

          {/* Card 2: المشروعات النشطة */}
          <button
            onClick={() => {
              setActiveTab('ACTIVE_PROJECTS');
              setSearchTerm('');
              setSelectedCompletedProjectId(null);
              setViewOverlay(null);
            }}
            className={`p-4 rounded-2xl border transition-all text-right flex items-center justify-between min-h-[92px] w-full cursor-pointer group ${
              activeTab === 'ACTIVE_PROJECTS' && viewOverlay === null
                ? 'bg-[#1D4A3D] text-white border-[#1D4A3D] shadow-lg shadow-emerald-950/10 scale-[1.01]'
                : 'bg-white text-gray-700 border-gray-150 hover:border-gray-300 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              {/* Large Logo */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${
                activeTab === 'ACTIVE_PROJECTS' && viewOverlay === null ? 'bg-white/15 text-white' : 'bg-[#1D4A3D]/10 text-[#1D4A3D]'
              }`}>
                👷
              </div>
              {/* Title and Value underneath */}
              <div className="space-y-0.5 text-right flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-extrabold leading-tight ${activeTab === 'ACTIVE_PROJECTS' && viewOverlay === null ? 'text-teal-100' : 'text-gray-855'}`}>
                  {isEn ? 'Active Projects' : 'المشروعات النشطة بالشركة'}
                </p>
                <p className={`text-2xl font-black leading-none mt-1.5 ${activeTab === 'ACTIVE_PROJECTS' && viewOverlay === null ? 'text-white' : 'text-[#1D4A3D]'}`}>
                  {myContractedProjects.length}
                </p>
              </div>
            </div>
            {activeTab === 'ACTIVE_PROJECTS' && viewOverlay === null && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block animate-pulse shrink-0"></span>
            )}
          </button>

          {/* Card 3: عروض قمت بتقديمها */}
          <button
            onClick={() => {
              setActiveTab('SUBMITTED_BIDS');
              setSearchTerm('');
              setSelectedCompletedProjectId(null);
              setViewOverlay(null);
            }}
            className={`p-4 rounded-2xl border transition-all text-right flex items-center justify-between min-h-[92px] w-full cursor-pointer group ${
              activeTab === 'SUBMITTED_BIDS' && viewOverlay === null
                ? 'bg-[#D8B448] text-[#1E293B] border-[#D8B448] shadow-lg shadow-amber-900/10 scale-[1.01]'
                : 'bg-white text-gray-700 border-gray-150 hover:border-gray-300 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              {/* Large Logo */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${
                activeTab === 'SUBMITTED_BIDS' && viewOverlay === null ? 'bg-[#1E293B]/10 text-[#1E293B]' : 'bg-[#D8B448]/15 text-[#856404]'
              }`}>
                📝
              </div>
              {/* Title and Value underneath */}
              <div className="space-y-0.5 text-right flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-extrabold leading-tight ${activeTab === 'SUBMITTED_BIDS' && viewOverlay === null ? 'text-[#1E293B]' : 'text-gray-855'}`}>
                  {isEn ? 'Bids Submitted' : 'العروض المقدمة والمقترحات'}
                </p>
                <p className={`text-2xl font-black leading-none mt-1.5 ${activeTab === 'SUBMITTED_BIDS' && viewOverlay === null ? 'text-[#1E293B]' : 'text-[#D8B448]'}`}>
                  {activeBidsCount}
                </p>
              </div>
            </div>
            {activeTab === 'SUBMITTED_BIDS' && viewOverlay === null && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B] block animate-pulse shrink-0"></span>
            )}
          </button>
          {/* Card 4: عطاءات فازت وقبلها العميل */}
          <button
            onClick={() => {
              setActiveTab('WON_BIDS');
              setSearchTerm('');
              setSelectedCompletedProjectId(null);
              setViewOverlay(null);
            }}
            className={`p-4 rounded-2xl border transition-all text-right flex items-center justify-between min-h-[92px] w-full cursor-pointer group ${
              activeTab === 'WON_BIDS' && viewOverlay === null
                ? 'bg-purple-800 text-white border-purple-800 shadow-lg shadow-purple-900/10 scale-[1.01]'
                : 'bg-white text-gray-700 border-gray-150 hover:border-gray-300 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              {/* Large Logo */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${
                activeTab === 'WON_BIDS' && viewOverlay === null ? 'bg-white/15 text-white' : 'bg-purple-50 text-purple-750'
              }`}>
                🏆
              </div>
              {/* Title and Value underneath */}
              <div className="space-y-0.5 text-right flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-extrabold leading-tight ${activeTab === 'WON_BIDS' && viewOverlay === null ? 'text-purple-100' : 'text-gray-855'}`}>
                  {isEn ? 'Tenders Won' : 'المناقصات المقبولة فائزة'}
                </p>
                <p className={`text-2xl font-black leading-none mt-1.5 ${activeTab === 'WON_BIDS' && viewOverlay === null ? 'text-white' : 'text-purple-705'}`}>
                  {wonBidsCount}
                </p>
              </div>
            </div>
            {activeTab === 'WON_BIDS' && viewOverlay === null && (
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 block animate-pulse shrink-0"></span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('COMPLETED_PROJECTS');
              setSearchTerm('');
              setSelectedCompletedProjectId(null);
              setViewOverlay(null);
            }}
            className={`p-4 rounded-2xl border transition-all text-right flex items-center justify-between min-h-[92px] w-full cursor-pointer group ${
              activeTab === 'COMPLETED_PROJECTS' && viewOverlay === null
                ? 'bg-blue-600 text-white border-[#2B4D89] shadow-lg shadow-blue-950/10 scale-[1.01]'
                : 'bg-white text-gray-700 border-gray-150 hover:border-gray-300 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              {/* Large Logo */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${
                activeTab === 'COMPLETED_PROJECTS' && viewOverlay === null ? 'bg-white/15 text-white' : 'bg-blue-50 text-blue-655'
              }`}>
                ✅
              </div>
              {/* Title and Value underneath */}
              <div className="space-y-0.5 text-right flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-extrabold leading-tight ${activeTab === 'COMPLETED_PROJECTS' && viewOverlay === null ? 'text-blue-100' : 'text-gray-855'}`}>
                  {isEn ? 'Completed' : 'مشاريع تم تسليمها بنجاح'}
                </p>
                <p className={`text-2xl font-black leading-none mt-1.5 ${activeTab === 'COMPLETED_PROJECTS' && viewOverlay === null ? 'text-white' : 'text-blue-600'}`}>
                  {completedProjectsCount}
                </p>
              </div>
            </div>
            {activeTab === 'COMPLETED_PROJECTS' && viewOverlay === null && (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 block animate-pulse shrink-0"></span>
            )}
          </button>

          {/* Card 6: الملف الشخصي وإعدادات باقات الشركة */}
          <button
            onClick={() => {
              setActiveTab('COMPANY_PROFILE');
              setSearchTerm('');
              setSelectedCompletedProjectId(null);
              setViewOverlay(null);
            }}
            className={`p-4 rounded-2xl border transition-all text-right flex items-center justify-between min-h-[92px] w-full cursor-pointer group ${
              activeTab === 'COMPANY_PROFILE' && viewOverlay === null
                ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-900/10 scale-[1.01]'
                : 'bg-white text-gray-750 border-gray-150 hover:border-gray-305 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              {/* Large icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${
                activeTab === 'COMPANY_PROFILE' && viewOverlay === null ? 'bg-white/15 text-white' : 'bg-amber-500/10 text-amber-700'
              }`}>
                🏢
              </div>
              {/* Title and Value underneath */}
              <div className="space-y-0.5 text-right flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-extrabold leading-tight ${activeTab === 'COMPANY_PROFILE' && viewOverlay === null ? 'text-amber-100' : 'text-gray-805'}`}>
                  {isEn ? 'Company Profile' : 'الملف وباقات الشركة'}
                </p>
                <div className="flex items-center gap-1 justify-end mt-1.5">
                  <span className={`text-[10px] font-bold ${activeTab === 'COMPANY_PROFILE' && viewOverlay === null ? 'text-white' : 'text-amber-800'}`}>
                    ⚙️ {isEn ? 'Customize' : 'تحديث وتخصيص'}
                  </span>
                </div>
              </div>
            </div>
            {activeTab === 'COMPANY_PROFILE' && viewOverlay === null && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 block animate-pulse shrink-0"></span>
            )}
          </button>
        </div>

        <div className="w-full">
          {viewOverlay === null && (
            <div className="w-full space-y-6">
            
            {/* SEARCH, FILTER & REPORT EXPORT TOOLBAR */}
            <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-4 no-print">
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial min-w-[190px]">
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isEn ? 'Search ID, region, client...' : 'ابحث برقم العقار، العميل، المنطقة...'}
                    className="placeholder:text-gray-400 w-full pr-9 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#2B4D89] transition-all font-semibold"
                  />
                </div>

                {/* Unit Type option */}
                <select
                  value={unitTypeFilter}
                  onChange={(e) => setUnitTypeFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl text-xs py-2 px-3 outline-none focus:bg-white focus:border-[#2B4D89] font-bold text-gray-600"
                >
                  <option value="">{isEn ? 'All Types' : 'جميع العقارات'}</option>
                  <option value="شقة">{isEn ? 'Apartment' : 'شقة'}</option>
                  <option value="فيلا">{isEn ? 'Villa' : 'فيلا'}</option>
                  <option value="مكتب">{isEn ? 'Office' : 'مكتب'}</option>
                </select>

                {/* Finishing level option */}
                <select
                  value={finishingLevelFilter}
                  onChange={(e) => setFinishingLevelFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl text-xs py-2 px-3 outline-none focus:bg-white focus:border-[#2B4D89] font-bold text-gray-600"
                >
                  <option value="">{isEn ? 'All Finishes' : 'جميع التشطيبات'}</option>
                  <option value="لوكس">{isEn ? 'Lux' : 'لوكس'}</option>
                  <option value="سوبر لوكس">{isEn ? 'Super Lux' : 'سوبر لوكس'}</option>
                  <option value="بريميوم">{isEn ? 'Premium' : 'بريميوم'}</option>
                </select>

                {/* Location option */}
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl text-xs py-2 px-3 outline-none focus:bg-white focus:border-[#2B4D89] font-bold text-gray-600"
                >
                  <option value="">{isEn ? 'All Locations' : 'جميع المحافظات'}</option>
                  <option value="القاهرة">{isEn ? 'Cairo' : 'القاهرة'}</option>
                  <option value="الجيزة">{isEn ? 'Giza' : 'الجيزة'}</option>
                  <option value="الإسكندرية">{isEn ? 'Alexandria' : 'الإسكندرية'}</option>
                  <option value="القليوبية">{isEn ? 'Qalyubia' : 'القليوبية'}</option>
                </select>

                {/* Show All Active Tenders Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer bg-blue-55/65 hover:bg-blue-100/85 border border-blue-200/50 rounded-xl px-3 py-2 text-xs font-black transition-all text-[#2B4D89]">
                  <input
                    type="checkbox"
                    checked={showAllActiveTenders}
                    onChange={(e) => setShowAllActiveTenders(e.target.checked)}
                    className="rounded border-gray-300 text-[#2B4D89] focus:ring-[#2B4D89] w-4 h-4 cursor-pointer"
                  />
                  <span>{isEn ? 'All Tenders 🌐' : 'كل مناقصات شطبها 🌐'}</span>
                </label>
              </div>

              {/* Export Buttons Cockpit */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* CSV Exporter */}
                <button
                  type="button"
                  onClick={() => handleExportReport(activeTab)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <Download className="w-4 h-4 text-[#D8B448]" />
                  <span>{isEn ? 'Export Excel (CSV) 📊' : 'تصدير إكسيل Excel 📊'}</span>
                </button>

                {/* PDF Printer */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#2B4D89] hover:bg-[#1E3254] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <Printer className="w-4 h-4 text-[#D8B448]" />
                  <span>{isEn ? 'Print / PDF 🖨️' : 'طباعة وتصدير PDF 🖨️'}</span>
                </button>
              </div>
            </div>

            {/* DYNAMIC LISTING TABLE */}
            {selectedCompletedProjectId && activeTab === 'COMPLETED_PROJECTS' ? (
              (() => {
                const req = requests.find(r => r.id === selectedCompletedProjectId);
                if (!req) return null;
                return (
                  <div className="bg-white rounded-2xl border border-gray-150 shadow-md p-6 md:p-8 space-y-6 text-right animate-fadeIn">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-5 w-full">
                      <button 
                        onClick={() => setSelectedCompletedProjectId(null)}
                        className="w-full sm:w-auto text-xs bg-gray-150 hover:bg-gray-200 text-gray-700 px-4.5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-gray-200"
                      >
                        <span>{isEn ? '← Back to Completed Projects' : '← العودة لقائمة المشاريع المنجزة'}</span>
                      </button>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-black px-3.5 py-1.5 rounded-xl">
                          {isEn ? 'Verification Code: SH-SECURE' : 'كود التحقق: SH-72993-M'}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                          <span className="w-2   h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          {isEn ? 'Contract Certified' : 'عقد معتمد ومسلم'}
                        </span>
                      </div>
                    </div>

                    {/* Big Banner */}
                    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-blue-700 via-[#1E3A8A] to-[#111827] text-white overflow-hidden relative shadow-sm">
                      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
                      <div className="relative z-10 space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full border border-blue-400/25">
                          {isEn ? 'Triple Warranty Gold Certificate' : 'شهادة شطبها للضمان الثلاثي الذهبي'}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                          {isEn ? `Property Finishing Complete: ${req.id}` : `اكتمال أعمال تشطيب العقار: ${req.id}`}
                        </h2>
                        <p className="text-gray-300 text-xs md:text-sm max-w-2xl font-medium leading-relaxed">
                          {isEn 
                            ? `Delivered to client ${req.clientName || 'Partner Customer'} under compliance parameters of Shattebha engineering standard specifications. Secure escrow funds cleared.` 
                            : `تم تسليم الوحدة السكنية للعميل ${req.clientName || 'أ. محمد عبد الله'} بموجب محاضر الإشراف الهندسي المعتمدة ومطابقة الكود المصري والدولي للتشييد والتشطيب.`}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold text-gray-200">
                          <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 font-sans">📍 {req.governorate}، {req.city}</span>
                          <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 font-sans">🏠 {req.unitType}</span>
                          <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 font-sans">💎 {req.finishingLevel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Warranty Countdown Block */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      
                      {/* Left Block: Interactive Real-Time Countdown */}
                      <div className="lg:col-span-7 bg-amber-50/50 border border-amber-200/60 rounded-3xl p-6 flex flex-col justify-between space-y-6 text-right">
                        <div>
                          <span className="text-lg">🛡️</span>
                          <h4 className="font-extrabold text-[#2B4D89] text-base mt-2">
                            {isEn ? 'Active Triple Warranty Countdown' : 'عداد الضمان الثلاثي التنازلي المباشر'}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 font-semibold">
                            {isEn 
                              ? 'Real-time countdown covering finishing material durability, electro-mechanical setups, and structural compliance.' 
                              : 'العد التنازلي التفاعلي يوضح الأيام والشهور والساعات المتبقية على انتهاء فترة التغطية والصيانة الدورية المجانية.'}
                          </p>
                        </div>

                        {/* RENDER THE DETAILED WRNTY COUNTDOWN */}
                        <WarrantyCountdown deliveryDateStr={req.inspectionDate || '2026-06-02'} isEn={isEn} />
                      </div>

                      {/* Right Block: Official Certification Data */}
                      <div className="lg:col-span-5 bg-gray-50 border border-gray-150 rounded-3xl p-6 space-y-4">
                        <h4 className="font-extrabold text-sm text-[#2B4D89]">
                          {isEn ? 'Warranty Certificate Specifications' : 'المواصفات الفنية المشمولة بالضمان'}
                        </h4>
                        
                        <div className="space-y-3 text-xs font-semibold text-gray-650">
                          <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100">
                            <span className="text-gray-400 font-bold">{isEn ? 'Warranty Code' : 'رقم وثيقة الضمان'}</span>
                            <span className="font-mono font-black text-[#2B4D89]">W-TRPL-{req.id}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100">
                            <span className="text-gray-400 font-bold">{isEn ? 'Handover Date' : 'تاريخ محضر التسليم'}</span>
                            <span className="font-mono font-black text-emerald-700">{req.inspectionDate || '2026-01-02'}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100">
                            <span className="text-gray-400 font-bold">{isEn ? 'Coverage Terms' : 'اتفاقية التغطية المعتمدة'}</span>
                            <span className="font-sans font-black text-amber-500">{isEn ? '3 Years Shield Cover' : 'ضمان ٣ سنوات كاملة'}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100">
                            <span className="text-gray-400 font-bold">{isEn ? 'Insurance Partner' : 'الجهة الضامنة'}</span>
                            <span className="font-sans font-black text-blue-700 flex items-center gap-1">
                              <span>✓</span> {isEn ? 'Shattebha Insurance' : 'شحن وتأمين شطبها'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 text-[11px] text-gray-400 leading-relaxed text-right font-medium bg-amber-50/20 border border-dashed border-amber-200 p-3 rounded-xl">
                          💡 {isEn 
                            ? 'Our warranty is legally binding. Sub-bid contractors are backed by Egyptian federation builders code 651.' 
                            : 'الضمان ملزم قانونياً ويشمل إصلاح وصيانة مجانية لأي خلل طارئ بالتنسيق مع مهندس الضمان الخاص بمنصة شطبها.'}
                        </div>
                      </div>

                    </div>

                    {/* Portfolio Works Done Reference Gallery */}
                    <div className="border-t border-gray-100 pt-6 space-y-4">
                      <h4 className="font-extrabold text-sm text-[#2B4D89]">
                        {isEn ? 'Delivered Finishing Work & Proof Pictures' : 'مستندات تسليم الأعمال الموثقة بالصور للمشروع'}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { title: isEn ? 'Finished Reception' : '🛋️ صالة الاستقبال والريسبشن بالكامل', spec: 'دهانات جوتن ونقوش ليد' },
                          { title: isEn ? 'Bathroom details' : '🛁 تمديدات السباكة والمطبخ المعالجة', spec: 'تأسيس ألماني مع اختبار ضغط' },
                          { title: isEn ? 'LED lighting layers' : '💡 الإضاءات المخفية والأسقف الجبسية', spec: 'توزيع تيار ذكي مأمن' },
                          { title: isEn ? 'Flooring premium porcelain' : '🪵 أرضيات بورسلين وسيراميك فرز أول', spec: 'فواصل تمدد مقاومة وعزل رطوبة' }
                        ].map((item, index) => (
                          <div key={index} className="p-3.5 bg-gray-50 border border-gray-150 rounded-2xl flex flex-col justify-between text-right">
                            <span className="text-xs font-black text-gray-750">{item.title}</span>
                            <span className="text-[10px] text-gray-400 font-bold mt-1 block">{item.spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action button to print or close */}
                    <div className="flex flex-col sm:flex-row gap-2.5 justify-start pt-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="bg-[#1D4A3D] hover:bg-[#15362C] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                      >
                        🛡️ {isEn ? 'Print Official Warranty Certificate' : 'تحميل وطباعة شهادة الضمان المعتمدة'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCompletedProjectId(null)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-750 font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer transition-all hover:scale-[1.01]"
                      >
                        {isEn ? 'Close Details' : 'رجوع وإغلاق التفاصيل'}
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : activeTab === 'COMPANY_PROFILE' ? (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 1. Header Profile Cover & Branding Area */}
                <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm">
                  {/* Cover Photo */}
                  <div className="relative h-48 bg-slate-900">
                    <img 
                      src={companyCoverUrl || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover opacity-60"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    
                    {/* Simulated Cover Edit */}
                    <button
                      type="button"
                      onClick={() => {
                        const bgPresets = [
                          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
                          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
                          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
                        ];
                        setCompanyCoverUrl(bgPresets[Math.floor(Math.random() * bgPresets.length)]);
                      }}
                      className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white text-[10px] px-3 py-1.5 rounded-lg border border-white/10 cursor-pointer font-bold transition-all"
                    >
                      🖼️ تغيير صورة الغلاف (محاكاة)
                    </button>

                    {/* Logo & Initials badge */}
                    <div className="absolute -bottom-6 right-8 flex items-center gap-4 text-right flex-row-reverse">
                      <div className="w-20 h-20 rounded-2xl bg-white p-1 border-2 border-[#2B4D89] shadow-md overflow-hidden relative flex items-center justify-center shrink-0">
                        {companyLogoUrl ? (
                          <img src={companyLogoUrl} alt="Logo Preview" className="w-full h-full object-contain rounded-xl" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-[#2B4D89] to-[#3a5d9c] text-white flex items-center justify-center text-xl font-black rounded-xl">
                            {activeCompany.companyName?.slice(0, 2) || 'تش'}
                          </div>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => {
                            const logoPresets = [
                              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
                              'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=150&q=80',
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
                            ];
                            setCompanyLogoUrl(logoPresets[Math.floor(Math.random() * logoPresets.length)]);
                          }}
                          className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white text-[8px] font-black opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          تعديل 📸
                        </button>
                      </div>

                      <div className="space-y-0.5 text-white">
                        <span className="text-[10px] bg-amber-500 text-[#1E293B] px-2.5 py-0.5 rounded-full font-black">مقاول تشطيبات معتمد في شطبها</span>
                        <h3 className="text-sm font-black md:text-base">{activeCompany.companyName}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Settings Description */}
                  <div className="p-6 pt-10 text-right">
                    <p className="text-[11px] text-gray-500 font-bold leading-normal">
                      ملفك التعريفي هو بوابتك لاستقبال المشروعات والتميز. تظهر هذه الصفحة لجميع مستخدمي المنصة لتقييم عطائك وعقود الضمان السابقة.
                    </p>
                  </div>
                </div>

                {/* 2. Company Info Form Fields */}
                <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-6 text-right">
                  <div className="border-b pb-2.5 border-gray-100">
                    <h4 className="font-extrabold text-[#2B4D89] text-xs">📝 الملف التعريفي والبيانات الوصفية</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-700">سنة التأسيس الرسمي</label>
                      <input 
                        type="number" 
                        value={companyEstablishedYear} 
                        onChange={(e) => setCompanyEstablishedYear(parseInt(e.target.value) || 2020)}
                        className="w-full text-right p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-black text-gray-700">التعليق/النبذة التعريفية للشركة (About)</label>
                      <input 
                        type="text" 
                        value={companyAboutText} 
                        onChange={(e) => setCompanyAboutText(e.target.value)}
                        className="w-full text-right p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs"
                        placeholder="أدخل رسالتك وقدراتكم لخدمة الديكور والتشطيب"
                      />
                    </div>
                  </div>

                  {/* Sealed contact details reminder */}
                  <div className="bg-rose-500/5 text-rose-800 rounded-2xl p-4 text-[10.5px] leading-relaxed font-bold border border-rose-500/10 space-y-2">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-sm">🔒</span>
                      <strong className="text-rose-900 font-extrabold">ملاحظة أمان وتعمية هوية الاتصال (Masked Contact Data Notice):</strong>
                    </div>
                    <p className="font-semibold text-rose-700 text-right leading-relaxed font-sans">
                      تلتزم "شطبها" بمبدأ نزاهة المناقصة وتكافؤ التسعير العادل. يتم حجب بيانات الاتصال (رقم التليفون، بريدك، ومقر شركتك) تلقائياً وعرضها بصورة مشفرة ومقنعة عن جميع العملاء أثناء مرحلة فرز وقبول العطاءات. بمجرد قيام العميل وبمشرفها الفني باعتماد عطائكم وبدء التوقيع الفعلي، يتم فتح البيانات وقنوات التواصل فوراً للجانبين.
                    </p>
                  </div>

                  {/* Editable contact data saved in state */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-705">الهاتف المباشر للاتصال الرئيسي</label>
                      <input 
                        type="text" 
                        value={companyPhone} 
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="w-full text-right p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs text-indigo-950 font-sans"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-705">رقم الواتساب (WhatsApp)</label>
                      <input 
                        type="text" 
                        value={companyWhatsapp} 
                        onChange={(e) => setCompanyWhatsapp(e.target.value)}
                        className="w-full text-right p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs text-emerald-800 font-sans"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-705">البريد الإلكتروني للشركة</label>
                      <input 
                        type="email" 
                        value={companyEmail} 
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        className="w-full text-right p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs text-indigo-950 font-sans"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-705">رابط الموقع الإلكتروني (إن وجد)</label>
                      <input 
                        type="text" 
                        value={companyWebsite} 
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        className="w-full text-right p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs font-sans text-blue-800"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-black text-gray-705">العنوان الإداري للمقر الرئيسي</label>
                      <input 
                        type="text" 
                        value={companyOfficeAddress} 
                        onChange={(e) => setCompanyOfficeAddress(e.target.value)}
                        className="w-full text-right p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs"
                      />
                    </div>
                  </div>

                  {/* Save button attributes */}
                  <div className="pt-2 flex justify-start">
                    <button
                      type="button"
                      onClick={handleSaveProfileAttributes}
                      className="bg-[#2B4D89] hover:bg-slate-800 text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-3xs cursor-pointer"
                    >
                      💾 حفظ التغييرات الأساسية للملف الشخصي
                    </button>
                  </div>
                </div>

                {/* 3. Finishing Packages Builder Panel (باقات التشطيب) */}
                <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-6 text-right">
                  <div className="flex items-center justify-between flex-row-reverse border-b pb-2.5 border-gray-100">
                    <h4 className="font-extrabold text-[#2B4D89] text-xs">🛠️ مصنف باقات ومستويات التشطيب (Packages)</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingPackage(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] px-3.5 py-1.5 rounded-lg font-black transition-colors"
                    >
                      + إنشاء باقة تشطيب جديدة
                    </button>
                  </div>

                  {/* Dynamic add package form block */}
                  {isAddingPackage && (
                    <div className="bg-emerald-50/20 border-2 border-emerald-500/20 p-5 rounded-3xl space-y-4 animate-fadeIn text-right relative">
                      <h5 className="font-extrabold text-emerald-800 text-xs">🆕 باقة تشطيب جديدة للوحدات</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-700">اسم المسمى (مثال: كلاسيك ديلوكس)</label>
                          <input 
                            type="text" 
                            required
                            value={profilePkgName} 
                            onChange={(e) => setProfilePkgName(e.target.value)}
                            className="w-full text-right p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-700">سعر المتر المربع (ج.م / م²)</label>
                          <input 
                            type="number" 
                            required
                            value={profilePkgPrice} 
                            onChange={(e) => setProfilePkgPrice(parseInt(e.target.value) || 1200)}
                            className="w-full text-right p-2 bg-white border border-gray-200 rounded-lg text-xs font-black font-sans"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-700">وصف قصير ومستهدف للمستوى</label>
                          <input 
                            type="text" 
                            value={profilePkgDesc} 
                            onChange={(e) => setProfilePkgDesc(e.target.value)}
                            className="w-full text-right p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                            placeholder="مثال: يركز على الخامات المتينة والتشقيب العصري"
                          />
                        </div>
                      </div>

                      {/* Add Features checkmark checklist */}
                      <div className="space-y-2 bg-white p-3.5 rounded-xl border border-gray-150">
                        <span className="text-[11px] font-black text-gray-700 block">العناصر والبنود المتضمنة بالباقة كضمان:</span>
                        
                        <div className="flex gap-2 flex-row-reverse">
                          <input 
                            type="text" 
                            value={profileTmpFeature} 
                            onChange={(e) => setProfileTmpFeature(e.target.value)}
                            className="flex-1 text-right p-2 border border-gray-200 rounded-lg text-xs font-bold"
                            placeholder="اكتب بنداً (مثال: زجاج دبل لحجب الصوت)"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (profileTmpFeature.trim()) {
                                  setProfilePkgFeatures(prev => [...prev, profileTmpFeature.trim()]);
                                  setProfileTmpFeature('');
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (profileTmpFeature.trim()) {
                                setProfilePkgFeatures(prev => [...prev, profileTmpFeature.trim()]);
                                setProfileTmpFeature('');
                              }
                            }}
                            className="bg-[#2B4D89] text-white text-[10px] px-4 rounded-lg font-bold"
                          >
                            تثبيت البند
                          </button>
                        </div>

                        {profilePkgFeatures.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 justify-end mt-2 pt-2 border-t border-gray-100">
                            {profilePkgFeatures.map((feat, fIdx) => (
                              <span key={fIdx} className="bg-emerald-55 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-md border border-emerald-150 font-bold flex items-center gap-1 select-none">
                                <span>{feat}</span>
                                <button type="button" onClick={() => setProfilePkgFeatures(prev => prev.filter((_, idx) => idx !== fIdx))} className="text-red-500 font-bold ml-1 hover:text-red-700">✕</button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 justify-start">
                        <button
                          type="button"
                          onClick={handleAddPackage}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 py-2 rounded-xl font-bold transition-all shadow-3xs"
                        >
                          ✓ اعتماد وإضافة الباقة للشركة
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingPackage(false);
                            setProfilePkgFeatures([]);
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-650 text-xs px-4 py-2 rounded-xl"
                        >
                          تراجع
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of packages */}
                  {activeCompany.packages && activeCompany.packages.length > 0 ? (
                    <div className="space-y-3">
                      {activeCompany.packages.map((pkg) => (
                        <div key={pkg.id} className="p-4 border border-gray-150 rounded-2xl relative shadow-3xs bg-[#FCFDFD] text-right">
                          <button
                            type="button"
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="absolute top-4 left-4 text-red-550 hover:text-red-750 text-xs font-black cursor-pointer bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                          >
                            حذف الباقة 🗑️
                          </button>

                          <span className="font-mono font-black text-[#0F7453] bg-emerald-50 border border-emerald-150 px-2.5 py-0.5 rounded text-[10px] inline-block mb-1.5">
                            {pkg.pricePerSqm.toLocaleString()} ج.م / م²
                          </span>
                          <h5 className="font-extrabold text-[#2B4D89] text-xs">🛠️ {pkg.name}</h5>
                          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed font-bold">{pkg.description}</p>
                          
                          <div className="mt-3 flex flex-wrap gap-1.5 pt-2.5 border-t border-gray-150/40 justify-end">
                            {pkg.features.map((feat: string, fIdx: number) => (
                              <span key={fIdx} className="bg-slate-100 text-slate-700 text-[9.5px] px-2 py-0.5 rounded font-semibold">
                                ✓ {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-gray-400 font-bold text-[11px] bg-gray-50 rounded-2xl border border-dashed">
                      📭 لم تدرج باقات تشطيب بعد للشركة كباقات منفصلة. أضف أول باقة الآن لتمنح التميز لعطاءاتك.
                    </p>
                  )}
                </div>

                {/* 4. Portfolio Works Manager (سابقة أعمال المقاول والقبل/بعد) */}
                <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-6 text-right">
                  <div className="flex items-center justify-between flex-row-reverse border-b pb-2.5 border-gray-100">
                    <h4 className="font-extrabold text-[#2B4D89] text-xs">📐 معرض سابقة أعمال الوحدات والمشاريع المكتملة (Portfolio)</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingPortfolio(true)}
                      className="bg-indigo-900 hover:bg-indigo-950 text-white text-[10.5px] px-3.5 py-1.5 rounded-lg font-black transition-colors"
                    >
                      + إضافة مشروع جديد لمعرض الأعمال
                    </button>
                  </div>

                  {/* Add portfolio item block */}
                  {isAddingPortfolio && (
                    <div className="bg-indigo-50/10 border-2 border-indigo-500/10 p-5 rounded-3xl space-y-4 animate-fadeIn text-right relative">
                      <h5 className="font-extrabold text-[#2B4D89] text-xs">🆕 إضافة مشروع مكتمل وسجل قبل وبعد</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-700">اسم المشروع (مثل: شقة ريزيدنس)</label>
                          <input 
                            type="text" 
                            required
                            value={newPortName} 
                            onChange={(e) => setNewPortName(e.target.value)}
                            className="w-full text-right p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-700">نوع وهدف المشروع</label>
                          <select
                            value={newPortType}
                            onChange={(e) => setNewPortType(e.target.value)}
                            className="w-full text-right p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600"
                          >
                            <option value="سكني">سكني</option>
                            <option value="تجاري">تجاري</option>
                            <option value="إداري">إداري</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-700">المحافظة (Governorate)</label>
                          <input 
                            type="text" 
                            required
                            value={newPortGov} 
                            onChange={(e) => setNewPortGov(e.target.value)}
                            className="w-full text-right p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-700">سنة التنفيذ والاعتماد</label>
                          <input 
                            type="number" 
                            required
                            value={newPortYear} 
                            onChange={(e) => setNewPortYear(parseInt(e.target.value) || 2025)}
                            className="w-full text-right p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-black font-sans"
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[11px] font-bold text-gray-700">تفاصيل التشطيب والمواد المستخدمة</label>
                          <input 
                            type="text" 
                            value={newPortDesc} 
                            onChange={(e) => setNewPortDesc(e.target.value)}
                            className="w-full text-right p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                            placeholder="وصف فني للوحات، الخامات، وعناصر الإشراف"
                          />
                        </div>
                      </div>

                      {/* Photo presets simulation with Before/After inputs */}
                      <div className="space-y-3 p-3.5 bg-white rounded-xl border border-gray-150">
                        <span className="text-[11px] font-black text-gray-700 block">📸 صور المشروع من واقع الموقع (تبديل قبل وبعد تلقائي):</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400">الصورة الرئيسية للمشروع</label>
                            <input 
                              type="text" 
                              value={newPortImg} 
                              onChange={(e) => setNewPortImg(e.target.value)}
                              className="w-full text-right p-2 bg-slate-50 border border-gray-200 rounded text-[10px]"
                              placeholder="رابط الصورة (فارغ يعين تلقائياً)"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400">الصورة قبل التشطيب 🪵 (Before)</label>
                            <input 
                              type="text" 
                              value={newPortBeforeImg} 
                              onChange={(e) => setNewPortBeforeImg(e.target.value)}
                              className="w-full text-right p-2 bg-slate-50 border border-gray-200 rounded text-[10px]"
                              placeholder="رابط الصورة (فارغ يعين تلقائياً)"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400">الصورة بعد التشطيب ✨ (After)</label>
                            <input 
                              type="text" 
                              value={newPortAfterImg} 
                              onChange={(e) => setNewPortAfterImg(e.target.value)}
                              className="w-full text-right p-2 bg-slate-50 border border-gray-200 rounded text-[10px]"
                              placeholder="رابط الصورة (فارغ يعين تلقائياً)"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-start">
                        <button
                          type="button"
                          onClick={handleAddPortfolioItem}
                          className="bg-indigo-900 hover:bg-[#2B4D89] text-white text-xs px-5 py-2 rounded-xl font-bold transition-all shadow-3xs"
                        >
                          ✓ اعتماد ونشر المشروع بالمعرض
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingPortfolio(false)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-650 text-xs px-4 py-2 rounded-xl"
                        >
                          تراجع
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Grid layout of existing portfolio items */}
                  {activeCompany.portfolio && activeCompany.portfolio.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                      {activeCompany.portfolio.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xs relative">
                          {/* Image */}
                          <div className="h-40 bg-slate-100 relative">
                            <img 
                              src={item.images[0] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'} 
                              alt={item.projectName} 
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded font-mono">
                              📅 {item.executionYear} م
                            </span>
                            <span className="absolute top-2 left-2 bg-indigo-900 text-white text-[9px] px-2 py-0.5 rounded font-bold">
                              💎 {item.projectType}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeletePortfolioItem(item.id)}
                              className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-750 text-white text-[9px] font-black px-2 py-1 rounded transition-colors shadow"
                            >
                              حذف المشروع 🗑️
                            </button>
                          </div>
                          <div className="p-3 space-y-1">
                            <div className="flex items-center justify-between flex-row-reverse">
                              <h5 className="font-extrabold text-[11.5px] text-[#2B4D89]">{item.projectName}</h5>
                              <span className="text-[10px] text-gray-400 font-bold">📍 {item.governorate}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-relaxed font-semibold line-clamp-2">
                              {item.description || 'تغطية متكاملة لجميع تأسيسات السباكة والكهرباء والكهوف ومحارة الحوائط والديكورات العصرية الحديثة.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-gray-400 font-bold text-[11px] bg-gray-50 rounded-2xl border border-dashed">
                      📭 لا توجد أعمال سابقة في معرض سابقة الأعمال للشركة حالياً. اضغط "إضافة مشروع" لتنشيط سوابقك الآن.
                    </p>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-4 md:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-gray-50 text-[#2B4D89] rounded-xl border border-gray-150">
                      <Layers className="w-5 h-5 shrink-0" />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-gray-850 text-sm flex items-center gap-1.5 font-sans">
                        {activeTab === 'NEW_REQUESTS' && (isEn ? '⚡ Matched Instant Finishes' : '⚡ طلبات نشطة مطابقة تطلب مقاولاً')}
                        {activeTab === 'ACTIVE_PROJECTS' && (isEn ? '🏗️ Physically Contracted Sites' : '🏗️ مشروعات قيد التنفيذ والتسليم')}
                        {activeTab === 'SUBMITTED_BIDS' && (isEn ? '📤 Active Pending Offers' : '📤 عروض أسعار قيد التنافس')}
                        {activeTab === 'WON_BIDS' && (isEn ? '🏆 Tenders Won & Contract Issuing' : '🏆 عقود معتمدة وبانتظار التوقيع')}
                        {activeTab === 'COMPLETED_PROJECTS' && (isEn ? '✅ Historical Finished Works' : '✅ مشاريع تم تسليمها سابقاً')}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5 text-right">
                        {activeTab === 'NEW_REQUESTS' && (isEn ? 'Live requests within Cairo/Giza matching your finishing standards.' : 'عقارات لعملاء يبحثون عن مقاول الآن، متطابقة مع نطاق عملك الجغرافي.')}
                        {activeTab === 'ACTIVE_PROJECTS' && (isEn ? 'Click "Track Implementation" below to view site inspection stages and release escrow cash.' : 'تتبع مراحل تسليم بنود التنفيذ بالمحاضر الهندسية لتسريع دفع المبالغ.')}
                        {activeTab === 'SUBMITTED_BIDS' && (isEn ? 'Quotes you dispatched to customers waiting for technical comparison.' : 'قائمة عروض الأسعار التي قدمتها وتحتوي تفاصيل السعر ومخطط التنفيذ الفني.')}
                        {activeTab === 'WON_BIDS' && (isEn ? 'Client confirmed your bid! Awaiting official contract agreement signatures.' : 'العطاءات المفتوحة التي تم اختيار شركتكم رسمياً لتنفيذ أعمالها.')}
                        {activeTab === 'COMPLETED_PROJECTS' && (isEn ? 'Archive of delivered properties with final client satisfaction ratings.' : 'مجلد يضم الوحدات التي شطبتها بالكامل وحازت شهادة اعتماد شطبها.')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs text-gray-700 min-w-[700px]">
                    <thead>
                      {activeTab === 'ACTIVE_PROJECTS' ? (
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider font-sans">
                        <th className="px-5 py-3.5 pr-6">{isEn ? 'Project ID' : 'رقم المشروع'}</th>
                        <th className="px-4 py-3.5">{isEn ? 'Client Name' : 'اسم العميل'}</th>
                        <th className="px-4 py-3.5">{isEn ? 'Phone Number' : 'رقم التليفون'}</th>
                        <th className="px-4 py-3.5">{isEn ? 'Unit Type' : 'نوع العقار'}</th>
                        <th className="px-4 py-3.5">{isEn ? 'Area/Space' : 'المساحة'}</th>
                        <th className="px-4 py-3.5">{isEn ? 'Location' : 'اللوكيشن'}</th>
                        <th className="px-4 py-3.5 text-center">{isEn ? 'Progress Ratio' : 'نسبة الانجاز'}</th>
                        <th className="px-4 py-3.5">{isEn ? 'Project Status' : 'حالة المشروع'}</th>
                        <th className="px-5 py-3.5 text-center pl-6">{isEn ? 'Action' : 'التفاصيل والإجراء'}</th>
                      </tr>
                    ) : (
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider font-sans">
                        <th className="px-5 py-3.5 pr-6">{isEn ? 'Project ID' : 'رقم المشروع'}</th>
                        <th className="px-4 py-3.5">{isEn ? 'Governorate/Region' : 'المحافظة والمنطقة'}</th>
                        <th className="px-4 py-3.5">{isEn ? 'Unit Style' : 'نوع العقار'}</th>
                        <th className="px-4 py-3.5">{isEn ? 'Finishing Target' : 'نوع التشطيب'}</th>
                        <th className="px-4 py-3.5">{isEn ? 'Max Budget' : 'الميزانية'}</th>
                        <th className="px-4 py-3.5">{isEn ? 'Area/Space' : 'المساحة'}</th>
                        <th className="px-4 py-3.5">{isEn ? 'Remaining Time' : 'الوقت المتبقي'}</th>
                        <th className="px-5 py-3.5 text-center pl-6">{isEn ? 'Action' : 'التفاصيل والإجراء'}</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {/* NEW REQUESTS */}
                    {activeTab === 'NEW_REQUESTS' && (
                      filteredNewRequests.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-10 text-gray-400 text-xs font-semibold">
                            {isEn ? 'No requests match search and filter settings.' : 'لا توجد طلبات جديدة مطابقة لمعايير التصفية والبحث حالياً.'}
                          </td>
                        </tr>
                      ) : (
                        filteredNewRequests.map(req => {
                          const alreadyBidded = mySubmittedOffers.some(o => o.requestId === req.id);
                          return (
                            <tr 
                              key={req.id} 
                              onClick={() => setSelectedDetailItem(req)}
                              className="hover:bg-[#2B4D89]/5 transition-colors cursor-pointer"
                              title={isEn ? 'Click to view full details' : 'اضغط لرؤية تفاصيل العميل والطلب بالكامل'}
                            >
                              <td className="px-5 py-4 font-mono font-black text-[#2B4D89] pr-6">{req.id}</td>
                              <td className="px-4 py-4 font-bold">📍 {req.governorate}، {req.city}</td>
                              <td className="px-4 py-4 font-semibold text-gray-655 font-bold">
                                {req.unitType === 'فيلا' ? '🏡 فيلا' : req.unitType === 'مكتب' ? '🏢 مكتب إداري' : '🏢 شقة سكنية'}
                              </td>
                              <td className="px-4 py-4">
                                <span className="bg-amber-100/70 text-amber-900 font-extrabold px-2.5 py-1 rounded-lg border border-amber-200/50 text-[11px]">
                                  {req.finishingLevel}
                                </span>
                              </td>
                              <td className="px-4 py-4 font-mono font-black text-emerald-700">{req.budget?.toLocaleString()} ج.م</td>
                              <td className="px-4 py-4 font-mono font-black text-gray-500">{req.area} م²</td>
                              <td className="px-4 py-4">
                                <TenderCountdown deadline={req.deadline} createdAt={req.createdAt} isEn={isEn} />
                              </td>
                              <td className="px-5 py-4 pl-6 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedDetailItem(req)}
                                    className="bg-amber-500/20 hover:bg-amber-500/35 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                                    title={isEn ? 'Show Request Specs' : 'عرض مواصفات وتفاصيل الطلب'}
                                  >
                                    <span>🔍</span>
                                    <span>{isEn ? 'Details' : 'تفاصيل الطلب'}</span>
                                  </button>

                                  {alreadyBidded ? (
                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-150 px-3 py-1.5 rounded-xl text-[11px] font-black shrink-0">
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>{isEn ? 'Submitted' : 'تم العرض'}</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTargetRequest(req);
                                        setIsOfferModalOpen(true);
                                      }}
                                      className="bg-[#2B4D89] hover:bg-[#30445E] text-white px-3.5 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer shrink-0"
                                    >
                                      {isEn ? 'Submit Price' : 'ارسل عرض سعر 🚀'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )
                    )}

                    {/* ACTIVE PROJECTS */}
                    {activeTab === 'ACTIVE_PROJECTS' && (
                      filteredActiveProjects.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-10 text-gray-400 text-xs font-semibold">
                            {isEn ? 'No active contracted projects match the criteria.' : 'لا توجد مشروعات تحت المعاينة أو الإنجاز حالياً.'}
                          </td>
                        </tr>
                      ) : (
                        filteredActiveProjects.map(req => {
                          const isCurrentlySelected = (selectedContractedId || filteredActiveProjects[0]?.id) === req.id;
                          
                          // Dynamic progress and active stage computation
                          const projStages = stages.filter(s => s.requestId === req.id);
                          const activeStage = projStages.find(s => s.status === 'UNDER_WAY' || s.inspectionRequested) 
                            || projStages.find(s => s.progress > 0 && s.progress < 100) 
                            || projStages.find(s => s.status === 'NOT_STARTED')
                            || projStages[0];
                          
                          const progressVal = activeStage ? activeStage.progress : 0;
                          
                          let activeStageNameText = '';
                          if (activeStage) {
                            const rawName = activeStage.name;
                            // Clean up standard names to look short and clean like the screenshot
                            if (rawName.includes('سباكة')) activeStageNameText = isEn ? 'Plumbing Phase' : 'مرحلة السباكة';
                            else if (rawName.includes('كهرباء')) activeStageNameText = isEn ? 'Electrical Phase' : 'مرحلة الكهرباء';
                            else if (rawName.includes('محارة') || rawName.includes('أسقف')) activeStageNameText = isEn ? 'Plastering Phase' : 'مرحلة المحارة والجبس بورد';
                            else if (rawName.includes('دهانات')) activeStageNameText = isEn ? 'Painting Phase' : 'مرحلة الدهانات والتشطيب';
                            else activeStageNameText = rawName;
                          }

                          const activeStateText = !req.actualStartDate
                            ? (isEn ? 'Contract Signed & Awaiting Start' : '🤝 تم التعاقد وبانتظار البدء')
                            : activeStage
                              ? (isEn ? `Executing ${activeStageNameText}` : `جاري تنفيذ ${activeStageNameText}`)
                              : (isEn ? 'Under Execution' : 'جاري التنفيذ الميداني');

                          return (
                            <tr key={req.id} className={`hover:bg-gray-50/50 transition-colors ${isCurrentlySelected ? 'bg-emerald-500/5 font-semibold' : ''}`}>
                              {/* 1. Project ID */}
                              <td className="px-5 py-4 font-mono font-black text-[#2B4D89] pr-6">{req.id}</td>
                              
                              {/* 2. Client Name */}
                              <td className="px-4 py-4 font-black text-gray-800">{req.clientName || (isEn ? 'Mohamed' : 'أ. محمد عبد الله')}</td>
                              
                              {/* 3. Phone Number */}
                              <td className="px-4 py-4 font-mono text-gray-500" dir="ltr">{req.clientPhone || '0100xxxxx'}</td>
                              
                              {/* 4. Unit Type */}
                              <td className="px-4 py-4 font-bold text-gray-600">
                                {req.unitType === 'فيلا' ? '🏡 فيلا' : req.unitType === 'مكتب' ? '🏢 مكتب' : '🏢 شقة'}
                              </td>
                              
                              {/* 5. Area */}
                              <td className="px-4 py-4 font-mono font-bold text-gray-700">{req.area} م²</td>
                              
                              {/* 6. Location */}
                              <td className="px-4 py-4 font-bold text-[#2B4D89]">📍 {req.governorate}</td>
                              
                              {/* 7. Progress Ratio */}
                              <td className="px-4 py-4 text-center font-mono">
                                <span className="inline-block bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-black text-xs border border-blue-200/50">
                                  {progressVal}%
                                </span>
                              </td>
                              
                              {/* 8. Project Status */}
                              <td className="px-4 py-4">
                                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 font-extrabold px-3 py-1 rounded-xl text-[11px] border border-amber-200/40">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                  {activeStateText}
                                </span>
                              </td>
                              
                              {/* 9. Action / Track selection */}
                              <td className="px-5 py-4 pl-6 text-center font-sans">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedContractedId(req.id);
                                    const trackerEl = document.getElementById('active-building-tracker');
                                    if (trackerEl) {
                                      trackerEl.scrollIntoView({ behavior: 'smooth' });
                                    }
                                  }}
                                  className="bg-emerald-50 hover:bg-[#1D4A3D] text-[#1D4A3D] hover:text-white px-3.5 py-1.5 rounded-xl border border-emerald-200 hover:border-[#1D4A3D] text-[11px] font-bold transition-all cursor-pointer"
                                >
                                  {isEn ? 'Track execution' : 'تتبع مراحل الموقع 🏗️'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )
                    )}

                    {/* SUBMITTED BIDS */}
                    {activeTab === 'SUBMITTED_BIDS' && (
                      filteredSubmittedBids.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-10 text-gray-400 text-xs font-semibold">
                            {isEn ? 'No submitted bids found matching specifications.' : 'لا توجد عروض أسعار تناسب الكلمات المدخلة.'}
                          </td>
                        </tr>
                      ) : (
                        filteredSubmittedBids.map(req => {
                          const offer = mySubmittedOffers.find(o => o.requestId === req.id);
                          return (
                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-4 font-mono font-black text-[#2B4D89] pr-6">{req.id}</td>
                              <td className="px-4 py-4 font-bold">
                                📍 {req.governorate}، {req.city}
                              </td>
                              <td className="px-4 py-4 font-semibold text-gray-655 font-bold">
                                {req.unitType === 'فيلا' ? '🏡 فيلا' : req.unitType === 'مكتب' ? '🏢 مكتب' : '🏢 شقة'}
                              </td>
                              <td className="px-4 py-4 text-gray-500 font-bold">{req.finishingLevel}</td>
                              <td className="px-4 py-4 font-mono">
                                <div className="flex flex-col">
                                  <span className="font-mono font-black text-[#2B4D89] text-[12px]">
                                    {offer ? offer.price?.toLocaleString() : 0} ج.م
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {isEn ? 'Est. Budget:' : 'ميزانية العميل:'} {req.budget?.toLocaleString()} ج.م
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 font-mono font-black text-gray-500">{req.area} م²</td>
                              <td className="px-4 py-4">
                                <TenderCountdown deadline={req.deadline} createdAt={req.createdAt} isEn={isEn} />
                              </td>
                              <td className="px-5 py-4 pl-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <span className="bg-[#D8B448]/5 text-[#1E293B] border border-[#D8B448] px-3 py-1.5 rounded-xl text-[11px] font-bold font-sans shrink-0">
                                    {isEn ? 'Pending Review' : 'قيد المراجعة الفنية'}
                                  </span>
                                  {offer && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditOffer(req, offer)}
                                      className="bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                                      title={isEn ? 'Edit pricing offer details' : 'تعديل تفاصيل وأسعار هذا العرض'}
                                    >
                                      <span>✏️</span>
                                      <span>{isEn ? 'Edit Price' : 'تعديل السعر'}</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )
                    )}

                    {/* WON BIDS */}
                    {activeTab === 'WON_BIDS' && (
                      filteredWonBids.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-gray-400 text-xs font-semibold">
                            {isEn ? 'No won tenders.' : 'لا توجد مناقصات فازت بها شركتكم.'}
                          </td>
                        </tr>
                      ) : (
                        filteredWonBids.map(req => {
                          return (
                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-4 font-mono font-black text-[#2B4D89] pr-6">{req.id}</td>
                              <td className="px-4 py-4 font-bold">📍 {req.governorate}، {req.city}</td>
                              <td className="px-4 py-4 font-semibold text-gray-655 font-bold">
                                {req.unitType === 'فيلا' ? '🏡 فيلا' : req.unitType === 'مكتب' ? '🏢 مكتب' : '🏢 شقة'}
                              </td>
                              <td className="px-4 py-4">
                                <span className="bg-purple-100 text-purple-800 font-extrabold px-2.5 py-1 rounded-lg border border-purple-200 text-[11px]">
                                  {req.finishingLevel}
                                </span>
                              </td>
                              <td className="px-4 py-4 font-mono font-black text-purple-805">{req.budget?.toLocaleString()} ج.م</td>
                              <td className="px-4 py-4 font-mono font-black text-gray-500">{req.area} م²</td>
                              <td className="px-5 py-4 pl-6 text-center">
                                <span className="bg-purple-100 text-purple-750 border border-purple-200 px-3.5 py-1.5 rounded-xl text-[11px] font-bold font-sans">
                                  {req.status === 'ACTIVE' ? (
                                    isEn ? '✓ Active Contract' : '✓ عقد جاري وتنفيد فعال'
                                  ) : req.status === 'WAITING_FOR_INSPECTION' ? (
                                    isEn ? 'Awaiting Inspection & Approval' : 'بانتظار المعاينة والاعتماد ⏳'
                                  ) : (
                                    isEn ? 'Awaiting Inspection & Contract Signing' : 'في انتظار المعاينة وتوقيع العقود ⏳'
                                  )}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )
                    )}

                    {/* COMPLETED PROJECTS */}
                    {activeTab === 'COMPLETED_PROJECTS' && (
                      filteredCompletedProjects.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-gray-400 text-xs font-semibold">
                            {isEn ? 'No completed projects.' : 'لا توجد مشاريع سابقة بمحاضر تسليم معتمدة.'}
                          </td>
                        </tr>
                      ) : (
                        filteredCompletedProjects.map(req => {
                          return (
                            <tr 
                              key={req.id} 
                              onClick={() => setSelectedCompletedProjectId(req.id)}
                              className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                            >
                              <td className="px-5 py-4 font-mono font-black text-[#2B4D89] pr-6">{req.id}</td>
                              <td className="px-4 py-4 font-bold">📍 {req.governorate}، {req.city}</td>
                              <td className="px-4 py-4 font-semibold text-gray-650 font-bold">
                                {req.unitType === 'فيلا' ? '🏡 فيلا' : req.unitType === 'مكتب' ? '🏢 مكتب' : '🏢 شقة'}
                              </td>
                              <td className="px-4 py-4">
                                <span className="bg-blue-100 text-blue-800 font-extrabold px-2.5 py-1 rounded-lg border border-blue-200 text-[11px]">
                                  {req.finishingLevel}
                                </span>
                              </td>
                              <td className="px-4 py-4 font-mono font-black text-blue-800">{req.budget?.toLocaleString()} ج.م</td>
                              <td className="px-4 py-4 font-mono font-black text-gray-500">{req.area} م²</td>
                              <td className="px-5 py-4 pl-6 text-center">
                                <span className="bg-blue-600 group-hover:bg-blue-700 text-white px-3 py-1 rounded-xl text-[11px] font-bold transition-all shadow-xs inline-block">
                                  {isEn ? 'View Warranty 🛡️' : 'عرض الضمان والشهادة 🛡️'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )
                    )}

                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* המשروعات النشطة الموقعة وتحت التنفيذ فنيًا */}
            <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 space-y-6">
              
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h3 className="font-extrabold text-base text-[#2B4D89] flex items-center gap-1.5">
                    <span>👷</span> {isEn ? 'Active Projects & Construction Stage Inspection' : 'المشروعات النشطة ومراحل التنفيذ الفني والضمان الثلاثي'}
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {isEn ? 'Track execution milestones, update building checklists, and request independent field auditor inspector audits to trigger escrow releases.' : 'تابع مستويات الإنجاز بالموقع، واطلب استلام المرحلة فنيّاً من مهندس شطبها المندوب للإفراج عن الدفعات المالية.'}
                </p>
              </div>

              {/* Project switcher dropdown */}
              {myContractedProjects.length > 0 ? (
                <div className="space-y-4">
                  {/* Tabs Navigator to Switch Projects */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F0F3F7] p-3.5 rounded-2xl border border-gray-150">
                    <div className="text-xs font-bold text-[#2B4D89]">
                      📁 {isEn ? 'Switch and manage your current contracted spaces:' : '📁 التنقل والمفاضلة بين المشروعات النشطة للمقاول:'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {myContractedProjects.map(proj => {
                        const activeId = selectedContractedId || myContractedProjects[0]?.id;
                        const isCurrent = activeId === proj.id;
                        const unitLabel = isEn 
                          ? (proj.unitType === 'فيلا' ? '🏡 Villa' : '🏢 Apartment')
                          : (proj.unitType === 'فيلا' ? '🏡 فيلا' : '🏢 شقة');
                        return (
                          <button
                            key={proj.id}
                            type="button"
                            onClick={() => setSelectedContractedId(proj.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isCurrent 
                                ? 'bg-[#1D4A3D] text-white shadow-xs' 
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {isEn ? 'Site' : 'موقع'} #{proj.id} ({unitLabel}) - {proj.clientName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Selected Project Name Display & Info Header */}
                  {(() => {
                    const activeId = selectedContractedId || myContractedProjects[0]?.id;
                    const activeProj = requests.find(r => r.id === activeId);
                    if (!activeProj) return null;
                    const transUnit = isEn 
                      ? (activeProj.unitType === 'فيلا' ? 'Villa' : activeProj.unitType === 'مكتب' ? 'Office' : 'Apartment')
                      : activeProj.unitType;

                    const activeProjStages = stages.filter(s => s.requestId === activeProj.id);
                    const sumProgress = activeProjStages.reduce((sum, stg) => sum + stg.progress, 0);
                    const overallProgress = activeProjStages.length > 0 ? Math.round(sumProgress / activeProjStages.length) : 0;

                    return (
                      <div className="space-y-4 text-right" dir={isEn ? "ltr" : "rtl"}>
                        {/* 1. BLUE AREA */}
                        <div className="bg-[#2B4D89] text-white rounded-2.5xl p-5 shadow-sm space-y-4 group">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] bg-[#D8B448] text-[#232F3F] font-black px-2 py-0.5 rounded-full uppercase inline-block font-sans">
                                🏗️ {isEn ? 'ACTIVE RENOVATION WORK SITE UNDER CONTRACT' : 'المشروع النشط الحالي شغال عليه الآن'}
                              </span>
                              <h4 className="font-extrabold text-[#F0F3F7] text-base md:text-lg text-right">
                                {isEn ? `Site: ${transUnit} finishing for: ${activeProj.clientName}` : `تشطيب ${activeProj.unitType} للعميل: ${activeProj.clientName}`}
                              </h4>
                              <p className="text-xs font-bold text-[#C9E0D9] leading-relaxed font-sans text-right">
                                📍 {isEn ? 'Site address:' : 'جهة العمل والموقع:'} {isEn ? (activeProj.city === 'التجمع الخامس' ? 'Fifth Settlement' : activeProj.city) : activeProj.city}، {isEn ? (activeProj.governorate === 'القاهرة' ? 'Cairo' : 'Giza') : activeProj.governorate} | 📐 {isEn ? 'Total Area:' : 'مساحة الموقع:'} {activeProj.area} {isEn ? 'm²' : 'م²'} | 💰 {isEn ? 'Technical Project Value:' : 'الميزانية الفنية للتشطيب:'} {activeProj.budget.toLocaleString()} {isEn ? 'EGP' : 'ج.م'}
                              </p>
                            </div>
                            <div className="bg-white/10 border border-white/5 rounded-xl px-4 py-2.5 text-right shrink-0">
                              <span className="text-[9px] text-[#A2C7BC] font-bold block mb-0.5 text-right font-sans">{isEn ? 'CONTRACT ID' : 'معرف المتابعة'}</span>
                              <span className="text-xs font-mono font-black text-[#D8B448]">
                                #{activeProj.id}
                              </span>
                            </div>
                          </div>

                          {/* Client Request Details embedded inside the blue section */}
                          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-4 space-y-3.5 text-right">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-2.5 w-full">
                              <div className="flex items-center gap-2 text-xs font-black text-[#D8B448]">
                                <span>📋</span>
                                <span>{isEn ? "Client's Original Specifications & Description" : "تفصيل طلب ومواصفات العميل الأصلية"}</span>
                              </div>
                              <div className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-md inline-block">
                                {isEn ? `Finishing Level: ${activeProj.finishingLevel || 'Standard'}` : `مستوى التشطيب مـن العـميل: ${activeProj.finishingLevel || 'سوبر لوكس'}`}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                              {/* Left Column: Client's requested finishing level details */}
                              <div className="space-y-1.5">
                                <span className="text-[10px] text-[#A2C7BC] font-bold block">
                                  {isEn ? "✨ REQ. FINISHING STYLE" : "✨ مستوى وفئة التشطيب المطلوبة:"}
                                </span>
                                <span className="bg-amber-400 text-[#232F3F] text-xs font-black px-2.5 py-1 rounded-md inline-block shadow-xs">
                                  {isEn ? activeProj.finishingLevel : `تشطيب ${activeProj.finishingLevel || 'سوبر لوكس'}`}
                                </span>
                              </div>

                              {/* Right Column: Rooms partitioning */}
                              <div className="space-y-1.5 md:border-r md:border-white/15 md:pr-4">
                                <span className="text-[10px] text-[#A2C7BC] font-bold block">
                                  {isEn ? "🚪 SPACE DIVISION" : "🚪 المربعات وتقسيم الفراغات المتفق عليها:"}
                                </span>
                                <div className="flex flex-wrap gap-2 text-xs font-bold text-white">
                                  <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 shadow-xs">
                                    🚪 {isEn ? `${activeProj.bedroomsCount ?? 0} Bedrooms` : `${activeProj.bedroomsCount ?? 0} غرف`}
                                  </span>
                                  <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 shadow-xs">
                                    🛁 {isEn ? `${activeProj.bathroomsCount ?? 0} Bathrooms` : `${activeProj.bathroomsCount ?? 0} حمامات`}
                                  </span>
                                  <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 shadow-xs">
                                    🍳 {isEn ? `${activeProj.kitchensCount ?? 0} Kitchens` : `${activeProj.kitchensCount ?? 0} مطابخ`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Client description/notes */}
                            {activeProj.notes && (
                              <div className="pt-2.5 border-t border-white/15 space-y-1 text-right">
                                <span className="text-[10px] text-[#A2C7BC] font-bold block">
                                  {isEn ? "📝 CLIENT NOTES / DESCRIPTION" : "📝 الوصف العام وملاحظات العميل:"}
                                </span>
                                <p className="text-xs text-white/95 leading-relaxed font-semibold">
                                  {activeProj.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 2. OVERALL TIMELINE PROGRESS BAR UNDER BLUE SECTION */}
                        <div className="bg-white border border-gray-150 rounded-2.5xl p-5 shadow-sm space-y-4 text-right">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                            <div className="space-y-0.5">
                              <h4 className="font-extrabold text-xs sm:text-sm text-[#232F3F] flex items-center gap-1.5">
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2B4D89]/40 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2B4D89]"></span>
                                </span>
                                <span>{isEn ? "Overall Project Completion Timeline Indicator" : "الخط الزمني ومعدل الإنجاز الإجمالي للمشروع"}</span>
                              </h4>
                              <p className="text-[10px] text-gray-400">
                                {isEn 
                                  ? "Dynamically tracked live contractor progress validation rate" 
                                  : "متوسط نسب التشييد والتسليم الفعلي عبر كافة المراحل التنفيذية الميدانية"}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                              <span className="text-[11px] text-gray-500 font-bold">{isEn ? "Total Done:" : "نسبة الإنجاز الإجمالية:"}</span>
                              <span className="text-xs font-black text-white bg-[#2B4D89] px-3 py-1 rounded-full font-sans shadow-xs">
                                {overallProgress}%
                              </span>
                            </div>
                          </div>

                          {/* Beautiful Progress Bar Line */}
                          <div className="space-y-4">
                            <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden border border-gray-150 p-0.5">
                              <div 
                                className="h-full bg-linear-to-r from-[#2B4D89] to-[#1D4A3D] rounded-full transition-all duration-700 shadow-xs flex items-center justify-end pl-1.5"
                                style={{ width: `${overallProgress}%` }}
                              >
                                {overallProgress >= 8 && (
                                  <span className="text-[8px] font-black text-white px-1 font-sans">
                                    %{overallProgress}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Milestones nodes representing progress of each of the phases in a clean layout */}
                            {activeProjStages.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-150/70">
                                {activeProjStages.map((stg) => {
                                  const transStageName = isEn 
                                    ? (stg.name === 'تأسيس السباكة والصرف' ? 'Plumbing' : 
                                       stg.name === 'تأسيس الكهرباء والإنارة' ? 'Electric' : 
                                       stg.name === 'أعمال المحارة والأسقف' ? 'Plaster' : 
                                       stg.name === 'الدهانات والتشطيب النهائي' ? 'Painting' : stg.name) 
                                    : (stg.name === 'تأسيس السباكة والصرف' ? 'السباكة والصرف' : 
                                       stg.name === 'تأسيس الكهرباء والإنارة' ? 'الكهرباء والإنارة' : 
                                       stg.name === 'أعمال المحارة والأسقف' ? 'المحارة والأسقف' : 
                                       stg.name === 'الدهانات والتشطيب النهائي' ? 'الدهانات والتشطيب' : stg.name);
                                       
                                  const isCompleted = stg.progress === 100;
                                  const isUnderway = stg.progress > 0 && stg.progress < 100;

                                  return (
                                    <div key={stg.id} className="flex items-center gap-2 text-right">
                                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border text-[9px] font-black ${
                                        isCompleted 
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                          : isUnderway 
                                            ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse' 
                                            : 'bg-white text-gray-300 border-gray-200'
                                      }`}>
                                        {isCompleted ? '✓' : '•'}
                                      </div>
                                      <div className="space-y-0.5 min-w-0">
                                        <span className={`block text-[10px] font-bold truncate ${isCompleted ? 'text-emerald-800' : isUnderway ? 'text-amber-800' : 'text-gray-500'}`}>
                                          {transStageName}
                                        </span>
                                        <span className="block text-[8px] font-mono font-bold text-gray-400">
                                          {stg.progress}% {isEn ? 'done' : 'منجز'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-4 font-sans text-right">
                  <p className="text-center text-xs text-gray-400 py-4">
                    {isEn ? 'No active contracted projects under execution currently.' : 'لا توجد مشاريع نشطة حالياً تحت التنفيذ فنيًا.'}
                  </p>
                  {requests.some(r => r.status === 'WAITING_FOR_INSPECTION') && (
                    <div className="bg-amber-50 border-2 border-amber-200/70 rounded-2xl p-4.5 text-right flex items-start gap-4 shadow-xs animate-fade-in">
                      <span className="text-xl shrink-0 select-none">⏳</span>
                      <div className="flex-1">
                        <p className="font-extrabold text-xs text-amber-850">
                          {isEn ? 'Finishing Projects Awaiting Admin Approval & Technical Auditing' : 'تنبيه للمقاول: مشاريع معلقة بانتظار تفعيل العقد وبدء التنفيذ 🛠️'}
                        </p>
                        <p className="text-[10px] text-amber-750/90 mt-1 leading-relaxed font-bold">
                          {isEn 
                            ? 'There are projects awaiting critical on-site inspection and contract approval. You will be notified immediately once approved and activated by the platform admin.'
                            : 'تنبيه لشركتكم: يوجد مشاريع فزتم بها وهي حالياً في مرحلة المعاينة الفنية والمطابقة من طرف مشرف المنصة. فور اعتماد المعاينة وصياغة العقد النهائي من الإدارة، سيتم إطلاق المشروع لشركتكم لبدء بنود التشطيب فورا.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Active Stages Detail list */}
              {(() => {
                const activeId = selectedContractedId || myContractedProjects[0]?.id;
                if (!activeId) return null;
                const activeProj = requests.find(r => r.id === activeId);
                const activeProjStages = stages.filter(s => s.requestId === activeId);
                
                const totalDurationDays = activeProjStages.reduce((sum, s) => sum + (s.totalDurationDays || 0), 0);
                const daysElapsed = activeProjStages.reduce((sum, s) => sum + (s.daysElapsed || 0), 0);
                const projectLateDays = Math.max(0, daysElapsed - totalDurationDays);
                const matchedContractForSummary = (contracts || []).find(c => c.requestId === activeId);
                const penaltyRateSummary = matchedContractForSummary?.delayPenaltyPerDay || 500;
                const projectLateFine = projectLateDays * penaltyRateSummary;

                return (
                  <div className="space-y-4">
                    {/* Overall Project Timeline & Penalty Summary */}
                    {totalDurationDays > 0 && (
                      <div className="bg-white border border-[#2B4D89]/15 rounded-2.5xl p-4 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-3 text-right">
                        <div className="bg-gray-50/60 p-2.5 rounded-xl text-center space-y-0.5 border border-gray-100">
                          <span className="text-gray-400 block text-[9px] font-bold">{isEn ? 'Total Project Scheduled Duration' : 'مدة تنفيذ المشروع ككل'}</span>
                          <span className="text-[#30445E] font-black text-xs">{totalDurationDays} {isEn ? 'days' : 'يوم'}</span>
                        </div>
                        <div className="bg-gray-50/60 p-2.5 rounded-xl text-center space-y-0.5 border border-gray-100">
                          <span className="text-gray-400 block text-[9px] font-bold">{isEn ? 'Total Project Days Elapsed' : 'أيام العمل المنقضية الكلية'}</span>
                          <span className="text-blue-700 font-black text-xs">{daysElapsed} {isEn ? 'days' : 'يوم'}</span>
                        </div>
                        <div className="bg-gray-50/60 p-2.5 rounded-xl text-center space-y-0.5 border border-gray-100">
                          <span className="text-gray-400 block text-[9px] font-bold">{isEn ? 'Project Time Overrun' : 'تأخير المشروع العام'}</span>
                          <span className={`${projectLateDays > 0 ? 'text-red-750 font-extrabold' : 'text-emerald-700 font-bold'} text-xs`}>
                            {projectLateDays > 0 ? `${projectLateDays} ${isEn ? 'days late' : 'يوم تأخير'}` : (isEn ? 'On Schedule' : 'منضبط بالجدول')}
                          </span>
                        </div>
                        <div className={`p-2.5 rounded-xl text-center space-y-0.5 border ${
                          projectLateFine > 0 
                            ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' 
                            : 'bg-emerald-50 border-emerald-100 text-emerald-850'
                        }`}>
                          <span className="text-gray-400 block text-[9px] font-bold">{isEn ? `Overall Fines (${penaltyRateSummary}/Day)` : `غرامة التأخير الإجمالية للموقع (${penaltyRateSummary} ج.م/يوم)`}</span>
                          <span className="font-extrabold text-[11px] block text-rose-750">
                            {projectLateFine > 0 ? `${projectLateFine.toLocaleString()} ج.م` : '0 ج.م'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-150 pb-3">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5 flex-wrap">
                          <span>{isEn ? 'Independent milestone validation metrics:' : 'قائمة بنود استلام التشطيب المعتمدة:'}</span>
                          <span className="text-[10px] bg-[#F0F3F7] text-[#2B4D89] border border-[#30445E]/20 px-2 py-0.5 rounded font-black whitespace-nowrap">
                            {isEn ? 'Field Auditor Engineer:' : 'المهندس المشرف:'} {activeProj?.assignedInspectorId === 'INSP-1' ? (isEn ? 'Eng. Karim Mamdouh' : 'م/ كريم ممدوح') : activeProj?.assignedInspectorId === 'INSP-3' ? (isEn ? 'Eng. Amr El-Shafei' : 'م/ عمرو الشافعي') : (isEn ? 'Waiting Inspector Assign' : 'بانتظار التعيين')}
                          </span>
                        </div>
                      </div>

                      {/* Switcher Controls on Company View */}
                      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200 shrink-0 no-print">
                        <button
                          type="button"
                          onClick={() => setCompanyViewMode('SWIPE')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all ${
                            companyViewMode === 'SWIPE' 
                              ? 'bg-[#2B4D89] text-white shadow-xs' 
                              : 'text-gray-500 hover:text-gray-800'
                          }`}
                        >
                          <span>👈👉</span>
                          <span>{isEn ? 'Swipe' : 'عرض السحب'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCompanyViewMode('LIST')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all ${
                            companyViewMode === 'LIST' 
                              ? 'bg-[#2B4D89] text-white shadow-xs' 
                              : 'text-gray-500 hover:text-gray-800'
                          }`}
                        >
                          <span>📋</span>
                          <span>{isEn ? 'Classic List' : 'عرض القائمة'}</span>
                        </button>
                      </div>
                    </div>

                    {activeProjStages.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-4">
                        {isEn ? 'No recorded stages yet for this project.' : 'لا توجد بنود عمل مسجلة لهذا المشروع.'}
                      </p>
                    ) : companyViewMode === 'SWIPE' ? (() => {
                      const clampedIdx = Math.min(Math.max(0, companyActiveStageIndex), activeProjStages.length - 1);
                      const stg = activeProjStages[clampedIdx] || activeProjStages[0];
                      
                      const handleNext = () => {
                        setCompanyActiveStageIndex(prev => (prev + 1) % activeProjStages.length);
                      };

                      const handlePrev = () => {
                        setCompanyActiveStageIndex(prev => (prev - 1 + activeProjStages.length) % activeProjStages.length);
                      };

                      const transStageName = isEn 
                        ? (stg.name === 'تأسيس السباكة والصرف' ? 'Plumbing & Drainage Setup' : 
                           stg.name === 'تأسيس الكهرباء والإنارة' ? 'Electrical & Lighting Setup' : 
                           stg.name === 'أعمال المحارة والأسقف' ? 'Plastering & Ceiling Work' : 
                           stg.name === 'الدهانات والتشطيب النهائي' ? 'Painting & Final Decoration' : stg.name) 
                        : stg.name;

                      return (
                        <div className="space-y-4">
                          {/* Gestures Navigation Instruction Info */}
                          <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100/50 rounded-2xl px-4 py-2.5 text-[10.5px] text-gray-500 no-print">
                            <span className="font-extrabold flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              {isEn 
                                ? 'Swipe active! Drag card horizontally or tap below dots and side arrows.' 
                                : 'توجيه: ميزة السحب مفعلة! اسحب البطاقة لليمين/اليسار لتصفح البنود أو اضغط على الأسهم الجانبية.'}
                            </span>
                            <span className="font-bold text-[#2B4D89] bg-white border border-gray-200 px-2.5 py-0.5 rounded-lg shrink-0 font-mono" dir="ltr">
                              {clampedIdx + 1} / {activeProjStages.length}
                            </span>
                          </div>

                          {/* Deck core */}
                          <div className="relative flex items-center gap-3">
                            
                            {/* Right Arrow Button */}
                            <button
                              type="button"
                              onClick={isEn ? handlePrev : handleNext}
                              className="p-2.5 rounded-full bg-white hover:bg-slate-50 border border-gray-150 text-[#2B4D89] shadow-md transition-all active:scale-90 hover:scale-105 shrink-0 hover:border-gray-300 cursor-pointer hidden sm:flex items-center justify-center no-print"
                              title={isEn ? "Previous" : "السابق"}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>

                            {/* Deck swiper container */}
                            <div className="flex-1 overflow-hidden py-1">
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={stg.id}
                                  drag="x"
                                  dragConstraints={{ left: 0, right: 0 }}
                                  dragElastic={0.3}
                                  onDragEnd={(event, info) => {
                                    if (info.offset.x < -80) {
                                      if (isEn) handleNext(); else handlePrev();
                                    } else if (info.offset.x > 80) {
                                      if (isEn) handlePrev(); else handleNext();
                                    }
                                  }}
                                  initial={{ opacity: 0, x: isEn ? 50 : -50, scale: 0.98 }}
                                  animate={{ opacity: 1, x: 0, scale: 1 }}
                                  exit={{ opacity: 0, x: isEn ? -50 : 50, scale: 0.98 }}
                                  transition={{ duration: 0.22, ease: 'easeOut' }}
                                  className="border border-gray-150/80 rounded-2.5xl p-5 bg-gray-50/20 space-y-4 hover:border-[#2B4D89]/30 transition-all text-right cursor-grab active:cursor-grabbing select-none relative"
                                >
                                  {/* top row of stage card */}
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-extrabold text-xs text-[#2B4D89] flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                      {transStageName}
                                    </h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                      stg.status === 'APPROVED' || stg.status === 'INSPECTION_APPROVED' || stg.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                      stg.status === 'REJECTED' || stg.status === 'INSPECTION_FAILED' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                      stg.status === 'IN_PROGRESS' || stg.status === 'UNDER_WAY' ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse' :
                                      stg.status === 'INSPECTION_REQUESTED' ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' :
                                      'bg-gray-100 text-gray-400'
                                    }`}>
                                      {stg.status === 'APPROVED' || stg.status === 'INSPECTION_APPROVED' || stg.status === 'PAID' ? (isEn ? '✓ Accepted & Verified' : 'مقبول فنيّاً') :
                                       stg.status === 'REJECTED' || stg.status === 'INSPECTION_FAILED' ? (isEn ? '❌ Deficiency Notes Raised' : 'مرفوض للتعديل') :
                                       stg.status === 'IN_PROGRESS' || stg.status === 'UNDER_WAY' ? (isEn ? '⏳ Active Execution' : 'جاري التنفيذ 🛠️') :
                                       stg.status === 'INSPECTION_REQUESTED' ? (isEn ? '🔬 Awaiting Field Audit' : 'بانتظار معاينة الاستلام') : (isEn ? 'Scheduled to Start' : 'لم يبدأ')}
                                    </span>
                                  </div>

                                  {/* Timeline & Penalties inside Company view */}
                                  {stg.totalDurationDays && (() => {
                                    const matchedContract = (contracts || []).find(c => c.requestId === activeId);
                                    const delayDays = (stg.totalDurationDays && stg.daysElapsed && stg.daysElapsed > stg.totalDurationDays) 
                                      ? (stg.daysElapsed - stg.totalDurationDays) 
                                      : 0;
                                    const penaltyRate = stg.delayPenaltyPerDay || matchedContract?.delayPenaltyPerDay || 500;

                                    return (
                                      <div className="bg-gray-50 border border-gray-150 p-2.5 rounded-xl text-[10px] space-y-1.5 font-semibold text-gray-500 font-sans">
                                        <div className="flex justify-between text-gray-700">
                                          <span>📅 {isEn ? 'Allocated Duration:' : 'مدة التسليم المقررة:'} <strong>{stg.totalDurationDays} {isEn ? 'days' : 'يوم'}</strong></span>
                                          <span>⏱️ {isEn ? 'Elapsed Days:' : 'أيام العمل المنقضية الفعليه:'} <strong>{stg.daysElapsed || 0} {isEn ? 'days' : 'يوم'}</strong></span>
                                        </div>
                                        {delayDays > 0 ? (
                                          <div className="bg-amber-50 text-amber-950 border border-amber-200/65 p-2 rounded-lg text-right text-[10px] space-y-0.5 mt-1">
                                            <div className="font-extrabold flex items-center justify-between text-[#2B4D89]">
                                              <span>⚠️ {isEn ? 'Stage Overrun (Fines overall):' : '⚠️ تجاوز الإطار الزمني بالبند:'}</span>
                                              <span className="font-mono text-[9px] text-[#A51D24]">{delayDays} {isEn ? 'days late' : 'أيام تأخير'}</span>
                                            </div>
                                            <p className="text-[9px] text-gray-500 font-medium leading-normal animate-pulse">
                                              {isEn 
                                                ? `This phase has exceeded its limit by ${delayDays} days. Note that contractual delay penalties are calculated on the full project duration rather than separately per stage.` 
                                                : `تجاوز هذا البند مدته المقررة بـ ${delayDays} يوم، ويتم جمع الغرامات والتقييم على مستوى المشروع ككل للتيسير وليس لكل مرحلة منفصلة.`}
                                            </p>
                                          </div>
                                        ) : (
                                          <div className="flex justify-between text-gray-400 text-[9px] mt-1 border-t border-gray-200/40 pt-1">
                                            <span>⚖️ {isEn ? 'Contractual Penalty:' : 'معدل غرامة التأخير بالعقد:'} <strong>{penaltyRate} {isEn ? 'EGP/day' : 'ج.م/يوم'}</strong></span>
                                            <span className="text-emerald-700 font-bold">{isEn ? 'On Track' : '✓ منضبط'}</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}

                                  {/* Interactive progress bar */}
                                  <div className="space-y-1 text-[11px] pointer-events-auto">
                                    <div className="flex justify-between text-gray-400 font-bold text-[10px]">
                                      <span>{isEn ? 'On-Site Estimated Progress:' : 'نسبة الإنجاز الحالية:'}</span>
                                      <span className="text-[#2B4D89] font-mono">{stg.progress}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        disabled={stg.status === 'APPROVED'}
                                        value={stg.progress}
                                        onChange={e => {
                                          const newVal = Number(e.target.value);
                                          onUpdateStage(stg.id, { 
                                            progress: newVal, 
                                            status: newVal === 100 ? 'UNDER_WAY' : newVal > 0 ? 'UNDER_WAY' : 'NOT_STARTED' 
                                          });
                                        }}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2B4D89]"
                                      />
                                    </div>
                                  </div>

                                  {/* Action Buttons based on logic */}
                                  <div className="pt-2 border-t border-gray-100/60 pointer-events-auto">
                                    {(() => {
                                      const percentVal = stg.paymentPercentage !== undefined ? stg.paymentPercentage : (
                                        stg.name.includes("سباكة") ? 20 :
                                        stg.name.includes("كهرباء") ? 15 :
                                        (stg.name.includes("بياض") || stg.name.includes("محارة")) ? 15 :
                                        (stg.name.includes("أرضيات") || stg.name.includes("بورسلين")) ? 20 :
                                        stg.name.includes("دهانات") ? 15 : 15
                                      );
                                      const matchedContract = (contracts || []).find(c => c.requestId === activeId);
                                      const totalContractVal = matchedContract ? (matchedContract.finalContractPrice || matchedContract.totalAmount) : 230000;
                                      const actualSValue = (totalContractVal * percentVal) / 100;
                                      return (
                                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2 rounded-lg text-[10px] mb-2 leading-relaxed">
                                          <span className="text-gray-500 font-bold">
                                            {isEn ? "Clause Milestone Value:" : "الوزن المالي والدفعة المخصصة من التعاقد:"}
                                          </span>
                                          <span className="font-extrabold text-[#2B4D89] font-mono">
                                            %{percentVal} — {actualSValue.toLocaleString()} ج.م
                                          </span>
                                        </div>
                                      );
                                    })()}

                                    {stg.status === 'APPROVED' ? (
                                      <div className="space-y-1.5">
                                        <span className="text-[10px] text-emerald-700 font-bold block flex items-center gap-1 bg-emerald-50/70 p-2 border border-emerald-250 rounded-lg text-right">
                                          <CheckCircle2 className="w-3.5 h-3.5 animate-pulse shrink-0 text-emerald-600" />
                                          <span>{isEn ? '✓ Step officially certified by inspector. Customer notified.' : '✓ تم التسليم الهندسي للمشرف. تقريره متاح للعميل.'}</span>
                                        </span>
                                        {stg.paymentReleased ? (
                                          <span className="text-[10px] text-teal-800 font-bold bg-teal-50 border border-teal-100 p-2 rounded-lg block text-center">
                                            💰 {isEn ? 'Escrow Released! Stage funds released to your bank account' : '💰 تم تسليم الدفعة المالية المخصصة لحسابك البنكي!'}
                                          </span>
                                        ) : (
                                          <span className="text-[10px] text-gray-500 font-light block text-center bg-gray-50 p-1 rounded">
                                            ⏳ {isEn ? 'Awaiting customer release authorization click...' : '⏳ بانتظار تحرير العميل للدفعة المالية (اعتماد الدفعة)'}
                                          </span>
                                        )}
                                      </div>
                                    ) : stg.inspectionRequested ? (
                                      <div className="bg-amber-50 text-amber-800 border border-amber-100 px-3 py-2 rounded-xl text-[10px] text-center font-bold">
                                        ⏳ {isEn ? 'Field audit request submitted! Awaiting site QA inspection...' : '⏳ تم إرسال إشعار فوري للمهندس وبانتظار زيارته الميدانية للموقع'}
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {stg.status === 'REJECTED' && (
                                          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-2 rounded-xl text-[10px] leading-relaxed text-right font-semibold">
                                            <strong>⚠️ {isEn ? 'Deficiency report from supervisor:' : 'تقرير الرفض الفني من المشرف مسبقاً:'}</strong> "{stg.rejectedNotes || (isEn ? 'Adjust raw electrical insulation cables.' : 'يجب معالجة الكابلات الحالية')}"
                                          </div>
                                        )}
                                        <button
                                          type="button"
                                          disabled={stg.progress < 100}
                                          onClick={() => onUpdateStage(stg.id, { inspectionRequested: true, status: 'UNDER_WAY' })}
                                          className={`w-full py-2.5 rounded-xl font-extrabold text-[11px] transition-all text-center ${
                                            stg.progress < 100 
                                              ? 'bg-gray-150 text-gray-400 cursor-not-allowed border border-gray-250' 
                                              : 'bg-[#2B4D89] hover:bg-[#32528c] text-white cursor-pointer active:scale-[0.99] hover:shadow-md'
                                          }`}
                                        >
                                          🚀 {stg.progress === 0 
                                            ? (isEn ? 'Audit Locked (Stage Not Started)' : 'طلب استلام (مغلق - لم تبدأ المرحلة بعد)') 
                                            : stg.progress < 100 
                                              ? (isEn ? `Audit Locked (Progress ${stg.progress}%, needs 100%)` : `طلب استلام (مغلق - جاري التنفيذ بنسبة ${stg.progress}%)`)
                                              : (isEn ? 'Request Immediate Field Audit Receipt' : 'طلب استلام المرحلة والمراجعة فنيّاً فوريّاً')
                                          }
                                        </button>
                                        {stg.progress < 100 && (
                                          <p className="text-[9px] text-[#2B4D89]/80 text-center font-medium mt-1.5 bg-blue-50/50 border border-blue-200/40 p-2 rounded-xl leading-normal">
                                            💡 {isEn 
                                              ? 'Please slide the progress bar of this stage to 100% once done to unlock site inspection request.' 
                                              : 'يرجى سحب مؤشر إنجاز هذه المرحلة إلى 100% عند الانتهاء منها لتفعيل خيار مراجعة واستلام البند هندسياً.'
                                            }
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              </AnimatePresence>
                            </div>

                            {/* Left Arrow Button */}
                            <button
                              type="button"
                              onClick={isEn ? handleNext : handlePrev}
                              className="p-2.5 rounded-full bg-white hover:bg-slate-50 border border-gray-150 text-[#2B4D89] shadow-md transition-all active:scale-90 hover:scale-105 shrink-0 hover:border-gray-300 cursor-pointer hidden sm:flex items-center justify-center no-print"
                              title={isEn ? "Next" : "التالي"}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>

                          </div>

                          {/* Dot Nav indicators */}
                          <div className="flex items-center justify-center gap-2 pt-2 pb-1 no-print">
                            {activeProjStages.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setCompanyActiveStageIndex(idx)}
                                className={`h-2 hover:scale-110 cursor-pointer rounded-full transition-all duration-200 ${
                                  idx === clampedIdx ? 'w-6 bg-[#2B4D89]' : 'w-2 bg-gray-300'
                                }`}
                                title={`Slide ${idx + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })() : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeProjStages.map(stg => {
                          const transStageName = isEn 
                            ? (stg.name === 'تأسيس السباكة والصرف' ? 'Plumbing & Drainage Setup' : 
                               stg.name === 'تأسيس الكهرباء والإنارة' ? 'Electrical & Lighting Setup' : 
                               stg.name === 'أعمال المحارة والأسقف' ? 'Plastering & Ceiling Work' : 
                               stg.name === 'الدهانات والتشطيب النهائي' ? 'Painting & Final Decoration' : stg.name) 
                            : stg.name;
                          return (
                            <div 
                              key={stg.id} 
                              className="border border-gray-150/80 rounded-2.5xl p-4 bg-gray-50/20 space-y-3 hover:border-[#2B4D89]/30 transition-all text-right"
                            >
                              
                              {/* top row of stage card */}
                              <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-xs text-[#2B4D89] flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                  {transStageName}
                                </h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  stg.status === 'APPROVED' || stg.status === 'INSPECTION_APPROVED' || stg.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  stg.status === 'REJECTED' || stg.status === 'INSPECTION_FAILED' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                  stg.status === 'IN_PROGRESS' || stg.status === 'UNDER_WAY' ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse' :
                                  stg.status === 'INSPECTION_REQUESTED' ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' :
                                  'bg-gray-100 text-gray-400'
                                }`}>
                                  {stg.status === 'APPROVED' || stg.status === 'INSPECTION_APPROVED' || stg.status === 'PAID' ? (isEn ? '✓ Accepted & Verified' : 'مقبول فنيّاً') :
                                   stg.status === 'REJECTED' || stg.status === 'INSPECTION_FAILED' ? (isEn ? '❌ Deficiency Notes Raised' : 'مرفوض للتعديل') :
                                   stg.status === 'IN_PROGRESS' || stg.status === 'UNDER_WAY' ? (isEn ? '⏳ Active Execution' : 'جاري التنفيذ 🛠️') :
                                   stg.status === 'INSPECTION_REQUESTED' ? (isEn ? '🔬 Awaiting Field Audit' : 'بانتظار معاينة الاستلام') : (isEn ? 'Scheduled to Start' : 'لم يبدأ')}
                                </span>
                              </div>

                              {/* Timeline & Penalties inside Company view */}
                              {stg.totalDurationDays && (() => {
                                const matchedContract = (contracts || []).find(c => c.requestId === activeId);
                                const delayDays = (stg.totalDurationDays && stg.daysElapsed && stg.daysElapsed > stg.totalDurationDays) 
                                  ? (stg.daysElapsed - stg.totalDurationDays) 
                                  : 0;
                                const penaltyRate = stg.delayPenaltyPerDay || matchedContract?.delayPenaltyPerDay || 500;

                                return (
                                  <div className="space-y-1.5 pt-1.5 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-[10px] font-extrabold text-gray-500 font-sans">
                                      <span>⏱️ {isEn ? `Target Duration: ${stg.totalDurationDays} Days` : `الفترة المحددة: ${stg.totalDurationDays} يوم`}</span>
                                      <span>📅 {isEn ? `Days Elapsed: ${stg.daysElapsed || 0} Days` : `الأيام المنقضية: ${stg.daysElapsed || 0} يوم`}</span>
                                    </div>
                                    {delayDays > 0 && (
                                      <div className="bg-rose-50 border border-rose-100 text-rose-800 p-2 rounded-xl text-[10px] font-bold flex items-center justify-between flex-row-reverse">
                                        <span>⚠️ {isEn ? `Delayed by ${delayDays} Days` : `تأخير ${delayDays} يوم`}</span>
                                        <span>💸 {isEn ? `Delay Penalty: ${(delayDays * penaltyRate).toLocaleString()} EGP` : `غرامة تأخير: ${(delayDays * penaltyRate).toLocaleString()} ج.م`}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Handover & Triple Warranty Certification Control */}
                    {activeProjStages.length > 0 && activeProjStages.every(s => s.status === 'APPROVED') && (
                      <div className="mt-8 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-dashed border-amber-300 rounded-3xl p-6 text-right space-y-4 font-sans">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl pt-1">🏆</span>
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-sm text-[#2B4D89]">
                              {isEn ? 'Final Handover & Triple Warranty Plan Activation' : 'إجراءات التسليم النهائي وتفعيل وثيقة الضمان الثلاثي الذهبي'}
                            </h4>
                            <p className="text-xs text-gray-550 leading-relaxed font-bold">
                              {isEn 
                                ? 'Congratulations! All finishing stages have been fully certified by the inspector and accepted by the client. You can now finalize the handover to activate the 3-Year Golden Triple Warranty certificate.'
                                : 'مبارك لكم! تم إنجاز واعتماد كافة بنود التشطيب هندسياً وفنيّاً بالكامل. يمكنك الآن إتمام محضر التسليم النهائي لتفعيل وثيقة الضمان الثلاثي الذهبي للعميل لمدة 3 سنوات.'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-amber-200/50 flex flex-col sm:flex-row-reverse items-center justify-between gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateRequest) {
                                onUpdateRequest(activeProj.id, { 
                                  status: 'COMPLETED',
                                  inspectionStatus: 'APPROVED',
                                  inspectionDate: new Date().toISOString().split('T')[0]
                                });
                                alert(isEn 
                                  ? 'Project completed successfully! Handover verified and Triple Warranty has been activated.' 
                                  : 'تم تسليم المشروع نهائياً بنجاح وتفعيل وثيقة الضمان الثلاثية لـ 3 سنوات!');
                              }
                            }}
                            className="bg-[#1D4A3D] hover:bg-[#15362C] text-white px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5 cursor-pointer animate-duration-150"
                          >
                            <span>🤝</span>
                            <span>{isEn ? 'Confirm Final Handover & Issue Warranty Certificate' : 'توقيع محضر التسليم وتبويب وثيقة الضمان وإغلاق العقد'}</span>
                          </button>
                          
                          <span className="text-[10px] text-amber-800 font-extrabold bg-amber-500/10 border border-amber-200 px-3 py-1 rounded-lg">
                            {isEn ? 'Status: Ready for Handover' : 'الحالة: بانتظار توقيع محضر الاستلام'}
                          </span>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })()}

            </div>
          </div>
          )}

          {viewOverlay === 'PW' && (
          <div className="w-full space-y-6 font-sans text-right">
            
            {/* Back Header */}
            <div className="flex items-center justify-between bg-white border border-gray-150 p-5 rounded-3xl shadow-xs">
              <div className="text-right">
                <h3 className="font-extrabold text-[#2B4D89] text-base flex items-center gap-2 flex-row-reverse justify-end font-sans">
                  <span>🖼️ {isEn ? 'Company Portfolio' : 'معرض سابقة أعمال ونماذج تشطيب الشركة'}</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {isEn ? 'Add and showcase your highest quality finishes to prospective clients.' : 'قم بإدراج أفضل نماذج تشطيبك المكتملة لجذب العملاء المباشرين.'}
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => setViewOverlay(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-750 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-gray-150 active:scale-95 font-sans"
              >
                {isEn ? 'Return to Projects' : '← العودة للمشروعات والطلبات'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Portfolio list */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-150 shadow-sm p-6 text-right space-y-6">
                <div className="border-b border-gray-100 pb-4 flex items-center justify-between flex-row-reverse">
                  <span className="text-xl">🖼️</span>
                  <h3 className="font-extrabold text-sm text-[#2B4D89] font-sans">
                    {isEn ? 'Registered Portfolio Items' : 'النماذج المفعلة في معرض سابقة أعمالك'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {previousWorks.map(work => (
                    <div key={work.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-150 text-xs space-y-3 relative text-right shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between font-sans">
                      <button 
                        type="button"
                        onClick={() => setPreviousWorks(previousWorks.filter(p => p.id !== work.id))}
                        className="absolute top-3 left-3 bg-rose-50 text-rose-500 p-1.5 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
                        title={isEn ? 'Delete Item' : 'حذف البند'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="space-y-1">
                        <h4 className="font-black text-xs text-[#2B4D89] pr-3">
                          {work.title}
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                          {work.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold border-t border-gray-100 pt-2 font-sans">
                        <div>
                          <span className="text-gray-400 block">{isEn ? 'Area' : 'المساحة'}</span>
                          <span className="text-gray-700 font-mono">{work.area} م²</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">{isEn ? 'Budget' : 'الميزانية'}</span>
                          <span className="text-gray-755 font-mono">{work.budget?.toLocaleString()} {isEn ? 'EGP' : 'ج.م'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400 block">{isEn ? 'Location' : 'الموقع'}</span>
                          <span className="text-gray-700">{work.location}</span>
                        </div>
                      </div>

                      {work.images && work.images.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100/70 font-sans">
                          {work.images.map((img, i) => (
                            <span key={i} className="bg-white border border-gray-150 px-2 py-0.5 rounded-lg text-[9px] text-[#2B4D89]/85 font-bold">
                              {img}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form to add previous work */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-150 shadow-sm p-6 text-right space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-extrabold text-sm text-[#2B4D89] flex items-center gap-2 justify-end font-sans">
                    <span>➕</span>
                    <span>{isEn ? 'Add New Portfolio Item' : 'إضافة نموذج أعمال جديد'}</span>
                  </h3>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newWorkTitle.trim()) {
                      alert(isEn ? 'Please add a title' : 'يرجى كتابة عنوان النموذج');
                      return;
                    }
                    const newWork: PreviousWork = {
                      id: `PW-${Date.now()}`,
                      category: newWorkCategory,
                      title: newWorkTitle,
                      description: newWorkDescription,
                      budget: newWorkBudget,
                      area: newWorkArea,
                      location: newWorkLocation,
                      images: uploadedWorkImages.length > 0 ? uploadedWorkImages : ['🛋️ ريسبشن فاخر']
                    };
                    setPreviousWorks([newWork, ...previousWorks]);
                    setNewWorkTitle('');
                    setNewWorkDescription('');
                    setNewWorkBudget(300000);
                    setNewWorkArea(120);
                    setNewWorkLocation('');
                    setUploadedWorkImages([]);
                    alert(isEn ? 'Portfolio item added successfully!' : 'تم إضافة نموذج الأعمال بنجاح في معرضك المؤقت!');
                  }}
                  className="space-y-4 text-xs font-sans"
                >
                  <div className="space-y-1">
                    <label className="block text-gray-700 font-bold">{isEn ? 'Model Title' : 'عنوان نموذج التشطيب'}</label>
                    <input 
                      type="text" 
                      required
                      placeholder={isEn ? 'e.g. Modern Apartment Sheikh Zayed' : 'مثال: شقة مودرن الشيخ زايد'}
                      value={newWorkTitle} 
                      onChange={(e) => setNewWorkTitle(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-700 font-bold">{isEn ? 'Unit Category' : 'تصنيف العقار'}</label>
                    <select
                      value={newWorkCategory}
                      onChange={(e) => setNewWorkCategory(e.target.value as 'شقة' | 'فيلا' | 'مكتب')}
                      className="w-full p-2.5 bg-gray-55 border border-gray-200 rounded-xl font-bold text-gray-750 font-sans"
                    >
                      <option value="شقة">{isEn ? 'Apartment' : 'شقة سكنية'}</option>
                      <option value="فيلا">{isEn ? 'Villa' : 'فيلا مستقلة'}</option>
                      <option value="مكتب">{isEn ? 'Office' : 'مكتب إداري'}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-700 font-bold">{isEn ? 'Total Area (sqm)' : 'المساحة الإجمالية (م²)'}</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={newWorkArea} 
                      onChange={(e) => setNewWorkArea(Number(e.target.value))}
                      className="w-full p-2.5 bg-gray-55 border border-gray-200 rounded-xl font-bold font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-700 font-bold">{isEn ? 'Budget Spent (EGP)' : 'الميزانية المنفذة (ج.م)'}</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={newWorkBudget} 
                      onChange={(e) => setNewWorkBudget(Number(e.target.value))}
                      className="w-full p-2.5 bg-gray-55 border border-gray-200 rounded-xl font-bold font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-700 font-bold">{isEn ? 'Location' : 'الموقع والمدينة'}</label>
                    <input 
                      type="text" 
                      required
                      placeholder={isEn ? 'e.g. New Cairo' : 'مثال: التجمع الخامس'}
                      value={newWorkLocation} 
                      onChange={(e) => setNewWorkLocation(e.target.value)}
                      className="w-full p-2.5 bg-gray-55 border border-gray-200 rounded-xl font-bold font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-700 font-bold">{isEn ? 'Description of Work' : 'شرح وتفاصيل بنود التشطيب'}</label>
                    <textarea 
                      rows={3}
                      value={newWorkDescription} 
                      onChange={(e) => setNewWorkDescription(e.target.value)}
                      placeholder={isEn ? 'e.g. Ultra super lux finishing with modern gypsum board...' : 'مثال: تشطيب ألترا سوبر لوكس مع أعمال جبس بورد حديثة...'}
                      className="w-full p-2.5 bg-gray-55 border border-gray-200 rounded-xl font-bold font-sans text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-700 font-bold">{isEn ? 'Attached Images (Text Tags)' : 'صور أو تاغات توضيحية للنموذج'}</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={isEn ? 'e.g. 🛋️ Modern Living Room' : 'مثال: 🛋️ ريسبشن فاخر'}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val && !uploadedWorkImages.includes(val)) {
                              setUploadedWorkImages([...uploadedWorkImages, val]);
                              (e.target as HTMLInputElement).value = '';
                            } 
                          }
                        }}
                        className="w-full p-2.5 bg-gray-55 border border-gray-200 rounded-xl font-bold font-sans text-xs"
                      />
                    </div>
                  </div>
                    {uploadedWorkImages.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {uploadedWorkImages.map((img, i) => (
                          <span key={i} className="bg-blue-50 text-[#2B4D89] text-[9px] font-bold px-2 py-0.5 rounded-lg border border-blue-100 flex items-center gap-1">
                            {img}
                            <button type="button" onClick={() => setUploadedWorkImages(uploadedWorkImages.filter((_, idx) => idx !== i))} className="hover:text-rose-600 text-[10px] font-sans font-bold">✕</button>
                          </span>
                        ))}
                      </div>
                    )}

                  <button 
                    type="submit" 
                    className="w-full bg-[#1D4A3D] hover:bg-[#15362C] text-white p-3 rounded-xl font-extrabold transition-colors cursor-pointer text-center font-sans mt-3"
                  >
                    {isEn ? 'Submit & Confirm Model' : 'إدراج وتفعيل النموذج بالمعرض 🚀'}
                  </button>
                </form>
              </div>

            </div>
          </div>
          )}

          {viewOverlay === 'PKG' && (
          <div className="w-full space-y-6 font-sans text-right">
            <div className="bg-white border border-gray-150 p-5 rounded-3xl shadow-xs">
              <div className="text-right">
                <h3 className="font-extrabold text-[#2B4D89] text-base flex items-center gap-2 flex-row-reverse justify-end font-sans">
                  <span>💼 {isEn ? 'Contractor Pricing Packages' : 'مستويات وباقات أسعار تشطيب الشركة'}</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {isEn ? 'Showcase your company pricing standards directly on the customer profiles.' : 'نماذج ومستويات التسعير المعتمدة المتاحة للزبائن للتعاقا الفوري.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map(pkg => (
                <div key={pkg.id} className="bg-[#FAF9F6] border border-gray-150 rounded-3xl p-6 shadow-sm font-sans space-y-4 text-right flex flex-col justify-between hover:border-[#1D4A3D]/35 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-row-reverse">
                      <span className="text-2xl">⚡</span>
                      <h4 className="font-black text-sm text-[#2b4d89]">{pkg.name}</h4>
                    </div>
                    <p className="text-xs text-gray-550 font-bold leading-normal">{pkg.description}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex justify-between items-center flex-row-reverse">
                      <span className="text-[10px] text-gray-400 block">{isEn ? 'Standard Meter Price' : 'سعر المتر المربع التقريبي'}</span>
                      <span className="text-emerald-700 font-black text-xs font-mono">{pkg.pricePerMeter?.toLocaleString()} {isEn ? 'EGP / m²' : 'ج.م / م²'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

      {/* Global Details Modal Dialog */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn animate-duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative border border-gray-150 max-h-[92vh] overflow-y-auto font-sans flex flex-col text-slate-800">
            
            {/* Header Box */}
            <div className="p-3 sm:p-4 border-b border-gray-100 bg-[#2B4D89] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 shrink-0 rounded-t-3xl relative text-right">
              <button 
                onClick={() => setSelectedDetailItem(null)}
                className="absolute top-3.5 left-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold cursor-pointer transition-all no-print text-xs"
              >
                ✕
              </button>
              
              <div className="text-right pr-6 sm:pr-0">
                <span className="bg-amber-400/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-md text-[9px] border border-amber-400/30 ml-2">
                  #{selectedDetailItem.id}
                </span>
                <h3 className="font-extrabold text-base inline-block align-middle font-sans">
                  {isEn ? 'Client Project Specifications' : 'المواصفات الفنية والمخططات الهندسية للطلب'}
                </h3>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  {isEn ? 'Review full details to make a precise bidding response.' : 'تفاصيلطلب العميل، المساحة، نوع التشطيب، والمستندات الفنية.'}
                </p>
              </div>
            </div>

            {/* content body */}
            <div className="p-3 sm:p-4 space-y-3 overflow-y-auto text-right flex-1" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* Right block: General specifications */}
                <div className="md:col-span-2 space-y-3">
                  {/* Basic Specifications + Spaces Inner Layout (Combined into one super bento card) */}
                  <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-3xs text-right font-sans">
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 font-sans">
                        <h4 className="text-xs font-black flex items-center gap-1.5 font-sans text-slate-850">
                          <span>📐</span>
                          <span>المواصفات الفنية وتفاصيل الوحدة والتقسيم الداخلي</span>
                        </h4>
                        <TenderCountdown deadline={selectedDetailItem.deadline} createdAt={selectedDetailItem.createdAt} isEn={isEn} />
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-150 text-right hover:border-blue-200 hover:bg-blue-50/10 transition-all">
                          <span className="block text-[9.5px] text-gray-400 font-semibold mb-0.5 text-right font-sans">🏡 نوع العقار</span>
                          <span className="font-extrabold text-[#2B4D89] text-[11px] text-right block">
                            {selectedDetailItem.unitType === 'فيلا' ? 'فيلا مستقلة' : selectedDetailItem.unitType === 'مكتب' ? 'مكتب إداري/تجاري' : 'شقة سكنية'}
                          </span>
                        </div>
                        
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-150 font-sans text-right hover:border-blue-200 hover:bg-blue-50/10 transition-all">
                          <span className="block text-[9.5px] text-gray-400 font-semibold mb-0.5 text-right">📐 المساحة الإجمالية</span>
                          <span className="font-black text-[11px] text-slate-800 font-mono block text-right">
                            {selectedDetailItem.area} متر مربع
                          </span>
                        </div>
                        
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-150 text-right hover:border-blue-200 hover:bg-blue-50/10 transition-all font-sans">
                          <span className="block text-[9.5px] text-gray-400 font-semibold mb-0.5 text-right font-sans">💎 مستوى التشطيب</span>
                          <span className="font-black text-[9.5px] text-amber-900 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded-md inline-block text-right font-sans">
                            {selectedDetailItem.finishingLevel || 'لوكس'}
                          </span>
                        </div>
                        
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-150 text-right hover:border-blue-200 hover:bg-blue-50/10 transition-all font-sans">
                          <span className="block text-[9.5px] text-gray-400 font-semibold mb-0.5 text-right font-sans">💰 الميزانية التقديرية</span>
                          <span className="font-black text-[11px] text-emerald-700 font-mono block text-right">
                            {selectedDetailItem.budget?.toLocaleString() || '0'} ج.م
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Spaces inner layout: horizontal chips/badges that consume minimal vertical real estate */}
                    <div className="mt-2.5 pt-2.5 border-t border-dashed border-slate-200 flex flex-wrap items-center justify-between gap-1">
                      <span className="text-[10px] text-gray-550 font-black flex items-center gap-1">
                        <span>🚪</span>
                        <span>توزيع الفراغات الداخلية والمنافع:</span>
                      </span>
                      <div className="flex flex-wrap gap-1 text-right font-sans">
                        <span className="bg-slate-50 border border-slate-150 text-slate-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <span>🛏️</span>
                          <span>{selectedDetailItem.bedroomsCount || 3} غرف نوم</span>
                        </span>
                        <span className="bg-slate-50 border border-slate-150 text-slate-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <span>🛁</span>
                          <span>{selectedDetailItem.bathroomsCount || 2} حمامات</span>
                        </span>
                        <span className="bg-slate-50 border border-slate-150 text-slate-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <span>🍳</span>
                          <span>{selectedDetailItem.kitchensCount || 1} مطابخ</span>
                        </span>
                      </div>
                    </div>
                  </div>
{/* Notes & Description Card */}
                  <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-3xs space-y-2 text-right font-sans">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 pb-2 border-b border-rose-100">
                      <span>📋</span>
                      <span>وصف وتوصيف الخامات وتفضيلات البند الفني بالكامل</span>
                    </div>
                    <div className="text-[11px] text-gray-755 leading-relaxed text-right font-medium font-sans">
                      <p className="bg-[#FAF9F6] p-2 rounded-xl border border-gray-150 font-semibold text-right">
                        {selectedDetailItem.notes || (isEn ? "No specific instructions or custom requests added by the client." : "لا توجد تفضيلات أو ملاحظات إضافية مسجلة من العميل لهذا الطلب.")}
                      </p>
                    </div>
                  </div>

                  {/* Technical Blueprints & Layout Catalog */}
                  <div className="bg-white rounded-2xl p-3 border border-gray-150 space-y-2 font-sans">
                    <h4 className="font-extrabold text-xs text-[#2B4D89] pb-1.5 border-b border-gray-150">
                      📂 {isEn ? 'Technical Blueprints & layout' : 'المستندات وخرائط الكروكي الهندسية للمشروع'}
                    </h4>
                    {selectedDetailItem.blueprints && selectedDetailItem.blueprints.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1 font-sans">
                        {selectedDetailItem.blueprints.map((file: string, index: number) => {
                          const isPDF = file.toLowerCase().endsWith('.pdf') || file.includes('pdf');
                          return (
                            <a 
                              key={index}
                              href="#"
                              onClick={(e) => { e.preventDefault(); alert(isEn ? 'Opening blueprint in real sandbox secure preview...' : 'جاري سحب ومعاينة المستند الهندسي المؤمن...'); }}
                              className="inline-flex items-center gap-1.5 bg-blue-50/70 text-[#2B4D89] border border-blue-200/50 hover:bg-blue-100/70 px-2.5 py-0.5 rounded-lg text-[10.5px] font-bold transition-all"
                            >
                              <span>{isPDF ? '📃' : '🖼️'}</span>
                              <span>{file.split('/').pop() || file}</span>
                            </a>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="bg-gray-50/55 rounded-xl p-2 text-center border border-dashed border-gray-200 text-[11px] text-gray-400 font-medium">
                        {isEn ? 'No architectural files attached.' : 'لم يتم إرفاق مخططات تكميلية لهذا الطلب حالياً.'}
                      </div>
                    )}
                  </div>
                </div>

                                {/* Left panel: Verification + contact info */}
                <div className="space-y-3">
                  {/* Detailed Location Address Card */}
                  <div className="bg-white rounded-2xl p-3 border border-gray-150 space-y-2 text-right">
                    <h4 className="font-extrabold text-[11px] text-gray-500 flex items-center gap-1">
                      <span>📍</span>
                      <span>{isEn ? 'Location Details' : 'العنوان الجغرافي والبلد'}</span>
                    </h4>
                    <div className="font-semibold text-[10.5px] leading-relaxed space-y-1.5 text-right">
                      <p><strong>{isEn ? 'Region:' : 'المحافظة والمدينة:'}</strong> {selectedDetailItem.governorate}، {selectedDetailItem.city}</p>
                      
                      {(selectedDetailItem.status === 'ACTIVE' || selectedDetailItem.status === 'CONTRACT_SIGNED' || selectedDetailItem.status === 'CONTRACTED' || selectedDetailItem.status === 'COMPLETED') ? (
                        <>
                          {selectedDetailItem.detailedLocationText && (
                            <p className="bg-gray-50 p-1.5 rounded-lg text-gray-700 leading-normal text-right">
                              <strong>{isEn ? 'Specific Address:' : 'العنوان بدقة:'}</strong> {selectedDetailItem.detailedLocationText}
                            </p>
                          )}
                          {selectedDetailItem.mapCoordinates && (
                            <a 
                              href={selectedDetailItem.mapCoordinates.startsWith('http') ? selectedDetailItem.mapCoordinates : `https://maps.google.com/?q=${selectedDetailItem.mapCoordinates}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-1.5 px-3 text-[10.5px] font-black transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                            >
                              🌐 {isEn ? 'Show Google Maps Location' : 'فتح الموقع على خرائط جوجل 🌐'}
                            </a>
                          )}
                        </>
                      ) : (
                        <div className="bg-amber-50/60 border border-amber-200/50 p-2 rounded-xl text-right">
                          <p className="text-[9.5px] text-amber-800 font-extrabold mb-0.5">
                            🔒 {isEn ? 'Exact Address Hidden' : 'مخفي: تفاصيل الموقع مغلقة'}
                          </p>
                          <p className="text-[8.5px] text-gray-500 leading-relaxed">
                            {isEn 
                              ? '* Precise street address will unlock once the contract is signed.' 
                              : '* تفاصيل الشارع الدقيقة تظهر تلقائياً فور توقيع العقد الهندسي وبدء المشروع لتوفير الخصوصية.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Safety and Inspector verification */}
                  <div className="bg-[#FAF9F6] border border-emerald-500/15 rounded-2xl p-3 space-y-2 text-right">
                    <div className="flex items-center gap-1.5 flex-row-reverse justify-end">
                      <span className="text-base">🛡️</span>
                      <h4 className="font-extrabold text-[11px] text-emerald-800">{isEn ? 'Quality Oversight' : 'ضمان الجودة والإشراف الهندسي'}</h4>
                    </div>
                    <div className="text-[10px] leading-relaxed text-gray-550 font-semibold text-right space-y-1">
                      {selectedDetailItem.requireInspector ? (
                        <>
                          <span className="text-[#0F7453] font-extrabold block">
                            ✓ {isEn ? 'Inspector Protection active: The client requested independent engineering supervision for quality audit.' : '✓ حماية المشرف: هذا العميل طلب إشرافاً هندسياً خارجياً لضمان معايير الجودة في جميع مراحل ومقايسات التشطيب.'}
                          </span>
                          <span className="text-emerald-800 block font-bold text-[9.5px]">
                            👤 {isEn ? 'Assigned Engineering Supervisor:' : 'المهندس المشرف المعين للموقع:'} {
                              selectedDetailItem.assignedInspectorId === 'INSP-1' ? (isEn ? 'Eng. Karim Mamdouh' : 'م/ كريم ممدوح') :
                              selectedDetailItem.assignedInspectorId === 'INSP-3' ? (isEn ? 'Eng. Amr El-Shafei' : 'م/ عمرو الشافعي') :
                              (isEn ? 'Eng. Yehia Zakaria' : 'م/ يحيى زكريا')
                            }
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-500 block">
                            🛡️ {isEn ? 'Self-Oversight: Internal engineering monitoring by your company (the client did not request dedicated external supervision).' : 'الرقابة الذاتية: إشراف وتوجيه داخلي من قِبل شركتكم (لم يقم العميل بطلب مشرف خارجي تكميلي لمراحل وبنود العمل الجارية).'}
                          </span>
                          <span className="text-blue-700 font-bold block text-[9.5px] bg-blue-50/70 p-1.5 rounded-lg border border-blue-100 mt-1 inline-block">
                            👤 {isEn ? 'Project Coordinator (Follows up until contract signing):' : 'المهندس المشرف لمتابعة وتنسيق المشروع حتى توقيع العقد:'} {
                              selectedDetailItem.assignedInspectorId === 'INSP-1' ? (isEn ? 'Eng. Karim Mamdouh' : 'م/ كريم ممدوح') :
                              selectedDetailItem.assignedInspectorId === 'INSP-3' ? (isEn ? 'Eng. Amr El-Shafei' : 'م/ عمرو الشافعي') :
                              (isEn ? 'Eng. Yehia Zakaria' : 'م/ يحيى زكريا')
                            }
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Client Contact Info */}
                  <div className="bg-[#2B4D89] text-white rounded-2xl p-3 space-y-2 font-sans border border-[#1E3B70]/30 shadow-xs">
                    <h4 className="font-extrabold text-[11px] text-amber-300">📞 {isEn ? 'Direct Contact Information' : 'بيانات التواصل للعميل'}</h4>
                    
                    {(selectedDetailItem.status === 'ACTIVE' || selectedDetailItem.status === 'CONTRACT_SIGNED' || selectedDetailItem.status === 'CONTRACTED' || selectedDetailItem.status === 'COMPLETED') ? (
                      <div className="text-[10.5px] space-y-1.5 font-bold font-sans">
                        <div className="flex justify-between items-center text-right select-all">
                          <span className="text-blue-100">{isEn ? 'Contact Name' : 'اسم العميل:'}</span>
                          <span className="text-white text-xs">{selectedDetailItem.clientName}</span>
                        </div>
                        <div className="flex justify-between items-center text-right select-all">
                          <span className="text-blue-100">{isEn ? 'Phone Number' : 'رقم الجوال:'}</span>
                          <span className="font-mono text-amber-200 select-all" dir="ltr">{selectedDetailItem.clientPhone}</span>
                        </div>
                        <div className="flex justify-between items-center text-right select-all">
                          <span className="text-blue-100">{isEn ? 'Email Address' : 'البريد الإلكتروني:'}</span>
                          <span className="font-mono text-amber-200 select-all">{selectedDetailItem.clientEmail}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] space-y-1.5 font-bold bg-white/10 p-2 rounded-xl border border-white/10 text-right">
                        <div className="flex justify-between items-center opacity-85 text-right">
                          <span className="text-blue-100">{isEn ? 'Contact Name' : 'اسم العميل:'}</span>
                          <span className="text-white">{selectedDetailItem.clientName ? `${selectedDetailItem.clientName.substring(0, 4)}*** ***` : (isEn ? 'Client' : 'عميل شطبها المعين')}</span>
                        </div>
                        <div className="flex justify-between items-center text-right">
                          <span className="text-blue-100">{isEn ? 'Phone Number' : 'رقم الجوال:'}</span>
                          <span className="text-[9px] text-amber-300 font-extrabold bg-amber-400/20 px-1.5 py-0.2 rounded border border-amber-400/25">🔒 {isEn ? 'Hidden until contract signed' : 'مغلق حتى تفعيل العقد'}</span>
                        </div>
                        <div className="flex justify-between items-center text-right">
                          <span className="text-blue-100">{isEn ? 'Email Address' : 'البريد الإلكتروني:'}</span>
                          <span className="text-[9px] text-amber-300 font-extrabold bg-amber-400/20 px-1.5 py-0.2 rounded border border-amber-400/25">🔒 {isEn ? 'Hidden until contract signed' : 'مغلق حتى تفعيل العقد'}</span>
                        </div>
                      </div>
                    )}

                    <p className="text-[9px] leading-relaxed text-blue-100 border-t border-white/10 pt-1.5 text-right font-medium">
                      {(selectedDetailItem.status === 'ACTIVE' || selectedDetailItem.status === 'CONTRACT_SIGNED' || selectedDetailItem.status === 'CONTRACTED' || selectedDetailItem.status === 'COMPLETED') ? (
                        isEn ? 'Direct communications enabled.' : 'ملاحظة: يمكنك التواصل الهاتفي بالعميل لتنسيق خطط المواد والتوريدات.'
                      ) : (
                        isEn ? 'Contact profiles unlock automatically once contract is signed.' : 'ملاحظة: تظهر تواصل العميل مباشرةً فور الاتفاق وصياغة وتوقيع العقد الهندسي المعتمد.'
                      )}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0 rounded-b-3xl gap-4 flex-row-reverse">
              <button 
                onClick={() => setSelectedDetailItem(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-250 bg-white text-gray-600 hover:bg-gray-100 font-bold font-sans cursor-pointer text-xs"
              >
                {isEn ? 'Close' : 'إغلاق الرجوع للخلف ✕'}
              </button>

              {!mySubmittedOffers.some(o => o.requestId === selectedDetailItem.id) && (
                <button
                  type="button"
                  onClick={() => {
                    setTargetRequest(selectedDetailItem);
                    setSelectedDetailItem(null);
                    setIsOfferModalOpen(true);
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2B4D89] hover:bg-[#1A386D] text-white cursor-pointer transition-all shadow-md shadow-blue-900/10 leading-none shrink-0"
                >
                  {isEn ? 'Submit Architectural Quote' : 'تقديم العرض الهندسي المالي 🚀'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* BID/OFFER PRICING DIALOG MODAL */}
      {isOfferModalOpen && targetRequest && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative border border-gray-150 max-h-[92vh] overflow-y-auto font-sans flex flex-col text-slate-800">
            
            {/* Header Box */}
            <div className="p-3 sm:p-4 border-b border-gray-100 bg-[#2B4D89] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 shrink-0 rounded-t-3xl relative text-right">
              <button 
                onClick={() => {
                  setIsOfferModalOpen(false);
                  setTargetRequest(null);
                  setEditingOffer(null);
                }}
                className="absolute top-3.5 left-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold cursor-pointer transition-all no-print text-xs"
                title={isEn ? 'Close Details' : 'إغلاق التفاصيل'}
              >
                ✕
              </button>
              
              <div className="text-right pr-6 sm:pr-0">
                <span className="bg-amber-400/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-lg text-[10px] border border-amber-400/30 ml-2">
                  #{targetRequest.id}
                </span>
                <h3 className="font-extrabold text-lg inline-block align-middle font-sans">
                  {editingOffer 
                    ? (isEn ? 'Edit Architectural & Pricing Quote' : 'تعديل وتحديث عرض السعر المرفق')
                    : (isEn ? 'Submit Professional Architectural & Pricing Quote' : 'تقديم عرض سعر هندسي وتشطيب متكامل')}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  {isEn 
                    ? `Request ID: ${targetRequest.id} — ${targetRequest.unitType === 'فيلا' ? 'Villa' : 'Apartment'} (${targetRequest.area} m²)` 
                    : `طلب رقم: ${targetRequest.id} — ${targetRequest.unitType} بمساحة (${targetRequest.area} م²)`}
                </p>
              </div>
            </div>

            <form onSubmit={handleOfferSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Form body */}
              <div className="p-4 md:p-5.5 space-y-4 overflow-y-auto text-right flex-1" dir="rtl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                  
                  {/* Right block: Description, materials, and warranty (col-span-2) */}
                  <div className="md:col-span-2 space-y-4">
                    
                    {/* Item 1: Scope */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-150 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-150 flex-row-reverse">
                        <label className="block text-xs font-extrabold text-[#2B4D89]">
                          {isEn ? '1. Detailed Offer Scope & Notes:' : '١. تفاصيل وعناصر العرض التشغيلي والمناقصات:'}
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAIOptimize(false)}
                          disabled={isAIOptimizingDescription}
                          className="text-[#123E32] hover:text-[#0F7453] text-[9.5px] font-black bg-emerald-50 hover:bg-emerald-110 border border-emerald-200 rounded-lg px-2 py-1 leading-none transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {isAIOptimizingDescription ? (
                            <>
                              <span className="animate-spin text-xs inline-block border-2 border-current border-t-transparent rounded-full w-2.5 h-2.5 align-middle"></span>
                              <span>{isEn ? 'Enhancing...' : 'جاري التحسين المنهجي...'}</span>
                            </>
                          ) : (
                            <>
                              <span>🪄</span> <span>{isEn ? 'AI Enhance' : 'تحسين بالذكاء الاصطناعي 🪄'}</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea 
                        required
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder={isEn ? 'Provide comprehensive details about the design concept, stages and execution workflow...' : 'اكتب تسلسل العمل والخطوات الهندسية المتبعة، الأعمال المشمولة وتفاصيل تسليم مراحل الحوائط والأسقف والتشطيب الفاخر...'}
                        className="w-full p-3 bg-gray-50 hover:bg-gray-50/30 focus:bg-white border border-gray-150 focus:border-[#2B4D89] text-xs rounded-xl h-28 outline-none leading-relaxed transition-all select-text whitespace-pre-wrap text-right font-medium" 
                      />
                    </div>

                    {/* Item 2: Materials */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-150 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-150 flex-row-reverse">
                        <label className="block text-xs font-extrabold text-[#2B4D89]">
                          {isEn ? '2. Types of Materials per Item / Brand names:' : '٢. تفاصيل نوع الخامات المحددة المستخدمة في كل بند:'}
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAIOptimize(true)}
                          disabled={isAIOptimizingMaterials}
                          className="text-[#123E32] hover:text-[#0F7453] text-[9.5px] font-black bg-emerald-50 hover:bg-emerald-110 border border-emerald-200 rounded-lg px-2 py-1 leading-none transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {isAIOptimizingMaterials ? (
                            <>
                              <span className="animate-spin text-xs inline-block border-2 border-current border-t-transparent rounded-full w-2.5 h-2.5 align-middle"></span>
                              <span>{isEn ? 'Formatting...' : 'جاري سحب الماركات المعتمدة...'}</span>
                            </>
                          ) : (
                            <>
                              <span>🪄</span> <span>{isEn ? 'AI Format Specs' : 'توليد خامات ذكي بالذكاء الاصطناعي 🪄'}</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea 
                        required
                        value={materialsDetail}
                        onChange={e => setMaterialsDetail(e.target.value)}
                        placeholder={isEn ? 'Plumbing (BR / Baninger), Electricity (Elsewedy cables), Paints (Jotun Fenomastic), Floors (imported marble / Cleopatra)...' : 'مثال: السباكة (بي آر الشريف مع عزل ألماني)، الكهرباء (كابلات السويدي ومفاتيح شنايدر)، الدهانات (جوتن فينوماستيك أصلي)، الأرضيات (بورسلين كليوباترا فرز أول رخامي)...'}
                        className="w-full p-3 bg-gray-50 hover:bg-gray-50/30 focus:bg-white border border-gray-150 focus:border-[#2B4D89] text-xs rounded-xl h-28 outline-none leading-relaxed transition-all select-text whitespace-pre-wrap text-right font-medium" 
                      />
                    </div>

                    {/* Item 3: Warranty */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-150 space-y-3">
                      <h4 className="font-extrabold text-xs text-gray-500 pb-1.5 border-b border-gray-150">
                        🛡️ {isEn ? '3. Project Warranty' : '٣. مواصفات ونظام الضمان وبيروقراطية الصيانة'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Is there a warranty */}
                        <div>
                          <span className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                            {isEn ? 'Does the offer include a warranty?' : 'هل يتضمن عرضك الهندسي فترة ضمان معتمدة؟'}
                          </span>
                          <div className="grid grid-cols-2 gap-2 font-sans text-right" dir="rtl">
                            <button
                              type="button"
                              onClick={() => setHasWarranty(true)}
                              className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                hasWarranty 
                                  ? 'bg-[#2B4D89] text-white border-[#2B4D89] shadow-sm' 
                                  : 'bg-white text-gray-600 border-gray-250 hover:bg-gray-100'
                              }`}
                            >
                              <span>✓</span> {isEn ? 'Yes, Available' : 'نعم، يوجد ضمان'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setHasWarranty(false);
                                setWarrantyYears(0);
                              }}
                              className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                !hasWarranty 
                                  ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-sm' 
                                  : 'bg-white text-gray-600 border-gray-250 hover:bg-gray-100'
                              }`}
                            >
                              <span>✕</span> {isEn ? 'No Warranty' : 'لا يوجد ضمان'}
                            </button>
                          </div>
                        </div>

                        {/* Duration in Years */}
                        <div>
                          <span className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                            {isEn ? 'Warranty Scope (Years):' : 'مدة الضمان المطلوبة بالسنوات كاملة:'}
                          </span>
                          <div className="relative font-sans">
                            <input
                              type="number"
                              min="1"
                              max="50"
                              required={hasWarranty}
                              disabled={!hasWarranty}
                              value={hasWarranty ? warrantyYears : ''}
                              onChange={e => setWarrantyYears(Math.max(1, Number(e.target.value)))}
                              placeholder={isEn ? 'e.g. 10' : 'مثال: 10'}
                              className={`w-full p-2.5 bg-white border rounded-lg text-xs font-bold outline-none text-center transition-all ${
                                hasWarranty 
                                  ? 'border-gray-250 focus:border-[#2B4D89] text-[#2B4D89]' 
                                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            />
                            {hasWarranty && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold pointer-events-none">
                                {isEn ? 'Years' : 'سنوات ضمان'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {aiOptimizeError && (
                      <p className="text-[10px] text-rose-600 text-center font-bold bg-rose-50 p-2 rounded-xl border border-rose-100">⚠️ {aiOptimizeError}</p>
                    )}
                  </div>

                  {/* Left block: Financial, duration and security details (col-span-1) */}
                  <div className="space-y-4">
                    
                    {/* Price Card */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-150 space-y-2.5">
                      <h4 className="font-extrabold text-[#2B4D89] text-xs">
                        💵 {isEn ? 'Required Total Price (EGP)' : 'القيمة المالية الإجمالية للعرض (ج.م)'}
                      </h4>
                      <div className="relative font-sans">
                        <input 
                          type="number" 
                          required
                          min="1000"
                          value={price}
                          onChange={e => setPrice(Number(e.target.value))}
                          className="w-full pl-12 pr-3 py-2.5 bg-slate-50 border border-gray-250 focus:border-[#2B4D89] focus:bg-white rounded-xl text-sm font-black text-center outline-none transition-all text-slate-800" 
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-[#2B4D89] font-black pointer-events-none">
                          ج.م
                        </span>
                      </div>
                      <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold p-2.5 rounded-xl border border-emerald-100 leading-relaxed text-right">
                        {isEn ? `Client Budget: ${targetRequest.budget.toLocaleString()} EGP` : `ميزانية العميل المعتمدة للطلب: ${targetRequest.budget.toLocaleString()} ج.م`}
                      </div>
                    </div>

                    {/* Duration Card */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-150 space-y-2.5">
                      <h4 className="font-extrabold text-[#2B4D89] text-xs">
                        📅 {isEn ? 'Total Construction Duration (Days)' : 'مدة التنفيذ وتجهيز الموقع بالأيام'}
                      </h4>
                      <div className="relative font-sans">
                        <input 
                          type="number" 
                          required
                          min="1"
                          value={durationDays}
                          onChange={e => setDurationDays(Number(e.target.value))}
                          className="w-full pl-16 pr-3 py-2.5 bg-slate-50 border border-gray-250 focus:border-[#2B4D89] focus:bg-white rounded-xl text-sm font-black text-center outline-none transition-all text-slate-800" 
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-purple-700 font-extrabold pointer-events-none">
                          يوم عمل
                        </span>
                      </div>
                      <div className="bg-purple-50 text-purple-900 text-[10px] font-bold p-2.5 rounded-xl border border-purple-100 leading-relaxed text-right">
                        {isEn 
                          ? `Estimated delivery: Approx. ${Math.round(durationDays / 30)} months` 
                          : `حوالي ${Math.round(durationDays / 30)} أشهر تسليم مبرمج للمشروع`}
                      </div>
                    </div>

                    {/* Secure Warning Shield Card */}
                    <div className="bg-[#2B4D89]/8 text-[#2B4D89] rounded-2xl p-4 border border-[#2B4D89]/15 text-[10.5px] leading-relaxed space-y-1.5 text-right font-medium">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-sm">🛡️</span>
                        <h4 className="font-extrabold text-blue-900">{isEn ? 'Safe Protocol Encryption' : 'بروتوكول حماية وسرية العرض'}</h4>
                      </div>
                      <p className="text-gray-650 font-semibold leading-relaxed">
                        {isEn 
                          ? 'Worry-free submissions with end-to-end encrypted pricing logs. Your company name appears hidden as an automated random ID to clients until approved.' 
                          : 'لضمان النزاهة وحفظ حق المكاتب الهندسية وشركات المقاولات، سيظهر عرضك باسم مستعار رقمي للعملاء ولا يرفع الغطاء القانوني ويظهر اسمك إلا بعد الاعتماد المالي المبدئي للدفعات.'}
                      </p>
                    </div>

                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action Footer */}
              <div className="p-4 bg-slate-50 border-t border-gray-150 flex flex-row-reverse justify-between items-center gap-4 shrink-0 rounded-b-3xl">
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2B4D89] hover:bg-[#1C3663] text-white cursor-pointer transition-all shadow-md shadow-blue-900/10 hover:scale-[1.01] shrink-0 font-sans"
                >
                  {editingOffer 
                    ? (isEn ? '💾 Keep changes and Update Bid' : '💾 حفظ التعديلات وإعادة إرسال العرض المكتمل 🚀')
                    : (isEn ? '💾 Dispatch and Submit Bid' : '💾 إطلاق وثيقة العرض السعري للعميل 🚀')}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsOfferModalOpen(false);
                    setTargetRequest(null);
                    setEditingOffer(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-gray-250 bg-white text-gray-600 hover:bg-gray-100 font-bold font-sans cursor-pointer text-xs"
                >
                  {isEn ? 'Cancel & Close' : 'إلغاء وإغلاق رجوع ✕'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
      </div>
    </div>
  );
};
