# solana-token-metadata

Update your SPL token metadata on the Solana blockchain using Metaplex.

## Overview

This project allows you to update the metadata of your SPL token on the Solana blockchain. It validates the configuration, checks that your funding wallet has sufficient SOL (minimum 0.2 SOL), and automatically assigns your wallet as the creator of the token. The script features detailed logging with emojis for an enhanced user experience and robust error handling.

## Features

- **Validation:** Ensures valid token mint and wallet addresses.
- **Balance Check:** Verifies that your wallet has at least 0.2 SOL before proceeding.
- **Dynamic Creator Assignment:** Uses your wallet (loaded via the keypair) as the creator for the token.
- **Detailed Logging:** Console logs with emojis provide clear and engaging process updates.
- **Retry Logic:** Built-in transaction retry mechanism for improved reliability.

## Configuration

Before running the script, configure your settings by updating the following code snippet in your project:

```typescript
// 🌎 Global Configuration
const endpoint: string = "https://api.mainnet-beta.solana.com"; // Options: mainnet-beta, devnet, testnet
const tokenMint: string = ""; // Your SPL Token Address
const keypairPath: string = "keypair.json"; // Path to your wallet keypair file

// 🏷 Base Token Metadata
const baseMetadata: DataV2 = {
    name: "Stegra",
    symbol: "STEGRA",
    uri: "https://raw.githubusercontent.com/ignaciocorball/stegra/refs/heads/main/metadata.json",
    sellerFeeBasisPoints: 0,
    creators: [] as Creator[], // Creators will be set dynamically using the funding wallet's public key in main()
    collection: null,
    uses: null,
};
