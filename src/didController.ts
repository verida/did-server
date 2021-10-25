import DbManager from './dbManager'
import { DIDDocument } from 'did-resolver'
import { Request, Response } from 'express'
import { DbDIDDocument } from './interfaces'

export default class DidController {

    /**
     * Load a DID Document
     * @param {*} req 
     * @param {*} res 
     */
    public static async load(req: Request, res: Response) {
        const did = String(req.query.did)

        try {
            const doc: DbDIDDocument = await DbManager.loadDoc(did)

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
                })
            }

            throw err;
        }
    }

    /**
     * Save a DID Document
     * 
     * @param {*} req 
     * @param {*} res 
     */
    public static async commit(req: Request, res: Response) {
        const document: DIDDocument = req.body.params.document
        const publicDid = req.body.params.did.toLowerCase()
        const signature = req.body.params.signature

        //let doc = new DIDDocument(document, document['@context']);

        /*
        let applicationService = doc.service.find(entry => entry.type.includes("verida.Application"));
        let appName = applicationService.description;
        */

        let validSig = await DidController.verifySignature(document, publicDid, signature)

        if (!validSig) {
            return res.status(400).send({
                status: "fail",
                message: "Invalid DID consent signature"
            });
        }

        /*if (!DIDHelper.verifyProof(doc)) {
            return res.status(400).send({
                status: "fail",
                message: "Invalid DID document signature"
            });
        }*/

        try {
            const result = await DbManager.saveDoc(document)
            
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

    public static async verifySignature(doc: DIDDocument, did: string, signature: string): Promise<Boolean> {
        /*let message = "Do you approve access to view and update \""+appName+"\"?\n\n" + did;
        return DIDHelper.verifySignedMessage(did, message, signature);*/
        return true
    }

}