bshot.resources.ImageManager = function()
{
	
};

bshot.resources.ImageManager.prototype = new bshot.resources.ResourceManager();

bshot.resources.ImageManager.prototype.set = function(key, object)
{
	if (!this.resources.hasOwnProperty(key))
	{
		this.total++;
	}
	this.resources[key] = object;
};

bshot.resources.ImageManager.prototype.get = function(key)
{
	return this.resources[key];
};

bshot.resources.ImageManager.prototype.load = function(callback)
{
	this.loaded = 0;
	var self = this,
		imgLoadedCallback = function()
			{
				self.loaded++;
				self.checkIfDone(callback);
			},
		img;
	for (var i in this.resources)
	{
		if (typeof this.resources[i] !== "Image")
		{
			img = new Image();
			img.onload = imgLoadedCallback;
			img.src = i;
			this.resources[i] = img;
		}
		else
		{
			var complete = true;
			img = this.resources[i];
			if (!img.complete)
			{
				complete = false;
			}
			if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0)
			{
				complete = false;
			}
			if (complete)
			{
				this.loaded++;
				self.checkIfDone(callback);
			}
			else
			{
				img.onload = imgLoadedCallback;
			}
		}
	}
};

bshot.resources.ImageManager.prototype.checkIfDone = function(callback)
{
	if (this.loaded === this.total)
	{
		if (typeof callback === "function")
		{
			return callback.call(this);
		}
		return true;
	}
	return false;
};

bshot.resources.ImageManager = new bshot.resources.ImageManager();