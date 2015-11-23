(function (angular, socket) {
    'use strict';

    angular.module('Chat.controllers', [])

    .controller('IndexCtrl', ['$scope', 'Storage',
        function ($scope, Storage) {
            var username = ""
            // This is called with the results from from FB.getLoginStatus().
            function statusChangeCallback(response) {
                console.log('statusChangeCallback');
                console.log(response);

                if (response.status === 'connected') {
                    // Logged into your app and Facebook.
                    testAPI();
                } else if (response.status === 'not_authorized') {
                    // The person is logged into Facebook, but not your app.
                    document.getElementById('status').innerHTML = 'Please log ' +
                        'into this app.';
                }else {
                    // The person is not logged into Facebook, so we're not sure if
                    // they are logged into this app or not.
                    document.getElementById('status').innerHTML = 'Please log ' +
                        'into Facebook.';
                }
            }


            function checkLoginState() {
                FB.getLoginStatus(function(response) {
                    statusChangeCallback(response);
                });
            }

            window.fbAsyncInit = function() {
                FB.init({
                    appId      : '937922429613259',
                    cookie     : true,  // enable cookies to allow the server to access
                                        // the session
                    xfbml      : true,  // parse social plugins on this page
                    version    : 'v2.2' // use version 2.2
                });
                FB.getLoginStatus(function(response) {
                    statusChangeCallback(response);
                });

            };
            // Load the SDK asynchronously
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

            function testAPI() {
                console.log('Welcome!  Fetching your information.... ');
                FB.api('/me', function(response) {
                    console.log('Successful login for: ' + response);
                    username = response.name;
                    console.log(username, "--------cont----------", response.name)
                    var user = Storage.user.get();
                    user.username = newUsername;
                    Storage.user.set(user);
                    var gg = Storage.user.get();
                    console.log(gg, "-2-2-2-2-2-2-2")
                    document.getElementById('status').innerHTML =
                        'Thanks for logging in, ' + response.name + '!';
                });
            }


        }
    ])

    .controller('ChannelCtrl', [
        '$scope', '$location', 'Storage', '$timeout',
        function ($scope, $location, Storage, $timeout) {

            var user = Storage.user.get();

            $scope.channel = {
                name: '',
                password: ''
            };
            $scope.chans = ["test channel 1", "test channel 2", "test channel 3", "test channel 4"]
            //TODO: add a loading indicator until the channel is joined and page changed or error i returned

            $scope.createChannel = function () {
                $location.path('/chat');
                $timeout(function () {
                    socket.emit('create channel', {
                        name: $scope.channel.name,
                        password: $scope.channel.password
                    });
                });
            };
            $scope.getChannel = function(chan){
                   $location.path('/chat');
                    $timeout(function () {
                        socket.emit('get channel', user, {
                            name: chan,
                            password: ''
                        });
                         // $location.path('/chat');
                    });
            }

            $scope.joinChannel = function () {
                $location.path('/chat');
                $timeout(function () {
                    socket.emit('join channel', user, {
                        name: $scope.channel.name,
                        password: $scope.channel.password
                    });
                });
            };
        }
    ])

    .controller('ChatCtrl', [
        '$scope', 'Chat', '$location', 'Storage', 'ChatSocket', 'Flags',
        function ($scope, Chat, $location, Storage, ChatSocket, Flags) {

            var channel = Storage.channel.get();

            //reload the data when coming from another SPA page without refresh
            if (channel && channel.name && Flags.joinedChannel) {
                $scope.channel = channel.name;
                $scope.inviteLink = Chat.getInviteLink(channel);
                ChatSocket.channel.getUsers($scope.channel);
                ChatSocket.channel.getMessages($scope.channel);
            }

            $scope.user = Storage.user.get();
            $scope.users = [];
            $scope.focusSendMessage = true;

            if (/^\/join\/.+/.test($location.path())) {
                return Chat.handleJoinUrl($scope.user);
            }

            $scope.leaveChannel = function () {
                socket.emit(
                    'leave channel',
                    //TODO: remove these params
                    {
                        uuid: $scope.user.uuid,
                        username: $scope.user.username
                    },
                    $scope.channel
                );
            };

            ///socket messages

            $scope.$on('joined channel', function (event, channel) {
                $scope.channel = channel.name;
                $scope.inviteLink = Chat.getInviteLink(channel);
                ChatSocket.channel.getMessages($scope.channel);
                $scope.focusSendMessage = true;
                Flags.joinedChannel = true;
            });

            $scope.$on('channel users list', function (event, users) {
                $scope.users = users;
            });

            function showText () {
                $scope.chatText = Chat.getText();
            }

            $scope.$on('new channel message', function (event, message) {
                showText();
            });

            $scope.$on('new message', function (event, message) {
                showText();
            });

            $scope.$on('channel messages', function (event, messages) {
                Chat.replaceText(messages);
                showText();
            });

            $scope.$on('channel left', function (event, channel) {
                Storage.channel.set({});
                Flags.joinedChannel = false;
                $location.path('/channel');
            });
        }
    ])

    .controller('ProfileCtrl', [
        '$scope', 'ChatSocket', 'Storage', '$location', 'Popup',
        function ($scope, ChatSocket, Storage, $location, Popup) {

            var user = Storage.user.get();

            $scope.username = user.username;

            $scope.updateUsername = function () {
                ChatSocket.user.update(user.uuid, $scope.username);
            };

            $scope.$on('user updated', function (event, uuid, oldUsername, newUsername) {
                user.username = newUsername;
                Storage.user.set(user);
                if (Storage.channel.get().name) {
                    $location.path('/chat');
                } else {
                    Popup.show(
                        'User updated',
                        'The username was updated successfully!'
                    );
                }
            });
        }
    ])

    .controller('PopupCtrl', [
        '$scope', '$modalInstance', 'title', 'body',
        function ($scope, $modalInstance, title, body) {
            $scope.title = title;
            $scope.body = body;

            $scope.ok = function () {
                $modalInstance.close();
            };
        }
    ])

    ;

})(angular, socket);
