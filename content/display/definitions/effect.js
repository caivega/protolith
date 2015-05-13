/* jshint browser: true */
/* global app */

(function(){
"use strict";

var _gnf = function(n, display){
	return display.get_normalized_frames( n );
};

var FireExplosion = app.display.definitions.FireExplosion = function(display){
	app.display.AnimationDefinition.call( this, display );
	this.name = "FireExplosion";
	
	this.loop = false;
};

FireExplosion.prototype = new app.extend(app.display.AnimationDefinition);

FireExplosion.prototype.load = function(){
	var name = this.name;
	var sheetname = "spells1";

	var x = 0; var y = 0; var w = 28; var h = 32;
    this.display.load_sprite_from_spritesheet(name+"0", sheetname, x, y, w, h);
    for( var i = 0; i < 9; i++){
        this.display.load_sprite_from_spritesheet(name+i, sheetname, x+i, y, w, h);
    }
	this.init();
};

FireExplosion.prototype.init = function(){
	this.sprites = [];
	var framespeed = 4;
    for( var i = 0; i < 10; i++){
    	this.sprites.push({
			spritename: this.name + i,
			numframes: _gnf( framespeed, this.display )  
		});
    }
	this.build_frameref();
};

var IceExplosion = app.display.definitions.IceExplosion = function(display){
	app.display.AnimationDefinition.call( this, display );
	this.name = "IceExplosion";
	
	this.loop = false;
};

IceExplosion.prototype = new app.extend(app.display.AnimationDefinition);

IceExplosion.prototype.load = function(){
	var name = this.name;
	var sheetname = "spells1";

	var x = 0; var y = 1; var w = 28; var h = 32;
    this.display.load_sprite_from_spritesheet(name+"0", sheetname, x, y, w, h);
    for( var i = 0; i < 9; i++){
        this.display.load_sprite_from_spritesheet(name+i, sheetname, x+i, y, w, h);
    }

	this.init();
};

IceExplosion.prototype.init = function(){
	this.sprites = [];
	var framespeed = 4;
    for( var i = 0; i < 10; i++){
    	this.sprites.push({
			spritename: this.name + i,
			numframes: _gnf( framespeed, this.display )  
		});
    }
	this.build_frameref();
};

var MagExplosion = app.display.definitions.MagExplosion = function(display){
	app.display.AnimationDefinition.call( this, display );
	this.name = "MagExplosion";
	
	this.loop = false;
};

MagExplosion.prototype = new app.extend(app.display.AnimationDefinition);

MagExplosion.prototype.load = function(){
	var name = this.name;
	var sheetname = "spells1";

	var x = 0; var y = 2; var w = 28; var h = 32;
    this.display.load_sprite_from_spritesheet(name+"0", sheetname, x, y, w, h);
    for( var i = 0; i < 9; i++){
        this.display.load_sprite_from_spritesheet(name+i, sheetname, x+i, y, w, h);
    }
	this.init();
};

MagExplosion.prototype.init = function(){
	this.sprites = [];
	var framespeed = 4;
    for( var i = 0; i < 10; i++){
    	this.sprites.push({
			spritename: this.name + i,
			numframes: _gnf( framespeed, this.display )  
		});
    }
	this.build_frameref();
};

var StaticDamageIndication = 
	app.display.definitions.StaticDamageIndication = function(display){

	app.display.AnimationDefinition.call( this, display );
	this.name = "StaticDamageIndication";
	this.loop = false;
};

StaticDamageIndication.prototype = new app.extend(app.display.AnimationDefinition);

StaticDamageIndication.prototype.load = function(){
    this.display.load_spritesheet("damages","display/images/damaged.png");
    this.display.load_sprite_from_spritesheet("physd","damages", 0, 0, 28, 32);
    this.display.load_sprite_from_spritesheet("ranged","damages", 1, 0, 28, 32);
    this.display.load_sprite_from_spritesheet("poisond","damages", 2, 0, 28, 32);
    this.display.load_sprite_from_spritesheet("chaind","damages", 3, 0, 28, 32);
    this.display.load_sprite_from_spritesheet("fired","damages", 4, 0, 28, 32);
    this.display.load_sprite_from_spritesheet("death0","damages", 5, 0, 28, 32);
    this.display.load_sprite_from_spritesheet("death1","damages", 6, 0, 28, 32);
    this.display.load_sprite_from_spritesheet("death2","damages", 7, 0, 28, 32);
    this.display.load_sprite_from_spritesheet("death3","damages", 8, 0, 28, 32);
    this.display.load_sprite_from_spritesheet("blessd","damages", 9, 0, 28, 32);
    this.display.load_sprite_from_spritesheet("iced","damages", 10, 0, 28, 32);
};

StaticDamageIndication.prototype.init = function(){
	this.sprites = [];
	var framespeed = 2;
    for( var i = 0; i < 20; i++){
    	this.sprites.push({
			spritename: "physd",
			numframes: _gnf( framespeed, this.display )  
		});
    }
	this.build_frameref();
};

})();