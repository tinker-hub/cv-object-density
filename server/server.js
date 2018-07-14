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
	let baseFrame;
	utils.grabFrames(capture, 1, (frame) => {
		if(!baseFrame) baseFrame = utils.preprocessedFrame(frame)
		const subtractedFrame = baseFrame.absdiff(utils.preprocessedFrame(frame));
		const blurred = subtractedFrame.blur(new cv.Size(12, 12));
		const thresholded = blurred.threshold(15, 255, 0);
		const density = (thresholded.countNonZero() / (480 * 640) ) * 100;
		socket.emit('density', density);
		cv.imshow('thresholded', thresholded);
	});
});
