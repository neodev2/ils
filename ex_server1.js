const
	express     = require('express'),
	app         = express(),
	server      = require('http').Server(app),
	fs          = require('fs');

server.listen(process.env.PORT || 8000);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/index.html');
});

app.use('/resources', express.static(__dirname+'/public/resources'));

/* - - - - - - - */

const

schedule = {
	'schedule': '',
	'arrange': '',
	'programma': '',
	'fissa': '',
	'prefissa': '',
	'pianifica': '',
	'prenota': '',
	'arrangia': '',
	'stabilisci': '',
	'organizza': '',
	'predisponi': '',
	'disponi': '',
	'setta': '',
	'imposta': '',
	'registra': '',
	'aggiungi': '',
	'crea': '',
	'nuovo': ''
},
appointment = {
	'appuntamento': ''
},
gioca = {
	'sfida': '',
	'play': '',
	'gioca': ''
},
match = {
	'match': '',
	'incontro': '',
	'sfida': '',
	'partita': '',
	'game': '',
	'competition': ''
},
time = {
	'at_6': '',
	'in 5 min': '',
	'morning': ''
},
date = {
	'tomorrow': ''
},
person = {
	'carl': '',
	'peter': '',
	'james': '',
	'anna': ''
},
where = {
	'dentista': ''
},
askingForTheTime = {
	'what_time_is_it': '',
	'what\'s_the_time': ''
},

intents = {
	gioca_match: {
		intent: [gioca, match],
		parameters: [
			{required: true, name: 'time', question: 'time?'},
			{required : true, name: 'date', question: 'date?'},
			{required : true, name: 'opponents', question: 'with who?'}
		]
	},
	schedule_appointment: {
		intent: [schedule, appointment],
		parameters: [
			{required: true, name: time, type: 'time', question: 'time?'},
			{required: true, name: date, type: 'date', question: 'date?'},
			{required: true, name: where, type: 'where', question: 'where?'}
		]
	},
	time: {
		intent: [askingForTheTime]
	},
	date: {
		intent: [date]
	}
};

/* - - - - - - - */

function matchIntents(_query, obj){
	
	let
	splittedQuery = _query.split(' '),
	scores        = {},
	output        = {};
	
	
	for(let i in obj){ // intent in intents
		for(let i2 in obj[i].intent){ // combo array index
			for(let i3 in obj[i].intent[i2]){ // each synonym
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
					
					
					//console.log(intents[i].parameters);
					for(let parameter in intents[i].parameters){
						for(let param in intents[i].parameters[parameter]['name']){
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
		winnersArray[i].push(intents[winnersArray[0][0]].parameters);
	}
	output.results = winnersArray;
	
	
	
	
	return output;
}

/* - - - - - - - */

app.get('/go', function(req, res){
	
	let query = req.query;
	//console.log(query);
	
	let response = matchIntents(query.q, intents);
	
	app.set('json spaces', 2);
	res.json(response);
	
});