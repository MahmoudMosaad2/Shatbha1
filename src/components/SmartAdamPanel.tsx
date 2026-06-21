import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  X,
  Sliders,
  CheckCircle,
  Play,
  Pause
} from 'lucide-react';
import { ClientRequest, Company, Offer, Contract, WarrantyComplaint } from '../types';

interface SmartAdamPanelProps {
  activeView: 'HOME' | 'CLIENT' | 'COMPANY' | 'ADMIN' | 'INSPECTOR' | 'CLIENT_TERMS' | 'COMPANY_TERMS' | 'PORTAL_INSPECTOR' | 'PORTAL_COMPANY';
  lang: 'en' | 'ar';
  darkMode: boolean;
  requests: ClientRequest[];
  companies: Company[];
  offers: Offer[];
  contracts: Contract[];
  complaints: WarrantyComplaint[];
  onSendMessage: (text: string) => void;
  onAddRequest?: (newReq: ClientRequest) => void;
  onAddNotification?: (userId: string, title: string, message: string) => void;
  onClose?: () => void;
}

export const SmartAdamPanel: React.FC<SmartAdamPanelProps> = ({
  activeView,
  lang,
  darkMode,
  requests,
  companies,
  offers,
  contracts,
  complaints,
  onSendMessage,
  onAddRequest,
  onAddNotification,
  onClose,
}) => {
  // Helper translations supporting AR / EN smoothly
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  // Live Raw Material Prices feature states
  const [livePrices, setLivePrices] = useState([
    // === حديد التسليح (Steel) ===
    { id: 'steel_ezz', name: t('حديد عز التسليح المعتمد فرز أول', 'Ezz Steel construction grade'), category: 'steel', basePrice: 38200, currentPrice: 38200, unit: t('طن', 'Ton'), change: 0, trend: 'up', company: t('حديد عز', 'Ezz Steel') },
    { id: 'steel_egy', name: t('حديد المصريين للتشييد المتين الممتاز', 'Egyptian Steel premium construction'), category: 'steel', basePrice: 37600, currentPrice: 37600, unit: t('طن', 'Ton'), change: 0, trend: 'down', company: t('حديد المصريين', 'Egyptian Steel') },
    { id: 'steel_beshay', name: t('حديد بشاي للصلب القوي عالي المرونة', 'Beshay Steel construction rebar'), category: 'steel', basePrice: 37900, currentPrice: 37900, unit: t('طن', 'Ton'), change: 0, trend: 'up', company: t('حديد بشاي', 'Beshay Steel') },
    { id: 'steel_suez', name: t('حديد السويس للصلب المقاوم للرطوبة والصدأ', 'Suez Steel anti-rust rebar'), category: 'steel', basePrice: 37500, currentPrice: 37500, unit: t('طن', 'Ton'), change: 0, trend: 'down', company: t('السويس للصلب', 'Suez Steel') },
    { id: 'steel_garhy', name: t('حديد الجارحي للدرفلة ذو الكفاءة القصوى', 'El Garhy Steel high grade'), category: 'steel', basePrice: 37200, currentPrice: 37200, unit: t('طن', 'Ton'), change: 0, trend: 'up', company: t('حديد الجارحي', 'El Garhy Steel') },

    // === أسمنت معتمد (Cement) ===
    { id: 'cement_sw', name: t('أسمنت السويدي العادي رتبة 52.5 المعتمد', 'Sewedy Cement 52.5'), category: 'cement', basePrice: 2280, currentPrice: 2280, unit: t('طن', 'Ton'), change: 0, trend: 'up', company: t('أسمنت السويدي', 'Sewedy Cement') },
    { id: 'cement_assiut', name: t('أسمنت أسيوط المقاوم للأملاح والرطوبة تحت التأسيس', 'Assiut Resistant Cement'), category: 'cement', basePrice: 2150, currentPrice: 2150, unit: t('طن', 'Ton'), change: 0, trend: 'up', company: t('أسمنت أسيوط', 'Assiut Cement') },
    { id: 'cement_lafarge', name: t('أسمنت لافارج بورتلاندي قاهر الرطوبة للمحارة', 'Lafarge Cement premium'), category: 'cement', basePrice: 2200, currentPrice: 2200, unit: t('طن', 'Ton'), change: 0, trend: 'down', company: t('أسمنت لافارج', 'Lafarge Cement') },
    { id: 'cement_helwan', name: t('أسمنت حلوان بورتلاند عادي عالي التماسك سريع الشك', 'Helwan Portland Cement'), category: 'cement', basePrice: 2110, currentPrice: 2110, unit: t('طن', 'Ton'), change: 0, trend: 'up', company: t('أسمنت حلوان', 'Helwan Cement') },
    { id: 'cement_arish', name: t('أسمنت العريش العسكري المسلح فائق القوة والتحمل', 'Al-Arish Military Grade Cement'), category: 'cement', basePrice: 2060, currentPrice: 2060, unit: t('طن', 'Ton'), change: 0, trend: 'down', company: t('أسمنت العريش', 'Al-Arish Cement') },
  ]);

  const [selectedCalcMaterial, setSelectedCalcMaterial] = useState<string>('steel_ezz');
  const [calcQuantity, setCalcQuantity] = useState<number>(5);
  const [procurementSuccess, setProcurementSuccess] = useState<boolean>(false);
  const [procureRefId, setProcureRefId] = useState<string>('');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);

  // Sync with central administrator pricing database on load
  useEffect(() => {
    fetch('/api/prices')
      .then(res => res.json())
      .then(data => {
        if (data && data.materials) {
          setLivePrices(prev => prev.map(item => {
            let matchedId = '';
            if (item.id === 'steel_ezz') matchedId = 'MAT-E01';
            else if (item.id === 'steel_egy') matchedId = 'MAT-E02';
            else if (item.id === 'steel_beshay') matchedId = 'MAT-E03';
            else if (item.id === 'steel_suez') matchedId = 'MAT-E04';
            else if (item.id === 'steel_garhy') matchedId = 'MAT-E05';
            else if (item.id === 'cement_sw') matchedId = 'MAT-M01';
            else if (item.id === 'cement_assiut') matchedId = 'MAT-M02';
            else if (item.id === 'cement_lafarge') matchedId = 'MAT-M03';
            else if (item.id === 'cement_helwan') matchedId = 'MAT-M04';
            else if (item.id === 'cement_arish') matchedId = 'MAT-M05';

            if (matchedId) {
              const dbItem = data.materials.find((m: any) => m.id === matchedId);
              if (dbItem) {
                return {
                  ...item,
                  basePrice: dbItem.priceEgp,
                  currentPrice: dbItem.priceEgp
                };
              }
            }
            return item;
          }));
        }
      })
      .catch(err => console.error('Error syncing materials ticker with central db:', err));
  }, []);

  // Fluctuating ticker values
  useEffect(() => {
    if (!isLiveConnected) return;
    const tickerInterval = setInterval(() => {
      setLivePrices(prev => prev.map(item => {
        const range = item.category === 'steel' ? 35 : 4;
        const drift = (Math.random() - 0.5) * range;
        const nextPrice = Math.max(item.basePrice * 0.85, Math.min(item.basePrice * 1.25, item.currentPrice + drift));
        const change = ((nextPrice - item.basePrice) / item.basePrice) * 105;
        return {
          ...item,
          currentPrice: nextPrice,
          change,
          trend: drift >= 0 ? 'up' : 'down'
        };
      }));
    }, 4000);
    return () => clearInterval(tickerInterval);
  }, [isLiveConnected]);

  return (
    <div className="w-full h-full flex flex-col font-sans select-text text-right bg-slate-50 dark:bg-slate-950" dir="rtl">
      {/* Dynamic Header */}
      <div className="px-4 py-2 bg-gradient-to-r from-[#213555] to-[#121B28] text-white border-b border-gray-150 dark:border-slate-805 flex items-center justify-between shrink-0 select-none rounded-t-2xl">
        <h3 className="text-[11px] font-black flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('البورصة الفورية لخامات مواد البناء 🏗️', 'Construction Raw Materials Ticker 🏗️')}</span>
        </h3>
        
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="py-1 px-2 rounded-lg flex items-center justify-center gap-1 text-[9px] font-black cursor-pointer bg-white/10 hover:bg-white/20 text-white transition-all border border-white/5 shrink-0"
            title={t('إغلاق', 'Close')}
          >
            <X className="w-2.5 h-2.5" />
            <span>{t('إغلاق', 'Close')}</span>
          </motion.button>
        )}
      </div>

      {/* Main Content Area - Fully optimized compact padding */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3" dir="rtl">
        
        {/* Compact Horizontal Status Alert - Zero wasted space */}
        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 p-2 rounded-xl flex items-center justify-between gap-2.5 text-right">
          <div className="flex items-center gap-1 shrink-0 flex-row-reverse">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
            </span>
            <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400">
              {t('تحديث حي', 'Live Index')}
            </span>
          </div>

          <p className="text-[9px] text-[#2B4D89]/80 dark:text-slate-300 font-bold leading-normal flex-1">
            {t('أسعار المنبع المباشرة بالتكامل مع كبرى مصانع الحديد المعتمدة وموردين الأسمنت بالمحافظات.', 'Regional direct factory costs instantly synced from premium Ezz & Sewedy distributors.')}
          </p>

          <motion.button 
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={() => setIsLiveConnected(!isLiveConnected)}
            className={`px-2 py-0.5 rounded-md text-[8.5px] font-black transition-all border shrink-0 flex items-center gap-1 cursor-pointer ${
              isLiveConnected 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            {isLiveConnected ? <Pause className="w-2 h-2" /> : <Play className="w-2 h-2" />}
            <span>{isLiveConnected ? t('إيقاف', 'Pause') : t('تشغيل', 'Resume')}</span>
          </motion.button>
        </div>

        {/* DENSE CATEGORIZED DIRECTORY - Row layout to prevent text squishing & unnecessary blank gaps */}
        <div className="space-y-3">
          
          {/* Iron & Steel Section */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-black text-[#213555] dark:text-[#93C5FD] border-r-4 border-amber-500 pr-1.5">
              <span>🏗️ {t('حديد التسليح والصلب الاسترشادي', 'Reinforced Rebar & Steel Indexes')}</span>
            </div>
            
            <div className="space-y-1">
              {livePrices.filter(p => p.category === 'steel').map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-xl hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-2xs transition-all text-right gap-2"
                >
                  {/* Name and Brand Badge */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-row-reverse text-right">
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black shrink-0">
                      {item.company}
                    </span>
                    <span className="text-[9.5px] font-bold text-slate-700 dark:text-gray-200 truncate leading-tight">
                      {item.name}
                    </span>
                  </div>

                  {/* Pricing and trend info */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-row-reverse">
                    <div className="text-left font-mono">
                      <span className="text-[10.5px] font-black text-slate-850 dark:text-amber-100">
                        {Math.round(item.currentPrice).toLocaleString()}
                      </span>
                      <span className="text-[7.5px] text-gray-400 font-bold mr-0.5">
                        ج.م / {item.unit}
                      </span>
                    </div>
                    
                    <div className={`flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                      item.trend === 'up' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-450'
                    }`}>
                      <span>{item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%</span>
                      <span className="text-[7px]">{item.trend === 'up' ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cement Section */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-black text-[#213555] dark:text-[#93C5FD] border-r-4 border-emerald-500 pr-1.5">
              <span>🧱 {t('الأسمنت البورتلاندي المعتمد', 'Certified Structural Cement')}</span>
            </div>
            
            <div className="space-y-1">
              {livePrices.filter(p => p.category === 'cement').map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-xl hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-2xs transition-all text-right gap-2"
                >
                  {/* Name and Brand Badge */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-row-reverse text-right">
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black shrink-0">
                      {item.company}
                    </span>
                    <span className="text-[9.5px] font-bold text-slate-700 dark:text-gray-200 truncate leading-tight">
                      {item.name}
                    </span>
                  </div>

                  {/* Pricing and trend info */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-row-reverse">
                    <div className="text-left font-mono">
                      <span className="text-[10.5px] font-black text-slate-850 dark:text-amber-100">
                        {Math.round(item.currentPrice).toLocaleString()}
                      </span>
                      <span className="text-[7.5px] text-gray-400 font-bold mr-0.5">
                        ج.م / {item.unit}
                      </span>
                    </div>
                    
                    <div className={`flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                      item.trend === 'up' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-450'
                    }`}>
                      <span>{item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%</span>
                      <span className="text-[7px]">{item.trend === 'up' ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

           {procurementSuccess ? (
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-2.5 text-center space-y-2 animate-fade-in text-right">
              <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <div className="text-center">
                <h5 className="text-[9.5px] font-black text-emerald-700 dark:text-emerald-400">
                  {t('تم تسجيل طلب المادة بنجاح! 🎉', 'Wholesale Reservation Registered! 🎉')}
                </h5>
                <p className="text-[8.5px] text-slate-600 dark:text-gray-400 leading-relaxed mt-1 text-center font-bold">
                  {t(
                    `كود الحجز: (${procureRefId}). تم إخطار المورّدين ومصانع المنبع المعتمدة لتوفير خصم إضافي للمشروع قدره -6.5% بضمان شطبها.`,
                    `Reservation tag: (${procureRefId}). Partners registered wholesale rate. Standard 6.5% discount locked.`
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProcurementSuccess(false)}
                className="mx-auto block text-[8.5px] font-black bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg cursor-pointer transition-all active:scale-95 shadow-2xs text-center"
              >
                {t('حساب مادة أخرى ➕', 'Calculate Another Item ➕')}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 text-right">
              <div className="grid grid-cols-2 gap-2 text-right">
                
                <div>
                  <label className="block text-gray-400 text-[8.5px] mb-1 font-bold text-right">
                    {t('١. المادة والشركة:', '1. Material & Company:')}
                  </label>
                  <select 
                    value={selectedCalcMaterial} 
                    onChange={e => setSelectedCalcMaterial(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg text-[9px] font-bold outline-none text-slate-900 dark:text-white cursor-pointer text-right"
                  >
                    {livePrices.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.company} | {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-[8.5px] mb-1 font-bold text-right">
                    {t('٢. الكمية المقدرة:', '2. Estimated Qty:')}
                  </label>
                  <input 
                    type="number"
                    min="1"
                    value={calcQuantity}
                    onChange={e => setCalcQuantity(Number(e.target.value) || 1)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg text-[9px] font-bold outline-none text-slate-900 dark:text-white text-right"
                  />
                </div>
              </div>

              {/* Live calculated cost preview bar */}
              <div className="bg-slate-50 dark:bg-slate-950/70 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-right flex-row-reverse">
                <div className="space-y-0.5 text-right font-sans">
                  <span className="text-[8px] text-gray-400 block font-bold text-right">{t('إجمالي التكلفة المضمونة لموقعك:', 'Direct Wholesale Factory Cost:')}</span>
                  <p className="text-[11.5px] font-black text-slate-850 dark:text-emerald-400 font-mono text-right">
                    {Math.round((livePrices.find(p => p.id === selectedCalcMaterial)?.currentPrice || 0) * calcQuantity).toLocaleString()} <span className="text-[8.5px] font-sans text-gray-500 font-bold">ج.م</span>
                  </p>
                </div>
                
                <span className="text-[7.5px] text-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/5 px-1.5 py-0.5 rounded-md font-extrabold shrink-0">
                  ⚡ {t('سعر مصنع مؤمّن', 'Secured Direct Pricing')}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  const computedPrice = (livePrices.find(p => p.id === selectedCalcMaterial)?.currentPrice || 0) * calcQuantity;
                  const chosenName = livePrices.find(p => p.id === selectedCalcMaterial)?.name || '';
                  const company = livePrices.find(p => p.id === selectedCalcMaterial)?.company || '';
                  const unit = livePrices.find(p => p.id === selectedCalcMaterial)?.unit || '';
                  const refId = `RAW_EST_${Math.floor(100000 + Math.random() * 900000)}`;
                  
                  setProcureRefId(refId);
                  setProcurementSuccess(true);
  
                  // Send notifications under tripartite Escrow safety
                  if (onAddNotification) {
                    onAddNotification(
                      'usr_premium_ahmed',
                      t('🏗️ طلب تسعير خامات مخصص للموقع', '🏗️ Custom raw materials price reservation'),
                      t(`لقد قمت بإيداع طلب تسعير وتوريد خامات بـ ${calcQuantity} ${unit} من مصنع (${company} - ${chosenName}) بسعر مباشر إجمالي ${computedPrice.toLocaleString()} ج.م بكود حجز ${refId}.`, `Procured reservation for ${calcQuantity} of ${chosenName} totaling EGP ${computedPrice.toLocaleString()} under price protection ID ${refId}.`)
                    );
                  }
                  
                  onSendMessage(t(
                    `المساعد آدم: قمت بمعالجة خيارك الهندسي وطلبت فوراً تسعير وتثبيت كلفة توريد كمية ${calcQuantity} ${unit} من مصنع (${company} - ${chosenName}) بسعر مباشر إجمالي ${computedPrice.toLocaleString()} ج.م. لقد تم إخطار مهندسي التشغيل والمندوب المعتمد بالمنطقة لحسم العقد بكود معرف حجز (#${refId}).`,
                    `Adam AI: Confirmed demand calculator request to supply ${calcQuantity} of ${chosenName} from ${company} totaling EGP ${computedPrice.toLocaleString()} under reservation tracker #${refId}. Suppliers notified immediately.`
                  ));
                }}
                className="w-full bg-[#213555] hover:bg-[#121B28] text-white py-2 rounded-xl text-[9.5px] font-black transition-all cursor-pointer shadow-md text-center flex items-center justify-center gap-1"
              >
                <span>{t('تأمين السعر اللحظي وإصدار طلب التوريد للمشروع ⚡', 'Lock Wholesale Materials Rate & Issue Reservation ⚡')}</span>
              </motion.button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
