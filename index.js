let fs = require('fs');

if( !fs.existsSync('./key.pem') || !fs.existsSync('./cert.pem') ) {
	throw new Error('Missing ./key.pem or ./cert.pem. See https://medium.com/@nitinpatel_20236/how-to-create-an-https-server-on-localhost-using-express-366435d61f28 for more info on how to get these.');
	process.exit(1);
}	



let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let https = require('https');
let { plexRouter } = require('./lib');
let debug = require('debug')('plex-controller:main');

let plexVoiceController  = require('plex-voice-controller-js');

let isSetup;
let plexClient; 

plexVoiceController.setup().then((client) => {
	if(client) {
		isSetup = true;
		plexClient = client;
	}
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true })); // support encoded bodies

/*
	Middleware to ensure plexClient is setup.
	If it is, bind and pass!
*/

// basic auth. Access token
app.use('/plex', (req,res,next) => {
	// is plex set up?
	if(!isSetup) {
		res.send({ error: 'Plex client is still setting set up. Please try again in a few seconds'});
		return;
	}
	req.client = plexClient;

	let { access_token } = req.headers;
	
	if(access_token == process.env.ACCESS_TOKEN) {
		next();
	} else {
		debug(`Authorization failed with header "access_token" as ${access_token}` );
		res.sendStatus(401);
	}
});

app.get('/status', (req,res) => {
	res.sendStatus(200);
})


app.use('/plex/', plexRouter);
app.listen(process.env.API_PORT);
debug(`listening on port ${process.env.API_PORT}`);

// https server
let server = https.createServer({
	key: fs.readFileSync('./key.pem'),
	cert: fs.readFileSync('./cert.pem'),
}, app);
server.listen(443);