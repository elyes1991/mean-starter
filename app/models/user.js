// grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');


//connect to local database
db = mongoose.createConnection('mongodb://localhost/localdb');

//user schema
var UserSchema = new Schema({
    name: String,
    username: {type: String, required: true, index:{unique:true}},
    password: {type:String, required: true, select: false},
    created_at: { type: Date, default: Date.now },
    modified_at: { type: Date}
});

//hash the password before the user is saved
UserSchema.pre('save',function(next){
    var user = this;
    //hash the password if only the password has changed
    if(!user.isModified('password')) return next();

    //generate the hash
    bcrypt.hash(user.password,null,null,function(err,hash){
        if(err) return next(err);

        //change the password to the hashed version
        user.password = hash;
        next();
    });
});

// method given to compare a given password with the database hash
UserSchema.methods.comparePassword = function(password){
    var user= this;
    return bcrypt.compareSync(password,user.password);
};

//return the model
module.exports = db.model('User',UserSchema);

