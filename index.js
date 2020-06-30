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

//**to add bus**
app.post('/addbus',function(req,res){
    console.log('inside add bus api ');
    console.log(req.body);
    mongoClient.connect(url, { useUnifiedTopology: true },function(err,client){
        if(err) throw err;
        var db=client.db("busDb")                           
        db.collection("Bus").insert(req.body,function(err,data){  
            if(err) throw err;                              
                client.close();                            
                res.json({
                    status:200,
                    message:"data inserted"
                })
                                                 
        })

    })
    
});
/*to get buses*/
app.post('/findbus',function(req,res){
    console.log("inside findbus api ");
    console.log(req  );
    mongoClient.connect(url, { useUnifiedTopology: true },function(err,client){ //connecting to mongodb
        if(err) throw err;
        var db=client.db("busDb") //fetching the db 
        var userData=db.collection("Bus").find(
            {
                Source:req.body.Source,
                Date:req.body.Date,
                Destination:req.body.Destination,
                approval_status:"approved"
            }
        ).toArray( //selecting the db and converting the data 
            function(err,result){
                if(err) throw err;
                console.log(result);
                if(result){
                    res.json({
                        status:200,
                        data:result
                    });
                    client.close()
                }
                else{
                    client.close()
                    res.json({
                        status:400
                    })
                       
                   
                }
               
            }
        )
    })
})

/*to get user data**/
//    

// app.get('/getbusopdata/:id',function(req,res){
//     // console.log(req.params)
//     var cat=req.params.id;
//     console.log('inside the busop_data get method');
//     // console.log(cat);

//     mongoClient.connect(url,{ useUnifiedTopology: true },function(err,client){
//         if(err) throw err;
//         var db=client.db("busDb")
//         var userData= db.collection("bus_operator").findOne({unique_id:cat},function(err, result){
//             if (err) throw err;
//             console.log(result);
//             res.json(result);
//             client.close();
//         })
           
//     })
    
// });

/*for updating user-profile*/
app.put('/update',function(req,res){
    // console.log(req.params.data);
    // console.log(req.body);
    // console.log(req.params.id);
    var id=req.body._id;
    console.log(id);
    mongoClient.connect(url, { useUnifiedTopology: true },function(err,client){
        if(err) throw err;
        var db=client.db('busDb');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('passenger').updateOne({ _id: ObjectId(id) },{$set:{name:req.body.name,id:req.body.id,category:req.body.category,price:req.body.price,
            image:req.body.image,description:req.body.description}},function(err,data){
            if(err) throw err;
            client.close();
            if(data.modifiedCount==1){
                res.json({
                    message:"Updated!!"
                })
            }
            else{
                res.json({
                    message:'not updated..something went wrong!Try again after sometime'
                })
            }
            
        })    
        })
    
    });

// to get all the users ..  
app.get('/allusers',function(req,res){
    mongoClient.connect(url,function(err,client){ //connecting to mongodb
        if(err) throw err;
        var db=client.db("busDb") //fetching the db 

        var userData=db.collection("passenger").find().toArray( //selecting the db and converting the data 
            function(err,result){
                if(err) throw err;
                console.log(result);
                if(!result){
                    client.close()
                    res.json({
                        status:400,
                        message:"error"
                    })
                    
                }else{
                    res.json(
                        {
                            status:200,
                            data:result
                        }
                    );
                    client.close()
                }
                
            }
        )
    })
})
//to get all the unapproved buses 
app.get('/allbuses',function(req,res){
    mongoClient.connect(url,function(err,client){ //connecting to mongodb
        if(err) throw err;
        var db=client.db("busDb") //fetching the db 

        var userData=db.collection("Bus").find({"approval_status":"pending"}).toArray( //selecting the db and converting the data 
            function(err,result){
                if(err) throw err;
                console.log(result);
                res.json(result);
                client.close()
            }
        )
    })
})

app.get('/allbusops',function(req,res){
    mongoClient.connect(url,function(err,client){ //connecting to mongodb
        if(err) throw err;
        var db=client.db("busDb") //fetching the db 

        var userData=db.collection("bus_operator").find({"approval" : "pending"}).toArray( //selecting the db and converting the data 
            function(err,result){
                if(err) throw err;
                console.log(result);
                res.json(result);
                client.close()
            }
        )
    })
})


app.post('/signup', function (req, res) {
    console.log("inside sign up api");
    console.log(req.body);
    
    var uniqueid = generate_id(req.body.name);
    req.body.unique_id = uniqueid;

    if(req.body.category=="User"){
        var mdb="passenger";
        req.body.tickets=[];
        console.log(mdb);
    }else{
        var mdb="bus_operator";
        req.body.approval="pending";        //should be added to admin data also 
        req.body.my_buses=[];
        console.log(mdb);
    }


    //function to generate unique id 
    function generate_id(name) {
        var unique = name.slice(0, 3);
        var characters = '0123456789';
        var len = characters.length;
        for (var i = 0; i < 5; i++) {
            unique += characters.charAt(Math.floor(Math.random() * len));
        }
        console.log("unique" + unique)
        return unique
    }

//bcrypt method 

 mongoClient.connect(url, { useUnifiedTopology: true } ,function(err,client){
        if(err) throw err;
        var db=client.db("busDb")

        bcrypt.genSalt(saltRounds,function(err,salt){
            if(err) throw err;

            console.log(salt)
            bcrypt.hash(req.body.password,salt,function(err,hash){
                if(err) throw err;
                console.log(hash)
                var newData=hash;
                //is the below line ok??who knows?
                req.body.password=newData;

    //finding a user with similar credentials
    //you ask why the 'or' condition -suppose the user has not filled the field then ..?
                console.log('data which is going to be inserted '+req.body);
    db.collection(mdb).findOne({$or:[{email:req.body.email},{phnumber:req.body.phnumber},{name:req.body.name}]},function(err,data){

                if (err) throw err;
                
                if(!data){      //suppose data is not found-insert the data

                    var userData= db.collection(mdb).insertOne(req.body,function(err,data){
                    if(err) throw err;
                    client.close();
                    res.json({
                        status:200,
                        message:"user Inserted"
                    })
                })


                }else{
                    client.close();
                    res.json({
                        status:400,
                        message:"error"
                        
                    })
                }
                
    })                          //findOne ends..

               

            })      //bcrypt.hash
        })          //bcrypt.gensalt

    })              //mongoclient





});             //app.post

app.post('/signin',function(req,res){
    // console.log(req.body);
    let a=req.body;
     if(a[1].category=="User"){
        var mdb="passenger";
        
    }else{
        var mdb="bus_operator";
       
        
    }
    

    mongoClient.connect(url,{ useUnifiedTopology: true } ,function(err,client){
        if(err) throw err;
        var db=client.db("busDb");
        // var query1=a[2].email.trim()
        // a[2].email=query1;
        // console.log(a[2]);
        db.collection(mdb).findOne(a[2],function(err,data){ //finding using the email or number or name
            if(err) throw err;
            console.log('data'+data);
            console.log(a[0].password,a[2]);
            bcrypt.compare(a[0].password,data.password,function(err,result){
                if(err) throw err;
                // console.log(result);
                // console.log(data);
                if(result){
                    res.json({
                        status:200,
                        message:"User found!",
                        userdata:data
                    })
                   
                }
                else{
                   res.json({
                       status:400,
                       message:"user not found"
                       
                   })
                }
            })
        })
    })
})

app.listen(3040, function () {
    console.log('port is running on 3040')
});
