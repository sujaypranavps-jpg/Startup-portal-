import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import AppRouter from './router';

const queryClient = new QueryClient();

const AppProviders = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Toaster position="top-right" />
    </AuthProvider>
  </QueryClientProvider>
);

export default AppProviders;
