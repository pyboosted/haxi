(function () { "use strict";
var $estr = function() { return js.Boot.__string_rec(this,''); };
var Camera = function(x,y,width,height) {
	this.maxHeight = 0;
	this.maxWidth = 0;
	this.view = new PIXI.DisplayObjectContainer();
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	if(x - width / 2 < 0) this.x = width / 2;
	if(y - height / 2 < 0) this.y = height / 2;
	this.bounds = new PIXI.Rectangle(this.x - width / 2,this.y - height / 2,width,height);
};
Camera.__name__ = true;
Camera.prototype = {
	updateBounds: function() {
		if(this.prevX != this.x || this.prevY != this.y) {
			this.bounds.x = this.x - this.width / 2;
			this.bounds.y = this.y - this.height / 2;
			return this.bounds;
		} else return null;
	}
	,bindControls: function(stage) {
		var _g = this;
		var start;
		var isDragging = false;
		stage.mousedown = function(data) {
			isDragging = true;
			start = data.getLocalPosition(stage);
		};
		stage.mouseup = function(data) {
			isDragging = false;
		};
		stage.mousemove = function(data) {
			if(isDragging) {
				var newPosition = data.getLocalPosition(stage);
				_g.x -= newPosition.x - start.x;
				_g.y -= newPosition.y - start.y;
				start.x = newPosition.x;
				start.y = newPosition.y;
				if(_g.x - _g.width / 2 < 0) _g.x = _g.width / 2;
				if(_g.y - _g.height / 2 < 0) _g.y = _g.height / 2;
				if(_g.maxWidth != 0 && _g.x + _g.width / 2 > _g.maxWidth) _g.x = _g.maxWidth - _g.width / 2;
				if(_g.maxHeight != 0 && _g.y + _g.height / 2 > _g.maxHeight) _g.y = _g.maxHeight - _g.height / 2;
			}
		};
	}
	,setLimits: function(width,height) {
		this.maxWidth = width;
		this.maxHeight = height;
	}
	,__class__: Camera
}
var Game = function() {
	this.tileHeight = 64;
	this.tileWidth = 64;
	this.viewportWidth = js.Browser.document.width;
	this.viewportHeight = js.Browser.document.height;
	this.map = new LevelMap("assets/map.json");
	this.map.onLoad = $bind(this,this.run);
	this.map.load();
	this.stage = new PIXI.Stage(16763251);
	this.stage.setInteractive(true);
	this.cam = new Camera(0,0,this.viewportWidth,this.viewportHeight);
	this.cam.bindControls(this.stage);
};
Game.__name__ = true;
Game.main = function() {
	new Game();
}
Game.prototype = {
	render: function(val) {
		var time = new Date().getTime();
		var timeDiff = 30;
		if(this.lastTime != null) timeDiff = time - this.lastTime;
		this.lastTime = time;
		this.tileFactory.render(this.cam,this.map.view);
		if(timeDiff > 50) console.log(timeDiff);
		var keys = KeyboardJS.activeKeys();
		if(Lambda.indexOf(keys,"a") != -1) this.cam.x -= 0.45 * timeDiff;
		if(Lambda.indexOf(keys,"d") != -1) this.cam.x += 0.45 * timeDiff;
		if(Lambda.indexOf(keys,"s") != -1) this.cam.y += 0.45 * timeDiff;
		if(Lambda.indexOf(keys,"w") != -1) this.cam.y -= 0.45 * timeDiff;
		this.map.view.position.x = -this.cam.x + this.cam.width / 2;
		this.map.view.position.y = -this.cam.y + this.cam.height / 2;
		js.Browser.window.requestAnimationFrame($bind(this,this.render));
		this.renderer.render(this.stage);
		return true;
	}
	,run: function(map) {
		this.tileFactory = new TileFactory(map,this.tileWidth,this.tileHeight,Math.ceil(this.viewportWidth / (this.tileWidth * 2)),Math.ceil(this.viewportHeight / (this.tileHeight * 2)));
		this.renderer = PIXI.autoDetectRenderer(this.viewportWidth,this.viewportHeight);
		js.Browser.document.body.appendChild(this.renderer.view);
		this.stage.addChild(map.view);
		this.cam.setLimits(map.width * this.tileWidth,map.height * this.tileHeight);
		js.Browser.window.requestAnimationFrame($bind(this,this.render));
	}
	,__class__: Game
}
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
}
var Lambda = function() { }
Lambda.__name__ = true;
Lambda.indexOf = function(it,v) {
	var i = 0;
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var v2 = $it0.next();
		if(v == v2) return i;
		i++;
	}
	return -1;
}
var MapTile = { __ename__ : true, __constructs__ : ["EMPTY","BOX"] }
MapTile.EMPTY = ["EMPTY",0];
MapTile.EMPTY.toString = $estr;
MapTile.EMPTY.__enum__ = MapTile;
MapTile.BOX = ["BOX",1];
MapTile.BOX.toString = $estr;
MapTile.BOX.__enum__ = MapTile;
var LevelMap = function(jsonData) {
	this.jsonData = jsonData;
	this.tiles = new Array();
	this.view = new PIXI.DisplayObjectContainer();
};
LevelMap.__name__ = true;
LevelMap.prototype = {
	mapLoaded: function(data) {
		var mapData = data.content.json.map;
		this.width = mapData.width;
		this.height = mapData.height;
		var _g1 = 0;
		var _g = this.height;
		while(_g1 < _g) {
			var j = _g1++;
			var line = new Array();
			var _g3 = 0;
			var _g2 = this.width;
			while(_g3 < _g2) {
				var i = _g3++;
				if(mapData.tiles[j].charAt(i) == "0") line.push(MapTile.EMPTY); else line.push(MapTile.BOX);
			}
			this.tiles.push(line);
		}
		this.onLoad(this);
	}
	,getTile: function(x,y) {
		return this.tiles[y][x];
	}
	,load: function() {
		var mapLoader = new PIXI.JsonLoader("assets/map.json");
		mapLoader.addEventListener("loaded",$bind(this,this.mapLoaded));
		mapLoader.load();
	}
	,__class__: LevelMap
}
var IMap = function() { }
IMap.__name__ = true;
var TileFactory = function(map,tileWidth,tileHeight,supertileWidth,supertileHeight) {
	this.padding = 10;
	this.map = map;
	this.tileWidth = tileWidth;
	this.tileHeight = tileHeight;
	this.supertileWidth = supertileWidth;
	this.supertileHeight = supertileHeight;
	this.renderedTiles = new haxe.ds.StringMap();
	this.tilesCache = new haxe.ds.StringMap();
};
TileFactory.__name__ = true;
TileFactory.prototype = {
	render: function(cam,view) {
		var bounds = cam.updateBounds();
		if(bounds == null) return;
		var x = bounds.x;
		var y = bounds.y;
		var x2 = bounds.x + bounds.width;
		var y2 = bounds.y + bounds.height;
		var tileX = Math.floor((x - this.padding) / (this.supertileWidth * this.tileWidth));
		var tileY = Math.floor((y - this.padding) / (this.supertileHeight * this.tileHeight));
		var tileX2 = Math.ceil((x2 + this.padding) / (this.supertileWidth * this.tileWidth));
		var tileY2 = Math.ceil((y2 + this.padding) / (this.supertileHeight * this.tileHeight));
		if(tileX < 0) tileX = 0;
		if(tileY < 0) tileY = 0;
		if(tileX != this.lastTileX || tileY != this.lastTileY || tileX2 != this.lastTileX2 || tileY2 != this.lastTileY2) {
			this.lastTileX = tileX;
			this.lastTileY = tileY;
			this.lastTileX2 = tileX2;
			this.lastTileY2 = tileY2;
			var newTiles = new haxe.ds.StringMap();
			var $it0 = ((function(_e) {
				return function() {
					return _e.iterator();
				};
			})(this.renderedTiles))();
			while( $it0.hasNext() ) {
				var i = $it0.next();
				if(i.x >= tileX && i.x <= tileX2 && i.y >= tileY && i.y <= tileY2) newTiles.set("" + i.x + "-" + i.y,i); else view.removeChild(i.tile);
			}
			this.renderedTiles = newTiles;
			var _g = tileY;
			while(_g < tileY2) {
				var j = _g++;
				var _g1 = tileX;
				while(_g1 < tileX2) {
					var i = _g1++;
					if(!this.renderedTiles.exists("" + i + "-" + j)) {
						var supertile = this.buildTile(i,j);
						var tileInfo = { x : i, y : j, tile : supertile};
						this.renderedTiles.set("" + i + "-j",tileInfo);
						view.addChild(tileInfo.tile);
					}
				}
			}
		}
	}
	,buildTile: function(x,y) {
		var supertileTexture = new PIXI.RenderTexture(this.supertileWidth * this.tileWidth,this.supertileHeight * this.tileHeight);
		var supertileGraphics = new PIXI.Graphics();
		var boxTiles = new Array();
		var emptyTiles = new Array();
		var _g1 = 0;
		var _g = this.supertileHeight;
		while(_g1 < _g) {
			var j = _g1++;
			var tileY = y * this.supertileHeight + j;
			if(tileY < 0) continue;
			if(tileY >= this.map.height) break;
			var _g3 = 0;
			var _g2 = this.supertileWidth;
			while(_g3 < _g2) {
				var i = _g3++;
				var tileX = x * this.supertileWidth + i;
				if(tileX < 0) continue;
				if(tileX >= this.map.width) break;
				var _g4 = this.map.getTile(tileX,tileY);
				switch(_g4[1]) {
				case 1:
					boxTiles.push({ x : i * this.tileWidth, y : j * this.tileHeight});
					break;
				case 0:
					emptyTiles.push({ x : i * this.tileWidth, y : j * this.tileHeight});
					break;
				}
			}
			this.drawRectTiles(supertileGraphics,boxTiles,12552240,10905088);
			this.drawRectTiles(supertileGraphics,emptyTiles,16758336,10905088);
		}
		supertileTexture.render(supertileGraphics,false);
		var supertileSprite = new PIXI.Sprite(supertileTexture);
		supertileSprite.position.x = x * this.supertileWidth * this.tileWidth;
		supertileSprite.position.y = y * this.supertileHeight * this.tileHeight;
		return supertileSprite;
	}
	,tileCache: function(x,y) {
		if(this.tilesCache.exists("" + x + "-" + y)) return this.tilesCache.get("" + x + "-" + y); else return this.buildTile(x,y);
	}
	,drawRectTiles: function(graphics,tiles,tileColor,borderColor) {
		graphics.beginFill(tileColor);
		graphics.lineStyle(1,borderColor);
		var _g = 0;
		while(_g < tiles.length) {
			var i = tiles[_g];
			++_g;
			graphics.drawRect(i.x + 2,i.y + 2,this.tileWidth - 4,this.tileHeight - 4);
		}
		graphics.endFill();
	}
	,__class__: TileFactory
}
var haxe = {}
haxe.ds = {}
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref["$" + i];
		}};
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,exists: function(key) {
		return this.h.hasOwnProperty("$" + key);
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,set: function(key,value) {
		this.h["$" + key] = value;
	}
	,__class__: haxe.ds.StringMap
}
var js = {}
js.Boot = function() { }
js.Boot.__name__ = true;
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) {
					if(cl == Array) return o.__enum__ == null;
					return true;
				}
				if(js.Boot.__interfLoop(o.__class__,cl)) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
}
js.Browser = function() { }
js.Browser.__name__ = true;
var pixi = {}
pixi.Event = function() { }
pixi.Event.__name__ = true;
pixi.Event.prototype = {
	__class__: pixi.Event
}
pixi.IRenderer = function() { }
pixi.IRenderer.__name__ = true;
pixi.IRenderer.prototype = {
	__class__: pixi.IRenderer
}
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; };
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; };
Math.__name__ = ["Math"];
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i) {
	return isNaN(i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.prototype.__class__ = Array;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
js.Browser.window = typeof window != "undefined" ? window : null;
js.Browser.document = typeof window != "undefined" ? window.document : null;
Game.main();
})();
