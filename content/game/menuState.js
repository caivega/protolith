/* jshint browser: true */
/* global app */

(function(){
"use strict";

var MenuState = function( game ){
	app.game.AbstractState.call(this, game);

    this.uiElements = [];
    this.parts = [];

    this.running = false;
};

MenuState.prototype = app.extend(app.game.AbstractState); 

MenuState.prototype.init = function(){

    this.uiElements.push( 
        new app.ui.MenuOverlay(
            0, 0, "MenuPane", "MenuPane", this.game.display, this.game
        )
    ); 

    this.game.display.canvas.style.position = "absolute";
    this.game.display.canvas.style.top = "0px";
    this.game.display.canvas.style.left = "0px";

    this.game.soundCache.stop_all();
    this.game.soundCache.loop_sound("protoliththeme");

    this.begin();
};

MenuState.prototype.begin = function(){
	this.running = true;
    this.resume();
};

MenuState.prototype.resume = function(){
	//this.update(false);
    var captain = this;

    (function step(){
    	if( captain.running === true ){
	    	window.requestAnimationFrame(step); 
	    	captain.update(false); 
	    }
    })();
};

MenuState.prototype.update = function(){
    this.game.display.clear_area(0, 0, 472, 288);    

    for( var i in this.uiElements ){
        this.uiElements[i].draw();
    }      
};

MenuState.prototype.destroy = function(){
	this.running = false;
};

MenuState.prototype.handleMouseClick = function(ev){
    var mouseX = ev.clientX;
    var mouseY = ev.clientY;

    for( var i in this.uiElements ){
    	var elem = this.uiElements[i];
    	if( elem.contains( mouseX, mouseY) ){

    	}
    }
};

})();