/* jshint browser: true */
/* global app */

(function(){
"use strict";

var OutsideMode = app.world.mode.OutsideMode = function(state, world, ui){
	app.world.mode.GameMode.call( this, state, world, ui );
	this.player.change_mode("outside");
};

OutsideMode.prototype = new app.extend(app.world.mode.GameMode);

OutsideMode.prototype.begin_actor_turn = function(){
	app.world.mode.GameMode.prototype.begin_actor_turn( function(){
		this.wait();
		//this.world.ai.town_action(this.cactor, this)
	}.bind(this), false);
};

OutsideMode.prototype.check_bounds = function(){
	var act = this.cactor();
	if( this.world.params.mode === "outside" ){
	    var tmp = this.world.name.split(".");
	    var mapx = parseInt(tmp[0]);
	    var mapy = parseInt(tmp[1]);
	    var new_x = act.x;
	    var new_y = act.y;
	    if( new_x === 0 ){
	        this.game_state.change_map( (mapx-1)+"."+mapy, 48, act.y, "outside"); 
	    } else if( new_y === 0 ){
	        this.game_state.change_map( mapx+"."+(mapy-1), act.x, 48, "outside"); 
	    } else if( new_x === 49 ){
	        this.game_state.change_map( (mapx+1)+"."+mapy, 1, act.y, "outside"); 
	    } else if( new_y === 49 ){
	        this.game_state.change_map( mapx+"."+(mapy+1), act.x, 1, "outside"); 
	    }  
	} 
};

OutsideMode.prototype.move = function(dir){
    var act = this.cactor;

    var m = app.world.mode.GameMode.prototype.move.call( this, dir );
    var victimname = m.name;
    var old_x = m.old_x;
    var old_y = m.old_y;
    var new_x = m.new_x;
    var new_y = m.new_y;
    if( victimname === "none" ){
	    this.state.game.soundCache.play_sound("footstep");
	    act.set(new_x, new_y);
	    act.walk_to_tile(old_x, old_y, new_x, new_y);
	    if( !act.isNPC ){
	    	this.world.set_camera( new_x-4, new_y-4 );
	    	this.trip_node();
	    	this.check_bounds();
	    }

	    act.ap = 0;
	    return true;  
	} else {
		//blocked
		act.ap = 0;
		return false;
	}
};

OutsideMode.prototype.cast = function(spell_pkg){
    this.cactor.ap -= 4;
	this.combat_engine.action_magic(
		this.cactor.name,
		spell_pkg.victims, 
		spell_pkg.name
	);
};

OutsideMode.prototype.use = function(){
	//FIXME
};

OutsideMode.prototype.get_item = function(){
	//FIXME
};

OutsideMode.prototype.wait = function(){
	this.cactor.ap = 0;
};

})();