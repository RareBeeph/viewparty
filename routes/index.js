import express from 'express';

const router = express.Router();
const na = '(n/a)';

/* GET home page. */
router.get('/', async function (req, res, next) {
  const { obs } = req;
  res.render('index', await obs.data);
});

router.ws('/ws', async function (ws, req) {
  const { obs } = req;
  obs.clients.add(ws);

  ws.on('close', () => {
    obs.clients.delete(ws);
  });

  ws.on('message', async function (msg) {
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
      await obs.update();
    }

    // doesn't seem to poll with updated information immediately
    const skip = JSON.parse(msg)['skip'];
    if (skip) {
      // stop currently playing video
      await obs.stopMedia();

      // play new video if stopped
      await obs.changeMedia();
    }
  });
});

export default router;
