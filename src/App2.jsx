import React, { useState } from 'react';
import { createAppKit, useAppKitAccount } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Connection, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useAppKitProvider } from '@reown/appkit/react';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Buffer } from 'buffer';  // Add polyfill for Buffer

window.Buffer = Buffer;  // Set Buffer as a global object

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// 0. Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

// 1. Get projectId from https://cloud.reown.com
const projectId = 'b4227c5976d15ce39003d90b58a76ac6';

// 2. Create a metadata object - optional
const metadata = {
  name: 'AppKit',
  description: 'AppKit Solana Example',
  url: 'https://example.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

// 3. Create modal
createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata: metadata,
  projectId,
  features: { analytics: true },
});

export default function App() {
  const { address, isConnected } = useAppKitAccount();
    const [walletAddress, setWalletAddress] = useState(null);
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider();
   const [sending, setSending] = useState(false);

  const isValidSolanaAddress = (address) => {
    try {
      new PublicKey(address); // If valid, no error will be thrown
      return true;
    } catch (error) {
      return false;
    }
  };



  const sendSol = async () => {
     if (!address) {
       alert("Please connect your wallet to send SOL.");
       return;
     }
 
     if (!isValidSolanaAddress(address)) {
       alert("Invalid wallet address.");
       return;
     }
 
     const senderPublicKey = new PublicKey(address);
     const recipientPublicKey = new PublicKey('HFtPNBwf85W84TYJpBLED2LnbZiE1vHGZuYC8bQWfxJn'); // Example recipient address
 
     try {
       // Get the latest blockhash
       const { blockhash } = await connection.getLatestBlockhash();
 
       // Create transfer instruction
       const transferInstruction = SystemProgram.transfer({
         fromPubkey: senderPublicKey,
         toPubkey: recipientPublicKey,
         lamports: 20000000, // 0.02 SOL (1 SOL = 1,000,000,000 lamports)
       });
 
       // Create the transaction
       const transaction = new Transaction({
         recentBlockhash: blockhash,
         feePayer: senderPublicKey,
       }).add(transferInstruction);
 
       setSending(true);
 
       // Sign the transaction
       const signedTransaction = await window.solana.signTransaction(transaction);
 
       // Send the transaction
       const txid = await connection.sendRawTransaction(signedTransaction.serialize());
 
       // Confirm the transaction
       await connection.confirmTransaction(txid);
 
       alert("Sent 0.02 SOL!");
       console.log("Transaction ID:", txid);
     } catch (error) {
       console.error("Transaction sending error:", error);
     } finally {
       setSending(false);
     }
   };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Aplikacja Solana</h1>
      <appkit-button />
      {isConnected && <p>Połączony adres: {address}</p>}  
      <button onClick={sendSol} disabled={sending}>
            {sending ? 'Sending...' : 'Send 0.02 SOL'}
          </button>  
      
    </div>
  );
}
