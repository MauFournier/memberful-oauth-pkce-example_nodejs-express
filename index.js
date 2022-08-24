const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const base64url = require('base64url');

const app = express();

const defaultPort = 3000;
const signInURL = '/sign-in';
const callbackURL = '/callback';
const memberfulSubdomain = 'INSERT_YOUR_MEMBERFUL_SUBDOMAIN_HERE'; //Your Memberful account subdomain (e.g. https://example.memberful.com).
const client_id = 'INSERT_YOUR_OAUTH_IDENTIFIER_HERE'; //Your custom app's "OAuth Identifier", found in the Memberful dashboard.

const generateRandomString = (length) => {
	let text = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

const generateVerifierAndChallenge = () => {
	const code_verifier  = generateRandomString(128);
	const hash = crypto.createHash('sha256');
	const hashed = hash.update(code_verifier)
	const digested = hashed.digest();
	const code_challenge = base64url(digested);

	return {code_verifier, code_challenge};
};

const state = generateRandomString(16);
const {code_verifier, code_challenge} = generateVerifierAndChallenge();

app.get('/', function(req, res){
   res.send("Hello world!");
});

app.get(signInURL, function(req, res){
	const response_type = "code";
	const code_challenge_method = 'S256';

	//Auth code request
	res.redirect(`${memberfulSubdomain}/oauth/?response_type=${response_type}&client_id=${client_id}&state=${state}&code_challenge=${code_challenge}&code_challenge_method=${code_challenge_method}`);
});
 
app.get(callbackURL, function(req, res){
	const {code, state: returnedState} = req.query;

	if(state === returnedState){
		//Access token request
		axios.post(`${memberfulSubdomain}/oauth/token`, {
			grant_type: "authorization_code",
			code: code,
			client_id: client_id,
			code_verifier: code_verifier
		})
		.then(function(response){
			console.log(response.data);
			res.send(response.data);
		})
		.catch(function(error){
			console.log(error);
			res.send(response.data);
		});
	} else {
		res.send("State doesn't match");
	}
});

const PORT = process.env.PORT || defaultPort;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});