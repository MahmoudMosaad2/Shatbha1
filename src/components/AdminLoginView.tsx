import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, Home } from 'lucide-react';
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
    <div className="min-h-screen sm:h-screen bg-slate-50 flex flex-col justify-center items-center p-3 sm:p-4 overflow-y-auto sm:overflow-hidden relative" dir={isEn ? "ltr" : "rtl"}>
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#2B4D89] via-[#D8B448] to-[#2B4D89]" />

      <button
        onClick={onBack}
        className={`absolute top-4 ${isEn ? 'left-4 right-auto' : 'right-4 left-auto'} sm:top-6 sm:left-6 sm:right-6 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-all font-extrabold text-xs cursor-pointer shadow-xs z-20`}
      >
        <Home className="w-3.5 h-3.5 text-[#2B4D89]" />
        <span>{isEn ? 'Back to Home' : 'الرجوع للصفحة الرئيسية'}</span>
      </button>

      <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-100 my-auto shrink-0">
        <div className="bg-[#2B4D89] py-5 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-900 opacity-20" />
          <div className="relative z-10 bg-white p-2.5 rounded-2xl mb-2.5 shadow-md border border-white/10">
            <ShieldCheck className="w-6.5 h-6.5 text-[#2B4D89]" />
          </div>
          <h2 className="text-white text-lg font-extrabold relative z-10 font-sans tracking-tight">
            {isEn ? 'Shattabha Administration' : 'إدارة منصة شطبها'}
          </h2>
          <p className="text-slate-300 text-[11px] mt-1 font-medium relative z-10">
            {isEn ? 'Secure portal access for admins & inspectors' : 'بوابة الدخول الآمن للإدارة والمشرفين'}
          </p>
        </div>

        <div className="p-5 sm:p-6 pb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-50 text-red-600 p-2.5 rounded-xl text-xs font-bold text-center border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block mx-1">
                {isEn ? 'Authorized Email' : 'البريد الإلكتروني المعتمد'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@shattabha.com"
                className="w-full p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/20 text-xs sm:text-sm font-semibold text-slate-800 transition-all text-left"
                dir="ltr"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block mx-1">
                {isEn ? 'Password' : 'كلمة المرور'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2B4D89] focus:ring-2 focus:ring-[#2B4D89]/20 text-xs sm:text-sm font-semibold text-slate-800 transition-all text-left"
                dir="ltr"
              />
            </div>

            <button type="submit" className="w-full py-2.5 sm:py-3 mt-3 bg-[#2B4D89] text-white hover:bg-[#1E3A68] rounded-xl font-black text-xs sm:text-sm cursor-pointer shadow-md active:scale-[0.98] transition-all">
              {isEn ? 'Authenticate & Enter' : 'التحقق والدخول'}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[10.5px] text-slate-400 font-medium">
            <p className="text-slate-500 font-extrabold mb-1.5">
              {isEn ? '🔑 Direct Administration Entry Details:' : '🔑 بيانات الدخول المعتمدة للإدارة ومتابعة الطلبات:'}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-1.5" dir={isEn ? "ltr" : "rtl"}>
              <button 
                type="button" 
                onClick={() => { setEmail('admin@shattabha.com'); setPassword('admin123456'); setError(''); }} 
                className="bg-slate-50 hover:bg-slate-100 p-2 border border-slate-200 rounded-xl text-[10.5px] text-[#2B4D89] font-black transition-colors cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 shadow-2xs"
              >
                <span>{isEn ? 'Autofill Admin' : 'تعبئة حساب الأدمن'}</span>
                <span className="text-[8px] text-slate-400 font-mono">admin@shattabha.com</span>
              </button>
              <button 
                type="button" 
                onClick={() => { setEmail('inspector@shattabha.com'); setPassword('12345678'); setError(''); }} 
                className="bg-slate-50 hover:bg-slate-100 p-2 border border-slate-200 rounded-xl text-[10.5px] text-[#2B4D89] font-black transition-colors cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 shadow-2xs"
              >
                <span>{isEn ? 'Autofill Inspector' : 'تعبئة حساب المشرف'}</span>
                <span className="text-[8px] text-slate-400 font-mono">inspector@shattabha.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
