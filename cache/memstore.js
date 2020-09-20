const store = { }

function handleTtlExpired(entry) {
    return function() {
        delete store[entry.key];
    }
}

function StoreEntry(key, value, ttl) {
    this.key = key;
    this.value = value;

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

function add(key, value, ttl) {
    store[key] = new StoreEntry(key, value, ttl);
    return new Promise((resolve, reject) => {
        resolve(value);
    });
}

function get(key) {
    const data = store[key];
    return new Promise((resolve, reject) => {
        resolve(data && data.value);
    });
}

function ttl(key) {
    return new Promise((resolve, reject) => {
        const left = store[key].ttl();
        resolve(left);
    });
}

module.exports = {
    add,
    get,
    ttl
}
