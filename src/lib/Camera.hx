package ;

class Camera {

  public var x:Float;
  public var y:Float;
  public var width:Float;
  public var height:Float;

  public var view:pixi.DisplayObjectContainer;
  
  var bounds:pixi.Rectangle;

  public function new(x, y, width, height) {
    view = new pixi.DisplayObjectContainer();
    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    if (x - width/2 < 0) this.x = width/2;
    if (y - height/2 < 0) this.y = height/2;

    bounds = new pixi.Rectangle(this.x - width/2, this.y - height/2, width, height);
  }

  var maxWidth:Int = 0;
  var maxHeight:Int = 0;
  public function setLimits(width, height) {
    maxWidth = width;
    maxHeight = height;
  }

  // drag to move camera
  public function bindControls(stage:pixi.Stage) {
    var start;
    var isDragging = false;

    stage.touchstart = stage.mousedown = function (data) {
      isDragging = true;
      start = data.getLocalPosition(stage);
    };
    stage.touchend = stage.mouseup = function (data) {
      isDragging = false;
    };
    stage.touchmove = stage.mousemove = function (data: Dynamic) {
      if (isDragging) {
        var newPosition = data.getLocalPosition(stage);
        this.x -= (newPosition.x - start.x);
        this.y -= (newPosition.y - start.y);
        start.x = newPosition.x;
        start.y = newPosition.y;

        if (this.x - width/2 < 0) this.x = width/2;
        if (this.y - height/2 < 0) this.y = height/2;

        if (maxWidth != 0 && this.x + width/2 > maxWidth) this.x = maxWidth - width/2;
        if (maxHeight != 0 && this.y + height/2 > maxHeight) this.y = maxHeight - height/2;
      }
    };
  }

  var prevX:Float;
  var prevY:Float;
  public function updateBounds() {
    if (prevX != x || prevY != y) {
      bounds.x = x - width / 2;
      bounds.y = y - height / 2;
      return bounds;
    } else {
      return null;
    }
  }
}