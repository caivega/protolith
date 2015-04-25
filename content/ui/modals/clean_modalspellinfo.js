/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanModalSpellInfo = app.ui.modals.CleanModalSpellInfo = 
	function( game, state, display ){

	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 472/2 - 380/2 );
	this.y = this.to_y_ratio( 288/2 - 130/2 );
	this.w = this.to_x_ratio( 380 );
	this.h = this.to_y_ratio( 130 );

	this.color = this.NEUTRALCOLOR;
	this.bcolor = this.VERYDARKCOLOR;

	this.subelems = [
		new CleanModalSpellInfoHead( game, state, display ),
		new CleanModalSpellInfoDescription( game, state, display ),
	];

	this.store = this.state.uistore.modals.spellinfo;
};
CleanModalSpellInfo.prototype = extend(CleanUIElem);

CleanModalSpellInfo.prototype.draw = function(){
	if( this.store.visible === false && this.store.animating === false ){
		return;
	} else if( this.store.visible === false && this.store.animating ){
		this.animate_out_pre( this.state.uistore.modals.spellinfo );
	} else {
		this.animate_in_pre( this.state.uistore.modals.spellinfo );
	}

	this.display.draw_rect_params( {
		x:this.x, 
		y:this.y, 
		width:this.w, 
		height:this.h, 
		color:this.color,
		bordercolor: this.bcolor,
		borderwidth: 1
	} );

	for( var i in this.subelems ){
		this.subelems[i].draw();
	}

	this.animate_post( this.state.uistore.modals.spellinfo );
};

CleanModalSpellInfo.prototype.propogate_click = function(x, y){
	var val = false;
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		val = val || elem.propogate_click( x, y );
	}
	return val;	
};

function CleanModalSpellInfoHead( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 48 );
	this.y = this.to_y_ratio( 81 );
	this.w = this.to_x_ratio( 375 );
	this.h = this.to_y_ratio( 20 );
	this.color = this.VERYDARKCOLOR;

	this.label = new CleanModalSpellInfoHeadLabel( game, state, display );
	this.close = new CleanModalSpellInfoHeadCloseButton( game, state, display );
}
CleanModalSpellInfoHead.prototype = extend(CleanUIElem);

CleanModalSpellInfoHead.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	this.label.draw();
	this.close.draw();
};

CleanModalSpellInfoHead.prototype.propogate_click = function(x, y){
	if( this.contains( 
		this.close.x, this.close.y, this.close.w, this.close.h, x, y
		) ){

		this.close.onclick();
		return true;
	}
};

function CleanModalSpellInfoHeadLabel( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.textx = this.to_x_ratio( 58 );
	this.texty = this.to_y_ratio( 83 );
	this.textcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanModalSpellInfoHeadLabel.prototype = extend(CleanUIElem);

CleanModalSpellInfoHeadLabel.prototype.draw = function(){
	var spellname = this.state.uistore.currentspell;

	this.display.draw_text_params( spellname, this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "left"
	});
};

function CleanModalSpellInfoHeadCloseButton( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 403 );
	this.y = this.to_y_ratio( 81 );
	this.w = this.to_x_ratio( 20 );
	this.h = this.to_y_ratio( 20 );
	this.color = this.SELECTEDCOLOR;

	this.textx = this.to_x_ratio( 419 );
	this.texty = this.to_y_ratio( 91 );
	this.textcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanModalSpellInfoHeadCloseButton.prototype = extend(CleanUIElem);

CleanModalSpellInfoHeadCloseButton.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.display.draw_text_params( "X", this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanModalSpellInfoHeadCloseButton.prototype.onclick = function(){
	this.state.inter.hide_modal( this.state.uistore.modals.spellinfo );
	return true;
};

function CleanModalSpellInfoDescription( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 48 );
	this.y = this.to_y_ratio( 103 );
	this.w = this.to_x_ratio( 375 );
	this.h = this.to_y_ratio( 104 );
	this.color = this.LIGHTCOLOR;

	this.textx = this.to_x_ratio( 50 );
	this.texty = this.to_y_ratio( 115 );
	this.lineheight = this.to_y_ratio( 14 );
	this.maxwidth = this.to_x_ratio( 204 );
	this.textcolor = this.VERYDARKCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;

	this.store = this.state.uistore;
}
CleanModalSpellInfoDescription.prototype = extend(CleanUIElem);

CleanModalSpellInfoDescription.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	var menu = this.store.menustate;
	if( this.state.uistore.menus[ menu ] === undefined ){
		return;
	}
	var tab = this.store.menus[ menu ].tab;
	var spellname = this[ menu ][ tab ][ this.index ];
	var spell = this.state.world.sm.get_spell( spellname );

	this.display.wrap_text( spell.description, this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "left",
		lineheight: this.lineheight,
		maxwidth: this.maxwidth
	});
};

})();