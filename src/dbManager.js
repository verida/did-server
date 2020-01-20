const CouchDb = require('nano');

class DbManager {

    async saveDoc(didDocument) {
        let couch = this._getCouch();
        let db = couch.db.use(process.env.DB_NAME);

        return await db.insert({
            "_id": didDocument.id,
            "doc": didDocument.toJson()
        });
    }

    async loadDoc(did) {
        let couch = this._getCouch();
        let db = couch.db.use(process.env.DB_NAME);

        return await db.get(didDocument.id);
    }

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