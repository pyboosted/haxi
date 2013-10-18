package pixi;

interface IRenderer {
  public var view: js.html.CanvasElement;
  public function render(stage:pixi.Stage):Void;
}