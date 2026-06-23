const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      res.end(JSON.stringify({ status: 'success', mocked: true, received: body }));
    });
  } else {
    res.end(JSON.stringify({ status: 'healthy', mocked: true }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock performance load testing target running on http://localhost:${PORT}`);
});
