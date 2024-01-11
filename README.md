# Osu Oauth Middleware Server hosted on Vercel
Route access token back to end user without them needing own Api credentials!

# How to use:
1. Fork Repo
2. Deploy on Vercel 
3. Create [Api Client](https://osu.ppy.sh/home/account/edit#oauth) use the Vercel Domain as Callback
4. add Envoirment variables
- SCOPE: [scopes](https://osu.ppy.sh/docs/index.html#scopes)
- CALLBACK_URL: localy hosted endpoint to where the access_token should be send to
- URL: vercel Domain
- PORT: Vercel server Port / default is 9000
- CLIENT_ID: client_id
- CLIENT_SECRET: client_secret

5. Add link to the vercel domain with port as state to /authorize: 
https://example.vercel.app/authorize?port=4200

6. recieive anser at:
https://localhost:4200/{CALLBACK_URL}?access_token={access_token}&refresh_token={refresh_token}&expires_in={expires_in}
7. profit?

To resfresh the token request this
POST: 
https://example.vercel.app/refresh?port=4200
body: refresh_token : {refreshtoken}

new token should be send like in 6

## use at own risk, security holes might be in there 
