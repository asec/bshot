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