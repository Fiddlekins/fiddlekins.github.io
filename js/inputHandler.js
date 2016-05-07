'use strict';

terminal.inputHandler = {};

terminal.inputHandler.process = function(string){
	terminal.content.pushLine(string);
};