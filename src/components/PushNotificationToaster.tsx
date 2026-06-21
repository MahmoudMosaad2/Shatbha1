import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CreditCard, BadgeCheck, FileText, ShieldAlert, X, Volume2, VolumeX, Sparkles } from 'lucide-react';

export interface PushNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'offer' | 'stage' | 'alert' | 'success';
  createdAt: string;
}

interface PushNotificationToasterProps {
  notifications: any[]; // Raw notifications from App state
  lang: 'ar' | 'en';
}

// Custom synthesize Web Audio sound effects safely
const playSparkleBeep = (type: 'offer' | 'stage' | 'alert' | 'success', soundEnabled: boolean) => {
  if (!soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      return;
    }
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'offer') {
      // Gold Price Offer: G5 (783.99 Hz) then B5 (987.77 Hz) sweet ascending chord
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime);
      osc.frequency.setValueAtTime(987.77, audioCtx.currentTime + 0.08);
      
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'alert') {
      // Rejection/Complaint: Cautionary warning dual tone C4 (261Hz)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(261.63, audioCtx.currentTime);
      osc.frequency.setValueAtTime(246.94, audioCtx.currentTime + 0.12);
      
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'stage') {
      // Progress Update: Bubbling clean tone F4 (349Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(349.23, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } else {
      // Success/Default confirmation chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.06);
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.12);
      
      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.55);
    }
  } catch (err) {
    console.debug('Web Audio API interaction suspended or unsupported');
  }
};

export const PushNotificationToaster: React.FC<PushNotificationToasterProps> = ({
  notifications,
  lang,
}) => {
  const isEn = lang === 'en';
  const [activePushes, setActivePushes] = useState<PushNotificationItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCount, setLastCount] = useState(notifications.length);

  // Monitor notifications array changes
  useEffect(() => {
    // If a new notification has been unshifted into the list
    if (notifications.length > lastCount) {
      const latestNotif = notifications[0]; // The newest item
      if (latestNotif) {
        // Classify type based on keywords in title & description
        let type: 'offer' | 'stage' | 'alert' | 'success' = 'success';
        const titleLower = latestNotif.title.toLowerCase();
        const msgLower = latestNotif.message.toLowerCase();
        
        if (titleLower.includes('عرض') || titleLower.includes('price') || titleLower.includes('offer') || titleLower.includes('bid')) {
          type = 'offer';
        } else if (titleLower.includes('مرحلة') || titleLower.includes('stage') || titleLower.includes('تقدم') || titleLower.includes('progress') || titleLower.includes('تحديث نسبة')) {
          type = 'stage';
        } else if (titleLower.includes('شكوى') || titleLower.includes('رفض') || titleLower.includes('rejected') || titleLower.includes('complaint')) {
          type = 'alert';
        }

        const newPush: PushNotificationItem = {
          id: latestNotif.id || `PUSH-${Date.now()}`,
          title: latestNotif.title,
          message: latestNotif.message,
          type,
          createdAt: latestNotif.createdAt || new Date().toISOString()
        };

        // Add to active visual list
        setActivePushes(prev => [newPush, ...prev].slice(0, 3)); // show max 3 active overlays simultaneously to prevent stacking chaos
        
        // Play dynamic feedback
        playSparkleBeep(type, soundEnabled);

        // Auto expire this push toast in 6.5 seconds
        setTimeout(() => {
          setActivePushes(prev => prev.filter(p => p.id !== newPush.id));
        }, 6500);
      }
    }
    setLastCount(notifications.length);
  }, [notifications, lastCount, soundEnabled]);

  const handleDismiss = (id: string) => {
    setActivePushes(prev => prev.filter(p => p.id !== id));
  };

  const parseText = (text: string) => {
    const parts = text.split('•');
    if (parts.length > 1) {
      return isEn ? parts[1].trim() : parts[0].trim();
    }
    return text;
  };

  if (activePushes.length === 0) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full font-sans pointer-events-none"
      style={{ direction: isEn ? 'ltr' : 'rtl' }}
    >
      {/* Sound Controller Settings Toggler floating atop stack */}
      <div className="flex justify-end mb-1 pointer-events-auto">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="bg-white/80 hover:bg-white backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-150/80 shadow-md text-[#232F3F] flex items-center gap-1 cursor-pointer transition-all active:scale-95 text-[10.5px]"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isEn ? 'Sound On' : 'صوت التنبيهات مفعّل'}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-gray-400" />
              <span>{isEn ? 'Sound Muted' : 'صوت التنبيهات صامت'}</span>
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {activePushes.map((push) => {
          let badgeIcon = <Bell className="w-4 h-4 text-white" />;
          let headerText = isEn ? 'System Update' : 'شطبها • تحديث الإجراء';
          let borderAccent = 'border-[#2B4D89]';
          let iconBg = 'bg-[#2B4D89]';
          let isCritical = false;

          if (push.type === 'offer') {
            badgeIcon = <FileText className="w-4 h-4 text-white" />;
            headerText = isEn ? '💰 Pricing Offer Received' : '💰 عرض أسعار جديد';
            borderAccent = 'border-[#D8B448]';
            iconBg = 'bg-[#D8B448]';
          } else if (push.type === 'stage') {
            badgeIcon = <BadgeCheck className="w-4 h-4 text-white" />;
            headerText = isEn ? '🏗️ Project Stage Progress' : '🏗️ تقدم أعمال المرحلة';
            borderAccent = 'border-[#1D4A3D]';
            iconBg = 'bg-[#1D4A3D]';
          } else if (push.type === 'alert') {
            badgeIcon = <ShieldAlert className="w-4 h-4 text-white" />;
            headerText = isEn ? '⚠️ Engineering Alert' : '⚠️ إشعار / شكوى هندسية';
            borderAccent = 'border-red-500';
            iconBg = 'bg-red-500';
            isCritical = true;
          }

          return (
            <motion.div
              key={push.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.85, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: isEn ? 120 : -120, scale: 0.9, transition: { duration: 0.25 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className={`pointer-events-auto bg-slate-900/96 text-white p-4 rounded-2xl border-l-[5px] ${borderAccent} shadow-2xl backdrop-blur-md flex gap-3.5 relative overflow-hidden ring-1 ring-white/10`}
            >
              {/* Sparkle background flow for gold/offers */}
              {push.type === 'offer' && (
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-[#D8B448]/5 pointer-events-none transform skew-x-12 translate-x-10"></div>
              )}

              {/* Icon Container */}
              <div className={`${iconBg} ${isCritical ? 'animate-pulse' : ''} p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center shadow-lg shadow-black/30`}>
                {badgeIcon}
              </div>

              {/* Message Details */}
              <div className="flex-1 text-right">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[11px] font-black tracking-wide ${push.type === 'offer' ? 'text-[#D8B448]' : 'text-gray-300'}`}>
                    {headerText}
                  </span>
                  <span className="text-[9px] font-medium text-gray-400">
                    {isEn ? 'Just now' : 'الآن'}
                  </span>
                </div>
                
                <h4 className="font-extrabold text-xs text-white leading-normal mb-1">
                  {parseText(push.title)}
                </h4>
                
                <p className="text-[10px] text-gray-300 leading-normal font-medium">
                  {parseText(push.message)}
                </p>
              </div>

              {/* Close Button Button */}
              <button
                onClick={() => handleDismiss(push.id)}
                className="absolute top-3 left-3 text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                title={isEn ? "Dismiss" : "إغلاق"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
