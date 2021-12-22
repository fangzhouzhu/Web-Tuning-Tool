var canvas, canvasCtx, analyser, dataArray, bufferLength;
export const audioDraw = function (
  id,
  type,
  dataArrayP,
  analyserP,
  bufferLengthP
) {
  canvas = document.getElementById(id);
  canvasCtx = canvas.getContext('2d');
  dataArray = dataArrayP;
  analyser = analyserP;
  bufferLength = bufferLengthP;
  if (type == 'line') {
    drawLine();
  } else {
    drawBlock();
  }
};

function drawLine() {
  requestAnimationFrame(drawLine);
  analyser.getByteTimeDomainData(dataArray);
  canvasCtx.fillStyle = 'rgb(255, 255, 255)';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(24, 160, 88)';

  canvasCtx.beginPath();

  var sliceWidth = (canvas.width * 1.0) / bufferLength;
  var x = 0;

  for (var i = 0; i < bufferLength; i++) {
    var v = dataArray[i] / 128.0;
    var y = (v * canvas.height) / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.stroke();
}
function drawBlock() {
  requestAnimationFrame(drawBlock);
  analyser.getByteFrequencyData(dataArray);
  canvasCtx.fillStyle = 'rgb(255, 255, 255)';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  canvasCtx.fillStyle = 'rgb(24, 160, 88)';
  var barWidth = (canvas.width / bufferLength) * 2.5;
  var x = 0;

  for (var i = 0; i < bufferLength; i++) {
    let barHeight = dataArray[i];
    canvasCtx.fillRect(x, canvas.height - barHeight / 2, 10, barHeight / 2);
    x += barWidth + 1;
  }
}
