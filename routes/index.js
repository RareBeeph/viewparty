import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', async function (req, res, next) {
  const inputList = await req.obs.connection.call('GetInputList', {
    inputKind: 'ffmpeg_source',
  });
  const names = inputList.inputs.map(value => value.inputName);

  res.render('index', { title: 'Express', names });
});

/* Placeholder */
router.post('/endpoint', function (req, res, next) {
  req.obs.tryChangeInput(req.body.inputName);
  res.redirect('/');
});

export default router;
