import React, { useState } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Buffer } from 'buffer';  // Add polyfill for Buffer

window.Buffer = Buffer;  // Set Buffer as a global object

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sending, setSending] = useState(false);

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        setIsConnected(true);
        console.log("Wallet address: ", response.publicKey.toString());
      } catch (err) {
        console.error("Failed to connect to wallet:", err);
      }
    } else {
      alert("Please install Phantom wallet");
    }
  };

  const isValidSolanaAddress = (address) => {
    try {
      new PublicKey(address); // If valid, no error will be thrown
      return true;
    } catch (error) {
      return false;
    }
  };

  const sendSol = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet to send SOL.");
      return;
    }

    if (!isValidSolanaAddress(walletAddress)) {
      alert("Invalid wallet address.");
      return;
    }

    const senderPublicKey = new PublicKey(walletAddress);
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
    <div>
      <h1>Solana Phantom Wallet App</h1>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect</button>
      ) : (
        <div>
          <p>Wallet connected: {walletAddress}</p>
          <button onClick={sendSol} disabled={sending}>
            {sending ? 'Sending...' : 'Send 0.02 SOL'}
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
