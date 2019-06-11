"use strict";
/**
 * Implement storage in flat files.
 * NOTE: This is great for development on non PII data so you can view the data.
 * However, storing data anywhere  unencoded or encrypted is naughty because
 * application password management is the same as user based (vs role based).  Look up RBAC vs ACL.
 * You can encrypt based on a field OR the entire record... Maybe I'll show this in another
 * example.
 *
 * The strategy here is to have a directory for users and directory for conversations.
 * User data is stored in the user directory with the filename of the userId.
 * Conversation data is stored in the conversation diretory with the filename of the conversationId.
 * There is an opportunity to add a data retention policy outside of this (for example, a cron job that deletes
 * any files older than 6 months.)
 */
//var zlib = require('zlib'); // great way to add security...
var fs = require('fs');

Object.defineProperty(exports, "__esModule", {value: true});
var BotFileStorage = (function () {
    var path = '.'; // default to cwd
    var err = undefined;

    // make sure the directories exist
    function BotFileStorage(_path) {
        console.log("BotFileStorage");
        if (_path) {
            path = _path.replace(/\/+$/, ""); // get rid of any tailing /
        }
        try {
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
            if (!fs.existsSync(path + '/userdata')) {
                fs.mkdirSync(path + '/userdata');
            }
            if (!fs.existsSync(path + '/convdata')) {
                fs.mkdirSync(path + '/convdata');
            }
        } catch (err) {
            this.err = err;
            console.error( err );
        }
    }

    // read persisted data
    BotFileStorage.prototype.getData = function (context, callback) {
        console.log("getData");
        var data = {};
        err = undefined;
        if (context.userId) {
            if (context.persistUserData) {
                // return user data
                if (fs.existsSync(path + '/userdata/' + context.userId)) {
                    try {
                        data.userData = JSON.parse(fs.readFileSync(path + '/userdata/' + context.userId));
                    } catch (err) {
                        this.err = err;
                        data.userData = null;
                        console.error( err );
                    }
                }
                else {
                    data.userData = null;
                }
            }
            // return private conversation data
            if (context.conversationId) {
                var key = context.userId + '_' + context.conversationId;
                if (fs.existsSync(path + '/userdata/' + key)) {
                    try {
                        data.privateConversationData = JSON.parse(fs.readFileSync(path + '/userdata/' + key));
                    } catch (err) {
                        this.err = err;
                        data.privateConversationData = null;
                        console.error( err );
                    }
                }
                else {
                    data.privateConversationData = null;
                }
            }
        } // seems odd not to null out data if no user
        if (context.persistConversationData && context.conversationId) {
            if (fs.existsSync(path + '/convdata/' + context.conversationId)) {
                try {
                    data.conversationData = JSON.parse(fs.readFileSync(path + '/convdata/' + context.conversationId));
                } catch (err) {
                    this.err = err;
                    data.conversationData = null;
                    console.error( err );
                }
            }
            else {
                data.conversationData = null;
            }
        } // seems odd not to null out data if no conversation
        callback(null, data);
    };

    // persist data
    BotFileStorage.prototype.saveData = function (context, data, callback) {
        console.log("saveData");
        err = undefined;
        if (context.userId) {
            if (context.persistUserData) {
                try {
                    fs.writeFileSync(path + '/userdata/' + context.userId, JSON.stringify(data.userData || {}));
                } catch (err) {
                    this.err = err;
                    console.error( err );
                }
            }
            if (context.conversationId) {
                try {
                    var key = context.userId + '_' + context.conversationId;
                    fs.writeFileSync(path + '/userdata/' + key, JSON.stringify(data.privateConversationData || {}));
                } catch (err) {
                    this.err = err;
                    console.error( err );
                }
            }
        }
        if (context.persistConversationData && context.conversationId) {
            try {
                fs.writeFileSync(path + '/convdata/' + context.conversationId, JSON.stringify(data.conversationData || {}));
            } catch (err) {
                this.err = err;
                console.error( err );
            }
        }
        callback(null);
    };

    // delete data
    BotFileStorage.prototype.deleteData = function (context) {
        console.log("delete");
        err = undefined;
        if (context.userId) {
            if (context.conversationId) {
                if (fs.existsSync(path + '/convdata/' + context.conversationId)) {
                    try {
                        fs.unlinkSync(path + '/convdata/' + context.conversationId);
                    } catch (err) {
                        this.err = err;
                        console.error( err );
                    }
                }
            }
            else {
                var files = fs.readdirSync(path + '/userdata')
                for (var key in files) {
                    if (key.indexOf(context.userId) === 0) {
                        try {
                            fs.unlinkSync(path + '/userdata/' + key);
                        } catch (err) {
                            this.err = err;
                            console.error( err );
                        }
                    }
                }
            }
        }
    };

    return BotFileStorage;
}());
exports.BotFileStorage = BotFileStorage;
