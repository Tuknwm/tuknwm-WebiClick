const db = require('../db');

// Supports .sort() chaining then await — returns array
class ChatFindQuery {
    constructor(query) {
        this._query = query;
        this._sortObj = null;
    }

    sort(obj) { this._sortObj = obj; return this; }

    then(onFulfilled, onRejected) {
        const p = db.chats.findAsync(this._query).then(docs => {
            if (this._sortObj) {
                const [key, dir] = Object.entries(this._sortObj)[0];
                docs.sort((a, b) => {
                    if (a[key] < b[key]) return dir === -1 ? 1 : -1;
                    if (a[key] > b[key]) return dir === -1 ? -1 : 1;
                    return 0;
                });
            }
            return docs;
        });
        return p.then(onFulfilled, onRejected);
    }

    catch(onRejected) { return this.then(null, onRejected); }
}

function Chat(data) {
    Object.assign(this, data);
}

Chat.prototype.save = async function () {
    const data = Object.assign({}, this);
    if (!data.createdAt) data.createdAt = new Date();
    if (data.read === undefined) data.read = false;
    const doc = await db.chats.insertAsync(data);
    Object.assign(this, doc);
    return this;
};

Chat.find = function (query) {
    return new ChatFindQuery(query || {});
};

Chat.deleteMany = async function (query) {
    const count = await db.chats.removeAsync(query, { multi: true });
    return { deletedCount: count };
};

module.exports = Chat;
