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
			terminal.textOffsetX + terminal.characterWidth * (terminal.inputController.caret.position + terminal.inputHandler.currentDirectoryString.length),
			ctx.canvas.height - terminal.textOffsetY,
			terminal.characterWidth,
			-3
		);
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = currentFillStyle;
	}
};

terminal.inputController.currentInput = '';
terminal.inputController.currentInputString = '';
terminal.inputController.updateCurrentInputString = function(){
	terminal.inputController.currentInputString = terminal.inputHandler.currentDirectoryString + terminal.inputController.currentInput;
	terminal.shouldRefreshFavicon = true;
	terminal.content.updateMaxCurrentPageIndex();
};

terminal.inputController.ignoreCharcodesOnKeypress = [
	'Enter',
	'NumpadEnter'
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
	terminal.inputController.updateCurrentInputString();
	terminal.inputHandler.updateLastUserTypedInput();
};

terminal.inputController.currentInputRemoveChar = function(position){
	terminal.inputController.currentInput = terminal.inputController.removeFromString(
		terminal.inputController.currentInput,
		position,
		1
	);
	terminal.inputController.updateCurrentInputString();
	terminal.inputHandler.updateLastUserTypedInput();
};

terminal.inputController.history = {};
terminal.inputController.history.log = [];
terminal.inputController.history.index = -1;

window.addEventListener('keypress', function(e){
	if (terminal.inputController.ignoreCharcodesOnKeypress.indexOf(e.code) === -1) {
		terminal.inputController.currentInputInsert(e.key || String.fromCharCode(e.keyCode));
		terminal.inputController.caret.setBlinkOff();
		terminal.isDirty = true;
		e.preventDefault();
	}
});

window.addEventListener('keydown', function(e){
	var shouldPreventDefault = true;
	switch (e.code) {
		case 'NumpadEnter':
		case 'Enter':
			terminal.inputController.history.log.push(terminal.inputController.currentInput);
			terminal.inputController.history.index = -1;
			terminal.inputHandler.process(terminal.inputController.currentInput);
			terminal.inputController.currentInput = '';
			terminal.inputController.caret.setPosition(0);
			terminal.isDirty = true;
			terminal.inputController.updateCurrentInputString();
			terminal.inputHandler.updateLastUserTypedInput();
			break;
		case 'Backspace':
			if (terminal.inputController.caret.position > 0) {
				terminal.inputController.currentInputRemoveChar(terminal.inputController.caret.position - 1);
				terminal.inputController.caret.setPosition(terminal.inputController.caret.position - 1);
			}
			break;
		case 'ArrowLeft':
			if (e.ctrlKey) {
				terminal.inputController.ctrlArrowLeft();
			} else {
				terminal.inputController.caret.setPosition(terminal.inputController.caret.position - 1);
			}
			terminal.inputController.caret.setBlinkOn();
			break;
		case 'ArrowRight':
			if (e.ctrlKey) {
				terminal.inputController.ctrlArrowRight();
			} else {
				terminal.inputController.caret.setPosition(terminal.inputController.caret.position + 1);
			}
			terminal.inputController.caret.setBlinkOn();
			break;
		case 'ArrowDown':
			if (terminal.inputController.history.log.length) {
				if (terminal.inputController.history.index === -1) {
					terminal.inputController.history.index = terminal.inputController.history.log.length;
				}
				terminal.inputController.history.index = Math.min(terminal.inputController.history.index + 1, terminal.inputController.history.log.length - 1);
				terminal.inputController.currentInput = terminal.inputController.history.log[terminal.inputController.history.index];
				terminal.inputController.caret.setPosition(terminal.inputController.currentInput.length);
				terminal.inputController.updateCurrentInputString();
				terminal.isDirty = true;
			}
			break;
		case 'ArrowUp':
			if (terminal.inputController.history.log.length) {
				if (terminal.inputController.history.index === -1) {
					terminal.inputController.history.index = terminal.inputController.history.log.length;
				}
				terminal.inputController.history.index = Math.max(terminal.inputController.history.index - 1, 0);
				terminal.inputController.currentInput = terminal.inputController.history.log[terminal.inputController.history.index];
				terminal.inputController.caret.setPosition(terminal.inputController.currentInput.length);
				terminal.inputController.updateCurrentInputString();
				terminal.isDirty = true;
			}
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
			if (e.ctrlKey || e.altKey) {
				terminal.content.maximiseCurrentPageIndex();
			} else {
				terminal.content.incrementCurrentPageIndex();
			}
			terminal.isDirty = true;
			terminal.shouldRefreshFavicon = true;
			break;
		case 'PageDown':
			if (e.ctrlKey || e.altKey) {
				terminal.content.minimiseCurrentPageIndex();
			} else {
				terminal.content.decrementCurrentPageIndex();
			}
			terminal.isDirty = true;
			terminal.shouldRefreshFavicon = true;
			break;
		case 'Tab':
			terminal.inputHandler.autoComplete();
			break;
		default:
			shouldPreventDefault = false;
	}
	if (shouldPreventDefault) {
		e.preventDefault();
	}
});

terminal.inputController.ctrlArrowLeft = function(){
	var wordRegex = /\w/;
	var whitespaceRegex = /\s/;
	var startCharIsWord = wordRegex.test(terminal.inputController.currentInput.charAt(terminal.inputController.caret.position - 1));
	var startCharIsWhitespace = whitespaceRegex.test(terminal.inputController.currentInput.charAt(terminal.inputController.caret.position - 1));
	for (var charIndex = terminal.inputController.caret.position - 1; charIndex >= 0; charIndex--) {
		var charIsWord = wordRegex.test(terminal.inputController.currentInput.charAt(charIndex));
		var charIsWhitespace = whitespaceRegex.test(terminal.inputController.currentInput.charAt(charIndex));
		if (
			(startCharIsWord && !charIsWord) ||
			(startCharIsWhitespace && !charIsWhitespace) ||
			((!startCharIsWord && !startCharIsWhitespace) && ( charIsWord || charIsWhitespace))
		) {
			if (startCharIsWhitespace && terminal.inputController.caret.position - charIndex <= 2) {
				startCharIsWhitespace = false;
				startCharIsWord = charIsWord;
			} else {
				terminal.inputController.caret.setPosition(charIndex + 1);
				return;
			}
		}
	}
	terminal.inputController.caret.setPosition(0);
};

terminal.inputController.ctrlArrowRight = function(){
	var wordRegex = /\w/;
	var whitespaceRegex = /\s/;
	var startCharIsWord = wordRegex.test(terminal.inputController.currentInput.charAt(terminal.inputController.caret.position));
	var startCharIsWhitespace = whitespaceRegex.test(terminal.inputController.currentInput.charAt(terminal.inputController.caret.position));
	for (var charIndex = terminal.inputController.caret.position + 1; charIndex < terminal.inputController.currentInput.length; charIndex++) {
		var charIsWord = wordRegex.test(terminal.inputController.currentInput.charAt(charIndex));
		var charIsWhitespace = whitespaceRegex.test(terminal.inputController.currentInput.charAt(charIndex));
		if (
			(startCharIsWord && !charIsWord) ||
			(startCharIsWhitespace && !charIsWhitespace) ||
			((!startCharIsWord && !startCharIsWhitespace) && ( charIsWord || charIsWhitespace))
		) {
			if (startCharIsWhitespace && charIndex - terminal.inputController.caret.position <= 1) {
				startCharIsWhitespace = false;
				startCharIsWord = charIsWord;
			} else {
				terminal.inputController.caret.setPosition(charIndex);
				return;
			}
		}
	}
	terminal.inputController.caret.setPosition(terminal.inputController.currentInput.length);
};
