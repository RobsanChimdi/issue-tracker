const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Robsan1234#',
  database: 'mydb',
});

connection.connect(err => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL!');
    connection.end();
  }
});
