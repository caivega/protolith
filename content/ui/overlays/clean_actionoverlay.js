/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanActionOverlay = app.ui.overlays.CleanActionOverlay = 
	function(game, state, display){
	app.ui.CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 362 );
	this.y = this.to_y_ratio( 186  );
	this.w = this.to_x_ratio( 110 );
	this.h = this.to_y_ratio( 102 );
	this.color = this.NEUTRALCOLOR;

	this.subelems = [
		new CleanActionButton( this.game, this.state, this.display, "a" ),
		new CleanActionButton( this.game, this.state, this.display, "b" ),
	];

	this.store = this.state.uistore;
};
CleanActionOverlay.prototype = app.extend(app.ui.CleanUIElem);

CleanActionOverlay.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	for( var i in this.subelems ){
		this.subelems[i].draw();
	}

	this.animate_post( this.store );
};

CleanActionOverlay.prototype.propogate_click = function(x,y){
	if( this.state.uistore.menustate !== "none" ){
		return;
	}
	
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		if( this.contains( elem.x, elem.y, elem.w, elem.h, x, y ) ){
			elem.onclick();
		}
	}
};

CleanActionOverlay.prototype.propogate_unclick = function(){
	if( this.state.uistore.menustate !== "none" ){
		return;
	}

	this.state.uistore.actionbuttons.a.pressed = false;
	this.state.uistore.actionbuttons.b.pressed = false;
};

function CleanActionButton(game, state, display, button){
	app.ui.CleanUIElem.call( this, game, state, display );
	this.button = button;

	if( button === "a" ){
		this.x = this.to_x_ratio( 420 );
		this.y = this.to_y_ratio( 185 );
		this.textx = this.to_x_ratio( 445 );
		this.texty = this.to_y_ratio( 205 );
	} else if( button === "b") {
        this.x = this.to_x_ratio( 375 );
        this.y = this.to_y_ratio( 235 );
		this.textx = this.to_x_ratio( 400 );
		this.texty = this.to_y_ratio( 255 );
    }
	this.w = this.to_x_ratio( 40 );
	this.h = this.to_y_ratio( 40 );
	this.color = this.DARKCOLOR;
	this.scolor = this.VERYDARKCOLOR;

	this.textcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 10;

	this.store = this.state.uistore.actionbuttons[ this.button ];
}

CleanActionButton.prototype = app.extend(app.ui.CleanUIElem);

CleanActionButton.prototype.draw = function(){

	var color = this.store.pressed ? this.scolor : this.color;

	this.display.draw_rect( this.x, this.y, this.w, this.h, color );

	if( this.store.disabled ){
		return;
	}

	var action = this.store.action;
	action = action[0].toUpperCase() + action.slice(1);

	this.display.draw_text_params( action, this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanActionButton.prototype.onclick = function() {
	this.store.pressed = true;
};

})();