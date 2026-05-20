import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="cafe-theme">
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}

export default App;