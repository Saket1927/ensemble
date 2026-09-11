import React from 'react';
import { TenantProvider } from './context/TenantContext';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './router/AppRouter';

export function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <AppRouter />
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;
