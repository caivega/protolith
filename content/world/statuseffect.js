/* jshint browser: true */
/* global app */

(function(){
"use strict";

var AbstractEffect = app.world.AbstractEffect = function(
	sprite, vic_name, att_name, display, world
){
	this.sprite = sprite;
	this.name = "Abstract";
	this.display = display;
	this.world = world;
	this.att = this.world.get_character(att_name);
	this.vic = this.world.get_character(vic_name);

	this.id = -1;

	this.stats = {
		POW:0,
		ACC:0,
		FOR:0,
		CON:0,
		RES:0,
		EVA:0,
		SPD:0
	};

	this.power = this.att.stats.POW;

	this.FLAG_remove = false;
	this.decay_turn = 3;
};

AbstractEffect.prototype.draw = function(x, y){
	this.display.draw_sprite(this.sprite+"_w", x, y);
};

AbstractEffect.prototype.apply_pre_turn_effect = function(){};

AbstractEffect.prototype.apply_post_turn_effect = function(){};

AbstractEffect.prototype.decrement_effect = function(){
	this.decay_turn--;
	if( this.decay_turn < 0 ){
		this.remove();
	}
};

AbstractEffect.prototype.remove = function(){
	this.FLAG_remove = true;
};

var PoisonedEffect = app.world.PoisonedEffect = 
	function(vic_name, att_name, display, world){

	AbstractEffect.call(this, "se_poison", vic_name, att_name, display, world);
	this.name = "Poisoned";
	this.damage_if_greater_than = -1;
	this.decay_turn = Math.round( 
		Math.floor(Math.random()*3)+1+
		(this.att.stats.POW*0.04)*Math.floor(Math.random()*10)
	);
};

PoisonedEffect.prototype = app.extend(AbstractEffect); 

PoisonedEffect.prototype.apply_post_turn_effect = function(xoff, yoff){
	if( Math.floor(Math.random()*10) > this.damage_if_greater_than ){
		this.world.soundCache.play_sound("poison");
		var final_damage = Math.floor(Math.random() * 10 + this.att.stats.POW*0.3);
		this.vic.stats.curr_hp -= final_damage;

	    var psparams = new app.display.ParticleSystemParams( this.vic.x, this.vic.y );
	    psparams.variance = 0;
	    psparams.ubiquity = 1;
	    psparams.damage = final_damage;
	    psparams.xpos_func = function(){ return this.vic.x+xoff; }.bind(this);
	    psparams.ypos_func = function(){ return this.vic.y+yoff; }.bind(this);
	    psparams.xvel_func = function(){ return 0; }.bind(this);
	    psparams.yvel_func = function(){ return 0; }.bind(this);
	    psparams.lifetime  = function(){ return 7; }.bind(this);
	    psparams.isAnimated = false;
	    this.world.add_particle_system(
	    	this.vic.x, this.vic.y, "poisond", "splash", psparams
	    );  
	}
};

var BurningEffect = app.world.BurningEffect = 
	function(vic_name, att_name, display, world){
	AbstractEffect.call(this, "se_burning", vic_name, att_name, display, world);

	this.name = "Burning";

	//Burning should have a 75% chance of doing damage, but hit less hard than poison
	this.damage_if_greater_than = -1;

	this.decay_turn = Math.round( 
		Math.floor(Math.random()*3)+1+
		(this.att.stats.POW*0.03)*Math.floor(Math.random()*10)
	);
};

BurningEffect.prototype = app.extend(AbstractEffect); 

BurningEffect.prototype.apply_post_turn_effect = function(xoff, yoff){
	if( Math.floor(Math.random()*10) > this.damage_if_greater_than ){

		this.world.soundCache.play_sound("blast");
		var final_damage = Math.round(Math.random()*5 + this.att.stats.POW*0.2);
		this.vic.stats.curr_hp -= final_damage;

	    var psparams = new app.display.ParticleSystemParams( this.vic.x, this.vic.y );
	    psparams.variance = 0;
	    psparams.ubiquity = 1;
	    psparams.damage = final_damage;
	    psparams.xpos_func = function(){ return this.vic.x+xoff; };
	    psparams.ypos_func = function(){ return this.vic.y+yoff; };
	    psparams.xvel_func = function(){ return 0; };
	    psparams.yvel_func = function(){ return 0; };
	    psparams.lifetime  = function(){ return 7; };
	    psparams.isAnimated = false;
	    this.world.add_particle_system(
	    	this.vic.x, this.vic.y, "fired", "splash", psparams
	    );
	}
};

var FearedEffect = app.world.FearedEffect = 
	function(vic_name, att_name, display, world, state){
	AbstractEffect.call(this, "se_feared", vic_name, att_name, display, world);
	this.name = "Feared";
	this.state = state;
	this.decay_turn = 10;
};

FearedEffect.prototype = app.extend(AbstractEffect); 

FearedEffect.prototype.apply_pre_turn_effect = function(xoff, yoff){
	this.world.ai.town_action_rand(this.vic.name, this.state.wMode);

    var psparams = new app.display.ParticleSystemParams( this.vic.x, this.vic.y );
    psparams.variance = 0;
    psparams.ubiquity = 1;
    psparams.damage = "Feared!";
    psparams.xpos_func = function(){ return this.vic.x+xoff; }.bind(this);
    psparams.ypos_func = function(){ return this.vic.y+yoff; }.bind(this);
    psparams.xvel_func = function(){ return 0; }.bind(this);
    psparams.yvel_func = function(){ return 0; }.bind(this);
    psparams.lifetime  = function(){ return 7; }.bind(this);
    psparams.isAnimated = false;
    this.world.add_particle_system( this.vic.x, this.vic.y, "chaind", "splash", psparams ); 

    this.state.wMode.cAP = 0;
    this.vic.action_points = 0; 	
};

var BoundEffect = app.world.BoundEffect = 
	function(vic_name, att_name, display, world, state){
	AbstractEffect.call(this, "se_bound", vic_name, att_name, display, world);

	this.name = "Bound";
	this.state = state;
	this.stats.SPD = -Math.round(
		Math.floor(Math.random()*10)+1+(this.att.stats.POW*0.5)
	);
	this.decay_turn = Math.round(
		Math.floor(Math.random()*3)+1+
		(this.att.stats.POW*0.03)*Math.floor(Math.random()*10)
	);
};

BoundEffect.prototype = app.extend(AbstractEffect); 

BoundEffect.prototype.apply_post_turn_effect = function(xoff, yoff){
	var final_damage = Math.round(Math.random()*10 + this.att.stats.POW*0.5);
	this.vic.stats.curr_hp -= final_damage;

    var psparams = new app.display.ParticleSystemParams( this.vic.x, this.vic.y );
    psparams.variance = 0;
    psparams.ubiquity = 1;
    psparams.damage = final_damage;
    psparams.xpos_func = function(){ return this.vic.x+xoff; }.bind(this);
    psparams.ypos_func = function(){ return this.vic.y+yoff; }.bind(this);
    psparams.xvel_func = function(){ return 0; }.bind(this);
    psparams.yvel_func = function(){ return 0; }.bind(this);
    psparams.lifetime  = function(){ return 7; }.bind(this);
    psparams.isAnimated = false;
    this.world.add_particle_system( this.vic.x, this.vic.y, "chaind", "splash", psparams ); 

    this.state.wMode.cAP = 0;
    this.vic.action_points = 0; 	
};

var FrozenEffect = app.world.FrozenEffect = 
	function(vic_name, att_name, display, world, state){
	AbstractEffect.call(this, "se_frozen", vic_name, att_name, display, world);

	this.name = "Frozen";
	this.state = state;

	this.stats.EVA = -Math.round( 
		Math.floor(Math.random()*10)+1+(this.att.stats.POW*0.5)
	);

	this.decay_turn = Math.round( Math.floor(Math.random()*3)+
		1+(this.att.stats.POW*0.03)*Math.floor(Math.random()*10)
	);
};

FrozenEffect.prototype = app.extend(AbstractEffect); 

FrozenEffect.prototype.apply_pre_turn_effect = function(){
    this.state.wMode.cAP = 1;
    this.vic.action_points = 1; 	
};

FrozenEffect.prototype.apply_post_turn_effect = function(xoff, yoff){
	var final_damage = Math.round(Math.random()*5 + this.att.stats.POW*0.2);
	this.vic.stats.curr_hp -= final_damage;

	this.world.soundCache.play_sound("blast");
    var psparams = new app.display.ParticleSystemParams( this.vic.x, this.vic.y );
    psparams.variance = 0;
    psparams.ubiquity = 1;
    psparams.damage = final_damage;
    psparams.xpos_func = function(){ return this.vic.x+xoff; }.bind(this);
    psparams.ypos_func = function(){ return this.vic.y+yoff; }.bind(this);
    psparams.xvel_func = function(){ return 0; }.bind(this);
    psparams.yvel_func = function(){ return 0; }.bind(this);
    psparams.lifetime  = function(){ return 7; }.bind(this);
    psparams.isAnimated = false;
    this.world.add_particle_system( this.vic.x, this.vic.y, "iced", "splash", psparams ); 

    this.state.wMode.cAP = 0;
    this.vic.action_points = 0; 	
};

var HastedEffect = app.world.HastedEffect = 
	function(vic_name, att_name, display, world, state){
	AbstractEffect.call(this, "se_hasted", vic_name, att_name, display, world);

	this.name = "Hasted";
	this.state = state;

	this.stats.SPD = Math.round( Math.floor(Math.random()*10)+1+(this.att.stats.POW*0.5));

	this.decay_turn = Math.round( 
		Math.floor(Math.random()*3)+1+
		(this.att.stats.POW*0.03)*Math.floor(Math.random()*10)
	);
};

HastedEffect.prototype = app.extend(AbstractEffect); 

HastedEffect.prototype.apply_pre_turn_effect = function(){
    this.state.wMode.cAP += 2 + Math.round((this.att.stats.POW*0.1));
    this.vic.action_points = this.state.wMode.cAP; 	
};

var ShieldedEffect = app.world.ShieldedEffect = 
	function(vic_name, att_name, display, world, state){
	AbstractEffect.call(this, "se_shielded", vic_name, att_name, display, world);

	this.name = "Shielded";
	this.state = state;

	this.stats.RES = Math.round( Math.floor(Math.random()*10)+1+(this.att.stats.POW*0.5));
	this.stats.FOR = Math.round( Math.floor(Math.random()*10)+1+(this.att.stats.POW*0.5));

	this.decay_turn = Math.round(
		Math.floor(Math.random()*3)+1+
		(this.att.stats.POW*0.03)*Math.floor(Math.random()*10)
	);
};

ShieldedEffect.prototype = app.extend(AbstractEffect); 

var CursedEffect = app.world.CursedEffect = 
	function(vic_name, att_name, display, world, state){
	AbstractEffect.call(this, "se_cursed", vic_name, att_name, display, world);

	this.name = "Cursed";
	this.state = state;

	this.stats.SPD = -Math.round( 
		Math.floor(Math.random()*10)+1+(this.att.stats.SPD*0.5)
	);
	this.stats.POW = -Math.round( 
		Math.floor(Math.random()*10)+1+(this.att.stats.POW*0.5)
	);
	this.stats.ACC = -Math.round( 
		Math.floor(Math.random()*10)+1+(this.att.stats.ACC*0.5)
	);

	this.decay_turn = Math.round( 
		Math.floor(Math.random()*3)+1+
		(this.att.stats.POW*0.03)*Math.floor(Math.random()*10)
	);
};

CursedEffect.prototype = app.extend(AbstractEffect); 

var BlessedEffect = app.world.BlessedEffect = 
	function(vic_name, att_name, display, world, state){
	AbstractEffect.call(this, "se_blessed", vic_name, att_name, display, world);

	this.name = "Blessed";
	this.state = state;

	this.stats.SPD = Math.round( Math.floor(Math.random()*10)+1+(this.att.stats.SPD*0.5));
	this.stats.POW = Math.round( Math.floor(Math.random()*10)+1+(this.att.stats.POW*0.5));
	this.stats.ACC = Math.round( Math.floor(Math.random()*10)+1+(this.att.stats.ACC*0.5));

	this.decay_turn = Math.round(
		Math.floor(Math.random()*3)+1+
		(this.att.stats.POW*0.03)*Math.floor(Math.random()*10)
	);
};

BlessedEffect.prototype = app.extend(AbstractEffect); 

})();