import DbManager from './dbManager';
import DIDHelper from '@verida/did-helper';

class UsernameController {

    /**
     * Load a VID document from a VID
     * @param {*} req 
     * @param {*} res 
     */
    async getDidFromUsername(req, res) {
        let username = req.query.username;

        try {
            let doc = await DbManager.getDidFromUsername(username);

            return res.status(200).send({
                status: "success",
                data: {
                    did: doc.did
                }
            });
        } catch (err) {
            if (err.error == "not_found") {
                return res.status(400).send({
                    status: "fail",
                    data: {
                        did: "Username name found"
                    }
                });
            }

            throw err;
        }
    }    

    /**
     * Save a VID document
     * 
     * @param {*} req 
     * @param {*} res 
     */
    async commit(req, res) {
        let username = req.body.params.username.toLowerCase();
        let did = req.body.params.did.toLowerCase();
        let sig = req.body.params.signature;

        let validSig = await UsernameController.verifyUsernameSignature(username, did, sig);

        if (!validSig) {
            return res.status(400).send({
                status: "fail",
                message: "Invalid username consent signature"
            });
        }

        try {
            let result = await DbManager.commitUsername(username, did, sig);
            if (!result) {
                return res.status(400).send({
                    status: "fail",
                    message: "Unknown error occurred committing username"
                });
            }
            
            return res.status(200).send({
                status: "success",
                data: {
                    username: username,
                    did: did
                }
            });
        } catch (err) {
            return res.status(400).send({
                status: "fail",
                message: err.reason
            });
        }
    }

    static async verifyUsernameSignature(username, did, signature) {
        let message = "Set my username to " + username + " for DID " + did;
        return DIDHelper.verifySignedMessage(did, message, signature);
    }

}

const usernameController = new UsernameController();
export default usernameController;