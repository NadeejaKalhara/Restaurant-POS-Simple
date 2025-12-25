import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home';
import Login from './pages/Login';
import Register from './pages/Register';
import POSTerminal from './pages/POSTerminal';
import Admin from './pages/admin';
import { configureQZSigning } from './utils/qzPrint';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  // Initialize QZ Tray certificate signing on app load
  useEffect(() => {
    // Configure QZ Tray with demo certificate (works out of the box)
    // For production, set up server-side signing (see QZ_TRAY_SIGNING_SETUP.md)
    configureQZSigning({
      useDemoCert: true, // Uses QZ Tray demo certificate
      // For production, uncomment and configure:
      // certificateUrl: '/api/qz/certificate', // URL to fetch certificate
      // signatureUrl: '/api/qz/sign', // URL to sign messages
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pos" 
                element={
                  <ProtectedRoute>
                    <POSTerminal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Toaster 
              position="top-center"
              toastOptions={{
                classNames: {
                  toast: 'dark:bg-slate-800 dark:text-white bg-white text-slate-900',
                  success: 'dark:bg-emerald-500/10 dark:text-emerald-400 bg-emerald-50 text-emerald-700',
                  error: 'dark:bg-red-500/10 dark:text-red-400 bg-red-50 text-red-700',
                },
              }}
            />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

