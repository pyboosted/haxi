package ;

import pixi.Pixi;
import keyboard.Keyboard;

@:expose class Game {

  var viewportWidth:Int;
  var viewportHeight:Int;

  var renderer: pixi.IRenderer;
  var stage: pixi.Stage;
  var map:LevelMap;
  var tileFactory:TileFactory;
  var cam:Camera;
  var lastTime:Float;
  var canvas:js.html.Element;

  public function new(canvasId: String) {

    this.canvas = js.Browser.document.getElementById(canvasId);

    viewportWidth = canvas.clientWidth;
    viewportHeight = canvas.clientHeight;

    map = new LevelMap('assets/map.json');
    map.onLoad = run;
    map.load();    

    stage = new pixi.Stage(0xFFC973);
    stage.setInteractive(true);

    cam = new Camera(0,0,viewportWidth, viewportHeight);
    cam.bindControls(stage);

  }

  var tileWidth:Int = 64;
  var tileHeight:Int = 64;

  public function run(map: LevelMap) {
    
    

    tileFactory = new TileFactory(map, tileWidth, tileHeight, Math.ceil(viewportWidth / (tileWidth*2)), Math.ceil(viewportHeight / (tileHeight*2)));

    renderer = Pixi.autoDetectRenderer(viewportWidth, viewportHeight, canvas);
    
    stage.addChild(map.view);
    cam.setLimits(map.width*tileWidth, map.height*tileHeight);

    js.Browser.window.requestAnimationFrame(render);    
  }

  public function render(val:Float):Bool {

    var time:Float = Date.now().getTime();
    var timeDiff:Float = 30; // default time diff :)
    if (lastTime != null) {
      timeDiff = time - lastTime;
    }
    lastTime = time;
    tileFactory.render(cam, map.view);

    if (timeDiff > 50) trace(timeDiff);
    var keys = Keyboard.activeKeys();
    
    if (Lambda.indexOf(keys, 'a') != -1) {
      cam.x -= 0.45*timeDiff;
    }
    if (Lambda.indexOf(keys, 'd') != -1) {
      cam.x += 0.45*timeDiff;
    }
    if (Lambda.indexOf(keys, 's') != -1) {
      cam.y += 0.45*timeDiff;
    }
    if (Lambda.indexOf(keys, 'w') != -1) {
      cam.y -= 0.45*timeDiff;
    }

    map.view.position.x = -cam.x + cam.width/2;
    map.view.position.y = -cam.y + cam.height/2;

    js.Browser.window.requestAnimationFrame(render);
    renderer.render(stage);

    return true;
  }

  public static function main () {}


}