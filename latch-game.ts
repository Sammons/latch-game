/// <reference path="vendor/node.d.ts" />
import net = require('net');
import events = require('events');
import util = require('util');
interface LatchGameParams {
  maxPlayers: number;
  port: number;
}

interface IMessage {
  m: number;
  t: number;
}

interface IReportMessage {
  score: number,
  playerId: string,
  scoreRatio: number,
  timestamp: number
};

enum MessagesEnum {
  CLIENT_CONNECTION_ACCEPTED,
  PARSE_ERROR,
  UNLATCH_EVERYONE,
  LATCH_SELF,
  LATCH_SUCCESS,
  LATCH_FAILURE,
  UNLATCH_SUCCESS,
  DIE,
  REPORT
}

class MessageFactory {
  public static CreateMessage(message: number): string {
    const messageObj: IMessage = {
      'm' : message,
      't' : Date.now()
    };
    return JSON.stringify(messageObj) + '\n';
  }
}

class LatchGameSocketHandler {
  
  private id: Guid;
  private sock: net.Socket;
  private handleMessage(msg: MessagesEnum, sock: net.Socket): boolean {
    switch(msg) {
      case MessagesEnum.LATCH_SELF: {
        if (LatchGameCore.latchSelf(this.id)) {
          sock.write(MessageFactory.CreateMessage(MessagesEnum.LATCH_SUCCESS));
        } else {
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
    }
    return false;
  }
  
  constructor(sock: net.Socket, id: Guid) {
    this.id = Guid.newGuid();
    this.sock = sock;
    var buf = "";
    this.sock.on('data', (d: string) => {
      buf += d;
      var messages = buf.split(/\n/gm);
      buf = messages.pop();
      try {
        messages.map((m:string)=>Number(m)).forEach((n) => {
          this.handleMessage(n, this.sock);
        });
      } catch (e) {
        console.log(e);
        this.sock.write(MessageFactory.CreateMessage(MessagesEnum.PARSE_ERROR));
      }
    })
  }
}

namespace LatchGameCore {
  var latched: Guid[] = [];
  var scores: {[k:string]:number} = {};
  var numPlayers: number = 0;
  var interval: NodeJS.Timer;
  var intervalLength: number = 100;
  var maxScore = 1;
  export function playerDisconnect() {
    if (numPlayers > 0) numPlayers--;
  }
  export function playerConnect(id: Guid) {
    numPlayers++;
    scores[id.toString()] = 0;
  }
  
  export function getReportFor(id: Guid): string {
    var score = scores[id.toString()];
    return JSON.stringify({
      'score': score,
      'playerId': id.toString(),
      'scoreRatio': score / maxScore,
      'timestamp': Date.now()
    }) + '\n';
  }
  
  export function maxActiveLatches() {
    return Math.ceil(numPlayers * 0.10);
  }
  
  export function latchSelf(id: Guid): boolean {
    if (latched.length > maxActiveLatches()) return false;
    else {
      latched.push(id);
      return true;
    }
  }
  
  export function unlatchAll() {
    latched = [];
  }
  
  function score() {
    latched.forEach((g: Guid) => { 
      const id = g.toString();
      scores[id] = (scores[id] || 0) + 1;
      maxScore = Math.max(scores[id], maxScore);
    })
  }
  
  export function start() {
    interval = setInterval(() => {
      score();
    },100);
  }
  export function stop() {
    clearInterval(interval);
  }
}

class LatchGameServer {
  private server: net.Server;
  
  settings: LatchGameParams = {
    port: 3000,
    maxPlayers: 200
  };
  
  constructor(params?: LatchGameParams) {
    if (params) {
      this.settings = params;
    }
    
    this.server = net.createServer((sock: net.Socket) => {
      var id = Guid.newGuid();
      LatchGameCore.playerConnect(id);
      util.log('new connection recieved from ' + sock.address());
      ['close', 'error'].forEach((event) => sock.on(event, () => {
        sock.destroy();
      }));
      sock.write(MessageFactory.CreateMessage(MessagesEnum.CLIENT_CONNECTION_ACCEPTED));
      new LatchGameSocketHandler(sock, id);
    });
    
    this.server.maxConnections = this.settings.maxPlayers;
    this.server.listen(this.settings.port, () => {
      util.log("Latch-Game server initialized on port " + this.settings.port + " with a max connection limit of " + this.settings.maxPlayers);
    });
  }
}

var l = new LatchGameServer();
LatchGameCore.start();

class Guid extends String {
  private value: string = "" ;
  constructor(str: string) {
    super(str);
    this.value = str;
  }
  
  public valueOf() : string { return this.value; }
  public toString() { return this.valueOf(); }
  public static newGuid():Guid {
    //http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/8809472#8809472
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return new Guid(uuid);
  }
}

