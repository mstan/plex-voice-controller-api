let debug = require('debug')('plex-controller:dialogflow');

// https://cloud.google.com/dialogflow/docs/fulfillment-webhook#webhook_request
function WebhookRequest(object) {
	let { responseId, session, queryResult, originalDetectIntentRequest } = object; 
	this.responseId = responseId;
	this.session = session;
	this.queryResult = queryResult;
	this.originalDetectIntentRequest = originalDetectIntentRequest;
}

// https://cloud.google.com/dialogflow/docs/fulfillment-webhook#webhook_response
function WebhookResponse(webhookRequest,options) {
		if(!options) options = {};

		this.fulfillmentText = "Request received";
		this.fulfillmentMessages = [] || options.fulfillmentMessages;
		this.source = process.env.ORIGIN_URL;
		this.payload = undefined || options.payload;
		this.outputContexts = webhookRequest.queryResult.outputContexts;
		this.followupEventInput = undefined || options.followupEventInput;
}

module.exports = {
	WebhookResponse,
	WebhookRequest
}