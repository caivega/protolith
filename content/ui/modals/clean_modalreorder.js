/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanModalReorder = app.ui.modals.CleanModalReorder = 
	function( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 472/2 - 240/2 );
	this.y = this.to_y_ratio( 288/2 - 106/2 );
	this.w = this.to_x_ratio( 240 );
	this.h = this.to_y_ratio( 106 );

	this.color = this.NEUTRALCOLOR;
	this.bcolor = this.VERYDARKCOLOR;

	this.modaltext = new CleanModalReorderText( game, state, display );
	this.buttonlist = new CleanModalReorderButtonList( game, state, display );
};
CleanModalReorder.prototype = extend(CleanUIElem);

CleanModalReorder.prototype.draw = function(){
	if( this.state.uistore.modals.reorder.visible === false ){
		return;
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

	this.modaltext.draw();
	this.buttonlist.draw();
};

CleanModalReorder.prototype.propogate_click = function( x, y ){
	if( this.state.uistore.modals.reorder.visible === false ){
		return;
	}
	this.buttonlist.propogate_click( x, y );
};

function CleanModalReorderText( game, state, display ){
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

	this.text1 = "At which position in your party do";
	this.text2 =  "you want this character?";
}
CleanModalReorderText.prototype = extend(CleanUIElem);

CleanModalReorderText.prototype.draw = function(){
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

function CleanModalReorderButtonList( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.subelems = [];
	for( var i = 0; i < 6; i++ ){
		this.subelems.push( new CleanModalReorderButton( game, state, display, i ) );
	}
}
CleanModalReorderButtonList.prototype = extend(CleanUIElem);

CleanModalReorderButtonList.prototype.draw = function(){
	for( var i in this.subelems ){
		this.subelems[i].draw();
	}
};

CleanModalReorderButtonList.prototype.propogate_click = function(x,y){
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		if( this.contains( elem.x, elem.y, elem.w, elem.h, x, y ) ){
			elem.onclick();
		}
	}	
};

function CleanModalReorderButton( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var xoffset = 130;

	var xpos = xoffset + 36 * index;
	var ypos = 153;

	this.x = this.to_x_ratio( xpos );
	this.y = this.to_y_ratio( ypos );
	this.w = this.to_x_ratio( 30 );
	this.h = this.to_y_ratio( 20 );
	this.color = this.LIGHTCOLOR;

	this.textx = this.to_x_ratio( xpos + 19 );
	this.texty = this.to_y_ratio( ypos + 10 );
	this.textcolor = this.VERYDARKCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanModalReorderButton.prototype = extend(CleanUIElem);

CleanModalReorderButton.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.index ];
	if( ch === undefined ){
		return;
	}

	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.display.draw_text_params( this.index + 1, this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanModalReorderButton.prototype.onclick = function(){
	var ch = this.state.player.get_pcs()[ this.index ];
	if( ch === undefined ){
		return;
	}

	this.state.player.reorder_pc( this.state.uistore.pcselected, this.index );
};

})();