/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanDialogueOverlay = app.ui.overlays.CleanDialogueOverlay = 
	function(game, state, display){
	app.ui.CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 110 );
	this.y = this.to_y_ratio( 18  );
	this.w = this.to_x_ratio( 362 );
	this.h = this.to_y_ratio( 270 );
	this.color = this.NEUTRALCOLOR;
	this.transition = "menuslide";

	this.subelems = [];

	this.subelems.push(
		new app.ui.CleanMenuHeader( this.game, this.state, this.display ),
		new CleanDialoguePortraitPanel( this.game, this.state, this.display ),
		new CleanDialogueNamePanel( this.game, this.state, this.display ),
		new CleanDialogueTextPanel( this.game, this.state, this.display ),
		new CleanDialogueButtonPane( this.game, this.state, this.display )
	);

	this.store = this.state.uistore;
};
CleanDialogueOverlay.prototype = app.extend(app.ui.CleanUIElem);

CleanDialogueOverlay.prototype.draw = function(){
	if( this.store.menustate !== "dialogue" && 
		this.store.menus.animating && 
		this.store.prevstate === "dialogue" ){

		this.animate_out_pre( this.store.menus );
	} else if( this.store.menustate !== "dialogue" ){
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

	this.animate_post( this.store.menus );
};

CleanDialogueOverlay.prototype.propogate_click = function( x, y ){
	if( this.state.uistore.menustate !== "dialogue" ){
		return;
	}
	
	var val = false;
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		val = val || elem.propogate_click( x, y );
	}
	return val;
};

CleanDialogueOverlay.prototype.propogate_unclick = function( ){
	if( this.state.uistore.menustate !== "dialogue" ){
		return;
	}
	
	var val = false;
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		val = val || elem.propogate_unclick( );
	}
	return val;
};

function CleanDialogueNamePanel(game, state, display){
	app.ui.CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 110 );
	this.y = this.to_y_ratio( 20  );
	this.w = this.to_x_ratio( 240 );
	this.h = this.to_y_ratio( 34 );
	this.color = this.VERYDARKCOLOR;

	this.textx = this.x + this.w / 2;
	this.texty = this.y + this.h / 2;
	this.defaulttextsize = 14;
	this.font = this.FONT;
	this.textcolor = this.LIGHTTEXTCOLOR;
}

CleanDialogueNamePanel.prototype = app.extend(app.ui.CleanUIElem);

CleanDialogueNamePanel.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	this.display.draw_text_params( "Thaddeus Eldridge", this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

function CleanDialogueTextPanel(game, state, display){
	app.ui.CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 110 );
	this.y = this.to_y_ratio( 55  );
	this.w = this.to_x_ratio( 240 );
	this.h = this.to_y_ratio( 230 );
	this.color = this.LIGHTCOLOR;

	this.textx = this.x + this.w / 2;
	this.texty = this.y + this.h / 2;
	this.defaulttextsize = 14;
	this.font = this.FONT;
	this.textcolor = this.LIGHTTEXTCOLOR;
}

CleanDialogueTextPanel.prototype = app.extend(app.ui.CleanUIElem);

CleanDialogueTextPanel.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
};

function CleanDialoguePortraitPanel(game, state, display){
	app.ui.CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 350 );
	this.y = this.to_y_ratio( 20  );
	this.w = this.to_x_ratio( 120 );
	this.h = this.to_y_ratio( 120 );
	this.padding = 5;
	this.color = this.VERYDARKCOLOR;
	this.color2 = this.LIGHTCOLOR;

	this.textx = this.x + this.w / 2;
	this.texty = this.y + this.h / 2;
	this.defaulttextsize = 14;
	this.font = this.FONT;
	this.textcolor = this.LIGHTTEXTCOLOR;
}

CleanDialoguePortraitPanel.prototype = app.extend(app.ui.CleanUIElem);

CleanDialoguePortraitPanel.prototype.draw = function(){
	var p = this.padding;
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.display.draw_rect_sprite( 
		this.x+p, this.y+p, this.w-2*p, this.h-2*p, this.color2 
	);
};

function CleanDialogueButtonPane(game, state, display){
	app.ui.CleanUIElem.call( this, game, state, display );

	this.x = this.to_x_ratio( 354 );
	this.y = this.to_y_ratio( 143 );

	this.subelems = [
		new CleanDialogueButton( game, state, display, this, 0, "Record" ),
		new CleanDialogueButton( game, state, display, this, 1, "Name" ),
		new CleanDialogueButton( game, state, display, this, 2, "Job" ),
		new CleanDialogueButton( game, state, display, this, 3, "(Go Back)" ),
		new CleanDialogueButton( game, state, display, this, 4, "(Ask...)" )
	];
}

CleanDialogueButtonPane.prototype = app.extend(app.ui.CleanUIElem);

CleanDialogueButtonPane.prototype.draw = function(){
	for( var i in this.subelems ){
		this.subelems[i].draw();
	}
};

CleanDialogueButtonPane.prototype.propogate_click = function( x, y ){
	for( var i in this.subelems ){
		var elem = this.subelems[i];
		elem.propogate_click(x,y);
		if( elem.onclick &&
			this.contains( elem.x, elem.y, elem.w, elem.h, x, y ) ){

			elem.onclick();
		}
	}
};

function CleanDialogueButton(game, state, display, parent, index, text){
	app.ui.CleanUIElem.call( this, game, state, display );

	this.parent = parent;
	this.index = index;
	this.text = text;

	var padding = 5;
	this.h = this.to_y_ratio( 26 );
	this.w = this.to_x_ratio( 113 );
	this.x = parent.x;
	this.y = parent.y + this.index * this.to_y_ratio( 24 + padding );

	this.color = this.LIGHTCOLOR;

	this.textx = this.x + this.w / 2;
	this.texty = this.y + this.h / 2;
	this.defaulttextsize = 12;
	this.font = this.FONT;
	this.textcolor = this.VERYDARKCOLOR;
}

CleanDialogueButton.prototype = app.extend(app.ui.CleanUIElem);

CleanDialogueButton.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	this.display.draw_text_params( this.text, this.textx, this.texty, {
		color: this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

})();