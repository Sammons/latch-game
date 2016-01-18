var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var net = require('net');
var util = require('util');
;
var MessagesEnum;
(function (MessagesEnum) {
    MessagesEnum[MessagesEnum["CLIENT_CONNECTION_ACCEPTED"] = 0] = "CLIENT_CONNECTION_ACCEPTED";
    MessagesEnum[MessagesEnum["PARSE_ERROR"] = 1] = "PARSE_ERROR";
    MessagesEnum[MessagesEnum["UNLATCH_EVERYONE"] = 2] = "UNLATCH_EVERYONE";
    MessagesEnum[MessagesEnum["LATCH_SELF"] = 3] = "LATCH_SELF";
    MessagesEnum[MessagesEnum["LATCH_SUCCESS"] = 4] = "LATCH_SUCCESS";
    MessagesEnum[MessagesEnum["LATCH_FAILURE"] = 5] = "LATCH_FAILURE";
    MessagesEnum[MessagesEnum["UNLATCH_SUCCESS"] = 6] = "UNLATCH_SUCCESS";
    MessagesEnum[MessagesEnum["DIE"] = 7] = "DIE";
    MessagesEnum[MessagesEnum["REPORT"] = 8] = "REPORT";
    MessagesEnum[MessagesEnum["MYLATCHSTATUS"] = 9] = "MYLATCHSTATUS";
    MessagesEnum[MessagesEnum["LATCHED"] = 10] = "LATCHED";
    MessagesEnum[MessagesEnum["UNLATCHED"] = 11] = "UNLATCHED";
})(MessagesEnum || (MessagesEnum = {}));
var MessageFactory = (function () {
    function MessageFactory() {
    }
    MessageFactory.CreateMessage = function (message) {
        var messageObj = {
            'm': message,
            't': Date.now()
        };
        return JSON.stringify(messageObj) + '\n';
    };
    return MessageFactory;
})();
var LatchGameSocketHandler = (function () {
    function LatchGameSocketHandler(sock, id) {
        var _this = this;
        this.id = Guid.newGuid();
        this.sock = sock;
        var buf = "";
        this.sock.on('data', function (d) {
            buf += d;
            var messages = buf.split(/\n/gm);
            buf = messages.pop();
            try {
                messages.map(function (m) { return Number(m); }).forEach(function (n) {
                    _this.handleMessage(n, _this.sock);
                });
            }
            catch (e) {
                console.log(e);
                _this.sock.write(MessageFactory.CreateMessage(MessagesEnum.PARSE_ERROR));
            }
        });
    }
    LatchGameSocketHandler.prototype.handleMessage = function (msg, sock) {
        switch (msg) {
            case MessagesEnum.LATCH_SELF: {
                if (LatchGameCore.latchSelf(this.id)) {
                    sock.write(MessageFactory.CreateMessage(MessagesEnum.LATCH_SUCCESS));
                }
                else {
                    sock.write(MessageFactory.CreateMessage(MessagesEnum.LATCH_FAILURE));
                }
                break;
            }
            case MessagesEnum.UNLATCH_EVERYONE: {
                LatchGameCore.unlatchAll();
                sock.write(MessageFactory.CreateMessage(MessagesEnum.UNLATCH_SUCCESS));
                break;
            }
            case MessagesEnum.REPORT: {
                sock.write(LatchGameCore.getReportFor(this.id));
                break;
            }
            case MessagesEnum.MYLATCHSTATUS: {
                sock.write(MessageFactory.CreateMessage(LatchGameCore.isLatched(this.id) ? MessagesEnum.LATCHED : MessagesEnum.UNLATCHED));
                break;
            }
        }
        return false;
    };
    return LatchGameSocketHandler;
})();
var LatchGameCore;
(function (LatchGameCore) {
    var latched = [];
    var scores = {};
    var numPlayers = 0;
    var interval;
    var intervalLength = 100;
    var maxScore = 1;
    function isLatched(id) {
        return latched.indexOf(id) >= 0;
    }
    LatchGameCore.isLatched = isLatched;
    function playerDisconnect() {
        if (numPlayers > 0)
            numPlayers--;
    }
    LatchGameCore.playerDisconnect = playerDisconnect;
    function playerConnect(id) {
        numPlayers++;
        scores[id.toString()] = 0;
    }
    LatchGameCore.playerConnect = playerConnect;
    function getReportFor(id) {
        var score = scores[id.toString()];
        return JSON.stringify({
            'score': score,
            'playerId': id.toString(),
            'scoreRatio': score / maxScore,
            'timestamp': Date.now()
        }) + '\n';
    }
    LatchGameCore.getReportFor = getReportFor;
    function maxActiveLatches() {
        return Math.ceil(numPlayers * 0.10);
    }
    LatchGameCore.maxActiveLatches = maxActiveLatches;
    function latchSelf(id) {
        if (latched.length >= maxActiveLatches())
            return false;
        else {
            latched.push(id);
            return true;
        }
    }
    LatchGameCore.latchSelf = latchSelf;
    function unlatchAll() {
        latched = [];
    }
    LatchGameCore.unlatchAll = unlatchAll;
    function score() {
        latched.forEach(function (g) {
            var id = g.toString();
            scores[id] = (scores[id] || 0) + 1;
            maxScore = Math.max(scores[id], maxScore);
        });
    }
    function start() {
        interval = setInterval(function () {
            score();
        }, 100);
    }
    LatchGameCore.start = start;
    function stop() {
        clearInterval(interval);
    }
    LatchGameCore.stop = stop;
})(LatchGameCore || (LatchGameCore = {}));
var LatchGameServer = (function () {
    function LatchGameServer(params) {
        var _this = this;
        this.settings = {
            port: 3000,
            maxPlayers: 200
        };
        if (params) {
            this.settings = params;
        }
        this.server = net.createServer(function (sock) {
            var id = Guid.newGuid();
            LatchGameCore.playerConnect(id);
            util.log('new connection recieved from ' + sock.address());
            ['close', 'error'].forEach(function (event) { return sock.on(event, function () {
                sock.destroy();
            }); });
            sock.write(MessageFactory.CreateMessage(MessagesEnum.CLIENT_CONNECTION_ACCEPTED));
            new LatchGameSocketHandler(sock, id);
        });
        this.server.maxConnections = this.settings.maxPlayers;
        this.server.listen(this.settings.port, function () {
            util.log("Latch-Game server initialized on port " + _this.settings.port + " with a max connection limit of " + _this.settings.maxPlayers);
        });
    }
    return LatchGameServer;
})();
var Guid = (function (_super) {
    __extends(Guid, _super);
    function Guid(str) {
        _super.call(this, str);
        this.value = "";
        this.value = str;
    }
    Guid.prototype.valueOf = function () { return this.value; };
    Guid.prototype.toString = function () { return this.valueOf(); };
    Guid.newGuid = function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return new Guid(uuid);
    };
    return Guid;
})(String);
var l = new LatchGameServer();
LatchGameCore.start();
//# sourceMappingURL=latch-game.js.map