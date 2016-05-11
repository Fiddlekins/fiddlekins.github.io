'use strict';

(function(){

	terminal.directoryStructure = terminal.directoryStructure || {};

	var Folder = function(name, parent){
		this._name = name;
		this._parent = parent;
		this._children = {};
		this.isFolder = true;
	};

	Folder.prototype.changeDirectory = function(targetDirectoryArray){
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

	Folder.prototype.getPath = function(){
		if (this._parent === undefined) {
			return ['~'];
		}
		var path = this._parent.getPath();
		path.push(this._name);
		return path;
	};

	Folder.prototype.getChildrenNames = function(){
		return Object.keys(this._children);
	};

	Folder.prototype.listChildren = function(){
		var children = Object.keys(this._children);
		children.push('.');
		children.push('..');
		children.sort();
		for (var childIndex = 0; childIndex < children.length; childIndex++) {
			var childName = children[childIndex];
			if (childName === '.') {
				children[childIndex] = '<DIR>   ' + childName;
			} else if (childName === '..') {
				children[childIndex] = '<DIR>   ' + childName;
			} else if (this._children[childName].isFolder) {
				children[childIndex] = '<DIR>   ' + childName;
			} else {
				children[childIndex] = '        ' + childName;
			}
		}
		return children;
	};

	Folder.prototype.execute = function(targetName, args){
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

	Folder.prototype.newFolder = function(name){
		if (this._children[name]) {
			return 'Error: A folder with that name already exists.'
		} else {
			this._children[name] = new Folder(name, this);
		}
	};

	Folder.prototype.newFile = function(name){
		if (this._children[name]) {
			return 'Error: A file with that name already exists.'
		} else {
			this._children[name] = new terminal.directoryStructure.File(name, this);
		}
	};

	Folder.prototype.getChild = function(name){
		if (this._children[name] === undefined) {
			return 'Error: The specified file or folder does not exist.'
		} else {
			return this._children[name];
		}
	};


	terminal.directoryStructure.Folder = Folder;

})();
