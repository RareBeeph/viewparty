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
    const input = JSON.parse(msg);

    if (input.action == 'input') {
      try {
        await obs.changeInput(input.data);
      } catch {
        console.log('change input failed');
      }
    }

    if (input.action == 'next') {
      obs.nextVideo = input.data;
      await obs.update();
    }

    if (input.action == 'skip') {
      await obs.stopMedia();
      await obs.changeMedia();
    }
  });
});

export default router;
