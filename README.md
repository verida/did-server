# Verida DID Server

@todo

See [ARCHITECTURE.md](https://github.com/verida/did-server/blob/main/ARCHITECTURE.md) for some documentation. 

## Usage

* Install CouchDB locally
* Set the server to point to the local database

```bash
cp sample.env .env
```
* Edit `.env` appropriatly. You will probably need to set `DB_PROTOCOL`, `DB_USER` and `DB_PASS` 
* In the CouchDB Fauxton interface (probably http://127.0.0.1:5984/_utils/#/) create databases with the names set in `DB_DOC_NAME` and `DB_LOOKUP_NAME`

* Start the server:

```bash 
yarn install
yarn start
```

## Test installation

In the `./testdocs` directory there is a sample DID document and bash command to insert it into the DB. This is a good way to verify the server is working:

```bash
cd ./testdocs
./create_doc.sh
./get_doc.sh
./test_cases.sh
```



