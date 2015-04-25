/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var UIElement = app.ui.UIElement = function(
	x, y, sprite, name, display, world, worldState){
    app.world.actor.Actor.call(this, x, y, sprite, name, display, world);

	this.sub_elements = [];

	this.worldState = worldState;

    this.FLAG_remove = false;
    this.FLAG_isVisible = true;
};

UIElement.prototype = app.extend(app.world.actor.Actor); 

UIElement.prototype.click = function(){};

UIElement.prototype.remove = function(){
	this.FLAG_remove = true;
};

UIElement.prototype.hide = function(){
	this.FLAG_isVisible = false;
};

UIElement.prototype.show = function(){
	this.FLAG_isVisible = true;
};

UIElement.prototype.show_sub_element = function(name){
	for( var i in this.sub_elements ){
		if( this.sub_elements[i].name == name ){
			this.sub_elements[i].show();
		}
	}
};

UIElement.prototype.hide_sub_element = function(name){
	for( var i in this.sub_elements ){
		if( this.sub_elements[i].name == name ){
			this.sub_elements[i].hide();
		}
	}
};

UIElement.prototype.draw = function(){
	if( this.FLAG_isVisible === true ){
		this.display.draw_sprite(this.sprite, this.x, this.y);

		for( var i in this.sub_elements ){
			this.sub_elements[i].draw();
		}		
	}	
};

UIElement.prototype.act = function(){
	for( var i in this.sub_elements ){
		this.sub_elements[i].act();

		if( this.sub_elements[i].FLAG_remve === true ){
			this.sub_elements[i].splice(i, 1);
		}
	}
};

UIElement.prototype.contains = function(x, y){
	if( this.FLAG_isVisible === false ){
		return false;
	}

	if( this.display.sprites[this.sprite] === undefined ){
		return false;
	}

	var widx = this.display.sprites[this.sprite].w + this.x;
	var widy = this.display.sprites[this.sprite].h + this.y;

	if( x >= this.x && y >= this.y && x < widx && y < widy ){
		return true;
	} else {
		return false;
	}
};

UIElement.prototype.hover = function(){};

var Minimap = function(x, y, sprite, name, display, world, worldState){
	UIElement.call( this, x, y, sprite, name, display, world, worldState);

	//Doesnt work i deleted a bunch of code
	for( var i = 0; i < this.width; ++i){
		for( var j = 0; j < this.height; ++j ){
			this.set_pixel(this.imageData, i, j, 30, 40, 30, 255);
		}
	}

	this.FLAG_isVisible = true;
};

Minimap.prototype = app.extend(UIElement);

Minimap.prototype.change_map = function(){
	var img = this.display.images[this.sprite];
	var c = document.createElement('canvas');
	c.width = img.width;
	c.height = img.height;
	var ctx = c.getContext('2d');
	ctx.drawImage(img);
};

Minimap.prototype.set_pixel = function(imageData, x, y, r, g, b, a){
    var index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
};

Minimap.prototype.draw = function(){
	if( this.FLAG_isVisible ){
		//var wrat = Math.floor(this.width/this.world.mapw);
		//var hrat = Math.floor(this.height/this.world.maph);

		// for( var i in this.world.squares ){
		// 	var sq = this.world.squares[i];
		// 	if( sq.blocksMove || !sq.isExplored ){
		// 		for( var j = 0; j < wrat; j++ ){
		// 			for( var k = 0; k < hrat; k++ ){
		// 				this.set_pixel(this.imageData, sq.x*wrat+j, sq.y*hrat+k, 30, 40, 30, 255);
		// 			}
		// 		}
		// 	} else {
		// 		for( var j = 0; j < wrat; j++ ){
		// 			for( var k = 0; k < hrat; k++ ){
		// 				this.set_pixel(this.imageData, sq.x*wrat+j, sq.y*hrat+k, 100, 110, 100, 255);
		// 			}
		// 		}
		// 	}
		// } 

		for( var i = 0; i < this.width; i++ ){
			for( var j = 0; j < this.height; j++ ){
				var sq = this.world.get_square( Math.floor(app.normalize(i, 0, this.width, 0, this.world.mapw)),
												Math.floor(app.normalize(j, 0, this.height, 0, this.world.maph)) );

				if( sq === undefined ){
					console.log(Math.floor(app.normalize(i, 0, this.width, 0, this.world.mapw)),
												Math.floor(app.normalize(j, 0, this.height, 0, this.world.maph)) );
												continue; 
				}//console.log("GOT SQ, ", sq);

				if( !sq.isExplored ){
					this.set_pixel(this.imageData, i, j, 30, 40, 30, 255);
				} else {
					var spr = this.display.sprites[sq.sprite];
					this.set_pixel(this.imageData, i, j, spr.avg.r, spr.avg.g, spr.avg.b, 255);
				}

			}
		}	

		var me = this.world.get_character( this.world.active_char );
		var xme = me.x;
		var yme = me.y;

		var rcol = 255;
		var gcol = 0;
		var bcol = 0;
		for( var i in this.world.characters ){
			var act = this.world.characters[i];
			if( act.isDead ){
				continue;
			}

			var sq = this.world.get_square(act.x, act.y);
			if( !sq.isInSight){
				continue;
			}

			var dx = act.x - xme;
			var dy = act.y - yme;

			if( dx*dx + dy*dy > 80 ){
				continue;
			}

			if( act.allegiance == "enemy" ){
				rcol = 255; gcol = 0; bcol = 0;  
			} else {
				rcol = 255; gcol =255; bcol = 0;
			}

			var x = Math.floor(app.normalize(act.x, 0, this.world.mapw, 0, this.width));
			var y = Math.floor(app.normalize(act.y, 0, this.world.maph, 0, this.height));

			this.set_pixel(this.imageData, x+0, y+0, rcol, gcol, bcol, 255);
			this.set_pixel(this.imageData, x+1, y+0, rcol, gcol, bcol, 255);
			this.set_pixel(this.imageData, x-1, y+0, rcol, gcol, bcol, 255);
			this.set_pixel(this.imageData, x+0, y+1, rcol, gcol, bcol, 255);
			this.set_pixel(this.imageData, x+0, y-1, rcol, gcol, bcol, 255);
		}

		var act = this.world.get_character( this.world.active_char );
		var x = Math.floor(app.normalize(act.x, 0, this.world.mapw, 0, this.width));
		var y = Math.floor(app.normalize(act.y, 0, this.world.maph, 0, this.height));

		this.set_pixel(this.imageData, x+0, y+0, 0, 255, 0, 255);
		this.set_pixel(this.imageData, x+1, y+0, 0, 255, 0, 255);
		this.set_pixel(this.imageData, x-1, y+0, 0, 255, 0, 255);
		this.set_pixel(this.imageData, x+0, y+1, 0, 255, 0, 255);
		this.set_pixel(this.imageData, x+0, y-1, 0, 255, 0, 255);

		this.display.context.putImageData(this.imageData, this.x, this.y);
	}
};

})();