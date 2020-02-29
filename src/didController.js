import DbManager from './dbManager';
import { DIDDocument } from 'did-document';
import DIDHelper from '@verida/did-helper';

class DidController {

    async load(req, res) {
        let vid = req.query.vid;

        try {
            let doc = await DbManager.loadDoc(vid);

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
                        did: "Invalid VID or not found"
                    }
                });
            }

            throw err;
        }
    }

    async loadForApp(req, res) {
        let did = req.query.did;
        let appName = req.query.appName;

        try {
            let lookup = await DbManager.lookupForApp(did, appName);
            let vid = lookup.vid;
            let doc = await DbManager.loadDoc(vid);

            return res.status(200).send({
                status: "success",
                data: {
                    document: doc.doc
                }
            });
        } catch (err) {
            if (err.error == "not_found") {
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
        let publicDid = req.body.params.did;
        let doc = new DIDDocument(document, document['@context']);

        if (!(DIDHelper.verifyProof(doc))) {
            return res.status(400).send({
                status: "fail",
                message: "Invalid DID signature"
            });
        }

        try {
            let result = await DbManager.saveDoc(doc);
            await DbManager.saveLookup(publicDid, doc);
            
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