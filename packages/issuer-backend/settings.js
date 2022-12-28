module.exports = {
  options: {
    type: "EthereumEip712Signature2021",
    eip712Domain: {
      domain: {
        name: "Passport",
      },
      types: {
        Document: [
          {
            type: "string",
            name: "@context",
          },
          {
            type: "CredentialSubject",
            name: "credentialSubject",
          },
          {
            type: "string",
            name: "expirationDate",
          },
          {
            type: "string",
            name: "issuanceDate",
          },
          {
            type: "string",
            name: "issuer",
          },
          {
            type: "Proof",
            name: "proof",
          },
          {
            type: "string[]",
            name: "type",
          },
        ],
        Proof: [
          {
            type: "string",
            name: "@context",
          },
          {
            type: "string",
            name: "created",
          },
          {
            type: "string",
            name: "proofPurpose",
          },
          {
            type: "string",
            name: "type",
          },
          {
            type: "string",
            name: "verificationMethod",
          },
        ],
        CredentialSubject: [
          {
            type: "string",
            name: "hash",
          },
          {
            type: "string",
            name: "id",
          },
          {
            type: "string",
            name: "provider",
          },
        ],
      },
      primaryType: "Document",
    },
  },
  optionsChallenge: {
    type: "EthereumEip712Signature2021",
    eip712Domain: {
      domain: {
        name: "Passport",
      },
      types: {
        Document: [
          {
            type: "string",
            name: "@context",
          },
          {
            type: "CredentialSubject",
            name: "credentialSubject",
          },
          {
            type: "string",
            name: "expirationDate",
          },
          {
            type: "string",
            name: "issuanceDate",
          },
          {
            type: "string",
            name: "issuer",
          },
          {
            type: "Proof",
            name: "proof",
          },
          {
            type: "string[]",
            name: "type",
          },
        ],
        Proof: [
          {
            type: "string",
            name: "@context",
          },
          {
            type: "string",
            name: "created",
          },
          {
            type: "string",
            name: "proofPurpose",
          },
          {
            type: "string",
            name: "type",
          },
          {
            type: "string",
            name: "verificationMethod",
          },
        ],
        CredentialSubject: [
          {
            type: "string",
            name: "hash",
          },
          {
            type: "string",
            name: "id",
          },
          {
            type: "string",
            name: "provider",
          },
          // {
          //   type: "string",
          //   name: "@context",
          // },
          {
            type: "string",
            name: "address",
          },
          {
            type: "string",
            name: "challenge",
          },
        ],
      },
      primaryType: "Document",
    },
  },
};
