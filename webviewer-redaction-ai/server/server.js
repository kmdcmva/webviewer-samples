// This file is to run a server in localhost:process.env.PORT
import express from 'express';
import bodyParser from 'body-parser';
import open from 'open';
import handler from './handler.js';
import dotenv from 'dotenv';

dotenv.config();
const port = Number(process.env.PORT) || 4040;
// ************************************
// For testing purposes only, set the environment variable
// NO_OPEN=true to prevent the server from opening the
// browser automatically when it starts.
const shouldOpenBrowser = !process.argv.includes('--no-open');
// ************************************

// Use JSON body parser for API endpoints
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.text());

// For statically serving 'client' folder
app.use('/client', express.static('client'));

handler(app);

// Run server
app.listen(port, 'localhost', (err) => {
	if (err) {
		console.error(err);
	} else {
		console.info(`Server is listening at http://localhost:${port}/client/index.html`);
		if (shouldOpenBrowser) {
			open(`http://localhost:${port}/client/index.html`);
		}
	}
});