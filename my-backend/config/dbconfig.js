const sql = require('mssql');

const config = {
  user: 'sa',
  password: '@YooJeongyeon12',
  server: 'DESKTOP-G21IMQ6', // e.g., 'localhost'
  database: 'SA',
  options: {
    encrypt: true, // true for Azure SQL, false for local SQL Server
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => console.error('SQL Server connection error:', err));

module.exports = {
  sql,
  poolPromise,
};
