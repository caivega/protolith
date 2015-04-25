/**
    \class CombatMode
    \brief Holds the state of the game when it is in combat mode.

    Initialize a new combat state everytime the player initiates combat mode and destroy it
    every time the player leaves combat mode.  
*/
function CombatMode(pc_list, enemy_list, world, ui, game_state){

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
    this.npcs = [];          //max unlimited*
    for( var i in enemy_list ){
        this.npcs.push( enemy_list[i] );
    }    
    //this.allies = [];         //max unlimited*

    //combat oriented variables
    this.current_turn = 0;      //0=player turn, 1=enemy turn, 2=ally turn
    this.cActor = ""            //name of the current active actor
    this.cSpell = ""            //name of the current active spell
    this.curr_dspell = "";
    this.curr_lspell = "";
    this.cAP = 4;               //current action points
    this.cInd = 0;              //index of the current actor in the combat lists
    this.cDamage = 0;           //damage dealt during an attack
    this.cDeath = "";
    this.cDamageType = "physical";
    this.variance = 9           //how much the randomness of the attack varies

    this.dead_flag = false;

    this.playspeed = 50;       //the delay between actions in ms
    this.is_selecting_target = false;

    //TEMP
    this.hold_input = false;

    //this.start_combat();
}

//when you enter combat mode, you split off into your party and you can see everyone
//on the screen.  This function aligns the pcs in your party based on your facing 
//direction
CombatMode.prototype.align_pcs = function(){
    var act = this.world.get_character( this.pcs[0] );

    var xoffs;
    var yoffs;

    switch( this.world.facing_dir ){
        case "n": 
            xoffs = [0,-1,+1,-2,-0,+2];
            yoffs = [0,+1,+1,+2,+2,+2];
            break;
        case "s":
            xoffs = [0,+1,-1,+2,+0,-2];
            yoffs = [0,-1,-1,-2,-2,-2];
            break;
        case "e":
            xoffs = [0,-1,-1,-2,-2,-2];
            yoffs = [0,-1,+1,-2,-0,+2];
            break; 
        case "w":
            xoffs = [0,+1,+1,+2,+2,+2];
            yoffs = [0,+1,-1,+2,+0,-2];
            break;                       
    }

    for( var i in this.pcs ){
        var act2 = this.world.get_character( this.pcs[i] );
        var pos;
        if( i == 0 ){
            continue;
        } else if( i == 1 ) {
            pos = this.world.get_valid_pos( act.x+xoffs[i], act.y+yoffs[i] );
            if( pos === "none" ){
                pos = {x: act.x, y: act.y};
            }
        } else if( i == 2 ) {
            pos = this.world.get_valid_pos( act.x+xoffs[i], act.y+yoffs[i] );
            if( pos === "none" ){
                pos = {x: act.x, y: act.y};
            }
        }   else if( i == 3 ) {
            pos = this.world.get_valid_pos( act.x+xoffs[i], act.y+yoffs[i] );
            if( pos === "none" ){
                pos = {x: act.x, y: act.y};
            }
        }  else if( i == 4 ) {
            pos = this.world.get_valid_pos( act.x+xoffs[i], act.y+yoffs[i] );
            if( pos === "none" ){
                pos = {x: act.x, y: act.y};
            }
        }  else if( i == 5 ) {
            pos = this.world.get_valid_pos( act.x+xoffs[i], act.y+yoffs[i] );
            if( pos === "none" ){
                pos = {x: act.x, y: act.y};
            }
        } 

        act2.set(pos.x, pos.y);
    }
}

/**
    Set all variables to begin a combat sequence.  These include
    the current actor, the currently selected spells in the ui, 
    the bolded pc in the ui, and who's turn it is currently.
*/
CombatMode.prototype.start = function(){
    this.cActor = this.pcs[0];
    this.cInd = 0;
    this.cAP = 4;
    this.current_turn = 0;

    //console.log(this.pcs);

    this.reset_known_spells(this.cActor);
    this.reset_all_ap();
    //this.set_allegiance();

    this.current_turn = 0;
    this.hold_input = false;

    var act = this.world.get_character( this.cActor );
    this.world.cbox.set_x( act.x );
    this.world.cbox.set_y( act.y );

    this.align_pcs();

    //world.act_set("box", 3, 3);
}

CombatMode.prototype.is_everyone_dead = function(){
    var ret = false;
    for( var i in this.pcs ){
        var ret = ret || this.world.get_character(this.pcs[i]).isAlive;
    }

    return !ret;
}

CombatMode.prototype.get_nearby_items = function(){
    var tiles = this.world.get_adjacent_squares( this.cActor );
    var act = this.world.get_character( this.cActor );
    var ret = [];

    for( var i in tiles ){
        var sq = tiles[i];
        var cont = sq.get_contents();
        for( var j in cont ){
            var item = this.world.itemCache.get_item(cont[j].substring( 0, cont[j].search("_") ));
            if( !(item === "none" ) ){
                ret.push( {item:item, sq:sq, name:cont[j]} );            
            }
        }        
    }

    return ret;
}

CombatMode.prototype.call_after_animation = function(func, args){
    var captain = this;
    this.game_state.disableInput = true;
    if( this.world.particles.length == 0 && this.world.projectiles.length == 0 && this.world.splashes.length == 0 ){
        func(args);
        this.game_state.disableInput = false;
    } else {
        setTimeout(function(){
            captain.call_after_animation(func,args)
        },this.playspeed);
    }
}

/**
    Iterates through every combat entity and resets their
    action points to their maximum action points for this
    combat round
*/
CombatMode.prototype.reset_all_ap = function(){
    var act;
    for( var i in this.pcs ){
        act = this.world.get_character( this.pcs[i] );
        act.action_points = act.max_action_points;
    }

    for( var i in this.npcs ){
        act = this.world.get_character( this.npcs[i] );
        act.action_points = act.max_action_points;
    }    
}

/**
    Add a pc name to the list of pcs.  This actor must
    have been initialized by the world previously.
*/
CombatMode.prototype.add_pc = function(name){
    this.pcs.push(name);
    //this.ui_pcs.push(name);
    //console.log("PC ADDED", pcs)
}

/**
    Add an enemy name to the list of enemies.  This actor must
    have been initialized by the world previously.
*/
CombatMode.prototype.add_enemy = function(name){
    this.npcs.push(name);
}


/**
    Perform a turn with the given npc. Calls itself recursively
    until the npc has used all of its action points and then calls for
    a new active actor.
*/
CombatMode.prototype.npc_turn = function(npc_name){
    var captain = this;
    //Return if the game tries to do a turn using a pc and not an npc
    if( inArr(npc_name, this.pcs) ){
        console.log("WARNING Tried to automate a turn for player character "+npc_name);
        return;
    }

    if( this.npcs.length < 1 ){
        alert("Congratulations, you have completed the combat demo!");
        this.dead_flag = true;                 
        this.game_state.game.change_state("MenuState",{});                    
    }

    if( this.pcs.length < 1 ){
        alert("Uh oh, looks like all your characters are dead!");
        this.dead_flag = true;                 
        this.game_state.game.change_state("MenuState",{});                    
    }       

    this.world.active_char = npc_name;
    this.hold_input = true;

    var act = this.world.get_character(npc_name);
    if( act != "none!" || act.action_points > 0 ){
        console.log("GAME: Turn -> "+npc_name);

        this.world.ai.combat_action( npc_name, this );

        this.world.cbox.set_x( act.x );
        this.world.cbox.set_y( act.y );        

        if( act.action_points <= 0){
                       
            this.call_after_animation(function recurs(act2){
                act2.apply_post_effects(function(){
                    captain.next_actor();
                    var new_act = captain.world.get_character( captain.cActor );
                    new_act.apply_pre_effects();
                    captain.world.cbox.set_x( new_act.x );
                    captain.world.cbox.set_y( new_act.y );  
                });             
            },act);
        } else {
            setTimeout(function( ){
                captain.npc_turn( npc_name );
            }, 200);
        }
    } else {
        console.log("ERROR! World does not contain npc: "+npc_name);
    }   
}

/**
    Perform a turn based on the given pc
*/
CombatMode.prototype.player_turn = function(pc_name, type, data){ 
    var act = this.world.get_character(pc_name);

    this.world.active_char = pc_name;

    for( var i in this.pcs ){
        var act1 = this.world.get_character(this.pcs[i]);
        if( act1.is_between_tiles ) return;    
    }

    if( act.action_points <= 0){
        return;
    }

    switch(type){
        case "move": this.action_move(pc_name, data); break;
        case "magic": this.action_magic(pc_name, data); break;
        case "ranged": this.action_shoot(pc_name, data); break;
        case "wait": act.action_points=0;this.cAP=0; break;
    }

    this.world.cbox.set_x( act.x );
    this.world.cbox.set_y( act.y );

    if( act.action_points <= 0){
        var captain = this;

        this.call_after_animation(function recurs(act2){ 
            act2.apply_post_effects( function(){
                captain.next_actor();
                var new_act = captain.world.get_character( captain.cActor );
                new_act.apply_pre_effects();
                captain.world.cbox.set_x( new_act.x );
                captain.world.cbox.set_y( new_act.y );                              
                if( new_act.action_points <= 0 && captain.cInd < captain.pcs.length ){
                    if( inArr(new_act.name, captain.pcs) )
                        recurs(new_act);
                }  
            });              
        },act);
    }
    //combat_next_action()
}

CombatMode.prototype.action_shoot = function(actor_name, data){
	this.combat_engine.action_attack(actor_name, data.victim);	
} 

CombatMode.prototype.action_magic = function(actor_name, spell_pkg){
    var act = this.world.get_character(actor_name);
    act.action_points-=4;
	this.combat_engine.action_magic(actor_name, spell_pkg.victims, spell_pkg.name );
}

/**
    Move an actor 1 square in the direction specified.  Returns true if the 
    move was successful.  
*/
CombatMode.prototype.action_move = function(actor_name, dir, ai){
    var act = this.world.get_character(actor_name);

    act.set_default_sprite();  

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

    if( sq_new != undefined ){
        // console.log("Error undefined sq_new: ",sq_new);
    } else {
        console.log("SQ_NEW ("+new_x+ ", " + new_y+") is undefined!");
        return false;    
    }

     if( sq_new == "none" ){
        return false;
    }

    //victim name (string)
    var victim = sq_new.has_character(actor_name);

    if( !sq_new.isPassable ){
        victim = "blocked!";
    } 

    if( victim == "none" ){
        clog(actor_name+": move "+dir+".  "+ (new_x-4)+", "+ (new_y-4));
        //act_set(cActor, new_x, new_y);
        this.game_state.game.soundCache.play_sound("footstep");
        act.set(new_x, new_y);
        act.walk_to_tile(old_x, old_y, new_x, new_y);

        this.world.set_camera( new_x-4, new_y-4 );
        act.action_points--;
        this.cAP--;
        return true;   
    } else if( victim == "blocked!" || ( !ai && (inArr(victim, this.world.pc_list)) ) ){
        this.game_state.notif.add_log("WARNING","Somebody already occupies that space!");
        if( ai ){
            act.action_points--;
            this.cAP--;
        }
        return false;
    } else {

        var vic_obj = this.world.get_character(victim);
        if( vic_obj.allegiance == act.allegiance  ){   
            if( !ai ){
                var yes=confirm("This character is your ally, are you sure you want to attack?");
                if( !yes ){
                    this.game_state.notif.add_log("WARNING","Somebody already occupies that space!");
                    return false;
                }
                this.game_state.notif.add_log("WARNING","You have now angered everyone in this town and they will attack you on sight.");
                //alert("You have now angered everyone in this town and they will attack you on sight.");
                this.world.switch_npc_allegiance_to_enemy();
            } else {
                this.game_state.notif.add_log("WARNING","An NPC already occupies that space!");
                return false;
            }
        }

        var msgact1 = this.cActor;
        var tmp1;
        if( (tmp1 = msgact1.search("_")) != -1 ){
            msgact1 = msgact1.substring(0, tmp1);
        }
        var msgact2 = victim;
        var tmp2;
        if( (tmp2 = msgact2.search("_")) != -1 ){
            console.log("SUBSTRING", tmp2);
            msgact2 = msgact2.substring(0, tmp2);
        }        
        this.game_state.notif.add_log("COMBAT",msgact1+" attacks "+msgact2+"...");
        this.combat_engine.action_attack(actor_name, victim);
        act.action_points-=4;
        this.cAP-=4;

        act.set_attack_sprite();
        this.hold_input = true;
        this.world.hold(this.playspeed, function(){
            this.hold_input = false;
        });

        this.combat_engine.regulate_all_health();

        return true;
    }
}

/**
    Get the next active actor for a turn.  Called after completion 
    of a turn by a previous actor.
*/  
CombatMode.prototype.next_actor = function(){
    //console.log("turn"); 
    this.cInd++;
    var captain = this;
    if( this.current_turn == 0){

        while( this.cInd < this.pcs.length && this.world.get_character(this.pcs[this.cInd]).isDead )
            this.cInd++;

        if( this.cInd < this.pcs.length ){
            this.cActor = this.pcs[this.cInd];
            var act = this.world.get_character( this.cActor );
            this.world.set_camera( act.x-4, act.y-4 );

            //reset the spells for the current actor
            this.reset_known_spells(this.cActor); 

            this.cAP = 4;
        } else {
            //SWITCH TURNS
            this.current_turn = 1;
            this.cInd = 0;
            this.cAP = 4;
            if( this.npcs.length > 0 ){
                this.hold_input = true;
                this.game_state.notif.add_log("COMBAT","--ENEMY TURN--");
                this.cActor = this.npcs[this.cInd];
                if( !this.world.ai.is_player_in_sight(this.cActor, this.game_state) ){
                    this.cAP = 0;
                    captain.next_actor();
                    return;
                } else {       
                    this.world.hold(this.playspeed, function(){ 
                        captain.call_after_animation(function(){
                            captain.npc_turn(captain.npcs[captain.cInd]);
                        }, "");
                    });                              
                }                 
            } else { //if there are no enemies, go back to player turn
                console.log("Where are the enemies!?");
                this.current_turn = 0;
                this.hold_input = false;
                this.cActor = this.pcs[this.cInd]; 
                this.reset_known_spells(this.cActor); 
                this.reset_all_ap();                
            }
        }
    } else {
        if( this.cInd >= this.npcs.length ){
            //SWITCH TURNS
            this.game_state.notif.add_log("COMBAT","--PLAYER TURN--");
            this.current_turn = 0;
            this.cInd = 0;
            this.cAP = 4;
            this.cActor = this.pcs[this.cInd];
            this.reset_known_spells(this.cActor); 
            this.reset_all_ap();

            this.hold_input = false;          
        } else {

            this.cActor = this.npcs[this.cInd];
            this.cAP = 4;
            if( !this.world.ai.is_player_in_sight(this.cActor, this.game_state) ){
                this.cAP = 0;
                captain.next_actor();
                return;
            } else {                   
                this.world.hold(this.playspeed, function(){ 
                    captain.call_after_animation(function(){
                        captain.npc_turn(captain.npcs[captain.cInd]);
                    }, "");
                });  
            }   
        }   
    }

    var act = this.world.get_character( this.cActor );
    this.world.cbox.set_x( act.x );
    this.world.cbox.set_y( act.y );
    this.world.set_camera( act.x-4, act.y-4 );
    this.world.active_char = this.cActor;

    act.action_points = 4;

    this.game_state.resume(false);
}

/**
    Remove a character from the combat lists
*/
CombatMode.prototype.remv_character = function(fella, alleg){
    console.log("COMBAT REMOVE", fella);
    if( alleg == "player" || alleg == "ally"){
        for( var i = 0; i < this.pcs.length; i++){
            if( this.pcs[i] == fella){
                //this.pcs.splice(i, 1);
                this.world.dead_pcs.push( this.pcs.splice(i, 1) );
                if( this.pcs.length < 1 ){
                    alert("Uh oh, looks like all your characters are dead!");
                    this.dead_flag = true;                 
                    this.game_state.game.change_state("MenuState",{});                    
                }                
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
        // for( var i = 0; i < this.allies.length; i++){
        //     if( this.allies[i] == fella){
        //         this.allies.splice(i, 1);
        //     }
        // }
    }
}

/**
    Set the allegiance variable in all characters according to which combat
    list they are in.
*/
CombatMode.prototype.set_allegiance = function(){
    for( var i in this.pcs ){
        this.world.get_character( this.pcs[i] ).allegiance = "player";
    }

    for( var i in this.npcs ){
        this.world.get_character( this.npcs[i] ).allegiance = "enemy";
    }

    for( var i in this.allies ){
        this.world.get_character( this.allies[i] ).allegiance = "player";
    }        
}

/**
    Determine what the allegence of an character is in thsi combat state
    @param name String name of the character
*/
CombatMode.prototype.get_allegiance = function(name){ 
    if( inArr(name, this.pcs)){
        return "player";
    } else if( inArr(name, this.npcs)){
        return "enemy";
    } else {
        return "player";
    }
}

/**
    Set the ui and current spell to reflect those spells known
    by the given actor
*/
CombatMode.prototype.reset_known_spells = function(actor_name){
    var act = this.world.get_character(actor_name);
    //console.log("Getting char "+actor_name);
    this.cSpell = act.dspell;
}

CombatMode.prototype.handleKeyPress = function( ev ){
    var cpk = [];
    cpk[ev.keyCode] = true;

    // if(this.hold_input){
    //     return;
    // }


    if (cpk[27]) {
        //ESC
        if( selecting_magic_tile ){
            //[OVN_SELECT].isVisible = false;  
            //selecting_magic_tile = false;            
        }
    }
    if (cpk[38]) {
        // UP ARROW
        if( this.current_turn == 0 )
            this.player_turn(this.cActor, "move","n");
    }
    if (cpk[40]) {
        // DOWN ARROW
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","s");
    } 
    if (cpk[37]) {
        // LEFT ARROW
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","w");
    } 
    if (cpk[39]) {
        // RIGHT ARROW
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","e");
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
    }
    if( cpk[99] ){
        //NUMPAD 3 DOWNRIGHT
        if( this.current_turn == 0 )
            this.player_turn(this.cActor, "move","se");
    }    
    if( cpk[97] ){
        //NUMPAD 1 DOWNLEFT
        if( this.current_turn == 0 )
            this.player_turn(this.cActor, "move","sw");
    } 
    if( cpk[103] ){
        //NUMPAD 7 UPLEFT
        if( this.current_turn == 0 )
            this.player_turn(this.cActor, "move","nw");
    }  
    if (cpk[104]) {
        // NUMPAD 8 UP
        if( this.current_turn == 0 )
            this.player_turn(this.cActor, "move","n");
    }
    if (cpk[98]) {
        // NUMPAD 2 DOWN
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","s");
    } 
    if (cpk[100]) {
        // NUMPAD 4 LEFT
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","w");
    } 
    if (cpk[101]) {
        // NUMPAD 5 CENTER
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"wait","");
    }    
    if (cpk[102]) {
        //NUMPAD 6 RIGHT
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","e");
    }            
}  

CombatMode.prototype.handleMouseClick = function( ev, off ){
    var mouseX = ev.clientX;
    var mouseY = ev.clientY;

    var gx = this.world.pix_to_gridw(mouseX);
    var gy = this.world.pix_to_gridh(mouseY);   

    if( this.game_state.selVisible ){
        var ch = this.world.get_character_by_position(gx, gy);
        var sq = this.world.get_square(gx, gy);
        this.game_state.onSelect(sq, ch);
        this.game_state.exitSelectMode();
        return;
    }

    var act = this.world.get_character( this.cActor );

    if( gx == act.x && gy == act.y ){
        this.player_turn(this.cActor, "wait", "");
    }

}

CombatMode.prototype.handleMouseMove = function( ev, off ){

    var mouseX = ev.clientX - off.x - 17;
    var mouseY = ev.clientY - off.y - 19;

    //console.log( mouseX, mouseY );

    this.world.mbox.set_x( this.world.pix_to_gridw(mouseX) );
    this.world.mbox.set_y( this.world.pix_to_gridh(mouseY) );
}