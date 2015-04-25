/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanSelector = app.ui.CleanSelector = function(game, state, display){
	CleanUIElem.call( this, game, state, display );

	this.spr = "box";
	this.w = this.to_x_ratio( 28 );
	this.h = this.to_y_ratio( 32 );

	this.minw = this.to_x_ratio( 110 );
	this.maxw = this.to_x_ratio( 350 );

	this.store = this.state.uistore.select;
	this.world = this.state.world;
};

CleanSelector.prototype = extend(CleanUIElem);

CleanSelector.prototype.draw = function(){
	if( this.store.visible && this.state.uistore.menustate === "none" ){

		var x = this.world.grid_to_pixw( 
			this.world.pix_to_gridw( this.state.uistore.mouse.x ) 
		);
		var y = this.world.grid_to_pixh( 
			this.world.pix_to_gridh( this.state.uistore.mouse.y ) 
		);

		if( x < this.minw || x > this.maxw ){
			return;
		}

		this.display.draw_sprite_scaled(this.spr, x, y, this.w, this.h );
	}
};

CleanSelector.prototype.propogate_click = function(){
	if( !this.store.visible ){
		return;
	}

	this.onclick();
};

CleanSelector.prototype.onclick = function(){
	var x = this.world.pix_to_gridw( this.state.uistore.mouse.x );
	var y = this.world.pix_to_gridh( this.state.uistore.mouse.y );
	var xpix = this.world.grid_to_pixw( x );

	if( xpix < this.minw || xpix > this.maxw ){
		this.store.visible = false;		
	} else {
		this.store.onselect(x, y);
		this.store.visible = false;
	}
};

})();