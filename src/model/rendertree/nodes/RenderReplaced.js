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