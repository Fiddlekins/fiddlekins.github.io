'use strict';

terminal.directoryStructure = {};

terminal.directoryStructure.folder = function(name, parent){
	this._name = name;
	this._parent = parent;
	this._children = {};
	this.isFolder = true;
};

terminal.directoryStructure.folder.prototype.changeDirectory = function(targetDirectoryArray){
	var targetName = targetDirectoryArray.pop();
	switch (targetName) {
		case undefined:
			return this;
		case '~':
			return terminal.directoryStructure.root.changeDirectory(targetDirectoryArray);
		case '.':
			return this.changeDirectory(targetDirectoryArray);
		case '..':
			if (this._parent === undefined) {
				return this;
			}
			return this._parent.changeDirectory(targetDirectoryArray);
	}
	if (this._children[targetName]) {
		if (this._children[targetName].isFolder) {
			return this._children[targetName].changeDirectory(targetDirectoryArray);
		} else {
			return 'Error: The specified target is not a folder.'
		}
	} else {
		return 'Error: The specified folder does not exist.'
	}
};

terminal.directoryStructure.folder.prototype.getPath = function(){
	if (this._parent === undefined) {
		return ['~'];
	}
	var path = this._parent.getPath();
	path.push(this._name);
	return path;
};

terminal.directoryStructure.folder.prototype.listContents = function(){
	var contents = Object.keys(this._children);
	contents.push('.');
	contents.push('..');
	contents.sort();
	for (var contentIndex = 0; contentIndex < contents.length; contentIndex++) {
		var contentName = contents[contentIndex];
		if (contentName === '.') {
			contents[contentIndex] = '<DIR>   ' + contentName;
		} else if (contentName === '..') {
			contents[contentIndex] = '<DIR>   ' + contentName;
		} else if (this._children[contentName].isFolder) {
			contents[contentIndex] = '<DIR>   ' + contentName;
		} else {
			contents[contentIndex] = '        ' + contentName;
		}
	}
	return contents;
};

terminal.directoryStructure.folder.prototype.execute = function(targetName, args){
	if (this._children[targetName]) {
		if (this._children[targetName].isFolder) {
			return 'Error: invalid command.';
		} else {
			return this._children[targetName].execute(args);
		}
	} else {
		return 'Error: The specified file does not exist.'
	}
};

terminal.directoryStructure.folder.prototype.newFolder = function(name){
	if (this._children[name]) {
		return 'Error: A folder with that name already exists.'
	} else {
		this._children[name] = new terminal.directoryStructure.folder(name, this);
	}
};

terminal.directoryStructure.folder.prototype.newFile = function(name){
	if (this._children[name]) {
		return 'Error: A file with that name already exists.'
	} else {
		this._children[name] = new terminal.directoryStructure.file(name, this);
	}
};

terminal.directoryStructure.folder.prototype.getChild = function(name){
	if (this._children[name] === undefined) {
		return 'Error: The specified file or folder does not exist.'
	} else {
		return this._children[name];
	}
};

terminal.directoryStructure.file = function(name, parent){
	this._name = name;
	var extensionMatch = name.match(/.*\.(.+$)/);
	this._fileName = extensionMatch ? extensionMatch[0] : name;
	this._type = extensionMatch ? extensionMatch[1] : null;
	this._parent = parent;
};

terminal.directoryStructure.file.prototype.execute = function(args){
	switch (this._type) {
		case 'exe':
			document.location.href = document.URL + '/' + this._fileName;
			return ['Initialising ' + this._name];
	}
};

terminal.directoryStructure.root = new terminal.directoryStructure.folder('~');

terminal.directoryStructure.root.newFolder('Projects');
terminal.directoryStructure.root.newFolder('js');
terminal.directoryStructure.root.newFolder('css');
terminal.directoryStructure.root.newFolder('recursive');
terminal.directoryStructure.root.newFile('index.html');
terminal.directoryStructure.root.newFile('README.md');

terminal.directoryStructure.root.getChild('Projects').newFile('IsoMapper.exe');
terminal.directoryStructure.root.getChild('Projects').newFile('SpookyX.exe');
terminal.directoryStructure.root.getChild('js').newFile('directoryStructure.js');
terminal.directoryStructure.root.getChild('js').newFile('glitch.js');
terminal.directoryStructure.root.getChild('js').newFile('inputController.js');
terminal.directoryStructure.root.getChild('js').newFile('inputHandler.js');
terminal.directoryStructure.root.getChild('js').newFile('main.js');
terminal.directoryStructure.root.getChild('js').newFile('terminal.js');
terminal.directoryStructure.root.getChild('css').newFile('main.css');
terminal.directoryStructure.root.getChild('recursive').newFolder('recursive');

terminal.directoryStructure.root.getChild('recursive').getChild('recursive').newFolder('recursive');

terminal.directoryStructure.root.getChild('recursive').getChild('recursive').getChild('recursive').newFile('i lied');