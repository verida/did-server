import express from 'express';
import DidController from './didController';

const router = express.Router();

router.post('/commit', DidController.commit);
router.get('/load', DidController.load);
router.get('/loadForApp', DidController.loadForApp);
router.get('/getDidFromVid', DidController.getDidFromVid);

export default router;