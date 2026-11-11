"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ExternalLink, LogOut, Plus, FileText, Package } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function AdminBar() {
  const { isAdmin, exitAdmin } = useAdmin();

  if (!isAdmin) return null;

  return (
    <div className="bg-slate-950 text-white border-b border-brand-500/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 relative z-40">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
        </span>
        <span className="font-bold text-white flex items-center gap-1">
          <span>Admin Privileges Active</span>
        </span>
        <span className="text-slate-400 hidden sm:inline">• You can edit store data, orders, & AI knowledge base</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/admin"
          className="flex items-center gap-1 px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold transition-colors"
        >
          <span>Admin Portal</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        <button
          onClick={exitAdmin}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-red-950/60 hover:text-red-300 text-slate-400 rounded-lg transition-colors border border-slate-800"
          title="Exit Admin Mode"
        >
          <LogOut className="w-3 h-3" />
          <span className="hidden sm:inline">Exit Admin</span>
        </button>
      </div>
    </div>
  );
}

