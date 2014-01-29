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