/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanMovementOverlay = app.ui.overlays.CleanMovementOverlay = 
	function(game, state, display){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 0 );
	this.y = this.to_y_ratio( 186  );
	this.w = this.to_x_ratio( 110 );
	this.h = this.to_y_ratio( 102 );
	this.color = this.NEUTRALCOLOR;

	this.subelems = [
		new CleanCircleMoveButton( this.game, this.state, this.display, "ne" ),
		new CleanCircleMoveButton( this.game, this.state, this.display, "se" ),
		new CleanCircleMoveButton( this.game, this.state, this.display, "sw" ),
		new CleanCircleMoveButton( this.game, this.state, this.display, "nw" ),
		new CleanCircleMoveButton( this.game, this.state, this.display, "wait" ),
		new CleanSquareMoveButton( this.game, this.state, this.display, "n" ),
		new CleanSquareMoveButton( this.game, this.state, this.display, "e" ),
		new CleanSquareMoveButton( this.game, this.state, this.display, "s" ),
		new CleanSquareMoveButton( this.game, this.state, this.display, "w" ),
	];

	this.store = this.state.uistore;
};
CleanMovementOverlay.prototype = extend(CleanUIElem);

CleanMovementOverlay.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	for( var i in this.subelems ){
		this.subelems[i].draw();
	}

	this.animate_post( this.store );
};

CleanMovementOverlay.prototype.propogate_click = function(x,y){
	if( this.state.uistore.menustate !== "none" ){
		return;
	}
	
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		if( this.contains( elem.x - elem.w/2, elem.y - elem.h/2, elem.w, elem.h, x, y ) ){
			elem.onclick();
		}
	}
};

CleanMovementOverlay.prototype.propogate_unclick = function(){
	if( this.state.uistore.menustate !== "none" ){
		return;
	}
	this.state.uistore.control = false;
};

function CleanCircleMoveButton(game, state, display, dir){
	CleanUIElem.call( this, game, state, display );
	this.dir = dir;

	if( dir === "ne" ){
		this.x = this.to_x_ratio( 87 );
		this.y = this.to_y_ratio( 202 );
	} else if( dir === "se" ){
		this.x = this.to_x_ratio( 87 );
		this.y = this.to_y_ratio( 269 );
	} else if( dir === "sw" ){
		this.x = this.to_x_ratio( 21 );
		this.y = this.to_y_ratio( 269 );
	} else if( dir === "nw" ){
		this.x = this.to_x_ratio( 21 );
		this.y = this.to_y_ratio( 202 );
	} else if (dir === "wait") {
        this.x = this.to_x_ratio( 54 );
        this.y = this.to_y_ratio( 237 );
    }

	this.w = this.to_x_ratio( 26 );
	this.h = this.to_y_ratio( 26 );
	this.sprite = "cleancirclecontrol";

}

CleanCircleMoveButton.prototype = extend(CleanUIElem);

CleanCircleMoveButton.prototype.draw = function(){
	this.display.draw_sprite_scaled_centered(this.sprite, this.x, this.y, this.w, this.h);
};

CleanCircleMoveButton.prototype.onclick = function() {
	this.state.uistore.control = this.dir;
};

function CleanSquareMoveButton(game, state, display, dir) {
    CleanUIElem.call(this, game, state, display);
    this.dir = dir;

    if (dir === "n") {
        this.x = this.to_x_ratio( 54 );
        this.y = this.to_y_ratio( 202 );
    } else if (dir === "e") {
        this.x = this.to_x_ratio( 87 );
        this.y = this.to_y_ratio( 237 );
    } else if (dir === "s") {
        this.x = this.to_x_ratio( 54 );
        this.y = this.to_y_ratio( 269 );
    } else if (dir === "w") {
        this.x = this.to_x_ratio( 21 );
        this.y = this.to_y_ratio( 237 );
    }

    this.w = this.to_x_ratio( 26 );
    this.h = this.to_y_ratio( 26 );
    this.sprite = "cleansquarecontrol";

}

CleanSquareMoveButton.prototype = extend(CleanUIElem);

CleanSquareMoveButton.prototype.draw = function() {
    this.display.draw_sprite_scaled_centered(this.sprite, this.x, this.y, this.w, this.h);
};

CleanSquareMoveButton.prototype.onclick = function() {
	this.state.uistore.control = this.dir;
};

})();