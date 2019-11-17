const express = require("express");

const bodyParser = require('body-parser');

const server = express();

const jwt = require('jsonwebtoken');

var router = express.Router();

const mysql = require('mysql');


//uncomment it later
//const exec = util.promisify(require('child_process').exec);

var connection = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'',
    database:'bullbase'
});

/*connection.connect(function(err){
    if(!err) {
        console.log("Database is connected ... nn");
    } else {
        console.log("Error connecting database ... nn");
    }
});*/


const secret_key = "sdkfjsldkjflskdfjlsdjflksjdflksdrPInxiiVZ";


server.use(express.static('../'));

server.set('view engine', 'html');


server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json({limit:'50mb'}));
// server.use(upload.array());



var requestParser = bodyParser.urlencoded({ extended: false });

server.use('/apiHome',router);

router.get('/', function(req,res){
    res.json({
        message: "welcome to cicindia's api server"
    });
});


//////////////////////functions declaration/////////////////////////////////////
function createJWT(x,y){
    var claims = {
      email:x,
      iss:"Deloitte CIC",
      iat:Date.now(),
      exp:Math.floor(Date.now()) + (60*30000000),//expiration is never
      type:y
    };
    var token = "";
    try{
        token = jwt.sign(claims, secret_key);
    }
    catch(err){
        token = err.toString();
    }
    return token;
}
////////////////////////////////////////////////////////////////////////////////

router.post('/login',requestParser, function(req,res){
        res.header("Access-Control-Allow-Origin","*");
        var email = req.body.field1;
        var password = req.body.field2;
        var check = `SELECT name,type from creds WHERE name='${email}' AND hash='${password}'`;
        connection.query(check, function(err,result){
                if(err){
                    res.json({
                        "message":err.toString()
                    });
                }
                else{
                    if(result.length==1){
                      console.log(result);
                      var xjwt = createJWT(email,result[0].type);
                      res.statusCode = 200;
                      //res.header("Set-Cookie","cookieName="+ xjwt +";");
                      res.json({
                        "key":xjwt
                      });
                    }
                    else{
                        res.json({
                            "message":"Wrong email or password",
                            "status":"unsuccessful"
                        });
                    }
                }
            });
});



router.post('/shareLocationSer',requestParser, function(req,res){
  res.header("Access-Control-Allow-Origin","*");
  var trackingID = req.body.trackingID;
  var lat = req.body.lat;
  var lng = req.body.lng;
  var check = `UPDATE info SET lat='${lat}',lng='${lng}' WHERE id='${trackingID}'`;
  connection.query(check, function(err,result){
          if(err){
              res.json({
                  "message":err.toString()
              });
          }
          else{
              res.json({
                message:"done"
              })
          }
      });
});


router.post('/shareLocation',requestParser, function(req,res){
  res.header("Access-Control-Allow-Origin","*");
  var trackingID = req.body.trackingID;
  var lat = req.body.lat;
  var lng = req.body.lng;
  var check = `UPDATE info SET dlat='${lat}',dlng='${lng}' WHERE id='${trackingID}'`;
  connection.query(check, function(err,result){
          if(err){
              res.json({
                  "message":err.toString()
              });
          }
          else{
              res.json({
                message:"done"
              })
          }
      });
});


router.get('/getLocation',requestParser, function(req,res){
  res.header("Access-Control-Allow-Origin","*");
  var trackingID = req.query.trackingID;
  var check = `SELECT * from info where id='${trackingID}'`;
  connection.query(check, function(err,result){
          if(err){
              res.json({
                  "message":err.toString()
              });
          }
          else{
              res.json({
                message:result[0]
              })
          }
      });
});




router.get("/test",function(req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.set({
     'content-type': 'application/json',
     'Warning': "Private and confidential. Unauthorized use is prohibited."
  });
    res.json({
        "message":"it works"
    });

});

server.listen(3333,()=>console.log("server started here"));
