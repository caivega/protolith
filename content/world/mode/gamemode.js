/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var GameMode = app.world.mode.GameMode = function(state, world, ui){
    this.world = world;
    this.ui = ui;
    this.state = state;
	this.engine = new app.world.CombatEngine(world, state, this);
	this.player = null;
    this.stop = false;

	this.cind = 0;			//index of the current actor in this class's list
	this.cactor = null;		//reference to the current actor
	this.actionlist = [];	//list of functions that are to be called by timeouts
	this.acceptingcommands = true;
    this.controlsenabled = true;
    this.controldelay = 240;
    this.logging = false;

    this.lastaction = "none";

    this.walkdelay = 240; //ms delay between keypress actions

    this.aicallback = function(){};
};

GameMode.prototype.get_instance = function(){
    if( this instanceof app.world.mode.CombatMode ){
        return "combat";
    } else if ( this instanceof app.world.mode.TownMode ){
        return "town";
    } else if( this instanceof app.world.mode.OutsideMode ){
        return "outside";
    } else {
        return "none";
    }
};

GameMode.prototype.log = function(){
    if( this.logging ){
        console.log.apply(console, arguments);
    }
};

GameMode.prototype.log_attack = function( action, victim ){
    function remove_underscore(name){
      	var tmp1 = name.search("_");
        var msg = name;
	    if( tmp1 !== -1 ){
	        msg = name.substring(0, tmp1);
	    }
        return name;
    }

    var myname = remove_underscore( this.cactor.name );
    var vicname = remove_underscore( victim.name );
    this.log("COMBAT", myname+" "+action+" "+vicname+".");
};

GameMode.prototype.init_actors = function(){
    this.player = this.state.player;
    this.player.change_mode( this.get_instance(), this.world );

	this.actors = [];
	var pcs = this.player.get_chars_visual();
	for( var i in pcs ){
        pcs[i].ap = 4;
		this.actors.push( pcs[i] );
	}

	for( var i in this.world.characters ){
		if( this.world.characters[i].isAlive && this.world.characters[i].isNPC ){
			this.world.characters[i].ap = 4;
			this.actors.push( this.world.characters[i] );
		}
	}

    if( this.get_instance() === "town" ){
        var nf = this.player.get_not_first();
        for( var i in nf ){
            nf[i].set(0, 0);
        }
    }
};

GameMode.prototype.start = function(){
    this.begin_round();
};

GameMode.prototype.begin_round = function(){
    if( this.logging ){
        console.log("BEGIN ROUND", this);
    }
    this.acceptingcommands = false;
	this.cind = -1;
	this.set_next_actor();
	this.begin_actor_turn();
};

GameMode.prototype.set_next_actor = function(){
	this.cind++;

	if( this.cind >= this.actors.length ){
        this.end_round();
        return false;
	}
	this.cactor = this.actors[ this.cind ];
	if( this.cactor === undefined || this.cactor === null ){
		console.error( "Combat Mode tried to set an undefined actor." );
        return false;
	} else {
        return true;
    }
};

GameMode.prototype.begin_actor_turn = function(think){
    this.log("BEGIN TURN", this.cactor.name);
    if( think ){
        if( this.cactor.is_visible() ){
            this.world.set_camera( this.cactor.x - 4, this.cactor.y - 4 );
        } else {
            think = false;
        }
    } else {
        if( !this.cactor.isNPC ){
            this.world.set_camera( this.cactor.x - 4, this.cactor.y - 4 );
        }
    }

	if( this.cactor.isNPC ){
		if( think ){
			setTimeout( this.aicallback, this.player.settings.playspeed );
		} else {
			this.aicallback();
		}
	} else {
        this.world.active_char = this.cactor.name;
		this.acceptingcommands = true;
		this.world.set_camera( this.cactor.x - 4, this.cactor.y - 4 );
        this.state.inter.update_location_variables();
        this.log("Wait for actions...");
	}
};

GameMode.prototype.end_actor_turn = function(){
    if( this.state.pausecombat ){
        setTimeout( function(){
            this.end_actor_turn();
        }.bind(this), 100);
        return;
    }

    var prevactor = this.cactor;

	this.check_dead();
	if( this.actionlist.length > 0 ){
		var action_func = this.actionlist.splice(0,1)[0];
		setTimeout( function(){
			action_func();
			this.end_actor_turn();
		}.bind(this), this.player.settings.playspeed);
	} else {
        this.log("END TURN",this.cactor.name, this.cactor.ap, this.get_instance());
		if( this.cactor.ap <= 0 ){
            var ret = this.set_next_actor();
			if( ret === false ){
                return;
            }
		}

        if( this.get_instance() === "combat" ){
            //if you are an npc your thinking time is at the beginning of the turn
            if( (this.cactor.isNPC && prevactor.isNPC) || this.lastaction === "wait" ){
                this.begin_actor_turn(true);
            } else {
                //gotta make sure the user can't double press keys accidentally
                setTimeout( function(){this.begin_actor_turn(true);}, this.walkdelay );
            }
        } else {
            this.begin_actor_turn();
        }
	}   
};

GameMode.prototype.check_dead = function(){
	var gonnors = [];
	for( var i in this.actors ){
		if( this.actors[i].stats.curr_hp < 0 ){
			this.actors[i].stats.curr_hp = 0;
            this.actors[i].isAlive = false;
			gonnors.push(i);
		}
	}	

    var check_game_over = function(ch){
        var act = this.player.get_first();
        if( act === "none" ){
            console.error( "EVERY PC IS DEAD" );
            this.stop = true;
            return;
        } 

        if( this instanceof app.world.mode.TownMode ){
            act.ap = 4;
            act.set( ch.x, ch.y );
            this.actors = [act].concat( this.actors );
        }
    }.bind(this);

    var _kill_character = function(ch){
        this.engine.kill_character( ch.name );
        if( !ch.isNPC ){
            check_game_over(ch);
        }        
    }.bind(this);

	for( var i in gonnors ){
		var ind = gonnors[i];
		var ch = this.actors.splice(ind-i, 1)[0]; 
        this.actionlist.push(_kill_character.bind(this, ch));
	}
};

GameMode.prototype.end_round = function(){
	if( this.actors.length === 0 ){ //dumb assert
		console.error("No actors found in combat list.");
		return; 
	}

	for( var i in this.actors ){
		this.actors[i].ap = 4;
	}

	//apply post round effects
	this.check_dead();
    if( this.stop ){
        return;
    }
	if( this.actionlist.length > 0 ){
		var action_func = this.actionlist.splice(0,1);
		setTimeout( function(){
			action_func();
			this.end_round();
		}.bind(this), this.player.settings.playspeed);
	} else {
        setTimeout( function(){
            this.begin_round();
        }.bind(this), this.walkdelay);
	}   
};

GameMode.prototype.trip_node = function(x, y){
    var node = this.world.get_node_by_position(x, y);
    if( node !== "none" ){
        if( !node.isDisabled ){
            node.perform_action();
        }
    }
};

//made so I can funnel all user input through this function and throttle when necessary
GameMode.prototype.do_action = function(action, ai){
    var ret = false;

	if( !ai && (!this.acceptingcommands || this.cactor.is_between_tiles) ){
		//console.log("Command throttled", action, this.acceptingcommands);
		return ret;
	}
	this.acceptingcommands = false;
	var args = Array.prototype.slice.call(arguments, 2);
    this.log.apply( this, [" - ACTION", action].concat(args) );

	if( action in this ){
        this.lastaction = action;
		ret = this[ action ].apply( this, args );
	} else {
		console.error("Tried to perform undefined action", action);
	}

	this.end_actor_turn();

    return ret;
};

GameMode.prototype.attack = function(){};

GameMode.prototype.move = function(dir){
    var act = this.cactor;

    act.set_default_sprite();  

    var old_x = act.x; var new_x = old_x;
    var old_y = act.y; var new_y = old_y;

    var newdir = "u"; var facing = "n";
    switch( dir ){
        case "n":  new_y = new_y-1;                  newdir = "u"; facing = "n"; break;
        case "ne": new_y = new_y-1; new_x = old_x+1; newdir = "r"; facing = "e"; break; 
        case "e":  new_x = new_x+1;                  newdir = "r"; facing = "e"; break;
        case "se": new_y = new_y+1; new_x = old_x+1; newdir = "r"; facing = "e"; break; 
        case "s":  new_y = new_y+1;                  newdir = "d"; facing = "s"; break;
        case "sw": new_y = new_y+1; new_x = old_x-1; newdir = "l"; facing = "w"; break;
        case "w":  new_x = new_x-1;                  newdir = "l"; facing = "w"; break; 
        case "nw": new_y = new_y-1; new_x = old_x-1; newdir = "l"; facing = "w"; break;
    }

    act.change_direction( newdir );
    var sq_new = this.world.get_tile(new_x, new_y);

    if( sq_new === undefined || sq_new === "none" ){
        console.error("Tried to move to an undefined square");
        return "none";    
    }

    var victimname = sq_new.has_character();
    if( !sq_new.isPassable ){
        victimname = "blocked!";
    } else {
        this.world.facing_dir = facing;
    }

    if( sq_new.is_closed_door()){
        sq_new.open_door();
        this.state.unpress_all_keys();
    }
    return {
    	name:victimname,
    	new_x:new_x,
    	new_y:new_y,
    	old_x:old_x,
    	old_y:old_y
    };
};

GameMode.prototype.shoot = function(){};
GameMode.prototype.cast = function(){};
GameMode.prototype.use = function(){};
GameMode.prototype.get_item = function(){};
GameMode.prototype.wait = function(){};

GameMode.prototype.talk = function( ch ){
    if( ch === "none" ){
        this.state.inter.disable_select();
        return;
    }

    if( ch.allegiance !== "ally" ){
        this.state.inter.notify( "This character is your enemy!" );
        this.state.inter.disable_select();
        return;
    }

    if( !ch.has_dialogue() ){
        this.state.inter.notify( "This character has nothing interesting to say." );
        this.state.inter.disable_select();
        return;
    }

    this.state.uistore.currentnpc = ch.name;
    this.state.inter.show_menu( "dialogue" );
};

GameMode.prototype.handle_control = function(dir){
    if( dir ){
        if( this.acceptingcommands && this.controlsenabled ){
            if( dir === "wait" ){
                this.do_action( "wait", false );
            } else {
                this.do_action( "move", false, dir );
            }
        }
    }
};

GameMode.prototype.keypress = function( ev ){
    var cpk = [];
    cpk[ev.keyCode] = true;

    if (cpk[27]) {
        //ESC
    }
    if (cpk[38]) {
        // UP ARROW
        this.do_action("move", false, "n");
    }
    if (cpk[40]) {
        // DOWN ARROW
        this.do_action("move", false, "s");
    } 
    if (cpk[37]) {
        // LEFT ARROW
        this.do_action("move", false, "w");
    } 
    if (cpk[39]) {
        // RIGHT ARROW
		this.do_action("move", false, "e");
    }   

    //NUMPAD CONTROLS
    if( cpk[105] ){
        //NUMPAD 9 UPRIGHT
        this.do_action("move", false, "ne");
    }
    if( cpk[99] ){
        //NUMPAD 3 DOWNRIGHT
        this.do_action("move", false, "se");
    }    
    if( cpk[97] ){
        //NUMPAD 1 DOWNLEFT
        this.do_action("move", false, "sw");
    } 
    if( cpk[103] ){
        //NUMPAD 7 UPLEFT
        this.do_action("move", false, "nw");
    }  
    if( cpk[104] ){
        // NUMPAD 8 UP
        this.do_action("move", false, "n");
    }
    if( cpk[98] ){
        // NUMPAD 2 DOWN
        this.do_action("move", false, "s");
    } 
    if( cpk[100] ){
        // NUMPAD 4 LEFT
        this.do_action("move", false, "w");
    } 
    if( cpk[101] ){
        // NUMPAD 5 CENTER
		this.do_action("wait");
    }    
    if( cpk[102] ){
        //NUMPAD 6 RIGHT
        this.do_action("move", false, "e");
    } 
};

GameMode.prototype.click = function(){};
GameMode.prototype.mousemove = function(){};

})();