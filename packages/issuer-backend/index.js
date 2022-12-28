const express = require("express");
const asyncHandler = require("express-async-handler");
const app = express();
const cors = require("cors");
const DIDKit = require("@spruceid/didkit-wasm-node");
const ethers = require("ethers");
const brightIdSdk = require("brightid_sdk");
const crypto = require("crypto");
const settings = require("./settings");
const base64 = require("@ethersproject/base64");

const PORT = process.env.PORT || 4200;

const JWK =
  '{"kty":"EC","crv":"secp256k1","x":"PdB2nS-knyAxc6KPuxBr65vRpW-duAXwpeXlwGJ03eU","y":"MwoGZ08hF5uv-_UEC9BKsYdJVSbJNHcFhR1BZWer5RQ","d":"z9VrSNNZXf9ywUx3v_8cLDhSw8-pvAT9qu_WZmqqfWM"}';
const didIssuer = DIDKit.keyToDID("ethr", JWK);

app.use(cors());
app.use(express.json());

// Control expiry times of issued credentials
const CHALLENGE_EXPIRES_AFTER_SECONDS = 60; // 1min
const CREDENTIAL_EXPIRES_AFTER_SECONDS = 90 * 86400; // 90days

// --- app name for Bright Id App
const CONTEXT = "Gitcoin";

// More on how Passport does BrightID verify & sponsor procedures
// https://github.com/gitcoinco/passport/blob/main/iam/src/procedures/brightid.ts
async function verifyBrightidContextId(contextId) {
  try {
    const verifyContextIdResult = await brightIdSdk.verifyContextId(
      CONTEXT,
      contextId
    );

    // Unique is true if the user obtained "Meets" verification by attending a connection party
    const isUnique = "unique" in verifyContextIdResult && verifyContextIdResult.unique === true;
    const isValid = "contextIds" in verifyContextIdResult && verifyContextIdResult.contextIds.length > 0;
    // const firstContextId = isValid ? formattedData.contextIds[0] : undefined;
    const firstContextId =
        "contextIds" in verifyContextIdResult &&
        verifyContextIdResult.contextIds &&
        verifyContextIdResult.contextIds.length > 0 &&
        verifyContextIdResult.contextIds[0];
    const valid = isValid && isUnique;

    return {
      valid,
      record: valid
        ? {
            context: "context" in verifyContextIdResult && verifyContextIdResult.context,
            contextId: firstContextId,
            meets: JSON.stringify(isUnique),
          }
        : undefined,
      result: verifyContextIdResult,
      error: verifyContextIdResult?.data?.errorMessage,
    };
  } catch (error) {
    return { valid: false, error };
  }
};

async function verifyCredential(preparedCredential, signedCredential) {
  // domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>, signature: SignatureLike
  // const preparedCredential = JSON.parse(prep);
  // const signedCredential = JSON.parse(signed);

  const standardizedTypes = preparedCredential.signingInput.types;
  delete standardizedTypes.EIP712Domain;

  const signerAddress = ethers.utils.verifyTypedData(
    preparedCredential.proof.eip712Domain.domain,
    standardizedTypes,
    signedCredential,
    signedCredential.proof.proofValue,
  );
  console.log('verifyTypedData', signerAddress);

  const signerIssuedCredential = signerAddress.toLowerCase() === signedCredential.issuer.split(":").pop();

  if (signerIssuedCredential) {
    console.log("===============");
    console.log("This credential was signed by the issuer!!!!  ", signerAddress);
    console.log("===============");


    const splitSignature = ethers.utils.splitSignature(signedCredential.proof.proofValue);
    return {
      signerAddress,
      splitSignature,
    };
  }
};

const addSeconds = (date, seconds) => {
  const result = new Date(date);
  result.setSeconds(result.getSeconds() + seconds);
  return result;
};

// Create an ordered array of the given input (of the form [[key:string, value:string], ...])
const objToSortedArray = (obj) => {
  const keys = Object.keys(obj).sort();
  return keys.reduce((out, key) => {
    out.push([key, obj[key]]);
    return out;
  }, []);
};

function validCredential(signerAddress) {
  return didIssuer === `did:ethr:${signerAddress.toLowerCase()}`
};

function generateCredentialInput(fields, expiryTTLSeconds) {
  return {
    type: ["VerifiableCredential"],
    issuer: didIssuer,
    "@context": "https://www.w3.org/2018/credentials/v1",
    issuanceDate: new Date().toISOString(),
    expirationDate: addSeconds(new Date(), expiryTTLSeconds).toISOString(),
    ...fields,
  };
};

app.get("/", (req, res) => {
  //   const { address } = req.params;
  //   const state = balances[address];
  res.send({ issuer: didIssuer });
});

app.post("/verifyContextId", asyncHandler(async (req, res) => {
  const { contextIdData } = req.body;
  const rs = await verifyBrightidContextId(contextIdData);
  // if (!rs.valid) {
  //   res.status(rs.result?.status || 400).send({ valid: false, message: rs.error });
  //   return;
  // }
  res.send({ ...rs });
}));

app.post("/challenge", asyncHandler(async (req, res) => {
  const { address, type } = req.body;
  const nonce = crypto.randomBytes(32).toString("hex");
  const credentialInput = generateCredentialInput({
    credentialSubject: {
      // "@context": [
      //   {
      //     provider: "https://schema.org/Text",
      //     challenge: "https://schema.org/Text",
      //     address: "https://schema.org/Text",
      //   },
      // ],
      id: `did:pkh:eip155:1:${address}`,
      provider: `challenge-${type}`,
      // extra fields to convey challenge data
      challenge:
        `I commit that this stamp is my unique and only ${type} verification for Passport.\n\nnonce: ${nonce}`,
      address: address,
    },
  }, CHALLENGE_EXPIRES_AFTER_SECONDS);
  const credential = await DIDKit.issueCredential(
    JSON.stringify(credentialInput, undefined, 2),
    JSON.stringify(settings.optionsChallenge, undefined, 2),
    JWK,
  );
  res.send({ credential: JSON.parse(credential) });
}));

app.post("/issue", asyncHandler(async (req, res) => {
  const { payload, challenge } = req.body;
  const { expirationDate, proof } = challenge;

  // check that the credential is still valid
  const verifyChallenge = async () => {
    if (new Date(expirationDate) > new Date()) {
      try {
        // parse the result of attempting to verify
        const verify = JSON.parse(
          await DIDKit.verifyCredential(
            JSON.stringify(challenge),
            JSON.stringify({ proofPurpose: proof.proofPurpose }),
          ),
        ); // as { checks: string[]; warnings: string[]; errors: string[] };

        // did we get any errors when we attempted to verify?
        return verify.errors.length === 0;
      } catch (e) {
        // if didkit throws, etc.
        return false;
      }
    } else {
      // past expiry :(
      return false;
    }
  }
  const validChallenge = await verifyChallenge();
  console.log('validChallenge', validChallenge);

  if (!validChallenge) {
    res.status(400).send({ valid: false, error: 'Failed to verify credential' });
    return;
  }

  if (validChallenge && didIssuer === challenge.issuer) {
    const address = ethers.utils.getAddress(
      ethers.utils.verifyMessage(challenge.credentialSubject.challenge, payload.proofs.signature)
    ).toLowerCase();
    console.log('Retrived address', address);
    // ensure the only address we save is that of the signer
    payload.address = address;
    payload.issuer = didIssuer;
    // the signer should be the address outlined in the challenge credential - rebuild the id to check for a full match
    const isSigner = challenge.credentialSubject.id === `did:pkh:eip155:1:${address}`;
    const isType = challenge.credentialSubject.provider === `challenge-${payload.type}`;
    // type is required because we need it to select the correct Identity Provider
    console.log('Verification', isSigner, isType);
    if (isSigner && isType && payload && payload.type) {
      try {
        const verifiedBrightIdContext = await verifyBrightidContextId(payload.proofs.did);
        if (!verifiedBrightIdContext.valid) {
          res.status(400).send({ valid: false, error: verifiedBrightIdContext.error });
          return;
        }
        // -------------------
        // construct a set of Proofs to issue a credential against (this record will be used to generate a sha256 hash of any associated PII)
        const record = {
          // type and address will always be known and can be obtained from the resultant credential
          type: verifiedBrightIdContext.record.pii ? `${type}#${verifiedBrightIdContext.record.pii}` : payload.type,
          // version is defined by entry point
          version: payload.version, // "0.0.0"
          // extend/overwrite with record returned from the provider
          ...(verifiedBrightIdContext?.record || {}),
        };

        try {
          // ------------- issueHashedCredential
          // generate a VC for the given payload
          // const { credential } = await issueHashedCredential(DIDKit, key, address, record);
          // -------------
          // Generate a hash like SHA256(IAM_PRIVATE_KEY+PII), where PII is the (deterministic) JSON representation
          // of the PII object after transforming it to an array of the form [[key:string, value:string], ...]
          // with the elements sorted by key
          const hash = base64.encode(
            crypto
              .createHash("sha256")
              .update(JWK, "utf-8")
              .update(JSON.stringify(objToSortedArray(record)))
              .digest()
          );
          console.log('Generated Hash', hash);

          const credentialInput = generateCredentialInput({
            credentialSubject: {
              id: payload.proofs.did, // e.g. "did:pkh:eip155:1:0x12FeD9f987bc340c6bE43fD80aD641E8cD740682"
              hash: `${payload.version}${hash}`,//: "v0.0.0:AjcRjxx7Hp3PKPSNwPeBJjR21pLyA14CVeQ1XijzxUc=",
              provider: payload.type,
            }
          }, CREDENTIAL_EXPIRES_AFTER_SECONDS);

          const preparedCredential = await DIDKit.prepareIssueCredential(
            JSON.stringify(credentialInput, undefined, 2),
            JSON.stringify(settings.options, undefined, 2),
            JWK,
          );
        
          console.log("PREPARE ISSUE CREDENTIAL");
          console.log("===============");
          console.log(preparedCredential);
          console.log("===============");
        
          const issuedCredential = await DIDKit.issueCredential(
            JSON.stringify(credentialInput, undefined, 2),
            JSON.stringify(settings.options, undefined, 2),
            JWK,
          );
        
          console.log("CREDENTIAL");
          console.log("===============");
          console.log(issuedCredential);
          console.log("!!!!!!=============== sending to verify");
          const {
            signerAddress,
            splitSignature,
          } = await verifyCredential(JSON.parse(preparedCredential), JSON.parse(issuedCredential));
        
          return res.send({
            valid: validCredential(signerAddress),
            splitSignature,
            issuedCredential: JSON.parse(issuedCredential),
            preparedCredential: JSON.parse(preparedCredential),
          });

        } catch (error) {
          console.error(error);
          res.status(400).send({ error: "Unable to produce a verifiable credential" });
        }
      } catch (error) {
        console.error(error);
        res.status(400).send({ error: "Unable to verify BrigthId credential" });
      }
    }
    res.status(400).send({ error: 'Invalid challenge signature' });
  }
}));

app.post("/verify", asyncHandler(async (req, res) => {
  console.log('VERIFY', typeof req.body, req.body);
  const { preparedCredential, issuedCredential } = req.body;
  const {
    signerAddress,
    // splitSignature,
  } = await verifyCredential(preparedCredential, issuedCredential);

  return res.send({
    valid: validCredential(signerAddress),
    // issuedCredential: JSON.parse(issuedCredential),
    // preparedCredential: JSON.parse(preparedCredential),
  });
}));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
