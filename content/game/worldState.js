/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var WorldState = app.game.WorldState = function( game, stateparams ){
	app.game.AbstractState.call(this, game);

    this.stateparams = stateparams;
    this.params = stateparams;

    this.isOn = true;
    this.forceQuit = false;
    this.intervalid = -1;

    this.player = new app.world.Player( this );
    this.timer = new app.game.Timer();
    this.fpsframe = 0;
    this.fps = 0;

    this.load_state_from_params(stateparams);

    this.disableMove = false;
    this.pausecombat = false;

    this.mx = 0;
    this.my = 0;

    this.constkeys = {
        38:true,
        40:true,
        37:true,
        39:true,
        97:true,
        98:true,
        99:true,
        100:true,
        102:true,
        103:true,
        104:true,
        105:true
    };

    this.cleanuielems = [];

    this.uistore = {
        pcselected: 0, //the index of the currently selected pc on the pclist
        menustate: "none", //the current menustate
        prevstate: "none", //the previous menustate (for animation logic)
        currentitem: null, //a ref to the current item for modals
        currentitemname: "none", //what the current item name for modals is
        currentspell: null,
        currentnpc: null,
        select:{
        	visible: false,
        	onselect: function(){},
            x:0,
            y:0
        },
        menus: {
            animating: false,
            beginanimation: false,
            transition: "menuslide",
            pickup:{
                nearbyitems: []
            },
            dark:{
                tab: 0
            },
            light:{
                tab: 0
            }
        },
        control: false, //which control is active 'n', 'ne', 'e', etc...
        actionbuttons:{
            a:{
                action: "none",
                pressed: false,
                disabled: false
            },
            b:{
                action: "none",
                pressed: false,
                disabled: false,
            }
        },
        clickedelem: false, //true if an element was clicked during 1 ev propogation,
        notification:{
            frames:0,
            message:"none"
        },
        mouse:{ 
            down:false,
            x:0,
            y:0,
        },
        modals: {
            reorder:{
                visible: false,
                disabled: false,
                animating: false
            },
            iteminfo:{
                visible: false,
                disabled: false,
                animating: false
            },
            equip:{
                visible: false,
                disabled: false,
                animating: false
            },
            give:{
                visible: false,
                disabled: false,
                animating: false
            },
            drop:{
                visible: false,
                disabled: false,
                animating: false
            },
            spellinfo:{
                visible: false,
                disabled: false,
                animating: false
            }
        }
    };

    this.inter = new app.world.Interface( this );

    this.actionfuncs = {};
    for( var i in app.world.Interface.prototype.actionfuncs ){
    	var func = app.world.Interface.prototype.actionfuncs[i];
    	this.actionfuncs[i] = func.bind(this.inter);
    }
};

WorldState.prototype = app.extend(app.game.AbstractState); 

WorldState.prototype.remake_ui = function(){
    this.cleanuielems = [];

    var list = [
        // app.ui.overlays.CleanPCListOverlay,
        // app.ui.overlays.CleanMovementOverlay,
        // app.ui.overlays.CleanMenuOverlay,
        // app.ui.overlays.CleanActionOverlay,
        // app.ui.overlays.CleanStatusOverlay,
        // app.ui.overlays.CleanInventoryOverlay,
        // app.ui.overlays.CleanDarkMagicOverlay,
        // app.ui.overlays.CleanLightMagicOverlay,
        // app.ui.overlays.CleanPickupOverlay,
        // app.ui.overlays.CleanDialogueOverlay,
        // app.ui.CleanNotification,
        // app.ui.CleanSelector
    ];

    for( var i in list ){
        this.cleanuielems.push( 
            new list[i]( this.game, this, this.game.display )
        );
    }
 
    this.world.recalculate_dims();
};

WorldState.prototype.load_state_from_params = function(stateparams){

    //transfer the data on dead npcs into each map's current state 
    for( var map_name in stateparams.maps_deadnpcs){
        var dead_npc_list = stateparams.maps_deadnpcs[map_name];
        var map_npcs = [];
        for( var j in dead_npc_list){
            if( dead_npc_list[j] !== null ){
                map_npcs.push(dead_npc_list[j]);
            }
        }
        this.game.map_loader.get_map_by_name(map_name).dead_npcs = map_npcs;
    }

    //transfer the data on executed nodes into each map's current state
    for( var map_name in stateparams.maps_nodesexecuted ){
        var nodes_exec = stateparams.maps_nodesexecuted[map_name];
        var map_nodes = [];
        for( var j in nodes_exec ){
            map_nodes.push(nodes_exec[j]);
        }
        this.game.map_loader.get_map_by_name(map_name).nodes_executed = map_nodes;
    }

    //transfer the data on visible tiles into each map's current state
    for( var map_name in stateparams.maps_visibletiles ){
        var loaded_vis_tiles = stateparams.maps_visibletiles[map_name];
        var map = this.game.map_loader.get_map_by_name(map_name);
        var mem_vis_tiles = this.game.map_loader.get_empty_MET(map);

        for( var x = 0; x < map.width; x++ ){
            for( var y = 0; y < map.height; y++){
                mem_vis_tiles[x][y] = loaded_vis_tiles[x][y]; 
            }      
        } 

        map.map_explored_table = mem_vis_tiles;
    }

    var worldparams = this.game.map_loader.get_map_params( stateparams.currentmap );

    this.world = new app.world.World(this.game.display, worldparams );

    this.player.load_pcs( stateparams.party );
    this.player.load_settings( stateparams.settings );
};

WorldState.prototype.init = function(dontstart){
    this.active_pc = this.player.get_first();
    this.world.init(this);  

    this.set_wmode();

    if( dontstart === false ){
	    this.begin();
    }

    //Must be created AFTER the ui
    //this.Shortcut = new WorldStateShortcut(this);

    this.game.soundCache.stop_all();
    this.game.soundCache.loop_sound("ambient1");
};

WorldState.prototype.begin = function(){
    this.wMode.start();
    var keythrottle = 0;
	var wsinterval = function(){
 		if( this.forceQuit ){
            return;
        }

        if( this.fpsframe === 0 ){
            this.timer.time( "fps" );
        }

		window.requestAnimationFrame(wsinterval); 
		if( keythrottle === 0 ){
		    keythrottle = 5;
            for( var i in this.game.keys ){
	           if( this.constkeys[i] === true && this.game.keys[i] === true){
	           	   this.handleKeyPress({which:i, keyCode:i});
	           } 
            }
    	} else { 
            keythrottle--;
    	}

		this.draw();

        this.game.display.draw_text_params("FPS " + this.fps, this.world.left + 5, 0, {
            color: "white",
            font: "monospace",
            size: "20",
            align: "left",
            shadowcolor: "black"
        });

        if( this.fpsframe === 59 ){
            var time = this.timer.timeEnd( "fps" );
            this.fps = Math.round( 60 / (time/1000) );
            this.fpsframe = 0;
        } else {
            this.fpsframe++;
        }
	}.bind(this);
    wsinterval();
};


var x = 0;
var y = 0;
var vx = 5;
var vy = 5;
WorldState.prototype.draw = function(){
	var w = 200;
	var h = 200;
	var c = "green";

	this.game.display.clear_screen();
	this.game.display.draw_rect_params( {
		x: x,
		y: y,
		width: w,
		height: h,
		color: c
	});

	x += vx;
	y += vy;

	if( x > this.game.display.dimx || x < 0 ){
		vx = -vx;
	}
	if( y > this.game.display.dimy || y < 0 ){
		vy = -vy;
	}


    // this.update();

    // if( this.uistore.menustate === "none" ){
    //     this.world.draw( this.wMode );
    // }

    // for( var i in this.cleanuielems ){
    //     this.cleanuielems[i].draw();
    // }
};

WorldState.prototype.update = function(){
    this.inter.handle_action();
    this.wMode.handle_control( this.uistore.control );
};

WorldState.prototype.random_id = function(len){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghigklmnopqrstufwxyz1234567890";
    for( var i = 0; i < len; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

WorldState.prototype.change_map = function(map_name, loc_x, loc_y){
    var map_params = this.game.map_loader.get_map_params(map_name);

    var prev_params = this.game.map_loader.get_map_by_name( this.world.name );
    prev_params.map_explored_table = this.world.map_explored_table;

    this.world.params = map_params;
    console.log("Change map to ", this.world.params);

    this.en_list = [];
    if( this.world.params.npcs !== "none" ){
        for( var i in this.world.params.npcs ){
            if( !app.inArr( this.world.params.npcs[i], this.world.params.dead_npcs )) {
                this.en_list.push( this.world.params.npcs[i].name );
            }        
        }  
    }

    this.world.init(this);
    this.params.mode = this.world.params.mode;
    this.set_wmode();
    this.wMode.start();    

    var act = this.world.get_character( this.player.get_first() );

    act.set(parseInt(loc_x), parseInt(loc_y));
    this.world.set_camera( parseInt(loc_x)-4, parseInt(loc_y)-4);   
};

WorldState.prototype.set_wmode = function(mode){
    if( mode === undefined ){
        this.set_wmode( this.params.mode );
        return;
    }
    
    if( mode === "town" ){
        this.wMode = new app.world.mode.TownMode( this, this.world, this.ui );
    } else if( mode === "combat" ){
        this.wMode = new app.world.mode.CombatMode( this, this.world, this.ui );
    } else if( mode === "outside" ){
        this.wMode = new app.world.mode.OutsideMode( this, this.world, this.ui );
    }
    this.wMode.init_actors();
};

WorldState.prototype.toggle_wmode = function(){
    if( this.wMode instanceof app.world.mode.CombatMode ){
        this.game.soundCache.play_sound("exitcombat");
        this.params.mode = "town";
        this.set_wmode();
        this.wMode.start();  
    } else {
        this.game.soundCache.play_sound("startcombat");
        this.params.mode = "combat";
        this.set_wmode();
        this.wMode.start();   
    } 
};

WorldState.prototype.pause_combat = function(){
    this.pausecombat = true;
};

WorldState.prototype.unpause_combat = function(){
    this.pausecombat = false;
};

WorldState.prototype.destroy = function(){
	this.forceQuit = true;
};

WorldState.prototype.handleKeyPress = function(){
};

WorldState.prototype.handleMouseClick = function(ev){
    var mouseX = ev.clientX;
    var mouseY = ev.clientY;

    this.uistore.mouse.down = true;
    this.uistore.mouse.x = mouseX;
    this.uistore.mouse.y = mouseY;

    for( var i in this.cleanuielems ){
        if( this.cleanuielems[ i ].propogate_click( ev.clientX, ev.clientY ) ){
            this.uistore.clickedelem = true;
            this.uistore.mouse.down = false;
            break;
        }
    }

    //this.wMode.click(ev, off);
};

WorldState.prototype.handleMouseUnclick = function(){
    this.uistore.mouse.down = false;

    if( this.uistore.clickedelem ){
        this.uistore.clickedelem = false;
        return;
    }
    for( var i in this.cleanuielems ){
        if( this.cleanuielems[ i ].propogate_unclick() ){
            break;
        }
    }
};

WorldState.prototype.handleMouseMove = function(ev){
    var mouseX = ev.clientX;
    var mouseY = ev.clientY;

    this.uistore.mouse.x = mouseX;
    this.uistore.mouse.y = mouseY;

    //this.wMode.mousemove(ev, off);
};

WorldState.prototype.unpress_all_keys = function(){
    for( var i in this.constkeys ){
        this.game.keys[i] = false;
    }
};

})();