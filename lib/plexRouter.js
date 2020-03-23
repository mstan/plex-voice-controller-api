let express = require('express');
let router = express.Router();
let plexVoiceController  = require('../../plex-voice-controller-js/');
let debug = require('debug')('plex-controller:plexRouter');

let { WebhookRequest, WebhookResponse } = require('./dialogflow.js');

router.post('/dialogflow/', (req,res) => {
	debug('request received');
	let { client, body } = req;
	let webhookRequest = new WebhookRequest(body);
	let webhookResponse = new WebhookResponse(webhookRequest);
	let { queryResult } = webhookRequest;
	let { parameters } = queryResult; 

	debug(parameters);

	plexVoiceController.voiceCommand(client, parameters).then((response) => {
		if(response && response.error) {
			debug('something went wrong', response.error);
			webhookResponse.fulfillmentText = `Something went wrong: ${response.error}`
		} else {
			debug('success!', response);

			if(response.clientName) {
				webhookResponse.fulfillmentText = `Playing on ${response.clientName}`;
			}
		}

		res.send(webhookResponse);
	})
	.catch((error) => {
		debug(error);
		res.send(error);
	})



})

router.post('/command/', (req,res) => {
	let { client, body } = req;
	let parameters = {
		targetClientName: body.targetClientName,
		targetMediaName: body.targetMediaName,
		targetMediaTypes: body.targetMediaTypes,
		action: body.action
	}

	// Example request
	/*
	let options = {
		//targetClientName: "LG 75SK8070AUB", // OPTIONAL: DEBUG FOR NOW, to be abstracted later to various services
		targetMediaName: "tom and jerry",
		targetMediaTypes: ["show"],
		shuffle: 0, // 
		action: "shuffle"
	}
	*/ 

	plexVoiceController.voiceCommand(client, parameters).then((response) => {
		debug(response);
		if(response && response.error) {
			debug('something went wrong', response.error );
		} else {
			debug('success!', response);
		}

		res.send(response);
	})
	.catch((error) => {
		debug(error);
		res.send(error);
	})
})


module.exports = router;