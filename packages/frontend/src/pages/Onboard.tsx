import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios';
import { ethers } from 'ethers';
import { useDHConnect } from '@daohaus/connect';
// import { FormBuilder } from '@daohaus/form-builder';
import { useDao, useMembers } from '@daohaus/moloch-v3-context';
import {
  TXBuilder,
  // TXLifeCycleFns,
  useTxBuilder,
} from '@daohaus/tx-builder';
import { Avatar, Button, Card, ErrorText, H2, H3, Link, ParMd, useToast } from '@daohaus/ui';
import {
  // ArbitraryState,
  ReactSetter,
  // TXLego,
} from '@daohaus/utils';
// import { CeramicPassport, PassportReader } from '@gitcoinco/passport-sdk-reader';
// import { Passport } from '@gitcoinco/passport-sdk-types';

import { HausAnimated } from '../components/HausAnimated';
// import { FORM } from '../legos/forms';
import { BrightidPlatformDetails } from '../utils/constants';
import { DaoProfile } from '../components/DaoProfile';
import styled from 'styled-components';
import { APP_ABI } from '../contracts';
// import { TX } from '../legos/tx';
import { DIDCredential, normalizeDIDCredential } from '../utils/normalizeDIDCredential';
import { VCOnboarderShaman } from '../types/onboarder/VCOnboarder.sol';

const OptsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
`;

const ActionContainer = styled.div`
  padding-top: 2rem;
  * {
    margin-top: 1rem;
  }
`;

const LinkBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  a > * {
    margin-top: 0;
  }
`;

const VC_ISSUER_SERVER = import.meta.env.VITE_VC_ISSUER_SERVER;

enum OnboardStatus {
  IDLE = '',
  REQUEST_VC = 'Requesting Verifiable Credential',
  SUBMIT_VC_ONBOARD = 'Submitting Credential to DAO Onboarder',
  COMPLETE = 'Onboarded Successfully',
  ERROR = 'An error occurred while trying to onboard you to the DAO',
};

type IssuedCredential = {
  credential: unknown,
  signature: {
    v: Number;
    r: string,
    s: string,
  }
}

const BrightIDCredentialProvider = (
  {
    onboarderAddress,
    setLoading,
    setHasBrightID,
  }: {
    onboarderAddress?: string;
    setLoading: ReactSetter<boolean>;
    setHasBrightID: ReactSetter<boolean>;
}) => {
  const { address, chainId, isConnected, provider } = useDHConnect();
  const { refreshAll } = useDao();
  const { filterMembers, members } = useMembers();
  const { errorToast, successToast } = useToast();
  const { fireTransaction } = useTxBuilder();
  const [onboardingState, setOnboardingState] = useState<OnboardStatus>(OnboardStatus.IDLE);
  const [issuedCredential, setIssuedCredential] = useState<IssuedCredential>();

  useEffect(() => {
    if (address ) {
      filterMembers({ memberAddress: address.toLowerCase() });
    }
  }, [address]);

  const handleFetchCredential = useCallback(async () => {
    if (address) {
      const userDid = `did:pkh:eip155:1:${address.toLowerCase()}`;
      // --------------------------------------------
      // --------------------------------------------
      const brightIdContextReq = await axios.post(
        `${VC_ISSUER_SERVER}/verifyContextId`,
        {
          contextIdData: userDid,
        },
      );
      if (brightIdContextReq.status !== 200) {
        setOnboardingState(OnboardStatus.ERROR);
        errorToast({
          title: OnboardStatus.ERROR,
          description: 'Failed to fetch BightIDContext',
        });
        return;
      }
      const { valid, error } = brightIdContextReq.data;
      if (!valid) {
        console.error('Needs BrightID!!', error);
        setHasBrightID(false);
        setOnboardingState(OnboardStatus.ERROR);
        errorToast({
          title: OnboardStatus.ERROR,
          description: error,
        });
        return;
      }
      // --------------------------------------------
      // --------------------------------------------
      setOnboardingState(OnboardStatus.REQUEST_VC);
      const vcChallengeReq = await axios.post(
        `${VC_ISSUER_SERVER}/challenge`,
        {
          address: address.toLowerCase(),
          type: BrightidPlatformDetails.platform,
        },
      );
      if (vcChallengeReq.status !== 200) {
        setOnboardingState(OnboardStatus.ERROR);
        errorToast({
          title: OnboardStatus.ERROR,
          description: 'Failed to get VC CHallenge',
        });
        return;
      }
      try {
        const { credential } = vcChallengeReq.data;
        const signature =
          credential?.credentialSubject?.challenge &&
          await provider?.getSigner().signMessage(credential?.credentialSubject?.challenge);
        if (!signature) {
          setOnboardingState(OnboardStatus.ERROR);
          errorToast({
            title: OnboardStatus.ERROR,
            description: 'Failed to get user signature',
          });
          return;
        }

        // --------------------------------------------
        // --------------------------------------------
        const vcVerifyReq = await axios.post(
          `${VC_ISSUER_SERVER}/issue`,
          {
            payload: {
              type: BrightidPlatformDetails.platform,
              // types: [BrightidPlatformDetails.platform], // TODO: useful when submitting multiple providers
              version: BrightidPlatformDetails.version,
              address: address.toLowerCase(),
              proofs: {
                did: userDid,
                signature,
              },
              // rpcUrl,
            },
            challenge: credential,
          }
        );
        if (vcVerifyReq.status !== 200 || !vcVerifyReq.data.issuedCredential || !vcVerifyReq.data.splitSignature) {
          setOnboardingState(OnboardStatus.ERROR);
          errorToast({
            title: OnboardStatus.ERROR,
            description: 'Failed to issue Credential. Try again later',
          });
          return;
        }
        setIssuedCredential({
          credential: vcVerifyReq.data.issuedCredential,
          signature: {
            v: vcVerifyReq.data.splitSignature.v,
            r: vcVerifyReq.data.splitSignature.r,
            s: vcVerifyReq.data.splitSignature.s,
          },
        });
      } catch (error) {
        console.error('Failed!', error);
        setOnboardingState(OnboardStatus.ERROR);
        errorToast({
          title: OnboardStatus.ERROR,
          description: (error as Error).message,
        });
      }
     
    }
  }, [address, provider]);

  const submitOnboardTx = useCallback(async (_issuedCredential: IssuedCredential) => {
    if (!onboarderAddress) {
      setOnboardingState(OnboardStatus.ERROR);
      errorToast({
        title: OnboardStatus.ERROR,
        description: 'No Onbarder is installed for this DAO',
      });
      return;
    }
    setOnboardingState(OnboardStatus.SUBMIT_VC_ONBOARD);
    const { credential, signature } = _issuedCredential;
    const normalizedCredential = normalizeDIDCredential(credential as DIDCredential);
    // const execTx = async (tx: TXLego, callerState: ArbitraryState) => {
    //   await fireTransaction({
    //     tx,
    //     callerState,
    //     lifeCycleFns: {
    //       onTxError(error) {
    //         // const errMsg = handleErrorMessage({ error });
    //         // setTxState(TxStates.Error);
    //         setLoading(false);
    //         errorToast({
    //           title: OnboardStatus.ERROR,
    //           description: (error as Error).message,
    //         });
    //       },
    //       onTxSuccess() {
    //         // setTxState(TxStates.Success);
    //         setLoading(false);
    //         setOnboardingState(OnboardStatus.COMPLETE);
    //         successToast({
    //           title: OnboardStatus.COMPLETE,
    //         });
    //       },
    //     },
    //   });
    // };
    if (provider) {
      // TODO: use typings
      const onboarder = new ethers.Contract(
        onboarderAddress,
        APP_ABI.ONBOARDER_SHAMAN,
        provider.getSigner(),
      ) as VCOnboarderShaman;
      const tributeToken = await onboarder.functions.tributeToken();
      const minTribute = await onboarder.functions.minTribute();
      if (tributeToken[0] === ethers.constants.AddressZero) {
        try {
          const tx = await onboarder.functions.onboarder(
            normalizedCredential,
            ethers.BigNumber.from(signature.v),
            signature.r,
            signature.s,
            { value: minTribute[0] },
          );
          await tx.wait();
          await refreshAll();
          setLoading(false);
          setOnboardingState(OnboardStatus.COMPLETE);
          successToast({
            title: OnboardStatus.COMPLETE,
          });
          
        } catch (error) {
          console.error(error);
          setOnboardingState(OnboardStatus.ERROR);
          errorToast({
            title: OnboardStatus.ERROR,
            description: (error as Error).message,
          });
        }

        // TODO: invalid argType due to credential struct as contract param
        // await execTx(
        //   {
        //     ...TX.ONBOARD,
        //     overrides: {
        //       value: minTribute[0],
        //     }
        //   },
        //   {
        //     dao: {
        //       onboarderAddress,
        //     },
        //     formValues: {
        //       credential,
        //       sig: signature,
        //     },
        //   }
        // );
      } else {
        // TODO: Onboard with ERC20 as tribute
        setOnboardingState(OnboardStatus.ERROR);
        errorToast({
          title: OnboardStatus.ERROR,
          description: 'Coming Soon',
        });
      }
    }
  }, [onboarderAddress, provider]);

  useEffect(() => {
    if (issuedCredential) {
      submitOnboardTx(issuedCredential);
    }
  }, [issuedCredential, submitOnboardTx]);

  return (
    <Card>
      <Avatar
        alt={BrightidPlatformDetails.platform}
        fallback="Brightid"
        size="16rem"
        src={BrightidPlatformDetails.icon}
      />
      <H3>{BrightidPlatformDetails.name}</H3>
      <ParMd style={{ marginBottom: '2.4rem' }}>
        {BrightidPlatformDetails.description}
      </ParMd>
      {members && members.length > 0 && members?.find(m => m.memberAddress === address?.toLowerCase()) ? (
        <ErrorText>You're already a member of this DAO</ErrorText>
      ) : (
        <Button
          color='secondary'
          disabled={
            !provider ||
            !onboarderAddress ||
            ![OnboardStatus.IDLE, OnboardStatus.ERROR].includes(onboardingState)
          }
          fullWidth
          size="md"
          variant="outline"
          onClick={handleFetchCredential}
        >
          {[OnboardStatus.IDLE, OnboardStatus.ERROR].includes(onboardingState)
            ? `Connect`
            : (
              onboardingState === OnboardStatus.COMPLETE
                ? 'Success'
                : 'Processing...'
            )
          }
        </Button>
      )}
    </Card>
  );
};

export const Onboard = () => {
  const { address, chainId, isConnected, provider } = useDHConnect();
  const navigate = useNavigate();
  const { daochain, daoid } = useParams();
  const { dao } = useDao();
  const [loading, setLoading] = useState<boolean>(false);
  const [onboarderAddress, setOnboarderAddress] = useState<string>();
  const [hasBrightID, setHasBrightID] = useState<boolean>(true);

  useEffect(() => {
    setHasBrightID(true);
  }, [address]);
  // const [passport, setPassport] = useState<CeramicPassport | Passport>();

  // console.log('Onboard', daochain, daoId, VC_ISSUER_SERVER);

  // TODO: Fetch Gitcoin passport when they issue EIP712-complaint VCs
  // For the purpose of this PoC, we used our own Credential Issuer based on BrightID
  // const fetchPassport = useCallback(async () => {
  //   if (address) {
  //     setLoading(true);
  //     const reader = new PassportReader();
  //     // const reader = new PassportReader(
  //     //   'https://ceramic.staging.dpopp.gitcoin.co',
  //     //   '1',
  //     // );
  //     const pass = await reader.getPassport(address);
  //     if (pass) setPassport(pass);
  //     setLoading(false);
  //   }
  // }, [address, setLoading, setPassport]);

  // useEffect(() => {
  //   if (!passport && chainId) {
  //     fetchPassport();
  //   }
  // }, [chainId, fetchPassport]);

  const findOnbarderShaman = useCallback(async (shamanAddresses: Array<string>) => {
    setLoading(true);
    if (provider) {
      for (let i = 0; i < shamanAddresses.length; i++) {
        const shamanAddress = shamanAddresses[i];
        const contract = new ethers.Contract(shamanAddress, APP_ABI.ONBOARDER_SHAMAN, provider);
        try {
          await contract.functions.vcVerifier();
          setOnboarderAddress(shamanAddress);
          break;
        } catch (error) {
          console.log('Not an onboarder Shaman', shamanAddress);
        }
      }
    }
    setLoading(false);
  }, [provider]);


  useEffect(() => {
    console.log('Effect', dao?.shamen);
    if (dao?.shamen && provider) {
      findOnbarderShaman(dao.shamen.map(s => s.shamanAddress));
    }
  }, [dao?.shamen, provider]);

  return (
    <div>
      {isConnected && !dao && <HausAnimated />}
      {
        dao && !isConnected && (
          <>
            <HausAnimated />
            <ParMd>Please Connect your Wallet to Continue</ParMd>
          </>
        )
      }
      {dao && isConnected && (
        <>
          <div style={{display: 'flex'}}>
            <TXBuilder
              provider={provider}
              chainId={chainId}
              daoId={dao.id}
              // safeId="0x36824793440d1ab326b9b5634418393d5f5e30a3"
              appState={{}}
            >
              {loading && <HausAnimated />}
              {dao && !loading && (
                <>
                  <DaoProfile dao={dao} />
                  <BrightIDCredentialProvider
                    onboarderAddress={onboarderAddress}
                    setLoading={setLoading}
                    setHasBrightID={setHasBrightID}
                  />
                </>
              )}
            </TXBuilder>
          </div>
          <OptsContainer>
            {dao && !loading && !onboarderAddress && (
              <ActionContainer>
                <ParMd color='red'>This DAO does not have an Onboarder enabled</ParMd>
                <Button
                  color='primary'
                  fullWidth
                  size="md"
                  // variant="outline"
                  onClick={() => navigate(`/install?daochain=${daochain}&daoAddress=${daoid}`)}
                >
                  Install Onboarder
                </Button>
              </ActionContainer>
            )}
            {!hasBrightID && (
              <ActionContainer>
                <ParMd color='red'>Seems you don't have a BrightID Account</ParMd>
                <LinkBox>
                  <Link href="https://www.brightid.org/" linkType="external">
                    What's BrightID?
                  </Link>
                  <Link href="https://brightid.gitbook.io/brightid/getting-verified" linkType="external">
                    Join a Verification Party
                  </Link>
                  <Link href="https://passport.gitcoin.co/" linkType="external">
                    Gitcoin Passport
                  </Link>
                </LinkBox>
              </ActionContainer>
            )}
          </OptsContainer>
        </>
      )}
    </div>
  );
};
