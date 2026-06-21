import React, { useState } from 'react';
import { Bell, Check, Trash2, Eye, ShieldAlert, BadgeCheck, FileText, Camera, CreditCard, ChevronRight, Mail, Smartphone, Sliders, Settings } from 'lucide-react';
import { Notification } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationCenterProps {
  notifications: Notification[];
  activeView: 'HOME' | 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR';
  onMarkRead: (id: string) => void;
  onMarkAllAsRead: (userIdsToRead: string[]) => void;
  onDeleteNotification: (id: string) => void;
  lang: 'ar' | 'en';
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  activeView,
  onMarkRead,
  onMarkAllAsRead,
  onDeleteNotification,
  lang,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'LIST' | 'SETTINGS'>('LIST');
  const isEn = lang === 'en';

  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('shattabha_notif_prefs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      email: true,
      push: true,
      sms: false,
      stages: true,
    };
  });

  const togglePreference = (key: 'email' | 'push' | 'sms' | 'stages') => {
    setPreferences((prev: any) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('shattabha_notif_prefs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Determine which user IDs we are filtering for based on the current perspective
  let targetUserIds: string[] = [];
  let roleTitle = '';

  if (activeView === 'CLIENT') {
    targetUserIds = ['CLIENT-1', 'ID#4092', 'CLIENT'];
    roleTitle = isEn ? 'Client (Ahmed)' : 'العميل (أحمد)';
  } else if (activeView === 'COMPANY') {
    targetUserIds = ['USER-COMP-1', 'COMP-1', 'COMPANY'];
    roleTitle = isEn ? 'Contractor (LuxSpace)' : 'المقاول (LuxSpace)';
  } else if (activeView === 'ADMIN') {
    targetUserIds = ['ADMIN'];
    roleTitle = isEn ? 'Admin' : 'الأدمن (الإدارة)';
  } else if (activeView === 'INSPECTOR') {
    targetUserIds = ['INSPECTORS', 'INSPECTOR', 'INSP-1', 'INSP-2', 'INSP-3'];
    roleTitle = isEn ? 'Inspector (Kareem)' : 'المشرف (م/ كريم)';
  } else {
    // HOME view
    targetUserIds = [];
  }

  // If visiting public homepage and no specific user perspective is active, do not render trigger
  if (targetUserIds.length === 0) return null;

  // Filter notifications for active perspective
  const userNotifications = notifications.filter(n => targetUserIds.includes(n.userId));
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleMarkAll = () => {
    onMarkAllAsRead(targetUserIds);
  };

  const getNotifIcon = (title: string) => {
    const text = title.toLowerCase();
    if (text.includes('موافقة') || text.includes('approved') || text.includes('تفعيل')) {
      return <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full shrink-0"><BadgeCheck className="w-4 h-4" /></div>;
    }
    if (text.includes('عرض') || text.includes('bid') || text.includes('pricing') || text.includes('أرباح')) {
      return <div className="p-2 bg-blue-100 text-[#2B4D89] rounded-full shrink-0"><FileText className="w-4 h-4" /></div>;
    }
    if (text.includes('دفعة') || text.includes('payment') || text.includes('تحرير')) {
      return <div className="p-2 bg-amber-100 text-amber-700 rounded-full shrink-0"><CreditCard className="w-4 h-4" /></div>;
    }
    if (text.includes('صور') || text.includes('photo')) {
      return <div className="p-2 bg-purple-100 text-purple-700 rounded-full shrink-0"><Camera className="w-4 h-4" /></div>;
    }
    if (text.includes('شكوى') || text.includes('رفض') || text.includes('rejected') || text.includes('complaint')) {
      return <div className="p-2 bg-red-100 text-red-700 rounded-full shrink-0"><ShieldAlert className="w-4 h-4" /></div>;
    }
    return <div className="p-2 bg-gray-100 text-gray-700 rounded-full shrink-0"><Bell className="w-4 h-4" /></div>;
  };

  const parseMessage = (msg: string) => {
    const parts = msg.split('•');
    if (parts.length > 1) {
      return isEn ? parts[1].trim() : parts[0].trim();
    }
    return msg;
  };

  const parseTitle = (title: string) => {
    const parts = title.split('•');
    if (parts.length > 1) {
      return isEn ? parts[1].trim() : parts[0].trim();
    }
    return title;
  };

  return (
    <div className="relative inline-block text-right">
      {/* TRIGGER BUTTON */}
      <button
        id="notif-center-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all focus:outline-hidden ring-1 ring-white/15 shadow-sm flex items-center justify-center cursor-pointer"
        title={isEn ? "Notifications" : "الإشعارات"}
      >
        <Bell className={`w-4.5 h-4.5 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN CONTAINER */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click closer */}
            <div 
              className="fixed inset-0 z-40 cursor-default" 
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`absolute top-12 z-50 w-[calc(100vw-32px)] max-w-[340px] sm:max-w-[380px] bg-white text-[#232F3F] rounded-2xl shadow-2xl border border-gray-150 overflow-hidden ${
                isEn ? 'right-0' : 'left-0'
              } text-right`}
              style={{ direction: isEn ? 'ltr' : 'rtl' }}
            >
              {/* HEADER */}
              <div className="bg-[#2B4D89] p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#D8B448]" />
                  <div className={isEn ? "text-left" : "text-right"}>
                    <h3 className="font-extrabold text-sm tracking-tight">{isEn ? 'Alert Notification Center' : 'مركز الإشعارات الفورية'}</h3>
                    <p className="text-[10px] text-gray-200">{isEn ? `Active user desk: ${roleTitle}` : `لوحة المستخدم النشطة: ${roleTitle}`}</p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="text-[10px] font-black bg-white/20 hover:bg-white/35 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? 'Check all' : 'تحديد المقروء'}
                  </button>
                )}
              </div>

              {/* TABS SWITCHER */}
              <div className="flex border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10">
                <button
                  onClick={() => setTab('LIST')}
                  className={`flex-1 py-2.5 text-center text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    tab === 'LIST'
                      ? 'border-[#2B4D89] text-[#2B4D89]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Notifications' : 'التنبيهات'}</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] bg-red-500 text-white rounded-full font-sans font-black leading-none">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setTab('SETTINGS')}
                  className={`flex-1 py-2.5 text-center text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    tab === 'SETTINGS'
                      ? 'border-[#2B4D89] text-[#2B4D89]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>{isEn ? 'Preferences' : 'الإعدادات'}</span>
                </button>
              </div>

              {/* LIST BODY / SETTINGS BODY */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
                {tab === 'LIST' ? (
                  userNotifications.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <span className="text-3xl block">📭</span>
                      <p className="text-xs text-gray-400 font-bold">{isEn ? 'Your notification logs are completely empty currently.' : 'لا توجد أي تنبيهات أو إشعارات نشطة حالياً.'}</p>
                      <p className="text-[10px] text-gray-400">{isEn ? 'Interact in simulator views to trigger notifications' : 'قم بإجراء عمليات في لوحات التحكم لتلقي الإشعارات الفعالة!'}</p>
                    </div>
                  ) : (
                    userNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => onMarkRead(notif.id)}
                        className={`p-4 transition-all hover:bg-gray-50 flex items-start gap-3.5 cursor-pointer ${
                          !notif.isRead ? 'bg-blue-50/50 border-r-4 border-[#2B4D89]' : ''
                        }`}
                      >
                        {getNotifIcon(notif.title)}

                        <div className={`flex-1 min-w-0 space-y-1 ${isEn ? 'text-left' : 'text-right'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-[12px] font-extrabold leading-snug flex-1 ${notif.isRead ? 'text-gray-700' : 'text-blue-900'}`}>
                              {parseTitle(notif.title)}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#2B4D89]" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteNotification(notif.id);
                                }}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors cursor-pointer"
                                title={isEn ? "Delete this notification" : "حذف هذا الإشعار"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                            {parseMessage(notif.message)}
                          </p>
                          <div className="flex items-center justify-between text-[9px] text-gray-400 font-sans pt-1">
                            <span>⏱️ {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            {notif.requestId && (
                              <span className="font-bold text-[#2B4D89] bg-gray-100 px-1.5 py-0.5 rounded text-[8px] uppercase">#{notif.requestId}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  /* SETTINGS TAB PANEL */
                  <div className="p-4 space-y-3.5 bg-gray-50/55 text-[#232F3F]">
                    <div className="bg-amber-50/75 border border-amber-200/50 rounded-xl p-3 text-[11px] leading-relaxed text-amber-900 font-extrabold flex gap-2">
                      <Sliders className="w-4 h-4 shrink-0 mt-0.5 text-[#D8B448]" />
                      <div className={isEn ? 'text-left' : 'text-right'}>
                        {isEn 
                          ? 'Customize which notifications Shattabha delivers. Your settings are synced on cloud & device.' 
                          : 'تحكم في القنوات التي تفضل استلام الإشعارات عليها بمختلف الأوضاع والتقارير المالية والفنية.'}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {/* Email Toggle Option */}
                      <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-150 transition-colors shadow-xs">
                        <div className="flex items-start gap-2.5 flex-1 max-w-[80%]">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <div className={`space-y-0.5 ${isEn ? 'text-left' : 'text-right'}`}>
                            <h4 className="text-[11px] font-extrabold text-slate-800">
                              {isEn ? 'Email Notifications' : 'تنبيهات البريد الإلكتروني'}
                            </h4>
                            <p className="text-[9px] text-gray-400 leading-tight">
                              {isEn ? 'Receive invoices and contracts on registration' : 'ملخصات العمليات، العقود المعتمدة والفواتير والتقارير الأسبوعية.'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => togglePreference('email')}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-hidden ${
                            preferences.email ? 'bg-[#2B4D89]' : 'bg-gray-200'
                          }`}
                          style={{ direction: 'ltr' }}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                              preferences.email ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Push Alert Toggle Option */}
                      <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-150 transition-colors shadow-xs">
                        <div className="flex items-start gap-2.5 flex-1 max-w-[80%]">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                          <div className={`space-y-0.5 ${isEn ? 'text-left' : 'text-right'}`}>
                            <h4 className="text-[11px] font-extrabold text-slate-800">
                              {isEn ? 'Push Toaster Alerts' : 'تنبيهات النظام المنبثقة'}
                            </h4>
                            <p className="text-[9px] text-gray-400 leading-tight">
                              {isEn ? 'Urgent popups top banners on changes' : 'رسائل فورية تحذيرية أعلى الشاشة عند تحويل ميزانيات أو اعتماد دفعات.'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => togglePreference('push')}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-hidden ${
                            preferences.push ? 'bg-[#2B4D89]' : 'bg-gray-200'
                          }`}
                          style={{ direction: 'ltr' }}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                              preferences.push ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* SMS Text Toggle Option */}
                      <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-150 transition-colors shadow-xs">
                        <div className="flex items-start gap-2.5 flex-1 max-w-[80%]">
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                            <Smartphone className="w-3.5 h-3.5" />
                          </div>
                          <div className={`space-y-0.5 ${isEn ? 'text-left' : 'text-right'}`}>
                            <h4 className="text-[11px] font-extrabold text-slate-800">
                              {isEn ? 'SMS Text Advisories' : 'رسائل الجوال النصية (SMS)'}
                            </h4>
                            <p className="text-[9px] text-gray-400 leading-tight">
                              {isEn ? 'Cell cellular codes and payment token pins' : 'كود الدخول الثنائي وتنبيهات الطوارئ عند عدم فتح التطبيق.'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => togglePreference('sms')}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-hidden ${
                            preferences.sms ? 'bg-[#2B4D89]' : 'bg-gray-200'
                          }`}
                          style={{ direction: 'ltr' }}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                              preferences.sms ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Quality Audits Toggle Option */}
                      <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-150 transition-colors shadow-xs">
                        <div className="flex items-start gap-2.5 flex-1 max-w-[80%]">
                          <div className="p-2 bg-purple-50 text-[#2B4D89] rounded-lg shrink-0 mt-0.5">
                            <BadgeCheck className="w-3.5 h-3.5" />
                          </div>
                          <div className={`space-y-0.5 ${isEn ? 'text-left' : 'text-right'}`}>
                            <h4 className="text-[11px] font-extrabold text-slate-800">
                              {isEn ? 'Site Progress Reports' : 'تقارير مراحل التنفيذ الهندسية'}
                            </h4>
                            <p className="text-[9px] text-gray-400 leading-tight">
                              {isEn ? 'Inspector certification site logs' : 'إرسال صور وتقارير المقاسات المعتمدة من الاستشاري الهندسي بنقرة.'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => togglePreference('stages')}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-hidden ${
                            preferences.stages ? 'bg-[#2B4D89]' : 'bg-gray-200'
                          }`}
                          style={{ direction: 'ltr' }}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                              preferences.stages ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="p-2.5 bg-gray-50 text-center border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400">
                  {isEn ? '🛠️ Real-time updates simulation active • Shattabha' : '🛠️ محاكاة استلام الإشعارات المباشرة نشطة • شطبها'}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
