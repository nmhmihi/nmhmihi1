'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase/provider';
import { doc, setDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useUser() {
  const app = useFirebaseApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Create or update the user's profile in Firestore
        const userRef = doc(firestore, 'users', user.uid);
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastLogin: serverTimestamp(),
        };
        setDoc(userRef, userData, { merge: true })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                  path: userRef.path,
                  operation: 'update',
                  requestResourceData: userData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  return { user, isLoading };
}
