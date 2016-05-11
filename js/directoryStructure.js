'use strict';

terminal.directoryStructure = terminal.directoryStructure || {};

terminal.directoryStructure.root = new terminal.directoryStructure.Folder('~');

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
