'use strict';

terminal.setCanvasSize();

window.requestAnimationFrame(terminal.updateRoot);

terminal.isDirty = true;
terminal.isGlitch = true;