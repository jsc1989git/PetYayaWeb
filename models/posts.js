const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema(
   {
    name:{
        type: String, required: true
    },
    postDetails: {
        type:  String, required: true
    },
    datePosted: {
        type: Date, required:true
    }
    
   }

)


module.exports = mongoose.model('post',postSchema);