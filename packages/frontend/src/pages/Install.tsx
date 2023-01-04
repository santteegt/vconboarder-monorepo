import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useDHConnect } from '@daohaus/connect';
import { FormBuilder } from '@daohaus/form-builder';
import { Keychain } from '@daohaus/keychain-utils';
import { TXBuilder, useTxBuilder } from '@daohaus/tx-builder';
import { AddressDisplay, Button, Link, ParMd, useToast } from '@daohaus/ui';

import { APP_ABI } from '../contracts';
import { CustomFields } from '../legos/config';
import { FORM } from '../legos/forms';
import { TX } from '../legos/tx';

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2rem;
  width: 58rem;
  margin-top: 5rem;
  * {
    margin-top: 1rem;
  }
`;

enum ProposalTxStates {
  Error = 'Error submitting Shaman Proposal',
  Success = 'DAO Proposal Submitted!',
}

const Actions = (
  {
    chainId,
    daoId,
    shamanAddress,
    shamanPermission = '3',
  }: {
    chainId: keyof Keychain;
    daoId: string;
    shamanAddress: string;
    shamanPermission?: string;
}) => {
  const { fireTransaction } = useTxBuilder();
  const { errorToast, successToast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [txSuccess, setTxSuccess] = useState<boolean>(false);

  const submitShamanProposal = async () => {
    setLoading(true);
    await fireTransaction({
      tx: TX.ADD_SHAMAN,
      callerState: {
        proposal: {
          daoId,
          shamanAddress,
          shamanPermission,
        },
      },
      lifeCycleFns: {
        onTxError(error) {
          // const errMsg = handleErrorMessage({ error });
          // setTxState(TxStates.Error);
          setLoading(false);
          errorToast({
            title: ProposalTxStates.Error,
            description: (error as Error).message,
          });
        },
        onTxSuccess() {
          // setTxState(TxStates.Success);
          setLoading(true);
          setTxSuccess(true);
          successToast({
            title: ProposalTxStates.Success,
            description: `A proposal for adding a Shaman Onboarder was successfully submitted.`,
          });
        },
      },
    });
  };

  return (
    <ActionContainer>
      <ParMd>Congratulations!</ParMd>
      <ParMd>You have deployed a new Onboarder Shaman at</ParMd>
      <AddressDisplay
        address={shamanAddress}
        truncate
        copy
        explorerNetworkId={chainId}
      />
      {txSuccess ? (
        <>
          <ParMd>🎉 Nice! 🎉</ParMd>
          <ParMd>Go to your DAO to review the submitted proposal</ParMd>
          <Link
            href={`https://admin.daohaus.fun/#/molochv3/${chainId}/${daoId.toLowerCase()}`}
            linkType="external"
          >
            Open DAO Admin
          </Link>
          <ParMd>Here's the link to Onboard new Members</ParMd>
          <Link
            href={`/#/${chainId}/${daoId.toLowerCase()}`}
            linkType="external"
          >
            Onboard App
          </Link>
        </>
      ) : (
        <>
          <ParMd>Now it's time to add it to your DAO</ParMd>
          <Button
            color='primary'
            disabled={loading}
            fullWidth
            size="md"
            // variant="outline"
            onClick={submitShamanProposal}
          >
            {loading ? 'Submitting Tx...': 'Submit Proposal'}
          </Button>
        </>
      )}
    </ActionContainer>
  );
};

export const InstallForm = () => {
  const location = useLocation();
  const { provider, chainId } = useDHConnect();
  // const [summonTxHash, setSummonTxHash] = useState<string>('0x84b246717fe948b01c6910b5cc64fcbc4e70a745293279671a731f6e0d3e745b');
  const [summonTxHash, setSummonTxHash] = useState<string>();
  const [summonEvent, setSummonEvent] = useState<ethers.utils.LogDescription>();
  const [daoId, setDaoId] = useState<string>();
  const [safeId, setSafeId] = useState<string>();

  const onSummonComplete = useCallback(() => {
    if (provider && summonTxHash) {
      const iface = new ethers.utils.Interface(APP_ABI.SHAMAN_SUMMONER);
      provider.getTransactionReceipt(summonTxHash).then((receipt) => {
        const log = receipt.logs?.find(log =>
          log.topics[0] === ethers.utils.id('SummonVCOnboarderShaman(address,address,address,string,bool,uint256,address,uint256)')
        );
        if (log) {
          const event = iface.parseLog(log);
          setDaoId(event.args.baal);
          const baal = new ethers.Contract(event.args.baal, APP_ABI.BAAL, provider);
          baal.functions.avatar().then((avatar: Array<string>) => {
            setSafeId(avatar[0]);
            setSummonEvent(event);
          });
        }
      });
    }
  }, [provider, setDaoId, setSafeId, setSummonEvent, summonTxHash]);

  // TODO: Remove once FormBuilder can omit subgraph polling
  useEffect(() => {
    onSummonComplete();
  }, [provider, summonTxHash]);

  const defaults = useMemo(() => {
    if (chainId) {
      const params = new URLSearchParams(location.search);
      const daochainParam = params.get('daochain');
      const daoAddressParam = params.get('daoAddress');
      return {
        daochain: daochainParam ? daochainParam as keyof Keychain : chainId,
        daoAddress: daoAddressParam,
      }
    }
  }, [chainId, location]);

  return (
    <MainContainer>
      <TXBuilder
        provider={provider}
        chainId={chainId}
        daoId={daoId}
        safeId={safeId}
        appState={{}}
        txLifeCycleFns={{
          onTxSuccess: (txHash) => {
            console.log('txHash', txHash);
            if (!safeId) setSummonTxHash(txHash);
          },
        }}
      >
        <FormBuilder
          customFields={CustomFields}
          form={FORM.SUMMON_SHAMAN}
          // defaultValues={{
          //   daoAddress: daoAddress,
          // }}
          defaultValues={defaults}
          onSuccess={onSummonComplete}
          targetNetwork={chainId || defaults?.daochain}
        />
        {summonEvent && chainId && (
          <Actions
            chainId={chainId || defaults?.daochain}
            daoId={summonEvent.args.baal}
            shamanAddress={summonEvent.args.onboarder}
          />
        )}
      </TXBuilder>
    </MainContainer>
  );
};
