A simple example of Memberful's PKCE OAuth flow written in NodeJS and Express

## Installation

Run the following command to install dependencies:

```bash
npm install
```

## Usage

To test locally, run the following command to start the server:

```bash
npm start
```

You can also upload this to a publicly accessible server and run it there.

Open the following URL to verify that the server is running properly — You should see the words "Hello World".

```bash
http://localhost:3000/
```
(if you're not running this locally, replace localhost:3000 with your server's public URL)

Now that we know the server is running properly, let's create a Custom Application in Memberful.

Go to Settings → Custom applications and create a new application. Check the "include OAuth tokens with this application" checkbox.

This example is showing the PKCE flow, so pick either "Single Page Application" or "Mobile Application" as the application type.

For your OAuth Redirect URL, enter the following:

```bash
http://localhost:3000/callback
```
(if you're not running this locally, replace localhost:3000 with your server's public URL)

Copy your custom app's "OAuth Identifier" and paste it into index.js as the value of the **client_id** variable (you'll see a comment about this in the code).

Now we're ready to begin the OAuth flow by opening the following URL.

```bash
http://localhost:3000/sign-in
```
You can change the path for this route and for the callback near the top of the index.js file. (If you change the callback path, you'll need to create a new Custom Application in Memberful and replace the OAuth Identifier with the new one.)

If everything works, you'll be asked to sign in (you'll need a member account to sign into), and then you'll end up at the /callback route with the access token being displayed. It'll look something like this:

```javascript
{"access_token":"DgavbYyWVK4QXckSSvWvfSpX","expires_in":899,"refresh_token":"FYRQ5BQx9qJC2tyibfPdbzgH","token_type":"bearer"}
```

Visit [this article](https://memberful.com/help/custom-development-and-api/sign-in-for-apps-via-oauth/#requesting-member-data) to learn about how you can use this access token to fetch the member's data from Memberful's API.

