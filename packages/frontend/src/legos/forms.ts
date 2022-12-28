// import { FormLego } from '@daohaus/form-builder';
import { CustomFormLego } from './config';
import { FIELD } from './fields';
import { TX } from './tx';

export const FORM: Record<string, CustomFormLego> = {
  SUMMON_SHAMAN: {
    id: 'SUMMON_SHAMAN',
    title: 'Summon Onboarder',
    subtitle: 'Deploy & Install Onboarder Shaman',
    description: 'Shaman will allow you to enable a sibling onboarder for new members.',
    requiredFields: {
      daoAddress: true,
      shamanName: true,
      amountPerCredential: true,
    },
    log: true,
    devtool: true,
    tx: TX.SUMMON_ONBOARDER,
    fields: [
      {
        ...FIELD.DAO_SELECT,
        label: 'Target DAO',
      },
      FIELD.SHAMAN_NAME,
      {
        id: 'parameters',
        type: 'formSegment',
        title: 'Onboarder Settings',
        description: 'Specify the Onboarder Shaman Parameters.',
        fields: [
          {
            id: 'shamanParams',
            type: 'splitColumn',
            rows: [
              {
                rowId: 'sharesParams',
                left: {
                  id: 'shares',
                  type: 'switch',
                  label: 'DAO Token to Distribute?',
                  info: 'Distribute DAO Shares or Loot Tokens',
                  switches: [
                    {
                      id: 'shares',
                      fieldLabel: {
                        off: 'Loot',
                        on: 'Shares',
                      },
                    },
                  ],
                },
                right: {
                  id: 'amountPerCredential',
                  type: 'toWeiInput',
                  expectType: 'number',
                  label: 'Amount per Credential',
                  placeholder: '1',
                  info: 'Amount of DAO tokens to transfer per verified credential',
                },
              },
            ],
          },
        ],
      },
    ],
  },
};
