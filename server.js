const express = require('express');
const app = express();
const port = 3000;

// Servir arquivos estáticos da pasta 'public'
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, '127.0.0.1', () => {
  console.log(`Servidor rodando em http://127.0.0.1:${port}/`);
});
