/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem;
var extend = app.extend;

var CleanPCListOverlay = app.ui.overlays.CleanPCListOverlay = 
	function(game, state, display){
	CleanUIElem.call( this, game, state, display );

	this.x = 0;
	this.y = 0;
	this.w = this.x_percent_to_pixel( 0.2330508474576271 );
	this.h = this.y_percent_to_pixel( 0.6458333333333334 );
	this.color = this.NEUTRALCOLOR;

	this.subelems = [];

	this.subelems.push( 
		new CleanPCListHead( this.game, this.state, this.display ),
		new CleanCharButtonList( this.game, this.state, this.display )
	);
};
CleanPCListOverlay.prototype = extend(CleanUIElem);

CleanPCListOverlay.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );

	for( var i in this.subelems ){
		this.subelems[i].draw();
	}
};

CleanPCListOverlay.prototype.propogate_click = function(x,y){
	for( var i in this.subelems ){
		this.subelems[i].propogate_click(x,y);
	}
};

function CleanCharButtonList(game, state, display){
	CleanUIElem.call( this, game, state, display );

	this.buttons = [];

	for( var i = 0; i < 6; i++ ){
		this.buttons.push( new CleanCharButton( game, state, display, i ) );
	} 
} 
CleanCharButtonList.prototype = extend(CleanUIElem);

CleanCharButtonList.prototype.draw = function(){
	for( var i in this.buttons ){
		this.buttons[i].draw();
	}
};

CleanCharButtonList.prototype.propogate_click = function(x, y){
	for( var i in this.buttons ){
		var b = this.buttons[ i ];
		if( this.contains( b.x, b.y, b.w, b.h, x, y ) ){
			b.onclick();
			break;
		}
	}
};

function CleanCharButton(game, state, display, index){
	CleanUIElem.call( this, game, state, display );

	this.index = index;
	this.actualh = this.y_percent_to_pixel( 0.09375 );

	this.w = this.x_percent_to_pixel( 0.2265762711864407 );
	this.h = this.y_percent_to_pixel( 0.09027777777777778 );
	this.x = this.x_percent_to_pixel( 0.00211864406779661 );
	this.y = this.y_percent_to_pixel( 0.06944444444444445 ) + index * this.actualh;

	this.color = this.LIGHTCOLOR;
	this.scolor = this.SELECTEDCOLOR;

	this.namelabel = new CleanCharButtonName( game, state, display, index, this.y );
	this.hpmplabel = new CleanCharButtonHPMP( game, state, display, index, this.y );
	this.effectlist = new CleanCharButtonStatusEffects( 
		game, state, display, index, this.y );
} 
CleanCharButton.prototype = extend(CleanUIElem);

CleanCharButton.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.index ];
	if( ch === undefined ){
		return;
	} 

	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, 
		this.state.uistore.pcselected === this.index ? this.scolor : this.color );
	this.namelabel.draw();
	this.hpmplabel.draw();
	this.effectlist.draw();

};

CleanCharButton.prototype.onclick = function(){
	var ch = this.state.player.get_pcs()[ this.index ];
	if( ch === undefined ){
		return;
	}
	this.state.uistore.pcselected = this.index;
};

function CleanCharButtonName(game, state, display, index, yoffset){
	CleanUIElem.call( this, game, state, display );

	this.index = index;
	this.yoffset = yoffset;

	this.x = this.x_percent_to_pixel( 0.006355932203389831 );
	this.y = this.yoffset;

	this.color = this.VERYDARKCOLOR;
	this.scolor = this.LIGHTTEXTCOLOR;
	this.defaulttextsize = 10;
	this.font = this.FONT;
} 
CleanCharButtonName.prototype = extend(CleanUIElem);

CleanCharButtonName.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.index ];
	if( ch === undefined ){
		return;
	}

	this.display.draw_text_params( ch.name, this.x, this.y, {
		color: this.state.uistore.pcselected === this.index ? this.scolor : this.color,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "left"
	});

};

function CleanCharButtonHPMP(game, state, display, index, yoffset){
	CleanUIElem.call( this, game, state, display );

	this.index = index;

	this.x = this.x_percent_to_pixel( 0.21127118644067796 );
	this.hpy = yoffset + this.y_percent_to_pixel( 0.02 );
	this.mpy = yoffset + this.y_percent_to_pixel( 0.07 );

	this.color = this.VERYDARKCOLOR;
	this.scolor = this.LIGHTTEXTCOLOR;
	this.defaulttextsize = 10;
	this.font = this.FONT;
} 
CleanCharButtonHPMP.prototype = extend(CleanUIElem);

CleanCharButtonHPMP.prototype.draw = function(){
	var ch = this.state.player.get_pcs()[ this.index ];
	if( ch === undefined ){
		return;
	}

	this.display.draw_text_params( ch.stats.curr_hp, this.x, this.hpy, {
		color: this.state.uistore.pcselected === this.index ? this.scolor : this.color,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
	this.display.draw_text_params( ch.stats.curr_mp, this.x, this.mpy, {
		color: this.state.uistore.pcselected === this.index ? this.scolor : this.color,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

function CleanCharButtonStatusEffects(game, state, display){
	CleanUIElem.call( this, game, state, display );
}
CleanCharButtonStatusEffects.prototype = extend(CleanUIElem);

function CleanPCListHead( game, state, display ){
	CleanUIElem.call( this, game, state, display );
	this.x = 0;
	this.y = 0;
	this.w = this.x_percent_to_pixel( 0.2330508474576271 );
	this.h = this.y_percent_to_pixel( 0.0625 );
	this.color = this.VERYDARKCOLOR;

	this.statusbutton = new CleanPCListHeadStatusButton( game, state, display );
	this.hpmplabel = new CleanPCListHeadHPMPLabel( game, state, display );
} 
CleanPCListHead.prototype = extend(CleanUIElem);

CleanPCListHead.prototype.draw = function(){
	this.display.draw_rect_sprite( this.x, this.y, this.w, this.h, this.color );
	this.statusbutton.draw();
	this.hpmplabel.draw();
};

CleanPCListHead.prototype.propogate_click = function(x, y){
	var b = this.statusbutton;
	if( this.contains( b.x, b.y, b.w, b.h, x, y ) ){
		b.onclick();
	}
};

function CleanPCListHeadStatusButton(game, state, display){
	CleanUIElem.call( this, game, state, display );

	this.x = this.x_percent_to_pixel( 0.00423728813559322 );
	this.y = this.y_percent_to_pixel( 0.003472222222222222 );
	this.w = this.x_percent_to_pixel( 0.1059322033898305 );
	this.h = this.y_percent_to_pixel( 0.052083333333333336 );
	this.color = this.LIGHTCOLOR;
	this.scolor = this.SELECTEDCOLOR;

	this.textx = this.x_percent_to_pixel( 0.064203389830508475 );
	this.texty = this.y_percent_to_pixel( 0.02819444444444445 );
	this.textcolor = this.VERYDARKCOLOR;
	this.stextcolor = this.LIGHTTEXTCOLOR;
	this.defaulttextsize = 10;
	this.font = this.FONT;
} 
CleanPCListHeadStatusButton.prototype = extend(CleanUIElem);

CleanPCListHeadStatusButton.prototype.draw = function(){
	var selected = (this.state.uistore.menustate === "status");
	this.display.draw_rect_sprite( 
		this.x, this.y, this.w, this.h, selected ? this.scolor : this.color
	);

	this.display.draw_text_params( "Status", this.textx, this.texty, {
		color: selected ? this.stextcolor : this.textcolor,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

CleanPCListHeadStatusButton.prototype.onclick = function(){
	if( (this.state.uistore.menustate !== "status") ){
		this.state.inter.show_menu("status");
	} else {
		this.state.inter.hide_menu();
	}
};

function CleanPCListHeadHPMPLabel(game, state, display){
	CleanUIElem.call( this, game, state, display );

	this.defaulttextsize = 10;
	this.color = this.LIGHTCOLOR;
	this.font = this.FONT;
	this.hpx = this.x_percent_to_pixel( 0.21127118644067796 );
	this.hpy = this.y_percent_to_pixel( 0.014305555555555556 );
	this.mpx = this.x_percent_to_pixel( 0.21127118644067796 );
	this.mpy = this.y_percent_to_pixel( 0.04555555555555555 );
} 
CleanPCListHeadHPMPLabel.prototype = extend(CleanUIElem); 

CleanPCListHeadHPMPLabel.prototype.draw = function(){
	this.display.draw_text_params( "HP", this.hpx, this.hpy, {
		color: this.color,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
	this.display.draw_text_params( "MP", this.mpx, this.mpy, {
		color: this.color,
		font: this.font,
		size: this.get_font_size( this.defaulttextsize ),
		align: "center"
	});
};

})();