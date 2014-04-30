var express = require("express");

var sendFile = function(path) {
	return function(request, callback){
		callback(null, null, path); 
	}
}


var service = function(requestProcessors){
	var app = express();
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
    app.use(express.multipart());
	
	var handlers = {};	
	for(var i = 0; i < requestProcessors.length; i ++){	
		var path = requestProcessors[i].path;		
		var action = requestProcessors[i].action;
		if(handlers[path]) {
			throw new Error(path + " - duplicated path");
		}
		action = (typeof(action) == "function" ? action : sendFile(action));
		handlers[path] = action;
	}

	Object.keys(handlers).forEach(function(key){
		app.all(key, function(request, response){
			console.log("request processing started");
			handlers[key](request, function(err, result, file){
				if(file){
					if(isTemplate(file)){
						renderView(response, file);
					} else {
					response.sendfile(file);
					}
				}
				else if(err) {
						response.send("an error occured " + err);					
				}else {
					var reqResponse = result ? result : "";
					if(isDownload(reqResponse){
						var file = reqResponse.filePath;
  						response.download(file);
					}
					else if(isTemplate(reqResponse)){
						renderView(response, reqResponse);
					}else {
						response.send(reqResponse);
					}
				}
				console.log("request processing finished");					
			});
		});
	});

	return function(port){
		
		app.listen(port);		
	}
}

var renderView = function(response, templateobj){
	response.render(templateobj.template, templateobj.params);
}
exports.http = service;


var isTemplate = function(obj){
	if(obj.template) 
		return true;
	return false;
}

var isDownload(obj){
 if (obj.binary) { return true;}
 return false;
}