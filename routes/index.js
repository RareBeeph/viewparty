import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', async function (req, res, next) {
  const inputList = (
    await req.obs.connection.call('GetInputList', {
      inputKind: 'ffmpeg_source',
    })
  ).inputs;

  const inputs = inputList.map(value => value.inputName);
  const videos = req.obs.videos;

  let currentVideo = '(n/a)';
  if (req.obs.settings['local_file']) {
    currentVideo =
      req.obs.settings['local_file'].slice(req.obs.settings['local_file'].lastIndexOf('/') + 1) ||
      '(n/a)';
  }
  const nextVideo =
    req.obs.nextVideoForced ||
    req.obs.nextVideo.slice(req.obs.nextVideo.lastIndexOf('/') + 1) ||
    '(n/a)';
  const currentInput = req.obs.inputName || '(n/a)';
  res.render('index', { title: 'Express', inputs, currentVideo, nextVideo, currentInput, videos });
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
  req.obs.nextVideoForced = req.body.nextVideo;
  res.redirect('/');
});

/* Skip video */
router.post('/skip', async function (req, res, next) {
  // stop currently playing video
  await req.obs.connection.call('TriggerMediaInputAction', {
    inputName: req.obs.inputName,
    mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP',
  });

  // play new video if stopped
  await req.obs.changeMedia();
  res.redirect('/');
});

export default router;
