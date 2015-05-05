/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var World = app.world.World = function(display, params){
	this.display = display;
	this.ai = new app.world.AI(this);
    this.params = params;
    this.itemCache = "none";

    console.log("New World", params);

    //need this for hp calculations
    this.engine = new app.world.CombatEngine(this, null, null); 

    this.name = params.name;

	this.grid_size = 0;
	this.tilew = 28;
	this.tileh = 32;
	this.gridw = 28;
	this.gridh = 32;
	this.pixw = this.gridw*9;
	this.pixh = this.gridh*9;

	this.left = 100;
	this.top = 0;
	this.width = 288;
	this.height = 252;
	this.tiledimx = 28;
	this.tiledimy = 32;

	this.redraw = false;
	this.isBeingDrawn = false;
    this.forceDoubleDraw = false;

	this.unpassable_tile_ids = [
		9,13,14,15,25,26,31,32,36,37,38,39,40,41,43,45,46,47,48,49,50,51,52,53,54,55,56,
		57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,79,80,81,82,83,84,91,92,
		93,98,100,101,102,103,104,105,106,107,108,109,110,111
	];
	this.sightblocking_tile_ids = [
		9,13,14,15,25,26,31,32,37,38,39,40,41,46,47,48,62,63,64,65,66,67,68,69,70,71,72,
		73,74,75,76,91,92,98,100,101,102,103,104,105,106,107,108,109,110,111
	];

	//camera and camera animation variables
	this.cam_is_moving = false;
    this.camX = 0;
    this.camY = 0;
    this.newCamX = 0;
    this.newCamY = 0;
    this.oldCamX = 0;
    this.oldCamY = 0;
    this.max_cam_move_frames = 14;
    this.cam_move_frame = 0;

    this.facing_dir = "n";

    this.diff_table = [];

    this.active_char = "none";
	this.loader = new app.world.WorldLoader( this );

    this.prev_node_x_click = 0;
    this.prev_node_y_click = 0;
    this.prev_node_list = [];
};

/**
	Loads in the current game state based on params
	state - the worldState object passed by reference to create special nodes
*/
World.prototype.init = function(state){
	this.player = state.player;
	this.soundCache = state.game.soundCache;
	this.itemCache = new app.world.ItemCache(this, state);

    this.name = this.params.name;
	this.mapw = this.params.width;
	this.maph = this.params.height;
	this.pc_list = this.player.get_pcs();

	this.sm = new app.world.SpellManager(this, state);

	//lists of actors
	this.characters = [];
	this.tiles = [];
	this.overlays = [];
	this.projectiles = [];
	this.splashes = [];
	this.particles = [];
	this.nodes = [];

	//Entity Lists
    this.uiElems = [];
	this.ui_pcs = [];
    this.dead_pcs = [];	
	this.tiles = [];
	this.characters = [];

	this.once_loaded_queue = [];

	this.call_after_animation = function(func, args){
	    state.disableInput = true;
	    if( this.particles.length === 0 && 
	    	this.projectiles.length === 0 && 
	    	this.splashes.length === 0 ){
	        func(args);
	        state.disableInput = false;
	    } else {
	        setTimeout(function(){
	            this.call_after_animation(func,args);
	        }.bind(this),100);
	    }
	}.bind(this);

	this.loader.add_tiles(state);
	this.loader.add_items(state);
	this.loader.add_characters(state);
	this.loader.add_nodes(state);

	var act = this.player.get_first();
    if( act != "none!" ){
	    this.set_camera( act.x-4, act.y-4, false );
		this.active_char = act.name;
	}
};

World.prototype.recalculate_dims = function(){
	this.left = this.display.left = 
		app.ui.CleanUIElem.prototype.to_x_ratio.call( this, 110 );
	this.top = 0;
	this.width = app.ui.CleanUIElem.prototype.to_x_ratio.call( this, 252 );
	this.height = app.ui. CleanUIElem.prototype.to_x_ratio.call( this, 288 );
	this.bottom = this.top + this.height;
	this.right = this.left + this.width;
	this.gridw = app.ui.CleanUIElem.prototype.to_x_ratio.call( this, 28 );
	this.gridh = app.ui.CleanUIElem.prototype.to_y_ratio.call( this, 32 );
};

World.prototype.fix_actor_name = function(name){
	var nindex;
	var tmp_name = name;
	if( (nindex = tmp_name.search("_")) > -1 ){
		tmp_name = tmp_name.substring(0, nindex);
	}
	return tmp_name;
};

World.prototype.draw = function(){
    if( this.cam_is_moving ){
    	this.animate_camera();
    }

    this.draw_sightlines();

    //Dead Characters
    for( var i in this.characters ){
    	var act = this.characters[i];
    	var sq = this.get_tile(act.x, act.y);
    	if( !act.isAlive && (sq.isInSight) && !act.isSuperDead  ){
    		act.draw();
    	}
    }

    //Items on tiles
    for( var i in this.tiles ){  
    	if( this.tiles[i].isInSight ){
        	this.tiles[i].draw_contents();
        }
    }  

    //NPCS 
    for( var i in this.characters ){
    	var act = this.characters[i];
		var sq = this.get_tile(act.x, act.y);
    	if( (!act.isAlive || (!sq.isInSight && act.isNPC)) && !act.isSuperDead ){
    		continue;
    	}
    	if( act.isNPC ){
    		act.draw();
    	}
    } 

    //PCS
    var pcs = this.player.get_chars_visual();
    for( var i in pcs ){
    	pcs[i].draw();
    }

    //Overlays
    for( var i in this.overlays ){
        this.overlays[i].draw();
    }   

    //Particles
    var toremove = [];
    for( var i = 0; i < this.particles.length; i++ ){
    	this.particles[i].act();
        this.particles[i].draw();
        if( this.particles[i].FLAG_remove ){
            toremove.push( i );
        } 
        this.redraw = true;       
    }
    var nspliced = 0;
    for( var i in toremove ){
    	this.particles.splice( toremove[i]-nspliced, 1 );
    	nspliced++;
    }

    //Projectiles
    var toremove = [];
    for( var i = 0; i < this.projectiles.length; i++ ){
        this.projectiles[i].draw();
        if( this.projectiles[i].FLAG_remove ){
            toremove.push( i );
        }
        this.redraw = true;
    }
    var nspliced = 0;
    for( var i in toremove ){
    	this.projectiles.splice( toremove[i]-nspliced, 1 );
    	nspliced++;
    }
};

World.prototype.determine_visibility = function(x0, y0, x1, y1, checkstr){
	if( x0 == x1 && y0 == y1){
		return true;
	}

	var dx = x1-x0;
	var dy = y1-y0;

	//If the target is too far away why even bother checking for it.
	//Not everybody has Perrin's eyesight
	if( dx*dx + dy*dy > 80 ){
		return false;
	}

	if( Math.abs( dx ) <= 1 && Math.abs( dy ) <= 1 ){
		return true;
	}

	var sx = 0;
	var sy = 0;

	if(dx !== 0 ){
		sx =  dx / Math.abs(dx);
	}
	if(dy !== 0 ){
		sy =  dy / Math.abs(dy);
	}	

	if(x0 === x1){
		var isTransparent = null;
		try{
			isTransparent = !this.get_tile(x0,y0+sy)[checkstr];
		}catch(e){
			console.log("ERROR, tried to get nonexisant square",x0,y0+sy );
		}	

		if( isTransparent && this.determine_visibility(x0, y0+sy, x1, y1, checkstr) ){
			return true;
		} else{
			return false;
		}
	}

	if(y0 == y1){
		var isTransparent = null;
		try{
			isTransparent = !this.get_tile(x0+sx,y0)[checkstr];
		}catch(e){
			console.log("ERROR, tried to get nonexisant square",x0+sx,y0 );
		}

		if( isTransparent && this.determine_visibility(x0+sx, y0, x1, y1, checkstr) ){
			return true;
		} else{
			return false;
		}
	}

	if( Math.abs(dx) == Math.abs(dy) ){
		var isTransparent = null;
		try{
			isTransparent  = !this.get_tile(x0+sx,y0+sy)[checkstr];
		}catch(e){
			console.log("ERROR, tried to get nonexisant square",x0+sx,y0+sy);
		}

		if( isTransparent && this.determine_visibility(x0+sx, y0+sy, x1, y1, checkstr) ){
			return true;
		} else{
			return false;
		}
	}

	var sq1 = null;
	try{
		var sq1 = !this.get_tile(x0+sx,y0+sy)[checkstr];
	}catch(e){
		console.log("ERROR, tried to get nonexisant square",x0,y0);
	}

	var sq2 = !this.get_tile(x0+sx,y0)[checkstr];
	var sq3 = !this.get_tile(x0,y0+sy)[checkstr];

	if( ( sq1 && this.determine_visibility(x0+sx, y0+sy, x1, y1, checkstr) ) ||
	    ( sq2 && this.determine_visibility(x0+sx, y0, x1, y1, checkstr) ) || 
	    ( sq3 && this.determine_visibility(x0, y0+sy, x1, y1, checkstr) ) ) {
		return true;
	} else {
		return false;
	}

    return false;
};

World.prototype.draw_sightlines = function(){
	//Iterate through each onscreen tile
	//determine_visibility from the players current position
	var ix = this.camX+4; var iy = this.camY+4;
	if( this.active_char != "none" ) {
		var act = this.get_character(this.active_char);
		ix = act.x;
		iy = act.y;
	} else {
		console.error("Active char undefined");
		return;
	}

    for( var i in this.tiles ){  
    	var sq = this.tiles[i];
    	if( sq.is_on_screen() ){
    		sq.draw();  
    		sq.isInSight = true;
    		if( !this.determine_visibility(sq.x, sq.y, ix, iy, "blocksSight") ){
    			if( sq.isExplored ){
				    this.display.draw_sprite_scaled("tile_121", 
						                    this.grid_to_pixw(sq.x), 
						                    this.grid_to_pixh(sq.y),
						                    this.gridw,
						                    this.gridh);  
				    sq.isInSight = false;
				} else {
					this.display.draw_sprite_scaled("tile_98", 
						                    this.grid_to_pixw(sq.x), 
						                    this.grid_to_pixh(sq.y),
						                    this.gridw,
						                    this.gridh);  
					sq.isInSight = false;
				}
    		} else {
    			sq.isExplored = true;
    			sq.isInSight = true;
    			this.map_explored_table[sq.x][sq.y] = 1;
    		}
    	}
    }
};

World.prototype.add_character = function(fella){
	this.characters.push(fella);
	if( fella.x != -1 && fella.y != -1 ){
		this.get_tile(fella.x, fella.y).add_content(fella.name);
	}
};

World.prototype.add_tile = function(sq){
	this.tiles.push(sq);
};

World.prototype.add_projectile = function(proj){
	proj.isVisible = false;
	this.projectiles.push(proj);
	return this.projectiles.length - 1;
};

World.prototype.add_particle_system = function(x, y, spr, name, params){
	this.particles.push( 
		new app.display.ParticleSystem(x, y, spr, name, this.display, this, params) 
	);
};

World.prototype.get_character_ind = function(name){
	for( var i in this.characters ){
		if( this.characters[i].name == name){
			return i;
		}
	}
	return -1;
};

World.prototype.get_character = function(name){
	var ind = this.get_character_ind(name);
	if( ind === -1 ){
		return "none!";
	} else {
		return this.characters[ind];
	}
};

World.prototype.get_character_by_position = function(x, y){
	for( var i in this.characters ){
		var act = this.characters[i];
		if( act.x == x && act.y == y && act.isAlive ){
			return act;
		}
	}
	return "none";
};

World.prototype.get_tile_ind = function(x, y){
	if( x < 0 || x > this.mapw ){
		console.log("Warning: Tried to get squre where x was out of bounds.",x,this.mapw);
		return -1;
	}
	if( y < 0 || y > this.maph ){
		console.log("Warning: Tried to get squre where y was out of bounds.",y,this.maph);
		return -1;
	}

	return y+x*this.maph;
};

World.prototype.get_tile = function(x, y){
	var ind = this.get_tile_ind(x,y);
	if( ind == -1){
		return "none";
	} else {

		return this.tiles[ind];
	}
};

World.prototype.get_node_by_name = function(name){
	for( var i in this.nodes ){
		if( this.nodes[i].name == name ){
			return this.nodes[i];
		}
	}
	return "none";
};

World.prototype.get_node_by_position = function(x, y){
	var ret = "none";
	var ret_arr = [];
	var offset = 0;
	for( var i in this.nodes ){
		if( this.nodes[i].x == x && this.nodes[i].y == y ){
			//ret = this.nodes[i];
			ret_arr.push(this.nodes[i]);
		}
	}

	if( x == this.prev_node_x_click && 
		y == this.prev_node_y_click && this.prev_node_stack.length != ret_arr.length ){
		this.prev_node_stack.push(1);
		offset = this.prev_node_stack.length - 1;
	} else {
		this.prev_node_stack = [1];
		this.prev_node_x_click = x;
		this.prev_node_y_click = y;
	}

	if( ret_arr.length > 0 ){
		ret = ret_arr[offset]; 
	}

	return ret;
};

World.prototype.get_closest_enemy_act_to_me = function(me_name){

	var me = this.get_character(me_name);
	if( me === "none" ){
		console.log("ERROR AI tried to get nearset actor '"+me_name+"' that did not exist.");
	}
	var me_x = this.grid_to_pixw( me.x );
	var me_y = this.grid_to_pixh( me.y );

	var max_dist = 1000000000001;
	var ind = 0;
	for( var i in this.characters ){
		var her = this.characters[i];

		if( her.name == me_name || !her.isAlive || her.allegiance == me.allegiance ){
			continue;
		}

		var her_x = this.grid_to_pixw( her.x );
		var her_y = this.grid_to_pixh( her.y );

		var dist_sq = (me_x - her_x)*(me_x - her_x) + (me_y - her_y)*(me_y - her_y);

		if( dist_sq < max_dist ){
			max_dist = dist_sq;
			ind = i;
		}
	}
	if( max_dist == 1000000000001){
		return "none";
	} else {
		return this.characters[ind];
	}
};

/**
	Get the closest ally actor to the given actor
*/
World.prototype.get_closest_ally_act_to_me = function(me_name){

	var me = this.get_character(me_name);
	if( me === "none" ){
		console.log("ERROR AI tried to get nearset actor '"+me_name+"' that did not exist.");
	}
	var me_x = this.grid_to_pixw( me.x );
	var me_y = this.grid_to_pixh( me.y );

	var max_dist = 1000000000001;
	var ind = 0;
	for( var i in this.characters ){
		var her = this.characters[i];

		if( her.name == me_name || !her.isAlive || her.allegiance != me.allegiance ){
			continue;
		}

		if( !this.determine_visibility(me.x, me.y, her.x, her.y, "blocksSight") ){
			continue;
		}
		
		var her_x = this.grid_to_pixw( her.x );
		var her_y = this.grid_to_pixh( her.y );

		var dist_sq = (me_x - her_x)*(me_x - her_x) + (me_y - her_y)*(me_y - her_y);

		if( dist_sq < max_dist ){
			max_dist = dist_sq;
			ind = i;
		}
	}
	if( max_dist == 1000000000001){
		return "none";
	} else {
		return this.characters[ind];
	}
};

/**
 * Starting at the point (cx, cy) if this point is not passable
 * continue in a clockwise direction from above and around it until
 * a suitable point is found, return an object with that point or
 * return none if no point in that circle is found.
 */
World.prototype.get_valid_pos = function(cx, cy){
	if( this.get_tile(cx, cy).isPassable && 
		this.get_character_by_position(cx, cy) === "none" ){
		return {x:cx, y:cy};
	}

	var dirs = [{x: 1, y:-1},
			 	{x: 1, y: 0},
			 	{x: 1, y: 1},
			 	{x: 0, y:-1},
			 	{x: 0, y: 1},
			 	{x:-1, y:-1},
			 	{x:-1, y: 0},
			 	{x:-1, y: 1}];

	var nx = 0;
	var ny = 0;
	for( var i in dirs ){
		nx = cx + dirs[i].x;
		ny = cy + dirs[i].y;

		if( this.get_tile(nx, ny).isPassable && 
			this.get_character_by_position(nx, ny) === "none" && 
			this.get_tile(nx, ny).isInSight){
			return {x:nx, y:ny};
		}
	}

	return "none";

};

World.prototype.for_all_duplicates = function( name, func ){
	for( var i in this.characters ){
		var name2 = this.fix_actor_name( this.characters[i].name );
		if( name2 == name ){
			func( this.characters[i] );
		}
	}
};

World.prototype.grid_to_pixw = function(num){
	return Math.round((num)*this.gridw) - (this.camX*this.gridw) + this.left;
};

World.prototype.grid_to_pixh = function(num){
	return Math.round((num)*this.gridh) - (this.camY*this.gridh);
};

World.prototype.pix_to_gridw = function(num){
	return Math.floor((num-this.left + (this.camX*this.gridw) )/this.gridw);
};

World.prototype.pix_to_gridh = function(num){
	return Math.floor((num + (this.camY*this.gridh) )/this.gridh);
};

World.prototype.animate_camera = function(){
	if( this.cam_move_frame >= this.max_cam_move_frames ){
		this.cam_is_moving = false;
		this.camX = this.newCamX;
		this.camY = this.newCamY;
		this.oldCamX = this.newCamX;
		this.oldCamY = this.newCamY;
	} else {
		var xdist = this.oldCamX - this.newCamX;
		var ydist = this.oldCamY - this.newCamY;
		var ratio = ((this.cam_move_frame + 1)/this.max_cam_move_frames);

		this.camX = this.oldCamX - ratio*xdist;
		this.camY = this.oldCamY - ratio*ydist;

	    this.cam_move_frame++;
	}
};

World.prototype.set_camera = function(x, y, animate){
	this.oldCamX = this.camX;
	this.oldCamY = this.camY;

	this.newCamX = x;
	this.newCamY = y;

    this.camX = x;
    this.camY = y;

	if( this.camX < 0 ){
		this.camX = 0;
	} else if( this.camX > this.params.width-9 ){
		this.camX = this.params.width-9;
	}

	if( this.camY < 0 ){
		this.camY = 0;
	} else if( this.camY > this.params.height-9 ){
		this.camY = this.params.height-9;
	}

	if( this.oldCamX == this.newCamX && this.oldCamY == this.newCamY ){
		return;
	}

	if( animate === false ){
		this.camX = x;
		this.camY = y;
	} else {
		this.cam_is_moving = true;
	    this.camX = this.oldCamX;
	    this.camY = this.oldCamY;
	    this.cam_move_frame = 0;
	}
};

World.prototype.get_act_in_vicinity = function(act_name){
	var sqs = this.get_adjacent_squares(act_name);
	var act = this.get_character(act_name);
	for( var i in sqs ){
		var vicname = sqs[i].has_character(act_name);
		if( vicname != "none" ){
			var vic = this.get_character(vicname);
			if( vic.allegiance != act.allegiance ){
				return vicname;
			}
		}
	}
	return "none";
};

World.prototype.get_adjacent_squares = function(act_name){
	var act = this.get_character(act_name);
	var sqs = [];

	sqs.push( this.get_tile(act.x-1, act.y-1));
	sqs.push( this.get_tile(act.x+0, act.y-1));
	sqs.push( this.get_tile(act.x+1, act.y-1));
	sqs.push( this.get_tile(act.x-1, act.y-0));
	sqs.push( this.get_tile(act.x+0, act.y-0));
	sqs.push( this.get_tile(act.x+1, act.y-0));
	sqs.push( this.get_tile(act.x-1, act.y+1));
	sqs.push( this.get_tile(act.x+0, act.y+1));
	sqs.push( this.get_tile(act.x+1, act.y+1));

	return sqs;
};

World.prototype.get_adjacent_squares_pos = function(x,y){
	var act = {x:x, y:y};
	var sqs = [];

	sqs.push( this.get_tile(act.x-1, act.y-1));
	sqs.push( this.get_tile(act.x+0, act.y-1));
	sqs.push( this.get_tile(act.x+1, act.y-1));
	sqs.push( this.get_tile(act.x-1, act.y-0));
	sqs.push( this.get_tile(act.x+0, act.y-0));
	sqs.push( this.get_tile(act.x+1, act.y-0));
	sqs.push( this.get_tile(act.x-1, act.y+1));
	sqs.push( this.get_tile(act.x+0, act.y+1));
	sqs.push( this.get_tile(act.x+1, act.y+1));

	return sqs;
};

World.prototype.get_onscreen_tiles = function(){
	var ret = [];
    for( var i in this.tiles ){   
        if( this.tiles[i].is_on_screen() ){
        	ret.push(this.tiles[i]);
        }   
    } 
    return ret;
};

World.prototype.is_near_tile_type = function(actname, tile_list){
	var sqs = this.get_adjacent_squares( actname);

	var checked = [];
	for( var i in sqs ){
		checked.push(sqs[i].id );
		if( app.inArr( sqs[i].id, tile_list )){
			return sqs[i];
		}	
	}

	return false;
};

World.prototype.get_act_within_spaces = function(n, me){
	var lbound_lat = -1;
	var rbound_lat = 1;
	var ubound_lon = 0;
	var lbound_lon = 0;
	var a1 = "";
	for( var j = 0; j < n; j ++ ){
		for( var i = lbound_lat; i <= rbound_lat; i++ ){
			if( i === 0 && j === 0 ){
				continue;
			}

			a1 = this.get_character_by_position(me.x-i, me.y-j);
			if( a1 !== "none" ){	
				if( a1.allegiance == me.allegiance){
					continue;
				}
				return a1;
			}
			a1 = this.get_character_by_position(i+me.x, me.y-j);
			if( a1 !== "none" ){
				if( a1.allegiance == me.allegiance){
					continue;
				}
				return a1;
			}
		}

		for( var i = ubound_lon; i <= lbound_lon; i++ ){
			if( i === 0 && j === 0 ){
				continue;
			}

			a1 = this.get_character_by_position(j+me.x, i+me.y);
			if( a1 !== "none" ){
				if( a1.allegiance == me.allegiance){
					continue;
				}
				return a1;
			}			
			a1 = this.get_character_by_position(me.x-j, i+me.y);
			if( a1 !== "none" ){
				if( a1.allegiance == me.allegiance){
					continue;
				}
				return a1;
			}			
		}

		lbound_lat -= 1;
		rbound_lat += 1;
		ubound_lon -= 1;
		lbound_lon += 1;
	}

	return "none";

};

World.prototype.get_nearby_items = function(actorname){
    var tiles = this.get_adjacent_squares( actorname );
    var ret = [];

    for( var i in tiles ){
        var sq = tiles[i];
        var cont = sq.get_contents();
        for( var j in cont ){
            var item = this.itemCache.get_item(
            	cont[j].substring( 0, cont[j].search("_") )
            );
            if( item !== "none" ){
                ret.push( {item:item, sq:sq, name:cont[j]} );            
            }
        }        
    }

    return ret;
};

World.prototype.add_text_particle = function(x, y, text, color){
    this.particles.push( 
    	new app.display.ParticleSplash( this.display, this, {
	    	text: text,
	    	x: this.grid_to_pixw( x ),
	    	y: this.grid_to_pixh( y + 1 ) - this.gridh/3,
	    	vy: function(){ return -0.7; },
	    	lifetime: 15,
	   		color: color || "white"
	    })
    );
};

})();