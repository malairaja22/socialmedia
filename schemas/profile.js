const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileschema = new Schema({
    email:{
        type:String,
        required:true
    },
    uid:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    profilepic:{
        type:String
    },
    firstname:{
        type:String
    },
    lastname:{
        type:String
    },
    status:{
        type:String
    },
    followers:{
        type:[String]
    },
    following:{
        type:[String]
    },online:{
        type:String
    },socketid:{
        type:String
    },onlinesetting:{
        type:Boolean,
        default:true
    },notificationsetting:{
        type:Boolean,
        default:true
    },
    notifications:{
        type:[{ message: String,id:String,date:String,read:Boolean}],
      }
    
},{
    timestamps:true
});

module.exports = mongoose.model("useraccounts",profileschema)