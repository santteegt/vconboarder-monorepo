import { useParams } from 'react-router-dom';
import { useDHConnect } from '@daohaus/connect';
import { MolochV3DaoProvider } from '@daohaus/moloch-v3-context';
import React from 'react';

const graphApiKeys = { '0x1': process.env['NX_GRAPH_API_KEY_MAINNET'] };

export const DaoContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { daochain, daoid } = useParams();
  const { address } = useDHConnect();

//   console.log('DaoContext', daochain, daoid);

  return (
    <MolochV3DaoProvider
      address={address}
      daoid={daoid}
      daochain={daochain}
      graphApiKeys={graphApiKeys}
    >
      {children}
    </MolochV3DaoProvider>
  );
}

export default DaoContext;
