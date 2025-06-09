// CORS Proxy Server
// A simple development proxy to bypass CORS restrictions during local testing

import corsAnywhere from 'cors-anywhere';

// Configuration
const HOST = 'localhost';
const PORT = 8082;

// Create proxy server
corsAnywhere.createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: ['cookie', 'cookie2']
}).listen(PORT, HOST, () => {
  console.log(`CORS Proxy running on http://${HOST}:${PORT}`);
  console.log(`To use: http://${HOST}:${PORT}/[URL]`);
  console.log('Example for Google Apps Script:');
  console.log(`http://${HOST}:${PORT}/https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`);
});
