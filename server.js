const
	express     = require('express'),
	app         = express(),
	server      = require('http').Server(app),
	fs          = require('fs'),
	twig        = require('twig');

server.listen(process.env.PORT || 8000);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/index.html');
});

app.use('/resources', express.static(__dirname+'/public/resources'));

/* - - - - - - - */

function loadFile(filePath){
	return new Promise(function(resolve, reject){
		
		fs.readFile(filePath, 'utf8', function(err, data){
			if(err){
				reject(err);
			}
			resolve(data);
		});
		
	})
}

function writeFile(filePath, dataIn){
	return new Promise(function(resolve, reject){
		
		fs.writeFile(filePath, dataIn, function(err){
			if(err){
				reject(err);
			}
			resolve();
		});
		
	})
}

/* - - - - - - - */

function matchIntents(_query, obj){
	
	let
	splittedQuery = _query.split(' '),
	scores        = {},
	output        = {};
	
	obj = JSON.parse(obj);
	
	
	
	for(let i in obj.intents){ // intent in intents
		for(let i2 in obj.intents[i].intent){ // each item from each combo array
			for(let i3 in obj.entities[obj.intents[i].intent[i2]]){ // each synonym
				for(let i4=0; i4<splittedQuery.length; i4++){ // each splitted query word
					
					let
					a = splittedQuery[i4],
					b = i3;
					
					if(a == b){ // each query word == actual synonym
						//console.log('matching', i, a);
						
						if(!scores[i]){scores[i] = []}
						scores[i].push(a);
						
						//console.log('scores', i, scores);
					}
					
					
					//console.log(obj.intents[i].parameters);
					for(let parameter in obj.intents[i].parameters){
						for(let param in obj.entities[obj.intents[i].parameters[parameter]['name']]){
							if(a == param){
								//console.log('found param', param);
								if(!scores[i]){scores[i] = []}
								
								let _param = '_param_'+param;
								if(scores[i].indexOf(_param) >= 0){
									//found
								}else{
									scores[i].push(_param);
								}
								
							}
						}
					}
				}
				
			}
			
		}
	}
	
	//console.log(scores);
	
	
	// create DESC winners
	
	let winnersArray = [];
	for(let key in scores){
		winnersArray.push([key, scores[key]]);
	}
	winnersArray.sort(function(a, b){
		return a[1].length - b[1].length
	}).reverse();
	console.log(winnersArray);
	
	
	// construct output
	
	output.query = _query;
	for(let i=0; i<winnersArray.length; i++){
		// add array with "original" params (as it was with variable)
		winnersArray[i].push(obj.intents[winnersArray[0][0]].parameters);
		
		// modify the just added array (pick params from db obj)
		if(winnersArray[i][2]){
			for(let i2=0; i2<winnersArray[i][2].length; i2++){
				if(obj.entities[winnersArray[i][2][i2]['name']]){
					winnersArray[i][2][i2]['name'] = obj.entities[winnersArray[i][2][i2]['name']];
				}
			}
		}
	}
	output.results = winnersArray;
	
	
	
	
	return output;
}

/* - - - - - - - */

app.get('/get', function(req, res){
	
	loadFile('model1.json')
	.then(function(data){
		res.json(data);
	})
	.catch(function(err){
		console.log(err);
		res.json('some error occurred');
	});
	
});

app.get('/save', function(req, res){
	
	let query = JSON.parse(decodeURIComponent(req.query.q));
	//console.log(query);
	
	writeFile('model1.json', query)
	.then(function(){
		console.log('file written');
		res.json('ok');
	})
	.catch(function(err){
		console.log(err);
		res.json('some error occurred');
	});
	
});

app.get('/admin', function(req, res){
	
	res.sendFile(__dirname + '/views/admin.html');
	
});

app.get('/go', function(req, res){
	
	let query = req.query;
	//console.log(query);
	
	
	loadFile('model1.json')
	.then(function(data){
		//console.log(data);
		
		let response = matchIntents(query.q, data);
		
		app.set('json spaces', 2);
		res.json(response);
		
	})
	.catch(function(err){
		console.log(err);
		res.json('some error occurred');
	});
	
	
});










