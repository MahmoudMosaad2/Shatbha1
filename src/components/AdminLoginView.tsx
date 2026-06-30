import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Language } from '../lib/translations';

interface AdminLoginViewProps {
  onLogin: (role: 'ADMIN' | 'INSPECTOR') => void;
  lang: Language;
  onBack: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLogin, lang, onBack }) => {
  const isEn = lang === 'en';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail === 'admin@shattabha.com') {
      if (password === 'admin123456' || password === '12345678' || password === 'admin123') {
        onLogin('ADMIN');
      } else {
        setError(isEn ? 'Incorrect password. Please use admin123456' : 'كلمة المرور غير صحيحة. يرجى استخدام كلمة المرور admin123456');
      }
    } else if (cleanEmail === 'inspector@shattabha.com') {
      if (password === 'inspector123456' || password === '12345678') {
        onLogin('INSPECTOR');
      } else {
        setError(isEn ? 'Incorrect password. Use 12345678' : 'كلمة المرور غير صحيحة. استخدم 12345678');
      }
    } else {
      setError(isEn ? 'Invalid credentials' : 'بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative" dir={isEn ? "ltr" : "rtl"}>
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#2B4D89] via-[#D8B448] to-[#2B4D89]" />

      <button
        onClick={onBack}
        className={`absolute top-6 ${isEn ? 'left-6 right-auto' : 'right-6 left-auto'} flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm cursor-pointer`}
      >
        <ArrowLeft className={`w-4 h-4 ${!isEn ? 'rotate-180' : ''}`} />
        <span>{isEn ? 'Back to Portal' : 'العودة للواجهة'}</span>
      </button>

      <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl overflow-hidden relative z-10 border border-slate-100">
        <div className="bg-[#2B4D89] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-900 opacity-20" />
          <div className="relative z-10 bg-white p-3 rounded-2xl mb-4 shadow-lg border border-white/10">
            <ShieldCheck className="w-8 h-8 text-[#2B4D89]" />
          </div>
          <h2 className="text-white text-xl font-extrabold relative z-10 font-sans tracking-tight">
            {isEn ? 'Shattabha Administration' : 'إدارة منصة شطبها'}
          </h2>
          <p className="text-slate-300 text-xs mt-2 font-medium relative z-10">
            {isEn ? 'Secure portal access for admins & inspectors' : 'بوابة الدخول الآمن للإدارة والمشرفين'}
          </p>
        </div>

        <div className="p-8 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold text-center border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block mx-1">
                {isEn ? 'Authorized Email' : 'البريد الإلكتروني المعتمد'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@shattabha.com"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/20 text-sm font-semibold text-slate-800 transition-all text-left"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block mx-1">
                {isEn ? 'Password' : 'كلمة المرور'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/20 text-sm font-semibold text-slate-800 transition-all text-left"
                dir="ltr"
              />
            </div>

            <button type="submit" className="w-full py-3 mt-4 bg-[#2B4D89] text-white hover:bg-[#1E3A68] rounded-xl font-black text-sm sm:text-base cursor-pointer shadow-md active:scale-[0.98] transition-all">
              {isEn ? 'Authenticate & Enter' : 'التحقق والدخول'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
            <p className="text-slate-500 font-bold mb-2">
              {isEn ? '🔑 Direct Administration Entry Details:' : '🔑 بيانات الدخول المعتمدة للإدارة لمتابعة وفحص الطلبات:'}
            </p>
            <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-right" dir={isEn ? "ltr" : "rtl"}>
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="font-bold text-slate-600">{isEn ? 'Admin Account:' : 'حساب الإدارة / الأدمن:'}</span>
                <button 
                  type="button" 
                  onClick={() => { setEmail('admin@shattabha.com'); setPassword('admin123456'); setError(''); }} 
                  className="font-mono bg-white hover:bg-slate-100 p-1 px-2 border border-slate-250 rounded text-[10px] text-slate-700 transition-colors cursor-pointer font-bold"
                >
                  admin@shattabha.com (PW: admin123456)
                </button>
              </div>
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="font-bold text-slate-600">{isEn ? 'Inspector Account:' : 'حساب المشرف الفني:'}</span>
                <button 
                  type="button" 
                  onClick={() => { setEmail('inspector@shattabha.com'); setPassword('12345678'); setError(''); }} 
                  className="font-mono bg-white hover:bg-slate-100 p-1 px-2 border border-slate-250 rounded text-[10px] text-slate-700 transition-colors cursor-pointer font-bold"
                >
                  inspector@shattabha.com (PW: 12345678)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
