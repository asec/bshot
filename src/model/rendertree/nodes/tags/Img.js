/**
 *  This renderer can render an IMG element. It's position is calculated according to the basic box model,
 *  however we have to paint it in a different way.
 */

bshot.model.rendertree.nodes.tags.Img = function(node)
{
	if (node)
	{
		this.setNode(node);
	}
	this.tagName = "TagImg";
};

bshot.model.rendertree.nodes.tags.Img.prototype = new bshot.model.rendertree.nodes.RenderReplaced();

bshot.model.rendertree.nodes.tags.Img.prototype.doPainting = function(ctx)
{
	var left = this.xPos;
	var top = this.yPos;
	var w = this.width;
	var h = this.height;
	ctx.save();
	ctx.translate(left + 0.49, top);
	var img = bshot.resources.ImageManager.get(this.node.prop("src"));
	if (img)
	{
		if (w !== img.width || h !== img.height)
		{
			ctx.scale(w / img.width, h / img.height);
		}
		var pattern = ctx.createPattern(img, "no-repeat");
		ctx.beginPath();
		ctx.rect(0, 0, img.width, img.height);
		ctx.fillStyle = pattern;
		ctx.fill();
	}
	ctx.restore();
};