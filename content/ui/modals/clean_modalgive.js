/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanModalGive = app.ui.modals.CleanModalGive = function( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 472/2 - 240/2 );
	this.y = this.to_y_ratio( 288/2 - 106/2 );
	this.w = this.to_x_ratio( 240 );
	this.h = this.to_y_ratio( 106 );

	this.color = this.NEUTRALCOLOR;
	this.bcolor = this.VERYDARKCOLOR;

	this.modaltext = new CleanModalGiveText( game, state, display );
	this.buttonlist = new CleanModalGiveButtonList( game, state, display );
};
CleanModalGive.prototype = extend(CleanUIElem);

CleanModalGive.prototype.draw = function(){
	if( this.state.uistore.modals.give.visible === false ){
		return;
	}

	this.display.draw_rect_params({
		x:this.x, 
		y:this.y, 
		width:this.w, 
		height:this.h, 
		color:this.color,
		bordercolor: this.bcolor,
		borderwidth: 1
	});

	this.modaltext.draw();
	this.buttonlist.draw();
};

CleanModalGive.prototype.propogate_click = function( x, y ){
	if( this.state.uistore.modals.give.visible === false ){
		return;
	}
	return this.buttonlist.propogate_click( x, y );
};

function CleanModalGiveText( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 118 );
	this.y = this.to_y_ratio( 93 );
	this.w = this.to_x_ratio( 236 );
	this.h = this.to_y_ratio( 35 );
	this.color = this.LIGHTCOLOR;

	this.textx = this.to_x_ratio( 124 );
	this.text1y = this.to_y_ratio( 95 );
	this.text2y = this.to_y_ratio( 110 );
	this.textcolor = this.VERYDARKCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;

	this.text1 = "To which person do you want this";
	this.text2 =  "item given?";
}
CleanModalGiveText.prototype = extend(CleanUIElem);

CleanModalGiveText.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	this.display.draw_text_params( this.text1, this.textx, this.text1y, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "left"
	});
	this.display.draw_text_params( this.text2, this.textx, this.text2y, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "left"
	});
};

function CleanModalGiveButtonList( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.subelems = [];
	for( var i = 0; i < 6; i++ ){
		this.subelems.push( new CleanModalGiveButton( game, state, display, i ) );
	}
}
CleanModalGiveButtonList.prototype = extend(CleanUIElem);

CleanModalGiveButtonList.prototype.draw = function(){
	for( var i in this.subelems ){
		this.subelems[i].draw();
	}
};

CleanModalGiveButtonList.prototype.propogate_click = function(x,y){
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		if( this.contains( elem.x, elem.y, elem.w, elem.h, x, y ) ){
			elem.onclick();
			return true;
		}
	}	
};

function CleanModalGiveButton( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var xpos = null;
	var ypos = null;
	if( index % 2 === 0 ){
		var xoffset = 120;
		xpos = xoffset + 39 * index;
		ypos = 140;
	} else {
		var xoffset = 81;
		xpos = xoffset + 39 * index;
		ypos = 170;
	}

	this.x = this.to_x_ratio( xpos );
	this.y = this.to_y_ratio( ypos );
	this.w = this.to_x_ratio( 75 );
	this.h = this.to_y_ratio( 20 );
	this.color = this.LIGHTCOLOR;

	this.textx = this.to_x_ratio( xpos + 40 );
	this.texty = this.to_y_ratio( ypos + 10 );

	this.textcolor = this.VERYDARKCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 10;
}
CleanModalGiveButton.prototype = extend(CleanUIElem);

CleanModalGiveButton.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.index ];
	if( ch === undefined ){
		return;
	}

	var text = ch.name;
	if( text.length > 13 ){
		this.defaulttextsize = 8;
	}

	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.display.draw_text_params( text, this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanModalGiveButton.prototype.onclick = function(){
	var ch = this.state.player.get_pcs()[ this.index ];
	if( ch === undefined ){
		return;
	}

	var itemname = this.state.uistore.currentitemname;
	var mych = this.state.player.get_pcs()[ this.state.uistore.pcselected ];

	if( mych === ch ){
		this.state.inter.hide_modal( this.state.uistore.modals.give );
		return;
	}

	this.state.player.transfer_item( mych, ch, itemname );
};

})();