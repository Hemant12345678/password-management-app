const mongoose = require('mongoose');

//var conn =mongoose.Collection;
var passCatSchema =new mongoose.Schema({
    password_category: {type:String, 
        required: true,
        },

    date:{
        type: Date, 
        default: Date.now }
});

var passCatModel = mongoose.model('password_categories', passCatSchema);
module.exports=passCatModel;
