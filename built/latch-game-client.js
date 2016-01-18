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
var socket = net.connect(serverPort, serverAddress, function (c) {
    console.log('connected');
});
function sendMessage(m) {
    socket.write(m + messageDelim);
}
//# sourceMappingURL=latch-game-client.js.map