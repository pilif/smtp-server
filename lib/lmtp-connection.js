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

LMTPConnection.prototype.handler_DATA = function (command, callback) {
    if (!this.session.envelope.rcptTo.length) {
        this.send(503, 'Error: need RCPT command');
        return callback();
    }

    if(!this._parser){
        return callback();
    }

    this._dataStream = this._parser.startDataMode(this._server.options.size);

    var handle_results = function (err, per_recipient_result) {
        this._server.logger.debug('[%s] C: <%s bytes of DATA>', this._id, this._parser.dataBytes);
        if ((typeof this._dataStream === 'object') && (this._dataStream) && (this._dataStream.readable)) {
            this._dataStream.removeAllListeners();
        }

        this.session.envelope.rcptTo.forEach(function(recipient, idx){
            var recipient_addr = recipient.address;
            var result = per_recipient_result[recipient];

            if (!result){
                this.send(450, "<"+recipient_addr+"> unspecified error");
                return;
            }
            var error = result[0];
            if (error){
                this.send(error.responseCode || 450, "<" + recipient_addr + "> " + error.message);
            }else{
                this.send(250, result[1] || "OK");
            }
        }.bind(this));

        this._transactionCounter++;

        this._unrecognizedCommands = 0; // reset unrecognized commands counter
        this._resetSession(); // reset session state

        if ((typeof this._parser === 'object') && (this._parser)) {
            this._parser.continue();
        }
    }.bind(this);

    this._server.onData(this._dataStream, this.session, function (err, per_recipient_result) {
        // ensure _dataStream is an object and not set to null by premature closing
        // do not continue until the stream has actually ended
        if ((typeof this._dataStream === 'object') && (this._dataStream) && (this._dataStream.readable)) {
            this._dataStream.on('end', function () {
                handle_results(err, per_recipient_result);
            });
            return;
        }
        handle_results(err, per_recipient_result);
    }.bind(this));

    this.send(354, 'End data with <CR><LF>.<CR><LF>');
    callback();
};
