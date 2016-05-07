'use strict';

var terminal = {
	canvas: document.getElementById('canvas-terminal')
};

terminal.canvas.width = 800;
terminal.canvas.height = 600;

terminal.ctx = terminal.canvas.getContext('2d');

terminal.fontSize = 20;
terminal.ctx.font = terminal.fontSize + 'px monospace';
terminal.ctx.fillStyle = 'rgb(255,255,255)';
terminal.ctx.textBaseline = 'bottom';

// Manually divined numbers
terminal.textOffsetX = 15;
terminal.textOffsetY = 12;

terminal.characterWidth = terminal.ctx.measureText(' ').width;
terminal.charsPerLine = Math.floor((terminal.canvas.width - terminal.textOffsetX * 2) / terminal.characterWidth);
terminal.rowHeight = terminal.fontSize;

terminal.content = {};
terminal.content.pushLine = function(line){
	terminal.content.lines.push(line);
};
terminal.content.lines = [
	'Welcome to the lair of the Fiddlekins.'
];

terminal.isDirty = false;

terminal.previousTimeElapsed = 0;

terminal.updateRoot = function(timeElapsed){
	terminal.update(timeElapsed - terminal.previousTimeElapsed, timeElapsed);
	terminal.previousTimeElapsed = timeElapsed;
	window.requestAnimationFrame(terminal.updateRoot);
};

terminal.update = function(timeDelta, timeElapsed){
	terminal.inputController.caret.update(timeDelta);
	terminal.draw();
};

terminal.draw = function(){
	if (terminal.isDirty) {
		terminal.isDirty = false;

		terminal.ctx.clearRect(0, 0, terminal.canvas.width, terminal.canvas.height);

		var rowIndex = 0;

		// Reverse iteration so that the most recently pushed line is displayed at the bottom
		for (var lineIndex = terminal.content.lines.length; lineIndex >= 0; lineIndex--) {
			var isInputLine = lineIndex === terminal.content.lines.length;
			var line = isInputLine ? terminal.inputController.currentInput : terminal.content.lines[lineIndex];
			var chunkTotal = Math.max(Math.ceil(line.length / terminal.charsPerLine), 1);

			rowIndex += chunkTotal;

			for (var chunkIndex = 0; chunkIndex < chunkTotal; chunkIndex++) {
				rowIndex--;
				terminal.ctx.fillText(
					line.slice(chunkIndex * terminal.charsPerLine, (chunkIndex + 1) * terminal.charsPerLine),
					terminal.textOffsetX,
					terminal.canvas.height - ( terminal.textOffsetY + terminal.rowHeight * rowIndex)
				);
			}

			rowIndex += chunkTotal;
		}

		terminal.inputController.caret.draw(terminal.ctx);
	}
};