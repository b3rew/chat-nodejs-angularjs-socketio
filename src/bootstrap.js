'use strict';

import config from './config.json';
import express from 'express';
import { Server } from 'http';
import socket from 'socket.io';
import Chat from './chat/chat';
import Logger from 'winston-console-graylog2-logger';

var Twit = require('twit')

let app = express();
let http = Server(app);
let io = socket(http);

var watchList = ['ethiopia', 'ethio', 'addis ababa'];
 var T = new Twit({
    consumer_key:         'AdvdYadwnuaAA7LlJ2bMr6XBp'
  , consumer_secret:      'XhJStrt51rlawl7w4ooolRCo1o2tIegOj4N9IDTAzE3AHNYhOr'
  , access_token:         '242223409-ltdnRyn4pXsO9Pttr31ICocsGdU2uxP8qk5GwbPq'
  , access_token_secret:  'O63DxXfcOim0Cq1qyjZHPDMed15TwuoWyIHb36yzPlU2X'
})

io.sockets.on('connection', function (socket) {
  console.log('Connected');


var stream = T.stream('statuses/filter', { track: watchList })

  stream.on('tweet', function (tweet) {

  io.sockets.emit('stream',tweet);


});
});

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
var thePort = process.env.PORT || 3000
http.listen(thePort, () => console.info('Chat App listening on *:'+thePort));

config.logger = config.logger || {};

let graylog2Cnf = config.logger.graylog2 || {};

graylog2Cnf.enable = graylog2Cnf.enable || false;
graylog2Cnf.host = graylog2Cnf.host || '127.0.0.1';
graylog2Cnf.port = graylog2Cnf.port || '12201';
graylog2Cnf.facility = graylog2Cnf.facility || 'My NodeJS App';

let log = new Logger({
    enable: !!config.logger.enable,
    graylog2: {
        enable: graylog2Cnf.enable,
        host: graylog2Cnf.host,
        port: graylog2Cnf.port,
        facility: graylog2Cnf.facility
    }
});

new Chat(config, io, log);
