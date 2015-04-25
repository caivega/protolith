/* jshint browser: true */
/* global app  */

(function(){
"use strict";

var Timer = app.game.Timer = function(){
	this.timers = {};
};

Timer.prototype.time = function(id){
	this.timers[ id ] = +(new Date() );
};

Timer.prototype.timeEnd = function(id){
	var ret = this.timers[ id ] ? (+(new Date())) -  this.timers[ id ] : 0;
	delete this.timers[ id ];
	return ret;
};

})();