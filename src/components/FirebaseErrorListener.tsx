"use client";

import React, { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';
import { Button } from './ui/button';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error("Caught a Firestore permission error:", error);
      toast({
        variant: "destructive",
        title: "Lỗi quyền truy cập",
        description: (
          <div className="flex flex-col gap-2">
            <p>Yêu cầu của bạn đã bị từ chối bởi quy tắc bảo mật của Firestore. Hãy kiểm tra lại quyền truy cập của bạn.</p>
            <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
              <code className="text-white text-xs whitespace-pre-wrap">{error.message}</code>
            </pre>
          </div>
        ),
        duration: Infinity
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
