import express from 'express';
import path from 'node:path';

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
  const { obs } = req;
  const inputList = await obs.inputList;

  let stuff = JSON.stringify({
    inputs: inputList.map(value => value.inputName),
    currentVideo: obs.settings.local_file ? path.basename(obs.settings.local_file) : na,
    nextVideo: obs.nextVideo || na,
    currentInput: obs.inputName || na,
    videos: obs.videos,
  });

  const poll = () => {
    const newstuff = JSON.stringify({
      inputs: inputList.map(value => value.inputName),
      currentVideo: obs.settings.local_file ? path.basename(obs.settings.local_file) : na,
      nextVideo: obs.nextVideo || na,
      currentInput: obs.inputName || na,
      videos: obs.videos,
    });

    if (JSON.stringify(newstuff) != JSON.stringify(stuff)) {
      stuff = newstuff;
      ws.send(stuff);
    }
  };

  setInterval(poll, 5000);

  ws.on('message', async function (msg) {
    console.log(msg);
    const input = JSON.parse(msg)['nput'];
    if (input) {
      try {
        await obs.changeInput(input);
      } catch {
        console.log('change input failed');
      }
    }

    const next = JSON.parse(msg)['next'];
    if (next) {
      obs.nextVideo = next;
    }

    // doesn't seem to poll with updated information immediately
    const skip = JSON.parse(msg)['skip'];
    if (skip) {
      // stop currently playing video
      await req.obs.stopMedia();

      // play new video if stopped
      await req.obs.changeMedia();
    }

    poll();
  });
});

export default router;
