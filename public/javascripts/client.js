window.addEventListener('load', function () {
  // create websocket instance
  const socket = new WebSocket('ws://localhost:10000/ws/');

  console.log('loaded');

  socket.onmessage = onMessage;

  // var form = document.getElementsByClassName('foo');
  // var input = document.getElementById('input');

  const forms = this.document.getElementsByClassName('selectForm');
  const inputs = this.document.getElementsByTagName('select');

  for (let idx = 0; idx < forms.length; idx++) {
    console.log(forms[idx]);
    forms[idx].addEventListener('submit', function (e) {
      // on forms submission send input to our server
      const input = {};
      input[forms[idx].action.substr(-4, 4)] = inputs[idx].value;
      socket.send(JSON.stringify(input));
      e.preventDefault();
    });
  }

  const skipForm = this.document.getElementById('skipForm');
  skipForm.addEventListener('submit', function (e) {
    const input = { skip: true };
    socket.send(JSON.stringify(input));
    e.preventDefault();
  });
});

function onMessage(event) {
  data = JSON.parse(event.data);

  // update input list
  let inputList = document.getElementById('inputList');
  inputList.innerHTML = '';
  for (let input of data.inputs) {
    inputList.appendChild(new Option(input));
  }

  // update status tags
  let currentInput = document.getElementById('currentInput');
  currentInput.textContent = 'Current input: ' + data.currentInput;

  let currentVideo = document.getElementById('currentVideo');
  currentVideo.textContent = 'Current video: ' + data.currentVideo;

  let nextVideo = document.getElementById('nextVideo');
  nextVideo.textContent = 'Next video: ' + data.nextVideo;

  // update video list
  let videoList = document.getElementById('videoList');
  videoList.innerHTML = '';
  for (let video of data.videos) {
    videoList.appendChild(new Option(video));
  }
}
