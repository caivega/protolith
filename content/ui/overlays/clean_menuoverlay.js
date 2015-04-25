/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanMenuOverlay = app.ui.overlays.CleanMenuOverlay = function(game, state, display){
	CleanUIElem.call( this, game, state, display );

	this.x = this.x_percent_to_pixel( 0.7669491525423728 );
	this.y = 0;

	this.w = this.x_percent_to_pixel( 0.2330508474576271 );
	this.h = this.y_percent_to_pixel( 0.6458333333333334 );

	this.color = this.NEUTRALCOLOR;

	this.subelems = [
		new CleanMenuButtonMap( game, state, display ),
		new CleanMenuButtonSave( game, state, display ),
		new CleanMenuButtonInventory( game, state, display ),
		new CleanMenuButtonPickup( game, state, display ),
		new CleanMenuButtonDark( game, state, display ),
		new CleanMenuButtonLight( game, state, display ),
	];
};
CleanMenuOverlay.prototype = extend(CleanUIElem);

CleanMenuOverlay.prototype.draw = function(){
	this.display.draw_rect( this.x, this.y, this.w, this.h, this.color );
	for( var i in this.subelems ){
		this.subelems[ i ].draw();
	}
};

CleanMenuOverlay.prototype.propogate_click = function( x, y ){
	if( this.state.uistore.menustate !== "none" ){
		return;
	}
	
	for( var i in this.subelems ){
		var b = this.subelems[ i ];
		if( this.contains( b.x, b.y, b.w, b.h, x, y ) ){
			b.onclick();
			return true;
		}
	}
};

function CleanMenuButton( game, state, display ){
	CleanUIElem.call( this, game, state, display );

	this.w = this.x_percent_to_pixel( 0.11228813559322035 );
	this.h = this.y_percent_to_pixel( 0.1840277777777778 );
	this.color = this.LIGHTCOLOR;
	this.scolor = this.SELECTEDCOLOR;

	this.centerxoffset = 0.052966101694915335;
	this.centeryoffset = 0.10069444444444443;

	this.textcolor = this.NEUTRALCOLOR;
	this.stextcolor = this.LIGHTTEXTCOLOR;
	this.defaulttextsize = 8;
	this.font = this.FONT;
}
CleanMenuButton.prototype = extend(CleanUIElem);

CleanMenuButton.prototype.draw = function(){

	var selected = this.state.uistore.menustate===(this.text || this.name).toLowerCase();
	this.display.draw_rect( this.x, this.y, 
		this.w, this.h, selected ? this.scolor : this.color );
	this.display.draw_text_params( this.text, this.textx, this.texty, {
		color: selected ? this.stextcolor : this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanMenuButton.prototype.onclick = function(){
	this.state.inter.show_menu( ( this.text || this.name ).toLowerCase() );
};

function CleanMenuButtonMap(game, state, display){
	CleanMenuButton.call( this, game, state, display );

	this.x = this.x_percent_to_pixel( 0.7690677966101694 );
	this.y = this.y_percent_to_pixel( 0.034722222222222224 );
	this.textx = this.x_percent_to_pixel( 0.7790677966101694 + this.centerxoffset );
	this.texty = this.y_percent_to_pixel( 0.030722222222222224 + this.centeryoffset );
	this.text = "Map";
}
CleanMenuButtonMap.prototype = extend(CleanMenuButton);

function CleanMenuButtonSave(game, state, display){
	CleanMenuButton.call( this, game, state, display );

	this.x = this.x_percent_to_pixel( 0.8834745762711864 );
	this.y = this.y_percent_to_pixel( 0.034722222222222224 );
	this.textx = this.x_percent_to_pixel( 0.8934745762711864 + this.centerxoffset );
	this.texty = this.y_percent_to_pixel( 0.030722222222222224 + this.centeryoffset );
	this.text = "Save";
}
CleanMenuButtonSave.prototype = extend(CleanMenuButton);

function CleanMenuButtonInventory(game, state, display){
	CleanMenuButton.call( this, game, state, display );

	this.x = this.x_percent_to_pixel( 0.7690677966101694 );
	this.y = this.y_percent_to_pixel( 0.22569444444444445 );
	this.textx = this.x_percent_to_pixel( 0.7790677966101694 + this.centerxoffset );
	this.texty = this.y_percent_to_pixel( 0.22169444444444445 + this.centeryoffset );
	this.text = "Inventory";
}
CleanMenuButtonInventory.prototype = extend(CleanMenuButton);

function CleanMenuButtonPickup(game, state, display){
	CleanMenuButton.call( this, game, state, display );

	this.x = this.x_percent_to_pixel( 0.8834745762711864 );
	this.y = this.y_percent_to_pixel( 0.22569444444444445 );
	this.textx = this.x_percent_to_pixel( 0.8934745762711864 + this.centerxoffset );
	this.texty = this.y_percent_to_pixel( 0.22169444444444445 + this.centeryoffset );
	this.text = "Pickup";
}
CleanMenuButtonPickup.prototype = extend(CleanMenuButton);

function CleanMenuButtonDark(game, state, display){
	CleanMenuButton.call( this, game, state, display );

	this.x = this.x_percent_to_pixel( 0.7690677966101694 );
	this.y = this.y_percent_to_pixel( 0.4131944444444444 );
	this.textx = this.x_percent_to_pixel( 0.7790677966101694 + this.centerxoffset );
	this.texty = this.y_percent_to_pixel( 0.4051944444444444 + this.centeryoffset );
	this.text = "Dark";
}
CleanMenuButtonDark.prototype = extend(CleanMenuButton);

function CleanMenuButtonLight(game, state, display){
	CleanMenuButton.call( this, game, state, display );

	this.x = this.x_percent_to_pixel( 0.8834745762711864 );
	this.y = this.y_percent_to_pixel( 0.4131944444444444 );
	this.textx = this.x_percent_to_pixel( 0.8934745762711864 + this.centerxoffset );
	this.texty = this.y_percent_to_pixel( 0.4051944444444444 + this.centeryoffset );
	this.text = "Light";
}
CleanMenuButtonLight.prototype = extend(CleanMenuButton);

})();