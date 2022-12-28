import { useEffect, useState } from 'react';
import { matchPath, Routes as RoutesDom, Route, useLocation } from 'react-router-dom';
import { DHConnectProvider, DHLayout } from '@daohaus/connect';

import { Home } from './pages/Home';
import { InstallForm } from './pages/Install';
import { Onboard } from './pages/Onboard';
import DaoContext from './context/DAOContext';
import { H2, H3 } from '@daohaus/ui';

export const Routes = () => {
  const { pathname } = useLocation();
  const [daoChainId, setDaoChainId] = useState<string | undefined>();
  // const pathMatch = matchPath('/:daochain/*', pathname);

  // useEffect(() => {
  //   if (pathMatch?.params?.daochain) {
  //     setDaoChainId(pathMatch?.params?.daochain);
  //   }
  //   if (daoChainId && !pathMatch?.params?.daochain) {
  //     setDaoChainId(undefined);
  //   }
  // }, [pathMatch?.params?.daochain, setDaoChainId, daoChainId]);

  // console.log('Routes', daoChainId, pathMatch);

  return (
    <DHConnectProvider daoChainId={daoChainId}>
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
