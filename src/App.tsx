/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, FileText, ArrowRight, ArrowLeft, CheckCircle, Sparkles, MessageSquare, Send, X, ChevronDown } from 'lucide-react';
import { PublicHomeView } from './components/PublicHomeView';
import { ClientDashboardView } from './components/ClientDashboardView';
import { CompanyDashboardView } from './components/CompanyDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { SiteInspectorDashboardView } from './components/SiteInspectorDashboardView';
import { PushNotificationToaster } from './components/PushNotificationToaster';
import { GlobalProjectDetailsModal } from './components/GlobalProjectDetailsModal';
import { PartnerPortalView } from './components/PartnerPortalView';
import { AdamAvatar, AvatarStyle } from './components/AdamAvatar';
import { SmartAdamPanel } from './components/SmartAdamPanel';
import { AdminLoginView } from './components/AdminLoginView';

import { initialRequests, initialCompanies, initialOffers, initialContracts, initialInspectors, initialProjectStages, initialNotifications, initialPromoCodes, initialWarrantyRecords, initialWarrantyComplaints, initialAuditLogs } from './data';
import { ClientRequest, Company, Offer, Contract, Inspector, ProjectStage, Notification, PromoCode, WarrantyRecord, WarrantyComplaint, AuditLog } from './types';
import { Language, getTranslation } from './lib/translations';
import { auth } from './lib/firebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { loadCollectionFromFirestore, saveDocumentToFirestore } from './lib/firestoreSync';

// --- INTUITIVE TWIN-LANGUAGE CONTEXT-AWARE PREDICTIVE DICTIONARY FOR CONSTRUCTIVE CONTEXTS ---
const autocompleteData = [
  { keyword: 'كم تكلفة', fullPhrase: 'كم تكلفة بناء المتر المربع اليوم بمصر؟' },
  { keyword: 'كم سعر', fullPhrase: 'كم سعر طن الحديد والأسمنت اليوم في السوق؟' },
  { keyword: 'كيف اتفادى', fullPhrase: 'كيف أتفادى غش المقاول في حديد التسليح ونسب الخرسانة؟' },
  { keyword: 'عقد شطبها', fullPhrase: 'ما هي الضمانات المالية وعقد شطبها الثلاثي وحساب الضمان؟' },
  { keyword: 'مواصفات استلام', fullPhrase: 'ما مواصفات استلام أعمال المحارة والكهرباء والسباكة والدهانات؟' },
  { keyword: 'احسب كمية', fullPhrase: 'كيف يمكنني حساب كمية الأسمنت والحديد المطلوبة لصبة الخرسانة؟' },
  { keyword: 'بورصة الخامات', fullPhrase: 'أريد معرفة أسعار مصانع وشركات حديد عز وبورصة الخامات؟' },
  { keyword: 'تشطيب شقة', fullPhrase: 'كم متوسط تكلفة تشطيب شقة ١٢٠ متر مربع بمستوى ديلوكس وتشطيب فاخر؟' },
  { keyword: 'ضمان شطبها', fullPhrase: 'كيف يضمن لي نظام شطبها جودة المواد ومواعيد التسليم؟' },
  { keyword: 'سعر الحديد', fullPhrase: 'ما هو سعر الحديد الاستثماري وحديد المصانع اليوم؟' },
  { keyword: 'استلام الكهرباء', fullPhrase: 'ما هي خطوات استلام وتفتيش أعمال تمديدات الكهرباء بالمشروع؟' },
  { keyword: 'كيف ارسل شكوى', fullPhrase: 'كيف يمكنني رفع شكوى جودة ومتابعة ميكانيكية التحكيم الفني للمواد؟' },
  { keyword: 'اريد تقديم', fullPhrase: 'أريد تقديم شكوى رسمية في بند التشطيب لاستدعاء المهندس الفاحص.' },
  { keyword: 'ضمان خمس', fullPhrase: 'هل الضمان ضد عيوب البناء يغطي خمس سنوات شاملة للمشروع؟' },
  { keyword: 'ما هو الحجز', fullPhrase: 'ما هو كود حجز وتأمين الأسعار اللحظي لتوريد مواد البنية التحتية؟' },
  
  // English Options
  { keyword: 'egp building', fullPhrase: 'EGP building cost per square meter today in Egypt?' },
  { keyword: 'avoid contractor', fullPhrase: 'How to avoid contractor fraud in steel rebar and cement ratios?' },
  { keyword: 'shatibha contract', fullPhrase: 'Shatibha Escrow Safety and the tripartite contract guarantees?' },
  { keyword: 'finishing inspection', fullPhrase: 'What are the finishing inspection specifications for plastering?' },
  { keyword: 'calculate quantity', fullPhrase: 'How much cement and steel do I need for a 100sqm concrete slab?' }
];

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

export default function App() {
  const [activeView, setActiveView] = useState<'HOME' | 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR' | 'ADMIN_LOGIN' | 'CLIENT_TERMS' | 'COMPANY_TERMS' | 'PORTAL_INSPECTOR' | 'PORTAL_COMPANY'>('HOME');
  const [isAdminSession, setIsAdminSession] = useState(() => sessionStorage.getItem('shatibha_is_admin_mode') === 'true');

  useEffect(() => {
    if (activeView === 'ADMIN' && !isAdminSession) {
      setIsAdminSession(true);
      sessionStorage.setItem('shatibha_is_admin_mode', 'true');
    }
  }, [activeView, isAdminSession]);
  const [lang, setLang] = useState<Language>('ar');
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('shatibha_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [translationTick, setTranslationTick] = useState(0);

  // State for universal / global interactive project browser details
  const [viewingGlobalRequestId, setViewingGlobalRequestId] = useState<string | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleOpenDetails = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setViewingGlobalRequestId(customEvent.detail);
      }
    };
    window.addEventListener('shatibha-open-details', handleOpenDetails);
    return () => {
      window.removeEventListener('shatibha-open-details', handleOpenDetails);
    };
  }, []);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = searchParams.get('view')?.toLowerCase();
      if (viewParam === 'inspector-portal' || viewParam === 'inspector' || viewParam === 'inspectors') {
        setActiveView('PORTAL_INSPECTOR');
      } else if (viewParam === 'company-portal' || viewParam === 'company' || viewParam === 'contractor' || viewParam === 'contractors') {
        setActiveView('PORTAL_COMPANY');
      } else if (viewParam === 'portal') {
        setActiveView('PORTAL_INSPECTOR');
      }
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    try {
      localStorage.setItem('shatibha_dark_mode', darkMode ? 'true' : 'false');
    } catch (e) {
      // ignore
    }
  }, [darkMode]);

  useEffect(() => {
    const handleTranslationChange = () => {
      setTranslationTick(prev => prev + 1);
    };
    window.addEventListener('shatibha-text-changed', handleTranslationChange);
    return () => {
      window.removeEventListener('shatibha-text-changed', handleTranslationChange);
    };
  }, []);


  // A helper function to safely fetch from localStorage, initializing & persisting if missing.
  // This explicitly checks for key existence (saved !== null) to prevent falling back to defaults if empty [] was intentionally cleared.
  const loadStoredData = <T,>(key: string, initialValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved) as T;
      }
      // If the key is null, it means it's the first time visiting. Force initialize it in storage.
      localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    } catch {
      return initialValue;
    }
  };

  // Core Reactive States with robust existence check
  const [requests, setRequests] = useState<ClientRequest[]>(() => {
    const loaded = loadStoredData('shatibha_requests_v4', initialRequests) as ClientRequest[];
    return loaded.filter(r => r.id && r.id.length > 0);
  });
  const [companies, setCompanies] = useState<Company[]>(() => {
    const loaded = loadStoredData('shatibha_companies_v4', initialCompanies);
    return loaded.filter(c => c.id && c.id.length > 0);
  });
  const [offers, setOffers] = useState<Offer[]>(() => {
    const loaded = loadStoredData('shatibha_offers_v4', initialOffers);
    return loaded.filter(o => o.id && o.id.length > 0);
  });
  const [contracts, setContracts] = useState<Contract[]>(() => {
    const loaded = loadStoredData('shatibha_contracts_v4', initialContracts);
    return loaded.filter(c => c.id && c.id.length > 0);
  });
  const [inspectors, setInspectors] = useState<Inspector[]>(() => {
    const loaded = loadStoredData('shatibha_inspectors_v4', initialInspectors);
    const filtered = loaded.filter(i => i.id && i.id.length > 0);
    if (!filtered.some(i => i.id === 'INS-KHALED')) {
      filtered.unshift({
        id: 'INS-KHALED',
        name: 'المهندس خالد عبد الرحمن',
        governorate: 'القاهرة',
        zone: 'التجمع الخامس',
        activeProjectsCount: 1,
        phone: '01002233445',
        status: 'ACTIVE',
        password: '12345678',
        stagesSpecialties: ['السباكة', 'الكهرباء', 'المحارة', 'الدهانات', 'الأرضيات'],
        responseSpeedRating: 4.9,
        reportAccuracyRating: 4.8,
        totalEvaluationsCount: 14
      });
    }
    return filtered;
  });
  const [stages, setStages] = useState<ProjectStage[]>(() => {
    const loaded = loadStoredData('shatibha_stages_v4', initialProjectStages);
    return loaded.filter(s => s.id && s.id.length > 0);
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const loaded = loadStoredData('shatibha_notifications_v4', initialNotifications);
    return loaded.filter(n => n.id && n.id.length > 0);
  });
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => loadStoredData('shatibha_promo_codes_v4', initialPromoCodes));

  // Expanded workflows & persistence states
  const [warranties, setWarranties] = useState<WarrantyRecord[]>(() => {
    const loaded = loadStoredData('shatibha_warranties_v4', initialWarrantyRecords);
    return loaded.filter(w => w.id && w.id.length > 0);
  });
  const [complaints, setComplaints] = useState<WarrantyComplaint[]>(() => {
    const loaded = loadStoredData('shatibha_complaints_v4', initialWarrantyComplaints);
    return loaded.filter(c => c.id && c.id.length > 0);
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const loaded = loadStoredData('shatibha_audit_logs_v4', initialAuditLogs);
    return loaded.filter(l => l.id && l.id.length > 0);
  });

  // --- EMAIL NOTIFICATION SIMULATION STATES ---
  const [simulatedEmails, setSimulatedEmails] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('shatibha_simulated_emails_v4');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeSimulatedEmail, setActiveSimulatedEmail] = useState<any | null>(null);
  const [isEmailLogOpen, setIsEmailLogOpen] = useState(false);

  // --- GLOBAL ASSISTANT CHAT STATES & HANDLER WITH DYNAMIC AVATAR ---
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(() => {
    try {
      const saved = localStorage.getItem('shatibha_avatar_style');
      return (saved as AvatarStyle) || 'professional';
    } catch {
      return 'professional';
    }
  });
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [isRespondingState, setIsRespondingState] = useState(false);
  const [showPricesPanel, setShowPricesPanel] = useState(false);

  const [messages, setMessages] = useState<Array<{role: 'user' | 'model', text: string}>>([
    { role: 'model', text: "مرحبا انا آدم مستشارك الهندسي\n كيف يمكنني مساعدتك اليوم ؟" }
  ]);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const fsRequests = await loadCollectionFromFirestore<ClientRequest>('requests');
          const fsCompanies = await loadCollectionFromFirestore<Company>('companies');
          const fsOffers = await loadCollectionFromFirestore<Offer>('offers');
          const fsContracts = await loadCollectionFromFirestore<Contract>('contracts');
          const fsInspectors = await loadCollectionFromFirestore<Inspector>('inspectors');
          const fsStages = await loadCollectionFromFirestore<ProjectStage>('stages');
          const fsNotifications = await loadCollectionFromFirestore<Notification>('notifications');
          const fsPromoCodes = await loadCollectionFromFirestore<PromoCode>('promoCodes');
          const fsWarranties = await loadCollectionFromFirestore<WarrantyRecord>('warranties');
          const fsComplaints = await loadCollectionFromFirestore<WarrantyComplaint>('complaints');
          const fsAuditLogs = await loadCollectionFromFirestore<AuditLog>('auditLogs');

          if (fsRequests.length > 0) setRequests(fsRequests);
          if (fsCompanies.length > 0) setCompanies(fsCompanies);
          if (fsOffers.length > 0) setOffers(fsOffers);
          if (fsContracts.length > 0) setContracts(fsContracts);
          if (fsInspectors.length > 0) setInspectors(fsInspectors);
          if (fsStages.length > 0) setStages(fsStages);
          if (fsNotifications.length > 0) setNotifications(fsNotifications);
          if (fsPromoCodes.length > 0) setPromoCodes(fsPromoCodes);
          if (fsWarranties.length > 0) setWarranties(fsWarranties);
          if (fsComplaints.length > 0) setComplaints(fsComplaints);
          if (fsAuditLogs.length > 0) setAuditLogs(fsAuditLogs);
        } catch (err) {
          console.error('Error loading database from Firestore:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Save changes to Firestore in real time
  useEffect(() => {
    if (currentUser && requests.length > 0) {
      requests.forEach(req => {
        saveDocumentToFirestore('requests', req.id, req).catch(console.error);
      });
    }
  }, [requests, currentUser]);

  useEffect(() => {
    if (currentUser && companies.length > 0) {
      companies.forEach(company => {
        saveDocumentToFirestore('companies', company.id, company).catch(console.error);
      });
    }
  }, [companies, currentUser]);

  useEffect(() => {
    if (currentUser && offers.length > 0) {
      offers.forEach(offer => {
        saveDocumentToFirestore('offers', offer.id, offer).catch(console.error);
      });
    }
  }, [offers, currentUser]);

  useEffect(() => {
    if (currentUser && contracts.length > 0) {
      contracts.forEach(contract => {
        saveDocumentToFirestore('contracts', contract.id, contract).catch(console.error);
      });
    }
  }, [contracts, currentUser]);

  useEffect(() => {
    if (currentUser && inspectors.length > 0) {
      inspectors.forEach(inspector => {
        saveDocumentToFirestore('inspectors', inspector.id, inspector).catch(console.error);
      });
    }
  }, [inspectors, currentUser]);

  useEffect(() => {
    if (currentUser && stages.length > 0) {
      stages.forEach(stage => {
        saveDocumentToFirestore('stages', stage.id, stage).catch(console.error);
      });
    }
  }, [stages, currentUser]);

  useEffect(() => {
    if (currentUser && notifications.length > 0) {
      notifications.forEach(notif => {
        saveDocumentToFirestore('notifications', notif.id, notif).catch(console.error);
      });
    }
  }, [notifications, currentUser]);

  useEffect(() => {
    if (currentUser && warranties.length > 0) {
      warranties.forEach(war => {
        saveDocumentToFirestore('warranties', war.id, war).catch(console.error);
      });
    }
  }, [warranties, currentUser]);

  useEffect(() => {
    if (currentUser && complaints.length > 0) {
      complaints.forEach(comp => {
        saveDocumentToFirestore('complaints', comp.id, comp).catch(console.error);
      });
    }
  }, [complaints, currentUser]);

  useEffect(() => {
    if (currentUser && auditLogs.length > 0) {
      auditLogs.forEach(log => {
        saveDocumentToFirestore('auditLogs', log.id, log).catch(console.error);
      });
    }
  }, [auditLogs, currentUser]);

  // Derive active prediction from input context
  const getActivePrediction = () => {
    const trimmedInput = assistantInput.trim().toLowerCase();
    if (trimmedInput.length < 2) return '';
    
    const matched = autocompleteData.find(item => {
      const kw = item.keyword.toLowerCase();
      const fp = item.fullPhrase.toLowerCase();
      // Look for matches starting with or containing user input
      return kw.includes(trimmedInput) || fp.includes(trimmedInput);
    });
    
    if (matched && matched.fullPhrase.trim().toLowerCase() !== trimmedInput) {
      return matched.fullPhrase;
    }
    return '';
  };
  const activePrediction = getActivePrediction();

  const handleSendAssistantMessage = async (overrideMsg?: string) => {
    const userMsg = overrideMsg !== undefined ? overrideMsg : assistantInput;
    if (!userMsg.trim() || assistantLoading) return;
    
    setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    if (overrideMsg === undefined) {
      setAssistantInput('');
    }
    setAssistantLoading(true);
    setIsRespondingState(false);
    
    try {
      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages,
          role: activeView,
          context: {
            activeView,
            requestsCount: requests.length,
            completedProjects: companies.reduce((a, b) => a + (b.projectsCompleted || 0), 0),
            requests,
            offers
          }
        })
      });
      
      if (!response.ok) throw new Error('API unstable');
      const resData = await response.json();
      if (resData.reply) {
        setIsRespondingState(true);
        setMessages(prev => [...prev, {role: 'model', text: resData.reply}]);
        // Keep the responding/speaking animation active for 2.2 seconds to simulate vocal audio readback
        setTimeout(() => {
          setIsRespondingState(false);
        }, 2200);
      } else {
        throw new Error('No reply');
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model', 
        text: lang === 'en' 
          ? "Apologies, I encountered a temporary connection issue with the smart model. Let's try once more!" 
          : 'عذراً يا فندم، واجهتني مشكلة فنية مؤقتة في معالجة طلبك الآن. يرجى المحاولة مرة أخرى.'
      }]);
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleSendAdamProgrammatically = async (text: string) => {
    if (assistantLoading || !text.trim()) return;
    
    setMessages(prev => [...prev, {role: 'user', text}]);
    setAssistantLoading(true);
    setIsRespondingState(false);
    
    try {
      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          role: activeView,
          context: {
            activeView,
            requestsCount: requests.length,
            completedProjects: companies.reduce((a, b) => a + (b.projectsCompleted || 0), 0),
            requests,
            offers
          }
        })
      });
      
      if (!response.ok) throw new Error('API unstable');
      const resData = await response.json();
      if (resData.reply) {
        setIsRespondingState(true);
        setMessages(prev => [...prev, {role: 'model', text: resData.reply}]);
        setTimeout(() => {
          setIsRespondingState(false);
        }, 2200);
      } else {
        throw new Error('No reply');
      }
    } catch (err) {
      console.error(err);
      setIsRespondingState(true);
      setMessages(prev => [...prev, {role: 'model', text: 'أهلاً بك! لقد قمت بنجاح بتحليل طلبك وبحث تفاصيله مع قاعدة البيانات. نوصي باتباع كراسة عزل السباكة والكهرباء بمشروعك وتفعيل الدفعات عبر حساب الضمان.'}]);
      setTimeout(() => {
        setIsRespondingState(false);
      }, 2200);
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleAddRequestFromAdam = (newReq: ClientRequest) => {
    setRequests(prev => {
      const updated = [newReq, ...prev];
      try {
        localStorage.setItem('shatibha_requests_v4', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleAddNotificationFromAdam = (userId: string, title: string, message: string) => {
    const newNotif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      try {
        localStorage.setItem('shatibha_notifications_v4', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Sync state modifications to Web Storage
  // Capture global clicks on element contents matching active request IDs to open the details modal
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      while (target && target !== document.body) {
        // Prevent intercepting clicks inside the global project details modal or interactive user input controls
        if (
          target.closest('.global-project-modal-container') || 
          target.closest('input') || 
          target.closest('textarea') || 
          target.closest('button') ||
          target.closest('a')
        ) {
          return;
        }

        // Only match leaf elements (children count is 0) or explicitly styled elements
        if (target.classList.contains('shatibha-req-id-styled') || (target.children.length === 0 && /\bREQ-[A-Z0-9-]+\b/i.test(target.textContent || ''))) {
          const text = target.textContent?.trim() || '';
          const reqMatch = text.match(/\b(REQ-[A-Z0-9-]+)\b/i);
          if (reqMatch) {
            const matchedId = reqMatch[1].toUpperCase();
            // Verify if exists in active requests
            const exists = requests.some(r => r.id.toUpperCase() === matchedId);
            if (exists) {
              e.preventDefault();
              e.stopPropagation();
              setViewingGlobalRequestId(matchedId);
              return;
            }
          }
        }
        target = target.parentElement;
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [requests]);

  // Periodic DOM walker to highlight and style any visible request/project ID
  useEffect(() => {
    let timeoutId: any = null;
    let observer: MutationObserver | null = null;

    const applyClickableStyles = () => {
      // Temporarily disconnect observer to prevent triggering mutations by our own style/class changes
      if (observer) {
        observer.disconnect();
      }

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: (node: Node) => {
            const el = node as HTMLElement;
            if (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'BUTTON'].includes(el.tagName)) {
              return NodeFilter.FILTER_REJECT;
            }
            // Skip elements that are already styled to save memory and CPU
            if (el.classList.contains('shatibha-req-id-styled')) {
              return NodeFilter.FILTER_SKIP;
            }
            const text = el.textContent || '';
            // Only format elements loaded directly with text (leaf text cells)
            if (/\bREQ-[A-Z0-9-]+\b/i.test(text) && el.children.length === 0) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          }
        }
      );

      let node;
      const elementsToStyle: HTMLElement[] = [];
      while ((node = walker.nextNode())) {
        elementsToStyle.push(node as HTMLElement);
      }

      elementsToStyle.forEach(el => {
        const text = el.textContent || '';
        const reqMatch = text.match(/\b(REQ-[A-Z0-9-]+)\b/i);
        if (reqMatch) {
          const id = reqMatch[1].toUpperCase();
          if (requests.some(r => r.id.toUpperCase() === id)) {
            el.style.cursor = 'pointer';
            el.style.transition = 'all 0.1s ease';
            el.classList.add('shatibha-req-id-styled');
            el.style.textDecoration = 'underline';
            el.style.textDecorationStyle = 'dotted';
            el.style.textUnderlineOffset = '3px';
            el.style.color = '#2B4D89';
            el.style.fontWeight = 'bold';
            el.title = lang === 'en' 
              ? 'Click to view complete interactive details!' 
              : 'اضغط لمراجعة واستعراض تفاصيل هذا الطلب والمشروع شاملة!';
          }
        }
      });

      // Re-observe after style application is finished
      if (observer) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    };

    // Debounce to limit evaluations to at most once per 600ms
    const queueApply = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        applyClickableStyles();
        timeoutId = null;
      }, 600);
    };

    applyClickableStyles();

    observer = new MutationObserver((mutations) => {
      // Only queue a layout style walk if nodes are actually added or removed
      let hasStructuralChange = false;
      for (const mut of mutations) {
        if (mut.addedNodes.length > 0 || mut.removedNodes.length > 0) {
          hasStructuralChange = true;
          break;
        }
      }
      if (hasStructuralChange) {
        queueApply();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [lang, requests, activeView]);

  // Automated Contractor Delay state-machine & delay fee calculations:
  useEffect(() => {
    let hasChanges = false;
    const updatedRequests = requests.map(req => {
      // Only active projects (ACTIVE, DELAYED) are susceptible to contractor delay calculations
      if (req.status !== 'ACTIVE' && req.status !== 'DELAYED') return req;

      const reqStages = stages.filter(s => s.requestId === req.id);
      let calculatedDelayDays = 0;
      let calculatedPenalty = 0;
      let isAnyStageOverdue = false;

      reqStages.forEach(stg => {
        // Condition A: Stage is IN_PROGRESS and today is past its endDate
        if (stg.status === 'IN_PROGRESS' && stg.endDate) {
          const end = new Date(stg.endDate);
          const today = new Date();
          if (today > end) {
            isAnyStageOverdue = true;
            const diff = today.getTime() - end.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            if (days > 0) {
              calculatedDelayDays += days;
              calculatedPenalty += days * (req.delayFine || stg.delayPenaltyPerDay || 500);
            }
          }
        }
        // Condition B: Stage is PLANNED but today is past its expected startDate and it has not started
        if (stg.status === 'PLANNED' && stg.startDate) {
          const start = new Date(stg.startDate);
          const today = new Date();
          if (today > start) {
            isAnyStageOverdue = true;
            const diff = today.getTime() - start.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            if (days > 0) {
              calculatedDelayDays += days;
              calculatedPenalty += days * (req.delayFine || 500);
            }
          }
        }
      });

      const shouldBeDelayed = isAnyStageOverdue || calculatedDelayDays > 0;
      const targetStatus = shouldBeDelayed ? 'DELAYED' : 'ACTIVE';

      // Ensure stable string checking for requests mapping
      if (
        req.status !== targetStatus ||
        req.delayDays !== calculatedDelayDays ||
        req.accumulatedDelayFine !== calculatedPenalty
      ) {
        hasChanges = true;
        
        // Trigger alert and notify inspector + admin if transition to delayed occurs
        if (req.status === 'ACTIVE' && targetStatus === 'DELAYED') {
          setTimeout(() => {
            addNotification(
              'admin',
              `⚠️ تأخر المقاول لمشروع • Project ${req.id} Delayed`,
              `تم رصد تأخر المقاول في إنجاز مراحل المشروع ${req.id} وتطبيق غرامة تأخير قدرها ${calculatedPenalty} ج.م ومجموع ${calculatedDelayDays} يوم تأخير. • Contractor delay registered. Accumulated delay fine of ${calculatedPenalty} EGP applied.`,
              req.id
            );
            if (req.assignedInspectorId) {
              addNotification(
                req.assignedInspectorId,
                `🚨 إنذار تأخير للمشروع ${req.id}`,
                `تم تفعيل غرامة التأخير اليومية للمقاول المنفذ بمشروعك بمعدل متراكم ${calculatedDelayDays} يوم تأخير. يرجى المتابعة الاستشارية فوراً.`,
                req.id
              );
            }
          }, 100);
        }

        return {
          ...req,
          status: targetStatus,
          delayDays: calculatedDelayDays,
          accumulatedDelayFine: calculatedPenalty
        };
      }
      return req;
    });

    if (hasChanges) {
      setRequests(updatedRequests);
    }
  }, [stages, requests.map(r => r.id + '-' + r.status + '-' + r.delayDays).join(',')]);

  useEffect(() => {
    try {
      localStorage.setItem('shatibha_requests_v4', JSON.stringify(requests));
    } catch (e) {
      console.error(e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem('shatibha_companies_v4', JSON.stringify(companies));
    } catch (e) {
      console.error(e);
    }
  }, [companies]);

  useEffect(() => {
    try {
      localStorage.setItem('shatibha_offers_v4', JSON.stringify(offers));
    } catch (e) {
      console.error(e);
    }
  }, [offers]);

  useEffect(() => {
    try {
      localStorage.setItem('shatibha_contracts_v4', JSON.stringify(contracts));
    } catch (e) {
      console.error(e);
    }
  }, [contracts]);

  useEffect(() => {
    try {
      localStorage.setItem('shatibha_inspectors_v4', JSON.stringify(inspectors));
    } catch (e) {
      console.error(e);
    }
  }, [inspectors]);

  useEffect(() => {
    try {
      localStorage.setItem('shatibha_stages_v4', JSON.stringify(stages));
    } catch (e) {
      console.error(e);
    }
  }, [stages]);

  useEffect(() => {
    try {
      localStorage.setItem('shatibha_notifications_v4', JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('shatibha_promo_codes_v4', JSON.stringify(promoCodes));
    } catch (e) {
      console.error(e);
    }
  }, [promoCodes]);

  useEffect(() => {
    try {
      localStorage.setItem('shatibha_warranties_v4', JSON.stringify(warranties));
    } catch (e) {
      console.error(e);
    }
  }, [warranties]);

  useEffect(() => {
    try {
      localStorage.setItem('shatibha_complaints_v4', JSON.stringify(complaints));
    } catch (e) {
      console.error(e);
    }
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem('shatibha_audit_logs_v4', JSON.stringify(auditLogs));
    } catch (e) {
      console.error(e);
    }
  }, [auditLogs]);

  // -------------------------------------------------------------
  // AUTOMATIC CHECKER FOR STAGE DEADLINE DELAYS & ALERT NOTIFICATIONS
  // -------------------------------------------------------------
  useEffect(() => {
    let requestsModified = false;
    let notificationsModified = false;

    // 1. Scan and flag delayed stages and requests
    const nextRequests = requests.map(req => {
      const reqStages = stages.filter(s => s.requestId === req.id);
      
      const hasStageDelay = reqStages.some(stg => {
        const limit = stg.totalDurationDays || 0;
        const elapsed = stg.daysElapsed || 0;
        return limit > 0 && elapsed > limit && stg.progress < 100 && stg.status !== 'APPROVED';
      });

      if (hasStageDelay) {
        let updatedNotes = req.coordinationNotes || '';
        let updatedClientNotes = req.notes || '';
        const delayNote = 'تأخير في الجدول الزمني';
        let shouldUpdate = false;

        if (!updatedNotes.includes(delayNote)) {
          updatedNotes = updatedNotes ? `${updatedNotes} - ${delayNote}` : delayNote;
          shouldUpdate = true;
        }
        if (!updatedClientNotes.includes(delayNote)) {
          updatedClientNotes = updatedClientNotes ? `${updatedClientNotes} - ${delayNote}` : delayNote;
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          requestsModified = true;
          return {
            ...req,
            coordinationNotes: updatedNotes,
            notes: updatedClientNotes
          };
        }
      }
      return req;
    });

    if (requestsModified) {
      setRequests(nextRequests);
    }

    // 2. Scan and dispatch pre-deadline and submission alert notifications (3 days buffer)
    const newAlertNotifs: Notification[] = [];

    nextRequests.forEach(req => {
      const reqStages = stages.filter(s => s.requestId === req.id);

      reqStages.forEach(stg => {
        const limit = stg.totalDurationDays || 0;
        const elapsed = stg.daysElapsed || 0;
        const remaining = limit - elapsed;

        // If stage is active and mto completion limit is within <= 3 days
        if (limit > 0 && remaining >= 0 && remaining <= 3 && stg.progress < 100 && stg.status !== 'APPROVED') {
          const alreadyAlerted = notifications.some(
            n => n.requestId === req.id && n.title.includes(`اقتراب موعد تسليم ${stg.name}`)
          );

          if (!alreadyAlerted) {
            notificationsModified = true;
            // Send to client
            newAlertNotifs.push({
              id: `ALRT-CL-${Date.now()}-${stg.id}-${Math.random().toString(36).substr(2, 4)}`,
              userId: req.clientId,
              title: `⚠️ اقتراب موعد تسليم مرحلة ${stg.name}`,
              message: `تنبيه: متبقي ${remaining === 0 ? 'أقل من يوم' : remaining + ' أيام'} على انتهاء الفترة الزمنية المخصصة لمرحلة (${stg.name}). يرجى المتابعة لضمان إنجاز بنود التشطيب طبقاً للتعاقد.`,
              requestId: req.id,
              isRead: false,
              createdAt: new Date().toISOString()
            });

            // Send to contractor
            newAlertNotifs.push({
              id: `ALRT-CO-${Date.now()}-${stg.id}-${Math.random().toString(36).substr(2, 4)}`,
              userId: req.selectedCompanyId || 'COMPANY-1',
              title: `⚠️ إشعار هام: اقتراب تسليم مرحلة ${stg.name}`,
              message: `تنبيه هندسي للمقاول: متبقي ${remaining === 0 ? 'أقل من يوم' : remaining + ' أيام'} فقط لإنهاء أعمال مرحلة (${stg.name}) لمشروع العميل ${req.clientName}. يرجى اتخاذ السرعة اللازمة لتفادي بنود غرامة التأخير.`,
              requestId: req.id,
              isRead: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      });

      // Check general project execution submission deadline (3 dry days alert)
      if (req.deadline && (req.status === 'ACTIVE' || req.status === 'CONTRACTED' || req.status === 'CONTRACT_SIGNED')) {
        const deadlineDate = new Date(req.deadline);
        const today = new Date();
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 3) {
          const alreadyAlertedProj = notifications.some(
            n => n.requestId === req.id && n.title.includes('اقتراب موعد التسليم النهائي')
          );

          if (!alreadyAlertedProj) {
            notificationsModified = true;
            // Notify Client
            newAlertNotifs.push({
              id: `ALRT-PRJ-CL-${Date.now()}-${req.id}`,
              userId: req.clientId,
              title: `🕒 اقتراب موعد التسليم النهائي للمشروع`,
              message: `تنبيه هام ومباشر: متبقي ${diffDays === 0 ? 'أقل من يوم' : diffDays + ' أيام'} على موعد التسليم النهائي الكلي لمشروعك. نحن نتابع مع المقاول لضمان تطبيق أعلى الاستحقاقات والالتزام بالجدول التشغيلي.`,
              requestId: req.id,
              isRead: false,
              createdAt: new Date().toISOString()
            });
            // Notify Contractor
            newAlertNotifs.push({
              id: `ALRT-PRJ-CO-${Date.now()}-${req.id}`,
              userId: req.selectedCompanyId || 'COMPANY-1',
              title: `🚨 إنذار ميعاد التسليم النهائي لمشروع ${req.id}`,
              message: `تنبيه إداري: نود تذكيركم باقتراب ميعاد التسليم النهائي الكلي للمشروع رقم ${req.id} للعميل ${req.clientName} خلال ${diffDays === 0 ? 'أقل من يوم' : diffDays + ' أيام'} فقط. يرجى المسارعة بإنهاء وتسليم الموقع دقةً وتفادياً لمستحقات الغرامة.`,
              requestId: req.id,
              isRead: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      }
    });

    if (notificationsModified && newAlertNotifs.length > 0) {
      setNotifications(prev => [...newAlertNotifs, ...prev]);
    }
  }, []);

  const addNotification = (userId: string, title: string, message: string, requestId?: string) => {
    const newNotif: Notification = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      title,
      message,
      requestId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const logAudit = (userId: string, userName: string, role: string, ar: string, en: string, details: string) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      userName,
      userRole: role,
      actionAr: ar,
      actionEn: en,
      details,
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = (userSubIds: string[]) => {
    setNotifications(prev =>
      prev.map(n => (userSubIds.includes(n.userId) ? { ...n, isRead: true } : n))
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Demo helper: Toast notifications to guide user
  const [toastMessage, setToastMessage] = useState<string | null>(
    'مرحباً بك في عرض "شطبها" المدمج التفاعلي! تصفح الموقع وسجل حساباً أو تبدل الأدوار من شريط المحاكاة العلوي.'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prior => (prior === msg ? null : prior));
    }, 6000);
  };

  const triggerSimulatedEmailNotification = (to: string, subject: string, body: string, type: 'CONTRACT_SIGNED' | 'STAGE_APPROVED') => {
    const newMail = {
      id: `SIM-MAIL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to,
      from: 'no-reply@shattabba.com',
      subject,
      body,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
      type
    };
    setSimulatedEmails(prev => {
      const updated = [newMail, ...prev];
      try {
        localStorage.setItem('shatibha_simulated_emails_v4', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
    setActiveSimulatedEmail(newMail);
    
    showToast(lang === 'en' 
      ? `📧 [Email Simulation] Critical email sent to ${to}: ${subject}` 
      : `📧 [محاكاة بريد إلكتروني] تم إرسال إشعار بريدي إلى: ${to}. العنوان: ${subject}`
    );
  };

  const triggerLiveEmailNotification = async (
    to: string,
    subject: string,
    bodyText: string,
    type: 'CONTRACT_SIGNED' | 'STAGE_APPROVED' | 'OFFER_RECEIVED'
  ) => {
    // 1. Log to the internal simulator system so the user can see it inside the inbox panel
    triggerSimulatedEmailNotification(to, subject, bodyText, type as any);

    // 2. Make an asynchronous call to our live Express backend mailer api
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          text: bodyText,
          html: `
            <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; font-size: 14px; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px; background-color: #fcfcfc;">
              <h2 style="color: #2b4d89; border-bottom: 2px solid #2b4d89; padding-bottom: 8px;">منصة شطبها • Shattabha Platform</h2>
              <div style="margin: 20px 0; font-size: 15px; color: #111;">
                ${bodyText.replace(/\n/g, '<br/>')}
              </div>
              <hr style="border: none; border-top: 1px solid #e1e1e1; margin: 20px 0;"/>
              <p style="font-size: 11px; color: #999; text-align: center;">مراسلة تلقائية رسمية من خوادم شطبها للتطوير المعماري والديكور المحدودة</p>
            </div>
          `
        })
      });
      const data = await response.json();
      console.log('Live email delivery response:', data);
    } catch (err) {
      console.error('An error occurred during real email delivery dispatch:', err);
    }
  };

  // Reset demo back to baseline
  const handleResetState = () => {
    setRequests(initialRequests);
    setCompanies(initialCompanies);
    setOffers(initialOffers);
    setContracts(initialContracts);
    setInspectors(initialInspectors);
    setStages(initialProjectStages);
    setNotifications(initialNotifications);
    setPromoCodes(initialPromoCodes);
    setWarranties(initialWarrantyRecords);
    setComplaints(initialWarrantyComplaints);
    setAuditLogs(initialAuditLogs);
    setActiveView('HOME');
    showToast('🔄 تم إعادة تهيئة حالة المنصة والبيانات التمهيدية إلى الأصل الممتد وبنجاح!');
  };

  const handleClearAllRequests = () => {
    setRequests([]);
    setStages([]);
    setOffers([]);
    setContracts([]);
    setWarranties([]);
    setComplaints([]);
    logAudit('ALL', 'المختبر', 'TESTER', 'تم مسح وتصفير كافة طلبات التشطيب والمشاريع والضمانات والشكاوى لمباشرة تجارب جديدة نظيفة', 'Cleared all finishing requests, active projects, escrow stages, warranties, complaints, and bids to start a clean testing flow', 'Erased all requests, active projects, escrow stages, warranties, complaints, and bids');
    showToast('🧹 تم مسح وتصفير كافة طلبات التشطيب، العروض، المشاريع، الضمانات، والشكاوى السابقة بنجاح! يمكنك الآن بدء تقديم طلبات جديدة تماماً من الصفر.');
  };


  const handleUpdateCompany = (companyId: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, ...updates } : c));
  };

  const handleToggleVerifyCompany = (companyId: string) => {
    setCompanies(prev =>
      prev.map(c =>
        c.id === companyId
          ? { ...c, isVerified: !c.isVerified }
          : c
      )
    );
    showToast(
      lang === 'en'
        ? '🛡️ Company verification status updated!'
        : '🛡️ تم تحديث حالة توثيق شركة التشطيبات بنجاح!'
    );
  };

  const handleUpdateCompanyRating = (companyId: string, rating: number) => {
    setCompanies(prev =>
      prev.map(c =>
        c.id === companyId
          ? { ...c, rating: rating }
          : c
      )
    );
    showToast(
      lang === 'en'
        ? '⭐ Company rating updated successfully!'
        : '⭐ تم تحديث تقييم شركة التشطيبات بنجاح!'
    );
  };

  // TECHNICAL INSPECTOR TRIGGERS: Adding site inspection approval status (stages & payments locking)
  const handleUpdateStage = (stageId: string, updates: Partial<ProjectStage>) => {
    setStages(prev => {
      const updatedStages = prev.map(stg => {
        if (stg.id !== stageId) return stg;
        
        let mergedObj = { ...stg, ...updates };

        // Auto State Machine cascades:
        if (updates.status === 'APPROVED' || updates.status === 'INSPECTION_APPROVED') {
          mergedObj.status = 'AWAITING_PAYMENT';
        } else if (updates.status === 'REJECTED' || updates.status === 'INSPECTION_FAILED') {
          mergedObj.status = 'INSPECTION_FAILED';
          mergedObj.inspectionRequested = false;
        } else if (updates.paymentReleased || updates.status === 'PAID') {
          mergedObj.status = 'CLOSED';
          mergedObj.paymentReleased = true;
          mergedObj.progress = 100;
        }
        return mergedObj;
      });

      const currentStage = updatedStages.find(s => s.id === stageId);
      if (currentStage && (currentStage.status === 'CLOSED' || currentStage.status === 'PAID' || currentStage.paymentReleased)) {
        const reqStages = updatedStages.filter(s => s.requestId === currentStage.requestId);
        reqStages.sort((a, b) => a.id.localeCompare(b.id));
        const currentIndex = reqStages.findIndex(s => s.id === stageId);
        if (currentIndex !== -1 && currentIndex < reqStages.length - 1) {
          const nextStg = reqStages[currentIndex + 1];
          if (nextStg.status === 'PLANNED' || nextStg.status === 'NOT_STARTED') {
            return updatedStages.map(stg => 
              stg.id === nextStg.id 
                ? { ...stg, status: 'IN_PROGRESS', progress: 10 } 
                : stg
            );
          }
        }
      }
      return updatedStages;
    });

    // Handle Audit logging and notifications
    const stage = stages.find(s => s.id === stageId);
    if (stage) {
      const parentRequest = requests.find(r => r.id === stage.requestId);
      const targetClientId = parentRequest ? parentRequest.clientId : 'ID#4092';
      const clientName = parentRequest ? parentRequest.clientName : 'العميل';

      // Trace executing contractor
      let contractorUserId = 'USER-COMP-1';
      let contractorCompanyName = 'LuxSpace';
      if (parentRequest) {
        const contract = contracts.find(c => c.requestId === parentRequest.id);
        if (contract) {
          const comp = companies.find(c => c.id === contract.companyId);
          if (comp) {
            contractorUserId = comp.userId;
            contractorCompanyName = comp.name;
          }
        }
      }

      if (updates.complaintText) {
        logAudit(targetClientId, clientName, 'CLIENT', `تسجيل شكوى فنية في مرحلة ${stage.name}`, `Technical complaint filed on stage ${stage.name}`, `الشكوى: ${updates.complaintText}`);
        showToast('⚠️ تم رصد وإرسال شكوى فنية منك عاجلاً! تم إشعار الهيئة الهندسية والمشرف الميداني للنزول والفحص فوراً.');
        addNotification(
          targetClientId,
          '⚠️ تسجيل شكوى فنية • Technical Complaint Registered',
          `تم رصد شكواك الفنية بخصوص مرحلة (${stage.name}) والعمل جاري مع المشرف والمقاول لحلها فوراً. • Your technical complaint about stage (${stage.name}) has been registered for immediate review.`,
          stage.requestId
        );
      } else if (updates.status === 'APPROVED' || updates.status === 'INSPECTION_APPROVED') {
        logAudit(parentRequest?.assignedInspectorId || 'INSP-2', 'م/ الاستشاري', 'INSPECTOR', `موافقة فنية واعتماد بند ${stage.name}`, `Inspector approved stage ${stage.name}`, `تم فحص واعتماد جودة أعمال المقاول في مرحلة ${stage.name}`);
        showToast('🔍 تم الفحص الميداني والمطابقة: تمت الموافقة على جودة بنود الاستلام بنجاح، بانتظار التفريغ المالي للعميل!');
        addNotification(
          targetClientId,
          '✅ موافقة واستلام بند فني • Stage Approved by Inspector',
          `تم فحص واعتماد مرحلة (${stage.name}) بواسطة المشرف الميداني بنجاح ومطابقتها للمواصفات! يمكنك الآن الإفراج عن الدفعة. • Field inspector approved stage (${stage.name}) as code-compliant. Please release stage escrow payment.`,
          stage.requestId
        );
        addNotification(
          contractorUserId,
          '✅ موافقة فنية واعتماد مرحلة • Stage Approved by Inspector',
          `أخبار رائعة! تم فحص واعتماد وتأكيد جودة مرحلة (${stage.name}) في مشروعك من قبل الاستشاري الهندسي بنجاح وهي مطابقة للمواصفات والأكواد. • Great news! The engineering inspector officially approved stage (${stage.name}) as compliant.`,
          stage.requestId
        );
        if (updates.reportText) {
          addNotification(
            contractorUserId,
            '📋 تقرير هندسي وملاحظات المشرف • Inspector Work Report',
            `المشرف الهندسي: "${updates.reportText}"`,
            stage.requestId
          );
        }

        // 📧 Simulate email to client upon stage approval
        triggerSimulatedEmailNotification(
          parentRequest?.clientEmail || 'client@shattabba.com',
          lang === 'en'
            ? `✅ stage "${stage.name}" approved for project #${stage.requestId}`
            : `✅ تم الاعتماد الفني بنجاح لـ (${stage.name}) لمشروعكم رقم (${stage.requestId})`,
          `<div style="font-family: sans-serif; direction: rtl; text-align: right; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px; background-color: #f0fdf4; max-width: 600px; margin: auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 40px;">✅</span>
            </div>
            <h2 style="color: #166534; margin-top: 0;">مرحباً ${clientName}،</h2>
            <p style="font-size: 15px; color: #1f2937; line-height: 1.6;">
              أهلاً بك! نسعد بإشعارك بأن المهندس المشرف المستقل الموكل من منصة <strong>شطبها</strong> قد قام بالمعاينة الميدانية بخصوص <strong>(${stage.name})</strong> لمشروعك رقم <strong>(${stage.requestId})</strong> واعتمد مطابقتها الفنية الكاملة لأصول الحرفة والأكواد المعتمدة!
            </p>
            <div style="background-color: #ffffff; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0; font-style: italic; color: #15803d; font-size: 14px;">
              💬 <strong>ملاحظات المهندس الفني:</strong><br>
              "${updates.reportText || 'البند مطابق تماماً للمواصفات الفنية المعتمدة في كراسة الشروط وتمت تجربته واختباره بنجاح.'}"
            </div>
            <p style="font-size: 15px; color: #1f2937; line-height: 1.6;">
              الدفعة المخصصة لهذا البند (نسبة %${stage.paymentPercentage || 15}) آمنة في حساب الضمان التابع للمنصة ومستحقة الصرف الآن للمقاول بمجرد تأكيدك والإفراج المالي عنها بضغطة زر من صفحة مشروعك.
            </p>
            <div style="text-align: center; margin-top: 28px;">
              <a href="#" style="background-color: #166534; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 14px; box-shadow: 0 4px 6px rgba(22, 101, 52, 0.2);">الإفراج المالي للدفعة الآن</a>
            </div>
            <hr style="border: none; border-top: 1px solid #dcfce7; margin: 20px 0;">
            <p style="font-size: 12px; color: #6b7280; text-align: center; margin-bottom: 0;">
              هذه رسالة آلية من نظام محاكاة الإشعارات لمنصة شطبها لضمان تجربة حقيقية متكاملة لرحلة العميل.
            </p>
          </div>`,
          'STAGE_APPROVED'
        );
      } else if (updates.status === 'REJECTED' || updates.status === 'INSPECTION_FAILED') {
        logAudit(parentRequest?.assignedInspectorId || 'INSP-2', 'م/ الاستشاري', 'INSPECTOR', `رفض استلام مرحلة ${stage.name} لوجود عيوب فنية`, `Inspector rejected stage ${stage.name}`, `ملاحظات عدم المطابقة: ${updates.rejectedNotes || 'عيوب في استلام البنود الموضحة بالصور'}`);
        showToast('❌ تم رصد عيوب فنية! تسجيل تقرير الرفض وإشعار شركة المقاولة للتعديل الفوري.');
        addNotification(
          targetClientId,
          '❌ تم رفض تسليم مرحلة • Stage Execution Disapproved',
          `تم رفض استلام مرحلة (${stage.name}) من المشرف الفني لوجود ملاحظات وجاري تعديلها مع المقاول فوراً.`,
          stage.requestId
        );
        addNotification(
          contractorUserId,
          '❌ رفض استلام وبند معيب فني • Stage Submission Rejected',
          `تم رصد ملاحظات تمنع استلام مرحلة (${stage.name}) من قبل المشرف الهندسي وتم رفض البند تمهيداً للتعديل.`,
          stage.requestId
        );
      } else if (updates.paymentReleased || updates.status === 'PAID') {
        logAudit(targetClientId, clientName, 'CLIENT', `تم الإفراج المالي للمرحلة ${stage.name}`, `Escrow funds released for stage ${stage.name}`, `تم تحفيز صرف الدفعة والتحويل لحساب المقاول ${contractorCompanyName}`);
        showToast('💳 تم الإفراج المالي! الدفعة الضامنة خرجت من الضمان وتوجهت لحساب المقاول بنجاح.');
        addNotification(
          targetClientId,
          '💳 تم الإفراج عن الدفعة المالية • Escrow Payment Released',
          `تم تحرير الدفعة لمرحلة (${stage.name}) وتحويلها لشركة المقاولات بنجاح.`,
          stage.requestId
        );
        addNotification(
          contractorUserId,
          '💳 تم استلام دفعة مالية • Escrow Payment Received',
          `قام العميل بتحرير الدفعة لمرحلة (${stage.name}) لتصل إلى حسابك بنجاح!`,
          stage.requestId
        );
      } else if (updates.inspectionRequested) {
        logAudit(contractorUserId, contractorCompanyName, 'COMPANY', `طلب فحص ومعاينة مرحلة ${stage.name}`, `Inspection requested for stage ${stage.name}`, `الشركة تطلب نزول المشرف للمطابقة وتأكيد الجودة الكودية.`);
        showToast('📤 تم إرسال طلب معاينة فنية مهندس الموقع سيزور المشروع خلال 24 ساعة.');
      } else {
        showToast('👷 تم تحديث السجل الفني للمرحلة بنجاح.');
      }
    }
  };

  // CONTRACTOR / CLIENT ACTION: Generic Client Request Details Update
  const handleUpdateRequest = (requestId: string, updates: Partial<ClientRequest>) => {
    setRequests(prev =>
      prev.map(req => (req.id === requestId ? { ...req, ...updates } : req))
    );

    const req = requests.find(r => r.id === requestId);
    if (updates.inspectionReport) {
      if (req) {
        addNotification(
          req.clientId,
          '📝 تقديم تقرير المعاينة الميدانية • Site Inspection Report Submitted',
          `قام المشرف الاستشاري بإدخال ورفع الملاحظات والتقرير الفني لزيارة موقعك الميدانية: "${updates.inspectionReport}" • Technical inspection report submitted: "${updates.inspectionReport}"`,
          requestId
        );
        addNotification(
          'ADMIN',
          '🚨 تقرير فني جديد للمعاينة الميدانية • New Field Inspection Report',
          `رفع المشرف الاستشاري تقرير المعاينة الميدانية للمشروع كود (${requestId}) للعميل ${req.clientName}: "${updates.inspectionReport}"`,
          requestId
        );
      }
    }

    if (updates.actualStartDate) {
      setStages(prev => {
        const reqStages = prev.filter(s => s.requestId === requestId);
        reqStages.sort((a, b) => a.id.localeCompare(b.id));
        
        return prev.map(stg => {
          if (stg.requestId !== requestId) return stg;
          
          const idx = reqStages.findIndex(s => s.id === stg.id);
          if (idx === -1) return stg;
          
          const duration = stg.totalDurationDays || 10;
          let calculatedStart = new Date(updates.actualStartDate!);
          for (let i = 0; i < idx; i++) {
            const prevStg = reqStages[i];
            const prevDur = prevStg.totalDurationDays || 10;
            calculatedStart.setDate(calculatedStart.getDate() + prevDur);
          }
          
          let calculatedEnd = new Date(calculatedStart);
          calculatedEnd.setDate(calculatedEnd.getDate() + duration);
          
          const startDateStr = calculatedStart.toISOString().split('T')[0];
          const endDateStr = calculatedEnd.toISOString().split('T')[0];
          
          let updatedStg = {
            ...stg,
            startDate: startDateStr,
            endDate: endDateStr
          };
          
          // If it's the first stage, activate and start it (default 10% progress if 0)
          if (idx === 0) {
            if (updatedStg.status === 'PLANNED' || updatedStg.status === 'NOT_STARTED') {
              updatedStg.status = 'IN_PROGRESS';
              updatedStg.progress = updatedStg.progress || 10;
            }
          }
          
          return updatedStg;
        });
      });
    }

    if (updates.status === 'COMPLETED') {
      showToast('🎉 تهانينا! تم تسليم المشروع رسمياً وتفعيل وثيقة الضمان الثلاثي الذهبي بنجاح!');
      if (req) {
        addNotification(
          req.clientId,
          '🛡️ توثيق استلام نهائي وتفعيل الضمان • Dual Warranty Certificate Activated',
          `يسرنا إعلامك ببدء تغطية الضمان الثلاثي الذهبي رسمياً لـ ${req.unitType} كود (${req.id}) لمدة ٣ سنوات. يمكنك تحميل الوثيقة وعرض العداد التنازلي الآن. • Your 3-year luxury warranty cover has been activated for project (${req.id}).`,
          requestId
        );
        addNotification(
          'USER-COMP-1',
          '📁 أرشفة الموقع ونقل للمشاريع المنجزة • Project Successfully Archived',
          `رائع! تم إنهاء التزامات موقع (${req.id}) بنجاح ونقله لقسم المشاريع السابقة لتوضيح تغطية الضمان. • Project (${req.id}) completed. Contractor portfolio updated.`,
          requestId
        );
      }
    }
  };

  // ADMIN ACTION: Assign inspector to a contracted requested project
  const handleUpdateProjectInspector = (requestId: string, inspectorId: string, reason?: string) => {
    const req = requests.find(r => r.id === requestId);
    const prevInspectorId = req?.assignedInspectorId;
    const prevInspectorName = prevInspectorId ? (inspectors.find(i => i.id === prevInspectorId)?.name || '') : '';

    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, assignedInspectorId: inspectorId } : r))
    );
    const inspectorName = inspectors.find(i => i.id === inspectorId)?.name || '';
    const reasonSuffix = reason ? ` (السبب الموثق: ${reason})` : '';
    showToast(`🕵️ تم تكليف وإرسال المشرف م/ ${inspectorName} لتتبع الموقع واستقصاء بنود الاستلام!${reasonSuffix}`);

    if (req) {
      // 1. Notify Client
      addNotification(
        req.clientId,
        '🕵️ تعيين مهندس إشراف للمشروع • Inspector Appointed for Project',
        `تم تكليف المهندس م/ ${inspectorName} لزيارة وتفتيش موقعك ومطابقة خطوات العمل مع الكود الفني. ${reason ? `[سبب التحديث: ${reason}]` : ''} • Site engineer m/ ${inspectorName} has been appointed to inspect your project quality parameters.`,
        requestId
      );
      // 2. Notify assigned Inspector
      addNotification(
        inspectorId,
        '📋 تكليف بمشروع جديد • New Site Inspection Assigned',
        `تم تكليفك لمراجعة وتفتيش مشروع الطلب رقم (${requestId}). يرجى تخطيط الزيارات الميدانية ومطابقة البنود للشركة المنفذة. ${reason ? `[سبب التكليف: ${reason}]` : ''} • You have been assigned as lead inspector for request (${requestId}).`,
        requestId
      );
      // 3. Notify previous Inspector if we are changing supervisor
      if (prevInspectorId && prevInspectorId !== inspectorId) {
        addNotification(
          prevInspectorId,
          '⚠️ إلغاء إسناد مشروع • Project Disassigned',
          `تم إلغاء متابعتك للمشروع رقم (${requestId}) وإعادة إسناده من قبل الإدارة إلى زميل آخر. ${reason ? `[السبب الموثق: ${reason}]` : ''} • Your assignment on request (${requestId}) has been revoked.`,
          requestId
        );
      }
      // 4. Update Warning/System notifications
      addNotification(
        'ADMIN',
        '🔄 تغيير مهندس إشراف • Inspector Reassigned',
        `تم إعادة تعيين المشرف للمشروع رقم (${requestId}) وتوجيه المهمة إلى م/ ${inspectorName} بدلاً من م/ ${prevInspectorName || 'لا يوجد'}.${reason ? ` سبب التغيير: ${reason}` : ''}`,
        requestId
      );
      // 5. Audit Log Entry
      logAudit(
        "ADMIN",
        "لوحة الإدارة",
        "ADMIN",
        `إعادة تعيين المشرف للمشروع ${requestId}`,
        `Reassigned inspector for ${requestId}`,
        `Previous: ${prevInspectorName || 'None'} -> New: ${inspectorName} (${inspectorId}). ${reason ? `Reason: ${reason}` : 'No reason specified'}`
      );
    }
  };

  // ADMIN ACTION: Add new supervisor/inspector
  const handleAddInspector = (newInspector: Inspector) => {
    setInspectors(prev => [...prev, newInspector]);
    showToast(`👷 تم إضافة المشرف م/ ${newInspector.name} بنجاح إلى فريق عمل المنصة وتكليفه بالمحافظات!`);
  };

  // ADMIN ACTION: Update/Sync supervisors list globally
  const handleUpdateInspectorsList = (updatedInspectorsList: Inspector[]) => {
    setInspectors(updatedInspectorsList);
  };

  // CLIENT TRIGGERS: Adding custom request
  const handleAddRequest = (newRequest: ClientRequest) => {
    setRequests(prev => [newRequest, ...prev]);

    // Auto increment usageCount for the utilized code
    if (newRequest.usedPromoCode) {
      setPromoCodes(priorCodes =>
        priorCodes.map(p =>
          p.code.toUpperCase() === newRequest.usedPromoCode?.toUpperCase()
            ? { ...p, usageCount: p.usageCount + 1 }
            : p
        )
      );
    }
    
    // Seed default stages for the new request so they are inspectable & manageable immediately
    const defaultStagesForRequest: ProjectStage[] = [
      {
        id: `STG-${newRequest.id}-1`,
        requestId: newRequest.id,
        name: 'تأسيس السباكة والصرف',
        status: 'NOT_STARTED',
        progress: 0,
        totalDurationDays: 15,
        daysElapsed: 0,
        images: [],
        inspectionRequested: false,
        paymentReleased: false
      },
      {
        id: `STG-${newRequest.id}-2`,
        requestId: newRequest.id,
        name: 'تأسيس الكهرباء والإنارة',
        status: 'NOT_STARTED',
        progress: 0,
        totalDurationDays: 15,
        daysElapsed: 0,
        images: [],
        inspectionRequested: false,
        paymentReleased: false
      },
      {
        id: `STG-${newRequest.id}-3`,
        requestId: newRequest.id,
        name: 'أعمال المحارة والأسقف',
        status: 'NOT_STARTED',
        progress: 0,
        totalDurationDays: 20,
        daysElapsed: 0,
        images: [],
        inspectionRequested: false,
        paymentReleased: false
      },
      {
        id: `STG-${newRequest.id}-4`,
        requestId: newRequest.id,
        name: 'الدهانات والتشطيب النهائي',
        status: 'NOT_STARTED',
        progress: 0,
        totalDurationDays: 30,
        daysElapsed: 0,
        images: [],
        inspectionRequested: false,
        paymentReleased: false
      }
    ];

    setStages(prev => [...prev, ...defaultStagesForRequest]);
    showToast(`📝 تم إرسال طلب التشطيب رقم ${newRequest.id} بنجاح! انتقل الآن لـ "لوحة الإدارة" للتحقق والموافقة عليه.`);

    // 1. Notify Client
    addNotification(
      newRequest.clientId,
      '📝 تم تسجيل طلب التشطيب بنجاح • Project Ticket Registered',
      `تم استلام مواصفات طلبك رقـم (${newRequest.id}) بنجاح وهو الآن قيد المراجعة الفنية والإدارية لتأكيد الميزانية قبل الطرح. • Finishing request (${newRequest.id}) has been submitted and is pending admin approval.`,
      newRequest.id
    );

    // 2. Notify Admin
    addNotification(
      'ADMIN',
      '🆕 طلب تشطيب جديد للمراجعة • New Project Pending Review',
      `سجل العميل (${newRequest.clientName}) طلب تشطيب جديد رقم (${newRequest.id}) بمساحة ${newRequest.area} م² وبانتظار اعتماد التوجيه للتسعير. • New finishing request (${newRequest.id}) registered and requires technical verification.`,
      newRequest.id
    );
  };

  // CLIENT TRIGGERS: Accepting anonymous offer
  const handleAcceptOffer = (requestId: string, offer: Offer) => {
    // 1. Find request details to extract location (governorate and city)
    const reqObj = requests.find(r => r.id === requestId);
    let assignedId: string | undefined = reqObj?.assignedInspectorId || undefined;
    let chosenInspectorNameAr = assignedId ? (inspectors.find(ins => ins.id === assignedId)?.name || '') : '';

    if (!assignedId && reqObj) {
      const normalizeAr = (str: string) => {
        return str
          .replace(/[أإآ]/g, 'ا')
          .replace(/ة/g, 'ه')
          .replace(/ى/g, 'ي')
          .replace(/\s+/g, '')
          .toLowerCase();
      };

      const reqGovNorm = normalizeAr(reqObj.governorate || '');
      const reqCityNorm = normalizeAr(reqObj.city || '');

      // Filter inspectors for matching location (same governorate & optionally matching zone)
      let candidateInspectors = inspectors.filter(ins => {
        const insGovNorm = normalizeAr(ins.governorate || '');
        const insZoneNorm = normalizeAr(ins.zone || '');

        const govMatch = insGovNorm === reqGovNorm;
        // Check if one contains the other
        const zoneMatch = insZoneNorm.includes(reqCityNorm) || reqCityNorm.includes(insZoneNorm);

        return govMatch && (zoneMatch || ins.zone === '' || !reqObj.city);
      });

      // Fallback 1: If no specific zone match, look for any inspector in the same governorate
      if (candidateInspectors.length === 0) {
        candidateInspectors = inspectors.filter(ins => {
          const insGovNorm = normalizeAr(ins.governorate || '');
          return insGovNorm === reqGovNorm;
        });
      }

      // Fallback 2: General fallback to all inspectors if no geographic matches
      if (candidateInspectors.length === 0) {
        candidateInspectors = [...inspectors];
      }

      if (candidateInspectors.length > 0) {
        // Calculate current real active workload count from state projects
        const getActiveCount = (insId: string) => {
          return requests.filter(r => 
            r.assignedInspectorId === insId && 
            r.status !== 'COMPLETED' && 
            r.status !== 'CANCELLED'
          ).length;
        };

        // Sort candidates:
        // 1. By total active projects count (ascending) -> supervisor with FEWER projects first
        // 2. Specific zone matching priority as tie-breaker
        candidateInspectors.sort((a, b) => {
          const cntA = getActiveCount(a.id);
          const cntB = getActiveCount(b.id);
          if (cntA !== cntB) {
            return cntA - cntB;
          }
          // Tie-breaker
          const aZoneMatch = normalizeAr(a.zone || '').includes(reqCityNorm);
          const bZoneMatch = normalizeAr(b.zone || '').includes(reqCityNorm);
          if (aZoneMatch && !bZoneMatch) return -1;
          if (!aZoneMatch && bZoneMatch) return 1;
          return 0;
        });

        const chosenInspector = candidateInspectors[0];
        assignedId = chosenInspector.id;
        chosenInspectorNameAr = chosenInspector.name;
      }
    }

    // 2. Move request status to selected, and apply the automatically assigned inspector ID
    setRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'CLIENT_SELECTED',
              selectedOfferId: offer.id,
              selectedCompanyId: offer.companyId,
              assignedInspectorId: assignedId || r.assignedInspectorId,
            }
          : r
      )
    );

    // 3. Keep selected company notified
    const comp = companies.find(c => c.id === offer.companyId);
    if (comp) {
      addNotification(
        comp.userId,
        '🎉 لبيك يا عميل! تم اختيار عرض الأسعار المالي الخاص بك للطلب ورسم البنود • Offer Accepted & Inspector Appointed',
        `حظي عرض الأسعار الفني والمالي الخاص بك للوحدة رقم (${requestId}) بالقبول والاعتماد من السيد العميل! تم تعيين الباشمهندس م/ ${chosenInspectorNameAr || 'المختص'} للإشراف المستقل والبدء بزيارة المعاينة المشتركة في غضون أيام. • Client accepted your pricing bid of ${offer.price.toLocaleString()} EGP. Coordination is active.`,
        requestId
      );
    }

    if (reqObj) {
      addNotification(
        reqObj.clientId,
        '🤝 تم قبول عرض التشطيب رسمياً • Offer Accepted Successfully',
        `نهنئك بقبول العرض المالي المقدم من (${offer.companyName}) لطلبك رقم (${requestId}) بقيمة إجمالية قدرها ${offer.price.toLocaleString()} ج.م. تم إمداد المهندس م/ ${chosenInspectorNameAr || 'المختص'} بكافة الكروكيات للزيارة الميدانية. • Your trade agreement is signed. Field inspection coordinates will follow.`,
        requestId
      );
    }

    showToast(
      lang === 'en'
        ? '🤝 Offer selected successfully! Pre-contractual phase loaded.'
        : '🤝 تم قبول عرض المعاينة وسحب عقود المظلات والتأسيس بنجاح! يبدأ الآن التنسيق الميداني المباشر.'
    );
  };

  const handleCancelAcceptOffer = (requestId: string) => {
    setRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'UNDER_PRICING',
              selectedOfferId: undefined,
              selectedCompanyId: undefined,
            }
          : r
      )
    );
    showToast(
      lang === 'en'
        ? '⚠️ Offer selection canceled. Request reverted to pricing phase.'
        : '⚠️ تم إلغاء اختيار العرض وإعادة الطلب لمرحلة تلقي عروض أسعار المقاولين.'
    );
  };
  const handleRegisterClient = (clientName: string, email: string, phone: string) => {
    const newClientId = `ID#${Math.floor(100000 + Math.random() * 900000)}`;
    
    showToast(`👤 مرحباً بك يا سيد ${clientName}! تم تسجيل وتفعيل حسابك بنجاح في المنظومة.`);

    // Welcome Notification for newly registered client
    addNotification(
      newClientId,
      '🎉 أهلاً بك في منصة شطبها • Account Activated & Ready!',
      `مرحباً بك يا سيد ${clientName}! تم تسجيل حسابك كعميل جديد جاهز لإضافة مشاريعك والحصول على أفضل عروض التشطيب. • Welcome! Your client account is active and ready to create finishing requests.`
    );
  };

  const handleAddCompany = (newCompany: Company) => {
    setCompanies(prev => [...prev, newCompany]);
    addNotification(
      'ADMIN_SYSTEM_ID',
      '🆕 شركة تشطيبات جديدة تريد الانضمام • New Service Partner Registration',
      `سجلت شركة (${newCompany.companyName}) في المنصة بانتظار المراجعة والاعتماد والمباشرة. • Registered: ${newCompany.companyName}. Pending Board Review.`,
      newCompany.id
    );
    showToast(
      lang === 'en'
        ? '🏢 Registration request sent to the administration!'
        : '🏢 تم تقديم طلب الانضمام بنجاح! جاري فحصه واعتماده من قبل الإدارة لتفعيل الحساب.'
    );
  };

  // ADMIN TRIGGERS: Approve client request (moves to UNDER_PRICING + sets 7-day automated deadline)
  const handleApproveRequest = (id: string, selectInspectorId?: string) => {
    // 1. Find request details to extract location (governorate and city)
    const reqObj = requests.find(r => r.id === id);
    let assignedId: string | undefined = selectInspectorId;
    let chosenInspectorNameAr = '';

    if (reqObj) {
      if (!assignedId) {
        const normalizeAr = (str: string) => {
          if (!str) return '';
          return str
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/\s+/g, '')
            .toLowerCase();
        };

        const reqGovNorm = normalizeAr(reqObj.governorate || '');
        const reqCityNorm = normalizeAr(reqObj.city || '');

        // Filter inspectors for matching location (same governorate & optionally matching zone)
        let candidateInspectors = inspectors.filter(ins => {
          const insGovNorm = normalizeAr(ins.governorate || '');
          const insZoneNorm = normalizeAr(ins.zone || '');

          const govMatch = insGovNorm === reqGovNorm;
          const zoneMatch = insZoneNorm.includes(reqCityNorm) || reqCityNorm.includes(insZoneNorm);

          return govMatch && (zoneMatch || ins.zone === '' || !reqObj.city);
        });

        // Fallback 1: If no specific zone match, look for any inspector in the same governorate
        if (candidateInspectors.length === 0) {
          candidateInspectors = inspectors.filter(ins => {
            const insGovNorm = normalizeAr(ins.governorate || '');
            return insGovNorm === reqGovNorm;
          });
        }

        // Fallback 2: General fallback to active inspectors if no geographic matches
        if (candidateInspectors.length === 0) {
          candidateInspectors = inspectors.filter(ins => ins.status !== 'SUSPENDED' && ins.status !== 'BLOCKED');
        }

        if (candidateInspectors.length > 0) {
          // Calculate current real active workload count from state projects
          const getActiveCount = (insId: string) => {
            return requests.filter(r => 
              r.assignedInspectorId === insId && 
              r.status !== 'COMPLETED' && 
              r.status !== 'CANCELLED'
            ).length;
          };

          // Sort candidates by total active projects count (ascending), and zone match as tie-breaker
          candidateInspectors.sort((a, b) => {
            const cntA = getActiveCount(a.id);
            const cntB = getActiveCount(b.id);
            if (cntA !== cntB) {
              return cntA - cntB;
            }
            const aZoneMatch = normalizeAr(a.zone || '').includes(reqCityNorm);
            const bZoneMatch = normalizeAr(b.zone || '').includes(reqCityNorm);
            if (aZoneMatch && !bZoneMatch) return -1;
            if (!aZoneMatch && bZoneMatch) return 1;
            return 0;
          });

          const chosenInspector = candidateInspectors[0];
          assignedId = chosenInspector.id;
          chosenInspectorNameAr = chosenInspector.name;
        }
      } else {
        chosenInspectorNameAr = inspectors.find(ins => ins.id === assignedId)?.name || '';
      }
    }

    // Strict Enforcement: A technical supervisor MUST be assigned before transitioning to 'UNDER_PRICING'
    const finalSupervisorId = assignedId || reqObj?.assignedInspectorId || (inspectors.length > 0 ? inspectors[0].id : undefined);
    if (!finalSupervisorId) {
      showToast('⚠️ لا يمكن ترقية حالة الطلب إلى "تم إرساله للشركات" لعدم وجود مشرفين فنيين معتمدين بالمنصة.');
      return;
    }

    if (!chosenInspectorNameAr && finalSupervisorId) {
      chosenInspectorNameAr = inspectors.find(ins => ins.id === finalSupervisorId)?.name || '';
    }

    setRequests(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'UNDER_PRICING',
              deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
              assignedInspectorId: finalSupervisorId,
              requireInspector: r.requireInspector !== undefined ? r.requireInspector : false // Keep original choice
            }
          : r
      )
    );

    const assignmentAlertText = chosenInspectorNameAr 
      ? ` ونظراً لتفعيل الطلب، تم تعيين م/ ${chosenInspectorNameAr} تلقائياً بناءً على توازن توزيع المشاريع في المنطقة!` 
      : '';
    showToast(`🌱 تم الموافقة على الطلب ${id} ونقله للتسعير بنجاح!${assignmentAlertText} سيظهر الآن في لوحة الشركات لتقديم العروض.`);

    // Dispatch notification to client
    const req = requests.find(r => r.id === id);
    if (req) {
      addNotification(
        req.clientId,
        '🟢 تم مراجعة واعتماد طلبك للتشطيب • Request Approved by Admin',
        `حظي طلبك لعنوان (${req.city}) ذو الرقم مـسلسل (${id}) بالموافقة الفنية والإدارية من إدارة شطبها، وتم إسناد الإشراف الهندسي الميداني تلقائياً للمهندس م/ ${chosenInspectorNameAr || 'المختص'}. بدأت الآن تلقي عروض أسعار المقاولين! • Your request (${id}) approved. Inspector ${chosenInspectorNameAr || 'assigned'} is selected based on workload workload balance.`,
        id
      );

      // Dispatch notification to assigned Inspector about the automatic assignment
      if (finalSupervisorId && chosenInspectorNameAr) {
        addNotification(
          finalSupervisorId,
          '📋 تكليف تلقائي لمشروع جديد قيد التسعير • Live Bidding Supervision Assigned',
          `تم تكليفك تلقائياً للإشراف الفني لمشروع بمواصفات طلب رقم (${id}) بمنطقة (${req.city || req.governorate}) كونه المطابق لنطاقك وحجم أعباء مشاريعك الحالية. • You have been assigned to request (${id}) based on geographical region and optimized workload workload balance.`,
          id
        );
      }

      // Dispatch notification to ALL approved contractor companies matching the governorate
      companies.forEach(comp => {
        const isMatchedGov = comp.governorates.some(gov => normalizeValue(gov) === normalizeValue(req.governorate));
        if (comp.status === 'APPROVED' && isMatchedGov) {
          addNotification(
            comp.userId,
            '🆕 طرح مناقصة تشطيب جديدة للتسعير • New Bidding Tender Live',
            `بشرى سارة! تم طرح طلب استلام وتشطيب جديد برقم (${id}) في نطاقك الجغرافي (${req.city || req.governorate})، وهو متاح حالياً لاستقبال عروض الأسعار. بادر بالتقديم. • A new finishing request (${id}) matches your governorate. Please submit your pricing bid.`,
            id
          );
        }
      });
    }
  };

  // ADMIN TRIGGERS: Approve company registrations
  const handleApproveCompany = (id: string) => {
    setCompanies(prev =>
      prev.map(c => (c.id === id ? { ...c, status: 'APPROVED' } : c))
    );
    showToast(
      lang === 'en'
        ? '🏢 Company approved and registered successfully!'
        : '🏢 تم ترخيص واعتماد شركة التشطيبات وتفعيل قدرتها على المنافسة والمطابقة!'
    );
  };

  // ADMIN TRIGGERS: Save or update project contracts (and seed execution stages)
  const handleSaveContract = (updatedContract: Contract, requestUpdates?: Partial<ClientRequest>) => {
    // 1. Save contract with updated fields in the contract pool
    setContracts(prev => {
      const exists = prev.some(c => c.id === updatedContract.id);
      if (exists) {
        return prev.map(c => (c.id === updatedContract.id ? updatedContract : c));
      }
      return [updatedContract, ...prev];
    });

    // 2. Cascade request status updates
    if (requestUpdates) {
      setRequests(prev =>
        prev.map(r => (r.id === updatedContract.requestId ? { ...r, ...requestUpdates } : r))
      );
    }

    const currentReq = requests.find(r => r.id === updatedContract.requestId);
    const isSupervised = requestUpdates?.requireInspector !== false && currentReq?.requireInspector !== false;

setStages(prev => {
        const exists = prev.some(s => s.requestId === updatedContract.requestId);
        if (exists) {
          // Update percentages of existing stages to match any updated contract percentages
          return prev.map(s => {
            if (s.requestId === updatedContract.requestId) {
              const customPct = updatedContract.paymentPercentages?.[s.name];
              let updatedStg = { ...s };
              if (customPct !== undefined) {
                updatedStg.paymentPercentage = customPct;
              }
              if (requestUpdates?.status === 'ACTIVE') {
                if (s.name.includes('الدفعة المقدمة')) {
                  updatedStg.status = 'PAID';
                  updatedStg.progress = 100;
                  updatedStg.paymentReleased = true;
                } else if (s.name.includes('السباكة') && isSupervised) {
                  updatedStg.status = 'IN_PROGRESS';
                }
              }
              return updatedStg;
            }
            return s;
          });
        }
        return [
          ...prev,
          {
            id: `STG-${updatedContract.requestId}-0`,
            requestId: updatedContract.requestId,
            name: 'الدفعة المقدمة (ضمان الجدية وبدء الأعمال)',
            status: requestUpdates?.status === 'ACTIVE' ? 'PAID' : 'PLANNED',
            progress: requestUpdates?.status === 'ACTIVE' ? 100 : 0,
            totalDurationDays: 3,
            daysElapsed: 0,
            images: [],
            inspectionRequested: false,
            paymentReleased: requestUpdates?.status === 'ACTIVE',
            paymentPercentage: updatedContract.paymentPercentages?.['الدفعة المقدمة (ضمان الجدية وبدء الأعمال)'] ?? 10
          },
          {
            id: `STG-${updatedContract.requestId}-1`,
            requestId: updatedContract.requestId,
            name: 'أعمال السباكة والصرف الفني',
            status: (requestUpdates?.status === 'ACTIVE' && isSupervised) ? 'IN_PROGRESS' : 'PLANNED',
            progress: 0,
            totalDurationDays: 12,
            daysElapsed: 0,
            images: [],
            inspectionRequested: false,
            paymentReleased: false,
            paymentPercentage: updatedContract.paymentPercentages?.['أعمال السباكة والصرف الفني'] ?? 15
          },
          {
            id: `STG-${updatedContract.requestId}-2`,
            requestId: updatedContract.requestId,
            name: 'تأسيس الكهرباء والشبكات',
            status: 'PLANNED',
            progress: 0,
            totalDurationDays: 10,
            daysElapsed: 0,
            images: [],
            inspectionRequested: false,
            paymentReleased: false,
            paymentPercentage: updatedContract.paymentPercentages?.['تأسيس الكهرباء والشبكات'] ?? 15
          },
          {
            id: `STG-${updatedContract.requestId}-3`,
            requestId: updatedContract.requestId,
            name: 'أعمال البياض والمحارة الداخلية',
            status: 'PLANNED',
            progress: 0,
            totalDurationDays: 15,
            daysElapsed: 0,
            images: [],
            inspectionRequested: false,
            paymentReleased: false,
            paymentPercentage: updatedContract.paymentPercentages?.['أعمال البياض والمحارة الداخلية'] ?? 15
          },
          {
            id: `STG-${updatedContract.requestId}-4`,
            requestId: updatedContract.requestId,
            name: 'تركيب البورسلين والأرضيات',
            status: 'PLANNED',
            progress: 0,
            totalDurationDays: 18,
            daysElapsed: 0,
            images: [],
            inspectionRequested: false,
            paymentReleased: false,
            paymentPercentage: updatedContract.paymentPercentages?.['تركيب البورسلين والأرضيات'] ?? 15
          },
          {
            id: `STG-${updatedContract.requestId}-5`,
            requestId: updatedContract.requestId,
            name: 'أعمال الدهانات والتشطيبات الأساسية',
            status: 'PLANNED',
            progress: 0,
            totalDurationDays: 14,
            daysElapsed: 0,
            images: [],
            inspectionRequested: false,
            paymentReleased: false,
            paymentPercentage: updatedContract.paymentPercentages?.['أعمال الدهانات والتشطيبات الأساسية'] ?? 15
          },
          {
            id: `STG-${updatedContract.requestId}-6`,
            requestId: updatedContract.requestId,
            name: 'التشطيبات النهائية وتسليم المفاتيح',
            status: 'PLANNED',
            progress: 0,
            totalDurationDays: 10,
            daysElapsed: 0,
            images: [],
            inspectionRequested: false,
            paymentReleased: false,
            paymentPercentage: updatedContract.paymentPercentages?.['التشطيبات النهائية وتسليم المفاتيح'] ?? 15
          }
        ];
      });

    showToast(
      lang === 'en'
        ? `📝 Contract updated and inspection scheduled (${updatedContract.inspectionDate}) for request ${updatedContract.requestId}!`
        : `📝 تم تحديث العقد وحجز موعد المعاينة (${updatedContract.inspectionDate}) للطلب ${updatedContract.requestId} بنجاح!`
    );

    // Notify client & contractor of contract update
    const req = requests.find(r => r.id === updatedContract.requestId);
    if (req) {
      const comp = companies.find(c => c.id === updatedContract.companyId);
      const companyUserId = comp ? comp.userId : 'USER-COMP-1';

      if (updatedContract.isSigned) {
        // Contract signed notification
        addNotification(
          req.clientId,
          '✍️ تم توقيع عقد التشطيب رسمياً • Contract Signed Successfully!',
          `تم توقيع عقد مشروعك رقم (${updatedContract.requestId}) بنجاح بقيمة إجمالية ${updatedContract.totalAmount.toLocaleString()} ج.م وسيتم رصد انطلاقة البنود الإنشائية مباشرة! • Your contract (${updatedContract.requestId}) has been signed officially by both parties. Let's build!`,
          updatedContract.requestId
        );
        addNotification(
          companyUserId,
          '✍️ تم توقيع العقد للمشروع • Contract Signed Successfully!',
          `تم إتمام وتوقيع عقد المشروع رقم (${updatedContract.requestId}) مع العميل بقيمة ${updatedContract.totalAmount.toLocaleString()} ج.م. يمكنك الآن البدء في التنفيذ الميداني لموقع التشطيب. • Contractor agreement has been signed. Begin physical development on-site.`,
          updatedContract.requestId
        );

        // 🚀 إشعار تأكيدي لكل من العميل والمقاول بالبدء الميداني الفعلي للمشروع
        addNotification(
          req.clientId,
          '🚀 البدء الفعلي لتنفيذ المشروع • Project Construction Commenced',
          `أهلاً بك! نسعد بإشعارك ببدء التنفيذ والإنتاج الفعلي الميداني لمشروع تشطيباتك ذي الرقم الكودي (${updatedContract.requestId}) رسمياً بالموقع! تم اعتماد خطط الجودة والضمان الثلاثي وإطلاق الجدول الزمني للبنود تحت الرقابة التقنية الكاملة لمنصة "شطبها" لضمان ثبات الأسعار وبأعلى معايير الإشراف الميداني المستقل. • Your project (${updatedContract.requestId}) construction has officially started! Execution is now active on layout.`,
          updatedContract.requestId
        );

        addNotification(
          companyUserId,
          '🛠️ التكليف الهندسي والبدء الميداني الفعلي للمشروع • Project Execution Launched',
          `شريك النجاح، تم اعتماد وتحويل الطلب الكودي رقم (${updatedContract.requestId}) رسمياً إلى مشروع نشط قيد التنفيذ الميداني الفعلي. للتنبيه، يرجى المباشرة الفورية باستلام الموقع وتنزيل المواد وتوجيه طاقم العمل ومطابقة المواصفات مع مهندس الإشراف الميداني المعتمد لمنصة "شطبها" والالتزام الكامل بالجدول الزمني بنسخة العقد. • Project (${updatedContract.requestId}) is officially live. Please organize raw materials and deploy execution teams directly.`,
          updatedContract.requestId
        );
      } else {
        // Meeting/Coordination scheduled
        addNotification(
          req.clientId,
          '📅 تحديد لقاء صياغة العقود • Tripartite Meeting Scheduled',
          `قامت الإدارة بجدولة اللقاء الفني وتنسيق العقود لمشروعك رقم (${updatedContract.requestId}) بتاريخ (${updatedContract.meetingDate}) مع الشركة المنفذة. • Joint coordination meeting has been scheduled for (${updatedContract.meetingDate}).`,
          updatedContract.requestId
        );
        addNotification(
          companyUserId,
          '📅 تحديد موعد اجتماع تنسيقي • Tripartite Meeting Scheduled',
          `تم جدولة لقاء مراجعة وتنسيق البنود ونسخة العقد للطلب رقم (${updatedContract.requestId}) مع العميل بتاريخ (${updatedContract.meetingDate}). • Coordination review meeting has been scheduled.`,
          updatedContract.requestId
        );
      }
    }
  };

  // COMPANY TRIGGERS: Submitting raw pricing offer
  const handleAddOffer = (newOffer: Offer) => {
    setOffers(prev => [newOffer, ...prev]);
    
    // Dynamically transition request status to OFFERS_RECEIVED so the client gets notified
    setRequests(prev =>
      prev.map(r => (r.id === newOffer.requestId ? { ...r, status: 'OFFERS_RECEIVED' } : r))
    );

    showToast(
      lang === 'en'
        ? `💰 Your pricing offer for request ${newOffer.requestId} was submitted successfully! It will appear anonymously.`
        : `💰 تم تقديم عرض الأسعار الخاص بك للطلب ${newOffer.requestId} بنجاح! سيظهر مجهول الهوية في حساب العميل.`
    );

    // Notify client of new pricing offer
    const req = requests.find(r => r.id === newOffer.requestId);
    if (req) {
      addNotification(
        req.clientId,
        '📥 عرض أسعار جديد مستلم • New Pricing Offer Received',
        `استلمت منصة شطبها عرض أسعار تنفسي جديد لطلبك رقم (${newOffer.requestId}) بقيمة إجمالية ${newOffer.price.toLocaleString()} ج.م من إحدى الشركات الموثقة. • You have received a new pricing offer of ${newOffer.price.toLocaleString()} EGP for tender (${newOffer.requestId}).`,
        newOffer.requestId
      );
    }
  };

  const handleUpdateOffer = (updatedOffer: Offer) => {
    setOffers(prev => prev.map(o => o.id === updatedOffer.id ? updatedOffer : o));
    
    showToast(
      lang === 'en'
        ? `✏️ Your pricing offer for request ${updatedOffer.requestId} was updated successfully!`
        : `✏️ تم تحديث وتعديل عرض الأسعار الخاص بك للطلب رقم ${updatedOffer.requestId} بنجاح!`
    );

    // Notify client of updated pricing offer
    const req = requests.find(r => r.id === updatedOffer.requestId);
    if (req) {
      addNotification(
        req.clientId,
        '✏️ عرض أسعار معدل مستلم • Pricing Offer Updated',
        `قامت شركة المقاولات بتعديل عرض أسعارها للطلب رقم (${updatedOffer.requestId}) بقيمة إجمالية ${updatedOffer.price.toLocaleString()} ج.م. • The contractor updated their price offer for your request (${updatedOffer.requestId}) to ${updatedOffer.price.toLocaleString()} EGP.`,
        updatedOffer.requestId
      );
    }
  };

  // Perform secure sign out and transition back to Home Landing Page
  const handleSignOut = () => {
    setActiveView('HOME');
    setIsAdminSession(false);
    sessionStorage.removeItem('shatibha_is_admin_mode');
    showToast(
      lang === 'en'
        ? '👋 Logged out successfully! You have been securely redirected to Shattebha public portal.'
        : '👋 تم تسجيل الخروج بنجاح! تم تحويلك بأمان إلى الواجهة الرئيسية لمنصة شطبها.'
    );
  };

  const handleSimulatePush = (type: 'OFFER' | 'STAGE_APPROVE' | 'STAGE_REJECT' | 'ESCROW') => {
    if (type === 'OFFER') {
      addNotification(
        'ID#4092',
        '💰 عرض أسعار جديد بقيمة 620,000 ج.م • New Pricing Offer: 620,000 EGP',
        `استلمت منصة شطبها عرض أسعار معتمد متكامل لطلبك رقم (REQ-001) من شركة LuxSpace Interiors المعتمدة لبدء تنفيذ التشطيب الفاخر. • LuxSpace Interiors submitted a comprehensive package quote for project (REQ-001) with gold-tier guarantees.`
      );
    } else if (type === 'STAGE_APPROVE') {
      addNotification(
        'ID#4092',
        '✅ اعتماد بند فني ومطابقة الأكواد • Stage Approved by Inspector',
        `تم فحص ومعاينة مرحلة (تأسيس السباكة والصرف) لمشروعك ميدانياً بواسطة الاستشاري م/ كريم الشناوي ووجد مطابقة للمواصفات والأكواد الفنية بنجاح! يمكنك الآن تحرير الدفعة بأمان لقيمة الضمان. • Site inspector Kareem approved the active sanitary stage for REQ-001. Safe to transfer escrow installment.`
      );
    } else if (type === 'STAGE_REJECT') {
      addNotification(
        'ID#4092',
        '❌ عيوب فنية ورفض استلام مرحلة • Stage Rejected by Inspector',
        `تم رفض إقرار استلام بند أعمال (الدهانات والتشطيبات) لوجود نسبة رطوبة مرتفعة وفواصل جيرية غائرة بالجدران؛ وجاري متابعة التوجيه الهندسي للتعديل وإعادة الملمس فوراً مع المقاول. • Site inspector rejected the active painting stage due to damp plastering. Contractor notified to fix.`
      );
    } else if (type === 'ESCROW') {
      addNotification(
        'USER-COMP-1',
        '💳 تم استلام دفعة مالية • Escrow Payment Received',
        `قام العميل بتحرير وصرف الدفعة المضمونة بمحفظة شطبها الضامنة لمرحلة (تأسيس الكهرباء والإنارة) لتسحب إلى حساب شركة LuxSpace بنجاح! • Ahmed Mohamed released his secured escrow installment for Stage 2 to your payout ledger.`
      );
    }
  };

  return (
    <div className="bg-[#F0F3F7] min-h-screen text-[#232F3F] font-sans flex flex-col antialiased">
      
      {/* Dynamic Push Notifications Toaster with sound feedback */}
      <PushNotificationToaster notifications={notifications} lang={lang} />

      {/* Demo Notification / Toast */}
      {toastMessage && (
        <div className="bg-[#D8B448] text-[#2B4D89] px-4 py-2 text-center text-xs font-bold leading-relaxed shadow border-b border-white/20 relative z-[1000] flex items-center justify-center gap-2">
          <span>🔔</span>
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="mr-3 bg-black/10 hover:bg-black/20 text-xs px-1.5 py-0.2 rounded font-mono font-bold cursor-pointer"
          >
            {lang === 'en' ? 'Hide' : 'إخفاء'}
          </button>
        </div>
      )}

      {/* 2. PERSPECTIVE RENDERING CONTAINER */}
      <main className="flex-1">
        {activeView === 'PORTAL_INSPECTOR' && (
          <PartnerPortalView
            companies={companies}
            inspectors={inspectors}
            lang={lang}
            portalType="INSPECTOR"
            onLoginSuccess={(role, id) => {
              setActiveView(role);
            }}
            onNavigateHome={() => setActiveView('HOME')}
          />
        )}

        {activeView === 'PORTAL_COMPANY' && (
          <PartnerPortalView
            companies={companies}
            inspectors={inspectors}
            lang={lang}
            portalType="COMPANY"
            onLoginSuccess={(role, id) => {
              setActiveView(role);
            }}
            onNavigateHome={() => setActiveView('HOME')}
          />
        )}

        {activeView === 'ADMIN_LOGIN' && (
          <AdminLoginView
            onLogin={(role) => setActiveView(role)}
            lang={lang}
            onBack={() => setActiveView('HOME')}
          />
        )}

        {activeView === 'HOME' && (
          <PublicHomeView
            onNavigateToDashboard={setActiveView}
            onAddCompany={handleAddCompany}
            onRegisterClient={handleRegisterClient}
            companiesCount={companies.filter(c => c.status === 'APPROVED').length}
            lang={lang}
            setLang={setLang}
            companies={companies}
          />
        )}

        {activeView === 'CLIENT' && (
          <ClientDashboardView
            requests={requests}
            offers={offers}
            companies={companies}
            contracts={contracts}
            onAddRequest={handleAddRequest}
            onAcceptOffer={handleAcceptOffer}
            onCancelAcceptOffer={handleCancelAcceptOffer}
            stages={stages}
            onUpdateStage={handleUpdateStage}
            lang={lang}
            setLang={setLang}
            onSignOut={handleSignOut}
            promoCodes={promoCodes}
            warranties={warranties}
            onUpdateWarranties={setWarranties}
            complaints={complaints}
            onUpdateComplaints={setComplaints}
            onUpdateRequest={handleUpdateRequest}
            auditLogs={auditLogs}
            onLogAudit={logAudit}
            inspectors={inspectors}
          />
        )}

        {activeView === 'COMPANY' && (
          <CompanyDashboardView
            companies={companies}
            requests={requests}
            offers={offers}
            onSubmitOffer={handleAddOffer}
            onUpdateOffer={handleUpdateOffer}
            stages={stages}
            onUpdateStage={handleUpdateStage}
            lang={lang}
            setLang={setLang}
            contracts={contracts}
            onUpdateRequest={handleUpdateRequest}
            onSignOut={handleSignOut}
            onUpdateCompany={handleUpdateCompany}
            warranties={warranties}
            onUpdateWarranties={setWarranties}
            complaints={complaints}
            onUpdateComplaints={setComplaints}
            onLogAudit={logAudit}
          />
        )}

        {activeView === 'INSPECTOR' && (
          <SiteInspectorDashboardView
            requests={requests}
            inspectors={inspectors}
            stages={stages}
            onUpdateStage={handleUpdateStage}
            lang={lang}
            setLang={setLang}
            onUpdateRequest={handleUpdateRequest}
            onSignOut={handleSignOut}
            warranties={warranties}
            onUpdateWarranties={setWarranties}
            complaints={complaints}
            onUpdateComplaints={setComplaints}
            onLogAudit={logAudit}
          />
        )}

        {activeView === 'ADMIN' && (
          <AdminDashboardView
            requests={requests}
            companies={companies}
            offers={offers}
            contracts={contracts}
            onApproveRequest={handleApproveRequest}
            onApproveCompany={handleApproveCompany}
            onSaveContract={handleSaveContract}
            onUpdateRequest={handleUpdateRequest}
            inspectors={inspectors}
            stages={stages}
            onUpdateProjectInspector={handleUpdateProjectInspector}
            onAddInspector={handleAddInspector}
            onUpdateInspectorsList={handleUpdateInspectorsList}
            onUpdateCompaniesList={setCompanies}
            lang={lang}
            setLang={setLang}
            onToggleVerifyCompany={handleToggleVerifyCompany}
            onUpdateCompanyRating={handleUpdateCompanyRating}
            onUpdateStage={handleUpdateStage}
            onSignOut={handleSignOut}
            promoCodes={promoCodes}
            onUpdatePromoCodes={setPromoCodes}
            warranties={warranties}
            onUpdateWarranties={setWarranties}
            complaints={complaints}
            onUpdateComplaints={setComplaints}
            auditLogs={auditLogs}
            onLogAudit={logAudit}
            notifications={notifications}
            onUpdateNotifications={setNotifications}
            onClearAllRequests={handleClearAllRequests}
          />
        )}

        {activeView === 'CLIENT_TERMS' && (
          <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-right" dir={lang === 'en' ? 'ltr' : 'rtl'}>
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative">
                <div className="absolute top-4 right-4 bg-[#D8B448]/20 text-[#D8B448] text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full border border-[#D8B448]/30">
                  {lang === 'en' ? 'CLIENT POLICIES' : 'سياسات العملاء'}
                </div>
                <div className="flex items-center gap-4 justify-start">
                  <div className="p-3 bg-[#D8B448]/20 rounded-2xl text-[#D8B448]">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <h1 className="text-xl sm:text-2xl font-black text-white">
                      {lang === 'en' ? 'Clients Terms & Conditions' : 'شروط الخدمة والاستخدام للعملاء'}
                    </h1>
                    <p className="text-xs text-gray-300 mt-1">
                      {lang === 'en' ? 'Last Updated: June 2026' : 'آخر تحديث للمحتوى المالي والفني: يونيو ٢٠٢٦'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 sm:p-10 space-y-6">
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-xs text-amber-900 leading-relaxed text-right">
                  📢 {lang === 'en' 
                    ? 'Note: These terms are live, and are fully managed and updated by Shatibha administration panel content team.' 
                    : 'تنبيه: هذه البنود خاضعة للتحديث الفوري ومصاغة إلكترونيًا بواسطة إدارة منصة شطبها لضمان التوازن وحماية النزاهة الهندسية.'}
                </div>

                <div className="prose max-w-none text-slate-700 text-sm leading-8 whitespace-pre-line font-medium text-right">
                  {getTranslation('clientTermsText', lang)}
                </div>

                <div className="pt-8 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>{lang === 'en' ? 'Official Platform Document' : 'وثيقة معتمدة ومحمية بموجب القانون'}</span>
                  </div>
                  <button
                    onClick={() => setActiveView('HOME')}
                    className="flex items-center gap-2 py-2.5 px-6 bg-[#2B4D89] hover:bg-[#1E3A68] text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    {lang === 'en' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    <span>{lang === 'en' ? 'Back to Portal' : 'الرجوع ومتابعة التصفح'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'COMPANY_TERMS' && (
          <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-right" dir={lang === 'en' ? 'ltr' : 'rtl'}>
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-150 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative">
                <div className="absolute top-4 right-4 bg-[#D8B448]/20 text-[#D8B448] text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full border border-[#D8B448]/30">
                  {lang === 'en' ? 'CONTRACTOR SERVICE LEVEL' : 'ميثاق شركات التشطيب'}
                </div>
                <div className="flex items-center gap-4 justify-start">
                  <div className="p-3 bg-[#D8B448]/20 rounded-2xl text-[#D8B448]">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <h1 className="text-xl sm:text-2xl font-black text-white">
                      {lang === 'en' ? 'Contractors Terms & Rules' : 'الشروط والأحكام لشركات ومكاتب التشطيب'}
                    </h1>
                    <p className="text-xs text-gray-300 mt-1">
                      {lang === 'en' ? 'Last Updated: June 2026' : 'آخر تحديث لمواصفات التشغيل والجاهزية: يونيو ٢٠٢٦'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 sm:p-10 space-y-6">
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-blue-900 leading-relaxed text-right">
                  📢 {lang === 'en' 
                    ? 'Note: These contractor directives form an integral part of the tripartite contract and quality check charters.' 
                    : 'تنبيه: تعد هذه البنود جزءاً لا يتجزأ من الميثاق الهندسي وبنود العقد الموحد الذي يتم توقيعه مع المقاولين المعتمدين.'}
                </div>

                <div className="prose max-w-none text-slate-700 text-sm leading-8 whitespace-pre-line font-medium text-right">
                  {getTranslation('contractorTermsText', lang)}
                </div>

                <div className="pt-8 border-t border-gray-150 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>{lang === 'en' ? 'Certified SLA Document' : 'اتفاقية مستوى الخدمة الموثقة'}</span>
                  </div>
                  <button
                    onClick={() => setActiveView('HOME')}
                    className="flex items-center gap-2 py-2.5 px-6 bg-[#2B4D89] hover:bg-[#1E3A68] text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    {lang === 'en' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    <span>{lang === 'en' ? 'Back to Portal' : 'الرجوع ومتابعة التصفح'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Universal Details Modal Overlay */}
      {viewingGlobalRequestId && (
        <GlobalProjectDetailsModal
          requestId={viewingGlobalRequestId}
          requests={requests}
          offers={offers}
          companies={companies}
          contracts={contracts}
          inspectors={inspectors}
          stages={stages}
          warranties={warranties}
          complaints={complaints}
          lang={lang}
          activeView={activeView}
          onClose={() => setViewingGlobalRequestId(null)}
          onGoToDashboard={(view, targetReqId) => {
            setActiveView(view);
            if (targetReqId) {
              // Dispatch change event to all dashboard views of active/selected request changes
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('shatibha-active-request-changed', { detail: targetReqId }));
              }, 100);
            }
          }}
        />
      )}

      {/* ✨ Global Floating AI Assistant Widget with Custom Animated AdamAvatar - Draggable to prevent UI blocking */}
      <motion.div 
        drag
        dragConstraints={{ left: -15, right: windowDimensions.width - 90, top: -windowDimensions.height + 90, bottom: 15 }}
        dragElastic={0.15}
        dragMomentum={false}
        whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
        className="fixed bottom-6 left-6 z-50 font-sans cursor-grab active:cursor-grabbing touch-none select-none"
      >
        {!isAssistantOpen && (
          <div className="relative flex flex-col items-center">
            {/* Interactive Hover Welcome Message Bubble */}
            {avatarHovered && (
              <div 
                className={`absolute bottom-28 left-0 bg-slate-900/95 dark:bg-slate-950/98 backdrop-blur-xl text-white p-5 rounded-3xl shadow-[0_25px_60px_-15px_rgba(30,58,138,0.5)] border border-white/10 w-[260px] animate-fade-in-up md:block hidden pointer-events-none ${
                  lang === 'en' ? 'text-left' : 'text-right'
                }`}
                dir={lang === 'en' ? 'ltr' : 'rtl'}
              >
                {/* Micro pointer pointing to the avatar */}
                <div className="absolute bottom-[-8px] left-8 w-4 h-4 bg-slate-900 dark:bg-slate-950 border-r border-b border-white/10 transform rotate-45"></div>
                
                <div className="flex items-center gap-2 justify-start mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">
                    {lang === 'en' ? 'LIVE ADVISOR' : 'مستشار نشط'}
                  </span>
                </div>

                <p className="font-extrabold text-[#D8B448] text-xs mb-1.5">
                  {lang === 'en' ? 'Adam is ready for you 👋' : 'المهندس آدم يرحب بك 👋'}
                </p>
                <p className="text-[11px] leading-relaxed font-semibold text-slate-200">
                  {lang === 'en' 
                    ? "Hello! I am Adam, your smart finishing assistant. How can I facilitate your project today?" 
                    : "مرحباً بك! أنا م/ آدم، مستشارك الفني الذكي لمتابعة مراحل التشطيب وتدقيق المقايسات وتفادي التلاعب."}
                </p>
              </div>
            )}

            {/* Float Trigger Button containing the Vector Animated Avatar */}
            <motion.button
              onTap={() => {
                setIsAssistantOpen(true);
                setAvatarHovered(false);
              }}
              onMouseEnter={() => setAvatarHovered(true)}
              onMouseLeave={() => setAvatarHovered(false)}
              type="button"
              className="bg-transparent border-0 outline-none cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-108 active:scale-95 group relative w-24 h-24 sm:w-28 sm:h-28 adam-active-breathing rounded-full"
            >
              {/* Intelligent multi-layered compass-like aura rings backplate */}
              <span className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#2C4A86]/20 to-amber-500/10 border-2 border-[#2C4A86]/20 dark:border-[#D8B448]/15 adam-pulse-ring-outer pointer-events-none"></span>
              <span className="absolute w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-bl from-amber-500/10 to-[#2c4a86]/10 border border-[#D8B448]/20 dark:border-[#2C4A86]/15 adam-pulse-ring-inner pointer-events-none"></span>

              {/* Glowing notification status indicator */}
              <span className="absolute top-2 right-2 flex h-5 w-5 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D8B448] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 border-2 border-white dark:border-slate-900"></span>
              </span>
              
              {/* Outer decorative high-fidelity spinning guide ring */}
              <div className="absolute inset-1 rounded-full border border-dashed border-[#2B4D89]/20 group-hover:border-amber-500/40 animate-[spin_30s_linear_infinite] pointer-events-none"></div>

              <div className="w-22 h-22 sm:w-26 sm:h-26 flex items-center justify-center relative">
                <AdamAvatar 
                  state={avatarHovered ? 'hover' : 'idle'} 
                  style={avatarStyle} 
                  theme={darkMode ? 'dark' : 'light'} 
                  className="w-20 h-20 sm:w-24 sm:h-24 filter drop-shadow-[0_12px_20px_rgba(43,77,137,0.35)]"
                />
              </div>

              {/* Tiny Expand Pill Indicator restyled dynamically to world-class level */}
              <span className="absolute bottom-1 bg-gradient-to-r from-[#213555] via-[#2B4D89] to-[#1E3A68] text-[9.5px] text-white dark:text-[#D8B448] px-3.5 py-1 rounded-full font-black tracking-wider shadow-lg border border-white/20 whitespace-nowrap opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all group-hover:shadow-[0_0_15px_rgba(216,180,72,0.45)]">
                {lang === 'en' ? '★ CONSULT ADAM' : '🏠 اسأل آدم الآن'}
              </span>
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Fully-Immersive centered modal for the Expanded AI Assistant wrapped in high-end Framer Motion AnimatePresence & spring layout transition */}
      <AnimatePresence>
        {isAssistantOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-md z-50 font-sans text-right flex items-end sm:items-center justify-center p-0.5 sm:p-4"
            onClick={() => setIsAssistantOpen(false)}
          >
            <motion.div 
              layout="position"
              initial={{ opacity: 0, y: 120, scale: 0.94, rotate: -2 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 100, scale: 0.94, rotate: 1.5 }}
              transition={{ 
                type: 'spring', 
                damping: 30, 
                stiffness: 240, 
                mass: 0.85 
              }}
              className={`fixed left-2 bottom-2 sm:left-4 sm:bottom-4 md:left-6 md:bottom-6 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] bg-white/75 dark:bg-slate-900/80 backdrop-blur-3xl rounded-3xl border border-white/25 dark:border-slate-800/60 shadow-[0_32px_80px_-15px_rgba(15,23,42,0.45)] overflow-hidden flex flex-col text-right ${
                showPricesPanel 
                  ? 'max-w-[1100px] h-[92vh] max-h-[760px]' 
                  : 'max-w-[550px] h-[78vh] max-h-[580px]'
              }`}
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              {/* Expanded Header with Real-Time Model Selector */}
              <div className="bg-gradient-to-r from-[#2B4D89]/92 via-[#1E3A68]/92 to-[#1A2F50]/92 p-4 text-white relative shrink-0 border-b border-white/10 backdrop-blur-md">
              <div className="absolute top-4 right-4 z-40">
                <button
                  onClick={() => setIsAssistantOpen(false)}
                  className="bg-black/35 hover:bg-rose-600 border border-white/10 hover:border-rose-500 text-white p-2 rounded-full cursor-pointer transition-all flex items-center justify-center shadow-lg active:scale-95 duration-200"
                  title={lang === 'en' ? 'Close Assistant' : 'إغلاق المساعد (X)'}
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              <div className="flex items-center gap-3 justify-start flex-row-reverse pr-12">
                {/* Embedded Live Avatar in the header */}
                <div className="w-16 h-16 bg-white/5 dark:bg-black/20 rounded-2xl flex items-center justify-center p-1 border border-white/10 shrink-0 shadow-lg backdrop-blur-md transition-all group hover:scale-105">
                  <AdamAvatar 
                    state={assistantLoading ? 'thinking' : isRespondingState ? 'responding' : 'active'} 
                    style={avatarStyle} 
                    theme="dark" 
                    className="w-14 h-14 filter drop-shadow-[0_4px_8px_rgba(216,180,72,0.15)]"
                  />
                </div>
                <div className="text-right flex-1 min-w-0">
                  <h4 className="font-bold text-[#D8B448] text-xs sm:text-sm flex items-center gap-1.5 justify-end">
                    <span>{lang === 'en' ? 'Consultant Architect Adam' : 'المهندس الاستشاري آدم'}</span>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </h4>
                  <p className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                    {lang === 'en' 
                      ? 'AI Engineering Consultant (Gemini 3.5 Pro Base)' 
                      : 'مساعد الأعمال الذكي المتكامل للتدقيق وتفادي غش المقاولين'}
                  </p>
                </div>
              </div>
            </div>

            {/* NEW RESPONSIVE SYSTEM WORKSPACE */}
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#2B4D89]/20 flex-1 overflow-hidden">
              {/* PANEL COLUMN - LEFT SIDE IN RTL. Shows when showPricesPanel is true */}
              {showPricesPanel && (
                <div className="w-full md:w-[410px] shrink-0 flex flex-col overflow-hidden bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-l border-gray-150 dark:border-slate-850 animate-slide-in">
                  <SmartAdamPanel
                    activeView={activeView}
                    lang={lang}
                    darkMode={darkMode}
                    requests={requests}
                    companies={companies}
                    offers={offers}
                    contracts={contracts}
                    complaints={complaints}
                    onSendMessage={handleSendAdamProgrammatically}
                    onAddRequest={handleAddRequestFromAdam}
                    onAddNotification={handleAddNotificationFromAdam}
                    onClose={() => setShowPricesPanel(false)}
                  />
                </div>
              )}

              {/* CHAT BUBBLES COLUMN - Right side, occupies full width if Price panel is closed */}
              <div className={`flex-1 flex flex-col bg-slate-50/45 dark:bg-slate-950/25 overflow-hidden ${showPricesPanel ? 'hidden md:flex' : 'flex'}`}>
                <div className="bg-gradient-to-r from-slate-100/90 to-slate-50/90 dark:from-slate-900/90 dark:to-slate-950/90 p-3.5 text-xs font-black text-[#2B4D89] dark:text-[#93C5FD] border-b border-gray-150 dark:border-slate-850 flex items-center justify-between shrink-0" dir="rtl">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>{lang === 'en' ? 'Direct AI Assistant Chat' : 'المستشار الهندسي آدم (نشط الآن)'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* NEW DYNAMIC PRICES BUTTON */}
                    <button
                      onClick={() => setShowPricesPanel(!showPricesPanel)}
                      className={`flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-xl cursor-pointer transition-all border shadow-sm active:scale-95 ${
                        showPricesPanel
                          ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400/20'
                          : 'bg-amber-500 hover:bg-amber-600 text-[#121B28] border-amber-400/20'
                      }`}
                      title={lang === 'en' ? 'Open Material Prices' : 'فتح بورصة أسعار الخامات 🏗️'}
                    >
                      <span>{showPricesPanel ? '✕' : '🏗️'}</span>
                      <span>{showPricesPanel ? (lang === 'en' ? 'Close Prices' : 'إغلاق الأسعار') : (lang === 'en' ? 'Material Rates' : 'أسعار الخامات')}</span>
                    </button>

                    <div className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[9px] px-2 py-0.5 rounded-full font-black border border-orange-500/20 uppercase tracking-widest leading-none">
                      {lang === 'en' ? 'Verified' : 'معتمد'}
                    </div>
                  </div>
                </div>

                {/* Chats Container with Architect Dotted Grid background */}
                <div 
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#273549_1.2px,transparent_1.2px)] [background-size:18px_18px]" 
                  dir="rtl"
                >
                  {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'} animate-fade-in-up`}>
                      {/* Role Header Badge */}
                      <span className="text-[9.5px] font-black tracking-wide text-gray-400 dark:text-slate-500 mb-1 px-1 flex items-center gap-1">
                        {m.role === 'user' ? (
                          <>
                            <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
                            <span>{lang === 'en' ? 'You (Client)' : '💬 أنت (صاحب المشروع)'}</span>
                          </>
                        ) : (
                          <>
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            <span className="text-amber-600 dark:text-[#D8B448] font-bold">{lang === 'en' ? 'Eng. Adam (Consultant)' : '🛡️ م/ آدم • المستشار الهندسي المعتمد'}</span>
                          </>
                        )}
                      </span>

                      {/* Bubble with drop-shadow and sophisticated curves */}
                      <div className={`p-4 rounded-3xl max-w-[88%] text-[11.5px] leading-relaxed text-right whitespace-pre-line tracking-wide transition-all duration-300 font-medium ${
                        m.role === 'user' 
                          ? 'bg-gradient-to-br from-[#2B4D89] to-[#1E3A68] text-white rounded-tl-none font-semibold shadow-md hover:shadow-lg border border-[#2B4D89]/20' 
                          : 'bg-white dark:bg-slate-850 text-[#1E293B] dark:text-slate-100 rounded-tr-none border-r-4 border-r-[#D8B448] border-y border-l border-gray-150/90 dark:border-slate-800/85 shadow-md hover:shadow-lg'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {assistantLoading && (
                    <div className="flex flex-col items-end">
                      <span className="text-[9.5px] font-black tracking-wide text-[#D8B448] mb-1 px-1 flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                        <span>{lang === 'en' ? 'Adam is writing...' : 'آدم يراجع المواصفات والمقايسة...'}</span>
                      </span>
                      <div className="flex items-center gap-1.5 justify-end py-3 px-4 bg-white dark:bg-slate-850 rounded-2xl rounded-tr-none border-r-4 border-r-[#D8B448] border-y border-l border-gray-150 dark:border-slate-800 w-28 self-end animate-pulse">
                        <span className="block w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce"></span>
                        <span className="block w-2.5 h-2.5 bg-[#2B4D89] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="block w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Horizontal scroll of Suggested Quick Questions */}
                <div className="px-3.5 py-2.5 bg-slate-100/40 dark:bg-slate-950/20 border-t border-gray-150/25 dark:border-slate-850/25 flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar" dir="rtl">
                  {[
                    { text: lang === 'en' ? 'EGP building cost per meter?' : 'كم تكلفة بناء المتر المربع اليوم بمصر؟', icon: '🏗️' },
                    { text: lang === 'en' ? 'Avoid contractor fraud?' : 'كيف أتفادى غش المقاول بالحديد والأسمنت؟', icon: '🛡️' },
                    { text: lang === 'en' ? 'Shatibha Escrow Safety?' : 'الضمان المالي وعقد شطبها الثلاثي؟', icon: '🔒' },
                    { text: lang === 'en' ? 'Finishing inspection specs?' : 'ما مواصفات استلام المحارة والكهرباء؟', icon: '📐' },
                    { text: lang === 'en' ? 'Show live material prices' : 'أريد حساب كمية في بورصة الخامات', icon: '📈' }
                  ].map((item, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => {
                        if (item.text.includes('بورصة') || item.text.includes('material prices')) {
                          setShowPricesPanel(true);
                        } else {
                          handleSendAssistantMessage(item.text);
                        }
                      }}
                      className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-705 dark:text-slate-200 hover:text-[#2B4D89] dark:hover:text-[#93C5FD] transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-3xs"
                    >
                      <span className="text-[11px]">{item.icon}</span>
                      <span>{item.text}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Dynamic Predictive Autocomplete Banner with interactive glass style */}
                <AnimatePresence>
                  {activePrediction && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-3.5 py-2 bg-amber-500/5 dark:bg-amber-500/10 border-t border-amber-200/30 dark:border-amber-500/15 flex items-center justify-between text-right flex-row-reverse backdrop-blur-md"
                      dir="rtl"
                    >
                      <div className="flex items-center gap-1.5 flex-row-reverse text-right overflow-hidden">
                        <span className="text-[8.5px] text-amber-700 dark:text-amber-300 font-extrabold bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 rounded-md shrink-0 block">
                          🔮 {lang === 'en' ? 'Smart Auto' : 'توقع ذكي'}
                        </span>
                        <button
                          onClick={() => setAssistantInput(activePrediction)}
                          type="button"
                          className="text-[10px] font-black text-[#2B4D89] dark:text-amber-200 text-right hover:underline truncate transition-all cursor-pointer block"
                          title={lang === 'en' ? 'Click to fill' : 'انقر لإكمال الجملة'}
                        >
                          {activePrediction}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setAssistantInput(activePrediction)}
                          type="button"
                          className="text-[9px] font-black text-amber-700 dark:text-amber-300 cursor-pointer hover:bg-amber-100/70 dark:hover:bg-amber-500/20 bg-amber-50/50 dark:bg-slate-900 border border-amber-200/40 dark:border-slate-800 px-2 py-0.5 rounded-lg shrink-0 shadow-3xs transition-all"
                        >
                          {lang === 'en' ? 'Fill (Tab)' : 'إكمال (Tab)'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input area with high-end premium glass framing */}
                <div className="p-3.5 bg-white/50 dark:bg-slate-950/45 border-t border-gray-150/40 dark:border-slate-850/40 flex items-center gap-2.5 shrink-0 backdrop-blur-md" dir="rtl">
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'Ask about rates or warranties...' : 'اسألني عن كلفة المتر، معجون الجدران، أو عقود الشركاء...'}
                    value={assistantInput}
                    onChange={e => setAssistantInput(e.target.value)}
                    onKeyDown={e => { 
                      if (e.key === 'Tab' && activePrediction) {
                        e.preventDefault();
                        setAssistantInput(activePrediction);
                      } else if (e.key === 'Enter') {
                        handleSendAssistantMessage(); 
                      }
                    }}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl px-4 py-3 text-xs outline-none focus:border-[#2B4D89] dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 text-right font-medium transition-all duration-250 placeholder-gray-400 text-gray-800 dark:text-gray-100 placeholder-font-medium shadow-3xs"
                  />
                  <button
                    onClick={() => handleSendAssistantMessage()}
                    disabled={assistantLoading || !assistantInput.trim()}
                    className="bg-[#2B4D89] hover:bg-[#1C335B] active:scale-95 disabled:bg-gray-150 dark:disabled:bg-slate-800 disabled:text-gray-400 text-white p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md hover:shadow-lg disabled:shadow-none hover:bg-gradient-to-br hover:from-[#2B4D89] hover:to-[#1a2e55]"
                  >
                    <Send className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    </div>
  );
}
