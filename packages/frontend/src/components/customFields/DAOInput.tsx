import { LOCAL_ABI } from '@daohaus/abis';
import {
  handleErrorMessage,
  isEthAddress,
  ReactSetter,
  toBaseUnits,
  toWholeUnits,
} from '@daohaus/utils';
import { CONTRACT_KEYCHAINS, isValidNetwork } from '@daohaus/keychain-utils';
import { useDHConnect } from '@daohaus/connect';
import { FieldSpacer } from '@daohaus/form-builder';
import { findDao, FindDaoQueryRes } from '@daohaus/moloch-v3-data';
import { createContract, useTxBuilder } from '@daohaus/tx-builder';
import {
  Buildable,
  Button,
  ErrorMessage,
  FieldAlert,
  SuccessMessage,
  useToast,
  WrappedInput,
} from '@daohaus/ui';

import { useEffect, useState } from 'react';
import { RegisterOptions, useFormContext, useWatch } from 'react-hook-form';
import { TX } from '../../legos/tx';

type TokenData = {
  allowance: string;
  balance: string;
  decimals: number;
  tokenName: string;
  tokenSymbol: string;
};

enum DAOFetchStates {
  Idle = '',
  Loading = 'Fetching DAO Data...',
  NotEthAddress = 'Not a valid Ethereum address',
  NotValidNetwork = 'Not a valid network',
  NotConnected = 'Connection Error',
  Error = 'DAO not Found!',
  Success = 'Success',
}
const fetchDAO = async ({
  daoAddress,
  chainId,
  // userAddress,
  shouldUpdate,
  setFetchState,
  setDaoData,
  // setNeedsApproval,
}: {
  daoAddress: string;
  chainId: string | null | undefined;
  shouldUpdate: boolean;
  // userAddress: string | undefined | null;
  setFetchState: ReactSetter<DAOFetchStates>;
  // setNeedsApproval: ReactSetter<boolean>;
  setDaoData: ReactSetter<undefined | FindDaoQueryRes>;
}) => {
  setFetchState(DAOFetchStates.Loading);

  if (!daoAddress) {
    return setFetchState(DAOFetchStates.Idle);
  }
  if (!isEthAddress(daoAddress))
    return setFetchState(DAOFetchStates.NotEthAddress);
  if (
    !isValidNetwork(chainId) // ||
    // !userAddress ||
    // !CONTRACT_KEYCHAINS.TRIBUTE_MINION[chainId]
  )
    return setFetchState(DAOFetchStates.NotValidNetwork);

  // const spenderAddress = CONTRACT_KEYCHAINS.TRIBUTE_MINION[chainId];
  // const contract = createContract({
  //   address: tokenAddress,
  //   chainId,
  //   abi: LOCAL_ABI.ERC20,
  // });

  try {
    const daoData = await findDao({
      networkId: chainId,
      dao: daoAddress
    })
    console.log('daoData', daoData);
    if (daoData.error) throw Error(daoData.error.message)
    if (!daoData.data?.dao) setFetchState(DAOFetchStates.Error);
    setDaoData(daoData.data);
    setFetchState(DAOFetchStates.Success);
  } catch (error) {
    console.error(error);
    setFetchState(DAOFetchStates.Error);
  }
};

export const DAOInput = (
  props: Buildable<{ addressId?: string }>
) => {
  const { addressId = 'daoAddress', id } = props;

  const { control, setValue } = useFormContext();
  const { address, chainId } = useDHConnect();
  const daoAddress = useWatch({
    // name: addressId,
    name: id,
    control,
  });
  const [fetchState, setFetchState] = useState(DAOFetchStates.Idle);
  // const [needsApproval, setNeedsApproval] = useState<boolean>(false);
  const [daoData, setDaoData] = useState<FindDaoQueryRes>();

  useEffect(() => {
    let shouldUpdate = true;
    fetchDAO({
      daoAddress,
      chainId,
      // userAddress: address,
      setFetchState,
      setDaoData,
      // setNeedsApproval,
      shouldUpdate,
    });
    return () => {
      shouldUpdate = false;
    };
  }, [daoAddress, chainId]);

  const daoName =
    daoData?.dao?.name && fetchState === DAOFetchStates.Success
      ? ({
          type: 'success',
          message: `DAO: ${daoData?.dao?.name}`,
        } as SuccessMessage)
      : undefined;

  const daoError =
    fetchState === DAOFetchStates.Error
      ? ({
          type: 'error',
          message: DAOFetchStates.Error,
        } as ErrorMessage)
      : undefined;

  // const tokenAmtRules: RegisterOptions = {
  //   required: true,
  //   setValueAs: (val) => {
  //     if (val === '') return '';
  //     return toBaseUnits(val);
  //   },
  //   ...props.rules,
  // };

  // const daoAddressRules: RegisterOptions = {
  //   required: true,
  //   ...props.rules,
  // };

  // const handleMax = () => {
  //   if (tokenData) {
  //     setValue(amtId, toWholeUnits(tokenData.balance, tokenData?.decimals));
  //   }
  // };

  // const maxButton = tokenData?.balance && tokenData?.decimals && (
  //   <Button color="secondary" size="sm" onClick={handleMax} type="button">
  //     Max: {toWholeUnits(tokenData?.balance, tokenData?.decimals)}
  //   </Button>
  // );

  return (
    <WrappedInput
      full
      label={props.label || 'DAO Address'}
      id={id}
      helperText={fetchState}
      success={daoName}
      error={daoError}
      rules={props.rules}
      placeholder='0x...'
    />
  );
};

// enum TxStates {
//   Idle = 'Idle',
//   Loading = 'Loading',
//   Error = 'Error',
//   Success = 'DAO Found!',
// }

// const TemporaryWarning = ({
//   tokenName,
//   tokenAddress,
//   setNeedsApproval,
// }: {
//   tokenName?: string;
//   tokenAddress?: string;
//   setNeedsApproval: ReactSetter<boolean>;
// }) => {
//   const { fireTransaction } = useTxBuilder();
//   const [txState, setTxState] = useState(TxStates.Idle);
//   const { errorToast, successToast } = useToast();

//   const handleApprove = async () => {
//     setTxState(TxStates.Loading);

//     await fireTransaction({
//       tx: TX.APPROVE_TOKEN,
//       callerState: {
//         tokenAddress,
//       },
//       lifeCycleFns: {
//         onTxError(error) {
//           const errMsg = handleErrorMessage({ error });
//           setTxState(TxStates.Error);
//           errorToast({ title: TxStates.Error, description: errMsg });
//         },
//         onTxSuccess() {
//           setNeedsApproval(false);
//           setTxState(TxStates.Success);
//           successToast({
//             title: TxStates.Success,
//             description: `DAOhaus is approved to spend ${tokenName} on your behalf.`,
//           });
//         },
//       },
//     });
//   };

//   return (
//     <FieldAlert
//       className="warning"
//       message={`You must approve ${tokenName || 'Token'} to submit`}
//     >
//       <Button size="sm" onClick={handleApprove}>
//         {txState === TxStates.Loading ? 'Loading...' : 'Approve'}
//       </Button>
//     </FieldAlert>
//   );
// };
