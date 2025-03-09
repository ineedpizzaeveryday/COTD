const sqlite3 = require('sqlite3').verbose();

// Połączenie z bazą danych (plik zostanie utworzony, jeśli nie istnieje)
const db = new sqlite3.Database('./ranking.db', (err) => {
  if (err) {
    console.error('Błąd podczas otwierania bazy danych:', err);
  } else {
    console.log('Połączono z bazą danych SQLite.');
  }
});

// Tworzenie tabeli ranking
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS ranking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT UNIQUE NOT NULL,
      balance INTEGER NOT NULL
    );
  `, (err) => {
    if (err) {
      console.error('Błąd podczas tworzenia tabeli:', err);
    } else {
      console.log('Tabela ranking utworzona (lub już istnieje).');
    }
  });
});

module.exports = db;

const addUserToRanking = (address, balance) => {
    db.run(
      `INSERT INTO ranking (address, balance) VALUES (?, ?)
       ON CONFLICT(address) DO UPDATE SET balance = excluded.balance;`,
      [address, balance],
      (err) => {
        if (err) {
          console.error('Błąd podczas dodawania użytkownika:', err);
        } else {
          console.log(`Dodano/Zaaktualizowano użytkownika: ${address}`);
        }
      }
    );
  };
  
  // Przykład użycia
  addUserToRanking('Address1', 500);

  const getRanking = () => {
    db.all('SELECT * FROM ranking ORDER BY balance DESC;', [], (err, rows) => {
      if (err) {
        console.error('Błąd podczas odczytu rankingu:', err);
      } else {
        console.log('Ranking:', rows);
      }
    });
  };
  
  // Przykład użycia
  getRanking();
  

