import { useEffect, useState } from 'react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import axios from 'axios';

function CoinOfTheDay({ connection, address }) {
  const [coinDetails, setCoinDetails] = useState(null); // Szczegóły monety
  const [isHidden, setIsHidden] = useState(true); // Domyślnie ukryte dane
  const [sending, setSending] = useState(false); // Flaga wysyłania transakcji
  const [transactionCount, setTransactionCount] = useState(0);

  // Funkcja pobierania danych monety
  const fetchCoinDetails = async () => {
    try {
      const response = await axios.get('http://localhost:3001/coinOfDay');
      setCoinDetails(response.data);
      setIsHidden(response.data.isHidden); // Ustawienie ukrycia na podstawie backendu
    } catch (error) {
      console.error('Błąd podczas pobierania danych monety dnia:', error);
    }
  };

  const fetchTransactionCount = async () => {
    try {
      const response = await axios.get('http://localhost:3001/transactionCount');
      setTransactionCount(response.data.count);
    } catch (error) {
      console.error('Błąd podczas pobierania liczby transakcji:', error);
    }
  };

  const addTransaction = async (transactionSignature) => {
    try {
      await axios.post('http://localhost:3001/addTransaction', { signature: transactionSignature });
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
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Odczekaj 2 sekundy przed kolejną próbą
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
    await confirmTransactionWithTimeout(connection, txid, 60000); // 60 sekund timeout

    alert('Sent 0.02 SOL!');
    console.log('Transaction ID:', txid);

    await addTransaction(txid); // Dodanie sygnatury do bazy danych

    const response = await axios.post('http://localhost:3001/update-coin-visibility', {
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

  

  // Obsługa błędów ładowania danych
  if (!coinDetails) {
    return <div>Ładowanie danych monety dnia...</div>;
  }

  return (
    <div className="coin-container">
       
       <p>Liczba transakcji: {transactionCount}</p>
      {/* Przycisk do odblokowania */}
      <button
        onClick={() => sendSol(0.02 * 1_000_000_000)} // Wysyłanie 0.02 SOL
        disabled={sending}
      >
        {sending ? 'Wysyłanie...' : 'Odblokuj szczegóły za 0.02 SOL'}
      </button>

      {/* Wyświetlanie szczegółów */}
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
