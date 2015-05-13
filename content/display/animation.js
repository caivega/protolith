/* jshint browser: true */
/* global app */

(function(){
"use strict";

app.display.definitions = {};

var Animation = app.display.Animation = function(definition){
    this.display = definition.display;
    this.definition = definition;

    this.frame = 0;
};

Animation.prototype.draw = function(x, y){
	var reference = this.definition.frameref[ this.frame ];

	this.display.draw_sprite_scaled( 
		reference.spritename, x + reference.xoffset, y + reference.yoffset,
		this.definition.xsize + reference.xscaleoffset, 
		this.definition.ysize + reference.yscaleoffset
	);

	this.frame++;
	if( this.frame >= this.definition.numframes ){
		if( this.definition.loop ){
			this.frame = 0;
		} else {
			this.frame = this.definition.numframes-1;
		}
	}
};

Animation.prototype.draw_spritelist = function(names, x, y){
	var reference = this.definition.frameref[ this.frame ];
	var name = names[Math.floor(
		app.normalize(
			this.frame, 0, this.definition.numframes, 0, names.length 
		)
	)];

	this.display.draw_sprite_scaled( 
		name, x + reference.xoffset, y + reference.yoffset,
		this.definition.xsize + reference.xscaleoffset, 
		this.definition.ysize + reference.yscaleoffset
	);

	this.frame++;
	if( this.frame >= this.definition.numframes ){
		if( this.definition.loop ){
			this.frame = 0;
		} else {
			this.frame = this.definition.numframes-1;
		}
	}
};

var AnimationDefinition = app.display.AnimationDefinition = function(display){
    this.display = display;

    this.xsize = 0;
    this.ysize = 0;

    this.loop = true;
    this.frame = 0;
    this.numframes = 0;

    this.frameref = [];
    this.sprites = [];

    this.name = "default";

    this.recalculate_scale();
};

AnimationDefinition.prototype.load = function(){};
AnimationDefinition.prototype.init = function(){
	this.sprites = [{
		spritename: "port_exclaim",
		numframes: 1
	}];
};

AnimationDefinition.prototype.recalculate_scale = function(){
	if( app.ui && app.ui.CleanUIElem ){
		this.xsize = app.ui.CleanUIElem.prototype.to_x_ratio.call( this, 28 );
		this.ysize = app.ui.CleanUIElem.prototype.to_y_ratio.call( this, 32 );
	}
	this.init();
};

AnimationDefinition.prototype.build_frameref = function(){
	var _frameref = [];
	var numframes = 0;
	for( var i in this.sprites ){
		var spriteobj = this.sprites[i];
		var displacements = spriteobj.displacements || [];
		var scaleoffsets = spriteobj.scaleoffsets || [];

		for( var j = 0; j < spriteobj.numframes; j++ ){
			numframes++;
			var displacement = displacements[ j ];
			var scaleoffset = scaleoffsets[ j ];
			_frameref.push({
				spritename: spriteobj.spritename,
				xoffset: displacement ? displacement.x : 0,
				yoffset: displacement ? displacement.y : 0,
				xscaleoffset: scaleoffset ? scaleoffset.x : 0,
				yscaleoffset: scaleoffset ? scaleoffset.y : 0
			});
		}
	}

	this.numframes = numframes;
	this.frameref = _frameref;
};

})();