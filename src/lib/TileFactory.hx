package ;

using Math;

typedef TileInfo = {
  var x:Int;
  var y:Int;
  var tile:pixi.Sprite;
}

typedef TileCoords = {
  var x:Float;
  var y:Float;
}

class TileFactory {
  
  var map:LevelMap;
  
  var tileWidth: Int;
  var tileHeight: Int;
  
  var supertileWidth: Int;
  var supertileHeight: Int;

  var renderedTiles: Map<String, TileInfo>;
  var tilesCache: Map<String, pixi.Sprite>;

  public function new(map, tileWidth, tileHeight, supertileWidth, supertileHeight) {
    this.map = map;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.supertileWidth = supertileWidth;
    this.supertileHeight = supertileHeight;
    renderedTiles = new Map<String, TileInfo>();
    tilesCache = new Map<String,pixi.Sprite>();
  }

  private inline function drawRectTiles(graphics:pixi.Graphics, tiles:Array<TileCoords>, tileColor:Int, borderColor:Int) {
    graphics.beginFill(tileColor);
    graphics.lineStyle(1, borderColor);
    for (i in tiles) {
      graphics.drawRect(i.x+2, i.y+2, tileWidth-4, tileHeight-4);  
    }
    graphics.endFill();
  }

  private function tileCache(x:Int, y:Int):pixi.Sprite {
    if (tilesCache.exists('$x-$y')) {
      return tilesCache.get('$x-$y');
    } else {
      return buildTile(x,y);
    }
  }

  private function buildTile(x:Int, y:Int):pixi.Sprite {
    var supertileTexture = new pixi.RenderTexture(supertileWidth*tileWidth, supertileHeight*tileHeight);
    var supertileGraphics = new pixi.Graphics();

    var boxTiles = new Array<TileCoords>();
    var emptyTiles = new Array<TileCoords>();
    for (j in 0...supertileHeight) {
      var tileY = y * supertileHeight + j;
      if (tileY < 0) continue;
      if (tileY >= map.height) break;
      for (i in 0...supertileWidth) {
        var tileX = x * supertileWidth + i;
        if (tileX < 0) continue;
        if (tileX >= map.width) break;
        switch(map.getTile(tileX, tileY)) {
          case BOX:
            boxTiles.push({ x: i*tileWidth, y: j*tileHeight });
          case EMPTY:
            emptyTiles.push({ x: i*tileWidth, y: j*tileHeight });
        }
      }
      drawRectTiles(supertileGraphics, boxTiles, 0xBF8830, 0xA66600);  
      drawRectTiles(supertileGraphics, emptyTiles, 0xFFB640, 0xA66600); 
    }

    supertileTexture.render(supertileGraphics, false);

    var supertileSprite = new pixi.Sprite(supertileTexture);
    supertileSprite.position.x = x * supertileWidth * tileWidth;
    supertileSprite.position.y = y * supertileHeight * tileHeight;
    return supertileSprite;
  }

  var lastTileX:Int;
  var lastTileY:Int;
  var lastTileX2:Int;
  var lastTileY2:Int;
  var padding:Int = 10;
  public function render(cam:Camera, view:pixi.DisplayObjectContainer) {
    
    var bounds = cam.updateBounds();
    if (bounds == null) return;
    var x = bounds.x;
    var y = bounds.y;
    var x2 = bounds.x + bounds.width;
    var y2 = bounds.y + bounds.height;

    var tileX = ((x - padding) / (supertileWidth*tileWidth)).floor();
    var tileY = ((y - padding) / (supertileHeight*tileHeight)).floor();

    var tileX2 = ((x2 + padding) / (supertileWidth*tileWidth)).ceil();
    var tileY2 = ((y2 + padding) / (supertileHeight*tileHeight)).ceil();

    if (tileX < 0) tileX = 0;
    if (tileY < 0) tileY = 0;

    if (tileX != lastTileX || tileY != lastTileY || tileX2 != lastTileX2 || tileY2 != lastTileY2) {
      lastTileX = tileX;
      lastTileY = tileY;
      lastTileX2 = tileX2;
      lastTileY2 = tileY2;

      var newTiles = new Map<String,TileInfo>();
      for (i in renderedTiles) {
        if (i.x >= tileX && i.x <= tileX2 && i.y >= tileY && i.y <= tileY2) {
          newTiles.set('${i.x}-${i.y}', i);
        } else {
          view.removeChild(i.tile);
        }
        
      }
      renderedTiles = newTiles;

      for (j in tileY...tileY2) {
        for (i in tileX...tileX2) {
          if (!renderedTiles.exists('$i-$j')) {
            var supertile = buildTile(i, j);
            var tileInfo = { x: i, y: j, tile: supertile };
            renderedTiles.set('$i-j', tileInfo);
            view.addChild(tileInfo.tile);
          }
        }
      }

    }

  }

}