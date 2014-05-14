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

bshot.model.rendertree.nodes.RenderText.prototype.pullStyleObject = function()
{
	// The renderText always inherits the styleObject of its closest available ancestor
	var source = this;
	while (source && !source.renderingStyle)
	{
		source = source.rtNode.parentNode.renderObject;
	}
	// TODO: We will merge these two values in inline block level elements, but with text elements its enough to copy
	// over the parent style
	this.renderingStyle = source.renderingStyle;
};

/**
 * Itt a szöveget lineboxokba kell tördelni!
 * 1. A containingBlockban nyitunk egy új lineboxot. A maximális szélesség a cb szélessége lesz.
 * 2. Elkezdjük feltölteni, amíg el nem érjük a szélességet.
 * 3. Ha elétrük és van még, nyitunk egy új boxot. Ha nincs akkor vége.
 * Az inline dolgokat continuation-ökkel kell áthidalni. Arra kell vigyázni, hogy már lehetnek continuation-ök az előző fázisból!
 * A linebox magassága szöveg esetén a line-height, ha van benne más tartalom is, akkor azé. A baseline-os aling miatt lehet a linebox
 * magasabb, mint a tényleges tartalom magassága. Ennek utána kell nézni még.
 * Ha olyan tartalom van, ami nem fér el egy lineboxban (nagyobb kép, hosszú szöveg szóközök nélkül),
 * akkor azt belerakjuk egybe és majd az overflow kezeli.
 */
bshot.model.rendertree.nodes.RenderText.prototype.determinePosition = function(x, y, containingBlock)
{
	this.xPos = x;
	this.yPos = y;
	this.containingBlock = containingBlock;
	// Ezeket később a szöveghossznak megfelelően pontosítani kell
	this.nextX = x;
	this.nextY = y;
	// A text nodeoknak nincs renderingStyle-ja, de a közvetlen parentnek mindig van, és ez vonatkozik a szövegre
	//bshot.utils.fontMeasurement.measureText(this.rtNode.parentNode.renderObject.renderingStyle, this.node.text());
};

bshot.model.rendertree.nodes.RenderText.prototype.determineWidth = function()
{
	this.pullStyleObject();
	var text = this.node.get(0).data;
	if (!text)
	{
		return 0;
	}

	text = text.split(" ");

	var lineBox = this.containingBlock.getLineBox();
	var lb = lineBox.renderObject;
	var splitText = {
		width: 0,
		text: ""
	};
	var spaceLength = bshot.utils.fontMeasurement.measureText(lb.renderingStyle, " ");
	var newTextNode;
	for (var i = 0; i < text.length; i++)
	{
		var length = 0;
		if (lb.isEmpty() && !text[i])
		{
			// Trim the left end of the linebox
			continue;
		}
		if (text[i])
		{
			length = bshot.utils.fontMeasurement.measureText(lb.renderingStyle, text[i]);
		}
		if ((lb.nextX - lb.xPos) + splitText.width + length > lb.width)
		{
			if (!splitText.text.charAt(splitText.text.length - 1) || splitText.text.charAt(splitText.text.length - 1) === " ")
			{
				splitText.text = splitText.text.substr(0, splitText.text.length - 1);
				splitText.width -= spaceLength;
			}
			newTextNode = bshot.Factory.createRenderTreeTextNode(splitText.text);
			newTextNode.renderObject.renderingStyle = this.renderingStyle;
			newTextNode.renderObject.xPos = lb.nextX;
			newTextNode.renderObject.yPos = lb.nextY;
			newTextNode.renderObject.width = newTextNode.renderObject.contentWidth = splitText.width;
			newTextNode.renderObject.height = parseInt(lb.renderingStyle.lineHeight, 10);
			newTextNode.renderObject.contentHeight = bshot.resources.FontManager.measureTextHeight(lb.renderingStyle.fontFamily, lb.renderingStyle.fontSize);
			lineBox.appendChild(newTextNode);
			lb.contentWidth += newTextNode.renderObject.width;
			splitText = {
				width: 0,
				text: ""
			};
			this.containingBlock.closeLineBox();
			lineBox = this.containingBlock.getLineBox();
			lb = lineBox.renderObject;
		}

		var hasRoomForSpace = (i !== (text.length - 1) && (lb.nextX - lb.xPos) + splitText.width + length + spaceLength <= lb.width);
		splitText.width += length + (hasRoomForSpace ? spaceLength : 0);
		splitText.text += text[i] + (hasRoomForSpace ? " " : "");
	}
	if (splitText.width > 0)
	{
		newTextNode = bshot.Factory.createRenderTreeTextNode(splitText.text);
		newTextNode.renderObject.renderingStyle = this.renderingStyle;
		newTextNode.renderObject.xPos = lb.nextX;
		newTextNode.renderObject.yPos = lb.nextY;
		newTextNode.renderObject.width = newTextNode.renderObject.contentWidth = splitText.width;
		newTextNode.renderObject.height = parseInt(lb.renderingStyle.lineHeight, 10);
		newTextNode.renderObject.contentHeight = bshot.resources.FontManager.measureTextHeight(lb.renderingStyle.fontFamily, lb.renderingStyle.fontSize);
		lineBox.appendChild(newTextNode);
		lb.contentWidth += newTextNode.renderObject.width;
		lb.nextX += splitText.width;
	}

	return 0;
};

bshot.model.rendertree.nodes.RenderText.prototype.doPainting = function(ctx)
{
	var style = this.renderingStyle;
	var text = this.node.text();
	ctx.save();
	ctx.translate(this.xPos, this.yPos);
	ctx.font = style.fontStyle + " " + style.fontVariant + " " + style.fontWeight + " " + style.fontSize + " " + style.fontFamily;
	ctx.textBaseline = "middle";
	ctx.fillStyle = style.color;
	
	ctx.textAlign = "left";
	// BUG: Firefox renders the text 1px lower than the calculated halfpoint
	ctx.fillText(text, 0, this.height / 2);
	ctx.restore();
};