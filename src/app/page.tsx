
import CurrencyClarityApp from '@/components/CurrencyClarityApp';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function Home() {
  return (
    <FirebaseClientProvider>
      <CurrencyClarityApp />
    </FirebaseClientProvider>
  );
}
