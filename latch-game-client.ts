/// <reference path="vendor/node.d.ts" />
import net = require('net');

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
  REPORT = 8, /* send */
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
  score: number, /* your score */
  playerId: string, /* your id */
  scoreRatio: number, /* your score / best score */
  timestamp: number /* server's Date.now() */
};

var serverAddress = '127.0.0.1';
var serverPort = 3000;
var messageDelim = '\n';

var socket = net.connect(serverPort, serverAddress, (c: net.Socket) => {
  console.log('connected');
})

function sendMessage(m: number): void {
  socket.write(m + messageDelim);
}

/* sample client that does random things */


