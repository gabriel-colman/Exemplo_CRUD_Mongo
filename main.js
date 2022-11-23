//import 
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 4000;


//conexao database 
const option = {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    
}
mongoose.connect(process.env.DB_URI,option);

const db = mongoose.connection;
db.on('error',(error)=> console.log(error));
db.once('open',()=> console.log("conectado ao banco de dados!!"));

//middle ware é um pedaço de código que é executado entre a requisição e a resposta 
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false
}));

app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});


app.use(express.static('uploads'));

//chamando o template engine
app.set('view engine', 'ejs');


//router
app.use("",require("./routes/routes"));


app.listen(PORT,()=>{
    console.log(`O servidor rodando porta em http://localhost:${PORT}`);
});