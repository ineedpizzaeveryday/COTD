import { useEffect, useState } from 'react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import axios from 'axios';

function Lottery({ connection, address }) {
  const [transactionCount, setTransactionCount] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchLotteryTransactionCount();
  }, []);

  // Pobieranie liczby transakcji loterii
  const fetchLotteryTransactionCount = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/lottery/count');
      setTransactionCount(response.data.count);
    } catch (error) {
      console.error('Błąd podczas pobierania liczby transakcji loterii:', error);
    }
  };



  const addLotteryTransaction = async (transactionSignature) => {
    try {
      const response = await axios.post('http://localhost:3001/api/lottery/add', {
        signature: transactionSignature,
      });
  
      const randomCode = response.data.code; // Odbierz wylosowany numer
      alert(`Dołączyłeś do Loterii! Twój numer to: ${randomCode}`);
      fetchLotteryTransactionCount(); // Odśwież liczbę transakcji
    } catch (error) {
      console.error('Błąd dodawania transakcji loterii:', error);
    }
  };
  
  const joinLottery = async (lamports) => {
    if (!address) {
      alert('Proszę połączyć portfel, aby wziąć udział w loterii.');
      return;
    }
  
    try {
      const senderPublicKey = new PublicKey(address);
      const recipientPublicKey = new PublicKey('HFtPNBwf85W84TYJpBLED2LnbZiE1vHGZuYC8bQWfxJn'); // Podaj adres portfela loterii
  
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
  
      // Opcjonalne potwierdzanie transakcji z limitem czasu
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Symulacja czasu na potwierdzenie
  
      await addLotteryTransaction(txid); // Dodanie transakcji i odbiór losowego numeru
    } catch (error) {
      console.error('Błąd transakcji:', error.message || error);
      alert('Wystąpił błąd podczas przetwarzania transakcji.');
    } finally {
      setSending(false);
    }
  };
  

  return (
    <div className="lottery-container">
      <h1>Loteria</h1>
      <p>Liczba kupionych losów: {transactionCount}</p>
      <button
        onClick={() => joinLottery(0.01 * 1_000_000_000)} // Wysyłanie 0.01 SOL na loterię
        disabled={sending}
      >
        {sending ? 'Wysyłanie...' : 'Dołącz za 0.01 SOL'}
      </button>
    </div>
  );
}

export default Lottery;
