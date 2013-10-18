package pixi;

@:publicFields
@:native('PIXI')
extern class Pixi {
  static function autoDetectRenderer(width:Int, height:Int):IRenderer;
  static var batch:Array<Dynamic>;
}
