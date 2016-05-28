EVEoj
====
The EVEoj project provides a simple way to access EVE static data and formulas for mechanics in JS. It can be used as a Node.js module or directly in a web-browser (including full IGB support).

See the [project website](https://eve-oj.com/) for additional details and API documentation.

## Getting Started

### Node.js

Download the latest JSON-converted static data from the [project website](https://eve-oj.com/#downloads). Extract these files to a local path that your Node.js project can access.

Install the EVEoj package dependency for your project with `npm install EVEoj --save`.

In your Node.js application, use the following code to point EVEoj at the static data you downloaded.

```javascript
var EVEoj = require("EVEoj");
var SDD = EVEoj.SDD.Create("json", {path: "/path/to/the/static/data"});
```

### Web Browser

Load jQuery and the EVEoj library into your web browser. If you are using the IGB, you MUST use the 1.x branch of jQuery.

```html
<script src="//cf.eve-oj.com/js/jquery-1.12.4.min.js"></script>
<script src="//cf.eve-oj.com/js/EVEoj-0.3.0.min.js"></script>
```

In your custom JS, use the following code to point EVEoj at a hosted version of the static data.

```javascript
var SDD = EVEoj.SDD.Create("json", {path: "//cf.eve-oj.com/sdd/201604290"});
```

## Simple typeID Example

Once you have the library loaded and your SDD object created, your code is the same whether in Node.js or using a browser.

As an example, the following snippet uses Underscore and EVEoj to print out the ID of the "Skill Injector" item. This example assumes that the Underscore library has been loaded into the `_` variable (using either a script tag in your HTML or via require in Node.js).

```javascript
SDD.LoadMeta()
.then(function(arg)) {
    return arg.source.GetTable("invTypes").Load();
})
.then(function(arg)) {
    var tbl = arg.table;
    var row = _.find(tbl.data, tbl.ColPred("typeName", "===", "Skill Injector"));
    console.info("Skill Injector type ID: " + row[tbl.colmap.typeID]);
})
.caught(function(err) {
    console.error(err);
});
```

Reference the [Core API](https://eve-oj.com/#core) for more information about what you can do with SDD.

## A Note on Promises

EVEoj's asynchronous loads use the [Promise](http://promisesaplus.com/) architecture. In particular, EVEoj uses the [bluebird](http://bluebirdjs.com/) promise implementation in both Node.js and in the browser. The browserified version of EVEoj hosted on the CDN has an embedded version of bluebird so you do not need to include it explicity in your HTML.

The full JS bundle available at [project downloads](https://eve-oj.com/#downloads) includes a non-minified version of EVEoj. This version does NOT include the embedded bluebird library. Be sure to include a recent version of bluebird JS in your HTML if you use this version. This can be useful for local debugging and development, or to save a bit of bandwidth on your production site if it already uses a version of bluebird.
