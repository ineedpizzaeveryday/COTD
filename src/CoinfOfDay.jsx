import { useEffect, useState } from 'react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import axios from 'axios';

function CoinOfTheDay({ connection, address }) {
  const [coinDetails, setCoinDetails] = useState(null);
  const [isHidden, setIsHidden] = useState(true);
  const [sending, setSending] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);

  // Ustaw API_URL z zmiennej środowiskowej
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Funkcja pobierania danych monety
  const fetchCoinDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/coinOfDay`);
      setCoinDetails(response.data);
      setIsHidden(response.data.isHidden);
    } catch (error) {
      console.error('Błąd podczas pobierania danych monety dnia:', error);
    }
  };

  const fetchTransactionCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactionCount`);
      setTransactionCount(response.data.count);
    } catch (error) {
      console.error('Błąd podczas pobierania liczby transakcji:', error);
    }
  };

  const addTransaction = async (transactionSignature) => {
    try {
      await axios.post(`${API_URL}/addTransaction`, { signature: transactionSignature });
      fetchTransactionCount();
    } catch (error) {
      console.error('Błąd dodawania transakcji:', error);
    }
  };

  useEffect(() => {
    fetchCoinDetails();
    fetchTransactionCount();
  }, []);

  // Funkcja potwierdzania transakcji z wydłużonym limitem czasowym
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
        console.error("Error checking transaction status:", error);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (!confirmed) {
      throw new Error("Transaction confirmation timed out.");
    }

    console.log("Transaction confirmed:", txid);
  };

  // Główna funkcja wysyłania SOL
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

      console.log('Transaction sent. Waiting for confirmation...', txid);
      await confirmTransactionWithTimeout(connection, txid, 60000);

      alert('Sent 0.02 SOL!');
      console.log('Transaction ID:', txid);

      await addTransaction(txid);

      const response = await axios.post(`${API_URL}/update-coin-visibility`, {
        isHidden: false,
      });

      if (response.status === 200) {
        console.log('Backend updated successfully:', response.data);
        setIsHidden(false);
      } else {
        console.error('Failed to update backend:', response.data);
        alert('Failed to update coin visibility.');
      }
    } catch (error) {
      console.error('Transaction error:', error.message || error);
      alert('An error occurred while processing the transaction. Check the logs for details.');
    } finally {
      setSending(false);
    }
  };

  if (!coinDetails) {
    return <div>Ładowanie danych monety dnia...</div>;
  }

  return (
    <div className="coin-container">
      <p>Liczba transakcji: {transactionCount}</p>
      <button
        onClick={() => sendSol(0.02 * 1_000_000_000)}
        disabled={sending}
      >
        {sending ? 'Wysyłanie...' : 'Odblokuj szczegóły za 0.02 SOL'}
      </button>
      <div>
        {isHidden ? (
          <h1>PAY TO SHOW IT</h1>
        ) : (
          <div>
            <h1>{coinDetails.coinName}</h1>
            <p>Ticker: {coinDetails.ticker}</p>
            <p>Blockchain: {coinDetails.blockchain}</p>
            <p>Max Supply: {coinDetails.maxSupply}</p>
            <p>Price: {coinDetails.price}</p>
            <a href={coinDetails.communityLink} target="_blank" rel="noopener noreferrer">
              Community Link
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoinOfTheDay;