/**
    \class TownMode
    \brief Holds the state of the game when it is in combat mode.

    Initialize a new combat state everytime the player initiates combat mode and destroy it
    every time the player leaves combat mode.  
*/
function TownMode(pc_list, npc_list, world, ui, game_state){

    this.world = world;
    this.ui = ui;
    this.game_state = game_state;

    this.combat_engine = new CombatEngine(world, game_state, this);

    //Combat Lists:
    //console.log( "PCLIST", 
    this.pcs = [];              //max 6 *or we could go more if I decide you can have more than 6 in a party
    for( var i in pc_list ){
        this.pcs.push( pc_list[i] );
    }
    this.npcs = [];             //max unlimited*
    for( var i in npc_list ){
        this.npcs.push( npc_list[i] );
    }    
    //this.allies = [];         //max unlimited*

    //combat oriented variables
    this.current_turn = 0;      //0=player turn, 1=enemy turn, 2=ally turn
    this.cActor = this.pcs[0]   //name of the current active actor
    this.cSpell = ""            //name of the current active spell
    this.curr_dspell = "";
    this.curr_lspell = "";
    this.cAP = 4;               //current action points
    this.cInd = 0;              //index of the current actor in the combat lists
    this.cDamage = 0;           //damage dealt during an attack

    this.dead_flag = false;

    this.world.active_char = this.pcs[0];

    this.playspeed = 200;       //the delay between actions in ms
    this.is_selecting_target = false;
    this.enemyinsight = false;

    //TEMP
    this.hold_input = false;

    //this.start_combat();
}

TownMode.prototype.start = function(){
    this.world.mbox.set_x( 100 );
    this.world.mbox.set_y( 100 );
    this.world.cbox.set_x( 100 );
    this.world.cbox.set_y( 100 );    
    this.align_pcs();
}

TownMode.prototype.is_everyone_dead = function(){
    var ret = false;
    for( var i in this.pcs ){
        var ret = ret || this.world.get_character(this.pcs[i]).isAlive;
    }

    return !ret;
}

TownMode.prototype.get_nearby_items = function(){
    var tiles = this.world.get_onscreen_tiles();

    var act = this.world.get_character( this.pcs[0] );
    var ret = [];

    for( var i in tiles ){
        var sq = tiles[i];
        var cont = sq.get_contents();
        for( var j in cont ){
            var item = this.world.itemCache.get_item(cont[j].substring( 0, cont[j].search("_") ));
            if( !(item === "none" ) ){
                if( this.world.determine_visibility(act.x, act.y, sq.x, sq.y, "blocksMove") && sq.isInSight ){
                    ret.push( {item:item, sq:sq, name:cont[j]} );
                }               
            }
        }        
    }

    return ret;
}

TownMode.prototype.call_after_animation = function(func, args){
    var captain = this;
    if( this.world.particles.length == 0 && this.world.projectiles.length == 0 && this.world.splashes.length == 0 ){
        func(args);
    } else {
        setTimeout(function(){
            captain.call_after_animation(func,args);
            captain.world.active_char = captain.pcs[0];
        },100);
    }
}

TownMode.prototype.align_pcs = function(){
    var head = this.world.get_character(this.cActor);
    for( var i in this.pcs ){
        var act = this.world.get_character(this.pcs[i]);
        act.set(head.x, head.y);
    }

    this.world.set_camera( head.x-4, head.y-4 );
}

TownMode.prototype.remv_character = function(fella, alleg){
    var captain = this;
    if( alleg == "player" || alleg == "ally" ){
        for( var i = 0; i < this.pcs.length; i++){
            if( this.pcs[i] == fella){
                this.world.dead_pcs.push( this.pcs.splice(i, 1) );
                console.log(fella +" is DEAD, splicing him", this.pcs);
                if( this.pcs.length < 1 ){
                    this.call_after_animation(function(unused){
                        alert("Uh oh, looks like all your characters are dead!");
                        captain.dead_flag = true;                 
                        captain.game_state.game.change_state("MenuState",{});    
                    }, "unused");
                
                }
                this.cActor = this.pcs[0];
            }
        }
    } else if( alleg == "enemy" ){
        for( var i = 0; i < this.npcs.length; i++){
            if( this.npcs[i] == fella){
                this.npcs.splice(i, 1);
            }
        }
    } else {
        console.log("ERROR: Allegience of "+fella+" ("+alleg+") has no case.");
    }
}

/**
    Perform a turn based on the given pc
*/
TownMode.prototype.player_turn = function(pc_name, type, data){ 
    var act = this.world.get_character(pc_name);

    switch(type){
        case "move": this.action_move(pc_name, data, false); break;
        case "magic": this.action_magic(pc_name, data); break;
        case "wait": act.action_points=0; this.next_actor(0); break;
    }

    //In town mode, after you do an action all the status effects are applied
    var captain = this;
    this.call_after_animation(function(){
        captain.game_state.disableInput = true;
        for( var i in captain.pcs ){
            var act = captain.world.get_character( captain.pcs[i] );
            act.apply_post_effects( function(){
                var act = captain.world.get_character( captain.world.active_char );
                captain.world.set_camera( act.x-4, act.y-4 );
                captain.combat_engine.regulate_all_health();
                captain.game_state.disableInput = false;
            }); 
        }
    }, this.playspeed);

}

TownMode.prototype.npc_turn = function(npc, ind){
    var captain = this;
    this.game_state.disableInput = true;
    var act = this.world.get_character(npc);
    //console.log("NPC TURN", npc, act.name);
    if( this.world.ai.town_action(npc, this) ){
        this.call_after_animation(function(){
            act.apply_post_effects(function(){
                captain.next_actor(ind+1);
            });            
        }, this.playspeed );

        if( this.enemyinsight === false ){
            this.game_state.warn.add_log("red","An enemy has spotted you!");
        }
        this.enemyinsight = true;
    } else {
        this.next_actor(ind+1);
        this.enemyinsight = false;
    }
}

TownMode.prototype.next_actor = function(ind){
    if( this.npcs.length < 1 ){
        //alert("Congratulations, you have completed the combat demo!");
        //this.dead_flag = true;                 
        //this.game_state.game.change_state("MenuState",{});                    
    }

    if( ind >= this.npcs.length ){ this.game_state.disableInput = false; return };
    this.npc_turn( this.npcs[ind], ind );
}

TownMode.prototype.action_magic = function(actor_name, spell_pkg){
	this.combat_engine.action_magic(actor_name, spell_pkg.victims, spell_pkg.name );

	var captain = this;
    this.call_after_animation(function(unused){
        captain.next_actor(0);
    }, "");
}

/**
    Move the actor in one square
*/
TownMode.prototype.action_move = function(actor_name, dir, ai){
    //var ind = get_actor_ind(cActor);
    var act = this.world.get_character(actor_name);
    if( act.is_between_tiles ) return;
    else act.set_default_sprite();

    var old_x = act.x;
    var old_y = act.y;

    var new_x = old_x;
    var new_y = old_y;

    switch( dir ){
        case "n":  new_y = new_y-1;                  act.change_direction( "u" ); break;
        case "ne": new_y = new_y-1; new_x = old_x+1; act.change_direction( "r" ); break; 
        case "e":  new_x = new_x+1;                  act.change_direction( "r" ); break;
        case "se": new_y = new_y+1; new_x = old_x+1; act.change_direction( "r" ); break; 
        case "s":  new_y = new_y+1;                  act.change_direction( "d" ); break;
        case "sw": new_y = new_y+1; new_x = old_x-1; act.change_direction( "l" ); break;
        case "w":  new_x = new_x-1;                  act.change_direction( "l" ); break; 
        case "nw": new_y = new_y-1; new_x = old_x-1; act.change_direction( "l" ); break;
    }

    var sq_old = this.world.get_square(old_x, old_y);
    var sq_new = this.world.get_square(new_x, new_y);

    //console.log(old_x, old_y, " d ", new_x, new_y);

    if( sq_new != undefined){

        // console.log("Error undefined sq_new: ",sq_new);
    } else {
        console.log("SQ_NEW ("+new_x+ ", " + new_y+") is undefined!"); 

        if( ai ){
            return false;
        }
    }

    if( sq_new == "none" ){
        return false;
    }

    var victim = sq_new.has_enemy_character(actor_name);

    if( !sq_new.isPassable ){
        victim = "blocked!";
    } 

    if( !ai && sq_new.is_closed_door()){
        sq_new.open_door();
        this.game_state.unpress_all_keys();
        return;
    }

    if( victim == "none" ){
        //clog(actor_name+": move "+dir+".  "+ (new_x-4)+", "+ (new_y-4));
        //act_set(cActor, new_x, new_y);
        this.game_state.game.soundCache.play_sound("footstep");
        act.set(new_x, new_y);
        act.walk_to_tile(old_x, old_y, new_x, new_y);
        if( !ai ){
            this.world.set_camera( new_x-4, new_y-4 );
        } else {
            return true;
        }
    } else if( victim == "blocked!"){
        if( !ai ){
            //clog("Blocked!");
        } else {
            return true;
        }
    } else {
        if( !ai ){
            clog("Somebody already occupies that space!");
        } else {
            if( victim.allegiance != act.allegiance ){
                this.combat_engine.action_attack(actor_name, victim);
                act.set_attack_sprite();     
            }       
            return true;
        }
    }

    if( !ai ){
        //Only the player can trip programmed nodes
        this.align_pcs();
        node = this.world.get_node_by_position(new_x, new_y);
        if( !(node === "none") ){
            if( !node.isDisabled )
                node.perform_action();
        }
        if( !( node instanceof SpChangeMap) ){
            this.next_actor(0);     
        } 

        //should probably move this to outside_mode.js
        if( this.world.params.mode == "outside" ){
            var tmp = this.world.name.split(".");
            var mapx = parseInt(tmp[0]);
            var mapy = parseInt(tmp[1]);
            if( new_x == 0 ){
                this.game_state.change_map( (mapx-1)+"."+mapy, 48, act.y, "outside"); 
            } else if( new_y == 0 ){
                this.game_state.change_map( mapx+"."+(mapy-1), act.x, 48, "outside"); 
            } else if( new_x == 49 ){
                this.game_state.change_map( (mapx+1)+"."+mapy, 1, act.y, "outside"); 
            } else if( new_y == 49 ){
                this.game_state.change_map( mapx+"."+(mapy+1), act.x, 1, "outside"); 
            }  
        } 
    } 

}

TownMode.prototype.handleKeyPress = function( ev ){

    var cpk = [];
    cpk[ev.keyCode] = true;

    var captain = this;

    // if(this.hold_input){
    //     return;
    // }


    if( this.game_state.disableMove ){
        return;
    }

    if (cpk[38]) {
        // UP ARROW
        if( this.current_turn == 0 )
            this.player_turn(this.cActor, "move","n");
        //ev.preventDefault();

        this.world.facing_dir = "n"; 
    }
    if (cpk[40]) {
        // DOWN ARROW
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","s");
        //ev.preventDefault();

        this.world.facing_dir = "s"; 
    } 
    if (cpk[37]) {
        // LEFT ARROW
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","w");
        //ev.preventDefault();

        this.world.facing_dir = "w"; 
    } 
    if (cpk[39]) {
        // RIGHT ARROW
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","e");
        //ev.preventDefault();

        this.world.facing_dir = "e"; 
    }
  
    if (cpk[81]) {
        //q
        //clearInterval(RUNNING_INTERVAL);

    } 
    //NUMPAD CONTROLS
    if( cpk[105] ){
        //NUMPAD 9 UPRIGHT
        if( this.current_turn == 0 )
            this.player_turn(this.cActor, "move","ne");

        this.world.facing_dir = "n"; 
    }
    if( cpk[99] ){
        //NUMPAD 3 DOWNRIGHT
        if( this.current_turn == 0 )
            this.player_turn(this.cActor, "move","se");

        this.world.facing_dir = "s"; 
    }    
    if( cpk[97] ){
        //NUMPAD 1 DOWNLEFT
        if( this.current_turn == 0 )
            this.player_turn(this.cActor, "move","sw");

        this.world.facing_dir = "s"; 
    } 
    if( cpk[103] ){
        //NUMPAD 7 UPLEFT
        if( this.current_turn == 0 )
            this.player_turn(this.cActor, "move","nw");

        this.world.facing_dir = "n"; 
    }  
    if (cpk[104]) {
        // NUMPAD 8 UP
        if( this.current_turn == 0 )
            this.player_turn(this.cActor, "move","n");
        //ev.preventDefault();

        this.world.facing_dir = "n"; 
    }
    if (cpk[98]) {
        // NUMPAD 2 DOWN
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","s");
        //ev.preventDefault();

        this.world.facing_dir = "s"; 
    } 
    if (cpk[100]) {
        // NUMPAD 4 LEFT
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","w");
        //ev.preventDefault();

        this.world.facing_dir = "w"; 
    } 
    if (cpk[102]) {
        //NUMPAD 6 RIGHT
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","e"); 
        //ev.preventDefault();

        this.world.facing_dir = "e"; 
    }     
    if (cpk[101]) {
        // NUMPAD 5 CENTER
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"wait","");
        //ev.preventDefault();
    }        

    // this.game_state.disableMove = true;
    // setTimeout( function(){ captain.game_state.disableMove = false }, 50); 
}  

TownMode.prototype.handleMouseClick = function( ev, off ){

    //console.log( "Cast - "+ this.cSpell );

    var mouseX = ev.clientX;
    var mouseY = ev.clientY;

    var gx = this.world.pix_to_gridw(mouseX);
    var gy = this.world.pix_to_gridh(mouseY);   

    if( this.game_state.selVisible ){
        var ch = this.world.get_character_by_position(gx, gy);
        var sq = this.world.get_square(gx, gy);
        this.game_state.onSelect(sq, ch); 
        this.game_state.exitSelectMode();
        this.next_actor(0);
        return;
    }

    var act = this.world.get_character( this.cActor );

    if( gx == act.x && gy == act.y ){
        this.player_turn(this.cActor, "wait", "");
    }

}

TownMode.prototype.handleMouseMove = function( ev, off ){

    var mouseX = ev.clientX - off.x;
    var mouseY = ev.clientY - off.y;

    //console.log( mouseX, mouseY );

    this.world.mbox.set_x( this.world.pix_to_gridw(mouseX) );
    this.world.mbox.set_y( this.world.pix_to_gridh(mouseY) );
}