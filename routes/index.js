import express from 'express';
import path from 'node:path';

const router = express.Router();

/* GET home page. */
router.get('/', async function (req, res, next) {
  const inputList = (
    await req.obs.connection.call('GetInputList', {
      inputKind: 'ffmpeg_source',
    })
  ).inputs;

  const { obs } = req;

  let currentVideo = '(n/a)';
  if (obs.settings.local_file) {
    currentVideo = path.basename(obs.settings.local_file) || '(n/a)';
  }

  const renderParams = {
    title: 'Express',
    inputs: inputList.map(value => value.inputName),
    currentVideo,
    nextVideo: obs.nextVideo || '(n/a)',
    currentInput: obs.inputName || '(n/a)',
    videos: obs.videos,
  };

  res.render('index', renderParams);
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
  await req.obs.connection.call('TriggerMediaInputAction', {
    inputName: req.obs.inputName,
    mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP',
  });

  // play new video if stopped
  await req.obs.changeMedia();
  res.redirect('/');
});

export default router;
