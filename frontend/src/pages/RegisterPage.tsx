import React from "react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { RegisterForm } from "../components/auth/RegisterForm";
import { SecurityNotice } from "../components/auth/SecurityNotice";

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onSuccess: () => void;
}

export function RegisterPage({ onNavigateToLogin, onSuccess }: RegisterPageProps) {
  return (
    <AuthLayout heroContent={<SecurityNotice />}>
      <RegisterForm 
        onNavigateToLogin={onNavigateToLogin} 
        onSuccess={onSuccess} 
      />
    </AuthLayout>
  );
}
