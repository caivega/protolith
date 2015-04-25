/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanInventoryOverlay = app.ui.overlays.CleanInventoryOverlay = 
	function(game, state, display){

	app.ui.CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 110 );
	this.y = this.to_y_ratio( 18  );
	this.w = this.to_x_ratio( 362 );
	this.h = this.to_y_ratio( 270 );
	this.color = this.NEUTRALCOLOR;

	this.subelems = [];

	this.subelems.push(
		new CleanInventoryList( this.game, this.state, this.display ),
		new app.ui.CleanMenuHeader( this.game, this.state, this.display ),
		new app.ui.modals.CleanModalItemInfo( this.game, this.state, this.display ),
		new app.ui.modals.CleanModalEquip( this.game, this.state, this.display ),
		new app.ui.modals.CleanModalGive( this.game, this.state, this.display ),
		new app.ui.modals.CleanModalDrop( this.game, this.state, this.display )
	);

	this.store = this.state.uistore;
};
CleanInventoryOverlay.prototype = app.extend(app.ui.CleanUIElem);

CleanInventoryOverlay.prototype.draw = function(){
	if( this.store.menustate !== "inventory" && 
		this.store.animating && 
		this.store.prevstate === "inventory" ){

		this.animate_out_pre( this.store );
	} else if( this.store.menustate !== "inventory" ){
		//gah this is stupid
		this.subelems[0].scrolly = 0;
		return;
	} else {
		this.animate_in_pre( this.store );
	}

	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	for( var i in this.subelems ){
		this.subelems[i].draw();
	}

	this.animate_post( this.store );
};

CleanInventoryOverlay.prototype.propogate_click = function( x, y ){
	if( this.state.uistore.menustate !== "inventory" ){
		return;
	}
	
	var val = false;
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		val = val || elem.propogate_click( x, y );
	}
	return val;
};

CleanInventoryOverlay.prototype.propogate_unclick = function( ){
	if( this.state.uistore.menustate !== "inventory" ){
		return;
	}
	
	var val = false;
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		val = val || elem.propogate_unclick( );
	}
	return val;
};

function CleanInventoryList( game, state, display ){
	app.ui.CleanUIElem.call( this, game, state, display );
	CleanInventoryList.prototype.stride = this.to_y_ratio( 40 );
	this.subelems = [];
	for( var i = 0; i < 25; i++ ){
		this.subelems.push( new CleanInventoryItem( game, state, display, i ) );
	}

	this.isscrolling = false;
	this.oldscrolly = 0;
	this.scrolly = 0;
	this.lastx = 0;
	this.lasty = 0;
	this.tolerance = 25;
}
CleanInventoryList.prototype = app.extend(app.ui.CleanUIElem);

CleanInventoryList.prototype.stride = 20;

CleanInventoryList.prototype.draw = function(){
	var scrolly = this._get_scrolly();
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		elem.draw( scrolly );
	}
};

CleanInventoryList.prototype._get_scrolly = function(){
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

CleanInventoryList.prototype.propogate_click = function( x, y ){
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

CleanInventoryList.prototype.propogate_unclick = function(){
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

function CleanInventoryItem( game, state, display, index ){
	app.ui.CleanUIElem.call( this, game, state, display );
	this.index = index;

	this.scrolly = 0;
	var yoffset = 20;

	var stride = CleanInventoryList.prototype.stride;

	this.w = this.to_x_ratio( 362 );
	this.h = this.to_y_ratio( 40 );
	this.x = this.to_x_ratio( 110 );
	this.y = this.to_y_ratio( yoffset ) + index*( stride + 1 );
	this.color1 = this.LIGHTCOLOR;
	this.color2 = this.NEUTRALCOLOR;
	this.scolor1 = this.SELECTEDCOLOR;
	this.ecolor1 = this.VERYDARKCOLOR;
	this.color = "lightneutral";

	this.sprite = new CleanInventorySprite( game, state, display, index );
	this.label = new CleanInventoryLabel( game, state, display, index );
	this.equip = new CleanInventoryEquipButton( game, state, display, index );
	this.give = new CleanInventoryGiveButton( game, state, display, index );
	this.drop = new CleanInventoryDropButton( game, state, display, index );
	this.use = new CleanInventoryUseButton( game, state, display, index );
}
CleanInventoryItem.prototype = app.extend(app.ui.CleanUIElem);

CleanInventoryItem.prototype.draw = function(scrolly){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	
	this.scrolly = scrolly;
	var itemname = ch.inventory[ this.index ];
	if( itemname === undefined ){
		this.display.draw_horiz_gradient( 
			this.x, this.y + scrolly, this.w, this.h, this.color1, this.color2 );
		return;
	}
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
	this.equip.draw( scrolly );
	this.give.draw( scrolly );
	this.drop.draw( scrolly );
	this.use.draw( scrolly );
};

CleanInventoryItem.prototype.propogate_click = function(x, y){
	var _click = function( elem ){
		if( this.contains( elem.x, elem.y + this.scrolly, elem.w, elem.h, x, y ) ){
			elem.onclick();
			return true;
		}
	};
	var items = [ this.equip, this.give, this.drop, this.use ];
	var val = false;
	for( var i in items ){
		val = _click.call( this, items[i] ) || val;
	}
	return val;
};

CleanInventoryItem.prototype.onclick = function(){
	if( this.state.inter.is_modal_visible() ){
		return;
	}

	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined || this.state.uistore.animating ){
		return;
	}
	var itemname = ch.inventory[ this.index ];
	if( itemname === undefined ){
		//i assume do the scroll thing
	} else {
		this.state.inter.set_currentitem( itemname );
		this.state.inter.show_modal( this.state.uistore.modals.iteminfo );
	}
};

function CleanInventorySprite( game, state, display, index ){
	app.ui.CleanUIElem.call( this, game, state, display );
	this.index = index;

	this.scrolly = 0;

	var yoffset = 30;
	var stride = CleanInventoryList.prototype.stride;

	this.w = this.to_x_ratio( 14 );
	this.h = this.to_x_ratio( 14 );
	this.x = this.to_x_ratio( 120 );
	this.y = this.to_y_ratio( yoffset ) + index*( stride + 1 );
}
CleanInventorySprite.prototype = app.extend(app.ui.CleanUIElem);

CleanInventorySprite.prototype.draw = function(scrolly){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var itemname = ch.inventory[ this.index ];
	var item = this.state.world.itemCache.get_item( itemname );
	this.display.draw_sprite_scaled_centered(
		item.sprite, this.x, this.y + scrolly, this.w, this.h);
};

function CleanInventoryLabel( game, state, display, index ){
	app.ui.CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 23;
	var stride = CleanInventoryList.prototype.stride;

	this.x = this.to_x_ratio( 145 );
	this.y = this.to_y_ratio( yoffset ) + index*( stride + 1 );
	this.defaulttextsize = 12;
	this.font = this.FONT;
	this.color = this.VERYDARKCOLOR;
	this.scolor = this.LIGHTTEXTCOLOR;
	this.ecolor = this.LIGHTCOLOR;
}
CleanInventoryLabel.prototype = app.extend(app.ui.CleanUIElem);

CleanInventoryLabel.prototype.draw = function( scrolly ){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var itemname = ch.inventory[ this.index ];
	var item = this.state.world.itemCache.get_item( itemname );
	var text = itemname === "none" ? "" : item.name;
	var bodypart = ch.item_is_equipped( itemname );

	var color = null;
	if( this.state.uistore.currentitemname === itemname ){
		color = this.scolor;
		if( bodypart ){
			text = text + " ("+bodypart+")";
		}
	} else if( bodypart ){
		color = this.ecolor;
		text = text + " ("+bodypart+")";
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

function CleanInventoryEquipButton( game, state, display, index ){
	app.ui.CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 21;
	var stride = CleanInventoryList.prototype.stride;
	var xpos = 352;

	this.w = this.to_x_ratio( 38 );
	this.h = this.to_x_ratio( 38 );
	this.x = this.to_x_ratio( xpos );
	this.y = this.to_y_ratio( yoffset ) + index*( stride + 1 );
	this.color = this.VERYDARKCOLOR;

	this.textx = this.to_x_ratio( xpos + 22 );
	this.texty = this.to_y_ratio( yoffset + 18 ) + index*( stride + 1 );
	this.defaulttextsize = 10;
	this.font = this.FONT;
	this.textcolor = this.LIGHTTEXTCOLOR;
}
CleanInventoryEquipButton.prototype = app.extend(app.ui.CleanUIElem);

CleanInventoryEquipButton.prototype.draw = function( scrolly ){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var itemname = ch.inventory[ this.index ];
	var item = this.state.world.itemCache.get_item( itemname );
	if( item.equipTypes.length === 0 ){
		return;
	}

	this.display.draw_rect_sprite( this.x, this.y + scrolly, this.w, this.h, this.color );

	this.display.draw_text_params( "Equip", this.textx, this.texty + scrolly, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanInventoryEquipButton.prototype.onclick = function( ){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var itemname = ch.inventory[ this.index ];
	var item = this.state.world.itemCache.get_item( itemname );
	if( item.equipTypes.length === 0 ){
		return;
	} else if( ch.item_is_equipped( itemname ) ){
		ch.unequip_item( itemname );
	} else if( item.equipTypes.length === 1 ){
		ch.equip_item( itemname, item.equipTypes[ 0 ] );
	} else {
		this.state.inter.set_currentitem( itemname );
		this.state.inter.show_modal( this.state.uistore.modals.equip );
	}
};

function CleanInventoryUseButton( game, state, display, index ){
	app.ui.CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 21;
	var stride = CleanInventoryList.prototype.stride;
	var xpos = 352;

	this.w = this.to_x_ratio( 38 );
	this.h = this.to_x_ratio( 38 );
	this.x = this.to_x_ratio( xpos );
	this.y = this.to_y_ratio( yoffset ) + index*( stride + 1 );
	this.color = "#267F00";

	this.textx = this.to_x_ratio( xpos + 22 );
	this.texty = this.to_y_ratio( yoffset + 18 ) + index*( stride + 1 );
	this.defaulttextsize = 10;
	this.font = this.FONT;
	this.textcolor = this.LIGHTTEXTCOLOR;
}
CleanInventoryUseButton.prototype = app.extend(app.ui.CleanUIElem);

CleanInventoryUseButton.prototype.draw = function( scrolly ){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var itemname = ch.inventory[ this.index ];
	var item = this.state.world.itemCache.get_item( itemname );
	if( item.on_use === "none" ){
		return;
	}

	this.display.draw_rect( this.x, this.y + scrolly, this.w, this.h, this.color );

	this.display.draw_text_params( "Use", this.textx, this.texty + scrolly, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanInventoryUseButton.prototype.onclick = function( ){
	if( this.state.inter.is_modal_visible() ){
		return;
	}

	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var itemname = ch.inventory[ this.index ];
	var item = this.state.world.itemCache.get_item( itemname );
	if( item.on_use === "none" ){
		return;
	}
	//use item
};

function CleanInventoryGiveButton( game, state, display, index ){
	app.ui.CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 21;
	var stride = CleanInventoryList.prototype.stride;
	var xpos = 392;

	this.w = this.to_x_ratio( 38 );
	this.h = this.to_x_ratio( 38 );
	this.x = this.to_x_ratio( xpos );
	this.y = this.to_y_ratio( yoffset ) + index*( stride + 1 );
	this.color = this.VERYDARKCOLOR;

	this.textx = this.to_x_ratio( xpos + 22 );
	this.texty = this.to_y_ratio( yoffset + 18 ) + index*( stride + 1 );
	this.defaulttextsize = 10;
	this.font = this.FONT;
	this.textcolor = this.LIGHTTEXTCOLOR;
}
CleanInventoryGiveButton.prototype = app.extend(app.ui.CleanUIElem);

CleanInventoryGiveButton.prototype.draw = function( scrolly ){
	this.display.draw_rect( this.x, this.y + scrolly, this.w, this.h, this.color );

	this.display.draw_text_params( "Give", this.textx, this.texty + scrolly, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanInventoryGiveButton.prototype.onclick = function( ){
	if( this.state.inter.is_modal_visible() ){
		return;
	}

	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var itemname = ch.inventory[ this.index ];
	this.state.inter.set_currentitem( itemname );
	this.state.inter.show_modal( this.state.uistore.modals.give );
};

function CleanInventoryDropButton( game, state, display, index ){
	app.ui.CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 21;
	var stride = CleanInventoryList.prototype.stride;
	var xpos = 432;

	this.w = this.to_x_ratio( 38 );
	this.h = this.to_x_ratio( 38 );
	this.x = this.to_x_ratio( xpos );
	this.y = this.to_y_ratio( yoffset ) + index*( stride + 1 );
	this.color = this.SELECTEDCOLOR;

	this.textx = this.to_x_ratio( xpos + 22 );
	this.texty = this.to_y_ratio( yoffset + 18 ) + index*( stride + 1 );
	this.defaulttextsize = 10;
	this.font = this.FONT;
	this.textcolor = this.LIGHTTEXTCOLOR;
}
CleanInventoryDropButton.prototype = app.extend(app.ui.CleanUIElem);

CleanInventoryDropButton.prototype.draw = function( scrolly ){
	this.display.draw_rect( this.x, this.y + scrolly, this.w, this.h, this.color );

	this.display.draw_text_params( "Drop", this.textx, this.texty + scrolly, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanInventoryDropButton.prototype.onclick = function( ){
	if( this.state.inter.is_modal_visible() ){
		return;
	}

	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var itemname = ch.inventory[ this.index ];
	this.state.inter.set_currentitem( itemname );
	this.state.inter.show_modal( this.state.uistore.modals.drop );
};

})();