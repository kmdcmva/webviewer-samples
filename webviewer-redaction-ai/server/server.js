// This file is to run a server in localhost:process.env.PORT
import express from 'express';
import bodyParser from 'body-parser';
import open from 'open';
import handler from './handler.js';
import dotenv from 'dotenv';

dotenv.config();
const port = Number(process.env.PORT) || 4040;

// Use JSON body parser for API endpoints
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.text());

// Inject MODE_ENV into index.html before
// static serving. This allows client-side
// code to check the mode (e.g., 'mocking')
// and adjust behavior accordingly.
// MOCKING MODE is used to test the frontend
// without needing a backend connection.
app.use(function injectModeEnv(req, res, next) {
	if (req.path === '/client/index.html') {
		import('node:fs').then(fs => {
			fs.readFile('client/index.html', 'utf8', (err, data) => {
				if (err) return next();
				const mode = process.env.NODE_ENV || 'default';
				// Inject window.MODE_ENV before </head>
				const injected = data.replace('</head>', `<script>window.MODE_ENV='${mode}';</script>\n</head>`);
				res.set('Content-Type', 'text/html');
				res.send(injected);
			});
		});
	} else {
		next();
	}
});

// For statically serving 'client' folder
app.use('/client', express.static('client'));
// Serve shared browser mock modules
app.use('/__mocks__', express.static('__mocks__'));

handler(app);

// Run server
app.listen(port, 'localhost', (err) => {
	if (err) {
		console.error(err);
	} else {
		console.info(`Server is listening at http://localhost:${port}/client/index.html`);
		open(`http://localhost:${port}/client/index.html`);
	}
});