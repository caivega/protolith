/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanMenuHeader = app.ui.CleanMenuHeader = function( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 110 );
	this.y = this.to_y_ratio( 0 );
	this.w = this.to_x_ratio( 362 );
	this.h = this.to_y_ratio( 18 );

	this.color1 = this.VERYDARKCOLOR;
	this.color2 = this.NEUTRALCOLOR;

	this.label = new CleanMenuHeaderLabel( game, state, display );
	this.close = new CleanMenuHeaderCloseButton( game, state, display );
};
CleanMenuHeader.prototype = extend(CleanUIElem);

CleanMenuHeader.prototype.draw = function(){
	this.display.draw_horiz_gradient(
		this.x, this.y, this.w, this.h, this.color1, this.color2
	);
	this.label.draw();
	this.close.draw();
};

CleanMenuHeader.prototype.propogate_click = function(x, y){
	var closeclicked = this.contains( 
		this.close.tlx, this.close.tly, this.close.w, this.close.h, x, y
	);
	if( closeclicked ){
		this.close.onclick( x, y );
	}
};

function CleanMenuHeaderLabel( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 147 );
	this.y = this.to_y_ratio( 9 );
	this.w = this.to_x_ratio( 127 );
	this.h = this.to_y_ratio( 18 );
	this.color = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanMenuHeaderLabel.prototype = extend(CleanUIElem);

CleanMenuHeaderLabel.prototype.draw = function(){
	var text = this.state.uistore.menustate;
	if( text === "none" ){
		text = this.state.uistore.prevstate;
	}
	text = text[0].toUpperCase() + text.slice(1);
	this.display.draw_text_params( text, this.x, this.y, {
		color: this.color ,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

function CleanMenuHeaderCloseButton( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.sprite = "cleanclosebutton";
	this.x = this.to_x_ratio( 446 );
	this.y = this.to_y_ratio( 8 );
	this.w = this.to_x_ratio( 48 );
	this.h = this.to_y_ratio( 18 );
	this.tlx = this.x - this.w/2;
	this.tly = this.y - this.h/2;

	this.textx = this.to_x_ratio( 452 );
	this.texty = this.to_y_ratio( 8 );
	this.textcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;

	this.label = new app.ui.CleanClassInfoLabel( game, state, display );
}
CleanMenuHeaderCloseButton.prototype = extend(CleanUIElem);

CleanMenuHeaderCloseButton.prototype.draw = function(){
	this.display.draw_sprite_scaled_centered(this.sprite, this.x, this.y, this.w, this.h);

	this.display.draw_text_params( "X", this.textx, this.texty, {
		color: this.textcolor ,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanMenuHeaderCloseButton.prototype.onclick = function(){
	this.state.inter.hide_menu();
};

})();