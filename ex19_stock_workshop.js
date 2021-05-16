var express = require('express')
var formidable = require('formidable')
var bodyParser = require('body-parser')
var sqlite3 = require('sqlite3')
var path = require('path')
var fs = require('fs')
const { close } = require('inspector')
var app = express()

app.use(express.static(path.join(__dirname,'/stock')))
app.set('view engine','ejs')
app.set('views','./stock')

app.get('/',function(req,res){
    // var dummy_products = []
    // for(var i=0;i<100;i++){
    //     dummy_products.push({id:i,image:"/images/download.jpg",title:"ชื่อสินค้า",description:"รายละเอียด",price:1000,stock:100})
    // }
    // console.log(JSON.stringify(dummy_products))
    // res.render("index",{
    //     header:"Stock Workshop",
    //     products:dummy_products
    // })
    queryData(function(result){
        res.render("index",{header:"Stock Workshop",products:result})
    })
})

app.get('/add',function(req,res){
    res.render('add',{
        header:"Create Product"
    })
})

app.get('/edit',function(req,res){
    // var row={image:"1619352565261.jpg",title:"ทดสอบ",description:"รายละเอียด",price:1000,stock:10}
    // res.render("edit",{header:"Edit Product",item:row})
    queryByID(req.query.id,function(row){
        console.log(JSON.stringify(row))
        res.render('edit',{header:"Edit Product",item:row})
    })
})

function queryByID(id,callback){
    let db = openDB()
    db.get(`select * from stock where id=?`,[id],(err,row)=>{
        if(err){
            throw err
        }
        callback(row)
    })
    closeDB(db)
}

app.post('/api/add',function(req,res){
    try{
        var form = new formidable.IncomingForm()
        var newname = Date.now()
        form.parse(req,function(err,fields,files){
            var oldpath = files.filetoupload.path
            var fileName = newname.toString()+"."+files.filetoupload.name.split(".").pop()
            var newpath = path.join(__dirname,"./stock/images/"+fileName)
            fs.rename(oldpath,newpath,function(err){
                if(err) throw err

                var data={
                    title:fields.title,
                    description:fields.description,
                    price:fields.price,
                    stock:fields.stock,
                    image:fileName
                }
                insertData(data)
                res.redirect('/')
            })
        })
    }catch(err){
        console.log("err : "+err)
        res.json(err)
    }
})

app.post('/api/update',function(req,res){
    try{
        var form = new formidable.IncomingForm()
        form.parse(req,function(err,fields,files){
            if(files.filetoupload.size!=0){
                var oldpath = files.filetoupload.path
                var newpath = path.join(__dirname,"./stock/images/"+fields.image)

                fs.rename(oldpath,newpath,function(err){
                    if(err) throw err
                    console.log("Update file successfully")
                })
            }

            var data={
                id:fields.id,
                title:fields.title,
                description:fields.description,
                price:fields.price,
                stock:fields.stock
            }
            console.log("update: "+JSON.stringify(data))
            updateData(data)
            res.redirect('/')
        })
    }catch(err){

    }
})

app.get('/api/delete',function(req,res){
    deleteData(req.query.id,function(){
        res.redirect("/")
    })
})

function deleteData(id,callback){
    var db = openDB()
    const sql=`delete from stock where id = ${id}`
    db.run(sql,function(err){
        if(err) throw err
        callback()
    })
    closeDB(db)
}

function updateData(data){
    let db = openDB()
    const sql = `update stock set title = '${data.title}',
                description = '${data.description}',
                price = '${data.price}',
                stock = ${data.stock} where id = ${data.id}`
    console.log(sql)
    db.run(sql)
    closeDB(db)
}

function queryData(callback){
    var db = openDB()
    const sql = "select * from stock order by id"
    db.all(sql,function(err,rows){
        if(err){
            callback([])
        }else{
            callback(rows)
        }
    })
    closeDB(db)
}

function insertData(data){
    let db = openDB()
    const sql = `INSERT INTO stock(title,description,price,stock,image) 
    VALUES ('${data.title}',
    '${data.description}',
    '${data.price}',
    '${data.stock}',
    '${data.image}') `
    console.log(sql)
    db.run(sql)
    closeDB(db)
}

function openDB(){
    let db = new sqlite3.Database(path.join(__dirname,'/stock/data.db'),(err)=>{
        if(err){
            console.error(err.message)
        }
        console.log('Connected to the stock database')
    })

    const sql_create_table = `CREATE TABLE IF NOT EXISTS 'stock'(
        'id' INTEGER PRIMARY KEY AUTOINCREMENT,
        'title' TEXT,
        'description' TEXT,
        'price' INTEGER,
        'stock' INTEGER,
        'image' TEXT
    )`

    db.run(sql_create_table)
    return db
}

function closeDB(db){
    db.close((err)=>{
        if(err){
            return console.log(err.message)
        }
    })
}

app.use(function(req,res,error){
    console.log("error:"+JSON.stringify(error))
    // res.redirect("/")
    res.sendFile(path.join(__dirname,"/stock/404.html"))
})

var server=app.listen(3000,function(){
    var host = server.address().address
    var port = server.address().port
    console.log("Listening at http://%s:%s",host,port)
})