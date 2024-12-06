import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from './lib/firebase';
import { useToast } from "@/components/ui/use-toast";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      
      if (user) {
        // Verify if the user still exists in Firebase
        user.getIdToken()
          .then(() => {
            setUser(user);
          })
          .catch((error) => {
            console.error('Token verification failed:', error);
            if (error.code === 'auth/user-token-expired' || error.code === 'auth/user-not-found') {
              toast({
                title: "Account Deleted",
                description: "Your account has been deleted",
                variant: "destructive"
              });
              auth.signOut();
              setUser(null);
            }
          });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

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