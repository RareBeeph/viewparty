const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

let inputs = [];
let videos = [];

window.addEventListener('load', function () {
  // create websocket instance
  const socket = new WebSocket('ws://localhost:10000/ws/');

  console.log('loaded');

  socket.onmessage = onMessage;

  const forms = $$('.selectForm');
  const inputs = $$('select');

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

  const skipForm = $('#skipForm');
  skipForm.addEventListener('submit', function (e) {
    const input = { skip: true };
    socket.send(JSON.stringify(input));
    e.preventDefault();
  });
});

function onMessage(event) {
  data = JSON.parse(event.data);

  // update input list
  if (JSON.stringify(inputs) != JSON.stringify(data.inputs)) {
    inputs = data.inputs;
    let inputList = $('#inputList');
    inputList.innerHTML = '';
    for (let input of inputs) {
      inputList.appendChild(new Option(input));
    }
  }

  // update status tags
  let currentInput = $('#currentInput');
  currentInput.textContent = 'Current input: ' + data.currentInput;

  let currentVideo = $('#currentVideo');
  currentVideo.textContent = 'Current video: ' + data.currentVideo;

  let nextVideo = $('#nextVideo');
  nextVideo.textContent = 'Next video: ' + data.nextVideo;

  // update video list
  if (JSON.stringify(videos) != JSON.stringify(data.videos)) {
    videos = data.videos;
    let videoList = $('#videoList');
    videoList.innerHTML = '';
    for (let video of data.videos) {
      videoList.appendChild(new Option(video));
    }
  }
}
