var assert = require("assert");
var service = require("../service");
var sinon = require("sinon");

var ServiceProviderStub = function(){
	this.actions = {};
	this.all = function(path, action){
		this.actions[path] = action;
	};
	this.listen = function(){};	
	this.request =  function(path, params, response){
		this.actions[path](params, response);
	}
	

}

var ResponseStub = function(){
	this.render = function(){}
	this.sendfile = function(){}
	this.send = function(){}
	this.download = function(){}
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

	describe("on init", function(){
		it("should not call 'all' function on empty action list", function(){
			serviceProviderStub.all = sinon.mock().never();
			service.http([], serviceProviderStub);

		});

		it("should call 'all' function twice on two elem action list", function(){
			var actions = [ 
			an(action().withPath("a1").withFunctionalAction(function(){})),
			an(action().withPath("a2").withFunctionalAction(function(){}))
			];
		
			serviceProviderStub.all = sinon.mock().twice();
			service.http(actions, serviceProviderStub);
			
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
		beforeEach(function(){			
			response = new ResponseStub();
		});

		it("should call sendFile once on file action", function(){
			var path = "/a1";
			var filePath = "sampleFilePath";
			var actions = [ 
			an(action().withPath(path).withFileAction(filePath))];
			
			service.http(actions, serviceProviderStub);
			response.sendfile = sinon.mock();
			serviceProviderStub.request(path, {}, response);

		});

		it("should call render once on template action", function(){
			var path = "/a1";
			var template = "sampleTemplatePath";
			var actions = [ 
			an(action().withPath(path).withTemplateAction(template, []))];
			
			service.http(actions, serviceProviderStub);
			response.render = sinon.mock();
			serviceProviderStub.request(path, {}, response);

		});

	})
	
})

