import { Routes as RoutesDom, Route, useLocation } from 'react-router-dom';
import { DHConnectProvider, DHLayout } from '@daohaus/connect';
import { H3 } from '@daohaus/ui';

import { Home } from './pages/Home';
import { InstallForm } from './pages/Install';
import { Onboard } from './pages/Onboard';
import DaoContext from './context/DAOContext';

export const Routes = () => {
  const { pathname } = useLocation();

  return (
    <DHConnectProvider>
      <DHLayout
        leftNav={<H3>DAO Onboarder</H3>}
        pathname={pathname}
        navLinks={[
          { label: 'Home', href: '/' },
          { label: 'Install', href: '/install' },
        ]}
      >
        <RoutesDom>
          <Route path="/" element={<Home />}>
            <Route
              path="/:daochain/:daoid"
              element={
                <DaoContext>
                  <Onboard/>
                </DaoContext>
              } />
            <Route path="*" element={<>NOT FOUND</>} />
          </Route>
          <Route path="/install" element={<InstallForm />} />
        </RoutesDom>
      </DHLayout>
    </DHConnectProvider>
  );
};
