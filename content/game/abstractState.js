/* jshint browser: true */
/* global app */

(function(){
"use strict";
var AbstractState = app.game.AbstractState = function(game){
	this.game = game;
	this.INTERVAL_ID = 0;
	this.FLAG_stateFinished = false;

	this.isRunning = false;
};
AbstractState.prototype.change_state = function( game, state ){
	game.state = state;
};
AbstractState.prototype.init = function(){};
AbstractState.prototype.begin = function(){};
AbstractState.prototype.pause = function(){};
AbstractState.prototype.resume = function(){};
AbstractState.prototype.destroy = function(){};
AbstractState.prototype.handleKeyPress = function(){};
AbstractState.prototype.handleMouseClick = function(){};
AbstractState.prototype.handleMouseUnclick = function(){};
AbstractState.prototype.handleMouseMove = function(){};
})();
