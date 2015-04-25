/* jshint browser: true */
/* global app */

(function(){
"use strict";

var FadeState = app.game.FadeState = function( game, params ){
	app.game.AbstractState.call(this, game);

    this.state1 = params.state1;
    this.state2 = params.state2;

    clearInterval(this.state1.interval);
    this.state1.isOn = false;   

    clearInterval(this.state2.interval);
    this.state2.isOn = false;   

    this.fadeframes = 20;      
};

FadeState.prototype = app.extend(app.game.AbstractState); 

FadeState.prototype.init = function(){
    this.frame = 0;
    this.resume();
};

FadeState.prototype.resume = function(){
    this.interval = setInterval(function(){
        this.update(false);
    }.bind(this),50);
};

FadeState.prototype.update = function(){
    var alpha = app.normalize( this.frame, 0, this.fadeframes, 0, 1);
    this.game.display.context.globalAlpha = 1.0-alpha;
    this.state1.draw();

    this.game.display.context.globalAlpha = alpha;
    this.state2.draw();

    if( alpha > 0.95 ){
        this.game.display.context.globalAlpha = 1.0;
        clearInterval( this.interval );
        this.state2.isOn = true;
        this.game.State = this.state2;
        this.state2.begin();
    }

    this.game.display.context.globalAlpha = 1.0;

    this.frame++; 
};

})();