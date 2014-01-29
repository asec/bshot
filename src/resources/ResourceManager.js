bshot.resources.ResourceManager = function()
{
	
	this.resources = {};
	this.total = 0;
	this.loaded = 0;
	
};

bshot.resources.ResourceManager.prototype.set = function(key, object){ console.log(["This method is not implemented", key, object]); };
bshot.resources.ResourceManager.prototype.get = function(key){ console.log(["This method is not implemented", key]); };
bshot.resources.ResourceManager.prototype.load = function(callback){ console.log(["This method is not implemented", callback]); };