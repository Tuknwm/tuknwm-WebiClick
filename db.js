const Datastore = require('@seald-io/nedb');

module.exports = {
    users: new Datastore(),
    scores: new Datastore(),
    chats: new Datastore(),
};
