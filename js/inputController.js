'use strict';

terminal.inputController = {};

terminal.inputController.caret = {};
terminal.inputController.caret.position = 0;
terminal.inputController.caret.blinkCycleDuration = 1000;
terminal.inputController.caret.timeSinceLastInput = 0;
terminal.inputController.caret.shouldDraw = true;
terminal.inputController.caret.fillStyle = 'white';
terminal.inputController.caret.setPosition = function(position){
	terminal.inputController.caret.position = Math.max(Math.min(position, terminal.inputController.currentInput.length), 0);
	terminal.isDirty = true;
};
terminal.inputController.caret.setBlinkOn = function(){
	terminal.inputController.caret.timeSinceLastInput = terminal.inputController.caret.blinkCycleDuration / 2;
};
terminal.inputController.caret.setBlinkOff = function(){
	terminal.inputController.caret.timeSinceLastInput = 0;
};
terminal.inputController.caret.update = function(timeDelta){
	terminal.inputController.caret.timeSinceLastInput += timeDelta;
	var lastShouldDraw = terminal.inputController.caret.shouldDraw;
	terminal.inputController.caret.shouldDraw =
		terminal.inputController.caret.timeSinceLastInput % terminal.inputController.caret.blinkCycleDuration >
		terminal.inputController.caret.blinkCycleDuration / 2;
	terminal.isDirty = terminal.isDirty || terminal.inputController.caret.shouldDraw !== lastShouldDraw;
};
terminal.inputController.caret.draw = function(ctx){
	if (terminal.inputController.caret.shouldDraw) {
		var currentFillStyle = ctx.fillStyle;
		ctx.fillStyle = terminal.inputController.caret.fillStyle;
		ctx.globalCompositeOperation = 'difference';
		ctx.fillRect(
			terminal.textOffsetX + terminal.characterWidth * terminal.inputController.caret.position,
			terminal.canvas.height - terminal.textOffsetY,
			terminal.characterWidth,
			-3
		);
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = currentFillStyle;
	}
};

terminal.inputController.currentInput = '';
terminal.inputController.ignoreCharcodesOnKeypress = [
	'Enter'
];

terminal.inputController.insertIntoString = function(targetString, sourceString, position){
	return targetString.slice(0, position) + sourceString + targetString.slice(position);
};

terminal.inputController.removeFromString = function(targetString, position, count){
	return targetString.slice(0, position) + targetString.slice(position + (count || 1));
};

terminal.inputController.currentInputInsert = function(string){
	terminal.inputController.currentInput = terminal.inputController.insertIntoString(
		terminal.inputController.currentInput,
		string,
		terminal.inputController.caret.position
	);
	terminal.inputController.caret.position++;
};

terminal.inputController.currentInputRemoveChar = function(position){
	terminal.inputController.currentInput = terminal.inputController.removeFromString(
		terminal.inputController.currentInput,
		position,
		1
	);
};

window.addEventListener('keypress', function(e){
	if (terminal.inputController.ignoreCharcodesOnKeypress.indexOf(e.code) === -1) {
		terminal.inputController.currentInputInsert(String.fromCharCode(e.keyCode));
		terminal.inputController.caret.setBlinkOff();
		terminal.isDirty = true;
	}
});

window.addEventListener('keydown', function(e){
	switch (e.code) {
		case 'Enter':
			terminal.inputHandler.process(terminal.inputController.currentInput);
			terminal.inputController.currentInput = '';
			terminal.inputController.caret.setPosition(0);
			terminal.isDirty = true;
			break;
		case 'Backspace':
			terminal.inputController.currentInputRemoveChar(terminal.inputController.caret.position - 1);
			terminal.inputController.caret.setPosition(terminal.inputController.caret.position - 1);
			break;
		case 'ArrowLeft':
			terminal.inputController.caret.setPosition(terminal.inputController.caret.position - 1);
			terminal.inputController.caret.setBlinkOn();
			break;
		case 'ArrowRight':
			terminal.inputController.caret.setPosition(terminal.inputController.caret.position + 1);
			terminal.inputController.caret.setBlinkOn();
			break;
		case 'ArrowDown':
			break;
		case 'ArrowUp':
			break;
		case 'Delete':
			terminal.inputController.currentInputRemoveChar(terminal.inputController.caret.position);
			terminal.isDirty = true;
			break;
		case 'Insert':
			break;
		case 'Home':
			terminal.inputController.caret.setPosition(0);
			break;
		case 'End':
			terminal.inputController.caret.setPosition(terminal.inputController.currentInput.length);
			break;
		case 'PageUp':
			break;
		case 'PageDown':
			break;
	}
});