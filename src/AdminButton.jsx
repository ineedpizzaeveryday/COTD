import React from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://backend-cotd.onrender.com';

export default function AdminButton() {
  const refreshBalances = async () => {
    try {
      const response = await axios.post(`${API_URL}/refresh-balances`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Dodaj jeśli wymagana autoryzacja
        },
      });
      alert('Saldo zostało pomyślnie odświeżone!');
      console.log('Zaktualizowane dane:', response.data.updated);
    } catch (error) {
      console.error('Błąd podczas odświeżania sald:', error);
      alert('Wystąpił problem podczas odświeżania sald.');
    }
  };

  const resetCoinOfDay = async () => {
    try {
      const response = await axios.post(`${API_URL}/reset-coin-of-day`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('Moneta dnia została zresetowana i zablokowana!');
      console.log('Odpowiedź serwera:', response.data);
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