"use client";

import React, { useState } from "react";
import { Shield, KeyRound, X, CheckCircle, ArrowRight, Lock } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function AdminAuthModal() {
  const { isAuthModalOpen, closeAuthModal, unlockAdmin } = useAdmin();
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockAdmin(passcode);
    if (!success) {
      setErrorMsg("Incorrect passcode. Try 'admin123' or click 'One-Click Demo Access'.");
    } else {
      setErrorMsg("");
      setPasscode("");
    }
  };

  const handleInstantUnlock = () => {
    unlockAdmin("admin123");
    setErrorMsg("");
    setPasscode("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative text-slate-100 space-y-6">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/40 text-brand-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white">Unlock Admin Privileges</h3>
            <p className="text-xs text-slate-400">Access store controls, inventory, & RAG knowledge base</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Admin Passcode
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="Enter admin passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Default passcode: <code className="text-brand-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">admin123</code>
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Verify & Unlock Privileges</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-slate-800/80 pt-4 text-center">
          <button
            type="button"
            onClick={handleInstantUnlock}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5 text-brand-400" />
            <span>One-Click Demo Admin Access</span>
          </button>
        </div>
      </div>
    </div>
  );
}

