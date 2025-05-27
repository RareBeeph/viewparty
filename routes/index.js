import express from 'express';

const router = express.Router();
// const na = '(n/a)';

const catchWrapper = callback => {
  return (req, res, next) => {
    callback(req, res, next).catch(next);
  };
};

/* GET home page. */
router.get(
  '/old',
  catchWrapper(async function (req, res) {
    const { obs } = req;
    res.render('index', await obs.data);
  }),
);

router.ws(
  '/ws',
  catchWrapper(async function (ws, req, next) {
    const { obs } = req;
    obs.clients.add(ws);

    ws.on('close', () => {
      obs.clients.delete(ws);
    });

    ws.on('message', async function (msg) {
      const input = JSON.parse(msg);

      console.log(input);

      switch (input.action) {
        case 'input':
          try {
            await obs.changeInput(input.data);
          } catch {
            console.log('Change input failed');
          }
          break;

        case 'next':
          obs.nextVideo = input.data;
          await obs.update().catch(() => console.log('Next video failed'));
          break;

        case 'skip':
          await obs.stopMedia().catch(() => console.log('Stop media failed'));
          await obs.changeMedia().catch(() => console.log('Change media failed'));
          break;

        case 'plsdata':
          ws.send(JSON.stringify(await obs.data.catch(() => console.log('Plsdata failed'))));
          break;

        default:
      }
    });
  }),
);

export default router;
