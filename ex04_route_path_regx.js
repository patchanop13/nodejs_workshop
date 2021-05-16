var express = require("express")
var app = express()

app.get('/',function(req,res){
    res.end("default")
})

app.get('/ab?cd',function(req,res){
    res.end('/ab?cd')
})

app.get('/x1+cd',function(req,res){
    res.end('/x1+cd , This route path will match ex: /x1cd, x11cd, x11111cd')
})

app.get('/ab*cd',function(req,res){
    res.end('/ab*cd , This route path will match abcd, abRANDOMcd, ab123cd, and so on.')
})

var server=app.listen(3000,function(){
    var host = server.address().address
    var port = server.address().port
    console.log("Listening at http://%s:%s",host,port)
})