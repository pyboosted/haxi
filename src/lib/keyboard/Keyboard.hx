package keyboard;

@:publicFields
@:native('KeyboardJS')
extern class Keyboard {
  public static function activeKeys():Array<String>;
}