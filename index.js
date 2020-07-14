const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoClient = require('mongodb')
const url = 'mongodb+srv://hima:nature@cluster0-6o34c.mongodb.net/test?retryWrites=true&w=majority';
// const url = 'mongodb://localhost:27017';
const bcrypt = require('bcrypt');
const saltRounds = 10

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

//bus details updated by the operator
app.put('/updatebus', function (req, res) {
    
    var id = req.body._id;
    console.log(id);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('busDb');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('Bus').updateOne({ _id: ObjectId(id) }, {
            $set: {
                Arrival: req.body.Arrival,
                Bus_Name:req.body.Bus_Name,
                Date:req.body.Date,
                Departure:req.body.Departure,
                Destination:req.body.Destination,
                Source:req.body.Source,
            }
        }, function (err, data) {
            if (err) throw err;
            client.close();
            if (data.modifiedCount == 1) {
                res.json({
                    status:200,
                    message: "updated!!"
                })
            }
            else {
                res.json({
                    status:400,
                    message: 'not updated'
                })
            }

        })
    })

});
app.put('/userdelete', function (req, res) {
    //{ reason: 'i dont like her name', _id: '5ef0ea9442c34c22ecb62bd0' }
    var id = req.body._id;
    console.log(id);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('busDb');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('passenger').updateOne({ _id: ObjectId(id) }, {
            $set: {
                message: req.body.reason
            }
        }, function (err, data) {
            if (err) throw err;
            client.close();
            if (data.modifiedCount == 1) {
                res.json({
                    status:200,
                    message: "deleted!!"
                })
            }
            else {
                res.json({
                    status:400,
                    message: 'not deleted'
                })
            }

        })
    })

});


/*for updating user-profile*/
app.put('/updateprofile', function (req, res) {
    // {Id: "kk12344", Name: "kk", Email: "kk@df.com", Phone: 7094633970, _id: "5ef0ec1a42c34c22ecb62bd2"}
    var id = req.body._id;
    // console.log(id);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('busDb');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('passenger').updateOne({ _id: ObjectId(id) }, {
            $set: {
                name: req.body.Name, email: req.body.Email, phnumber: req.body.Phone, unique_id: req.body.Id
            }
        }, function (err, data) {
            if (err) throw err;
            client.close();
            if (data.modifiedCount == 1) {
                res.json({
                    status:200,
                    message: "Updated!!"
                })
            }
            else {
                res.json({
                    status:400,
                    message: 'not updated..something went wrong!Try again after sometime'
                })
            }

        })
    })

});

//getting the user-id of passenger to store in local storage when he is reserving the tickets
app.post('/getuserid',function(req,res){
    // console.log(req.body)
    var cat=req.body;   //cat is an object 
    

    mongoClient.connect(url,{ useUnifiedTopology: true },function(err,client){
        if(err) throw err;
        var db=client.db("busDb")
        var ObjectId = require('mongodb').ObjectID;
        var userData= db.collection("passenger").findOne(cat,function(err, result){
            if (err) throw err;
            // console.log(result);
            if(result){
                res.json({
                    status:200,
                    userid:result._id
                });
            }else{
                res.json({
                    status:400,
                    message:error
                })
            }
            
            client.close();
        })

    })

});

//get all the buses of the operator
app.get('/findbusofoperator/:id',function(req,res){
    // console.log(req.params)
    var cat=req.params.id;
    // console.log('inside findbusofoperator get method');
    // console.log(cat);

    mongoClient.connect(url,{ useUnifiedTopology: true },function(err,client){
        if(err) throw err;
        var db=client.db("busDb")
        var userData= db.collection("Bus").find({"Bus_operator_id":cat}).toArray(
            function(err, result){
            if (err) throw err;
            // console.log(result);
            if(!result){
                res.json({
                    status:400,
                    message:"no data found"
                })
            }else{
                res.json({
                    status:200,
                    data:result
                });
            }
            client.close();
        })

    })

});

//to add the bus in bus operator db 
app.put('/addbustooperator', function (req, res) {
    
    // console.log(req.body);
    var id = req.body._id;

    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('busDb');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('bus_operator').updateOne({ _id: ObjectId(id) }, {
            $push: {
                my_buses: {"Bus_ID":req.body.Bus_ID,Bus_Name:req.body.Bus_Name}
            }
        }, function (err, data) {
            if (err) throw err;
            client.close();
            if (data.modifiedCount == 1) {
                res.json({
                    status:200,
                    message: "Updated!!"
                })
            }
            else {
                res.json({
                    message: 'not updated'
                })
            }

        })
    })

});

//*******TO CANCEL THE TICKETS in tickets db ********
app.put('/cancelticketfromdb', function (req, res) {
    // let obj={"ticketid":ticketid}
    // console.log(req.body);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('busDb');

        db.collection('Ticket').updateOne({ ticketid:req.body.ticketid}, {
            $set: {
                "Status": "cancelled"
            }
        }, function (err, data) {
            if (err) throw err;
            client.close();
            if (data.modifiedCount == 1) {
                res.json({
                    status:200,
                    message: "Updated!!"
                })
            }
            else {
                res.json({
                    status:400,
                    message: 'not updated..something went wrong!Try again after sometime'
                })
            }

        })
    })

});


//*~*~*~*~TO CANCEL THE TICKETS FROM PASSENGER DB*~*~*~*~
app.put('/cancelticket', function (req, res) {
    // let obj={"_id":userid,"ticketid":ticketid}
    var id = req.body._id;
   
    // console.log(req.body);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('busDb');
        var ObjectId = require('mongodb').ObjectID;                // Authors:{$elemMatch:{Slug:"slug"}}
        db.collection('passenger').updateOne({ _id: ObjectId(id),tickets:{$elemMatch:{ticketid:req.body.ticketid}}}, {
            $set: {
                "tickets.$.Status": "cancelled"
            }
        }, function (err, data) {
            if (err) throw err;
            client.close();
            if (data.modifiedCount == 1) {
                res.json({
                    status:200,
                    message: "Updated!!"
                })
            }
            else {
                res.json({
                    status:400,
                    message: 'not updated..something went wrong!Try again after sometime'
                })
            }

        })
    })

});
app.get('/getuserdata/:id',function(req,res){
    // console.log(req.params)
    var cat=req.params.id;
    // console.log('inside the find a single bus data get method');
    // console.log(cat);

    mongoClient.connect(url,{ useUnifiedTopology: true },function(err,client){
        if(err) throw err;
        var db=client.db("busDb")
        var ObjectId = require('mongodb').ObjectID;
        var userData= db.collection("passenger").findOne({_id:ObjectId(cat)},function(err, result){
            if (err) throw err;
            // console.log(result);
            res.json({
                status:200,
                message:result
            });
            client.close();
        })

    })

});


//to add the ticket in ticket db 
app.post('/addticket', function (req, res) {
    // console.log('inside add ticket api ');
    // console.log(req.body);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDb")
        db.collection("Ticket").insertOne(req.body, function (err, data) {
            if (err) throw err;
            client.close();
            res.json({
                status: 200,
                message: "data inserted"
            })

        })

    })

});

//to update seats in bus db after ticket confirmation
app.put('/updateseats', function (req, res) {
    // let updateseats={"bus_id":this.bus._id,"seatList":this.seat}
    // console.log('inside update seats api ');
    // console.log(req.body);
    var id = req.body.bus_id;
    // console.log(id);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('busDb');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('Bus').updateOne({ _id: ObjectId(id) }, {
            $set: {
                all_seats: req.body.seatList
            }
        }, function (err, data) {
            if (err) throw err;
            client.close();
            if (data.modifiedCount == 1) {
                res.json({
                    status:200,
                    message: "Updated!!"
                })
            }
            else {
                res.json({
                    message: 'not updated..something went wrong!Try again after sometime'
                })
            }

        })
    })

});

//to add the ticket in passenger db 
app.put('/userticket', function (req, res) {
    // let addticket={user_id:this.user._id,ticket:this.ticket}
    // console.log('inside update tickets in user db api');
    // console.log(req.body);
    var id = req.body.user_id;
    // console.log(id);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('busDb');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('passenger').updateOne({ _id: ObjectId(id) }, {
            $push: {
                tickets: req.body.ticket
            }
        }, function (err, data) {
            if (err) throw err;
            client.close();
            if (data.modifiedCount == 1) {
                res.json({
                    status:200,
                    message: "Updated!!"
                })
            }
            else {
                res.json({
                    message: 'not updated..something went wrong!Try again after sometime'
                })
            }

        })
    })

});


//**to add bus**
app.post('/addbus', function (req, res) {
    // console.log('inside add bus api ');
    // console.log(req.body);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDb")
        db.collection("Bus").insert(req.body, function (err, data) {
            if (err) throw err;
            client.close();
            res.json({
                status: 200,
                message: "data inserted"
            })

        })

    })

});


/*to get buses*/
app.post('/findbus', function (req, res) {
    // console.log("inside findbus api ");
    // console.log(req);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) { //connecting to mongodb
        if (err) throw err;
        var db = client.db("busDb") //fetching the db 
        var userData = db.collection("Bus").find(
            {
                Source: req.body.Source,
                Date: req.body.Date,
                Destination: req.body.Destination,
                approval_status: "approved"
            }
        ).toArray( //selecting the db and converting the data 
            function (err, result) {
                if (err) throw err;
                // console.log(result);
                if (result) {
                    res.json({
                        status: 200,
                        data: result
                    });
                    client.close()
                }
                else {
                    client.close()
                    res.json({
                        status: 400,
                        data:'no buses found'
                    })


                }

            }
        )
    })
})
 

app.get('/getbusdata/:id',function(req,res){
    // console.log(req.params)
    var cat=req.params.id;
    // console.log('inside the find a single bus data get method');
    // console.log(cat);

    mongoClient.connect(url,{ useUnifiedTopology: true },function(err,client){
        if(err) throw err;
        var db=client.db("busDb")
        var ObjectId = require('mongodb').ObjectID;
        var userData= db.collection("Bus").findOne({_id:ObjectId(cat)},function(err, result){
            if (err) throw err;
            // console.log(result);
            res.json(result);
            client.close();
        })

    })

});



app.put('/busapproval', function (req, res) {
    
    var id = req.body._id;
  
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('busDb');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('Bus').updateOne({ _id: ObjectId(id) }, {
            $set: {
             approval_status:"approved"
            }
        }, function (err, data) {
            if (err) throw err;
            // console.log(data)
            client.close(); 
            if (data.modifiedCount == 1) {
                res.json({
                    status:200
                })
            }
            else {
                res.json({
                    status:400
                })
            }

        })
    })

});

app.put('/userdelete', function (req, res) {
    var id = req.body._id;
    // console.log(id);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('busDb');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('passenger').updateOne({ _id: ObjectId(id) }, { $set: { message: req.body.message } }, function (err, data) {
            if (err) throw err;
            client.close();
            if (data.modifiedCount == 1) {//modifiedCount:
                res.json({
                    message: "Updated!!"
                })
            }
            else {
                res.json({
                    message: 'not updated..something went wrong!Try again after sometime'
                })
            }

        })
    })

});

//approving bus operators..
app.put('/operatorapproval', function (req, res) {
    var id = req.body._id;
    // console.log(id);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('busDb');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('bus_operator').updateOne({ _id: ObjectId(id) }, {
            $set: {
                approval : "approved"
            }
        }, function (err, data) {
            if (err) throw err;
            client.close();
            if (data.modifiedCount == 1) {
                res.json({
                    status:200,
                    message: "Updated!!"
                })
            }
            else {
                res.json({
                    status:400,
                    message: 'not updated..something went wrong!Try again after sometime'
                })
            }

        })
    })

});


// to get all the users ..  
app.get('/allusers', function (req, res) {
    mongoClient.connect(url, function (err, client) { //connecting to mongodb
        if (err) throw err;
        var db = client.db("busDb") //fetching the db 

        var userData = db.collection("passenger").find().toArray( //selecting the db and converting the data 
            function (err, result) {
                if (err) throw err;
                // console.log(result);
                if (!result) {
                    client.close()
                    res.json({
                        status: 400,
                        message: "error"
                    })

                } else {
                    res.json(
                        {
                            status: 200,
                            data: result
                        }
                    );
                    client.close()
                }

            }
        )
    })
})

//to get all the unapproved buses 
app.get('/allbuses', function (req, res) {
    mongoClient.connect(url, function (err, client) { //connecting to mongodb
        if (err) throw err;
        var db = client.db("busDb") //fetching the db 

        var userData = db.collection("Bus").find({ "approval_status": "pending" }).toArray( //selecting the db and converting the data 
            function (err, result) {
                if (err) throw err;
                // console.log(result);
                res.json(result);
                client.close()
            }
        )
    })
})

//getting all the unapproved bus operators
app.get('/allbusops', function (req, res) {
    mongoClient.connect(url, function (err, client) { //connecting to mongodb
        if (err) throw err;
        var db = client.db("busDb") //fetching the db 

        var userData = db.collection("bus_operator").find({ "approval": "pending" }).toArray( //selecting the db and converting the data 
            function (err, result) {
                if (err) throw err;
                // console.log(result);
                res.json(result);
                client.close()
            }
        )
    })
})


app.post('/signup', function (req, res) {
    // console.log("inside sign up api");
    // console.log(req.body);

    var uniqueid = generate_id(req.body.name);
    req.body.unique_id = uniqueid;

    if (req.body.category == "User") {
        var mdb = "passenger";
        req.body.tickets = [];
    
        // console.log(mdb);
    } else {
        var mdb = "bus_operator";
        req.body.approval = "pending";        //should be added to admin data also 
        req.body.my_buses = [];
        // console.log(mdb);
    }


    //function to generate unique id 
    function generate_id(name) {
        var unique = name.slice(0, 3);
        var characters = '0123456789';
        var len = characters.length;
        for (var i = 0; i < 5; i++) {
            unique += characters.charAt(Math.floor(Math.random() * len));
        }
      
        return unique
    }

    //bcrypt method 

    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDb")

        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) throw err;

            // console.log(salt)
            bcrypt.hash(req.body.password, salt, function (err, hash) {
                if (err) throw err;
                // console.log(hash)
                var newData = hash;
                //is the below line ok??who knows?
                req.body.password = newData;

                //finding a user with similar credentials
                //you ask why the 'or' condition -suppose the user has not filled the field then ..?
                // console.log('data which is going to be inserted ');
                // console.log(req.body)
                db.collection(mdb).findOne({ $or: [{ email: req.body.email }, { phnumber: req.body.phnumber }, { name: req.body.name }] }, function (err, data) {

                    if (err) throw err;

                    if (!data) {      //suppose data is not found-insert the data

                        var userData = db.collection(mdb).insertOne(req.body, function (err, data) {
                            if (err) throw err;
                            client.close();
                            res.json({
                                status: 200,
                                message: "user Inserted"
                            })
                        })


                    } else {
                        client.close();
                        res.json({
                            status: 400,
                            message: "error"

                        })
                    }

                })                          //findOne ends..



            })      //bcrypt.hash
        })          //bcrypt.gensalt

    })              //mongoclient





});             //app.post



app.post('/signin', function (req, res) {
    console.log(req.body);
    // [{category: "User"} userInput: "sindukumar", password: "sindu123"}]
    let a = req.body;
    if (a[1].category == "User") {
        var mdb = "passenger";

    } else {
        var mdb = "bus_operator";


    }

    console.log(a[2]);
    mongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDb");
       
        db.collection(mdb).findOne(a[2], function (err, data) {     //finding using the email or number or name
            if (err) throw err;
            if(data==null){          //if data is not found then send notification
                client.close();
                res.json({
                    status:404,
                    message:"No such user found"
                })
            }else{

            //     console.log('data' + data);
            // console.log(a[0].password, a[2]);
            bcrypt.compare(a[0].password, data.password, function (err, result) {
                if (err) throw err;
                // console.log(result);
                // console.log(data);
                if (result) {
                   
                    res.json({
                        status: 200,
                        message: "User found!",
                        userdata: data
                    })
                    client.close();
                }
                else {
                    client.close();
                    res.json({
                        status: 400,
                        message: "wrong password.Please try again"

                    })            
                }
            
            })
        }
        })
    })
})

app.listen(process.env.PORT, function () {
    console.log('port is running')
});
