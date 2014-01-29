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