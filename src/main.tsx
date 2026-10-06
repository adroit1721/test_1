import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AdminDataProvider } from './context/AdminDataContext.tsx';
import { RootErrorBoundary } from './components/RootErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <AdminDataProvider>
        <App />
      </AdminDataProvider>
    </RootErrorBoundary>
  </StrictMode>,
);

