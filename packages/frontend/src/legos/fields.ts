// import { FieldLego } from '@daohaus/form-builder';
import { CustomFieldLego } from './config';

export const FIELD: Record<string, CustomFieldLego> = {
  TITLE: {
    id: 'title',
    type: 'input',
    label: 'Proposal Title',
    placeholder: 'Enter title',
  },
  DAO_SELECT: {
    id: 'daoAddress',
    type: 'daoInput',
    label: 'DAO Address',
  },
  DESCRIPTION: {
    id: 'description',
    type: 'textarea',
    label: 'Description',
    placeholder: 'Enter description',
  },
  LINK: {
    id: 'link',
    type: 'input',
    label: 'Link',
    placeholder: 'http://',
    expectType: 'url',
  },
  SHAMAN_NAME: {
    id: 'shamanName',
    type: 'input',
    label: 'Shaman Name',
    placeholder: 'Enter description',
  },
};
