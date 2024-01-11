const express = require('express');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 9000;

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
    const scope = process.env.SCOPE;
    
    res.redirect(`${authorizationUrl}?client_id=${client_id}&redirect_uri=${redirectUri}&response_type=${response_type}&scope=${scope}&state=${req.query.port}`);
  } else {
    res.json({ error: "callback port needs to be defined"})
  }
});

app.get('/refresh', (req, res) => {

  const refresh_token = req.body.refresh_token;
  const callbackport = req.query.port;

  if(callbackport != null && refresh_token != null){

    try {
      const tokenEndpoint = 'https://osu.ppy.sh/oauth/token';
      const requestBody = new URLSearchParams({
        'client_id': process.env.CLIENT_ID,
        'client_secret': process.env.CLIENT_SECRET,
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token',
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
          res.redirect(`http://localhost:${callbackport}/${process.env.CALLBACK_URL}?access_token=${data.access_token}&refresh_token=${data.refresh_token}&expires_in=${data.expires_in}`);
        })
        .catch(error => res.json(error));
    
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    
  } else {
    res.json({ error: "callback port and refresh_token needs to be defined"})
  }

});
  
app.get('/callback', async (req, res) => {

  const authorizationCode = req.query.code;
  const callbackport = req.query.state; //port of application

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
        res.redirect(`http://localhost:${callbackport}/${process.env.CALLBACK_URL}?access_token=${data.access_token}&refresh_token=${data.refresh_token}&expires_in=${data.expires_in}`);
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