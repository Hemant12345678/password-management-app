var express = require('express');
var router = express.Router();
var userModule = require('../modules/user');
var passCat    = require('../modules/password-category');
var passDetail  = require('../modules/add-passwordDetails');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose'); 
const { check, validationResult } = require('express-validator');
var getPassCat = passCat.find(); // how to view data in browser
var getAllPass = passDetail.find();

function checkLoginUser (req, res, next){
    var userToken = localStorage.getItem('userToken');
    try {
        var decoded = jwt.verify(userToken, 'loginToken');
      } catch(err) {
          return res.redirect('/');
      }
      next();
}

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
  }

function checkemail(req, res, next) {
    var email = req.body.email;
    var checkExitEmail = userModule.findOne({ email: email }); // middleware function
    checkExitEmail.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('signup', { title: 'Password Management System', msg: 'Email Already Exit' });
        }
        next();
    })
}

// function checkUser(req,res) {
//     userModule.findOne({username:req.body.username}, function(err,result){
//         if(!err){
//             return result; 
//         }
//         else{
//             res.send(false);
//         }
//     })
// }

function checkeusername(req, res, next) {
    var username = req.body.username;
    var checkUserName = userModule.findOne({ username: username }); // middleware function
    checkUserName.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('signup', { title: 'Password Management System', msg: 'Username Already Exit' });
        }
        next();
    })
}
router.get('/', function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    if(loginUser){
        res.redirect('/dashboard')
    }
    else{
    res.render('index', { title: 'Password Management System', msg: '' });
    }
});

router.post('/', function (req, res, next) {

    var username1 = req.body.username;    // get username from database
    var password1 = req.body.password;   //get password from database
    var checkUser = userModule.findOne({ username: username1 });// coming data from database
    checkUser.exec((err, data) => {
        if (err) throw err;
         var getuserId = data._id;
        var getPassword = data.password;   // get password from database and store into another variable
        if (bcrypt.compareSync(password1, getPassword)) {  // comparing two data one is coming from database and another one when user is inserting
            var token = jwt.sign({userId: getuserId},'loginToken'); // creation of token name 
            localStorage.setItem('userToken',token);                // set token 
            localStorage.setItem('loginUser',username1);          // set username or store username in local storage
            // res.render('index', {title:'Password Management System',msg:'Login Successfully'});
            res.redirect('/dashboard')
        }
        else {
            res.render('index', { title: 'Password Management System', msg: 'Invalid Username and Password' });
        }
    })
});

router.get('/dashboard',checkLoginUser, function (req, res, next) {
     var loginUser = localStorage.getItem('loginUser');
    res.render('dashboard', { title: 'Password Management System',loginUser: loginUser, msg: '' }); // which user is login it will display 
});

router.get('/signup',function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    if(loginUser){
        res.redirect('/dashboard')
    }
    else{
    res.render('signup', { title: 'Password Management System', msg: '' });
    }
});

router.post('/signup', checkemail, checkeusername, function (req, res, next) { //use of middleware function checkemail
    // console.log("Data",req.body)
    //  var username = 
    //  var email = req.body.email;
    //  var password = req.body.password;  //bcryptjs for encrypt password 
    //  var confpassword = req.body.confpassword;
    if (req.body.password === req.body.confirmPassword) {
        bcrypt.hash(req.body.password, 10, function (err, hash) {
            var password = hash;
            //console.log("hashed password", password);
            var userDetails = new userModule({
                username: req.body.username,
                email: req.body.email,
                password: password
            });
            userDetails.save((err, doc) => {
                if (err) throw err;
                res.render('signup', { title: 'Password Management System', msg: 'User Registration Successfully' });
            })
        });
        // password= bcrypt.hashSync(req.body.password,15);       
    }
    else {
        res.render('signup', { title: 'Password Management System', msg: 'password do not match ' });
    }
});

router.get('/passwordCategory',checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    getPassCat.exec((err,data)=>{   // execution of data after finding data
     if(err) throw err;
     res.render('password_category', { title: 'Password Management System',loginUser: loginUser ,success:'',records:data});
    })
   
});

router.get('/passwordCategory/delete/:id',checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var passId = req.params.id;  // how to find id through params 
    var passDelete = passCat.findByIdAndDelete(passId);
    passDelete.exec((err)=>{   // execution of data after finding data
     if(err) throw err;
     res.redirect('/passwordCategory');
    })
   
});

router.get('/passwordCategory/edit/:id',checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var passId = req.params.id;  // how to find id through params 
    var getPassCategory = passCat.findById(passId);
    getPassCategory.exec((err,data)=>{   // execution of data after finding data
     if(err) throw err;
    // console.log(data);
     res.render('edit_pass_category', { title: 'Password Management System',loginUser: loginUser, errors:'',success:'',records:data,id: passId});
    })
   
});

router.post('/passwordCategory/edit/',checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var passId = req.body.id;  // how to find id through params 
    var passwordCategory = req.body.passwordCategory;
    var update_passCat  = passCat.findByIdAndUpdate(passId,{password_category:passwordCategory})
    update_passCat.exec((err,doc)=>{   // execution of data after finding data
     if(err) throw err;
     res.redirect('/passwordCategory')
    })
   
});

router.get('/add-new-Category',checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    res.render('addNewCategory', { title: 'Password Management System',loginUser: loginUser,errors:'',success:'' });
});

router.post('/add-new-Category',checkLoginUser,[ check('passwordCategory','Enter Password Category').isLength({ min: 1 })], function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        res.render('addNewCategory', { title: 'Password Management System',loginUser: loginUser, errors:errors.mapped(),success:'' });
    }
    else{
        var passCatName = req.body.passwordCategory;
        var passDetails = new passCat({
            password_category:passCatName
        });
        passDetails.save((err , doc)=>{
          if(err) throw err;
          res.render('addNewCategory', { title: 'Password Management System',loginUser: loginUser , errors:'',success:'Password Category Successfully Inserted'});
        })
        
    }
    
});

router.get('/add-new-Password',checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    getPassCat.exec((err,data)=>{
if(err) throw err;
res.render('add-new-password', { title: 'Password Management System',loginUser: loginUser,records:data ,success:''});
    })
    
});

router.post('/add-new-Password',checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var pass_cat = req.body.pass_cat;
    var project_name = req.body.project_name;
    var pass_detail = req.body.pass_details;
    var password_details = new passDetail({
        password_category:pass_cat,
        project_name:project_name,
        password_detail:pass_detail
    })
   
password_details.save(()=>{
    getPassCat.exec((err,data)=>{
        if(err) throw err;
        res.render('add-new-password', { title: 'Password Management System',loginUser: loginUser,records:data,success:'Password Details Successfully inserted' });
})
   })

    })

router.get('/view-all-Password',checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    getAllPass.exec((err,data)=>{
    if(err) throw err;
    res.render('view-all-password', { title: 'Password Management System',loginUser: loginUser,records:data });
    })
    
});

router.get('/password_detail/edit/:id',checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser'); 
    console.log(req.params.id);
    var id =  mongoose.Types.ObjectId(req.params.id);
   var getpassDetail = passDetail.findById({_id:id});
   getpassDetail.exec((err,data)=>{
        if(err) throw err;
        console.log("@@@@@@@@@@@@@@@@DATA@@@@@@@@@@@@@@@@@@@",data)
        getPassCat.exec((err,doc)=>{
    res.render('edit_password_detail', { title: 'Password Management System',loginUser: loginUser,records:doc,record:data,success:'' });
        });
    });
});

router.post('/password_detail/edit/:id',checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser'); 
    var id =  mongoose.Types.ObjectId(req.params.id);
    var passcat = req.body.pass_cat;
    var project_name = req.body.project_name;
    var pass_details = req.body.pass_details;
    console.log("Type of---------------",typeof(id));
    passDetail.findByIdAndUpdate(id,{password_category:passcat,project_name:project_name,password_detail:pass_details}).exec((err)=>{
     if(err) throw err;   
   var getpassDetail = passDetail.findById({_id:id});
   console.log("ID",id);
   getpassDetail.exec((err,data)=>{
        if(err) throw err;
        getPassCat.exec((err,doc)=>{
    res.render('edit_password_detail', { title: 'Password Management System',loginUser: loginUser,records:doc,record:data,success:'Password details updated Successfully' });
        });
    });
    });
});

router.get('/password_detail/delete/:id',checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var Id = req.params.id;  // how to find id through params 
    var passDelete = passDetail.findByIdAndDelete(Id);
    passDelete.exec((err)=>{   // execution of data after finding data
     if(err) throw err;
     res.redirect('/view-all-Password');
    })
   
});

router.get('/logout', function (req, res, next) {
    localStorage.removeItem('userToken');
    localStorage.removeItem('loginUser');
    res.redirect('/');
});

module.exports = router;