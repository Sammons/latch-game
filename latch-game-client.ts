/// <reference path="typings/node.d.ts" />
/// <reference path="typings/bluebird/bluebird.d.ts" />
import net = require('net');
import bluebird = require('bluebird');
/* the latch game revolves around some simple actions and responses,
 * the client only sends numbers, and the server responds with JSON */
enum MessagesEnum {
  CLIENT_CONNECTION_ACCEPTED = 0, /* receive */
  PARSE_ERROR = 1, /* receive */
  UNLATCH_EVERYONE = 2, /* send */
  LATCH_SELF = 3, /* send */
  LATCH_SUCCESS = 4, /* receive */
  LATCH_FAILURE = 5, /* receive */
  UNLATCH_SUCCESS = 6, /* receive */
  REPORT = 8, /* send, receive */
  MYLATCHSTATUS, /* send */
  LATCHED, /* receive */
  UNLATCHED /* receive */
}

/* responses to UNLATCH_EVERYONE and LATCH_SELF and MYLATCHSTATUS */
interface IMessage {
  m: number; /* LATCH_SUCCESS, LATCH_FAILURE, UNLATCH_SUCCESS, LATCHED, UNLATCHED */
  t: number; /* server's Date.now() */
}

/* response to REPORT */
interface IReportMessage {
  m: number, /* always REPORT */
  score: number,
  playerId: string,
  scoreRatio: number, /* your score / best score */
  t: number /* server's Date.now() */
};

var serverAddress = '127.0.0.1';
var serverPort = 3000;
var messageDelim = '\n';

var rawMessages: string[] = [];

var socket = net.connect(serverPort, serverAddress, () => {
  console.log('connected');
  var buf = "";
  socket.on('data', (d:string) => {
    buf += d;
    var newMessages = buf.split(/\n/gm);
    buf = newMessages.pop();
    rawMessages = rawMessages.concat(newMessages);
  });
});

function sendMessage(m: number): void {
  socket.write(m + messageDelim);
}

/* sample client that uses simple logic */

setInterval(() => {
  try {
     console.log(rawMessages.length)
     rawMessages.map((m) => JSON.parse(m)).forEach((msg: IMessage) => {
      switch (msg.m) {
        case MessagesEnum.REPORT: {
          console.log('REPORT');
          console.log(msg);
          break;
        }
        case MessagesEnum.LATCH_FAILURE: {
          console.log('LATCH_FAILURE');
          sendMessage(MessagesEnum.UNLATCH_EVERYONE);
          break;
        }
        case MessagesEnum.UNLATCHED: {
          console.log('UNLATCHED');
          sendMessage(MessagesEnum.LATCH_SELF);
          break;
        }
        case MessagesEnum.LATCHED: {
          console.log('LATCHED');
        };
      }
    });
    rawMessages = [];
  } catch(e) {
    console.log(e);
  }
  sendMessage(MessagesEnum.MYLATCHSTATUS);
}, 2000)



