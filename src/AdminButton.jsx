import React from 'react';
import axios from 'axios';

export default function AdminButton() {
  const refreshBalances = async () => {
    try {
      const response = await fetch('https://backend-cotd.onrender.com/refresh-balances', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Błąd podczas odświeżania sald');
      }

      const data = await response.json();
      alert('Saldo zostało pomyślnie odświeżone!');
      console.log('Zaktualizowane dane:', data.updated);
    } catch (error) {
      console.error('Błąd podczas odświeżania sald:', error);
      alert('Wystąpił problem podczas odświeżania sald.');
    }
  };

  const resetCoinOfDay = async () => {
    try {
      const response = await axios.post('https://backend-cotd.onrender.com/reset-coin-of-day');
      if (response.status === 200) {
        alert('Moneta dnia została zresetowana i zablokowana!');
      } else {
        alert('Wystąpił problem podczas resetowania monety dnia.');
      }
    } catch (error) {
      console.error('Błąd podczas resetowania monety dnia:', error);
      alert('Wystąpił problem podczas resetowania monety dnia.');
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Panel Admina</h1>
      <button
        onClick={refreshBalances}
        style={{
          fontSize: '18px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginRight: '10px',
        }}
      >
        Odśwież salda
      </button>
      <button
        onClick={resetCoinOfDay}
        style={{
          fontSize: '18px',
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Zresetuj monetę dnia
      </button>
    </div>
  );
}
