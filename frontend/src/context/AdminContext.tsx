"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AdminContextType {
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  unlockAdmin: (passcode: string) => boolean;
  exitAdmin: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = "nova_admin_authorized_v1";
const DEFAULT_ADMIN_PASSCODE = "admin123";

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored === "true") {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error("Failed to load admin state", e);
    }
    setHasHydrated(true);
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const unlockAdmin = (passcode: string): boolean => {
    // Accepts admin123 or instant unlock for demo convenience
    if (passcode.trim() === DEFAULT_ADMIN_PASSCODE || passcode.trim().toLowerCase() === "admin") {
      setIsAdmin(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      }
      setIsAuthModalOpen(false);
      return true;
    }
    return false;
  };

  const exitAdmin = () => {
    setIsAdmin(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        unlockAdmin,
        exitAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

