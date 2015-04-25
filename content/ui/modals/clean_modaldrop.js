/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanModalDrop = app.ui.modals.CleanModalDrop = function( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 472/2 - 240/2 );
	this.y = this.to_y_ratio( 288/2 - 106/2 );
	this.w = this.to_x_ratio( 240 );
	this.h = this.to_y_ratio( 106 );

	this.color = this.NEUTRALCOLOR;
	this.bcolor = this.VERYDARKCOLOR;

	this.modaltext = new CleanModalDropText( game, state, display );
	this.buttonlist = new CleanModalDropButtonList( game, state, display );
};
CleanModalDrop.prototype = extend(CleanUIElem);

CleanModalDrop.prototype.draw = function(){
	if( this.state.uistore.modals.drop.visible === false ){
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

CleanModalDrop.prototype.propogate_click = function( x, y ){
	if( this.state.uistore.modals.drop.visible === false ){
		return;
	}
	return this.buttonlist.propogate_click( x, y );
};

function CleanModalDropText( game, state, display ){
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

	this.text1 = "Are you certain you want to drop";
	this.text2 =  "";
}
CleanModalDropText.prototype = extend(CleanUIElem);

CleanModalDropText.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	var item = this.state.uistore.currentitem;
	this.text2 = "'"+item.name+"'?";

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

function CleanModalDropButtonList( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.subelems = [];
	for( var i = 0; i < 2; i++ ){
		this.subelems.push( new CleanModalDropButton( game, state, display, i ) );
	}
}
CleanModalDropButtonList.prototype = extend(CleanUIElem);

CleanModalDropButtonList.prototype.draw = function(){
	for( var i in this.subelems ){
		this.subelems[i].draw();
	}
};

CleanModalDropButtonList.prototype.propogate_click = function(x,y){
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		if( this.contains( elem.x, elem.y, elem.w, elem.h, x, y ) ){
			elem.onclick();
			return true;
		}
	}	
};

function CleanModalDropButton( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var xpos = null;
	var ypos = null;
	if( index % 2 === 0 ){
		xpos = 140;
		ypos = 155;
	} else {
		xpos = 250;
		ypos = 155;
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
CleanModalDropButton.prototype = extend(CleanUIElem);

CleanModalDropButton.prototype.draw = function(){
	var text = this.index === 0 ? "Yes" : "No";

	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.display.draw_text_params( text, this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanModalDropButton.prototype.onclick = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var itemname = this.state.uistore.currentitemname;
	if( this.index === 0 ){
		ch.remove_item_from_inventory( itemname );
		ch.unequip_item( itemname );
	}

	this.state.inter.hide_modal( this.state.uistore.modals.drop );
	this.state.inter.unset_currentitem();
};

})();