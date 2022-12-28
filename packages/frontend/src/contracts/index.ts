import { LOCAL_ABI } from '@daohaus/abis';
import { Keychain } from '@daohaus/keychain-utils/src/types';

import DID_STAMP_VERIFIER from './DIDStampVCVerifier.json';
import ONBOARDER_SHAMAN from './VCOnboarderShaman.json';
import SHAMAN_SUMMONER from './VCOnboarderShamanSummoner.json';

export const APP_ABI = {
  DID_STAMP_VERIFIER,
  ONBOARDER_SHAMAN,
  SHAMAN_SUMMONER,
  BAAL: LOCAL_ABI.BAAL,
};

export const APP_CONTRACT_KEYCHAINS: Record<string, Keychain> = {
  DID_STAMP_VERIFIER: {
    '0x5': '0x734812ecbF27cd8eb52ED089af37513eee593847',
  },
  // ONBOARDER_SHAMAN: {
  //   '0x5': '0x3B6ea43a930BAB13440A0AC3D23Ead06c9D84226',
  // },
  SHAMAN_SUMMONER: {
    '0x5': '0xd6A54B8Ad07EF14B91fc85940C7A284A589BbBcd',
  }
};
