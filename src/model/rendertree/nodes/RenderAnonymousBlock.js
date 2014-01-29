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