import express from 'express';
import path from 'node:path';
import expressWs from 'express-ws';

// force express-ws to realize that router.ws is a function.
// might be the problem
var app = express();
var ews = expressWs(app);

const router = express.Router();
const na = '(n/a)';

/* GET home page. */
router.get('/', async function (req, res, next) {
  const { obs } = req;
  const inputList = await obs.inputList;

  res.render('index', {
    title: 'Express',
    inputs: inputList.map(value => value.inputName),
    currentVideo: obs.settings.local_file ? path.basename(obs.settings.local_file) : na,
    nextVideo: obs.nextVideo || na,
    currentInput: obs.inputName || na,
    videos: obs.videos,
  });
});

/* Change input */
router.post('/input', async function (req, res, next) {
  try {
    await req.obs.changeInput(req.body.inputName);
  } catch {
    console.log('change input failed');
  }
  res.redirect('/');
});

/* Change video */
router.post('/next', async function (req, res, next) {
  req.obs.nextVideo = req.body.nextVideo;
  res.redirect('/');
});

/* Skip video */
router.post('/skip', async function (req, res, next) {
  // stop currently playing video
  await req.obs.stopMedia();

  // play new video if stopped
  await req.obs.changeMedia();
  res.redirect('/');
});

router.ws('/ws', async function (ws, req) {
  ws.on('connection', stream => {
    console.log('connected');
  });

  ws.on('message', function (msg) {
    ws.send('pong');
  });
});

export default router;
