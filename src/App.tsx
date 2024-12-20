import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from './lib/firebase';
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from 'react-i18next';
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }

    // Disable right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: "Security Notice",
        description: "Right-clicking is disabled for security reasons",
        duration: 2000,
      });
    };

    // Disable keyboard shortcuts and dev tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Auth state listener
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      
      if (user) {
        // Verify if the user still exists in Firebase
        user.getIdToken(true)  // Force token refresh
          .then(() => {
            console.log('Token verified successfully');
            setUser(user);
          })
          .catch((error) => {
            console.error('Token verification failed:', error);
            // Handle specific Firebase error codes
            if (error.code === 'auth/user-token-expired' || 
                error.code === 'auth/user-not-found' || 
                error.code === 'auth/id-token-expired') {
              console.log('User account no longer exists or token expired');
              toast({
                title: "Account Deleted",
                description: "Your account has been deleted",
                variant: "destructive"
              });
              auth.signOut().then(() => {
                console.log('User signed out after account deletion');
                setUser(null);
              });
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        console.log('No user found, setting user state to null');
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      unsubscribe();
    };
  }, [toast, i18n]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route 
                path="/" 
                element={user ? <Navigate to="/chat" replace /> : <Auth />} 
              />
              <Route 
                path="/chat" 
                element={user ? <Chat /> : <Navigate to="/" replace />} 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
