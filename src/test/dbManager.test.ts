import DbManager from '../dbManager'

it('should create dns from username and password', () => {
    const dns = DbManager.buildDsn('root', 'password')
    expect(dns).toBe('https://root:password@couchdb.localhost:5984')
});