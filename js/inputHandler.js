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
	if (/^cd( |$)/i.test(string)) {
		args = string.slice(3);
		if (/^ *$/.test(args)) {
			terminal.content.pushLine(terminal.inputHandler.currentDirectoryString.slice(0, terminal.inputHandler.currentDirectoryString.length - 1));
		} else {
			target = terminal.inputHandler.currentDirectory.changeDirectory(args.split('/').reverse());
			if (typeof target === 'string') {
				terminal.content.pushLine(target);
			} else {
				terminal.inputHandler.currentDirectory = target;
				terminal.inputHandler.updateCurrentDirectoryString();
				terminal.inputController.updateCurrentInputString();
			}
		}
	} else if (/^dir( |$)/i.test(string)) {
		args = string.slice(4);
		if (args.length && args !== ' ') {
			target = terminal.inputHandler.currentDirectory.changeDirectory(args.split('/').reverse());
		} else {
			target = terminal.inputHandler.currentDirectory;
		}
		var contents = target.listContents();
		terminal.content.concatLines(contents);
	} else if (/^help( |$)/i.test(string)) {
		terminal.content.concatLines(terminal.inputHandler.help);
	} else {
		var targetDirectory = string.split('/');
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