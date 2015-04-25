/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var Tile = app.world.actor.Tile = function(x, y, spr, name, display, world){
	app.world.actor.Actor.call(this, x, y, spr, name, display, world);

	this.isPassable = true;
	this.blocksMove = false;
	this.blocksSight = false;
	this.isExplored = false;
	this.isInSight = false;
	this.actor = "none";

	this.tsqx = 9;
	this.tsqy = 9;

	this.id = parseInt(this.sprite.substring(5, this.sprite.length));

	this.contents = [];

	this.determine_passability();
	this.determine_sightlines();
};

Tile.prototype = new app.extend(app.world.actor.Actor);

Tile.prototype.determine_passability = function(){
	this.ispassable = true;
	if( app.inArr(parseInt(this.name), this.world.unpassable_tile_ids) ){
		this.isPassable = false;
		this.blocksMove = true;
	} else {
		this.isPassable = true;
		this.blocksMove = false;
	}
};

Tile.prototype.is_closed_door = function(){
	var doors = [26,32,41];
	var id = parseInt(this.sprite.substring(5, this.sprite.length));

	for( var i in doors ){
		if( id == doors[i] ){
			return true;
		}
	}

	return false;
};

Tile.prototype.open_door = function(){
	this.id = this.id + 1;
	this.sprite = "tile_"+this.id;
	this.isPassable = true;
	this.blocksSight = false;
	this.world.soundCache.play_sound( "dooropen" );
};

Tile.prototype.close_door = function(){
	this.id = this.id - 1;
	this.sprite = "tile_"+this.id;
	this.isPassable = false;
	this.blocksSight = true;
	this.world.soundCache.play_sound( "doorclose" );
};

Tile.prototype.determine_sightlines = function(){
	if( app.inArr(parseInt(this.name), this.world.sightblocking_tile_ids) ){
		this.blocksSight = true;
	} else {
		this.blocksSight = false;
	}
};

Tile.prototype.draw = function(){
	if( this.is_on_screen() ){
		app.world.actor.Actor.prototype.draw.call(this);
	}
};

Tile.prototype.draw_contents = function(){
	for( var i in this.contents ){
		var item = this.world.itemCache.get_item(
			this.contents[i].substring( 0, this.contents[i].search("_") ));
		if( item !== "none" ){
			this.display.draw_sprite_scaled_centered( item.sprite, 
				this.world.grid_to_pixw( this.x )+this.world.gridw/2, 
				this.world.grid_to_pixh( this.y )+this.world.gridh/2,
				this.world.gridw * (14/28),
				this.world.gridh * (14/32)
			);
		}
	}
};

Tile.prototype.add_item = function(itemname){
	if( itemname.search("_") > -1 ){
		this.add_content( itemname );
	} else {
		itemname = itemname + "_" + app.random_id( 10 );
		this.add_content( itemname );
	}
};

Tile.prototype.add_content = function(thing){
	this.contents.push(thing);
};

Tile.prototype.remove_content = function(name){
	for( var i in this.contents ){
		if( typeof this.contents[i] === "string" ){
			if( name === this.contents[i]){
				this.contents.splice(i, 1);
				return;
			}
		} else {
			if( name === this.contents[i].name ){
				this.contents.splice(i, 1);
				return;					
			}
		}
	}

	console.log(
		"ERROR! Tried to remove contents from a tile that did not exist.", 
		this.x, this.y, name
	);
};

Tile.prototype.get_contents = function(){
	return this.contents;
};

Tile.prototype.empty_contents = function(){
	this.contents = [];
};

Tile.prototype.has_character = function( ){
	var name;
	for( var i in this.contents ){
		name = this.contents[i];
		if( this.world.get_character_ind( name ) > -1 ){
			return name;
		}
	}

	return "none";
};

Tile.prototype.has_enemy_character = function( actor_name ){
	var actor = this.world.get_character(actor_name);
	var person = this.has_character();
	var act = this.world.get_character(person);
	if( person != "none" && !act.isDead ){
		if( act.allegiance != actor.allegiance ){
			return act.name;
		} else {
			return "blocked!";
		}
	}

	return "none";	
};

Tile.prototype.has_ally_character = function( name ){
    var victim = "";
    for( var i in this.contents ){
        var aName = this.contents[i];
        var aInd = this.world.get_character_ind(aName);
        if( aInd > -1 ){
            var char_alleg = this.world.get_character(aName).allegiance;
            var me_alleg = this.world.get_character(name).allegiance;
            if( char_alleg == me_alleg){
                victim = aName;
            } else {                    
                victim = "blocked!";
            }           
        }
    }

    return victim;  
};

})();