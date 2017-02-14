$(window).load(function(){
	
	function performAction(data){
		
		if(data.results[0][0] == 'time'){
			
			console.log('performing action time');
			
			var text = 'it\'s '+getDatetime().readableTime;
			var textSpeech = new SpeechSynthesisUtterance(text);
			window.speechSynthesis.speak(textSpeech);
			
		}
		
		else if(data.results[0][0] == 'date'){
			
			console.log('performing action date');
			
			var text = 'it\'s '+getDatetime().readableDate;
			var textSpeech = new SpeechSynthesisUtterance(text);
			window.speechSynthesis.speak(textSpeech);
			
		}
		
		else if(data.results[0][0] == 'moderateLanguage'){
			
			console.log('performing action moderateLanguage');
			
			var text = 'Please moderate your language';
			var textSpeech = new SpeechSynthesisUtterance(text);
			window.speechSynthesis.speak(textSpeech);
			
		}
		
		else if(data.results[0][0] == 'scheduleMatch'){
			
			console.log('performing action scheduleMatch');
			
		}
		
		else{
			
			console.log('cannot perform action: not recognized');
			
		}
		
	}
	
	
	function ask(query){
		
		$.ajax({
			type: 'GET',
			url: 'go',
			data: {
				q: query
			}
		})
		.done(function(data){
			//console.log(data);
			answer(data);
		})
		.fail(function(){
			console.log('error');
			answer('error');
		});
		
	}
	
	
	function answer(data){
		
		let intentTopName = (data.results && data.results[0] && data.results[0][0] ? data.results[0][0] : 'None');
		//let intentTopParameters = data.results[0][2];
		
		
		// ajax error
		
		if(data == 'error'){
			
			var title = data;
			
			swal({
				type: 'error',
				title: title,
				text: 'Something went wrong with the ajax'
			});
			
		}
		
		// nothing found
		
		else if(intentTopName == 'None'){
			
			var title = intentTopName;
			
			swal({
				type: 'warning',
				title: title,
				text: 'Sorry, no stuff'
			});
			
		}
		
		// something found
		
		else{
			
			// present params
			
			let presentParams = [];
			for(let i=0; i<data.results[0][1].length; i++){
				if(data.results[0][1][i].indexOf('_param_') == 0){
					presentParams.push(data.results[0][1][i]);
				}
			}
			//console.log('presentParams', presentParams);
			
			// required params
			
			let requiredParams = [];
			
			if(presentParams.length){
			for(let i=0; i<data.results[0][2].length; i++){
				if(data.results[0][2][i].required){
					
					requiredParams.push(data.results[0][2][i]);
					
					for(let reqParam in data.results[0][2][i].name){
						for(let i2=0; i2<presentParams.length; i2++){
							if(reqParam == presentParams[i2].replace(/_param_/, '')){
								//console.log('found param:', i, reqParam);
								requiredParams[i] = null;
							}
						}
					}
				}
			}
			}
			
			function clean(array){
			    for(var i=0;i<=8;i++){
			        if(array[i]===null){
			            array.splice(i--,1);
			        }
			    }
			    return array;
			}
			requiredParams = clean(requiredParams);
			
			//console.log(requiredParams);
			
			
			// with dialog
			
			if(requiredParams.length){
				
				// dialog Question (some parameter is missing)
				
				//if(data.dialog.status == 'Question'){
					
					var title = requiredParams[0].question;
					var inputPlaceholder = requiredParams[0].type;
					
					swal({
						title: title,
						input: 'text',
						inputPlaceholder: inputPlaceholder,
						confirmButtonText: 'Submit',
						showLoaderOnConfirm: true,
						showCancelButton: true,
						preConfirm: function(inputValue){
							return new Promise(function(resolve, reject){
								setTimeout(function(){
									if(inputValue === 'notAllowedValue'){
										reject('The value you entered is not allowed');
									}else{
										resolve();
									}
								}, 2000);
							});
						}
					}).then(function(inputValue){
						
						ask(data.query+' '+inputValue);
						
					});
					
				//}
				
				// dialog Finished (all parameters are present)
				
				//else if(data.dialog.status == 'Finished'){
					
					//console.log('Ok, dialog status Finished');
					
					//performAction(data);
					
				//}
				
			}
			
			// with no dialog
			
			else{
				
				/*var title = data.topScoringIntent.intent;
				
				swal({
					type: 'success',
					title: title,
					text: 'Something found'
				});*/
				
				//console.log('Ok, no error or intent None');
				
				performAction(data);
				
			}
			
		}
		
	}
	
	
	function askTrigger(){
		ask($('#ask').val());
	}
	
	$('#ask').on('keydown', function(e){
		if(e.keyCode == 13){
			askTrigger();
		}
	});
	
	$('#askBtn').on('click', function(){
		askTrigger();
	});
	
	
});