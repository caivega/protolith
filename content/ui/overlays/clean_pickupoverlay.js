/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanPickupOverlay = app.ui.overlays.CleanPickupOverlay = 
	function(game, state, display){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 110 );
	this.y = this.to_y_ratio( 18  );
	this.w = this.to_x_ratio( 362 );
	this.h = this.to_y_ratio( 270 );
	this.color = this.NEUTRALCOLOR;
	this.transition = "menuslide";

	this.subelems = [];

	this.subelems.push(
		new CleanPickupList( this.game, this.state, this.display ),
		new app.ui.CleanMenuHeader( this.game, this.state, this.display ),
		new app.ui.modals.CleanModalItemInfo( this.game, this.state, this.display )
	);

	this.store = this.state.uistore;
}; 
CleanPickupOverlay.prototype = extend(CleanUIElem);

CleanPickupOverlay.prototype.draw = function(){
	if( this.store.menustate !== "pickup" && 
		this.store.menus.animating && 
		this.store.prevstate === "pickup" ){

		this.animate_out_pre( this.store.menus );
	} else if( this.store.menustate !== "pickup" ){
		//gah this is stupid
		this.subelems[0].scrolly = 0;
		return;
	} else {
		this.animate_in_pre( this.store.menus );
	}

	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	for( var i in this.subelems ){
		this.subelems[i].draw();
	}

	this.animate_post( this.store.menus);
};

CleanPickupOverlay.prototype.propogate_click = function( x, y ){
	if( this.state.uistore.menustate !== "pickup" ){
		return;
	}
	
	var val = false;
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		val = val || elem.propogate_click( x, y );
	}
	return val;
};

CleanPickupOverlay.prototype.propogate_unclick = function( ){
	if( this.state.uistore.menustate !== "pickup" ){
		return;
	}
	
	var val = false;
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		val = val || elem.propogate_unclick( );
	}
	return val;
};

function CleanPickupList( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.subelems = [];
	for( var i = 0; i < 25; i++ ){
		this.subelems.push( new CleanPickupItem( game, state, display, i ) );
	}

	this.isscrolling = false;
	this.oldscrolly = 0;
	this.scrolly = 0;
	this.lastx = 0;
	this.lasty = 0;
	this.tolerance = 25;
}
CleanPickupList.prototype = extend(CleanUIElem);

CleanPickupList.prototype.draw = function(){
	var scrolly = this._get_scrolly();
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		elem.draw( scrolly );
	}
};

CleanPickupList.prototype._get_scrolly = function(){
	var diff = this.lasty - this.state.uistore.mouse.y;
	if( this.state.uistore.mouse.down && 
		(this.isscrolling || Math.abs( diff ) > this.tolerance) ){
		this.isscrolling = true;
		this.scrolly  = this.oldscrolly - diff;
		if( this.scrolly < this.tolerance && this.scrolly > -this.tolerance ){
			this.scrolly = 0;
		}
	} else {
		this.oldscrolly = this.scrolly;
		this.isscrolling = false;
	}

	return this.scrolly;
};

CleanPickupList.prototype.propogate_click = function( x, y ){
	if( this.state.uistore.modals.iteminfo.visible ){
		return;
	}

	this.lastx = x;
	this.lasty = y;

	var val = false;
	for( var i in this.subelems ){
		val = this.subelems[ i ].propogate_click( x, y ) || val;
	}
	return val;
};

CleanPickupList.prototype.propogate_unclick = function(){
	var x = this.lastx;
	var y = this.lasty;

	if( this.isscrolling ){
		this.isscrolling = false;
		this.lasty = this.state.uistore.mouse.y;
		this.lastx = this.state.uistore.mouse.x;
		return true;
	}

	for( var i in this.subelems ){
		var elem = this.subelems[i];
		if( this.contains( elem.x, elem.y + this.scrolly, elem.w, elem.h, x, y ) ){
			elem.onclick();
			return true;
		}
	}
};

function CleanPickupItem( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	this.scrolly = 0;
	var yoffset = 20;

	this.w = this.to_x_ratio( 362 );
	this.h = this.to_y_ratio( 40 );
	this.x = this.to_x_ratio( 110 );
	this.y = this.to_y_ratio( yoffset ) + index*( this.h + 1 );
	this.color1 = this.LIGHTCOLOR;
	this.color2 = this.NEUTRALCOLOR;
	this.scolor1 = this.SELECTEDCOLOR;
	this.ecolor1 = this.VERYDARKCOLOR;
	this.color = "lightneutral";

	this.store = this.state.uistore.menus.pickup;

	this.sprite = new CleanPickupSprite( game, state, display, index );
	this.label = new CleanPickupLabel( game, state, display, index );
	this.weight = new CleanPickupWeight( game, state, display, index );
}
CleanPickupItem.prototype = extend(CleanUIElem);

CleanPickupItem.prototype.draw = function(scrolly){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	
	this.scrolly = scrolly;
	var itemobj = this.store.nearbyitems[this.index];
	if( itemobj === undefined ){
		this.display.draw_horiz_gradient( 
			this.x, this.y + scrolly, this.w, this.h, this.color1, this.color2 );
		return;
	}
	var itemname = itemobj.name;
	var color = null;
	if( this.state.uistore.currentitemname === itemname ){
		color = this.scolor1;
	} else if( ch.item_is_equipped( itemname ) ){
		color = this.ecolor1;
	} else {
		color = this.color1;
	}

	this.display.draw_horiz_gradient( 
		this.x, this.y + scrolly, this.w, this.h, color, this.color2 );

	this.sprite.draw( scrolly );
	this.label.draw( scrolly );
	this.weight.draw( scrolly );
};

CleanPickupItem.prototype.propogate_click = function(x, y){
	if(this.contains( this.weight.x, this.weight.y, this.weight.w, this.weight.h, x, y )){
		this.weight.onclick();
		return true;
	}
};

CleanPickupItem.prototype.onclick = function(){
	if( this.state.uistore.modals.iteminfo.visible ){
		return;
	}
	var itemobj = this.store.nearbyitems[this.index];
	if( itemobj === undefined ){
		return;
	}
	var itemname = itemobj.name;
	if( itemname === undefined ){
		//i assume do the scroll thing
	} else {
		this.state.inter.set_currentitem( itemname );
		this.state.inter.show_modal( this.state.uistore.modals.iteminfo );
	}
};

function CleanPickupSprite( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	this.scrolly = 0;

	var yoffset = 30;
	var stride = this.to_y_ratio( 20 );

	this.w = this.to_x_ratio( 14 );
	this.h = this.to_x_ratio( 14 );
	this.x = this.to_x_ratio( 120 );
	this.y = this.to_y_ratio( yoffset ) + index*( stride + 1 );

	this.store = this.state.uistore.menus.pickup;
}
CleanPickupSprite.prototype = extend(CleanUIElem);

CleanPickupSprite.prototype.draw = function(scrolly){
	var itemobj = this.store.nearbyitems[this.index];
	if( itemobj === undefined ){
		return;
	}
	var item = itemobj.item;
	this.display.draw_sprite_scaled_centered(
		item.sprite, this.x, this.y + scrolly, this.w, this.h);
};

function CleanPickupLabel( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 23;
	var stride = this.to_y_ratio( 20 );

	this.x = this.to_x_ratio( 145 );
	this.y = this.to_y_ratio( yoffset ) + index*( stride + 1 );
	this.defaulttextsize = 12;
	this.font = this.FONT;
	this.color = this.VERYDARKCOLOR;
	this.scolor = this.LIGHTTEXTCOLOR;
	this.ecolor = this.LIGHTCOLOR;

	this.store = this.state.uistore.menus.pickup;
}
CleanPickupLabel.prototype = extend(CleanUIElem);

CleanPickupLabel.prototype.draw = function( scrolly ){
	var itemobj = this.store.nearbyitems[this.index];
	if( itemobj === undefined ){
		return;
	}
	var itemname = itemobj.name;
	var item = itemobj.item;
	var text = itemname === "none" ? "" : item.name;

	var color = null;
	if( this.state.uistore.currentitemname === itemname ){
		color = this.scolor;
	} else {
		color = this.color;
	}

	this.display.draw_text_params( text, this.x, this.y + scrolly, {
		color: color,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "left"
	});
};

function CleanPickupWeight( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 21;
	var stride = this.to_y_ratio( 20 );

	this.x = this.to_x_ratio( 370 );
	this.y = this.to_y_ratio( yoffset ) + index*( stride + 1 );
	this.w = this.to_x_ratio( 90 );
	this.h = this.to_y_ratio( 18 );
	this.defaulttextsize = 12;
	this.font = this.FONT;
	this.color = this.DARKCOLOR;

	this.textx = this.to_x_ratio( 422 ) + (this.w + 1)*index;
	this.texty = this.to_y_ratio( yoffset + 9 ) + index*( stride + 1 );
	this.textcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 14;

	this.store = this.state.uistore.menus.pickup;
}
CleanPickupWeight.prototype = extend(CleanUIElem);

CleanPickupWeight.prototype.draw = function( scrolly ){
	var itemobj = this.store.nearbyitems[this.index];
	if( itemobj === undefined ){
		return;
	}
	var item = itemobj.item;
	var text = item.weight + " lbs";

	this.display.draw_rect( this.x, this.y + scrolly, this.w, this.h, this.color );

	this.display.draw_text_params( text, this.textx, this.texty + scrolly, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanPickupWeight.prototype.onclick = function(){
	var itemobj = this.store.nearbyitems[this.index];
	if( itemobj === undefined ){
		return;
	}
	var itemname = itemobj.name;
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}

	this.state.player.acquire_item( ch, itemname, itemobj.sq );
	this.state.inter.update_nearby_items( this.state.wMode.cactor );
};

})();