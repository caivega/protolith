/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var Actor = app.world.actor.Actor = function(x, y, spr, name, display, world){
	this.sprite = spr;	
	this.name = name;
	this.display = display;
	this.world = world;
	this.x = x;
	this.y = y;

    this.isDead = false;

    this.tsqx = 9;
    this.tsqy = 9;

	this.FLAG_remove = false;

	this.isVisible = true;
};

Actor.prototype.act = function(){}; 	

Actor.prototype.draw = function(){
	if( this.isVisible ){
	    this.display.draw_sprite_scaled(
            this.sprite, 
            this.world.grid_to_pixw(this.x), 
            this.world.grid_to_pixh(this.y),
            this.world.gridw,
            this.world.gridh
        );   	
	}
};

Actor.prototype.is_on_screen = function(){
    var x = this.world.grid_to_pixw(this.x);
    var y = this.world.grid_to_pixh(this.y);
    //sprites are drawn from the top left, so you have to account for objects whose
    //bounding boxes are on the screen from the top left insead of the center
	if( x >= this.world.left - this.world.gridw && 
		y >= this.world.top - this.world.gridh && 
		x < this.world.right + this.world.gridw &&
		y < this.world.bottom + this.world.gridh ){
		return true;
	} else {
		return false;
	}
};

Actor.prototype.set = function(x, y){

    var old_x = parseInt(this.x);
    var old_y = parseInt(this.y);

    var new_x = parseInt(x);
    var new_y = parseInt(y);

    var sq_old = this.world?this.world.get_tile(old_x, old_y):undefined;
    var sq_new = this.world?this.world.get_tile(new_x, new_y):"none";

    //sq_old.add_content(this.name);
    if( sq_new != "none" ){
        sq_new.add_content(this.name);
        this.x = new_x;
        this.y = new_y;       
    } else {
    	console.log("Warning! Tried to set an actor to an undefined square.", 
            x, y, this.name);
    }      

    if( sq_old !== undefined ){
    	sq_old.remove_content( this.name );
    } else {
    	console.log("Warning! Tried to remove an actor from an undefined square.", 
            x, y);
    }
};

Actor.prototype.set_x = function(val){
	this.x = val;
};

Actor.prototype.set_y = function(val){
	this.y = val;
};

Actor.prototype.kill = function(){
    this.isDead = true;
    this.isAlive = false;

    this.stats.curr_hp = 0;
};

Actor.prototype.call_after_animation = function(func, args){
    if( this.world.particles.length === 0 && 
        this.world.projectiles.length === 0 && 
        this.world.splashes.length === 0 ){
        func(args);
    } else {
        setTimeout(function(){
            this.call_after_animation(func,args);
        }.bind(this),100);
    }
};

app.world.actor.Stats = function(){
	this.max_hp = 17;
	this.curr_hp = 17;
	this.max_mp = 0;
	this.curr_mp = 0;
	this.attack = 10;

    this.POW = 1;
    this.ACC = 1;
    this.FOR = 1;
    this.CON = 1;
    this.RES = 1;
    this.SPD = 1;
    this.EVA = 1;
};

})();