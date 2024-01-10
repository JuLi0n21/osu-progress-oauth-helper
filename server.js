const express = require('express');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 9000;

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

  if(req.query.port != null){

  
    const authorizationUrl = 'https://osu.ppy.sh/oauth/authorize';
    const redirectUri = `https://${process.env.URL}/callback`;
    const client_id = process.env.CLIENT_ID;
    const response_type = 'code';
    const scope = 'public identify';
    const state = 'Randomstate';
    
    res.redirect(`${authorizationUrl}?client_id=${client_id}&redirect_uri=${redirectUri}&response_type=${response_type}&scope=${scope}&state=${req.query.port}`);
  } else {
    res.json({ error: "callback port needs to be defined"})
  }
});
  
app.get('/callback', async (req, res) => {
  const authorizationCode = req.query.code;

  console.log(req.query.state)
  try {
    const tokenEndpoint = 'https://osu.ppy.sh/oauth/token';
    const requestBody = new URLSearchParams({
      'client_id': process.env.CLIENT_ID,
      'client_secret': process.env.CLIENT_SECRET,
      'code': authorizationCode,
      'grant_type': 'authorization_code',
      'redirect_uri': `https://${process.env.URL}/callback`
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
        res.redirect(`http://localhost:${req.query.state}/api/callback?access_token=${data.access_token}&refresh_token=${data.refresh_token}&expires_in=${data.expires_in}`)
        //res.json(data);
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