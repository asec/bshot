bshot.utils.fontMeasurement = {

	ctx: null,

	createContext: function()
	{
		var canvas = document.createElement("canvas");
		this.ctx = canvas.getContext('2d');
	},

	measureText: function(style, text)
	{
		if (!this.ctx)
		{
			this.createContext();
		}
		this.ctx.font = style.fontStyle + " " + style.fontVariant + " " + style.fontWeight + " " + style.fontSize + " " + style.fontFamily;
		return this.ctx.measureText(text).width;
	}

};

bshot.utils.getStyles = function(e, isRoot)
{
	isRoot = !!isRoot;
	if (!(e instanceof jQuery))
	{
		e = jQuery(e);
	}
	if (!e.data("bshot.styleObject"))
	{
		e.data("bshot.styleObject", isRoot ? e.find("body").getStyleObject() : e.getStyleObject());
	}
	return e.data("bshot.styleObject");
};

bshot.utils.isBlock = function(e)
{
	var style = this.getStyles(e);
	return (style.display === "block" || style.display === "list-item" || style.display === "table");
};

bshot.utils.isInline = function(e)
{
	if (e.nodeType === 3)
	{
		return true;
	}
	var style = this.getStyles(e);
	return (style.display === "inline" || style.display === "inline-table" || style.display === "inline-block");
};

bshot.utils.getBackgroundImage = function(str)
{
	return str.substr(4, str.length - 5).replace(/"|'/g, "");
};

bshot.utils.collapseWhiteSpaces = function(str)
{
	return str.replace(/\s+/g, " ");
};

bshot.utils.renderBackground = function(rtNode, ctx)
{
	var isRoot = rtNode.isRoot;
	var style = rtNode.renderingStyle;
	var w = rtNode.width;
	var h = rtNode.height;
	var top = rtNode.yPos;
	var left = rtNode.xPos;
	// Ez a négy érték tartalmazza a bordert is, ezért ezeket kivonjuk belőlük
	if (!isRoot)
	{
		var blw = rtNode.borderWidth[3];//parseInt(style.borderLeftWidth, 10);
		var btw = rtNode.borderWidth[0];//parseInt(style.borderTopWidth, 10);
		w -= blw + rtNode.borderWidth[1];//parseInt(style.borderRightWidth, 10);
		left += blw;
		h -= btw + rtNode.borderWidth[2];//parseInt(style.borderBottomWidth, 10);
		top += btw;
	}
	// 1. A háttérszín
	ctx.save();
	ctx.translate(left + 0.49, top);
	ctx.fillStyle = style.backgroundColor;
	ctx.beginPath();
	ctx.rect(0, 0, w, h);
	ctx.fill();
	// 2. A háttérkép
	if (style.backgroundImage && style.backgroundImage !== "none")
	{
		var img = bshot.resources.ImageManager.get(bshot.utils.getBackgroundImage(style.backgroundImage));
		// Pozícionáljuk
		var bgPos = style.backgroundPosition;
		var realPos = null;
		if (bgPos && bgPos.length > 0)
		{
			bgPos = bgPos.split(" ");
			realPos = [0, 0];
			for (var i = 0; i < 2; i++)
			{
				// Megnézzük pixel vagy százalék érték-e
				var pixel = (bgPos[i].indexOf("%") === -1);
				bgPos[i] = parseInt(bgPos[i], 10);
				if (bgPos[i] === 0)
				{
					continue;
				}
				if (pixel)
				{
					realPos[i] = bgPos[i];
				}
				else
				{
					var cb = rtNode;//.getContainingBlock().renderObject;
					var selector = (i === 0) ? "width" : "height";
					realPos[i] = Math.abs(img[selector] - cb[selector]);
					realPos[i] = -1 * Math.round(realPos[i] * (bgPos[i] / 100));
				}
			}
			ctx.save();
			ctx.translate(realPos[0], realPos[1]);
		}
		var pattern = ctx.createPattern(img, style.backgroundRepeat);
		ctx.fillStyle = pattern;
		ctx.fill();
		if (realPos)
		{
			ctx.restore();
		}
	}
	// 3. A border
	this.renderBorder(rtNode, ctx, "top", w, h, 0, 0,
		(style.borderLeftStyle !== "none" && style.borderLeftStyle !== "hidden") ? rtNode.borderWidth[3] : 0, // borderLeftWidth
		(style.borderRightStyle !== "none" && style.borderRightStyle !== "hidden") ? rtNode.borderWidth[1] : 0 // borderRightWidth
	);
	this.renderBorder(rtNode, ctx, "right", w, h, 0, 0,
		(style.borderTopStyle !== "none" && style.borderTopStyle !== "hidden") ? rtNode.borderWidth[0] : 0, // borderTopWidth
		(style.borderBottomStyle !== "none" && style.borderBottomStyle !== "hidden") ? rtNode.borderWidth[2] : 0 // borderBottomWidth
	);
	this.renderBorder(rtNode, ctx, "bottom", w, h, 0, 0,
		(style.borderLeftStyle !== "none" && style.borderLeftStyle !== "hidden") ? rtNode.borderWidth[3] : 0, // borderLeftWidth
		(style.borderRightStyle !== "none" && style.borderRightStyle !== "hidden") ? rtNode.borderWidth[1] : 0 // borderRightWidth
	);
	this.renderBorder(rtNode, ctx, "left", w, h, 0, 0,
		(style.borderTopStyle !== "none" && style.borderTopStyle !== "hidden") ? rtNode.borderWidth[0] : 0, // borderTopWidth
		(style.borderBottomStyle !== "none" && style.borderBottomStyle !== "hidden") ? rtNode.borderWidth[2] : 0 // borderBottomWidth
	);
	
	ctx.restore();
};

bshot.utils.renderBorder = function(rtNode, ctx, border, w, h, left, top, before, after)
{
	var style = rtNode.renderingStyle;
	var selector = "border" + border.substr(0, 1).toUpperCase() + border.substr(1);
	if (style[selector + "Style"] === "none" || style[selector + "Style"] === "hidden")
	{
		return false;
	}
	var startPos, endPos;
	switch (border)
	{
		case "top":
			startPos = { x: left - before, y: top - parseInt(style[selector + "Width"], 10) };
			endPos = { x: left + w + after, y: startPos.y };
			break;
		case "bottom":
			startPos = { x: left - before, y: top + h + parseInt(style[selector + "Width"], 10) };
			endPos = { x: left + w + after, y: startPos.y };
			break;
		case "left":
			startPos = { x: left - parseInt(style[selector + "Width"], 10), y: top - before };
			endPos = { x: startPos.x, y: top + h + after};
			break;
		case "right":
			startPos = { x: left + w + parseInt(style[selector + "Width"], 10), y: top - before };
			endPos = { x: startPos.x, y: top + h + after};
			break;
	}
	if ((style[selector + "Style"] === "dashed" || style[selector + "Style"] === "dotted") && typeof ctx.setLineDash === "function")
	{
		ctx.setLineDash((style[selector + "Style"] === "dotted") ? [1, 1] : [2, 2]);
	}
	ctx.save();
	ctx.beginPath();
	// TODO: komolyabb megoldást keresni
	// Az anti-aliasing kiküszöbölésére
	ctx.translate(((border === "right" || border === "bottom") ? -1 : 1) * 0.49, ((border === "right" || border === "bottom") ? -1 : 1) * 0.49);
	ctx.moveTo(startPos.x, startPos.y);
	ctx.lineTo(endPos.x, endPos.y);
	ctx.strokeStyle = style[selector + "Color"];
	ctx.lineWidth = parseInt(style[selector + "Width"], 10);
	ctx.stroke();
	ctx.restore();
};

if (!String.prototype.trim)
{
	String.prototype.trim = function(){return this.replace(/^\s+|\s+$/g, '');};
}

if (!String.prototype.ucFirst)
{
	String.prototype.ucFirst = function(){return this.substring(0, 1).toUpperCase() + this.substring(1).toLowerCase();};
}