bshot.Generator = function()
{
	this.canvas = document.createElement("canvas");
	this.ctx = null;
	this.isSupported = true;
	this.layers = {};
	this.renderTree = null;
	this.canDraw = false;
	
	if (this.canvas && this.canvas.getContext)
	{
		this.ctx = this.canvas.getContext("2d");
	}
	else
	{
		this.isSupported = false;
	}
};

bshot.Generator.prototype.generate = function($this)
{
	var self = this;
	// 1. Először is elkezdjük a render fát felépíteni, és közben kigyűjtjük a szükséges erőforrásokat is
	console.group("-== Building render tree ==-");
	this.canDraw = false;
	this.doBuildRenderTree($this.get(0), null);
	console.log(this.renderTree);
	console.log(bshot.resources.ImageManager);
	bshot.resources.ImageManager.load(function(){
		self.doPaint();
	});
	console.groupEnd();
	// 2. Ellenőrizzük, hogy jó-e a felépített fa (csak debug célt szolgál)
	console.group("-== Checking invariants ==-");
	this.checkInvariants(this.renderTree);
	console.groupEnd();
	// 3. Layoutot számolunk
	console.group("-== Doing layout ==-");
	this.doLayout();
	console.log(this.renderTree);
	console.log(bshot.resources.FontManager);
	console.groupEnd();
	// 4. Rajzolunk
	console.group("-== Painting ==-");
	this.canDraw = true;
	this.doPaint();
	console.groupEnd();
	// 5. Megjelenítjük az eredményt
	document.body.innerHTML = "";
	document.body.appendChild(this.canvas);
};

bshot.Generator.prototype.doBuildRenderTree = function(e, rtParent)
{
	if (e == null)
	{
		return false;
	}
	if (e.nodeType === 3)
	{
		// If this is a text node we collapse it
		e.data = bshot.utils.collapseWhiteSpaces(e.data);
		// Sometimes this element is not needed
		if (e.data === " " && !rtParent.renderObject.isInlineFlow())
		{
			this.doBuildRenderTree(e.nextSibling, rtParent);
			return false;
		}
	}
	var $e = jQuery(e);
	// We try to create a new render tree node based on our current DOM node:
	var rtNode = bshot.Factory.createRenderTreeNode($e);
	// DEBUG only
	if (e.nodeType === 1 && rtNode)
	{
		$e.attr("data-id", rtNode.id);
	}
	var newNode = null, anonymousBlockCreated = false, i;
	if (rtNode == null)
	{
		this.doBuildRenderTree(e.nextSibling, rtParent);
		return false;
	}
	
	if (rtParent)
	{
		if (!rtNode.renderObject.isInline() && rtParent.openAnonymousBlock)
		{
			// If the parent has an open anonymous block, close it
			rtParent.openAnonymousBlock = null;
		}
		if (!rtParent.renderObject.isAnonymousBlock() && rtParent.renderObject.continuation)
		{
			// If we are in a continuation lets follow it but only if its not an anonymous block
			while (rtParent.renderObject.continuation)
			{
				rtParent = rtParent.renderObject.continuation;
			}
		}
		// Here we need to enforce the CSS rules regarding flows
		if (!rtParent.renderObject.isInlineFlow())
		{
			var prevElementsInline = rtParent.renderObject.childrenInline();
			// If we are in a block-flow
			if ((!prevElementsInline && rtNode.renderObject.isInline()) || (prevElementsInline && !rtNode.renderObject.isInline()))
			{
				// The first bad case: There are blocks in the previous elements, but this one is inline
				if (rtParent.renderObject.continuation)
				{
					rtParent = rtParent.renderObject.continuation;
				}
				else
				{
					// We iterate the previous siblings and fix them if needed
					var sibling = rtParent.firstChild, nextSibling;
					var newAnonymousBlock;
					while (sibling !== null)
					{
						nextSibling = sibling.nextSibling;
						if (sibling.renderObject.isInline())
						{
							if (!newAnonymousBlock)
							{
								newAnonymousBlock = bshot.Factory.createRenderTreeAnonymousBlock();
								rtParent.insertBefore(newAnonymousBlock, sibling);
							}
							newAnonymousBlock.appendChild(sibling);
						}
						sibling = nextSibling;
					}
					if (rtNode.renderObject.isInline())
					{
						// We create a new anonymous block which will be the parent of this inline element
						if (!rtParent.openAnonymousBlock)
						{
							newNode = bshot.Factory.createRenderTreeAnonymousBlock();
							rtParent.openAnonymousBlock = newNode;
							anonymousBlockCreated = true;
						}
						else
						{
							newNode = rtParent.openAnonymousBlock;
						}
						newNode.appendChild(rtNode);
					}
				}
			}
		}
		else
		{
			// If we are in an inline-flow
			if (!rtNode.renderObject.isInline())
			{
				// The second bad case: Block element in an inline flow detected.
				// 1. Megkeressük a containing boxot (cb) és letároljuk közben a szülő listát
				var containingBlock = rtParent;
				var parentList = [];
				while (containingBlock)
				{
					if (!containingBlock.renderObject.isInline())
					{
						break;
					}
					parentList.push(containingBlock);
					containingBlock = containingBlock.parentNode;
				}
				// 2. Készítünk pre, middle és post blokkokat
				var pre, middle, post;
				if (containingBlock.renderObject.isAnonymousBlock())
				{
					pre = containingBlock;
					containingBlock = containingBlock.parentNode;
					middle = bshot.Factory.createRenderTreeAnonymousBlock();
					post = bshot.Factory.createRenderTreeAnonymousBlock();
				}
				else
				{
					pre = bshot.Factory.createRenderTreeAnonymousBlock();
					middle = bshot.Factory.createRenderTreeAnonymousBlock();
					post = bshot.Factory.createRenderTreeAnonymousBlock();
					// 3. A cb eddigi részfáját a pre-be rakjuk
					var siblingList = [];
					var cSibling = containingBlock.firstChild;
					while (cSibling)
					{
						siblingList.push(cSibling);
						cSibling = cSibling.nextSibling;
					}
					for (i = 0; i < siblingList.length; i++)
					{
						pre.appendChild(siblingList[i]);
					}
					containingBlock.appendChild(pre);
				}
				// 4. cb alá csatoljuk a 3 blokkot
				containingBlock.appendChild(middle);
				containingBlock.appendChild(post);
				containingBlock.openAnonymousBlock = post;
				// 5. Szülő listán visszafele haladva az elemeket a post-ba klónozzuk
				var appendParent = post;
				// clone-ozzuk a részfát, de semmi más nem kell, csak a path
				for (i = parentList.length - 1; i >= 0; i--)
				{
					var cloneNode = parentList[i].renderObject.clone();
					parentList[i].renderObject.continuation = cloneNode;
					cloneNode.renderObject.isInlineContinuation = true;
					appendParent.appendChild(cloneNode);
					appendParent = cloneNode;
				}
				rtParent.renderObject.continuation = middle;
				middle.renderObject.continuation = appendParent;
				rtParent = middle;
			}
		}
	}
	if (e.nodeType === 1 || e.nodeType === 9)
	{
		// If the node will be created we parse its resources:
		this.parseResources(rtNode, e, $e);
	}
	if (!rtParent)
	{
		// If this is the root element
		this.renderTree = rtNode;
		rtParent = rtNode;
		e = $e.find("body").get(0);
	}
	else
	{
		if (newNode && anonymousBlockCreated)
		{
			rtParent.appendChild(newNode);
		}
		else if (!newNode)
		{
			rtParent.appendChild(rtNode);
		}
	}
	this.doBuildRenderTree(e.firstChild, rtNode);
	this.doBuildRenderTree(e.nextSibling, rtParent);
};

bshot.Generator.prototype.parseResources = function(rtNode, e, $e)
{
	var style = rtNode.renderObject.renderingStyle;
	bshot.resources.FontManager.measureTextHeight(style.fontFamily, style.fontSize);
	if (e.nodeType !== 9 && $e.prop("tagName").toLowerCase() === "img" && $e.prop("src"))
	{
		if (!bshot.resources.ImageManager.get($e.prop("src")))
		{
			console.log("Image was found: " + $e.prop("src"));
			bshot.resources.ImageManager.set($e.prop("src"), $e);
		}
	}
	else if(style.backgroundImage !== "none" && style.backgroundImage.substr(0, 4).toLowerCase() === "url(")
	{
		var url = bshot.utils.getBackgroundImage(style.backgroundImage);
		if (!bshot.resources.ImageManager.get(url))
		{
			console.log("Image was found: " + url);
			bshot.resources.ImageManager.set(url, url);
		}
	}
};

bshot.Generator.prototype.checkInvariants = function(e)
{
	if (!e || !e.firstChild)
	{
		return false;
	}
	var invariant = true;
	var child = e.firstChild;
	var type = child.renderObject.isInline();
	if (e.renderObject.isInlineFlow() && !type)
	{
		invariant = false;
	}
	else
	{
		while (child)
		{
			if (type !== child.renderObject.isInline())
			{
				invariant = false;
				break;
			}
			child = child.nextSibling;
		}
	}
	if (invariant)
	{
		//console.log("Invariant success: " + e.tagName + "#" + e.id);
	}
	else
	{
		console.error("Invariant fail: " + e.tagName + "#" + e.id);
		console.log(e.parentNode);
		console.log(e.renderObject);
	}
	this.checkInvariants(e.firstChild);
	this.checkInvariants(e.nextSibling);
};

bshot.Generator.prototype.doLayout = function()
{
	this.renderTree.renderObject.layout();
};

bshot.Generator.prototype.doPaint = function()
{
	if (!this.canDraw || !bshot.resources.ImageManager.checkIfDone())
	{
		return false;
	}
	if (!this.isSupported)
	{
		console.log("WARNING: This browser does not support the canvas element!");
	}
	var c = jQuery(this.canvas);
	c.attr("width", this.renderTree.renderObject.width);
	c.attr("height", this.renderTree.renderObject.height);
	c.css("float", "left");
	jQuery("body").css("padding", "0px").css("margin", "0px");
	this.renderTree.renderObject.paint(this.ctx);
};