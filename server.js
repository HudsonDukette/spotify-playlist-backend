const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://spotify-playlist-builder.onrender.com/callback";

app.get("/", (req, res) => {
  res.send("Spotify Playlist Builder Backend Running");
});


// 🔐 LOGIN ROUTE
app.get("/login", (req, res) => {
  const scope = "playlist-modify-public playlist-modify-private user-read-private";

  const authURL =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
    }).toString();

  res.redirect(authURL);
});


// 🔁 CALLBACK ROUTE
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        },
      }
    );

    const access_token = response.data.access_token;

    res.send(`
      <h1>Login Successful 🎉</h1>
      <p>Access Token:</p>
      <textarea rows="10" cols="60">${access_token}</textarea>
      <p>Copy this token for now (we'll automate this next).</p>
    `);

  } catch (error) {
    console.error(error.response.data);
    res.send("Error getting token");
  }
});


app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
