window.addEventListener('load', function () {
  // create websocket instance
  var mySocket = new WebSocket('ws://localhost:10000/ws');

  console.log('loaded');

  // mySocket.onmessage = function (event) {
  //   let videoList = document.getElementById('videoList');
  //   videoList.innerHTML = '';
  //   for (let video in event.data.videos) {
  //     videoList.appendChild(new Option(video));
  //   }
  // };

  // var form = document.getElementsByClassName('foo');
  // var input = document.getElementById('input');

  // form[0].addEventListener('submit', function (e) {
  //   // on forms submission send input to our server
  //   input_text = input.value;
  //   mySocket.send(input_text);
  //   e.preventDefault();
  // });
});
