var express = require("express")
var router = express.Router()

router.route('/routes')
.get(function(req,res){
    res.end("routes get")
})
.post(function(req,res){
    res.end("routes post")
})
.put(function(req,res){
    res.end("routes put")
})
.delete(function(req,res){
    res.end("routes delete")
})

router.get('/test',function(req,res){
    res.json({result:'test'})
})

module.exports = router