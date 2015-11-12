'use strict';

import config from './config.json';
import express from 'express';
import { Server } from 'http';
import socket from 'socket.io';
import Chat from './chat/chat';
import Logger from 'winston-console-graylog2-logger';
var request = require('request');
var OAuth2 = require('oauth2').OAuth2;

let app = express();
let http = Server(app);
let io = socket(http);

app.use(express.static(__dirname + '/public'));

var oauth2 = new OAuth2("937922429613259",
                        "e14ad2befad1564f8f85e55764698b83",
                       "", "https://www.facebook.com/dialog/oauth",
                   "https://graph.facebook.com/oauth/access_token",
                   null);
  
app.get('/facebook/auth',function (req, res) {
      var redirect_uri = "/#/channel";
      // For eg. "http://localhost:3000/facebook/callback"
      var params = {'redirect_uri': redirect_uri, 'scope':'user_about_me,publish_actions'};
      res.redirect(oauth2.getAuthorizeUrl(params));
});
app.get("/#/channel", function (req, res) {
 if (req.error_reason) {
  res.send(req.error_reason);
 }
 if (req.query.code) {
  var loginCode = req.query.code;
  var redirect_uri = "/#/channel"; // Path_To_Be_Redirected_to_After_Verification
 // For eg. "/facebook/callback"
  oauth2.getOAuthAccessToken(loginCode, 
 { grant_type: 'authorization_code', 
 redirect_uri: redirect_uri}, 
   function(err, accessToken, refreshToken, params){
    if (err) {
     console.error(err);
   res.send(err);
    }
    var access_token = accessToken;
    var expires = params.expires;
 req.session.access_token = access_token;
 req.session.expires = expires;
    }
  );
 }
};)
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.post('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
var thePort = process.env.PORT || 4000;
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
