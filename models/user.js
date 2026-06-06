const db = require('../db');

db.users.ensureIndex({ fieldName: 'username', unique: true }, () => {});
db.users.ensureIndex({ fieldName: 'email', unique: true }, () => {});

function normalizeId(id) {
    if (!id) return null;
    if (typeof id === 'object' && id._id !== undefined) return String(id._id);
    return String(id);
}

function preprocessQuery(query) {
    if (!query || typeof query !== 'object' || Array.isArray(query)) return query;
    const result = {};
    for (const [key, val] of Object.entries(query)) {
        if ((key === '$or' || key === '$and') && Array.isArray(val)) {
            result[key] = val.map(preprocessQuery);
        } else if (val && typeof val === 'object' && val.$regex !== undefined && typeof val.$regex === 'string') {
            result[key] = { $regex: new RegExp(val.$regex, val.$options || '') };
        } else {
            result[key] = val;
        }
    }
    return result;
}

// Supports .populate({ path, select }) chaining then await
class UserQuery {
    constructor(promise) {
        this._promise = promise;
        this._populateConfig = null;
    }

    populate(config) {
        this._populateConfig = config;
        return this;
    }

    then(onFulfilled, onRejected) {
        const p = this._promise.then(async (user) => {
            if (!user || !this._populateConfig) return user;
            const { path: fieldPath, select } = this._populateConfig;
            const ids = user[fieldPath] || [];
            const selectFields = select ? select.split(' ').filter(Boolean) : null;
            const populated = await Promise.all(ids.map(async (id) => {
                const doc = await db.users.findOneAsync({ _id: String(id) });
                if (!doc) return null;
                if (!selectFields) return doc;
                const out = {};
                selectFields.forEach(f => { if (doc[f] !== undefined) out[f] = doc[f]; });
                return out;
            }));
            return { ...user, [fieldPath]: populated.filter(Boolean) };
        });
        return p.then(onFulfilled, onRejected);
    }

    catch(onRejected) { return this.then(null, onRejected); }
}

// Supports .select().limit().lean() chaining then await
class FindQuery {
    constructor(query) {
        this._query = query;
        this._fields = null;
        this._limitNum = null;
    }

    select(fields) {
        this._fields = typeof fields === 'string' ? fields.split(' ').filter(Boolean) : null;
        return this;
    }

    limit(n) { this._limitNum = n; return this; }
    lean() { return this; }

    then(onFulfilled, onRejected) {
        const p = db.users.findAsync(preprocessQuery(this._query)).then(docs => {
            let result = docs;
            if (this._limitNum !== null) result = result.slice(0, this._limitNum);
            if (this._fields) {
                result = result.map(doc => {
                    const out = { _id: doc._id };
                    this._fields.forEach(f => { if (doc[f] !== undefined) out[f] = doc[f]; });
                    return out;
                });
            }
            return result;
        });
        return p.then(onFulfilled, onRejected);
    }

    catch(onRejected) { return this.then(null, onRejected); }
}

function User(data) {
    Object.assign(this, data);
}

User.prototype.save = async function () {
    const data = Object.assign({}, this);
    const doc = await db.users.insertAsync(data);
    Object.assign(this, doc);
    return this;
};

User.findById = function (id) {
    const realId = normalizeId(id);
    if (!realId) return new UserQuery(Promise.resolve(null));
    return new UserQuery(db.users.findOneAsync({ _id: realId }));
};

User.findOne = function (query) {
    return db.users.findOneAsync(preprocessQuery(query));
};

User.find = function (query) {
    return new FindQuery(query || {});
};

User.findByIdAndUpdate = async function (id, update) {
    const realId = normalizeId(id);
    if (!realId) return null;
    const hasOps = Object.keys(update).some(k => k.startsWith('$'));
    const actualUpdate = hasOps ? update : { $set: update };
    await db.users.updateAsync({ _id: realId }, actualUpdate, {});
    return db.users.findOneAsync({ _id: realId });
};

User.findByIdAndDelete = async function (id) {
    const realId = normalizeId(id);
    if (!realId) return null;
    return db.users.removeAsync({ _id: realId }, {});
};

module.exports = User;
