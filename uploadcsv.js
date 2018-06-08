var express = require('express');

var csv = require("fast-csv");

var router = express.Router();

var fs = require('fs');

app = express();
var server = app.listen(3000);

var mongoose = require('mongoose');

mongoose.connect('mongodb://username:password@ds247330.mlab.com:47330/battles');

var promise = require('promise');
var url = require('url');

var Battle  = require("./battle.js");
//mongoose.model('Battle');

var csvfile = __dirname + "/battles.csv";

var stream = fs.createReadStream(csvfile);



app.get('/import', function(req, res, next) {

    var  battle  = []
    
var csvStream = csv()
        .on("data", function(data){
         
         var item = new Battle({

              name: data[0],

              year: data[1],

              battle_number: data[2],
			  
			  attacker_king:data[3],
			defender_king:data[4],
			attacker_1:data[5],
			attacker_2:data[6],
			attacker_3:data[7],
			attacker_4:data[8],
			defender_1:data[9],
			defender_2:data[10],
			defender_3:data[11],
			defender_4:data[12],
			attacker_outcome:data[13],
			battle_type:data[14],
			major_death:data[15],
			major_capture:data[16],
			attacker_size:data[17],
			defender_size:data[18],
			attacker_commander:data[19],
			defender_commander:data[20],
			summer:data[21],
			location:data[22],
			region:data[23],
			note:data[24] 

         });
         
          item.save(function(error){

            console.log(item);

              if(error){

                   throw error;

              }

          }); 

    }).on("end", function(){
          console.log(" End of file import");
    });
  
    stream.pipe(csvStream);

    res.json({success : "Data imported successfully.", status : 200});
     
  });
  
  //list of all the places
  app.get('/list',function(req,res){
	
	Battle.distinct('location', function(err, docs) {

        if (!err){ 

            res.json({success : "Fetched Successfully", data: docs});

        } else { 

            throw err;
			res.json({success : "Error"});
        }

    });
  });
  
  //#no. of battle occurred
  app.get('/count',function(req,res){
	//Either count total number of entries or max battle_number
	Battle.count({}, function(err, docs) {

        if (!err){ 

            res.json({success : "Fetched Successfully", data: docs});

        } else { 

            throw err;
			res.json({success : "Error"});
        }

    });
  });
  
  function defendermax(){
	console.log("defenderMax");
	return new promise (function(resolve,reject){
		Battle.aggregate([
			{$group : {_id:"$defender_king", count:{$sum:1}}},
			{$sort:{"count":-1}},
			{$limit:1}
		],function(err,docs){
			if (!err){ 
				
				resolve(docs);

			} else { 

				throw err;
				reject ;
				res.json({success : "Error"});
			}
		});
	});
  }
  
  function attackeroutcome(){
	return new promise(function(resolve,reject){
		Battle.aggregate([
			{$group : {_id:"$attacker_outcome", count:{$sum:1}}}
		],function(err,docs){
			if (!err){ 
				
				resolve(docs);

			} else { 

				throw err;
				reject ;
				res.json({success : "Error"});
			}
		});
	});
  }
  
  app.post('/stats',function(req,res){
	var val = {};
	var maxoccurrence = {};
	Battle.aggregate([
		{$group : {_id:"$attacker_king", count:{$sum:1}}},
		{$sort:{"count":-1}},
		{$limit:1}
	],function(err,docs){
		if (!err){ 
			defendermax().then(function(data){
				attackeroutcome().then(function(attackerdata){
					res.json({most_active:{attacker_king:docs[0]._id, defenser_king:data[0]._id},attacker_outcome:attackerdata});
				}).catch(function(err){
					res.json({success : "Error"});
				});
				
			}).catch(function(err){
				console.log("Error");
				console.log(err);
			});

        } else { 

            throw err;
			res.json({success : "Error"});
        }
	});
  });
  
  app.post('/search',function(req,res){
	console.log(req.query.king);
	Battle.find({ $or: [ { attacker_king: req.query.king }, { defender_king: req.query.king }] },function(err, docs){
		if (!err){ 

            res.json({success : "Fetched Successfully", data: docs});

        } else { 

            throw err;
			res.json({success : "Error"});
        }
	});
  });