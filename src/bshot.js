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

/*
  // Collection method.
  $.fn.awesome = function() {
    return this.each(function(i) {
      // Do something awesome to each selected element.
      $(this).html('awesome' + i);
    });
  };

  // Static method.
  $.awesome = function(options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.awesome.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Static method default options.
  $.awesome.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].awesome = function(elem) {
    // Is this element awesome?
    return $(elem).text().indexOf('awesome') !== -1;
  };
*/
}(jQuery));
