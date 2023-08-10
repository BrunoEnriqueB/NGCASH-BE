import UserController from './controllers/UserController';
import TransactionsController from './controllers/TransactionsController';
import { Router } from 'express';

const router = Router();
router.get('/test', (req, res) => {
  res.status(200).send('<h1>Hello World!</h1>');
});

router.use('/user', UserController);
router.use('/transactions', TransactionsController);

export default router;
