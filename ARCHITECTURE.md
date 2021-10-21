# Overview

The `DID server` provides a public `DID Registry` (via a REST API) that supports creating, updating and removing `DID documents` from the Verida network that meet the [DID Core v1.0 specification](https://www.w3.org/TR/did-core/).

This API acts as a discovery service, providing information on public keys and endpoints available for each `did`.

This API is currently centralized and managed by Verida. In due course, this REST API will be replaced with a decentralized solution when we feel there is an appropriately mature solution that doesn't compromise on usability, reliability and price. There are existing options such as [Ceramic Network](https://ceramic.network/) and [ION](https://github.com/decentralized-identity/ion) that may be suitable candidates in the future.

This API is a MVP and does not yet support features such as key rotation.

# User stories

This REST API needs to address the following user stories:

- As a `User` on the Verida network I can register a new `Verida account` (Save a signed `did:vda` entry)
- As a `Client` of the Verida network I can lookup and verify a `Verida account` exists
- As a `Verida account` I can register a new connection to an `Application context` (Save a signed `did:vdac` entry)
- As a `Client` of the Verida network I can discover the network endpoints to establish a connection with a `Verida Account` for a given `Application context` for a given purpose (database, data storage, messaging, notification)
- As a `Verida account` I can update my network endpoints for a given `Application context`
- As a `REST API` I can ensure only the controller of a DID can update their `DID document`
- As a `Smart Contract` I can verify data signed off-chain by a `Verida account`

# DID methods & Application contexts

This API supports two did methods:

- `did:vda`: A "master" DID that represents a `Verida account` on the Verida network. This DID controls multiple child `did:vdac` entries.
- `did:vdac`: A "child" DID that represents a connection between a `Verida account` on the Verida network and an `Application context`.

This architecture allows account holders to have a publicly discoverable `DID` they can share with anyone to initiate a connection (`did:vda`). While the `did:vapp` entry represents a siloed subset of data on the Verida network for a given account. This ensures websites / dApps can be granted access to a subset of data for a given end user, instead of unlocking all of their data.

For example:

- Jane has a Verida account (`did:vda:0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7`)
- Jane connects to the `Verida: Demo Chat` application on the Verida network. As she is connecting for the first time, the Verida Client SKD will generate an `application context` DID for Jane(`did:vdac:0xc2205G3A3b2A69De6Dbf7f01ED13B2108B2c43e1`)

# Private keys

The private key for a `did:vda` can deterministically generate the private key for the child `did:vdac`. It does this by hashing the `Application context` name and the `did:vda` address, then encrypting the result using the `did:vda` private key to generate an encrypted string. This encrypted string is then used as entropy to generate a new key pair for the `did:vdac` address.

# Security

- Each `DID document` is signed (secp256k1 ECDSA) by the owner
- The API verifies the `DID document` signature before writing any document changes to the `DID registry`

# Off-chain / On-chain data considerations

The Verida network is designed to support signed off-chain data being made available to on-chain smart contracts (in a verifiable way) across multiple chains. For this to work correctly, the smart contract needs to be able to verify the data has been signed by a trusted third party.

Blockchain's can't natively request data from a REST API (or necessarily access a future decentralized service) so it's essential a signature can be verified and return the DID address that signed the data without looking up public keys via an external DID registry.

`Verida account`'s are created using the Ethereum `ethers.js` library which utilizes the `ECDSA` signature scheme. This scheme enables the public address that signed the data to be recovered from the signature (via `ecrecover`). In this way, a signed piece of data can be provided on-chain and verified as being signed by a DID corresponding to a Verida DID, without needing to access the DID registry.

This has the added benefit of guaranteeing the signature scheme will be supported by all EVM based blockchains for maximum flexibility.