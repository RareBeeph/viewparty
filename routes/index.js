import express from 'express';
import path from 'node:path';

const router = express.Router();
const na = '(n/a)';

/* GET home page. */
router.get('/', async function (req, res, next) {
  const { obs } = req;
  // TODO: Make attribute for this on OBS
  const inputList = (
    await obs.connection.call('GetInputList', {
      inputKind: 'ffmpeg_source',
    })
  ).inputs;

  const currentVideo = obs.settings.local_file ? path.basename(obs.settings.local_file) : na;

  res.render('index', {
    title: 'Express',
    inputs: inputList.map(value => value.inputName),
    currentVideo,
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
  await req.obs.connection.call('TriggerMediaInputAction', {
    inputName: req.obs.inputName,
    mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP',
  });

  // play new video if stopped
  await req.obs.changeMedia();
  res.redirect('/');
});

export default router;
