/****************************************************************
 ** Memberful OAuth2 PKCE Example - Node.js + Express
 **
 ** This example shows how to use the Memberful OAuth2 PKCE flow to
 ** authenticate a user and retrieve their profile information.
 **
 ** This is the flow you would use for a client-side single-page
 ** application or a mobile app. If you're building a server-side
 ** application (SSA), you should look at our server-side example instead.
 **
 ** For more information, check out our documentation:
 ** https://memberful.com/help/custom-development-and-api/sign-in-for-apps-via-oauth/
 ****************************************************************/

import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import base64url from 'base64url';

//****************************************************************
//*** Configuration
//****************************************************************

const defaultPort = 3000;

// Choose the URL you want to use for the sign-in route
const beginOAuthFlowURL = '/begin-oauth-flow';

// Choose the URL you want to use for the callback route.
// This must match the callback URL you set as the Redirect URL
// for your Custom OAuth app in the Memberful dashboard
const callbackURL = '/callback';

// Your Memberful account subdomain (e.g. https://example.memberful.com).
const memberfulURL = 'INSERT_YOUR_MEMBERFUL_URL_HERE';

// Your custom app's "OAuth Identifier", found in the Memberful dashboard.
// >>> Note: You should store this in an environment variable to avoid
// committing it to your repository.
// We're just storing it in a global variable here for simplicity.
const clientId = 'INSERT_YOUR_OAUTH_IDENTIFIER_HERE';

//****************************************************************
//*** Helper functions for generating the codes we'll need
//****************************************************************

export const generateRandomString = (length) => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

// Code verifier should be a random string with a length between 43 and 128 characters
export const generateCodeVerifier = () => {
  const codeVerifier = generateRandomString(128);

  return codeVerifier;
};

// Code challenge should be a base64url-encoded SHA256 hash of the code verifier
export const generateCodeChallengeFromVerifier = (codeVerifier) => {
  // Create a sha256 hash object
  const hash = crypto.createHash('sha256');

  // Pass the data to be hashed (our code verifier) to the hash object
  const hashed = hash.update(codeVerifier);

  // Obtain the hash.
  // We won't specify an output format because we need base64url (NOT base64),
  // which is not available in this digest() method
  const digested = hashed.digest();

  // Convert the hash (currently in binary format) to base64url format
  const codeChallenge = base64url(digested);

  return codeChallenge;
};

// For convenience, here's a helper function to generate both
// a code verifier and its corresponding code challenge
export const generateCodeVerifierAndChallenge = () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallengeFromVerifier(codeVerifier);

  return { codeVerifier, codeChallenge };
};

// If you decide to implement your own code verifier/callenge generation,
// (perhaps using a different library or programming language), you should
// update the imports within index.test.js and run 'npm test' to ensure that
// your code is generating valid code verifiers and challenges.

//****************************************************************
//*** Declare necessary variables
//****************************************************************

//We'll be generating our code strings later on, but we'll need to keep
//track of it throughout the flow, so we'll declare it here
let state = '';
let codeVerifier = '';
let codeChallenge = '';

//****************************************************************
//*** Begin Express app
//****************************************************************

const app = express();

// Lobby: This route isn't part of the OAuth flow, it's just for
// our convenience during development.
app.get('/', (req, res) => {
  res.send(`
  <html><head></head><body>
    <h1>Memberful OAuth PKCE Example - NodeJS + Express (No auth library)</h1>
    <p><a href="${beginOAuthFlowURL}">Begin OAuth Flow</a></p>
  </body></html>
  `);
});

// > Step 1) Create a route to begin the OAuth flow

// We must first generate the necessary codes and
// open the browser to begin the OAuth flow. Whenever a user tries
// to access a route that requires authentication, we should redirect
// to this route, so you can name this route /login or something
// similar.

app.get(beginOAuthFlowURL, (req, res) => {
  // > Step 2) Generate the codes we'll need

  // Response type is always 'code'
  const responseType = 'code';

  // If you use the helper functions defined above,
  // you're using method 'S256', short for 'SHA256'
  const codeChallengeMethod = 'S256';

  // Let's generate our code verifier and code challenge
  codeVerifier = generateCodeVerifier();
  codeChallenge = generateCodeChallengeFromVerifier(codeVerifier);

  // Now let's generate our state, which is just a random string
  state = generateRandomString(16);
  // Remember to store the code verifier and state for use in later steps
  // For this example, we're just storing them in global variables

  // > Step 3) Request Auth code: This is where we start the OAuth flow
  // Your application must open this Memberful URL in a browser
  // to allow the member to sign in:
  // https://YOURSITE.memberful.com/oauth
  res.redirect(
    `${memberfulURL}/oauth/?response_type=${responseType}&client_id=${clientId}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}`
  );
});

// > Step 4) User signs in via Memberful. We use passwordless sign-in by default,
// so they'll receive an email with a link to sign in. Once they click that link,
// they'll be redirected to the callback URL you set in the Memberful dashboard.
// Note: The link they receive in their email will include a token. This token
// is *not* the auth code we're looking for. It's not part of this flow.

// > Step 5) Callback Route: This is the route you set as the Redirect URL for your
// Custom OAuth app in the Memberful dashboard. Memberful will redirect the user to
// this URL after // they've signed in via Memberful, attaching the auth code and
// state to the URL.
// Example: https://YOURAPP.com/oauth_callback?code=[CODE]&state=[STATE]
app.get(callbackURL, async (req, res) => {
  // We'll grab those two parameters from the URL
  const { code, state: returnedState } = req.query;

  // > Step 6) Verify state - this is a security measure
  if (state !== returnedState) {
    res.send("State doesn't match");
  } else {
    try {
      // > Step 7) Access token request
      // Now that we have the auth code, exchange it for an access token
      // Make a POST request to this URL:
      // https://YOURSITE.memberful.com/oauth/token
      const accessTokenResponse = await axios.post(
        `${memberfulURL}/oauth/token`,
        {
          // The grant type is always 'authorization_code'
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          // We'll need to include the same code verifier we generated earlier
          code_verifier: codeVerifier,
        }
      );

      // We now have an access token!
      // Example response:
      // accessTokenResponse.data === {"access_token":"d4b39Hjxo2m1aPiiLwuZyh6R","expires_in":899,"refresh_token":"J5P7AX7b6L9LTiWEbShzheNV","token_type":"bearer"}

      // Let's extract the access and refresh tokens for the next steps
      const { access_token, refresh_token } = accessTokenResponse.data;

      // > Step 8) Query Member Data
      // Now that we have an access token, we can use it to query the member's data

      // First, let's build our GraphQL query, which will tell Memberful which fields we want.
      // To learn more about our API and which fields are available, check out these two articles:
      // https://memberful.com/help/custom-development-and-api/sign-in-for-apps-via-oauth/#requesting-member-data
      // https://memberful.com/help/custom-development-and-api/memberful-api/#using-the-graphql-api-explorer
      const memberQuery = `
        {
          currentMember {
            id
            email
            fullName
            subscriptions {
              active
              expiresAt
              plan {
                id
                name
              }
            }
          }
        }
        `;

      // Make a GET request to this URL:
      // https://YOURSITE.memberful.com/api/graphql/member?query=GRAPHQL_QUERY
      const memberDataResponse = await axios.get(
        `${memberfulURL}/api/graphql/member?query=${memberQuery}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      console.log(memberDataResponse.data);

      // We now have the member's data!
      //
      // Example response:
      // memberDataResponse.data === {
      //   "currentMember": {
      //       "id": "2406643",
      //       "email": "maren.member@gmail.com",
      //       "fullName": "Maren",
      //       "subscriptions": [
      //           {
      //               "plan": {
      //                   "id": "65673",
      //                   "name": "One time success"
      //               },
      //               "active": true,
      //               "expiresAt": null
      //           }
      //       ]
      //   }
      //}

      // Feel free to use this data inside your app.
      // Alternatively, you can run more queries to fetch more data via our API:
      // https://memberful.com/help/custom-development-and-api/memberful-api/

      // > Step 9) Refresh token request
      // Access tokens are valid for 15 minutes.
      // You can use the refresh token (provided with each access token)
      // to get a new access token. Refresh tokens are valid for one year.
      // To obtain a new access token, send a POST request to:
      // https://YOURSITE.memberful.com/oauth/token

      const refreshTokenResponse = await axios.post(
        `${memberfulURL}/oauth/token`,
        {
          // The grant type is always 'refresh_token'
          grant_type: 'refresh_token',
          refresh_token,
          client_id: clientId,
        }
      );

      console.log(
        "We've refreshed the token! New access token: ",
        refreshTokenResponse.data
      );

      // We now have a new access token!
      // Example response:
      // refreshTokenResponse.data === {
      //     "access_token": "wMGRkW7ahw1vFNctr1uCzLQd",
      //     "expires_in": 899,
      //     "refresh_token": "AgKtiGrPiBAKtsPGx4kKduuk",
      //     "token_type": "bearer"
      // }

      // That's all! For more information on this process, check out our docs:
      // https://memberful.com/help/custom-development-and-api/sign-in-for-apps-via-oauth/

      // Let's output a summary of the results, just for our own reference
      res.send(`
      <html><head></head><body>
        <h2>Results from our access token request:</h2>
        <pre>${JSON.stringify(accessTokenResponse.data, null, 2)}</pre>
        <h2>Results from our member data request:</h2>
        <pre>${JSON.stringify(memberDataResponse.data, null, 2)}</pre>
        <h2>Results from our refresh token request:</h2>
        <pre>${JSON.stringify(refreshTokenResponse.data, null, 2)}</pre>
      </body></html>
      `);
    } catch (error) {
      console.log(error);
      res.send(error.data);
    }
  }
});

// Start the Express server
const PORT = process.env.PORT || defaultPort;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
