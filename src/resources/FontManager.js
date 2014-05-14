bshot.resources.FontManager = function()
{
	
};

bshot.resources.FontManager.prototype = new bshot.resources.ResourceManager();

bshot.resources.FontManager.prototype.get = function(fontFamily, fontSize)
{
	return this.resources[this.getKey(fontFamily, fontSize)];
};

bshot.resources.FontManager.prototype.getKey = function(fontFamily, fontSize)
{
	var key = fontFamily + "|" + fontSize;
	return key.toLowerCase();
};

bshot.resources.FontManager.prototype.set = function(fontFamily, fontSize, value)
{
	this.resources[this.getKey(fontFamily, fontSize)] = value;
};

bshot.resources.FontManager.prototype.measureTextHeight = function(fontFamily, fontSize)
{
	var value = this.get(fontFamily, fontSize);
	if (!value)
	{
		var span = jQuery(document.createElement("div"));
		span
			.css("position", "absolute").css("top", "-9999px")
			.css("margin", "0px").css("padding", "0px").css("border", "0px").css("outline", "0px")
			.css("line-height", "normal").css("font-family", fontFamily).css("font-size", fontSize).css("font-weight", "normal").css("font-style", "normal")
			.attr("id", "bshotFontMeasurement")
			.html("&nbsp;");
		jQuery("body").append(span);
		value = span.height();
		this.set(fontFamily, fontSize, value);
		span.remove();
	}

	return value;
};

bshot.resources.FontManager = new bshot.resources.FontManager();