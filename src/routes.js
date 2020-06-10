import express from 'express';
import DidController from './didController';
import UsernameController from './usernameController';

const router = express.Router();

router.post('/commit', DidController.commit);
router.get('/load', DidController.load);
router.get('/loadForApp', DidController.loadForApp);
router.get('/getDidFromVid', DidController.getDidFromVid);

router.post('/username/commit', UsernameController.commit);
router.get('/username/getDid', UsernameController.getDidFromUsername);

export default router;