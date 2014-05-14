/**
 * This type represents a single line. Its a box level element that is used for inline and text rendering.
 */
bshot.model.rendertree.nodes.RenderLineBox = function(node)
{
	this.tagName = "RenderLineBox";
	if (node)
	{
		this.setNode(node);
	}
};

bshot.model.rendertree.nodes.RenderLineBox.prototype = new bshot.model.rendertree.RenderBox();

bshot.model.rendertree.nodes.RenderLineBox.prototype.isPositioned = function()
{
	return false;
};

bshot.model.rendertree.nodes.RenderLineBox.prototype.isRelPositioned = function()
{
	return false;
};

bshot.model.rendertree.nodes.RenderLineBox.prototype.isInline = function()
{
	return false;
};

bshot.model.rendertree.nodes.RenderLineBox.prototype.isInlineBlockOrInlineTable = function()
{
	return false;
};

bshot.model.rendertree.nodes.RenderLineBox.prototype.isInlineFlow = function()
{
	return true;
};

/**
 * These two methods will never be called, because the line boxes are added during the calculations.
 */
bshot.model.rendertree.nodes.RenderLineBox.prototype.determineWidth = function()
{
	return this.width;
};

bshot.model.rendertree.nodes.RenderLineBox.prototype.determineHeight = function()
{
	return this.height;
};

bshot.model.rendertree.nodes.RenderLineBox.prototype.isEmpty = function()
{
	return (this.rtNode.childNodes.length === 0);
};

// TODO: This code doesn't care if the document is ltr or rtl. It will probably be added later on.
bshot.model.rendertree.nodes.RenderLineBox.prototype.recalculatePositions = function()
{
	var textAlign = this.renderingStyle.textAlign;
	var i, translate;
	if (textAlign === "left" || textAlign === "start" || this.contentWidth > this.width)
	{
		// The code calculates the position of the elements in a linebox according to this rule when it first puts them there
		return null;
	}

	if (textAlign === "center")
	{
		translate = (this.width - this.contentWidth) / 2;
	}

	if (textAlign === "right" || textAlign === "end")
	{
		var rightMost = this.rtNode.childNodes[this.rtNode.childNodes.length - 1].renderObject;
		translate = this.xPos + this.width - (rightMost.xPos + rightMost.contentWidth);
	}

	for (i = 0; i < this.rtNode.childNodes.length; i++)
	{
		this.rtNode.childNodes[i].renderObject.xPos += translate;
	}
	return true;
};