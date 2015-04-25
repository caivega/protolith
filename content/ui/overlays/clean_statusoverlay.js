/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanStatusOverlay = 
app.ui.overlays.CleanStatusOverlay = function(game, state, display){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 110 );
	this.y = this.to_y_ratio( 18  );
	this.w = this.to_x_ratio( 362 );
	this.h = this.to_y_ratio( 270 );
	this.color = this.NEUTRALCOLOR;

	this.subelems = [];

	this.subelems.push(
		new app.ui.CleanMenuHeader( this.game, this.state, this.display ),
		new CleanClassInfo( this.game, this.state, this.display ),
		new CleanSpritePortrait( this.game, this.state, this.display ),
		new CleanReorderButton( this.game, this.state, this.display ),
		new CleanHPInfo( this.game, this.state, this.display ),
		new CleanMPInfo( this.game, this.state, this.display ),
		new CleanStatInfoList( this.game, this.state, this.display ),
		new CleanEquipmentInfoList( this.game, this.state, this.display ),
		new app.ui.modals.CleanModalReorder( this.game, this.state, this.display ),
		new app.ui.modals.CleanModalItemInfo( this.game, this.state, this.display )
	);

	this.store = this.state.uistore;
};
CleanStatusOverlay.prototype = extend(CleanUIElem);

CleanStatusOverlay.prototype.draw = function(){
	if( this.store.menustate !== "status" && 
		this.store.animating && 
		this.store.prevstate === "status" ){

		this.animate_out_pre( this.store );
	} else if( this.store.menustate !== "status" ){
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

CleanStatusOverlay.prototype.propogate_click = function(x,y){
	if( this.state.uistore.menustate !== "status" ){
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

function CleanClassInfo( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 120 );
	this.y = this.to_y_ratio( 20 );
	this.w = this.to_x_ratio( 127 );
	this.h = this.to_y_ratio( 18 );

	this.color = this.LIGHTCOLOR;

	this.label = new CleanClassInfoLabel( game, state, display );
}
CleanClassInfo.prototype = extend(CleanUIElem);

CleanClassInfo.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.label.draw();
};

var CleanClassInfoLabel = 
app.ui.CleanClassInfoLabel = function( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 188 );
	this.y = this.to_y_ratio( 29 );
	this.color = this.VERYDARKCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 10;
};
CleanClassInfoLabel.prototype = extend(CleanUIElem);

CleanClassInfoLabel.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var text = "Class: " + ch.combatclass[0].toUpperCase() + ch.combatclass.slice(1);

	this.display.draw_text_params( text, this.x, this.y, {
		color: this.color,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

function CleanSpritePortrait( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 120 );
	this.y = this.to_y_ratio( 44 );
	this.w = this.to_x_ratio( 48 );
	this.h = this.to_y_ratio( 48 );

	this.color = this.LIGHTCOLOR;

	this.sprite = new CleanSpritePortraitPicture( game, state, display );
}
CleanSpritePortrait.prototype = extend(CleanUIElem);

CleanSpritePortrait.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.sprite.draw();
};

function CleanSpritePortraitPicture( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 144 );
	this.y = this.to_y_ratio( 68 );
	this.w = this.to_x_ratio( 28 );
	this.h = this.to_y_ratio( 32 );

	this.frame = 0;
	this.framespeed = 20;
	this.framectr = 0;
	this.maxframes = 2;
}
CleanSpritePortraitPicture.prototype = extend(CleanUIElem);

CleanSpritePortraitPicture.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var sprite = ch.get_sprite( "d", this.frame );
	if( this.display.sprites[ sprite ] === undefined ){
		this.game.ERROR = 'no sprite ' + sprite + 'has been loaded'; 
		sprite = this.ERRORSPRITE;
	}
    this.display.draw_sprite_scaled_centered(sprite, this.x, this.y, this.w, this.h);

    this.framectr++;
    if( this.framectr === this.framespeed ){
    	this.framectr = 0;
    	this.frame = ( this.frame + 1 ) % this.maxframes;
    }
};

function CleanReorderButton( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	var y = 44;

	this.x = this.to_x_ratio( 179 );
	this.y = this.to_y_ratio( y );
	this.w = this.to_x_ratio( 63 );
	this.h = this.to_y_ratio( 19 );
	this.color = this.LIGHTCOLOR;
	this.scolor = this.SELECTEDCOLOR;

	this.textx = this.to_x_ratio( 215 );
	this.texty = this.to_y_ratio( y + 9 );
	this.textcolor = this.VERYDARKCOLOR;
	this.stextcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 10;
}
CleanReorderButton.prototype = extend(CleanUIElem);

CleanReorderButton.prototype.draw = function(){
	var selected = this.state.uistore.modals.reorder.visible;

	this.display.draw_rect_sprite( 
		this.x, this.y, this.w, this.h, selected ? this.scolor : this.color );

	this.display.draw_text_params( "Reorder", this.textx, this.texty, {
		color: selected ? this.stextcolor : this.textcolor ,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanReorderButton.prototype.onclick = function(){
	if( this.state.uistore.modals.iteminfo.visible ){
		return;
	}

	if( !this.state.uistore.reorderdisabled ){
		this.state.uistore.modals.reorder.visible = 
			!this.state.uistore.modals.reorder.visible;
	}
};

function CleanHPInfo( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	var y = 62;

	this.textx = this.to_x_ratio( 218 );
	this.texty = this.to_y_ratio( y + 12 );
	this.textcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 14;
}
CleanHPInfo.prototype = extend(CleanUIElem);

CleanHPInfo.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}

	var text = ch.stats.curr_hp + "/" + ch.stats.max_hp;

	this.display.draw_text_params( text, this.textx, this.texty, {
		color: this.textcolor ,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center",
		shadowcolor: "#007700"
	});
};

function CleanMPInfo( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	var y = 79;

	this.textx = this.to_x_ratio( 218 );
	this.texty = this.to_y_ratio( y + 12 );
	this.textcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 14;
}
CleanMPInfo.prototype = extend(CleanUIElem);

CleanMPInfo.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}

	var text = ch.stats.curr_mp + "/" + ch.stats.max_mp;

	this.display.draw_text_params( text, this.textx, this.texty, {
		color: this.textcolor ,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center",
		shadowcolor: "#000077"
	});
};

function CleanStatInfoList( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.subelems = [];
	for( var i in CleanUIElem.prototype.stats ){
		this.subelems.push( new CleanStatInfo( game, state, display, i ) );
	}
}
CleanStatInfoList.prototype = extend(CleanUIElem);

CleanStatInfoList.prototype.draw = function(){
	for( var i in this.subelems ){
		this.subelems[i].draw();
	}
};

function CleanStatInfo( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );

	this.index = index;
	var yoffset = 112;

	this.x = this.to_x_ratio( 147 );
	this.y = this.to_y_ratio( yoffset + index*26 );
	this.w = this.to_x_ratio( 68 );
	this.h = this.to_y_ratio( 24 );	

	this.label = new CleanStatInfoLabel( game, state, display, index );
	this.value = new CleanStatInfoValue( game, state, display, index );
	this.mod = new CleanStatInfoModifier( game, state, display, index );
}
CleanStatInfo.prototype = extend(CleanUIElem);

CleanStatInfo.prototype.draw = function(){
	this.display.draw_sprite_scaled_centered(
		"cleanstatpill", this.x, this.y, this.w, this.h);

	this.label.draw();
	this.value.draw();
	this.mod.draw();
};

function CleanStatInfoLabel( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 112;

	this.x = this.to_x_ratio( 137 );
	this.y = this.to_y_ratio( yoffset + index*26 );

	this.color = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanStatInfoLabel.prototype = extend(CleanUIElem);

CleanStatInfoLabel.prototype.draw = function(){
	this.display.draw_text_params( 
		CleanUIElem.prototype.stats[ this.index ], this.x, this.y, {
			color: this.color,
			font: this.font,
			size: this.get_font_size( this.defaulttextsize ),
			align: "center"
	});
};

function CleanStatInfoValue( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 112;

	this.x = this.to_x_ratio( 169 );
	this.y = this.to_y_ratio( yoffset + index*26 );

	this.color = this.VERYDARKCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanStatInfoValue.prototype = extend(CleanUIElem);

CleanStatInfoValue.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var stat = ch.stats[ CleanUIElem.prototype.stats[ this.index ] ];

	this.display.draw_text_params( stat, this.x, this.y, {
		color: this.color,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

function CleanStatInfoModifier( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 112;
	var ytextoffset = yoffset;

	this.x = this.to_x_ratio( 206 );
	this.y = this.to_y_ratio( yoffset + index*26 );
	this.texty = this.to_y_ratio( ytextoffset + index*26 );
	this.textx = this.to_x_ratio( 213 );
	this.w = this.to_x_ratio( 40 );
	this.h = this.to_y_ratio( 13 );	

	this.color = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 10;
}
CleanStatInfoModifier.prototype = extend(CleanUIElem);

CleanStatInfoModifier.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var stat = ch.stats[ CleanUIElem.prototype.stats[ this.index ] ];
	var finalstat = ch.get_final_stat( CleanUIElem.prototype.stats[ this.index ] );
	var diff = finalstat.stat - stat;
	var sprite = "";
	var text = "";

	if( diff > 0 ){
		sprite = "cleanstatincreasemod";
		text = "+"+diff;
	} else if( diff < 0 ){
		sprite = "cleanstatdecreasemod";
		text = diff+"";
	} else {
		return;
	}

	this.display.draw_sprite_scaled_centered( sprite, this.x, this.y, this.w, this.h );

	this.display.draw_text_params( text, this.textx, this.texty, {
		color: this.color,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});

};

function CleanEquipmentInfoList( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.subelems = [];
	for( var i in CleanUIElem.prototype.equips ){
		this.subelems.push( new CleanEquipmentInfoItem( game, state, display, i ) );
	}
}
CleanEquipmentInfoList.prototype = extend(CleanUIElem);

CleanEquipmentInfoList.prototype.draw = function(){
	for( var i in this.subelems ){
		this.subelems[i].draw();
	}
};

CleanEquipmentInfoList.prototype.propogate_click = function( x, y ){
	if( this.state.uistore.modals.iteminfo.visible ){
		return;
	}
	
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		if( this.contains( elem.x, elem.y, elem.w, elem.h, x, y ) ){
			elem.onclick();
		}
	}
};

function CleanEquipmentInfoItem( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 38;
	var stride = 38;

	this.x = this.to_x_ratio( 255 );
	this.y = this.to_y_ratio( yoffset + index*stride );
	this.w = this.to_x_ratio( 217 );
	this.h = this.to_y_ratio( 20 );
	this.color1 = this.LIGHTCOLOR;
	this.color2 = this.NEUTRALCOLOR;
	this.scolor1 = this.SELECTEDCOLOR;
	this.color = "lightneutral";

	this.bodypart = new CleanEquipmentInfoBodyPart( game, state, display, index );
	this.sprite = new CleanEquipmentInfoSprite( game, state, display, index );
	this.label = new CleanEquipmentInfoLabel( game, state, display, index );
}
CleanEquipmentInfoItem.prototype = extend(CleanUIElem);

CleanEquipmentInfoItem.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var itemname = ch.equipment[CleanUIElem.prototype.equips[ this.index ].toLowerCase()];
	var item = this.state.world.itemCache.get_item( itemname );

	var color = this.state.uistore.currentitem === item ? this.scolor1 : this.color1;

	this.display.draw_horiz_gradient( 
		this.x, this.y, this.w, this.h, color, this.color2 );

	this.bodypart.draw();
	this.sprite.draw();
	this.label.draw();
};

CleanEquipmentInfoItem.prototype.onclick = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var itemname = ch.equipment[CleanUIElem.prototype.equips[ this.index ].toLowerCase()];
	if( itemname === "none" ){
		return;
	}
	var item = this.state.world.itemCache.get_item( itemname );
	this.state.uistore.currentitem = item;
	this.state.inter.show_modal( this.state.uistore.modals.iteminfo );
};

function CleanEquipmentInfoBodyPart( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 21;
	var stride = 38;

	this.x = this.to_x_ratio( 269 );
	this.y = this.to_y_ratio( yoffset + index*stride );
	this.w = this.to_x_ratio( 49 );
	this.h = this.to_y_ratio( 17 );	
	this.color = this.VERYDARKCOLOR;

	this.textx = this.to_x_ratio( 298 );
	this.texty = this.to_y_ratio( (yoffset + 8) + index*stride );
	this.defaulttextsize = 10;
	this.font = this.FONT;
	this.textcolor = this.LIGHTCOLOR;
}
CleanEquipmentInfoBodyPart.prototype = extend(CleanUIElem);

CleanEquipmentInfoBodyPart.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	var text = CleanUIElem.prototype.equips[ this.index ];
	this.display.draw_text_params( text, this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

function CleanEquipmentInfoSprite( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 35;
	var stride = 38;

	this.x = this.to_x_ratio( 264 );
	this.y = this.to_y_ratio( (yoffset + 12) + index*stride );
	this.w = this.to_x_ratio( 14 );
	this.h = this.to_x_ratio( 14 );
}
CleanEquipmentInfoSprite.prototype = extend(CleanUIElem);

CleanEquipmentInfoSprite.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var itemname = ch.equipment[CleanUIElem.prototype.equips[ this.index ].toLowerCase()];
	if( itemname === "none" ){
		return;
	}
	var item = this.state.world.itemCache.get_item( itemname );
	this.display.draw_sprite_scaled_centered(item.sprite, this.x, this.y, this.w, this.h);
};

function CleanEquipmentInfoLabel( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 41;
	var stride = 38;

	this.x = this.to_x_ratio( 277 );
	this.y = this.to_y_ratio( (yoffset) + index*stride );
	this.defaulttextsize = 12;
	this.font = this.FONT;
	this.color = this.VERYDARKCOLOR;
	this.scolor = this.LIGHTTEXTCOLOR;
}
CleanEquipmentInfoLabel.prototype = extend(CleanUIElem);

CleanEquipmentInfoLabel.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var itemname = ch.equipment[CleanUIElem.prototype.equips[ this.index ].toLowerCase()];
	var item = this.state.world.itemCache.get_item( itemname );
	var text = itemname === "none" || itemname === undefined ? "(none)" : item.name;

	var color = this.state.uistore.currentitem === item ? this.scolor : this.color;

	this.display.draw_text_params( text, this.x, this.y, {
		color: color,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "left"
	});
};

})();