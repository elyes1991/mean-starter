angular.module('userService',[])
       .factory('User',function($http){

            // create a new object
            var userFactory = {};

            //get a single user
            userFactory.get =  function(id){
                return $http.get('/api/users/' + id);
            };

            //get all users
            userFactory.all =  function(){
                return $http.get('/api/users/');
            };

            //create a user
            userFactory.create =  function(userData){
                return $http.post('/api/users/',userData );
            };

            //create a user
            userFactory.update =  function(id , userData){
                return $http.put('/api/users/'+ id,userData );
            };

            //delete user
            userFactory.delete =  function(id){
                return $http.delete('/api/users/'+ id);
            };

            // return the entire userFactory object
            return userFactory;
        });