# solana-token-metadata

Update your SPL token metadata on the Solana blockchain using Metaplex.

## Overview

This project allows you to update the metadata of your SPL token on the Solana blockchain. It validates the configuration, checks that your funding wallet has sufficient SOL (minimum 0.2 SOL), and automatically assigns your wallet as the creator of the token. The script features detailed logging with emojis for an enhanced user experience and robust error handling.

If you find this project useful, please consider giving it a ⭐ star and forking the repository. Your support really helps me continue to improve and maintain this project!

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
```
## Installation

1. Clone the repository:
```cli
   git clone https://github.com/ignaciocorball/solana-token-metadata.git
   cd solana-token-metadata
```
2. Install dependencies:
```cli
   npm install
```
## Running the Application

Start the application by executing:
```cli
   npm run start
```
The script will:
- Load your wallet keypair.
- Validate the provided configurations and addresses.
- Check your wallet's SOL balance.
- Broadcast a transaction to update the token metadata on the Solana blockchain.
- Display detailed logs and transaction status.

## Contributing

Contributions are welcome! If you have any ideas or improvements, please fork the repository, create a branch with your changes, and submit a pull request.

## License

This project is licensed under the MIT License.

---

Happy coding! 🚀
