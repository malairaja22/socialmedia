const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageschema = new Schema({

      from:{
        type:String,
        required:true
      },message:{
        type:String,
        required:true
      },to: {
        type: String,
        required:true
      },read:{
        type:Boolean
      }
    },
      {
        timestamps:true
    }
)

module.exports = mongoose.model("message",messageschema)