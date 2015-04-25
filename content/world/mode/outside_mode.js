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

    this.playspeed = 200;       //the delay between actions in ms
    this.is_selecting_target = false;

    //TEMP
    this.hold_input = false;

    //this.start_combat();
}

TownMode.prototype.start = function(){
    this.world.mbox.set_x( 100);
    this.world.mbox.set_y( 100);
    this.world.cbox.set_x( 100 );
    this.world.cbox.set_y( 100 );    
    this.align_pcs();
}

TownMode.prototype.align_pcs = function(){
    var head = this.world.get_character(this.cActor);
    for( var i in this.pcs ){
        var act = this.world.get_character(this.pcs[i]);
        act.set(head.x, head.y);
    }

    this.world.set_camera( head.x-4, head.y-4 );
}

/**
    Perform a turn based on the given pc
*/
TownMode.prototype.player_turn = function(pc_name, type, data){ 
    var act = this.world.get_character(pc_name);

    switch(type){
        case "move": this.action_move(pc_name, data); break;
        case "magic": this.action_magic(pc_name, data); break;
        case "wait": act.action_points=0; break;
    }

    // this.world.cbox.set_x( act.x );
    // this.world.cbox.set_y( act.y );

}

TownMode.prototype.check_vs_nodes = function(new_x, new_y){

}

/**
    Move the actor in one square
*/
TownMode.prototype.action_move = function(actor_name, dir, ai){
    //var ind = get_actor_ind(cActor);
    var act = this.world.get_character(actor_name);

    var old_x = act.x;
    var old_y = act.y;

    var new_x = old_x;
    var new_y = old_y;

    switch( dir ){
        case "n":  new_y = new_y-1;                  act.change_direction( "r" ); break;
        case "ne": new_y = new_y-1; new_x = old_x+1; act.change_direction( "r" ); break; 
        case "e":  new_x = new_x+1;                  act.change_direction( "r" ); break;
        case "se": new_y = new_y+1; new_x = old_x+1; act.change_direction( "r" ); break; 
        case "s":  new_y = new_y+1;                  act.change_direction( "l" ); break;
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
    }

    var victim = sq_new.has_enemy_character(actor_name);

    if( !sq_new.isPassable ){
        victim = "blocked!";
    } 

    if( victim == "none" ){
        //clog(actor_name+": move "+dir+".  "+ (new_x-4)+", "+ (new_y-4));
        //act_set(cActor, new_x, new_y);
        act.set(new_x, new_y);
        this.world.set_camera( new_x-4, new_y-4 );
    } else if( victim == "blocked!"){
        clog("Blocked!");
    } else {
        clog("Somebody already occupies that space!");
    }

    this.align_pcs();

    //Determine if the player is out of the visible bounds of the map after moving
    if( new_x < 5 ){
        var node = this.world.get_node_by_name("Exit_West");
        if( !( node === "none" ) )
            node.perform_action();
    } else if( new_x > this.world.mapw-5 ) {
        var node = this.world.get_node_by_name("Exit_East");
        if( !( node === "none" ) )
            node.perform_action();
    } else if( new_y < 5 ) {
        var node = this.world.get_node_by_name("Exit_North");
        if( !( node === "none" ) )
            node.perform_action();
    } else if( new_y > this.world.maph-5 ) {
        var node = this.world.get_node_by_name("Exit_South");
        if( !( node === "none" ) )
            node.perform_action();
    } 

    node = this.world.get_node_by_position(new_x, new_y)
    if( !(node === "none") ){
        node.perform_action();
    }    

}

TownMode.prototype.handleKeyPress = function( ev ){

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
        ev.preventDefault();
    }
    if (cpk[40]) {
        // DOWN ARROW
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","s");
        ev.preventDefault();
    } 
    if (cpk[37]) {
        // LEFT ARROW
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","w");
        ev.preventDefault();
    } 
    if (cpk[39]) {
        // RIGHT ARROW
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","e");
        ev.preventDefault();
    }
    if (cpk[76]) {
        //l
        var act = this.world.get_character( this.cActor );
        this.cSpell = act.lspell;
        this.world.mbox.area = this.world.sm.get_spell( this.cSpell ).a;
        this.world.mbox.caster_loc = [act.x, act.y];
        this.world.mbox.isVisible = true; 
        this.is_selecting_target = true;
    }
    if (cpk[68]) {
        //d
        var act = this.world.get_character( this.cActor );
        this.cSpell = act.dspell;

        console.log("GAME "+this.cActor+" casts "+this.cSpell );
        this.world.mbox.area = this.world.sm.get_spell( this.cSpell ).a;
        this.world.mbox.caster_loc = [act.x, act.y];
        this.world.mbox.isVisible = true; 
        this.is_selecting_target = true;
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
        ev.preventDefault();
    }
    if (cpk[98]) {
        // NUMPAD 2 DOWN
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","s");
        ev.preventDefault();
    } 
    if (cpk[100]) {
        // NUMPAD 4 LEFT
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","w");
        ev.preventDefault();
    } 
    if (cpk[102]) {
        //NUMPAD 6 RIGHT
        if( this.current_turn == 0 )
            this.player_turn(this.cActor,"move","e");
        ev.preventDefault();
    }            
}  

TownMode.prototype.handleMouseClick = function( ev, off ){

    //console.log( "Cast - "+ this.cSpell );

    var mouseX = ev.clientX - off.x - 17;
    var mouseY = ev.clientY - off.y - 15;

    var gx = this.world.pix_to_gridw(mouseX);
    var gy = this.world.pix_to_gridh(mouseY);   

    if( this.is_selecting_target ){

        this.world.mbox.isVisible = false;

        var spell = this.world.sm.get_spell( this.cSpell );
        var act = this.world.get_character( this.cActor );

        var victims = [];
        var cast_type = spell.ct;

        switch( cast_type ){
            case CAST_TARGET: victims = this.determine_victims(gx, gy, spell); break;
            case CAST_ALLY: victims = this.determine_victims(gx, gy, spell); break;
            case CAST_ANYONE: victims = this.determine_victims(gx, gy, spell); break;
            case CAST_FIELD: break;
            case CAST_GROUP: break;
        }

        console.log("GAME: Victims of this spell ", victims );


        if( victims.length > 0 ) {
            var captain = this;
            act.action_points-=4;
            this.cAP-=4;
            act.set_attack_sprite();
            PROJ_ICY = this.world.add_projectile( new Projectile(this.cActor, [gx,gy], "icyproj","icyproj", myDisplay, this.world, OV_PROJ, function(){
                captain.player_turn(captain.cActor, "magic", victims );
            }));   
        } else {
            clog("The spell has no effect");
        }          

        this.is_selecting_target = false;
    }

    var act = this.world.get_character( this.cActor );

    if( gx == act.x && gy == act.y ){
        console.log("WAIT");
        this.player_turn(this.cActor, "wait", "");
    }

}

TownMode.prototype.handleMouseMove = function( ev, off ){

    var mouseX = ev.clientX - off.x - 17;
    var mouseY = ev.clientY - off.y - 19;

    //console.log( mouseX, mouseY );

    this.world.mbox.set_x( this.world.pix_to_gridw(mouseX) );
    this.world.mbox.set_y( this.world.pix_to_gridh(mouseY) );
}