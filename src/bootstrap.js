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
    consumer_key:         '*'
  , consumer_secret:      '*'
  , access_token:         '*'
  , access_token_secret:  '*'
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
app.post('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.use('/vendor', express.static(__dirname+'/public/vendor'));
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
