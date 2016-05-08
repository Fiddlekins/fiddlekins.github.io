'use strict';

terminal.glitch = {
	canvasIn: terminal.canvasGlitchInput,
	canvasOut: terminal.canvasOutput,
	ctxIn: terminal.ctxGlitchInput,
	ctxOut: terminal.ctxOutput
};

terminal.glitch.extract = [];

terminal.glitch.updateInputImageData = function(){
	terminal.glitch.inputImageData = terminal.glitch.ctxIn.getImageData(0, 0, terminal.glitch.canvasIn.width, terminal.glitch.canvasIn.height);
};

terminal.glitch.update = function(timeDelta){
	terminal.isGlitch = true;
};

terminal.glitch.staticFuzz = {
	factor: 100,
	factorBase: 100
};

terminal.glitch.draw = function(){
	var width = terminal.glitch.canvasIn.width;
	var height = terminal.glitch.canvasIn.height;

	var overwriteStartPoint = Math.floor(Math.random() * height) * width * 4;
	var overwriteLength = Math.floor(Math.random() * (terminal.glitch.inputImageData.data.length - overwriteStartPoint));
	for (var i = 0; i < overwriteLength; i++) {
		if (terminal.glitch.inputImageData.data[overwriteStartPoint + i] > 0 && (i + 1) % 4) {
			terminal.glitch.inputImageData.data[overwriteStartPoint + i] = terminal.glitch.staticFuzz.factorBase + Math.floor(Math.random() * (255 - terminal.glitch.staticFuzz.factor));
		}
	}
	terminal.glitch.ctxOut.putImageData(terminal.glitch.inputImageData, 0, 0);
};
