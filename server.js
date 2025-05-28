// Servidor simples para servir a aplicação AppVisita
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 3000;

// Mapeamento de extensões de arquivo para tipos MIME
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Criar o servidor HTTP
const server = http.createServer((req, res) => {
  console.log(`Requisição: ${req.url}`);
  
  // Normalizar URL
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }
  
  // Obter a extensão do arquivo
  const extname = path.extname(filePath).toLowerCase();
  
  // Tipo de conteúdo padrão
  let contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // Ler o arquivo e enviar a resposta
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Arquivo não encontrado
        fs.readFile('./404.html', (error, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // Outro erro
        res.writeHead(500);
        res.end(`Erro no servidor: ${error.code}`);
        console.error(`Erro no servidor: ${error.code}`);
      }
    } else {
      // Arquivo encontrado, enviar resposta
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Iniciar o servidor
server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Pressione CTRL+C para encerrar o servidor`);
}); 