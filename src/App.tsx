import React from 'react';
import { TenantProvider, useTenant } from './context/TenantContext';
import { DomainBar } from './components/common/DomainBar';
import { MobileFrame } from './components/common/MobileFrame';
import { CustomerLayout } from './components/customer/CustomerLayout';
import { RestaurantLayout } from './components/restaurant/RestaurantLayout';
import { MasterLayout } from './components/master/MasterLayout';
import { CaptainLayout } from './components/captain/CaptainLayout';

const PlatformRouter: React.FC = () => {
  const { role } = useTenant();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Top Domain Simulator Bar */}
      <DomainBar />

      {/* Layer Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {role === 'customer' && (
          <MobileFrame>
            <CustomerLayout />
          </MobileFrame>
        )}

        {role === 'captain' && <CaptainLayout />}

        {role === 'restaurant_admin' && <RestaurantLayout />}

        {role === 'master_admin' && <MasterLayout />}
      </div>
    </div>
  );
};

export function App() {
  return (
    <TenantProvider>
      <PlatformRouter />
    </TenantProvider>
  );
}

export default App;
