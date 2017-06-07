angular.module('mainCtrl', [])
    .controller('mainController', function ($rootScope, $location, Auth) {
        var vm = this;

        vm.isLoggedIn = Auth.isLoggedIn();

        $rootScope.$on('$routeChangeStart', function () {
            vm.isLoggedIn = Auth.isLoggedIn();

            Auth.getUser()
                .success(function (data) {
                    console.log(data);
                    vm.user = data;
                });
        });

        vm.doLogin = function () {
            vm.processing = true;
            Auth.login(vm.loginData.username, vm.loginData.password)
                .success(function (data) {
                    vm.processing = false;
                    vm.error = '';
                    if (data.success)
                        $location.path('/users');
                    else
                        vm.error = data.message;
                });
        };

        vm.doLogout = function () {
            Auth.logout();
            vm.user = {};
            $location.path('/login');
        };

    });