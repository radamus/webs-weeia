var assert = require("assert");
var service = require("../service");
var sinon = require("sinon");

var ServiceProviderStub = function(){
	this.actions = {};
	this.all = function(path, action){
		this.actions[path] = action;
	};
	this.listen = function(){ };	
	this.request =  function(path, params, response){
		this.actions[path](params, response);
	}
	

}

var ResponseStub = function(){
	this.render = sinon.mock().never();
	this.sendfile = sinon.mock().never();
	this.send = sinon.mock().never();
	this.download = sinon.mock().never();

	this.verify = function(){
		var self = this;
		Object.keys(self).forEach(function(key){
			if(self[key].verify){
				self[key].verify();
			}
		});
	}
}

var an = function(actionBuilder){
	return actionBuilder.build();
}

var action = function(){
	return new ActionBuilder();
}

var ActionBuilder = function(){
	this.action = {path:null, action:null};
	return this;
}
ActionBuilder.prototype.build = function(){
	return this.action;
}

ActionBuilder.prototype.withPath = function(path){
	this.action.path = path;
	return this;
}

ActionBuilder.prototype.withFunctionalAction = function(action){
	this.action.action = action;
	return this;
}

ActionBuilder.prototype.withFileAction = function(path){
	this.action.action = path;
	return this;
}

ActionBuilder.prototype.withTemplateAction = function(template, params){
	this.action.action = {template:template, params:params};
	return this;
}

describe("service", function(){
	var serviceProviderStub;
	beforeEach(function(){
		serviceProviderStub = new ServiceProviderStub();				
	});

	describe("on init http", function(){
		
		it("should not call 'all' function on empty action list", function(){
			serviceProviderStub.all = sinon.mock().never();
			service.http([], serviceProviderStub);
			serviceProviderStub.all.verify();

		});

		it("should return a function", function(){			
			assert( service.http([], serviceProviderStub) instanceof Function);
		});

		it("should return a function that call 'listen'", function(){
			var port = 8080;
			serviceProviderStub.listen = sinon.mock();
			service.http([], serviceProviderStub)(port);
			serviceProviderStub.listen.verify();

		});

		it("should throw an exception on undefined listen port ", function(){
			var http = service.http([], serviceProviderStub);
			try{
				http();
			}catch(e){
				assert(true);
				return;
			}
			assert(false);

		});

		it("should call 'all' function twice on two elem action list", function(){
			var actions = [ 
			an(action().withPath("a1").withFunctionalAction(function(){})),
			an(action().withPath("a2").withFunctionalAction(function(){}))
			];
		
			serviceProviderStub.all = sinon.mock().twice();
			service.http(actions, serviceProviderStub);
			serviceProviderStub.all.verify();
			
		});

		it("should throw an exception on duplicated path ", function(){
			var actions = [ 
			an(action().withPath("a1").withFunctionalAction(function(){})),
			an(action().withPath("a1").withFunctionalAction(function(){}))
			];	
			try{
				service.http(actions, serviceProviderStub);
			}catch(e){
				assert(true);
				return;
			}
			assert(false);

		});

		it("should throw an exception on undefined action ", function(){
			var actions = [ 
			an(action().withPath("a1")),			
			];	
			try{
				service.http(actions, serviceProviderStub);
			}catch(e){
				assert(true);
				return;
			}
			assert(false);

		});
	});
	describe("on request", function(){
	
		var response;
		var path;
		var port = 8080;

		beforeEach(function(){			
			response = new ResponseStub();	
			serviceProviderStub.listen = sinon.mock().once();
			path = "/a1";			
		});

		it("should call sendFile once on file action", function(){			
			var filePath = "sampleFilePath";
			var actions = [ 
			an(action().withPath(path).withFileAction(filePath))];
			
			service.http(actions, serviceProviderStub)(port);
			
			response.sendfile = sinon.mock();
			serviceProviderStub.request(path, {}, response);

			serviceProviderStub.listen.verify();
			response.verify();

		});

		it("should call render once on template action", function(){			
			var template = "sampleTemplatePath";
			var actions = [ 
			an(action().withPath(path).withTemplateAction(template, []))];
			
			service.http(actions, serviceProviderStub)(port);
			response.render = sinon.mock();
			serviceProviderStub.request(path, {}, response);
			serviceProviderStub.listen.verify();
			response.verify();
		});

	})
	
})

