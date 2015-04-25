/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CreatePartyState = app.game.CreatePartyState = function( game, new_world_params ){
	app.game.AbstractState.call(this, game);

    this.new_world_params = new_world_params;
    this.uiElements = [];
    this.isOn = "pizza";
};

CreatePartyState.prototype = app.extend(app.game.AbstractState); 

CreatePartyState.prototype.init = function(){

    this.uiElements.push( 
        new app.ui.CreateOverlay(
            0, 0, "CreatePartyPane", "CreatePartyPane",
            this.game.display, this.game
        )
    ); 


    this.begin();
};

CreatePartyState.prototype.begin = function(){
    this.isOn = "pizza";
    this.resume();
};

CreatePartyState.prototype.pause = function(){

};

CreatePartyState.prototype.resume = function(){
	this.update(true);
};

CreatePartyState.prototype.update = function(force){
    if( force ){
        this.draw();
        if( this.isOn === "pizza"){
            setTimeout(function(){
                this.update(true);
            }.bind(this), 25);
        }
    }
};

CreatePartyState.prototype.draw = function(){
    for( var i in this.uiElements ){
        this.uiElements[i].draw();
    } 

    if( app.game.Game.prototype.keyboard !== null ){
    	app.game.Game.prototype.keyboard.draw();
    }     
};

CreatePartyState.prototype.handleKeyPress = function(ev){
    if( app.game.Game.prototype.keyboard !== null ){
    	app.game.Game.prototype.keyboard.keydown(ev);
    }
};

CreatePartyState.prototype.handleKeyUp = function(ev){
    if( app.game.Game.prototype.keyboard !== null ){
    	app.game.Game.prototype.keyboard.keyup(ev);
    }
};

CreatePartyState.prototype.handleMouseClick = function(ev){
    var mouseX = ev.clientX;// - off.x - 17;
    var mouseY = ev.clientY;// - off.y - 19;    

    if( app.game.Game.prototype.keyboard !== null ){
    	app.game.Game.prototype.keyboard.contains(mouseX, mouseY);
    	return;
    }

    for( var i in this.uiElements ){
    	var elem = this.uiElements[i];
    	if( elem.contains( mouseX, mouseY) ){
    	}
    }
};

})();