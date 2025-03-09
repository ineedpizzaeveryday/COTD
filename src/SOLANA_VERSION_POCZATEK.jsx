import { useState, useEffect } from 'react'
import './App.css'
import { createWeb3Modal, defaultSolanaConfig } from '@web3modal/solana/react'
import { solana, solanaDevnet } from '@web3modal/solana/chains'

// Your WalletConnect Cloud project ID
const projectId = 'b4227c5976d15ce39003d90b58a76ac6'

// Create metadata
const metadata = {
  name: 'rank',
  description: 'AppKit Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create solanaConfig
const chains = [solana, solanaDevnet]

const solanaConfig = defaultSolanaConfig({
  metadata,
  chains,
  projectId
})

createWeb3Modal({
  solanaConfig,
    chains,
    projectId
  })

  
function App() {
  const [count, setCount] = useState(0);

  // Initialize Web3Modal when the component mounts
  
  return (
    <>
      <div className="app-container">
        {/* Header */}
        <header className="header">
          <div className="logo">Logo</div>
          <nav className="nav">
            <w3m-button />
            <w3m-network-button />
          </nav>
        </header>

        {/* Main Content */}
        <main className="main">
          <div className="left-column">
            <h2>Coin of the day</h2>
            {/* Add your left column content here */}
          </div>
          <div className="right-column">
            <h2>Your Lucky Box</h2>
            {/* Add your right column content here */}
          </div>
        </main>

        {/* Footer */}
        <div className="game">
          <a href="#contact">Contact</a>
          <a href="#help">Help</a>
          <a href="#privacy">Privacy</a>
        </div>
      </div>
      <footer className="footer">
        <a href="#contact">Contact</a>
        <a href="#help">Help</a>
        <a href="#privacy">Privacy</a>
      </footer>
      <p>Work started 04.11.2024</p>
    </>
  )
}

export default App
