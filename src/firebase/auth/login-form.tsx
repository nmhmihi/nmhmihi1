'use client';

import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome } from 'lucide-react';

export function LoginForm() {
  const app = useFirebaseApp();
  const auth = getAuth(app);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Chào mừng bạn!</CardTitle>
          <CardDescription>
            Đăng nhập để đồng bộ hóa dữ liệu của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={signInWithGoogle}>
            <Chrome className="mr-2 h-4 w-4" />
            Đăng nhập với Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
