const mongoose = require('mongoose');

//var conn =mongoose.Collection;
var passSchema =new mongoose.Schema({
    password_category: {type:String, 
        required: true,
        },

        project_name: {type:String, 
            required: true,
           },

        password_detail: {type:String, 
            required: true,
           },

    date:{
        type: Date, 
        default: Date.now }
});

var passDetailModel = mongoose.model('password_details', passSchema);
module.exports=passDetailModel;
