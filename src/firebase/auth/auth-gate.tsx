'use client';

import { useUser } from '@/firebase/auth/use-user';
import { LoginForm } from '@/firebase/auth/login-form';

export function AuthGate({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: React.ReactNode;
}) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!user) {
    return <LoginForm />;
  }

  return <>{children}</>;
}
