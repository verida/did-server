import CouchDb from 'nano';

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
        let db = couch.db.use(process.env.DB_NAME);

        let data = {
            "_id": doc.id,
            "doc": doc
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

        return await db.insert(data);
    }

    /**
     * Load a document from  the database
     * 
     * @param {string} did 
     */
    async loadDoc(did) {
        let couch = this._getCouch();
        let db = couch.db.use(process.env.DB_NAME);

        let response = await db.get(did);
        return response;
    }

    /**
     * Ensure the DID Document Database exists
     * 
     * (Executed on server startup)
     */
    async ensureDb() {
        let couch = this._getCouch();
        
        try {
            let response = await ouch.db.create(process.env.DB_NAME);
            console.log("Created database");
        } catch (err) {
            console.log("Database existed");
        }

        return true;
    }

    /**
     * Instantiate a CouchDB instance
     */
    _getCouch() {
        let dsn = this.buildDsn(process.env.DB_USER, process.env.DB_PASS);

        if (!this._couch) {
            this._couch = new CouchDb(dsn);
        }

        return this._couch;
    }

    buildDsn(username, password) {
        let env = process.env;
        return env.DB_PROTOCOL + "://" + username + ":" + password + "@" + env.DB_HOST + ":" + env.DB_PORT;
    }

}

let dbManager = new DbManager();
export default dbManager;