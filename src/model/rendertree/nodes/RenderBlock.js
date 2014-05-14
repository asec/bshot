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

bshot.model.rendertree.nodes.RenderBlock.prototype.determinePosition = function(x, y, containingBlock)
{
	// We always have a base DOM element for these nodes
	this.containingBlock = containingBlock;
	this.xPos = this.node.offset().left;
	this.yPos = this.node.offset().top;
	// nextX and nextY will need to incorporate padding and borders too
	this.nextX = this.xPos + this.borderWidth[3] + this.paddingWidth[3];
	this.nextY = this.yPos + this.borderWidth[0] + this.paddingWidth[0];
};


bshot.model.rendertree.nodes.RenderBlock.prototype.determineWidth = function()
{
	this.width = this.node.outerWidth();
	this.contentWidth = this.width - (this.borderWidth[1] + this.borderWidth[3] + this.paddingWidth[1] + this.paddingWidth[3]);
	return this.width;
};

bshot.model.rendertree.nodes.RenderBlock.prototype.determineHeight = function()
{
	this.height = this.node.outerHeight();
	this.contentHeight = this.height - (this.borderWidth[0] + this.borderWidth[2] + this.paddingWidth[0] + this.paddingWidth[2]);
	return this.height;
};