import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';
import { AuthProvider, useAuth } from '@/shared/context/auth-context';
import { AuthScreen } from '@/pages/auth/auth.screen';
import { HomeScreen } from '@/pages/home/home.screen';

function AppContent() {
  const { user } = useAuth();
  return user ? <HomeScreen /> : <AuthScreen />;
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;