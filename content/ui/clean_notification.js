/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanNotification = app.ui.CleanNotification = function( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	var xpos = 472/2;
	var ypos = 5;

	this.x = this.to_x_ratio( xpos );
	this.y = this.to_y_ratio( ypos );
	this.w = this.to_x_ratio( 300 ); //a default value
	this.h = this.to_y_ratio( 18 );
	this.color = this.SELECTEDCOLOR;

	this.textx = this.to_x_ratio( xpos );
	this.texty = this.to_y_ratio( ypos );

	this.textcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 14;
}
CleanNotification.prototype = extend(CleanUIElem);

CleanNotification.prototype.draw = function(){
	if( this.state.uistore.notification.frames <= 0 ){
		return;
	}

	var tparams = {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "left"
	};

	this.state.uistore.notification.frames--;
	var text = this.state.uistore.notification.message;
	this.display.set_context_params( this.display.context, tparams );
	var meas = this.display.context.measureText( text ).width;
	this.w = meas + 6;

	var x = this.x - this.w/2;

	this.display.draw_rect_sprite( x, this.y, this.w, this.h, this.color );
	this.display.draw_text_params( text, x + 3, this.texty, tparams);
};

})();