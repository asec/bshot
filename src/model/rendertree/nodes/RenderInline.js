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