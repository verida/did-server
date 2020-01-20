let { DIDDocument } = require('did-document');

DIDDocument.load = function(did) {
    console.log(did);
}

DIDDocument.commit = function(didDocument) {
    console.log(didDocument);
}

export default DIDDocument;