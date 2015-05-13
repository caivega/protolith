/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanMapOverlay = 
app.ui.overlays.CleanMapOverlay = function(game, state, display){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 110 );
	this.y = this.to_y_ratio( 18  );
	this.w = this.to_x_ratio( 362 );
	this.h = this.to_y_ratio( 270 );
	this.color = this.NEUTRALCOLOR;
	this.transition = "menuslide";

	this.subelems = [];

	this.subelems.push(
		new app.ui.CleanMenuHeader( this.game, this.state, this.display ),
		new CleanMinimap( this.game, this.state, this.display )
	);

	this.store = this.state.uistore;
};
CleanMapOverlay.prototype = extend(CleanUIElem);

CleanMapOverlay.prototype.draw = function(){
	if( this.store.menustate !== "map" && 
		this.store.menus.animating && 
		this.store.prevstate === "map" ){

		this.animate_out_pre( this.store.menus );
	} else if( this.store.menustate !== "map" ){
		return;
	} else {
		this.animate_in_pre( this.store.menus );
	}

	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	for( var i in this.subelems ){
		this.subelems[i].draw();
	}

	this.animate_post( this.store.menus );
};

CleanMapOverlay.prototype.propogate_click = function(x,y){
	if( this.state.uistore.menustate !== "map" ){
		return;
	}
	
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		elem.propogate_click(x,y);
		if( elem.onclick &&
			this.contains( elem.x, elem.y, elem.w, elem.h, x, y ) ){

			elem.onclick();
		}
	}
};

function CleanMinimap(game, state, display){
	CleanUIElem.call( this, game, state, display );

	this.world = this.state.world;
	this.w = this.to_x_ratio( 200 );
	this.h = this.to_y_ratio( 200 );
	this.width = 100;
	this.height = 100;
	this.canvas = document.createElement("canvas");
	this.context = this.canvas.getContext("2d");
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.x = this.to_x_ratio( 200 );
	this.y = this.to_y_ratio( 40 );
	this.imagedata = this.context.getImageData(0, 0, this.width, this.height);
}
CleanMinimap.prototype = extend(CleanUIElem);

CleanMinimap.prototype.draw = function(){
	for( var i = 0; i < this.width; i++ ){
		for( var j = 0; j < this.height; j++ ){
			var sq = this.world.get_tile( 
				Math.floor(app.normalize(i, 0, this.width, 0, this.world.mapw) ),
				Math.floor(app.normalize(j, 0, this.height, 0, this.world.maph) ) 
			);

			if( !sq.isExplored ){
				this.set_pixel(this.imagedata, i, j, 30, 40, 30, 255);
			} else {
				var spr = this.display.sprites[sq.sprite];
				this.set_pixel(this.imagedata,i,j,spr.avg.r,spr.avg.g,spr.avg.b,255);
			}
		}
	}

	this.draw_characters();

	this.context.putImageData( this.imagedata, 0, 0 );
	this.display.context.drawImage(
		this.canvas,0,0,this.width,this.height,this.x,this.y,this.w,this.h
	); 
};

CleanMinimap.prototype.draw_characters = function(){
	var r = 0, g = 0, b = 0;
	var me = this.world.get_character( this.world.active_char );
	var xme = me.x;
	var yme = me.y;
	for( var i in this.world.characters ){
		var act = this.world.characters[i];
		if( act.isDead ){
			continue;
		}

		var sq = this.world.get_tile(act.x, act.y);
		if( !sq.isInSight){
			continue;
		}

		var dx = act.x - xme;
		var dy = act.y - yme;
		if( dx*dx + dy*dy > 80 ){
			continue;
		}

		if( act.allegiance == "enemy" ){
			r = 255; g = 0; b = 0;  
		} else {
			r = 255; g =255; b = 0;
		}

		var x = Math.floor(app.normalize(act.x, 0, this.world.mapw, 0, this.width));
		var y = Math.floor(app.normalize(act.y, 0, this.world.maph, 0, this.height));

		this.place_indicator(x, y, r, g, b);
	}
	var act = me;
	var x = Math.floor(app.normalize(act.x, 0, this.world.mapw, 0, this.width));
	var y = Math.floor(app.normalize(act.y, 0, this.world.maph, 0, this.height));
	this.place_indicator( x, y, 0, 255, 0 );
};

CleanMinimap.prototype.place_indicator = function( x, y, r, g, b ){
	this.set_pixel(this.imagedata, x+0, y+0, r, g, b, 255);
	this.set_pixel(this.imagedata, x+1, y+0, r, g, b, 255);
	this.set_pixel(this.imagedata, x-1, y+0, r, g, b, 255);
	this.set_pixel(this.imagedata, x+0, y+1, r, g, b, 255);
	this.set_pixel(this.imagedata, x+0, y-1, r, g, b, 255);
};

CleanMinimap.prototype.set_pixel = function(imageData, x, y, r, g, b, a){
    var index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
};

})();