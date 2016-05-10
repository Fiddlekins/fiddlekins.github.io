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
	terminal.linesPerScreen = Math.floor((terminal.canvasOutput.height - terminal.textOffsetY) / terminal.fontSize);
	terminal.rowHeight = terminal.fontSize;

	terminal.isDirty = true;

	terminal.content.updateHistoryChunks();
	terminal.content.updateMaxCurrentPageIndex();
};
window.addEventListener('resize', terminal.setCanvasSize);

terminal.content = {};
terminal.content.currentPageIndex = 0;
terminal.content.historyChunks = 0;
terminal.content.maxCurrentPageIndex = 0;
terminal.content.previousLastDisplayedChunk = 0;
terminal.content.getChunksInLine = function(lineString){
	return Math.max(Math.ceil(lineString.length / terminal.charsPerLine), 1);
};
terminal.content.updateHistoryChunks = function(){
	terminal.content.historyChunks = 0;
	for (var lineIndex = 0; lineIndex < terminal.content.lines.length; lineIndex++) {
		var line = terminal.content.lines[lineIndex];
		terminal.content.historyChunks += terminal.content.getChunksInLine(line);
	}
};
terminal.content.updateMaxCurrentPageIndex = function(){
	var chunksInInput = terminal.content.getChunksInLine(terminal.inputController.currentInputString);
	terminal.content.maxCurrentPageIndex = Math.floor((terminal.content.historyChunks - 1) / (terminal.linesPerScreen - chunksInInput)); // Minus 1 because zero index
	// Work out what the currentPageIndex needs to change to in order to display the same part of the history
	terminal.content.currentPageIndex = Math.floor(terminal.content.previousLastDisplayedChunk / (terminal.linesPerScreen - chunksInInput));
	// If this works out to an invalid value default to the max, because it's likely cause by trying to divide by zero due to input filling screen
	if (!terminal.content.currentPageIndex && terminal.content.currentPageIndex !== 0) {
		terminal.content.currentPageIndex = terminal.content.maxCurrentPageIndex;
	}
	terminal.content.clampCurrentPageIndex();
};
terminal.content.clampCurrentPageIndex = function(){
	terminal.content.currentPageIndex = Math.min(Math.max(terminal.content.currentPageIndex, 0), terminal.content.maxCurrentPageIndex);
	var chunksInInput = terminal.content.getChunksInLine(terminal.inputController.currentInputString);
	terminal.content.previousLastDisplayedChunk = terminal.content.currentPageIndex * (terminal.linesPerScreen - chunksInInput);
};
terminal.content.incrementCurrentPageIndex = function(){
	terminal.content.currentPageIndex++;
	terminal.content.clampCurrentPageIndex();
};
terminal.content.decrementCurrentPageIndex = function(){
	terminal.content.currentPageIndex--;
	terminal.content.clampCurrentPageIndex();
};
terminal.content.pushLine = function(line){
	terminal.content.lines.push(line);
	terminal.content.updateHistoryChunks();
};
terminal.content.concatLines = function(lines){
	terminal.content.lines = terminal.content.lines.concat(lines);
	terminal.content.updateHistoryChunks();
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
		var chunksInInput = terminal.content.getChunksInLine(terminal.inputController.currentInputString);
		var currentPageStartChunk = chunksInInput + terminal.content.currentPageIndex * (terminal.linesPerScreen - chunksInInput);
		var currentOverallChunk = 0;

		// Reverse iteration so that the most recently pushed line is displayed at the bottom
		for (var lineIndex = terminal.content.lines.length; lineIndex >= 0; lineIndex--) {
			var isInputLine = lineIndex === terminal.content.lines.length;
			var line = isInputLine ? terminal.inputController.currentInputString : terminal.content.lines[lineIndex];
			var chunksInLine = terminal.content.getChunksInLine(line);

			for (var chunkIndex = chunksInLine - 1; chunkIndex >= 0; chunkIndex--) {
				if (isInputLine || currentOverallChunk >= currentPageStartChunk) {
					terminal.ctxGlitchInput.fillText(
						line.slice(chunkIndex * terminal.charsPerLine, (chunkIndex + 1) * terminal.charsPerLine),
						terminal.textOffsetX,
						terminal.canvasGlitchInput.height - ( terminal.textOffsetY + terminal.rowHeight * rowIndex)
					);
					rowIndex++;
					if (currentOverallChunk >= currentPageStartChunk + terminal.linesPerScreen) {
						break;
					}
				}
				currentOverallChunk++;
			}
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
