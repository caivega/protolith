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

	this.subelems = [];

	this.subelems.push(
		new app.ui.CleanMenuHeader( this.game, this.state, this.display )
	);

	this.store = this.state.uistore;
};
CleanDialogueOverlay.prototype = app.extend(app.ui.CleanUIElem);

CleanDialogueOverlay.prototype.draw = function(){
	if( this.store.menustate !== "dialogue" && 
		this.store.animating && 
		this.store.prevstate === "dialogue" ){

		this.animate_out_pre( this.store );
	} else if( this.store.menustate !== "dialogue" ){
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

})();