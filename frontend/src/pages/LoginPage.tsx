import React from "react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { LoginForm } from "../components/auth/LoginForm";
import { SystemStatusPanel } from "../components/auth/SystemStatusPanel";

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onSuccess: () => void;
}

export function LoginPage({ onNavigateToRegister, onSuccess }: LoginPageProps) {
  return (
    <AuthLayout heroContent={<SystemStatusPanel />}>
      <LoginForm 
        onNavigateToRegister={onNavigateToRegister} 
        onSuccess={onSuccess} 
      />
    </AuthLayout>
  );
}
