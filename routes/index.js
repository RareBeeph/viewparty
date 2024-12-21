import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', async function (req, res, next) {
  const inputList = (
    await req.obs.connection.call('GetInputList', {
      inputKind: 'ffmpeg_source',
    })
  ).inputs;

  const names = inputList.map(value => value.inputName);
  res.render('index', { title: 'Express', names });
});

/* Placeholder */
router.post('/endpoint', async function (req, res, next) {
  try {
    await req.obs.changeInput(req.body.inputName);
    console.log(req.obs.inputName);
  } catch {
    console.log('change input failed');
  }
  res.redirect('/');
});

export default router;
