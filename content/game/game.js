/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

app.game = {};

var draw_loading = app.game.draw_loading = function(game, ratio){
    var context = {display:game.display};
    var bgx = 0;
    var bgy = 0;
    var bgw = app.ui.CleanUIElem.prototype.to_x_ratio.call( context, 472 );
    var bgh = app.ui.CleanUIElem.prototype.to_y_ratio.call( context, 288 );

    var textx = app.ui.CleanUIElem.prototype.to_x_ratio.call( context, 472/2 );
    var texty = app.ui.CleanUIElem.prototype.to_y_ratio.call( context, 288/3 );

    var lbgx = app.ui.CleanUIElem.prototype.to_x_ratio.call( context, 10 );
    var lbgy = app.ui.CleanUIElem.prototype.to_y_ratio.call( context, 130 );
    var lbgw = app.ui.CleanUIElem.prototype.to_x_ratio.call( context, 472-20 );
    var lbgh = app.ui.CleanUIElem.prototype.to_y_ratio.call( context, 40 );

    var lx = app.ui.CleanUIElem.prototype.to_x_ratio.call( context, 15 );
    var ly = app.ui.CleanUIElem.prototype.to_y_ratio.call( context, 140 );
    var lw = app.ui.CleanUIElem.prototype.to_x_ratio.call( context, ratio );
    var lh = app.ui.CleanUIElem.prototype.to_y_ratio.call( context, 40 - 20 );
    game.display.draw(bgx, bgy, bgw, bgh, "black");
    game.display.draw_text_params( "Loading...", textx, texty, {
        font:"Verdana",
        color:"red",
        size:"16",
        align:"center"
    });
    game.display.draw(lbgx, lbgy, lbgw, lbgh, "white");
    game.display.draw(lx, ly, lw, lh, "grey");
};

function load_game(game) { 
    var running = true;
    (function ld(){
        if( running === false ){
            return;
        }

        window.requestAnimationFrame(ld); 
        var rdy = game.is_ready();
        var ratio = app.normalize(rdy.curr, 0, rdy.max, 10, 472-30);
        if(rdy.is_ready){
            running = false;
            game.change_state("TEST_IngameState", {});
        } else {
            app.game.draw_loading(game, ratio);
        }
    })();
}

// function load_game(game) { 
//     var running = true;
//     console.log("LOAD THE GAME");
//     (function ld(){
//     	if( running === false ){
//             return;
//         }

//         window.requestAnimationFrame(ld); 
//         var rdy = game.is_ready();

// 	    if(rdy.is_ready){
// 	        console.log("BEGIN");
// 	        running = false;
// 	        //game.change_state("MenuState", {});
// 	    } else {
//             draw_loading();
// 	    }
// 	})();
// }

var Game = app.game.Game = function(){

    /* jshint ignore:start */
    window.oref = this;
    /* jshint ignore:end */

    this.options = {
        enableSounds:true,
        enableMusic:false,
        hardMode:false
    };

    this.map_loader = new app.maps.MapLoader();
    this.display = new app.display.Display("benj");

    draw_loading(this, 0);

    this.state = new app.game.LoadingState( this );
    this.Save = new app.save.SaveGame();   
    this.soundCache = new app.sound.SoundCache(this);
    this.CutsLoader = new app.cutscenes.CutsceneLoader(this.display);
    this.CutsLoader.load_cutscene_meta();
    load_game(this);

    app.ui.UIElement.prototype.soundCache = this.soundCache;
    
    this.mouseDown = false;

	Game.prototype.keyboard = null;

    this.initEventHandlers();
    this.keys = {};
};

Game.prototype.load_save = function(src){
    this.change_state("LoadingState");
    this.Save.load_save_disk(src, this);
};

Game.prototype.stop_sound = function(){
    this.soundCache.stop_all();
};

Game.prototype.enable_music = function(){
    this.soundCache.loop_sound("protoliththeme");
};

Game.prototype.initEventHandlers = function(){
    document.onkeydown = function(ev){
        this.handleKeyDown(ev);

        if( ev.keyCode === 82 && ev.ctrlKey || ev.keyCode === 116){
        	console.log("CTRL R PRESSED");
            return;
        }        

        if( ev.which !== 187 && ev.which !== 189 && ev.which !== 17 ){
            ev.preventDefault();
        }
    }.bind(this);

    document.onkeyup = function(ev){
        this.handleKeyUp(ev);
    }.bind(this);

    this.display.canvas.onmousemove = function(ev){  
        this.handleMouseMove(ev);
        return false;
    }.bind(this);

    this.display.canvas.onmousedown = function(ev){
        this.mouseDown = true;
        this.handleMouseClick( ev );   

        return false;
    }.bind(this);    

    this.display.canvas.onmouseup = function(ev){
        this.mouseDown = false;
        this.handleMouseUnclick(ev);
        return false;
    }.bind(this); 

    document.addEventListener('touchstart', function(e) {
        var touch = e.touches[0];
        var ev = {clientX:touch.pageX, clientY:touch.pageY};
        this.handleMouseClick(ev);        
    }.bind(this), false); 

    document.addEventListener('touchstart', function(e) {
        var touch = e.touches[0];
        var ev = {clientX:touch.pageX, clientY:touch.pageY};
        this.handleMouseMove(ev);        
    }.bind(this), false); 

    document.addEventListener('touchend', function() {
        this.handleMouseUnclick();
    }.bind(this), false); 
};

Game.prototype.handleKeyDown = function(ev){

    if( ev.which == 112 ){  //p
        if( this.state.isRunning ){
            this.state.pause();
        } else {
            this.state.resume();
        }
    }

    this.keys[ev.which] = true;

    this.state.handleKeyPress(ev);
};

Game.prototype.handleKeyUp = function(ev){
    this.keys[ev.which] = false;
    if( "handleKeyUp" in this.state ){
    	this.state.handleKeyUp(ev);
    }
};

Game.prototype.handleMouseClick = function(ev) {
    this.state.handleMouseClick(ev);
};

Game.prototype.handleMouseUnclick = function(ev) {
    this.state.handleMouseUnclick(ev);
};

Game.prototype.handleMouseMove = function(ev) {
    this.state.handleMouseMove(ev);
};

Game.prototype.is_ready = function(){
    var disp = this.display.is_ready();
    var mapl = /*//this.map_loader.is_ready();*/{is_ready:true,max:1,curr:1};
    var soun = {is_ready:true,max:1,curr:1};//this.soundCache.is_ready();

    return {
        is_ready:disp.is_ready && mapl.is_ready && soun.is_ready,
        max:disp.max+mapl.max+soun.max,
        curr:disp.curr+mapl.curr+soun.curr
    };
};

Game.prototype.get_dummy_party = function(){
    var ids = ["POW", "ACC", "FOR", "CON", "RES", "SPD", "EVA"];
    var ret = {
        pc0:{stats:{}},
        pc1:{stats:{}},
        pc2:{stats:{}}
    };

    for( var i in ids ){
        ret.pc0.stats[ids[i]] = 1;
        ret.pc1.stats[ids[i]] = 1;
        ret.pc2.stats[ids[i]] = 1;
    }

    ret.pc0.name = "actor0";
    ret.pc1.name = "actor1";
    ret.pc2.name = "actor2";

    ret.pc0.sprite = "black_knight";
    ret.pc1.sprite = "black_knight";
    ret.pc2.sprite = "black_knight";

    return ret;    
};

Game.prototype.change_state = function(state_name, state_params){
	if( this.state !== undefined ){
		if( this.state.intervalid ){
            clearInterval( this.state.intervalid );
        }

		this.state.destroy();
	}

    var _set_state_by_name = function(){
        if( app.game[ state_name ] === undefined ){
            console.error("No state instance of the name '"+state_name+"' exists.");
            this.state = new app.game.MenuState(this);
            return;
        }

        this.state = new app.game[ state_name ]( this, state_params );
    };

    switch( state_name ){
        case "CreatePartyState": 
            this.state = new app.game.CreatePartyState(this, state_params ); 
            break;
        case "WorldState": 
            this.state = new app.game.WorldState(this, state_params ); 
            break;
        case "EditState": 
            this.state = new app.game.EditState(
                this, this.Save.create_new_game(this.get_dummy_party(), this )
            ); 
            break;
        case "LoadingState": 
            this.state = new app.game.LoadingState(this); 
            break;
        case "MenuState": 
            this.state = new app.game.MenuState(this); 
            break;
        case "TransitionState": 
            this.state = new app.game.TransitionState(this, state_params); 
            break;
        case "FadeState": 
            this.state = new app.game.FadeState(this, state_params); 
            break;
        case "CutsceneState": 
            this.state = new app.game.CutsceneState(this, state_params); 
            break;
        default: _set_state_by_name.call(this);
    }

    this.start();
};

Game.prototype.create = function(state_params){
    this.change_state( "CreatePartyState", state_params );
};

Game.prototype.start = function(){
    this.state.init();
};

Game.prototype.remake_ui = function(){
    if( this.state && this.state.remake_ui ){
        this.state.remake_ui();
    }
};

})();