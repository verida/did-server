import CouchDb from 'nano';
import crypto from 'crypto';

class DbManager {

    /**
     * Save a DID Document to the database.
     * 
     * Update existing document if it exists.
     * 
     * @param {DIDDocument} doc 
     */
    async saveDoc(doc) {
        let couch = this._getCouch();
        let db = couch.db.use(process.env.DB_DOC_NAME);

        let data = {
            _id: doc.id,
            doc: doc
        };

        // try to find the existing doc
        try {
            let existingDoc = await db.get(doc.id);

            if (existingDoc) {
                data._rev = existingDoc._rev;
            }
        } catch (err) {
            // Document may not be found, so continue
            if (err.error != 'not_found') {
                // If an unknown error, then send to error log
                console.error(err);
            }
        }

        let response = await db.insert(data);
        return response;
    }

    /**
     * Load a document from the database
     * 
     * @param {string} vid 
     */
    async loadDoc(vid) {
        let couch = this._getCouch();
        let db = couch.db.use(process.env.DB_DOC_NAME);

        return await db.get(vid);
    }

    async lookupForApp(did, appName) {
        let couch = this._getCouch();
        let db = couch.db.use(process.env.DB_LOOKUP_NAME);
        let hash = this._buildHash(did, appName);
        return await db.get(hash);
    }

    /**
     * Get a DID from a VID
     * 
     * @param {*} did 
     * @param {*} appName 
     */
    async getDidFromVid(vid) {
        let couch = this._getCouch();
        let db = couch.db.use(process.env.DB_LOOKUP_NAME);
        let result = await db.find({
            selector: {
                vid: vid
            }
        });

        if (result.docs.length) {
            return result.docs[0].did;
        }
    }

    async saveLookup(did, doc) {
        let couch = this._getCouch();
        let db = couch.db.use(process.env.DB_LOOKUP_NAME);

        let appService = doc.service.find(entry => entry.type.includes('verida.Application'));
        let appName = appService.description;
        let hash = this._buildHash(did, appName);

        let data = {
            _id: hash,
            application: appName,
            did: did,
            vid: doc.id
        };

        // try to find the existing doc
        try {
            let existingDoc = await db.get(data._id);

            if (existingDoc) {
                data._rev = existingDoc._rev;
            }
        } catch (err) {
            // Document may not be found, so continue
            if (err.error != 'not_found') {
                // If an unknown error, then send to error log
                console.error(err);
            }
        }

        let response = await db.insert(data);
        return true;
    }

    /**
     * Link a username to an `ethr` or `vet` DID
     * 
     * @param {*} username Username to be linked to the DID
     * @param {*} did DID to be linked to the username
     * @param {*} sig Signature of the string `Setting username to <username>` signed by the address
     */
    async commitUsername(username, did, sig) {
        // @todo add validation of username (lowercase, _, -, az09)

        username = username.toLowerCase();
        did = did.toLowerCase();

        let couch = this._getCouch();
        let db = couch.db.use(process.env.DB_USERNAME_NAME);
        let regex = /^did\:(ethr|vet)/i;

        if (!regex.exec(did)) {
            throw new Error("Invalid DID: Must be an Ethereum or Vechain DID.");
        }

        let data = {
            _id: username,
            did: did,
            proof: sig
        }

        // Delete the username for this DID if it already exists
        let result = await db.find({
            selector: {
                did: did
            }
        });

        if (result.docs.length) {
            await db.destroy(result.docs[0]._id, result.docs[0]._rev);
        }

        // Link username and DID
        return db.insert(data);
    }

    async getDidFromUsername(username) {
        username = username.toLowerCase();

        let couch = this._getCouch();
        let db = couch.db.use(process.env.DB_USERNAME_NAME);
        return db.get(username);
    }

    /**
     * Ensure the DID Document Database exists
     * 
     * (Executed on server startup)
     */
    async ensureDb(dbName) {
        let couch = this._getCouch();
        
        try {
            await couch.db.create(dbName);
            console.log("Created database: "+dbName);
        } catch (err) {
            console.log("Database existed: "+dbName);
        }

        if (dbName == process.env.DB_LOOKUP_NAME) {
            let db = couch.db.use(process.env.DB_LOOKUP_NAME);
            await db.createIndex({
                index: {
                    fields: ["vid"]
                },
                name: "vid"
            });
            await db.createIndex({
                index: {
                    fields: ["did", "application"]
                },
                name: "did-application"
            });
        }

        if (dbName == process.env.DB_USERNAME_NAME) {
            let db = couch.db.use(process.env.DB_USERNAME_NAME);
            await db.createIndex({
                index: {
                    fields: ["did"]
                },
                name: "did"
            });
        }

        return true;
    }

    /**
     * Instantiate a CouchDB instance
     */
    _getCouch() {
        let dsn = this.buildDsn(process.env.DB_USER, process.env.DB_PASS);

        if (!this._couch) {
            this._couch = new CouchDb({
                url: dsn,
                requestDefaults: {
                    rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED_SSL.toLowerCase() != "false"
                }
            });
        }

        return this._couch;
    }

    buildDsn(username, password) {
        let env = process.env;
        return env.DB_PROTOCOL + "://" + username + ":" + password + "@" + env.DB_HOST + ":" + env.DB_PORT;
    }

    _buildHash(did, appName) {
        let hash = crypto.createHmac('sha256', process.env.HASH);
        hash.update(did + appName);

        return hash.digest('hex');
    }

}

let dbManager = new DbManager();
export default dbManager;