import express from 'express';
import DidController from 'didController';

const router = express.Router();

router.get('/commit', DidController.commit);
router.post('/load', DidController.load);

export default router;