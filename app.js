const path = require('path');

const express = require('express');

const app = express();
const mongoose = require('mongoose');
const bodyparser = require('body-parser');

mongoose.connect('mongodb://localhost:27017/pms', {useNewUrlParser: true,useUnifiedTopology:true,useCreateIndex:true})
    .then(console.log("Connection successfull"))
    .catch(err => console.log(err));

const indexRouter = require('./routes/index');

app.set('view engine', 'ejs');
app.set('views', 'views');

//const adminRoutes = require('./routes/index');
//const shopRoutes = require('./routes/users');

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/index', express.static(__dirname + 'index.ejs') );
//app.use(shopRoutes);

//app.use(errorController.get404);

app.listen(4000);
