/*
    * Author:        Ignacio Corball
    * Description:   Update SPL Token Metadata V3 with Metaplex on Solana Blockchain
    * Timezone:      (America/Santiago GMT-3)
    * Creation date: 20/02/2025 19:36:00 PM
    * Last Update:   21/02/2025 04:37:00 AM
    * Metaplex Fee:  0.015125 SOL
    * Solana Fee:    0.000005 SOL
*/

import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';
import * as fs from 'fs';
import { Creator, DataV2 } from "@metaplex-foundation/mpl-token-metadata";

// 🌎 Global Configuration
const endpoint: string = "https://api.mainnet-beta.solana.com"; // mainnet-beta - devnet - testnet
const tokenMint: string = ""; // Your SPL Token Address
const keypairPath: string = "keypair.json"; // Path to your wallet keypair file

// 🏷 Base Token Metadata
const baseMetadata: DataV2 = {
    name: "SPL Token Name",
    symbol: "SPLTOKEN",
    uri: "https://raw.githubusercontent.com/ignaciocorball/stegra/refs/heads/main/metadata.json",
    sellerFeeBasisPoints: 0,
    creators: [] as Creator[],
    collection: null,
    uses: null,
};

/**
 * 📂 Load wallet keypair from a file
 */
function loadWalletKey(keypairFile: string): web3.Keypair {
    try {
        const loaded = web3.Keypair.fromSecretKey(
            new Uint8Array(JSON.parse(fs.readFileSync(keypairFile, "utf-8")))
        );
        console.log("🔑 Wallet keypair loaded successfully.");
        return loaded;
    } catch (error) {
        throw new Error("❌ Failed to load wallet keypair. Check if the file exists and is formatted correctly.");
    }
}

/**
 * Validates that a provided string is a valid Solana public key.
 */
function validatePublicKey(address: string, fieldName: string): web3.PublicKey {
    try {
        return new web3.PublicKey(address);
    } catch (error) {
        throw new Error(`❌ Invalid ${fieldName} address: ${address}`);
    }
}

/**
 * 📡 Send transaction with retries in case of failure
 */
async function sendTransactionWithRetry(
    connection: web3.Connection,
    transaction: web3.Transaction,
    signer: web3.Keypair
): Promise<string> {
    let retries = 3;
    let lastError: any = null;

    while (retries > 0) {
        try {
            console.log(`🚀 Sending transaction... (Attempts left: ${retries})`);
            const txid = await web3.sendAndConfirmTransaction(
                connection,
                transaction,
                [signer],
                { commitment: "confirmed" }
            );
            console.log("✅ Transaction successful!");
            return txid;
        } catch (error) {
            lastError = error;
            console.log("⚠️ Transaction failed. Retrying...");
            retries--;
        }
    }

    throw new Error("❌ Transaction failed after multiple attempts: " + lastError);
}

/**
 * 🏁 Main function to update metadata
 */
async function main() {
    console.log("\n✨ Starting SPL Token Metadata Update Process...");

    // 🛠 Validate required configurations before proceeding
    if (!keypairPath) {
        console.log("❌ Keypair file path is missing.");
        process.exit(1);
    }

    if (!tokenMint) {
        console.log("❌ Token mint address is missing.");
        process.exit(1);
    }

    if (!baseMetadata.name || !baseMetadata.symbol || !baseMetadata.uri) {
        console.log("❌ Incomplete metadata details.");
        process.exit(1);
    }

    // Validate token mint
    const mint = validatePublicKey(tokenMint, "tokenMint");
    console.log(`📌 Token Mint Address: ${mint.toBase58()}`);

    // Connect Solana Network
    console.log(`📡 Connecting to Solana cluster: ${endpoint}`);
    const connection = new web3.Connection(endpoint, "confirmed");

    // Load wallet from keypair
    const myKeypair = loadWalletKey(keypairPath);
    console.log(`👤 Wallet Public Key: ${myKeypair.publicKey.toBase58()}`);

    // Validate wallet have at least 0.02 SOL
    const balanceLamports = await connection.getBalance(myKeypair.publicKey);
    const balanceSOL = balanceLamports / web3.LAMPORTS_PER_SOL;
    console.log(`💰 Wallet balance: ${balanceSOL.toFixed(4)} SOL`);
    if (balanceSOL < 0.02) {
        console.log("❌ Insufficient funds. A minimum of 0.02 SOL is required to perform the update.");
        process.exit(1);
    }

    // Assign the wallet as creator in the metadata
    baseMetadata.creators = [{
        address: myKeypair.publicKey,
        verified: true,
        share: 100,
    }];

    console.log("🔍 Validations passed. Proceeding with metadata update...");

    // 🏗 Derive metadata PDA
    console.log("🔑 Deriving Metadata PDA...");
    const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from(anchor.utils.bytes.utf8.encode("metadata")),
            mpl.PROGRAM_ID.toBytes(),
            mint.toBytes()
        ],
        mpl.PROGRAM_ID
    );
    console.log(`📜 Metadata PDA: ${metadataPDA.toBase58()}`);

    // 📝 Prepare transaction
    const accounts = {
        metadata: metadataPDA,
        mint,
        mintAuthority: myKeypair.publicKey,
        payer: myKeypair.publicKey,
        updateAuthority: myKeypair.publicKey,
    };
    console.log("📑 Transaction Accounts:");
    console.log(accounts);

    const args: mpl.CreateMetadataAccountV3InstructionArgs = {
        createMetadataAccountArgsV3: { 
            data: baseMetadata, 
            isMutable: true, 
            collectionDetails: null 
        }
    };

    const transactionInstruction: web3.TransactionInstruction = mpl.createCreateMetadataAccountV3Instruction(accounts, args);
    const tx: web3.Transaction = new web3.Transaction();
    tx.add(transactionInstruction);

    console.log("⏳ Broadcasting transaction. Please wait...");

    try {
        const transactionSignature = await sendTransactionWithRetry(connection, tx, myKeypair);
        console.log(`🎉 Metadata updated successfully!`);
        console.log(`🔗 View transaction: https://solana.fm/tx/${transactionSignature}?cluster=mainnet-alpha`);
        console.log("⏳ Note: It may take up to 24 hours for metadata to appear on explorers.");
    } catch (error) {
        console.error("❌ Transaction failed:", error);
    }
}

main();