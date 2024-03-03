// console.log("Hello umakant to backend .")

const express = require('express');
const app = express();
const PORT = 3000;

app.listen(PORT,()=>{
    console.log(`Server list-en on port number : ${PORT} `)
})

app.get('/',(req,res,next) =>{
    res.send("Home page ")
})

app.get('/login',(req,res,next) =>{
    res.send("<h1> H! tag </h1>Home page login ")
})
