'use strict';

var terminal = {
	canvasOutput: document.getElementById('canvas-terminal'),
	canvasGlitchInput: document.createElement('canvas'),
	canvasFavicon: document.createElement('canvas'),
	favicon: document.getElementById('favicon')
};

terminal.canvasFavicon.width = 8;
terminal.canvasFavicon.height = 8;

terminal.ctxOutput = terminal.canvasOutput.getContext('2d');
terminal.ctxGlitchInput = terminal.canvasGlitchInput.getContext('2d');
terminal.ctxFavicon = terminal.canvasFavicon.getContext('2d');

terminal.ctxOutput.imageSmoothingEnabled = false;
terminal.ctxGlitchInput.imageSmoothingEnabled = false;
terminal.ctxFavicon.imageSmoothingEnabled = false;

// Manually divined numbers
terminal.textOffsetX = 15;
terminal.textOffsetY = 12;

terminal.setCanvasSize = function(){
	var viewWidth = parseInt(window.getComputedStyle(terminal.canvasOutput).width);
	var viewHeight = parseInt(window.getComputedStyle(terminal.canvasOutput).height);
	var ratio = viewHeight / viewWidth;

	var width = viewWidth > 800 ? 800 : viewWidth;
	var height = Math.round(ratio * width);

	terminal.canvasOutput.width = width;
	terminal.canvasOutput.height = height;
	terminal.canvasGlitchInput.width = width;
	terminal.canvasGlitchInput.height = height;

	terminal.fontSize = Math.max(width / 40, 10); // Gives a max fontSize of 20, then scales it until it goes below the min fontSize 10
	terminal.ctxGlitchInput.font = terminal.fontSize + 'px Consolas';
	terminal.ctxGlitchInput.fillStyle = 'rgb(255,255,255)';
	terminal.ctxGlitchInput.textBaseline = 'bottom';

	terminal.characterWidth = terminal.ctxGlitchInput.measureText(' ').width;
	terminal.charsPerLine = Math.floor((terminal.canvasOutput.width - terminal.textOffsetX * 2) / terminal.characterWidth);
	terminal.rowHeight = terminal.fontSize;

	terminal.isDirty = true;
};
window.addEventListener('resize', terminal.setCanvasSize);

terminal.content = {};
terminal.content.pushLine = function(line){
	terminal.content.lines.push(line);
};
terminal.content.concatLines = function(lines){
	terminal.content.lines = terminal.content.lines.concat(lines);
};
terminal.content.lines = [
	'Welcome to the lair of the Fiddlekins.'
];

terminal.isDirty = false;
terminal.isGlitch = false;
terminal.shouldRefreshFavicon = false;

terminal.previousTimeElapsed = 0;

terminal.updateRoot = function(timeElapsed){
	terminal.update(timeElapsed - terminal.previousTimeElapsed, timeElapsed);
	terminal.previousTimeElapsed = timeElapsed;
	window.requestAnimationFrame(terminal.updateRoot);
};

terminal.update = function(timeDelta, timeElapsed){
	terminal.inputController.caret.update(timeDelta);
	terminal.glitch.update(timeDelta);
	terminal.draw();
};

terminal.draw = function(){
	if (terminal.isDirty) {

		terminal.ctxGlitchInput.clearRect(0, 0, terminal.canvasGlitchInput.width, terminal.canvasGlitchInput.height);

		var rowIndex = 0;

		// Reverse iteration so that the most recently pushed line is displayed at the bottom
		for (var lineIndex = terminal.content.lines.length; lineIndex >= 0; lineIndex--) {
			var isInputLine = lineIndex === terminal.content.lines.length;
			var line = isInputLine ? terminal.inputController.currentInputString : terminal.content.lines[lineIndex];
			var chunkTotal = Math.max(Math.ceil(line.length / terminal.charsPerLine), 1);

			rowIndex += chunkTotal;

			for (var chunkIndex = 0; chunkIndex < chunkTotal; chunkIndex++) {
				rowIndex--;
				terminal.ctxGlitchInput.fillText(
					line.slice(chunkIndex * terminal.charsPerLine, (chunkIndex + 1) * terminal.charsPerLine),
					terminal.textOffsetX,
					terminal.canvasGlitchInput.height - ( terminal.textOffsetY + terminal.rowHeight * rowIndex)
				);
			}

			rowIndex += chunkTotal;
		}

		terminal.inputController.caret.draw(terminal.ctxGlitchInput);

		terminal.glitch.updateInputImageData();
	}
	if (terminal.shouldRefreshFavicon) {
		terminal.shouldRefreshFavicon = false;
		terminal.ctxFavicon.fillRect(0, 0, terminal.canvasFavicon.width, terminal.canvasFavicon.height);
		// This was meant to just make the favicon represent the terminal content, but it's too small a target for the scaling to work decently
		// So now it just makes an a e s t h e t i c favicon based upon the terminal content
		for (var count = 2; count > 0; count--) {
			terminal.ctxFavicon.drawImage(
				terminal.canvasGlitchInput,
				0,
				0,
				terminal.canvasGlitchInput.height / 2,
				terminal.canvasGlitchInput.height,
				0,
				0,
				terminal.canvasFavicon.width,
				terminal.canvasFavicon.height
			);
		}
		terminal.favicon.href = terminal.canvasFavicon.toDataURL();
	}
	if (terminal.isGlitch || terminal.isDirty) {
		terminal.glitch.draw();
	}
	terminal.isDirty = false;
	terminal.isGlitch = false;
};
