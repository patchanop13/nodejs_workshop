var express = require("express")
var router = require('./ex09_export_route_module')

var app=express()
app.use('/api',router)

var server=app.listen(3000,function(){
    var host = server.address().address
    var port = server.address().port
    console.log("Listening at http://%s:%s",host,port)
})