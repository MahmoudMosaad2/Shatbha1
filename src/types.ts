/**
 * Shared Type Definitions for the Shattabha (شطبها) Platform
 */

export type Role = 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR';

export type RequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_TECHNICAL_REVIEW'
  | 'APPROVED_FOR_BIDDING'
  | 'BIDDING_OPEN'
  | 'BIDDING_CLOSED'
  | 'CONTRACT_AWARD_PENDING'
  | 'SITE_INSPECTION_COMPLETED'
  | 'CONTRACT_SIGNED'
  | 'ACTIVE'
  | 'DELAYED'
  | 'COMPLETED'
  | 'ARCHIVED'
  // Legacy / backup statuses to prevent view breaking:
  | 'PENDING_REVIEW'   
  | 'UNDER_PRICING'    
  | 'OFFERS_RECEIVED'  
  | 'CLIENT_SELECTED'  
  | 'COORDINATION'     
  | 'CONTRACTED'       
  | 'WAITING_FOR_INSPECTION' 
  | 'CANCELLED';       

export type CompanyStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'SUSPENDED';

export type ProjectStageStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'INSPECTION_REQUESTED'
  | 'INSPECTION_FAILED'
  | 'INSPECTION_APPROVED'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'CLOSED'
  // Legacy states mapping support:
  | 'NOT_STARTED'
  | 'UNDER_WAY'
  | 'REJECTED'
  | 'APPROVED';


export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl?: string; // الصورة الشخصية للعميل
}

export interface FinishingPackage {
  id: string;
  name: string;         // اسم الباقة التفصيلي
  pricePerSqm: number;  // السعر للمتر المربع
  description: string;  // وصف الباقة وفترة الضمان
  features: string[];   // البنود والمميزات المشمولة
}

export interface PortfolioItem {
  id: string;
  projectName: string;
  projectType: string;  // نوع المشروع (سكني | تجاري | إداري)
  governorate: string;  // المحافظة
  executionYear: number;// سنة التنفيذ
  images: string[];     // صور المشروع العامة
  beforeImages?: string[]; // صور قبل / أثناء العمل
  afterImages?: string[];  // صور بعد العمل والتسليم
  description?: string; // وصف تفاصيل التشطيب والمواد المستخدمة
}

export interface Company {
  id: string;
  userId: string;
  companyName: string;
  commercialReg: string; // File name or "تم الرفع"
  taxCard: string;       // File name or "تم الرفع"
  status: CompanyStatus;
  finishingTypes: string[]; // e.g., ["عادي", "لوكس", "سوبر لوكس", "بريميوم"]
  governorates: string[];   // e.g., ["القاهرة", "الجيزة", "الإسكندرية"]
  cities: string[];         // e.g., ["مدينة نصر", "الشيخ زايد", "المعادي"]
  rating: number;
  projectsCompleted: number;
  isVerified?: boolean;      // تم توثيقها من الأدمن - شريك موثق بعلامة زرقاء
  logoUrl?: string;          // شعار الشركة الافتراضي
  coverUrl?: string;         // صورة الغلاف للشركة
  establishedYear?: number;  // سنة التأسيس
  aboutText?: string;        // نبذة تعريفية بالشركة ورؤيتها
  packages?: FinishingPackage[]; // باقات وأسعار التشطيب الخاصة بالشركة
  portfolio?: PortfolioItem[];   // معرض الأعمال السابقة وجاليري الصور
  timingCommitment?: number;     // معدل الالتزام بالمواعيد (%، مثله مثل مؤشرات الأداء المطلوبة)
  inspectorApprovalRate?: number; // معدل اعتماد المراحل من المشرف الفني (%)
  projectsThroughShattabha?: number; // عدد المشروعات المكتملة عبر المنصة
  phone?: string;            // رقم الهاتف للاتصال المباشر (بيانات تواصل مخفية قبل التعاقد)
  whatsapp?: string;         // رقم الواتساب (مخفي قبل التعاقد)
  email?: string;            // البريد الإلكتروني (مخفي قبل التعاقد)
  website?: string;          // الموقع الإلكتروني للشركة (مخفي قبل التعاقد)
  officeAddress?: string;     // عنوان المكتب الرئيسي (مخفي قبل التعاقد)
}

export interface ClientRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  unitType: string;        // شقة | فيلا | مكتب | دوبلكس | محل تجاري
  area: number;           // المساحة بالمتر المربع
  governorate: string;    // المحافظة
  city: string;           // المدينة
  finishingLevel: string; // عادي | لوكس | سوبر لوكس | بريميوم
  budget: number;         // الميزانية التقديرية بالجنيه المصري
  notes?: string;
  requireInspector?: boolean; // إضافة مشرف فني من شطبها (عمولة 1%) أو بدون
  detailedLocationText?: string; // تفاصيل العنوان بدقة
  mapCoordinates?: string; // إحداثيات الموقع أو رابط الخرائط الافتراضية
  blueprints?: string[];  // روابط أو أسماء مخططات الكروكي والـ PDF
  status: RequestStatus;
  deadline?: string;      // تاريخ نهاية التقديم التلقائي (7 أيام)
  assignedInspectorId?: string; // معرف المشرف الفني المعين للزيارات الميدانية
  inspectionDate?: string; // تاريخ التسليم الفعلي لإنشاء عداد الضمان التنازلي المباشر
  coordinationInspectionDate?: string; // موعد المعاينة المتفق عليه
  coordinationContractDate?: string;   // موعد كتابة العقد وتوقيعه
  actualStartDate?: string;            // تاريخ البدء الفعلي لأولى مراحل التشطيب (من قِبل المشرف)
  coordinationContractFile?: string;   // نسخة أو محتوى ملف العقد المرفوع
  coordinationNotes?: string;          // ملاحظات التنسيق الفنية والإدارية
  selectedOfferId?: string;            // معرف العرض الفائز الذي اختاره العميل
  selectedCompanyId?: string;          // معرف شركة المقاولات الفائزة بالعقد
  fieldSurveyDone?: boolean;           // تأكيد إتمام المعاينة الميدانية من المشرف
  inspectionReport?: string;           // تقرير المعاينة الميدانية المصادق عليه وملاحظات الزيارة
  contractSigningDate?: string;        // تاريخ توقيع العقد النهائي المخطط له (من لوحة المشرف)
  finalContractPrice?: number;         // السعر النهائي الفعلي للتعاقد المدخل من لوحة المشرف
  delayFine?: number;                  // غرامة التأخير اليومية المتفق عليها
  warrantyPeriod?: string;             // فترة الضمان المتفق عليها (مثل: ٥ سنوات)
  executionDurationDays?: number;      // مدة التنفيذ الكلية المتفق عليها بالأيام
  delayDays?: number;                  // عدد أيام التأخير المتراكمة
  accumulatedDelayFine?: number;        // إجمالي غرامة التأخير المتراكمة المخصومة
  advancePaid?: boolean;               // التأكيد على دفع الدفعة المقدمة
  advancePaidAmount?: number;          // قيمة الدفعة المقدمة المدفوعة
  finalContractFile?: string;          // اسم ملف العقد النهائي المرفوع والموقع
  isLaunchedByAdmin?: boolean;         // تأكيد إطلاق المشروع رسمياً ونقله للمرحلة الجارية
  workStartDate?: string;              // موعد بدء الأعمال الفعلي بالتنسيق مع العميل والشركة
  bedroomsCount?: number;    // عدد الغرف
  bathroomsCount?: number;   // عدد الحمامات
  kitchensCount?: number;    // عدد المطابخ
  originalInspectionFee?: number;      // قيمة الإشراف الأصلية
  usedPromoCode?: string;              // كود الخصم المستخدم
  promoDiscountAmount?: number;        // قيمة الخصم
  finalInspectionFee?: number;         // قيمة الإشراف النهائية
  companyCommissionPaid?: boolean;     // هل تم تحصيل عمولة الشركة؟
  clientCommissionPaid?: boolean;      // هل تم تحصيل عمولة العميل؟
  companyCommissionPaidAt?: string;    // تاريخ تحصيل عمولة الشركة
  clientCommissionPaidAt?: string;     // تاريخ تحصيل عمولة العميل
  associatedProjectId?: string;        // رقم المشروع المرتبط في حال تم تحويل الطلب إلى مشروع
  createdAt: string;
}

export interface PromoCode {
  id: string;                          // المعرف الفريد
  code: string;                        // اسم الكود (مثال: WELCOME10)
  discountType: 'FIXED' | 'PERCENTAGE'; // مبلغ ثابت | نسبة مئوية
  discountValue: number;               // قيمة الخصم (مبلغ أو نسبة)
  startDate: string;                   // تاريخ البداية
  endDate: string;                     // تاريخ الانتهاء
  usageLimit: number;                  // عدد مرات الاستخدام المتاحة إجمالاً
  usageCount: number;                  // عدد مرات الاستخدام الفعلي
  maxPerClient: number;                // الحد الأقصى للاستخدام لكل عميل
  status: 'ACTIVE' | 'PAUSED';         // حالة الكود: نشط | متوقف
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string; // Target user's ID or role identifier
  title: string;
  message: string;
  requestId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Offer {
  id: string;
  requestId: string;
  companyId: string;
  companyName: string;    // Will be masked for client: e.g. "عرض رقم 1"
  price: number;          // السعر الإجمالي
  durationDays: number;   // مدة التنفيذ بالأيام
  description: string;    // الوصف والتفاصيل المادية والأبواب والنوافذ والضمان
  portfolio: string[];    // صور من أعمال سابقة مشابهة
  createdAt: string;
  materialsDetail?: string; // تفصيل نوع الخامات المستخدمة في كل بند
  warrantyDetail?: string;  // مواصفات الضمان ومدته
}

export interface Contract {
  id: string;
  requestId: string;
  companyId: string;
  totalAmount: number; // estimated/proposal bid price
  finalContractPrice?: number; // actual physical finalized price after tripartite contracting
  commissionRate: number; // 0.05 (5%)
  commissionAmt: number;  // المحسوبة تلقائياً
  inspectionDate: string; // موعد المعاينة
  meetingDate: string;    // موعد الاجتماع الثلاثي
  status: string;         // "جاري التنسيق" | "تم تحديد الموعد" | "تمت المعاينة" | "تمت كتابة العقد"
  isSigned: boolean;
  delayPenaltyPerDay?: number; // قيمة غرامة التأخير اليومية المتفق عليها بالجنيه
  paymentPercentages?: Record<string, number>; // نسب الدفعات بناء على بنود التعاقد المتفق عليها
  createdAt: string;
}

export interface Inspector {
  id: string;
  name: string;
  governorate: string;
  zone: string;
  activeProjectsCount: number;
  phone: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
  password?: string;
  stagesSpecialties?: string[];
  responseSpeedRating?: number;
  reportAccuracyRating?: number;
  totalEvaluationsCount?: number;
}

export interface ProjectStage {
  id: string;
  requestId: string;
  name: string;      // سباكة، كهرباء، محارة، دهانات
  status: ProjectStageStatus;
  progress: number;  // 0 - 100
  totalDurationDays?: number; // إجمالي مدة المرحلة بالأيام
  daysElapsed?: number;       // الأيام المنقضية الفعليه
  images: string[];
  inspectionRequested: boolean; // True when company requests inspection
  paymentReleased: boolean;     // True when client releases payment after approval
  rejectedNotes?: string;
  reportText?: string;
  reportDate?: string;
  complaintText?: string; // الشكاوى الفنية من العملاء
  complaintDate?: string;
  delayPenaltyPerDay?: number; // مبلغ غرامة التأخير عن كل يوم بالجنيه
  startDate?: string;          // تاريخ بداية المرحلة
  endDate?: string;            // تاريخ نهاية المرحلة المتوقع
  beforeImages?: string[];     // صور قبل التشطيب لكل مرحلة ومطابقتها الميدانية
  afterImages?: string[];      // صور بعد الاستلام وتوثيق جودة الخامات
  publishedPresentation?: boolean; // تفعيل وإتاحة العرض التقديمي لصفحة العميل
  paymentPercentage?: number; // نسبة الدفعة المالية المخصصة لهذا البند من السعر الإجمالي
}

// Support for Project Planning Phase, Timeline, and Warranty
export interface ProjectPlanning {
  requestId: string;
  planStartDate: string;
  planSummary: string;
  stagesCount: number;
}

export interface WarrantyRecord {
  id: string; // WR-...
  requestId: string;
  clientName: string;
  clientId: string;
  companyName: string;
  companyId: string;
  inspectorName: string;
  inspectorId: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: 'Warranty Active' | 'Warranty Expired' | 'ACTIVE' | 'EXPIRED';
}

export interface WarrantyComplaint {
  id: string; // WC-...
  warrantyRecordId: string;
  requestId: string;
  clientId: string;
  companyId: string;
  inspectorId: string;
  title: string;
  description: string;
  locationOfProblem: string;
  images: string[];
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVING' | 'RESOLVED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  actionAr: string;
  actionEn: string;
  details: string;
  createdAt: string;
}


export type CommissionStatus = 'DUE' | 'COLLECTED' | 'PENDING';

export interface ProjectCommission {
  id: string; // e.g. COMM-101
  requestId: string;
  projectName: string;
  clientName: string;
  companyName: string;
  governorate: string;
  city: string;
  area: number;
  companyCommission: number; // area * 100
  clientCommission: number;  // area * 100 (if requireInspector)
  totalCommission: number;   // companyCommission + clientCommission
  status: CommissionStatus;
  dueDate: string;
  collectionDate?: string;
  notes?: string;
  createdAt: string;
}


