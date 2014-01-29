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