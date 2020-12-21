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