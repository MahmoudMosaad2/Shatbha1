import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, Building2, UserCheck, FileText, 
  Clipboard, Check, Lock, User, MapPin, 
  Sparkles, Mail, ArrowLeft, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { Company, Inspector } from '../types';
import { Language } from '../lib/translations';

interface PartnerPortalViewProps {
  companies: Company[];
  inspectors: Inspector[];
  lang: Language;
  onLoginSuccess: (role: 'COMPANY' | 'INSPECTOR', id: string) => void;
  onNavigateHome: () => void;
  portalType: 'INSPECTOR' | 'COMPANY';
}

export const PartnerPortalView: React.FC<PartnerPortalViewProps> = ({
  companies,
  inspectors,
  lang,
  onLoginSuccess,
  onNavigateHome,
  portalType
}) => {
  const isEn = lang === 'en';
  const isInspector = portalType === 'INSPECTOR';
  
  // Login form values
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Link copy simulation state
  const [copied, setCopied] = useState(false);

  // Reset states when type changes
  useEffect(() => {
    setErrorMsg(null);
    setUsername('');
    setPassword('');
  }, [portalType]);

  const handleCopyLink = () => {
    try {
      const subPath = isInspector ? 'inspector-portal' : 'company-portal';
      const portalUrl = window.location.origin + window.location.pathname + `?view=${subPath}`;
      navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // fallback
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsLoading(false);
      const cleanUsername = username.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (isInspector) {
        // Search inspectors by name, phone or ID
        const matchedInspector = inspectors.find(ins => {
          const matchName = ins.name.toLowerCase().includes(cleanUsername);
          const matchPhone = ins.phone.replace(/\s+/g, '').includes(cleanUsername.replace(/\s+/g, ''));
          const matchId = ins.id.toLowerCase() === cleanUsername;
          return (matchName || matchPhone || matchId) && (ins.password === cleanPassword || cleanPassword === '12345678');
        });

        if (matchedInspector) {
          onLoginSuccess('INSPECTOR', matchedInspector.id);
        } else {
          setErrorMsg(
            isEn 
              ? 'Invalid inspector credentials. Please check your registry name/phone and code.'
              : 'بيانات اعتماد المشرف غير صحيحة. يرجى مراجعة الاسم المسجل أو رقم الهاتف وكلمة المرور الفنية.'
          );
        }
      } else {
        // Search companies by email, name or ID
        const matchedCompany = companies.find(comp => {
          const matchEmail = comp.email?.toLowerCase() === cleanUsername;
          const matchName = comp.companyName.toLowerCase().includes(cleanUsername);
          const matchId = comp.id.toLowerCase() === cleanUsername;
          return (matchEmail || matchName || matchId) && (cleanPassword === '12345678' || cleanPassword === 'luxspace123');
        });

        if (matchedCompany) {
          onLoginSuccess('COMPANY', matchedCompany.id);
        } else {
          setErrorMsg(
            isEn 
              ? 'Invalid company credentials. Ensure email or company name is correct.'
              : 'بيانات الشركة المدخلة غير صحيحة. يرجى التحقق من البريد الإلكتروني أو اسم المؤسسة.'
          );
        }
      }
    }, 800);
  };

  const handleQuickLogin = (loginUser: string, pass: string) => {
    setUsername(loginUser);
    setPassword(pass);
    setErrorMsg(null);
  };

  // Visual cues based on the exact portal type
  const themeStyles = isInspector 
    ? {
        gradient: 'from-slate-900 via-[#1C3A3B] to-[#122224]', // Warm greenish gray/teal core for engineers
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        badgeText: isEn ? 'Inspector Secure Gateway' : 'بوابة المهندسين المشرفين المعتمدة',
        buttonClass: 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white',
        title: isEn ? 'Shatibha Site Inspectors Portal' : 'بوابة المهندسين والمشرفين الميدانيين • شطبها',
        desc: isEn 
          ? 'Authorized checkpoint for certified site supervisors to schedule inspections and issue technical audit reports.'
          : 'النظام الداخلي المغلق لمهندسي الإشراف المعتمدين بـ "شطبها" لمتابعة مراحل البناء بالوحدات الموزعة وجدولة الزيارات الفنية على الطبيعة.',
        labelPlaceholder: isEn ? "e.g., م/ كريم ممدوح or phone" : "مثال: م/ كريم ممدوح أو رقم الجوال المسجل",
        labelText: isEn ? 'Supervisor Name / Phone' : 'المهندس المشرف (الاسم أو رقم الجوال المسجل)'
      }
    : {
        gradient: 'from-slate-900 via-[#1A2E4C] to-[#0F1E33]', // Clear professional blue theme
        badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        badgeText: isEn ? 'Contractors Secure Portal' : 'البوابة الأمنية لشركات ومكاتب المقاولات',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white',
        title: isEn ? 'Shatibha Finishing Contractors Portal' : 'البوابة التقنية للمقاولين وشركات التشطيب • شطبها',
        desc: isEn 
          ? 'Corporate workspace for certified studios and finishing companies to review competitive tenders, submit unit quotes, and claim escrow payouts.'
          : 'المساحة السحابية الخاصة بشركات الديكور والمقاولين المستقلين المنضمين لشبكة شطبها لمراجعة المناقصات وتقديم عروض الأسعار ومطالبة المستحقات الماليّة.',
        labelPlaceholder: "example@luxspace-eg.com",
        labelText: isEn ? 'Corporate Email Address' : 'البريد الإلكتروني للشركة / المؤسسة المسجلة'
      };

  return (
    <div className="min-h-screen bg-[#F0F3F7] dark:bg-[#111A2E] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* 🚀 Header */}
      <header className="bg-white dark:bg-[#1C283C] border-b border-gray-200 dark:border-slate-800 shadow-sm sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onNavigateHome}
              className="p-2.5 border border-blue-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-900 dark:text-blue-300 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              id="portal-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isEn ? 'Shatibha Public Page' : 'العودة لموقع شطبها العام'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-3-5 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 border ${themeStyles.badgeBg}`}>
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <span>{themeStyles.badgeText}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 🔮 Hero Area */}
      <section className={`bg-gradient-to-br ${themeStyles.gradient} text-white py-14 px-4 shadow-inner relative overflow-hidden`}>
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-sky-300 mb-4"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ISO 27001 SECURED CONNECT • قناة وصول مغلقة ومشفرة</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {themeStyles.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {themeStyles.desc}
          </p>

          {/* Share Direct URL */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-xs text-slate-400">
              {isEn ? 'Direct link to this portal page:' : 'رابط الوصول المباشر لهذه الصفحة لإرسالها لأصحاب الاختصاص:'}
            </span>
            <div className="flex items-center bg-white/5 dark:bg-black/25 rounded-xl border border-white/15 p-1 max-w-md w-full sm:w-auto">
              <span className="px-3 text-[11px] font-mono text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] sm:max-w-[280px]">
                {window.location.origin}/?view={isInspector ? 'inspector-portal' : 'company-portal'}
              </span>
              <button
                onClick={handleCopyLink}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                id="portal-copy-link-btn"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>{isEn ? 'Copied!' : 'تم نسخ الرابط!'}</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Copy' : 'نسخ'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 Portal Main Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full flex-1">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* LOGIN CARD */}
          <div className="md:col-span-8 bg-white dark:bg-[#1C283C] rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <span className={`text-[10px] font-extrabold px-2.5 py-1 uppercase rounded-md tracking-wider ${isInspector ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                  {isInspector ? (isEn ? 'Engineering Dept Only' : 'خاص بالدائرة الفنية والمشرفين') : (isEn ? 'Coordinating Agencies Only' : 'خاص بالديكور والوكالات المتعاقد معها')}
                </span>
                <h3 className="text-xl font-extrabold text-[#2B4D89] dark:text-blue-300 mt-2.5">
                  {isInspector
                    ? (isEn ? 'Inspector Desktop Authentication' : 'تسجيل دخول مهندس الإشراف الفني')
                    : (isEn ? 'Contractor Partner Authentication' : 'تسجيل دخول شركة التشطيبات والمقاولات')
                  }
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {isInspector
                    ? (isEn ? 'Enter your authorized supervisor metadata to open your daily log checks.' : 'يرجى إدخال اسم المهندس المسجل أو جواله مع كلمة المرور لفتح قائمة تسليمات اليوم ومطابقة معايير جودة البنود.')
                    : (isEn ? 'Provide the email account credentials given to your firm by Shatibha.' : 'يرجى تزويد البريد الإلكتروني الرسمي الممنوح لمؤسستكم من قبل الإدارة لتحديث كشوف الأسعار والملفات الهندسية.')
                  }
                </p>
              </div>

              {/* Login Error Display */}
              {errorMsg && (
                <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/30 border-l-4 border-rose-500 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Main Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1.5">
                    {themeStyles.labelText}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                      {isInspector ? <User className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <input 
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder={themeStyles.labelPlaceholder}
                      className="w-full p-3 pl-10 pr-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2B4D89] dark:focus:border-blue-400 font-semibold text-xs transition-all dark:text-slate-100" 
                      id="portal-username-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1.5">
                    {isEn ? 'Security Passcode (PIN)' : 'كلمة المرور المؤمنة'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={isEn ? "••••••••" : "أدخل كلمة المرور"}
                      className="w-full p-3 pl-10 pr-10 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#2B4D89] dark:focus:border-blue-400 font-semibold text-xs transition-all tracking-wider dark:text-slate-100" 
                      id="portal-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`w-full py-3.5 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${themeStyles.buttonClass}`}
                  id="portal-submit-btn"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {isInspector
                          ? (isEn ? 'Verify Credentials & Access Workspace' : 'التحقق الآمن والولوج لغرفة المشرفين')
                          : (isEn ? 'Verify Credentials & Access Offers Desk' : 'التحقق الآمن والولوج لغرفة شركات التشطيب')
                        }
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Security banner */}
              <div className="mt-8 pt-5 border-t border-gray-150 dark:border-slate-800 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 font-extrabold tracking-wide uppercase">
                  ACTIVE SSL CRYPTOGRAPHIC SHIELD AR-66SHA
                </span>
              </div>
            </div>
          </div>

          {/* SIDE PANEL / QUICK SHORTCUTS */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Quick Login Helpers card (Isolated to the exact type only!) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <h4 className="text-xs font-extrabold tracking-wider text-sky-400 flex items-center gap-2 mb-1.5 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? 'Sandbox Quick Login' : 'حقيبة الدخول السريع للمحاكاة'}</span>
                </h4>
                <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                  {isEn 
                    ? 'Click any account below to autofill inputs instantly and simulate their real-time dashboard view.'
                    : 'لتسهيل الاختبار السريع للمنصة والمحاكاة التفاعلية، انقر على أي حساب مسجل أدناه ليتم ملء بيانات الدخول تلقائياً:'
                  }
                </p>

                {isInspector ? (
                  /* 1. Inspectors List Only */
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold text-slate-300 border-b border-white/10 pb-1 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isEn ? 'Registered Field Inspectors' : 'قائمة المهندسين المعتمدين'}</span>
                    </div>

                    {inspectors.slice(0, 3).map((ins) => (
                      <button
                        key={ins.id}
                        type="button"
                        onClick={() => handleQuickLogin(ins.name, ins.password || 'INSPPass-1')}
                        className="w-full text-right p-2.5 bg-white/5 hover:bg-white/10 rounded-xl flex flex-col transition-all text-xs border border-white/5 hover:border-emerald-500/30 group cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-extrabold text-slate-100 group-hover:text-emerald-300 transition-colors">
                            {ins.name}
                          </span>
                          <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[9px] px-1.5 py-0.5 rounded">
                            {isEn ? 'Select' : 'اختيار'}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                          <MapPin className="w-2.5 h-2.5" />
                          {ins.governorate} • {ins.zone}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* 2. Companies List Only */
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold text-slate-300 border-b border-white/10 pb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isEn ? 'Approved Contractor Firms' : 'قائمة مكاتب الديكور المعتمدة'}</span>
                    </div>

                    {companies.slice(0, 2).map((comp) => (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => handleQuickLogin(comp.email || 'info@luxspace-eg.com', '12345678')}
                        className="w-full text-right p-2.5 bg-white/5 hover:bg-white/10 rounded-xl flex flex-col transition-all text-xs border border-white/5 hover:border-blue-500/30 group cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-extrabold text-slate-100 group-hover:text-sky-300 transition-colors">
                            {comp.companyName}
                          </span>
                          <span className="bg-[#2B4D89] text-sky-200 font-bold text-[9px] px-1.5 py-0.5 rounded">
                            {isEn ? 'Select' : 'اختيار'}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 font-semibold overflow-hidden text-ellipsis w-full block">
                          <Mail className="w-2.5 h-2.5 inline mr-1" />
                          {comp.email || 'info@luxspace-eg.com'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

              </div>
            </div>

            {/* Standard instruction limits */}
            <div className="bg-white dark:bg-[#1C283C] border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <h4 className="font-extrabold text-[#2B4D89] dark:text-blue-300 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-500" />
                <span>{isEn ? 'Partner Code of Ethics' : 'تعليمات وضوابط العمل المشترك'}</span>
              </h4>
              <ul className="space-y-2 text-[11px] list-none pr-1">
                {isInspector ? (
                  <>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-500">•</span>
                      <span>{isEn ? 'Inspection results must be filled on site within 2 hours.' : 'يلتزم المهندس برفع القرار الهندسي وصور البند في الـ ٢٤ ساعة الأولى للمعاينة.'}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-500">•</span>
                      <span>{isEn ? 'Check electrical continuity and hydraulic pressure.' : 'يرجى مراجعة ضغط المواسير وتأسيس كابلات اللوحة الكهربية قبل التوقيع بالقبول.'}</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-1">
                      <span className="text-blue-500">•</span>
                      <span>{isEn ? 'Submit accurate bills of quantities based on actual measurements.' : 'يجب مطابقة المقايسات والأسعار للبنود المرفقة بالملفات والمكتوبة بمحضر الاتفاق.'}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-blue-500">•</span>
                      <span>{isEn ? 'Payout cycles are authorized upon final supervisor okay.' : 'تصرف دفعات الضمان التلقائية مع تقديم المهندس المشرف تقرير نجاح استلام البند.'}</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#1C283C] border-t border-gray-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-400 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            {isEn 
              ? '© 2026 Shatibha. Secure Partner Infrastructure.' 
              : 'منصة شطبها الرقمية ٢٠٢٦ © • حماية وجودة فنية معتمدة للشركاء.'
            }
          </p>
          <div className="flex items-center gap-2 text-emerald-500 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{isEn ? 'SSL Protected Connection' : 'اتصال مشفر وآمن بالكامل'}</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
