import React, { useState } from 'react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import './Game01.css';

const symbols = ['🍒', '🍋', '🍉', '🍇', '⭐', '🔔', '🍓', '🥝'];
const winProbability = 0.2;

export default function Game01({ connection, address }) {
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState([
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 0],
  ]);
  const [winMessage, setWinMessage] = useState('');
  const [ticketBought, setTicketBought] = useState(false);
  const [sending, setSending] = useState(false);
  const [transactionMessage, setTransactionMessage] = useState('');

  const randomSymbol = () => Math.floor(Math.random() * symbols.length);

  const generateNewReels = () => {
    return [
      [randomSymbol(), randomSymbol(), randomSymbol()],
      [randomSymbol(), randomSymbol(), randomSymbol()],
      [randomSymbol(), randomSymbol(), randomSymbol()],
    ];
  };

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
  
    let frames = 0;
    const interval = setInterval(() => {
      setReels(generateNewReels()); // Animacja losowania
      frames++;
      if (frames > 20) {
        clearInterval(interval);
        const finalResult = [
          calculateResult(),
          calculateResult(),
          calculateResult(),
        ]; // Każdy bęben oblicza wynik
        setReels(finalResult);
        setSpinning(false);
        checkWin(finalResult.map(row => row[0])); // Sprawdzenie wyniku dla 3 środkowych symboli
      }
    }, 100);
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
  
      // Nowy sposób wyświetlania komunikatu
      setTransactionMessage('✅ You sent 0.02 SOL!');
      setTimeout(() => setTransactionMessage(''), 1000);
  
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
        {reels.map((reel, reelIndex) => (
          <div key={reelIndex} className="reel">
            {reel.map((symbolIndex, symbolPosition) => (
              <div key={symbolPosition} className={`symbol ${symbolPosition === 1 ? 'highlighted' : ''}`}>
                {symbols[symbolIndex]}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="buttons-container">
      <button className={`buy-ticket-button ${spinning || sending ? 'loading' : ''}`} onClick={buyTicket} disabled={spinning || sending}>
          {spinning || sending ? 'Processing' : 'Buy Ticket'}
        </button>
       <button
  className={`spin-button ${ticketBought ? 'active' : 'disabled'}`}
  onClick={spin}
  disabled={!ticketBought || spinning}
>
  {spinning ? 'Spinning...' : 'Spin'}
</button>
      </div>
      {transactionMessage && <div className="transaction-message">{transactionMessage}</div>}

      {winMessage && <p className="win-message">{winMessage}</p>}
    </div>
  );
}
