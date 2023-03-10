const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedpostschema = new Schema({

      username:{
        type:String,
        required:true
      },message:{
        type:String
      },filename: {
        type: String,
      },likes:{
        type:[String]
      },comments:{
        type:[{ username: String,comment:String,date:String}],
      }
    },
      {
        timestamps:true
    }
)

module.exports = mongoose.model("feedposts",feedpostschema)