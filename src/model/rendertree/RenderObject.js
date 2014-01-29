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