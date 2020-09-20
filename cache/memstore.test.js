const memstore = require('./memstore');

test('I can insert a new key in the store', async () => {
    const data = await memstore.add('test-key', 'test-value')
    expect(data).toBe('test-value');
})

test('I can get a key present in the store', async () => {
    await memstore.add('test-key', 'test-value');
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
    await memstore.add('test-key', testObject);
    const data = await memstore.get('test-key');
    expect(data).toBe(testObject);
})

test('I can specify a TTL for the key', async () => {
    await memstore.add('test-key', 'test-value', 2000);
    const data = await memstore.ttl('test-key');
    expect(data).toBeLessThan(2000);
})

test('When no TTL is defined, ttl returns -1', async () => {
    await memstore.add('test-key', 'test-value');
    const data = await memstore.ttl('test-key');
    expect(data).toBe(-1);
})

test('After ttl key is removed from store', async () => {
    jest.useFakeTimers();
    await memstore.add('test-key', 'test-value', 1000);
    jest.runAllTimers();
    const data = await memstore.get('test-key');
    expect(data).toBeUndefined();
})