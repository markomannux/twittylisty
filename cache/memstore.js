
const fs = require('fs');
const store = { }

if(!fs.existsSync('storedata')) {
    fs.mkdirSync('storedata', {});
}

function handleTtlExpired(entry) {
    return function() {
        delete store[entry.key];
        fs.unlink(`storedata/${entry.key}`, (err) => {
            if (err) {
                throw err;
            }
        })
    }
}

function StoreEntry(key, value, ttl) {
    this.key = key;
    this._value = JSON.stringify(value);
    this.getValue = () => JSON.parse(this._value);

    this.invalidateTtl = () => {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    if (ttl) {
        this.initialTtl = ttl;
        this.start = performance.now();
        this.timer = setTimeout(handleTtlExpired(this), ttl)
        this.ttl = () => {
            return this.initialTtl - (performance.now() - this.start);
        }
    } else {
        this.ttl = () => -1;
    }
};

function set(key, value, ttl) {
    if (store[key]) {
        store[key].invalidateTtl();
    }
    store[key] = new StoreEntry(key, value, ttl);
    return new Promise((resolve, reject) => {
        const entryValue = store[key].getValue();
        fs.writeFile(`storedata/${key}`, store[key]._value,  (err, data) => {
            resolve(entryValue);
        })
    });
}

function get(key) {
    const data = store[key];
    return new Promise((resolve, reject) => {
        resolve(data && data.getValue());
    });
}

function ttl(key) {
    return new Promise((resolve, reject) => {
        const left = store[key].ttl();
        resolve(left);
    });
}

module.exports = {
    set,
    get,
    ttl
}
