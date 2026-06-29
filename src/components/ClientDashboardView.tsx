import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Plus, Clock, ExternalLink, Calendar, 
  Layers, CheckCircle, Info, ChevronRight, ChevronLeft, MessageSquare, 
  ShieldCheck, FileText, MapPin, Landmark, DollarSign, Award, ArrowLeftRight, Sparkles, Search
} from 'lucide-react';
import { ClientRequest, Offer, Company, ProjectStage, Contract, RequestStatus, PromoCode } from '../types';
import { Language, getTranslation } from '../lib/translations';
import { ProjectProgressChart } from './ProjectProgressChart';
import { ClientProgressDonut } from './ClientProgressDonut';
import { BidComparisonDashboard } from './BidComparisonDashboard';
import { TenderCountdown } from './TenderCountdown';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

export interface MapRegion {
  name: string;
  nameEn: string;
  gov: string;
  govEn: string;
  coords: string;
  x: number; // percentage X position on the layout map
  y: number; // percentage Y position on the layout map
}

export const MAP_REGIONS: MapRegion[] = [
  { name: 'التجمع الخامس', nameEn: '5th Settlement', gov: 'القاهرة', govEn: 'Cairo', coords: '30.01284, 31.44021', x: 74, y: 52 },
  { name: 'مدينة نصر', nameEn: 'Nasr City', gov: 'القاهرة', govEn: 'Cairo', coords: '30.05611, 31.33015', x: 62, y: 44 },
  { name: 'المعادي', nameEn: 'Maadi', gov: 'القاهرة', govEn: 'Cairo', coords: '29.95995, 31.25841', x: 55, y: 65 },
  { name: 'الشيخ زايد', nameEn: 'Sheikh Zayed', gov: 'الجيزة', govEn: 'Giza', coords: '30.02450, 30.98560', x: 28, y: 42 },
  { name: 'الدقي', nameEn: 'Dokki', gov: 'الجيزة', govEn: 'Giza', coords: '30.03842, 31.21102', x: 44, y: 48 },
  { name: '6 أكتوبر', nameEn: '6th of October', gov: 'الجيزة', govEn: 'Giza', coords: '29.94050, 30.91380', x: 18, y: 60 },
  { name: 'سموحة', nameEn: 'Smouha', govEn: 'Alexandria', gov: 'الإسكندرية', coords: '31.20890, 29.95570', x: 34, y: 18 },
  { name: 'لوران', nameEn: 'Loran', govEn: 'Alexandria', gov: 'الإسكندرية', coords: '31.24250, 29.98010', x: 48, y: 12 },
  { name: 'الرمل', nameEn: 'Raml', govEn: 'Alexandria', gov: 'الإسكندرية', coords: '31.22410, 29.95420', x: 41, y: 15 }
];

interface ClientDashboardViewProps {
  requests: ClientRequest[];
  offers: Offer[];
  companies: Company[];
  contracts?: Contract[];
  onAddRequest: (request: ClientRequest) => void;
  onAcceptOffer: (requestId: string, offer: Offer) => void;
  onCancelAcceptOffer?: (requestId: string) => void;
  stages: ProjectStage[];
  onUpdateStage: (stageId: string, updates: Partial<ProjectStage>) => void;
  lang: Language;
  onSignOut?: () => void;
  promoCodes?: PromoCode[];
  onUpdateRequest?: (requestId: string, updates: Partial<ClientRequest>) => void;
}

export const ClientDashboardView: React.FC<ClientDashboardViewProps> = ({
  requests,
  offers,
  companies,
  contracts = [],
  onAddRequest,
  onAcceptOffer,
  onCancelAcceptOffer,
  stages,
  onUpdateStage,
  lang,
  onSignOut,
  promoCodes = [],
  onUpdateRequest
}) => {
  const isEn = lang === 'en';
  // We set clientEmail from local storage.
  const clientEmailLocal = localStorage.getItem('shattabba_client_email') || 'ahmed.rashidy@gmail.com';
  
  // We keep track of the selected request. Default to the first one PENDING or RECEIVED.
  const clientRequests = requests.filter(r => r.clientEmail === clientEmailLocal ||
    (clientEmailLocal === 'ahmed.rashidy@gmail.com' && (r.clientId === 'ID#4092' || r.clientId === 'CLIENT-1'))
  );
  const defaultSelectedId = clientRequests[0]?.id || 'REQ-001';
  const [selectedRequestId, setSelectedRequestId] = useState<string>(defaultSelectedId);

  // Synchronize with external selection triggers (like clicking on a request code inside details modal)
  useEffect(() => {
    const handleActiveChanged = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && clientRequests.some(r => r.id === customEvent.detail)) {
        setSelectedRequestId(customEvent.detail);
      }
    };
    window.addEventListener('shatibha-active-request-changed', handleActiveChanged);
    return () => {
      window.removeEventListener('shatibha-active-request-changed', handleActiveChanged);
    };
  }, [clientRequests]);

  // Swipe Navigation state for tracking project stages
  const [clientViewMode, setClientViewMode] = useState<'SWIPE' | 'LIST'>('SWIPE');
  const [clientActiveStageIndex, setClientActiveStageIndex] = useState<number>(0);
  
  // State for active stage inside the integrated Project Snapshot section
  const [snapshotSelectedStageId, setSnapshotSelectedStageId] = useState<string>('');

  // 🎞️ Client-side Before/After presentation runner state
  const [clientPresentationOpen, setClientPresentationOpen] = useState<boolean>(false);
  const [clientPresentationSelectedStageId, setClientPresentationSelectedStageId] = useState<string>('project-overall');
  const [clientSlideIndex, setClientSlideIndex] = useState<number>(0);

  // New state to toggle modal for the registration form
  const [isFormOpen, setIsFormOpen] = useState(false);

  // State to view deep offer details
  const [viewingOfferDetails, setViewingOfferDetails] = useState<Offer | null>(null);
  const [rejectedOfferIds, setRejectedOfferIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shattabba_rejected_offers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleRejectOfferInternal = (offerId: string) => {
    const updated = [...rejectedOfferIds, offerId];
    setRejectedOfferIds(updated);
    localStorage.setItem('shattabba_rejected_offers', JSON.stringify(updated));
  };

  // New state list of uploaded engineering drawing files (الرسم الهندسي للوحدة)
  const [attachedDrawings, setAttachedDrawings] = useState<string[]>(['الرسم الهندسي المعتمد - شقة 180م.pdf']);

  // Selected profile company for safe viewing (no contact details)
  const [selectedProfileCompany, setSelectedProfileCompany] = useState<Company | null>(null);
  
  // Track open offer modal active sub-tab (Offer details, company profile, standard packages, previous projects portfolio)
  const [offerModalTab, setOfferModalTab] = useState<'OFFER' | 'PROFILE' | 'PACKAGES' | 'PORTFOLIO'>('OFFER');
  const [showAcceptConfirm, setShowAcceptConfirm] = useState<boolean>(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState<boolean>(false);
  const [showRetractConfirm, setShowRetractConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (viewingOfferDetails) {
      setOfferModalTab('OFFER');
      setShowAcceptConfirm(false);
      setShowRejectConfirm(false);
      setShowRetractConfirm(false);
    }
  }, [viewingOfferDetails]);

  // States for interactive company profile preview modal
  const [profileModalTab, setProfileModalTab] = useState<'ABOUT' | 'PORTFOLIO' | 'REVIEWS'>('ABOUT');
  const [portfolioSearch, setPortfolioSearch] = useState('');
  const [portfolioCategory, setPortfolioCategory] = useState('ALL');
  const [beforeAfterToggle, setBeforeAfterToggle] = useState<Record<string, 'BEFORE' | 'AFTER'>>({});

  // Client User Profile mock DB states
  const [clientName, setClientName] = useState(() => localStorage.getItem('shattabba_client_name') || 'أحمد محمود الرشيدي');
  const [clientEmail, setClientEmail] = useState(() => localStorage.getItem('shattabba_client_email') || 'ahmed.rashidy@gmail.com');
  const [clientAvatar, setClientAvatar] = useState<string | null>(() => localStorage.getItem('shattabba_client_avatar'));
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [cameraSimulationActive, setCameraSimulationActive] = useState(false);
  const [cameraPicIndex, setCameraPicIndex] = useState(0);

  // State to track which stats card detail list/table is currently open below it
  const [selectedStatCard, setSelectedStatCard] = useState<'NONE' | 'TOTAL' | 'PENDING' | 'LIVE_BID' | 'CONTRACTED' | 'OFFERS'>('NONE');

  // NPS Survey States for durably tracking completed milestones ratings per request
  const [npsContractorRating, setNpsContractorRating] = useState<number | null>(() => {
    const saved = localStorage.getItem(`shattabba_nps_contractor_${selectedRequestId}`);
    return saved ? Number(saved) : null;
  });
  const [npsPlatformRating, setNpsPlatformRating] = useState<number | null>(() => {
    const saved = localStorage.getItem(`shattabba_nps_platform_${selectedRequestId}`);
    return saved ? Number(saved) : null;
  });
  const [npsComment, setNpsComment] = useState<string>(() => {
    return localStorage.getItem(`shattabba_nps_comment_${selectedRequestId}`) || '';
  });
  const [npsSubmitted, setNpsSubmitted] = useState<boolean>(() => {
    return localStorage.getItem(`shattabba_nps_submitted_${selectedRequestId}`) === 'true';
  });
  const [npsDismissed, setNpsDismissed] = useState<boolean>(() => {
    return localStorage.getItem(`shattabba_nps_dismissed_${selectedRequestId}`) === 'true';
  });

  const handleNpsSubmit = () => {
    if (npsContractorRating === null || npsPlatformRating === null) return;
    localStorage.setItem(`shattabba_nps_contractor_${selectedRequestId}`, String(npsContractorRating));
    localStorage.setItem(`shattabba_nps_platform_${selectedRequestId}`, String(npsPlatformRating));
    localStorage.setItem(`shattabba_nps_comment_${selectedRequestId}`, npsComment);
    localStorage.setItem(`shattabba_nps_submitted_${selectedRequestId}`, 'true');
    setNpsSubmitted(true);
  };

  const handleNpsDismiss = () => {
    localStorage.setItem(`shattabba_nps_dismissed_${selectedRequestId}`, 'true');
    setNpsDismissed(true);
  };

  const handleNpsReset = () => {
    localStorage.removeItem(`shattabba_nps_contractor_${selectedRequestId}`);
    localStorage.removeItem(`shattabba_nps_platform_${selectedRequestId}`);
    localStorage.removeItem(`shattabba_nps_comment_${selectedRequestId}`);
    localStorage.removeItem(`shattabba_nps_submitted_${selectedRequestId}`);
    localStorage.removeItem(`shattabba_nps_dismissed_${selectedRequestId}`);
    setNpsContractorRating(null);
    setNpsPlatformRating(null);
    setNpsComment('');
    setNpsSubmitted(false);
    setNpsDismissed(false);
  };

  React.useEffect(() => {
    const savedContractor = localStorage.getItem(`shattabba_nps_contractor_${selectedRequestId}`);
    const savedPlatform = localStorage.getItem(`shattabba_nps_platform_${selectedRequestId}`);
    const savedComment = localStorage.getItem(`shattabba_nps_comment_${selectedRequestId}`);
    const savedSubmitted = localStorage.getItem(`shattabba_nps_submitted_${selectedRequestId}`) === 'true';
    const savedDismissed = localStorage.getItem(`shattabba_nps_dismissed_${selectedRequestId}`) === 'true';

    setNpsContractorRating(savedContractor ? Number(savedContractor) : null);
    setNpsPlatformRating(savedPlatform ? Number(savedPlatform) : null);
    setNpsComment(savedComment || '');
    setNpsSubmitted(savedSubmitted);
    setNpsDismissed(savedDismissed);
  }, [selectedRequestId]);

  // Form states matching specifications in the screenshot
  const [unitType, setUnitType] = useState('شقة');
  const [area, setArea] = useState<number | ''>('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [city, setCity] = useState('التجمع الخامس');
  const [finishingLevel, setFinishingLevel] = useState('سوبر لوكس');
  const [budget, setBudget] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [blueprintsFile, setBlueprintsFile] = useState('17771525-78b9dba3c914?auto=format&fit=crop&w=300&q=80');
  const [requireInspector, setRequireInspector] = useState<boolean | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Promo code states
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);

  const handleApplyPromoCode = () => {
    setPromoError(null);
    setPromoSuccessMsg(null);
    if (!promoCodeInput.trim()) {
      setPromoError(isEn ? 'Please enter a coupon code' : 'يرجى إدخال كود الخصم أولاً');
      return;
    }
    const found = promoCodes.find(p => p.code.trim().toUpperCase() === promoCodeInput.trim().toUpperCase());
    if (!found) {
      setPromoError(isEn ? 'Invalid coupon code!' : 'كود الخصم غير صحيح أو غير موجود!');
      setAppliedPromo(null);
      return;
    }
    if (found.status !== 'ACTIVE') {
      setPromoError(isEn ? 'This coupon is inactive!' : 'كود الخصم متوقف حالياً!');
      setAppliedPromo(null);
      return;
    }
    // Check limits
    if (found.usageCount >= found.usageLimit) {
      setPromoError(isEn ? 'This coupon has reached its usage limit!' : 'لقد تجاوز هذا الكود الحد الأقصى للاستخدام!');
      setAppliedPromo(null);
      return;
    }
    // Date checks
    const todayStr = '2026-06-06';
    if (found.startDate && todayStr < found.startDate) {
      setPromoError(isEn ? 'This coupon did not start yet!' : 'لم تبدأ فترة صلاحية هذا الكود بعد!');
      setAppliedPromo(null);
      return;
    }
    if (found.endDate && todayStr > found.endDate) {
      setPromoError(isEn ? 'This coupon has expired!' : 'انتهت صلاحية هذا الكود!');
      setAppliedPromo(null);
      return;
    }

    // Success
    setAppliedPromo(found);
    setPromoSuccessMsg(isEn ? `Coupon applied: ${found.code} successfully!` : `تم تطبيق الكود ${found.code} بنجاح!`);
  };

  const [detailedLocationText, setDetailedLocationText] = useState<string>('');
  const [mapCoordinates, setMapCoordinates] = useState<string>('30.01284, 31.44021');
  
  // Interactive GPS Map Search and Picker state
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isMapPickingVisible, setIsMapPickingVisible] = useState(false);
  const [mapActivePinX, setMapActivePinX] = useState<number>(74); // Default corresponding to التجمع الخامس
  const [mapActivePinY, setMapActivePinY] = useState<number>(52);
  const [mapFeedbackMsg, setMapFeedbackMsg] = useState<string | null>(null);
  
  // Custom room counts
  const [bedroomsCount, setBedroomsCount] = useState<number | ''>('');
  const [bathroomsCount, setBathroomsCount] = useState<number | ''>('');
  const [kitchensCount, setKitchensCount] = useState<number | ''>('');
  
  // Status type of the request being created
  const [newRequestStatusType, setNewRequestStatusType] = useState<RequestStatus>('PENDING_REVIEW');

  // Active Blueprint preview switcher
  const [activeKrokeeIndex, setActiveKrokeeIndex] = useState<number>(0);

  // Interactive Comparison & Quality Scoring States
  const [comparisonPriority, setComparisonPriority] = useState<'BALANCED' | 'PRICE' | 'DURATION' | 'RATING' | 'MATERIALS'>('BALANCED');
  
  // Interactive Bid Comparison Selector State
  const [selectedCompareOfferIds, setSelectedCompareOfferIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState<boolean>(false);

  // Automatically select all active offers for the selected request when it changes or when offers vary
  useEffect(() => {
    const activeRequestId = selectedRequestId || (requests.filter(r => r.clientId === 'ID#4092' || r.clientId === 'CLIENT-1' || r.clientId.startsWith('ID#') || r.id.startsWith('REQ'))[0]?.id || 'REQ-001');
    const activeOffers = offers.filter(
      o => o.requestId === activeRequestId && !rejectedOfferIds.includes(o.id)
    );
    setSelectedCompareOfferIds(activeOffers.map(o => o.id));
  }, [selectedRequestId, offers, rejectedOfferIds, requests]);

  const [importancePrice, setImportancePrice] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [importanceDuration, setImportanceDuration] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [importanceRating, setImportanceRating] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [importanceMaterials, setImportanceMaterials] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  // Local overrides to test different dynamic mock statuses for the selected request
  const [selectedRequestStatusOverride, setSelectedRequestStatusOverride] = useState<Record<string, RequestStatus>>({});
  
  // Collapsible description box state:
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  
  // Warranty claims states:
  const [isWarrantyClaimFormOpen, setIsWarrantyClaimFormOpen] = useState<boolean>(false);
  const [warrantyClaimProblem, setWarrantyClaimProblem] = useState<string>('');
  const [warrantyClaimNotes, setWarrantyClaimNotes] = useState<string>('');
  const [warrantyClaimSuccess, setWarrantyClaimSuccess] = useState<boolean>(false);

  const krokeeTemplates = [
    {
      title: 'كروكي شقة ٣ غرف وص...',
      filename: '17771525-78b9dba3c914?auto=format&fit=crop&w=300&q=80',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80'
    },
    {
      title: 'مخطط مكتب هندسي م...',
      filename: 'office_layout_render_4492.png',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=200&q=80'
    },
    {
      title: 'واجهة بناء مودرن',
      filename: 'modern_structure_elevations.png',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=80'
    }
  ];

  // Submit request handler
  const handleAddRequestSubmit = (e: React.FormEvent | React.MouseEvent, statusToUse: RequestStatus) => {
    e.preventDefault();
    setFormError(null);

    // Strict Field Validations (Except blueprints which is optional)
    if (!area || Number(area) <= 0) {
      setFormError(isEn ? 'Please specify a valid total area (must be greater than 0 m²).' : 'يرجى تحديد المساحة الإجمالية للوحدة وتكون أكبر من صفر م².');
      return;
    }
    if (!budget || Number(budget) <= 0) {
      setFormError(isEn ? 'Please specify your estimated budget (must be greater than 0 EGP).' : 'يرجى تحديد الميزانية التقريبية وتكون أكبر من صفر جنيه.');
      return;
    }
    if (bedroomsCount === '' || Number(bedroomsCount) <= 0) {
      setFormError(isEn ? 'Please specify the number of bedrooms (must be at least 1).' : 'يرجى تحديد عدد غرف النوم بالوحدة وتكون غرفة واحدة على الأقل.');
      return;
    }
    if (bathroomsCount === '' || Number(bathroomsCount) <= 0) {
      setFormError(isEn ? 'Please specify the number of bathrooms (must be at least 1).' : 'يرجى تحديد عدد الحمامات بالوحدة وتكون حمام واحد على الأقل.');
      return;
    }
    if (kitchensCount === '' || Number(kitchensCount) <= 0) {
      setFormError(isEn ? 'Please specify the number of kitchens (must be at least 1).' : 'يرجى تحديد عدد المطابخ بالوحدة وتكون مطبخ واحد على الأقل.');
      return;
    }
    if (!detailedLocationText || !detailedLocationText.trim()) {
      setFormError(isEn ? 'Please specify the detailed physical location address.' : 'يرجى كتابة العنوان التفصيلي الدقيق لموقع العقار لضمان دقة التسعير.');
      return;
    }
    if (requireInspector === null) {
      setFormError(isEn ? 'Please select whether you want Engineering Field Supervision.' : 'يرجى التفضل بالإجابة بنعم أو لا على سؤال: هل ترغب في الاستفادة من الإشراف الهندسي الميداني؟');
      return;
    }
    if (!notes || !notes.trim()) {
      setFormError(isEn ? 'Please describe your request specifications & material types.' : 'يرجى كتابة تفاصيل طلبك ونوع الخامات المطلوبة لتسهيل إعداد المقايسات.');
      return;
    }

    const newReqId = `REQ-00${requests.length + 1}`;
    const selectedInspectorBool = !!requireInspector;
    
    const originalInspectionFee = selectedInspectorBool ? Number(area) * 100 : 0;
    let promoDiscountAmount = 0;
    if (selectedInspectorBool && appliedPromo) {
      if (appliedPromo.discountType === 'PERCENTAGE') {
        promoDiscountAmount = (originalInspectionFee * appliedPromo.discountValue) / 100;
      } else {
        promoDiscountAmount = appliedPromo.discountValue;
      }
      promoDiscountAmount = Math.min(promoDiscountAmount, originalInspectionFee);
    }
    const finalInspectionFee = selectedInspectorBool ? (originalInspectionFee - promoDiscountAmount) : 0;

    const newRequest: ClientRequest = {
      id: newReqId,
      clientId: 'ID#4092',
      clientName: 'أحمد محمود الرشيدي',
      clientPhone: '+20 100 123 4567',
      clientEmail: 'ahmed.rashidy@gmail.com',
      unitType,
      area: Number(area),
      governorate,
      city,
      finishingLevel,
      budget: Number(budget),
      notes: notes.trim(),
      requireInspector: selectedInspectorBool,
      originalInspectionFee: selectedInspectorBool ? originalInspectionFee : undefined,
      usedPromoCode: (selectedInspectorBool && appliedPromo) ? appliedPromo.code : undefined,
      promoDiscountAmount: (selectedInspectorBool && appliedPromo) ? promoDiscountAmount : undefined,
      finalInspectionFee: selectedInspectorBool ? finalInspectionFee : undefined,
      detailedLocationText: detailedLocationText.trim(),
      mapCoordinates,
      blueprints: attachedDrawings.length > 0 ? attachedDrawings : ['لم يتم إرفاق رسم هندسي'],
      status: statusToUse, // Initial status strictly matching the clicked button action
      bedroomsCount: Number(bedroomsCount),
      bathroomsCount: Number(bathroomsCount),
      kitchensCount: Number(kitchensCount),
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddRequest(newRequest);
    setSelectedRequestId(newReqId); // Auto select the new request
    setIsFormOpen(false); // Close modal Form!

    // Reset input fields
    setNotes('');
    setArea('');
    setBudget('');
    setDetailedLocationText('');
    setBedroomsCount('');
    setBathroomsCount('');
    setKitchensCount('');
    setPromoCodeInput('');
    setAppliedPromo(null);
    setPromoError(null);
    setPromoSuccessMsg(null);
    setRequireInspector(null);
    setAttachedDrawings([]);
    setFormError(null);
  };

  // Egyptian governorates & cities mapping with Arabic/English localizations
  const governoratesAndCitiesMap: Record<string, { en: string; cities: { ar: string; en: string }[] }> = {
    'القاهرة': {
      en: 'Cairo',
      cities: [
        { ar: 'التجمع الخامس', en: 'Fifth Settlement' },
        { ar: 'العاصمة الإدارية الجديدة', en: 'New Administrative Capital' },
        { ar: 'مدينة نصر', en: 'Nasr City' },
        { ar: 'مصر الجديدة', en: 'Heliopolis' },
        { ar: 'المعادي', en: 'Maadi' },
        { ar: 'الشروق', en: 'Al Shourouk' },
        { ar: 'الرحاب', en: 'Al Rehab' },
        { ar: 'مدينتي', en: 'Madinaty' },
        { ar: 'المستقبل سيتي', en: 'Mostakbal City' },
        { ar: 'شيراتون', en: 'Sheraton' }
      ]
    },
    'الجيزة': {
      en: 'Giza',
      cities: [
        { ar: 'الشيخ زايد', en: 'Sheikh Zayed' },
        { ar: '6 أكتوبر', en: '6th of October' },
        { ar: 'حدائق أكتوبر', en: 'October Gardens' },
        { ar: 'الدقي', en: 'Dokki' },
        { ar: 'المهندسين', en: 'Mohandessin' },
        { ar: 'حدائق الأهرام', en: 'Haram Gardens' },
        { ar: 'الهرم', en: 'Haram' },
        { ar: 'الشيخ زايد الجديدة', en: 'New Zayed' }
      ]
    },
    'الإسكندرية': {
      en: 'Alexandria',
      cities: [
        { ar: 'سموحة', en: 'Smouha' },
        { ar: 'كفر عبده', en: 'Kafr Abdo' },
        { ar: 'لوران', en: 'Laurent' },
        { ar: 'جليم', en: 'Glym' },
        { ar: 'سيدي جابر', en: 'Sidi Gaber' },
        { ar: 'سيدي بشر', en: 'Sidi Bishr' },
        { ar: 'المنتزه', en: 'Montaza' },
        { ar: 'العجمي', en: 'Al Agamy' }
      ]
    },
    'الدقهلية': {
      en: 'Dakahlia',
      cities: [
        { ar: 'المنصورة الجديدة', en: 'New Mansoura' },
        { ar: 'المنصورة', en: 'Mansoura' },
        { ar: 'طلخا', en: 'Talkha' },
        { ar: 'ميت غمر', en: 'Mit Ghamr' }
      ]
    },
    'مطروح': {
      en: 'Matrouh',
      cities: [
        { ar: 'الساحل الشمالي', en: 'North Coast' },
        { ar: 'العلمين الجديدة', en: 'New Alamein' },
        { ar: 'سيدي عبد الرحمن', en: 'Sidi Abdel Rahman' },
        { ar: 'مرسى مطروح', en: 'Marsa Matrouh' },
        { ar: 'الضبعة', en: 'El Dabaa' }
      ]
    },
    'البحر الأحمر': {
      en: 'Red Sea',
      cities: [
        { ar: 'الغردقة', en: 'Hurghada' },
        { ar: 'الجونة', en: 'El Gouna' },
        { ar: 'سهل حشيش', en: 'Sahl Hasheesh' },
        { ar: 'سفاجا', en: 'Safaga' },
        { ar: 'مرسى علم', en: 'Marsa Alam' }
      ]
    },
    'القليوبية': {
      en: 'Qalyubia',
      cities: [
        { ar: 'العبور', en: 'Obour City' },
        { ar: 'شبرا الخيمة', en: 'Shubra El Kheima' },
        { ar: 'بنها', en: 'Banha' }
      ]
    },
    'الغربية': {
      en: 'Gharbia',
      cities: [
        { ar: 'طنطا', en: 'Tanta' },
        { ar: 'المحلة الكبرى', en: 'El Mahalla El Kubra' }
      ]
    },
    'الشرقية': {
      en: 'Sharqia',
      cities: [
        { ar: 'العاشر من رمضان', en: '10th of Ramadan' },
        { ar: 'الزقازيق', en: 'Zagazig' }
      ]
    }
  };

  // Derived helper for governorate -> city cascading pickers
  const availableCities = (governoratesAndCitiesMap[governorate]?.cities || []).map(c => c.ar);

  const handleGovernorateChange = (gov: string) => {
    setGovernorate(gov);
    const defaultCity = governoratesAndCitiesMap[gov]?.cities[0]?.ar || '';
    setCity(defaultCity);
  };

  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'فيلا': return '🏡';
      case 'مكتب': return '💼';
      case 'محل تجاري': return '🛍️';
      case 'عيادة': return '🏥';
      case 'شاليه': return '🏖️';
      default: return '🏢';
    }
  };

  const getUnitTypeLabelOnly = (type: string) => {
    switch (type) {
      case 'فيلا': return isEn ? 'Villa' : 'فيلا';
      case 'مكتب': return isEn ? 'Office' : 'مكتب';
      case 'محل تجاري': return isEn ? 'Commercial Shop' : 'محل تجاري';
      case 'عيادة': return isEn ? 'Clinic' : 'عيادة';
      case 'شاليه': return isEn ? 'Chalet' : 'شاليه';
      default: return isEn ? 'Apartment' : 'شقة';
    }
  };

  const mapPinCoords = { x: mapActivePinX, y: mapActivePinY };

  const handleMapClickDirect = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const pctX = Math.round((clickX / rect.width) * 100);
    const pctY = Math.round((clickY / rect.height) * 100);
    
    setMapActivePinX(pctX);
    setMapActivePinY(pctY);

    // Find closest region by distance on our grid to auto fill fields:
    let closestRegion = MAP_REGIONS[0];
    let minDistance = Infinity;
    MAP_REGIONS.forEach(reg => {
      const dist = Math.sqrt(Math.pow(reg.x - pctX, 2) + Math.pow(reg.y - pctY, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closestRegion = reg;
      }
    });

    setGovernorate(closestRegion.gov);
    setCity(closestRegion.name);
    setMapCoordinates(closestRegion.coords);
    
    setMapFeedbackMsg(isEn 
      ? `📍 Snapped to target region: ${closestRegion.nameEn}` 
      : `📍 تم تثبيت الإحداثيات وتوصيف الموقع تلقائياً: ${closestRegion.name}`);
    setTimeout(() => setMapFeedbackMsg(null), 3000);
  };

  const handleMapSearch = (q: string) => {
    setMapSearchQuery(q);
    if (!q) return;
    const found = MAP_REGIONS.find(reg => 
      reg.name.includes(q) || 
      reg.nameEn.toLowerCase().includes(q.toLowerCase())
    );
    if (found) {
      setMapActivePinX(found.x);
      setMapActivePinY(found.y);
      setGovernorate(found.gov);
      setCity(found.name);
      setMapCoordinates(found.coords);
      setMapFeedbackMsg(isEn 
        ? `🔍 Map searched & located area: ${found.nameEn}` 
        : `🔍 عثر البحث التلقائي على منطقة: ${found.name}`);
      setTimeout(() => setMapFeedbackMsg(null), 3000);
    }
  };

  // Find currently selected request
  const selectedRequest = requests.find(r => r.id === selectedRequestId) || clientRequests[0];

  // Selected request status override resolver
  const currentRequestStatus = selectedRequest ? (selectedRequestStatusOverride[selectedRequest.id] || selectedRequest.status) : 'PENDING_REVIEW';

  // Helper to calculate overall project progress
  const getOverallProgress = (reqId: string) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return 0;
    const reqStatus = selectedRequestStatusOverride[reqId] || req.status;
    if (
      reqStatus !== 'ACTIVE' && 
      reqStatus !== 'CONTRACTED' && 
      reqStatus !== 'CONTRACT_SIGNED' && 
      reqStatus !== 'COMPLETED'
    ) return 0;
    const projStages = stages.filter(s => s.requestId === reqId);
    if (projStages.length === 0) return 35; // Fallback default baseline progress if stages are initializing
    const sumProgress = projStages.reduce((sum, stg) => sum + stg.progress, 0);
    return Math.round(sumProgress / projStages.length);
  };

  // Filter offers for the selected request
  let requestOffers = offers.filter(o => o.requestId === (selectedRequest?.id || '') && !rejectedOfferIds.includes(o.id));

  // If the request has signed contracts, hide all other offers (show only the winning one)
  if (selectedRequest && currentRequestStatus === 'ACTIVE') {
    const matchingContract = contracts.find(c => c.requestId === selectedRequest.id);
    if (matchingContract) {
      requestOffers = requestOffers.filter(o => o.companyId === matchingContract.companyId);
    }
  }

  // Calculate stats for Client
  const totalMyRequests = clientRequests.length;
  const pendingRequestsCount = clientRequests.filter(r => r.status === 'PENDING_REVIEW' || r.status === 'DRAFT' || r.status === 'SUBMITTED' || r.status === 'UNDER_TECHNICAL_REVIEW').length;
  const liveBiddingCount = clientRequests.filter(r => r.status === 'UNDER_PRICING' || r.status === 'OFFERS_RECEIVED' || r.status === 'APPROVED_FOR_BIDDING' || r.status === 'BIDDING_OPEN').length;
  const totalContractedCount = clientRequests.filter(r => r.status === 'ACTIVE' || r.status === 'CONTRACT_SIGNED' || r.status === 'CONTRACTED').length;

  const clientRequestIds = clientRequests.map(r => r.id);
  const clientOffers = offers.filter(o => clientRequestIds.includes(o.requestId));
  const totalOffersCount = clientOffers.length;

  // Let's configure beautiful pictures for the active request render (Left inner column in the design)
  const getUnitPreviewUrl = (type: string) => {
    if (type === 'فيلا') {
      return 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80';
    }
    if (type === 'مكتب') {
      return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';
    }
    // Default apartment exterior/interior rendering resembling the screenshot
    return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
  };

  // Static portfolio previews mock images for realistic look
  const offerPortfolioImages = [
    [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=150&q=80'
    ],
    [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=150&q=80'
    ]
  ];

  return (
    <div className={`${isEn ? 'dir-ltr text-left' : 'dir-rtl text-right'} font-sans min-h-screen bg-[#F0F3F7] pb-16`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 mb-4">
        
        {/* Waiting for Technical Inspection Warning Banner */}
        {clientRequests.some(r => r.status === 'WAITING_FOR_INSPECTION') && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/70 rounded-3xl p-5 flex items-start gap-3.5 shadow-xs text-right animate-fade-in animate-pulse">
            <span className="text-2xl mt-0.5 shrink-0 select-none">⏳</span>
            <div className="flex-1">
              <h5 className="font-extrabold text-xs text-amber-850">
                {isEn ? 'Finishing Projects Awaiting Admin Approval & Technical Auditing' : 'تنبيه: مشاريع في انتظار المعاينة الفنية والاعتماد من الإدارة 🛠️'}
              </h5>
              <p className="text-[10px] text-amber-750/90 mt-1 leading-relaxed font-bold">
                {isEn 
                  ? 'There are property finishing projects under negotiation and coordinate inspect. Live on-site works will resume instantly upon admin co-signing approval.'
                  : 'تم اختيار العرض والاتفاق المبدئي، والآن الطلب في انتظار قيام مشرف شطبها الفني بالمعاينة والمطابقة الهندسية لاعتماد العقد وبدء التشطيب ميدانياً.'}
              </p>
            </div>
          </div>
        )}

        {/* 🔐 Simulated Active Session Banner */}
        <div className="bg-white rounded-3xl p-5 mb-8 shadow-sm border border-gray-150 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#2B4D89] to-[#3a5d9c] text-white flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
              {clientAvatar ? (
                <img src={clientAvatar} alt="Client avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-sm font-black">
                  {clientName ? clientName.trim().slice(0, 2) : 'أر'}
                </span>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded-md font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isEn ? 'Secured Session 🔑' : 'اتصال آمن بالضمان 🔑'}
                </span>
                <span className="bg-[#2B4D89]/8 text-[#2B4D89] text-[10px] px-2.5 py-0.5 rounded-md font-black">
                  {isEn ? 'Client Account' : 'حساب عميل المنصة'}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-gray-850 mt-1">
                <span>{isEn ? 'Welcome back, ' : 'مرحباً بك مجدداً، '}</span>
                <span className="text-[#2B4D89] font-black">{clientName}</span>
              </h4>
              <div className="flex flex-wrap justify-start items-center gap-3 mt-1">
                <p className="text-[10px] text-gray-400 font-semibold">
                  {isEn ? `Authorized Email: ${clientEmail} • Account Code: ID#4092` : `البريد المسجل: ${clientEmail} • كود الحساب: ID#4092`}
                </p>
                <button 
                  onClick={() => setIsProfileSettingsOpen(true)}
                  className="bg-[#2B4D89]/10 hover:bg-[#2B4D89]/18 text-[#2B4D89] text-[9.5px] px-2 py-0.5 rounded-md border border-[#2B4D89]/15 font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>⚙️</span>
                  <span>{isEn ? 'Edit Profile Photo' : 'إدارة الملف الشخصي ومزامنة الصورة للعميل'}</span>
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (onSignOut) {
                onSignOut();
              }
            }}
            className="self-start md:self-auto bg-red-500/10 hover:bg-red-500/18 text-[#E05252] border border-red-500/25 hover:border-red-500/40 px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
          >
            <span>🚪</span>
            <span>{isEn ? 'Sign Out Securely' : 'تسجيل الخروج (Sign out)'}</span>
          </button>
        </div>

        {/* STATS DASHBOARD & NEW REQUEST BUTTON */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8 items-stretch">
          
          {/* Quick Action button for submitting a new request covers 3 columns on desktop - Placed first to align far-right in RTL */}
          <div className="lg:col-span-3">
            <button
              onClick={() => {
                setIsFormOpen(true);
                setIsMapPickingVisible(true);
              }}
              className="w-full h-full bg-gradient-to-tr from-[#1E3A8A] via-[#2B4D89] to-[#3B82F6] hover:from-[#172554] hover:to-[#1D4ED8] text-white p-3.5 sm:p-4 rounded-2xl shadow-sm hover:shadow-md border border-[#2B4D89]/20 flex flex-row items-center justify-center gap-3.5 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer text-right min-h-[82px] group"
              id="submit-new-request-btn"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                🏡
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5 justify-start">
                  <span>{isEn ? 'New Request' : 'قدم طلب تشطيب جديد'}</span>
                  <span className="font-sans text-xs group-hover:translate-x-1 duration-250">➔</span>
                </h4>
                <p className="text-[10px] sm:text-[11px] text-blue-100 mt-1 font-extrabold leading-tight">
                  {isEn ? 'Launch smart pricing' : 'طرح مناقصة لتسعير وحدتك فجأة'}
                </p>
              </div>
            </button>
          </div>

          {/* Main stats card list covers 9 columns on desktop */}
          <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* إجمالي طلباتك */}
            <div 
              onClick={() => setSelectedStatCard(selectedStatCard === 'TOTAL' ? 'NONE' : 'TOTAL')}
              className={`rounded-2xl p-3 sm:p-3.5 border transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer flex items-center justify-between gap-2 ${
                selectedStatCard === 'TOTAL' 
                  ? 'bg-slate-800 text-white border-slate-800 shadow-md ring-2 ring-slate-800/15' 
                  : 'bg-white text-[#2B4D89] border-gray-150 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 w-full">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  selectedStatCard === 'TOTAL' ? 'bg-white/15 text-white' : 'bg-slate-500/10 text-slate-700'
                }`}>
                  <FileText strokeWidth={2.2} size={22} className="shrink-0" />
                </div>
                <div className="space-y-0.5 text-right flex-1 min-w-0" dir="auto">
                  <p className={`text-[10px] sm:text-xs font-black leading-tight ${selectedStatCard === 'TOTAL' ? 'text-slate-200' : 'text-gray-500'}`}>
                    {isEn ? 'Total Requests' : 'إجمالي طلباتك'}
                  </p>
                  <p className={`text-xl sm:text-2xl font-black leading-none mt-1 ${selectedStatCard === 'TOTAL' ? 'text-white' : 'text-[#1D2736]'}`}>
                    {totalMyRequests}
                  </p>
                </div>
              </div>
              {selectedStatCard === 'TOTAL' && (
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 block animate-pulse shrink-0"></span>
              )}
            </div>

            {/* قيد المراجعة الفنية */}
            <div 
              onClick={() => setSelectedStatCard(selectedStatCard === 'PENDING' ? 'NONE' : 'PENDING')}
              className={`rounded-2xl p-3 sm:p-3.5 border transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer flex items-center justify-between gap-2 ${
                selectedStatCard === 'PENDING' 
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-600/15' 
                  : 'bg-white text-amber-700 border-gray-150 shadow-xs hover:border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 w-full">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  selectedStatCard === 'PENDING' ? 'bg-white/15 text-white' : 'bg-amber-500/10 text-amber-750'
                }`}>
                  <Clock strokeWidth={2.2} size={22} className="shrink-0" />
                </div>
                <div className="space-y-0.5 text-right flex-1 min-w-0" dir="auto">
                  <p className={`text-[10px] sm:text-xs font-black leading-tight ${selectedStatCard === 'PENDING' ? 'text-amber-100' : 'text-gray-500'}`}>
                    {isEn ? 'Under Review' : 'قيد المراجعة الفنية'}
                  </p>
                  <p className={`text-xl sm:text-2xl font-black leading-none mt-1 ${selectedStatCard === 'PENDING' ? 'text-white' : 'text-amber-650'}`}>
                    {pendingRequestsCount}
                  </p>
                </div>
              </div>
              {selectedStatCard === 'PENDING' && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300 block animate-pulse shrink-0"></span>
              )}
            </div>

            {/* متاحة للمناقصة الجارية */}
            <div 
              onClick={() => setSelectedStatCard(selectedStatCard === 'LIVE_BID' ? 'NONE' : 'LIVE_BID')}
              className={`rounded-2xl p-3 sm:p-3.5 border transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer flex items-center justify-between gap-2 ${
                selectedStatCard === 'LIVE_BID' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/15' 
                  : 'bg-white text-blue-700 border-gray-150 shadow-xs hover:border-blue-200'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 w-full">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  selectedStatCard === 'LIVE_BID' ? 'bg-white/15 text-white' : 'bg-blue-500/10 text-blue-750'
                }`}>
                  <Layers strokeWidth={2.2} size={22} className="shrink-0" />
                </div>
                <div className="space-y-0.5 text-right flex-1 min-w-0" dir="auto">
                  <p className={`text-[10px] sm:text-xs font-black leading-tight ${selectedStatCard === 'LIVE_BID' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {isEn ? 'Live Bidding' : 'متاحة للمناقصة الجارية'}
                  </p>
                  <p className={`text-xl sm:text-2xl font-black leading-none mt-1 ${selectedStatCard === 'LIVE_BID' ? 'text-white' : 'text-blue-600'}`}>
                    {liveBiddingCount}
                  </p>
                </div>
              </div>
              {selectedStatCard === 'LIVE_BID' && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-300 block animate-pulse shrink-0"></span>
              )}
            </div>

            {/* عروض الأسعار المستلمة */}
            <div 
              onClick={() => setSelectedStatCard(selectedStatCard === 'OFFERS' ? 'NONE' : 'OFFERS')}
              className={`rounded-2xl p-3 sm:p-3.5 border transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer flex items-center justify-between gap-2 ${
                selectedStatCard === 'OFFERS' 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-600/15' 
                  : 'bg-white text-indigo-700 border-gray-150 shadow-xs hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 w-full">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  selectedStatCard === 'OFFERS' ? 'bg-white/15 text-white' : 'bg-indigo-500/10 text-indigo-750'
                }`}>
                  <Landmark strokeWidth={2.2} size={22} className="shrink-0" />
                </div>
                <div className="space-y-0.5 text-right flex-1 min-w-0" dir="auto">
                  <p className={`text-[10px] sm:text-xs font-black leading-tight ${selectedStatCard === 'OFFERS' ? 'text-indigo-100' : 'text-[#2B4D89]'}`}>
                    {isEn ? 'Received Bids' : 'عروض الأسعار المتاحة'}
                  </p>
                  <p className={`text-xl sm:text-2xl font-black leading-none mt-1 ${selectedStatCard === 'OFFERS' ? 'text-white' : 'text-[#1D2736]'}`}>
                    {totalOffersCount}
                  </p>
                </div>
              </div>
              {selectedStatCard === 'OFFERS' && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-300 block animate-pulse shrink-0"></span>
              )}
            </div>

            {/* مشاريع تم التعاقد عليها */}
            <div 
              onClick={() => setSelectedStatCard(selectedStatCard === 'CONTRACTED' ? 'NONE' : 'CONTRACTED')}
              className={`rounded-2xl p-3 sm:p-3.5 border transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer flex items-center justify-between gap-2 ${
                selectedStatCard === 'CONTRACTED' 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600/15' 
                  : 'bg-white text-emerald-700 border-gray-150 shadow-xs hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 w-full">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  selectedStatCard === 'CONTRACTED' ? 'bg-white/15 text-white' : 'bg-emerald-500/10 text-emerald-750'
                }`}>
                  <ShieldCheck strokeWidth={2.2} size={22} className="shrink-0" />
                </div>
                <div className="space-y-0.5 text-right flex-1 min-w-0" dir="auto">
                  <p className={`text-[10px] sm:text-xs font-black leading-tight ${selectedStatCard === 'CONTRACTED' ? 'text-emerald-100' : 'text-gray-500'}`}>
                    {isEn ? 'Contracted' : 'مشاريع متعاقد عليها'}
                  </p>
                  <p className={`text-xl sm:text-2xl font-black leading-none mt-1 ${selectedStatCard === 'CONTRACTED' ? 'text-white' : 'text-emerald-600'}`}>
                    {totalContractedCount}
                  </p>
                </div>
              </div>
              {selectedStatCard === 'CONTRACTED' && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 block animate-pulse shrink-0"></span>
              )}
            </div>
          </div>

        </div>

        {/* INTERACTIVE DETAILS TABLE DROPDOWN CONTAINER (EXPANDS BENEATH STATS COVERS WHEN CLICKED) */}
        {selectedStatCard !== 'NONE' && (
          <div className="mb-8 bg-white rounded-3xl border border-gray-150 p-6 shadow-xs animate-fade-in text-right">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {selectedStatCard === 'TOTAL' ? '📝' : selectedStatCard === 'PENDING' ? '⏳' : selectedStatCard === 'LIVE_BID' ? '⚡' : selectedStatCard === 'CONTRACTED' ? '🤝' : '💵'}
                </span>
                <h3 className="font-extrabold text-[#232F3F] text-xs sm:text-sm md:text-base">
                  {selectedStatCard === 'TOTAL' ? (isEn ? 'All My Registered Requests' : 'تفاصيل جميع طلباتك المسجلة') :
                   selectedStatCard === 'PENDING' ? (isEn ? 'Requests Under Technical Review' : 'طلباتك قيد المراجعة الفنية والتدقيق') :
                   selectedStatCard === 'LIVE_BID' ? (isEn ? 'Ongoing Tenders & Bidding' : 'المناقصات الجارية حالياً ومرحلة استقبال العروض') :
                   selectedStatCard === 'CONTRACTED' ? (isEn ? 'Contracted & Active Construction' : 'المشروعات التي تم التعاقد وبدء التنفيذ فيها') :
                   (isEn ? 'All Received Prices & Offers' : 'جميع عروض الأسعار المستلمة لمشروعك')}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedStatCard('NONE')}
                className="text-gray-400 hover:text-gray-600 font-black text-[11px] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-all cursor-pointer"
              >
                {isEn ? 'Close ✕' : 'إغلاق ✕'}
              </button>
            </div>

            {/* Grid table representation */}
            <div className="overflow-x-auto">
              {selectedStatCard === 'TOTAL' && (
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-extrabold text-[11px]">
                      <th className="p-3 text-right">{isEn ? 'Request Code' : 'رمز الطلب'}</th>
                      <th className="p-3 text-right">{isEn ? 'Unit Type' : 'نوع الوحدة'}</th>
                      <th className="p-3 text-right">{isEn ? 'Area' : 'المساحة'}</th>
                      <th className="p-3 text-right">{isEn ? 'Location' : 'الموقع'}</th>
                      <th className="p-3 text-right">{isEn ? 'Finishing Level' : 'مستوى التشطيب'}</th>
                      <th className="p-3 text-right">{isEn ? 'Budget' : 'الميزانية'}</th>
                      <th className="p-3 text-right">{isEn ? 'Status' : 'حالة الطلب'}</th>
                      <th className="p-3 text-center">{isEn ? 'Actions' : 'إجراءات'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientRequests.map(r => (
                      <tr 
                        key={r.id} 
                        onClick={() => setSelectedRequestId(r.id)}
                        className={`hover:bg-blue-50/45 transition-colors cursor-pointer text-[11px] ${selectedRequestId === r.id ? 'bg-blue-50/60 font-extrabold' : ''}`}
                      >
                        <td className="p-3 text-[#2B4D89] font-mono font-black">#{r.id}</td>
                        <td className="p-3 font-semibold">{r.unitType}</td>
                        <td className="p-3 font-mono">{r.area} م²</td>
                        <td className="p-3">{r.city} - {r.governorate}</td>
                        <td className="p-3"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{r.finishingLevel}</span></td>
                        <td className="p-3 font-bold font-mono text-emerald-700">{r.budget.toLocaleString()} ج.م</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                            (r.status === 'ACTIVE' || r.status === 'CONTRACT_SIGNED' || r.status === 'CONTRACTED') 
                              ? (r.actualStartDate ? 'bg-emerald-100 text-emerald-800' : 'bg-[#FAF5F0] text-amber-800 border border-orange-200/50') 
                              : (r.status === 'PENDING_REVIEW' || r.status === 'DRAFT' || r.status === 'SUBMITTED' || r.status === 'UNDER_TECHNICAL_REVIEW') ? 'bg-amber-100 text-amber-850' :
                             'bg-blue-100 text-[#2B4D89]'
                          }`}>
                            {(r.status === 'PENDING_REVIEW' || r.status === 'SUBMITTED' || r.status === 'UNDER_TECHNICAL_REVIEW') ? (isEn ? 'Under Review' : 'قيد المراجعة') : 
                             r.status === 'DRAFT' ? (isEn ? 'Draft' : 'مسودة 💾') :
                             (r.status === 'ACTIVE' || r.status === 'CONTRACT_SIGNED' || r.status === 'CONTRACTED') 
                               ? (r.actualStartDate 
                                   ? (isEn ? 'Active Work' : 'جاري التنفيذ') 
                                   : (isEn ? '🤝 Contract Signed & Awaiting Start' : '🤝 تم التعاقد وبانتظار البدء')) 
                               : (isEn ? 'Tender' : 'مناقصة جارية')}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequestId(r.id);
                              setSelectedStatCard('NONE');
                            }}
                            className="bg-[#2B4D89] text-white text-[10px] font-black px-3 py-1 rounded hover:bg-[#1E3A68] cursor-pointer transition-colors"
                          >
                            {isEn ? 'Analyze details' : 'عرض وتحليل'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedStatCard === 'PENDING' && (
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-extrabold text-[11px]">
                      <th className="p-3 text-right">{isEn ? 'Request Code' : 'رمز الطلب'}</th>
                      <th className="p-3 text-right">{isEn ? 'Unit Type' : 'نوع الوحدة'}</th>
                      <th className="p-3 text-right">{isEn ? 'Area' : 'المساحة'}</th>
                      <th className="p-3 text-right">{isEn ? 'City' : 'المدينة'}</th>
                      <th className="p-3 text-right">{isEn ? 'Finishing Type' : 'مستوى التشطيب'}</th>
                      <th className="p-3 text-right">{isEn ? 'Filing Date' : 'تاريخ التقديم'}</th>
                      <th className="p-3 text-right">{isEn ? 'Admin Status' : 'المراجعة الإدارية'}</th>
                      <th className="p-3 text-center">{isEn ? 'Select' : 'تنشيط'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientRequests.filter(r => r.status === 'PENDING_REVIEW' || r.status === 'DRAFT' || r.status === 'SUBMITTED' || r.status === 'UNDER_TECHNICAL_REVIEW').length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400 font-bold">
                          {isEn ? 'No requests are currently in draft or under review.' : 'لا توجد طلبات مسودة أو قيد المراجعة الفنية حالياً.'}
                        </td>
                      </tr>
                    ) : (
                      clientRequests.filter(r => r.status === 'PENDING_REVIEW' || r.status === 'DRAFT' || r.status === 'SUBMITTED' || r.status === 'UNDER_TECHNICAL_REVIEW').map(r => (
                        <tr 
                          key={r.id} 
                          onClick={() => setSelectedRequestId(r.id)}
                          className={`hover:bg-amber-50/20 transition-colors cursor-pointer text-[11px] ${selectedRequestId === r.id ? 'bg-amber-50/40 font-bold' : ''}`}
                        >
                          <td className="p-3 text-[#2B4D89] font-mono font-black">#{r.id}</td>
                          <td className="p-3 font-semibold">{r.unitType}</td>
                          <td className="p-3 font-mono">{r.area} م²</td>
                          <td className="p-3">{r.city}</td>
                          <td className="p-3"><span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">{r.finishingLevel}</span></td>
                          <td className="p-3 text-gray-500 font-mono">{r.createdAt}</td>
                          <td className="p-3">
                            {r.status === 'DRAFT' ? (
                              <span className="bg-slate-100 text-slate-800 border border-slate-200/80 px-2 py-0.5 rounded text-[10px] font-extrabold">
                                💾 مسودة قيد التعديل
                              </span>
                            ) : r.status === 'SUBMITTED' ? (
                              <span className="bg-blue-50 text-[#2B4D89] border border-blue-200/80 px-2 py-0.5 rounded text-[10px] font-extrabold animate-pulse">
                                📤 تم التقديم وبانتظار المراجعة
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-805 border border-amber-200/60 px-2 py-0.5 rounded text-[10px] font-extrabold animate-pulse">
                                ⏳ قيد التدقيق الهندسي والاتصال
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {r.status === 'DRAFT' && onUpdateRequest && (
                                <button 
                                  onClick={() => {
                                    onUpdateRequest(r.id, { status: 'SUBMITTED' });
                                  }}
                                  className="bg-emerald-600 text-white text-[10.5px] font-bold px-2.5 py-1.5 rounded-xl hover:bg-emerald-700 cursor-pointer transition-all flex items-center gap-1 shrink-0"
                                  title={isEn ? 'Publish to Admin' : 'تقديم للأدمن لبدء المراجعة 🚀'}
                                >
                                  <span>🚀</span>
                                  <span>{isEn ? 'Submit' : 'تقديم'}</span>
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  setSelectedRequestId(r.id);
                                  setSelectedStatCard('NONE');
                                }}
                                className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded hover:bg-orange-600 cursor-pointer transition-colors"
                              >
                                {isEn ? 'Activate' : 'تحديد'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {selectedStatCard === 'LIVE_BID' && (
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-extrabold text-[11px]">
                      <th className="p-3 text-right">{isEn ? 'Request Code' : 'رمز الطلب'}</th>
                      <th className="p-3 text-right">{isEn ? 'Unit Type' : 'نوع الوحدة'}</th>
                      <th className="p-3 text-right">{isEn ? 'Area' : 'المساحة'}</th>
                      <th className="p-3 text-right">{isEn ? 'Finishing Level' : 'مستوى التشطيب'}</th>
                      <th className="p-3 text-right">{isEn ? 'Estimated Budget' : 'الميزانية التقديرية'}</th>
                      <th className="p-3 text-right">{isEn ? 'Offers Received' : 'العروض المستلمة'}</th>
                      <th className="p-3 text-right">{isEn ? 'Remaining Auction Time' : 'الوقت المتبقي'}</th>
                      <th className="p-3 text-right">{isEn ? 'Tender Status' : 'حالة المناقصة'}</th>
                      <th className="p-3 text-center">{isEn ? 'View Bids' : 'انتقل للمناقصة'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientRequests.filter(r => r.status === 'UNDER_PRICING' || r.status === 'OFFERS_RECEIVED').length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-gray-400 font-bold">
                          {isEn ? 'No requests are active in bidding phase currently.' : 'لا توجد طلبات نشطة في مرحلة المناقصة الجارية حالياً.'}
                        </td>
                      </tr>
                    ) : (
                      clientRequests.filter(r => r.status === 'UNDER_PRICING' || r.status === 'OFFERS_RECEIVED').map(r => {
                        const bidOffers = offers.filter(o => o.requestId === r.id);
                        return (
                          <tr 
                            key={r.id} 
                            onClick={() => setSelectedRequestId(r.id)}
                            className={`hover:bg-blue-50/30 transition-colors cursor-pointer text-[11px] ${selectedRequestId === r.id ? 'bg-blue-50/50 font-bold' : ''}`}
                          >
                            <td className="p-3 text-[#2B4D89] font-mono font-black">#{r.id}</td>
                            <td className="p-3 font-semibold">{r.unitType}</td>
                            <td className="p-3 font-mono">{r.area} م²</td>
                            <td className="p-3 font-bold text-slate-700">{r.finishingLevel}</td>
                            <td className="p-3 font-bold font-mono text-[#2B4D89]">{r.budget.toLocaleString()} ج.م</td>
                            <td className="p-3">
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-black px-2.5 py-0.5 rounded-full text-[10px]">
                                📩 {bidOffers.length} {isEn ? 'Quotes' : 'عروض سعر مستلمة'}
                              </span>
                            </td>
                            <td className="p-3">
                              <TenderCountdown deadline={r.deadline} createdAt={r.createdAt} isEn={isEn} />
                            </td>
                            <td className="p-3">
                              <span className="text-blue-700 font-extrabold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                                {isEn ? 'Accepting Bids' : 'مفتوح لاستقبال الأسعار'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRequestId(r.id);
                                  setSelectedStatCard('NONE');
                                }}
                                className="bg-[#2B4D89] text-white text-[10px] font-bold px-2.5 py-1 rounded hover:bg-[#1E3A68] cursor-pointer transition-colors"
                              >
                                {isEn ? 'View Bids' : 'تحديد والمقارنة'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

              {selectedStatCard === 'CONTRACTED' && (
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-extrabold text-[11px]">
                      <th className="p-3 text-right">{isEn ? 'Project Code' : 'رمز المشروع'}</th>
                      <th className="p-3 text-right">{isEn ? 'Unit Type' : 'نوع الوحدة'}</th>
                      <th className="p-3 text-right">{isEn ? 'Location' : 'المقر والمدينة'}</th>
                      <th className="p-3 text-right">{isEn ? 'Partner Contractor' : 'المقاول المنفذ'}</th>
                      <th className="p-3 text-right">{isEn ? 'Total Final Cost' : 'تكلفة العقد الكلية'}</th>
                      <th className="p-3 text-right">{isEn ? 'Stage Work Progress' : 'نسبة إنجاز الأعمال'}</th>
                      <th className="p-3 text-right">{isEn ? 'Shattabha Inspector' : 'استشاري شطبها المشرف'}</th>
                      <th className="p-3 text-center">{isEn ? 'Follow' : 'لوحة المتابعة'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientRequests.filter(r => r.status === 'ACTIVE' || r.status === 'DELAYED').length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400 font-bold">
                          {isEn ? 'No signed/contracted active on-site projects yet.' : 'لم يتم توقيع أي عقود وبدء التنفيذ الميداني لمشاريعك بعد.'}
                        </td>
                      </tr>
                    ) : (
                      clientRequests.filter(r => r.status === 'ACTIVE' || r.status === 'DELAYED').map(r => {
                        const matchingContract = contracts.find(c => c.requestId === r.id);
                        const completionPct = getOverallProgress(r.id);
                        
                        return (
                          <tr 
                            key={r.id} 
                            onClick={() => setSelectedRequestId(r.id)}
                            className={`hover:bg-emerald-50/20 transition-colors cursor-pointer text-[11px] ${selectedRequestId === r.id ? 'bg-emerald-50/40 font-bold' : ''}`}
                          >
                            <td className="p-3 text-[#2B4D89] font-mono font-black">#{r.id}</td>
                            <td className="p-3 font-semibold">{r.unitType}</td>
                            <td className="p-3">{r.city}</td>
                            <td className="p-3 font-semibold text-teal-850">
                              {matchingContract ? (companies.find(comp => comp.id === matchingContract.companyId)?.companyName || 'شركة تشطيب موثقة') : 'شريك معتمد'}
                            </td>
                            <td className="p-3 font-bold font-mono text-emerald-700">
                              {matchingContract ? `${(matchingContract.finalContractPrice || matchingContract.totalAmount).toLocaleString()} ج.م` : 'قيد التسوية'}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-100 h-2 rounded-full overflow-hidden p-0.5 border">
                                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${completionPct}%` }}></div>
                                </div>
                                <span className="font-extrabold text-[#0F7453]">{completionPct}%</span>
                              </div></td>
                            <td className="p-3 text-indigo-750 font-semibold">
                              {r.assignedInspectorId ? '✓ مهندس مفرز بالمنصة' : '⏳ جاري المقابلة والتعيين'}
                            </td>
                            <td className="p-3 text-center">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRequestId(r.id);
                                  setSelectedStatCard('NONE');
                                }}
                                className="bg-[#0F7453] text-white text-[10px] font-black px-2.5 py-1 rounded hover:bg-emerald-850 cursor-pointer transition-colors"
                              >
                                {isEn ? 'Monitor Progress' : 'تتبع التنفيذ الميداني'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

              {selectedStatCard === 'OFFERS' && (
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-extrabold text-[11px]">
                      <th className="p-3 text-right">{isEn ? 'Offer Ref' : 'رمز العرض'}</th>
                      <th className="p-3 text-right">{isEn ? 'Request Code' : 'رمز المشروع'}</th>
                      <th className="p-3 text-right">{isEn ? 'Unit Target' : 'الوصف والموقع'}</th>
                      <th className="p-3 text-right">{isEn ? 'Contractor' : 'مقدم العرض / شركة الديكور'}</th>
                      <th className="p-3 text-right">{isEn ? 'Bid Price' : 'قيمة العرض المالي'}</th>
                      <th className="p-3 text-right">{isEn ? 'Duration' : 'مدة التنفيذ'}</th>
                      <th className="p-3 text-right">{isEn ? 'Contractor Rating' : 'سابقة الأعمال والتقييم'}</th>
                      <th className="p-3 text-center">{isEn ? 'Show comparison' : 'إجراء وقبول'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientOffers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400 font-bold">
                          {isEn ? 'No price offers received yet.' : 'لم يتم استلام أي عروض أسعار للمشروعات الجارية بعد.'}
                        </td>
                      </tr>
                    ) : (
                      clientOffers.map(o => {
                        const req = requests.find(r => r.id === o.requestId);
                        const comp = companies.find(c => c.id === o.companyId);
                        return (
                          <tr 
                            key={o.id} 
                            onClick={() => {
                              if (req) {
                                setSelectedRequestId(req.id);
                              }
                            }}
                            className="hover:bg-indigo-50/20 transition-colors cursor-pointer text-[11px]"
                          >
                            <td className="p-3 text-[#2B4D89] font-mono font-black text-right">#{o.id}</td>
                            <td className="p-3 text-slate-500 font-mono font-bold text-right">#{o.requestId}</td>
                            <td className="p-3 font-semibold text-right">
                              {req ? `${req.unitType} م² ${req.area} (${req.city})` : 'مشروع تشطيب'}
                            </td>
                            <td className="p-3 text-indigo-900 font-bold text-right flex items-center gap-1.5">
                              <span>🏗️ {comp?.companyName || o.companyName}</span>
                              {comp?.isVerified && (
                                <span className="text-blue-500 text-[10px]" title="شريك موثق بالمنصة">🛡️</span>
                              )}
                            </td>
                            <td className="p-3 font-black text-emerald-700 font-mono text-[13px] text-right">
                              {o.price.toLocaleString()} ج.م
                            </td>
                            <td className="p-3 font-bold font-mono text-[#30445E] text-right">
                              ⏰ {o.durationDays} يوم تفصيلي
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center gap-1 justify-start">
                                <span className="text-amber-500 font-black">★</span>
                                <span className="font-extrabold">{comp?.rating || 4.8} / 5</span>
                                <span className="text-gray-400 text-[10px] font-semibold">({comp?.projectsCompleted || 12} مشروع)</span>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                {(() => {
                                  const isThisOfferAccepted = contracts.some(c => c.requestId === o.requestId && c.companyId === o.companyId);
                                  const isRejected = rejectedOfferIds.includes(o.id);
                                  const isOtherOfferAccepted = contracts.some(c => c.requestId === o.requestId && c.companyId !== o.companyId);
                                  const reqStatus = req ? (selectedRequestStatusOverride[req.id] || req.status) : 'PENDING_REVIEW';
                                  const isPastPricing = ['CLIENT_SELECTED', 'COORDINATION', 'WAITING_FOR_INSPECTION', 'ACTIVE', 'CONTRACT_SIGNED', 'CONTRACTED', 'COMPLETED'].includes(reqStatus);

                                  if (isThisOfferAccepted) {
                                    return (
                                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full font-black flex items-center gap-1 shrink-0 animate-pulse font-sans">
                                        🟢 {isEn ? 'Accepted' : 'مقبول معتمد 🤝'}
                                      </span>
                                    );
                                  } else if (isRejected) {
                                    return (
                                      <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] px-2.5 py-1 rounded-full font-black flex items-center gap-1 shrink-0 font-sans">
                                        🔴 {isEn ? 'Declined' : 'مرفوض ومستبعد ❌'}
                                      </span>
                                    );
                                  } else if (isOtherOfferAccepted || isPastPricing) {
                                    return (
                                      <span className="bg-gray-150 text-gray-500 border border-gray-200 text-[9px] px-2 py-0.5 rounded-md font-extrabold shrink-0 font-sans">
                                        🔒 {isEn ? 'Closed' : 'تم اختيار عرض آخر'}
                                      </span>
                                    );
                                  } else {
                                    return (
                                      <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] px-2.5 py-1 rounded-full font-black shrink-0 font-sans">
                                        🔍 {isEn ? 'Under Review' : 'جديد / تحت الفحص 🔍'}
                                      </span>
                                    );
                                  }
                                })()}

                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingOfferDetails(o);
                                  }}
                                  className="bg-[#2B4D89] hover:bg-[#1E3A68] text-white text-[10px] font-black px-3 py-1.5 rounded cursor-pointer transition-colors shrink-0"
                                >
                                  🔍 {isEn ? 'Offer Details' : 'تفاصيل العرض'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* REQUEST SWITCHER TABS - FOR EASY DEMONSTRATING - ONLY SHOW IF CLIENT HAS > 1 PROJECT */}
        {clientRequests.length > 1 && (
          <div className="mb-6 flex flex-col gap-3 bg-[#2B4D89]/5 p-3 rounded-2xl border border-[#2B4D89]/10">
            <span className="text-xs font-bold text-[#2B4D89] px-2 block">{isEn ? '📂 Quick Switch client requests for testing:' : '📂 تنقل سريع بين مشاريع العميل للاختبار:'}</span>
            <div className="flex flex-wrap items-center gap-3">
              {clientRequests.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRequestId(r.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-start gap-1 shadow-xs border text-right transition-transform hover:scale-[1.01] ${
                    selectedRequestId === r.id 
                      ? 'bg-[#2B4D89] text-white border-[#2B4D89]' 
                      : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="font-mono text-[9px] opacity-75">#{r.id}</span>
                    <span>{getUnitIcon(r.unitType)} {getUnitTypeLabelOnly(r.unitType)}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                      selectedRequestId === r.id 
                        ? 'bg-emerald-950 text-emerald-300' 
                        : 'bg-[#F0F3F7] text-[#2B4D89]'
                    }`}>
                      {getOverallProgress(r.id)}% {isEn ? 'done' : 'إنجاز'}
                    </span>
                  </div>
                  <div className={`text-[10px] flex items-center gap-1 font-semibold ${
                    selectedRequestId === r.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span>📍</span>
                    <span className="truncate max-w-[200px]" title={r.detailedLocationText}>
                      {r.detailedLocationText || (isEn ? 'Downtown' : 'وسط البلد')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        
        {/* 3. COMPLETE FULL-WIDTH DASHBOARD LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* ==================== PORTAL: REQUEST DETAILS & OFFERS LIST (FULL SPACIOUS WIDTH NOW) ==================== */}
          <div className="lg:col-span-12 space-y-6">
            
            {/* HEAD & LABELS ROW */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1">
              <h2 className="text-xl font-extrabold text-[#232F3F] tracking-tight">
                {isEn ? 'Your Finishing Proposals & Bidding Table' : 'طلبات التشطيب الخاصة بك وجدول المناقصات'}
              </h2>
              <span className="text-xs text-gray-500 font-bold bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                {isEn ? 'Total Registered Tickets:' : 'مجموع الطلبات المسجلة:'} <span className="text-[#2B4D89]">{totalMyRequests}</span>
              </span>
            </div>

            {/* MAIN ACTIVE REQUEST DETAIL PANEL */}
            {viewingOfferDetails !== null ? (() => {
              const o = viewingOfferDetails;
              const req = requests.find(r => r.id === o.requestId);
              const comp = companies.find(c => c.id === o.companyId);

              // Standardized structures for packages if they are empty
              const comPackages = (comp?.packages && comp.packages.length > 0) ? comp.packages : [
                {
                  id: 'fallback-pkg-1',
                  name: isEn ? 'The Platinum Deluxe Package' : 'الباقة البلاتينية الفاخرة (سوبر لوكس)',
                  pricePerSqm: 3600,
                  description: isEn 
                    ? 'Complete turnkey premium finishes, including Elsewedy cabling, Jotun paints, and Royal insulation fittings.' 
                    : 'تفاصيل التجهيز الكامل فئة السوبر لوكس الممتازة؛ تشمل كابلات السويدي الأصلية، دهانات جوتن فينوماستيك، عزل مائي وحراري للأسطح.',
                  features: isEn 
                    ? ['Premium Cleopatra Porcelain (first grade)', 'Elsewedy cables and Schneider switches', 'Ultra moisture resistant Knauf plasterboards', 'Full acrylic painting with Jotun Fenomastic'] 
                    : ['بورسلين كليوباترا فرز أول مقاسات كبيرة للريسيبشن', 'مواسير السباكة بنظام الشريف ومواد بي بي آر الألمانية المعزولة', 'تأسيس الكهرباء بالكامل بكابلات السويدي الأصلية وعقد ضمان', 'دهانات جوتن الفينوماستيك المقاومة للأتربة والبهتان']
                },
                {
                  id: 'fallback-pkg-2',
                  name: isEn ? 'The Smart Practical Package' : 'باقة التشطيب الذكي العملي (لوكس متميز)',
                  pricePerSqm: 2600,
                  description: isEn 
                    ? 'Excellent durable finishes prioritizing smart home ready infrastructure.' 
                    : 'خدمات التأسيس والتشطيب الاقتصادي والجودة المضمونة، مهيأة بالكامل لكافة نظم المنازل الذكية والإضاءات الهادئة.',
                  features: isEn 
                    ? ['Cleopatra ceramic flooring for entire unit', 'Saveto cement coatings and highly durable insulation', 'Venus smart controls and lighting paths', 'Standard sound-insulating aluminum windows'] 
                    : ['تركيب سيراميك كليوباترا فرز أول للأرضيات والحوائط', 'عزل مائي كيميائي متكامل ماركة سيكا للمطابخ والحمامات', 'أطقم حمامات ديورافيت ممتازة مع خلاطات مياه يوفوري', 'نوافذ ألوميتال مانعة للصوت والأتربة للغرف المطلة على الواجهة']
                }
              ];

              const comPortfolio = (comp?.portfolio && comp.portfolio.length > 0) ? comp.portfolio : [
                {
                  id: 'fallback-port-1',
                  projectName: isEn ? 'Luxury Penthouse Finishing' : 'تشطيب وتأثيث بنتهاوس التجمع الخامس',
                  projectType: isEn ? 'Residential' : 'سكني',
                  governorate: isEn ? 'Cairo' : 'القاهرة',
                  executionYear: 2024,
                  images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'],
                  beforeImages: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'],
                  afterImages: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'],
                  description: isEn 
                    ? 'Complete penthouse architectural finishing from bare brick to premium turnkey handover.' 
                    : 'تشطيب كامل لبنتهاوس بقطاع القاهرة الجديدة مع الاهتمام بالعزل المائي الفائق والأسقف المعلقة جبسيوم بورد الراقية وكبائن السيكوريت بالحمامات.'
                },
                {
                  id: 'fallback-port-2',
                  projectName: isEn ? 'Modern Family Apartment' : 'شقة نيو هليوبوليس العائلية الراقية',
                  projectType: isEn ? 'Residential' : 'سكني',
                  governorate: isEn ? 'Cairo' : 'القاهرة',
                  executionYear: 2023,
                  images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
                  beforeImages: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'],
                  afterImages: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
                  description: isEn 
                    ? 'Full renovation including kitchen layout changes, luxury electrical distribution.' 
                    : 'رحلة تشطيب شاملة من الطوب الأحمر وتعديل المخططات الإنشائية للسباكة والدوائر الكهربائية، مع دهانات جوتن وتشطيبات حريرية ممتازة.'
                }
              ];

              const isThisOfferAccepted = contracts.some(c => c.requestId === o.requestId && c.companyId === o.companyId);
              const isRejected = rejectedOfferIds.includes(o.id);
              const isOtherOfferAccepted = contracts.some(c => c.requestId === o.requestId && c.companyId !== o.companyId);
              const reqStatus = req ? (selectedRequestStatusOverride[req.id] || req.status) : 'PENDING_REVIEW';
              const isPastPricing = ['CLIENT_SELECTED', 'COORDINATION', 'WAITING_FOR_INSPECTION', 'ACTIVE', 'CONTRACT_SIGNED', 'CONTRACTED', 'COMPLETED'].includes(reqStatus);

              return (
                <div className="space-y-6 animate-fadeIn text-right" dir={isEn ? "ltr" : "rtl"}>
                  {/* BLUE HEADER BAR styled similar to request details page */}
                  <div className="bg-[#232F3F] rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md font-sans">
                    <div className="space-y-2 text-right w-full sm:w-auto">
                      <div className="flex items-center gap-2 flex-row-reverse justify-end flex-wrap">
                        <span className="text-teal-400 font-mono text-sm">#OFFER-{o.id.toUpperCase()}</span>
                        <span className="text-gray-400">|</span>
                        <h3 className="font-extrabold text-[#D8B448] text-base sm:text-lg text-right">
                          {isEn ? 'Price Offer Details' : 'تفاصيل عرض السعر'}
                        </h3>
                        {isThisOfferAccepted && (
                          <span className="bg-emerald-500/20 text-emerald-450 border border-emerald-500/30 text-[10px] px-2.5 py-1 rounded-full font-black animate-pulse font-sans">
                            🟢 {isEn ? 'Accepted & Active' : 'مقبول معتمد 🤝'}
                          </span>
                        )}
                        {isRejected && (
                          <span className="bg-rose-500/20 text-rose-455 border border-rose-500/30 text-[10px] px-2.5 py-1 rounded-full font-black font-sans">
                            🔴 {isEn ? 'Rejected' : 'مرفوض ومستبعد ❌'}
                          </span>
                        )}
                        {(isOtherOfferAccepted || (isPastPricing && !isThisOfferAccepted)) && (
                          <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 text-[10px] px-2.5 py-1 rounded-full font-black font-sans">
                            🔒 {isEn ? 'Closed' : 'تم اختيار عرض آخر'}
                          </span>
                        )}
                        {!isThisOfferAccepted && !isRejected && !isOtherOfferAccepted && !isPastPricing && (
                          <span className="bg-amber-500/25 text-amber-400 border border-amber-500/30 text-[10px] px-2.5 py-1 rounded-full font-black animate-pulse font-sans">
                            🔍 {isEn ? 'Under Review' : 'جديد / تحت الفحص 🔍'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-300 font-bold mt-0.5 text-right">
                        {isEn ? `Associated Request: #${o.requestId}` : `مرتبط بطلب المقايسة الفني رقم #${o.requestId}`}
                      </p>
                    </div>

                    {/* Go Back button */}
                    <button
                      type="button"
                      onClick={() => setViewingOfferDetails(null)}
                      className="bg-white/10 hover:bg-white/20 hover:scale-103 text-white border border-white/20 text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 self-end sm:self-center"
                    >
                      {isEn ? '← Back to Request Details' : '⬅️ العودة لتفاصيل طلب التشطيب'}
                    </button>
                  </div>

                  {/* Redesigned specs/bento-like cards layout */}
                  <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 space-y-6 text-right font-sans">
                    <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-right">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block font-mono">
                        Financial Offer & Contractor Credentials
                      </span>
                      <h3 className="text-sm font-black text-gray-805 flex items-center gap-1.5 justify-end font-sans">
                        <span>📦</span>
                        <span>المعايير الفنية والمالية لعرض السعر والمقاول المعتمد</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
                      
                      {/* 1. Contractor Card (interactive link/click) */}
                      <div 
                        onClick={() => {
                          setOfferModalTab('PROFILE');
                          const el = document.getElementById('offer-details-tabs-anchor');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-sky-50/50 hover:bg-sky-50 transition-all border border-sky-150 hover:border-sky-300 p-4 rounded-2xl cursor-pointer hover:scale-101 flex flex-col justify-between group text-right"
                        title={isEn ? "Click to view full company profile" : "اضغط لمشاهدة بروفايل وسابقة أعمال الشركة"}
                      >
                        <div className="flex items-center gap-2.5 justify-end flex-row-reverse">
                          <div className="w-10 h-10 rounded-xl bg-white p-1 border border-sky-200 overflow-hidden flex items-center justify-center shrink-0 shadow-3xs group-hover:shadow-xs">
                            {comp?.logoUrl ? (
                              <img src={comp.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full bg-[#2B4D89] text-white flex items-center justify-center font-black text-xs">
                                {(comp?.companyName || o.companyName).slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <div className="space-y-0.5 leading-none text-right">
                            <span className="text-[9px] text-[#2B4D89] block font-bold leading-normal">{isEn ? 'Contractor Partner' : 'الشركة المصممة والمنفذة'}</span>
                            <strong className="text-xs text-sky-950 font-black flex items-center gap-1 justify-end group-hover:text-[#2B4D89] transition-colors leading-tight">
                              {comp?.companyName || o.companyName}
                              {comp?.isVerified !== false && <span className="bg-sky-500 text-white rounded-full p-0.5 inline-flex items-center justify-center text-[8px] w-3.5 h-3.5" title="شركة موثقة">✓</span>}
                            </strong>
                          </div>
                        </div>
                        <span className="text-[9.5px] text-[#2B4D89] font-black text-center block mt-3 pt-1.5 border-t border-sky-100/75 group-hover:underline">
                          {isEn ? '🔍 View Company Profile' : '🔍 اضغط لفتح بروفايل الشركة'}
                        </span>
                      </div>

                      {/* 2. Rating Card (interactive link/click) */}
                      <div 
                        onClick={() => {
                          setOfferModalTab('PROFILE');
                          const el = document.getElementById('offer-details-tabs-anchor');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-amber-50/40 hover:bg-amber-50/70 transition-all border border-amber-100 hover:border-amber-300 p-4 rounded-2xl cursor-pointer hover:scale-101 flex flex-col justify-between group text-center"
                        title={isEn ? "Click to view supervisor reviews" : "اضغط لمشاهدة تقييمات المنصة والمشرفين"}
                      >
                        <div className="text-center space-y-1">
                          <span className="text-[9px] text-amber-800 font-bold block">{isEn ? 'Supervisor Rating' : 'تقييم جودة المقاول'}</span>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-[#D8B448] text-sm">★</span>
                            <strong className="text-sm font-black text-amber-950 font-mono">{comp?.rating || 4.9} / 5</strong>
                          </div>
                          <span className="text-[9px] text-gray-500 block">({comp?.projectsCompleted || 12} مشروع ناجح)</span>
                        </div>
                        <span className="text-[9px] text-amber-850 font-black text-center block mt-1 pt-1.5 border-t border-amber-150/50 group-hover:underline font-sans">
                          {isEn ? 'Explore Performance KPIs' : 'مشاهدة مؤشرات الأداء 📊'}
                        </span>
                      </div>

                      {/* 3. Total Price Card */}
                      <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                        <span className="text-[10px] text-emerald-850 font-bold block mb-1">{isEn ? 'Total Bid Price' : 'قيمة العرض المالي الإجمالي'}</span>
                        <strong className="text-lg text-emerald-850 font-black font-mono leading-none">
                          {o.price.toLocaleString()} ج.م
                        </strong>
                        <span className="text-[8.5px] text-emerald-600 font-bold mt-2 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          {isEn ? 'Escrow Protected' : '🛡️ دفع دفعات آمنة عبر شطبها'}
                        </span>
                      </div>

                      {/* 4. Duration Card */}
                      <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                        <span className="text-[10px] text-purple-850 font-bold block mb-1">{isEn ? 'Execution Duration' : 'مدة التنفيذ والعمل الميداني'}</span>
                        <strong className="text-sm text-purple-950 font-black font-mono leading-none">
                          ⏰ {o.durationDays} يوم عمل
                        </strong>
                        <span className="text-[8.5px] text-purple-600 font-bold mt-2 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                          {isEn ? 'Staged Milestones' : 'تسليم مرحلي خطوة بخطوة مبرهن'}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Active Tabbed Details Section */}
                  <div id="offer-details-tabs-anchor" className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6 text-right">
                    
                    {/* HIGH FIDELITY NAV TABS BAR */}
                    <div className="flex border-b border-gray-150 overflow-x-auto select-none no-scrollbar gap-1 justify-start">
                      <button
                        type="button"
                        onClick={() => setOfferModalTab('OFFER')}
                        className={`px-4 py-3 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                          offerModalTab === 'OFFER' ? 'border-[#2B4D89] text-[#2B4D89] bg-[#2B4D89]/5 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-t-xl'
                        }`}
                      >
                        💵 {isEn ? 'Offer Scope & Price' : 'تفاصيل العرض المالي'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOfferModalTab('PROFILE')}
                        className={`px-4 py-3 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                          offerModalTab === 'PROFILE' ? 'border-[#2B4D89] text-[#2B4D89] bg-[#2B4D89]/5 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-t-xl'
                        }`}
                      >
                        🏢 {isEn ? 'Company Profile' : 'بروفايل الشركة (دون تواصل)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOfferModalTab('PACKAGES')}
                        className={`px-4 py-3 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                          offerModalTab === 'PACKAGES' ? 'border-[#2B4D89] text-[#2B4D89] bg-[#2B4D89]/5 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-t-xl'
                        }`}
                      >
                        📐 {isEn ? 'Standard Finishing Packages' : 'باقات التشطيب والأسعار'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOfferModalTab('PORTFOLIO')}
                        className={`px-4 py-3 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                          offerModalTab === 'PORTFOLIO' ? 'border-[#2B4D89] text-[#2B4D89] bg-[#2B4D89]/5 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-t-xl'
                        }`}
                      >
                        🖼️ {isEn ? 'Works Portfolio' : 'سابقة أعمال الشركة'}
                      </button>
                    </div>

                    {/* CONTENT SECTIONS BASED ON ACTIVE TAB */}
                    <div className="min-h-[250px]">
                      
                      {/* 1. OFFER DETAIL TAB */}
                      {offerModalTab === 'OFFER' && (
                        <div className="space-y-5 animate-fadeIn text-right text-black">
                          
                          {/* Financial and Duration Summary */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 flex items-center justify-between font-sans">
                              <div className="text-right">
                                <span className="text-[10px] text-emerald-850 font-bold block mb-0.5">{isEn ? 'Offer Value / Financial' : 'قيمة العرض المالي الإجمالي'}</span>
                                <strong className="text-base text-emerald-900 font-extrabold">{o.price.toLocaleString()} ج.م</strong>
                              </div>
                              <span className="text-2xl">💰</span>
                            </div>

                            <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-100 flex items-center justify-between font-sans">
                              <div className="text-right">
                                <span className="text-[10px] text-purple-850 font-bold block mb-0.5">{isEn ? 'Execution Duration' : 'مدة التنفيذ والعمل'}</span>
                                <strong className="text-base text-purple-900 font-extrabold">{o.durationDays} يوم عمل</strong>
                              </div>
                              <span className="text-2xl">⏰</span>
                            </div>
                          </div>

                          {/* Scope of supply description */}
                          <div className="space-y-1">
                            <span className="text-gray-700 text-[11px] font-black block border-r-2 border-[#2B4D89] pr-1.5">{isEn ? '1. Technical Offer & Notes:' : '١. تفاصيل العرض الفني والملاحظات:'}</span>
                            <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-[11.5px] leading-relaxed select-text whitespace-pre-wrap text-right border border-gray-200">
                              {o.description || (isEn ? 'No notes provided.' : 'لا توجد ملاحظات إضافية.')}
                            </div>
                          </div>

                          {/* Materials detail */}
                          <div className="space-y-1">
                            <span className="text-gray-700 text-[11px] font-black block border-r-2 border-indigo-500 pr-1.5">{isEn ? '2. Materials & Brands per Item:' : '٢. نوع الخامات المستخدمة في كل بند وعلاماتها:'}</span>
                            <div className="bg-indigo-50/30 p-4 rounded-xl text-gray-700 text-[11.5px] leading-relaxed select-text whitespace-pre-wrap text-right border border-indigo-100">
                              {o.materialsDetail || (isEn 
                                ? 'Plumbing: Certified high-quality BR/German PPR pipes.\nElectricity: Original Elsewedy certified copper cables.\nPaints: Jotun Fenomastic (two coats over durable putty).\nFloors: Luxury local porcelain or premium ceramic tile grades.' 
                                : 'تأسيس السباكة: مواسير الشريف والمواد معزولة بالكامل PPR.\nتأسيس الكهرباء: كابلات نحاسية معتمدة من السويدي ومفاتيح شنايدر.\nالدهانات: جوتن فينوماستيك الأصلي فرز أول.\nالأرضيات: بورسلين كليوباترا درجة أولى أو سيراميك الجوهرة الفاخر.')}
                            </div>
                          </div>

                          {/* Warranty detail */}
                          <div className="space-y-1">
                            <span className="text-gray-700 text-[11px] font-black block border-r-2 border-amber-500 pr-1.5">{isEn ? '3. Warranties Scope & Duration:' : '٣. ضمان بنود التشطيب ومدته الفنية:'}</span>
                            <div className="bg-amber-50/30 p-4 rounded-xl text-gray-700 text-[11.5px] leading-relaxed select-text whitespace-pre-wrap text-right border border-amber-100">
                              {o.warrantyDetail || (isEn 
                                ? '10-Year comprehensive warranty on all structural, plumbing, and electricity foundations with official certificate, and 2-Year support on paint surfaces.' 
                                : 'ضمان كلي معتمد لمدة 10 سنوات يشمل سلامة الشبكات التحتية (تأسيس السباكة والكهرباء والـتأسيس الإنشائي) مرفق معه شهادة ضمان رسمية، وصيانة دورية سنتين مجانية للوحدة.')}
                            </div>
                          </div>

                          {/* Escrow payout milestones visualization */}
                          <div className="space-y-1.5 pt-2">
                            <span className="text-gray-750 text-[11px] font-black block border-r-2 border-indigo-500 pr-1.5">
                              {isEn ? 'Safe Payout Milestones (Escrow System)' : 'دفعات الضمان والأمان الموزعة (نظام حماية الدفع بـ شطبها):'}
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-right">
                                <div className="font-extrabold text-[#2B4D89] text-[11px]">١. دفعة التأسيس وبدء العمل (35%)</div>
                                <div className="text-[10px] text-gray-500 mt-1">{isEn ? 'Released on delivery of initial build materials to site.' : 'تفعل فور توريد المواد الأولية واعتماد المهندس المشرف للرسم.'}</div>
                              </div>
                              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-right">
                                <div className="font-extrabold text-[#2B4D89] text-[11px]">٢. دفعة منتصف واستلام البنود (45%)</div>
                                <div className="text-[10px] text-gray-500 mt-1">{isEn ? 'After finishing insulation, electrics, & tiling okay.' : 'تصرف تدريجياً فور اجتياز اختبارات السباكة والكهرباء والدهان الأول.'}</div>
                              </div>
                              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-right">
                                <div className="font-extrabold text-[#2B4D89] text-[11px]">٣. التسليم النهائي والضمان (20%)</div>
                                <div className="text-[10px] text-gray-500 mt-1">{isEn ? 'Kept in escrow until final supervisor signoff inspect.' : 'تبقى معلقة في ضمان "شطبها" حتى استلام الوحدة والتوقيع بالقبول النهائي.'}</div>
                              </div>
                            </div>
                          </div>

                          {/* Quote Images */}
                          <div className="space-y-1.5 pt-2">
                            <span className="text-gray-700 text-[11px] font-black block border-r-2 border-amber-500 pr-1.5">{isEn ? 'Relevant Works Gallery:' : 'الصور المرفقة بملخص العرض:'}</span>
                            <div className="grid grid-cols-3 gap-2 font-mono">
                              {o.portfolio && o.portfolio.length > 0 ? (
                                o.portfolio.slice(0, 3).map((img, index) => (
                                  <div key={index} className="aspect-video bg-gray-150 rounded-lg overflow-hidden border border-gray-200 shadow-3xs">
                                    <img src={img} alt="Portfolio Work" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                ))
                              ) : (
                                <>
                                  <div className="aspect-video bg-gray-150 rounded-lg overflow-hidden border border-gray-200 shadow-3xs">
                                    <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80" alt="Work 1" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                  <div className="aspect-video bg-gray-150 rounded-lg overflow-hidden border border-gray-200 shadow-3xs">
                                    <img src="https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=300&q=80" alt="Work 2" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                  <div className="aspect-video bg-gray-150 rounded-lg overflow-hidden border border-gray-200 shadow-3xs">
                                    <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=300&q=80" alt="Work 3" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                        </div>
                      )}


                  {/* ACTIVE VIEW ENDS */}
                  {/* 2. COMPANY PROFILE TAB */}
                      {offerModalTab === 'PROFILE' && (
                        <div className="space-y-4 animate-fadeIn text-right text-black">
                          
                          {/* Cover Photo and Logo */}
                          <div className="relative h-44 bg-slate-900 rounded-2xl overflow-hidden shadow-inner font-sans">
                            <img 
                              src={comp?.coverUrl || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'} 
                              alt="Company Cover" 
                              className="w-full h-full object-cover opacity-60"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            
                            <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between">
                              <div className="text-right">
                                <h4 className="text-sm md:text-base font-black text-white flex items-center gap-1.5 justify-end flex-row-reverse text-right">
                                  <span>🏗️ {comp?.companyName || o.companyName}</span>
                                  {comp?.isVerified !== false && <span className="bg-sky-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans uppercase">Certified</span>}
                                </h4>
                                <p className="text-[10px] text-slate-300 font-bold mt-0.5 text-right">
                                  {isEn ? '🛡️ Approved Finishing Partner' : '🛡️ شريك تشطيب معتمد بالدائرة الفنية لـ شطبها'}
                                </p>
                              </div>

                              {/* Large Circular Logo */}
                              <div className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow">
                                {comp?.logoUrl ? (
                                  <img src={comp.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full bg-[#2B4D89] text-white flex items-center justify-center font-black text-sm">
                                    {(comp?.companyName || o.companyName).slice(0, 2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Critical anti-disintermediation security banner */}
                          <div className="p-3 bg-indigo-50 border-r-4 border-[#2B4D89] text-[#2B4D89] rounded-l-xl text-[10.5px] flex items-start gap-2.5 leading-relaxed text-right">
                            <ShieldCheck className="w-4 h-4 text-[#2B4D89] shrink-0 mt-0.5 animate-pulse" />
                            <div className="space-y-0.5 text-right">
                              <strong className="block text-right">{isEn ? 'Secure Contact Shield Active' : 'تفعيل درع حماية الاتصال وضمان الحقوق الرقمية للعميل 🔒'}</strong>
                              <span className="text-right block">
                                {isEn 
                                  ? 'Contact phone numbers, direct emails, website URLs and addresses are locked. They will unlock automatically in your workspace upon contract acceptance.' 
                                  : 'تم حجب معلومات الهاتف المباشر والبريد والموقع لتوفير الحماية القانونية للمشروع. بمجرد قبولكم للعرض السعري والتعاقد رسميًا، سيتم فك بروتوكول التشفير لتفعيل التواصل الفوري وبدء زيارة المعاينة الميدانية والبدء الفني، بما يضمن حقوق دفعة الضمان وحق الصيانة الكامل بـ شطبها مجاناً.'
                                }
                              </span>
                            </div>
                          </div>

                          {/* Profile text */}
                          <div className="space-y-1">
                            <span className="text-gray-700 text-[11px] font-black block border-r-2 border-[#2B4D89] pr-1.5">{isEn ? 'About the Contractor:' : 'نبذة عن الشركة ورؤيتها الفنية:'}</span>
                            <div className="bg-gray-55 p-3.5 rounded-xl text-gray-700 text-[11px] leading-relaxed text-right select-text whitespace-pre-wrap">
                              {comp?.aboutText || (isEn 
                                ? 'A premiere architecture and contracting office with 7+ years of experience in residential, administrative and high-end chalet finishing works in Egypt.' 
                                : 'مكتب هندسي وتصميم وديكور رائد متخصص في تشطيب الوحدات السكنية والفلل الفاخرة والمقرات الإدارية. نعمل بفريق فني متكامل وبأحدث أساليب التصوير والتخطيط ثلاثي الأبعاد، ملتزمون بمواصفات الكود المصري للبناء وتحت المتابعة الدورية بـ شطبها لتقديم أقصى درجات الإتقان وبأعلى معايير جودة البنود.')}
                            </div>
                          </div>

                          {/* Metadata indicators grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                              <span className="text-[10px] text-gray-400 block mb-1">{isEn ? 'Established' : 'عام التأسيس والخبرة'}</span>
                              <strong className="text-xs text-[#2B4D89] font-black">{comp?.establishedYear || 2019} م</strong>
                            </div>
                            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                              <span className="text-[10px] text-gray-400 block mb-1">{isEn ? 'Completed Projects' : 'إجمالي المشاريع السابقة'}</span>
                              <strong className="text-xs text-indigo-900 font-black">{comp?.projectsCompleted || 32} مشروع ناجح</strong>
                            </div>
                            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                              <span className="text-[10px] text-gray-400 block mb-1">{isEn ? 'Coverage areas' : 'نطاق وتغطية المدن'}</span>
                              <strong className="text-[10px] text-gray-800 font-bold block overflow-hidden text-ellipsis whitespace-nowrap">{(comp?.governorates || ['القاهرة', 'الجيزة']).join('، ')}</strong>
                            </div>
                            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                              <span className="text-[10px] text-gray-400 block mb-1">{isEn ? 'Status' : 'التوثيق القانوني'}</span>
                              <strong className="text-[10px] text-emerald-700 font-extrabold flex items-center justify-center gap-0.5">
                                ✓ {isEn ? 'CR & Tax Card Verified' : 'مستندات موثقة ومقيدة'}
                              </strong>
                            </div>
                          </div>

                          {/* Performance Metrics sliders */}
                          <div className="space-y-2.5 pt-1.5 bg-gray-50/40 p-3.5 rounded-2xl border border-gray-100 text-right">
                            <h5 className="text-[10.5px] font-black text-[#2B4D89] border-b border-gray-100 pb-1.5 mb-2 flex items-center gap-1 text-right">
                              📊 {isEn ? 'Shatibha Verified Performance KPIs' : 'مؤشرات الأداء والجودة المعتمدة من شطبها (مبني على تقارير المشرفين):'}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1 text-right">
                                <div className="flex justify-between items-center text-[10px] flex-row-reverse">
                                  <span className="text-gray-500">{isEn ? 'On-Time Project Delivery' : 'معدل الالتزام بجدول التنفيذ والوقت للوحدات'}</span>
                                  <span className="font-extrabold text-[#2B4D89]">{comp?.timingCommitment || 96}%</span>
                                </div>
                                <div className="h-2 bg-gray-150 rounded-full overflow-hidden">
                                  <div className="bg-[#2B4D89] h-full rounded-full" style={{ width: `${comp?.timingCommitment || 96}%` }}></div>
                                </div>
                              </div>
                              <div className="space-y-1 text-right">
                                <div className="flex justify-between items-center text-[10px] flex-row-reverse">
                                  <span className="text-gray-500">{isEn ? 'Site Supervisor Final Approval Rate' : 'معدل جودة تنفيذ البنود واجتياز الفحص الهندسي'}</span>
                                  <span className="font-extrabold text-emerald-700">{comp?.inspectorApprovalRate || 98}%</span>
                                </div>
                                <div className="h-2 bg-gray-150 rounded-full overflow-hidden">
                                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${comp?.inspectorApprovalRate || 98}%` }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. STANDARD PACKAGES TAB */}
                      {offerModalTab === 'PACKAGES' && (
                        <div className="space-y-4 animate-fadeIn text-right text-black">
                          <p className="text-[10.5px] text-gray-500 leading-relaxed mb-3 text-right">
                            {isEn 
                              ? 'Compare the custom bid sent to you with this contractor’s standard price list. Packages include complete labor and materials calculated per square meter.' 
                              : 'عقد مقارنة سهلة وسريعة: الباقات والأسعار والبنود الرسمية المعتمدة للمتر لدى الشركة. لائحة التسعير تمكنك من مراجعة تسعير المتر المربع وتفاصيل خامات البنود للتأكد من نزاهة السعر:'
                            }
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {comPackages.map((pkg) => (
                              <div key={pkg.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:border-[#2B4D89]/40 transition-all flex flex-col justify-between text-right font-sans">
                                <div>
                                  <div className="flex justify-between items-start gap-1 pb-2 border-b border-gray-100 flex-row-reverse">
                                    <h5 className="font-extrabold text-xs text-indigo-900 flex items-center gap-1 text-right">
                                      🌟 {pkg.name}
                                    </h5>
                                    <span className="bg-[#2B4D89]/10 text-[#2B4D89] text-[11px] font-black px-2.5 py-1 rounded-lg shrink-0 font-sans">
                                      {pkg.pricePerSqm.toLocaleString()} ج.م / م²
                                    </span>
                                  </div>

                                  <p className="text-[10px] text-gray-500 my-2.5 leading-relaxed text-right">
                                    {pkg.description}
                                  </p>

                                  <div className="space-y-1.5 pt-1.5 text-right font-sans">
                                    <span className="text-[10px] text-slate-400 block font-bold text-right">{isEn ? 'Included Features & Brands:' : 'أبرز المواد المضمونة والبنود المشمولة بالكامل:'}</span>
                                    <ul className="space-y-1 text-[10px] list-none text-right">
                                      {pkg.features.map((feat, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-1 text-gray-700 justify-end">
                                          <span className="text-emerald-600 shrink-0 font-bold ml-1">✓</span>
                                          <span>{feat}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400 font-bold flex-row-reverse">
                                  <span>🛡️ ضمان شامل 10 سنوات على المخرجات</span>
                                  <span>خاضع للمعاينة الفنية من شطبها</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. WORKS PORTFOLIO TAB */}
                      {offerModalTab === 'PORTFOLIO' && (
                        <div className="space-y-4 animate-fadeIn text-right text-black font-sans">
                          <p className="text-[10.5px] text-gray-500 leading-relaxed mb-3 text-right font-sans">
                            {isEn 
                              ? 'Actual residential and commercial works delivered by this contractor. Explore their execution quality with interactive before/after photo toggles.' 
                              : 'معرض سابقة أعمال ومشاريع واقعية نفذها المطور على أرض الطبيعة. يمكنك النقر بمرونة على أزار (قبل التشطيب) و(بعد التشطيب) لمشاهدة التحول الدقيق:'
                            }
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                            {comPortfolio.map((item) => {
                              const currentToggle = beforeAfterToggle[item.id] || 'AFTER';
                              const hasBeforeAfter = item.beforeImages && item.beforeImages.length > 0 && item.afterImages && item.afterImages.length > 0;
                              
                              let displayImg = item.images[0] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80';
                              if (hasBeforeAfter) {
                                  displayImg = currentToggle === 'BEFORE' 
                                    ? (item.beforeImages ? item.beforeImages[0] : displayImg)
                                    : (item.afterImages ? item.afterImages[0] : displayImg);
                              }

                              return (
                                <div key={item.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all relative flex flex-col justify-between font-sans">
                                  
                                  {/* Photo and toggles */}
                                  <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                                    <img 
                                      src={displayImg} 
                                      alt={item.projectName} 
                                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                      referrerPolicy="no-referrer"
                                    />

                                    {/* Interactive Before / After Tabs if available */}
                                    {hasBeforeAfter && (
                                      <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-1.5 py-1 rounded-xl flex items-center gap-1 border border-white/20 z-10 scale-90">
                                        <button
                                          type="button"
                                          onClick={() => setBeforeAfterToggle(prev => ({ ...prev, [item.id]: 'BEFORE' }))}
                                          className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                                            currentToggle === 'BEFORE' ? 'bg-[#2B4D89] text-white shadow' : 'text-slate-300 hover:text-white'
                                          }`}
                                        >
                                          {isEn ? 'Before' : 'قبل التشطيب'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setBeforeAfterToggle(prev => ({ ...prev, [item.id]: 'AFTER' }))}
                                          className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                                            currentToggle === 'AFTER' ? 'bg-[#2B4D89] text-white shadow' : 'text-slate-300 hover:text-white'
                                          }`}
                                        >
                                          {isEn ? 'After' : 'بعد التشطيب'}
                                        </button>
                                      </div>
                                    )}

                                    {/* Project Tag */}
                                    <span className="absolute top-3 right-3 bg-black/55 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded-md font-sans font-bold">
                                      {item.projectType}
                                    </span>
                                  </div>

                                  {/* Details text */}
                                  <div className="p-3.5 space-y-2 text-right">
                                    <div className="flex justify-between items-center text-xs flex-row-reverse">
                                      <h6 className="font-extrabold text-[#2B4D89] text-xs leading-tight text-right text-[#232F3F]">
                                        {item.projectName}
                                      </h6>
                                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded shrink-0">
                                        {item.governorate} • {item.executionYear}
                                      </span>
                                    </div>

                                    <p className="text-[10px] text-gray-500 leading-relaxed max-h-16 overflow-y-auto text-right">
                                      {item.description || (isEn ? 'Full interior design finishing including custom cabinetry and bespoke layouts.' : 'تم استلام الموقع على هيكل الخرسانة الأسود وتنفيذ كافة التعديلات وعزل الصوت ورش الدهانات الأكريليكية الفخمة وبورسلين الصالون.')}
                                    </p>
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Action Buttons: Accept / Reject WITH SECURITY INTERACTIVE CONFIRMATIONS */}
                    <div className="mt-8 pt-4 border-t border-gray-150 font-sans">
                      {isThisOfferAccepted ? (
                        (() => {
                          const matchingContract = contracts.find(c => c.requestId === o.requestId && c.companyId === o.companyId);
                          const isContractSigned = matchingContract?.isSigned || false;
                          
                          return (
                            <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-center space-y-3.5 animate-fadeIn">
                              <div className="text-2xl">🤝🎉</div>
                              <h5 className="font-extrabold text-emerald-900 text-xs sm:text-sm font-sans">
                                {isEn ? 'Offer Accepted & Under Coordination' : 'لقد قمت بقبول واعتماد هذا العرض الفني والمالي! 🤝'}
                              </h5>
                              <p className="text-[10px] sm:text-[11px] leading-relaxed text-emerald-800 font-bold max-w-lg mx-auto">
                                {isEn 
                                  ? (isContractSigned 
                                      ? 'This proposal is fully contracted and signed. Construction is now officially active with your decorative company!' 
                                      : 'This proposal was accepted. It is currently in the coordination phase. A supervisor is scheduled to perform site inspection.')
                                  : (isContractSigned 
                                      ? 'تهانينا! تم توقيع العقد الهندسي رسمياً ومباشرة أعمال التشطيب الميداني مع الشركة المختارة بضمان منصة شطبها.' 
                                      : 'هذا العرض مقبول ومسودة العقد قيد التجهيز جاري التنسيق حالياً. تم تعيين المهندس المشرف لتنسيق المعاينة الميدانية الأولى.')
                                }
                              </p>

                              {/* Show the retract option as long as it has NOT been officially signed yet */}
                              {!isContractSigned && (
                                <div className="pt-3 border-t border-emerald-250/60 mt-3 max-w-md mx-auto">
                                  {!showRetractConfirm ? (
                                    <button
                                      type="button"
                                      onClick={() => setShowRetractConfirm(true)}
                                      className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black transition-all cursor-pointer border border-rose-200 shadow-xs"
                                    >
                                      🔄 {isEn ? 'Retract Selection / Choose Another Offer' : '🔄 التراجع عن الاختيار وإعادة طرح المناقصة للتقديم'}
                                    </button>
                                  ) : (
                                    <div className="p-4 bg-white rounded-xl border border-rose-200 text-right space-y-2.5 animate-fadeIn">
                                      <h6 className="font-extrabold text-[#D32F2F] text-[11px] flex items-center gap-1 justify-end font-sans">
                                        ⚠️ {isEn ? 'Are you sure you want to retract your acceptance?' : 'تأكيد التراجع عن اختيار عرض السعر؟'}
                                      </h6>
                                      <p className="text-[9.5px] sm:text-[10px] text-gray-500 font-bold leading-normal">
                                        {isEn
                                          ? 'Retracting this offer will cancel the scheduled coordination, remove the draft contract, and allow you to view & choose other bids.'
                                          : 'التراجع سيؤدي إلى إلغاء التنسيق المالي الحالي، وحذف مسودة العقد غير الموقّع، وإعادة طرح طلبك في المناقصة لمراجعة العروض الأخرى بحرية واختيار عرض بديل.'}
                                      </p>
                                      <div className="flex items-center gap-2 justify-end">
                                        <button
                                          type="button"
                                          onClick={() => setShowRetractConfirm(false)}
                                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[9px] font-extrabold cursor-pointer"
                                        >
                                          {isEn ? 'Abort' : 'تراجع وإلغاء'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (onCancelAcceptOffer) {
                                              onCancelAcceptOffer(o.requestId);
                                            }
                                            setShowRetractConfirm(false);
                                            setViewingOfferDetails(null);
                                          }}
                                          className="px-4 py-1 bg-rose-600 hover:bg-[#D32F2F] text-white rounded-md text-[9px] font-black cursor-pointer shadow-xs"
                                        >
                                          {isEn ? 'Yes, Retract Choice' : 'نعم، تراجع وإلغاء الاختيار 🔄'}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : isRejected ? (
                        <div className="p-5 bg-rose-50 rounded-2xl border border-rose-200 text-center space-y-2.5 animate-fadeIn">
                          <div className="text-2xl">❌</div>
                          <h5 className="font-extrabold text-[#D32F2F] text-xs sm:text-sm font-sans">
                            {isEn ? 'This Offer has been Declined' : 'تم استبعاد ورفض هذا العرض ❌'}
                          </h5>
                          <p className="text-[10px] sm:text-[11px] leading-relaxed text-[#D32F2F] font-bold max-w-lg mx-auto mb-2">
                            {isEn 
                              ? 'You have manually excluded this proposal. To reconsider, you can click the button below to restore it.'
                              : 'لقد قمت باستبعاد هذا العرض الفني مسبقًا لتسهيل تصفية العروض الأخرى المطروحة لمشروعك.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectedOfferIds(prev => {
                                const nw = prev.filter(id => id !== o.id);
                                localStorage.setItem('shattabba_rejected_offers', JSON.stringify(nw));
                                return nw;
                              });
                            }}
                            className="px-4 py-1.5 bg-rose-600 hover:bg-[#D32F2F] text-white text-[10px] font-black rounded-lg transition-all cursor-pointer shadow-xs inline-block font-sans"
                          >
                            {isEn ? 'Restore / Reconsider Offer' : '🔄 إلغاء الرفض وإعادة دراسة العرض'}
                          </button>
                        </div>
                      ) : (isOtherOfferAccepted || (isPastPricing && !isThisOfferAccepted)) ? (
                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-2.5 animate-fadeIn">
                          <div className="text-2xl">🔒</div>
                          <h5 className="font-extrabold text-[#232F3F] text-xs sm:text-sm font-sans">
                            {isEn ? 'Tender Closed (Another Offer Selected)' : 'المناقصة مغلقة (تم قبول عرض شركة أخرى) 🔒'}
                          </h5>
                          <p className="text-[10px] sm:text-[11px] leading-relaxed text-gray-400 font-bold max-w-lg mx-auto">
                            {isEn 
                              ? 'Actions on this offer are disabled. Your request is already active with another accepted decorative company.'
                              : 'العرض مغلق وتعديل الإجراءات غير متاح نظراً لاعتمادك وقبولك عرضاً هندسياً آخراً لمباشرة مشروع التشطيب.'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-center mb-4">
                            <span className="text-[10px] text-amber-800 font-black block">
                              🔍 {isEn ? 'This bid is new and under your active evaluation.' : 'هذا العرض جديد وقيد الفحص والمراجعة والتقييم من طرفكم.'}
                            </span>
                          </div>

                          {showAcceptConfirm ? (
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-right space-y-3 animate-fade-in font-sans">
                              <h5 className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5 justify-end">
                                <span>🤝 تأكيد التعاقد واعتماد عرض الأسعار</span>
                              </h5>
                              <p className="text-[10px] sm:text-[11px] leading-relaxed text-gray-650 font-bold">
                                {isEn 
                                  ? 'You are about to accept this quote. This initiates safe tripartite escrow drafting and schedules the physical site inspection with your certified inspector. Proceed?'
                                  : 'أنت على وشك قبول هذا العرض المالي والفني والبدء الفعلي في صياغة العقد وضمان الدفعات عبر منصة شطبها وتعيين المشرف للمعاينة الميدانية. هل ترغب بالموافقة؟'}
                              </p>
                              <div className="flex items-center gap-2 justify-end font-sans">
                                <button
                                  type="button"
                                  onClick={() => setShowAcceptConfirm(false)}
                                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-350 text-gray-650 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer"
                                >
                                  {isEn ? 'Cancel' : 'تراجع وإلغاء'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onAcceptOffer(o.requestId, o);
                                    setViewingOfferDetails(null);
                                    if (req) {
                                      setSelectedRequestId(req.id);
                                    }
                                    setSelectedStatCard('NONE');
                                  }}
                                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black transition-all cursor-pointer shadow-xs shadow-emerald-600/20"
                                >
                                  {isEn ? 'Yes, Confirmed' : 'نعم، موافق ومستعد 🤝'}
                                </button>
                              </div>
                            </div>
                          ) : showRejectConfirm ? (
                            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-right space-y-3 animate-fade-in font-sans">
                              <h5 className="font-extrabold text-[#D32F2F] text-xs flex items-center gap-1.5 justify-end">
                                <span>❌ تأكيد استبعاد ورفض العرض</span>
                              </h5>
                              <p className="text-[10px] sm:text-[11px] leading-relaxed text-gray-650 font-bold">
                                {isEn 
                                  ? 'Are you sure you want to decline and filter out this quote? This action is permanent and cannot be undone.'
                                  : 'هل أنت متأكد من رغبتك في استبعاد هذا العرض الفني والمالي نهائياً من مشروعك الحالي؟ هذا الإجراء لا يمكن التراجع عنه.'}
                              </p>
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setShowRejectConfirm(false)}
                                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-350 text-gray-650 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer"
                                >
                                  {isEn ? 'Cancel' : 'إلغاء وتراجع'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleRejectOfferInternal(o.id);
                                    setViewingOfferDetails(null);
                                  }}
                                  className="px-5 py-2 bg-rose-600 hover:bg-[#D32F2F] text-white rounded-lg text-[10px] font-black transition-all cursor-pointer shadow-xs shadow-rose-600/20"
                                >
                                  {isEn ? 'Yes, Decline' : 'نعم، استبعاد نهائي ❌'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-3 flex-row-reverse font-sans">
                              {/* Accept Option Trigger */}
                              <button
                                type="button"
                                onClick={() => setShowAcceptConfirm(true)}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-800 text-white rounded-xl font-extrabold text-xs transition-colors cursor-pointer flex-1 text-center shadow-lg shadow-emerald-600/10 active:scale-95 duration-100"
                              >
                                🤝 {isEn ? 'Accept Offer & Start Build' : 'قبول العرض وبدء كتابة العقد رسميًا 🤝'}
                              </button>

                              {/* Reject Option Trigger */}
                              <button
                                type="button"
                                onClick={() => setShowRejectConfirm(true)}
                                className="px-6 py-3 bg-rose-50 text-rose-600 hover:bg-[#FCE8E6] border border-rose-100 rounded-xl font-bold text-xs transition-with-duration cursor-pointer flex-1 text-center active:scale-95 duration-100"
                              >
                                ❌ {isEn ? 'Reject Offer' : 'رفض واستبعاد العرض'}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                  </div>
                </div>
              );
            })() : clientRequests.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-150 py-16 px-6 text-center text-gray-500 shadow-sm mt-8">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-extrabold text-[#232F3F] mb-3">
                  {isEn ? 'Welcome to your Dashboard' : 'مرحباً بك في لوحة تحكم مشاريعك'}
                </h3>
                <p className="text-xs max-w-md mx-auto mb-8 leading-relaxed">
                  {isEn 
                    ? 'You do not have any active finishing projects yet. Start by creating a new request and letting Shattabha manage the bidding and execution.' 
                    : 'لا يوجد لديك طلبات تشطيب مسجلة حتى الآن. ابدأ بإضافة مشروعك الأول لنطرحه للمناقصة ونصلك بأفضل الشركات المعتمدة.'}
                </p>
                <button 
                  onClick={() => setIsMapPickingVisible(true)}
                  className="bg-[#2B4D89] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#1E3A8A] transition-colors shadow-md text-sm cursor-pointer"
                >
                  {isEn ? '+ Start New Request' : '+ أضف مشروعك الأول وابدأ الآن'}
                </button>
              </div>
            ) : selectedRequest ? (
              <div className="space-y-6">
                
                {/* 🛠️ DEMO TESTING BAR: SIMULATE ANY OF THE 11 LIFE-CYCLE STATUSES */}
                <div className="bg-white p-4.5 rounded-3xl border border-dashed border-[#2B4D89]/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-right shadow-xs no-print">
                  <div className="text-right">
                    <span className="text-[11px] font-black text-[#2B4D89] flex items-center gap-1.5 justify-end">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      <span>لوحة محاكاة وتجربة دورة حياة طلب التشطيب السريعة:</span>
                    </span>
                    <span className="text-[9.5px] text-gray-400 font-bold block mt-0.5 font-sans">
                      {isEn ? 'Toggle different phases of the finishing project instantly to inspect design & states:' : 'اضغط على الأزرار بالأسفل للتنقل الفوري ومتابعة شريط المتابعة، بطاقة المشرف والضمان التنازلي الحقيقي للطلب المحدد:'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end font-sans">
                    {[
                      { status: 'PENDING_REVIEW', label: '🔍 تحت المراجعة الفنية' },
                      { status: 'UNDER_PRICING', label: '📨 تم إرسال الطلب للشركات' },
                      { status: 'WAITING_FOR_INSPECTION', label: '🛠️ بانتظار إجراءات المعاينة والتعاقد' },
                      { status: 'ACTIVE', label: '🏗️ المشروع قيد التنفيذ' },
                      { status: 'COMPLETED', label: '🟢 مكتمل ونظام الضمان' }
                    ].map(stItem => (
                      <button
                        key={stItem.status}
                        type="button"
                        onClick={() => setSelectedRequestStatusOverride(p => ({ ...p, [selectedRequest.id]: stItem.status as RequestStatus }))}
                        className={`text-[10px] font-black px-3.5 py-2 rounded-xl border cursor-pointer transition-all ${
                          currentRequestStatus === stItem.status 
                            ? 'bg-[#2B4D89] border-[#2B4D89] text-white shadow-xs scale-[1.03]' 
                            : 'bg-gray-55 border-gray-150 text-[#2B4D89] hover:bg-gray-100'
                        }`}
                      >
                        {stItem.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BLUE HEADER BAR */}
                <div className="bg-[#232F3F] rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md font-sans">
                  <div className="space-y-1 text-right w-full sm:w-auto">
                    <p className="text-[15px] font-black tracking-wide text-white flex flex-row-reverse items-center justify-end gap-2 text-right">
                      <span className="text-teal-400">#{selectedRequest.id.toLowerCase()}</span>
                      <span>|</span>
                      <span>{getUnitTypeLabelOnly(selectedRequest.unitType)} {isEn ? `with area ${selectedRequest.area}m²` : `بمساحة ${selectedRequest.area}م²`}</span>
                      <span>|</span>
                      <span className="text-gray-300 font-normal text-xs">{isEn ? (selectedRequest.city === 'التجمع الخامس' ? '5th Settlement' : selectedRequest.city === 'سموحة' ? 'Smouha' : selectedRequest.city === 'الشيخ زايد' ? 'Sheikh Zayed' : selectedRequest.city) : selectedRequest.city} - {isEn ? (selectedRequest.governorate === 'القاهرة' ? 'Cairo' : selectedRequest.governorate === 'الجيزة' ? 'Giza' : selectedRequest.governorate === 'الإسكندرية' ? 'Alexandria' : selectedRequest.governorate) : selectedRequest.governorate}</span>
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-wrap items-center gap-3 justify-end">
                    {(currentRequestStatus === 'UNDER_PRICING' || currentRequestStatus === 'OFFERS_RECEIVED') && (
                      <TenderCountdown deadline={selectedRequest.deadline} createdAt={selectedRequest.createdAt} isEn={isEn} />
                    )}
                    <span className="bg-[#1C694F] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-emerald-500/25">
                      {(currentRequestStatus === 'PENDING_REVIEW' || currentRequestStatus === 'UNDER_TECHNICAL_REVIEW' || currentRequestStatus === 'SUBMITTED') ? (isEn ? 'Under Technical Review' : '🔍 قيد المراجعة والموافقة الفنية وبانتظار الأدمن') :
                       currentRequestStatus === 'UNDER_PRICING' ? (isEn ? 'Tender Active - Receiving Bids' : '📨 تم إرساله لشركات التشطيب - استقبال العروض') :
                       currentRequestStatus === 'OFFERS_RECEIVED' ? (isEn ? 'Tender Active - Receiving Bids' : '📨 تم إرساله لشركات التشطيب - استقبال العروض') :
                       currentRequestStatus === 'CLIENT_SELECTED' ? (isEn ? 'Awaiting Inspection & Contract Signing' : 'في انتظار المعاينة وتوقيع العقود ⏳') :
                       currentRequestStatus === 'COORDINATION' ? (isEn ? 'Awaiting Inspection & Contract Signing' : 'في انتظار المعاينة وتوقيع العقود ⏳') :
                      currentRequestStatus === 'WAITING_FOR_INSPECTION' ? (isEn ? 'Awaiting Technical Approval ⏳' : 'بانتظار إجراءات المعاينة والتعاقد ⏳') :
                       currentRequestStatus === 'COMPLETED' ? (isEn ? 'Completed & Secured Warranty' : '🟢 مشروع مكتمل - فترة الضمان') :
                       (isEn ? '✓ Active Field Construction' : '✓ جاري التنفيذ الميداني')}
                    </span>
                  </div>
                </div>

                {/* 📊 THIRD SECTION: PROJECT PROGRESS STATUS TIMELINE */}
                <div className="bg-white rounded-2.5xl border border-gray-150 p-5 shadow-sm space-y-4 text-right font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <span className="text-xs font-black text-gray-850 flex items-center gap-2">
                      <span className="text-[#2B4D89] text-base">Timeline</span>
                      <span>شريط متابعة مراحل المشروع وعملية الاكتتاب (Status Timeline):</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2.5 py-1 rounded-md">
                      {isEn ? 'Phase:' : 'الحالة الحالية للطلب:'} <span className="text-[#2B4D89] font-black">{
                        (currentRequestStatus === 'PENDING_REVIEW' || currentRequestStatus === 'UNDER_TECHNICAL_REVIEW' || currentRequestStatus === 'SUBMITTED') ? 'تحت المراجعة والموافقة الفنية من شطبها' :
                        currentRequestStatus === 'UNDER_PRICING' ? 'تم تقديم الطلب وجاري المراجعة وتلقي العروض من مسؤولي المنصة' :
                        currentRequestStatus === 'OFFERS_RECEIVED' ? 'تم إرسال الطلب لشركات التشطيب وبدء استقبال عروض الأسعار' :
                        currentRequestStatus === 'CLIENT_SELECTED' ? 'تم اختيار العرض وبانتظار معاينة شطبها' :
                        currentRequestStatus === 'COORDINATION' ? 'تم اختيار العرض وبانتظار معاينة شطبها' :
                        currentRequestStatus === 'WAITING_FOR_INSPECTION' ? 'بانتظار إجراءات المعاينة والتعاقد' :
                        currentRequestStatus === 'ACTIVE' ? 'المشروع قيد التنفيذ والمطابقة الهندسية مرحلة بمرحلة' :
                        currentRequestStatus === 'COMPLETED' ? 'المشروع مكتمل بالكامل وخدمة الضمان سارية فوريًا' : 'تحت المراجعة والتدقيق الهندسية من شطبها'
                      }</span>
                    </span>
                  </div>

                  {/* Horizontal visual Timeline list */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2 pt-1 font-sans">
                    {[
                      { stepId: 1, label: 'تقديم الطلب' },
                      { stepId: 2, label: 'تحت المراجعة الفنية' },
                      { stepId: 3, label: 'اعتماد الطلب' },
                      { stepId: 4, label: 'تعيين مشرف شطبها' },
                      { stepId: 5, label: 'إرسال لشركات التشطيب' },
                      { stepId: 6, label: 'استقبال العروض' },
                      { stepId: 7, label: 'اختيار العرض الأفضل' },
                      { stepId: 8, label: 'التعاقد وحجز الضمان' },
                      { stepId: 9, label: 'بدء التنفيذ الميداني' },
                      { stepId: 10, label: 'التسليم النهائي' },
                      { stepId: 11, label: 'الضمان ساري' }
                    ].map((step) => {
                      let isCompleted = false;
                      let isActiveNow = false;

                      if (currentRequestStatus === 'PENDING_REVIEW' || currentRequestStatus === 'UNDER_TECHNICAL_REVIEW' || currentRequestStatus === 'SUBMITTED') {
                        if (step.stepId === 1) isCompleted = true;
                        if (step.stepId === 2) isActiveNow = true;
                      } else if (currentRequestStatus === 'UNDER_PRICING' || currentRequestStatus === 'OFFERS_RECEIVED') {
                        if (step.stepId < 3) isCompleted = true;
                        if (step.stepId === 3 || step.stepId === 5) isActiveNow = true;
                        if (currentRequestStatus === 'OFFERS_RECEIVED' && step.stepId === 6) isActiveNow = true;
                      } else if (currentRequestStatus === 'CLIENT_SELECTED' || currentRequestStatus === 'COORDINATION') {
                        if (step.stepId < 7) isCompleted = true;
                        if (step.stepId === 7) isActiveNow = true;
                      } else if (currentRequestStatus === 'WAITING_FOR_INSPECTION') {
                        if (step.stepId < 8) isCompleted = true;
                        if (step.stepId === 8) isActiveNow = true;
                      } else if (currentRequestStatus === 'ACTIVE') {
                        if (step.stepId < 9) isCompleted = true;
                        if (step.stepId === 9) isActiveNow = true;
                      } else if (currentRequestStatus === 'COMPLETED') {
                        isCompleted = true;
                        if (step.stepId === 11) isActiveNow = true;
                      }

                      return (
                        <div 
                          key={step.stepId} 
                          className={`relative flex flex-col items-center text-center p-2 rounded-xl transition-all border ${
                            isActiveNow 
                              ? 'bg-[#2B4D89]/8 border-[#2B4D89] text-[#2B4D89]' 
                              : isCompleted 
                              ? 'bg-emerald-50/55 border-emerald-250 text-emerald-850' 
                              : 'bg-white border-gray-150 text-gray-400 opacity-65'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] select-none ${
                            isActiveNow 
                              ? 'bg-[#2B4D89] text-white animate-pulse' 
                              : isCompleted 
                              ? 'bg-[#0F7453] text-white' 
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {isCompleted ? '✓' : step.stepId}
                          </div>
                          <span className="text-[8.5px] font-black mt-2 leading-tight block whitespace-normal min-h-[22px] font-sans">{step.label}</span>
                          <span className="text-[7.5px] font-bold mt-0.5 opacity-75 font-sans">
                            {isCompleted ? '✓ مكتمل' : isActiveNow ? '● جاري الآن' : '○ قادم'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* OVERALL PROJECT COMPLETION PROGRESS BAR WIDGET OR TENDER FLOW WIDGET */}
                {currentRequestStatus === 'ACTIVE' ? (
                  <div className="bg-white border border-gray-200/50 rounded-2xl p-5 shadow-xs space-y-3.5 animate-fade-in text-right font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-sm text-[#232F3F] flex items-center gap-1.5 animate-shimmer">
                          <span>📈</span> {isEn ? `Overall Project Completion rate for ${getUnitTypeLabelOnly(selectedRequest.unitType)}:` : `نسبة الإنجاز لمشروع الـ${selectedRequest.unitType} ككل:`}
                          <span className="text-xl font-black text-[#2B4D89]">{getOverallProgress(selectedRequest.id)}%</span>
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">
                          {isEn ? 'The phase finishes and contractor payout is automatically disbursed upon independent inspector approval of items.' : 'تنتهى المرحلة الحالية ويتم الصرف للمقاول تلقائياً بمجرد اعتماد المشرف الفني المستقل للبنود.'}
                        </p>
                      </div>

                      <div className="text-left font-mono text-[10px] text-indigo-700 font-extrabold">
                        {isEn ? 'Oversight is:' : 'حالة الإشراف:'} <span>{isEn ? '✓ Field inspector assigned' : '✓ مهندس ميداني معين ومطابق'}</span>
                      </div>
                    </div>

                    <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden border border-gray-150 p-0.5">
                      <div 
                        className="h-full bg-linear-to-r from-[#2B4D89] to-[#30445E] rounded-full transition-all duration-700 shadow-xs flex items-center justify-end pl-1.5"
                        style={{ width: `${getOverallProgress(selectedRequest.id)}%` }}
                      >
                        {getOverallProgress(selectedRequest.id) > 10 && (
                          <span className="text-[8px] font-black text-white px-1">%{getOverallProgress(selectedRequest.id)}</span>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Interactive Stage Progress Donut Chart */}
                    <ClientProgressDonut 
                      stages={stages}
                      requestId={selectedRequest.id}
                      isEn={isEn}
                    />

                    {/* Execution Timeline Stats / Details duration completed for each stage */}
                    {(() => {
                      const reqStages = stages.filter(s => s.requestId === selectedRequest.id);
                      const completedStagesCount = reqStages.filter(s => s.status === 'APPROVED' || s.progress === 100).length;
                      
                      const totalDurationDays = reqStages.reduce((sum, stg) => sum + (stg.totalDurationDays || 0), 0);
                      const daysElapsed = reqStages.reduce((sum, stg) => sum + (stg.daysElapsed || 0), 0);
                      const remainingDays = Math.max(0, totalDurationDays - daysElapsed);
                      const lateDays = Math.max(0, daysElapsed - totalDurationDays);
                      const matchedContractForRates = (contracts || []).find(c => c.requestId === selectedRequest.id);
                      const penaltyRateFixed = matchedContractForRates?.delayPenaltyPerDay || 500;
                      const lateFine = lateDays * penaltyRateFixed;
                      
                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-[10px]">
                          <div className="bg-[#FAFDFB] border border-[#2B4D89]/25 p-2.5 rounded-xl text-center space-y-0.5">
                            <span className="text-gray-400 block font-bold">{isEn ? 'Completed Phases' : 'المراحل المنجزة'}</span>
                            <span className="text-[#2B4D89] font-black">{completedStagesCount} {isEn ? 'of' : 'من'} {reqStages.length || 4}</span>
                          </div>
                          <div className="bg-[#FAFDFB] border border-[#2B4D89]/25 p-2.5 rounded-xl text-center space-y-0.5">
                            <span className="text-gray-400 block font-bold">{isEn ? 'Total Duration' : 'المدة الزمنية الكلية'}</span>
                            <span className="text-[#30445E] font-black">
                              {totalDurationDays} {isEn ? 'days' : 'يوم'}
                            </span>
                          </div>
                          <div className="bg-[#FAFDFB] border border-[#2B4D89]/25 p-2.5 rounded-xl text-center space-y-0.5">
                            <span className="text-gray-400 block font-bold">{isEn ? 'Days Elapsed' : 'أيام العمل المنقضية'}</span>
                            <span className="text-blue-700 font-black">
                              {daysElapsed} {isEn ? 'days' : 'يوم'}
                            </span>
                          </div>
                          <div className="bg-[#FAFDFB] border border-[#2B4D89]/25 p-2.5 rounded-xl text-center space-y-0.5">
                            <span className="text-gray-400 block font-bold">{isEn ? 'Remaining Days' : 'المعدل المتبقي للتسليم'}</span>
                            <span className="text-rose-600 font-black">
                              {remainingDays} {isEn ? 'days' : 'يوم'}
                            </span>
                          </div>
                          <div className={`p-2.5 rounded-xl text-center space-y-0.5 border ${
                            lateFine > 0 
                              ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' 
                              : 'bg-emerald-50 border-emerald-100 text-emerald-850'
                          }`}>
                            <span className="block font-bold text-gray-500">{isEn ? `Delay Fines (${penaltyRateFixed} EGP/Day)` : `غرامات التأخير (${penaltyRateFixed} ج.م/يوم)`}</span>
                            <span className="font-extrabold text-[11px]">
                              {lateFine > 0 ? `${lateFine.toLocaleString()} ج.م (${lateDays} يوم للمشروع)` : '0 ج.م'}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : currentRequestStatus === 'COMPLETED' ? (
                  <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border-2 border-emerald-300 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in text-right font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/50 pb-4">
                      <div className="flex items-start gap-4 text-right justify-end w-full sm:justify-start">
                        <span className="text-3xl shrink-0 select-none">🟢</span>
                        <div className="text-right">
                          <h3 className="font-extrabold text-sm text-emerald-955 flex items-center justify-end sm:justify-start gap-1.5">
                            <span className="bg-emerald-200 text-emerald-900 border border-emerald-350 text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse">✓ ساري ومفعّل فوريًا</span>
                            <span>{isEn ? 'Warranty Contract is Active' : 'حالة الضمان: الضمان ساري ومفعّل فوريًا'}</span>
                          </h3>
                          <p className="text-[10.5px] text-emerald-800 font-extrabold mt-1">
                            {isEn ? 'Authorized by Shatibha engineering inspection board. Period: 12 Months' : 'معتمد رسميًا ومطابق هندسيًا بضمان شطبها مستقل • حماية بنود السباكة والخامات ضد عيوب التشغيل وعيوب الصيانة من الموارد المباشرة'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-[10.5px] shrink-0 font-extrabold text-emerald-900 bg-white/95 px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-3xs w-full sm:w-auto mt-2 sm:mt-0">
                        <p>{isEn ? 'Start Date:' : 'تاريخ البداية:'} 01/01/2026</p>
                        <p className="mt-0.5">{isEn ? 'End Date:' : 'تاريخ الانتهاء:'} 01/01/2027</p>
                      </div>
                    </div>

                    {/* Warranty Progress countdown and visual bar */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-right">
                      <div className="md:col-span-4 bg-white/85 p-4.5 rounded-xl border border-emerald-200 text-center space-y-1.5 shadow-3xs">
                        <span className="text-[11px] text-emerald-850 font-black block">🕒 {isEn ? 'Remaining Warranty Time:' : 'عداد تنازلي للضمان متبقي للوحدة:'}</span>
                        <div className="text-emerald-955 font-black tracking-wide text-xs flex items-center justify-center gap-1.5" dir="ltr">
                          <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded font-mono text-[10.5px]">245 يوم</span>
                          <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded font-mono text-[10.5px]">08 س</span>
                          <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded font-mono text-[10.5px]">32 د</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 block pt-1 font-bold">{isEn ? 'Remaining Countdown till 01/01/2027' : 'متبقي على تاريخ انتهاء الضمان الفعلي للوحدة'}</span>
                      </div>

                      <div className="md:col-span-8 space-y-2.5 text-right">
                        <div className="flex items-center justify-between text-[11px] font-black text-emerald-900">
                          <span>Warranty Progress (نسبة مرور فترة الضمان والتشغيل)</span>
                          <span>60%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 border border-emerald-150 rounded-full overflow-hidden p-0.5">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-inner" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-[9.5px] text-gray-400 font-bold leading-relaxed">
                          {isEn ? 'Your warranty protects against structural failure, water/electricity leaks, and painting peels.' : '* يشمل الضمان إصلاح تسريبات المياه أو الصرف، وعلب تأسيس الكهرباء، والشروخ وعيوب الدهانات وفواصل البورسلين مجانًا بالكامل.'}
                        </p>
                      </div>
                    </div>

                    {/* Submit Maintenance / Warranty claim form */}
                    <div className="border-t border-emerald-250 pt-4">
                      {warrantyClaimSuccess ? (
                        <div className="bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs p-4 rounded-xl font-bold flex items-center gap-2 animate-pulse justify-center text-center">
                          <span>🚀 تم تسجيل بلاغ الضمان بنجاح واخطار إدارة شطبها والشركة المنفذة للمعاينة السريعة خلال 24 ساعة.</span>
                        </div>
                      ) : !isWarrantyClaimFormOpen ? (
                        <button
                          type="button"
                          onClick={() => setIsWarrantyClaimFormOpen(true)}
                          className="bg-emerald-600 hover:bg-emerald-705 text-white font-black text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer ml-auto"
                        >
                          <span>🔧</span>
                          <span>{isEn ? 'Submit Maintenance Claim' : 'تقديم طلب صيانة طارئ أو مطالبة بالضمان الفعلي للوحدة'}</span>
                        </button>
                      ) : (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          setWarrantyClaimSuccess(true);
                          setTimeout(() => {
                            setWarrantyClaimSuccess(false);
                            setIsWarrantyClaimFormOpen(false);
                            setWarrantyClaimProblem('');
                            setWarrantyClaimNotes('');
                          }, 5000);
                        }} className="bg-white p-4.5 rounded-xl border border-emerald-200 mt-2 space-y-3 shadow-xs">
                          <h4 className="font-extrabold text-xs text-gray-800 border-b pb-2 flex items-center gap-1.5 justify-end">
                            <span>تقديم بلاغ صيانة طارئ تحت مظلة الضمان الفعلي</span>
                            <span>🔧</span>
                          </h4>
                          <div className="grid grid-cols-1 gap-3.5 text-right font-sans">
                            <div className="space-y-1">
                              <label className="block text-[10.5px] font-extrabold text-gray-600">{isEn ? 'Problem Description' : 'وصف المشكلة الفنية الطارئة بالوحدة:'}</label>
                              <textarea
                                required
                                value={warrantyClaimProblem}
                                onChange={e => setWarrantyClaimProblem(e.target.value)}
                                placeholder={isEn ? 'Repair leakage or floor boards...' : 'يرجى كتابة المشكلة بدقة (مثال: تسرب مياه تحت حوض دورة المياه أو شروخ بالجبسيوم بورد)...'}
                                className="w-full p-2.5 border border-gray-200 text-xs rounded-lg outline-none focus:border-emerald-500 min-h-[50px] text-right font-semibold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10.5px] font-extrabold text-gray-655">{isEn ? 'Attach Photo (Optional)' : 'أرفق صورة للأعطال والتسريب إن وجد (اختياري):'}</label>
                              <div className="border border-dashed border-gray-250 bg-gray-55 p-3 rounded-lg text-center cursor-pointer text-[10px] text-gray-405 font-bold hover:bg-gray-100 transition-all">
                                📷 {isEn ? 'Drop photos here or click' : 'اسحب الصور وافلتها هنا لتسهيل المعاينة الفورية للأعطال'}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10.5px] font-extrabold text-gray-600">{isEn ? 'Additional Notes' : 'مواعيد الزيارة الهندسية المفضلة أو ملاحظات إضافية للمكلف بالصيانة:'}</label>
                              <input
                                type="text"
                                value={warrantyClaimNotes}
                                onChange={e => setWarrantyClaimNotes(e.target.value)}
                                placeholder={isEn ? 'Best visit times' : 'مثال: الموعد المفضل يوم الخميس مساءً أو بالتواصل التليفوني المباشر...'}
                                className="w-full p-2.5 border border-gray-200 text-xs rounded-lg outline-none focus:border-emerald-500 text-right font-semibold"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 justify-end pt-2 font-sans">
                            <button
                              type="button"
                              onClick={() => setIsWarrantyClaimFormOpen(false)}
                              className="px-4 py-2 bg-gray-150 text-gray-650 hover:bg-gray-200 rounded-lg text-xs font-bold"
                            >
                              {isEn ? 'Cancel' : 'إلغاء'}
                            </button>
                            <button
                              type="submit"
                              className="px-4.5 py-2 bg-emerald-600 text-white hover:bg-emerald-705 rounded-lg text-xs font-black transition-all"
                            >
                              {isEn ? 'Submit Claim' : 'تأكيد وإرسال بلاغ الصيانه بالضمان 🚀'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                ) : currentRequestStatus === 'WAITING_FOR_INSPECTION' ? (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 border-2 border-amber-200/60 rounded-2xl p-5 shadow-xs space-y-4 animate-fade-in text-right font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 text-right w-full sm:w-auto">
                        <span className="text-2xl mt-0.5 shrink-0 select-none">⏳</span>
                        <div className="text-right">
                          <h3 className="font-extrabold text-sm text-amber-850">
                            {isEn ? 'Agreement Under Technical Auditing & Structural Inspection' : 'الطلب قيد المراجعة الفنية والمعاينة الميدانية ومطابقة المقاسات 🛠️'}
                          </h3>
                          <p className="text-[10.5px] text-amber-750/95 leading-relaxed mt-1 font-bold font-sans">
                            {isEn 
                              ? 'Your contract and chosen decorator bid have been drafted. A platform engineer is scheduled to perform structural field inspections.' 
                              : 'تنبيه مهم: تم اختيار عرض الشركة الأنسب ومسودة العقد قيد التجهيز. طلبكم الآن بانتظار إجراء مشرف شطبها الفني للمعاينة الميدانية ومطابقة مخططات الكروكي والقياسات هندسيًا للاعتماد الفوري وبدء التشطيب الميداني.'}
                          </p>
                        </div>
                      </div>
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] px-3.5 py-1.5 rounded-xl font-extrabold shadow-3xs text-center shrink-0 select-none w-full sm:w-auto mt-2 sm:mt-0 font-sans">
                        ⚙️ {isEn ? 'Inspecting Site' : 'جاري الفحص الميداني'}
                      </span>
                    </div>
                  </div>
                ) : (currentRequestStatus === 'PENDING_REVIEW' || currentRequestStatus === 'UNDER_TECHNICAL_REVIEW' || currentRequestStatus === 'SUBMITTED') ? (
                  <div className="bg-[#FAFDFC] border border-[#2B4D89]/15 rounded-2xl p-5 shadow-xs space-y-4 animate-fade-in text-right font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/60 to-indigo-50/20 p-4.5 rounded-xl border border-[#2B4D89]/15">
                      <div className="flex items-center gap-2.5 text-right w-full sm:w-auto">
                        <span className="text-2.5xl mt-0.5 shrink-0 select-none animate-bounce">🔍</span>
                        <div className="text-right">
                          <h3 className="font-extrabold text-[#2B4D89] text-sm">
                            {isEn ? 'Request Under Technical Auditing & Review' : '🔍 تحت المراجعة والموافقة الفنية من شطبها'}
                          </h3>
                          <p className="text-[10.5px] text-gray-500 leading-relaxed mt-1 font-bold">
                            {isEn 
                              ? 'Your submitted request details and CAD drawings are currently being reviewed technically for area matching & safety validation before going public.' 
                              : 'يرجى الانتظار: تم استلام الطلب وبانتظار المراجعة والتدقيق الفني من إدارة شطبها للتحقق ومطابقة الكروكيات، ولن يتم إرساله للشركات وتلقي عروض الأسعار إلا بعد الموافقة الفنية المباشرة وتعيين المشرف.'}
                          </p>
                        </div>
                      </div>
                      <span className="bg-[#2B4D89]/10 text-[#2B4D89] text-[9.5px] px-3.5 py-1.5 rounded-lg font-black shrink-0 text-center border border-[#2B4D89]/20 select-none animate-pulse w-full sm:w-auto mt-2 sm:mt-0 font-sans">
                        ⚙️ {isEn ? 'Under Technical Review' : 'قيد المراجعة الفنية الفورية'}
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-100 text-right text-[10.5px] text-amber-850 font-bold leading-normal font-sans">
                      ⚠️ حالة المناقصة الحالية: تحت المراجعة الفنية والموافقة من شطبها (مغلقة مؤقتاً وبانتظار اعتماد الأدمن. عند الموافقة سيتم تفعيل المناقصة وفتح باب الاكتتاب واستقبال عروض الأسعار التنافسية فورياً).
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 space-y-6 text-right font-sans">
                    <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-right">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block font-mono">
                        Technical Specs & Architectural Parameters
                      </span>
                      <h3 className="text-sm font-black text-gray-800 flex items-center gap-1.5 justify-end font-sans">
                        <span>🏡</span>
                        <span>تجهيز الوحدة والمواصفات الفنية للطلب والمعاينة</span>
                      </h3>
                    </div>

                    {/* Bento Grid layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-right">
                      
                      {/* LEFT BENTO BLOCK: Info Cards Groups */}
                      <div className="lg:col-span-8 space-y-5">
                        
                        {/* المواصفات الأساسية وتوزيع المساحات بباقة بطاقات شبكية متكاملة ومحترفة */}
                        <div className="bg-gradient-to-l from-slate-50 to-gray-50/60 p-4 rounded-2xl border border-gray-150 space-y-3.5 text-right font-sans">
                          <div className="flex items-center justify-between border-b border-gray-200/50 pb-2">
                            <span className="text-[10px] text-[#2B4D89] font-black bg-[#2B4D89]/10 px-2 py-0.5 rounded-md font-sans">8 معايير فنية</span>
                            <h4 className="text-xs font-black text-[#2B4D89] flex items-center gap-1.5 justify-end">
                              <span>المواصفات العقارية والهندسية للوحدة</span>
                              <span className="text-xs">🏠</span>
                            </h4>
                          </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-right font-semibold">
                          {/* نوع العقار */}
                          <div className="bg-white p-2.5 rounded-xl border border-gray-200/65 shadow-3xs flex items-center gap-2.5 transition-all hover:border-blue-200">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 font-bold shrink-0 text-md">
                              🏢
                            </div>
                            <div className="space-y-0.5 leading-none">
                              <span className="text-[9px] text-gray-400 block font-bold leading-normal">نوع العقار</span>
                              <span className="text-xs text-gray-800 font-extrabold">{selectedRequest.unitType}</span>
                            </div>
                          </div>
                          
                          {/* الموقع الجغرافي */}
                          <div className="bg-white p-2.5 rounded-xl border border-gray-200/65 shadow-3xs flex items-center gap-2.5 transition-all hover:border-red-200">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700 font-bold shrink-0 text-md">
                              📍
                            </div>
                            <div className="space-y-0.5 leading-none">
                              <span className="text-[9px] text-gray-400 block font-bold leading-normal">الموقع</span>
                              <span className="text-xs text-slate-800 font-extrabold">{selectedRequest.city}</span>
                            </div>
                          </div>

                          {/* المساحة الكلية */}
                          <div className="bg-white p-2.5 rounded-xl border border-gray-200/65 shadow-3xs flex items-center gap-2.5 transition-all hover:border-indigo-200">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold shrink-0 text-md">
                              📐
                            </div>
                            <div className="space-y-0.5 leading-none">
                              <span className="text-[9px] text-gray-400 block font-bold leading-normal">المساحة الكلية</span>
                              <span className="text-xs text-indigo-950 font-black font-mono">{selectedRequest.area} م²</span>
                            </div>
                          </div>

                          {/* مستوى التشطيب المطلوب */}
                          <div className="bg-white p-2.5 rounded-xl border border-gray-200/65 shadow-3xs flex items-center gap-2.5 transition-all hover:border-emerald-200">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-800 font-bold shrink-0 text-md">
                              ⭐
                            </div>
                            <div className="space-y-0.5 leading-none">
                              <span className="text-[9px] text-gray-400 block font-bold leading-normal">درجة التشطيب</span>
                              <span className="text-xs text-emerald-850 font-extrabold">{selectedRequest.finishingLevel}</span>
                            </div>
                          </div>

                          {/* غرف النوم */}
                          <div className="bg-white p-2.5 rounded-xl border border-gray-200/65 shadow-3xs flex items-center gap-2.5 transition-all hover:border-amber-200">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 font-bold shrink-0 text-md">
                              🛌
                            </div>
                            <div className="space-y-0.5 leading-none">
                              <span className="text-[9px] text-gray-400 block font-bold leading-normal">غرف النوم</span>
                              <span className="text-xs text-gray-800 font-extrabold">{selectedRequest.bedroomsCount ?? 0} {isEn ? 'Bedrooms' : 'غرف'}</span>
                            </div>
                          </div>

                          {/* الحمامات */}
                          <div className="bg-white p-2.5 rounded-xl border border-gray-200/65 shadow-3xs flex items-center gap-2.5 transition-all hover:border-cyan-200">
                            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-800 font-bold shrink-0 text-md">
                              🚿
                            </div>
                            <div className="space-y-0.5 leading-none">
                              <span className="text-[9px] text-gray-400 block font-bold leading-normal">حمامات رئيسية</span>
                              <span className="text-xs text-gray-800 font-extrabold">{selectedRequest.bathroomsCount ?? 0} {isEn ? 'Baths' : 'حمامات'}</span>
                            </div>
                          </div>

                          {/* المطبخ */}
                          <div className="bg-white p-2.5 rounded-xl border border-gray-200/65 shadow-3xs flex items-center gap-2.5 transition-all hover:border-orange-200">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-700 font-bold shrink-0 text-md">
                              🍳
                            </div>
                            <div className="space-y-0.5 leading-none">
                              <span className="text-[9px] text-gray-400 block font-bold leading-normal">المطابخ المجهزة</span>
                              <span className="text-xs text-gray-800 font-extrabold">{selectedRequest.kitchensCount ?? 0} {isEn ? 'Kitchen' : 'مطبخ'}</span>
                            </div>
                          </div>

                          {/* الميزانية المصدرة للمشروع */}
                          <div className="bg-white p-2.5 rounded-xl border border-gray-200/65 shadow-3xs flex items-center gap-2.5 transition-all hover:border-slate-300">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-800 font-bold shrink-0 text-md">
                              💰
                            </div>
                            <div className="space-y-0.5 leading-none">
                              <span className="text-[9px] text-gray-400 block font-bold leading-normal">الميزانية المصدرة</span>
                              <span className="text-xs text-gray-900 font-black font-mono">{(selectedRequest.budget || 0).toLocaleString()} ج.م</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sub Grid 3: الخدمات الإضافية */}
                      <div className="bg-gray-50/60 p-4.5 rounded-2xl border border-gray-150 space-y-3 text-right">
                        <h4 className="text-xs font-black text-[#2B4D89] flex items-center gap-1.5 justify-end">
                          <span>الخدمات الميدانية الإضافية والمخططات المرفقة للطلب</span>
                          <span className="text-xs">👷</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-right font-semibold text-xs">
                          {/* Oversight card */}
                          <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-3xs flex items-center justify-between gap-2 text-right">
                            <span className={`text-[9.5px] px-2.5 py-1 rounded-full font-black ${
                              selectedRequest.requireInspector !== false 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-150 animate-pulse' 
                                : 'bg-amber-50 text-amber-800 border border-amber-150'
                            }`}>
                              {selectedRequest.requireInspector !== false ? 'مفعل بالطلب' : 'غير نشط'}
                            </span>
                            <div className="text-right font-sans">
                              <span className="text-[10px] text-gray-400 block font-bold">إشراف "شطبها" الميداني</span>
                              <span className="text-xs font-black text-gray-800">🛡️ تأمين جودة التشطيب بالضمان المستقل</span>
                            </div>
                          </div>

                          {/* Drawings attachment card */}
                          <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-3xs flex items-center justify-between gap-2 text-right">
                            <div className="flex flex-wrap gap-1">
                              {selectedRequest.blueprints && selectedRequest.blueprints.length > 0 ? (
                                <span className="bg-blue-50 text-blue-900 text-[8.5px] font-black py-1 px-2.5 rounded border border-blue-200 max-w-[150px] truncate" title={selectedRequest.blueprints[0]}>
                                  📄 {selectedRequest.blueprints[0]}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[9px] font-bold">لم ترفق كروكيات</span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-gray-400 block font-bold">كروكي أو مخطط الوحدة</span>
                              <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                                <span>📎 الرسوم الهندسية</span>
                              </span>
                            </div>
                          </div>

                          {/* 🧾 Bill Breakdown Card for coupon inspection details */}
                          {selectedRequest.requireInspector !== false && (
                            <div className="col-span-1 sm:col-span-2 bg-emerald-50/20 p-4.5 rounded-xl border border-emerald-100/60 space-y-2.5 text-right font-sans">
                              <h5 className="text-[11px] font-black text-emerald-900 flex items-center gap-1 pb-1.5 border-b border-emerald-100/30">
                                <span>🧾</span> {isEn ? 'Supervision Fee Summary & Promo Code Discount' : 'كشف حساب الإشراف وعقد مراجعة الكوبون المالي'}
                              </h5>
                              <div className="text-xs space-y-2 text-gray-750 font-semibold leading-normal">
                                <div className="flex justify-between items-center text-gray-700">
                                  <span>{isEn ? 'Supervision Cost:' : 'الإشراف الهندسي:'}</span>
                                  <span className="font-mono text-gray-800 font-bold">
                                    {(selectedRequest.originalInspectionFee || (selectedRequest.area * 100)).toLocaleString()} {isEn ? 'EGP' : 'جنيه'}
                                  </span>
                                </div>
                                
                                {selectedRequest.usedPromoCode && (
                                  <>
                                    <div className="flex justify-between items-center text-gray-700">
                                      <span>{isEn ? 'Used Promo Code:' : 'كود الخصم:'}</span>
                                      <span className="bg-indigo-50 text-indigo-900 px-2.5 py-0.5 rounded-lg border border-indigo-150 font-mono text-[9px] font-black">
                                        {selectedRequest.usedPromoCode}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-700 bg-emerald-50/50 p-1 rounded-md">
                                      <span>{isEn ? 'Discount Applied:' : 'قيمة الخصم:'}</span>
                                      <span className="font-mono font-black">
                                        -{(selectedRequest.promoDiscountAmount || 0).toLocaleString()} {isEn ? 'EGP' : 'جنيه'}
                                      </span>
                                    </div>
                                  </>
                                )}
                                
                                <div className="flex justify-between items-center pt-2.5 border-t border-emerald-150/40 text-xs font-black text-emerald-950">
                                  <span>{isEn ? 'Amount Due:' : 'المبلغ المستحق:'}</span>
                                  <span className="font-mono text-emerald-800 text-sm bg-emerald-200/20 px-3 py-1 rounded-lg">
                                    {(selectedRequest.finalInspectionFee !== undefined ? selectedRequest.finalInspectionFee : (selectedRequest.area * 100)).toLocaleString()} {isEn ? 'EGP' : 'جنيه'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sub Grid 3.5: تقرير المعاينة الميدانية الفنية */}
                      {selectedRequest.inspectionReport && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50/20 p-4.5 rounded-2xl border-2 border-amber-200 shadow-sm space-y-2.5 text-right font-sans animate-fade-in">
                          <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/50">
                            <span className="text-[9px] bg-amber-600 text-white font-black px-2.5 py-1 rounded-full font-sans">
                              ✓ {isEn ? 'VERIFIED REPORT' : 'تقرير معاينة معتمد'}
                            </span>
                            <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5 justify-end font-sans">
                              <span>{isEn ? 'Verification & Field Inspection Report' : 'تقرير المعاينة الميدانية والتدقيق الإنشائي للموقع'}</span>
                              <span className="text-xs">🕵️</span>
                            </h4>
                          </div>
                          <div className="text-xs text-amber-950 leading-relaxed font-semibold bg-white/70 p-3.5 rounded-xl border border-amber-100/80 shadow-3xs whitespace-pre-wrap font-sans">
                            {selectedRequest.inspectionReport}
                          </div>
                        </div>
                      )}

                      {/* Sub Grid 4: وصف المشروع والخامات سيكا والسويدي وجوتن */}
                      <div className="bg-gray-50/60 p-4.5 rounded-2xl border border-gray-150 space-y-2.5 text-right font-sans">
                        <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/50">
                          <button
                            type="button"
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="text-[#2B4D89] font-black text-[10.5px] hover:underline flex items-center gap-1 cursor-pointer font-sans"
                          >
                            <span>{isDescriptionExpanded ? 'إخفاء التفاصيل والماتريال ▲' : 'عرض التفاصيل الكاملة وتفضيلات الخامات المطلوبة ▼'}</span>
                          </button>
                          <h4 className="text-xs font-black text-[#2B4D89] flex items-center gap-1.5 justify-end">
                            <span>صندوق وصف المشروع والخامات المعتمدة بالكامل</span>
                            <span className="text-xs">📋</span>
                          </h4>
                        </div>
                        
                        <div className="text-xs text-gray-755 leading-relaxed text-right font-medium">
                          <p className="bg-white p-3.5 rounded-xl border border-gray-200/70 font-semibold mb-2 text-right font-sans font-semibold">
                            {selectedRequest.notes || 'أحتاج لتجهيز الشقة بالكامل مع عزل حراري ومائي للحمامات والمطابخ، مع تصميم إضاءة مخفية في الريسبشن وعزل سيكا، والاعتماد بالكامل على خامات وموردين معتمدين بالمنصة.'}
                          </p>
                          
                          {(isDescriptionExpanded || currentRequestStatus === 'PENDING_REVIEW' || currentRequestStatus === 'UNDER_TECHNICAL_REVIEW' || currentRequestStatus === 'SUBMITTED') && (
                            <div className="space-y-3 mt-3 p-3.5 bg-indigo-50/45 rounded-xl border border-[#2B4D89]/10 animate-fade-in text-right">
                              <span className="text-[11px] text-indigo-950 font-black block border-b border-indigo-200/40 pb-1.5 font-sans">📌 تفضيلات ونوعية الخامات المعتمدة للمهندسين والمقاولين بالمشروع:</span>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 text-right font-sans font-semibold">
                                
                                {/* الكهرباء */}
                                <div className="bg-amber-50/45 hover:bg-amber-50/80 p-3 rounded-xl border border-amber-200/60 flex items-start gap-2.5 transition-all animate-fade-in">
                                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 font-bold text-center flex items-center justify-center shrink-0 text-base shadow-3xs font-semibold font-sans">
                                    ⚡
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <h5 className="text-[11px] font-black text-amber-955 font-sans">السويدي للكابلات</h5>
                                      <span className="text-[8px] text-amber-800 bg-amber-100 px-1 py-0.2 rounded font-black font-sans font-semibold">كهرباء</span>
                                    </div>
                                    <p className="text-[10px] text-gray-655 font-bold leading-normal font-sans">
                                      أسلاك السويدي الكهربائية المعتمدة الأصلية (Elsewedy) لضمان الأمان والتحمل الأقصى لمختلف الأحمال المنزلية.
                                    </p>
                                  </div>
                                </div>

                                {/* الدهانات */}
                                <div className="bg-sky-50/45 hover:bg-sky-50/80 p-3 rounded-xl border border-sky-200/60 flex items-start gap-2.5 transition-all animate-fade-in font-sans">
                                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-700 font-bold text-center flex items-center justify-center shrink-0 text-base shadow-3xs font-semibold font-sans font-semibold">
                                    🎨
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <h5 className="text-[11px] font-black text-sky-955 font-sans">دهانات جوتن</h5>
                                      <span className="text-[8px] text-sky-850 bg-sky-100 px-1 py-0.2 rounded font-black font-sans font-semibold font-semibold">دهانات</span>
                                    </div>
                                    <p className="text-[10px] text-gray-655 font-bold leading-normal font-sans">
                                      معجون وتأسيس ودهانات جوتن فينوماستيك نصف لمعة لسهولة التنظيف والمقاومة العالية للرطوبة وسنين الاستخدام.
                                    </p>
                                  </div>
                                </div>

                                {/* العزل */}
                                <div className="bg-teal-50/45 hover:bg-teal-50/80 p-3 rounded-xl border border-teal-200/60 flex items-start gap-2.5 transition-all animate-fade-in font-sans">
                                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-850 font-bold text-center flex items-center justify-center shrink-0 text-base shadow-3xs font-semibold font-sans">
                                    💧
                                  </div>
                                  <div className="space-y-1 col-span-1">
                                    <div className="flex items-center gap-1.5 font-sans">
                                      <h5 className="text-[11px] font-black text-teal-955 font-sans font-semibold">عزل سيكا هيدرو</h5>
                                      <span className="text-[8px] text-teal-850 bg-teal-100 px-1 py-0.2 rounded font-black font-sans font-semibold font-semibold">عزل مائي</span>
                                    </div>
                                    <p className="text-[10px] text-gray-655 font-bold leading-normal font-sans">
                                      عزل أسمنتي ماركة سيكا (Sika Cement) للحمامات والمطابخ لضمان الحماية الهندسية التامة ضد أي تسريبات.
                                    </p>
                                  </div>
                                </div>

                                {/* السباكة */}
                                <div className="bg-emerald-50/45 hover:bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/60 flex items-start gap-2.5 transition-all animate-fade-in font-sans">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-800 font-bold text-center flex items-center justify-center shrink-0 text-base shadow-3xs font-semibold font-sans">
                                    🔧
                                  </div>
                                  <div className="space-y-1 font-sans col-span-1">
                                    <div className="flex items-center gap-1.5 font-sans">
                                      <h5 className="text-[11px] font-black text-emerald-955 font-sans font-semibold font-semibold">مواسير الشريف</h5>
                                      <span className="text-[8px] text-emerald-850 bg-emerald-100 px-1 py-0.2 rounded font-black font-sans font-semibold font-semibold font-semibold">سباكة</span>
                                    </div>
                                    <p className="text-[10px] text-gray-655 font-bold leading-normal font-sans font-semibold">
                                      مواسير معتمدة ماركة الشريف أو أكواثيرم مع اختبار الضغط المعتمد والضمان الطويل من الشركة المصنعة.
                                    </p>
                                  </div>
                                </div>

                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* RIGHT BENTO BLOCK: Image, Quick Parameters & Technical Supervisor */}
                    <div className="lg:col-span-4 space-y-5 text-right">
                      
                      {/* Unit Preview Image Card */}
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm bg-gray-55 border border-gray-200 relative">
                        <img 
                          src={getUnitPreviewUrl(selectedRequest.unitType)} 
                          alt="Layout interior"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 right-3 bg-black/55 text-white text-[10px] font-bold px-2 py-1 rounded">
                          {isEn ? 'Model View Reference' : 'صورة الطراز المفروغ للوحدة'}
                        </div>
                      </div>

                      {/* 👷 FOURTH SECTION: TECHNICAL SUPERVISOR CARD */}
                      <div className="bg-gradient-to-br from-slate-50 to-blue-50/20 rounded-2xl p-4.5 border border-[#2B4D89]/15 shadow-3xs space-y-3.5 text-right font-sans">
                        <div className="border-b border-gray-200/70 pb-2.5">
                          <h4 className="text-xs font-black text-gray-800 flex items-center justify-end gap-1.5 flex-row-reverse">
                            <span className="text-xs text-[#2B4D89]">👷</span>
                            <span>{isEn ? 'Shattabha Independent QA Inspector' : 'المشرف الفني المسؤول من شطبها'}</span>
                          </h4>
                        </div>

                        {(currentRequestStatus === 'ACTIVE' || currentRequestStatus === 'COMPLETED') ? (
                          <div className="space-y-3 animate-fade-in text-right">
                            {/* Profile details - Avatar on the right, text details on the left */}
                            <div className="flex items-center gap-3 justify-start text-right" style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                              <div className="w-11 h-11 rounded-full bg-indigo-100 border-2 border-[#2B4D89]/20 flex items-center justify-center text-lg shadow-3xs text-center select-none shrink-0">
                                👨‍💼
                              </div>
                              <div className="text-right flex-1">
                                <h5 className="text-xs font-black text-[#2B4D89] flex items-center gap-1 justify-start text-right" style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                                  <span className="text-blue-500 text-[10px] font-black" title="مهندس معتمد">✓</span>
                                  <span>{isEn ? 'Eng. Karim Abdelaziz El-Saadany' : 'م. كريم عبد العزيز السعدني'}</span>
                                </h5>
                                <p className="text-[9px] text-[#0F7453] font-bold">
                                  {isEn ? 'Head of Engineering Inspections at Shattabha' : 'رئيس فريق المعاينات الهندسية بشطبها'}
                                </p>
                              </div>
                            </div>

                            {/* Stats details & schedule - perfectly formatted Right-to-Left (label first, value next) */}
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-[#2B4D89]/10 space-y-2 text-[10.5px] text-gray-550 font-bold leading-normal">
                              {/* 1. Contact number */}
                              <div className="flex items-center justify-between flex-row-reverse text-right">
                                <span className="text-gray-450 font-sans text-right">
                                  {isEn ? 'Direct Contact No:' : 'رقم التواصل الفوري:'}
                                </span>
                                <span className="font-mono text-[#2B4D89] tracking-wide" dir="ltr">
                                  +20 122 499 1812
                                </span>
                              </div>
                              <div className="h-px bg-gray-150 dark:bg-slate-800"></div>

                              {/* 2. Assignment Date */}
                              <div className="flex items-center justify-between flex-row-reverse text-right">
                                <span className="text-gray-450 font-sans text-right">
                                  {isEn ? 'Inspector Assigned:' : 'تاريخ تعيين المشرف:'}
                                </span>
                                <span className="text-gray-800 dark:text-slate-200 font-mono">
                                  2026-05-10
                                </span>
                              </div>
                              <div className="h-px bg-gray-150 dark:bg-slate-800"></div>

                              {/* 3. Executed visits */}
                              <div className="flex items-center justify-between flex-row-reverse text-right">
                                <span className="text-gray-450 font-sans text-right">
                                  {isEn ? 'Completed Audits:' : 'الزيارات المنفذة:'}
                                </span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-sans">
                                  {isEn ? '4 quality matched audits' : '4 زيارات مطابقة منجزة'}
                                </span>
                              </div>
                              <div className="h-px bg-gray-150 dark:bg-slate-800"></div>

                              {/* 4. Next visit */}
                              <div className="flex items-center justify-between flex-row-reverse text-right">
                                <span className="text-gray-450 font-sans text-right">
                                  {isEn ? 'Next Site Audit:' : 'الزيارة القادمة للموقع:'}
                                </span>
                                <span className="text-indigo-900 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded text-[9.5px]">
                                  {isEn ? 'Next Sunday (11:00 AM)' : 'الأحد القادم (الساعة ١١:٠٠ صباحًا)'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-right space-y-2 py-1.5 leading-relaxed">
                            <p className="text-[10px] text-[#2B4D89] dark:text-blue-300 font-black">
                              {isEn 
                                ? '⏳ Supervisor profile & site quality reports will activate immediately after signing the contract and beginning on-site construction.' 
                                : '⏳ سيتم تفعيل بيانات المشرف الفني المسؤول ومتابعة زيارات مطابقة جودة التنفيذ فور توقيع العقد الهندسي المعتمد وبدء مرحلة التنفيذ الميدانية.'}
                            </p>
                            <p className="text-[8.5px] text-gray-450">
                              {isEn 
                                ? '* Quality audits, material sample approvals, and independent verification logs by Shattabha engineers begin automatically in active project state to secure complete escort.' 
                                : '* ملاحقة الإشراف ومراجعة بنود وعينات الخامات المستلمة والتقارير الميدانية من مهندسي "شطبها" تبدأ مباشرة بعد الانتقال لحالة التعاقد الفعلي لتوفير أقصى حماية وجودة لاستثمارك.'}
                            </p>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                </div>
              )}

                {/* BIDS / OFFERS OR ACTIVE CONSTRUCTION TRACKING */}
                <div className="space-y-5">
                  {(selectedRequest.status === 'ACTIVE' || selectedRequest.status === 'DELAYED') ? (
                    <div className="bg-white rounded-3xl border border-emerald-900/10 shadow-sm p-6 space-y-6">
                      
                      {/* DELAY WARNING BANNER */}
                      {selectedRequest.status === 'DELAYED' && (
                        <div className="bg-rose-50 border border-rose-300 rounded-3xl p-5 text-right font-sans flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">⚠️</span>
                            <div>
                              <h4 className="font-extrabold text-[#991B1B] text-sm">
                                {isEn ? 'Contractor Delay Alert! • Penalty Active' : 'إنذار تأخير المقاول • تفعيل الغرامة اليومية'}
                              </h4>
                              <p className="text-xs text-rose-800 mt-0.5">
                                {isEn 
                                  ? `The contractor has breached milestone deadlines. Accumulated delay is ${selectedRequest.delayDays || 0} days.` 
                                  : `فشل المقاول في تسليم المراحل في مواعيدها المحددة. إجمالي مدة التأخر الفعلي للمشروع هو ${selectedRequest.delayDays || 0} يوم.`}
                              </p>
                              <p className="text-[10px] text-rose-600 font-semibold mt-1">
                                {isEn 
                                  ? `Daily Delay Penalty of ${selectedRequest.delayFine || 500} EGP is automatically subtracted from contractor receivables.` 
                                  : `يتم حسم الغرامة اليومية المتفق عليها بقيمة (${selectedRequest.delayFine || 500} ج.م/يومياً) تلقائياً من دفعات المقاول القادمة عند الصرف المالي.`}
                              </p>
                            </div>
                          </div>
                          <div className="bg-rose-600 text-white font-mono font-black text-xs px-4 py-2 rounded-2xl flex flex-col items-center justify-center min-w-[125px] shrink-0">
                            <span>{isEn ? 'Deducted Fine' : 'إجمالي المخصوم'}</span>
                            <span className="text-sm mt-0.5 font-bold">-{ (selectedRequest.accumulatedDelayFine || 0).toLocaleString() } ج.م</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Section Title & Swipe Navigation Toggle */}
                      <div className="border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                            <h3 className="font-black text-base text-[#113C30] flex items-center gap-2">
                              <span>🛡️</span> {isEn ? 'Milestone Escrow Protection & On-Site Supervision' : 'منظومة حماية الدفعات والإشراف الميداني مرحلة بمرحلة'}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {isEn ? 'Impartial inspectors verify all specs on-site. Milestone funds cannot be released to the contractor unless approved by your verified inspector.' : 'يقوم مهندسو "شطبها" الميدانيين بفحص المواصفات والخامات المعتمدة بدقة. لا يتم الإفراج عن الدفعة المالية للمرحلة إلا بعد قبولك واعتمادك الفني هنا!'}
                          </p>
                        </div>
                        
                        {/* Swipe Mode Toggle Button */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200 shrink-0 no-print">
                          <button
                            type="button"
                            onClick={() => setClientViewMode('SWIPE')}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all ${
                              clientViewMode === 'SWIPE' 
                                ? 'bg-[#2B4D89] text-white shadow-xs' 
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                          >
                            <span>👈👉</span>
                            <span>{isEn ? 'Swipe Mode' : 'عرض السحب التفاعلي'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setClientViewMode('LIST')}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all ${
                              clientViewMode === 'LIST' 
                                ? 'bg-[#2B4D89] text-white shadow-xs' 
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                          >
                            <span>📋</span>
                            <span>{isEn ? 'Classic List' : 'عرض القائمة'}</span>
                          </button>
                        </div>
                      </div>

                      {/* 📊 Timeline progression chart for enhanced transparency */}
                      <ProjectProgressChart 
                        stages={stages} 
                        requestId={selectedRequest.id} 
                        isEn={isEn} 
                      />

                      {/* 🎞️ Real-time Interactive "Project Snapshot" (العرض التقديمي للمشروع) */}
                      {(() => {
                        const activeStages = stages.filter(s => s.requestId === selectedRequest.id);
                        if (activeStages.length === 0) return null;

                        const selectedSnapshotStage = activeStages.find(s => s.id === snapshotSelectedStageId) || activeStages[0];
                        const overallProgress = Math.round(activeStages.reduce((sum, s) => sum + s.progress, 0) / (activeStages.length || 1));

                        // Define colors for states
                        const stateColors = {
                          completed: '#10B981', // Emerald
                          active: '#3B82F6',    // Electric Blue
                          pending: '#94A3B8',   // Slate
                          selected: '#F59E0B'   // Amber
                        };

                        // Helper to map fallback images
                        const getSnapshotStageImg = (stgName: string, type: 'before' | 'after'): string => {
                          const name = (stgName || '').toLowerCase();
                          if (name.includes('سباك') || name.includes('صرف') || name.includes('plumb')) {
                            return type === 'before' 
                              ? 'https://images.unsplash.com/photo-1542013936693-8848e574047a?auto=format&fit=crop&w=600&q=80'
                              : 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80';
                          } else if (name.includes('كهرب') || name.includes('إنار') || name.includes('elect')) {
                            return type === 'before' 
                              ? 'https://images.unsplash.com/photo-1558224494-ef8b2175a501?auto=format&fit=crop&w=600&q=80'
                              : 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80';
                          } else if (name.includes('محار') || name.includes('بياض') || name.includes('plast')) {
                            return type === 'before' 
                              ? 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80'
                              : 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80';
                          } else if (name.includes('أرضي') || name.includes('سرام') || name.includes('tile') || name.includes('floor')) {
                            return type === 'before' 
                              ? 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=600&q=80'
                              : 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80';
                          } else {
                            // Default / الدهانات والتشطيب
                            return type === 'before' 
                              ? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
                              : 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80';
                          }
                        };

                        const selectedBeforeImg = selectedSnapshotStage?.beforeImages?.[0] || getSnapshotStageImg(selectedSnapshotStage?.name || '', 'before');
                        const selectedAfterImg = selectedSnapshotStage?.afterImages?.[0] || getSnapshotStageImg(selectedSnapshotStage?.name || '', 'after');

                        // Recharts pie data setup
                        const pieData = activeStages.map((stg) => {
                          const isSelected = selectedSnapshotStage?.id === stg.id;
                          let finalColor = stateColors.pending;
                          if (stg.progress === 100 || stg.status === 'APPROVED' || stg.status === 'CLOSED') {
                            finalColor = stateColors.completed;
                          } else if (stg.progress > 0) {
                            finalColor = stateColors.active;
                          }

                          return {
                            id: stg.id,
                            name: stg.name,
                            value: 10, // equal weights
                            progress: stg.progress,
                            color: isSelected ? stateColors.selected : finalColor,
                            isSelected
                          };
                        });

                        return (
                          <div id="project-snapshot-section" className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 md:p-6 text-white text-right font-sans mb-6 shadow-2xl space-y-5 animate-fade-in no-print">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 bg-transparent">
                              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9.5px] font-black px-2.5 py-1 rounded-full animate-pulse font-sans">
                                {isEn ? 'LIVE SNAPSHOT ACTIVE' : 'العرض التقديمي المباشر نشط 🎞️'}
                              </span>
                              <div className="text-right">
                                <h3 className="font-extrabold text-sm sm:text-base text-slate-100 flex items-center justify-end gap-2">
                                  <span>🚀</span>
                                  <span>{isEn ? 'Project Snapshot & Visual Progress' : 'العرض التقديمي للمشروع (Project Snapshot)'}</span>
                                </h3>
                                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                                  {isEn 
                                    ? 'A comprehensive visual progress dashboard tracking milestone completion with real before/after physical handovers.'
                                    : 'ملخص مرئي تفاعلي لكافة البنود والمراحل المدعومة برصد هندسي دقيق وفروق التأسيس والتشطيب النهائي.'}
                                </p>
                              </div>
                            </div>

                            {/* Core split layout */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                              
                              {/* Left / Right 1: Custom Pie Chart showing cumulative completion stats */}
                              <div className="md:col-span-5 bg-slate-900/60 border border-slate-800/80 p-4.5 rounded-2xl flex flex-col justify-between space-y-4">
                                <div className="text-right">
                                  <h4 className="text-xs font-black text-slate-300 flex items-center gap-1 justify-end">
                                    <span>📊</span>
                                    <span>{isEn ? 'Milestones completion' : 'نسب الإنجاز التراكمي وتوزيع الوزن'}</span>
                                  </h4>
                                  <p className="text-[9.5px] text-slate-400 mt-0.5">
                                    {isEn ? 'Click stages to change photo/monitoring reports:' : 'اضغط على بنود المقايسة للتنقل الفوري ومعاينة الفروق الهندسية:'}
                                  </p>
                                </div>

                                {/* Recharts Segmented Pie Donut representation */}
                                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={65}
                                        paddingAngle={5}
                                        dataKey="value"
                                      >
                                        {pieData.map((entry) => (
                                          <Cell 
                                            key={`cell-${entry.id}`} 
                                            fill={entry.color} 
                                            className="transition-all duration-300 cursor-pointer"
                                            onClick={() => setSnapshotSelectedStageId(entry.id)}
                                            style={{
                                              outline: 'none',
                                              transform: entry.isSelected ? 'scale(1.05)' : 'none',
                                              transformOrigin: 'center'
                                            }}
                                          />
                                        ))}
                                      </Pie>
                                      <RechartsTooltip
                                        content={({ active, payload }) => {
                                          if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                              <div className="bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-center text-[10px] space-y-1 shadow-2xl font-sans shrink-0">
                                                <p className="font-extrabold text-amber-400">{data.name}</p>
                                                <p className="font-bold text-emerald-400">{isEn ? 'Completion:' : 'نسبة الإنجاز:'} {data.progress}%</p>
                                              </div>
                                            );
                                          }
                                          return null;
                                        }}
                                      />
                                    </PieChart>
                                  </ResponsiveContainer>

                                  {/* Center metrics indicator */}
                                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
                                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">
                                      {isEn ? 'Completion' : 'نسبة الإنجاز'}
                                    </span>
                                    <span className="text-2xl font-black text-emerald-400 font-mono leading-none my-0.5">
                                      {overallProgress}%
                                    </span>
                                    <span className="text-[8px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-bold">
                                      {isEn ? 'Cumulative' : 'تراكمي'}
                                    </span>
                                  </div>
                                </div>

                                {/* Custom milestones interactive selector list */}
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                  {activeStages.map((stg) => {
                                    const isSelected = selectedSnapshotStage?.id === stg.id;
                                    let statusDot = 'bg-slate-600';
                                    if (stg.progress === 100 || stg.status === 'APPROVED' || stg.status === 'CLOSED') {
                                      statusDot = 'bg-[#10B981]';
                                    } else if (stg.progress > 0) {
                                      statusDot = 'bg-[#3B82F6] animate-pulse';
                                    }

                                    return (
                                      <button
                                        key={stg.id}
                                        type="button"
                                        onClick={() => setSnapshotSelectedStageId(stg.id)}
                                        className={`w-full p-2 rounded-xl transition-all border flex items-center justify-between text-right cursor-pointer select-none text-[10.5px] font-sans ${
                                          isSelected 
                                            ? 'bg-slate-850 border-amber-500/70 text-amber-400 shadow-md translate-x-1 sm:translate-none' 
                                            : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />
                                          <span className="truncate font-extrabold leading-tight">{stg.name}</span>
                                        </div>
                                        <span className="font-mono text-[9px] bg-slate-950/60 pb-0.5 pt-0.5 px-2 rounded-md text-slate-400 group-hover:text-white shrink-0">
                                          {stg.progress}%
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Left / Right 2: Side-By-Side Before & After Transformation Visuals */}
                              <div className="md:col-span-12 lg:col-span-7 bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="text-right">
                                    <span className="text-[9px] text-amber-400 block font-bold font-sans">
                                      {isEn ? 'ACTIVE MULTI-STAGE VISUALIZER' : 'مقارنة فنية حية (قبل وبعد التشطيب) 📐'}
                                    </span>
                                    <h4 className="font-extrabold text-white text-xs sm:text-sm mt-0.5">
                                      {selectedSnapshotStage?.name}
                                    </h4>
                                  </div>
                                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-md font-mono self-start sm:self-auto shrink-0 select-none">
                                    {isEn ? `Stage Completion: ${selectedSnapshotStage?.progress}%` : `إنجاز البند: ${selectedSnapshotStage?.progress}%`}
                                  </span>
                                </div>

                                {/* Comparison side-by-side photo cards */}
                                <div id="snapshot-before-after-grid" className="grid grid-cols-2 gap-3.5 items-stretch">
                                  {/* BEFORE GLASS CARD */}
                                  <div className="group relative rounded-xl overflow-hidden border border-slate-800/90 aspect-video flex flex-col justify-end bg-slate-950">
                                    <img 
                                      src={selectedBeforeImg} 
                                      alt="Before Finishing" 
                                      referrerPolicy="no-referrer"
                                      className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                                    
                                    <div className="relative p-2.5 text-right space-y-0.5 z-10 select-none">
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black text-rose-300 bg-rose-950/80 border border-rose-500/30 rounded-md uppercase font-sans">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                                        {isEn ? 'Before' : 'قبل العمل'}
                                      </span>
                                      <p className="text-[8.5px] text-slate-300 font-bold block pt-1 font-sans">التأسيس قبل التعديلات</p>
                                    </div>
                                  </div>

                                  {/* AFTER GLASS CARD */}
                                  <div className="group relative rounded-xl overflow-hidden border border-slate-800/90 aspect-video flex flex-col justify-end bg-slate-950">
                                    <img 
                                      src={selectedAfterImg} 
                                      alt="After Finishing" 
                                      referrerPolicy="no-referrer"
                                      className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                                    
                                    <div className="relative p-2.5 text-right space-y-0.5 z-10 select-none">
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black text-emerald-300 bg-emerald-950/85 border border-emerald-500/30 rounded-md uppercase font-sans">
                                        <span className="w-1.5 h-1.5 rounded bg-emerald-400"></span>
                                        {isEn ? 'After' : 'بعد التشطيب'}
                                      </span>
                                      <p className="text-[8.5px] text-slate-300 font-bold block pt-1 font-sans">التسليم الفعلي المعتمد</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Report Description & Quick actions */}
                                <div className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-xl space-y-2">
                                  <p className="text-[10px] text-slate-300 leading-relaxed font-bold">
                                    <span className="text-amber-400 font-sans">✏️ {isEn ? 'Field Supervisor Rapport:' : 'محضر المطابقة الفنية:'} </span>
                                    {selectedSnapshotStage?.reportText || (isEn 
                                      ? 'Technical physical handover completely checked, approved with independent seal by Shattabha technical audit board.' 
                                      : 'مرحلة خاضعة للتدقيق الهندسي المستقل التابع لـ"شطبها" ومطابقة تامة للمادة والمواصفة الفنية المتعاقد عليها مع كود الضمان المزدوج.')}
                                  </p>

                                  <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-900">
                                    <span className="text-[9px] text-slate-400 font-mono font-bold">
                                      {isEn ? 'Compiled: ' : 'تاريخ الاعتماد: '} {selectedSnapshotStage?.reportDate || '2026-06-03'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setClientSlideIndex(activeStages.indexOf(selectedSnapshotStage));
                                        setClientPresentationSelectedStageId('project-overall');
                                        setClientPresentationOpen(true);
                                      }}
                                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] sm:text-[10px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 shadow-sm font-sans"
                                    >
                                      <span>🎞️</span>
                                      <span>{isEn ? 'Launch Presentation Deck' : 'تكبير وعرض كشرائح شاشة كاملة'}</span>
                                    </button>
                                  </div>
                                </div>

                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Display of stages */}
                      {(() => {
                        const activeProjStages = stages.filter(s => s.requestId === selectedRequest.id);
                        if (activeProjStages.length === 0) {
                          return <p className="text-center text-xs text-gray-400 py-6">{isEn ? 'No items currently under tracking.' : 'لا توجد بنود تحت المتابعة حالياً.'}</p>;
                        }

                        // Ensure index bounds are safe when lists shift
                        const clampedIdx = Math.min(Math.max(0, clientActiveStageIndex), activeProjStages.length - 1);
                        
                        const handleNext = () => {
                          setClientActiveStageIndex(prev => (prev + 1) % activeProjStages.length);
                        };

                        const handlePrev = () => {
                          setClientActiveStageIndex(prev => (prev - 1 + activeProjStages.length) % activeProjStages.length);
                        };

                        if (clientViewMode === 'SWIPE') {
                          const stg = activeProjStages[clampedIdx] || activeProjStages[0];
                          const transStgName = isEn 
                            ? (stg.name === 'تأسيس السباكة والصرف' ? 'Plumbing & Drainage Setup' : 
                               stg.name === 'تأسيس الكهرباء والإنارة' ? 'Electrical & Lighting Setup' : 
                               stg.name === 'أعمال المحارة والأسقف' ? 'Plastering & Ceiling Work' : 
                               stg.name === 'الدهانات والتشطيب النهائي' ? 'Painting & Final Decoration' : stg.name) 
                            : stg.name;

                          return (
                            <div className="space-y-4">
                              {/* Gestures Navigation Instruction Info */}
                              <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100/50 rounded-2xl px-4 py-3 text-[10.5px] text-gray-500 no-print">
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

                              {/* Card slider deck container */}
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

                                {/* Swiping card itself */}
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
                                      className="border border-gray-200/80 rounded-2.5xl p-5 bg-gray-50/25 space-y-4 shadow-3xs hover:shadow-2xs transition-shadow text-right cursor-grab active:cursor-grabbing select-none relative overflow-hidden"
                                    >
                                      {/* Stage head */}
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-dashed border-gray-200">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="bg-[#113C30] text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded">
                                              {isEn ? 'Milestone Card' : 'بطاقة البند'}
                                            </span>
                                            <h4 className="font-extrabold text-[#113C30] text-sm">{transStgName}</h4>
                                          </div>
                                          <p className="text-[10px] text-gray-400 mt-1 font-bold flex flex-wrap gap-2 items-center">
                                            <span>{isEn ? 'Real-world progress:' : 'نسبة تقدم البند الفعلي بالموقع:'} <span className="text-[#2B4D89]">{stg.progress}%</span></span>
                                            {stg.totalDurationDays && (
                                              <>
                                                <span className="text-gray-200">|</span>
                                                <span className="text-blue-700">📅 {isEn ? 'Allocated Duration:' : 'مدة التنفيذ المقررة:'} {stg.totalDurationDays} {isEn ? 'days' : 'يوم'}</span>
                                                <span className="text-gray-200">|</span>
                                                <span className="text-amber-700">⏳ {isEn ? 'Elapsed:' : 'اليوم المنقضي:'} {stg.daysElapsed || 0} {isEn ? 'of' : 'من'} {stg.totalDurationDays} {isEn ? 'days' : 'يوم'}</span>
                                              </>
                                            )}
                                          </p>
                                        </div>

                                        <div className="shrink-0 flex items-center gap-2">
                                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                                            stg.status === 'APPROVED' || stg.status === 'INSPECTION_APPROVED' || stg.status === 'PAID' ? 'bg-emerald-50 text-emerald-800 border border-emerald-250/65' :
                                            stg.status === 'REJECTED' || stg.status === 'INSPECTION_FAILED' ? 'bg-rose-50 text-rose-805 border border-rose-250/65' :
                                            stg.status === 'IN_PROGRESS' || stg.status === 'UNDER_WAY' ? 'bg-blue-50 text-blue-805 border border-blue-250/65 animate-pulse' :
                                            stg.status === 'INSPECTION_REQUESTED' ? 'bg-amber-50 text-amber-805 border border-amber-255/65 animate-pulse' :
                                            'bg-gray-100 text-gray-450'
                                          }`}>
                                            {stg.status === 'APPROVED' || stg.status === 'INSPECTION_APPROVED' || stg.status === 'PAID' ? (isEn ? '✓ Accepted by Field Audit' : '✓ مقبول فنيّاً بالاستلام الميداني') :
                                             stg.status === 'REJECTED' || stg.status === 'INSPECTION_FAILED' ? (isEn ? '❌ Audit Deficiencies Detected' : '❌ مرفوض لوجود ملاحظات تفتيش') :
                                             stg.status === 'IN_PROGRESS' || stg.status === 'UNDER_WAY' ? (isEn ? '⏳ Active Execution' : '🛠️ جاري التنفيذ الميداني') :
                                             stg.status === 'INSPECTION_REQUESTED' ? (isEn ? '🔬 Under QA Inspection' : '🔬 جاري معاينة الفحص الفني') : (isEn ? 'Awaiting start' : 'بانتظار التأسيس والبدء')}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Timeline Progress Widget */}
                                      {stg.totalDurationDays && (() => {
                                        const matchedContract = (contracts || []).find(c => c.requestId === selectedRequest.id);
                                        const delayDays = (stg.totalDurationDays && stg.daysElapsed && stg.daysElapsed > stg.totalDurationDays) 
                                          ? (stg.daysElapsed - stg.totalDurationDays) 
                                          : 0;
                                        const penaltyRate = stg.delayPenaltyPerDay || matchedContract?.delayPenaltyPerDay || 500;

                                        return (
                                          <div className="bg-white border border-gray-150 p-3.5 rounded-2xl space-y-2 text-xs">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10px] font-extrabold text-gray-500">
                                              <span className="text-[#102B20]">⏱️ {isEn ? 'Time Limit Consumption:' : 'إنجاز ميعاد هذه المرحلة:'} {Math.round(((stg.daysElapsed || 0) / stg.totalDurationDays) * 100)}% {isEn ? 'من الزمن المتاح' : 'من الزمن المتاح'}</span>
                                              <span className="font-mono text-gray-400 text-left font-bold">
                                                {isEn ? 'Days elapsed:' : 'الأيام المنقضية:'} <strong className="text-gray-700 font-black">{stg.daysElapsed || 0} {isEn ? 'days' : 'يوم'}</strong> &nbsp;|&nbsp; {isEn ? 'Remaining:' : 'المتبقي للتسليم:'} <strong className="text-rose-600 font-black">{Math.max(0, stg.totalDurationDays - (stg.daysElapsed || 0))} {isEn ? 'days' : 'يوم'}</strong>
                                              </span>
                                            </div>
                                            <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/40">
                                              <div 
                                                className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, Math.round(((stg.daysElapsed || 0) / stg.totalDurationDays) * 100))}%` }}
                                              ></div>
                                            </div>
                                            {stg.progress < 100 && (stg.daysElapsed || 0) > stg.totalDurationDays ? (
                                              <p className="text-[9px] text-red-650 leading-normal font-bold">
                                                {isEn ? '⚠️ Timeframe Overrun: The contractor has delayed past the scheduled duration!' : '⚠️ تنبيه لتخطي الجدول الزمني: تجاوز المقاول الميعاد المخصص للمشروع!'}
                                              </p>
                                            ) : stg.progress >= 100 ? (
                                              <p className="text-[9px] text-emerald-600 leading-normal font-bold">
                                                {isEn ? '🏆 Milestone successfully completed, certified, and funding released!' : '🏆 تم الانتهاء واستلام البند ورفع الدفعة المالية للمرحلة بنجاح.'}
                                              </p>
                                            ) : (
                                              <p className="text-[9px] text-gray-400 leading-normal font-semibold">
                                                {isEn ? 'Shatibha monitors work integrity & building code compliance through our independent site inspector visits.' : 'تراقب منصة شطبها نزاهة العمل ومطابقة المواصفات الهندسية من خلال مهندسها نزوليّاً.'}
                                              </p>
                                            )}

                                            {/* Delay Penalties Section */}
                                            {delayDays > 0 ? (
                                              <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                                                <div className="flex items-center gap-2 text-right">
                                                  <span className="text-base">⚠️</span>
                                                  <div>
                                                    <h5 className="font-extrabold text-[#2B4D89] text-[11px]">
                                                      {isEn ? 'Stage Timeline Overrun (Fines Calculated on Full Project)' : 'تجاوز الإطار الزمني للمرحلة (الغرامات تحسب كلياً)'}
                                                    </h5>
                                                    <p className="text-[10px] text-gray-600 leading-normal max-w-xl">
                                                      {isEn 
                                                        ? `This specific phase has exceeded its limit by ${delayDays} days. However, delay penalties are officially calculated based on the execution period of the project as a whole, not separately per stage.` 
                                                        : `تجاوز المقاول ميعاد هذه المرحلة بـ ${delayDays} يوم. الغرامات تُحتسب بالتراكم على إجمالي فترة تنفيذ المشروع للمرونة وتداخل البنود وليس لكل مرحلة منفصلة.`}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="text-left font-black shrink-0">
                                                  <span className="block text-[9px] text-[#2B4D89] font-bold uppercase tracking-wider">
                                                    {isEn ? 'Contractual rate:' : 'معدل غرامة العقد:'} {penaltyRate} {isEn ? 'EGP/Day' : 'ج.م/يوم'}
                                                  </span>
                                                  <span className="block text-[10px] text-amber-800 font-black mt-1">
                                                    {isEn ? 'Status:' : 'حالة المرحلة:'} <span className="bg-amber-100/90 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-black inline-block mt-0.5">{delayDays} {isEn ? 'days late' : 'يوم تأخير'}</span>
                                                  </span>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="mt-2.5 p-2.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-[10px] text-gray-500">
                                                <div className="flex items-center gap-1.5 text-right font-medium">
                                                  <span>⚖️</span>
                                                  <span>{isEn ? 'Delay Penalty Clause:' : 'مبلغ غرامة التأخير اليومية في العقد:'}</span>
                                                  <span className="text-[#113C30] font-extrabold bg-[#2B4D89]/5 px-2 py-0.5 rounded-lg border border-[#2B4D89]/10">
                                                    {penaltyRate} {isEn ? 'EGP / day' : 'جنيه مصري / يوم'}
                                                  </span>
                                                </div>
                                                <span className="font-bold text-emerald-650 flex items-center gap-1">
                                                  <span>⏱️ 0 {isEn ? 'delayed days' : 'أيام تأخير'}</span>
                                                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] font-black">{isEn ? 'On Time' : 'منضبط'}</span>
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}

                                      {/* Pictures comparisons & Inspector Technical Report */}
                                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pointer-events-auto">
                                        <div className="md:col-span-4">
                                          <span className="text-[10px] font-bold text-gray-400 block mb-1.5 text-right">{isEn ? '📸 Captured Live Inspection Photo:' : '📸 صورة المعاينة الحية الموثقة:'}</span>
                                          <div className="aspect-[4/3] rounded-2xl bg-black border border-gray-200 relative overflow-hidden flex items-center justify-center text-center">
                                            {stg.images && stg.images.length > 0 ? (
                                              <>
                                                <img 
                                                  src={stg.images[0]} 
                                                  alt="Captured verified" 
                                                  className="w-full h-full object-cover" 
                                                  referrerPolicy="no-referrer"
                                                />
                                                <div className="absolute top-2 right-2 bg-[#2B4D89]/85 text-emerald-400 text-[8px] font-mono px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                                                  {isEn ? '✓ Field Certified Shot' : '✓ لقطة معتمدة ميدانياً'}
                                                </div>
                                              </>
                                            ) : (
                                              <div className="p-3 text-[10px] text-gray-400 space-y-1">
                                                <p>📷</p>
                                                <p className="leading-relaxed text-[8.5px]">{isEn ? 'Awaiting Shatibha engineering supervisor visit to capture live progress photos using the secure app camera.' : 'بانتظار نزول مهندس شطبها المشرف لتوثيق صور البند الحية بكاميرا المنصة المحصنة.'}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        <div className="md:col-span-8 flex flex-col justify-between">
                                          <div className="space-y-2 text-xs">
                                            <span className="font-bold text-gray-500 block">{isEn ? '📝 Independent Site Quality Audit Reports:' : '📝 تقرير معاينات الجودة الهندسية المستقلة:'}</span>
                                            
                                            {stg.status === 'REJECTED' ? (
                                              <div className="p-3 bg-red-50 border border-red-100 text-red-800 rounded-xl leading-relaxed font-semibold">
                                                <strong>{isEn ? 'Audit Failures & Defects Logged:' : 'تقرير الرفض والعيوب المكتشفة:'}</strong> "{stg.rejectedNotes || (isEn ? 'Please correct raw materials and thickness issues then resubmit for approval.' : 'يرجى تصحيح المواد وتعديل السُمك وعرضها مجدداً.')}"
                                              </div>
                                            ) : stg.reportText ? (
                                              <div className="p-3.5 bg-[#F0F3F7]/40 border border-[#2B4D89]/25 text-emerald-990 rounded-2xl leading-relaxed italic font-medium">
                                                "{stg.reportText}"
                                                <span className="block text-[9px] font-bold text-[#113C30] mt-1.5 not-italic">
                                                  {isEn ? '📅 Inspection Date:' : '📅 تاريخ الفحص والزيارة:'} {stg.reportDate || (isEn ? 'Today' : 'اليوم')}
                                                </span>
                                              </div>
                                            ) : (
                                              <p className="text-gray-400 italic text-[11px] leading-relaxed">
                                                {isEn ? 'The contractor is currently working on foundations. Once inspection request is sent, our site QA engineer will verify on-site and upload reports.' : 'المقاول يعمل للتأسيس حالياً، وعند طلبه للاستلام سيتوجه المهندس الاستشاري للمطابقة بالمعايير الفنية فوراً وتسجيل التقرير هنا...'}
                                              </p>
                                            )}
                                          </div>

                                          {/* PAYMENT BUTTON / ESCROW RELEASE ACTIONS */}
                                          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-3">
                                            {(() => {
                                              const percentVal = stg.paymentPercentage !== undefined ? stg.paymentPercentage : (
                                                stg.name.includes("سباكة") ? 20 :
                                                stg.name.includes("كهرباء") ? 15 :
                                                (stg.name.includes("بياض") || stg.name.includes("محارة")) ? 15 :
                                                (stg.name.includes("أرضيات") || stg.name.includes("بورسلين")) ? 20 :
                                                stg.name.includes("دهانات") ? 15 : 15
                                              );
                                              const matchedContract = (contracts || []).find(c => c.requestId === selectedRequest.id);
                                              const totalContractVal = matchedContract ? (matchedContract.finalContractPrice || matchedContract.totalAmount) : (selectedRequest.budget || 230000);
                                              const actualSValue = (totalContractVal * percentVal) / 100;
                                              return (
                                                <div className="flex items-center justify-between bg-slate-50 border border-slate-205 p-2.5 rounded-xl text-[10.5px]">
                                                  <span className="text-gray-500 font-bold">
                                                    {isEn ? "Clause Installment Weight:" : "نسبة الوزن المالي المستقطع للدفعة (العقد المبرم):"}
                                                  </span>
                                                  <span className="font-extrabold text-[#2B4D89] font-mono">
                                                    %{percentVal} — {actualSValue.toLocaleString()} ج.م
                                                  </span>
                                                </div>
                                              );
                                            })()}

                                            <div className="flex items-center justify-between">
                                              <div className="text-[10px] text-gray-400 font-bold">{isEn ? 'Milestone Funding Release state:' : 'حالة تصفية الدفعة:'}</div>
                                              
                                              {stg.status === 'APPROVED' ? (
                                                stg.paymentReleased ? (
                                                  <div className="text-emerald-700 bg-emerald-100 border border-emerald-200 text-[10px] px-3 py-1.5 rounded-xl font-black flex items-center gap-1 shadow-inner">
                                                    ✓ 💰 {isEn ? 'Milestone funding successfully disbursed and added to contractor balance!' : 'تم تفريغ وتأكيد الدفعة المالية للمرحلة للمقاول بنجاح في حسابه!'}
                                                  </div>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    onClick={() => onUpdateStage(stg.id, { paymentReleased: true })}
                                                    className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 font-black text-[11px] px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1"
                                                  >
                                                    <span>💳 {isEn ? 'Authorize Funding Release' : 'اعتماد الدفعة المالية للمقاول'}</span>
                                                    <span className="text-[9px] opacity-75">{isEn ? '(Upon your review)' : '(بعد موافقتك على مخرج التقرير)'}</span>
                                                  </button>
                                                )
                                              ) : (
                                                <span className="text-gray-400 text-[11px] italic font-semibold">
                                                  🔒 {isEn ? 'Locked: Awaiting field inspector audit approval first' : 'مغلق: حتى الاعتماد الميداني وقبول المشرف الفني للبند أولاً.'}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <div className="bg-red-50/40 p-3 rounded-2xl border border-red-100/60 space-y-2 mt-1">
                                              <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-red-800 font-black flex items-center gap-1">
                                                  {isEn ? '⚠️ Have you noticed any raw material defects or code violations on-site?' : '⚠️ هل لاحظت عيوباً أو استخدام خامات رديئة في هذا البند بالموقع؟'}
                                                </span>
                                                {stg.complaintText && (
                                                  <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-wider animate-pulse">
                                                    {isEn ? 'Under Inspector Review 🚨' : 'تحت معاينة المشرف فوريّاً 🚨'}
                                                  </span>
                                                )}
                                              </div>
                                              
                                              {stg.complaintText ? (
                                                <div className="p-2.5 bg-white border border-red-100 rounded-xl text-[11px] leading-relaxed text-red-950 font-bold shadow-xs">
                                                  <p>💬 <strong>{isEn ? 'Your filed complaint report:' : 'بلاغ الشكوى المرسل منك:'}</strong> "{stg.complaintText}"</p>
                                                  <span className="text-[9px] text-gray-400 block mt-1">{isEn ? 'Report Date:' : 'تاريخ تقديم البلاغ:'} {stg.complaintDate || 'اليوم'} • {isEn ? 'Shatibha consulting engineer is heading to the site to inspect and resolve.' : 'سيتوجه استشاري "شطبها" للفحص الفوري بكاميرا المنصة ومعالجة المشكلة.'}</span>
                                                </div>
                                              ) : (
                                                <div className="flex gap-2">
                                                  <input 
                                                    type="text" 
                                                    placeholder={isEn ? 'Type technical issue details or deviations for prompt intervention...' : 'اكتب تفاصيل المشكلة أو العيب الفني هنا للتدخل الفوري...'}
                                                    id={`complaint-input-${stg.id}`}
                                                    className="bg-white px-3 py-1.5 text-[11px] border border-red-100 rounded-xl flex-1 text-right focus:outline-rose-500 font-semibold"
                                                  />
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const val = (document.getElementById(`complaint-input-${stg.id}`) as HTMLInputElement)?.value;
                                                      if (val) onUpdateStage(stg.id, { complaintText: val, complaintDate: new Date().toLocaleDateString() });
                                                    }}
                                                    className="bg-red-650 hover:bg-red-700 active:scale-95 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
                                                  >
                                                    {isEn ? 'File Complaint 🚨' : 'إرسال شكوى 🚨'}
                                                  </button>
                                                </div>
                                              )}
                                          </div>
                                        </div>
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

                              {/* Dot indicators */}
                              <div className="flex items-center justify-center gap-2 pt-2.5 pb-1 no-print">
                                {activeProjStages.map((_, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setClientActiveStageIndex(idx)}
                                    className={`h-2 hover:scale-110 cursor-pointer rounded-full transition-all duration-200 ${
                                      idx === clampedIdx ? 'w-6 bg-[#2B4D89]' : 'w-2 bg-gray-300'
                                    }`}
                                    title={`Slide ${idx + 1}`}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        }

                        // Classical sequential list mode
                        return (
                          <div className="space-y-6">
                            {activeProjStages.map(stg => {
                              const transStgName = isEn 
                                ? (stg.name === 'تأسيس السباكة والصرف' ? 'Plumbing & Drainage Setup' : 
                                   stg.name === 'تأسيس الكهرباء والإنارة' ? 'Electrical & Lighting Setup' : 
                                   stg.name === 'أعمال المحارة والأسقف' ? 'Plastering & Ceiling Work' : 
                                   stg.name === 'الدهانات والتشطيب النهائي' ? 'Painting & Final Decoration' : stg.name) 
                                : stg.name;
                              return (
                              <div key={stg.id} className="border border-gray-200/80 rounded-2.5xl p-5 bg-gray-50/25 space-y-4 hover:shadow-xs transition-shadow text-right">
                                
                                {/* Stage head */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-dashed border-gray-200">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="bg-[#113C30] text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded">
                                        {isEn ? 'Milestone Item' : 'البند الإنشائي'}
                                      </span>
                                      <h4 className="font-extrabold text-[#113C30] text-sm">{transStgName}</h4>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 font-bold flex flex-wrap gap-2 items-center">
                                      <span>{isEn ? 'Real-world progress:' : 'نسبة تقدم البند الفعلي بالموقع:'} <span className="text-[#2B4D89]">{stg.progress}%</span></span>
                                      {stg.totalDurationDays && (
                                        <>
                                          <span className="text-gray-200">|</span>
                                          <span className="text-blue-700">📅 {isEn ? 'Allocated Duration:' : 'مدة التنفيذ المقررة:'} {stg.totalDurationDays} {isEn ? 'days' : 'يوم'}</span>
                                          <span className="text-gray-200">|</span>
                                          <span className="text-amber-700">⏳ {isEn ? 'Elapsed:' : 'اليوم المنقضي:'} {stg.daysElapsed || 0} {isEn ? 'of' : 'من'} {stg.totalDurationDays} {isEn ? 'days' : 'يوم'}</span>
                                        </>
                                      )}
                                    </p>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-2">
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                                      stg.status === 'APPROVED' || stg.status === 'INSPECTION_APPROVED' || stg.status === 'PAID' ? 'bg-[#F0F3F7] text-emerald-800 border border-emerald-200/65' :
                                      stg.status === 'REJECTED' || stg.status === 'INSPECTION_FAILED' ? 'bg-rose-50 text-rose-808 border border-rose-200/65' :
                                      stg.status === 'IN_PROGRESS' || stg.status === 'UNDER_WAY' ? 'bg-blue-50 text-blue-808 border border-blue-200/65 animate-pulse' :
                                      stg.status === 'INSPECTION_REQUESTED' ? 'bg-amber-50 text-amber-808 border border-amber-200/65 animate-pulse' :
                                      'bg-gray-100 text-gray-450'
                                    }`}>
                                      {stg.status === 'APPROVED' || stg.status === 'INSPECTION_APPROVED' || stg.status === 'PAID' ? (isEn ? '✓ Accepted by Field Audit' : '✓ مقبول فنيّاً بالاستلام الميداني') :
                                       stg.status === 'REJECTED' || stg.status === 'INSPECTION_FAILED' ? (isEn ? '❌ Audit Deficiencies Detected' : '❌ مرفوض لوجود ملاحظات تفتيش') :
                                       stg.status === 'IN_PROGRESS' || stg.status === 'UNDER_WAY' ? (isEn ? '⏳ Active Execution' : '🛠️ جاري التنفيذ الميداني') :
                                       stg.status === 'INSPECTION_REQUESTED' ? (isEn ? '🔬 Under QA Inspection' : '🔬 جاري معاينة الفحص الفني') : (isEn ? 'Awaiting start' : 'بانتظار التأسيس والبدء')}
                                    </span>
                                  </div>
                                </div>

                                 {/* Timeline Progress Widget */}
                                 {stg.totalDurationDays && (() => {
                                   const matchedContract = (contracts || []).find(c => c.requestId === selectedRequest.id);
                                   const delayDays = (stg.totalDurationDays && stg.daysElapsed && stg.daysElapsed > stg.totalDurationDays) 
                                     ? (stg.daysElapsed - stg.totalDurationDays) 
                                     : 0;
                                   const penaltyRate = stg.delayPenaltyPerDay || matchedContract?.delayPenaltyPerDay || 500;
                                   const totalPenalty = delayDays * penaltyRate;

                                   return (
                                     <div className="bg-white border border-gray-150 p-3.5 rounded-2xl space-y-2 text-xs">
                                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10px] font-extrabold text-gray-500">
                                         <span className="text-[#102B20]">⏱️ {isEn ? 'Time Limit Consumption:' : 'إنجاز ميعاد هذه المرحلة:'} {Math.round(((stg.daysElapsed || 0) / stg.totalDurationDays) * 100)}% {isEn ? 'of allowed space' : 'من الزمن المتاح'}</span>
                                         <span className="font-mono text-gray-400 text-left font-bold">
                                           {isEn ? 'Days elapsed:' : 'الأيام المنقضية:'} <strong className="text-gray-700 font-black">{stg.daysElapsed || 0} {isEn ? 'days' : 'يوم'}</strong> &nbsp;|&nbsp; {isEn ? 'Remaining:' : 'المتبقي للتسليم:'} <strong className="text-rose-600 font-black">{Math.max(0, stg.totalDurationDays - (stg.daysElapsed || 0))} {isEn ? 'days' : 'يوم'}</strong>
                                         </span>
                                       </div>
                                       <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/40">
                                         <div 
                                           className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                                           style={{ width: `${Math.min(100, Math.round(((stg.daysElapsed || 0) / stg.totalDurationDays) * 100))}%` }}
                                         ></div>
                                       </div>
                                       {stg.progress < 100 && (stg.daysElapsed || 0) > stg.totalDurationDays ? (
                                         <p className="text-[9px] text-red-650 leading-normal font-bold">
                                           {isEn ? '⚠️ Timeframe Overrun: The contractor has delayed past the scheduled duration!' : '⚠️ تنبيه لتخطي الجدول الزمني: تجاوز المقاول الميعاد المخصص للمشروع!'}
                                         </p>
                                       ) : stg.progress >= 100 ? (
                                         <p className="text-[9px] text-emerald-600 leading-normal font-bold">
                                           {isEn ? '🏆 Milestone successfully completed, certified, and funding released!' : '🏆 تم الانتهاء واستلام البند ورفع الدفعة المالية للمرحلة بنجاح.'}
                                         </p>
                                       ) : (
                                         <p className="text-[9px] text-gray-400 leading-normal font-semibold">
                                           {isEn ? 'Shatibha monitors work integrity & building code compliance through our independent site inspector visits.' : 'تراقب منصة شطبها نزاهة العمل ومطابقة المواصفات الهندسية من خلال مهندسها نزوليّاً.'}
                                         </p>
                                       )}

                                       {/* Brand New Delay Penalties Section */}
                                       {delayDays > 0 ? (
                                         <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                                           <div className="flex items-center gap-2 text-right">
                                             <span className="text-base">⚠️</span>
                                             <div>
                                               <h5 className="font-extrabold text-[#2B4D89] text-[11px]">
                                                 {isEn ? 'Stage Timeline Overrun (Fines Calculated on Full Project)' : 'تجاوز الإطار الزمني للمرحلة (الغرامات تحسب كلياً)'}
                                               </h5>
                                               <p className="text-[10px] text-gray-600 leading-normal max-w-xl">
                                                 {isEn 
                                                   ? `This specific phase has exceeded its limit by ${delayDays} days. However, delay penalties are officially calculated based on the execution period of the project as a whole, not separately per stage.` 
                                                   : `تجاوز المقاول ميعاد هذه المرحلة بـ ${delayDays} يوم. الغرامات تُحتسب بالتراكم على إجمالي فترة تنفيذ المشروع للمرونة وتداخل البنود وليس لكل مرحلة منفصلة.`}
                                               </p>
                                             </div>
                                           </div>
                                           <div className="text-left font-black shrink-0">
                                             <span className="block text-[9px] text-[#2B4D89] font-bold uppercase tracking-wider">
                                               {isEn ? 'Contractual rate:' : 'معدل غرامة العقد:'} {penaltyRate} {isEn ? 'EGP/Day' : 'ج.م/يوم'}
                                             </span>
                                             <span className="block text-[10px] text-amber-800 font-black mt-1">
                                               {isEn ? 'Status:' : 'حالة المرحلة:'} <span className="bg-amber-100/90 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-black inline-block mt-0.5">{delayDays} {isEn ? 'days late' : 'يوم تأخير'}</span>
                                             </span>
                                           </div>
                                         </div>
                                       ) : (
                                         <div className="mt-2.5 p-2.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-[10px] text-gray-500">
                                           <div className="flex items-center gap-1.5 text-right font-medium">
                                             <span>⚖️</span>
                                             <span>{isEn ? 'Delay Penalty Clause:' : 'مبلغ غرامة التأخير اليومية في العقد:'}</span>
                                             <span className="text-[#113C30] font-extrabold bg-[#2B4D89]/5 px-2 py-0.5 rounded-lg border border-[#2B4D89]/10">
                                               {penaltyRate} {isEn ? 'EGP / day' : 'جنيه مصري / يوم'}
                                             </span>
                                           </div>
                                           <span className="font-bold text-emerald-650 flex items-center gap-1">
                                             <span>⏱️ 0 {isEn ? 'delayed days' : 'أيام تأخير'}</span>
                                             <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] font-black">{isEn ? 'On Time' : 'منضبط'}</span>
                                           </span>
                                         </div>
                                       )}
                                     </div>
                                   );
                                 })()}

                                {/* Pictures comparisons & Inspector Technical Report */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                  <div className="md:col-span-4">
                                    <span className="text-[10px] font-bold text-gray-400 block mb-1.5 text-right">{isEn ? '📸 Captured Live Inspection Photo:' : '📸 صورة المعاينة الحية الموثقة:'}</span>
                                    <div className="aspect-[4/3] rounded-2xl bg-black border border-gray-200 relative overflow-hidden flex items-center justify-center text-center">
                                      {stg.images && stg.images.length > 0 ? (
                                        <>
                                          <img 
                                            src={stg.images[0]} 
                                            alt="Captured verified screenshot" 
                                            className="w-full h-full object-cover" 
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="absolute top-2 right-2 bg-[#2B4D89]/85 text-emerald-400 text-[8px] font-mono px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                                            {isEn ? '✓ Field Certified Shot' : '✓ لقطة معتمدة ميدانياً'}
                                          </div>
                                        </>
                                      ) : (
                                        <div className="p-3 text-[10px] text-gray-400 space-y-1">
                                          <p>📷</p>
                                          <p className="leading-relaxed">{isEn ? 'Awaiting Shatibha engineering supervisor visit to capture live progress photos using the secure app camera.' : 'بانتظار نزول مهندس شطبها المشرف لتوثيق صور البند الحية بكاميرا المنصة المحصنة.'}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="md:col-span-8 flex flex-col justify-between">
                                    <div className="space-y-2 text-xs">
                                      <span className="font-bold text-gray-500 block">{isEn ? '📝 Independent Site Quality Audit Reports:' : '📝 تقرير معاينات الجودة الهندسية المستقلة:'}</span>
                                      
                                      {stg.status === 'REJECTED' ? (
                                        <div className="p-3 bg-red-50 border border-red-100 text-red-800 rounded-xl leading-relaxed font-semibold">
                                          <strong>{isEn ? 'Audit Failures & Defects Logged:' : 'تقرير الرفض والعيوب المكتشفة:'}</strong> "{stg.rejectedNotes || (isEn ? 'Please correct raw materials and thickness issues then resubmit for approval.' : 'يرجى تصحيح المواد وتعديل السُمك وعرضها مجدداً.')}"
                                        </div>
                                      ) : stg.reportText ? (
                                        <div className="p-3.5 bg-[#F0F3F7]/40 border border-[#2B4D89]/25 text-emerald-990 rounded-2xl leading-relaxed italic font-medium">
                                          "{stg.reportText}"
                                          <span className="block text-[9px] font-bold text-[#113C30] mt-1.5 not-italic">
                                                                                        {isEn ? '📅 Inspection Date:' : '📅 تاريخ الفحص والزيارة:'} {stg.reportDate || (isEn ? 'Today' : 'اليوم')}
                                          </span>
                                        </div>
                                      ) : (
                                        <p className="text-gray-400 italic text-[11px] leading-relaxed">
                                          {isEn ? 'The contractor is currently working on foundations. Once inspection request is sent, our site QA engineer will verify on-site and upload reports.' : 'المقاول يعمل للتأسيس حالياً، وعند طلبه للاستلام سيتوجه المهندس الاستشاري للمطابقة بالمعايير الفنية فوراً وتسجيل التقرير هنا...'}
                                        </p>
                                      )}
                                    </div>

                                    {/* PAYMENT BUTTON / ESCROW RELEASE ACTIONS */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-3">
                                      {(() => {
                                        const percentVal = stg.paymentPercentage !== undefined ? stg.paymentPercentage : (
                                          stg.name.includes("سباكة") ? 20 :
                                          stg.name.includes("كهرباء") ? 15 :
                                          (stg.name.includes("بياض") || stg.name.includes("محارة")) ? 15 :
                                          (stg.name.includes("أرضيات") || stg.name.includes("بورسلين")) ? 20 :
                                          stg.name.includes("دهانات") ? 15 : 15
                                        );
                                        const matchedContract = (contracts || []).find(c => c.requestId === selectedRequest.id);
                                        const totalContractVal = matchedContract ? (matchedContract.finalContractPrice || matchedContract.totalAmount) : (selectedRequest.budget || 230000);
                                        const actualSValue = (totalContractVal * percentVal) / 100;
                                        return (
                                          <div className="flex items-center justify-between bg-slate-50 border border-slate-205 p-2.5 rounded-xl text-[10.5px]">
                                            <span className="text-gray-500 font-bold">
                                              {isEn ? "Clause Installment Weight:" : "نسبة الوزن المالي المستقطع للدفعة (العقد المبرم):"}
                                            </span>
                                            <span className="font-extrabold text-[#2B4D89] font-mono">
                                              %{percentVal} — {actualSValue.toLocaleString()} ج.م
                                            </span>
                                          </div>
                                        );
                                      })()}

                                      <div className="flex items-center justify-between">
                                        <div className="text-[10px] text-gray-400 font-bold">{isEn ? 'Milestone Funding Release state:' : 'حالة تصفية الدفعة:'}</div>
                                        
                                        {stg.status === 'APPROVED' ? (
                                          stg.paymentReleased ? (
                                            <div className="text-emerald-700 bg-emerald-100 border border-emerald-200 text-[10px] px-3 py-1.5 rounded-xl font-black flex items-center gap-1 shadow-inner">
                                              ✓ 💰 {isEn ? 'Milestone funding successfully disbursed and added to contractor balance!' : 'تم تفريغ وتأكيد الدفعة المالية للمرحلة للمقاول بنجاح في حسابه!'}
                                            </div>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => onUpdateStage(stg.id, { paymentReleased: true })}
                                              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 font-black text-[11px] px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1"
                                            >
                                              <span>💳 {isEn ? 'Authorize Funding Release' : 'اعتماد الدفعة المالية للمقاول'}</span>
                                              <span className="text-[9px] opacity-75">{isEn ? '(Upon your satisfied technical outcome review)' : '(بعد موافقتك على مخرج التقرير)'}</span>
                                            </button>
                                          )
                                        ) : (
                                          <span className="text-gray-400 text-[11px] italic font-semibold">
                                            🔒 {isEn ? 'Locked: Awaiting field inspector audit approval first' : 'مغلق: حتى الاعتماد الميداني وقبول المشرف الفني للبند أولاً.'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="bg-red-50/40 p-3 rounded-2xl border border-red-100/60 space-y-2 mt-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] text-red-800 font-black flex items-center gap-1">
                                            {isEn ? '⚠️ Have you noticed any raw material defects or code violations on-site?' : '⚠️ هل لاحظت عيوباً أو استخدام خامات رديئة في هذا البند بالموقع؟'}
                                          </span>
                                          {stg.complaintText && (
                                            <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-wider animate-pulse">
                                              {isEn ? 'Under Inspector Review 🚨' : 'تحت معاينة المشرف فوريّاً 🚨'}
                                            </span>
                                          )}
                                        </div>
                                        
                                        {stg.complaintText ? (
                                          <div className="p-2.5 bg-white border border-red-100 rounded-xl text-[11px] leading-relaxed text-red-950 font-bold shadow-xs">
                                            <p>💬 <strong>{isEn ? 'Your filed complaint report:' : 'بلاغ الشكوى المرسل منك:'}</strong> "{stg.complaintText}"</p>
                                            <span className="text-[9px] text-gray-400 block mt-1">{isEn ? 'Report Date:' : 'تاريخ تقديم البلاغ:'} {stg.complaintDate || 'اليوم'} • {isEn ? 'Shatibha consulting engineer is heading to the site to inspect and resolve.' : 'سيتوجه استشاري "شطبها" للفحص الفوري بكاميرا المنصة ومعالجة المشكلة.'}</span>
                                           </div>
                                         ) : (
                                           <div className="flex gap-2">
                                             <input 
                                               type="text" 
                                               placeholder={isEn ? 'Type technical issue details or deviations for prompt intervention...' : 'اكتب تفاصيل المشكلة أو العيب الفني هنا للتدخل الفوري...'}
                                               id={`complaint-input-${stg.id}`}
                                               className="bg-white px-3 py-1.5 text-[11px] border border-red-100 rounded-xl flex-1 text-right focus:outline-rose-500"
                                             />
                                             <button
                                               type="button"
                                               onClick={() => {
                                                 const val = (document.getElementById(`complaint-input-${stg.id}`) as HTMLInputElement)?.value;
                                                 if (val) onUpdateStage(stg.id, { complaintText: val, complaintDate: new Date().toLocaleDateString() });
                                               }}
                                               className="bg-red-650 hover:bg-red-700 active:scale-95 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
                                             >
                                               {isEn ? 'File Complaint 🚨' : 'إرسال شكوى 🚨'}
                                             </button>
                                           </div>
                                         )}
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                         );
                       })()}

                       {/* 📊 NON-INTRUSIVE CLIENT NPS SURVEY COMPONENT */}
                       {(() => {
                         const activeProjStagesForNps = stages.filter(s => s.requestId === selectedRequest.id);
                         const hasCompletedStage = activeProjStagesForNps.some(s => s.progress === 100 || s.status === 'APPROVED');
                         const lastCompletedStage = activeProjStagesForNps.find(s => s.progress === 100 || s.status === 'APPROVED');
                         
                         if (!hasCompletedStage) return null;

                         const stageNameTrans = lastCompletedStage 
                           ? (isEn ? lastCompletedStage.name : lastCompletedStage.name)
                           : '';

                         return (
                           <AnimatePresence>
                             {!npsDismissed && (
                               <motion.div 
                                 initial={{ opacity: 0, y: 15 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, height: 0 }}
                                 className="mt-6 border border-[#E5A910]/35 bg-gradient-to-br from-indigo-50/20 via-white to-amber-50/10 rounded-3xl p-5 md:p-6 shadow-xs relative overflow-hidden text-right"
                               >
                                 {/* Top accent badge */}
                                 <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3154CD] to-[#E5A910]"></div>
                                 
                                 <div className="flex items-start justify-between gap-4">
                                   <div className="flex-1">
                                     <div className="flex items-center gap-2 justify-end flex-row-reverse">
                                       <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-lg border border-amber-200">
                                         {isEn ? 'Quality Assessment' : 'تقييم جودة المعاملات الميدانية'}
                                       </span>
                                       <h4 className="font-black text-sm text-[#113C30] flex items-center gap-1.5">
                                         <span>💡</span>
                                         <span>{isEn ? 'Share Your Experience (NPS Survey)' : 'شاركنا رأيك في الخدمة (استقصاء NPS)'}</span>
                                       </h4>
                                     </div>
                                     <p className="text-[11px] text-gray-500 mt-1 max-w-xl leading-relaxed">
                                       {isEn 
                                         ? `Congratulations on completing milestone "${stageNameTrans}"! Your feedback ensures we maintain high engineering and platform response standards.`
                                         : `تهانينا على إتمام بند "${stageNameTrans}" بنجاح! يسهم تقييمك للأطراف في تصنيف المقاولين بدقة وتطوير سرعة استجابة منصة شطبها.`}
                                     </p>
                                   </div>
                                   <button
                                     type="button"
                                     onClick={handleNpsDismiss}
                                     className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-xs font-bold"
                                     title={isEn ? "Dismiss" : "إغلاق مؤقت"}
                                   >
                                     ✕
                                   </button>
                                 </div>

                                 {!npsSubmitted ? (
                                   <div className="mt-5 space-y-5">
                                     {/* Question 1: Contractor rating */}
                                     <div className="space-y-2">
                                       <label className="block text-[11px] font-black text-gray-700 text-right">
                                         {isEn 
                                           ? "⭐ Rate the contractor's performance and execution quality inside the unit:" 
                                           : "⭐ ما مدى رضاك عن جودة تنفيذ المقاول بالموقع والتزامه بالمعايير الفنية؟"}
                                       </label>
                                       <div className="flex flex-wrap items-center justify-between gap-1" dir="ltr">
                                         {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                           <button
                                             key={score}
                                             type="button"
                                             onClick={() => setNpsContractorRating(score)}
                                             className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-black text-xs transition-all flex items-center justify-center cursor-pointer border ${
                                               npsContractorRating === score
                                                 ? 'bg-[#E5A910] text-[#0F172A] border-[#E5A910] shadow-md scale-110 font-bold'
                                                 : 'bg-white text-gray-700 hover:bg-slate-100 border-gray-200 shrink-0'
                                             }`}
                                           >
                                             {score}
                                           </button>
                                         ))}
                                       </div>
                                       <div className="flex justify-between text-[9px] text-gray-500 px-1 font-bold">
                                         <span>{isEn ? '1 - extremely poor' : '١ - غير راضٍ أبداً 😡'}</span>
                                         <span>{isEn ? '10 - perfect' : '١٠ - راضٍ تماماً 🏆'}</span>
                                       </div>
                                     </div>

                                     {/* Question 2: Platform speed rating */}
                                     <div className="space-y-2">
                                       <label className="block text-[11px] font-black text-gray-700 text-right">
                                         {isEn 
                                           ? "⚡ Rate Shattadha's engineering inspection speed & response time:" 
                                           : "⚡ ما مدى رضاك عن سرعة استجابة منصة شطبها ومتابعة المشرفين الميدانيين لإجراء الفحص الفني؟"}
                                       </label>
                                       <div className="flex flex-wrap items-center justify-between gap-1" dir="ltr">
                                         {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                           <button
                                             key={score}
                                             type="button"
                                             onClick={() => setNpsPlatformRating(score)}
                                             className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-black text-xs transition-all flex items-center justify-center cursor-pointer border ${
                                               npsPlatformRating === score
                                                 ? 'bg-[#3154CD] text-white border-[#3154CD] shadow-md scale-110 font-bold'
                                                 : 'bg-white text-gray-700 hover:bg-slate-100 border-gray-200 shrink-0'
                                             }`}
                                           >
                                             {score}
                                           </button>
                                         ))}
                                       </div>
                                       <div className="flex justify-between text-[9px] text-gray-500 px-1 font-bold">
                                         <span>{isEn ? '1 - sluggish response' : '١ - استجابة بطيئة'}</span>
                                         <span>{isEn ? '10 - lightning fast' : '١٠ - سريعة وفورية ⚡'}</span>
                                       </div>
                                     </div>

                                     {/* Text area for comments */}
                                     <div className="space-y-1.5">
                                       <label className="block text-[11px] font-bold text-gray-600 text-right">
                                         {isEn ? '📝 Additional feedback or suggestions (optional):' : '📝 ملاحظاتك الإضافية أو أي تعليق على سير الأعمال (اختياري):'}
                                       </label>
                                       <textarea
                                         value={npsComment}
                                         onChange={(e) => setNpsComment(e.target.value)}
                                         placeholder={isEn ? "Write your experience highlights here..." : "اكتب مقترحاتك أو أي صعوبات واجهتك ليتم معالجتها في المراحل القادمة..."}
                                         className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 focus:outline-[#3154CD] text-right bg-white font-sans min-h-[60px]"
                                       />
                                     </div>

                                     {/* Action Buttons */}
                                     <div className="flex items-center justify-between gap-2.5 pt-1">
                                       <button
                                          type="button"
                                          onClick={handleNpsDismiss}
                                          className="text-gray-500 hover:text-gray-800 text-[11px] font-bold cursor-pointer hover:underline"
                                       >
                                         {isEn ? 'Skip for later' : 'تخطي الاستبيان مؤقتاً'}
                                       </button>

                                       <button
                                         type="button"
                                         disabled={npsContractorRating === null || npsPlatformRating === null}
                                         onClick={handleNpsSubmit}
                                         className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-xs transition-all select-none active:scale-95 ${
                                           (npsContractorRating === null || npsPlatformRating === null)
                                             ? 'bg-gray-150 text-gray-400 border border-gray-250 cursor-not-allowed opacity-60'
                                             : 'bg-[#3154CD] text-white hover:bg-opacity-95 cursor-pointer shadow-md'
                                         }`}
                                       >
                                         {isEn ? 'Submit Feedback' : 'إرسال التقييم المعتمد 🚀'}
                                       </button>
                                     </div>
                                   </div>
                                 ) : (
                                   <div className="mt-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center space-y-2">
                                     <div className="text-xl">❤️</div>
                                     <h5 className="font-extrabold text-emerald-850 text-xs">
                                       {isEn ? 'Thank you so much!' : 'نشكرك على مشاركة تقييمك بكل شفافية!'}
                                     </h5>
                                     <p className="text-[10px] text-gray-600 leading-normal max-w-md mx-auto">
                                       {isEn 
                                         ? `Your rating has been securely logged: Contractor score is ${npsContractorRating}/10 and Platform rating is ${npsPlatformRating}/10. We leverage this data to optimize the Tripartite Escrow protection algorithms.`
                                         : `تم تسجيل نتائجك بنجاح وأمان: تقييم المقاول (${npsContractorRating}/١٠) - تقييم المنصة (${npsPlatformRating}/١٠). تساعدنا ملاحظاتك في تصنيف المقاولين وإثابتهم.`}
                                     </p>
                                     <div className="pt-2 text-right">
                                       <button
                                         type="button"
                                         onClick={handleNpsReset}
                                         className="text-[#3154CD] hover:underline text-[9px] font-extrabold cursor-pointer"
                                       >
                                         {isEn ? 'Change my feedback rating' : 'تعديل أو تحديث التقييم الحالي'}
                                       </button>
                                     </div>
                                   </div>
                                 )}
                               </motion.div>
                             )}
                           </AnimatePresence>
                         );
                       })()}

                     </div>
                   ) : requestOffers.length === 0 ? (
                     <div className="bg-white rounded-3xl border border-gray-100 py-12 px-6 text-center text-gray-400 shadow-sm">
                       <div className="text-4xl mb-3">⏳</div>
                       <h4 className="font-extrabold text-sm text-[#232F3F] mb-1">
                         {isEn ? 'Awaiting Bids' : 'بانتظار تلقي عروض الأسعار'}
                       </h4>
                       <p className="text-[11px] leading-relaxed max-w-md mx-auto">
                         {isEn 
                           ? `This request is currently under ${selectedRequest.status === 'PENDING_REVIEW' ? 'admin verification step' : 'open bidding period'} and you will be notified as soon as blind bids are submitted.`
                           : `الطلب حالياً في ${selectedRequest.status === 'PENDING_REVIEW' ? 'مرحلة الاعتماد الإداري من أدمن شطبها' : 'المناقصة الطروحة للشركات المقاولة'} وسيتم إشعارك فور تعبئة أول مناقصة مغلقة بنجاح ومطابقة.`}
                       </p>
                     </div>
                   ) : (
                     <div className="space-y-6">
                      
                      {/* 🌟 SMART ANALYSIS & COMPARISON SYSTEM PANEL */}
                      {(() => {
                        return (
                          <BidComparisonDashboard 
                            request={selectedRequest}
                            offers={requestOffers}
                            companies={companies}
                            isEn={isEn}
                            selectedCompareOfferIds={selectedCompareOfferIds}
                            setSelectedCompareOfferIds={setSelectedCompareOfferIds}
                            comparisonPriority={comparisonPriority}
                            setComparisonPriority={setComparisonPriority}
                            onViewOfferDetails={setViewingOfferDetails}
                            onSelectProfileCompany={setSelectedProfileCompany}
                            allRequests={requests}
                          />
                        );

                        const sortedByPrice = [...requestOffers].sort((a, b) => a.price - b.price);
                        const sortedByDuration = [...requestOffers].sort((a, b) => a.durationDays - b.durationDays);
                        const sortedByRating = [...requestOffers].sort((a, b) => {
                          const compA = companies.find(c => c.id === a.companyId);
                          const compB = companies.find(c => c.id === b.companyId);
                          return (compB?.rating || 0) - (compA?.rating || 0);
                        });
 
                        const bestPriceOffer = sortedByPrice[0];
                        const fastestOffer = sortedByDuration[0];
                        const bestRatedOffer = sortedByRating[0];

                        // Helper function to calculate scores dynamically
                        const getScoreBreakdown = (off: any) => {
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
 
                        return (
                          <div className="bg-[#FAFDFB] rounded-3xl border border-[#AFDEC9] p-5 md:p-6 space-y-6 shadow-xs text-right">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#AFDEC9]/35 flex-row-reverse">
                              <div className="text-right">
                                <h3 className="font-black text-sm md:text-base text-[#123E32] flex items-center gap-2 justify-end flex-row-reverse">
                                  <span>📊</span> {isEn ? 'Compare Bids' : 'مقارنة العروض'}
                                </h3>
                                <p className="text-[10px] text-gray-500 font-medium">
                                  {isEn ? 'Filter and rank bids according to custom weights for duration, materials quality, ratings, and budgets.' : 'يقوم لترتيب وفلترة وتصفية البدائل طبقاً لأوزان السعر والالتزام الزمني ونوعية الخامات.'}
                                </p>
                              </div>
                              <span className="bg-[#123E32] text-emerald-300 text-[9px] font-black px-2.5 py-1 rounded-full shrink-0">
                                {isEn ? '⚡ Dynamic Weighting' : '⚡ أوزان تفاعلية وتحديث فوري'}
                              </span>
                            </div>

                            {/* 🎛️ NEW: Interactive Comparison Priority Switcher */}
                            <div className="bg-[#FAFDFB] border border-gray-150 p-4 rounded-xl space-y-3">
                              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold block text-right">
                                🎯 {isEn ? 'Override Comparison Principle / Primary Condition:' : 'تخصيص قواعد المقارنة: اضغط لتعديل مبدأ موازنة المفاضلة:'}
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
                                        ? 'bg-emerald-700 text-white shadow-xs' 
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

                             {/* 📋 NEW: Structured Conditions / Principles of Comparison Info */}
                             <div className="bg-white border border-gray-200/85 p-4 rounded-2xl space-y-3 text-right">
                               <h4 className={`text-xs font-black text-gray-800 flex items-center gap-1.5 ${isEn ? 'justify-start' : 'justify-start'}`} dir={isEn ? "ltr" : "rtl"}>
                                 <span className="text-sm">🏷️</span> <span>{isEn ? 'Guaranteed Comparison Terms & Compliance Guidelines:' : 'بنود وشروط الجودة المشمولة بالمقارنة تلقائياً:'}</span>
                               </h4>
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-3" dir={isEn ? "ltr" : "rtl"}>
                                 <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100/60 space-y-1 text-start">
                                   <span className="text-[10px] font-black text-[#0F7453] block">{isEn ? '🏅 Final Budget Without Increases:' : '🏅 ميزانية نهائية بلا زيادات:'}</span>
                                   <p className="text-[9px] leading-relaxed text-gray-600 font-semibold">{isEn ? 'Matching ensures foundational pricing stability, and specifying materials records the contract via Escrow.' : 'المطابقة تضمن ثبات التسعير التأسيسي، وتوصيف المواد بالدفعات يسجل قيم العقد المعتمد عبر Escrow.'}</p>
                                 </div>
                                 <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100/60 space-y-1 text-start">
                                   <span className="text-[10px] font-black text-blue-800 block">{isEn ? '📅 Full Compliance with Duration:' : '📅 التزام كامل بالمدة:'}</span>
                                   <p className="text-[9px] leading-relaxed text-gray-600 font-semibold">{isEn ? 'Shatibha contracts include a 0.5% delay penalty from the phase payment directly deducted in favor of the client upon breach.' : 'تضم عقود شطبها غرامة تأخير بقيمة 0.5% من دفعة المرحلة تخصم مباشرة لصالح العميل عند الإخلال.'}</p>
                                 </div>
                                 <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100/60 space-y-1 text-start">
                                   <span className="text-[10px] font-black text-purple-800 block">{isEn ? '🛠️ Material Matching and Approval:' : '🛠️ مطابقة الخامات واعتمادها:'}</span>
                                   <p className="text-[9px] leading-relaxed text-gray-600 font-semibold">{isEn ? 'Samples (e.g., Elsewedy cables, Jotun electrostatic) are inspected by a technical engineer to prevent commercial fraud.' : 'يتم فحص العينات (مثال: أسلاك السويدي، جوتن الكتروستاتيك) من مهندس فني لمنع الغش التجاري.'}</p>
                                 </div>
                               </div>
                             </div>
 
                             {/* 💡 Highlight Badges */}
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                               <div className="bg-white p-3.5 rounded-2xl border border-emerald-250 flex items-start gap-2.5 shadow-2xs">
                                 <div className="p-2 bg-[#F0F3F7] rounded-xl text-emerald-700">
                                   💵
                                 </div>
                                 <div className="space-y-0.5 text-right w-full">
                                   <span className="text-[9px] text-gray-400 font-bold block">{isEn ? 'Best Financial Savings' : 'أفضل وفر مالي (أرخص سعر)'}</span>
                                   <p className="text-xs font-black text-[#123E32]">
                                     {isEn ? `Quote #${requestOffers.indexOf(bestPriceOffer) + 1}` : `عرض رقم ${requestOffers.indexOf(bestPriceOffer) + 1}`}
                                   </p>
                                   <p className="text-[11px] font-bold text-emerald-600">
                                     {bestPriceOffer.price.toLocaleString()} {isEn ? 'EGP' : 'ج.م'}
                                   </p>
                                 </div>
                               </div>
  
                               {/* Duration Highlight */}
                               <div className="bg-white p-3.5 rounded-2xl border border-blue-200 flex items-start gap-2.5 shadow-2xs">
                                 <div className="p-2 bg-blue-50 rounded-xl text-blue-700">
                                   ⚡
                                 </div>
                                 <div className="space-y-0.5 text-right w-full">
                                   <span className="text-[9px] text-gray-400 font-bold block">{isEn ? 'Fastest Handover Track' : 'أسرع تسليم (أقصر مدة)'}</span>
                                   <p className="text-xs font-black text-gray-800">
                                     {isEn ? `Quote #${requestOffers.indexOf(fastestOffer) + 1}` : `عرض رقم ${requestOffers.indexOf(fastestOffer) + 1}`}
                                   </p>
                                   <p className="text-[11px] font-bold text-blue-600">
                                     {fastestOffer.durationDays} {isEn ? 'days limit' : 'يوماً فقط'}
                                   </p>
                                 </div>
                               </div>
  
                               {/* Rating Highlight */}
                               <div className="bg-white p-3.5 rounded-2xl border border-amber-200 flex items-start gap-2.5 shadow-2xs">
                                 <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
                                   ⭐
                                 </div>
                                 <div className="space-y-0.5 text-right w-full">
                                   <span className="text-[9px] text-gray-400 font-bold block">{isEn ? 'Highest Reviewed Quality' : 'الأعلى مراجعة (الأعلى تقييماً)'}</span>
                                   <p className="text-xs font-black text-gray-800">
                                     {isEn ? `Quote #${requestOffers.indexOf(bestRatedOffer) + 1}` : `عرض رقم ${requestOffers.indexOf(bestRatedOffer) + 1}`}
                                   </p>
                                   <div className="text-[11px] font-bold text-amber-600 flex items-center justify-end flex-row-reverse gap-1 mt-0.5" dir="rtl">
                                     <span className="flex text-amber-500 font-serif">
                                       {"★".repeat(Math.round(companies.find(c => c.id === bestRatedOffer.companyId)?.rating || 5))}
                                       {"☆".repeat(5 - Math.round(companies.find(c => c.id === bestRatedOffer.companyId)?.rating || 5))}
                                     </span>
                                     <span className="font-bold text-gray-700">({companies.find(c => c.id === bestRatedOffer.companyId)?.rating || 4.9})</span>
                                   </div>
                                 </div>
                               </div>
  
                             </div>
  
                             {/* Comparison Side-by-Side Table Layout */}
                             <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-2xs">
                               <div className="overflow-x-auto">
                                 <table className="w-full text-right text-[11px] border-collapse" dir={isEn ? 'ltr' : 'rtl'}>
                                   <thead>
                                     <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-extrabold font-sans">
                                       <th className="p-3 w-1/4 text-right">{isEn ? 'Comparison Metrics' : 'محددات المفاضلة والمقارنة'}</th>
                                       {requestOffers.map((off, idx) => (
                                         <th key={off.id} className="p-3 text-center border-r border-gray-150">
                                           {isEn ? `Quote #${idx + 1}` : `عرض سعر #${idx + 1}`} {bestPriceOffer.id === off.id && '🏅'}
                                         </th>
                                       ))}
                                     </tr>
                                   </thead>
                                   <tbody className="divide-y divide-gray-100 font-semibold text-[#232F3F]">
                                     
                                     {/* Dynamic Score Matching Indicator Row */}
                                     <tr className="bg-amber-55/10 font-bold border-b border-gray-200">
                                       <td className="p-3 bg-gray-50/40 text-blue-900 text-right">
                                         💯 {isEn ? 'Dynamic Matching Compatibility Score:' : 'مؤشر الملاءمة والنتيجة الإجمالية كشرط للقبول:'}
                                         <span className="block text-[8px] font-bold text-gray-400 font-mono">
                                           {isEn ? 'Dynamically matched based on Override criteria' : 'تقييم فوري للوزن النسبي لمبدأ الاختيار النشط'}
                                         </span>
                                       </td>
                                       {requestOffers.map((off) => {
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

                                     <tr>
                                       <td className="p-3 bg-gray-50/40 text-gray-500 font-bold text-right">{isEn ? 'Bidder Studio' : 'جهة الاستلام الفني'}</td>
                                       {requestOffers.map((off, idx) => {
                                         const comp = companies.find(c => c.id === off.companyId);
                                         const isContracted = selectedRequest?.status === 'ACTIVE';
                                         const compRealName = comp?.companyName || '';
                                         const first3 = compRealName ? compRealName.replace(/^(شركة|مكتب|مؤسسة|مجموعة|مؤسسه|مكتب الاستشارات الهندسية|Company|Office|Group|Studio)\s+/, '').trim().slice(0, 3) : '';
                                         const displayObfuscated = first3 ? `${isEn ? 'Studio' : 'شركة'} ${first3}...` : (isEn ? `Bid Offer ${idx + 1}` : `شركة عرض ${idx + 1}`);
                                         return (
                                           <td key={off.id} className="p-3 text-center border-r border-gray-150 text-emerald-800 font-bold">
                                             {isContracted ? (comp?.companyName || (isEn ? `Offer ${idx + 1}` : `شركة عرض ${idx + 1}`)) : (isEn ? `Offer (${idx + 1}) - ${displayObfuscated}` : `عرض رقم (${idx + 1}) - ${displayObfuscated}`)}
                                             <button 
                                               onClick={() => comp && setSelectedProfileCompany(comp)}
                                               className="block text-[8px] mx-auto text-blue-600 underline font-black mt-1 cursor-pointer hover:text-blue-700"
                                             >
                                               {isEn ? 'View gallery & reviews' : 'سابقة الأعمال والتقييمات الفنية ➔'}
                                             </button>
                                           </td>
                                         );
                                       })}
                                     </tr>
  
                                     <tr>
                                       <td className="p-3 bg-gray-50/40 text-gray-400 font-bold">{isEn ? 'Lump Sum Price' : 'القيمة المالية الكلية'}</td>
                                       {requestOffers.map((off) => (
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
  
                                      <tr>
                                        <td className="p-3 bg-gray-50/40 text-gray-455 font-bold">{isEn ? 'Implementation Time' : 'فترة وجدول التنفيذ المخطط'}</td>
                                        {requestOffers.map((off) => (
                                          <td key={off.id} className="p-3 text-center border-r border-gray-150">
                                            <div className="space-y-0.5">
                                              <span className={fastestOffer.id === off.id ? 'text-blue-600 font-bold' : ''}>
                                                {off.durationDays} {isEn ? 'days' : 'يوماً'}
                                              </span>
                                              {fastestOffer.id === off.id && (
                                                <span className="block text-[8px] font-black text-blue-500 bg-blue-50 rounded px-1 max-w-max mx-auto">
                                                  {isEn ? 'Fastest Handover ⚡' : 'الأسرع تخليصاً ⚡'}
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                        ))}
                                      </tr>
  
                                      <tr>
                                        <td className="p-3 bg-gray-50/40 text-gray-455 font-bold">{isEn ? 'Verified Works Rating' : 'تقييم وموثوقية سابقة الأعمال'}</td>
                                        {requestOffers.map((off) => {
                                          const comp = companies.find(c => c.id === off.companyId);
                                          const cRating = comp?.rating || 4.8;
                                          const roundedRating = Math.round(cRating);
                                          return (
                                            <td key={off.id} className="p-3 text-center border-r border-gray-150">
                                              <div className="flex flex-col items-center justify-center gap-1.5 flex-row-reverse">
                                                <div className="flex text-amber-500 text-xs leading-none">
                                                  {"★".repeat(roundedRating)}{"☆".repeat(5 - roundedRating)}
                                                </div>
                                                <div className="flex items-center gap-1 font-mono text-[9px] text-gray-500 font-bold">
                                                  <span>({cRating} / 5)</span>
                                                  {comp?.isVerified && (
                                                    <span className="bg-blue-500 text-white rounded-full text-[8.5px] p-0.5 inline-flex items-center justify-center w-3 h-3 font-sans font-black" title="Verified Partner">
                                                      ✓
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </td>
                                          );
                                        })}
                                      </tr>
  
                                      <tr>
                                        <td className="p-3 bg-gray-50/40 text-gray-455 font-bold">{isEn ? 'Materials & Specifications' : 'توصيف نوع الخامات والتشطيب'}</td>
                                        {requestOffers.map((off) => {
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
                                                  <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded ${breakdown.hasPremiumBrands ? 'bg-[#FAFDFB] text-[#0F7453]' : 'bg-gray-100 text-gray-550'}`}>
                                                    {breakdown.hasPremiumBrands ? '💡 خامات متميزة (السويدي الأصلي وجوتن)' : '⚠️ مواصفة أساسية'}
                                                  </span>
                                                </div>
                                              </div>
                                            </td>
                                          );
                                        })}
                                      </tr>
  
                                      <tr className="bg-[#F0F3F7]/10">
                                        <td className="p-3 bg-gray-50/40 text-[#123E32] font-black">{isEn ? 'AI Smart Recommendation' : 'قرار المفاضلة التلقائي'}</td>
                                        {requestOffers.map((off) => {
                                          const isBestPrice = bestPriceOffer.id === off.id;
                                          const isFastest = fastestOffer.id === off.id;
                                          const isBestRated = bestRatedOffer.id === off.id;
  
                                          return (
                                            <td key={off.id} className="p-3 text-center border-r border-gray-150">
                                              <div className="flex flex-col gap-1 items-center justify-center">
                                                {isBestPrice && (
                                                  <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm">
                                                    {isEn ? 'Financial Savings Choice' : 'نوصي به للتوفير المالي 💰'}
                                                  </span>
                                                )}
                                                {isFastest && !isBestPrice && (
                                                  <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm">
                                                    {isEn ? 'Fastest Completion Choice' : 'نوصي به لسرعة الاستلام ⚡'}
                                                  </span>
                                                )}
                                                {isBestRated && !isBestPrice && !isFastest && (
                                                  <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm">
                                                    {isEn ? 'Top Certified Trust Option' : 'نوصي به للجودة والسمعة الفنية ⭐'}
                                                  </span>
                                                )}
                                                {!isBestPrice && !isFastest && !isBestRated && (
                                                  <span className="text-gray-400 text-[8px] font-normal">
                                                    {isEn ? 'Balanced Compliant' : 'متوازن ومطابق للشروط'}
                                                  </span>
                                                )}
                                              </div>
                                            </td>
                                          );
                                        })}
                                      </tr>

                                      <tr className="bg-emerald-50/10 border-t border-gray-150">
                                        <td className="p-3 bg-[#EAF2EC] text-[#0F7453] font-black">{isEn ? 'Direct Contract Action' : 'إجراء التعاقد الفوري'}</td>
                                        {requestOffers.map((off) => {
                                          const comp = companies.find(c => c.id === off.companyId);
                                          const isContracted = selectedRequest?.status === 'ACTIVE' || selectedRequest?.status === 'COORDINATION';
                                          return (
                                            <td key={off.id} className="p-3 text-center border-r border-gray-150">
                                              {isContracted ? (
                                                <span className="text-emerald-700 font-extrabold text-[10px] bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded">
                                                  {isEn ? '✓ Selected & Signed' : '✓ تم اختيار العرض وتوقيع العقد'}
                                                </span>
                                              ) : (
                                                <button 
                                                  onClick={() => {
                                                    setViewingOfferDetails(off);
                                                  }}
                                                  className="bg-[#2B4D89] hover:bg-[#1E3A68] text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 shadow-3xs cursor-pointer block mx-auto whitespace-nowrap"
                                                >
                                                  🔍 {isEn ? 'Offer Details' : 'تفاصيل العرض'}
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
                             </div>
                           );
                         })()}
                       </div>
                     )}
                   </div>
                   {/* Original modal relocated to main layout for global accessibility */}
              </div>
    ) : null}

        {/* MULTI-PROJECT PROGRESS DASHBOARD (لوحة متابعة نسب إنجاز مشاريعك) - MOVED TO THE BOTTOM FOR BETTER UX */}
        <div className="bg-white border border-gray-150 rounded-3xl p-6 mt-10 shadow-xs space-y-4 text-right" dir={isEn ? "ltr" : "rtl"}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📊</span>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#232F3F] flex items-center">
                  {isEn ? 'Ongoing Project Progress Tracker (Per Property)' : 'لوحة متابعة نسب إنجاز مشاريعك الجارية (لكل مشروع على حدة)'}
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {isEn ? 'Instant comparison of independent site inspector validation logs per property' : 'مقارنة فورية لنسب تقدّم كل عقار مستقل بموجب تقارير المشرف الفني المعتمد'}
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-[#F0F3F7] text-[#2B4D89] border border-[#A5D6A7] font-black px-2.5 py-1 rounded-lg font-sans">
              {isEn ? 'Live Monitoring 🛡️' : 'تصفح ومراقبة حية 🛡️'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(() => {
              const activeContractedRequests = clientRequests.filter(r => r.status === 'ACTIVE' || r.status === 'DELAYED');
              if (activeContractedRequests.length === 0) {
                return (
                  <div className="col-span-1 md:col-span-2 bg-gray-50/60 rounded-3xl border-2 border-dashed border-gray-200 p-8 text-center text-xs font-semibold text-gray-400 space-y-2 select-none" dir={isEn ? "ltr" : "rtl"}>
                    <span className="text-3xl block">🏗️ ✨</span>
                    <p className="font-extrabold text-gray-500">{isEn ? 'No active finishing projects are currently undergoing on-site execution.' : 'لا توجد مشاريع جارية قيد التنفيذ والمتابعة الميدانية حالياً.'}</p>
                    <p className="text-[10px] text-gray-400/80 font-normal leading-relaxed max-w-lg mx-auto">
                      {isEn 
                        ? 'Your property project details and inspector validation milestones will be unlocked instantly here once approved & signed by the administrative team.'
                        : 'تظهر هنا تفاصیل ومراحل استلام بنود عقارك ونسب الإنجاز التفاعلية فور قيام الإدارة باعتماد التعاقد والموافقة على البدء.'}
                    </p>
                  </div>
                );
              }
              return activeContractedRequests.map(r => {
                const progress = getOverallProgress(r.id);
                const isSelected = selectedRequestId === r.id;
                
                const unitLabel = isEn ? `${getUnitTypeLabelOnly(r.unitType)} Project` : `مشروع الـ${r.unitType}`;
                
                // Project location display to distinguish multiple properties
                const prjLocation = r.detailedLocationText || (isEn ? 'Downtown Cairo District' : 'وسط البلد، القاهرة');
                const unitDetails = isEn 
                  ? `${r.area}m² • ${r.city === 'التجمع الخامس' ? '5th Settlement' : r.city} • 📍 Address: ${prjLocation}` 
                  : `${r.area}م² • ${r.city} • 📍 موقع المشروع: ${prjLocation}`;

                return (
                  <div 
                    key={r.id}
                    onClick={() => setSelectedRequestId(r.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                      isSelected 
                        ? 'bg-gradient-to-br from-[#FAFDFB] to-[#F1F8F5] border-[#2B4D89]/40 ring-1 ring-[#2B4D89]/30 shadow-xs' 
                        : 'bg-white hover:bg-gray-50/80 border-gray-150'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                         <span className="text-lg">
                          {getUnitIcon(r.unitType)}
                         </span>
                        <div className={isEn ? 'text-left' : 'text-right'}>
                          <h4 className="font-extrabold text-xs text-[#232F3F] flex items-center gap-1.5">
                            <span>{unitLabel}</span>
                            <span className="text-[9px] font-mono text-gray-400">({r.id})</span>
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">{unitDetails}</p>
                        </div>
                      </div>
                      <div className="shrink-0 font-extrabold">
                        <span className="text-xs font-black text-[#2B4D89]">
                          {isEn ? 'Completion: ' : 'نسبة الإنجاز: '} <span className="text-sm font-black text-[#2B4D89]">{progress}%</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Line */}
                    <div className="space-y-1.5">
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/20">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${
                            progress === 100 
                              ? 'bg-[#0F7453]' 
                              : progress > 50 
                                ? 'bg-[#2B4D89]' 
                                : 'bg-blue-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-extrabold text-gray-400">
                        <span>{isEn ? 'Status: ' : 'حالة المشروع: '} <strong className="text-[#2B4D89]">{
                          r.status === 'PENDING_REVIEW' ? (isEn ? 'Under Technical Review' : 'قيد المراجعة الفنية') :
                          r.status === 'UNDER_PRICING' ? (isEn ? 'Under Pricing (Live Tender)' : 'متاحة للتسعير (مستمرة)') :
                          r.status === 'OFFERS_RECEIVED' ? (isEn ? 'Offers Received' : 'تلقي العروض') :
                          r.status === 'CLIENT_SELECTED' ? (isEn ? 'Awaiting Inspection & Contract Signing ⏳' : 'في انتظار المعاينة وتوقيع العقود ⏳') :
                          r.status === 'COORDINATION' ? (isEn ? 'Awaiting Inspection & Contract Signing ⏳' : 'في انتظار المعاينة وتوقيع العقود ⏳') : 
                          r.actualStartDate ? (isEn ? '✓ Active Field Construction' : '✓ جاري التنفيذ الميداني') : (isEn ? '🤝 Contract Signed & Awaiting Start' : '🤝 تم التعاقد وبانتظار البدء')
                        }</strong></span>
                        {isSelected && <span className="text-[#2B4D89] font-black">{isEn ? '🔍 Selected Below' : '🔍 معروض حالياً بالأسفل'}</span>}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

      </div>

      {/* CONTRACTOR PROFILE PREVIEW MODAL - SAFE & NO DIRECT CONTACT DETAILS */}
      {selectedProfileCompany && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-2xl w-full overflow-hidden text-right relative animate-fadeIn my-8" dir={isEn ? 'ltr' : 'rtl'}>
            
            {/* Header section with cover image */}
            <div className="relative h-44 bg-slate-900 overflow-hidden">
              <img 
                src={selectedProfileCompany.coverUrl || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'} 
                alt="Company Cover" 
                className="w-full h-full object-cover opacity-70"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              
              {/* Close Button */}
              <button 
                onClick={() => {
                  setSelectedProfileCompany(null);
                  setPortfolioSearch('');
                  setPortfolioCategory('ALL');
                }}
                className="absolute top-4 left-4 bg-black/50 hover:bg-black/75 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-center cursor-pointer text-sm transition-all z-10"
              >
                ✕
              </button>

              {/* Floating ID Tag and Name in Cover */}
              <div className="absolute bottom-4 right-6 left-6 flex items-end justify-between flex-row-reverse">
                <div className="text-right">
                  {/* Dynamic masking check based on contract status for that request */}
                  {(() => {
                    const isContractedCompany = selectedRequest && 
                      (selectedRequest.status === 'CONTRACTED' || selectedRequest.status === 'ACTIVE' || selectedRequest.status === 'COMPLETED') && 
                      selectedRequest.selectedCompanyId === selectedProfileCompany.id;

                    const currentReqOffers = offers.filter(off => off.requestId === selectedRequest?.id);
                    const compOfferIdx = currentReqOffers.findIndex(off => off.companyId === selectedProfileCompany.id);
                    const maskedName = isEn 
                      ? `Certified Finishing Company #${compOfferIdx !== -1 ? compOfferIdx + 1 : 1}` 
                      : `شركة تشطيب معتمدة رقم #${compOfferIdx !== -1 ? compOfferIdx + 1 : 1}`;

                    const companyDisplayName = isContractedCompany ? selectedProfileCompany.companyName : maskedName;

                    return (
                      <>
                        <h3 className="text-lg md:text-xl font-black text-white hover:text-amber-300 transition-colors">
                          {companyDisplayName}
                        </h3>
                        <p className="text-xs text-white/80 font-bold mt-1">
                          {isContractedCompany 
                            ? (isEn ? '🤝 Direct Verified Contract Partner' : '🤝 شريك متعاقد فوري - الهوية مكشوفة بنجاح')
                            : (isEn ? '🛡️ Sealed Bidder Profile' : '🛡️ الملف التعريفي المقنع (نزاهة المنافسة)')
                          }
                        </p>
                      </>
                    );
                  })()}
                </div>

                {/* Company Logo Badge */}
                <div className="w-18 h-18 rounded-2xl bg-white p-1 shadow-md border-2 border-[#2B4D89] shrink-0 overflow-hidden flex items-center justify-center">
                  {selectedProfileCompany.logoUrl ? (
                    <img 
                      src={selectedProfileCompany.logoUrl} 
                      alt="Company Logo" 
                      className="w-full h-full object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-tr from-[#2B4D89] to-[#3a5d9c] text-white flex items-center justify-center font-black text-lg">
                      {selectedProfileCompany.companyName?.slice(0, 2) || 'تش'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TAB SELECTOR OPTIONS */}
            <div className="flex border-b border-gray-150 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setProfileModalTab('ABOUT')}
                className={`flex-1 py-3 text-center text-xs font-black border-b-2 transition-all ${profileModalTab === 'ABOUT' ? 'border-[#2B4D89] text-[#2B4D89] bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
              >
                🏢 {isEn ? 'About & Packages' : 'نبذة وباقات وعروض التشطيب'}
              </button>
              <button
                type="button"
                onClick={() => setProfileModalTab('PORTFOLIO')}
                className={`flex-1 py-3 text-center text-xs font-black border-b-2 transition-all ${profileModalTab === 'PORTFOLIO' ? 'border-[#2B4D89] text-[#2B4D89] bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
              >
                📐 {isEn ? 'Portfolios & Before/After' : 'سابقة الأعمال وعرض قبل وبعد'}
              </button>
              <button
                type="button"
                onClick={() => setProfileModalTab('REVIEWS')}
                className={`flex-1 py-3 text-center text-xs font-black border-b-2 transition-all ${profileModalTab === 'REVIEWS' ? 'border-[#2B4D89] text-[#2B4D89] bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
              >
                ⭐ {isEn ? 'Performance & Ratings' : 'مؤشرات الأداء وتقييم الجودة'}
              </button>
            </div>

            {/* MODAL Dynamic Content */}
            <div className="p-6 max-h-[50vh] overflow-y-auto space-y-6">
              
              {profileModalTab === 'ABOUT' && (
                <div className="space-y-6 text-right">
                  {/* General company description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-[#2B4D89]">{isEn ? 'Company Identity' : 'عن جهة التشطيب ورؤيتها الفنية'}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed font-bold bg-gray-50 p-3.5 rounded-2xl border border-gray-150">
                      {selectedProfileCompany.aboutText || (isEn ? 'Official finishing contractor partner with high standards.' : 'شريك معتمد من الفئة الفنية الراقية لتنفيذ كافة أعمال التأسيس والتشطيب والديكور.')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <span className="block text-[10px] text-gray-400 font-bold">{isEn ? 'Established Year' : 'سنة التأسيس'}</span>
                      <strong className="text-xs text-gray-800 font-black">{selectedProfileCompany.establishedYear || 2019} م</strong>
                    </div>
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <span className="block text-[10px] text-gray-400 font-bold">{isEn ? 'Geographic Coverage' : 'النطاق الجغرافي للمشاريع'}</span>
                      <strong className="text-xs text-indigo-900 font-black">
                        {(selectedProfileCompany.governorates || []).join('، ')} 
                        {selectedProfileCompany.cities && selectedProfileCompany.cities.length > 0 && ` (${selectedProfileCompany.cities.slice(0, 3).join(' - ')})`}
                      </strong>
                    </div>
                  </div>

                  {/* Pricing / Finishing levels packages */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-row-reverse border-b pb-2 border-gray-100">
                      <h4 className="text-xs font-black text-[#2B4D89]">{isEn ? 'Finishing Packages catalog' : 'باقات ومستويات التشطيب الممتازة بالشركة:'}</h4>
                      <span className="text-[10px] bg-[#2B4D89]/8 text-[#2B4D89] px-2.5 py-0.5 rounded-md font-bold">بأسعار المتر المربع</span>
                    </div>

                    {selectedProfileCompany.packages && selectedProfileCompany.packages.length > 0 ? (
                      <div className="space-y-4">
                        {selectedProfileCompany.packages.map((pkg) => (
                          <div key={pkg.id} className="bg-gradient-to-r from-[#FAFDFB] to-slate-50 p-4 border border-gray-150 rounded-2xl relative shadow-3xs text-right">
                            <span className="absolute top-4 left-4 font-mono font-black text-[#0F7453] bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-md text-[10px]">
                              {pkg.pricePerSqm.toLocaleString()} ج.م / م²
                            </span>
                            <h5 className="font-extrabold text-[#2B4D89] text-xs">🛠️ {pkg.name}</h5>
                            <p className="text-[10.5px] text-gray-500 mt-1 leading-relaxed font-bold">{pkg.description}</p>
                            
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-1.5 pt-3 border-t border-gray-150/50">
                              {pkg.features.map((feat, fIdx) => (
                                <div key={fIdx} className="flex items-center gap-1.5 justify-end text-[9.5px] text-slate-700 font-bold">
                                  <span>{feat}</span>
                                  <span className="text-emerald-500">✓</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 font-bold text-center py-4">
                        (لم تقم هذه الشركة بإدراج باقات تفصيلية منفصلة للأسعار بعد، يمكنك الرجوع لملخص العطاء)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {profileModalTab === 'PORTFOLIO' && (
                <div className="space-y-5 text-right">
                  {/* Search and filter bar */}
                  <div className="flex flex-col md:flex-row gap-2 relative bg-gray-50 p-2.5 rounded-2xl border border-gray-150">
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 text-gray-400 absolute top-2.5 right-3" />
                      <input 
                        type="search" 
                        value={portfolioSearch}
                        onChange={(e) => setPortfolioSearch(e.target.value)}
                        placeholder={isEn ? "Search inside portfolio projects..." : "ابحث باسم المشروع أو المحافظة..."}
                        className="w-full text-right bg-white pr-9 pl-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2B4D89] font-bold"
                      />
                    </div>
                    {/* Categories tag filter */}
                    <div className="flex gap-1 justify-end flex-wrap">
                      {['ALL', 'سكني', 'تجاري', 'إداري'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setPortfolioCategory(cat)}
                          className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all border cursor-pointer ${portfolioCategory === cat ? 'bg-[#2B4D89] text-white border-[#2B4D89]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                        >
                          {cat === 'ALL' ? (isEn ? 'All' : 'الكل') : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Portfolio Gallery showing before/after photos togglers */}
                  {(() => {
                    const filteredPortfolio = (selectedProfileCompany.portfolio || []).filter(item => {
                      const matchesSearch = item.projectName.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
                        item.governorate.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
                        (item.description || '').toLowerCase().includes(portfolioSearch.toLowerCase());
                      const matchesCat = portfolioCategory === 'ALL' || item.projectType === portfolioCategory;
                      return matchesSearch && matchesCat;
                    });

                    if (filteredPortfolio.length === 0) {
                      return (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 font-bold text-xs space-y-1">
                          <p>📭 {isEn ? 'No portfolio works match the search query.' : 'لا يوجد مشاريع سابقة مطابقة لبحثك في معرض الأعمال.'}</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{isEn ? 'Try typing another keyword' : 'جرب كتابة رمز آخر أو تحديد تصنيف مشاريع بديل'}</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredPortfolio.map((item) => {
                          const currentToggle = beforeAfterToggle[item.id] || 'AFTER';
                          
                          // Determine display image depending on beforeAfter toggle state
                          const hasBeforeAfter = item.beforeImages && item.beforeImages.length > 0 && item.afterImages && item.afterImages.length > 0;
                          let displayImg = item.images[0] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80';
                          if (hasBeforeAfter) {
                            displayImg = currentToggle === 'BEFORE' 
                              ? (item.beforeImages ? item.beforeImages[0] : displayImg)
                              : (item.afterImages ? item.afterImages[0] : displayImg);
                          }

                          return (
                            <div key={item.id} className="border border-gray-150 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow relative">
                              {/* Photo Canvas */}
                              <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                                <img 
                                  src={displayImg} 
                                  alt={item.projectName} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded-md font-bold">
                                  📅 {item.executionYear} m
                                </span>
                                <span className="absolute top-2 left-2 bg-indigo-900 text-white text-[9px] px-2 py-0.5 rounded-md font-black">
                                  💎 {item.projectType}
                                </span>
                                <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-md font-black">
                                  📍 {item.governorate}
                                </span>
                              </div>

                              {/* Interactive before/after toggle bar if provided */}
                              {hasBeforeAfter && (
                                <div className="p-1 px-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-1">
                                  <span className="text-[9.5px] text-slate-500 font-extrabold flex items-center gap-1">
                                    <span>📸</span>
                                    <span>{currentToggle === 'BEFORE' ? 'رؤية الحالة: قبل التشطيب' : 'رؤية الحالة: بعد التشطيب ✨'}</span>
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setBeforeAfterToggle(prev => ({...prev, [item.id]: 'BEFORE'}))}
                                      className={`px-2 py-0.5 text-[8.5px] rounded-md font-black ${currentToggle === 'BEFORE' ? 'bg-[#2B4D89] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                      قبل / أثناء العمل
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setBeforeAfterToggle(prev => ({...prev, [item.id]: 'AFTER'}))}
                                      className={`px-2 py-0.5 text-[8.5px] rounded-md font-black ${currentToggle === 'AFTER' ? 'bg-emerald-650 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                      بعد التسليم ✨
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Project info card */}
                              <div className="p-3 text-right space-y-1">
                                <h5 className="font-extrabold text-xs text-gray-800">{item.projectName}</h5>
                                <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed font-semibold">
                                  {item.description || "مشروع مميز تم استخدام أجود الخامات الهندسية المعتمدة في التأسيس والتشطيب والديكور تحت إشراف هندسي متكامل."}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {profileModalTab === 'REVIEWS' && (
                <div className="space-y-6 text-right">
                  
                  {/* KPI Performance metrics gauges */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-[#2B4D89]">{isEn ? 'Fiducial performance reviews' : 'مؤشرات الأداء والجودة الفنية للشركة (شطبها-مترز)'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      
                      {/* Punctuality Meter */}
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 text-right">
                        <div className="flex items-center justify-between flex-row-reverse mb-2">
                          <span className="text-[11px] font-extrabold text-gray-700">⏱️ {isEn ? 'Timing Commitment rate' : 'معدل الالتزام بالمواعيد الجداول'}</span>
                          <span className="text-xs font-black text-[#2B4D89]">{selectedProfileCompany.timingCommitment || 97} %</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-tr from-[#2B4D89] to-indigo-500 h-full rounded-full" style={{ width: `${selectedProfileCompany.timingCommitment || 97}%` }}></div>
                        </div>
                        <span className="text-[8.5px] text-gray-400 block mt-1 font-bold">حسب تقارير الزيارات للمشرف الميداني المعتمدة والعملاء</span>
                      </div>

                      {/* Technical Approval Meter */}
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 text-right">
                        <div className="flex items-center justify-between flex-row-reverse mb-2">
                          <span className="text-[11px] font-extrabold text-gray-700">🔍 {isEn ? 'Inspector Approval Acceptance' : 'معدل اعتماد المراحل من المشرف الفني'}</span>
                          <span className="text-xs font-black text-[#0F7453]">{selectedProfileCompany.inspectorApprovalRate || 98} %</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-tr from-[#0F7453] to-emerald-400 h-full rounded-full" style={{ width: `${selectedProfileCompany.inspectorApprovalRate || 98}%` }}></div>
                        </div>
                        <span className="text-[8.5px] text-gray-400 block mt-1 font-bold">بموافقة الاستشاري ودون حاجة لتعديلات متكررة في بنود التأسيس</span>
                      </div>

                    </div>

                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      <div className="bg-[#FAFDFB] p-2.5 rounded-xl border border-emerald-500/10 text-center">
                        <span className="block text-[8px] text-emerald-800 font-bold">{isEn ? 'Total projects' : 'مشاريع منفذة'}</span>
                        <strong className="text-sm font-black text-emerald-700 font-mono">{selectedProfileCompany.projectsCompleted || 35}</strong>
                      </div>
                      <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-500/10 text-center">
                        <span className="block text-[8px] text-blue-800 font-bold">{isEn ? 'Across platform' : 'مكتملة عبر شطبها'}</span>
                        <strong className="text-sm font-black text-blue-700 font-mono">{selectedProfileCompany.projectsThroughShattabha || 8}</strong>
                      </div>
                      <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-500/10 text-center">
                        <span className="block text-[8px] text-amber-800 font-bold">{isEn ? 'Rating Average' : 'متوسط التقييم'}</span>
                        <strong className="text-sm font-black text-amber-600 font-mono">{selectedProfileCompany.rating || 4.9} ★</strong>
                      </div>
                    </div>
                  </div>

                  {/* Customer comments */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-black text-[#2B4D89] block">
                      ⭐ {isEn ? "Customer Reviews" : "مراجعات مكتوبة وآراء عملاء المنصة:"}
                    </span>
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {[
                        { user: isEn ? 'Mrs. Yasmin S.' : 'أ. ياسمين الشربيني', stars: 5, date: 'أبريل 2026', comment: isEn ? 'Extremely clean finishes, highly organized workers' : 'أبهرتني جودة الدهانات والجبس بورد والتركيز العالي على النظافة طوال التواجد بالموقع، شريك ممتاز.' },
                        { user: isEn ? 'Eng. Tarek F.' : 'المهندس طارق فتح الله', stars: 4.8, date: 'مايو 24, 2026', comment: isEn ? 'Precision timing and great electrical conduit تأسيس' : 'فريق هندسي منضبط جداً ومواعيد تسليم متسقة ولم توجد أي تسريبات مياه أو مشاكل عزل كلياً في اختبارات الضغط والترطيب.' }
                      ].map((rev, rIdx) => (
                        <div key={rIdx} className="bg-gray-50/60 p-3 rounded-2xl border border-gray-100 text-[10.5px] space-y-1.5 text-right">
                          <div className="flex items-center justify-between flex-row-reverse text-gray-500">
                            <span className="font-extrabold text-gray-750">{rev.user}</span>
                            <span className="font-mono text-[9px] text-gray-400">{rev.date}</span>
                          </div>
                          <p className="text-[#30445E] font-medium leading-relaxed">"{rev.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* SECURITY CONTACT DATA PROTECTION LOCK SECTION */}
              {(() => {
                const isContractedCompany = selectedRequest && 
                  (selectedRequest.status === 'CONTRACTED' || selectedRequest.status === 'ACTIVE' || selectedRequest.status === 'COMPLETED') && 
                  selectedRequest.selectedCompanyId === selectedProfileCompany.id;

                if (isContractedCompany) {
                  return (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 rounded-2xl p-4 text-[11px] leading-relaxed text-right border border-emerald-500/20 space-y-3 shadow-3xs animate-pulse">
                      <div className="flex items-center gap-1.5 justify-end">
                        <strong className="text-emerald-950 font-black">📞 تم كشف بيانات التواصل للشركة المتعاقدة بنجاح</strong>
                        <span>🔓</span>
                      </div>
                      <p className="font-semibold text-emerald-900 leading-normal">
                        نظرًا لكون هذه الشركة هي المقاول المختار لطلبك الموثق فإنه يتاح لك الآن الاتصال بالمسؤول مباشرة عبر قنوات الاتصال والروابط المخصصة أدناه:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[#30445E] font-bold">
                        <a href={`tel:${selectedProfileCompany.phone || '+201004882911'}`} className="bg-white hover:bg-[#FAFDFB] p-2.5 rounded-xl border border-emerald-500/10 flex items-center gap-2 justify-end transition-colors">
                          <strong className="text-[11px]" dir="ltr">{selectedProfileCompany.phone || '+20 100 488 2911'}</strong>
                          <span className="text-gray-400 text-[10px]">الهاتف المباشر 📞</span>
                        </a>
                        <a href={`https://wa.me/${selectedProfileCompany.whatsapp?.replace(/[^0-9]/g, '') || '201004882911'}`} target="_blank" rel="noreferrer" className="bg-white hover:bg-emerald-50 p-2.5 rounded-xl border border-emerald-500/10 flex items-center gap-2 justify-end transition-colors">
                          <strong className="text-[11px]" dir="ltr">{selectedProfileCompany.whatsapp || '+20 100 488 2911'}</strong>
                          <span className="text-emerald-500 text-[10px]">مراسلة واتساب 💬</span>
                        </a>
                        <a href={`mailto:${selectedProfileCompany.email || 'info@luxspace.com'}`} className="bg-white hover:bg-slate-50 p-2.5 rounded-xl border border-emerald-500/10 flex items-center gap-2 justify-end transition-colors">
                          <strong className="text-[11px]">{selectedProfileCompany.email || 'contact@shattabba-partner.com'}</strong>
                          <span className="text-gray-400 text-[10px]">البريد الإلكتروني ✉️</span>
                        </a>
                        <a href={selectedProfileCompany.website || '#'} target="_blank" rel="noreferrer" className="bg-white hover:bg-slate-50 p-2.5 rounded-xl border border-emerald-500/10 flex items-center gap-2 justify-end transition-colors">
                          <strong className="text-[11px] text-blue-600 underline">{selectedProfileCompany.website || 'shattabba-partner.com'}</strong>
                          <span className="text-gray-400 text-[10px]">الموقع الإلكتروني 🌐</span>
                        </a>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-emerald-500/10 text-right">
                        <span className="block text-[9.5px] text-gray-400 font-bold">عنوان المقر الإداري للشركة لتوقيع العقود والمعاينة:</span>
                        <strong className="text-xs text-[#30445E] font-black block mt-0.5">{selectedProfileCompany.officeAddress || "شارع التسعين الشمالي، التجمع الخامس، مبنى ميراد الإداري، مكتب ٤٠٤"}</strong>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-rose-500/5 text-rose-700 rounded-2xl p-4 text-[10.5px] font-extrabold leading-relaxed text-right border border-rose-500/10 space-y-2">
                      <div className="flex items-center gap-1.5 justify-end text-rose-800">
                        <strong className="font-black">🔒 حماية بيانات التواصل (سياسة إخفاء الهوية بمرحلة المنافسة)</strong>
                        <span>🔒</span>
                      </div>
                      <p className="leading-relaxed font-bold">
                        تلتزم شطبها بحماية بيانات التواصل للشركة وعنوان المكتب والروابط المباشرة لضمان نزاهة العطاءات المغلقة ومنع الاتصالات الجانبية غير الموثقة خارج المنصة.
                      </p>
                      <p className="text-[9.5px] text-rose-600 font-semibold leading-normal">
                        * سيتم فتح كافة هذه البيانات وتفاصيل الاتصال، الهاتف، وموقع الخريطة والواتساب والبريد تلقائياً للطرفين فور اختيارك لهذا العرض والاعتماد من مشرف شطبها الفني والإدارة لتسهيل المتابعة على الأرض.
                      </p>
                    </div>
                  );
                }
              })()}

            </div>

            {/* Footer buttons */}
            <div className="p-5 bg-gray-50 border-t border-gray-150 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedProfileCompany(null);
                  setPortfolioSearch('');
                  setPortfolioCategory('ALL');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-extrabold text-xs cursor-pointer text-center transition-colors shadow-3xs"
              >
                {isEn ? 'Close Details' : 'إغلاق والرجوع للعطاءات ➔'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CLIENT USER PROFILE & AVATAR SETTINGS EDIT MODAL */}
      {isProfileSettingsOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-lg w-full overflow-hidden text-right relative animate-fadeIn" dir={isEn ? 'ltr' : 'rtl'}>
            
            <div className="bg-[#2B4D89] p-5 text-white flex items-center justify-between flex-row-reverse">
              <h3 className="font-black text-xs text-[#D8B448]">
                ⚙️ {isEn ? "Edit Client Profile & Photo settings" : "إدارة الملف الشخصي والصورة الشخصية للعملاء"}
              </h3>
              <button 
                onClick={() => {
                  setIsProfileSettingsOpen(false);
                  setCameraSimulationActive(false);
                }}
                className="bg-white/10 hover:bg-white/25 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-center cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              localStorage.setItem('shattabba_client_name', clientName);
              localStorage.setItem('shattabba_client_email', clientEmail);
              if (clientAvatar) {
                localStorage.setItem('shattabba_client_avatar', clientAvatar);
              } else {
                localStorage.removeItem('shattabba_client_avatar');
              }
              setIsProfileSettingsOpen(false);
              setCameraSimulationActive(false);
            }} className="p-6 space-y-6">

              {/* 1. Profile Picture Management Space */}
              <div className="space-y-3">
                <span className="text-[11px] font-black text-gray-700 block mb-1">
                  📸 الصورة الشخصية للعميل (Profile Picture)
                </span>

                <div className="flex flex-col md:flex-row items-center gap-5 bg-gray-50 p-4 rounded-2xl border border-gray-150">
                  
                  {/* Current Active Avatar View */}
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-tr from-[#2B4D89] to-[#3a5d9c] text-white flex items-center justify-center font-black text-2xl border-4 border-white shadow-md">
                      {clientAvatar ? (
                        <img src={clientAvatar} alt="Client avatar preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span>{clientName ? clientName.trim().slice(0, 2) : 'أر'}</span>
                      )}
                    </div>
                    {clientAvatar && (
                      <button
                        type="button"
                        onClick={() => {
                          setClientAvatar(null);
                        }}
                        className="absolute -top-2 -left-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow cursor-pointer transition-colors"
                        title="حذف الصورة والرجوع للحروف الافتراضية"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Actions Block */}
                  <div className="text-right flex-1 space-y-2">
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      يمكنك رفع صورة من مخزن جهازك بصيغة (JPG, PNG, WEBP) أو مزامنة حساب التواصل للحسابات المربوطة.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 text-right justify-start">
                      {/* Simulated upload select */}
                      <label className="bg-white hover:bg-slate-50 text-slate-700 border border-gray-250 hover:border-gray-300 px-3 py-1.5 rounded-xl text-[10px] font-black transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-3xs">
                        📁 رفع صورة من الجهاز
                        <input 
                          type="file" 
                          accept=".jpg,.jpeg,.png,.webp"
                          className="hidden" 
                          onChange={(e) => {
                            const mockAvatars = [
                              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
                              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
                              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
                              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
                            ];
                            const randomPic = mockAvatars[Math.floor(Math.random() * mockAvatars.length)];
                            setClientAvatar(randomPic);
                          }}
                        />
                      </label>

                      {/* Snap with cell Camera */}
                      <button
                        type="button"
                        onClick={() => {
                          setCameraSimulationActive(true);
                          setCameraPicIndex(0);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-[#2B4D89] px-3 py-1.5 rounded-xl text-[10px] font-black transition-colors flex items-center gap-1 cursor-pointer border border-gray-200"
                      >
                        📸 التقاط بالكاميرا (محاكاة الجوال)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Camera Snapshot Simulation Block inside form */}
                {cameraSimulationActive && (
                  <div className="bg-slate-900 rounded-2xl p-4 text-center border-2 border-dashed border-sky-400 space-y-4 animate-fadeIn relative overflow-hidden">
                    <span className="absolute top-2 right-2 bg-sky-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse">
                      🔴 كاميرا نشطة الآن
                    </span>
                    
                    <div className="mx-auto w-36 h-36 rounded-full bg-slate-950 border-4 border-slate-700 overflow-hidden relative flex items-center justify-center text-white">
                      {cameraPicIndex === 0 ? (
                        <div className="space-y-1 p-2 text-center">
                          <span className="text-xl animate-bounce block">📷</span>
                          <span className="text-[9px] text-gray-400 font-bold block">اضغط زر الالتقاط لتصوير الكاميرا الفوري</span>
                        </div>
                      ) : (
                        <img 
                          src={cameraPicIndex === 1 
                            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                            : "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
                          } 
                          alt="Captured client" 
                          className="w-full h-full object-cover animate-pulse"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>

                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const snd = Math.random() > 0.5 ? 1 : 2;
                          setCameraPicIndex(snd);
                          const chosenUrl = snd === 1 
                            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                            : "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80";
                          setClientAvatar(chosenUrl);
                        }}
                        className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-3 py-1.5 text-[9.5px] font-black shadow cursor-pointer active:scale-95 transition-all"
                      >
                        التقاط صورة 📸 (Flash)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCameraSimulationActive(false)}
                        className="bg-transparent text-gray-400 hover:text-white px-3 py-1.5 text-[9.5px] font-bold"
                      >
                        إلغاء لقطة الكاميرا
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Google / Facebook / Apple Sync Shortcut */}
              <div className="space-y-2 text-right">
                <span className="text-[11px] font-black text-gray-700 block">
                  🌐 تسجيل الدخول السريع ومزامنة منصات التواصل الاجتماعي
                </span>
                <p className="text-[9.5px] text-gray-400 font-bold leading-normal">
                  استيراد تفاصيل بروفايلك كلياً بضغطة زر واحدة (الاسم، البريد، الصورة الشخصية) تلقائياً:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setClientName("أحمد الرشيدي (Google 👤)");
                      setClientEmail("ahmed.rashidy.google@gmail.com");
                      setClientAvatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80");
                    }}
                    className="p-2 sm:p-3 bg-white hover:bg-[#FAFDFB] rounded-2xl border border-gray-200 text-center cursor-pointer hover:border-[#2B4D89] transition-all"
                  >
                    <span className="text-xl block">🌐</span>
                    <span className="text-[8.5px] text-[#2D3748] font-black block mt-1">حساب جوغل (Google)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setClientName("أحمد الرشيدي (Facebook 👥)");
                      setClientEmail("ahmed.rashidy.facebook@concept.com");
                      setClientAvatar("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80");
                    }}
                    className="p-2 sm:p-3 bg-white hover:bg-blue-50/50 rounded-2xl border border-gray-200 text-center cursor-pointer hover:border-blue-600 transition-all"
                  >
                    <span className="text-xl block">👤</span>
                    <span className="text-[8.5px] text-[#2D3748] font-black block mt-1">حساب فيسبوك (Facebook)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setClientName("أحمد الرشيدي (Apple 🍏)");
                      setClientEmail("ahmed.rashidy@applemail.com");
                      setClientAvatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80");
                    }}
                    className="p-2 sm:p-3 bg-white hover:bg-slate-50 rounded-2xl border border-gray-200 text-center cursor-pointer hover:border-slate-800 transition-all"
                  >
                    <span className="text-xl block">🍏</span>
                    <span className="text-[8.5px] text-[#2D3748] font-black block mt-1">حساب آبل (Apple Sync)</span>
                  </button>
                </div>
              </div>

              {/* 3. Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-[11px] font-black text-gray-700">{isEn ? 'Full Name' : 'اسم العميل بالمنصة'}</label>
                  <input 
                    type="text" 
                    required
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full text-right bg-gray-50 border border-gray-200 hover:border-gray-300 p-2.5 rounded-xl text-xs font-bold text-gray-800 focus:outline-[#2B4D89] transition-colors"
                  />
                </div>
                <div className="space-y-1.5 text-right">
                  <label className="text-[11px] font-black text-gray-700">{isEn ? 'Authorized Email' : 'البريد الإلكتروني للعميل'}</label>
                  <input 
                    type="email" 
                    required
                    value={clientEmail} 
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full text-right bg-gray-50 border border-gray-200 hover:border-gray-300 p-2.5 rounded-xl text-xs font-bold text-gray-800 focus:outline-[#2B4D89] transition-colors"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-150/50">
                <button
                  type="submit"
                  className="flex-1 bg-[#2B4D89] hover:bg-[#30445E] text-white py-2.5 sm:py-3 rounded-xl font-extrabold text-xs cursor-pointer text-center transition-colors shadow-3xs"
                >
                  {isEn ? 'Save Changes' : 'حفظ وتحديث الملف الشخصي وبس'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileSettingsOpen(false);
                    setCameraSimulationActive(false);
                  }}
                  className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-xs"
                >
                  {isEn ? 'Cancel' : 'تراجع'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 🌟 PREMIUM NEW FINISHING REQUEST FULL OVERLAY MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-xs flex items-center justify-center z-[3000] p-2.5 sm:p-4 overflow-y-auto animate-fade-in text-right" dir={isEn ? "ltr" : "rtl"}>
          <div className="bg-white rounded-[24px] border border-gray-150 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col relative animate-scale-up text-[#1D2736]">
            
            {/* Form header with matching blue gradient background */}
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2B4D89] p-4 sm:p-5 text-white relative flex flex-col items-center justify-center text-center shadow-md select-none shrink-0">
              {/* Close Button Integrated inside header */}
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="absolute top-3.5 left-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-all font-black text-xs cursor-pointer border border-white/25"
                title={isEn ? "Close" : "إغلاق"}
              >
                ✕
              </button>

              <div className="space-y-1 text-center">
                <h3 className="font-extrabold text-white text-base sm:text-lg md:text-xl flex items-center justify-center gap-1.5">
                  <span className="w-6.5 h-6.5 bg-white/20 text-white rounded-lg flex items-center justify-center text-xs font-black">＋</span>
                  <span>{isEn ? 'Submit New Finishing Ticket' : 'تقديم طلب تشطيب جديد'}</span>
                </h3>
                <p className="text-[10px] text-blue-100 max-w-md font-medium leading-none mt-1 opacity-90">
                  {isEn ? 'Your ticket will be vetted geographically & technically by Shatibha board before launching closed bids.' : 'سيخضع الطلب لاعتماد فني وجغرافي فوري من إدارة "شطبها" الموقرة قبل فتح عروض التسعير من المقاولين.'}
                </p>
              </div>
            </div>

            {/* Form payload scrollbar container */}
            <form onSubmit={handleAddRequestSubmit} className="space-y-3 p-4 sm:p-5 overflow-y-auto decor-scrollbar flex-1 text-[11px]">
              
              {/* Section 1: Basic Specifications (البيانات الأساسية للوحدة) */}
              <div className="space-y-3 bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] p-3 rounded-2xl border border-gray-200 shadow-3xs text-right">
                <span className="font-extrabold text-xs text-[#2B4D89] flex items-center justify-start gap-1.5 pb-2 border-b border-gray-200/60">
                  <Building2 className="w-3.5 h-3.5 text-[#2B4D89]" />
                  <span>{isEn ? 'Property Sizing & Specs' : 'مواصفات وحجم الوحدة العقارية'}</span>
                </span>

                {/* Property type, Area, Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  
                  {/* Unit Type Selection */}
                  <div className="sm:col-span-4 space-y-1 text-right">
                    <label className="block text-[10px] font-bold text-gray-600">{isEn ? 'Property Type' : 'نوع العقار'}</label>
                    <select
                      value={unitType}
                      onChange={(e) => setUnitType(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 hover:border-gray-300 transition-all text-xs rounded-xl outline-none text-[#1D2736] focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/10 font-extrabold cursor-pointer h-9.5 shadow-3xs"
                    >
                      {['شقة', 'فيلا', 'مكتب', 'محل تجاري', 'عيادة', 'شاليه'].map((t) => {
                        const typeLabelMap: Record<string, string> = {
                          'شقة': isEn ? 'Apartment 🏢' : 'شقة 🏢',
                          'فيلا': isEn ? 'Villa 🏡' : 'فيلا 🏡',
                          'مكتب': isEn ? 'Office 💼' : 'مكتب 💼',
                          'محل تجاري': isEn ? 'Commercial Shop 🛍️' : 'محل تجاري 🛍️',
                          'عيادة': isEn ? 'Clinic 🏥' : 'عيادة 🏥',
                          'شاليه': isEn ? 'Chalet 🏖️' : 'شاليه 🏖️'
                        };
                        return (
                          <option key={t} value={t}>
                            {typeLabelMap[t] || t}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Area Input */}
                  <div className="sm:col-span-4 space-y-1 text-right">
                    <label className="block text-[10px] font-bold text-gray-600">{isEn ? 'Area (m²)' : 'المساحة الإجمالية (م²)'}</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required 
                        min="10" 
                        max="10000"
                        value={area || ''} 
                        onChange={e => setArea(Number(e.target.value))}
                        className="w-full py-1.5 pr-2 pl-9 bg-white border border-gray-200 hover:border-gray-300 transition-all rounded-xl outline-none text-[#1D2736] focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/10 font-black text-xs text-center h-9.5 shadow-3xs"
                      />
                      <span className="absolute left-2.5 top-2.5 text-[9px] text-gray-400 font-bold font-sans">M²</span>
                    </div>
                  </div>

                  {/* Budget Input */}
                  <div className="sm:col-span-4 space-y-1 text-right">
                    <label className="block text-[10px] font-bold text-gray-600">{isEn ? 'Est. Budget (EGP)' : 'الميزانية التقريبية (ج.م)'}</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required 
                        min="1000"
                        value={budget || ''} 
                        onChange={e => setBudget(Number(e.target.value))}
                        className="w-full py-1.5 pr-2 pl-10 bg-white border border-gray-200 hover:border-gray-300 transition-all rounded-xl outline-none text-[#2B4D89] focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/10 font-black text-xs text-center h-9.5 shadow-3xs"
                      />
                      <span className="absolute left-2.5 top-2.5 text-[9px] text-[#2D4D89]/60 font-bold font-sans">EGP</span>
                    </div>
                  </div>

                </div>

                {/* Rooms size row (Bedrooms, Bathrooms, Kitchens) - Sleek, uniform, responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#F4F6FA] p-2 rounded-2xl">
                  {/* Bedrooms */}
                  <div className="flex flex-row items-center justify-between gap-1.5 bg-white p-2 px-2.5 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[12px] select-none shrink-0">🛏️</span>
                      <span className="text-[10px] font-black text-slate-800 whitespace-nowrap shrink-0">
                        {isEn ? 'Bedrooms' : 'غرف النوم'}<span className="text-rose-500 mr-0.5">*</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100/80 rounded-lg p-0.5 h-7 shrink-0">
                      <button
                        type="button"
                        onClick={() => setBedroomsCount(Math.max(0, Number(bedroomsCount || 0) - 1))}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white hover:bg-[#2B4D89] hover:text-white text-[#2B4D89] transition-all select-none text-xs active:scale-90 font-extrabold cursor-pointer border-none shadow-3xs"
                      >
                        −
                      </button>
                      <input 
                        type="text"
                        pattern="[0-9]*"
                        value={bedroomsCount} 
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setBedroomsCount(val === '' ? '' : Math.max(0, Number(val)));
                        }}
                        className="text-xs font-black text-[#2B4D89] font-mono w-5.5 text-center bg-transparent border-none outline-none focus:ring-0 p-0"
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => setBedroomsCount(Number(bedroomsCount || 0) + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white hover:bg-[#2B4D89] hover:text-white text-[#2B4D89] transition-all select-none text-xs active:scale-90 font-extrabold cursor-pointer border-none shadow-3xs"
                      >
                        ＋
                      </button>
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div className="flex flex-row items-center justify-between gap-1.5 bg-white p-2 px-2.5 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[12px] select-none shrink-0">🚿</span>
                      <span className="text-[10px] font-black text-slate-800 whitespace-nowrap shrink-0">
                        {isEn ? 'Bathrooms' : 'الحمامات'}<span className="text-rose-500 mr-0.5">*</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100/80 rounded-lg p-0.5 h-7 shrink-0">
                      <button
                        type="button"
                        onClick={() => setBathroomsCount(Math.max(0, Number(bathroomsCount || 0) - 1))}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white hover:bg-[#2B4D89] hover:text-white text-[#2B4D89] transition-all select-none text-xs active:scale-90 font-extrabold cursor-pointer border-none shadow-3xs"
                      >
                        −
                      </button>
                      <input 
                        type="text"
                        pattern="[0-9]*"
                        value={bathroomsCount} 
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setBathroomsCount(val === '' ? '' : Math.max(0, Number(val)));
                        }}
                        className="text-xs font-black text-[#2B4D89] font-mono w-5.5 text-center bg-transparent border-none outline-none focus:ring-0 p-0"
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => setBathroomsCount(Number(bathroomsCount || 0) + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white hover:bg-[#2B4D89] hover:text-white text-[#2B4D89] transition-all select-none text-xs active:scale-90 font-extrabold cursor-pointer border-none shadow-3xs"
                      >
                        ＋
                      </button>
                    </div>
                  </div>

                  {/* Kitchens */}
                  <div className="flex flex-row items-center justify-between gap-1.5 bg-white p-2 px-2.5 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[12px] select-none shrink-0">🍳</span>
                      <span className="text-[10px] font-black text-slate-800 whitespace-nowrap shrink-0">
                        {isEn ? 'Kitchens' : 'المطابخ'}<span className="text-rose-500 mr-0.5">*</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100/80 rounded-lg p-0.5 h-7 shrink-0">
                      <button
                        type="button"
                        onClick={() => setKitchensCount(Math.max(0, Number(kitchensCount || 0) - 1))}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white hover:bg-[#2B4D89] hover:text-white text-[#2B4D89] transition-all select-none text-xs active:scale-90 font-extrabold cursor-pointer border-none shadow-3xs"
                      >
                        −
                      </button>
                      <input 
                        type="text"
                        pattern="[0-9]*"
                        value={kitchensCount} 
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setKitchensCount(val === '' ? '' : Math.max(0, Number(val)));
                        }}
                        className="text-xs font-black text-[#2B4D89] font-mono w-5.5 text-center bg-transparent border-none outline-none focus:ring-0 p-0"
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => setKitchensCount(Number(kitchensCount || 0) + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white hover:bg-[#2B4D89] hover:text-white text-[#2B4D89] transition-all select-none text-xs active:scale-90 font-extrabold cursor-pointer border-none shadow-3xs"
                      >
                        ＋
                      </button>
                    </div>
                  </div>
                </div>

                {/* Moved directly below: "نوع الخامات والتشطيب" (finishingLevel) above "الشروط والتفاصيل الإضافية" (notes) as requested */}
                
                {/* Finishing Level Selection */}
                <div className="space-y-2 text-right pt-1.5">
                  <span className="block text-[10px] font-black text-gray-700 flex items-center justify-start gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                    <span>{isEn ? 'Finishing Quality Tier:' : 'فئة ومستوى التشطيب المطلوبة:'}</span>
                  </span>
                  
                  {/* Compact row of 4 buttons (اقتصادي - لوكس - سوبر لوكس - بريميوم) */}
                  <div className="grid grid-cols-4 gap-2">
                    {['اقتصادي', 'لوكس', 'سوبر لوكس', 'بريميوم'].map((level) => {
                      const finishingLevelLabelMap: Record<string, string> = {
                        'اقتصادي': isEn ? 'Economic' : 'اقتصادي',
                        'لوكس': isEn ? 'Lux' : 'لوكس',
                        'سوبر لوكس': isEn ? 'Super Lux' : 'سوبر لوكس',
                        'بريميوم': isEn ? 'Premium' : 'بريميوم',
                      };
                      const isSelected = finishingLevel === level;
                      return (
                        <button
                          type="button"
                          key={level}
                          onClick={() => setFinishingLevel(level)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-black text-center transition-all border cursor-pointer flex flex-col items-center justify-center shadow-2xs ${
                            isSelected 
                              ? 'bg-[#2B4D89] border-[#2B4D89] text-white ring-2 ring-[#2B4D89]/20' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-slate-50 hover:border-gray-300'
                          }`}
                        >
                          <span className="font-extrabold text-[10.5px]">{finishingLevelLabelMap[level] || level}</span>
                          <span className="text-[7.5px] opacity-75 mt-0.5 font-normal">
                            {level === 'اقتصادي' ? (isEn ? 'Economic' : 'اقتصادي') :
                             level === 'لوكس' ? (isEn ? 'Standard' : 'لوكس') :
                             level === 'سوبر لوكس' ? (isEn ? 'High Lux' : 'سوبر لوكس') : 
                             (isEn ? 'Premium' : 'بريميوم')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes & Special specifications */}
                <div className="space-y-1.5 text-right pt-2 flex flex-col">
                  <label className="block text-[10px] font-black text-gray-700 flex items-center justify-start gap-1">
                    <FileText className="w-3 h-3 text-[#2B4D89]" />
                    <span>{isEn ? 'Order details & requested material types:' : 'تفاصيل الطلب ونوع الخامات المطلوبة:'}</span>
                  </label>
                  <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder={isEn ? 'e.g. Elsewedy cables, Jotun paint, advanced waterproofing...' : 'مثال: أسلاك السويدي المعتمدة، دهانات جوتن فينوماستيك، عزل مائي للحمامات والمطابخ، ماركات السباكة والألوميتال، أسقف معلقة جبسيوم بورد...'}
                    className="w-full p-2.5 bg-white border border-gray-200 text-xs rounded-xl outline-none focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/10 h-16 transition-all font-semibold text-right shadow-2xs placeholder:text-gray-300"
                  />
                </div>

                {/* CAD Drawings / Sketch uploads section */}
                <div className="space-y-1.5 text-right pt-1.5">
                  <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-1.5 text-right">
                      <span className="text-sm">📎</span>
                      <div className="text-right">
                        <label className="block text-[9.5px] font-black text-gray-750">
                          {isEn ? 'Attach CAD / Sketch drawings (Optional)' : 'أرفق الرسوم الهندسية ومخطط الكروكي للوحدة إن وجد (اختياري)'}
                        </label>
                        <p className="text-[8.5px] text-gray-400 font-medium">
                          {isEn ? '.pdf, .png, .jpg files' : 'مخططات الـ PDF، الصور للأبعاد والمقاسات'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <input 
                        type="file" 
                        multiple 
                        accept=".pdf,.png,.jpg,.jpeg" 
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []) as File[];
                          if (files.length > 0) {
                            setAttachedDrawings(p => [...p, ...files.map(f => f.name)]);
                          }
                        }}
                        className="hidden" 
                        id="form-sketch-upload" 
                      />
                      <label htmlFor="form-sketch-upload" className="bg-[#2B4D89]/10 text-[#2B4D89] hover:bg-[#2B4D89]/20 font-black text-[9px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-[#2B4D89]/15 select-none">
                        <span>📎</span>
                        <span>{isEn ? 'Attach File' : 'إرفاق مخطط'}</span>
                      </label>
                    </div>
                  </div>

                  {/* Show attached files list */}
                  {attachedDrawings.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {attachedDrawings.map((drawFn, dIdx) => (
                        <div key={dIdx} className="bg-emerald-50 text-emerald-800 text-[8.5px] font-black py-0.5 px-2 rounded-md border border-emerald-200/50 flex items-center justify-between gap-1.5 text-right">
                          <span className="truncate max-w-[200px]">📄 {drawFn}</span>
                          <button
                            type="button"
                            onClick={() => setAttachedDrawings(prev => prev.filter((_, i) => i !== dIdx))}
                            className="text-red-500 hover:text-red-700 font-black cursor-pointer bg-transparent hover:scale-110 shrink-0 font-sans text-xs ml-1"
                            title={isEn ? "Delete" : "حذف"}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50/50 border border-dashed border-gray-200 p-2 rounded-xl text-center">
                      <span className="text-[9.5px] text-gray-450 font-bold block">
                        💡 {isEn ? 'No files attached. Shatibha engineer will scan & measure your site free of charge.' : 'لم يتم إرفاق مخططات كروكي - سيقوم مهندس المنصة الفني بمعاينة الموقع ورفع مقاسات عقارك مجاناً.'}
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* Section 2: Property Location Specs */}
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-150 text-right shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                {/* Decorative side badge */}
                <div className="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-l from-indigo-500 to-blue-600" />
                
                <span className="font-extrabold text-xs sm:text-sm text-[#2B4D89] flex items-center justify-between pb-3 border-b border-gray-100 text-right">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <span className="font-black text-slate-800 text-[12.5px]">{isEn ? 'Property Physical Location' : 'تحديد موقع وتفاصيل العقار'}</span>
                  </div>
                  <span className="text-[10px] text-indigo-600 font-black bg-indigo-50/75 px-2.5 py-1 rounded-full">
                    📍 {isEn ? 'Service Area Active' : 'تغطية جغرافية نشطة للمنصة'}
                  </span>
                </span>

                {/* Form fields for governorate, city with improved custom selectors & icons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right pt-1.5">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-slate-700 font-extrabold mb-1">
                      {isEn ? 'Governorate:' : 'المحافظة الحاضنة لطلبك:'}
                    </label>
                    <div className="relative group">
                      <select 
                        value={governorate} 
                        onChange={e => handleGovernorateChange(e.target.value)}
                        className="w-full py-2.5 pr-8 pl-8 bg-slate-50 border border-gray-250 hover:bg-white hover:border-[#2B4D89] transition-all text-xs rounded-xl outline-none text-slate-900 focus:bg-white focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/10 font-bold h-10.5 text-right appearance-none cursor-pointer shadow-3xs"
                      >
                        {Object.keys(governoratesAndCitiesMap).map(govKey => (
                          <option key={govKey} value={govKey}>
                            🏙️ {isEn ? governoratesAndCitiesMap[govKey].en : govKey}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3.5 top-3.5 text-gray-400 select-none pointer-events-none text-[10px]">▼</span>
                      <span className="absolute left-3.5 top-3.5 text-gray-400 font-sans text-[10px]">EGP</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-slate-700 font-extrabold mb-1">
                      {isEn ? 'City / Area:' : 'المدينة / الحي السكني:'}
                    </label>
                    <div className="relative group">
                      <select 
                        value={city} 
                        onChange={e => setCity(e.target.value)}
                        className="w-full py-2.5 pr-8 pl-8 bg-slate-50 border border-gray-250 hover:bg-white hover:border-[#2B4D89] transition-all text-xs rounded-xl outline-none text-slate-900 focus:bg-white focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/10 font-bold h-10.5 text-right appearance-none cursor-pointer shadow-3xs"
                      >
                        {(governoratesAndCitiesMap[governorate]?.cities || []).map(cityObj => (
                          <option key={cityObj.ar} value={cityObj.ar}>
                            🏡 {isEn ? cityObj.en : cityObj.ar}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3.5 top-3.5 text-gray-400 select-none pointer-events-none text-[10px]">▼</span>
                      <span className="absolute left-3.5 top-3 text-[11px] select-none pointer-events-none">✨</span>
                    </div>
                  </div>
                </div>

                {/* Street address */}
                <div className="text-right space-y-1.5 pt-1">
                  <label className="block text-[11px] text-slate-700 font-extrabold mb-1">
                    {isEn ? 'Detailed Street Address:' : 'تفاصيل العنوان الدقيق والمعالم المميزة القريبة:'}
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      value={detailedLocationText}
                      onChange={e => setDetailedLocationText(e.target.value)}
                      placeholder={isEn ? 'Street name, building number, apartment...' : 'مثال: كمبوند البستان، الدور الثالث، شقة رقم م-١٥، أمام عمارة المحكمة والحديقة المركزية'}
                      className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-gray-250 hover:bg-white hover:border-[#2B4D89] transition-all text-xs rounded-xl outline-none text-slate-950 focus:bg-white focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/10 h-10.5 font-bold text-right shadow-3xs placeholder:text-gray-400"
                    />
                    <span className="absolute right-3.5 top-3 text-[11px] pointer-events-none">📍</span>
                  </div>
                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold mt-1">
                    ℹ️ {isEn ? 'Accurate location ensures fast and reliable bids from local contractors in your immediate area.' : 'دقة تفاصيل العنوان تضمن لك الحصول على عروض أسعار دقيقة وسريعة من شركات التشطيبات والمقاولين الأقرب إلى موقعك لتوفير الوقت وهدر الانتقالات.'}
                  </p>
                </div>
              </div>

              {/* Section 3: Onsite QC Supervision & Inspection */}
              <div className={`relative space-y-3.5 p-4.5 rounded-2xl border-2 transition-all duration-200 ${
                requireInspector === null 
                  ? 'border-indigo-400 bg-indigo-50/5 shadow-sm' 
                  : requireInspector === true
                  ? 'border-emerald-500 bg-emerald-50/10'
                  : 'border-slate-350 bg-slate-50/20'
              }`}>
                {/* Glowing Attention Grabber Badge */}
                <div className="absolute top-0 left-0 flex items-center gap-1">
                  {requireInspector === null ? (
                    <span className="bg-amber-500 text-white text-[9px] px-3 py-0.5 rounded-br-xl font-bold tracking-wide animate-pulse">
                      ⚠️ {isEn ? 'REQUIRED CHOICE' : 'اختيار إجباري مطلوب'}
                    </span>
                  ) : (
                    <span className="bg-[#2B4D89] text-white text-[9px] px-3 py-0.5 rounded-br-xl font-black">
                      ✓ {isEn ? 'ANSWERED' : 'تم الاختيار والاعتماد'}
                    </span>
                  )}
                </div>
                
                <div className="pt-2 text-right">
                  <span className="block text-xs sm:text-sm font-black text-[#1E3A8A] flex items-center gap-1.5 justify-start">
                    <span className="text-red-500 text-sm">*</span>
                    🛡️ {isEn ? 'Do you want field supervision by Shattabha?' : 'هل ترغب في الاستفادة من الإشراف الهندسي الميداني المستقل من شطبها؟'}
                  </span>
                  <p className="text-[10px] text-gray-650 leading-relaxed font-bold mt-1.5 text-right">
                    💡 {isEn ? 'Engineering supervision ensures compliance with specifications, catches execution defects early, and avoids material waste and costly mistakes.' : 'يقوم مهندس شطبها المستقل بمتابعة أعمال التشطيب ميدانياً نيابةً عنك، مع فحص جودة التنفيذ والخامات المستخدمة والتأكد من مطابقتها للمواصفات المتفق عليها، بالإضافة إلى توثيق مراحل المشروع بالتقارير والصور الفنية لتحصل على راحة بال أكبر وثقة أعلى في جودة التشطيب'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-right text-[11px]">
                  <button
                    type="button"
                    onClick={() => setRequireInspector(true)}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-1 active:scale-95 shadow-3xs ${
                      requireInspector === true 
                        ? 'border-[#0F7453] bg-emerald-50/30 text-emerald-950 ring-2 ring-[#0F7453]/20 scale-[1.01]' 
                        : 'border-gray-200 bg-white text-gray-500 hover:bg-slate-50 hover:border-gray-300'
                    }`}
                  >
                    <span className={`font-black text-xs flex items-center gap-1 ${requireInspector === true ? 'text-[#0F7453]' : 'text-gray-400'}`}>
                      <span className="text-sm">✔</span>
                      <span>{isEn ? 'Yes, please' : 'نعم، أرغب في الإشراف الضامن'}</span>
                    </span>
                    <span className="text-[9px] text-gray-550 leading-normal font-semibold">
                      {isEn ? 'Highly recommended. Shatibha inspects all quality terms.' : 'تكليف مهندس المنصة المعماري لاستلام كل مرحلة تشطيب فنية.'}
                    </span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setRequireInspector(false);
                      // Reset applied promos if client says no
                      setAppliedPromo(null);
                      setPromoCodeInput('');
                      setPromoError(null);
                      setPromoSuccessMsg(null);
                    }}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-1 active:scale-95 shadow-3xs ${
                      requireInspector === false 
                        ? 'border-red-500 bg-red-50/10 text-red-950 ring-2 ring-red-150 scale-[1.01]' 
                        : 'border-gray-200 bg-white text-gray-500 hover:bg-slate-50 hover:border-gray-300'
                    }`}
                  >
                    <span className={`font-black text-xs flex items-center gap-1 ${requireInspector === false ? 'text-red-700' : 'text-gray-400'}`}>
                      <span className="text-sm">❌</span>
                      <span>{isEn ? 'No, thank you' : 'لا، سأتابع جودة التنفيذ بنفسي'}</span>
                    </span>
                    <span className="text-[9px] text-gray-400 leading-normal font-medium">
                      {isEn ? 'No inspection.' : 'تلقي العروض من الشركات ومتابعة البنود بمفردك دون مسئولية هندسية من شطبها.'}
                    </span>
                  </button>
                </div>

                {requireInspector === true && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2.5 p-3.5 bg-emerald-50/30 rounded-lg border border-emerald-100/70 text-right space-y-3"
                  >
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-emerald-55/40">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-800">
                          {isEn ? '🎓 Supervision by Shattabha Quality Engineers' : '🎓 الإشراف الهندسي بواسطة مهندس من شطبها'}
                        </p>
                        <p className="text-[9px] text-gray-500 font-semibold mt-0.5">
                          {isEn ? 'Cost: 100 EGP x Area' : 'التكلفة: 100 جنيه × عدد الأمتار'}
                        </p>
                      </div>
                      <div className="text-left font-mono">
                        {appliedPromo && (
                          <span className="text-[10.5px] font-bold text-gray-400 line-through block leading-none">
                            {(Number(area) * 100).toLocaleString()} ج.م
                          </span>
                        )}
                        <span className="text-xs font-black text-emerald-700">
                          {(() => {
                            const original = Number(area) * 100;
                            let discount = 0;
                            if (appliedPromo) {
                              if (appliedPromo.discountType === 'PERCENTAGE') {
                                discount = (original * appliedPromo.discountValue) / 100;
                              } else {
                                discount = appliedPromo.discountValue;
                              }
                              discount = Math.min(discount, original);
                            }
                            return `${(original - discount).toLocaleString()} جنيه`;
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] space-y-1 text-gray-650 bg-white/70 p-2.5 rounded-lg border border-gray-100 leading-relaxed font-semibold">
                      <div className="flex justify-between">
                        <span>{isEn ? 'Project Area:' : 'مساحة المشروع:'}</span>
                        <span className="font-bold text-gray-800">{area} {isEn ? 'sqm' : 'متر مربع'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isEn ? 'Supervision Fee:' : 'عمولة الإشراف:'}</span>
                        <span className="font-extrabold text-gray-800">{(Number(area) * 100).toLocaleString()} {isEn ? 'EGP' : 'جنيه'}</span>
                      </div>
                    </div>

                    {/* Promo Code Input Box */}
                    <div className="space-y-1.5 border-t border-dashed border-emerald-100/60 pt-2.5">
                      <label className="block text-[10px] font-black text-[#113C30]">
                        {isEn ? 'Do you have a promo code?' : 'هل لديك كود خصم؟'}
                      </label>
                      <div className="flex gap-2 font-sans">
                        <input 
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          placeholder={isEn ? 'e.g. WELCOME25' : 'مثال: WELCOME20'}
                          className="flex-1 px-3 py-1.5 bg-white border border-gray-200 text-xs rounded-lg uppercase font-bold text-gray-850 focus:border-emerald-600 outline-none text-right placeholder:text-gray-300"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromoCode}
                          className="px-4 py-1.5 bg-[#113C30] hover:bg-[#0B271F] text-white text-[10.5px] font-black rounded-lg transition-colors cursor-pointer"
                        >
                          {isEn ? 'Apply' : 'تطبيق'}
                        </button>
                      </div>

                      {promoError && (
                        <p className="text-[9.5px] font-bold text-red-650">{promoError}</p>
                      )}
                      {promoSuccessMsg && (
                        <p className="text-[9.5px] font-bold text-emerald-650 flex items-center gap-1 mt-1">
                          <span>✓</span> {promoSuccessMsg}
                        </p>
                      )}
                    </div>

                    {/* Detailed Pricing Summary */}
                    {appliedPromo && (
                      <div className="bg-[#113C30]/5 p-2.5 rounded-lg border border-[#113C30]/10 text-[10.5px] space-y-1 text-gray-700 font-semibold animate-fade-in font-sans">
                        <div className="flex justify-between">
                          <span>{isEn ? 'Supervision Fee:' : 'قيمة الإشراف:'}</span>
                          <span>{(Number(area) * 100).toLocaleString()} {isEn ? 'EGP' : 'جنيه'}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>{isEn ? 'Discount:' : 'الخصم:'}</span>
                          <span>
                            {(() => {
                              const original = Number(area) * 100;
                              let discount = 0;
                              if (appliedPromo.discountType === 'PERCENTAGE') {
                                discount = (original * appliedPromo.discountValue) / 100;
                              } else {
                                discount = appliedPromo.discountValue;
                              }
                              discount = Math.min(discount, original);
                              return `-${discount.toLocaleString()} جنيه (${appliedPromo.discountType === 'PERCENTAGE' ? `${appliedPromo.discountValue}%` : 'مبلغ ثابت'})`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-emerald-100/60 font-black text-gray-950">
                          <span>{isEn ? 'Total After Discount:' : 'الإجمالي بعد الخصم:'}</span>
                          <span className="text-emerald-800 font-black">
                            {(() => {
                              const original = Number(area) * 100;
                              let discount = 0;
                              if (appliedPromo.discountType === 'PERCENTAGE') {
                                discount = (original * appliedPromo.discountValue) / 100;
                              } else {
                                discount = appliedPromo.discountValue;
                              }
                              discount = Math.min(discount, original);
                              return `${(original - discount).toLocaleString()} جنيه`;
                            })()}
                          </span>
                        </div>
                      </div>
                    )}

                  </motion.div>
                )}
              </div>







              {/* Validation error feedback banner */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5 font-bold animate-pulse text-right">
                  <span className="text-sm select-none">⚠️</span>
                  <div className="flex-1">{formError}</div>
                  <button 
                    type="button" 
                    onClick={() => setFormError(null)} 
                    className="text-rose-400 hover:text-rose-650 font-black cursor-pointer bg-none outline-none select-none px-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Submit and action buttons optimized for clickability */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-gray-150 select-none shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleAddRequestSubmit(e, 'DRAFT')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-705 py-3 rounded-2xl font-black text-xs transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5 border border-slate-250 active:scale-[0.98]"
                >
                  💾 {isEn ? 'Save as Draft' : 'حفظ كمسودة بالملف'}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleAddRequestSubmit(e, 'PENDING_REVIEW')}
                  className="flex-2 bg-[#2B4D89] hover:bg-[#1E3A8A] text-white py-3 rounded-2xl font-extrabold text-xs shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  🚀 {isEn ? 'Publish / Submit' : 'إطلاق وتقديم للتدقيق الفني'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 🧾 NEW INDIVIDUAL OFFER DETAILS FULL OVERLAY MODAL */}
      {false && viewingOfferDetails !== null && (() => {
        const o = viewingOfferDetails;
        const req = requests.find(r => r.id === o.requestId);
        const comp = companies.find(c => c.id === o.companyId);

        // Standardized structures for packages if they are empty
        const comPackages = (comp?.packages && comp.packages.length > 0) ? comp.packages : [
          {
            id: 'fallback-pkg-1',
            name: isEn ? 'The Platinum Deluxe Package' : 'الباقة البلاتينية الفاخرة (سوبر لوكس)',
            pricePerSqm: 3600,
            description: isEn 
              ? 'Complete turnkey premium finishes, including Elsewedy cabling, Jotun paints, and Royal insulation fittings.' 
              : 'تفاصيل التجهيز الكامل فئة السوبر لوكس الممتازة؛ تشمل كابلات السويدي الأصلية، دهانات جوتن فينوماستيك، عزل مائي وحراري للأسطح.',
            features: isEn 
              ? ['Premium Cleopatra Porcelain (first grade)', 'Elsewedy cables and Schneider switches', 'Ultra moisture resistant Knauf plasterboards', 'Full acrylic painting with Jotun Fenomastic'] 
              : ['بورسلين كليوباترا فرز أول مقاسات كبيرة للريسيبشن', 'مواسير السباكة بنظام الشريف ومواد بي بي آر الألمانية المعزولة', 'تأسيس الكهرباء بالكامل بكابلات السويدي الأصلية وعقد ضمان', 'دهانات جوتن الفينوماستيك المقاومة للأتربة والبهتان']
          },
          {
            id: 'fallback-pkg-2',
            name: isEn ? 'The Smart Practical Package' : 'باقة التشطيب الذكي العملي (لوكس متميز)',
            pricePerSqm: 2600,
            description: isEn 
              ? 'Excellent durable finishes prioritizing smart home ready infrastructure.' 
              : 'خدمات التأسيس والتشطيب الاقتصادي والجودة المضمونة، مهيأة بالكامل لكافة نظم المنازل الذكية والإضاءات الهادئة.',
            features: isEn 
              ? ['Cleopatra ceramic flooring for entire unit', 'Saveto cement coatings and highly durable insulation', 'Venus smart controls and lighting paths', 'Standard sound-insulating aluminum windows'] 
              : ['تركيب سيراميك كليوباترا فرز أول للأرضيات والحوائط', 'عزل مائي كيميائي متكامل ماركة سيكا للمطابخ والحمامات', 'أطقم حمامات ديورافيت ممتازة مع خلاطات مياه يوفوري', 'نوافذ ألوميتال مانعة للصوت والأتربة للغرف المطلة على الواجهة']
          }
        ];

        const comPortfolio = (comp?.portfolio && comp.portfolio.length > 0) ? comp.portfolio : [
          {
            id: 'fallback-port-1',
            projectName: isEn ? 'Luxury Penthouse Finishing' : 'تشطيب وتأثيث بنتهاوس التجمع الخامس',
            projectType: isEn ? 'Residential' : 'سكني',
            governorate: isEn ? 'Cairo' : 'القاهرة',
            executionYear: 2024,
            images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'],
            beforeImages: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'],
            afterImages: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'],
            description: isEn 
              ? 'Complete penthouse architectural finishing from bare brick to premium turnkey handover.' 
              : 'تشطيب كامل لبنتهاوس بقطاع القاهرة الجديدة مع الاهتمام بالعزل المائي الفائق والأسقف المعلقة جبسيوم بورد الراقية وكبائن السيكوريت بالحمامات.'
          },
          {
            id: 'fallback-port-2',
            projectName: isEn ? 'Modern Family Apartment' : 'شقة نيو هليوبوليس العائلية الراقية',
            projectType: isEn ? 'Residential' : 'سكني',
            governorate: isEn ? 'Cairo' : 'القاهرة',
            executionYear: 2023,
            images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
            beforeImages: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'],
            afterImages: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
            description: isEn 
              ? 'Full renovation including kitchen layout changes, luxury electrical distribution.' 
              : 'رحلة تشطيب شاملة من الطوب الأحمر وتعديل المخططات الإنشائية للسباكة والدوائر الكهربائية، مع دهانات جوتن وتشطيبات حريرية ممتازة.'
          }
        ];

        return (
          <div className="fixed inset-0 bg-[#0F172A]/85 backdrop-blur-md flex items-center justify-center z-[5000] p-3 sm:p-4 overflow-y-auto" dir={isEn ? "ltr" : "rtl"}>
            <div className="bg-white rounded-[24px] border border-gray-150 p-5 sm:p-6 shadow-2xl max-w-4xl w-full max-h-[96vh] overflow-y-auto relative text-[#1D2736] text-right">
              
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setViewingOfferDetails(null)}
                className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-all font-black text-xs cursor-pointer border border-gray-200"
                title={isEn ? "Close" : "إغلاق"}
              >
                ✕
              </button>

              {/* Header */}
              <div className="space-y-1 pb-3 border-b border-gray-100 text-center flex flex-col items-center justify-center mb-4">
                <span className="text-3xl">🏗️</span>
                <h3 className="font-extrabold text-[#2B4D89] text-base sm:text-lg mt-1 text-center font-sans">
                  {isEn ? `Finishing Quote Details #${o.id}` : `تفاصيل العرض السعري والبروفايل - عرض رقم #${o.id}`}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold text-center">
                  {isEn ? `Associated Project Request: #${o.requestId}` : `مرتبط بطلب المقايسة الفني رقم #${o.requestId}`}
                </p>
              </div>

              {/* HIGH FIDELITY NAV TABS BAR */}
              <div className="flex border-b border-gray-150 mb-5 overflow-x-auto select-none no-scrollbar gap-1 justify-start">
                <button
                  type="button"
                  onClick={() => setOfferModalTab('OFFER')}
                  className={`px-4 py-3 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    offerModalTab === 'OFFER' ? 'border-[#2B4D89] text-[#2B4D89] bg-[#2B4D89]/5 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-t-xl'
                  }`}
                >
                  💵 {isEn ? 'Offer Scope & Price' : 'تفاصيل العرض المالي'}
                </button>
                <button
                  type="button"
                  onClick={() => setOfferModalTab('PROFILE')}
                  className={`px-4 py-3 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    offerModalTab === 'PROFILE' ? 'border-[#2B4D89] text-[#2B4D89] bg-[#2B4D89]/5 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-t-xl'
                  }`}
                >
                  🏢 {isEn ? 'Company Profile' : 'بروفايل الشركة (دون تواصل)'}
                </button>
                <button
                  type="button"
                  onClick={() => setOfferModalTab('PACKAGES')}
                  className={`px-4 py-3 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    offerModalTab === 'PACKAGES' ? 'border-[#2B4D89] text-[#2B4D89] bg-[#2B4D89]/5 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-t-xl'
                  }`}
                >
                  📐 {isEn ? 'Standard Finishing Packages' : 'باقات التشطيب والأسعار'}
                </button>
                <button
                  type="button"
                  onClick={() => setOfferModalTab('PORTFOLIO')}
                  className={`px-4 py-3 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    offerModalTab === 'PORTFOLIO' ? 'border-[#2B4D89] text-[#2B4D89] bg-[#2B4D89]/5 rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-t-xl'
                  }`}
                >
                  🖼️ {isEn ? 'Works Portfolio' : 'سابقة أعمال الشركة'}
                </button>
              </div>

              {/* CONTENT SECTIONS BASED ON ACTIVE TAB */}
              <div className="min-h-[350px]">
                
                {/* 1. OFFER DETAIL TAB */}
                {offerModalTab === 'OFFER' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Meta details cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50/85 p-4 rounded-2xl border border-gray-100 text-right">
                      <div className="space-y-0.5">
                        <span className="text-gray-400 text-[10px] block font-bold">{isEn ? 'Contractor Company' : 'الشركة المصممة والمنفذة'}</span>
                        <strong className="text-indigo-900 text-xs block">🏗️ {comp?.companyName || o.companyName}</strong>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-gray-400 text-[10px] block font-bold">{isEn ? 'Rating on Platform' : 'تقييم جودة المقاول'}</span>
                        <strong className="text-amber-600 text-xs block flex items-center gap-1">
                          ★ {comp?.rating || 4.8} / 5 <span className="text-gray-400 text-[9px]">({comp?.projectsCompleted || 12} مشروع)</span>
                        </strong>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-gray-400 text-[10px] block font-bold font-sans">{isEn ? 'Total Bid Price' : 'قيمة العرض المالي الإجمالي'}</span>
                        <strong className="text-emerald-700 text-sm block font-black font-sans">{o.price.toLocaleString()} ج.م</strong>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-gray-400 text-[10px] block font-bold">{isEn ? 'Duration' : 'مدة التنفيذ وتفاصيل البنود'}</span>
                        <strong className="text-sky-900 text-xs block font-bold font-sans">⏰ {o.durationDays} يوم عمل ميداني</strong>
                      </div>
                    </div>

                    {/* Scope of supply description */}
                    <div className="space-y-1">
                      <span className="text-gray-700 text-[11px] font-black block border-r-2 border-[#2B4D89] pr-1.5">{isEn ? 'Material specifications provided:' : 'تفاصيل خامات التشطيب وبنود العرض المشمولة:'}</span>
                      <div className="bg-[#2B4D89]/5 p-4 rounded-xl text-gray-700 text-[11px] leading-relaxed select-text whitespace-pre-wrap max-h-56 overflow-y-auto text-right">
                        {o.description || (isEn ? 'Includes all interior renovations, premium paint (Jotun grade 1), Elsewedy cabling, full plumbing fittings, luxury local ceramics, false ceilings, led stripe paths, and complete 10-year warranty' : 'تشمل البنود الموضحة وتصاريح البناء والمواد الأساسية:\n- تأسيس كهرباء بالكامل من أسلاك السويدي المعتمدة.\n- تأسيس سباكة مع العزل المائي الكيميائي وسيكا للحمامات والمطابخ.\n- دهانات جوتن فينوماستيك طبقات تغطية ممتازة.\n- تركيب سيراميك فرز أول كليوباترا وجوهرة للوحدات.\n- جبسيوم بورد كناوف ذو مواصفات عزل عالية المقاومة للرطوبة في المطابخ والحمامات.\n- ضمان للمدة المذكورة وضمان شامل لمدة 10 سنوات على سلامة الشبكات التحتية.')}
                      </div>
                    </div>

                    {/* Escrow payout milestones visualization */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-gray-700 text-[11px] font-black block border-r-2 border-indigo-500 pr-1.5">
                        {isEn ? 'Safe Payout Milestones (Escrow System)' : 'دفعات الضمان والأمان الموزعة (نظام حماية الدفع بـ شطبها):'}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-right">
                          <div className="font-extrabold text-[#2B4D89] text-[11px]">١. دفعة التأسيس وبدء العمل (35%)</div>
                          <div className="text-[10px] text-gray-500 mt-1">{isEn ? 'Released on delivery of initial build materials to site.' : 'تفعل فور توريد المواد الأولية واعتماد المهندس المشرف للرسم.'}</div>
                        </div>
                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-right">
                          <div className="font-extrabold text-[#2B4D89] text-[11px]">٢. دفعة منتصف واستلام البنود (45%)</div>
                          <div className="text-[10px] text-gray-500 mt-1">{isEn ? 'After finishing insulation, electrics, & tiling okay.' : 'تصرف تدريجياً فور اجتياز اختبارات السباكة والكهرباء والدهان الأول.'}</div>
                        </div>
                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-right">
                          <div className="font-extrabold text-[#2B4D89] text-[11px]">٣. التسليم النهائي والضمان (20%)</div>
                          <div className="text-[10px] text-gray-500 mt-1">{isEn ? 'Kept in escrow until final supervisor signoff inspect.' : 'تبقى معلقة في ضمان "شطبها" حتى استلام الوحدة والتوقيع بالقبول النهائي.'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Quote Images */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-gray-700 text-[11px] font-black block border-r-2 border-amber-500 pr-1.5">{isEn ? 'Relevant Works Gallery:' : 'الصور المرفقة بملخص العرض:'}</span>
                      <div className="grid grid-cols-3 gap-2">
                        {o.portfolio && o.portfolio.length > 0 ? (
                          o.portfolio.slice(0, 3).map((img, index) => (
                            <div key={index} className="aspect-video bg-gray-150 rounded-lg overflow-hidden border border-gray-200">
                              <img src={img} alt="Portfolio Work" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="aspect-video bg-gray-150 rounded-lg overflow-hidden border border-gray-200">
                              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80" alt="Work 1" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="aspect-video bg-gray-150 rounded-lg overflow-hidden border border-gray-200">
                              <img src="https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=300&q=80" alt="Work 2" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="aspect-video bg-gray-150 rounded-lg overflow-hidden border border-gray-200">
                              <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=300&q=80" alt="Work 3" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. COMPANY PROFILE TAB (SAFE - NO CONTACT DATA DETAILS) */}
                {offerModalTab === 'PROFILE' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Cover Photo and Logo */}
                    <div className="relative h-32 bg-slate-900 rounded-2xl overflow-hidden shadow-inner">
                      <img 
                        src={comp?.coverUrl || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'} 
                        alt="Company Cover" 
                        className="w-full h-full object-cover opacity-60"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      
                      <div className="absolute bottom-3 right-4 left-4 flex items-center justify-between">
                        <div className="text-right">
                          <h4 className="text-sm md:text-base font-black text-white flex items-center gap-1.5 text-right">
                            🏗️ {comp?.companyName || o.companyName}
                            {comp?.isVerified !== false && <span className="bg-sky-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans uppercase">Certified</span>}
                          </h4>
                          <p className="text-[10px] text-slate-300 font-bold mt-0.5 text-right">
                            {isEn ? '🛡️ Approved Finishing Partner' : '🛡️ شريك تشطيب معتمد بالدائرة الفنية لـ شطبها'}
                          </p>
                        </div>

                        {/* Large Circular Logo */}
                        <div className="w-14 h-14 rounded-xl bg-white p-1 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {comp?.logoUrl ? (
                            <img src={comp.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-[#2B4D89] text-white flex items-center justify-center font-black text-sm">
                              {(comp?.companyName || o.companyName).slice(0, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Critical anti-disintermediation security banner */}
                    <div className="p-3 bg-indigo-50 border-r-4 border-[#2B4D89] text-[#2B4D89] rounded-l-xl text-[10.5px] flex items-start gap-2.5 leading-relaxed text-right">
                      <ShieldCheck className="w-4 h-4 text-[#2B4D89] shrink-0 mt-0.5 animate-pulse" />
                      <div className="space-y-0.5">
                        <strong className="block text-right">{isEn ? 'Secure Contact Shield Active' : 'تفعيل درع حماية الاتصال وضمان الحقوق الرقمية للعميل البالغة هيبته 🔒'}</strong>
                        <span className="text-right block">
                          {isEn 
                            ? 'Contact phone numbers, direct emails, website URLs and addresses are locked. They will unlock automatically in your workspace upon contract acceptance. This satisfies safety from contractor deviations.' 
                            : 'تم حجب معلومات الهاتف المباشر والبريد والموقع لتوفير الحماية القانونية للمشروع. بمجرد قبولكم للعرض السعري والتعاقد رسميًا، سيتم فك بروتوكول التشفير لتفعيل التواصل الفوري وبدء زيارة المعاينة، بما يضمن حقوق دفعة الضمان وحق الصيانة الكامل بـ شطبها مجاناً.'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Profile text */}
                    <div className="space-y-1">
                      <span className="text-gray-700 text-[11px] font-black block border-r-2 border-[#2B4D89] pr-1.5">{isEn ? 'About the Contractor:' : 'نبذة عن الشركة ورؤيتها الفنية:'}</span>
                      <div className="bg-gray-50 p-3.5 rounded-xl text-gray-700 text-[11px] leading-relaxed text-right select-text whitespace-pre-wrap">
                        {comp?.aboutText || (isEn 
                          ? 'A premiere architecture and contracting office with 7+ years of experience in residential, administrative and high-end chalet finishing works in Egypt.' 
                          : 'مكتب هندسي وتصميم وديكور رائد متخصص في تشطيب الوحدات السكنية والفلل الفاخرة والمقرات الإدارية. نعمل بفريق فني متكامل وبأحدث أساليب التصوير والتخطيط ثلاثي الأبعاد، ملتزمون بمواصفات الكود المصري للبناء وتحت المتابعة الدورية بـ شطبها لتقديم أقصى درجات الإتقان وبأعلى معايير جودة البنود.')}
                      </div>
                    </div>

                    {/* Metadata indicators grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                        <span className="text-[10px] text-gray-400 block mb-1">{isEn ? 'Established' : 'عام التأسيس والخبرة'}</span>
                        <strong className="text-xs text-[#2B4D89] font-black">{comp?.establishedYear || 2019} م</strong>
                      </div>
                      <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                        <span className="text-[10px] text-gray-400 block mb-1">{isEn ? 'Completed Projects' : 'إجمالي المشاريع السابقة'}</span>
                        <strong className="text-xs text-indigo-900 font-black">{comp?.projectsCompleted || 32} مشروع ناجح</strong>
                      </div>
                      <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                        <span className="text-[10px] text-gray-400 block mb-1">{isEn ? 'Coverage areas' : 'نطاق وتغطية المدن'}</span>
                        <strong className="text-[10px] text-gray-800 font-bold block overflow-hidden text-ellipsis whitespace-nowrap">{(comp?.governorates || ['القاهرة', 'الجيزة']).join('، ')}</strong>
                      </div>
                      <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                        <span className="text-[10px] text-gray-400 block mb-1">{isEn ? 'Status' : 'التوثيق القانوني'}</span>
                        <strong className="text-[10px] text-emerald-700 font-extrabold flex items-center justify-center gap-0.5">
                          ✓ {isEn ? 'CR & Tax Card Verified' : 'مستندات موثقة ومقيدة'}
                        </strong>
                      </div>
                    </div>

                    {/* Performance Metrics sliders */}
                    <div className="space-y-2.5 pt-1.5 bg-gray-50/40 p-3.5 rounded-2xl border border-gray-100 text-right">
                      <h5 className="text-[10.5px] font-black text-[#2B4D89] border-b border-gray-100 pb-1.5 mb-2 flex items-center gap-1 text-right">
                        📊 {isEn ? 'Shatibha Verified Performance KPIs' : 'مؤشرات الأداء والجودة المعتمدة من شطبها (مبني على تقارير المشرفين):'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 text-right">
                          <div className="flex justify-between items-center text-[10px] flex-row-reverse">
                            <span className="text-gray-500">{isEn ? 'On-Time Project Delivery' : 'معدل الالتزام بجدول التنفيذ والوقت للوحدات'}</span>
                            <span className="font-extrabold text-[#2B4D89]">{comp?.timingCommitment || 96}%</span>
                          </div>
                          <div className="h-2 bg-gray-150 rounded-full overflow-hidden">
                            <div className="bg-[#2B4D89] h-full rounded-full" style={{ width: `${comp?.timingCommitment || 96}%` }}></div>
                          </div>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="flex justify-between items-center text-[10px] flex-row-reverse">
                            <span className="text-gray-500">{isEn ? 'Site Supervisor Final Approval Rate' : 'معدل جودة تنفيذ البنود واجتياز الفحص الهندسي'}</span>
                            <span className="font-extrabold text-emerald-700">{comp?.inspectorApprovalRate || 98}%</span>
                          </div>
                          <div className="h-2 bg-gray-150 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${comp?.inspectorApprovalRate || 98}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. STANDARD PACKAGES TAB */}
                {offerModalTab === 'PACKAGES' && (
                  <div className="space-y-4 animate-fadeIn text-right">
                    <p className="text-[10.5px] text-gray-500 leading-relaxed mb-3 text-right">
                      {isEn 
                        ? 'Compare the custom bid sent to you with this contractor’s standard price list list. Packages include complete labor and materials calculated per square meter.' 
                        : 'عقد مقارنة سهلة وسريعة: الباقات والأسعار والبنود الرسمية المعتمدة للمتر لدى الشركة. لائحة التسعير تمكنك من مراجعة تسعير المتر المربع وتفاصيل خامات البنود للتأكد من نزاهة السعر:'
                      }
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {comPackages.map((pkg) => (
                        <div key={pkg.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:border-[#2B4D89]/40 transition-all flex flex-col justify-between text-right">
                          <div>
                            <div className="flex justify-between items-start gap-1 pb-2 border-b border-gray-100 flex-row-reverse">
                              <h5 className="font-extrabold text-xs text-indigo-900 flex items-center gap-1 text-right">
                                🌟 {pkg.name}
                              </h5>
                              <span className="bg-[#2B4D89]/10 text-[#2B4D89] text-[11px] font-black px-2.5 py-1 rounded-lg shrink-0 font-sans">
                                {pkg.pricePerSqm.toLocaleString()} ج.م / م²
                              </span>
                            </div>

                            <p className="text-[10px] text-gray-500 my-2.5 leading-relaxed text-right">
                              {pkg.description}
                            </p>

                            <div className="space-y-1.5 pt-1.5 text-right">
                              <span className="text-[10px] text-slate-400 block font-bold text-right">{isEn ? 'Included Features & Brands:' : 'أبرز المواد المضمونة والبنود المشمولة بالكامل:'}</span>
                              <ul className="space-y-1 text-[10px] list-none text-right">
                                {pkg.features.map((feat, fIdx) => (
                                  <li key={fIdx} className="flex items-start gap-1 text-gray-700 justify-end">
                                    <span className="text-emerald-600 shrink-0 font-bold ml-1">✓</span>
                                    <span>{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400 font-bold flex-row-reverse">
                            <span>🛡️ ضمان شامل 10 سنوات على المخرجات</span>
                            <span>خاضع للمعاينة الفنية من شطبها</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. WORKS PORTFOLIO TAB */}
                {offerModalTab === 'PORTFOLIO' && (
                  <div className="space-y-4 animate-fadeIn text-right">
                    <p className="text-[10.5px] text-gray-500 leading-relaxed mb-3 text-right">
                      {isEn 
                        ? 'Actual residential and commercial works delivered by this contractor. Explore their execution quality with interactive before/after photo toggles.' 
                        : 'معرض سابقة أعمال ومشاريع واقعية نفذها المطور على أرض الطبيعة. يمكنك النقر بمرونة على أزار (قبل التشطيب) و(بعد التشطيب) لمشاهدة التحول الدقيق:'
                      }
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {comPortfolio.map((item) => {
                        const currentToggle = beforeAfterToggle[item.id] || 'AFTER';
                        const hasBeforeAfter = item.beforeImages && item.beforeImages.length > 0 && item.afterImages && item.afterImages.length > 0;
                        
                        let displayImg = item.images[0] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80';
                        if (hasBeforeAfter) {
                          displayImg = currentToggle === 'BEFORE' 
                            ? (item.beforeImages ? item.beforeImages[0] : displayImg)
                            : (item.afterImages ? item.afterImages[0] : displayImg);
                        }

                        return (
                          <div key={item.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all relative flex flex-col justify-between">
                            
                            {/* Photo and toggles */}
                            <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                              <img 
                                src={displayImg} 
                                alt={item.projectName} 
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                referrerPolicy="no-referrer"
                              />

                              {/* Interactive Before / After Tabs if available */}
                              {hasBeforeAfter && (
                                <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-1.5 py-1 rounded-xl flex items-center gap-1 border border-white/20 z-10 scale-90">
                                  <button
                                    type="button"
                                    onClick={() => setBeforeAfterToggle(prev => ({ ...prev, [item.id]: 'BEFORE' }))}
                                    className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                                      currentToggle === 'BEFORE' ? 'bg-[#2B4D89] text-white shadow' : 'text-slate-300 hover:text-white'
                                    }`}
                                  >
                                    {isEn ? 'Before' : 'قبل التشطيب'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setBeforeAfterToggle(prev => ({ ...prev, [item.id]: 'AFTER' }))}
                                    className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                                      currentToggle === 'AFTER' ? 'bg-[#2B4D89] text-white shadow' : 'text-slate-300 hover:text-white'
                                    }`}
                                  >
                                    {isEn ? 'After' : 'بعد التشطيب'}
                                  </button>
                                </div>
                              )}

                              {/* Project Tag */}
                              <span className="absolute top-3 right-3 bg-black/55 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded-md font-sans font-bold">
                                {item.projectType}
                              </span>
                            </div>

                            {/* Details text */}
                            <div className="p-3.5 space-y-2 text-right">
                              <div className="flex justify-between items-center text-xs flex-row-reverse">
                                <h6 className="font-extrabold text-[#2B4D89] text-xs leading-tight text-right">
                                  {item.projectName}
                                </h6>
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded shrink-0">
                                  {item.governorate} • {item.executionYear}
                                </span>
                              </div>

                              <p className="text-[10px] text-gray-500 leading-relaxed max-h-16 overflow-y-auto text-right">
                                {item.description || (isEn ? 'Full interior design finishing including custom cabinetry and bespoke layouts.' : 'تم استلام الموقع على هيكل الخرسانة الأسود وتنفيذ كافة التعديلات وعزل الصوت ورش الدهانات الأكريليكية الفخمة وبورسلين الصالون.')}
                              </p>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Action Buttons: Accept / Reject */}
              <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                
                {/* Reject Option */}
                <button
                  type="button"
                  onClick={() => {
                    handleRejectOfferInternal(o.id);
                    setViewingOfferDetails(null);
                  }}
                  className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl font-bold text-xs transition-colors cursor-pointer flex-1 text-center"
                >
                  ❌ {isEn ? 'Reject Offer' : 'رفض واستبعاد العرض'}
                </button>

                {/* Accept Option */}
                <button
                  type="button"
                  onClick={() => {
                    onAcceptOffer(o.requestId, o);
                    setViewingOfferDetails(null);
                    if (req) {
                      setSelectedRequestId(req.id);
                    }
                    setSelectedStatCard('NONE');
                  }}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-800 text-white rounded-xl font-extrabold text-xs transition-colors cursor-pointer flex-1 text-center shadow-lg shadow-emerald-600/10 animate-pulse"
                >
                  🤝 {isEn ? 'Accept Offer & Start Build' : 'قبول العرض وبدء كتابة العقد رسميًا 🤝'}
                </button>

              </div>

            </div>
          </div>
        );
      })()}

      {/* 🎞️ Client Fullscreen Interactive Presentation Slide-deck Modal */}
      {clientPresentationOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-50 flex flex-col justify-between p-4 sm:p-8 text-right animate-fade-in text-white font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 max-w-7xl mx-auto w-full">
            <button
              type="button"
              onClick={() => {
                setClientPresentationOpen(false);
              }}
              className="bg-slate-900 border border-slate-800 text-gray-300 hover:text-white hover:bg-slate-850 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>✕</span>
              <span>{isEn ? 'Close Presentation' : 'إنهاء العرض التقديمي (خروج)'}</span>
            </button>

            <div className="text-right">
              <span className="text-[9px] text-amber-500 font-extrabold tracking-widest block font-sans">
                SHATTABHA CLIENT TRANSFORMATION VIEW
              </span>
              <h2 className="font-extrabold text-xs sm:text-sm text-white font-sans">
                {isEn ? 'Before & After Master Presentation Deck' : 'العرض التقديمي للتغطية الميدانية (قبل وبعد التشطيب) 🎞️'}
              </h2>
            </div>
          </div>

          {/* Main Slide Viewer */}
          <div className="max-w-5xl mx-auto w-full my-auto py-6 grid grid-cols-1 gap-6">
            {(() => {
              const activeProjStages = stages.filter(s => s.requestId === selectedRequest?.id);

              // Determine the slide list based on selection
              const activeDeckStages = clientPresentationSelectedStageId === 'project-overall' 
                ? activeProjStages.filter(s => s.publishedPresentation) 
                : activeProjStages.filter(s => s.id === clientPresentationSelectedStageId);

              if (activeDeckStages.length === 0) {
                return (
                  <div className="text-center text-gray-400 py-12">
                    <p>{isEn ? 'No slides published for your view yet.' : 'لا توجد شرائح منشورة رسمياً لهذا العرض حالياً.'}</p>
                  </div>
                );
              }

              // Bound slide index safely
              const currentSlidePart = Math.min(Math.max(0, clientSlideIndex), activeDeckStages.length - 1);
              const stg = activeDeckStages[currentSlidePart];

              // Inline simple helper for fallback images:
              const getStageMockImg = (stgName: string, type: 'before' | 'after'): string => {
                const name = (stgName || '').toLowerCase();
                if (name.includes('سباك') || name.includes('صرف') || name.includes('plumb')) {
                  return type === 'before' 
                    ? 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1542013936693-8848e574047a?auto=format&fit=crop&w=800&q=80';
                } else if (name.includes('كهرب') || name.includes('إنار') || name.includes('elect')) {
                  return type === 'before' 
                    ? 'https://images.unsplash.com/photo-1558224494-ef8b2175a501?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80';
                } else if (name.includes('محار') || name.includes('بياض') || name.includes('plast')) {
                  return type === 'before' 
                    ? 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80';
                } else if (name.includes('أرضي') || name.includes('سرام') || name.includes('tile') || name.includes('floor')) {
                  return type === 'before' 
                    ? 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80';
                } else {
                  return type === 'before' 
                    ? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80';
                }
              };

              const bImg = stg.beforeImages?.[0] || getStageMockImg(stg.name, 'before');
              const aImg = stg.afterImages?.[0] || getStageMockImg(stg.name, 'after');

              return (
                <div className="space-y-6">
                  {/* Slide Title and Info */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-4 rounded-3xl border border-slate-800/85">
                    {/* Navigation arrows */}
                    {clientPresentationSelectedStageId === 'project-overall' && activeDeckStages.length > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={currentSlidePart === activeDeckStages.length - 1}
                          onClick={() => setClientSlideIndex(prev => Math.min(activeDeckStages.length - 1, prev + 1))}
                          className="bg-slate-800 text-white disabled:opacity-40 px-3 py-1.5 text-xs font-black rounded-xl hover:bg-slate-700 cursor-pointer"
                        >
                          {isEn ? '← Prev Stage' : '← المرحلة السابقة'}
                        </button>
                        <span className="text-xs text-white bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
                          {currentSlidePart + 1} / {activeDeckStages.length}
                        </span>
                        <button
                          type="button"
                          disabled={currentSlidePart === 0}
                          onClick={() => setClientSlideIndex(prev => Math.max(0, prev - 1))}
                          className="bg-slate-800 text-white disabled:opacity-40 px-3 py-1.5 text-xs font-black rounded-xl hover:bg-slate-700 cursor-pointer"
                        >
                          {isEn ? 'Next Stage →' : 'المرحلة التالية →'}
                        </button>
                      </div>
                    )}

                    <div className="text-right sm:ml-auto">
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-full border border-amber-500/10">
                        {stg.name}
                      </span>
                      <h3 className="font-extrabold text-white text-base mt-1.5">
                        {stg.name} — {isEn ? 'Transformation Tracker' : 'مقارنة هندسية لمستوى جودة التشطيب والعمل الميداني'}
                      </h3>
                      <p className="text-[11px] text-slate-300 mt-1">
                        {stg.reportText || (isEn ? 'Technical Handover completely approved by platform supervisor.' : 'تم تسليم واعتماد البند تحت إشراف هندسي ومطابق تام للمواصفات.')}
                      </p>
                    </div>
                  </div>

                  {/* Photos Grid Before vs After side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* BEFORE SLIDE */}
                    <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-black text-rose-400 flex items-center gap-1 justify-start">
                          <span className="w-2 h-2 rounded bg-rose-500 animate-pulse"></span>
                          {isEn ? 'BEFORE SUPERVISED REVISION' : 'صور البند قبل المعالجة الفنية'}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1 text-right">
                          تأسيس البند في حالته الأولية وبداية السباكة / الكهرباء / المحارة والأسقف.
                        </p>
                      </div>
                      <div className="aspect-[4/3] rounded-2xl bg-black overflow-hidden relative border border-slate-800">
                        <img src={bImg} alt="Before" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" referrerPolicy="no-referrer" />
                        <div className="absolute top-3 left-3 bg-rose-950/80 text-rose-300 text-[9px] font-black px-2.5 py-1 rounded-full border border-rose-500/20 backdrop-blur-xs">
                          {isEn ? 'Original Draft' : 'كود الهيكل التأسيسي 🧱'}
                        </div>
                      </div>
                    </div>

                    {/* AFTER SLIDE */}
                    <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1 justify-start">
                          <span className="w-2 h-2 rounded bg-emerald-400 animate-pulse"></span>
                          {isEn ? 'AFTER OFFICIAL APPROVAL' : 'النتيجة المعتمدة بعد الاستلام الهندسي'}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1 text-right">
                          شطبها استلمت وتأكدت مطابقته للكود المصري والمقاسات بمراجعة المهندس.
                        </p>
                      </div>
                      <div className="aspect-[4/3] rounded-2xl bg-black overflow-hidden relative border border-slate-800">
                        <img src={aImg} alt="After" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" referrerPolicy="no-referrer" />
                        <div className="absolute top-3 left-3 bg-emerald-950/80 text-emerald-300 text-[9px] font-black px-2.5 py-1 rounded-full border border-emerald-500/20 backdrop-blur-xs">
                          {isEn ? 'Approved & Locked' : 'التسليم المعتمد النهائي ✨'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setClientPresentationOpen(false)}
                      className="bg-[#2B4D89] text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all hover:bg-[#30445E] cursor-pointer"
                    >
                      {isEn ? 'Return to Timeline' : 'رجوع لجدول المتابعة'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="text-center font-mono text-[8px] text-slate-600 max-w-7xl mx-auto w-full pt-4 border-t border-slate-800">
            SHATTABHA CLIENT PLATFORM TRANSFORMATION DECK SYSTEM © 2026
          </div>
        </div>
      )}

    </div>
  </div>
</div>
  );
};
