/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanModalEquip = app.ui.modals.CleanModalEquip = function( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 472/2 - 240/2 );
	this.y = this.to_y_ratio( 288/2 - 106/2 );
	this.w = this.to_x_ratio( 240 );
	this.h = this.to_y_ratio( 106 );

	this.color = this.NEUTRALCOLOR;
	this.bcolor = this.VERYDARKCOLOR;

	this.modaltext = new CleanModalEquipText( game, state, display );
	this.buttonlist = new CleanModalEquipButtonList( game, state, display );
};
CleanModalEquip.prototype = extend(CleanUIElem);

CleanModalEquip.prototype.draw = function(){
	if( this.state.uistore.modals.equip.visible === false ){
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

CleanModalEquip.prototype.propogate_click = function( x, y ){
	if( this.state.uistore.modals.equip.visible === false ){
		return;
	}
	return this.buttonlist.propogate_click( x, y );
};

function CleanModalEquipText( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 118 );
	this.y = this.to_y_ratio( 93 );
	this.w = this.to_x_ratio( 236 );
	this.h = this.to_y_ratio( 35 );
	this.color = this.LIGHTCOLOR;

	this.textx = this.to_x_ratio( 472/2 );
	this.text1y = this.to_y_ratio( 288/2 - 36);
	this.text2y = this.to_y_ratio( 110 );
	this.textcolor = this.VERYDARKCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
	this.text1 = "Where do you equip this?";
}
CleanModalEquipText.prototype = extend(CleanUIElem);

CleanModalEquipText.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	this.display.draw_text_params( this.text1, this.textx, this.text1y, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

function CleanModalEquipButtonList( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.subelems = [];
	for( var i in CleanUIElem.prototype.equips ){
		this.subelems.push( new CleanModalEquipButton( game, state, display, i ) );
	}
}
CleanModalEquipButtonList.prototype = extend(CleanUIElem);

CleanModalEquipButtonList.prototype.draw = function(){
	for( var i in this.subelems ){
		this.subelems[i].draw();
	}
};

CleanModalEquipButtonList.prototype.propogate_click = function(x,y){
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		if( this.contains( elem.x, elem.y, elem.w, elem.h, x, y ) ){
			elem.onclick();
			return true;
		}
	}	
};

function CleanModalEquipButton( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var xoffset = 120;

	var xpos = xoffset + 34 * index;
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
	this.defaulttextsize = 10;
}
CleanModalEquipButton.prototype = extend(CleanUIElem);

CleanModalEquipButton.prototype.draw = function(){

	var type = this.state.uistore.currentitem.equipTypes[ this.index ];
	if( type === undefined ){
		return;
	}

	var text = type;

	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.display.draw_text_params( text, this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});

	return true;
};

CleanModalEquipButton.prototype.onclick = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}

	ch.equip_item( this.state.uistore.currentitemname, 
		this.state.uistore.currentitem.equipTypes[ this.index ] );
	this.state.inter.hide_modal( this.state.uistore.modals.equip );
};

})();