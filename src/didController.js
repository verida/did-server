import DbManager from './dbManager';
import DIDDocument from 'did-document';
import DIDHelper from '@verida/did-helper';

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
        let document = req.body.params.document;
        let doc = new DIDDocument(document, document['@context']);

        if (!(DIDHelper.verifyProof(doc))) {
            return res.status(400).send({
                status: "fail",
                message: "Invalid DID signature"
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