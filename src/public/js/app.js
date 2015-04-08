'use strict';

angular.module('Chat', [
    'Chat.controllers',
    'Chat.services',
    'ngRoute',
    'ui.bootstrap'
])

.config(['$routeProvider', function ($routeProvider) {
        $routeProvider

        .when('/', {
            templateUrl: '/templates/index.html',
            controller: 'IndexCtrl'
        })

        .when('/channel', {
            templateUrl: '/templates/channel.html',
            controller: 'ChannelCtrl' +
            ''
        })

        .otherwise({ redirectTo: '/' });
    }])

;
