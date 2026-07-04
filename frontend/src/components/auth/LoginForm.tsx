import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Eye, EyeOff, ShieldCheck, Mail, Lock, AlertTriangle, ArrowRight, Check } from "lucide-react";

interface LoginFormProps {
  onNavigateToRegister: () => void;
  onSuccess: () => void;
}

export function LoginForm({ onNavigateToRegister, onSuccess }: LoginFormProps) {
  const { login, error: authError, clearError } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load remembered operator email if present
  useEffect(() => {
    clearError();
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("soc_remembered_operator");
      if (stored) {
        setEmail(stored);
        setRememberMe(true);
      }
    }
  }, [clearError]);

  const validateEmail = (input: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(input);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setValidationError("REQUIRED: Operator email address is mandatory.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setValidationError("INVALID FORMAT: Provide a valid enterprise operator email domain.");
      return;
    }

    if (!password) {
      setValidationError("REQUIRED: Session decryption password is required.");
      return;
    }

    setLoading(true);

    try {
      await login({ email: trimmedEmail, password });
      
      // Save or remove remembered credentials
      if (rememberMe) {
        localStorage.setItem("soc_remembered_operator", trimmedEmail);
      } else {
        localStorage.removeItem("soc_remembered_operator");
      }

      setSuccessMsg("OPERATOR CREDENTIALS VERIFIED. DECRYPTING PIPELINES...");
      onSuccess();
    } catch (err: any) {
      // Error handled by AuthContext but shown here
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("CREDENTIALS RESTORATION: Please contact your commanding Agency Security Officer (ASO) to request terminal password synthesis.");
  };

  return (
    <div className="space-y-6 font-mono text-left" id="soc-login-interface">
      {/* Title block */}
      <div className="space-y-1.5">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck size={18} className="text-cyan-550 dark:text-cyan-400 stroke-[2.5]" />
          HYBRID SOC COMMAND CENTER
        </h2>
        <p className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase font-bold leading-normal">
          AI-Powered Multi-Model Hybrid Cloud Security Monitoring Platform
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-250 dark:border-zinc-900 rounded-xl p-6 shadow-sm hover:shadow-cyan-500/5 transition-all">
        
        {/* Error Notifications */}
        {(validationError || authError) && (
          <div 
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2 text-red-650 dark:text-red-400 text-[10.5px] leading-relaxed uppercase font-bold"
            role="alert"
          >
            <AlertTriangle size={15} className="shrink-0 stroke-[2.5] mt-0.5" />
            <span>{validationError || authError}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div 
            className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/20 rounded-lg flex gap-2 text-emerald-650 dark:text-emerald-400 text-[10.5px] uppercase font-bold"
            role="status"
          >
            <Check size={14} className="shrink-0 stroke-[2.5] mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Operator Email Field */}
          <div className="space-y-1">
            <label 
              htmlFor="operator-email" 
              className="text-[9.5px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider block"
            >
              OPERATOR EMAIL ADDRESS
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-zinc-650 pointer-events-none">
                <Mail size={13} className="stroke-[2.5]" />
              </span>
              <input
                id="operator-email"
                type="email"
                name="email"
                placeholder="operator@agency.domain"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                aria-required="true"
                aria-invalid={!!validationError}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950/40 border border-slate-250 dark:border-zinc-900 rounded-lg font-mono text-[11.5px] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-700 outline-none hover:border-slate-350 dark:hover:border-zinc-800 focus:border-cyan-550 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-550/30 transition-all text-left"
              />
            </div>
          </div>

          {/* Session Token / Password Field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label 
                htmlFor="session-password" 
                className="text-[9.5px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider"
              >
                SECURE AUTHENTIQUE PASSWORD
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[8.5px] font-black uppercase text-cyan-550 dark:text-cyan-400 hover:underline cursor-pointer focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-zinc-650 pointer-events-none">
                <Lock size={13} className="stroke-[2.5]" />
              </span>
              <input
                id="session-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="----------------"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                aria-required="true"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-zinc-950/40 border border-slate-250 dark:border-zinc-900 rounded-lg font-mono text-[11.5px] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-700 outline-none hover:border-slate-350 dark:hover:border-zinc-800 focus:border-cyan-550 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-550/30 transition-all text-left"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={0}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-zinc-500 hover:text-cyan-550 dark:hover:text-cyan-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* Remember Me and Check options */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-[9.5px] text-slate-500 dark:text-zinc-400 uppercase font-black cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="rounded border-slate-300 dark:border-zinc-800 text-cyan-550 dark:text-cyan-500 bg-slate-50 dark:bg-zinc-950 focus:ring-0 cursor-pointer h-3.5 w-3.5"
              />
              <span>Remember Me</span>
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-550 dark:bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-black uppercase text-center tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-cyan-500/20 active:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>VERIFYING CRYPTO SHIELDS...</span>
              </>
            ) : (
              <>
                <span>SIGN IN SECURE WORKSPACE</span>
                <ArrowRight size={13} className="stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Register Footer */}
      <div className="flex justify-between items-center text-[10px] uppercase font-black border-t border-slate-200 dark:border-zinc-900 pt-4">
        <span className="text-slate-400 dark:text-zinc-550">NO REGISTERED SHIFT IDENTIFIER?</span>
        <button
          onClick={onNavigateToRegister}
          className="text-cyan-550 dark:text-cyan-400 hover:underline tracking-wider cursor-pointer"
        >
          Create SOC Account
        </button>
      </div>
    </div>
  );
}
