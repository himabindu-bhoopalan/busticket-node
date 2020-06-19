const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoClient = require('mongodb')
const url = 'mongodb://localhost:27017';
const bcrypt = require('bcrypt');
const saltRounds = 10

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.get('/allusers',function(req,res){
//     mongoClient.connect(url,function(err,client){ //connecting to mongodb
//         if(err) throw err;
//         var db=client.db("busDb") //fetching the db 

//         var userData=db.collection("product").find().toArray( //selecting the db and converting the data 
//             function(err,result){
//                 if(err) throw err;
//                 console.log(result);
//                 res.json(result);
//                 client.close()
//             }
//         )
//     })
// })

app.post('/signup', function (req, res) {
    console.log("inside sign up api");
    console.log(req.body);

    //assiging the data to new variable newData
    var newData = {
        email: req.body.email
    }
    var uniqueid = generate_id(req.body.name);
    newData.unique_id = uniqueid;
    newData.category = req.body.category;
    newData.phnumber = req.body.phnumber;
    newData.name = req.body.name;

    function generate_id(name) {
        var unique = name.slice(0, 3);
        var characters = '0123456789';
        var len = characters.length;
        for (var i = 0; i < 3; i++) {
            unique += characters.charAt(Math.floor(Math.random() * len));
        }
        console.log("unique" + unique)
        return unique
    }

    //connecting to the db    
    mongoClient.connect(url, function (err, client) {
        if (err) throw err;
        var db = client.db("busDb")

        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) throw err;


            // console.log(salt)

            //password-hashing
            bcrypt.hash(req.body.password, salt, function (err, hash) {
                if (err) throw err;
                // console.log(hash)
                newData.password = hash;

                //Checking if duplicates exist
                if (db.collection("user").findOne({ email: req.body.email }) == null) {

                    var userData = db.collection("user").insertOne(newData, function (err, data) {
                        if (err) throw err;
                        client.close();
                        res.json({
                            status: 200,
                            message: "user Inserted"
                        })
                    })
                }
                else {

                    client.close();
                    res.json({
                        status: 400,
                        message: "User already exists"
                    })
                }


            })
        })







    })

});

// app.post('/login',function(req,res){
//     mongoClient.connect(url,function(err,client){
//         if(err) throw err;
//         var db=client.db("busDb");
//         db.collection('user').findOne({email:req.body.email},function(err,userData){
//             if(err) throw err;
//             console.log(userData)
//             bcrypt.compare(req.body.password,userData.password,function(err,result){
//                 if(err) throw err;
//                 console.log(result);
//                 if(result){
//                     res.json({
//                         message:"User present!"   //here we should provide the token to the user
//                     })
//                 }
//             })
//         })
//     })
// })

app.listen(3040, function () {
    console.log('port is running on 3040')
});
