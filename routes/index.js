import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Placeholder */
router.post('/endpoint', function (req, res, next) {
  res.sendStatus(200);
});

export default router;
