import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { PasswordStrength } from "./PasswordStrength";
import { ShieldAlert, UserPlus, Mail, Shield, Award, Lock, ArrowRight, Check, AlertTriangle } from "lucide-react";

interface RegisterFormProps {
  onNavigateToLogin: () => void;
  onSuccess: () => void;
}

export function RegisterForm({ onNavigateToLogin, onSuccess }: RegisterFormProps) {
  const { register, error: authError, clearError } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const validateEmail = (input: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(input);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!fullName.trim()) {
      setValidationError("REQUIRED: Operator signature name is required.");
      return;
    }

    if (!email.trim()) {
      setValidationError("REQUIRED: Corporate email address is required.");
      return;
    }

    if (!validateEmail(email.trim())) {
      setValidationError("INVALID FORMAT: Operator email address contains invalid characters or domains.");
      return;
    }

    if (!organization.trim()) {
      setValidationError("REQUIRED: Agency command or organization organization is required.");
      return;
    }

    if (!password) {
      setValidationError("REQUIRED: Security credential password is required.");
      return;
    }

    if (password.length < 8) {
      setValidationError("PASSWORD EXHAUSTION: Password must span at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("CREDENTIAL NON-MATCH: Secure passwords and confirmations must be exactly identical.");
      return;
    }

    if (!agreed) {
      setValidationError("MISSING COMPLIANCE: Agreement to the Platform Security Policy is mandatory.");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        organization: organization.trim(),
      });

      setSuccessMsg("COMMISSIONING ACTIVE OPERATOR. SYNCHRONIZING AUTH CHUNKS...");
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err: any) {
      // Error is caught by AuthContext, handles custom err display
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 font-mono text-left" id="soc-register-interface">
      {/* Title block */}
      <div className="space-y-1.5">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <UserPlus size={18} className="text-cyan-550 dark:text-cyan-400 stroke-[2.5]" />
          CREATE SOC OPERATOR ACCOUNT
        </h2>
        <p className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase font-bold leading-normal">
          Request access to the Hybrid SOC Platform
        </p>
      </div>

      {/* Register card */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-250 dark:border-zinc-900 rounded-xl p-6 shadow-sm">
        
        {/* Error notification */}
        {(validationError || authError) && (
          <div 
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2 text-red-650 dark:text-red-400 text-[10.5px] leading-relaxed uppercase font-bold"
            role="alert"
          >
            <AlertTriangle size={15} className="shrink-0 stroke-[2.5] mt-0.5" />
            <span>{validationError || authError}</span>
          </div>
        )}

        {/* Success notification */}
        {successMsg && (
          <div 
            className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex gap-2 text-emerald-650 dark:text-emerald-400 text-[10.5px] uppercase font-bold"
            role="status"
          >
            <Check size={14} className="shrink-0 stroke-[2.5] mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Operator Signature Name */}
          <div className="space-y-1">
            <label htmlFor="register-fullName" className="text-[9.5px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              OPERATOR FULL NAME
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-zinc-650 pointer-events-none">
                <Shield size={13} className="stroke-[2.5]" />
              </span>
              <input
                id="register-fullName"
                type="text"
                placeholder="Agent Jack Sparrow"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/40 border border-slate-250 dark:border-zinc-900 rounded-lg font-mono text-[11px] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-700 outline-none hover:border-slate-350 dark:hover:border-zinc-800 focus:border-cyan-550 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-550/30 transition-all text-left"
              />
            </div>
          </div>

          {/* Company / Command Organization */}
          <div className="space-y-1">
            <label htmlFor="register-organization" className="text-[9.5px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              ASSIGNED SECURITY COMMAND / ORGANIZATION
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-zinc-650 pointer-events-none">
                <Award size={13} className="stroke-[2.5]" />
              </span>
              <input
                id="register-organization"
                type="text"
                placeholder="Global Defense Operations Corp"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                disabled={loading}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/40 border border-slate-250 dark:border-zinc-900 rounded-lg font-mono text-[11px] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-700 outline-none hover:border-slate-350 dark:hover:border-zinc-800 focus:border-cyan-550 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-550/30 transition-all text-left"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="register-email" className="text-[9.5px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              ENTERPRISE EMAIL ADDRESS
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-zinc-650 pointer-events-none">
                <Mail size={13} className="stroke-[2.5]" />
              </span>
              <input
                id="register-email"
                type="email"
                placeholder="agent.sparrow@ops.global"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/40 border border-slate-250 dark:border-zinc-900 rounded-lg font-mono text-[11px] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-700 outline-none hover:border-slate-350 dark:hover:border-zinc-800 focus:border-cyan-550 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-550/30 transition-all text-left"
              />
            </div>
          </div>

          {/* Password & Strength Checker */}
          <div className="space-y-1">
            <label htmlFor="register-password" className="text-[9.5px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              CREATE CRYPTO TRUST KEY (PASSWORD)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-zinc-650 pointer-events-none">
                <Lock size={13} className="stroke-[2.5]" />
              </span>
              <input
                id="register-password"
                type="password"
                placeholder="----------------"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/40 border border-slate-250 dark:border-zinc-900 rounded-lg font-mono text-[11px] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-700 outline-none hover:border-slate-350 dark:hover:border-zinc-800 focus:border-cyan-550 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-550/30 transition-all text-left"
              />
            </div>

            {/* Embedded Level Checker */}
            <PasswordStrength value={password} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1 pt-1">
            <label htmlFor="register-confirmPassword" className="text-[9.5px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              RE-ENTER KEY TO CONFIRM
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-zinc-650 pointer-events-none">
                <Lock size={13} className="stroke-[2.5]" />
              </span>
              <input
                id="register-confirmPassword"
                type="password"
                placeholder="----------------"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/40 border border-slate-250 dark:border-zinc-900 rounded-lg font-mono text-[11px] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-700 outline-none hover:border-slate-350 dark:hover:border-zinc-800 focus:border-cyan-550 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-550/30 transition-all text-left"
              />
            </div>
          </div>

          {/* Security Compliance Policy Check */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-[9.5px] text-slate-500 dark:text-zinc-400 uppercase font-black cursor-pointer select-none leading-snug">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={loading}
                className="rounded border-slate-300 dark:border-zinc-800 text-cyan-550 dark:text-cyan-500 bg-slate-50 dark:bg-zinc-950 focus:ring-0 cursor-pointer h-3.5 w-3.5 shrink-0 mt-0.5"
              />
              <span className="leading-snug">
                I ACKNOWLEDGE AND COMPLY WITH THE PLATFORM OPERATIONS SECURITY RULES AND ACTIVE AUDIT CONSTRAINTS.
              </span>
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
                <span>COMPLYING ENVELOPE KEYS...</span>
              </>
            ) : (
              <>
                <span>COMMISSION OPERATOR</span>
                <ArrowRight size={13} className="stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Login Footer */}
      <div className="flex justify-between items-center text-[10px] uppercase font-black border-t border-slate-200 dark:border-zinc-900 pt-4">
        <span className="text-slate-400 dark:text-zinc-550">ALREADY HAVE ACTIVE COMMISSION?</span>
        <button
          onClick={onNavigateToLogin}
          className="text-cyan-550 dark:text-cyan-400 hover:underline tracking-wider cursor-pointer font-bold uppercase"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
