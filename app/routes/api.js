var User = require('../models/user.js');
var jwt = require('jsonwebtoken');
var config = require('../../config');


// super secret for creating tokens
var superSecret = config.secret;


module.exports =  function(app,express){
// instantiate the express router
var apiRouter = express.Router();

apiRouter.post('/authenticate',function(req,res){
    //find the user
    //select the name username and password explicitly
    User.findOne({
        username: req.body.username
    }).select('name username password').exec(function(err,user){
        if(err) throw err;

        //no user with that username was found
        if(!user){
            res.json({
                success: false,
                message:'Authentification failed. User not found'
            });
        }else if(user){

            //check if password matches
            var validPassword = user.comparePassword(req.body.password);
            if(!validPassword){
                res.json({
                    success: false,
                    message: 'Authentication failed. Wrong password.'
                });
            }else{
                // if user is found and password is right
                // create a token
                var token = jwt.sign({
                    name: user.name,
                    username: user.username
                },superSecret,{
                    expireInMinutes:1440 //expires in 24 hours
                });

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }
        }
    });
});
// route middleware to verify a token.
apiRouter.use(function(req,res,next){
    //check header or url parameters or post parameters for token.
    var token = req.body.token || req.param('token')|| req.headers['x-access-token'];

    //decode token
    if(token){
        console.log(token);
        jwt.verify(token,superSecret,function(err,decoded){
            if(err){
                return res.status(403).send({
                    success: false,
                    message: 'Failed to authenticate token'
                });
            }else{
                // if everything is good, save to request to use in other routes
                req.decoded = decoded;
                next();
            }
        });
    }else{
        //if there is no token
        //return http response of 403(access forbidden) and error message
        return res.status(403).send({
            success: false,
            message: 'No token provided'
        });
    }
});

apiRouter.get('/',function(req,res){
    res.json({message: 'horray welcome to our api'});
});

apiRouter.get('/me',function(req,res){
    res.send(req.decoded);
});

apiRouter.route('/users')
    .post(function(req,res){
//  create an instance of user model
        var user = new User();

        // set the user information coming from the req
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        //save the user and check for error
        user.save(function(err){
            if(err){
                //duplicate entry
                if(err.code = 11000){
                    res.json({success: false, message: 'A user with that username already exists. '});

                }else{
                    res.send(err);
                }
            };
            res.json({message:'User Created!'});
        });

    })
    .get(function(req,res){

        User.find(function(err,users){
            if(err) res.send(err);
            //return the list of users
            res.json(users);
        });
    });

apiRouter.route('/users/:user_id')
    // get the user with that id
    // (accessed at GET http://localhost:1337/api/users/:user_id)
    .get(function(req,res){
        User.findById(req.params.user_id,function(err,user){
            if(err) res.send(err);
            // return that user
            res.json(user);
        });
    })
    // update the user with that id
    // (accessed at Put http://localhost:1337/api/users/:user_id)
    .put(function(req,res){
        User.findById(req.params.user_id,function(err,user){
            if(err) res.send(err);
            // return that user

            if(req.body.name) user.name = req.body.name;
            if(req.body.username) user.name = req.body.username;
            if(req.body.password) user.name = req.body.password;

            // save the user
            User.save(function(err){
                if(err) res.send(err);
                //return message
                res.json({message:'User Created!'});
            });



        });
    })
    // delete the user with that id
    // (accessed at Put http://localhost:1337/api/users/:user_id)
    .delete(function(req,res){
        User.remove({
            _id:req.params.user_id
        },function(err,user){
            if(err) return res.send(err);
            // return that user

            res.json({message:'successfully deleted'});
        });
    });

return apiRouter;
}