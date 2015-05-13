/* jshint browser: true */
/* global app  */

(function(){
"use strict";

var DamageIndicator = app.world.actor.DamageIndicator = 
    function(world, params){

    this.world = world;
    this.display = this.world.display;
    if( params.target ){
        this.target = params.target;
        this.x = this.world.grid_to_pixw( params.target.x );
        this.y = this.world.grid_to_pixh( params.target.y );
    } else {
        this.x = params.x;
        this.y = params.y;
    }
    this.isstatic = params.isstatic;
    this.sprite = [params.sprite];
    this.value = params.value;

    this.animation = new app.display.Animation( 
        this.display.get_anim_definition( 
            (this.isstatic?"Static":"Animated")+"DamageIndication" 
        )
    );

    this.frame = 0;
    this.numframes = this.animation.definition.numframes;
    this.removeme = false;
};

DamageIndicator.prototype.draw = function(){
    if( this.target ){
        this.x = this.world.grid_to_pixw( this.target.x );
        this.y = this.world.grid_to_pixh( this.target.y );
    }

    this.animation.draw_spritelist( this.sprite, this.x, this.y );
    this.display.draw_text_params(
        this.value, 
        this.x+this.world.gridw/2.5, 
        this.y+this.world.gridh/2, {
            font:"Verdana",
            color:"white",
            align:"center",
            shadowcolor:"black",
            size: app.ui.CleanUIElem.prototype.get_font_size.call( this, 12 )
        }
    );

    this.frame++;
    if( this.frame >= this.numframes ){
        this.removeme = true;
    }
};

var CombatIndicatorBox = app.world.actor.CombatIndicatorBox = 
    function(x, y, spr, name, display, world ){
	app.world.actor.Actor.call(this, x, y, spr, name, display, world);
};

CombatIndicatorBox.prototype = app.extend(app.world.actor.Actor); 

var Projectile = app.world.actor.Projectile = 
    function(me, victimXY, spr, name, display, world, type, onHit){
	app.world.actor.Actor.call(this, 0, 0, spr, name, display, world);

	this.lifetime = this.world.player.settings.playspeed*0.1;
	this.sl = this.lifetime;
	this.isAnimated = false;
	this.type = type;
	this.me = me;

	this.vicXY = victimXY;
	var act = this.world.get_character(me);
	this.me = me;
	this.meXY = [act.x, act.y];	

	this.onHit = onHit;
};

Projectile.prototype = new app.extend(app.world.actor.Actor);

Projectile.prototype.draw = function(){
    if(  this.lifetime > 0){
    	var app = "u";
        var x0 = this.world.grid_to_pixw( this.meXY[0] );
        var y0 = this.world.grid_to_pixh( this.meXY[1] ); 

        var x1 = this.world.grid_to_pixw( this.vicXY[0]);
        var y1 = this.world.grid_to_pixh( this.vicXY[1]);

        var xdist = x1 - x0;
        var ydist = y1 - y0;
        var mod = (this.sl-this.lifetime)/this.sl;

		var finalX = x0 + xdist*mod;
        var finalY = y0 + ydist*mod - (this.sl*2)*Math.abs(Math.sin(Math.PI*mod));

        var angle = Math.atan2(ydist, xdist);
        if( angle >= Math.PI/4 && angle < 3*Math.PI/4 ){
        	app = "d";
        } else if ( angle >= 3*Math.PI/4 || angle < -3*Math.PI/4 ){
        	app = "l";
        } else if ( angle >= -3*Math.PI/4 && angle < -Math.PI/4 ){
        	app = "u";
        } else{
        	app = "r";
        }

        this.x = finalX;
        this.y = finalY;
        this.lifetime--;

        this.world.set_camera( this.vicXY[0]-4, this.vicXY[1]-4);   

        this.display.draw_sprite(this.sprite + "_" + app, finalX, finalY);
    } else {
    	this.FLAG_remove = true;
    	this.onHit();
    }
};

})();