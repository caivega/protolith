/* jshint browser: true */
/* global app */

(function(){
"use strict";

var _gnf = function(n, display){
	return display.get_normalized_frames( n );
};

var TestAnimation = app.display.definitions.TestAnimation = function(display){
	app.display.AnimationDefinition.call( this, display );
	this.name = "TestAnimation";
};

TestAnimation.prototype = new app.extend(app.display.AnimationDefinition);

TestAnimation.prototype.load = function(){
	var name = this.name;
	var sheetname = "testcharacters";
	this.display.load_spritesheet(sheetname,"display/images/characters/test.png");
	this.display.load_sprite_from_spritesheet(name+"_dl","testcharacters", 4, 0, 38, 42);
	this.display.load_sprite_from_spritesheet(name+"_d","testcharacters", 5, 0, 38, 42);
	this.display.load_sprite_from_spritesheet(name+"_dr","testcharacters", 6, 0, 38, 42);
	this.display.load_sprite_from_spritesheet(name+"_r","testcharacters", 7, 0, 38, 42);
	this.display.load_sprite_from_spritesheet(name+"_ur","testcharacters", 0, 1, 38, 42);
	this.display.load_sprite_from_spritesheet(name+"_u","testcharacters", 1, 1, 38, 42);
	this.display.load_sprite_from_spritesheet(name+"_ul","testcharacters", 2, 1, 38, 42);
	this.display.load_sprite_from_spritesheet(name+"_l","testcharacters", 3, 1, 38, 42);
	this.init();
};

TestAnimation.prototype.init = function(){
	var postfixes = ["d", "dl", "l", "ul", "u", "ur", "r", "dr"];
	this.sprites = [];
	var framespeed = 4;
	this.sprites = postfixes.map(function( postfix, ind ){
		var baseframes = ind%2 === 1 ? framespeed*4 : framespeed;
		return {
			spritename: this.name + "_" + postfix,
			numframes: _gnf( baseframes, this.display )  
		};
	}.bind(this));

	this.build_frameref();
};

var TestAnimation2 = app.display.definitions.TestAnimation2 = function(display){
	app.display.AnimationDefinition.call( this, display );
	this.name = "TestAnimation2";
};

TestAnimation2.prototype = new app.extend(app.display.AnimationDefinition);

TestAnimation2.prototype.load = function(){
	var name = this.name;
	var sheetname = "testcharacters2";
	this.display.load_spritesheet(sheetname,"display/images/characters/test2.png");
	var x = 5;
	var y = 1;
	for( var i = 0; i < 8; i++ ){
		this.display.load_sprite_from_spritesheet(
			name+"_r_run_"+i,"testcharacters2", x, y, 38, 42
		);
		x++;
		if( x % 8 === 0 ){
			y++;
			x = 0;
		}
	}

	this.init();
};

TestAnimation2.prototype.init = function(){
	this.sprites = [];
	var framespeed = 6;
	for( var i = 0; i < 8; i++ ){
		this.sprites.push({
			spritename: this.name+"_r_run_"+i,
			numframes: _gnf( framespeed, this.display )  
		});
	}

	this.build_frameref();
};

})();