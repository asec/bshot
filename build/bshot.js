/*
 * bshot
 * 
 *
 * Copyright (c) 2013 Roland Zsámboki
 * Licensed under the MIT license.
 */
(function($) {
	var lastResult = null;
	var BSHOT_ERROR_NOTSUPPORTED = 1;

	$.fn.bShot = function(method, options)
	{
		if (this.get(0) !== document)
		{
			return false;
		}
		var $this = $(this);

		method = method || "generate";
		var settings = $.extend($.fn.bShot.defaults, options);
		if (typeof method === "object")
		{
			settings = $.extend(settings, method);
			method = "generate";
		}
		if (settings.error && typeof settings.error === "function")
		{
			$this.on("bShotError", settings.error);
		}
		if (settings.done && typeof settings.done === "function")
		{
			$this.on("bShotDone", settings.done);
		}

		switch (method)
		{
			default:
				lastResult = new bshot.Generator();
				if (!lastResult.isSupported)
				{
					$this.trigger("bShotError", [BSHOT_ERROR_NOTSUPPORTED]);
					break;
				}
				lastResult.generate($this);
				break;
		}

		return this;
	};

$.fn.bShot.defaults = {



};
// The namespaces used by the plugin
var bshot;
bshot = {
	
	model: {
		rendertree: {
			nodes: {
				tags: {}
			}
		}
	},
	resources: {},
	utils: {}
	
};
bshot.resources.ResourceManager = function()
{
	
	this.resources = {};
	this.total = 0;
	this.loaded = 0;
	
};

bshot.resources.ResourceManager.prototype.set = function(key, object){ console.log(["This method is not implemented", key, object]); };
bshot.resources.ResourceManager.prototype.get = function(key){ console.log(["This method is not implemented", key]); };
bshot.resources.ResourceManager.prototype.load = function(callback){ console.log(["This method is not implemented", callback]); };
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
	console.log(style.display);
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
		var blw = parseInt(style.borderLeftWidth, 10);
		var btw = parseInt(style.borderTopWidth, 10);
		w -= blw + parseInt(style.borderRightWidth, 10);
		left += blw;
		h -= btw + parseInt(style.borderBottomWidth, 10);
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
					var cb = rtNode.getContainingBlock().renderObject;
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
		(style.borderLeftStyle !== "none" && style.borderLeftStyle !== "hidden") ? parseInt(style.borderLeftWidth, 10) : 0,
		(style.borderRightStyle !== "none" && style.borderRightStyle !== "hidden") ? parseInt(style.borderRightWidth, 10) : 0
	);
	this.renderBorder(rtNode, ctx, "right", w, h, 0, 0,
		(style.borderTopStyle !== "none" && style.borderTopStyle !== "hidden") ? parseInt(style.borderTopWidth, 10) : 0,
		(style.borderBottomStyle !== "none" && style.borderBottomStyle !== "hidden") ? parseInt(style.borderBottomWidth, 10) : 0
	);
	this.renderBorder(rtNode, ctx, "bottom", w, h, 0, 0,
		(style.borderLeftStyle !== "none" && style.borderLeftStyle !== "hidden") ? parseInt(style.borderLeftWidth, 10) : 0,
		(style.borderRightStyle !== "none" && style.borderRightStyle !== "hidden") ? parseInt(style.borderRightWidth, 10) : 0
	);
	this.renderBorder(rtNode, ctx, "left", w, h, 0, 0,
		(style.borderTopStyle !== "none" && style.borderTopStyle !== "hidden") ? parseInt(style.borderTopWidth, 10) : 0,
		(style.borderBottomStyle !== "none" && style.borderBottomStyle !== "hidden") ? parseInt(style.borderBottomWidth, 10) : 0
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
/*
 * getStyleObject Plugin for jQuery JavaScript Library
 * From: http://upshots.org/?p=112
 *
 * Copyright: Unknown, see source link
 * Plugin version by Dakota Schneider (http://hackthetruth.org)
 */

(function($){
    $.fn.getStyleObject = function(){
        var dom = this.get(0);
        var style, prop;
        var returns = {};
        if(window.getComputedStyle){
            var camelize = function(a,b){
                return b.toUpperCase();
            };
            style = window.getComputedStyle(dom, null);
            for(var i=0;i<style.length;i++){
                prop = style[i];
                var camel = prop.replace(/\-([a-z])/g, camelize);
                var val = style.getPropertyValue(prop);
                returns[camel] = val;
            }
            return returns;
        }
        if(dom.currentStyle){
            style = dom.currentStyle;
            for(prop in style){
                returns[prop] = style[prop];
            }
            return returns;
        }
        return this.css();
    };
})(jQuery);
/**
 *  Base class for all elements in the render tree.
 */
bshot.model.rendertree.RenderObject = function()
{

	// The original DOM node as a jQuery object
	this.node = null;
	// The real node (the Node object which contains this object) in the render tree
	this.rtNode = null;
	// The computed style
	this.renderingStyle = null;
	// Későbbi felhasználás céljából
	this.containingLayer = null;
	this.containingBlock = null;
	this.isRoot = false;
	// The position and dimensions of this render object
	this.xPos = null;
	this.yPos = null;
	this.nextX = null;
	this.nextY = null;
	this.width = null;
	this.height = null;
	//this.effectiveWidth = null;
	//this.effectiveHeight = null;
	// This is for debug purposes only
	this.tagName = "RenderObject";
};

bshot.model.rendertree.RenderObject.prototype.layout = function(x, y, containingBlock)
{
	// Determining position and containingBlock
	this.determinePosition(x, y, containingBlock);
	// Determining width
	this.width = this.determineWidth();
	var height = 0;
	for (var i = 0; i < this.rtNode.childNodes.length; i++)
	{
		height = Math.max(height, this.rtNode.childNodes[i].renderObject.layout(this.nextX, this.nextY, this));
	}
	// Determining final height
	this.height = this.determineHeight(height);
	//console.log(this.tagName + "#" + this.rtNode.id + ": " + "(" + this.xPos + ";" + this.yPos + ") - " + this.width + " x " + this.height);
	return this.height;
};

bshot.model.rendertree.RenderObject.prototype.determinePosition = function(x, y, containingBlock){ x = null; y = null; containingBlock = null; };
bshot.model.rendertree.RenderObject.prototype.determineWidth = function(){};
bshot.model.rendertree.RenderObject.prototype.determineHeight = function(height){ height = null; };

bshot.model.rendertree.RenderObject.prototype.paint = function(ctx)
{
	this.doPainting(ctx);
	for (var i = 0; i < this.rtNode.childNodes.length; i++)
	{
		this.rtNode.childNodes[i].renderObject.paint(ctx);
	}
};

bshot.model.rendertree.RenderObject.prototype.doPainting = function(ctx){ ctx = null; };


bshot.model.rendertree.RenderObject.prototype.setNode = function(node)
{
	this.node = node;
	this.renderingStyle = node.getStyleObject();
	this.computeCSSValues();
};

bshot.model.rendertree.RenderObject.prototype.computeCSSValues = function(){};

bshot.model.rendertree.RenderObject.prototype.clone = function()
{
	var resultNode = document.createElement(this.tagName);
	resultNode.renderObject = $.extend(true, {}, this);
	resultNode.renderObject.rtNode = resultNode;
	resultNode.id = bshot.Factory.getNextTreeNodeId();
	return resultNode;
};

bshot.model.rendertree.RenderObject.prototype.getContainingBlock = function()
{
	// TODO: temporary solution
	var containingBlock = this.rtNode;
	while (containingBlock.parentNode)
	{
		containingBlock = containingBlock.parentNode;
	}
	return containingBlock;
};
/**
 *  All nodes that obey the CSS box model should derive from this class.
 */
bshot.model.rendertree.RenderBox = function(node)
{

	// A pozícionálás szempontjából vett szülő elem, ha null, akkor ez a gyökér
	this.positionedObjects = [];
	this.continuation = null;
	this.isInlineContinuation = false;
	this.tagName = "RenderBox";
	if (node)
	{
		this.setNode(node);
	}
};

bshot.model.rendertree.RenderBox.prototype = new bshot.model.rendertree.RenderObject();

/**
 *  Required to do some calculations manually, because on IE we can't see the real computed values.
 */
bshot.model.rendertree.RenderBox.prototype.computeCSSValues = function()
{
	// Compute layout
	var flt = this.renderingStyle.float;
	if (this.isPositioned())
	{
		this.renderingStyle.float = "none";
		this.renderingStyle.float = this._calcCSSDisplayValue(flt);
	}
	else if (flt !== "none" || this.isRoot)
	{
		this.renderingStyle.float = this._calcCSSDisplayValue(flt);
	}
};

bshot.model.rendertree.RenderBox.prototype._calcCSSDisplayValue = function(currentValue)
{
	if (this.isRoot && currentValue === "list-item")
	{
		// The CSS2.1 spec does not specify this value, so I went with "block"
		return "block";
	}
	else if (currentValue === "inline-table")
	{
		return "table";
	}
	else if (currentValue === "inline" || currentValue === "table-row-group" || currentValue === "table-column" || currentValue === "table-column-group" ||
			currentValue === "table-header-group" || currentValue === "table-footer-group" || currentValue === "table-row" ||
			currentValue === "table-cell" || currentValue === "table-caption" || currentValue === "inline-block"
		)
	{
		return "block";
	}
	return currentValue;
};

bshot.model.rendertree.RenderBox.prototype.isPositioned = function()
{
	return (this.renderingStyle.display === "absolute" || this.renderingStyle.display === "fixed");
};

bshot.model.rendertree.RenderBox.prototype.isRelPositioned = function()
{
	return (this.renderingStyle.display === "relative");
};

bshot.model.rendertree.RenderBox.prototype.isReplaced = function()
{
	return false;
};

bshot.model.rendertree.RenderBox.prototype.isInline = function()
{
	var display = this.renderingStyle.display;
	return (!this.isPositioned() && (display === "inline" || display === "inline-block" || display === "inline-table"));
};

bshot.model.rendertree.RenderBox.prototype.isInlineBlockOrInlineTable = function()
{
	return (this.renderingStyle.display === "inline-block" || this.renderingStyle.display === "inline-table");
};

bshot.model.rendertree.RenderBox.prototype.isInlineFlow = function()
{
	return (this.isInline() && !this.isInlineBlockOrInlineTable());
};

bshot.model.rendertree.RenderBox.prototype.insertPositionedElement = function(o)
{
	if (!o.isPositioned())
	{
		console.warn(["Trying to insert non-positioned element as a positioned child.", this]);
		return false;
	}
	this.positionedObjects.push(o);
};

bshot.model.rendertree.RenderBox.prototype.isAnonymousBlock = function()
{
	return false;
};

bshot.model.rendertree.RenderBox.prototype.childrenInline = function()
{
	var inline = true;
	for (var i = 0; i < this.rtNode.childNodes.length; i++)
	{
		inline = inline && this.rtNode.childNodes[i].renderObject.isInline();
	}
	return inline;
};

bshot.model.rendertree.RenderBox.prototype.determinePosition = function()
{
	if (!this.node || this.node.get(0).nodeType !== 1 || !this.node.offset())
	{
		this.xPos = 0;
		this.yPos = 0;
	}
	else
	{
		this.xPos = this.node.offset().left;
		this.yPos = this.node.offset().top;
	}
};

bshot.model.rendertree.RenderBox.prototype.determineWidth = function()
{
	if (!this.node || this.node.get(0).nodeType !== 1 || !this.node.outerWidth())
	{
		return 0;
	}
	return this.node.outerWidth();
};

bshot.model.rendertree.RenderBox.prototype.determineHeight = function()
{
	if (!this.node || this.node.get(0).nodeType !== 1 || !this.node.outerHeight())
	{
		return 0;
	}
	return this.node.outerHeight();
};
/**
 *  This is the root element of the render tree.
 */
bshot.model.rendertree.RenderView = function(node)
{
	this.setNode(node);
	this.isRoot = true;
	this.tagName = "RenderView";
};

bshot.model.rendertree.RenderView.prototype = new bshot.model.rendertree.RenderBox();
bshot.model.rendertree.RenderView.prototype.setNode = function(node)
{
	this.node = node;
	this.renderingStyle = node.find("body").getStyleObject();
};

bshot.model.rendertree.RenderView.prototype.determinePosition = function()
{
	this.xPos = 0;
	this.yPos = 0;
	this.nextX = 0;
	this.nextY = 0;
};

bshot.model.rendertree.RenderView.prototype.determineWidth = function()
{
	return this.node.outerWidth(true);
};

bshot.model.rendertree.RenderView.prototype.determineHeight = function()
{
	return this.node.outerHeight(true);
};

bshot.model.rendertree.RenderView.prototype.doPainting = function(ctx)
{
	if (!this.width || !this.height)
	{
		return false;
	}
	bshot.utils.renderBackground(this, ctx);
};
/**
 *  This class represents elements that will be rendered in a line.
 */
bshot.model.rendertree.nodes.RenderInline = function(node)
{
	if (node)
	{
		this.setNode(node);
	}
	this.tagName = "RenderInline";
};

bshot.model.rendertree.nodes.RenderInline.prototype = new bshot.model.rendertree.RenderBox();

bshot.model.rendertree.nodes.RenderInline.prototype.isInline = function()
{
	return true;
};

bshot.model.rendertree.nodes.RenderInline.prototype.isInlineFlow = function()
{
	return true;
};

/*bshot.model.rendertree.nodes.RenderText.prototype.determinePosition = function(x, y, containingBlock)
{
	this.x = x;
	this.y = y;
	this.nextX = x;
	this.nextY = y;
	this.containingBlock = containingBlock;
};

bshot.model.rendertree.nodes.RenderText.prototype.determineWidth = function()
{
	return 0;
};

bshot.model.rendertree.nodes.RenderText.prototype.determineHeight = function()
{
	return 0;
};*/
/**
 *  This class represents elements that will be rendered as a box.
 */
bshot.model.rendertree.nodes.RenderBlock = function(node)
{
	if (node)
	{
		this.setNode(node);
	}
	this.tagName = "RenderBlock";
};

bshot.model.rendertree.nodes.RenderBlock.prototype = new bshot.model.rendertree.RenderBox();

bshot.model.rendertree.nodes.RenderBlock.prototype.doPainting = function(ctx)
{
	if (!this.width || !this.height)
	{
		return false;
	}
	bshot.utils.renderBackground(this, ctx);
};

/*bshot.model.rendertree.nodes.RenderBlock.prototype.determinePosition = function(x, y, containingBlock)
{
	// Do we always have a node? Obviously its not the case with anonymous blocks
	// TODO: fix it, will be needed for replaced elements
	this.containingBlock = containingBlock;
	this.x = this.node.offset().left - x;
	this.y = this.node.offset().top - y;
};

bshot.model.rendertree.nodes.RenderBlock.prototype.determineWidth = function()
{
	return this.node.outerWidth();
};

bshot.model.rendertree.nodes.RenderBlock.prototype.determineHeight = function()
{
	return this.node.outerHeight();
};*/
/**
 *  This is the renderer for text.
 */
bshot.model.rendertree.nodes.RenderText = function(node)
{
	if (node)
	{
		this.setNode(node);
	}
	this.tagName = "RenderText";
};

bshot.model.rendertree.nodes.RenderText.prototype = new bshot.model.rendertree.nodes.RenderInline();

bshot.model.rendertree.nodes.RenderText.prototype.setNode = function(node)
{
	this.node = node;
};
/**
 *  This class represents an anonymous wrapper block. RenderText objects are considered anonymous inline boxes.
 */
bshot.model.rendertree.nodes.RenderAnonymousBlock = function(node)
{
	if (node)
	{
		this.setNode(node);
	}
	this.tagName = "RenderAnonymousBlock";
};

bshot.model.rendertree.nodes.RenderAnonymousBlock.prototype = new bshot.model.rendertree.RenderBox();

bshot.model.rendertree.nodes.RenderAnonymousBlock.prototype.computeCSSValues = function(){};

bshot.model.rendertree.nodes.RenderAnonymousBlock.prototype.isAnonymousBlock = function()
{
	return true;
};

bshot.model.rendertree.nodes.RenderAnonymousBlock.prototype.isPositioned = function()
{
	return false;
};

bshot.model.rendertree.nodes.RenderAnonymousBlock.prototype.isRelPositioned = function()
{
	return false;
};

bshot.model.rendertree.nodes.RenderAnonymousBlock.prototype.isInline = function()
{
	return false;
};

bshot.model.rendertree.nodes.RenderAnonymousBlock.prototype.isInlineBlockOrInlineTable = function()
{
	return false;
};

bshot.model.rendertree.nodes.RenderAnonymousBlock.prototype.isInlineFlow = function()
{
	return false;
};

/*bshot.model.rendertree.nodes.RenderAnonymousBlock.prototype.determinePosition = function(x, y, containingBlock)
{
	this.x = x;
	this.y = y;
	this.containingBlock = containingBlock;
};

bshot.model.rendertree.nodes.RenderAnonymousBlock.prototype.determineWidth = function()
{
	return this.containingBlock.node.width();
};

bshot.model.rendertree.nodes.RenderAnonymousBlock.prototype.determineHeight = function(height)
{
	return height;
};*/
/**
 *  A basic renderer for replaced elements. All replaced element renderers have to extend this class.
 */

bshot.model.rendertree.nodes.RenderReplaced = function(node)
{
	if (node)
	{
		this.setNode(node);
	}
	this.tagName = "RenderReplaced";
};

bshot.model.rendertree.nodes.RenderReplaced.prototype = new bshot.model.rendertree.RenderBox();
/**
 *  This renderer can render an IMG element. It's position is calculated according to the basic box model,
 *  however we have to paint it in a different way.
 */

bshot.model.rendertree.nodes.tags.Img = function(node)
{
	if (node)
	{
		this.setNode(node);
	}
	this.tagName = "TagImg";
};

bshot.model.rendertree.nodes.tags.Img.prototype = new bshot.model.rendertree.nodes.RenderReplaced();

bshot.model.rendertree.nodes.tags.Img.prototype.doPainting = function(ctx)
{
	var left = this.xPos;
	var top = this.yPos;
	var w = this.width;
	var h = this.height;
	ctx.save();
	ctx.translate(left + 0.49, top);
	var img = bshot.resources.ImageManager.get(this.node.prop("src"));
	if (img)
	{
		var pattern = ctx.createPattern(img, "no-repeat");
		ctx.beginPath();
		ctx.rect(0, 0, w, h);
		ctx.fillStyle = pattern;
		ctx.fill();
	}
	ctx.restore();
};
/**
 *  Factory class and functions for creating all sorts of things (mostly nodes for the render tree).
 */
bshot.Factory = {

	nextTreeNodeId: 0,

	createRenderTreeNode: function($node)
	{
		var renderObject, result;
		var node = $node.get(0);
		if (node.nodeType === 3)
		{
			// This is a simple text node
			renderObject = new bshot.model.rendertree.nodes.RenderText($node);
		}
		else if (node.nodeType === 9)
		{
			// We want to create the root node
			renderObject = new bshot.model.rendertree.RenderView($node);
			result = document.createDocumentFragment();
		}
		else if (node.nodeType === 1)
		{
			// We create a simple renderbox, to be able to compute the CSS which can be used to decide the exact box type
			renderObject = new bshot.model.rendertree.RenderBox($node);
			// Check for replaced renderer
			if (renderObject.renderingStyle.display === "none")
			{
				// There will be no node for this or the child elements
				return null;
			}
			var tagName = $node.get(0).tagName.ucFirst();
			if (typeof bshot.model.rendertree.nodes.tags[tagName] !== "undefined")
			{
				renderObject = new bshot.model.rendertree.nodes.tags[tagName]($node);
			}
			else
			{
				switch (renderObject.renderingStyle.display)
				{
					case "block":
					case "inline-block":
						renderObject = new bshot.model.rendertree.nodes.RenderBlock($node);
						break;
					case "inline":
						renderObject = new bshot.model.rendertree.nodes.RenderInline($node);
						break;
				}
			}
		}
		else
		{
			// There will be no node for this or the child elements
			return null;
		}
		if (!result)
		{
			result = document.createElement(renderObject.tagName);
		}
		result.id = this.getNextTreeNodeId() + "." + $node.attr("class");
		// We simply hook the data on the element. I think there must be a way to do it more elegantly.
		// This needs some more thought later when I have more time.
		// Also, we create a circular reference. Its not elegant, but the GC should be able to handle it.
		result.renderObject = renderObject;
		renderObject.rtNode = result;
		return result;
	},

	createRenderTreeAnonymousBlock: function()
	{
		var renderObject = new bshot.model.rendertree.nodes.RenderAnonymousBlock();
		var result = document.createElement(renderObject.tagName);
		result.id = this.getNextTreeNodeId();
		result.renderObject = renderObject;
		renderObject.rtNode = result;
		return result;
	},

	getNextTreeNodeId: function()
	{
		return this.nextTreeNodeId++;
	}

};
bshot.Generator = function()
{
	this.canvas = document.createElement("canvas");
	this.isSupported = true;
	this.layers = {};
	this.renderTree = null;
	this.canDraw = false;
	
	if (this.canvas && this.canvas.getContext)
	{
		this.ctx = this.canvas.getContext("2d");
	}
	else
	{
		this.isSupported = false;
	}
};

bshot.Generator.prototype.generate = function($this)
{
	var self = this;
	// 1. Először is elkezdjük a render fát felépíteni, és közben kigyűjtjük a szükséges erőforrásokat is
	console.group("-== Building render tree ==-");
	this.canDraw = false;
	this.doBuildRenderTree($this.get(0), null);
	console.log(this.renderTree);
	console.log(bshot.resources.ImageManager);
	bshot.resources.ImageManager.load(function(){
		self.doPaint();
	});
	console.groupEnd();
	// 2. Ellenőrizzük, hogy jó-e a felépített fa (csak debug célt szolgál)
	console.group("-== Checking invariants ==-");
	this.checkInvariants(this.renderTree);
	console.groupEnd();
	// 3. Layoutot számolunk
	console.group("-== Doing layout ==-");
	this.doLayout();
	console.groupEnd();
	// 4. Rajzolunk
	console.group("-== Painting ==-");
	this.canDraw = true;
	this.doPaint();
	console.groupEnd();
	// 5. Megjelenítjük az eredményt
	document.body.innerHTML = "";
	document.body.appendChild(this.canvas);
};

bshot.Generator.prototype.doBuildRenderTree = function(e, rtParent)
{
	if (e == null)
	{
		return false;
	}
	if (e.nodeType === 3)
	{
		// If this is a text node we collapse it
		e.data = bshot.utils.collapseWhiteSpaces(e.data);
	}
	var $e = jQuery(e);
	// We try to create a new render tree node based on our current DOM node:
	var rtNode = bshot.Factory.createRenderTreeNode($e);
	// DEBUG only
	if (e.nodeType === 1 && rtNode)
	{
		$e.attr("data-id", rtNode.id);
	}
	var newNode = null, anonymousBlockCreated = false, i;
	if (rtNode == null)
	{
		this.doBuildRenderTree(e.nextSibling, rtParent);
		return false;
	}
	
	if (rtParent)
	{
		if (!rtNode.renderObject.isInline() && rtParent.openAnonymousBlock)
		{
			// If the parent has an open anonymous block, close it
			rtParent.openAnonymousBlock = null;
		}
		if (!rtParent.renderObject.isAnonymousBlock() && rtParent.renderObject.continuation)
		{
			// If we are in a continuation lets follow it but only if its not an anonymous block
			while (rtParent.renderObject.continuation)
			{
				rtParent = rtParent.renderObject.continuation;
			}
		}
		// Here we need to enforce the CSS rules regarding flows
		if (!rtParent.renderObject.isInlineFlow())
		{
			var prevElementsInline = rtParent.renderObject.childrenInline();
			// If we are in a block-flow
			if ((!prevElementsInline && rtNode.renderObject.isInline()) || (prevElementsInline && !rtNode.renderObject.isInline()))
			{
				// The first bad case: There are blocks in the previous elements, but this one is inline
				if (rtParent.renderObject.continuation)
				{
					rtParent = rtParent.renderObject.continuation;
				}
				else
				{
					// We iterate the previous siblings and fix them if needed
					var sibling = rtParent.firstChild;
					var newAnonymousBlock;
					while (sibling !== null)
					{
						if (sibling.renderObject.isInline())
						{
							if (!newAnonymousBlock)
							{
								newAnonymousBlock = bshot.Factory.createRenderTreeAnonymousBlock();
								rtParent.insertBefore(newAnonymousBlock, sibling);
							}
							newAnonymousBlock.appendChild(sibling);
						}
						sibling = sibling.nextSibling;
					}
					if (rtNode.renderObject.isInline())
					{
						// We create a new anonymous block which will be the parent of this inline element
						if (!rtParent.openAnonymousBlock)
						{
							newNode = bshot.Factory.createRenderTreeAnonymousBlock();
							rtParent.openAnonymousBlock = newNode;
							anonymousBlockCreated = true;
						}
						else
						{
							newNode = rtParent.openAnonymousBlock;
						}
						newNode.appendChild(rtNode);
					}
				}
			}
		}
		else
		{
			// If we are in an inline-flow
			if (!rtNode.renderObject.isInline())
			{
				// The second bad case: Block element in an inline flow detected.
				// 1. Megkeressük a containing boxot (cb) és letároljuk közben a szülő listát
				var containingBlock = rtParent;
				var parentList = [];
				while (containingBlock)
				{
					if (!containingBlock.renderObject.isInline())
					{
						break;
					}
					parentList.push(containingBlock);
					containingBlock = containingBlock.parentNode;
				}
				// 2. Készítünk pre, middle és post blokkokat
				var pre, middle, post;
				if (containingBlock.renderObject.isAnonymousBlock())
				{
					pre = containingBlock;
					containingBlock = containingBlock.parentNode;
					middle = bshot.Factory.createRenderTreeAnonymousBlock();
					post = bshot.Factory.createRenderTreeAnonymousBlock();
				}
				else
				{
					pre = bshot.Factory.createRenderTreeAnonymousBlock();
					middle = bshot.Factory.createRenderTreeAnonymousBlock();
					post = bshot.Factory.createRenderTreeAnonymousBlock();
					// 3. A cb eddigi részfáját a pre-be rakjuk
					var siblingList = [];
					var cSibling = containingBlock.firstChild;
					while (cSibling)
					{
						siblingList.push(cSibling);
						cSibling = cSibling.nextSibling;
					}
					for (i = 0; i < siblingList.length; i++)
					{
						pre.appendChild(siblingList[i]);
					}
					containingBlock.appendChild(pre);
				}
				// 4. cb alá csatoljuk a 3 blokkot
				containingBlock.appendChild(middle);
				containingBlock.appendChild(post);
				containingBlock.openAnonymousBlock = post;
				// 5. Szülő listán visszafele haladva az elemeket a post-ba klónozzuk
				var appendParent = post;
				// clone-ozzuk a részfát, de semmi más nem kell, csak a path
				for (i = parentList.length - 1; i >= 0; i--)
				{
					var cloneNode = parentList[i].renderObject.clone();
					parentList[i].renderObject.continuation = cloneNode;
					cloneNode.renderObject.isInlineContinuation = true;
					appendParent.appendChild(cloneNode);
					appendParent = cloneNode;
				}
				rtParent.renderObject.continuation = middle;
				middle.renderObject.continuation = appendParent;
				rtParent = middle;
			}
		}
	}
	if (e.nodeType === 1 || e.nodeType === 9)
	{
		// If the node will be created we parse its resources:
		this.parseResources(rtNode, e, $e);
	}
	if (!rtParent)
	{
		// If this is the root element
		this.renderTree = rtNode;
		rtParent = rtNode;
		e = $e.find("body").get(0);
	}
	else
	{
		if (newNode && anonymousBlockCreated)
		{
			rtParent.appendChild(newNode);
		}
		else if (!newNode)
		{
			rtParent.appendChild(rtNode);
		}
	}
	this.doBuildRenderTree(e.firstChild, rtNode);
	this.doBuildRenderTree(e.nextSibling, rtParent);
};

bshot.Generator.prototype.parseResources = function(rtNode, e, $e)
{
	var style = rtNode.renderObject.renderingStyle;
	if (e.nodeType !== 9 && $e.prop("tagName").toLowerCase() === "img" && $e.prop("src"))
	{
		if (!bshot.resources.ImageManager.get($e.prop("src")))
		{
			console.log("Image was found: " + $e.prop("src"));
			bshot.resources.ImageManager.set($e.prop("src"), $e);
		}
	}
	else if(style.backgroundImage !== "none" && style.backgroundImage.substr(0, 4).toLowerCase() === "url(")
	{
		var url = bshot.utils.getBackgroundImage(style.backgroundImage);
		if (!bshot.resources.ImageManager.get(url))
		{
			console.log("Image was found: " + url);
			bshot.resources.ImageManager.set(url, url);
		}
	}
};

bshot.Generator.prototype.checkInvariants = function(e)
{
	if (!e || !e.firstChild)
	{
		return false;
	}
	var invariant = true;
	var child = e.firstChild;
	var type = child.renderObject.isInline();
	if (e.renderObject.isInlineFlow() && !type)
	{
		invariant = false;
	}
	else
	{
		while (child)
		{
			if (type !== child.renderObject.isInline())
			{
				invariant = false;
				break;
			}
			child = child.nextSibling;
		}
	}
	if (invariant)
	{
		//console.log("Invariant success: " + e.tagName + "#" + e.id);
	}
	else
	{
		console.error("Invariant fail: " + e.tagName + "#" + e.id);
		console.log(e.parentNode);
		console.log(e.renderObject);
	}
	this.checkInvariants(e.firstChild);
	this.checkInvariants(e.nextSibling);
};

bshot.Generator.prototype.doLayout = function()
{
	this.renderTree.renderObject.layout();
};

bshot.Generator.prototype.doPaint = function()
{
	if (!this.canDraw || !bshot.resources.ImageManager.checkIfDone())
	{
		return false;
	}
	if (!this.isSupported)
	{
		console.log("WARNING: This browser does not support the canvas element!");
	}
	var c = jQuery(this.canvas);
	c.attr("width", this.renderTree.renderObject.width);
	c.attr("height", this.renderTree.renderObject.height);
	c.css("float", "left");
	jQuery("body").css("padding", "0px").css("margin", "0px");
	this.renderTree.renderObject.paint(this.ctx);
};

/*
  // Collection method.
  $.fn.awesome = function() {
    return this.each(function(i) {
      // Do something awesome to each selected element.
      $(this).html('awesome' + i);
    });
  };

  // Static method.
  $.awesome = function(options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.awesome.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Static method default options.
  $.awesome.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].awesome = function(elem) {
    // Is this element awesome?
    return $(elem).text().indexOf('awesome') !== -1;
  };
*/
}(jQuery));
