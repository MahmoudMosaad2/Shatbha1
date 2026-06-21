import React, { useState } from 'react';
import { Eye, Info, RefreshCw, Sun, Moon } from 'lucide-react';
import { Language, getTranslation } from '../lib/translations';
import { NotificationCenter } from './NotificationCenter';
import { Notification } from '../types';
import { ShattabhaLogo } from './ShattabhaLogo';

interface PresentationToolbarProps {
  activeView: 'HOME' | 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR' | 'PORTAL_INSPECTOR' | 'PORTAL_COMPANY';
  setActiveView: (view: 'HOME' | 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR' | 'PORTAL_INSPECTOR' | 'PORTAL_COMPANY') => void;
  resetState: () => void;
  clearAllRequests?: () => void;
  requestsCount: number;
  offersCount: number;
  lang: Language;
  setLang: (lang: Language) => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllAsRead: (userIdsToRead: string[]) => void;
  onDeleteNotification: (id: string) => void;
  onSimulatePush?: (type: 'OFFER' | 'STAGE_APPROVE' | 'STAGE_REJECT' | 'ESCROW') => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
}

export const PresentationToolbar: React.FC<PresentationToolbarProps> = ({
  activeView,
  setActiveView,
  resetState,
  clearAllRequests,
  requestsCount,
  offersCount,
  lang,
  setLang,
  notifications,
  onMarkRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onSimulatePush,
  darkMode = false,
  setDarkMode
}) => {
  const isEn = lang === 'en';
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return window.innerWidth < 768; // collapse by default on mobile & tablets (under 768px wide)
    } catch {
      return false;
    }
  });

  if (isCollapsed) {
    return (
      <div id="demo-presentation-toolbar" className={`bg-[#232F3F] text-white border-b-2 border-[#D8B448] px-4 py-2 sticky top-0 z-[2000] text-xs transition-all duration-200 ${isEn ? 'text-left' : 'text-right'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShattabhaLogo className="w-5 h-5" iconOnly={true} />
            <span className="font-extrabold text-white">
              {isEn ? 'Shattabha Demo Simulation' : 'شطبها - شريط المحاكاة'}
            </span>
            <span className="hidden sm:inline-block text-gray-400 text-[10px] bg-slate-800 text-[#D8B448] px-2 py-0.5 rounded-full font-bold">
              {isEn ? `Active View: ${activeView}` : `الدور النشط: ${
                activeView === 'HOME' ? 'الموقع العام' : 
                activeView === 'CLIENT' ? 'العميل (أحمد)' : 
                activeView === 'COMPANY' ? 'المقاول (LuxSpace)' : 
                activeView === 'INSPECTOR' ? 'المشرف الهندسي' : 
                activeView === 'PORTAL_INSPECTOR' ? 'بوابة المشرفين' :
                activeView === 'PORTAL_COMPANY' ? 'بوابة شركات التشطيب' : 'الإدارة المركزية'
              }`}
            </span>
          </div>
          
          <div className="flex items-center gap-2" dir={isEn ? "ltr" : "rtl"}>
            <NotificationCenter
              notifications={notifications}
              activeView={activeView}
              onMarkRead={onMarkRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onDeleteNotification={onDeleteNotification}
              lang={lang}
            />

            {setDarkMode && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1 px-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                title={isEn ? "Toggle Dark/Light Mode" : "تبديل الوضع الليلي"}
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
              </button>
            )}

            {clearAllRequests && (
              <button
                onClick={clearAllRequests}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-[#D8B448]/20 text-[#D8B448] rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1"
                title={isEn ? 'Clear All Requests' : 'مسح كل الطلبات'}
              >
                <span>🧹</span>
                <span>{isEn ? 'Clear' : 'مسح الطلبات'}</span>
              </button>
            )}
            
            <button
              onClick={() => setIsCollapsed(false)}
              className="px-3 py-1 bg-[#D8B448] text-[#232F3F] rounded-lg text-[10px] sm:text-xs font-black transition-all hover:bg-[#E2C779] cursor-pointer"
            >
              {isEn ? '⚙️ Expand Panel' : '⚙️ تبديل الأدوار'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="demo-presentation-toolbar" className={`bg-[#232F3F] text-white border-b-2 border-[#D8B448] px-4 py-3 sticky top-0 z-[2000] ${isEn ? 'text-left' : 'text-right'}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Title */}
        <div className="flex items-center gap-3">
          <span className="text-xl">🛠️</span>
          <div>
            <h2 className="font-extrabold text-[15px] sm:text-base text-white flex items-center gap-2">
              {getTranslation('demoDashboard', lang)}
              <span className="text-[10px] bg-[#D8B448] text-[#232F3F] px-2 py-0.5 rounded-full font-bold">
                {getTranslation('frontendDemo', lang)}
              </span>
            </h2>
            <p className="text-[11px] text-gray-300">
              {getTranslation('demoNotice', lang)}
            </p>
          </div>
        </div>

        {/* Navigation Switchers & Language Toggles */}
        <div className="flex items-center flex-wrap gap-2 justify-center md:justify-end" dir={isEn ? "ltr" : "rtl"}>
          
          {/* Notification Bell Trigger */}
          <div className="shrink-0">
            <NotificationCenter
              notifications={notifications}
              activeView={activeView}
              onMarkRead={onMarkRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onDeleteNotification={onDeleteNotification}
              lang={lang}
            />
          </div>

          {/* Language Toggle buttons inside simulation toolbar */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10 shrink-0">
            <button
              onClick={() => setLang('ar')}
              className={`px-2 py-1 rounded text-[11px] font-black transition-all ${!isEn ? 'bg-[#D8B448] text-[#232F3F]' : 'text-gray-300 hover:text-white'}`}
            >
              بالعربية
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded text-[11px] font-black transition-all ${isEn ? 'bg-[#D8B448] text-[#232F3F]' : 'text-gray-300 hover:text-white'}`}
            >
              English
            </button>
          </div>

          {/* Dark Mode Switcher */}
          {setDarkMode && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all cursor-pointer select-none shrink-0"
              title={isEn ? "Toggle Dark/Light Mode" : "تبديل الوضع الليلي / النهاري"}
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? 'Light Mode' : 'الوضع النهاري'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isEn ? 'Dark Mode' : 'الوضع الليلي'}</span>
                </>
              )}
            </button>
          )}

          {/* Collapse Panel Button */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
            title={isEn ? "Minimize Panel" : "تصغير لوحة المحاكاة"}
          >
            <span>🔽</span>
            <span className="hidden sm:inline">{isEn ? 'Hide' : 'إخفاء'}</span>
          </button>

          <button
            onClick={() => setActiveView('HOME')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'HOME'
                ? 'bg-[#D8B448] text-[#232F3F] ring-2 ring-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {getTranslation('visitorSite', lang)}
          </button>

          <button
            onClick={() => setActiveView('CLIENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'CLIENT'
                ? 'bg-[#2B4D89] text-white ring-2 ring-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span>👤</span> {isEn ? 'Client View (Ahmed)' : 'لوحة العميل (أحمد)'}
            <span className="bg-[#2B4D89] text-white text-[9px] px-1.5 py-0.2 rounded-full">
              {requestsCount} {isEn ? 'Tickets' : 'طلبات'}
            </span>
          </button>

          <button
            onClick={() => setActiveView('COMPANY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'COMPANY'
                ? 'bg-[#2B4D89] text-white ring-2 ring-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span>🏢</span> {isEn ? 'Contractor View (LuxSpace)' : 'لوحة المقاول (LuxSpace)'}
          </button>

          <button
            onClick={() => setActiveView('INSPECTOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'INSPECTOR'
                ? 'bg-[#2B4D89] text-white ring-2 ring-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {getTranslation('fieldInspector', lang)}
          </button>

          <button
            onClick={() => setActiveView('PORTAL_INSPECTOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              activeView === 'PORTAL_INSPECTOR'
                ? 'bg-emerald-600 text-white ring-2 ring-white shadow-md'
                : 'bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/30 text-emerald-300'
            }`}
            title={isEn ? "Go to Site Inspectors Portal" : "بوابة المشرفين الهندسيين"}
          >
            <span>🔍</span> {isEn ? 'Inspectors Portal' : 'بوابة المشرفين'}
          </button>

          <button
            onClick={() => setActiveView('PORTAL_COMPANY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              activeView === 'PORTAL_COMPANY'
                ? 'bg-blue-600 text-white ring-2 ring-white shadow-md'
                : 'bg-blue-500/20 hover:bg-blue-500/35 border border-blue-500/30 text-blue-300'
            }`}
            title={isEn ? "Go to Finishing Contractors Portal" : "بوابة شركات المقاولات والتشطيب"}
          >
            <span>💼</span> {isEn ? 'Contractors Portal' : 'بوابة الشركات'}
          </button>

          <button
            onClick={() => setActiveView('ADMIN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'ADMIN'
                ? 'bg-red-600 text-white ring-2 ring-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {getTranslation('adminDashboard', lang)}
          </button>

          <button
            onClick={resetState}
            title={isEn ? "Reset State" : "إعادة ضبط الحالة"}
            className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{getTranslation('reinit', lang)}</span>
          </button>

          {clearAllRequests && (
            <button
              onClick={clearAllRequests}
              title={isEn ? "Clear All Requests" : "مسح كل الطلبات للاختبار"}
              className="p-1.5 bg-amber-500/20 hover:bg-[#D8B448]/20 text-[#D8B448] rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>🧹</span>
              <span>{isEn ? 'Clear Requests' : 'مسح كل الطلبات'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Interactive Helper Text */}
      <div className="bg-[#2B4D89]/80 border-t border-white/5 mt-2 pt-2 px-3 pb-1 rounded text-xs text-gray-200 flex items-start gap-2 max-w-7xl mx-auto">
        <Info className="w-4 h-4 text-[#D8B448] shrink-0 mt-0.5" />
        <div className={isEn ? "text-left" : "text-right"}>
          {activeView === 'HOME' && (
            <p>
              {isEn ? (
                <><strong>💡 Step 1:</strong> Explore the Public Web Portal of Shatibha. Click on <strong>"Request Finishing"</strong> to register, or sign up as a Contractor. Try shifting to the <strong>"Client View"</strong> with the button above to view quotes.</>
              ) : (
                <><strong>💡 خطوة 1:</strong> تصفح الصفحة الرئيسية لمنصة شطبها. يمكنك الضغط على <strong>"اطلب تشطيب لوحدتك"</strong> لفتح حساب عميل، أو تسجيل شركة جديدة. جرّب الآن الانتقال إلى <strong>"لوحة العميل أحمد"</strong> بالزر الأزرق لرؤية طلباته وتلقي العروض.</>
              )}
            </p>
          )}
          {activeView === 'CLIENT' && (
            <p>
              {isEn ? (
                <><strong>💡 Step 2:</strong> Welcome to the Client Hub for "Ahmed Mohamed". Click on <strong>"New Unit Finishing Ticket"</strong> to spawn a new request. You can also view obfuscated, blind competitive contractor bids for REQ-001 by clicking <strong>"View Offers"</strong>.</>
              ) : (
                <><strong>💡 خطوة 2:</strong> هنا لوحة تحكم العميل "أحمد محمد". اضغط على <strong>"طلب تشطيب جديد"</strong> لإضافة شقة أو مكتب بميزانية محددة. بمجرد إرساله، ينتقل الطلب للإدارة للمراجعة! يمكنك أيضاً الضغط على <strong>"عرض العروض"</strong> للطلب REQ-001 لرؤية عروض أسعار الشركات مشفرة الأسماء لضمان نزاهة ومصداقية المنافسة وحماية الحقوق.</>
              )}
            </p>
          )}
          {activeView === 'COMPANY' && (
            <p>
              {isEn ? (
                <><strong>💡 Step 3:</strong> Acting as Partner Contractor "LuxSpace Interiors". You only see bids matching your governorate and specialties. You can also trace live projects and <strong>"Request Stage Inspection"</strong> from the platform engineer!</>
              ) : (
                <><strong>💡 خطوة 3:</strong> بصفتك المقاول "LuxSpace Interiors"، تشاهد فقط طلبات التسعير المتطابقة معك جغرافياً وتخصصياً (مثلاً القاهرة والجيزة). كما تعاين هنا **مراحل التنفيذ بمشروعاتك النشطة وتطلب استلام المرحلة فنيّاً** بالضغط على "طلب استلام البند"!</>
              )}
            </p>
          )}
          {activeView === 'INSPECTOR' && (
            <p>
              {isEn ? (
                <><strong>💡 Step 4:</strong> Site Engineer Mobile Board. Visually check building status on site, upload real-time images, write construction reviews, and grant final funding releases which instantly impacts escrow!</>
              ) : (
                <><strong>💡 خطوة 4:</strong> هذه هي لوحة المهندس المشرف. يقوم بزيارة الموقع، تفعيل الكاميرا الميدانية لالتقاط الصور الحية ومطابقتها للمواصفات، ثم كتابة التقرير الهندسي وتقرير الرفض/القبول الفني للمرحلة، مما يؤثر فوراً على بوابة الدفع للعميل!</>
              )}
            </p>
          )}
          {activeView === 'ADMIN' && (
            <p>
              {isEn ? (
                <><strong>💡 Step 5:</strong> Administrative Central Station. Approve raw listings, verify contractor license PDFs, schedule tripartite contract coordinates, and allocate site inspectors!</>
              ) : (
                <><strong>💡 خطوة 5:</strong> هذه هي لوحة الإدارة لمشرفي شطبها. راجع واعتمد الشركات الجديدة والأوراق الرسمية، أو وافق على مشاريع العملاء الجدد لنقلها إلى حالة (UNDER_PRICING). في تدوير <strong>"تنسيق التعاقد 🤝"</strong> تشاهد بيانات الاتصال الحقيقية بعد اختيار العميل للعرض، مع إمكانية **تعيين مهندس الإشراف الفني** لتتبع الزيارات الميدانية!</>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Interactive Push Notification Simulator Option Bar */}
      <div className="bg-[#192330] border border-white/5 mt-2 pt-2 px-3 pb-2.5 rounded-lg text-xs flex flex-col sm:flex-row items-center gap-2 max-w-7xl mx-auto justify-between" dir={isEn ? "ltr" : "rtl"}>
        <div className="flex items-center gap-1.5 shrink-0 select-none">
          <span className="animate-pulse">⚡</span>
          <span className="font-extrabold text-[11px] text-amber-300">
            {isEn ? 'Live Push Alerts Simulator:' : 'محاكي الإشعارات المصغرة (Push/Escrow Alerts):'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 justify-center">
          <button
            onClick={() => onSimulatePush?.('OFFER')}
            className="px-2.5 py-1 bg-[#D8B448]/15 hover:bg-[#D8B448]/30 border border-[#D8B448]/30 hover:border-[#D8B448] text-[#D8B448] rounded-md font-extrabold text-[10.5px] cursor-pointer transition-all active:scale-95 flex items-center gap-1"
          >
            <span>💰</span> {isEn ? 'Simulate Price Offer' : 'عرض سعر جديد'}
          </button>
          <button
            onClick={() => onSimulatePush?.('STAGE_APPROVE')}
            className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-md font-extrabold text-[10.5px] cursor-pointer transition-all active:scale-95 flex items-center gap-1"
          >
            <span>✅</span> {isEn ? 'Approve Bids/Stage' : 'بند هندسي معتمد'}
          </button>
          <button
            onClick={() => onSimulatePush?.('STAGE_REJECT')}
            className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500 text-red-400 rounded-md font-extrabold text-[10.5px] cursor-pointer transition-all active:scale-95 flex items-center gap-1"
          >
            <span>❌</span> {isEn ? 'Reject Stage' : 'رصد عيوب بالبناء'}
          </button>
          <button
            onClick={() => onSimulatePush?.('ESCROW')}
            className="px-2.5 py-1 bg-violet-500/15 hover:bg-violet-500/30 border border-violet-500/30 hover:border-violet-500 text-violet-300 rounded-md font-extrabold text-[10.5px] cursor-pointer transition-all active:scale-95 flex items-center gap-1"
          >
            <span>💳</span> {isEn ? 'Release Escrow' : 'تحويل مالي للمقاول'}
          </button>
        </div>
      </div>

    </div>
  );
};
