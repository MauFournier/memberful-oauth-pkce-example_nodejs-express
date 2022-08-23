const express = require('express');
const app = express();
const defaultPort = 3000;

const signInURL = '/sign-in';
const callbackURL = '/callback';
const generateStateURL = '/generate-state';
const generateVerifierURL = '/generate-verifier';

const axios = require('axios');
const crypto = require('crypto');

var sha256 = require("crypto-js/sha256");
var Base64 = require("crypto-js/enc-base64");
const base64url = require('base64url');

const generateRandomString = (length) => {
	let text = "";
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

app.get('/', function(req, res){
   res.send("Hello world!");
});

app.get(generateStateURL, function(req, res){
   let state = generateRandomString(16);
   res.send(state);
});

app.get(generateVerifierURL, function(req, res){
   	const code_verifier  = generateRandomString(128);
	const hash = crypto.createHash('sha256');
	const hashed = hash.update(code_verifier)
	const digested = hashed.digest();
	const code_challenge = base64url(digested);

	res.send(`verifier = ${code_verifier}<br>hashed = ${hashed}<br>challenge = ${code_challenge}`);
});

app.get(signInURL, function(req, res){
	const response_type = "code";
	const client_id = 'zPpFotGfnV85ZQbEs9qLMTfQ';
	const state = 'DAV0RlF68zZr7F77';
	const code_challenge = 'brUd6mk8iE7La-bLZSMSAzef1DQRIT3ox9URzsUJmHA';
	const code_challenge_method = 'S256';

	//Auth code request
	res.redirect(`https://jennysbakery.memberful.com/oauth/?response_type=${response_type}&client_id=${client_id}&state=${state}&code_challenge=${code_challenge}&code_challenge_method=${code_challenge_method}`);
});
 
app.get(callbackURL, function(req, res){
	const code = req.query.code;
	const client_id = 'zPpFotGfnV85ZQbEs9qLMTfQ';
	const returnedState = req.query.state;
   	let code_verifier = 'P0aW8nFfarEhdn9gYJWnpSU8OHEFkLNPH-0kdMyYNco9KcNOkDDdp5RyrR0ruGzNoCQAekfJo1Zcwts871-HAAAG60NH9dJr4Da2mXRbX1EPIYbrbPRC1WOup4nmxmuS';
   	let state = 'DAV0RlF68zZr7F77';

	if(state === returnedState){
		//access token request
		axios.post(`https://jennysbakery.memberful.com/oauth/token`, {
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