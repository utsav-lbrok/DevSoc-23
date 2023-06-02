const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoDBSession = require('connect-mongodb-session')(session);
const app = express();
const bodyParser = require('body-parser');

const mongoURI = 'mongodb://127.0.0.1:27017/prostech'
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session');
mongoose.connect(mongoURI,{
  useNewUrlParser:true,
  useUnifiedTopology: true,
}).then((res)=>{
  console.log("Mongodb Connected");
})

const UserModel = require('./models/user')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set("view engine", 'ejs');

const store = new mongoDBSession({
  uri: mongoURI,
  collection: "mysessions",
});



app.use(session({
  secret: "Key assigned",
  resave: false,
  saveUninitialized: false,
  store: store,
}));

const isAuth = (req,res,next)=>{
  if(req.session.isAuth){
    next()
  }
  else{
    res.redirect('/login');
  }
}

app.get("/", function(req, res) {

  res.render('home');

});

app.get("/login", function(req, res) {
 
  res.render('login');

});

app.post("/login", async function(req, res) {
  const {email,password} = req.body;

  const user = await UserModel.findOne({email});

  if(!user){
    return res.redirect('/login');
  }
  const isMatch = await bcrypt.compare(password,user.password);

  if(!isMatch){
    return res.redirect('/login');
  }

  req.session.isAuth = true;

  res.redirect('/dashboard'); 
});

app.get("/register", function(req, res) {
 
  res.render('register');

});

app.post("/register", async function(req, res) {

  const {username,email,password} = req.body;
  let user = await  UserModel.findOne({email});
  if(user){
    return res.redirect('.')
  }
  const hashedpsw = await bcrypt.hash(password,14);

  user = new UserModel({
    username,
    email,
    password: hashedpsw,
  });

  await user.save();
  res.redirect('login');

});

app.get("/dashboard", isAuth ,function(req, res) {

  res.render('dashboard');

});

app.post('/logout',(req,res)=>{
  req.session.destroy((err)=>{
    if(err) throw err;
    res.redirect("/");
  });
});

app.listen(5000, () => {
  console.log("Listening to the server on http://localhost:5000");
});