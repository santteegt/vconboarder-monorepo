/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../common";

export type CredentialSubjectStruct = {
  _hash: PromiseOrValue<string>;
  id: PromiseOrValue<string>;
  provider: PromiseOrValue<string>;
};

export type CredentialSubjectStructOutput = [string, string, string] & {
  _hash: string;
  id: string;
  provider: string;
};

export type ProofStruct = {
  _context: PromiseOrValue<string>;
  created: PromiseOrValue<string>;
  proofPurpose: PromiseOrValue<string>;
  _type: PromiseOrValue<string>;
  verificationMethod: PromiseOrValue<string>;
};

export type ProofStructOutput = [string, string, string, string, string] & {
  _context: string;
  created: string;
  proofPurpose: string;
  _type: string;
  verificationMethod: string;
};

export type DocumentStruct = {
  _context: PromiseOrValue<string>;
  credentialSubject: CredentialSubjectStruct;
  expirationDate: PromiseOrValue<string>;
  issuanceDate: PromiseOrValue<string>;
  issuer: PromiseOrValue<string>;
  proof: ProofStruct;
  _type: PromiseOrValue<string>[];
};

export type DocumentStructOutput = [
  string,
  CredentialSubjectStructOutput,
  string,
  string,
  string,
  ProofStructOutput,
  string[]
] & {
  _context: string;
  credentialSubject: CredentialSubjectStructOutput;
  expirationDate: string;
  issuanceDate: string;
  issuer: string;
  proof: ProofStructOutput;
  _type: string[];
};

export interface IDIDStampVcVerifierInterface extends utils.Interface {
  functions: {
    "pseudoResolve(string)": FunctionFragment;
    "verifyStampVc((string,(string,string,string),string,string,string,(string,string,string,string,string),string[]),uint8,bytes32,bytes32)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "pseudoResolve" | "verifyStampVc"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "pseudoResolve",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "verifyStampVc",
    values: [
      DocumentStruct,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "pseudoResolve",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "verifyStampVc",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IDIDStampVcVerifier extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IDIDStampVcVerifierInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    pseudoResolve(
      verifier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    verifyStampVc(
      document: DocumentStruct,
      v: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  pseudoResolve(
    verifier: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  verifyStampVc(
    document: DocumentStruct,
    v: PromiseOrValue<BigNumberish>,
    r: PromiseOrValue<BytesLike>,
    s: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    pseudoResolve(
      verifier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    verifyStampVc(
      document: DocumentStruct,
      v: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {};

  estimateGas: {
    pseudoResolve(
      verifier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    verifyStampVc(
      document: DocumentStruct,
      v: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    pseudoResolve(
      verifier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    verifyStampVc(
      document: DocumentStruct,
      v: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
