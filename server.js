
//Call the packages
var express = require('express'); // call express
var app = express();    // define our app using express
var bodyParser = require('body-parser'); // get body parser
var morgan = require('morgan'); // used to see requests
var mongoose = require('mongoose'); // for working with our database
var port = process.env.PORT || 3000; // setting up the port for our app
var User = require('./app/models/user.js');
var jwt = require('jsonwebtoken');
var superSecret = 'hellomrelyesbacha';


//connect to local database
//db = mongoose.createConnelocalhostction('mongodb:///localdb');


// Application Configuration
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Configure app to handle CORS requests
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \Authorization');
    next();
});

// log all requests to the console
app.use(morgan('dev'));

// Basic route for the home page
app.get('/', function (req, res) {
    res.send('Welcome to the home page');
});

// instantiate the express router
var apiRouter = express.Router();

apiRouter.get('/', function (req, res) {
    res.json({ message: 'horray welcome to our api' });
});

apiRouter.get('/me', function (req, res) {
    res.send(req.decoded);
});

apiRouter.route('/users')
    .post(function (req, res) {

        var user = new User();

        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function (err) {
            if (err) {
                if (err.code = 11000) {
                    res.json({ success: false, message: 'A user with that username already exists. ' });

                } else {
                    res.send(err);
                }
            };
            res.json({ message: 'User Created!' });
        });

    })
    .get(function (req, res) {

        User.find(function (err, users) {
            if (err) res.send(err);
            res.json(users);
        });
    });

apiRouter.route('/users/:user_id')
    .get(function (req, res) {
        User.findById(req.params.user_id, function (err, user) {
            if (err) res.send(err);
            res.json(user);
        });
    })
    .put(function (req, res) {
        User.findById(req.params.user_id, function (err, user) {
            if (err) res.send(err);

            if (req.body.name) user.name = req.body.name;
            if (req.body.username) user.name = req.body.username;
            if (req.body.password) user.name = req.body.password;

            // save the user
            User.save(function (err) {
                if (err) res.send(err);
                //return message
                res.json({ message: 'User Created!' });
            });



        });
    })
    .delete(function (req, res) {
        User.remove({
            _id: req.params.user_id
        }, function (err, user) {
            if (err) return res.send(err);

            res.json({ message: 'successfully deleted' });
        });
    });

apiRouter.post('/authenticate', function (req, res) {
    User.findOne({
        username: req.body.username
    }).select('name username password').exec(function (err, user) {
        if (err) throw err;

        if (!user) {
            res.json({
                success: false,
                message: 'Authentification failed. User not found'
            });
        } else if (user) {

            var validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
                res.json({
                    success: false,
                    message: 'Authentication failed. Wrong password.'
                });
            } else {

                var token = jwt.sign({
                    name: user.name,
                    username: user.username
                }, superSecret, {
                        expireInMinutes: 1440 //expires in 24 hours
                    });

                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }
        }
    });
});

apiRouter.use(function (req, res, next) {

    var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    if (token) {
        console.log(token);
        jwt.verify(token, superSecret, function (err, decoded) {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'Failed to authenticate token'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided'
        });
    }
});


app.use('/api', apiRouter);

app.listen(port);
console.log('Current port is: ' + port);






