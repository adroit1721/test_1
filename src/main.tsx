import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient.ts';
import App from './App.tsx';
import { AdminDataProvider } from './context/AdminDataContext.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AdminDataProvider>
          <App />
        </AdminDataProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
