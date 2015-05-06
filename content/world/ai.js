/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var ai = app.world.AI = function(world){
	this.last_action = "none";
	this.world = world;
};

ai.prototype.is_enemy_in_sight = function(me_name){
	var me = this.world.get_character(me_name);
	if( me == "none!" ){
		console.error("ERROR: Tried to check enemy in sight for '"+me_name+
			"' who isn't in the actors list!");
		return;
	}
	for( var i in this.world.characters ){
		var act = this.world.characters[i];
		if( act.allegiance != me.allegiance ){
			if( 
				this.world.determine_visibility(me.x, me.y, act.x, act.y, "blocksSight") 
			){
				return true;
			}
		}
	}

	return false;
};

ai.prototype.is_player_in_sight = function(me_name){
	var me = this.world.get_character(me_name);
	if( me == "none" ){
		console.log("ERROR: Tried to check enemy in sight for '"+me_name+
			"' who isn't in the actors list!");
		return;
	}

	for( var i in this.world.characters ){
		var act = this.world.characters[i];
		if( !act.isNPC ){
			if( this.world.determine_visibility(me.x, me.y, act.x, act.y, "blocksSight") ){
				return true;
			}
		}
	}

	return false;
};

ai.prototype.town_action = function(act, town_instance){
	var act_name = act.name;
	if( this.is_enemy_in_sight(act_name) && this.is_player_in_sight(act_name, town_instance.state) ){

		if( !act.isAgitated ){
			act.isAgitated = true;
            //town_instance.state.warn.add_log("red", "An enemy has spotted you!");
            //console.log("You have been spotted by", act.name);
			town_instance.do_action('wait', true );
			return;
		}

		var vic1 = this.world.get_act_in_vicinity( act.name );
		if( vic1 !== "none" ){ //if there is an actor next to me
			town_instance.do_action("wait", true);
		} else {		//if no actor is next to me, but I see somebody I dont like
			this.combat_action(act, town_instance);
		}

		return true;
	} else {
		act.isAgitated = false;
		switch( act.ai_town ){
			case "none": town_instance.do_action('wait', true ); break;
			case "rand": this.town_action_rand( act_name, town_instance); break;
			default: break;
		}
		return false;
	}

};

ai.prototype.town_action_rand = function(act_name, town_instance){
	var dirs = ["nw","n","ne","w","e","sw","s","se"];

	var dir = dirs[Math.floor(Math.random()*dirs.length)];

	if( !town_instance.do_action("move", true, dir)  ){
		for( var i in dirs ){
			if( town_instance.do_action("move", true, dirs[i]) ){
				break;
			}
		}
	} 
};

ai.prototype.combat_action = function(act, combat_instance){
	var act_name = act.name;
	if( !this.is_enemy_in_sight(act_name) ){
		//dont do anything for now
		combat_instance.do_action("wait", true);
	} else {	
		switch(act.ai_combat){
			case "attack_nearest": 
				this.attack_nearest(act, combat_instance); break;
			case "attack_archer": 
				this.attack_archer(act, combat_instance); break;
			case "attack_darkmagic_simple": 
				this.attack_darkmagic_simple(act, combat_instance); break;
			case "attack_lightmagic_simple": 
				this.attack_lightmagic_simple(act, combat_instance); break;
			case "none": 
				combat_instance.do_action("wait", true); break;
			default: 
				console.log("WARNING: ai behavior '"+act.ai_combat+"' defaulted!");
		}
	}
};

/** Get the direction as a string (n, e, sw, etc) that character 'her' is
	relative to character 'actor'
*/
ai.prototype.get_direction_nearest = function(actor, her){
	//Basic algorithm to find the direction of the nearest actor is as follows:
	// 1. Get the x,y distances between two actors
	// 2. Get the absolute max of these distances
	// 3. Normalize these two distances to between 0 and 1, weighted to the max
	// 4. Round the normalized numbers such that you get x and y values -1 < dist < 1;
	// 5. Switch case based on x,y distances

	//1.
	var dx = her.x - actor.x;
	var dy = her.y - actor.y;

	//In order to normalize you need to use absolute value, so I need to preserve
	//the sign to eventually get the direction that the actor is in.
	var xsign = dx < 0 ? -1 : 1;
	var ysign = dy < 0 ? -1 : 1;

	//2.
	var max = 0;
	if( Math.abs(dx) > Math.abs(dy) ){
		max = Math.abs(dx);
	} else {
		max = Math.abs(dy);
	}

	//3. and 4.
	var norm_x = Math.round( app.normalize( Math.abs(dx), 0, max, 0, 1 ) )*xsign;
	var norm_y = Math.round( app.normalize( Math.abs(dy), 0, max, 0, 1 ) )*ysign;

	//5.
	return this.convert_offset_to_dir({x:norm_x, y:norm_y});
};

ai.prototype.convert_offset_to_dir = function(off_obj){
	var norm_x = off_obj.x;
	var norm_y = off_obj.y;
	var dir = "n";

	if 		  ( norm_x === 1 && norm_y === 1  ){
		dir = "se";
	} else if ( norm_x === 1 && norm_y === 0  ){
		dir = "e";
	} else if ( norm_x === 1 && norm_y === -1 ){
		dir = "ne";
	} else if ( norm_x === 0 && norm_y === 1  ){
		dir = "s";
	} else if ( norm_x === 0 && norm_y === -1 ){
		dir = "n";
	} else if ( norm_x === -1 && norm_y === 1 ){
		dir = "sw";
	} else if ( norm_x === -1 && norm_y === 0 ){
		dir = "w";
	} else {
		dir = "nw";
	}

	return dir;
};

ai.prototype.attack_nearest = function(actor, combat_instance){
	var her = this.world.get_closest_enemy_act_to_me( actor.name ); 
	if( her === "none" ){
		this.town_action_rand(actor.name, combat_instance);
	} else {
		var dir = this.get_dir_astar( actor.name, her.name );
		if( !combat_instance.do_action("move", true, dir) ) {
			var dirs = ["nw","n","ne","w","e","sw","s","se"];
			var dirctr = 0;
			while( !combat_instance.do_action("move", true, dir) ){
				if( dirctr > dirs.length ){
					break;
				}
				dir = dirs[dirctr];
				dirctr++;
			}
		}
	}
};

ai.prototype.attack_archer = function(actor, combat_instance){
	var her = this.world.get_closest_enemy_act_to_me( actor.name ); 
	if( her === "none" ){
		this.town_action_rand(actor.name, combat_instance);
	} else {
		if( !this.world.determine_visibility(
				actor.x, actor.y, her.x, her.y, "blocksSight")
		){
			return;
		}

        actor.set_attack_sprite();
        this.world.soundCache.play_sound("scratch0");
       	this.world.add_projectile( 
       		new app.world.actor.Projectile(
       			actor.name, [her.x,her.y], "bowproj", "bowproj", 
       			combat_instance.game_state.game.display, this.world, 1, 
       			function(){
            		combat_instance.engine.action_attack(actor.name, her.name);
            	}.bind(this)
            )
        );  
        actor.action_points-=4;		
	}
};

ai.prototype.attack_darkmagic_simple = function(actor, combat_instance){
	this.town_action_rand(actor.name, combat_instance);
};

ai.prototype.attack_lightmagic_simple = function(actor, combat_instance){
	this.town_action_rand(actor.name, combat_instance);
};

ai.prototype.get_dir_astar = function(me_name, her_name){
	var o_list = [];
	var c_list = [];

	var me = this.world.get_character(me_name);
	var her = this.world.get_character(her_name);

	var Bx = her.x;
	var By = her.y;
	var Ax = me.x;
	var Ay = me.y;

	var TILE = function(x, y, g, h, p){
		this.X = x;
		this.Y = y;
		this.G = g;
		this.H = h;
		this.F = this.H + this.G;		
		this.parent = p;
	};

	var inArrStar = function(x, y, list){
		for( var i = 0; i < list.length; i++ ){
			if( list[i].x === x && list[i].y === y ){
				return i;
			}
		}
		return -1;
	};

	var safecount = 0;
	var safemax = 25;
	var astar = function(){
		var current_square = o_list[0];
		var current_ind = 0;
		var lowest_cost = 1000000;

		while (	current_square.X != Bx || current_square.Y != By ){
			if( safecount > safemax ){
				//path is too long, return no path
				return [];
			}
			safecount++;

			//Get the current square by determining which square in the open 
			//list has the lowest cost
			lowest_cost = 1000000;
			current_ind = 0;
			if( o_list.length > 0 ){
				for( var i in o_list ){
					if( o_list[i].F < lowest_cost ){
						//current_square = o_list[i];
						current_ind = i;
						lowest_cost = o_list[i].F; 
					}
				}
			} else {
				console.log("ERROR: No path");
				//no path found if there are no tiles in the open list
				return [];
			}

			current_square = o_list.splice(current_ind, 1)[0];
			c_list.push(current_square);
			var adj_squares = this.world.get_adjacent_squares_pos( 
				current_square.X, current_square.Y 
			);

			for( var i in adj_squares ){
				var sq = adj_squares[i];
				if( sq === undefined ){
					console.log("Undefined!");
					continue; 
				}
				//skip the square if it's in the closed list or is not passable
				if( inArrStar( sq.x, sq.y, c_list ) !== -1 || !sq.isPassable ){
					continue; 
				}

				var ind = inArrStar( sq.x, sq.y, o_list );
				if( ind == -1 ){
					//Push a new tile onto the list where G is the cost of moving to 
					//the square + the cost of moving to the parent
					//and H is calculated by the manhatten method by the number of vert 
					//and horiz squares to the final position
					var act = this.world.get_character_by_position(sq.x, sq.y);
					if( act != "none" ){
						if( act.allegiance == me.allegiance ){
							o_list.push( 
								new TILE( 
									sq.x, sq.y, 20 + current_square.G, 
									Math.abs( Bx - sq.x ) + Math.abs( By - sq.y )*20, 
									current_square
								) 
							);
						} else {
							o_list.push( 
								new TILE( 
									sq.x, sq.y, 10 + current_square.G,
									Math.abs( Bx - sq.x ) + Math.abs( By - sq.y )*10,
									current_square
								)
							);
						}
					} else {
						o_list.push( 
							new TILE( 
								sq.x, sq.y, 10 + current_square.G, 
								Math.abs( Bx - sq.x ) + Math.abs( By - sq.y )*10, 
								current_square
							)
						);
					}
				} else {
					//Check if there is a better path to this square from the current 
					//square and change the parent and F cost if true
					var square = o_list[ind];
					if( square.G > current_square.G + 10 ){
						square.parent = current_square;
						square.G = current_square.G + 10;
						square.F = square.G + square.H;
					}
				}
			}
		}

		var ret = [current_square];

		//Go back through the path backwards and add all the parent nodes
		var recpath = function(t){
			if( t.parent == "none" ){
				return t;
			} else {
				recpath(t.parent);
				return ret.push( t.parent );
			}
		};
		recpath( current_square );
		return ret;		
	};

	var dir = null;
	o_list.push( new TILE( Ax, Ay, 0, 0, "none") );
	var path = astar();
	if( path.length > 2 ){
		//I messed up the recpath function so the next node that isnt the 
		//starting node is at position 2 in the path
		dir = this.convert_offset_to_dir( {x:-(Ax - path[2].X), y:-(Ay - path[2].Y)});
	} else if ( path.length === 2 ){
		dir = this.convert_offset_to_dir( {x:-(Ax - Bx), y:-(Ay - By)} );
	} else {
		dir = this.get_direction_nearest(me, her);
	}

	o_list = [];
	c_list = [];
	return dir;
};

})();