package ;

typedef MapData = {
  var width:Int;
  var height:Int;
  var tiles:Array<String>;
}

enum MapTile {
  EMPTY;
  BOX;
}

class LevelMap {
  
  var jsonData:String;
  
  public var width:Int;
  public var height:Int;

  public var view:pixi.DisplayObjectContainer;

  var tiles:Array<Array<MapTile>>;

  public function new(jsonData:String) {
    this.jsonData = jsonData;
    tiles = new Array<Array<MapTile>>();
    view = new pixi.DisplayObjectContainer();
  }

  public function load():Void {
    var mapLoader = new pixi.JsonLoader('assets/map.json');
    mapLoader.addEventListener('loaded', mapLoaded);
    mapLoader.load();
  }

  public function getTile(x:Int,y:Int):MapTile {
    return tiles[y][x];
  }

  private function mapLoaded(data:pixi.Event<pixi.JsonLoader>) {
    var mapData:MapData = data.content.json.map;
    width = mapData.width;
    height = mapData.height;

    for (j in 0...height) {
      var line = new Array<MapTile>();
      for (i in 0...width) {
        if (mapData.tiles[j].charAt(i) == '0') {
          line.push(MapTile.EMPTY);
        } else {
          line.push(MapTile.BOX);
        }
      }
      tiles.push(line);
    }
    onLoad(this);
  }

  public var onLoad:LevelMap->Void;

}