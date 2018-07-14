const cv = require('opencv4nodejs');
const express = require('express');
const http = require('http');

const utils = require('./utils');

const app = express();

app.use(express.static('./client'));

app.get('*', (req, res) => {
	res.sendFile('index.html', { root: './client' });
});

const server = http.createServer(app);
server.listen(8080, function () {
  console.log('server listening on port 8080');
});

const bgSubtractor = new cv.BackgroundSubtractorMOG2();
const capture = new cv.VideoCapture(0);


const io = require('socket.io')(server);
io.on('connection', (socket) => {
	utils.grabFrames(capture, 1, (frame) => {
		const foreGroundMask = bgSubtractor.apply(frame);
		const dilated = foreGroundMask.dilate(cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(4, 4)), new cv.Point(-1, -1), 2);
		const blurred = dilated.blur(new cv.Size(10, 10));
		const thresholded = blurred.threshold(200, 255, cv.THRESH_BINARY);

		const minPxSize = 4000;
	  utils.drawRectAroundBlobs(thresholded, frame, minPxSize);

		const density = (thresholded.countNonZero() / (480 * 640) ) * 100;
		socket.emit('density', density);

		cv.imshow('foreGroundMask', foreGroundMask);
		cv.imshow('thresholded', thresholded);
		cv.imshow('frame', frame);
	});
});
