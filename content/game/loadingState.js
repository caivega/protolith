/* jshint browser: true */
/* global app */

(function(){
"use strict";

var LoadingState = app.game.LoadingState = function( game, next_state ){
	app.game.AbstractState.call(this, game);
    this.next_state = next_state;
    this.init();
};

LoadingState.prototype = app.extend(app.game.AbstractState); 

LoadingState.prototype.init = function(){
    this.begin();
};

})();