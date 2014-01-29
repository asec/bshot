/*
 * bshot
 * 
 *
 * Copyright (c) 2013 Roland Zsámboki
 * Licensed under the MIT license.
 */
(function($) {
	var lastResult = null;
	var BSHOT_ERROR_NOTSUPPORTED = 1;

	$.fn.bShot = function(method, options)
	{
		if (this.get(0) !== document)
		{
			return false;
		}
		var $this = $(this);

		method = method || "generate";
		var settings = $.extend($.fn.bShot.defaults, options);
		if (typeof method === "object")
		{
			settings = $.extend(settings, method);
			method = "generate";
		}
		if (settings.error && typeof settings.error === "function")
		{
			$this.on("bShotError", settings.error);
		}
		if (settings.done && typeof settings.done === "function")
		{
			$this.on("bShotDone", settings.done);
		}

		switch (method)
		{
			default:
				lastResult = new bshot.Generator();
				if (!lastResult.isSupported)
				{
					$this.trigger("bShotError", [BSHOT_ERROR_NOTSUPPORTED]);
					break;
				}
				lastResult.generate($this);
				break;
		}

		return this;
	};

//@import "defaults.js"
//@import "namespaces.js"
//@import "resources.ns.js"
//@import "utils.ns.js"
//@import "model.ns.js"
//@import "factory.js"
//@import "generator.js"
}(jQuery));
