import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, CheckCircle2, XCircle, Camera, RefreshCw, MapPin, 
  Phone, User, Check, AlertCircle, FileText, ClipboardList, Navigation, 
  Map, Eye, Star, Compass, CloudLightning, Globe, LogOut
} from 'lucide-react';
import { ClientRequest, ProjectStage, Inspector } from '../types';
import { Language, getTranslation } from '../lib/translations';

interface SiteInspectorDashboardViewProps {
  requests: ClientRequest[];
  stages: ProjectStage[];
  inspectors: Inspector[];
  onUpdateStage: (stageId: string, updates: Partial<ProjectStage>) => void;
  lang: Language;
  setLang?: (lang: Language) => void;
  onUpdateRequest?: (requestId: string, updates: Partial<ClientRequest>) => void;
  onSignOut?: () => void;
}

export const SiteInspectorDashboardView: React.FC<SiteInspectorDashboardViewProps> = ({
  requests,
  stages,
  inspectors,
  onUpdateStage,
  lang,
  setLang,
  onUpdateRequest,
  onSignOut
}) => {
  const isEn = lang === 'en';
  // Toggle between inspectors using a local simulator state
  const [activeInspectorId, setActiveInspectorId] = useState<string>('INSP-1');
  const activeInspector = inspectors.find(i => i.id === activeInspectorId) || inspectors[0];

  // Inspector local coordination form states
  const [inspInspectionDate, setInspInspectionDate] = useState('2026-06-03');
  const [inspContractDate, setInspContractDate] = useState('2026-06-05');
  const [inspContractFile, setInspContractFile] = useState('');
  const [inspNotes, setInspNotes] = useState('');
  const [inspActualStartDate, setInspActualStartDate] = useState('');
  const [inspectionReportText, setInspectionReportText] = useState('');

  // Selected project in Inspector's screen
  const assignedProjects = requests.filter(r => r.assignedInspectorId === activeInspectorId);

  // States for the new KPI & Table filtered layout
  const [tableFilter, setTableFilter] = useState<'ACTIVE' | 'AWAITING_INSPECTION' | 'PENDING_CONTRACTS'>('ACTIVE');
  const [tableSortOption, setTableSortOption] = useState<'NONE' | 'DELIVERY_DATE' | 'EXECUTION_STATUS'>('NONE');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Inspector field inspection & contract details states (new features)
  const [fieldSurveyDone, setFieldSurveyDone] = useState<boolean>(false);
  const [contractSigningDate, setContractSigningDate] = useState<string>('');
  const [finalContractPrice, setFinalContractPrice] = useState<number>(0);
  const [delayFine, setDelayFine] = useState<number>(500);
  const [warrantyPeriod, setWarrantyPeriod] = useState<string>('٥ سنوات بضمان معتمد');
  const [advancePaid, setAdvancePaid] = useState<boolean>(false);
  const [advancePaidAmount, setAdvancePaidAmount] = useState<number>(50000);
  const [executionDurationDays, setExecutionDurationDays] = useState<number>(120);
  const [workStartDate, setWorkStartDate] = useState<string>('');

  // States for contract payment stage percentages
  const [percPlumbing, setPercPlumbing] = useState<number>(15);
  const [percElectric, setPercElectric] = useState<number>(15);
  const [percConcrete, setPercConcrete] = useState<number>(15);
  const [percFloor, setPercFloor] = useState<number>(20);
  const [percPaint, setPercPaint] = useState<number>(20);
  const [percFinal, setPercFinal] = useState<number>(15);

  // Synchronize with external selection triggers (like clicking on a request code inside details modal)
  useEffect(() => {
    const handleActiveChanged = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const targetId = customEvent.detail;
      if (!targetId) return;
      
      const req = requests.find(r => r.id === targetId);
      if (!req) return;
      
      if (req.assignedInspectorId) {
        setActiveInspectorId(req.assignedInspectorId);
      }
      setSelectedProjectId(targetId);
      
      // Auto toggle filters if needed
      const hasInspectionRequested = stages.filter(s => s.requestId === targetId).some(s => s.inspectionRequested);
      if (hasInspectionRequested) {
        setTableFilter('AWAITING_INSPECTION');
      } else if (req.status === 'WAITING_FOR_INSPECTION' || req.status === 'COORDINATION') {
        setTableFilter('PENDING_CONTRACTS');
      } else {
        setTableFilter('ACTIVE');
      }
    };
    window.addEventListener('shatibha-active-request-changed', handleActiveChanged);
    return () => {
      window.removeEventListener('shatibha-active-request-changed', handleActiveChanged);
    };
  }, [requests, stages]);

  const activeProjects = assignedProjects.filter(r => r.status === 'ACTIVE' && r.requireInspector !== false);
  const awaitingHandoverProjects = assignedProjects.filter(r => {
    const projStages = stages.filter(s => s.requestId === r.id);
    return projStages.some(s => s.inspectionRequested) && r.requireInspector !== false;
  });
  const pendingContracts = assignedProjects.filter(r => ['WAITING_FOR_INSPECTION', 'COORDINATION', 'CLIENT_SELECTED', 'CONTRACT_AWARD_PENDING', 'SITE_INSPECTION_COMPLETED', 'CONTRACT_SIGNED'].includes(r.status));

  const filteredProjectsForTable = 
    tableFilter === 'ACTIVE' ? activeProjects : 
    tableFilter === 'PENDING_CONTRACTS' ? pendingContracts : 
    awaitingHandoverProjects;

  const sortedProjectsForTable = [...filteredProjectsForTable].sort((a, b) => {
    if (tableSortOption === 'DELIVERY_DATE') {
      const dateA = a.inspectionDate || a.coordinationInspectionDate || a.deadline || a.createdAt || '9999-99-99';
      const dateB = b.inspectionDate || b.coordinationInspectionDate || b.deadline || b.createdAt || '9999-99-99';
      return dateA.localeCompare(dateB);
    }
    if (tableSortOption === 'EXECUTION_STATUS') {
      const stagesA = stages.filter(s => s.requestId === a.id);
      const stagesB = stages.filter(s => s.requestId === b.id);
      
      const hasAwaitingA = stagesA.some(s => s.inspectionRequested || s.status === 'INSPECTION_REQUESTED') ? 1 : 0;
      const hasAwaitingB = stagesB.some(s => s.inspectionRequested || s.status === 'INSPECTION_REQUESTED') ? 1 : 0;
      
      if (hasAwaitingA !== hasAwaitingB) {
        return hasAwaitingB - hasAwaitingA; // inspection requested moves to top
      }
      
      // otherwise, count incomplete stages
      const incompleteCountA = stagesA.filter(s => s.status !== 'APPROVED').length;
      const incompleteCountB = stagesB.filter(s => s.status !== 'APPROVED').length;
      return incompleteCountB - incompleteCountA;
    }
    return 0;
  });

  // Active selected project
  const currentProject = requests.find(r => r.id === selectedProjectId && r.assignedInspectorId === activeInspectorId) || sortedProjectsForTable[0] || assignedProjects[0];

  // Handle auto synchronization of selected project when switching inspector or filtering KPIs
  useEffect(() => {
    const assigned = requests.filter(r => r.assignedInspectorId === activeInspectorId);
    const active = assigned.filter(r => r.status === 'ACTIVE' && r.requireInspector !== false);
    const awaiting = assigned.filter(r => {
      const projStages = stages.filter(s => s.requestId === r.id);
      return projStages.some(s => s.inspectionRequested) && r.requireInspector !== false;
    });
    const pending = assigned.filter(r => ['WAITING_FOR_INSPECTION', 'COORDINATION', 'CLIENT_SELECTED', 'CONTRACT_AWARD_PENDING', 'SITE_INSPECTION_COMPLETED', 'CONTRACT_SIGNED'].includes(r.status));
    
    let currentFiltered = active;
    if (tableFilter === 'AWAITING_INSPECTION') {
      currentFiltered = awaiting;
    } else if (tableFilter === 'PENDING_CONTRACTS') {
      currentFiltered = pending;
    }

    if (currentFiltered.length > 0) {
      setSelectedProjectId(currentFiltered[0].id);
    } else if (assigned.length > 0) {
      setSelectedProjectId(assigned[0].id);
    } else {
      setSelectedProjectId('');
    }
  }, [activeInspectorId, tableFilter]);

  // Prefill coordination fields in supervisor view when a project is selected
  useEffect(() => {
    if (currentProject) {
      setInspInspectionDate(currentProject.coordinationInspectionDate || '2026-06-03');
      setInspContractDate(currentProject.coordinationContractDate || '2026-06-05');
      setInspContractFile(currentProject.coordinationContractFile || '');
      setInspNotes(currentProject.coordinationNotes || '');
      setInspActualStartDate(currentProject.actualStartDate || '');
      setInspectionReportText(currentProject.inspectionReport || '');

      setFieldSurveyDone(currentProject.fieldSurveyDone || false);
      setContractSigningDate(currentProject.contractSigningDate || new Date().toISOString().split('T')[0]);
      setFinalContractPrice(currentProject.finalContractPrice || currentProject.budget || 150000);
      setDelayFine(currentProject.delayFine || 500);
      setWarrantyPeriod(currentProject.warrantyPeriod || '٥ سنوات بضمان معتمد');
      setAdvancePaid(currentProject.advancePaid || false);
      setAdvancePaidAmount(currentProject.advancePaidAmount || 50000);
      setExecutionDurationDays(currentProject.executionDurationDays || 120);
      setWorkStartDate(currentProject.workStartDate || new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0]);

      // Pre-fill stage percentages from current project data if they exist
      setPercPlumbing(currentProject.paymentPercentages?.["أعمال السباكة والصرف الفني"] || currentProject.paymentPercentages?.["السباكة"] || 15);
      setPercElectric(currentProject.paymentPercentages?.["تأسيس الكهرباء والشبكات"] || currentProject.paymentPercentages?.["الكهرباء"] || 15);
      setPercConcrete(currentProject.paymentPercentages?.["أعمال البياض والمحارة الداخلية"] || currentProject.paymentPercentages?.["المحارة"] || 15);
      setPercFloor(currentProject.paymentPercentages?.["تركيب البورسلين والأرضيات"] || currentProject.paymentPercentages?.["الأرضيات"] || 20);
      setPercPaint(currentProject.paymentPercentages?.["أعمال الدهانات والتشطيبات الأساسية"] || currentProject.paymentPercentages?.["الدهانات"] || 20);
      setPercFinal(currentProject.paymentPercentages?.["التشطيبات النهائية وتسليم المفاتيح"] || currentProject.paymentPercentages?.["التشطيب"] || 15);
    }
  }, [currentProject?.id, requests]);

  const handleMarkSiteInspectionCompleted = () => {
    if (!currentProject || !onUpdateRequest) return;
    onUpdateRequest(currentProject.id, {
      fieldSurveyDone: true,
      inspectionReport: inspectionReportText,
      contractSigningDate: contractSigningDate || new Date().toISOString().split('T')[0],
      status: 'SITE_INSPECTION_COMPLETED'
    });
    alert(isEn 
      ? '✔️ Site Inspection Completed! Status updated. Please now proceed with drafting the final contract details below.' 
      : '✔️ تمت المعاينة الميدانية وتحديث الحالة بنجاح (Site Inspection Completed). يرجى الآن تعبئة تفاصيل وقيمة العقد الموقعة وبنود الدفعات.');
  };

  const getProjectProgressAndStatus = (projId: string) => {
    const proj = requests.find(r => r.id === projId);
    if (proj?.status === 'CLIENT_SELECTED' || proj?.status === 'COORDINATION') {
      return {
        progressPercent: 0,
        statusText: isEn ? '⏳ Awaiting Inspection & Contracting' : '⏳ في انتظار المعاينة وتوقيع العقود'
      };
    }
    const projStages = stages.filter(s => s.requestId === projId);
    const activeStagesCount = projStages.length;
    const approvedCount = projStages.filter(s => s.status === 'APPROVED').length;
    const progressPercent = activeStagesCount > 0 ? Math.round((approvedCount / activeStagesCount) * 105 / 105 * 100) : 0; // standard progress calculation
    const progressPercentFinal = Math.min(progressPercent, 100);

    // Find current active stage
    const awaitingInspectionStage = projStages.find(s => s.inspectionRequested);
    let statusText = '';
    if (awaitingInspectionStage) {
      statusText = isEn 
        ? `Inspection requested for ${awaitingInspectionStage.name}` 
        : `مطلوب معاينة استلام ${awaitingInspectionStage.name}`;
    } else {
      const underwayStage = projStages.find(s => s.status === 'UNDER_WAY');
      if (underwayStage) {
        statusText = isEn 
          ? `Underway: ${underwayStage.name}` 
          : `جاري تنفيذ مرحلة ${underwayStage.name}`;
      } else {
        const nextPendingStage = projStages.find(s => s.status === 'NOT_STARTED');
        if (nextPendingStage) {
          statusText = isEn 
            ? `Next up: ${nextPendingStage.name}` 
            : `جاري التجهيز لمرحلة ${nextPendingStage.name}`;
        } else {
          statusText = isEn ? 'Fully Completed & Handed Over' : 'تم تسليم ومطابقة هندسية كاملة 🌟';
        }
      }
    }
    
    return { progressPercent: progressPercentFinal, statusText };
  };

  // Forms state
  const [reportText, setReportText] = useState<string>('');
  const [notesBefore, setNotesBefore] = useState<string>(isEn ? 'Site condition before inspection: preliminary piping laid on floor.' : 'حالة الموقع قبل بدء الفحص: تمديدات أولية ومواسير ملقاة على الأرض.');
  const [notesAfter, setNotesAfter] = useState<string>(isEn ? 'Site condition after inspection & technical spec compliance handoff.' : 'حالة الموقع بعد الفحص والتسليم الفني المطابق للمواصفات.');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // 📷 Dual Camera Image states
  const [beforeImage, setBeforeImage] = useState<string>('');
  const [afterImage, setAfterImage] = useState<string>('');
  const [cameraActiveBefore, setCameraActiveBefore] = useState<boolean>(false);
  const [cameraActiveAfter, setCameraActiveAfter] = useState<boolean>(false);

  // 🎞️ Presentation State
  const [presentationModeOpen, setPresentationModeOpen] = useState<boolean>(false);
  const [presentationSelectedStageId, setPresentationSelectedStageId] = useState<string>('project-overall');
  const [slideIndex, setSlideIndex] = useState<number>(0);

  // Realistic mock before-after stages pictures
  const stageMockBeforeAfter: Record<string, { before: string; after: string; title: string }> = {
    'سباكة': {
      title: 'أعمال السباكة والصرف الفني',
      before: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1542013936693-8848e574047a?auto=format&fit=crop&w=800&q=80'
    },
    'كهرباء': {
      title: 'أعمال الكهرباء والشبكات',
      before: 'https://images.unsplash.com/photo-1558224494-ef8b2175a501?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
    },
    'محارة': {
      title: 'أعمال البياض والمحارة الداخلية',
      before: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    },
    'أرضيات': {
      title: 'تركيب الأرضيات والبورسلين',
      before: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    },
    'دهانات': {
      title: 'الدهانات الأساسية والديكورية',
      before: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      after: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80'
    }
  };

  const getStageMockImage = (stg: ProjectStage | undefined, type: 'before' | 'after'): string => {
    if (!stg) return 'https://images.unsplash.com/photo-1542013936693-8848e574047a?auto=format&fit=crop&w=800&q=80';
    const name = stg.name.toLowerCase();
    let category = 'سباكة';
    if (name.includes('سباك') || name.includes('صرف') || name.includes('plumb')) {
      category = 'سباكة';
    } else if (name.includes('كهرب') || name.includes('إنار') || name.includes('wiring') || name.includes('elect')) {
      category = 'كهرباء';
    } else if (name.includes('محار') || name.includes('بياض') || name.includes('جبس') || name.includes('plast')) {
      category = 'محارة';
    } else if (name.includes('أرضي') || name.includes('سرام') || name.includes('بورس') || name.includes('رخام') || name.includes('floor') || name.includes('tile')) {
      category = 'أرضيات';
    } else if (name.includes('دهان') || name.includes('نقاش') || name.includes('تشطيب') || name.includes('paint') || name.includes('finish')) {
      category = 'دهانات';
    }
    const match = stageMockBeforeAfter[category] || stageMockBeforeAfter['سباكة'];
    return type === 'before' ? match.before : match.after;
  };

  // Publish / Send before-after presentation to client
  const handlePublishPresentation = (targetStage: ProjectStage) => {
    onUpdateStage(targetStage.id, {
      beforeImages: beforeImage ? [beforeImage] : (targetStage.beforeImages?.length ? targetStage.beforeImages : [getStageMockImage(targetStage, 'before')]),
      afterImages: afterImage ? [afterImage] : (targetStage.afterImages?.length ? targetStage.afterImages : [getStageMockImage(targetStage, 'after')]),
      publishedPresentation: true
    });
    alert(isEn 
      ? `🎉 Before/After Presentation for "${targetStage.name}" has been published and integrated into the client's tracking panel!` 
      : `🎉 تم نشر العرض التقديمي (قبل وبعد التشطيب) لمرحلة "${targetStage.name}" بنجاح وإرساله إلى شاشة العميل أحمد!`);
  };

  const handlePublishAllPresentations = () => {
    if (projectStages.length === 0) return;
    projectStages.forEach((stg) => {
      onUpdateStage(stg.id, {
        beforeImages: stg.beforeImages?.length ? stg.beforeImages : [getStageMockImage(stg, 'before')],
        afterImages: stg.afterImages?.length ? stg.afterImages : [getStageMockImage(stg, 'after')],
        publishedPresentation: true
      });
    });
    alert(isEn
      ? `🎉 The complete project presentation has been formulated and sent to the client's wall successfully!`
      : `🎉 تم صياغة ونشر العرض التقديمي الشامل لكافة مراحل المشروع ككل وإرساله إلى لوحة العميل أحمد بنجاح!`);
  };

  const handleGeneratePDFReport = (targetStage: ProjectStage) => {
    const bImg = beforeImage || targetStage.beforeImages?.[0] || getStageMockImage(targetStage, 'before');
    const aImg = afterImage || targetStage.afterImages?.[0] || getStageMockImage(targetStage, 'after');
    const stageReport = reportText || targetStage.reportText || (isEn ? 'Inspection completed successfully.' : 'تم تسليم البند تحت إشراف هندسي ومطابق للمواصفات الفنية تماماً.');
    const stageRejection = targetStage.rejectedNotes || rejectionReason || '';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(isEn ? 'Popup blocked! Please allow popups.' : 'تم حظر النافذة المنبثقة! يرجى السماح.');
      return;
    }

    const docTitle = isEn ? `Shattabha QC Report - ${targetStage.name}` : `تقرير جودة شطبها - ${targetStage.name}`;
    const direction = isEn ? 'ltr' : 'rtl';
    const alignSelf = isEn ? 'left' : 'right';
    const statusLabel = isEn ? 'APPROVED QUALITY ASSURED' : 'حالة الاعتماد: معتمد ومطابق ✓';
    const mainTitle = isEn ? 'Official Technical Handover Certificate' : 'سند الاستلام والاعتماد الهندسي الميداني';
    const subTitle = isEn ? 'Detailed Before/After Inspection Report & Quality Index' : 'تقرير الفحص الإنشائي وتحولات بنود التشطيب والأرضيات';
    
    const locLabel = isEn ? 'Project Location / Compound:' : 'اسم وموقع المشروع / الوحدة:';
    const locVal = `${currentProject?.unitType || 'شقة سكنية'} - ${currentProject?.city || 'التجمع الخامس'}، ${currentProject?.governorate || 'القاهرة'}`;
    const catLabel = isEn ? 'Stage Category:' : 'بند وباب التوثيق:';
    const catVal = targetStage.name;
    const engLabel = isEn ? 'Supervisor & QC Engineer:' : 'المهندس المشرف معتمد من شطبها:';
    const engVal = 'م. كريم عبد العزيز (عضو نقابة المهندسين)';
    const dateLabel = isEn ? 'Timestamp / Date Of Certificate:' : 'تاريخ التسجيل والتوثيق والختم:';
    const dateVal = `${new Date().toISOString().substring(0, 10)} - ${new Date().toLocaleTimeString()}`;

    const beforeHeader = isEn ? 'BEFORE - Rough Draft/Installation' : 'قبل - حالة الهيكل والخامات الأساسية';
    const afterHeader = isEn ? 'AFTER - Handover Approved' : 'بعد - استلام جودة التشطيب واللمسة الفاخرة';

    const reportTitle = isEn ? 'Approved Technical Inspection Notes' : 'نص تقرير الفحص الفني والمطابقة الهندسية للبند:';
    const rejectionTitle = isEn ? 'Resolved Core Issues & Rejection Notes' : 'الملاحظات الفنية والعيوب المعالجة:';

    const rejectionHtml = stageRejection ? `
      <div class="rejection-section">
        <h3 class="section-title">⚠️ ${rejectionTitle}</h3>
        <p class="section-text">${stageRejection}</p>
      </div>
    ` : '';

    const saveLabel = isEn ? '🖨️ Save as PDF / Print Report' : '🖨️ طباعة أو حفظ التقرير كملف PDF';

    printWindow.document.write(`
      <html>
        <head>
          <title>${docTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&family=Inter:wght@400;700;800&display=swap');
            body {
              font-family: 'Cairo', 'Inter', sans-serif;
              direction: ${direction};
              background-color: #ffffff;
              color: #1e293b;
              margin: 0;
              padding: 40px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px double #2b4d89;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-area {
              text-align: ${alignSelf};
            }
            .logo {
              font-size: 26px;
              font-weight: 800;
              color: #2b4d89;
              letter-spacing: -0.5px;
            }
            .subtitle {
              font-size: 10px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .badge {
              background-color: #f1f5f9;
              border: 1px solid #e2e8f0;
              padding: 6px 14px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 700;
              color: #2b4d89;
            }
            .title {
              text-align: center;
              margin-bottom: 30px;
            }
            .title h1 {
              font-size: 22px;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 8px 0;
            }
            .title p {
              font-size: 12px;
              color: #64748b;
              margin: 0;
            }
            .metadata-grid {
              display: grid;
              grid-template-cols: repeat(2, 1fr);
              gap: 15px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 20px;
              margin-bottom: 35px;
            }
            .metadata-item {
              font-size: 12px;
            }
            .metadata-label {
              font-size: 10px;
              color: #64748b;
              font-weight: bold;
              display: block;
              margin-bottom: 4px;
            }
            .metadata-value {
              font-weight: 700;
              color: #0f172a;
            }
            .photos-container {
              display: grid;
              grid-template-cols: repeat(2, 1fr);
              gap: 25px;
              margin-bottom: 35px;
            }
            .photo-box {
              border: 1.5px solid #e2e8f0;
              border-radius: 16px;
              overflow: hidden;
              background-color: #fafafa;
            }
            .photo-header {
              padding: 10px 15px;
              font-weight: 800;
              font-size: 12px;
              color: white;
            }
            .photo-header.before {
              background-color: #e11d48;
            }
            .photo-header.after {
              background-color: #059669;
            }
            .photo-img-wrap {
              aspect-ratio: 4/3;
              overflow: hidden;
            }
            .photo-img-wrap img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .photo-caption {
              padding: 12px;
              font-size: 11px;
              color: #475569;
              background-color: #f8fafc;
              border-top: 1px solid #e2e8f0;
              min-height: 44px;
            }
            .report-section {
              background-color: #f0fdf4;
              border: 1.5px solid #bbf7d0;
              border-radius: 16px;
              padding: 24px;
              margin-bottom: 35px;
            }
            .rejection-section {
              background-color: #fef2f2;
              border: 1.5px solid #fecaca;
              border-radius: 16px;
              padding: 20px;
              margin-bottom: 35px;
            }
            .section-title {
              font-size: 13px;
              font-weight: 800;
              color: #0d1e3d;
              margin: 0 0 10px 0;
            }
            .section-text {
              font-size: 12px;
              line-height: 1.7;
              color: #334155;
              white-space: pre-wrap;
              margin: 0;
            }
            .footer-notes {
              margin-top: 50px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #94a3b8;
            }
            .seal-stamp {
              width: 80px;
              height: 80px;
              border: 3px double #059669;
              border-radius: 50%;
              color: #059669;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: 8px;
              transform: rotate(-10deg);
              margin-top: -20px;
            }
            .seal-stamp div {
              line-height: 1.2;
              text-align: center;
            }
            .no-print-btn {
              position: fixed;
              bottom: 30px;
              left: 50%;
              transform: translateX(-50%);
              background-color: #2b4d89;
              color: white;
              border: none;
              padding: 12px 30px;
              font-size: 13px;
              font-weight: 800;
              border-radius: 12px;
              cursor: pointer;
              box-shadow: 0 4px 15px rgba(0,0,0,0.15);
              transition: all 0.2s ease;
            }
            .no-print-btn:hover {
              background-color: #1e355c;
              box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            }
            @media print {
              .no-print-btn {
                display: none;
              }
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-area">
              <div class="logo">SHATTABHA DESIGN CO.</div>
              <div class="subtitle">Platform Quality Certification Deck System</div>
            </div>
            <div class="badge">
              ${statusLabel}
            </div>
          </div>

          <div class="title">
            <h1>${mainTitle}</h1>
            <p>${subTitle}</p>
          </div>

          <div class="metadata-grid">
            <div class="metadata-item">
              <span class="metadata-label">${locLabel}</span>
              <span class="metadata-value">${locVal}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">${catLabel}</span>
              <span class="metadata-value">${catVal}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">${engLabel}</span>
              <span class="metadata-value">${engVal}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">${dateLabel}</span>
              <span class="metadata-value">${dateVal}</span>
            </div>
          </div>

          <div class="photos-container">
            <div class="photo-box">
              <div class="photo-header before">
                🛑 ${beforeHeader}
              </div>
              <div class="photo-img-wrap">
                <img src="${bImg}" />
              </div>
              <div class="photo-caption">
                ${isEn ? 'Inspection pre-conditions view' : 'حالة المعاينة والتوثيق الأولي لبدء الأعمال ورصد العيوب ومصادر الرطوبة.'}
              </div>
            </div>

            <div class="photo-box">
              <div class="photo-header after">
                ✅ ${afterHeader}
              </div>
              <div class="photo-img-wrap">
                <img src="${aImg}" />
              </div>
              <div class="photo-caption">
                ${isEn ? 'Validated post-execution finish view' : 'حالة البند بعد التسوية والتشطيب ومطابقة الكود الهندسي القياسي.'}
              </div>
            </div>
          </div>

          <div class="report-section">
            <h3 class="section-title">
              📝 ${reportTitle}
            </h3>
            <p class="section-text">${stageReport}</p>
          </div>

          ${rejectionHtml}

          <div class="footer-notes">
            <div>
              <p>📍 GPS Coordinates: ${currentProject?.mapCoordinates || '30.013054, 31.429402'}</p>
              <p>Shattabha Site Tracker ID: SHB-INSP-W10</p>
            </div>
            
            <div class="seal-stamp">
              <div>SHATTABHA</div>
              <div style="font-size: 7px; margin: 2px 0;">APPROVED</div>
              <div>شطبها للتشطيب</div>
            </div>
          </div>

          <button class="no-print-btn" onclick="window.print()">
            ${saveLabel}
          </button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleGenerateAllPDFReports = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(isEn ? 'Popup blocked! Please allow popups.' : 'تم حظر النافذة المنبثقة! يرجى السماح.');
      return;
    }

    const docTitle = isEn ? 'Shattabha Full Project Portfolio' : 'الملف الكامل لمشروع شطبها';
    const direction = isEn ? 'ltr' : 'rtl';
    const alignSelf = isEn ? 'left' : 'right';
    const mainTitle = isEn ? 'Official Complete Handoff Dossier & Portfolio' : 'ملف الاستلام النهائي وتحولات الفحص الشامل';
    const subTitle = isEn ? 'Consolidated Phase-by-Phase Transformations and Engineering Audit PDF' : 'دفتر تتبع الجودة لمطابقة بنود المعاينة الشاملة';
    const dossierBadge = isEn ? 'COMPLETE PROJECT APPROVED' : 'ملف معتمد وشامل لمراحل المشروع ككل ✓';
    
    const clientNameLabel = isEn ? 'Client Name & Unit Details:' : 'اسم العميل وبيانات العقار المعني:';
    const clientNameVal = `أحمد محمد - التجمع الخامس (مساحة: ${currentProject?.area || '120'} م²)`;
    const outcomeLabel = isEn ? 'Audit Outcome Index:' : 'مؤشر المطابقة الفنية والجودة:';
    const outcomeVal = '100% EXCELLENCE INDEX ✓';
    const leadLabel = isEn ? 'Lead Inspector Signoff:' : 'مهندس الإشراف الفني الرئيسي:';
    const leadVal = 'م. كريم عبد العزيز (شطبها هاندأوف تيم)';
    const timestampLabel = isEn ? 'Consolidated Dossier Timestamp:' : 'تاريخ إقفال وختم الدفتر الفني:';
    const timestampVal = `${new Date().toISOString().substring(0, 10)} - ${new Date().toLocaleTimeString()}`;

    const listHeading = isEn ? 'Detailed Phase Transform Showcase' : 'تفاصيل استلام ومعاينة بنود التشطيبات شريحة بشريحة:';
    const printMsg = isEn ? '🖨️ Save Full Dossier as PDF / Print' : '🖨️ طباعة أو حفظ الملف الشامل كـ PDF';

    const stagesHtml = projectStages.map((stg) => {
      const bImg = stg.beforeImages?.[0] || getStageMockImage(stg, 'before');
      const aImg = stg.afterImages?.[0] || getStageMockImage(stg, 'after');
      const stageReport = stg.reportText || (isEn ? 'Inspection completed successfully matching technical criteria.' : 'تم فحص جودة تنفيذ بند التشطيب ميدانياً واستلم هندسياً لمطابقته للمواصفات والأبعاد والطلبات.');
      return `
        <div class="page-break" style="page-break-after: always; border-bottom: 2px dashed #cbd5e1; margin-bottom: 40px; padding-bottom: 40px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">
            <span style="font-weight: 800; color: #2b4d89; font-size: 14px;">${stg.name} - ${isEn ? 'Stage Transformation Report' : 'تقرير تحول البند وجاهزيته'}</span>
            <span style="font-size: 11px; color: #64748b;">${isEn ? 'Shattabha Inspection Suite' : 'إشراف هندسي ميداني موحد'}</span>
          </div>
          
          <div style="display: grid; grid-template-cols: repeat(2, 1fr); gap: 20px; margin-bottom: 15px;">
            <div class="photo-box">
              <div class="photo-header before" style="background-color: #e11d48; padding: 8px 12px; font-weight:800; color: white; border-radius: 12px 12px 0 0;">🛑 ${isEn ? 'BEFORE' : 'قبل بدء التنفيذ'}</div>
              <div style="aspect-ratio: 4/3; overflow: hidden;"><img style="width:100%; height:100%; object-fit:cover;" src="${bImg}" /></div>
              <div style="padding: 10px; font-size: 10px; color: #475569; background-color: #f8fafc; border-top:1px solid #e2e8f0;">${isEn ? 'Rough/Preliminary Slab draft state' : 'معاينة الموقع وأخذ اللقطات الميدانية قبل التأسيس.'}</div>
            </div>
            <div class="photo-box">
              <div class="photo-header after" style="background-color: #059669; padding: 8px 12px; font-weight:800; color: white; border-radius: 12px 12px 0 0;">✅ ${isEn ? 'AFTER' : 'بعد التشطيب النهائي'}</div>
              <div style="aspect-ratio: 4/3; overflow: hidden;"><img style="width:100%; height:100%; object-fit:cover;" src="${aImg}" /></div>
              <div style="padding: 10px; font-size: 10px; color: #475569; background-color: #f8fafc; border-top:1px solid #e2e8f0;">${isEn ? 'Shiny compliant handoff finish state' : 'تسليم هندسي فاخر خالي من العيوب وسد الثغرات.'}</div>
            </div>
          </div>

          <div class="report-section" style="margin-top: 15px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 15px;">
            <h4 style="margin: 0 0 8px 0; color: #0d1e3d; font-size: 12px;">📊 التقرير الهندسي والمواصفات:</h4>
            <p class="section-text" style="font-size: 11.5px; line-height: 1.6; color: #334155; white-space: pre-wrap; margin: 0;">${stageReport}</p>
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${docTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&family=Inter:wght@400;750;800&display=swap');
            body {
              font-family: 'Cairo', 'Inter', sans-serif;
              direction: ${direction};
              background-color: #ffffff;
              color: #1e293b;
              margin: 0;
              padding: 40px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px double #2b4d89;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-area {
              text-align: ${alignSelf};
            }
            .logo {
              font-size: 26px;
              font-weight: 800;
              color: #2b4d89;
              letter-spacing: -0.5px;
            }
            .subtitle {
              font-size: 10px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .badge {
              background-color: #f1f5f9;
              border: 1px solid #e2e8f0;
              padding: 6px 14px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 700;
              color: #2b4d89;
            }
            .title {
              text-align: center;
              margin-bottom: 30px;
            }
            .title h1 {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 8px 0;
            }
            .title p {
              font-size: 12px;
              color: #64748b;
              margin: 0;
            }
            .metadata-grid {
              display: grid;
              grid-template-cols: repeat(2, 1fr);
              gap: 15px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 20px;
              margin-bottom: 35px;
            }
            .metadata-item {
              font-size: 12px;
            }
            .metadata-label {
              font-size: 10px;
              color: #64748b;
              font-weight: bold;
              display: block;
              margin-bottom: 4px;
            }
            .metadata-value {
              font-weight: 700;
              color: #0f172a;
            }
            .photos-container {
              display: grid;
              grid-template-cols: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 15px;
            }
            .photo-box {
              border: 1.5px solid #e2e8f0;
              border-radius: 12px;
              overflow: hidden;
              background-color: #fafafa;
            }
            .photo-header {
              padding: 8px 12px;
              font-weight: 800;
              font-size: 11px;
              color: white;
            }
            .photo-header.before {
              background-color: #e11d48;
            }
            .photo-header.after {
              background-color: #059669;
            }
            .photo-img-wrap {
              aspect-ratio: 4/3;
              overflow: hidden;
            }
            .photo-img-wrap img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .photo-caption {
              padding: 10px;
              font-size: 10px;
              color: #475569;
              background-color: #f8fafc;
              border-top: 1px solid #e2e8f0;
            }
            .report-section {
              background-color: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 12px;
              padding: 15px;
            }
            .section-text {
              font-size: 11.5px;
              line-height: 1.6;
              color: #334155;
              white-space: pre-wrap;
              margin: 0;
            }
            .footer-notes {
              margin-top: 50px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #94a3b8;
            }
            .seal-stamp {
              width: 80px;
              height: 80px;
              border: 3px double #059669;
              border-radius: 50%;
              color: #059669;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: 8px;
              transform: rotate(-10deg);
              margin-top: -20px;
            }
            .seal-stamp div {
              line-height: 1.2;
              text-align: center;
            }
            .no-print-btn {
              position: fixed;
              bottom: 30px;
              left: 50%;
              transform: translateX(-50%);
              background-color: #2b4d89;
              color: white;
              border: none;
              padding: 12px 30px;
              font-size: 13px;
              font-weight: 800;
              border-radius: 12px;
              cursor: pointer;
              box-shadow: 0 4px 15px rgba(0,0,0,0.15);
              transition: all 0.2s ease;
            }
            .no-print-btn:hover {
              background-color: #1e355c;
            }
            @media print {
              .no-print-btn {
                display: none;
              }
              body {
                padding: 0;
              }
              .page-break {
                page-break-after: always !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-area">
              <div class="logo">SHATTABHA DESIGN CO.</div>
              <div class="subtitle">Independent Supervision Dossier File</div>
            </div>
            <div class="badge">
              ${dossierBadge}
            </div>
          </div>

          <div class="title">
            <h1>${mainTitle}</h1>
            <p>${subTitle}</p>
          </div>

          <div class="metadata-grid">
            <div class="metadata-item">
              <span class="metadata-label">${clientNameLabel}</span>
              <span class="metadata-value">${clientNameVal}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">${outcomeLabel}</span>
              <span class="metadata-value" style="color: #059669; font-weight: 800;">${outcomeVal}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">${leadLabel}</span>
              <span class="metadata-value">${leadVal}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">${timestampLabel}</span>
              <span class="metadata-value">${timestampVal}</span>
            </div>
          </div>

          <div style="margin-top: 40px;">
            <h2 style="font-size: 15px; border-bottom: 2px solid #2b4d89; padding-bottom: 8px; margin-bottom: 25px; color: #2b4d89;">
              ${listHeading}
            </h2>
            ${stagesHtml}
          </div>

          <div class="footer-notes">
            <div>
              <p>📍 Comprehensive Geo-Tag: ${currentProject?.mapCoordinates || '30.013054, 31.429402'}</p>
              <p>Shattabha Certified Workspace Suite Version 4.2</p>
            </div>
            
            <div class="seal-stamp">
              <div>SHATTABHA</div>
              <div style="font-size: 7px; margin: 2px 0;">APPROVED</div>
              <div>شطبها للتشطيب</div>
            </div>
          </div>

          <button class="no-print-btn" onclick="window.print()">
            ${printMsg}
          </button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const renderRequestSpecs = (req: ClientRequest) => {
    return (
      <div className="bg-[#F8FAF9] p-4 rounded-3xl border border-gray-150 space-y-3.5 text-[11px] text-gray-750 text-right shadow-xs">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2 justify-between">
          <h5 className="font-extrabold text-xs text-[#2B4D89] flex items-center gap-1.5">
            📋 {isEn ? 'Client Request Technical Parameters & Specifications:' : 'المواصفات الفنية والهندسية الكاملة لطلب العميل:'}
          </h5>
          <span className="text-[10px] bg-[#2B4D89]/10 text-[#2B4D89] font-bold px-2 py-0.5 rounded-full font-sans">
            {isEn ? 'Verified Specs' : 'مراجعة هندسية'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 justify-start text-[10px] font-black text-[#2B4D89] mb-1.5 font-sans">
          <span className="bg-[#2B4D89]/10 px-2.5 py-1 rounded-lg">📦 {isEn ? `${req.unitType} Spec` : `مواصفات الـ ${req.unitType}`}</span>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-250/50 px-2.5 py-1 rounded-lg">📏 {req.area} {isEn ? 'm²' : 'م²'}</span>
          {req.bedroomsCount !== undefined && (
            <span className="bg-amber-50 text-amber-800 border border-amber-250/50 px-2.5 py-1 rounded-lg">🚪 {isEn ? `${req.bedroomsCount} Bed` : `${req.bedroomsCount} غرف`}</span>
          )}
          {req.bathroomsCount !== undefined && (
            <span className="bg-sky-50 text-sky-800 border border-sky-250/50 px-2.5 py-1 rounded-lg">🛁 {isEn ? `${req.bathroomsCount} Bath` : `${req.bathroomsCount} حمام`}</span>
          )}
          {req.kitchensCount !== undefined && (
            <span className="bg-teal-50 text-teal-800 border border-teal-250/50 px-2.5 py-1 rounded-lg">🍳 {isEn ? `${req.kitchensCount} Kitchen` : `${req.kitchensCount} مطبخ`}</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] border-t border-gray-100 pt-3 font-medium text-right font-sans">
          <div>
            <span className="text-gray-400 block font-normal text-[10px]">{isEn ? 'Finishing Level Required:' : 'مستوى التشطيب المطلوب:'}</span>
            <span className="font-extrabold text-[#2B4D89] text-xs">{req.finishingLevel}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-normal text-[10px]">{isEn ? 'Estimated Project Budget:' : 'الميزانية التقديرية المحددة:'}</span>
            <span className="font-extrabold text-emerald-800 font-mono text-xs">{req.budget.toLocaleString()} ج.م</span>
          </div>
          <div>
            <span className="text-gray-400 block font-normal text-[10px]">{isEn ? 'Detailed Location & Address:' : 'العنوان التفصيلي وموقع الوحدة:'}</span>
            <span className="font-bold text-gray-800 block truncate" title={req.detailedLocationText || req.city}>{req.detailedLocationText || req.city || (isEn ? 'Not defined' : 'غير محدد')}</span>
            <span className="font-mono text-[9px] text-[#2B4D89]/80 block">{req.mapCoordinates || '30.01284, 31.44021'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-normal text-[10px]">{isEn ? 'Technical Inspector Supervision:' : 'توفير مشرف هندسي مستقل:'}</span>
            <span className="font-bold block text-gray-800">{req.requireInspector !== false ? (isEn ? '🛡️ Commissioned (100 EGP/m² Supervision Fee)' : '🛡️ نعم (موفد من نظام شطبها مع رسوم إشراف 100 ج.م/م²)') : (isEn ? '❌ Excluded' : '❌ لا')}</span>
          </div>
        </div>

        {req.notes && (
          <div className="bg-white/95 p-3 rounded-2xl border border-gray-150 mt-1 shadow-2xs">
            <span className="text-[#2B4D89] block text-[9.5px] font-extrabold mb-1">{isEn ? 'Client Special Instructions:' : 'توجيهات وملاحظات العميل الخاصة بالخامات والمظهر:'}</span>
            <p className="text-gray-650 leading-relaxed font-semibold italic">{req.notes}</p>
          </div>
        )}

        {req.blueprints && req.blueprints.length > 0 && (
          <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-100 flex items-center gap-1.5 font-bold">
            <span>📎 {isEn ? 'Attached Blueprint files:' : 'مخططات كروكي مرفقة وثنائية الأبعاد بالنظام:'}</span>
            <span className="bg-gray-150 text-gray-700 px-2 py-0.5 rounded font-mono text-[9px] block shrink-0">{req.blueprints.join(', ')}</span>
          </div>
        )}
      </div>
    );
  };
  
  // Simulated Camera Capture State
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  // Preset mock site images for simulator camera
  const siteMockImages: Record<string, { title: string; url: string }> = {
    plumbing: {
      title: isEn ? 'Inspecting insulated plumbing (certified materials)' : 'معاينة سباكة معزولة (خامات معتمدة)',
      url: 'https://images.unsplash.com/photo-1542013936693-8848e574047a?auto=format&fit=crop&w=400&q=80'
    },
    electrical: {
      title: isEn ? 'Inspecting Elsewedy wiring with original conduits' : 'تمديدات أسلاك سويدي مع خراطيم أصلية',
      url: 'https://images.unsplash.com/photo-1558224494-ef8b2175a501?auto=format&fit=crop&w=400&q=80'
    },
    plastering: {
      title: isEn ? 'Plastering and wall leveling review' : 'محارة حوائط ومراجعة ميزان قامات',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
    },
    finishing: {
      title: isEn ? 'Inspecting base paint coats and putty quality' : 'طبقة الدهان الأساسية وجودة المعجون',
      url: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?auto=format&fit=crop&w=400&q=80'
    }
  };

  // Selected stage for inspection action
  const projectStages = currentProject ? stages.filter(s => s.requestId === currentProject.id) : [];
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const activeStage = projectStages.find(s => s.id === selectedStageId) || projectStages.find(s => s.inspectionRequested) || projectStages[0];

  React.useEffect(() => {
    if (activeStage) {
      setSelectedStageId(activeStage.id);
      setReportText(activeStage.reportText || '');
      setBeforeImage(activeStage.beforeImages?.[0] || '');
      setAfterImage(activeStage.afterImages?.[0] || '');
      setRejectionReason(activeStage.rejectedNotes || '');
    }
  }, [currentProject, selectedStageId]);

  // Handle Capture Simulation
  const triggerCameraCapture = () => {
    setCameraActive(true);
    setTimeout(() => {
      let category = 'plumbing';
      if (activeStage) {
        const name = activeStage.name.toLowerCase();
        if (name.includes('سباكة') || name.includes('صرف') || name.includes('plumbing')) {
          category = 'plumbing';
        } else if (name.includes('كهرباء') || name.includes('إنارة') || name.includes('إضاء') || name.includes('electrical')) {
          category = 'electrical';
        } else if (name.includes('محارة') || name.includes('أسقف') || name.includes('محار') || name.includes('plastering') || name.includes('masonry')) {
          category = 'plastering';
        } else if (name.includes('دهانات') || name.includes('تشطيب') || name.includes('دهان') || name.includes('finishing') || name.includes('paint')) {
          category = 'finishing';
        }
      }
      const selectedMock = siteMockImages[category] || siteMockImages.plumbing;
      setCapturedImage(selectedMock.url);
      setCameraActive(false);
    }, 900); // simulated camera focus time
  };

  // Sort by geographic proximity switch
  const [sortByProximity, setSortByProximity] = useState<boolean>(true);

  // Submit Technical Review Decision
  const handleReviewDecision = (status: 'APPROVED' | 'REJECTED') => {
    if (!activeStage) return;

    const updates: Partial<ProjectStage> = {
      status,
      reportText: reportText || (isEn 
        ? `Field audit of this milestone has been completed responsibly under engineering supervision by Inspector Eng. ${activeInspector.name}. Standard codes and approved brands are verified.`
        : `تم إجراء الفحص الميداني لهذه المرحلة بوعي ومسؤولية هندسية من المهندس ${activeInspector.name}. تم التحقق من القياسات والخامات المعتمدة وجاري المتابعة.`),
      reportDate: new Date().toISOString().split('T')[0],
      images: afterImage ? [afterImage] : (capturedImage ? [capturedImage] : activeStage.images),
      beforeImages: beforeImage ? [beforeImage] : (activeStage.beforeImages?.length ? activeStage.beforeImages : [getStageMockImage(activeStage, 'before')]),
      afterImages: afterImage ? [afterImage] : (activeStage.afterImages?.length ? activeStage.afterImages : [getStageMockImage(activeStage, 'after')])
    };

    if (status === 'REJECTED') {
      updates.rejectedNotes = rejectionReason || (isEn 
        ? 'Please review wiring layout and widen AC sleeve paths, then file a re-handover request.' 
        : 'يرجى مراجعة تمديدات الكابلات وتوسيع مسارات التكييف وإعادة تقديم طلب الاستلام.');
      updates.inspectionRequested = false;
    } else {
      updates.inspectionRequested = false;
      updates.rejectedNotes = '';
      updates.progress = 100;
      updates.complaintText = ''; // Clear customer complaints upon engineering approval
    }

    onUpdateStage(activeStage.id, updates);
    // Clear forms
    setReportText('');
    setRejectionReason('');
    setCapturedImage('');
  };

  // Get distance score for geographic sorting
  const getProximityDistance = (city: string): number => {
    if (city.includes('التجمع') || city.includes('الجديدة')) return 3.2;
    if (city.includes('مدينة نصر')) return 12.5;
    if (city.includes('الشيخ زايد') || city.includes('أكتوبر')) return 34.8;
    return 15.2;
  };

  // Get distance mock for sorted proximity list
  const getProximityText = (city: string) => {
    if (isEn) {
      if (city.includes('التجمع') || city.includes('الجديدة')) return '3.2 km away (Closest to your location 🚗)';
      if (city.includes('مدينة نصر')) return '12.5 km away (Medium range)';
      if (city.includes('الشيخ زايد') || city.includes('أكتوبر')) return '34.8 km away (Requires prior coordinate planning)';
      return '15.2 km away';
    }
    if (city.includes('التجمع') || city.includes('الجديدة')) return 'على بعد ٣.٢ كم (الأقرب لموقعك الحالي 🚗)';
    if (city.includes('مدينة نصر')) return 'على بعد ١٢.٥ كم (مسافة متوسطة)';
    if (city.includes('الشيخ زايد') || city.includes('أكتوبر')) return 'على بعد ٣٤.٨ كم (يحتاج مسبق تنسيق)';
    return 'على بعد ١٥.٢ كم';
  };

  // Urgent alerts calculation - combines contractor inspection requests AND client complaints
  const urgentAlerts = stages.filter(s => {
    const parentReq = requests.find(r => r.id === s.requestId);
    return parentReq?.assignedInspectorId === activeInspectorId && (s.inspectionRequested || !!s.complaintText);
  });

  return (
    <div className={`${isEn ? 'dir-ltr text-left' : 'dir-rtl text-right'} font-sans min-h-screen bg-[#F0F3F7] pb-24`}>
      {/* MOBILE & DESKTOP TOP HEADER BAR */}
      <div className="bg-[#232F3F] text-white px-4 py-3 flex items-center justify-between border-b border-[#D8B448] shadow-sm z-30 w-full shrink-0 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <div className="text-right">
            <h1 className="text-sm font-black text-white">
              {isEn ? "Shatibha Engineering Inspector Portal" : "لوحة تحكم مهندس الفحص الفني"}
            </h1>
            <p className="text-[9px] text-gray-400">
              {isEn ? "Shatibha Engineering Audits" : "الرقابة والمطابقة الهندسية وضمان العقد"}
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
      
      {/* 1. HEADER SECTION & ENGINEER SELECTOR */}
      <div className="bg-white border-b border-gray-150 px-4 sm:px-6 py-5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className={isEn ? 'text-left' : 'text-right'}>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2B4D89] animate-ping"></span>
              <span className="text-xs font-black text-[#2B4D89] bg-[#F0F3F7] px-2.5 py-1 rounded-full border border-[#2B4D89]/25/50">
                {isEn ? "Shatibha Independent Site Engineering Inspector Board" : 'لوحة فنية مخصصة للفريق الهندسي الميداني لمعاينة "شطبها" (Site Inspector)'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#232F3F] tracking-tight mt-1.5 flex items-center gap-1.5">
              <span>🛡️</span> {isEn ? `Independent Supervisor Account: ${activeInspector.name}` : `حساب المشرف الفني المستقل: ${activeInspector.name}`}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {isEn ? "You are an independent consulting engineer representing Shatibha, ensuring quality, standard adherence, and milestone escrow release authorization." : 'أنت مهندس استشاري محايد ومسؤول بجهة "شطبها" المانحة للضمان وضبط معايير الجودة والاستلام مرحلة بمرحلة.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            {/* SIMULATION TRICK - SWITCH BETWEEN INSPECTORS */}
            <div className="bg-gray-50 border border-gray-200/80 p-3 rounded-2.5xl space-y-1.5 flex-1 sm:flex-initial">
              <label className={`block text-[10px] text-gray-400 font-extrabold ${isEn ? 'text-left' : 'text-right'}`}>
                {isEn ? '👨‍🔬 Tech Simulator: Choose inspector profile:' : '👨‍🔬 محاكي فني: اختر مهندس لمعاينة حسابه وموقعه:'}
              </label>
              <div className="flex gap-1.5">
                {inspectors.map(ins => (
                  <button
                    key={ins.id}
                    onClick={() => {
                      setActiveInspectorId(ins.id);
                      const newlyAssigned = requests.filter(r => r.assignedInspectorId === ins.id);
                      if (newlyAssigned.length > 0) {
                        setSelectedProjectId(newlyAssigned[0].id);
                      } else {
                        setSelectedProjectId('');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeInspectorId === ins.id
                        ? 'bg-[#2B4D89] text-white shadow-sm'
                        : 'bg-white hover:bg-gray-150 text-gray-600 border'
                    }`}
                  >
                    {ins.name.split(' ')[1]} ({requests.filter(r => r.assignedInspectorId === ins.id).length} مشاريع)
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (onSignOut) {
                  onSignOut();
                }
              }}
              className="bg-red-500/10 hover:bg-red-500/18 text-[#E05252] border border-red-500/25 hover:border-red-500/40 px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
            >
              <span>🚪</span>
              <span>{isEn ? 'Sign Out Securely' : 'تسجيل الخروج (Sign out)'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 animate-fade-in">

        {/* Waiting for Technical Inspection Warning Banner */}
        {requests.some(r => r.status === 'WAITING_FOR_INSPECTION') && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/70 rounded-3xl p-5 flex items-start gap-4 shadow-xs text-right animate-pulse">
            <span className="text-2xl mt-0.5 shrink-0 select-none">⏳</span>
            <div className="flex-1">
              <h5 className="font-extrabold text-xs text-amber-850">
                {isEn ? 'Finishing Projects Awaiting Admin Approval & Technical Auditing' : 'تنبيه: مشاريع في انتظار المعاينة الفنية والاعتماد من الإدارة 🛠️'}
              </h5>
              <p className="text-[10px] text-amber-750/90 mt-1 leading-relaxed font-bold">
                {isEn 
                  ? 'There are property finishing projects awaiting critical on-site inspection and contract approval. Please review documentation and perform technical matching audits.'
                  : 'تنبيه للمشرف الاستشاري: يوجد طلبات معلقة تم اختيارها من العملاء وهي حالياً بانتظار إجراء المعاينة الفنية الميدانية من طرفكم ورفع تقرير الجدوى لاعتماد الإدارة وإطلاق المشروع.'}
              </p>
            </div>
          </div>
        )}

        {/* 2. PROTECTED VALUES BANNER (ROLE DEFINITION) */}
        <div className="bg-[#1C3E35] text-white rounded-3xl p-5 border border-teal-800/10 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔑</span>
            <div>
              <h4 className="font-extrabold text-sm text-amber-300">
                {isEn ? 'Shatibha Charter for Independent Engineering Site Safety & Quality' : 'ميثاق شطبها للأمان والجودة الهندسية المستقلة'}
              </h4>
              <p className="text-xs text-teal-100 mt-1 max-w-3xl leading-relaxed">
                {isEn 
                  ? 'As an independent third-party inspector, you represent Shatibha quality control rather than the contractor or client. Milestone payments are tied to your field approvals! Approval releases escrow directly to the contractor, and rejection initiates rectification protocols.' 
                  : 'إنك كطرف ثالث مستقل لست مندوباً للشركة المنفذة ولا وكيلاً رخيصاً للعميل، بل أنت حكم هندسي نزيه. الدفعات المالية مرتبطة كلياً باعتمادك الميداني! استلامك للمرحلة يرفع القيود عن دفعة التمويل، ورفضك يجبر المقاول على التعديل الفوري بلا مماطلة.'}
              </p>
            </div>
          </div>
          
          <div className="shrink-0 bg-teal-900/60 border border-teal-500/30 px-3.5 py-2 rounded-xl text-center">
            <span className="block text-[10px] text-teal-100 font-bold">
              {isEn ? 'Supervised Zone' : 'النطاق الجغرافي المعني'}
            </span>
            <span className="text-xs font-black text-emerald-300 flex items-center justify-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {activeInspector.zone}
            </span>
          </div>
        </div>

        {/* 3. KPI CARDS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-2">
          {/* Box 1: المشروعات النشطة (Active Projects) */}
          <button
            id="kpi-active-projects"
            onClick={() => setTableFilter('ACTIVE')}
            className={`p-6 rounded-3xl border transition-all duration-300 text-right cursor-pointer flex items-center justify-between group ${
              tableFilter === 'ACTIVE'
                ? 'bg-[#102B20] border-[#102B20] text-white shadow-lg shadow-emerald-950/15 ring-2 ring-emerald-800'
                : 'bg-white border-gray-200 text-gray-800 hover:border-emerald-700/35 hover:bg-emerald-50/5'
            }`}
          >
            <div className="space-y-1">
              <span className={`text-xs font-bold ${tableFilter === 'ACTIVE' ? 'text-emerald-300' : 'text-gray-400 font-extrabold'}`}>
                {isEn ? 'ACTIVE PROJECTS' : 'المشروعات النشطة الميدانية'}
              </span>
              <h3 className="text-3xl font-black tracking-tight mt-1 flex items-baseline gap-1">
                {activeProjects.length}
                <span className={`text-xs font-bold ${tableFilter === 'ACTIVE' ? 'text-gray-300' : 'text-gray-400'}`}>
                  {isEn ? 'Projects' : 'مشروع نشط'}
                </span>
              </h3>
              <p className={`text-[10px] sm:text-xs mt-1 leading-normal ${tableFilter === 'ACTIVE' ? 'text-teal-100/95' : 'text-gray-500'}`}>
                {isEn 
                  ? 'Click to view projects under active execution assigned to you.' 
                  : 'اصغط للمشاهدة والتحكم في المشروعات المسندة إليك الجاري تنفيذها حالياً.'}
              </p>
            </div>
            
            <div className={`p-4 rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${
              tableFilter === 'ACTIVE' ? 'bg-white/10 text-emerald-300' : 'bg-emerald-50 text-emerald-800'
            }`}>
              <ClipboardList className="w-8 h-8" />
            </div>
          </button>

          {/* Box 2: مشروعات بانتظار الاستلام (Awaiting handover/inspection) */}
          <button
            id="kpi-awaiting-handover"
            onClick={() => setTableFilter('AWAITING_INSPECTION')}
            className={`p-6 rounded-3xl border transition-all duration-300 text-right cursor-pointer flex items-center justify-between group ${
              tableFilter === 'AWAITING_INSPECTION'
                ? 'bg-[#2B4D89] border-[#2B4D89] text-white shadow-lg shadow-blue-950/15 ring-2 ring-blue-800'
                : 'bg-white border-gray-200 text-gray-800 hover:border-[#2B4D89]/35 hover:bg-blue-50/5'
            }`}
          >
            <div className="space-y-1">
              <span className={`text-xs font-bold ${tableFilter === 'AWAITING_INSPECTION' ? 'text-amber-300' : 'text-gray-400 font-extrabold'}`}>
                {isEn ? 'AWAITING HANDOVER' : 'مشروعات بانتظار الاستلام والمعاينة'}
              </span>
              <h3 className="text-3xl font-black tracking-tight mt-1 flex items-baseline gap-1">
                {awaitingHandoverProjects.length}
                <span className={`text-xs font-bold ${tableFilter === 'AWAITING_INSPECTION' ? 'text-gray-300' : 'text-gray-400'}`}>
                  {isEn ? 'Requests' : 'معاينة معلقة'}
                </span>
              </h3>
              <p className={`text-[10px] sm:text-xs mt-1 leading-normal ${tableFilter === 'AWAITING_INSPECTION' ? 'text-blue-100/90' : 'text-gray-500'}`}>
                {isEn 
                  ? 'Bids completed by contractors requesting your official quality check.' 
                  : 'مراحل منتهية تستلزم حضورك للموقع ومطابقة الخامات لإطلاق دفعات المقاول المالية.'}
              </p>
            </div>

            <div className={`p-4 rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${
              tableFilter === 'AWAITING_INSPECTION' ? 'bg-white/10 text-amber-300' : 'bg-blue-50 text-blue-800'
            }`}>
              <ShieldAlert className="w-8 h-8" />
            </div>
          </button>

          {/* Box 3: طلبات المعاينة والعقود بانتظار الإجراء (New Inspections & Contracts) */}
          <button
            id="kpi-pending-contracts"
            onClick={() => setTableFilter('PENDING_CONTRACTS')}
            className={`p-6 rounded-3xl border transition-all duration-300 text-right cursor-pointer flex items-center justify-between group ${
              tableFilter === 'PENDING_CONTRACTS'
                ? 'bg-[#3B2C15] border-[#D8B448]/60 text-white shadow-lg shadow-amber-950/15 ring-2 ring-amber-500'
                : 'bg-white border-gray-200 text-gray-800 hover:border-amber-700/35 hover:bg-amber-50/5'
            }`}
          >
            <div className="space-y-1">
              <span className={`text-xs font-bold ${tableFilter === 'PENDING_CONTRACTS' ? 'text-amber-400' : 'text-gray-400 font-extrabold'}`}>
                {isEn ? 'PENDING SURVEYS & CONTRACTS' : 'طلبات عاجلة للمعاينة وتأكيد العقود'}
              </span>
              <h3 className="text-3xl font-black tracking-tight mt-1 flex items-baseline gap-1">
                {pendingContracts.length}
                <span className={`text-xs font-bold ${tableFilter === 'PENDING_CONTRACTS' ? 'text-amber-300' : 'text-gray-400'}`}>
                  {isEn ? 'Contracts' : 'معاينة جديدة'}
                </span>
              </h3>
              <p className={`text-[10px] sm:text-xs mt-1 leading-normal ${tableFilter === 'PENDING_CONTRACTS' ? 'text-amber-100/90' : 'text-gray-500'}`}>
                {isEn 
                  ? 'Verify site dimensions, schedule final signing, upload files & launch.' 
                  : 'عقود بانتظار إجراء المعاينة الفنية الميدانية، وتوفير تفاصيل العقد وبنود الدفعة.'}
              </p>
            </div>

            <div className={`p-4 rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${
              tableFilter === 'PENDING_CONTRACTS' ? 'bg-white/10 text-amber-400' : 'bg-amber-50 text-amber-850'
            }`}>
              <ClipboardList className="w-8 h-8" />
            </div>
          </button>
        </div>

        {/* PROJECTS TABLE CARD */}
        <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-4">
            <div className={`space-y-1 ${isEn ? 'text-left' : 'text-right'}`}>
              <h3 className={`font-extrabold text-base text-[#232F3F] flex items-center gap-1.5 font-sans ${isEn ? 'justify-start' : 'justify-start'}`}>
                <ClipboardList className="w-5 h-5 text-[#2B4D89]" />
                <span>
                  {tableFilter === 'ACTIVE' 
                    ? (isEn ? '📂 All Active Projects List' : '📂 جدول كل المشروعات النشطة المسندة') 
                    : (isEn ? '⏳ Handover Pending Inspections List' : '⏳ جدول المشروعات بانتظار معاينة الاستلام')}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                {isEn 
                  ? 'Click on any project row to load its interactive execution timeline, specifications, camera inspect, and technical forms.' 
                  : 'انقر فوق أي صف من الجدول لعرض تفاصيله الكاملة، جدول المراحل، الكاميرا الميدانية وتحديثات الفحص والضمان أدناه.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
              {/* Prioritization filter */}
              <div id="inspector-sort-filter" className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-2xl">
                <span className="text-[10px] font-black text-gray-500">
                  {isEn ? 'PRIORITIZE BY:' : 'ترتيب الزيارات الميدانية حسب:'}
                </span>
                <select
                  id="inspector-sort-select"
                  value={tableSortOption}
                  onChange={(e) => setTableSortOption(e.target.value as any)}
                  className="bg-transparent border-0 text-xs font-black text-[#2B4D89] focus:outline-hidden cursor-pointer"
                >
                  <option value="NONE">{isEn ? 'Default' : 'الافتراضي'}</option>
                  <option value="DELIVERY_DATE">{isEn ? '🕒 Closest Delivery' : '🕒 أقرب موعد تسليم'}</option>
                  <option value="EXECUTION_STATUS">{isEn ? '🚨 Execution Status (Urgent)' : '🚨 حالة التنفيذ والطلب العاجل'}</option>
                </select>
              </div>

              <div className="bg-[#F0F3F7] px-3 py-1.5 rounded-2xl flex items-center gap-1 border border-gray-100">
                <span className="text-[10px] font-black font-sans text-gray-650 uppercase">
                  {sortedProjectsForTable.length} {isEn ? 'Matches' : 'مطابقات'}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-150">
            <table className="w-full text-sm text-right text-gray-700 min-w-[750px] table-auto">
              <thead className="text-[11px] uppercase bg-gray-50 text-gray-400 border-b border-gray-150 font-black">
                <tr>
                  <th scope="col" className="px-4 py-3 text-right">{isEn ? 'Project ID' : 'رقم المشروع'}</th>
                  <th scope="col" className="px-4 py-3 text-right">{isEn ? 'Client Name' : 'اسم العميل'}</th>
                  <th scope="col" className="px-4 py-3 text-right">{isEn ? 'Phone Number' : 'رقم التليفون'}</th>
                  <th scope="col" className="px-4 py-3 text-right">{isEn ? 'Unit Type' : 'نوع الوحدة'}</th>
                  <th scope="col" className="px-4 py-3 text-right">{isEn ? 'Area' : 'المساحة'}</th>
                  <th scope="col" className="px-4 py-3 text-right">{isEn ? 'Location' : 'اللوكيشن'}</th>
                  <th scope="col" className="px-4 py-3 text-right">{isEn ? 'Progress' : 'نسبة الانجاز'}</th>
                  <th scope="col" className="px-4 py-3 text-right">{isEn ? 'Project Status' : 'حالة المشروع'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {sortedProjectsForTable.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-xs font-bold bg-[#F8FAF9]/50">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        <span>
                          {tableFilter === 'ACTIVE'
                            ? (isEn ? 'No active execution projects assigned to this inspector.' : 'لا توجد مشروعات نشطة مسندة للمشرف في هذا النطاق حالياً.')
                            : (isEn ? 'No projects awaiting handover / quality approval.' : 'لا توجد مشروعات بانتظار الاستلام ومطابقة الخامات حالياً.')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedProjectsForTable.map((proj) => {
                    const { progressPercent, statusText } = getProjectProgressAndStatus(proj.id);
                    const isSelected = selectedProjectId === proj.id;
                    const transUnit = isEn 
                      ? (proj.unitType === 'فيلا' ? 'Villa' : proj.unitType === 'مكتب' ? 'Office' : 'Apartment') 
                      : proj.unitType;

                    return (
                      <tr
                        key={proj.id}
                        id={`proj-row-${proj.id}`}
                        onClick={() => {
                          setSelectedProjectId(proj.id);
                          // Select the first active stage as default
                          const sgs = stages.filter(s => s.requestId === proj.id);
                          if (sgs.length > 0) {
                            const awSt = sgs.find(s => s.inspectionRequested);
                            const undSt = sgs.find(s => s.status === 'UNDER_WAY');
                            setSelectedStageId(awSt?.id || undSt?.id || sgs[0].id);
                          }
                        }}
                        className={`cursor-pointer hover:bg-[#F2F6F4] transition-all ${
                          isSelected 
                            ? 'bg-emerald-50/50 border-r-4 border-[#2B4D89] font-bold text-black font-extrabold' 
                            : 'bg-white'
                        }`}
                      >
                        {/* 1. Project ID */}
                        <td className="px-4 py-3.5 font-mono text-xs text-[#2B4D89] font-black">
                          {proj.id}
                        </td>
                        {/* 2. Client Name */}
                        <td className="px-4 py-3.5 font-medium text-gray-900">
                          {proj.clientName}
                        </td>
                        {/* 3. Phone Number */}
                        <td className="px-4 py-3.5 font-mono text-xs text-gray-550 text-right" dir="ltr">
                          {proj.clientPhone}
                        </td>
                        {/* 4. Unit Type */}
                        <td className="px-4 py-3.5 text-xs">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            proj.unitType === 'فيلا' 
                              ? 'bg-amber-100 text-amber-950 font-black' 
                              : proj.unitType === 'مكتب' 
                                ? 'bg-purple-100 text-purple-950 font-black' 
                                : 'bg-teal-100 text-teal-950 font-black'
                          }`}>
                            {transUnit}
                          </span>
                        </td>
                        {/* 5. Area */}
                        <td className="px-4 py-3.5 text-xs text-gray-600 font-extrabold font-sans">
                          {proj.area} {isEn ? 'sqm' : 'م'}
                        </td>
                        {/* 6. Location */}
                        <td className="px-4 py-3.5 text-xs text-gray-500">
                          {proj.city}
                        </td>
                        {/* 7. Progress */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 min-w-[70px]">
                            <span className="text-[11px] font-sans font-black text-emerald-800">
                              {progressPercent}%
                            </span>
                            <div className="w-12 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-1.5 rounded-full"
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        {/* 8. Project Status */}
                        <td className="px-4 py-3.5 text-xs font-semibold">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                            statusText.includes('مطلوب') || statusText.includes('Inspection requested')
                              ? 'bg-amber-50 text-amber-900 border border-amber-200 font-black animate-pulse'
                              : 'bg-emerald-50 text-emerald-950 border border-emerald-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              statusText.includes('مطلوب') || statusText.includes('Inspection requested')
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}></span>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. DETAILS GRID CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* ===================== RIGHT SIDEBAR: URGENT ALERTS & MAP RECOMMENDER ===================== */}
          <div className="lg:col-span-4 lg:order-2 space-y-6">
            
            {/* INBOX ALERTS */}
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-[#232F3F] border-b pb-3 flex items-center justify-between">
                <span>{isEn ? '🔔 Urgent Technical Alerts' : '🔔 التنبيهات الفنية العاجلة'}</span>
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {urgentAlerts.length} {isEn ? 'Urgent' : 'عاجل'}
                </span>
              </h3>

              {urgentAlerts.length === 0 ? (
                <div className="p-4 bg-[#F0F3F7]/50 border border-[#2B4D89]/25 text-emerald-800 rounded-xl text-xs text-center font-bold">
                  {isEn ? '🤝 No pending inspection requests at this time. All sites are stable.' : '🤝 لا توجد طلبات معلقة بانتظار استلامك حالياً. جميع مشاريعك مستقرة.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {urgentAlerts.map(stg => {
                    const reqObj = requests.find(r => r.id === stg.requestId);
                    const transStageName = isEn 
                      ? (stg.name.includes('سباكة') ? '🚿 Plumbing Handover' : stg.name.includes('كهرباء') ? '⚡ Electrical Handover' : stg.name) 
                      : stg.name;
                    return (
                      <div 
                        key={stg.id} 
                        onClick={() => {
                          if (reqObj) {
                            setSelectedProjectId(reqObj.id);
                            setSelectedStageId(stg.id);
                          }
                        }}
                        className={`border p-3 rounded-xl transition-colors cursor-pointer text-xs space-y-1 ${
                          stg.complaintText 
                            ? 'bg-rose-50 border-red-200 hover:bg-rose-100/80 text-rose-950 shadow-xs' 
                            : 'bg-amber-50/70 border-amber-200 hover:bg-amber-50 text-amber-950'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[#2B4D89]">{transStageName}</span>
                          <span className={`text-[9px] text-white px-2 py-0.5 rounded-full font-bold ${
                            stg.complaintText ? 'bg-red-600 animate-pulse' : 'bg-amber-600'
                          }`}>
                            {stg.complaintText ? (isEn ? '🚨 Client Complaint' : '🚨 شكوى عميل') : (isEn ? '⏳ Handover Requested' : '⏳ مطلوب استلام')}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold">
                          {isEn ? 'Project:' : 'المشروع:'} {reqObj?.unitType === 'فيلا' ? 'Villa' : 'Apartment'} #{reqObj?.id} - {reqObj?.city}
                        </p>
                        {stg.complaintText && (
                          <div className="bg-white/80 p-1.5 rounded border border-red-100 text-red-950 text-[9px] leading-normal font-black mt-1">
                            {isEn ? '💬 Complaint:' : '💬 الشكوى:'} "{stg.complaintText}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* NEIGHBORHOOD MAP ROUTER */}
            <div className="bg-white rounded-3xl border border-gray-150 shadow-xs p-5 space-y-4">
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-[#232F3F] flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-[#2B4D89]" />
                  <span>{isEn ? `Inspection Sites in ${activeInspector.governorate}` : `مواقع المعاينة الميدانية بـ ${activeInspector.governorate}`}</span>
                </h3>
                <p className="text-[10px] text-gray-400">
                  {isEn ? 'Sorting files and routes by closest physical location to minimize carbon footprint.' : 'ترتيب وعرض المواقع حسب الأقرب جغرافياً لك الآن لترشيد التحركات والزيارات.'}
                </p>
              </div>

              {/* Toggler for proximity sorting */}
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-emerald-500/10 mb-2">
                <span className="text-[10px] font-bold text-[#2B4D89] flex items-center gap-1">
                  <span>🚗</span> {isEn ? 'Sort Geographically:' : 'الفرز بالأقرب جغرافياً:'}
                </span>
                <button
                  type="button"
                  onClick={() => setSortByProximity(!sortByProximity)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    sortByProximity 
                      ? 'bg-[#2B4D89] text-white shadow-xs' 
                      : 'bg-gray-150 text-gray-500'
                  }`}
                >
                  {sortByProximity ? (isEn ? 'Enabled' : 'مفعّل') : (isEn ? 'Activate' : 'تفعيل الفرز')}
                </button>
              </div>

              {/* Interactive SVG Routing Mini-Map */}
              {(() => {
                const sortedAssigned = [...assignedProjects].sort((a, b) => {
                  if (sortByProximity) {
                    return getProximityDistance(a.city) - getProximityDistance(b.city);
                  }
                  return 0;
                });

                return (
                  <div className="space-y-4">
                    <div className="bg-[#091E16] rounded-2xl p-3 border border-emerald-950 text-white space-y-2 relative overflow-hidden">
                      <div className="flex items-center justify-between text-[8px] font-bold text-gray-405">
                        <span>{isEn ? '🗺️ Daily Route Recommendation (GPS)' : '🗺️ مقترح خط سير المفتش الميداني اليومي (GPS)'}</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                          {isEn ? 'Shatibha Maps' : 'خرائط شطبها'}
                        </span>
                      </div>
                      
                      <div className="h-28 bg-[#040D0A] rounded-xl relative border border-emerald-950/40 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                          <path d="M 40 80 Q 120 20 200 75 T 280 40" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="3 3" />
                          <circle cx="40" cy="80" r="5" fill="#10B981" className="animate-pulse" />
                          <circle cx="120" cy="20" r="4.5" fill="#FBBF24" />
                          <circle cx="200" cy="75" r="4.5" fill="#3B82F6" />
                          <circle cx="280" cy="40" r="4.5" fill="#EF4444" />
                        </svg>
                        
                        <div className="absolute bottom-2 right-2 bg-emerald-950/80 border border-emerald-700/50 px-1 py-0.5 rounded text-[7px] font-black text-white shrink-0">
                          {isEn ? '🚘 Fleet Origin' : '🚘 نقطة الحركة'}
                        </div>
                        
                        {sortedAssigned.map((proj, idx) => {
                          const dist = getProximityDistance(proj.city);
                          return (
                            <div 
                              key={proj.id} 
                              style={{ 
                                top: `${15 + idx * 24}px`, 
                                left: `${30 + idx * 68}px` 
                              }}
                              className="absolute bg-black/95 border border-emerald-500/40 px-1.5 py-0.5 rounded text-[8px] flex items-center gap-1 text-[#2B4D89] font-mono shrink-0 shadow-sm"
                            >
                              <span>#{proj.id}</span>
                              <span className="text-white font-sans text-[7px]">({dist}km)</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-[8px] text-gray-400 flex justify-between font-bold font-sans">
                        <span>{isEn ? 'Closest:' : 'أقرب:'} {sortedAssigned[0]?.city || (isEn ? 'None' : 'لا يوجد')}</span>
                        <span>{isEn ? 'Furthest:' : 'أبعد:'} {sortedAssigned[sortedAssigned.length - 1]?.city || (isEn ? 'None' : 'لا يوجد')}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

          {/* ===================== LEFT SIDE: DETAILED PROJECT STAGES & FIELD CAMERA ===================== */}
          <div className="lg:col-span-8 lg:order-1 space-y-6">
            
            {currentProject ? (
              <div className="space-y-6">
                
                {/* PROJECT QUICK SUMMARY CARD */}
                <div className="bg-[#102B20] text-white p-5 rounded-3xl shadow-sm border border-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-right sm:text-right">
                    <span className="text-[10px] bg-[#2B4D89] text-white px-2 py-0.5 rounded-full font-black">
                      {isEn ? 'Active Project Under Quality Assurance & Guarantee' : 'مشروع نشط تحت الرقابة الميدانية والضمان'}
                    </span>
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 mt-1 justify-end">
                      <span className="text-teal-400 font-mono">#{currentProject.id}</span>
                      <span>{isEn ? `${currentProject.unitType === 'فيلا' ? 'Villa' : 'Apartment'} / Client ${currentProject.clientName}` : `${currentProject.unitType} العميل / ${currentProject.clientName}`}</span>
                    </h3>
                    <p className="text-xs text-gray-300">
                      📍 {currentProject.city} - {currentProject.governorate} | {isEn ? `Total Budget: ${currentProject.budget.toLocaleString()} EGP` : `الميزانية الإجمالية: ${currentProject.budget.toLocaleString()} ج.م`}
                    </p>
                  </div>

                  <div className="shrink-0 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/5 text-xs text-right">
                    <span className="block text-[10px] text-teal-200">{isEn ? 'Responsible Inspector' : 'الاستشاري المسؤول'}</span>
                    <span className="font-extrabold text-white mt-0.5 block">{activeInspector.name}</span>
                  </div>
                </div>

                {/* CLIENT REQUEST DETAILED SPECIFICATIONS (As matching Contractor page details) */}
                {renderRequestSpecs(currentProject)}

                {/* 👩‍🔧 SUPERVISOR/INSPECTOR COORDINATION BOARD */}
                {['WAITING_FOR_INSPECTION', 'COORDINATION', 'CLIENT_SELECTED', 'CONTRACT_AWARD_PENDING', 'SITE_INSPECTION_COMPLETED', 'CONTRACT_SIGNED'].includes(currentProject.status) ? (
                  <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/40 border-2 border-amber-200 rounded-3xl p-6 space-y-6 shadow-sm text-right">
                    
                    {/* Header with visual phase indicator */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-4">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-[#7C2D12] text-sm flex items-center justify-start gap-1.5 font-sans">
                          <span className="text-xl">🕵️‍♂️ 📋</span>
                          <span>
                            {currentProject.status === 'CONTRACT_SIGNED' 
                              ? (isEn ? 'Contract Awaiting Admin Final Approval:' : 'العقد مكتمل وبانتظار اعتماد الإدارة النهائي:')
                              : currentProject.status === 'SITE_INSPECTION_COMPLETED'
                                ? (isEn ? 'Phase 5: Concluding Final Contract Terms:' : 'المرحلة 5: صياغة وتوقيع بنود العقد النهائي:')
                                : (isEn ? 'Phase 4: Site Physical Inspection Coordination:' : 'المرحلة 4: التنسيق وإجراء المعاينة الميدانية للوحدة:')
                            }
                          </span>
                        </h4>
                        <p className="text-xs text-amber-900/90 leading-relaxed font-bold">
                          {currentProject.status === 'CONTRACT_SIGNED'
                            ? (isEn ? 'Contract details are locked. Awaiting final review from Shattabha management to launch.' : 'تم توقيع العقد وحفظه بالمثبت الإلكتروني. بانتظار موافقة الإدارة النهائية لتوليد سجلات الدفع والضمان والمشروع.')
                            : currentProject.status === 'SITE_INSPECTION_COMPLETED'
                              ? (isEn ? 'Specify price, daily delay fines, payment percentages, and upload contract copy.' : 'يرجى إدخال القيمة النهائية، نسب الدفعات لكل مرحلة، قيمة غرامة التأخير، ورفع نسخة العقد الموقعة.')
                              : (isEn ? 'Contact client/contractor, visit site to check works scope, then complete inspection.' : 'قم بالتواصل مع العميل والمقاول، وقم بزيارة العقار وتأكيد الأبعاد، ثم اضغط على زر إتمام المعاينة.')
                          }
                        </p>
                      </div>
                      <span className="px-3.5 py-1 text-[10px] font-black bg-amber-200/80 text-amber-950 rounded-full shrink-0">
                        {currentProject.status === 'CONTRACT_SIGNED' 
                          ? (isEn ? 'Phase: Locked Review' : 'الحالة: تم توقيع العقد وسداد الدفعة المقدمة 💳')
                          : currentProject.status === 'SITE_INSPECTION_COMPLETED'
                            ? (isEn ? 'Phase: Structuring Contract' : 'الحالة: صياغة وتوقيع العقد')
                            : (isEn ? 'Phase: Live Inspection' : 'الحالة: معاينة موقعية نشطة')
                        }
                      </span>
                    </div>

                    {/* RENDERING PHASE 4: COORDINATION & PHYSICAL VISIT TARGETS */}
                    {(currentProject.status === 'CONTRACT_AWARD_PENDING' || currentProject.status === 'CLIENT_SELECTED' || currentProject.status === 'COORDINATION' || currentProject.status === 'WAITING_FOR_INSPECTION') && (
                      <div className="space-y-6">
                        <div className="p-5 bg-white/80 rounded-2xl border border-amber-200 shadow-sm space-y-4">
                          <h5 className="font-bold text-[#7C2D12] text-xs pb-2 border-b border-amber-100 flex items-center justify-start gap-1">
                            <span>🔍</span>
                            <span>{isEn ? 'Site Inspection & Engineering Survey Tasks' : 'قائمة مهام التدقيق والتحقق الفني الميداني:'}</span>
                          </h5>
                          
                          {/* Rich interactive guide/checklist */}
                          <div className="space-y-2.5">
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                              {isEn 
                                ? 'Please complete the following checklist steps on-site or with the customer before finalizing the inspection details:' 
                                : 'يرجى مراجعة واستكمال بنود اللائحة الفنية التالية بالكامل ميدانياً بالتنسيق مع العميل والمقاول قبل إنهاء المعاينة:'}
                            </p>
                            
                            {currentProject.requireInspector !== false ? (
                              // WITH SUPERVISION (خدمة إشراف هندسي)
                              <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/50 space-y-2 text-right">
                                <span className="text-[10px] bg-amber-600 text-white font-black px-2 py-0.5 rounded-full inline-block mb-1">🛡️ مسار الإشراف الفني المعتمد لشطبها</span>
                                <div className="space-y-1.5 text-xs text-amber-950 font-bold">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5" />
                                    <span>📞 التواصل مع العميل والشركة لتنسيق المعاينة الميدانية.</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5" />
                                    <span>🏡 زيارة موقع المشروع وإجراء المعاينة الفنية للوحدة.</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5" />
                                    <span>📝 مراجعة نطاق الأعمال المذكور مع المقاول والعميل.</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5" />
                                    <span>📐 مراجعة المواصفات الفنية المعتمدة وجودة خامات التأسيس.</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5" />
                                    <span>🗓️ مناقشة خطة التنفيذ والجدول الزمني لتسليم البنود.</span>
                                  </label>
                                </div>
                              </div>
                            ) : (
                              // WITHOUT SUPERVISION (بدون إشراف هندسي)
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-right">
                                <span className="text-[10px] bg-slate-600 text-white font-black px-2 py-0.5 rounded-full inline-block mb-1">👤 مسار توثيق وتأمين التعاقد فقط (بدون خدمة إشراف هندسي)</span>
                                <div className="space-y-1.5 text-xs text-slate-805 font-bold">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded text-slate-600 focus:ring-slate-500 h-3.5 w-3.5" />
                                    <span>📞 التواصل مع العميل والشركة لتنسيق المعاينة.</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded text-slate-600 focus:ring-slate-500 h-3.5 w-3.5" />
                                    <span>🏡 زيارة موقع المشروع المعني بالتشطيب وإجراء المعاينة.</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded text-slate-600 focus:ring-slate-500 h-3.5 w-3.5" />
                                    <span>📝 مراجعة كافة نطاف الأعمال والمواصفات الأساسية.</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded text-slate-600 focus:ring-slate-500 h-3.5 w-3.5" />
                                    <span>💬 مناقشة تفاصيل التنفيذ مع العميل مباشرة.</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded text-slate-600 focus:ring-slate-500 h-3.5 w-3.5" />
                                    <span>📐 مراجعة المواصفات المطلوبة مسبقاً من قبل العميل ومعايرتها.</span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Inspection Report Field */}
                          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/50 space-y-2">
                            <label className="block text-xs font-black text-amber-950 mb-1">
                              📝 {isEn ? 'Inspection Report & Technical Notes:' : '📝 تقرير المعاينة الميدانية وملاحظات الزيارة الاستقصائية للموقع:'}
                            </label>
                            <textarea
                              rows={4}
                              value={inspectionReportText}
                              onChange={e => setInspectionReportText(e.target.value)}
                              placeholder={isEn 
                                ? 'Write structural survey findings, technical measurements, ancient plumbing state review, building code match parameters, material quality indexes, or client custom wishes...' 
                                : 'سجل تفاصيل ومخرجات المعاينة الفنية، أبعاد وقياسات الغرف والوحدة، سلامة التأسيس المسبق للكهرباء والسباكة، نوعية واحتياجات التكسير والترميم، الرغبات الخاصة بالعميل والمواد المقترحة...'}
                              className="w-full p-2.5 bg-white border border-amber-200 text-xs rounded-xl outline-none font-sans font-semibold text-right shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-gray-400"
                            />
                            <p className="text-[9.5px] text-[#7C2D12] mt-1 font-bold">
                              ⚠️ {isEn 
                                ? "This report will trigger client alert notifications and sync directly with platform general administration audits." 
                                : "كتابة هذا التقرير يطلق إشعاراً فورياً للعميل ولملف المشروع في الإدارة (تقرير المعاينة المسجل ثنائي المصادقة)."}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {/* Contract Signing Date specification */}
                            <div>
                              <label className="block text-xs font-black text-amber-950 mb-1">
                                ✍️ {isEn ? 'Projected Contract Signing Date:' : '🗓️ التوقيت المقترح لتوقيع العقد النهائي وسداد الدفعة المقدمة:'}
                              </label>
                              <input
                                type="date"
                                value={contractSigningDate}
                                onChange={e => setContractSigningDate(e.target.value)}
                                className="w-full p-2.5 bg-white border border-amber-200 text-xs rounded-xl outline-none text-right font-bold"
                              />
                            </div>
                            
                            {/* Confirm inspector visited site */}
                            <div className="flex flex-col justify-end">
                              <button
                                type="button"
                                onClick={handleMarkSiteInspectionCompleted}
                                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                              >
                                <span>✓</span>
                                {isEn ? 'Mark Site Inspection Completed' : '✓ تأكيد إتمام المعاينة الفنية (Site Inspection Completed)'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* RENDERING PHASE 5: CONTRACT SETUP SCREEN */}
                    {currentProject.status === 'SITE_INSPECTION_COMPLETED' && (
                      <div className="space-y-6">
                        {currentProject.coordinationNotes && (
                          <div className="bg-red-50 border-r-4 border-red-500 text-red-950 p-4 rounded-xl text-xs font-bold font-sans text-right space-y-1 shadow-3xs">
                            <span className="block font-black text-red-800 text-sm">↩️ تم استرجاع العقد للتعديل من قِبل إدارة شطبها:</span>
                            <p className="text-red-900 leading-relaxed bg-white/40 p-2.5 rounded-lg border border-red-100">
                              {currentProject.coordinationNotes}
                            </p>
                            <span className="block text-[10px] text-gray-400 mt-1">يرجى مراجعة وتجهيز البيانات المطلوبة بالقيم المخفضة أو تصحيحها، ثم النقر على "إيداع وتوقيع العقد" لإرسالها مرة أخرى.</span>
                          </div>
                        )}

                        {/* Inspection Report display/edit in contract setup */}
                        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200">
                          <label className="block text-xs font-black text-[#7C2D12] mb-1.5 font-sans">
                            📝 {isEn ? 'Field Inspection Report Notes (Editable):' : '📝 تقرير المعاينة الميدانية المصادق عليه (يمكن لفه وتحديثه):'}
                          </label>
                          <textarea
                            rows={3}
                            value={inspectionReportText}
                            onChange={(e) => setInspectionReportText(e.target.value)}
                            className="w-full p-2.5 bg-white border border-amber-100 text-xs rounded-xl outline-none font-sans font-medium text-right shadow-xs focus:border-amber-400"
                            placeholder={isEn ? 'No inspection report filed.' : 'لا يوجد تقرير معاينة مسجل.'}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Final Price */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">{isEn ? 'Final Agreed Price (EGP)' : '💰 القيمة النهائية الإجمالية للتعاقد (ج.م):'}</label>
                            <input
                              type="number"
                              value={finalContractPrice}
                              onChange={e => setFinalContractPrice(Number(e.target.value))}
                              placeholder="1200000"
                              className="w-full p-2.5 bg-white border border-amber-200 text-xs rounded-xl outline-none text-center font-black text-emerald-950"
                            />
                          </div>

                          {/* Advance Paid Deposit */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">{isEn ? 'Advance Payment Collected (EGP)' : '💸 قيمة الدفعة المقدمة المستلمة للتأكيد (ج.م):'}</label>
                            <input
                              type="number"
                              value={advancePaidAmount}
                              onChange={e => setAdvancePaidAmount(Number(e.target.value))}
                              placeholder="150000"
                              className="w-full p-2.5 bg-white border border-amber-200 text-xs rounded-xl outline-none text-center font-black text-blue-950"
                            />
                          </div>

                          {/* Daily Delay penalty */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">{isEn ? 'Daily Delay Penalty Fine (EGP)' : '⚠️ غرامة التأخير اليومية المتفق عليها (ج.م):'}</label>
                            <input
                              type="number"
                              value={delayFine}
                              onChange={e => setDelayFine(Number(e.target.value))}
                              className="w-full p-2.5 bg-white border border-amber-200 text-xs rounded-xl outline-none text-center font-black text-red-950"
                            />
                          </div>
                        </div>

                        {/* STAGES PAYMENT PERCENTAGES DISTRIBUTION */}
                        <div className="bg-white p-4.5 rounded-2xl border border-amber-200 space-y-4">
                          <div className="flex items-center justify-between border-b border-amber-100 pb-2 flex-wrap gap-2">
                            <label className="text-xs font-black text-[#7C2D12]">
                              📋 {isEn ? 'Contract Stage Payment Percentages Weight configuration (%):' : '📋 إدخال نسب الدفعات لكل مرحلة بمراحل التنفيذ الفني (%):'}
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setPercPlumbing(15);
                                setPercElectric(15);
                                setPercConcrete(15);
                                setPercFloor(20);
                                setPercPaint(20);
                                setPercFinal(15);
                              }}
                              className="text-[10px] bg-amber-50 hover:bg-amber-100 text-[#7C2D12] border border-amber-200 px-2.5 py-1 rounded-lg font-bold cursor-pointer"
                            >
                              إعادة توزيع قياسي بالتخصيص (15% - 15% - 15% - 20% - 20% - 15%)
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-150">
                              <span className="block text-[11px] font-bold text-gray-500 mb-1">1. السباكة والصرف</span>
                              <div className="flex items-center justify-center gap-1">
                                <input 
                                  type="number" 
                                  value={percPlumbing} 
                                  onChange={e => setPercPlumbing(Number(e.target.value) || 0)}
                                  className="w-12 p-1 bg-white border border-gray-300 text-center text-xs font-black rounded-lg outline-none focus:ring-1 focus:ring-amber-500" 
                                />
                                <span className="text-[10px] text-gray-400 font-bold">%</span>
                              </div>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-150">
                              <span className="block text-[11px] font-bold text-gray-500 mb-1">2. الكهرباء والشبكات</span>
                              <div className="flex items-center justify-center gap-1">
                                <input 
                                  type="number" 
                                  value={percElectric} 
                                  onChange={e => setPercElectric(Number(e.target.value) || 0)}
                                  className="w-12 p-1 bg-white border border-gray-300 text-center text-xs font-black rounded-lg outline-none focus:ring-1 focus:ring-amber-500" 
                                />
                                <span className="text-[10px] text-gray-400 font-bold">%</span>
                              </div>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-150">
                              <span className="block text-[11px] font-bold text-gray-500 mb-1">3. بياض المحارة</span>
                              <div className="flex items-center justify-center gap-1">
                                <input 
                                  type="number" 
                                  value={percConcrete} 
                                  onChange={e => setPercConcrete(Number(e.target.value) || 0)}
                                  className="w-12 p-1 bg-white border border-gray-300 text-center text-xs font-black rounded-lg outline-none focus:ring-1 focus:ring-amber-500" 
                                />
                                <span className="text-[10px] text-gray-400 font-bold">%</span>
                              </div>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-150">
                              <span className="block text-[11px] font-bold text-gray-500 mb-1">4. الأرضيات والبورسلين</span>
                              <div className="flex items-center justify-center gap-1">
                                <input 
                                  type="number" 
                                  value={percFloor} 
                                  onChange={e => setPercFloor(Number(e.target.value) || 0)}
                                  className="w-12 p-1 bg-white border border-gray-300 text-center text-xs font-black rounded-lg outline-none focus:ring-1 focus:ring-amber-500" 
                                />
                                <span className="text-[10px] text-gray-400 font-bold">%</span>
                              </div>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-150">
                              <span className="block text-[11px] font-bold text-gray-500 mb-1">5. الدهانات والتشطيب</span>
                              <div className="flex items-center justify-center gap-1">
                                <input 
                                  type="number" 
                                  value={percPaint} 
                                  onChange={e => setPercPaint(Number(e.target.value) || 0)}
                                  className="w-12 p-1 bg-white border border-gray-300 text-center text-xs font-black rounded-lg outline-none focus:ring-1 focus:ring-amber-500" 
                                />
                                <span className="text-[10px] text-gray-400 font-bold">%</span>
                              </div>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-150">
                              <span className="block text-[11px] font-bold text-[10.5px] text-gray-500 mb-1">6. التشطيب النهائي</span>
                              <div className="flex items-center justify-center gap-1">
                                <input 
                                  type="number" 
                                  value={percFinal} 
                                  onChange={e => setPercFinal(Number(e.target.value) || 0)}
                                  className="w-12 p-1 bg-white border border-gray-300 text-center text-xs font-black rounded-lg outline-none focus:ring-1 focus:ring-amber-500" 
                                />
                                <span className="text-[10px] text-gray-400 font-bold">%</span>
                              </div>
                            </div>
                          </div>
                          
                          {(() => {
                            const totalVal = percPlumbing + percElectric + percConcrete + percFloor + percPaint + percFinal;
                            return (
                              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-xs font-bold font-sans">
                                <span className="text-gray-500">📈 إجمالي نسب توزيع الدفعات الجارية للأقساط (تستثنى الدفعة المقدمة):</span>
                                <span className={totalVal === 100 ? "text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-250 font-black" : "text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-250 animate-pulse font-black"}>
                                  {totalVal}% {totalVal === 100 ? "✅ (مكتمل وصحيح 100%)" : "⚠️ (الرجاء تعديل النسب ليساوي مجموع البنود 100% بالضبط لإنهاء التعاقد)"}
                                </span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* OTHER CONTRACT SPECIFICS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">{isEn ? 'Execution Duration (Days)' : '⏳ مدة التنفيذ الكلية بالاتفاق (بالأيام):'}</label>
                            <input
                              type="number"
                              value={executionDurationDays}
                              onChange={e => setExecutionDurationDays(Number(e.target.value) || 0)}
                              id="exec_duration"
                              className="w-full p-2.5 bg-white border border-amber-200 text-xs rounded-xl outline-none text-center font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">{isEn ? 'Warranty Duration (Years)' : '🛡️ مدة الضمان المطلوبة بالسنوات:'}</label>
                            <input
                              type="text"
                              value={warrantyPeriod}
                              onChange={e => setWarrantyPeriod(e.target.value)}
                              placeholder="3 سنوات ذهبية"
                              className="w-full p-2.5 bg-white border border-amber-200 text-xs rounded-xl outline-none text-center font-bold text-amber-950"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">{isEn ? 'Proposed Works Start Date' : '🗓️ تاريخ بدء التنفيذ المقترح المعتمد:'}</label>
                            <input
                              type="date"
                              id="proposed_start_date"
                              value={workStartDate}
                              onChange={e => setWorkStartDate(e.target.value)}
                              className="w-full p-2.5 bg-white border border-amber-200 text-xs rounded-xl outline-none text-center font-semibold"
                            />
                          </div>
                        </div>

                        {/* SCAN / FILE COPY OF CONTRACT */}
                        <div className="bg-[#FFFDF9] border border-dashed border-amber-300 rounded-2xl p-5 text-center">
                          <label className="block text-xs font-extrabold text-[#7C2D12] mb-1">
                            📂 {isEn ? 'Upload Scanned Signed Joint Contract (.PDF)' : '📂 إرفاق نسخة العقد النهائي الموقعة إلكترونياً أو بالماسح الضوئي (.PDF / .JPG)'}
                          </label>
                          <p className="text-[10px] text-gray-400 mb-3">
                            {isEn 
                              ? 'Upload reference contract PDF signed by Inspector, Contractor, and Client.' 
                              : 'يرجى مراجعة وتأكيد وجود نسخة رقمية من العقد الثلاثي الموقع لتأمين البنود قانونياً ومالياً.'}
                          </p>

                          <div className="flex flex-col items-center justify-center gap-2">
                            {inspContractFile ? (
                              <div className="bg-emerald-50 text-emerald-800 border border-emerald-500/15 px-4 py-2 rounded-xl inline-flex items-center gap-2 text-xs font-black">
                                <span>📄</span>
                                <span className="font-mono">{inspContractFile}</span>
                                <button
                                  type="button"
                                  onClick={() => setInspContractFile('')}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold font-mono text-[9px] cursor-pointer"
                                >
                                  {isEn ? 'Delete' : 'حذف وإلغاء'}
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center justify-center gap-2">
                                <label className="cursor-pointer bg-white hover:bg-amber-100/50 border border-amber-300 px-4 py-2 rounded-xl text-[11px] font-bold text-amber-900 inline-block transition-all shadow-xs active:scale-95">
                                  {isEn ? '📁 Browse Files...' : '📁 تصفح ملفات جهازك...'}
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={e => {
                                      if (e.target.files && e.target.files[0]) {
                                        setInspContractFile(e.target.files[0].name);
                                      } else {
                                        setInspContractFile('shattabha_final_contract_signed.pdf');
                                      }
                                    }}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setInspContractFile('shattabha_verified_joint_contract.pdf')}
                                  className="bg-[#7C2D12] hover:bg-amber-900 text-white px-4 py-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all shadow-xs"
                                >
                                  ** {isEn ? 'Generate Unified Contract Sample' : '🪄 توليد نموذج عقد معتمد فوري لشطبها'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* SUBMISSION BUTTON */}
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!onUpdateRequest) return;
                              
                              const totalVal = percPlumbing + percElectric + percConcrete + percFloor + percPaint + percFinal;
                              if (totalVal !== 100) {
                                alert("⚠️ لا يمكن الحفظ والتقديم! مجموع نسب المراحل الستة لا يساوي 100% بالضبط (المجموع الحالي: " + totalVal + "%). يرجى تعديل النسب لتكتمل الشروط الحسابية قبل التظهير لإدارة المنصة.");
                                return;
                              }

                              const finalizedPercentages: Record<string, number> = {
                                "الدفعة المقدمة (ضمان الجدية وبدء الأعمال)": 10,
                                "أعمال السباكة والصرف الفني": percPlumbing,
                                "تأسيس الكهرباء والشبكات": percElectric,
                                "أعمال البياض والمحارة الداخلية": percConcrete,
                                "تركيب البورسلين والأرضيات": percFloor,
                                "أعمال الدهانات والتشطيبات الأساسية": percPaint,
                                "التشطيبات النهائية وتسليم المفاتيح": percFinal
                              };

                               onUpdateRequest(currentProject.id, {
                                status: 'CONTRACT_SIGNED',
                                finalContractPrice: finalContractPrice || 850000,
                                advancePaidAmount: advancePaidAmount || 100000,
                                advancePaid: true,
                                delayFine: delayFine || 500,
                                warrantyPeriod: warrantyPeriod || '٣ سنوات شاملة الضمان',
                                inspectionReport: inspectionReportText,
                                finalContractFile: inspContractFile || 'shattabha_final_contract_signed.pdf',
                                coordinationNotes: inspNotes || 'تم استلام وتوثيق العقد فنيّاً ومالياً من المشرف الاستشاري بمقايسات ومحاضر الميدان المعمتدة وجرى التثبيت والرفع للإدارة لمشاهدة التواقيع ونسب الدفع وتفعيل الإشراف.',
                                workStartDate: workStartDate || new Date().toISOString().split('T')[0],
                                paymentPercentages: finalizedPercentages,
                                executionDurationDays: executionDurationDays || 120
                              });
                              alert(isEn 
                                ? '🎉 Final Contract pricing, staged percents and scanned PDF uploaded successfully! Sent to Admin review queue.' 
                                : '🎉 تم توقيع العقد وحفظ البنود وإيداع نسب الدفعات الموزعة بنجاح! انتقل هذا الطلب إلى لوحة الإدارة للمراجعة وتفعيل الحساب والمشروع للمقاول والمشرف.');
                            }}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-8 py-3 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95 duration-100"
                          >
                            ✍️ {isEn ? 'Sign Contract & Upload to Management Review' : '✍️ إيداع وتوقيع العقد نهائياً والتظهير للإدارة والمطابقة المباشرة 🚀'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* RENDERING PHASE 6: CONTRACT_SIGNED STATUS PENDING ADMIN */}
                    {currentProject.status === 'CONTRACT_SIGNED' && (
                      <div className="p-8 text-center bg-white/70 rounded-2xl border border-amber-300 space-y-4">
                        <span className="text-4xl block">⏳ 📝</span>
                        <h5 className="font-extrabold text-amber-950 text-base">{isEn ? 'Contract Signed - Awaiting Admin Approvals' : 'تم توقيع العقد وسداد الدفعة المقدمة'}</h5>
                        <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed">
                          {isEn 
                            ? 'All final pricing, stage weights, and delays penalties have been locked. Management is coordinating final budget and security escrow setup before physical launch.' 
                            : 'لقد قمت بتحميل وتصديق كافة البنود المالية والتواقيع، وتم توجيه العقد للواجهة المالية للأدمن للمراجعة وتنفيذ التحويل الضامن تمهيداً للإطلاق وحشد المقاولين.'}
                        </p>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-5 shadow-xs text-right">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-[#232F3F] text-sm flex items-center justify-start gap-1.5 font-sans">
                        <span className="text-lg">👩‍🔧</span>
                        <span>{isEn ? 'Inspection, Visits & Multi-Party Escrow Contract Coordination:' : 'لوحة التنسيق، الزيارات الميدانية وعقود شطبها المندمجة:'}</span>
                      </h4>
                      <p className="text-xs text-[#2B4D89] font-bold mt-1 text-right">
                        {isEn ? 'Set physically scheduled visits, agreement signing meeting dates, and upload a copy of the contract PDF below.' : 'أدخل مواعيد المعاينة والتوقيع النهائي للعميل، وارفع نسخة الملف الإلكتروني للعقد المعتمد للهندسة:'}
                      </p>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!currentProject || !onUpdateRequest) return;
                        onUpdateRequest(currentProject.id, {
                          coordinationInspectionDate: inspInspectionDate,
                          coordinationContractDate: inspContractDate,
                          coordinationContractFile: inspContractFile,
                          coordinationNotes: inspNotes,
                          actualStartDate: inspActualStartDate
                        });
                        alert(isEn 
                          ? '✔️ Coordination details, actual execution start date, and escrow agreement files saved successfully!' 
                          : '✔️ تم حفظ تفاصيل المعاينة والمطابقة وتاريخ البدء الفعلي ومستندات العقد بملف المشروع بنجاح!');
                      }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right"
                    >
                      <div className="text-right">
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">{isEn ? 'Scheduled Physical Inspection Date' : '🗓️ موعد المعاينة الفنية الميدانية للوحدة:'}</label>
                        <input
                          type="date"
                          value={inspInspectionDate}
                          onChange={e => setInspInspectionDate(e.target.value)}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl outline-none text-right"
                        />
                      </div>

                      <div className="text-right">
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">{isEn ? 'Contract Signing & Notary Meeting Date' : '✍️ موعد كتابة العقد النهائي والمطابقة:'}</label>
                        <input
                          type="date"
                          value={inspContractDate}
                          onChange={e => setInspContractDate(e.target.value)}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl outline-none text-right"
                        />
                      </div>

                      <div className="text-right">
                        <label className="block text-xs font-bold text-orange-700 mb-1.5">{isEn ? 'Actual Execution Start Date (First Stage)' : '🚀 تاريخ البدء الفعلي لأولى مراحل التشطيب:'}</label>
                        <input
                          type="date"
                          value={inspActualStartDate}
                          onChange={e => setInspActualStartDate(e.target.value)}
                          className="w-full p-2.5 bg-orange-50/50 border border-orange-200 text-xs rounded-xl outline-none text-right font-extrabold text-orange-950"
                          required
                        />
                      </div>

                      {/* Drag-and-drop simulated doc upload */}
                      <div className="md:col-span-3 bg-[#FAF5F0] border border-dashed border-orange-300 rounded-2xl p-4 text-center">
                        <label className="block text-xs font-extrabold text-[#7C2D12] mb-1">
                          📂 {isEn ? 'Upload Soft Copy of Signed/Draft Contract' : '📂 رفع نسخة إلكترونية من العقد النهائي للطلب'}
                        </label>
                        <p className="text-[10px] text-gray-400 mb-3">
                          {isEn ? 'Upload reference PDF, DOCX or image scans of signed pages.' : 'الامتدادات المدعومة: PDF, JPG, PNG لمطابقة ومراجعة الميزانية بالمنصة.'}
                        </p>

                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          {inspContractFile ? (
                            <div className="bg-emerald-50 text-[#0F7453] border border-emerald-500/10 px-3.5 py-2 rounded-xl inline-flex items-center gap-2 text-xs font-black">
                              <span>📄</span>
                              <span className="font-mono">{inspContractFile}</span>
                              <button
                                type="button"
                                onClick={() => setInspContractFile('')}
                                className="bg-red-50 hover:bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold font-mono text-[9px] cursor-pointer"
                              >
                                {isEn ? 'Delete' : 'حذف'}
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              <label className="cursor-pointer bg-white hover:bg-gray-50 border border-orange-200 px-3 py-1.5 rounded-xl text-[11px] font-bold text-orange-850 inline-block transition-all shadow-xs active:scale-95">
                                {isEn ? '📁 Choose File...' : '📁 تصفح الملفات...'}
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={e => {
                                    if (e.target.files && e.target.files[0]) {
                                      setInspContractFile(e.target.files[0].name);
                                    } else {
                                      setInspContractFile('contract_revised_inspector_approved.pdf');
                                    }
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setInspContractFile('shattabha_joint_contract_verified.pdf')}
                                className="bg-orange-850 hover:bg-orange-900 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all"
                              >
                                🪄 {isEn ? 'Use Preset Contract.pdf' : '🪄 إرفاق نموذج عقد.pdf'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-3 text-right font-sans">
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">{isEn ? 'Notes & Engineering Recommendations' : '📝 ملاحظات ومواصفات المعاينة الفنية ومطالب العميل:'}</label>
                        <textarea
                          rows={2}
                          value={inspNotes}
                          onChange={e => setInspNotes(e.target.value)}
                          placeholder={isEn ? "E.g. Approved layout edits, electricity source checks completed..." : "سجل هنا أي شروط مسبقة أو تفاهمات، مثل: تم الانتهاء من مراجعة شبكة الكهرباء والسباكة القديمة..."}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl outline-none font-sans text-right"
                        />
                      </div>

                      <div className="md:col-span-3 flex justify-end pt-2">
                        <button
                          type="submit"
                          className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          💾 {isEn ? 'Save Technical Coordination Details' : '💾 حفظ موعد المعاينة وملف العقد بالطلب'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* APPROVED PROGRESS STAGES ROW */}
                <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-5 shadow-xs">
                  <div className={`space-y-1 ${isEn ? 'text-left' : 'text-right'}`}>
                    <h4 className={`font-extrabold text-sm text-[#232F3F] flex items-center gap-1.5 font-sans ${isEn ? 'justify-start' : 'justify-start'}`}>
                      <ClipboardList className="w-4 h-4 text-[#2B4D89]" />
                      <span>{isEn ? 'Approved Finishing Stages & Inspection Update Schedule:' : 'جدول مراحل التشطيب المعتمد وتحديث حالة الفحص:'}</span>
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {isEn ? 'Select a stage to inspect physically, capture live site photos, compile engineering reviews, and evaluate material quality.' : 'اختر المرحلة المراد فحصها ميدانياً والتقاط صور لها لكتابة التقرير الهندسي وتقرير جودة الخامات.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {!currentProject.requireInspector && ['ACTIVE', 'DELAYED', 'COMPLETED'].includes(currentProject.status) ? (
                      <div className="col-span-4 bg-rose-50/70 border border-dashed border-rose-300 rounded-3xl p-6 text-center text-xs font-semibold text-rose-900 leading-relaxed space-y-2">
                        <span className="text-2xl block">🛑 👷‍♂️</span>
                        <p>{isEn ? 'Supervision Ended' : 'انتهت صلاحيتك الإشرافية الميدانية للبند'}</p>
                        <p className="text-[10px] text-gray-500 font-normal">
                          {isEn 
                            ? 'The client did not opt-in for full engineering supervision. Your role has ended after completing the initial inspection and contract signing.' 
                            : 'لم يطلب العميل خدمة الإشراف الهندسي المتكاملة؛ لذا تقتصر صلاحياتك على المعاينة وصياغة وتوقيع العقد فقط، ويقوم العميل الآن بمتابعة مراحل التنفيذ وصرف المستحقات مع المقاول مباشرة من لوحته.'}
                        </p>
                      </div>
                    ) : projectStages.length === 0 ? (
                      <div className="col-span-4 bg-amber-50/70 border border-dashed border-amber-300 rounded-3xl p-6 text-center text-xs font-semibold text-amber-900 leading-relaxed space-y-2">
                        <span className="text-2xl block">🕵️‍♂️ ⏳</span>
                        <p>{isEn ? 'This project is currently awaiting final admin approval of inspection & contracting.' : 'هذا المشروع قيد التنسيق والتعاقد حالياً. بانتظار اعتماد الأدمن وتوقيع العقود الفعلي للاعتماد والتشييد.'}</p>
                        <p className="text-[10px] text-gray-500 font-normal">{isEn ? 'Once approved, the standard finishing milestones (Plumbing, Electrical, etc.) will be automatically initialized here.' : 'فور تفعيل اعتماد العقد وبدء التشغيل، سيتم توليد وتنشيط خطط ومراحل استلام البنود الميدانية تلقائياً.'}</p>
                      </div>
                    ) : projectStages.map(stg => {
                      const transStageName = isEn 
                        ? (stg.name.includes('سباكة') ? '🚿 Plumbing Handover' : stg.name.includes('كهرباء') ? '⚡ Electrical Handover' : stg.name) 
                        : stg.name;
                      return (
                        <button
                          key={stg.id}
                          type="button"
                          onClick={() => setSelectedStageId(stg.id)}
                          className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between h-[105px] relative overflow-hidden cursor-pointer ${
                            selectedStageId === stg.id
                              ? 'bg-[#2B4D89] text-white border-[#2B4D89] shadow-md'
                              : 'bg-white border-gray-200 hover:border-gray-300 text-[#2B4D89]'
                          }`}
                        >
                          {stg.inspectionRequested && (
                            <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                          )}

                          <div>
                            <p className="text-[10px] font-black tracking-wide uppercase opacity-75">
                              {isEn ? `Stage ${stg.id.split('-').pop()}` : `المرحلة ${stg.id.split('-').pop()}`}
                            </p>
                            <h5 className="font-bold text-xs mt-1 leading-normal overflow-hidden h-[36px]">
                              {transStageName}
                            </h5>
                          </div>

                          <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-gray-100/10">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${
                              stg.status === 'APPROVED' || stg.status === 'INSPECTION_APPROVED' || stg.status === 'PAID' ? 'bg-[#102B20] text-emerald-400' :
                              stg.status === 'REJECTED' || stg.status === 'INSPECTION_FAILED' ? 'bg-rose-500/15 text-rose-400' :
                              stg.status === 'IN_PROGRESS' || stg.status === 'UNDER_WAY' ? 'bg-blue-500/15 text-blue-400 animate-pulse' :
                              stg.status === 'INSPECTION_REQUESTED' ? 'bg-amber-500/15 text-amber-500 animate-pulse' : 'bg-gray-100/10 text-gray-400'
                            }`}>
                              {stg.status === 'APPROVED' || stg.status === 'INSPECTION_APPROVED' || stg.status === 'PAID' ? (isEn ? 'Approved' : 'مقبول فنيّاً') :
                               stg.status === 'REJECTED' || stg.status === 'INSPECTION_FAILED' ? (isEn ? 'Rejected' : 'ملاحظات مرفوضة') :
                               stg.status === 'IN_PROGRESS' || stg.status === 'UNDER_WAY' ? (isEn ? 'Under execution' : 'جاري العمل 🛠️') :
                               stg.status === 'INSPECTION_REQUESTED' ? (isEn ? 'Inspection Requested' : 'طلب فحص 🔬') : (isEn ? 'Pending' : 'بانتظار البدء')}
                            </span>
                            
                            <span className="text-[10px] font-mono opacity-85">
                              {stg.progress}%
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CURRENT STAGE TECHNICAL INSPECTION PANEL */}
                {activeStage ? (
                  <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-6 shadow-xs">
                    
                    {/* Header of Stage */}
                           {/* TWO-COLUMN DETAIL (Simulated Dual Camera on right, Technical Report form on left) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      
                      {/* RIGHT PART: DUAL CAMERA SIMULATOR (5 cols) */}
                      <div className="md:col-span-5 space-y-4">
                        <div className="bg-gradient-to-br from-gray-50 to-slate-100/50 border border-gray-200 rounded-3xl p-4.5 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                            <span className="text-xs font-black text-[#2B4D89] flex items-center gap-1">
                              <span>📷</span> {isEn ? 'Dual before-after capture (Shatibha Cam)' : 'منظومة كاميرات الفحص والتوثيق المزدوجة'}
                            </span>
                            <span className="text-[9px] bg-[#102B20] text-emerald-400 font-bold px-2 py-0.5 rounded-full font-sans">
                              {isEn ? 'Dual View' : 'قبل وبعد'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            {/* Before Column */}
                            <div className="space-y-2 text-right">
                              <span className="block text-[10px] font-black text-rose-700 flex items-center gap-1 justify-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                                {isEn ? 'Phase 1: Before work / Rough slab' : 'المرحلة الأولى: صورة بند التشطيب قبل التنفيذ (تحت التأسيس):'}
                              </span>
                              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#0A0F12] relative border border-rose-300/40 shadow-inner">
                                {cameraActiveBefore ? (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-2">
                                    <RefreshCw className="w-6 h-6 text-rose-500 animate-spin" />
                                    <span className="text-[9px] font-bold text-rose-400 font-mono tracking-widest">{isEn ? 'MOCKING BEFORE...' : 'مسح وتوثيق الكود الفني...'}</span>
                                  </div>
                                ) : beforeImage ? (
                                  <img src={beforeImage} alt="Before" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-3 text-center">
                                    <Camera className="w-7 h-7 mb-1 text-rose-400/60" />
                                    <p className="text-[9px] leading-normal text-gray-450 font-semibold">
                                      {isEn ? 'Camera Standby. Capture rough state picture.' : 'بانتظار التقاط صورة توثيق عينات الخامات والموقع قبل العمل.'}
                                    </p>
                                  </div>
                                )}
                                {beforeImage && !cameraActiveBefore && (
                                  <div className="absolute bottom-2 right-2 bg-black/75 text-rose-400 font-mono text-[8px] p-1.5 rounded-lg text-right backdrop-blur-xs shadow-xs">
                                    <p>SHATTABHA BEFORE ✓</p>
                                    <p>VERIFIED COORD ORIGINAL</p>
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setCameraActiveBefore(true);
                                  setTimeout(() => {
                                    setBeforeImage(getStageMockImage(activeStage, 'before'));
                                    setCameraActiveBefore(false);
                                  }, 800);
                                }}
                                className="w-full bg-rose-50 hover:bg-rose-100/80 text-rose-800 py-1.5 rounded-xl text-[10.5px] font-extrabold transition-all flex items-center justify-center gap-1 hover:border-rose-200 border border-transparent cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5 text-rose-600" />
                                <span>{isEn ? 'Capture Before State' : 'التقاط صورة الوضع الأولي (قبل) 📸'}</span>
                              </button>
                            </div>

                            {/* After Column */}
                            <div className="space-y-2 text-right border-t border-gray-150 pt-3">
                              <span className="block text-[10px] font-black text-[#0F7453] flex items-center gap-1 justify-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {isEn ? 'Phase 2: After work / Final handoff' : 'المرحلة الثانية: صورة بند التشطيب بعد التنفيذ (التسليم النهائي):'}
                              </span>
                              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#0A0F12] relative border border-emerald-300/40 shadow-inner">
                                {cameraActiveAfter ? (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-2">
                                    <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
                                    <span className="text-[9px] font-bold text-emerald-400 font-mono tracking-widest">{isEn ? 'MOCKING AFTER...' : 'مسح الاستلام الهندسي واللمعان...'}</span>
                                  </div>
                                ) : afterImage ? (
                                  <img src={afterImage} alt="After" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-3 text-center">
                                    <Camera className="w-7 h-7 mb-1 text-emerald-400/60" />
                                    <p className="text-[9px] leading-normal text-gray-450 font-semibold">
                                      {isEn ? 'Camera Standby. Capture shiny work state.' : 'بانتظار التقاط صورة مطابقة التشطيبات الفاخرة بعد العمل.'}
                                    </p>
                                  </div>
                                )}
                                {afterImage && !cameraActiveAfter && (
                                  <div className="absolute bottom-2 right-2 bg-black/75 text-emerald-400 font-mono text-[8px] p-1.5 rounded-lg text-right backdrop-blur-xs shadow-xs">
                                    <p>SHATTABHA AFTER ✓</p>
                                    <p>ACCORDANCE CODE GUARANTEED</p>
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setCameraActiveAfter(true);
                                  setTimeout(() => {
                                    setAfterImage(getStageMockImage(activeStage, 'after'));
                                    setCameraActiveAfter(false);
                                  }, 800);
                                }}
                                className="w-full bg-emerald-50 hover:bg-emerald-100/80 text-[#0F7453] py-1.5 rounded-xl text-[10.5px] font-extrabold transition-all flex items-center justify-center gap-1 hover:border-emerald-250 border border-transparent cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{isEn ? 'Capture After State' : 'التقاط صورة جودة التشطيب (بعد) 📸'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Compare & Presentation Control Hub */}
                        <div className="bg-gradient-to-br from-indigo-950 to-[#1e293b] text-white rounded-3xl p-5 space-y-3.5 border border-indigo-500/10 shadow-lg text-right">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-black text-amber-400 flex items-center justify-start gap-1">
                              <span>🎬</span> {isEn ? 'Before/After Presentation & PDF Hub' : 'منظومة العرض التقديمي وتوليد تقارير PDF المعتمدة'}
                            </h4>
                            <p className="text-[10px] text-gray-300 leading-normal">
                              {isEn ? 'Deliver polished visual slides of the project change directly to the client dashboard or export certified PDF reports.' : 'ألق نظرة على تحول البند، انشر العروض بصفحة العميل مباشرة، أو قم بتوليد وطباعة ملفات PDF الهندسية المعتمدة.'}
                            </p>
                          </div>

                          <div className="space-y-2">
                            {/* Run stage presentation button */}
                            <button
                              type="button"
                              onClick={() => {
                                setPresentationSelectedStageId(activeStage.id);
                                setPresentationModeOpen(true);
                              }}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                            >
                              <span>🎭</span>
                              <span>{isEn ? 'Preview Current Stage Slide' : 'معاينة العرض التقديمي للبند (شرائح قبل/بعد)'}</span>
                            </button>

                            {/* Run overall project presentation button */}
                            <button
                              type="button"
                              onClick={() => {
                                setPresentationSelectedStageId('project-overall');
                                setPresentationModeOpen(true);
                              }}
                              className="w-full bg-slate-800 hover:bg-slate-750 text-amber-200 hover:text-white font-extrabold text-[11px] py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer shadow-xs active:scale-95"
                            >
                              <span>🌟</span>
                              <span>{isEn ? 'Preview Overall Project Timeline Deck' : 'معاينة المشروع كشلال شرائح مستمر'}</span>
                            </button>

                            {/* EXPORT DETAILED PDF REPORT BUTTON */}
                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => handleGeneratePDFReport(activeStage)}
                                className="bg-red-650 hover:bg-red-700 text-white font-black text-[10px] py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 border border-red-800/10 shadow-sm"
                              >
                                <span>📄</span>
                                <span className="truncate">{isEn ? 'PDF Current Stage' : 'تقرير البند الحالي PDF'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={handleGenerateAllPDFReports}
                                className="bg-slate-755 hover:bg-slate-700 border border-amber-500/30 text-amber-300 font-black text-[10px] py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                              >
                                <span>📚</span>
                                <span className="truncate">{isEn ? 'PDF All Stages' : 'ملف المشروع ككل PDF'}</span>
                              </button>
                            </div>

                            {/* EXPORT / PUBLISH SEND TO CLIENT WALL BUTTONS */}
                            <div className="border-t border-slate-700/60 pt-2 flex flex-col gap-1.5">
                              {/* Send active stage presentation to client */}
                              <button
                                type="button"
                                onClick={() => handlePublishPresentation(activeStage)}
                                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-[11px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-cyan-500/10 cursor-pointer active:scale-95"
                              >
                                <span>📨</span>
                                <span>{isEn ? 'Publish Stage Deck to Client' : 'إرسال ونشر عرض البند لصفحة العميل أحمد'}</span>
                              </button>

                              {/* Send ALL project presentations to client */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(isEn ? 'Publish presentations for all project stages?' : 'هل تريد نشر وإرسال عروض المقارنة قبل وبعد لكافة بنود ومراحل المشروع ككل شريحة شريحة إلى لوحة العميل؟')) {
                                    handlePublishAllPresentations();
                                  }
                                }}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                              >
                                <span>🚀</span>
                                <span>{isEn ? 'Publish All Stages to Client Dashboard' : 'نشر وإرسال كافة العروض التقديمية ككل'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Comparative Before/After Widget */}
                        <div className="grid grid-cols-2 gap-3 text-[10px] bg-gray-50 p-3 rounded-2xl border border-gray-150">
                          <div className="space-y-1">
                            <span className="text-rose-700 font-bold block">ملاحظات مظهر ما قبل العمل:</span>
                            <textarea 
                              value={notesBefore}
                              onChange={e => setNotesBefore(e.target.value)}
                              className="w-full p-2 text-[10px] border bg-white rounded-lg outline-none h-14"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-emerald-700 font-bold block">ملاحظات مظهر ما بعد العمل:</span>
                            <textarea 
                              value={notesAfter}
                              onChange={e => setNotesAfter(e.target.value)}
                              className="w-full p-2 text-[10px] border bg-white rounded-lg outline-none h-14"
                            />
                          </div>
                        </div>

                      </div>

                      {/* LEFT PART: TECHNICAL REPORT AND DECISION FORM (7 cols) */}
                      <div className="md:col-span-7 space-y-4">
                        
                        {/* Reports input */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-black text-gray-500">
                            🖋️ كتابة التقرير الهندسي والملاحظات الفنية للمرحلة:
                          </label>
                          <textarea
                            value={reportText}
                            onChange={e => setReportText(e.target.value)}
                            placeholder="اكتب التقرير الهندسي التفصيلي هنا (الخامات المستخدمة، السمك، نوعية العزل، المطابقة للكود). سيتم إرساله فوراً وحفظه بسند الإشراف الميداني في لوحة العميل والشركة."
                            className="w-full p-3 bg-[#F8FAF9] border border-gray-200 text-xs font-medium rounded-xl h-28 outline-none focus:bg-white focus:border-[#2B4D89] leading-relaxed"
                          />
                        </div>

                        {/* Rejection block displayed dynamically if they want to give notes */}
                        <div className="bg-red-50/50 p-4 rounded-2xl border border-red-150 space-y-2 text-xs">
                          <span className="text-red-700 font-bold flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span>صندوق تفاصيل الرفض الفني (في حال عدم المطابقة للمهندس):</span>
                          </span>
                          
                          <input 
                            type="text"
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            placeholder="اذكر بوضوح أسباب الرفض والملاحظات التي تجب معالجتها (مثال: تسريب بوعاء الضغط)"
                            className="w-full p-2.5 bg-white border border-red-200 mb-1 rounded-lg text-xs outline-none"
                          />
                          <p className="text-[10px] text-gray-400">
                            تعبئة هذا التقرير وتفاصيل الرفض يرسل إنذاراً للشركة لإيقاف المرحلة ومراجعتها دون استدراج العميل لخصومات وهمية.
                          </p>
                        </div>

                        {/* DECISION BTNS ACCORDING TO SYSTEM LOGIC: */}
                        <div className="bg-[#1C3E35]/10 p-4 border border-[#1C3E35]/15 rounded-2xl space-y-3">
                          <span className="text-xs font-bold text-[#2B4D89] block">القرار الفني الإنشائي النهائي:</span>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => handleReviewDecision('REJECTED')}
                              className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>[رفض] مع الملاحظات الفنية</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReviewDecision('APPROVED')}
                              className="bg-[#0F7453] hover:bg-[#30445E] text-white py-3 px-4 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                              <span>[قبول واعتماد الاستلام الميداني]</span>
                            </button>
                          </div>

                          <div className="text-[9px] text-[#0F7453] font-bold text-center mt-1 flex items-center justify-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>الاعتماد والقبول يفتح تلقائياً خيار "اعتماد الدفعة المالية للشركة" في لوحة العميل أحمد.</span>
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                ) : (
                  <p className="p-8 text-center text-gray-400 bg-white rounded-3xl">يرجى اختيار بند من مراحل التشطيب للمعالجة.</p>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border text-gray-400">
                <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <h4 className="font-extrabold text-[#2B4D89] text-sm mb-1">لا توجد مشاريع مسندة حالياً</h4>
                <p className="text-[11px] max-w-sm mx-auto">
                  حسابك لا يحتوي على مشاريع نشطة. يقوم الأدمن حالياً بتوزيع المشاريع المناسبة جغرافياً عليك.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Fullscreen Interactive Presentation Slide-deck Modal */}
      {presentationModeOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-50 flex flex-col justify-between p-4 sm:p-8 text-right animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 max-w-7xl mx-auto w-full">
            <button
              type="button"
              onClick={() => {
                setPresentationModeOpen(false);
              }}
              className="bg-slate-900 border border-slate-800 text-gray-300 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>✕</span>
              <span>{isEn ? 'Close Presentation' : 'إنهاء العرض التقديمي (خروج)'}</span>
            </button>

            <div className="text-right">
              <span className="text-[9px] text-amber-500 font-extrabold tracking-widest block font-sans">
                SHATTABHA INTEGRATED DECK SYSTEM
              </span>
              <h2 className="font-extrabold text-sm sm:text-base text-white">
                {isEn ? 'Before & After Master Presentation Deck' : 'العرض التقديمي للتغطية الشاملة ومعاينة "قبل وبعد" 🎞️'}
              </h2>
            </div>
          </div>

          {/* Main Slide Viewer */}
          <div className="max-w-5xl mx-auto w-full my-auto py-6 grid grid-cols-1 gap-6">
            {(() => {
              // Determine the slide list
              const activeDeckStages = presentationSelectedStageId === 'project-overall' 
                ? projectStages 
                : projectStages.filter(s => s.id === presentationSelectedStageId);

              if (activeDeckStages.length === 0) {
                return (
                  <div className="text-center text-gray-400 py-12">
                    <p>{isEn ? 'No slides available for this view.' : 'لا توجد شرائح متوفرة لهذه المعاينة حالياً.'}</p>
                  </div>
                );
              }

              // Bound slide index safely
              const currentSlidePart = Math.min(Math.max(0, slideIndex), activeDeckStages.length - 1);
              const stg = activeDeckStages[currentSlidePart];

              const bImg = stg.beforeImages?.[0] || getStageMockImage(stg, 'before');
              const aImg = stg.afterImages?.[0] || getStageMockImage(stg, 'after');

              return (
                <div className="space-y-6">
                  {/* Slide Title and Info */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-4 rounded-3xl border border-slate-800/80">
                    {/* Navigation arrows */}
                    {presentationSelectedStageId === 'project-overall' && activeDeckStages.length > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={currentSlidePart === activeDeckStages.length - 1}
                          onClick={() => setSlideIndex(prev => Math.min(activeDeckStages.length - 1, prev + 1))}
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
                          onClick={() => setSlideIndex(prev => Math.max(0, prev - 1))}
                          className="bg-slate-800 text-white disabled:opacity-40 px-3 py-1.5 text-xs font-black rounded-xl hover:bg-slate-700 cursor-pointer"
                        >
                          {isEn ? 'Next Stage →' : 'المرحلة التالية →'}
                        </button>
                      </div>
                    )}

                    <div className="text-right sm:ml-auto">
                      <span className="text-[10px] bg-indigo-500/25 text-indigo-300 font-bold px-3 py-1 rounded-full border border-indigo-500/10">
                        {stg.name}
                      </span>
                      <h3 className="font-extrabold text-white text-base mt-1.5">
                        {stg.name} — {isEn ? 'Transformation View' : 'عرض تحولات وجودة مواد التأسيس'}
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {stg.reportText || (isEn ? 'Inspection completed successfully matching technical criteria.' : 'تم تسليم البند تحت إشراف هندسي ومطابق للمواصفات الفنية تماماً.')}
                      </p>
                    </div>
                  </div>

                  {/* Photos Grid Before vs After side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* BEFORE SLIDE */}
                    <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-black text-rose-500 flex items-center gap-1">
                          <span className="w-2 h-2 rounded bg-rose-500"></span>
                          {isEn ? 'BEFORE FINISHING' : 'قبل بدء التنفيذ والتشطيب البصري (كود الهيكل)'}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {stg.rejectedNotes || notesBefore}
                        </p>
                      </div>
                      <div className="aspect-[4/3] rounded-2xl bg-black overflow-hidden relative border border-slate-800">
                        <img src={bImg} alt="Before" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" referrerPolicy="no-referrer" />
                        <div className="absolute top-3 left-3 bg-rose-950/80 text-rose-300 text-[9px] font-black px-2.5 py-1 rounded-full border border-rose-500/20 backdrop-blur-xs">
                          {isEn ? 'Rough/Draft' : 'الحالة الأولية 🧱'}
                        </div>
                      </div>
                    </div>

                    {/* AFTER SLIDE */}
                    <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded bg-emerald-400"></span>
                          {isEn ? 'AFTER FINISHING' : 'بعد التشطيب النهائي واستلام مشرف شطبها'}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {stg.reportText || notesAfter}
                        </p>
                      </div>
                      <div className="aspect-[4/3] rounded-2xl bg-black overflow-hidden relative border border-slate-800">
                        <img src={aImg} alt="After" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" referrerPolicy="no-referrer" />
                        <div className="absolute top-3 left-3 bg-emerald-950/80 text-emerald-300 text-[9px] font-black px-2.5 py-1 rounded-full border border-emerald-500/20 backdrop-blur-xs">
                          {isEn ? 'Verified Done' : 'النتيجة الفاخرة المعتمدة ✨'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions inside Modal */}
                  <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-5 mt-4">
                    <span className="text-[10px] text-slate-500 font-bold max-w-sm">
                      💡 {isEn ? 'Showcase this deck during meetings or publish it instantly.' : 'يتيح لك العرض إيضاح فروق المواد واللمسة الهندسية المعتمدة لحسم جدارة الاستلام.'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePublishPresentation(stg)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer shadow-md"
                      >
                        {isEn ? 'Share with Client' : '📨 نشر هذه الشريحة لصفحة العميل'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPresentationModeOpen(false);
                        }}
                        className="bg-slate-800 hover:bg-slate-750 text-gray-300 font-extrabold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer"
                      >
                        {isEn ? 'Close Deck' : 'رجوع'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Footer copyright tagline */}
          <div className="text-center font-mono text-[8px] text-slate-600 max-w-7xl mx-auto w-full pt-4 border-t border-slate-800">
            SHATTABHA DESIGN & ENGINEERING CONTROL SUITE — PATENT PENDING © 2026
          </div>
        </div>
      )}
    </div>
  );
};
