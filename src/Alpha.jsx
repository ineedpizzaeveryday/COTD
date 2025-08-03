import React from 'react';
import './Alpha.css'; // Optional: CSS file for styling
import telegramIcon from './favicon.ico'; // Path to Telegram favicon

const Alpha = () => {
  const scrollToLottery = () => {
    const lotteryElement = document.getElementById('lottery-section');
    if (lotteryElement) {
      lotteryElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="alpha-container">
      <div className="alpha-header">
        <img src={telegramIcon} alt="Telegram Icon" className="telegram-icon" />
        <h2>Alpha Group - Join It</h2>
      </div>
      <p className="alpha-description">
        To join the group, you must follow these instructions:
      </p>
      <ol className="alpha-instructions">
        <li>
          <button onClick={scrollToLottery} className="scroll-link">
            Buy a lottery box.
          </button>
        </li>
        <li>Type the code from the lottery into the bot on Telegram.</li>
        <li>Answer 2 simple questions.</li>
      </ol>
    </div>
  );
};

export default Alpha;