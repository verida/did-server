let { DIDDocument } = require('did-document');

DIDDocument.prototype.load = async function(did) {
    // TODO: Load DID document from server
    return true;
}

DIDDocument.prototype.commit = async function(didDocument) {
    // TODO: Save DID document to server
    return true;
}

export default DIDDocument;