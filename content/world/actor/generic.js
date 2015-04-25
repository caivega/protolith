/* jshint browser: true */
/* global app  */

(function(){
"use strict";

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