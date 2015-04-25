/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var CombatMode = app.world.mode.CombatMode = function(state, world, ui){
	app.world.mode.GameMode.call( this, state, world, ui );
	this.aicallback = function(){
		this.world.ai.combat_action(this.cactor, this);
	}.bind(this);
};

CombatMode.inherits( app.world.mode.GameMode );

CombatMode.prototype.init_actors = function(){
	this.parent.init_actors.call( this );
};

CombatMode.prototype.attack = function(victim){
	this.log_attack( "attacks", victim );
	this.engine.action_attack(this.cactor.name, victim.name );
	if( this.cactor.isNPC ){
		this.actionlist.push( function(){
	    	//padding
	    });
	}
    this.cactor.ap -= 4;
};

CombatMode.prototype.move = function(dir){
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
	    this.world.set_camera( new_x-4, new_y-4 );
	    act.ap--;
	    if( !act.isNPC ){
	    	this.trip_node();
	    }
	    return true;  
	} else {
		if( victimname === "blocked!" ){
			console.log(" - BLOCKED");
			return false;
		}

		var victim = this.world.get_character(victimname);
		if( victim.allegiance === act.allegiance ){
			this.state.notif.add_log("WARNING","Somebody already occupies that space!");
			if( act.isNPC ){
				act.ap--; //just in case my ai code fails, which it will
			}
			return false;
		} else {
			this.attack( victim );
			return true;
		}
	}
};

CombatMode.prototype.shoot = function(victim){
	this.log_attack( "shoots", victim );
	this.engine.action_attack(this.cactor.name, victim.name);	
};

CombatMode.prototype.cast = function(spell_pkg){
    this.cactor.ap -= 4;
	var spell = this.world.sm.get_spell( spell_pkg.name );
	var her = spell_pkg.her;

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

CombatMode.prototype.use = function(){
	//FIXME
};

CombatMode.prototype.get_item = function(){
	//FIXME
};

CombatMode.prototype.wait = function(){
	this.cactor.ap = 0;
};

CombatMode.prototype.get_instance = function(){
	return this.parent.get_instance.call( this );
};

CombatMode.prototype.begin_round = function(){
    return this.parent.begin_round.call( this );
};

CombatMode.prototype.set_next_actor = function(){
    return this.parent.set_next_actor.call( this );
};

CombatMode.prototype.begin_actor_turn = function(think){
	return this.parent.begin_actor_turn.call( this, think );
};

CombatMode.prototype.end_actor_turn = function(){
    return this.parent.end_actor_turn.call( this );
};

CombatMode.prototype.check_dead = function(){
    return this.parent.check_dead.call( this );
};

CombatMode.prototype.end_round = function(){
    return this.parent.end_round.call( this );
};

CombatMode.prototype.keypress = function( ev ){
	return this.parent.keypress.call( this, ev );
};

CombatMode.prototype.click = function( ev, off ){
	return this.parent.click.call( this, ev, off );
};

CombatMode.prototype.mousemove = function( ev, off ){
	return this.parent.mousemove.call( this, ev, off );
};

})();