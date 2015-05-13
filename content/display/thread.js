/* jshint browser: true */
/* global app, window */

(function(){
"use strict";

var Thread = app.display.Thread = function(display){
	this.display = display;
    if( app.game ){
        this.timer = new app.game.Timer();
    } else {
        this.timer = {
            time: function(){},
            timeEnd: function(){}
        };
    }
    this.fpsframe = 0;
    this.displayedfps = 0;
    this.intervalid = -1;
    this.func = function(){};
};

Thread.prototype.begin_interval = function(func){
	if( this.intervalid !== -1 ){
		this.stop_interval();
	}
	this.func = func;
    if( this.display.fps === 60 ){
    	var intervalid = this.intervalid = app.random_id(5);
        var renderfunc = function render60Fps(){
            if( this.intervalid === intervalid ){
                window.requestAnimationFrame(renderfunc);
            } else {
                return;
            }
            this.begin_fps_time();
            func();
            this.end_fps_time();
        }.bind(this);
        renderfunc();
    } else {
        var waittime = 1000/this.display.fps;
        var intervalid = this.intervalid = setInterval( function renderCustomFps(){
            if( this.intervalid === intervalid ){
                this.begin_fps_time();
                func();
                this.end_fps_time();
            } else {
                clearInterval( intervalid );
            }         
        }.bind(this), waittime );
    }
};

Thread.prototype.stop_interval = function(){
    this.intervalid = -1;
};

Thread.prototype.begin_fps_time = function(){
    if( this.fpsframe === 0 ){
        this.timer.time( "fps" );
    }
};

Thread.prototype.end_fps_time = function(){
    this.display.draw_text_params(
        "FPS " + this.displayedfps, this.display.dimx / 2, 0, {
        color: "white",
        font: "monospace",
        size: "20",
        align: "left",
        shadowcolor: "black"
    });
    if( this.fpsframe === 59 ){
        var time = this.timer.timeEnd( "fps" );
        this.displayedfps = Math.round( 60 / (time/1000) );
        this.fpsframe = 0;
    } else {
        this.fpsframe++;
    }
};

})();