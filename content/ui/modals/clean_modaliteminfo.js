/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanModalItemInfo = app.ui.modals.CleanModalItemInfo = 
	function( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 472/2 - 380/2 );
	this.y = this.to_y_ratio( 288/2 - 234/2 );
	this.w = this.to_x_ratio( 380 );
	this.h = this.to_y_ratio( 233 );

	this.color = this.NEUTRALCOLOR;
	this.bcolor = this.VERYDARKCOLOR;

	this.subelems = [
		new CleanModalItemInfoHead( game, state, display ),
		new CleanModalItemProjection( game, state, display ),
		new CleanModalItemInfoWeight( game, state, display ),
		new CleanModalItemInfoIcon( game, state, display ),
		new CleanModalItemInfoProperties( game, state, display ),
		new CleanModalItemInfoDescription( game, state, display )
	];

	this.store = this.state.uistore.modals.iteminfo;

};
CleanModalItemInfo.prototype = extend(CleanUIElem);

CleanModalItemInfo.prototype.draw = function(){
	if( this.store.visible === false && this.store.animating === false ){
		return;
	} else if( this.store.visible === false && this.store.animating ){
		this.animate_out_pre( this.state.uistore.modals.iteminfo );
	} else {
		this.animate_in_pre( this.state.uistore.modals.iteminfo );
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

	this.animate_post( this.state.uistore.modals.iteminfo );
};

CleanModalItemInfo.prototype.propogate_click = function(x, y){
	var val = false;
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		val = val || elem.propogate_click( x, y );
	}
	return val;	
};

function CleanModalItemInfoHead( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 48 );
	this.y = this.to_y_ratio( 30 );
	this.w = this.to_x_ratio( 375 );
	this.h = this.to_y_ratio( 20 );
	this.color = this.VERYDARKCOLOR;

	this.label = new CleanModalItemInfoHeadLabel( game, state, display );
	this.close = new CleanModalItemInfoHeadCloseButton( game, state, display );
}
CleanModalItemInfoHead.prototype = extend(CleanUIElem);

CleanModalItemInfoHead.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	this.label.draw();
	this.close.draw();
};

CleanModalItemInfoHead.prototype.propogate_click = function(x, y){
	if( this.contains( 
		this.close.x, this.close.y, this.close.w, this.close.h, x, y
		) ){

		this.close.onclick();
		return true;
	}
};

function CleanModalItemInfoHeadLabel( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.textx = this.to_x_ratio( 58 );
	this.texty = this.to_y_ratio( 32 );
	this.textcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanModalItemInfoHeadLabel.prototype = extend(CleanUIElem);

CleanModalItemInfoHeadLabel.prototype.draw = function(){
	var item = this.state.uistore.currentitem;

	this.display.draw_text_params( item.name, this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "left"
	});
};

function CleanModalItemInfoHeadCloseButton( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 403 );
	this.y = this.to_y_ratio( 30 );
	this.w = this.to_x_ratio( 20 );
	this.h = this.to_y_ratio( 20 );
	this.color = this.SELECTEDCOLOR;

	this.textx = this.to_x_ratio( 419 );
	this.texty = this.to_y_ratio( 40 );
	this.textcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanModalItemInfoHeadCloseButton.prototype = extend(CleanUIElem);

CleanModalItemInfoHeadCloseButton.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.display.draw_text_params( "X", this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanModalItemInfoHeadCloseButton.prototype.onclick = function(){
	this.state.inter.hide_modal( this.state.uistore.modals.iteminfo );
};

function CleanModalItemProjection( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 118 );
	this.y = this.to_y_ratio( 95 );
	this.w = this.to_x_ratio( 236 );
	this.h = this.to_y_ratio( 35 );
	this.color = this.LIGHTCOLOR;

	this.subelems = [
		new CleanModalItemProjectionHead( game, state, display ),
		new CleanModalItemProjectionList( game, state, display )
	];
}
CleanModalItemProjection.prototype = extend(CleanUIElem);

CleanModalItemProjection.prototype.draw = function(){
	for( var i in this.subelems ){
		this.subelems[i].draw();
	}
};

function CleanModalItemProjectionHead( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 268 );
	this.y = this.to_y_ratio( 117 );
	this.w = this.to_x_ratio( 151 );
	this.h = this.to_y_ratio( 33 );
	this.color = this.LIGHTCOLOR;

	this.label = new CleanModalItemProjectionHeadLabel( game, state, display );
	this.columns = new CleanModalItemProjectionHeadColumns( game, state, display );
}
CleanModalItemProjectionHead.prototype = extend(CleanUIElem);

CleanModalItemProjectionHead.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.label.draw();
	this.columns.draw();
};

function CleanModalItemProjectionHeadLabel( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.textx = this.to_x_ratio( 349 );
	this.texty = this.to_y_ratio( 125 );
	this.textcolor = this.VERYDARKCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanModalItemProjectionHeadLabel.prototype = extend(CleanUIElem);

CleanModalItemProjectionHeadLabel.prototype.draw = function(){
	this.display.draw_text_params( "If you equip...", this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

function CleanModalItemProjectionHeadColumns( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.text1x = this.to_x_ratio( 297 + 4 );
	this.text2x = this.to_x_ratio( 350 + 4);
	this.text3x = this.to_x_ratio( 398 + 4);
	this.texty = this.to_y_ratio( 142 );
	this.textcolor = this.VERYDARKCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanModalItemProjectionHeadColumns.prototype = extend(CleanUIElem);

CleanModalItemProjectionHeadColumns.prototype.draw = function(){
	this.display.draw_text_params( "Stats", this.text1x, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
	this.display.draw_text_params( "From", this.text2x, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
	this.display.draw_text_params( "To", this.text3x, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

function CleanModalItemProjectionList( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 268 );
	this.y = this.to_y_ratio( 150 );
	this.w = this.to_x_ratio( 61 );
	this.h = this.to_y_ratio( 106 );
	this.color = this.VERYDARKCOLOR;

	this.subelems = [];
	for( var i in CleanUIElem.prototype.stats ){
		this.subelems.push( new CleanModalItemProjectionStat(game, state, display, i) );
		this.subelems.push( new CleanModalItemProjectionFrom(game, state, display, i) );
		this.subelems.push( new CleanModalItemProjectionTo(game, state, display, i) );
	}
}
CleanModalItemProjectionList.prototype = extend(CleanUIElem);

CleanModalItemProjectionList.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	for( var i in this.subelems ){
		this.subelems[i].draw();
	}
};

function CleanModalItemProjectionStat( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );
	this.index = index;

	var yoffset = 159;
	var stride = 15;

	this.text1x = this.to_x_ratio( 286 );
	this.text2x = this.to_x_ratio( 319 );
	this.texty = this.to_y_ratio( yoffset + stride*index );
	this.textcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanModalItemProjectionStat.prototype = extend(CleanUIElem);

CleanModalItemProjectionStat.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var statname = CleanUIElem.prototype.stats[ this.index ];

	this.display.draw_text_params(statname, this.text1x, this.texty, {
		color: this.LIGHTCOLOR,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});

	this.display.draw_text_params(ch.stats[ statname ], this.text2x, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

function CleanModalItemProjectionFrom( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );

	this.index = index;

	var yoffset = 159;
	var stride = 15;

	this.textx = this.to_x_ratio( 353 );
	this.texty = this.to_y_ratio( yoffset + stride*index );
	this.color = this.LIGHTTEXTCOLOR;
	this.shadow = "black";
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanModalItemProjectionFrom.prototype = extend(CleanUIElem);

CleanModalItemProjectionFrom.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var statname = CleanUIElem.prototype.stats[ this.index ];
	var fin = ch.get_final_stat( statname );
	var text = fin.stat - fin.base;
	if( text > 0 ){
		text = "+"+text;
	} else if( text === 0 ){
		return;
	}

	this.display.draw_text_params(text, this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center",
		shadowcolor: this.shadow
	});
};

function CleanModalItemProjectionTo( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );

	this.index = index;

	var yoffset = 159;
	var stride = 15;

	this.textx = this.to_x_ratio( 401 );
	this.texty = this.to_y_ratio( yoffset + stride*index );
	this.color = this.LIGHTTEXTCOLOR;
	this.rshadow = "#770000";
	this.gshadow = "#007700";
	this.bshadow = "black";
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanModalItemProjectionTo.prototype = extend(CleanUIElem);

CleanModalItemProjectionTo.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.state.uistore.pcselected ];
	if( ch === undefined ){
		return;
	}
	var item = this.state.uistore.currentitem;
	var text = "";
	var shadow = null;
	if( item.equipTypes.length === 0 ){
		var statname = CleanUIElem.prototype.stats[ this.index ];
		var fin = ch.get_final_stat( statname );
		var originalmod = fin.stat - fin.base;
		text = originalmod;
		if( text > 0 ){
			text = "+"+text;
		} else if( text === 0 ){
			return;
		}
	} else {
		var statname = CleanUIElem.prototype.stats[ this.index ];
		var fin = ch.get_final_stat( statname );
		var originalmod = fin.stat - fin.base;
		var tmpequip = ch.equipment[ item.equipTypes[0] ];
		ch.equipment[ item.equipTypes[0] ] = item.name;
		var newmod = fin.stat - fin.base;
		ch.equipment[ item.equipTypes[0] ] = tmpequip;

		shadow = this.bshadow;
		if( newmod > originalmod ){
			shadow = this.gshadow;
		} else if( newmod < originalmod ){
			shadow = this.rshadow;
		}

		text = newmod;
		if( text > 0 ){
			text = "+"+text;
		} else if( text === 0 ){
			return;
		}
	}

	this.display.draw_text_params(text, this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center",
		shadowcolor: shadow
	});
};

function CleanModalItemInfoWeight( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 309 );
	this.y = this.to_y_ratio( 73 );
	this.w = this.to_x_ratio( 110 );
	this.h = this.to_y_ratio( 19 );
	this.color = this.VERYDARKCOLOR;

	this.text1x = this.to_x_ratio( 343 );
	this.text2x = this.to_x_ratio( 395 );
	this.texty = this.to_y_ratio( 83 );
	this.textcolor = this.LIGHTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanModalItemInfoWeight.prototype = extend(CleanUIElem);

CleanModalItemInfoWeight.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	var item = this.state.uistore.currentitem;

	this.display.draw_text_params("Weight:", this.text1x, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});

	this.display.draw_text_params(item.weight+' lbs', this.text2x, this.texty, {
		color: this.LIGHTTEXTCOLOR,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

function CleanModalItemInfoIcon( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 268 );
	this.y = this.to_y_ratio( 67 );
	this.w = this.to_x_ratio( 32 );
	this.h = this.to_y_ratio( 32 );
	this.color = this.LIGHTCOLOR;

	this.spritex = this.to_x_ratio( 284 );
	this.spritey = this.to_y_ratio( 83 );
	this.spritew = this.to_x_ratio( 14 );
	this.spriteh = this.to_y_ratio( 14 );
}
CleanModalItemInfoIcon.prototype = extend(CleanUIElem);

CleanModalItemInfoIcon.prototype.draw = function(){
	var item = this.state.uistore.currentitem;
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.display.draw_sprite_scaled_centered(
		item.sprite, this.spritex, this.spritey, this.spritew, this.spriteh);
};

function CleanModalItemInfoDescription( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 48 );
	this.y = this.to_y_ratio( 52 );
	this.w = this.to_x_ratio( 208 );
	this.h = this.to_y_ratio( 98 );
	this.color = this.LIGHTCOLOR;

	this.textx = this.to_x_ratio( 50 );
	this.texty = this.to_y_ratio( 64 );
	this.lineheight = this.to_y_ratio( 14 );
	this.maxwidth = this.to_x_ratio( 204 );
	this.textcolor = this.VERYDARKCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;
}
CleanModalItemInfoDescription.prototype = extend(CleanUIElem);

CleanModalItemInfoDescription.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	var item = this.state.uistore.currentitem;

	this.display.wrap_text( item.description, this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "left",
		lineheight: this.lineheight,
		maxwidth: this.maxwidth
	});
};

function CleanModalItemInfoProperties( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 48 );
	this.y = this.to_y_ratio( 150 );
	this.w = this.to_x_ratio( 208 );
	this.h = this.to_y_ratio( 106 );
	this.color = this.VERYDARKCOLOR;

}
CleanModalItemInfoProperties.prototype = extend(CleanUIElem);

CleanModalItemInfoProperties.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

};

})();