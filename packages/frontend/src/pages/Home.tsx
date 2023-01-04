import { Outlet, useNavigate, useParams } from 'react-router-dom';
import {
  ErrorText,
  H2,
  Input,
  Link,
  ParLg,
  ParMd,
  SingleColumnLayout,
} from '@daohaus/ui';
import { isEthAddress } from '@daohaus/utils';
import styled from 'styled-components';
import React, { useState } from 'react';
import { useDHConnect } from '@daohaus/connect';

const LinkBox = styled.div`
  display: flex;
  width: 50%;
  justify-content: space-between;
`;

const AppContainer = styled.div`
  padding: 6rem;
`;

const DAOInputContainer = styled.div`
  width: 100%;
  padding: 2rem 0;
  input {
    max-width: 100%;
  }
`;

export const Home = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { chainId, isConnected } = useDHConnect();
  const [validAddress, setValidAddress] = useState<boolean>(true);

  const onDaoAddressChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const daoid = event.target.value;
    const isValid = isEthAddress(daoid);
    setValidAddress(daoid.length == 0 || isValid);
    if (isConnected && daoid && isValid) {
      
      navigate(`/${chainId}/${daoid}`)
    }
  };

  return (
    <SingleColumnLayout>
      <H2>DAOhaus Onboarder</H2>
      <ParMd>Onboard users to your DAO by adding a sibling-resistant layer of protection</ParMd>
      <AppContainer>
        {Object.keys(params).length ? (
          <Outlet />
        ) : (
          <SingleColumnLayout>
            {isConnected && (
              <DAOInputContainer>
                <ParLg>Specify your DAO Address in the Box below</ParLg>
                <Input id='daoAddress' onChange={onDaoAddressChanged} placeholder='0x....' />
                {!validAddress && <ErrorText>Not a Valid Address</ErrorText>}
              </DAOInputContainer>
            )}
            {!isConnected ? (
              <ParLg>Please Connect your Wallet</ParLg>
            ) : (
              <>
                <ParMd>Don't have one?</ParMd>
                <Link href="https://summon.daohaus.fun/" linkType="external">
                  Summon a new DAO
                </Link>
              </>
            )}
          </SingleColumnLayout>
        )}
        
      </AppContainer>
      {Object.keys(params).length > 0 && (
        <LinkBox>
          <Link href="https://github.com/santteegt/vconboarder-monorepo" linkType="external">
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
