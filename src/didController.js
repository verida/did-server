import DbManager from './dbManager';
import { DIDDocument } from 'did-document';
import DIDHelper from '@verida/did-helper';

class DidController {

    /**
     * Load a VID document from a VID
     * @param {*} req 
     * @param {*} res 
     */
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

    /**
     * Load a VID document from a DID and Application name
     * @param {*} req 
     * @param {*} res 
     */
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

    /**
     * Get the DID associated with a VID
     * 
     * @param {*} req 
     * @param {*} res 
     */
    async getDidFromVid(req, res) {
        let vid = req.query.vid;

        let did = await DbManager.getDidFromVid(vid);

        if (did) {
            res.status(200).send({
                status: "success",
                data: {
                    did: did
                }
            });
        } else {
            return res.status(400).send({
                status: "fail",
                data: {
                    did: "Invalid VID or not found"
                }
            });
        }
    }

    /**
     * Save a VID document
     * 
     * @param {*} req 
     * @param {*} res 
     */
    async commit(req, res) {
        let document = req.body.params.document;
        let publicDid = req.body.params.did.toLowerCase();
        let signature = req.body.params.signature;

        let doc = new DIDDocument(document, document['@context']);

        let applicationService = doc.service.find(entry => entry.type.includes("verida.Application"));
        let appName = applicationService.description;

        let validSig = await DidController.verifyAppSignature(appName, publicDid, signature);

        if (!validSig) {
            return res.status(400).send({
                status: "fail",
                message: "Invalid DID consent signature"
            });
        }

        if (!DIDHelper.verifyProof(doc)) {
            return res.status(400).send({
                status: "fail",
                message: "Invalid DID document signature"
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

    static async verifyAppSignature(appName, did, signature) {
        let message = "Do you approve access to view and update \""+appName+"\"?\n\n" + did;
        return DIDHelper.verifySignedMessage(did, message, signature);
    }

}

const didController = new DidController();
export default didController;