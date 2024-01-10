const express = require('express');
const axios = require('axios')
const app = express();

const port = 4000;

let tokenData;

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/authorize', (req, res) => {
    const authorizationUrl = 'https://osu.ppy.sh/oauth/authorize';
    const redirectUri = 'http://localhost:4000/callback';
    const client_id = process.argv[2];
    const response_type = 'code';
    const scope = 'public identify';
    const state = 'Randomstate';
    
    res.redirect(`${authorizationUrl}?client_id=${client_id}&redirect_uri=${redirectUri}&response_type=${response_type}&scope=${scope}`);
});
  
app.get('/callback', async (req, res) => {
  const authorizationCode = req.query.code;

  console.log(authorizationCode)
  try {
    const tokenEndpoint = 'https://osu.ppy.sh/oauth/token';
    const requestBody = new URLSearchParams({
      'client_id': process.argv[2],
      'client_secret': process.argv[3],
      'code': authorizationCode,
      'grant_type': 'authorization_code',
      'redirect_uri': 'http://localhost:4000/callback'
    });
    
    fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: requestBody
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        res.json(data);
      })
      .catch(error => console.error('Error:', error));
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});