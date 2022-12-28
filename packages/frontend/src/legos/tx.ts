import { ethers } from 'ethers';
import { NestedArray, ValidArgType } from '@daohaus/utils';
import { buildMultiCallTX } from '@daohaus/tx-builder';
import { TXLego } from '@daohaus/utils';
import { CONTRACT } from './contract';
import { APP_CONTRACT_KEYCHAINS } from '../contracts';

const nestInArray = (arg: ValidArgType | ValidArgType[]): NestedArray => {
  return {
    type: 'nestedArray',
    args: Array.isArray(arg) ? arg : [arg],
  };
};

export enum ProposalTypeIds {
  Signal = 'SIGNAL',
  IssueSharesLoot = 'ISSUE',
  AddShaman = 'ADD_SHAMAN',
  TransferErc20 = 'TRANSFER_ERC20',
  TransferNetworkToken = 'TRANSFER_NETWORK_TOKEN',
  UpdateGovSettings = 'UPDATE_GOV_SETTINGS',
  UpdateTokenSettings = 'TOKEN_SETTINGS',
  TokensForShares = 'TOKENS_FOR_SHARES',
  GuildKick = 'GUILDKICK',
  WalletConnect = 'WALLETCONNECT',
}
/**
 * summonOnboarder(
        address _moloch,
        address _vcVerifier,
        string calldata _details,
        bool _shares,
        uint256 _amountPerCredential,
        address _tributeToken,
        uint256 _minTribute
 */
export const TX: Record<string, TXLego> = {
  SUMMON_ONBOARDER: {
    id: 'SUMMON_ONBOARDER',
    contract: CONTRACT.SHAMAN_SUMMONER,
    method: 'summonOnboarder',
    args: [
      '.formValues.daoAddress',
      { type: 'singleton', keychain: APP_CONTRACT_KEYCHAINS.DID_STAMP_VERIFIER },
      '.formValues.shamanName',
      '.formValues.shares',
      '.formValues.amountPerCredential',
      { type: 'static', value: ethers.constants.AddressZero }, // TODO: _tributeToken
      { type: 'static', value: '0' }, // TODO: _minTribute
    ],
  },
  /**
   * Document calldata _credential,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
   */
  ONBOARD: {
    id: 'ONBOARDER_SHAMAN',
    contract: CONTRACT.ONBOARDER_SHAMAN,
    method: 'onboarder',
    args: [
      '.formValues.credential',
      '.formValues.sig.v',
      '.formValues.sig.r',
      '.formValues.sig.s',
    ],
  },
  ONBOARD_ERC20: {
    id: 'ONBOARDER_SHAMAN_ERC20',
    contract: CONTRACT.ONBOARDER_SHAMAN,
    method: 'onboarder20',
    args: [
      '.formValues.credential',
      '.formValues.sig.v',
      '.formValues.sig.r',
      '.formValues.sig.s',
      '.formVlues.value',
    ],
  },
  ADD_SHAMAN: buildMultiCallTX({
    id: 'ADD_SHAMAN',
    JSONDetails: {
      type: 'JSONDetails',
      jsonSchema: {
        title: {
          type: 'static',
          value: 'Add VCOnboarder Shaman'
        },
        description: {
          type: 'static',
          value: 'VCOnboarder Shaman helps onboard DAO members using a Sibling-resistant layer.'
        },
        // contentURI: `.formValues.link`,
        // contentURIType: { type: 'static', value: 'url' },
        proposalType: { type: 'static', value: ProposalTypeIds.AddShaman },
      },
    },
    baalAddress: '.proposal.daoId',
    actions: [
      {
        contract: CONTRACT.CURRENT_DAO,
        method: 'setShamans',
        args: [
          nestInArray('.proposal.shamanAddress'),
          nestInArray('.proposal.shamanPermission'),
        ],
      },
    ],
  }),
};
