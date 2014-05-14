/**
 *  Factory class and functions for creating all sorts of things (mostly nodes for the render tree).
 */
bshot.Factory = {

	nextTreeNodeId: 0,

	createRenderTreeNode: function($node)
	{
		var renderObject, result;
		var node = $node.get(0);
		if (node.nodeType === 3)
		{
			// This is a simple text node
			renderObject = new bshot.model.rendertree.nodes.RenderText($node);
		}
		else if (node.nodeType === 9)
		{
			// We want to create the root node
			renderObject = new bshot.model.rendertree.RenderView($node);
			result = document.createDocumentFragment();
		}
		else if (node.nodeType === 1)
		{
			// We create a simple renderbox, to be able to compute the CSS which can be used to decide the exact box type
			renderObject = new bshot.model.rendertree.RenderBox($node);
			// Check for replaced renderer
			if (renderObject.renderingStyle.display === "none")
			{
				// There will be no node for this or the child elements
				return null;
			}
			var tagName = $node.get(0).tagName.ucFirst();
			if (typeof bshot.model.rendertree.nodes.tags[tagName] !== "undefined")
			{
				renderObject = new bshot.model.rendertree.nodes.tags[tagName]($node);
			}
			else
			{
				switch (renderObject.renderingStyle.display)
				{
					case "block":
					case "inline-block":
						renderObject = new bshot.model.rendertree.nodes.RenderBlock($node);
						break;
					case "inline":
						renderObject = new bshot.model.rendertree.nodes.RenderInline($node);
						break;
				}
			}
		}
		else
		{
			// There will be no node for this or the child elements
			return null;
		}
		if (!result)
		{
			result = document.createElement(renderObject.tagName);
		}
		result.id = this.getNextTreeNodeId() + "." + $node.attr("class");
		// We simply hook the data on the element. I think there must be a way to do it more elegantly.
		// This needs some more thought later when I have more time.
		// Also, we create a circular reference. Its not elegant, but the GC should be able to handle it.
		result.renderObject = renderObject;
		renderObject.rtNode = result;
		return result;
	},

	createRenderTreeAnonymousBlock: function()
	{
		var renderObject = new bshot.model.rendertree.nodes.RenderAnonymousBlock();
		var result = document.createElement(renderObject.tagName);
		result.id = this.getNextTreeNodeId();
		result.renderObject = renderObject;
		renderObject.rtNode = result;
		return result;
	},

	createRenderTreeLineBox: function(renderParent)
	{
		while (renderParent.isAnonymousBlock())
		{
			renderParent = renderParent.rtNode.parentNode.renderObject;
		}
		var renderObject = new bshot.model.rendertree.nodes.RenderLineBox();
		var result = document.createElement(renderObject.tagName);
		renderObject.renderingStyle = jQuery.extend(true, {}, renderParent.renderingStyle);
		result.id = this.getNextTreeNodeId();
		result.renderObject = renderObject;
		renderObject.rtNode = result;

		return result;
	},

	createRenderTreeTextNode: function(content)
	{
		var renderObject = new bshot.model.rendertree.nodes.RenderText(jQuery(document.createTextNode(content)));
		var result = document.createElement(renderObject.tagName);
		result.id = this.getNextTreeNodeId();
		result.renderObject = renderObject;
		renderObject.rtNode = result;
		return result;
	},

	getNextTreeNodeId: function()
	{
		return this.nextTreeNodeId++;
	}

};