import React, { useState } from 'react';
import { useRef } from 'react';
import './Game01.css';

import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const symbols = ['🍒', '🍋', '🍉', '🍇', '⭐', '🔔', '🍓', '🥝'];

const winProbability = 0.2; // 20% szans na wygraną

export default function Game01({ connection, address }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState([0, 0, 0]);
  const [winMessage, setWinMessage] = useState('');
  const [ticketBought, setTicketBought] = useState(false);
  const [sending, setSending] = useState(false);

  const randomSymbol = () => Math.floor(Math.random() * symbols.length);

  


  const calculateResult = () => {
    const isWin = Math.random() < winProbability;

    if (isWin) {
      const winningSymbol = randomSymbol();
      return [winningSymbol, winningSymbol, winningSymbol];
    } else {
      let result = [];
      while (result.length < 3) {
        const symbol = randomSymbol();
        if (!result.includes(symbol) || result.length === 2) {
          result.push(symbol);
        }
      }
      return result;
    }
  };

  const buyTicket = async () => {
    try {
      await sendSol(0.02 * 1_000_000_000); // Płacenie 0.02 SOL
      setTicketBought(true);
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    }
  };

  const spin = () => {
    if (spinning || !ticketBought) return;
  
    setSpinning(true);
    setTicketBought(false);
    setWinMessage('');
    setResult([-1, -1, -1]);
  
    const finalResult = calculateResult();
    const reelDurations = [2000, 2500, 3000];
  
    finalResult.forEach((symbolIndex, reelIndex) => {
      setTimeout(() => {
        if (reelIndex === finalResult.length - 1) {
          setSpinning(false);
          setResult(finalResult);
          checkWin(finalResult);
          rewardSol(); // Call rewardSol after every spin result
        }
      }, reelDurations[reelIndex]);
    });
  };
  
  

 const rewardSol = async () => {
  if (!address) {
    alert("Please connect your wallet.");
    return;
  }

  try {
    const response = await fetch('http://localhost:3001/api/lottery/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerAddress: address }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const text = await response.text(); // Odczytanie odpowiedzi jako tekst
    const data = text ? JSON.parse(text) : {}; // Parsowanie odpowiedzi tylko jeśli jest zawartość

    if (data.success) {
      alert(`Congratulations! You won 0.05 SOL! 🎉 TxID: ${data.txid}`);
    } else {
      alert('Payout failed. Please contact support.');
    }
  } catch (error) {
    console.error('Payout error:', error);
    alert('Error sending payout.');
  }
};
  

  const checkWin = (finalResult) => {
    if (finalResult.every((val) => val === finalResult[0])) {
      setWinMessage('🎉 You won! 🎉');
      rewardSol();
    } else {
      setWinMessage('Try again!');
    }
  };


  const sendSol = async (lamports) => {
    if (!address) {
      alert('Please connect your wallet to send SOL.');
      return;
    }

    try {
      const senderPublicKey = new PublicKey(address);
      const recipientPublicKey = new PublicKey('HFtPNBwf85W84TYJpBLED2LnbZiE1vHGZuYC8bQWfxJn');
      const { blockhash } = await connection.getLatestBlockhash();

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: recipientPublicKey,
        lamports,
      });

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: senderPublicKey,
      }).add(transferInstruction);

      setSending(true);

      const signedTransaction = await window.solana.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
      });

      console.log('Transaction sent. Waiting for confirmation...', txid);
      await confirmTransactionWithTimeout(connection, txid, 60000);

      alert('Sent 0.02 SOL!');
      console.log('Transaction ID:', txid);
    } catch (error) {
      console.error('Transaction error:', error.message || error);
      alert('An error occurred while processing the transaction.');
    } finally {
      setSending(false);
    }
  };

  const confirmTransactionWithTimeout = async (connection, txid, timeout = 60000) => {
    const start = Date.now();
    let confirmed = false;

    while (Date.now() - start < timeout) {
      try {
        const status = await connection.getSignatureStatus(txid, { searchTransactionHistory: true });
        if (status && status.value && status.value.confirmationStatus === 'confirmed') {
          confirmed = true;
          break;
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (!confirmed) {
      throw new Error('Transaction confirmation timed out.');
    }

    console.log('Transaction confirmed:', txid);
  };

  return (
    <div className="game01">
      <div className="reels-container">
        <div className="reels">
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <div key={index} className={`reel reel-${index}`}>
                <div className="symbols">
                  {Array(20)
                    .fill(null)
                    .map((_, symbolIndex) => (
                      <div
                        key={symbolIndex}
                        className={`symbol ${result[index] === symbolIndex % symbols.length ? 'highlighted' : ''}`}
                      >
                        {symbols[symbolIndex % symbols.length]}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="buttons-container">
        <button className={`buy-ticket-button ${spinning || sending ? 'loading' : ''}`} onClick={buyTicket} disabled={spinning || sending}>
          {spinning || sending ? 'Processing' : 'Buy Ticket'}
        </button>
        <button
          className={`spin-button ${ticketBought ? 'visible' : 'hidden'} ${spinning ? 'disabled' : ''}`}
          onClick={spin}
          disabled={spinning || !ticketBought}
        >
          {spinning ? 'Spinning...' : 'Spin'}
        </button>
      </div>
      {winMessage && <p className="win-message">{winMessage}</p>}
    </div>
  );
}
