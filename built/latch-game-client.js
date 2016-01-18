var net = require('net');
var MessagesEnum;
(function (MessagesEnum) {
    MessagesEnum[MessagesEnum["CLIENT_CONNECTION_ACCEPTED"] = 0] = "CLIENT_CONNECTION_ACCEPTED";
    MessagesEnum[MessagesEnum["PARSE_ERROR"] = 1] = "PARSE_ERROR";
    MessagesEnum[MessagesEnum["UNLATCH_EVERYONE"] = 2] = "UNLATCH_EVERYONE";
    MessagesEnum[MessagesEnum["LATCH_SELF"] = 3] = "LATCH_SELF";
    MessagesEnum[MessagesEnum["LATCH_SUCCESS"] = 4] = "LATCH_SUCCESS";
    MessagesEnum[MessagesEnum["LATCH_FAILURE"] = 5] = "LATCH_FAILURE";
    MessagesEnum[MessagesEnum["UNLATCH_SUCCESS"] = 6] = "UNLATCH_SUCCESS";
    MessagesEnum[MessagesEnum["REPORT"] = 8] = "REPORT";
    MessagesEnum[MessagesEnum["MYLATCHSTATUS"] = 9] = "MYLATCHSTATUS";
    MessagesEnum[MessagesEnum["LATCHED"] = 10] = "LATCHED";
    MessagesEnum[MessagesEnum["UNLATCHED"] = 11] = "UNLATCHED";
})(MessagesEnum || (MessagesEnum = {}));
;
var serverAddress = '127.0.0.1';
var serverPort = 3000;
var messageDelim = '\n';
var rawMessages = [];
var socket = net.connect(serverPort, serverAddress, function () {
    console.log('connected');
    var buf = "";
    socket.on('data', function (d) {
        buf += d;
        var newMessages = buf.split(/\n/gm);
        buf = newMessages.pop();
        rawMessages = rawMessages.concat(newMessages);
    });
});
function sendMessage(m) {
    socket.write(m + messageDelim);
}
setInterval(function () {
    try {
        console.log(rawMessages.length);
        rawMessages.map(function (m) { return JSON.parse(m); }).forEach(function (msg) {
            switch (msg.m) {
                case MessagesEnum.REPORT: {
                    console.log('REPORT');
                    console.log(msg);
                    break;
                }
                case MessagesEnum.LATCH_FAILURE: {
                    console.log('LATCH_FAILURE');
                    sendMessage(MessagesEnum.UNLATCH_EVERYONE);
                }
                case MessagesEnum.UNLATCHED: {
                    console.log('UNLATCHED');
                    sendMessage(MessagesEnum.LATCH_SELF);
                }
                case MessagesEnum.LATCHED:
                    {
                        console.log('LATCHED');
                    }
                    ;
            }
        });
        rawMessages = [];
    }
    catch (e) {
        console.log(e);
    }
    sendMessage(MessagesEnum.MYLATCHSTATUS);
}, 2000);
//# sourceMappingURL=latch-game-client.js.map