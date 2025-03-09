import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

export default function Lottery({ connection, address, isConnected }) {
  const [sending, setSending] = useState(false);

 

  const sendSol = async (amount) => {
    try {
      const senderPublicKey = new PublicKey(address);
      const recipientPublicKey = new PublicKey('HFtPNBwf85W84TYJpBLED2LnbZiE1vHGZuYC8bQWfxJn'); // Replace with actual recipient

      const { blockhash } = await connection.getLatestBlockhash();
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: senderPublicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports: amount,
        })
      );

      const signedTransaction = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
      });

      console.log('Transaction sent:', signature);

      const timeout = 60000;
      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        const status = await connection.getSignatureStatus(signature);
        if (status.value && status.value.confirmationStatus === 'confirmed') {
          console.log('Transaction confirmed:', signature);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      throw new Error('Transaction confirmation timed out.');
    } catch (error) {
      console.error('Error while sending SOL:', error.message);
    }
  };

  const handlePurchase = async () => {
    setSending(true);
    try {
      await sendSol(100_000_000); // 0.1 SOL in lamports
      console.log('Transaction successful!');
    } catch (error) {
      console.error('Error purchasing lottery ticket:', error.message);
    } finally {
      setSending(false);
    }
  };

  return (
      <div className="MagicBox">
        <p>MagicBox</p>
        <button onClick={() => sendSol(100_000_000)} disabled={sending}>
          {sending ? 'Purchasing...' : 'Kup 100$'}
        </button>
        <p>Previous winner transaction: <a href="https://solanascan.io" target="_blank" rel="noopener noreferrer">solanascan.io</a></p>
      </div>    
  );
}
