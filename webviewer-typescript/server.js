const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 1234;
const DIST_DIR = path.resolve(__dirname, 'dist');
const LIB_DIR = path.resolve(__dirname, 'lib');

const MIME_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.mjs': 'application/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.wasm': 'application/wasm',
};

/**
 * Resolves `relativePath` inside `baseDir`, validates it stays within
 * `baseDir` (path-traversal guard), then streams the file with the
 * correct Content-Type.  When `fallbackToIndex` is true and the file is
 * not found, serves dist/index.html (SPA fallback).
 */
function sendFile(res, baseDir, relativePath, fallbackToIndex) {
	// Resolve and guard against path traversal before any I/O.
	const filePath = path.resolve(baseDir, relativePath);
	const isWithinBase =
		filePath === baseDir || filePath.startsWith(baseDir + path.sep);

	if (!isWithinBase) {
		res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end('Invalid path');
		return;
	}

	fs.readFile(filePath, (err, data) => {
		if (!err) {
			const ext = path.extname(filePath).toLowerCase();
			const contentType = MIME_TYPES[ext] || 'application/octet-stream';
			res.writeHead(200, { 'Content-Type': contentType });
			res.end(data);
			return;
		}

		if (fallbackToIndex) {
			const indexPath = path.join(DIST_DIR, 'index.html');
			fs.readFile(indexPath, (indexErr, indexData) => {
				if (indexErr) {
					res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
					res.end('dist/index.html not found. Check that the Parcel build completed successfully.');
					return;
				}
				res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
				res.end(indexData);
			});
			return;
		}

		res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end('Not found');
	});
}

const server = http.createServer((req, res) => {
	let reqPath;
	try {
		reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
	} catch {
		res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end('Invalid URL');
		return;
	}

	if (reqPath.startsWith('/lib/')) {
		const libRelativePath = reqPath.replace(/^\/lib\//, '');
		sendFile(res, LIB_DIR, libRelativePath, false);
		return;
	}

	const distRelativePath = reqPath === '/' ? 'index.html' : reqPath.replace(/^\//, '');
	sendFile(res, DIST_DIR, distRelativePath, true);
});

server.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
