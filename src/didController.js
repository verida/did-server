let { DIDDocument } = require('did-document');
import DbManager from './dbManager';

class DidController {

    async load(req, res) {
        let did = new DIDDocument(req.body.did);
        let doc = DbManager.loadDoc(did);

        if (!doc) {
            return res.status(400).send({
                status: "fail",
                data: {
                    did: "Invalid DID or not found"
                }
            });
        }

        return res.status(200).send({
            status: "success",
            data: {
                document: JSON.stringify(doc)
            }
        });
    }

    async commit(req, res) {
        let docJson = JSON.parse(req.body.document);
        let doc = new DIDDocument(docJson);

        if (!this.verifyDoc(doc)) {
            return res.status(400).send({
                status: "fail",
                data: {
                    document: "Invalid document signature"
                }
            });
        }

        if (DbManager.saveDoc(doc)) {
            return res.status(200).send({
                status: "success",
                data: {
                    document: JSON.stringify(doc)
                }
            });
        } else {
            return res.status(400).send({
                status: "fail",
                message: "Unknown error saving document"
            });
        }

    }

    verifyDoc(doc) {
        console.log(doc);

        return false;
    }

}

const didController = new DidController();
export default didController;