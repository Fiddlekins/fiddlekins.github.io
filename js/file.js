'use strict';

(function(){

	terminal.directoryStructure = terminal.directoryStructure || {};

	var File = function(name, parent, settings){
		this._name = name;
		var extensionMatch = name.match(/(.*)\.(.+$)/);
		this._fileName = extensionMatch ? extensionMatch[1] : name;
		this._type = extensionMatch ? extensionMatch[2] : null;
		this._parent = parent;
		this._settings = settings;
	};

	File.prototype.execute = function(args){
		switch (this._type) {
			case 'exe':
				document.location.href = document.URL + (/\/$/.test(document.URL) ? '' : '/') + this._fileName;
				return ['Initialising ' + this._name];
			default:
				return ['Nothing happened...'];
		}
	};


	terminal.directoryStructure.File = File;

})();
