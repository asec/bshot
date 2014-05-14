bShot - Browser snapshots
=========================

> **BEWARE!**<br />
> This project is work in progress, it serves research purposes only. Please don't use this code yet.

A jQuery plugin for capturing website snapshots. The aim of this project is to offer a *Google Feedback* like solution using HTML5 techniques. This code attempts to render the current DOM on a `canvas` element.

Download
--------
The current build comes in two flavors. Both of them are `debug`:
- [Normal version](dist/bshot.js)
- [Minified version](dist/bshot.min.js)


Building
--------
To build bShot you need to install [git](http://git-scm.com/downloads) and [Node.js](http://nodejs.org/download/) first. The recommended IDE for coding is [Sublime Text](http://www.sublimetext.com/2). I included my project file with the project, feel free to use it or create your own.

Grab `Grunt` if you dont have it installed already:

```
npm install -g grunt-cli
```

Now you are all set to compile the code. In your bShot directory:

```
grunt
```

You can use the `debug` target, if you want a bit more verbose version:
```
grunt debug
```

How to use
----------
**You shouldn't use this code yet!**

You can create a snapshot of the whole document with this snippet:
```js
jQuery(document).bShot();
```

You have to call the code from the `onclick` event of a `button` or `a` tag for security and privacy reasons. I don't recommend bypassing this limitation.
