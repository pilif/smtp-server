var util = require('util');
var SMTPServer = require('./smtp-server').SMTPServer;
var LMTPConnection = require('./lmtp-connection').LMTPConnection;

module.exports.LMTPServer = LMTPServer;

/**
 * Creates a LMTP server instance.
 *
 * @constructor
 * @param {Object} options Connection and SMTP options
 */
function LMTPServer(options) {
    SMTPServer.call(this, options);
}

util.inherits(LMTPServer, SMTPServer);

LMTPServer.prototype._createConnection = function(socket){
    return new LMTPConnection(this, socket);
};
