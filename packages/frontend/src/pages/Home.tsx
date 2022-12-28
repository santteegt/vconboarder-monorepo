import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Card, H2, H3, Input, Link, ParLg, ParMd, SingleColumnLayout } from '@daohaus/ui';
import styled from 'styled-components';
import { DAOInput } from '../components/customFields/DAOInput';

const LinkBox = styled.div`
  display: flex;
  width: 50%;
  justify-content: space-between;
`;

const AppContainer = styled.div`
  padding: 6rem;
`;

export const Home = () => {
  const params = useParams();
  const navigate = useNavigate();

  // useLayoutEffect(() => {
  //   // if (isConnected && address && profile) {
  //   //   return;
  //   // }
  //   if (isConnected && !profile) {
  //     navigate(`/${address}`);
  //     window.location.href = `#/${address}`;
  //   }
  // }, [isConnected, address, profile, navigate]);

  console.log('Home Parms', params);

  return (
    <SingleColumnLayout>
      <H2>DAOhaus Onboarder</H2>
      <ParMd>Onboard users to your DAO by adding a sibling-resistant layer of protection</ParMd>
      <AppContainer>
        {Object.keys(params).length ? (
          <Outlet />
        ) : (
          <SingleColumnLayout>
            <ParLg>Specify your DAO address in the App URL</ParLg>
            <ParLg>or</ParLg>
            <Link href="https://summon.daohaus.fun/" linkType="external">
              Summon a new DAO
            </Link>
          </SingleColumnLayout>
        )}
        
      </AppContainer>
      {Object.keys(params).length > 0 && (
        <LinkBox>
          <Link href="https://github.com/HausDAO/monorepo" linkType="external">
            Github
          </Link>
          <Link
            href={
              params?.daochain && params?.daoid
                ? `https://admin.daohaus.fun/#/molochv3/${params.daochain}/${params.daoid}`
                : 'https://admin.daohaus.fun/'
            }
            linkType="external"
          >
            DAO Admin
          </Link>
          <Link href="/install">Install Plugin</Link>
        </LinkBox>
      )}
    </SingleColumnLayout>
  );
};
