/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanOptionsOverlay = 
app.ui.overlays.CleanOptionsOverlay = function(game, state, display){
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
		new CleanSpecifyResolutionContainer( this.game, this.state, this.display ),
		new CleanSpecifyFPSContainer( this.game, this.state, this.display )
	);

	this.store = this.state.uistore;
};
CleanOptionsOverlay.prototype = extend(CleanUIElem);

CleanOptionsOverlay.prototype.draw = function(){
	if( this.store.menustate !== "save" && 
		this.store.menus.animating && 
		this.store.prevstate === "save" ){

		this.animate_out_pre( this.store.menus );
	} else if( this.store.menustate !== "save" ){
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

CleanOptionsOverlay.prototype.propogate_click = function(x,y){
	if( this.state.uistore.menustate !== "save" ){
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

function CleanSpecifyResolutionContainer( game, state, display ){
	app.ui.CleanUIElem.call( this, game, state, display );

	this.padding = 5;
	this.w = this.to_x_ratio( 152 ) + 4*this.padding + 10;
	this.h = this.to_x_ratio( 42 );
	this.x = this.to_x_ratio( 215 );
	this.y = this.to_y_ratio( 40 );
	this.color = this.LIGHTCOLOR;

	this.textx = this.x + this.w / 2;
	this.texty = this.y - this.h / 3;
	this.defaulttextsize = 12;
	this.font = this.FONT;
	this.textcolor = this.VERYDARKCOLOR;

	this.subelems = [
		new CleanSpecifyResolutionButton( game, state, display, this, 0 ),
		new CleanSpecifyResolutionButton( game, state, display, this, 1 ),
		new CleanSpecifyResolutionButton( game, state, display, this, 2 ),
		new CleanSpecifyResolutionButton( game, state, display, this, 3 )
	];
}
CleanSpecifyResolutionContainer.prototype = app.extend(app.ui.CleanUIElem);

CleanSpecifyResolutionContainer.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.display.draw_text_params( "Render Quality", this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});

	for( var i in this.subelems ){
		this.subelems[i].draw();
	}
};

CleanSpecifyResolutionContainer.prototype.propogate_click = function(x,y){
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		elem.propogate_click(x,y);
		if( elem.onclick &&
			this.contains( elem.x, elem.y, elem.w, elem.h, x, y ) ){

			elem.onclick();
		}
	}
};

function CleanSpecifyResolutionButton( game, state, display, parent, index ){
	app.ui.CleanUIElem.call( this, game, state, display );
	this.index = index;

	this.x = parent.x;
	this.y = parent.y;

	this.w = this.to_x_ratio( 38 );
	this.h = this.to_x_ratio( 38 );
	this.x = 5 + this.x + index * (this.w + parent.padding);
	this.y = this.y + this.to_y_ratio( 2 );
	this.color = this.VERYDARKCOLOR;

	this.textx = this.x + this.w / 2;
	this.texty = this.y + this.h / 2;
	this.defaulttextsize = 10;
	this.font = this.FONT;
	this.textcolor = this.LIGHTTEXTCOLOR;

	this.restable = [
		"Max",
		"High",
		"Med",
		"Low"
	];
}
CleanSpecifyResolutionButton.prototype = app.extend(app.ui.CleanUIElem);

CleanSpecifyResolutionButton.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	if( this.display.currentresolution === this.restable[ this.index ].toLowerCase() ){
		this.color = this.SELECTEDCOLOR;
	} else {
		this.color = this.VERYDARKCOLOR;
	}

	this.display.draw_text_params( this.restable[ this.index ], this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanSpecifyResolutionButton.prototype.onclick = function(){
	this.display.set_resolution( this.restable[ this.index ].toLowerCase() );
};

function CleanSpecifyFPSContainer( game, state, display ){
	app.ui.CleanUIElem.call( this, game, state, display );

	this.padding = 5;
	this.w = this.to_x_ratio( 76 ) + 2*this.padding + 10;
	this.h = this.to_x_ratio( 42 );
	this.x = this.to_x_ratio( 215 );
	this.y = this.to_y_ratio( 110 );
	this.color = this.LIGHTCOLOR;

	this.textx = this.x + this.w / 2;
	this.texty = this.y - this.h / 3;
	this.defaulttextsize = 12;
	this.font = this.FONT;
	this.textcolor = this.VERYDARKCOLOR;

	this.subelems = [
		new CleanSpecifyFPSButton( game, state, display, this, 0 ),
		new CleanSpecifyFPSButton( game, state, display, this, 1 )
	];
}
CleanSpecifyFPSContainer.prototype = app.extend(app.ui.CleanUIElem);

CleanSpecifyFPSContainer.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.display.draw_text_params( "Render FPS", this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});

	for( var i in this.subelems ){
		this.subelems[i].draw();
	}
};

CleanSpecifyFPSContainer.prototype.propogate_click = function(x,y){
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		elem.propogate_click(x,y);
		if( elem.onclick &&
			this.contains( elem.x, elem.y, elem.w, elem.h, x, y ) ){

			elem.onclick();
		}
	}
};

function CleanSpecifyFPSButton( game, state, display, parent, index ){
	app.ui.CleanUIElem.call( this, game, state, display );
	this.index = index;

	this.x = parent.x;
	this.y = parent.y;

	this.w = this.to_x_ratio( 38 );
	this.h = this.to_x_ratio( 38 );
	this.x = 5 + this.x + index * (this.w + parent.padding);
	this.y = this.y + this.to_y_ratio( 2 );
	this.color = this.VERYDARKCOLOR;

	this.textx = this.x + this.w / 2;
	this.texty = this.y + this.h / 2;
	this.defaulttextsize = 10;
	this.font = this.FONT;
	this.textcolor = this.LIGHTTEXTCOLOR;

	this.restable = [
		60,
		30
	];
}
CleanSpecifyFPSButton.prototype = app.extend(app.ui.CleanUIElem);

CleanSpecifyFPSButton.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	if( this.display.fps === this.restable[ this.index ] ){
		this.color = this.SELECTEDCOLOR;
	} else {
		this.color = this.VERYDARKCOLOR;
	}

	this.display.draw_text_params( this.restable[ this.index ], this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanSpecifyFPSButton.prototype.onclick = function(){
	this.display.set_framespeed( this.restable[ this.index ] );
};

})();