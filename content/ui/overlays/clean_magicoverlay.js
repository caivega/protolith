/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanMagicOverlay = app.ui.overlays.CleanMagicOverlay = 
	function(game, state, display, name){

	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 110 );
	this.y = this.to_y_ratio( 18  );
	this.w = this.to_x_ratio( 362 );
	this.h = this.to_y_ratio( 270 );
	this.color = this.NEUTRALCOLOR;
	this.transition = "menuslide";

	this.name = name;
	this.subelems = [
		new app.ui.CleanMenuHeader( this.game, this.state, this.display ),
		new CleanMagicTabs( this.game, this.state, this.display ),
		new CleanMagicSpellList( this.game, this.state, this.display ),
		new app.ui.modals.CleanModalSpellInfo( this.game, this.state, this.display )
	];

	this.store = this.state.uistore;
};
CleanMagicOverlay.prototype = extend(CleanUIElem);

CleanMagicOverlay.prototype.draw = function(){
	if( this.store.menustate !== this.name && 
		this.store.menus.animating && 
		this.store.prevstate === this.name ){

		this.animate_out_pre( this.store.menus );
	} else if( this.store.menustate !== this.name ){
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

CleanMagicOverlay.prototype.propogate_click = function( x, y ){
	if( this.state.uistore.menustate !== this.name ){
		return;
	}
	
	var val = false;
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		val = val || elem.propogate_click( x, y );
	}
	return val;
};

function CleanMagicTabs( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 110 );
	this.y = this.to_y_ratio( 18  );
	this.w = this.to_x_ratio( 362 );
	this.h = this.to_y_ratio( 30 );
	this.color = this.DARKCOLOR;

	this.subelems = [];
	for( var i = 0; i < 7; i++ ){
		this.subelems.push( new CleanMagicTabsButton( game, state, display, i ) );
	}

}
CleanMagicTabs.prototype = extend(CleanUIElem);

CleanMagicTabs.prototype.draw = function(){
	this.display.draw_rect( this.x, this.y, this.w, this.h, this.color );
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		elem.draw();
	}
};

CleanMagicTabs.prototype.propogate_click = function( x, y ){
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		if( this.contains( elem.x, elem.y, elem.w, elem.h, x, y ) ){
			elem.onclick();
			return true;
		}
	}
};

function CleanMagicTabsButton( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );

	this.index = index;

	var xoffset = 121;
	var textoffset = 150;

	this.w = this.to_x_ratio( 48 );
	this.h = this.to_y_ratio( 24 );
	this.x = this.to_x_ratio( xoffset ) + (this.w + 1)*index;
	this.y = this.to_y_ratio( 21  );
	this.color = this.LIGHTCOLOR;
	this.scolor = this.SELECTEDCOLOR;

	this.textx = this.to_x_ratio( textoffset ) + (this.w + 1)*index;
	this.texty = this.to_y_ratio( 33 );
	this.textcolor = this.VERYDARKCOLOR;
	this.stextcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 14;
	if( index === 0 ){
		this.text = "I";
	} else if( index === 1 ){
		this.text = "II";
	} else if( index === 2 ){
		this.text = "III";
	} else if( index === 3 ){
		this.text = "IV";
	} else if( index === 4 ){
		this.text = "V";
	} else if( index === 5 ){
		this.text = "VI";
	} else if ( index === 6 ){
		this.text = "VII";
	}
	
}
CleanMagicTabsButton.prototype = extend(CleanUIElem);

CleanMagicTabsButton.prototype.draw = function(){
	var menu = this.state.uistore.menustate;
	if( !(menu === "dark" || menu === "light") ){
		menu = this.state.uistore.prevstate;
	}
	if( this.state.uistore.menus[ menu ] === undefined ){
		return;
	}
	var selected = this.state.uistore.menus[ menu ].tab === this.index;

	var color = selected ? this.scolor : this.color;
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, color );

	var tcolor = selected ? this.stextcolor : this.textcolor;
	this.display.draw_text_params( this.text, this.textx, this.texty, {
		color: tcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanMagicTabsButton.prototype.onclick = function(){
	var menu = this.state.uistore.menustate;
	if( !(menu === "dark" || menu === "light") ){
		menu = this.state.uistore.prevstate;
	}
	this.state.uistore.menus[ menu ].tab = this.index;
};

function CleanMagicSpellList( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.text1x = this.to_x_ratio( 180 );
	this.text2x = this.to_x_ratio( 452 );
	this.texty = this.to_y_ratio( 58 );
	this.textcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 14;

	this.subelems = [];
	for( var i = 0; i < 7; i++ ){
		this.subelems.push( new CleanMagicSpell( game, state, display, i ) );
	}

}
CleanMagicSpellList.prototype = extend(CleanUIElem);

CleanMagicSpellList.prototype.draw = function(){
	this.display.draw_text_params( "Name", this.text1x, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center",
		shadowcolor: this.VERYDARKCOLOR
	});

	this.display.draw_text_params( "Cost", this.text2x, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center",
		shadowcolor: this.VERYDARKCOLOR
	});

	for( var i in this.subelems ){
		var elem = this.subelems[i];
		elem.draw();
	}
};

CleanMagicSpellList.prototype.propogate_click = function( x, y ){
	if( this.state.uistore.modals.spellinfo.visible ){
		return;
	}

	var val = false;
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		val = elem.propogate_click( x, y ) || val;
	}
	return val;
};

function CleanMagicSpell( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );

	this.index = index;

	var yoffset = 68;

	this.w = this.to_x_ratio( 312 );
	this.h = this.to_y_ratio( 30 );
	this.x = this.to_x_ratio( 152 );
	this.y = this.to_y_ratio( yoffset ) + (this.h + 1)*index;
	this.color = this.LIGHTCOLOR;
	this.scolor = this.SELECTEDCOLOR;
	
	this.subelems = [
		new CleanMagicSpellIcon( game, state, display, index ),
		new CleanMagicSpellLabel( game, state, display, index ),
		new CleanMagicSpellCost( game, state, display, index ),
		new CleanMagicSpellInfoButton( game, state, display, index ),
	];

	this.store = this.state.uistore;
}
CleanMagicSpell.prototype = extend(CleanUIElem);

CleanMagicSpell.prototype.draw = function(){
	var menu = this.state.uistore.menustate;
	if( !(menu === "dark" || menu === "light") ){
		menu = this.state.uistore.prevstate;
	}
	if( this.state.uistore.menus[ menu ] === undefined ){
		return;
	}
	var tab = this.store.menus[ menu ].tab;
	var spellname = this[ menu ][ tab ][ this.index ];
	var selected = this.state.uistore.currentspell === spellname;

	var color = selected ? this.scolor : this.color;
	this.display.draw_rect( this.x, this.y, this.w, this.h, color );

	for( var i in this.subelems ){
		this.subelems[i].draw();
	}
};

CleanMagicSpell.prototype.propogate_click = function( x, y ){
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		if( this.contains( elem.x, elem.y, elem.w, elem.h, x, y ) ){
			if( elem.onclick ){
				elem.onclick();
				return true;
			}
		}
	}

	if( this.contains( this.x, this.y, this.w, this.h ) ){
		this.onclick();
		return true;
	}
};

CleanMagicSpell.prototype.onclick = function(){

};

function CleanMagicSpellIcon( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );

	this.index = index;

	var yoffset = 68;

	this.w = this.to_x_ratio( 30 );
	this.h = this.to_y_ratio( 30 );
	this.x = this.to_x_ratio( 122 );
	this.y = this.to_y_ratio( yoffset ) + (this.h + 1)*index;
	this.color = this.VERYDARKCOLOR;

	this.spritex = this.to_x_ratio( 312 );
	this.spritey = this.to_y_ratio( 30 );
	this.spritew = this.to_x_ratio( 312 );
	this.spriteh = this.to_y_ratio( 30 );

	this.store = this.state.uistore;
	
}
CleanMagicSpellIcon.prototype = extend(CleanUIElem);

CleanMagicSpellIcon.prototype.draw = function(){
	var menu = this.state.uistore.menustate;
	if( !(menu === "dark" || menu === "light") ){
		menu = this.state.uistore.prevstate;
	}
	if( this.state.uistore.menus[ menu ] === undefined ){
		return;
	}

	this.display.draw_rect( this.x, this.y, this.w, this.h, this.color );
};

function CleanMagicSpellLabel( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );

	this.index = index;

	var yoffset = 75;

	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = this.to_y_ratio( 30 );

	this.textx = this.to_x_ratio( 160 );
	this.texty = this.to_y_ratio( yoffset ) + (this.h + 1)*index;
	this.textcolor = this.ALTERNATECOLOR;
	this.stextcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;

	this.store = this.state.uistore;
}
CleanMagicSpellLabel.prototype = extend(CleanUIElem);

CleanMagicSpellLabel.prototype.draw = function(){
	var menu = this.state.uistore.menustate;
	if( !(menu === "dark" || menu === "light") ){
		menu = this.state.uistore.prevstate;
	}
	if( this.state.uistore.menus[ menu ] === undefined ){
		return;
	}
	var tab = this.store.menus[ menu ].tab;
	var spellname = this[ menu ][ tab ][ this.index ];

	var selected = this.state.uistore.currentspell === spellname;

	var tcolor = selected ? this.stextcolor : this.textcolor;
	this.display.draw_text_params( spellname, this.textx, this.texty, {
		color: tcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "left"
	});
};

function CleanMagicSpellCost( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );

	this.index = index;

	var yoffset = 83;

	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = this.to_y_ratio( 30 );

	this.textx = this.to_x_ratio( 450 );
	this.texty = this.to_y_ratio( yoffset ) + (this.h + 1)*index;
	this.textcolor = this.VERYDARKCOLOR;
	this.stextcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;

	this.store = this.state.uistore;
}
CleanMagicSpellCost.prototype = extend(CleanUIElem);

CleanMagicSpellCost.prototype.draw = function(){
	var menu = this.state.uistore.menustate;
	if( !(menu === "dark" || menu === "light") ){
		menu = this.state.uistore.prevstate;
	}
	if( this.state.uistore.menus[ menu ] === undefined ){
		return;
	}
	var tab = this.store.menus[ menu ].tab;
	var spellname = this[ menu ][ tab ][ this.index ];
	var spell = {cost:9999};//this.state.world.sm.get_spell( spellname );
	var selected = this.state.uistore.currentspell === spellname;

	var tcolor = selected ? this.stextcolor : this.textcolor;
	this.display.draw_text_params( spell.cost, this.textx, this.texty, {
		color: tcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

function CleanMagicSpellInfoButton( game, state, display, index ){
	CleanUIElem.call( this, game, state, display );

	this.index = index;

	var yoffset = 74;

	this.w = this.to_x_ratio( 18 );
	this.h = this.to_y_ratio( 18 );
	this.offh = this.to_y_ratio( 30 );
	this.x = this.to_x_ratio( 402 );
	this.y = this.to_y_ratio( yoffset ) + (this.offh + 1)*index;
	this.color = this.ALTERNATECOLOR;

	var ytextoffset = 83;

	this.textx = this.to_x_ratio( 417 );
	this.texty = this.to_y_ratio( ytextoffset ) + (this.offh + 1)*index;
	this.textcolor = this.LIGHTTEXTCOLOR;
	this.font = this.FONT;
	this.defaulttextsize = 12;

	this.store = this.state.uistore;
}
CleanMagicSpellInfoButton.prototype = extend(CleanUIElem);

CleanMagicSpellInfoButton.prototype.draw = function(){
	var menu = this.state.uistore.menustate;
	if( !(menu === "dark" || menu === "light") ){
		menu = this.state.uistore.prevstate;
	}
	if( this.state.uistore.menus[ menu ] === undefined ){
		return;
	}

	this.display.draw_rect( this.x, this.y, this.w, this.h, this.color );

	var tcolor = this.textcolor;
	this.display.draw_text_params( "i", this.textx, this.texty, {
		color: tcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanMagicSpellInfoButton.prototype.onclick = function(){
	var menu = this.store.menustate;
	if( this.state.uistore.menus[ menu ] === undefined ){
		return;
	}
	var tab = this.store.menus[ menu ].tab;
	this.state.uistore.currentspell = this[ menu ][ tab ][ this.index ];
	this.state.inter.show_modal( this.state.uistore.modals.spellinfo );
};

var CleanLightMagicOverlay = 
app.ui.overlays.CleanLightMagicOverlay = function(game, state, display){
	CleanUIElem.call( this, game, state, display );
	this.overlay = new CleanMagicOverlay( game, state, display, "light" );
};
CleanLightMagicOverlay.prototype = extend(CleanUIElem);
CleanLightMagicOverlay.prototype.draw = function(){ 
	this.overlay.draw();
};
CleanLightMagicOverlay.prototype.propogate_click = function(x,y){ 
	this.overlay.propogate_click(x,y);
};
CleanLightMagicOverlay.prototype.propogate_unclick = function(){
	this.overlay.propogate_unclick();
};
var CleanDarkMagicOverlay =
app.ui.overlays.CleanDarkMagicOverlay = function(game, state, display){
	CleanUIElem.call( this, game, state, display );
	this.overlay = new CleanMagicOverlay( game, state, display, "dark" );
};
CleanDarkMagicOverlay.prototype = extend(CleanUIElem);
CleanDarkMagicOverlay.prototype.draw = function(){ 
	this.overlay.draw();
};
CleanDarkMagicOverlay.prototype.propogate_click = function(x,y){ 
	this.overlay.propogate_click(x,y);
};
CleanDarkMagicOverlay.prototype.propogate_unclick = function(){
	this.overlay.propogate_unclick();
};

})();