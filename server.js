const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const PORT = 5000;

const CLIENT_ID = '1239605071084519434';
const CLIENT_SECRET = 'xQlfISzfbX9fx1PXbgMVPiVXvtSEYx1Y';
const REDIRECT_URI = 'http://localhost:5000/callback';
const GUILD_ID = '1243583589984108625'; // Your Discord server ID
const BOT_TOKEN = 'MTIzOTYwNTA3MTA4NDUxOTQzNA.Gl5qPD.GjU5NIlagVA3VzhcUZqGLg4w_F5c3OVWBQpKuM'; // Bot token with guilds.join permission

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.send('No code provided');
    }

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', querystring.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            scope: 'identify guilds.join'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const user = userResponse.data;

        // Add the user to the guild
        await axios.put(`https://discord.com/api/guilds/${GUILD_ID}/members/${user.id}`, {
            access_token: accessToken
        }, {
            headers: {
                'Authorization': `Bot ${BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        res.send(`<h1>Logged in as ${user.username}#${user.discriminator} and joined the server</h1>`);
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.send('An error occurred');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
