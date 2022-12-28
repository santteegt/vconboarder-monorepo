import { CoreFieldLookup } from '@daohaus/form-builder';
import { FieldLegoBase, FormLegoBase } from '@daohaus/utils';
import { DAOInput } from '../components/customFields/DAOInput';

export const CustomFields = {
  ...CoreFieldLookup,
  daoInput: DAOInput,
};

export type CustomFieldLego = FieldLegoBase<typeof CustomFields>;
export type CustomFormLego = FormLegoBase<typeof CustomFields>;
