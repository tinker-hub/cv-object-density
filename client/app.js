const socket = io.connect('http://1.31.246.34.:8080');

const divCounter = document.getElementById('counter');

socket.on('density', function (data) {
	divCounter.innerHTML = `density: ${parseInt(data)} %`;
});
