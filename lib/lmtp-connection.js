'use strict';

var util = require('util');
var SMTPConnection = require('./smtp-connection').SMTPConnection;

module.exports.LMTPConnection = LMTPConnection;

function LMTPConnection(server, socket) {
    SMTPConnection.call(this, server, socket);

    this.protocolName = "LMTP";
}
util.inherits(LMTPConnection, SMTPConnection);


LMTPConnection.prototype.handler_LHLO = SMTPConnection.prototype.handler_EHLO;

LMTPConnection.prototype.handler_EHLO = function(command, callback){
    this.send(500, 'Error: command not recognized');
    this._unrecognizedCommands++;
    callback();
};

LMTPConnection.prototype.handler_HELO = LMTPConnection.prototype.handler_EHLO;
