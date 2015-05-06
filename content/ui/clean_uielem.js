/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CleanUIElem = app.ui.CleanUIElem = function(game,state,display){
	this.game = game;
	this.state = state;
	this.display = display;

    this.NEUTRALCOLOR = CleanUIElem.prototype.NEUTRALCOLOR;
    this.VERYDARKCOLOR = CleanUIElem.prototype.VERYDARKCOLOR;
    this.DARKCOLOR = CleanUIElem.prototype.DARKCOLOR;
    this.SELECTEDCOLOR = CleanUIElem.prototype.SELECTEDCOLOR;
    this.LIGHTTEXTCOLOR = CleanUIElem.prototype.LIGHTTEXTCOLOR;
    this.LIGHTCOLOR = CleanUIElem.prototype.LIGHTCOLOR;

    this.FONT = "monospace";
    this.ERRORSPRITE = "port_exclaim";

    this.transition = "fade";
    this.frame = 0;
    this.animframes = 20;
};

CleanUIElem.prototype.light = [
	[ "Heal", "1", "2", "3", "4", "5", "6" ],
	[ "7", "8", "9", "10", "11", "12", "13" ],
	[ "14", "15", "16", "17", "18", "19", "20" ],
	[ "21", "22", "23", "24", "25", "26", "27" ],
	[ "28", "29", "30", "31", "32", "33", "34" ],
	[ "35", "36", "37", "38", "39", "40", "41" ],
	[ "42", "43", "44", "45", "46", "47", "48" ],
];

CleanUIElem.prototype.dark = [
	[ "Gash", "1", "2", "3", "4", "5", "6" ],
	[ "7", "8", "9", "10", "11", "12", "13" ],
	[ "14", "15", "16", "17", "18", "19", "20" ],
	[ "21", "22", "23", "24", "25", "26", "27" ],
	[ "28", "29", "30", "31", "32", "33", "34" ],
	[ "35", "36", "37", "38", "39", "40", "41" ],
	[ "42", "43", "44", "45", "46", "47", "48" ],
];

CleanUIElem.prototype.NEUTRALCOLOR = "#C49655";
CleanUIElem.prototype.VERYDARKCOLOR = "#412E1D";
CleanUIElem.prototype.DARKCOLOR = "#7A532B";
CleanUIElem.prototype.SELECTEDCOLOR = "#7F0000";
CleanUIElem.prototype.LIGHTTEXTCOLOR = "white";
CleanUIElem.prototype.LIGHTCOLOR = "#EFCE99";
CleanUIElem.prototype.ALTERNATECOLOR = "#00137F";

CleanUIElem.prototype.stats = [
	"POW", "ACC", "FOR", "CON", "RES", "SPD", "EVA"
];
CleanUIElem.prototype.equips = [
	"Head", "Body", "RHand", "LHand", "Arms", "Legs", "Feet"
];

CleanUIElem.prototype.draw = function(){};
CleanUIElem.prototype.to_x_ratio = function( x ){
	return CleanUIElem.prototype.x_percent_to_pixel.call( this, x / 472 );
};
CleanUIElem.prototype.to_y_ratio = function( y ){
	return CleanUIElem.prototype.y_percent_to_pixel.call( this, y / 288 );
};
CleanUIElem.prototype.x_percent_to_pixel = function( xpercentage ){
	return Math.round( xpercentage * this.display.dimx );
};
CleanUIElem.prototype.y_percent_to_pixel = function( ypercentage ){
	return Math.round( ypercentage * this.display.dimy );
};
CleanUIElem.prototype.get_font_size = function( originalfontsize ){
	return Math.round( this.display.dimx * (originalfontsize/472) );
};
CleanUIElem.prototype.contains = function( rx, ry, rw, rh, x, y ){
	return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
};
CleanUIElem.prototype.propogate_click = function(){};
CleanUIElem.prototype.propogate_unclick = function(){};

CleanUIElem.prototype.animate_in_pre = function(checkthis){
	if( checkthis.beginanimation ){
		this.frame = 0;
		checkthis.beginanimation = false;
	}

	if( checkthis.animating ){
		if( this.transition === "fade" ){
			var alpha = app.normalize( this.frame, 0, this.animframes, 0, 1);
			this.display.context.globalAlpha = alpha;
		} else if( this.transition === "menuslide" ){
			var max = (this.state.world.width + this.display.right);
			var xoffset = max - app.normalize( 
				this.frame, 
				0, this.animframes, 
				0, max
			);
			this.display.context.translate( xoffset, 0 );
		}
	}
};

CleanUIElem.prototype.animate_out_pre = function(checkthis){
	if( checkthis.beginanimation ){
		this.frame = 0;
		checkthis.beginanimation = false;
	}

	if( checkthis.animating ){
		if( this.transition === "fade" ){
			var alpha = app.normalize( this.frame, 0, this.animframes, 0, 1);
			this.display.context.globalAlpha = 1 - alpha;
		} else if( this.transition === "menuslide" ){
			var max = (this.state.world.width + this.display.right);
			var xoffset = app.normalize( 
				this.frame, 
				0, this.animframes, 
				0, max
			);
			this.display.context.translate( xoffset, 0 );
		}
	}
};
CleanUIElem.prototype.animate_post = function(checkthis){
	if( checkthis.animating ){

		if( this.transition === "fade" ){
			this.display.context.globalAlpha = 1.0;
		} else if( this.transition === "menuslide" ){
			this.display.context.setTransform(1, 0, 0, 1, 0, 0);
		}

		this.frame++;
		if( this.frame === this.animframes ){
			checkthis.animating = false;
			this.frame = 0;
		}
	}
};

})();