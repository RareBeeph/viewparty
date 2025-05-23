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
          try {
            obs.nextVideo = input.data;
            await obs.update();
          } catch {}
          break;

        case 'skip':
          await obs.stopMedia();
          await obs.changeMedia();
          break;

        case 'plsdata':
          ws.send(JSON.stringify(await obs.data));
          break;

        default:
      }
    });
  }),
);

export default router;
