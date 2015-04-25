/* jshint browser: true */
/* global app */

(function(){
"use strict";

var TransitionState = app.game.TransitionState = function( game, oncomplete){
	app.game.AbstractState.call(this, game);

    this.onfinish = oncomplete;

    this.notifs = [
        "Loading images...",
        "Setting objects...",
        "Enabling handlers...",
        "Writing to disk space...",
        "Creating rand tables...",
        "Analyzing productivity...",
        "Clearing memory...",
        "Initializing ui...",
        "Finishing..."
    ];
};

TransitionState.prototype = app.extend(app.game.AbstractState); 

TransitionState.prototype.init = function(){
    this.onfinish();
    // this.loadx = Math.floor(472/3);
    // this.loady = Math.floor(288*4/5);

    // this.eloadx = Math.floor(472/3 + 472/3);
    // this.vx = 30;

    // this.cloadx = 0;

    // this.frame = 0;
    // this.fs = 2;

    // this.begin();
};

TransitionState.prototype.begin = function(){
    this.resume();
};

TransitionState.prototype.resume = function(){
    this.interval = setInterval(function(){
        this.update(false);
    }.bind(this),50);
};

TransitionState.prototype.update = function(){
    var notif_ind = Math.floor(
        app.normalize( this.cloadx, 0, this.eloadx-this.loadx, 0, this.notifs.length)
    );

    this.game.display.clear_area(0, 0, 472, 288);

    this.game.display.draw_sprite_scaled("ProtolithPane", 0, 0, 472, 288 );
    this.game.display.draw(
        this.loadx-2, this.loady-2, this.eloadx-this.loadx+2, 14, "#343434"
    );
    this.game.display.draw(
        this.loadx, this.loady, this.cloadx, 10, "black"
    );
    this.game.display.draw_text(
        this.notifs[notif_ind], this.loadx*3/2, this.loady-5, 
        "Calibri", "#FFFFFF", "14", "Normal", false
    );

    if( this.frame == this.fs ){
        this.cloadx += this.vx;
        this.frame = 0;
    }

    if( this.loadx + this.cloadx >= this.eloadx ){
        clearInterval( this.interval );
        this.onfinish();
        //this.game.change_state(this.new_state, this.new_state_params);
    }

    this.frame++; 
};

})();