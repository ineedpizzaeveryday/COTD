import React, { useState, useEffect } from 'react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import axios from 'axios';
import './Ranking.css';

export default function Ranking({ address, connection }) {
  const [ranking, setRanking] = useState([]);
  const [balance, setBalance] = useState(0);
  const [username, setUsername] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [sending, setSending] = useState(false);

  const coefBalance = 1.0;
  const coefShopping = 2.2;

  const fetchRanking = async () => {
    try {
      const response = await fetch('http://localhost:3001/ranking');
      if (!response.ok) {
        throw new Error('Błąd podczas pobierania rankingu');
      }
      const data = await response.json();

      const updatedData = data.map((entry) => ({
        ...entry,
        score: entry.balance * coefBalance + (entry.shopping || 0) * coefShopping,
      }));

      setRanking(updatedData);
    } catch (error) {
      console.error('Błąd podczas pobierania rankingu:', error);
    }
  };

  const addToRankingAsync = async () => {
    if (!address || balance <= 0 || !username.trim()) return;

    try {
      const response = await fetch('http://localhost:3001/ranking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, balance, username }),
      });

      if (!response.ok) {
        throw new Error('Błąd podczas dodawania użytkownika do rankingu');
      }

      fetchRanking();
      setUsername('');
    } catch (error) {
      console.error('Błąd podczas dodawania użytkownika do rankingu:', error);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  useEffect(() => {
    if (!address || !connection) return;

    const fetchBalance = async () => {
      try {
        const publicKey = new PublicKey(address);
        const balanceLamports = await connection.getBalance(publicKey);
        setBalance(balanceLamports / 1_000_000_000);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, [address, connection]);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setIsUsernameValid(value.trim().length > 0);
  };

  const sendSol = async (lamports) => {
    if (!address) {
      alert('Proszę połączyć portfel, aby wysłać SOL.');
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

      console.log('Transaction sent:', txid);
      alert('SOL wysłane pomyślnie!');

      await axios.post('http://localhost:3001/addTransaction', { signature: txid });
      fetchRanking();
    } catch (error) {
      console.error('Transaction error:', error.message || error);
      alert('Błąd podczas przetwarzania transakcji.');
    } finally {
      setSending(false);
    }
  };

  const updateShopping = async (lamports, points) => {
    if (!address) return;

    try {
      await sendSol(lamports);
      
      const response = await fetch('http://localhost:3001/shopping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, points }),
      });

      if (!response.ok) {
        throw new Error('Błąd podczas aktualizacji shopping');
      }

      fetchRanking();
    } catch (error) {
      console.error('Błąd podczas aktualizacji shopping:', error);
    }
  };

  return (
    <div className="ranking-container">
      <h2>Ranking</h2>
      <p className="instruction">
        Podaj nazwę username i potwierdź, aby dodać się do naszego rankingu.
      </p>
      <div className="input-container">
        <input
          id="username"
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Wprowadź nazwę użytkownika"
        />
        <button
          onClick={addToRankingAsync}
          disabled={!isUsernameValid || balance <= 0 || !address}
        >
          Submit
        </button>
      </div>
      <h3>Ranking użytkowników</h3>
      <div className="ranking-list">
        {ranking.sort((a, b) => b.score - a.score).slice(0, 30).map((entry, index) => (
          <div key={index} className="ranking-item">
            <span>{index + 1}</span>
            <span>{entry.username || 'Nieznana'}</span>
            <span>{`${entry.address.slice(0, 5)}...${entry.address.slice(-5)}`}</span>
            <span>{entry.balance.toFixed(2)} SOL</span>
            <span>{entry.shopping || 0} pkt</span>
            <span>{entry.score.toFixed(2)} pkt</span>
          </div>
        ))}
      </div>
      <div className="shopping-buttons">
        <button onClick={() => updateShopping(0.01 * 1_000_000_000, 1000)}>Buy Orange (0.01 SOL, +1000 pkt)</button>
        <button onClick={() => updateShopping(0.005 * 1_000_000_000, 250)}>Buy Lemon (0.005 SOL, +250 pkt)</button>
      </div>
    </div>
  );
}
