/* jshint browser: true */
/* global app, console, window */

(function(){
"use strict";

var CutsceneState = app.game.CutsceneState = function( game, params ){
	app.game.AbstractState.call(this, game);
	var captain = this;
	var display = game.display;

	this.params = params;
	this.cutscene = window["CUTSCENE"+params.cutscene];
	this.nextstateparams = params.nextstateparams; 
	this.currentframe = this.cutscene.frames[0];

    this.uiElements = [];
    this.nextbutton = new app.ui.cButton(
    	372, 213, "StandardButtonUP", "donebutton", display,
        80, 30, "Next", 
        function(){ 
        	captain.set_frame(captain.currentframeind+1);
        }, 
        game
    ); 
    this.skipbutton = new app.ui.cButton(
    	372, 248, "StandardButtonUP", "skipbutton", display,
        80, 30, "Skip", 
	    function(){	
	    	captain.next_state();
	    }, 
        game
    ); 

	this.description = new app.ui.TextareaW(
		20,230, "sidk", "didk2", display, "Once upon a ti"+
		"me there was a man who sat next to a tree.  He had a book with him and he opene"+
		"d up the tome and read from it...", 335, 16, "Bedrock"
	);

	this.uiElements.push( this.nextbutton, this.description, this.skipbutton );

	this.currentframeind = 0;
	this.transitionstate = "none";

	this.fs = 5;
	this.animframe = 0;

	this.fadectr = 0;
	this.maxfadectr = 15;

    this.running = false;
};

CutsceneState.prototype = app.extend(app.game.AbstractState); 

CutsceneState.prototype.init = function(){
	//this.currentframeind = -1;
	this.transitionstate = "fade";
	this.description.text = this.currentframe.text;
    this.begin();
};

CutsceneState.prototype.begin = function(){
    this.resume();
};

CutsceneState.prototype.pause = function(){

};

CutsceneState.prototype.resume = function(){
    var captain = this;
    if( !captain.running ){
    	this.running = true;
	    (function step(){
	    	if( captain.running === true ){
		    	window.requestAnimationFrame(step); 
		    	captain.update(false); 
		    }
	    })();
	}
};

CutsceneState.prototype.update = function(){
    this.game.display.clear_area(0, 0, 472, 288);    
    if( this.transitionstate === "anim" ){
    	this.animate();
    } else if( this.transitionstate === "fade"){
    	this.fade();
    } else if( this.transitionstate === "dontdraw") {
    	this.game.display.draw(0, 0, 472, 288, "black");
    } else {
    	this.game.display.draw(0, 0, 472, 288, "white");
    	if( this.currentframeind >= 0 ){
    		this.draw_frame( this.currentframeind );
    	}
    }

    var d = this.description;
	this.game.display.draw(d.x-5, d.y-15, d.wid+5, 60, "#DEDEDE");

    for( var i in this.uiElements){
    	this.uiElements[i].draw();
    }
};

CutsceneState.prototype.draw_frame = function(ind){
	try{
	var meta = this.cutscene.meta;
	var imgstr = "CUTS"+this.cutscene.name+ind;
	var x = 0;
	var y = 0;
	x += parseInt(meta["layer"+(ind+2)].pos[0]);
	y += parseInt(meta["layer"+(ind+2)].pos[1]);
    this.game.display.draw_sprite(imgstr, x, y);
	} catch(e){
		console.error("ERROR: ind",ind,e.stack);
		this.running = false;
	}
};

CutsceneState.prototype.fade = function(){
	this.game.display.draw(0, 0, 472, 288, "white");

	var alpha = this.fadectr/this.maxfadectr;
	this.game.display.context.globalAlpha = 1.0-alpha;

	if( this.currentframeind !== 0 ){
		this.draw_frame(this.currentframeind-1);
	} else {
		this.game.display.draw(0, 0, 472, 288, "black");
	}
	this.game.display.context.globalAlpha = alpha;
	if( this.currentframeind < this.cutscene.numframes ){
		this.draw_frame(this.currentframeind);
	} else {
		this.game.display.draw(0, 0, 472, 288, "black");
	}

	this.game.display.context.globalAlpha = 1.0;

	this.fadectr++;
	if( this.fadectr > this.maxfadectr ){
		this.fadectr = this.maxfadectr;
		this.transitionstate = "none";
		if(this.currentframeind === -1){
			this.currentframeind = 0;
		}
	}
};

CutsceneState.prototype.animate = function(){
	this.game.display.draw(0, 0, 472, 288, "white");
	this.draw_frame(this.currentframeind);
    if( this.animframe >= this.fs ){
    	this.set_up_next_image();
    } else {
    	this.animframe++;
    }
} ;

CutsceneState.prototype.set_up_next_image = function(){
	var maxframeind = this.currentframe.toframe;
	this.animframe = 0;
	if( this.currentframeind >= maxframeind ){
		this.set_frame(maxframeind);
		this.transitionstate = "none";
	} else {
		this.currentframeind++;
	}
};

CutsceneState.prototype.destroy = function(){
	this.running = false;
}; 

CutsceneState.prototype.handleMouseClick = function(ev){
    var mouseX = ev.clientX;
    var mouseY = ev.clientY;

    for( var i in this.uiElements ){
    	var elem = this.uiElements[i];
    	if( elem.contains( mouseX, mouseY) ){
    		elem.click(mouseX, mouseY);
    	}
    }
};

CutsceneState.prototype.set_frame = function(i){
	if( i < 0 ){
		i = 0;
	}

	this.currentframeind = i;
	var prevframe = this.currentframe;
	this.currentframe = this.cutscene.frames[i];
	if( this.currentframeind >= this.cutscene.numframes ){
		this.next_state();
	} else if( this.currentframe === undefined ){
		this.currentframe = prevframe;
		if( this.currentframe.transition === "anim" ){
			this.transitionstate = "anim";
		}
	} else {
		this.description.text = this.currentframe.text;
		this.transitionstate = prevframe.transition;
		if( prevframe.transition === "anim"){
			this.animframe = 0;
		} else if( prevframe.transition === "fade" ){
			this.fadectr = 0;
		}
	}
};

CutsceneState.prototype.next_state = function(){
	console.log("NEXT STATE");
	this.description.text = "END SCENE";
	this.transitionstate = "dontdraw";

	this.game.change_state("WorldState", this.nextstateparams);
};

})();
