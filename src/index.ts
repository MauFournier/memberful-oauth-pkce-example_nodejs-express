import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import base64url from 'base64url';

import generateRandomString from './generateRandomString';

const app = express();

const defaultPort = 3000;
const signInURL = '/sign-in';
const callbackURL = '/callback';
const memberfulURL = 'INSERT_YOUR_MEMBERFUL_URL_HERE'; //Your Memberful account subdomain (e.g. https://example.memberful.com).
const client_id = 'INSERT_YOUR_OAUTH_IDENTIFIER_HERE'; //Your custom app's "OAuth Identifier", found in the Memberful dashboard.

export const generateCodeVerifier = () => {
  const codeVerifier = generateRandomString(128);
  return codeVerifier;
};

export const generateCodeChallengeForVerifier = (codeVerifier: string) => {
  const hash = crypto.createHash('sha256');
  const hashed = hash.update(codeVerifier);
  const digested = hashed.digest();
  const codeChallenge = base64url(digested);

  return codeChallenge;
};

export const generateCodeVerifierAndChallenge = () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallengeForVerifier(codeVerifier);

  return { codeVerifier, codeChallenge };
};

const state = generateRandomString(16);
const { codeVerifier, codeChallenge } = generateCodeVerifierAndChallenge();

app.get('/', function (req, res) {
  res.send('Hello world!');
});

app.get(signInURL, function (req, res) {
  const response_type = 'code';
  const code_challenge_method = 'S256';

  //Auth code request
  res.redirect(
    `${memberfulURL}/oauth/?response_type=${response_type}&client_id=${client_id}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=${code_challenge_method}`
  );
});

app.get(callbackURL, function (req, res) {
  const { code, state: returnedState } = req.query;

  if (state === returnedState) {
    //Access token request
    axios
      .post(`${memberfulURL}/oauth/token`, {
        grant_type: 'authorization_code',
        code: code,
        client_id: client_id,
        code_verifier: codeVerifier,
      })
      .then(function (response) {
        console.log(response.data);
        res.send(response.data);
      })
      .catch(function (error) {
        console.log(error);
        res.send(error.data);
      });
  } else {
    res.send("State doesn't match");
  }
});

const PORT = process.env.PORT || defaultPort;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
