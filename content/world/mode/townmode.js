/* jshint browser: true */
/* global app */

(function(){
"use strict";

var TownMode = app.world.mode.TownMode = function(state, world, ui){
	app.world.mode.GameMode.call( this, state, world, ui );

	this.aicallback = function(){
		this.world.ai.town_action(this.cactor, this);
	}.bind(this);
};

TownMode.inherits( app.world.mode.GameMode );

TownMode.prototype.init_actors = function(){
	this.parent.init_actors.call( this );
};

TownMode.prototype.attack = function(victim){
	this.log_attack( "attacks", victim );
    this.engine.action_attack(this.cactor.name, victim.name );
    this.cactor.ap -= 4;
};

TownMode.prototype.move = function(dir){
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
	    }

	    act.ap = 0;
	    return true;  
	} else {
		if( act.isNPC ) {
			act.ap = 0;
		} else {
			this.log(" - BLOCKED");
		}
		return false;
	}
};

TownMode.prototype.shoot = function(victim){
	this.log_attack( "shoots", victim );
	this.engine.action_attack(this.cactor.name, victim.name);	
};

TownMode.prototype.cast = function(spell_pkg){
    this.cactor.ap -= 4;
	var spell = this.world.sm.get_spell( spell_pkg.name );
	var her = spell_pkg.her;
	this.actionlist.push( function(){
		this.world.set_camera( this.cactor.x - 4, this.cactor.y - 4 );
	}.bind(this));

	this.actionlist.push( function(){
		this.cactor.set_attack_sprite();
	    this.world.soundCache.play_sound("cast");
	    this.world.add_projectile( 
		    new app.world.actor.Projectile(this.cactor.name, [her.x,her.y], 
		    	spell.proj, spell.proj, 
		    	this.state.game.display, this.world, 1, 
		    	function(){}
		    )
	    ); 
	});

	this.actionlist.push( function(){
		this.engine.action_magic(
			this.cactor.name,
			spell_pkg.victims, 
			spell_pkg.name
		);
	});
};

TownMode.prototype.use = function(){
	//FIXME
};

TownMode.prototype.get_item = function(){
	//FIXME
};

TownMode.prototype.wait = function(){
	this.cactor.ap = 0;
};

TownMode.prototype.get_instance = function(){
	return this.parent.get_instance.call( this );
};

TownMode.prototype.begin_round = function(){
    return this.parent.begin_round.call( this );
};

TownMode.prototype.set_next_actor = function(){
    return this.parent.set_next_actor.call( this );
};

TownMode.prototype.begin_actor_turn = function(think){
	return this.parent.begin_actor_turn.call( this, think );
};

TownMode.prototype.end_actor_turn = function(){
    return this.parent.end_actor_turn.call( this );
};

TownMode.prototype.check_dead = function(){
    return this.parent.check_dead.call( this );
};

TownMode.prototype.end_round = function(){
    return this.parent.end_round.call( this );
};

TownMode.prototype.keypress = function( ev ){
	return this.parent.keypress.call( this, ev );
};

TownMode.prototype.click = function( ev, off ){
	return this.parent.click.call( this, ev, off );
};

TownMode.prototype.mousemove = function( ev, off ){
	return this.parent.mousemove.call( this, ev, off );
};

})();