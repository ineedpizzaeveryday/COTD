import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { createAppKit, useAppKitAccount } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { Buffer } from 'buffer';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import  CoinOfDay from './CoinfOfDay.jsx';
import Lottery from './Lottery.jsx';
import Ranking from './Ranking.jsx';
import Game01 from './Game01.jsx';
import MagicBox from './MagicBox.jsx';
import Presale from './Presale.jsx';
import Alpha from './Alpha.jsx';

window.Buffer = Buffer;

// Dynamiczny import komponentu AdminButton
const AdminButton = lazy(() => import('./AdminButton.jsx'));

// Konfiguracja AppKit
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

const metadata = {
  name: 'AppKit',
  description: 'AppKit Solana Example',
  url: 'https://example.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata: metadata,
  projectId: 'b4227c5976d15ce39003d90b58a76ac6',
  features: { analytics: true },
});

export default function App() {
  const { address, isConnected } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const [balance, setBalance] = useState(0);
  const [ranking, setRanking] = useState([]);
  const [sending, setSending] = useState(false);


 

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

  
 const Home = () => (
  <div className="app-container">
    <header className="header">
      <div className="logo">Logo</div>
      <nav className="nav">
        <appkit-button />
        <appkit-network-button />
      </nav>
    </header>

    <main className="main">
      <div className="banner">
        <img src="/path-to-your-banner-image.jpg" alt="Banner" />
      </div>

      <div className="content">
        <div className="left-column">
          <CoinOfDay address={address} connection={connection} />
          <Alpha />
        </div>

        <div className="right-column">
          <h2>Your Lucky Box</h2>
          <Game01 connection={connection} address={address} />
        </div>
      </div>
    </main>

    <div className="lottery" id="lottery-section">
      <Lottery address={address} connection={connection} />
      <Presale />
      <MagicBox address={address} connection={connection} />
      <Ranking address={address} connection={connection} />
    </div>

    <footer className="footer">
      <a href="#contact">Contact</a>
      <a href="#help">Help</a>
      <a href="#privacy">Privacy</a>
    </footer>
    <p>Work started 04.11.2024</p>
  </div>
);


  // Główna logika trasowania
  return (
 <Router>
      <Suspense fallback={<p>Ładowanie...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adminbutton" element={<AdminButton />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
