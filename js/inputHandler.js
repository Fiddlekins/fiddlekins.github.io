'use strict';

terminal.inputHandler = {};

terminal.inputHandler.currentDirectory = terminal.directoryStructure.root;
terminal.inputHandler.currentDirectoryString = '';
terminal.inputHandler.updateCurrentDirectoryString = function(){
	terminal.inputHandler.currentDirectoryString = terminal.inputHandler.currentDirectory.getPath().join('/') + '>';
};

terminal.inputHandler.process = function(string){
	terminal.content.pushLine(terminal.inputController.currentInputString);
	var args, target;
	if (/^ *$/.test(string)) {
		// Do nothing
	} else if (/^cd( |$)/i.test(string)) {
		args = string.slice(3).trim();
		if (/^ *$/.test(args)) {
			terminal.content.pushLine(terminal.inputHandler.currentDirectoryString.slice(0, terminal.inputHandler.currentDirectoryString.length - 1));
		} else {
			target = terminal.inputHandler.currentDirectory.changeDirectory(args.split('/').reverse());
			if (target instanceof terminal.directoryStructure.Folder) {
				terminal.inputHandler.currentDirectory = target;
				terminal.inputHandler.updateCurrentDirectoryString();
				terminal.inputController.updateCurrentInputString();
			} else {
				terminal.content.pushLine(target);
			}
		}
	} else if (/^dir( |$)/i.test(string)) {
		args = string.slice(4).trim();
		if (args.length && args !== ' ') {
			target = terminal.inputHandler.currentDirectory.changeDirectory(args.split('/').reverse());
		} else {
			target = terminal.inputHandler.currentDirectory;
		}
		if (target instanceof terminal.directoryStructure.Folder) {
			var contents = target.listChildren();
			terminal.content.concatLines(contents);
		} else if (target instanceof terminal.directoryStructure.File) {
			terminal.content.pushLine('Error: The specified target is not a folder.');
		} else {
			terminal.content.pushLine(target);
		}
	} else if (/^help( |$)/i.test(string)) {
		terminal.content.concatLines(terminal.inputHandler.help);
	} else {
		var targetDirectory = string.trim().split('/');
		var targetFile = targetDirectory.pop();
		var output = (targetDirectory.length ? terminal.inputHandler.currentDirectory.changeDirectory(targetDirectory.reverse()) : terminal.inputHandler.currentDirectory).execute(targetFile);
		if (typeof output === 'string') {
			terminal.content.pushLine(output);
		} else {
			terminal.content.concatLines(output);
		}
	}
};

terminal.inputHandler.help = [
	'CD     Displays the name of or changes the current directory.',
	'DIR    Displays a list of files and subdirectories in a directory.',
	'HELP   Provides Help information for commands.'
];

terminal.inputHandler.lastUserTypedInput = '';
terminal.inputHandler.lastAutoCompleteSelectedItem = '';
terminal.inputHandler.updateLastUserTypedInput = function(){
	terminal.inputHandler.lastUserTypedInput = terminal.inputController.currentInput;
	terminal.inputHandler.lastAutoCompleteSelectedItem = '';
};
terminal.inputHandler.autoComplete = function(){
	var commandMatch = terminal.inputHandler.lastUserTypedInput.match(/^([^ ]+)( +)(.*)/);
	var input = commandMatch ? commandMatch[3] : terminal.inputHandler.lastUserTypedInput;
	if (input === '~') {
		return;
	}
	var inputFilePath = input.split('/');
	var inputToMatch = inputFilePath.pop();
	var initialPath = inputFilePath.length ? inputFilePath.join('/') : '.';
	var resolvedPath = terminal.inputHandler.currentDirectory.changeDirectory(inputFilePath.reverse());
	if (typeof resolvedPath === 'string') {
		return;
	}
	var potentialOptions = resolvedPath.getChildrenNames();
	var validOptions = [];
	var inputToMatchRegExp = new RegExp('^' + inputToMatch);
	for (var potentialOptionIndex = 0; potentialOptionIndex < potentialOptions.length; potentialOptionIndex++) {
		var potentialOption = potentialOptions[potentialOptionIndex];
		if (inputToMatchRegExp.test(potentialOption)) {
			validOptions.push(potentialOption);
		}
	}
	validOptions.sort();
	if (validOptions.length === 0) {
		return;
	}
	var lastAutoCompleteSelectedIndex = validOptions.indexOf(terminal.inputHandler.lastAutoCompleteSelectedItem);
	terminal.inputHandler.lastAutoCompleteSelectedItem = validOptions[(lastAutoCompleteSelectedIndex + 1) % validOptions.length];
	terminal.inputController.currentInput = (commandMatch ? commandMatch[1] + commandMatch[2] : '') + initialPath + '/' + terminal.inputHandler.lastAutoCompleteSelectedItem;
	terminal.inputController.updateCurrentInputString();
	terminal.inputController.caret.setPosition(terminal.inputController.currentInput.length);
	terminal.isDirty = true;
};
