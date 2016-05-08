'use strict';

terminal.setCanvasSize();

terminal.inputHandler.updateCurrentDirectoryString();
terminal.inputController.updateCurrentInputString();


window.requestAnimationFrame(terminal.updateRoot);

terminal.isDirty = true;
terminal.isGlitch = true;
