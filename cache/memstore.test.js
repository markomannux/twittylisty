const fs = require('fs');
const memstore = require('./memstore');
const rimraf = require('rimraf');

afterAll((done) => {
    ensureStoredataDirIsEmpty(done)
})

function ensureStoredataDirIsEmpty(done) {
    rimraf('storedata', done);
}

test('I can insert a new key in the store', async () => {
    const data = await memstore.set('test-key', 'test-value')
    expect(data).toBe('test-value');
})

test('I can get a key present in the store', async () => {
    await memstore.set('test-key', 'test-value');
    const data = await memstore.get('test-key');
    expect(data).toBe('test-value');
})

test('Non existant keys return undefined', async () => {
    const data = await memstore.get('non-existant-key');
    expect(data).toBeUndefined();
})

test('I can add an object', async () => {
    const testObject = {
        a: "I'm an object"
    }
    await memstore.set('test-key', testObject);
    const data = await memstore.get('test-key');
    expect(data).toEqual(testObject);
})

test('I can specify a TTL for the key', async () => {
    await memstore.set('test-key', 'test-value', 2000);
    const data = await memstore.ttl('test-key');
    expect(data).toBeLessThan(2000);
})

test('When no TTL is defined, ttl returns -1', async () => {
    await memstore.set('test-key', 'test-value');
    const data = await memstore.ttl('test-key');
    expect(data).toBe(-1);
})

test('After ttl key is removed from store', async () => {
    jest.useFakeTimers();
    await memstore.set('test-key', 'test-value', 2000);
    jest.runAllTimers();
    const data = await memstore.get('test-key');
    expect(data).toBeUndefined();
})

test('I can modify the value of an existing key', async () => {
    await memstore.set('test-key', 'test-value');
    await memstore.set('test-key', 'test-value2');
    const data = await memstore.get('test-key')
    expect(data).toBe('test-value2');
})

test('Updated key should invalidate previous ttl', async () => {
    jest.useFakeTimers();
    await memstore.set('test-key', 'test-value', 2000);
    await memstore.set('test-key', 'test-value2');
    jest.runAllTimers();
    const data = await memstore.get('test-key')
    expect(data).toBe('test-value2');
})

test('Entry data is stored to disk', async () => {
    await memstore.set('test-string', 'test-value');
    fs.readFile('storedata/test-string', 'utf8', (err, data) => {
    if (err) throw err;
        expect(data).toBe(JSON.stringify('test-value'));
    });
})

test('Object data is serialized to JSON on disk', async () => {
    const testObject = {
        a: "I'm an object"
    }
    await memstore.set('test-object', testObject);
    fs.readFile('storedata/test-object', 'utf8', (err, data) => {
    if (err) throw err;
        expect(data).toBe(JSON.stringify(testObject));
    });
})

test('On ttl expired data is removed from disk', async () => {
    jest.useFakeTimers();
    await memstore.set('test-key', 'test-value', 2000);
    jest.runAllTimers();
    setTimeout(() => {
        expect(fs.existsSync('storedata/test-key')).toBe(false);
    }, 100);
})

test('I can delete a key', async () => {
    await memstore.set('test-key-123', 'test-value');
    await memstore.del('test-key-123')
    const data = await memstore.get('test-key');
    expect(data).toBeUndefined();
})

test('Deleted key is removed from disk', async () => {
    await memstore.set('test-key', 'test-value');
    await memstore.del('test-key')
    setTimeout(() => {
        expect(fs.existsSync('storedata/test-key')).toBe(false);
    }, 100);
})

// TODO: randomize keys to avoid test overlap

//test('I can clear all the cache', async () => {
//    const testObject = {
//        a: "I'm an object"
//    }
//    await memstore.set('test-object', testObject);
//    await memstore.set('test-key', 'test-key');
//    await memstore.clear();
//    expect(memstore.get('test-object', null));
//    expect(memstore.get('test-key', null));
//})