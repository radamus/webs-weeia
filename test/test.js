var assert = require("assert");
var service = require("../service");

var ServiceProviderStub = function(){
	this.all = function() {}
	this.listen = function() {}
}
ServiceProviderStub.Request = function(){
	this.renderView = function(){}
	this.sendFile = function(){}
	this.send = function(){}
	this.download = function(){}
}



var testServiceProvider = function(){
	return new ServiceProviderStub();
}



describe("service", function(){

})

