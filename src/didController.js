let { DIDDocument } = require('did-document');
import DbManager from './dbManager';
import Utils from './utils';

class DidController {

    async load(req, res) {
        let did = req.query.did;

        try {
            let doc = await DbManager.loadDoc(did);

            return res.status(200).send({
                status: "success",
                data: {
                    document: doc.doc
                }
            });
        } catch (err) {
            if (err.reason == "missing") {
                return res.status(400).send({
                    status: "fail",
                    data: {
                        did: "Invalid DID or not found"
                    }
                });
            }

            throw err;
        }
    }

    async commit(req, res) {
        let doc = req.body.params.document;

        if (!Utils.verifyDoc(doc)) {
            return res.status(400).send({
                status: "fail",
                message: "Invalid document signature"
            });
        }

        try {
            let result = await DbManager.saveDoc(doc);
            
            return res.status(200).send({
                status: "success",
                data: {
                    document: result.doc
                }
            });
        } catch (err) {
            return res.status(400).send({
                status: "fail",
                message: err.reason
            });
        }

    }

}

const didController = new DidController();
export default didController;