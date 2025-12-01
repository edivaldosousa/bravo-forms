
import React, { useState } from 'react';
import { User } from '../types';
import { authenticateUser, changePassword, resetPasswordMock } from '../services/mockService';
import { ArrowRight, Lock, Mail, AlertCircle, CheckCircle, Eye, EyeOff, ShieldCheck, Key } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

// BRAVO LOGO EXACT IDENTITY
export const BravoLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Orange Top Block */}
    <path d="M25 15 H65 C80 15, 85 25, 85 35 C85 45, 75 50, 65 50 H25 V15 Z" fill="#F58220" />
    {/* Blue Middle Block */}
    <path d="M25 45 H65 C85 45, 90 55, 90 65 C90 75, 80 80, 70 80 H25 V45 Z" fill="#1E3A8A" />
    {/* Green Bottom Block */}
    <path d="M25 75 H60 C75 75, 80 80, 80 85 C80 90, 70 95, 60 95 H25 V75 Z" fill="#00A859" />
  </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // State Machine: LOGIN | FORGOT | NEW_PASSWORD
  const [view, setView] = useState<'LOGIN' | 'FORGOT' | 'NEW_PASSWORD'>('LOGIN');
  
  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI State
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null); // Stores user during first access flow

  // Validation Logic
  const validatePassword = (pass: string) => {
      const minLength = pass.length >= 8;
      const hasUpper = /[A-Z]/.test(pass);
      const hasLower = /[a-z]/.test(pass);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
      return { minLength, hasUpper, hasLower, hasSpecial, isValid: minLength && hasUpper && hasLower && hasSpecial };
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      setTimeout(() => {
          const result = authenticateUser(email, password);
          if (result.success && result.user) {
              if (result.user.isFirstAccess) {
                  setTempUser(result.user);
                  setView('NEW_PASSWORD');
              } else {
                  onLogin(result.user);
              }
          } else {
              setError(result.error || 'Credenciais inválidas.');
          }
          setLoading(false);
      }, 800);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      
      const check = validatePassword(newPassword);
      if (!check.isValid) {
          setError('A senha não atende aos requisitos de segurança.');
          return;
      }

      if (newPassword !== confirmPassword) {
          setError('As senhas não coincidem.');
          return;
      }

      if (tempUser) {
          setLoading(true);
          setTimeout(() => {
              changePassword(tempUser.id, newPassword);
              onLogin({ ...tempUser, isFirstAccess: false }); // Optimistic update locally
              setLoading(false);
          }, 800);
      }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccessMsg('');
      setLoading(true);

      setTimeout(() => {
          const exists = resetPasswordMock(email);
          if(exists) {
            setSuccessMsg('Um link de redefinição foi enviado para seu email.');
          } else {
            setSuccessMsg('Se o email existir, você receberá um link de redefinição.');
          }
          setLoading(false);
      }, 1000);
  };

  const passCheck = validatePassword(newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 animate-gradient-xy"></div>
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-10 border-t-4 border-orange-500 transition-all duration-500">
        
        {/* Header Section */}
        <div className="p-8 pb-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-3 rounded-xl shadow-md border border-slate-100">
              <BravoLogo className="w-16 h-16" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">Bravo Forms</h1>
          <p className="text-slate-500 font-medium text-xs tracking-wide uppercase">Acesso Seguro Corporativo</p>
        </div>

        <div className="px-8 pb-8 pt-2">
          {/* LOGIN VIEW */}
          {view === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center border border-red-100"><AlertCircle size={16} className="mr-2"/>{error}</div>}
                
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            required
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="seu.email@bravo.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">Senha</label>
                        <button type="button" onClick={() => {setError(''); setSuccessMsg(''); setView('FORGOT')}} className="text-xs text-blue-600 hover:underline">Esqueceu a senha?</button>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"}
                            required 
                            className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center transform active:scale-95"
                >
                    {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <>Entrar <ArrowRight size={18} className="ml-2"/></>}
                </button>
                
                <div className="text-center mt-4">
                     <p className="text-[10px] text-slate-400">
                         Novo por aqui? Solicite acesso ao seu gestor.<br/>
                         A senha padrão de primeiro acesso é fornecida pelo administrador.
                     </p>
                </div>
            </form>
          )}

          {/* FORGOT & RESET VIEWS REMAIN THE SAME AS ORIGINAL FILE ... */}
          {view === 'FORGOT' && (
             <form onSubmit={handleForgotSubmit} className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
                 <div className="text-center mb-4">
                     <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-600">
                         <Key size={24} />
                     </div>
                     <h3 className="text-lg font-bold text-slate-800">Recuperar Senha</h3>
                     <p className="text-sm text-slate-500">Informe seu email para receber o link.</p>
                 </div>

                 {successMsg ? (
                     <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm text-center border border-green-100">
                         <CheckCircle size={24} className="mx-auto mb-2"/>
                         {successMsg}
                         <button type="button" onClick={() => setView('LOGIN')} className="block w-full mt-3 text-green-800 font-bold hover:underline">Voltar ao Login</button>
                     </div>
                 ) : (
                    <>
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center"><AlertCircle size={16} className="mr-2"/>{error}</div>}
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="email" 
                                required
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="seu.email@bravo.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center"
                        >
                             {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Enviar Link'}
                        </button>
                        <button type="button" onClick={() => setView('LOGIN')} className="w-full text-sm text-slate-500 hover:text-slate-800 font-medium py-2">Cancelar</button>
                    </>
                 )}
             </form>
          )}

          {/* NEW PASSWORD VIEW */}
          {view === 'NEW_PASSWORD' && (
             <form onSubmit={handleChangePasswordSubmit} className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
                 <div className="text-center mb-4">
                     <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 text-orange-600">
                         <ShieldCheck size={24} />
                     </div>
                     <h3 className="text-lg font-bold text-slate-800">Primeiro Acesso</h3>
                     <p className="text-sm text-slate-500">Por segurança, defina uma nova senha pessoal.</p>
                 </div>

                 {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center border border-red-100"><AlertCircle size={16} className="mr-2"/>{error}</div>}

                 <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nova Senha</label>
                    <input 
                        type="password" 
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                    />
                 </div>

                 {/* Password Strength Indicators */}
                 <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mb-2">
                     <div className={`flex items-center ${passCheck.minLength ? 'text-green-600 font-bold' : ''}`}>
                         {passCheck.minLength ? <CheckCircle size={10} className="mr-1"/> : <div className="w-2.5 h-2.5 border rounded-full mr-1"/>} Mínimo 8 caracteres
                     </div>
                     <div className={`flex items-center ${passCheck.hasUpper ? 'text-green-600 font-bold' : ''}`}>
                         {passCheck.hasUpper ? <CheckCircle size={10} className="mr-1"/> : <div className="w-2.5 h-2.5 border rounded-full mr-1"/>} Letra Maiúscula
                     </div>
                     <div className={`flex items-center ${passCheck.hasLower ? 'text-green-600 font-bold' : ''}`}>
                         {passCheck.hasLower ? <CheckCircle size={10} className="mr-1"/> : <div className="w-2.5 h-2.5 border rounded-full mr-1"/>} Letra Minúscula
                     </div>
                     <div className={`flex items-center ${passCheck.hasSpecial ? 'text-green-600 font-bold' : ''}`}>
                         {passCheck.hasSpecial ? <CheckCircle size={10} className="mr-1"/> : <div className="w-2.5 h-2.5 border rounded-full mr-1"/>} Caractere Especial
                     </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Confirmar Senha</label>
                    <input 
                        type="password" 
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                 </div>

                 <button 
                    type="submit" 
                    disabled={loading || !passCheck.isValid}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Redefinir e Entrar'}
                </button>
             </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-400">Bravo Serviços Logísticos &copy; {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;