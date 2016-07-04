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
    // RFC 2033 - Section 5:
    //    A server implementation MUST implement the PIPELINING
    //    and ENHANCEDSTATUSCODES ESMTP extensions.
    options.announceEnhancedStatus = true;
    SMTPServer.call(this, options);
}

util.inherits(LMTPServer, SMTPServer);

LMTPServer.prototype._createConnection = function(socket){
    return new LMTPConnection(this, socket);
};
