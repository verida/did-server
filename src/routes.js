import express from 'express';
import DidController from './didController';

const router = express.Router();

router.post('/commit', DidController.commit);
router.get('/load', DidController.load);
router.get('/loadForApp', DidController.loadForApp);

export default router;