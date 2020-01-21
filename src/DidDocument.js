import Axios from 'axios';

let { DIDDocument } = require('did-document');

/**
 * Load a DID Document from the server
 */
DIDDocument.prototype.load = async function() {
    let did = this.id;

    // TODO: Load DID document from server
    let HOST = 'http://localhost:5001/';

    let response = await Axios.get(HOST + 'load?did=' + did);
    let document = response.data.data.document;
    let doc = new DIDDocument(document, document['@context']);
    return doc;

    
}

/**
 * Save a DID Document to the server
 */
DIDDocument.prototype.commit = async function(didDocument) {
    let HOST = 'http://localhost:5001/';
    try {
        let response = await Axios.post(HOST + 'commit', {
            params: {
                document: didDocument
            }
        });

        return true;
    } catch (err) {
        if (typeof err.response.data == 'object' && err.response.data.status == 'fail') {
            throw new Error(err.response.data.message);
        }

        throw err;
    }
}

export default DIDDocument;