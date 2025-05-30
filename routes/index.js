import express from 'express';

const router = express.Router();

const catchWrapper = callback => {
  return (req, res, next) => {
    return callback(req, res, next).catch(next);
  };
};

// env: { ws, req, next }
const msgCatchWrapper = (callback, env) => {
  return msg => {
    callback(msg, env).catch(env.next);
  };
};

const onMsg = async function (msg, env) {
  const {
    ws,
    req: { obs },
  } = env;
  const input = JSON.parse(msg);

  console.log(input);

  // temporary stop-gap
  if (!obs.connected) {
    ws.send('ERROR: Not connected.');
    return;
  }

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
      await obs.update();
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
};

/* GET home page. */
router.get(
  '/old',
  catchWrapper(async function (req, res) {
    const { obs } = req;
    res.render('index', await obs.data);
  }),
);

/* Websocket interaction for reactive page. */
router.ws('/ws', async function (ws, req, next) {
  // hand the ws to the error handler
  req.ws = ws;

  const { obs } = req;
  obs.clients.add(ws);

  ws.on('close', () => {
    obs.clients.delete(ws);
  });

  ws.on('message', msgCatchWrapper(onMsg, { ws, req, next }));
});

export default router;
