import DbManager from './dbManager';
import { DIDDocument } from 'did-document';

class DidController {

    /**
     * Load a DID document from a DID
     * 
     * @param {*} req 
     * @param {*} res 
     */
    async load(req, res) {
        let did = req.query.did;

        try {
            let doc = await DbManager.loadDoc(did);
            
            if (doc) {
                return res.status(200).send({
                    status: "success",
                    data: {
                        document: doc.doc
                    }
                })
            } else {
                return res.status(400).send({
                    status: "fail",
                    data: {
                        did: "Invalid DID or not found"
                    }
                });
            }
        } catch (err) {
            if (err.reason == 'missing' || err.reason == 'deleted') {
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

    /**
     * Save a DID document
     * 
     * @param {*} req 
     * @param {*} res 
     */
    async commit(req, res) {
        let document = req.body.params.document;
        let publicDid = req.body.params.did.toLowerCase();
        let signature = req.body.params.signature;

        let doc = new DIDDocument(document, document['@context']);

        let applicationService = doc.service.find(entry => entry.type.includes("verida.StorageServer"));
        let appName = applicationService.description;

        let validSig = await DidController.verifyAppSignature(appName, publicDid, signature);

        if (!validSig) {
            return res.status(400).send({
                status: "fail",
                message: "Invalid DID consent signature"
            });
        }

        // todo -- use appropriate did connection instances
        /*if (!DIDHelper.verifyProof(doc)) {
            return res.status(400).send({
                status: "fail",
                message: "Invalid DID document signature"
            });
        }*/

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

    static async verifyAppSignature(appName, did, signature) {
        return true;
        // @ todo
        //let message = "Do you approve access to view and update \""+appName+"\"?\n\n" + did;
        //return DIDHelper.verifySignedMessage(did, message, signature);
    }

}

const didController = new DidController();
export default didController;