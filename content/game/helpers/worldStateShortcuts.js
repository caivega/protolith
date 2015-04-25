
function WorldStateShortcut(state){
	this.state = state;

	this.set = "ingame";

	this.shortcutset = {
		"ingame":{},
		"selectingenemy":{},
		"selectingally":{},
		"dialogue":{},
		"inventory":{},
		"magic":{},
		"pickup":{}
	};

	for( var i in this.shortcutset ){
		this[i+"_init"]();
	}
}

WorldStateShortcut.prototype.perform_action = function(id, mode){
	this.set = mode;
	var set = this.shortcutset[this.set];
	if( set === undefined ){
		console.error("ERROR: No set '"+this.set+"' exists in shortcuts.");
		return false;
	} else {
		//console.log("KEY", id, "MODE", mode);
	}

	if( id in set ){
		set[id](id);
		set.pfunc(id);
		return true;
	} else {
		return false;
	}
}

WorldStateShortcut.prototype.set_mode = function(name){
	this.set = name;
}

WorldStateShortcut.prototype.dialogue_init = function(){
	var captain = this;
	var state = this.state;
	var set = this.shortcutset.dialogue;	
	var dp = this.state.getElement(DialoguePane);

	set[73] = function(){ //i for inquire
        dp.click(305,256);
        state.game.display.input._value = "";
	}
	set[76] = function(){ //l for leave
        state.UImode = "INGAME";
        dp.hide();
	}
	set[78] = function(){ //n for NAME button in dialogue
		dp.click(184,253);
	}
	set[74] = function(){ //j for JOB button in dialogue
		dp.click(246,256);
	}
	set[66] = function(){ //b for BUY/SELL button in dialogue
		dp.click(309,28);
	}
	set[27] = function(){ //ESC
		dp.click(300,6);
	}
	set.pfunc = function(){};
}

WorldStateShortcut.prototype.selectingenemy_init = function(){
	var captain = this;
	var state = this.state;
	var set = this.shortcutset.selectingenemy;	
	var prevmx = state.mx; var prevmy = state.my;

	set[38] = function(){ //UP arrow
		state.my = state.my - 1;
	}
	set[40] = function(){ //DOWN arrow
		state.my = state.my + 1;
	}
	set[37] = function(){ //LEFT arrow
		state.mx = state.mx - 1;
	}
	set[39] = function(){ //Right arrow
		state.mx = state.mx + 1;
	}
	set[27] = function(){ //ESC
        state.exitSelectMode();
	}
	set[105] = function(){ //NUMPAD 9 UPRIGHT
        state.mx = state.mx + 1;
        state.my = state.my - 1;
	}
	set[99] = function(){ //NUMPAD 3 DOWNRIGHT
        state.mx = state.mx + 1;
        state.my = state.my + 1;
	}
	set[97] = function(){ //NUMPAD 1 DOWNLEFT
        state.mx = state.mx - 1;
        state.my = state.my + 1;
	}
	set[103] = function(){ //NUMPAD 7 UPLEFT
       	state.mx = state.mx - 1;
        state.my = state.my - 1;
	}
	set[104] = function(){ //NUMPAD 8 UP
	    state.my = state.my - 1;
	}
	set[98] = function(){ //NUMPAD 2 DOWN
		state.my = state.my + 1;
	}
	set[100] = function(){ //NUMPAD 4 LEFT
		state.mx = state.mx - 1;
	}
	set[102] = function(){ //NUMPAD 6 RIGHT
		state.mx = state.mx + 1;
	}
	set[13] = function(){ //ENTER
        var ch = state.world.get_character_by_position(state.mx, state.my);
        var sq = state.world.get_square(state.mx, state.my);
        state.onSelect(sq, ch);
        state.exitSelectMode();            
        state.redraw = true;
	}

	set.pfunc = function(){
        var act = state.world.get_character(state.wMode.cActor);
        if( Math.abs(state.mx - act.x) > 4 ){
        	state.mx = prevmx;
        }
        if( Math.abs(state.my - act.y) > 4 ){
        	state.my = prevmy;
        }
	}
}

WorldStateShortcut.prototype.selectingally_init = function(){
	var captain = this;
	var state = this.state;
	var set = this.shortcutset.selectingally;	
	var prevmx = state.mx; var prevmy = state.my;

	function selectally(id){
        var pcnum = id - 49;
        if( pcnum < state.player.get_pcs().length ){
            state.onSelect( "none", state.player.get_pcs()[ pcnum ] );
            state.exitSelectMode();
        } else {
            console.log(pcnum);
            state.warn.add_log("red", "You don't have a character at position "
            	+(pcnum+1)+" in your party at the moment.");
        }
	}

	//1 - 6 on the keyboard
	for( var i = 49; i < 55; ++i ){
		set[i] = function(id){selectally(id)};
	}

	set[27] = function(){ //ESC
	    state.exitSelectMode();
        state.redraw = true;	
	}

	set.pfunc = function(){};
}

WorldStateShortcut.prototype.ingame_init = function(){
	var captain = this;
	var state = this.state;
	var set = this.shortcutset.ingame;	
	var prevmx = state.mx; var prevmy = state.my;

	function highlightpc(id){
        var pcpane = state.getElement(PCListPane);
        var off = (id - 49)*24 + 32;
        pcpane.click(0, off);
	}

	//1 - 6 on the keyboard
	for( var i = 49; i < 55; ++i ){
		set[i] = function(id){highlightpc(id)};
	}

	set[84] = function(){ //t for talk
		captain.enter_select_conversation_mode();
	}	
	set[83] = function(){ //s for shoot
		captain.enter_archery_mode();
	}
	set[73] = function(){ //i for inventory
        state.hideExtraUIExcept( InventoryOverlay);
        state.showElement(InventoryOverlay);  
        state.UImode = "INVENTORY"; 
        var wbp = state.getElement(WorldButtonPane);
        wbp.activeState = "INVENTORY";	
	}
	set[71] = function(){ //g for get
        var pick = state.getElement(PickUpPane);
        state.disableWorldButtons = true;
        state.UImode = "PICKUP";
        pick.show();	
	}
	set[76] = function(){ //l for light magic
        state.hideExtraUIExcept( LightMagicOverlay );
        state.showElement(LightMagicOverlay);  
        state.UImode = "LIGHTMAGIC"; 
        var wbp = state.getElement(WorldButtonPane);
        wbp.activeState = "LIGHTMAGIC";
	}
	set[68] = function(){ //d for dark magic
        state.hideExtraUIExcept( DarkMagicOverlay );
        state.showElement(DarkMagicOverlay);  
        state.UImode = "DARKMAGIC"; 
        var wbp = state.getElement(WorldButtonPane);
        wbp.activeState = "DARKMAGIC";
	}

	set.pfunc = function(){};
}

WorldStateShortcut.prototype.inventory_init = function(){
	var captain = this;
	var state = this.state;
	var set = this.shortcutset.inventory;	

	function highlightpc(id){
        var pcpane = state.getElement(PCListPane);
        var off = (id - 49)*24 + 32;
        pcpane.click(0, off);
	}

	function hideinventory(){
        state.hideElement(InventoryOverlay);  
        state.UImode = "INGAME"; 
        var wbp = state.getElement(WorldButtonPane);
        wbp.activeState = "INGAME";
	}

	set[73] = hideinventory; //I
	set[27] = hideinventory; //ESC

	//1 - 6 on the keyboard
	for( var i = 49; i < 55; ++i ){
		set[i] = function(id){highlightpc(id)};
	}	

	set.pfunc = function(){};
}

WorldStateShortcut.prototype.pickup_init = function(){
	var captain = this;
	var state = this.state;
	var set = this.shortcutset.pickup;
    var pick = state.getElement(PickUpPane);
    var pcpane = state.getElement(PCListPane);

	function hidepickup(){
        state.disableWorldButtons = false;
        state.UImode = "INGAME";
        pick.hide();
	}

	function selectitem(id){
        var off = (id - 65)*16 + 43 + 4;
        pick.contains(200, off);
	}

	function highlightpc(id){
        var pcpane = state.getElement(PCListPane);
        var off = (id - 49)*24 + 32;
        pcpane.click(0, off);
	}

	set[13] = hidepickup; //ENTER
	set[27] = hidepickup; //ESC

	//A - O on the keyboard
	for( var i = 65; i < 79; ++i ){
		set[i] = function(id){selectitem(id)};
	}

	//1 - 6 on the keyboard
	for( var i = 49; i < 55; ++i ){
		set[i] = function(id){highlightpc(id)};
	}

	set.pfunc = function(){};
}

WorldStateShortcut.prototype.magic_init = function(){
	var captain = this;
	var state = this.state;
	var set = this.shortcutset.magic;

	function highlightpc(id){
        var pcpane = state.getElement(PCListPane);
        var off = (id - 49)*24 + 32;
        pcpane.click(0, off);
	}

	function selectspell(id){
		console.log("SELECT SPELL", id);
	    if( state.UImode == "DARKMAGIC"){
	        var pane = state.getElement(DarkMagicOverlay);
	    } else {
	        var pane = state.getElement(LightMagicOverlay);
	    }
        var tid = id-65;
        var xoff = (tid%3)*75+pane.x+25+4;
        var yoff = Math.floor(tid/3)*60+pane.y+53+4;
        pane.click(xoff, yoff);
	}

	set[27] = function(){ //ESC
	    if( state.UImode == "DARKMAGIC"){
	        var pane = state.getElement(DarkMagicOverlay);
	    } else {
	        var pane = state.getElement(LightMagicOverlay);
	    }
        pane.hide();
        state.UImode = "INGAME"; 
        var wbp = state.getElement(WorldButtonPane);
        wbp.activeState = "INGAME";		
	}

	//A - J on the keyboard
	for( var i = 65; i < 74; ++i ){
		set[i] = function(id){selectspell(id)};
	}

	//1 - 6 on the keyboard
	for( var i = 49; i < 55; ++i ){
		set[i] = function(id){highlightpc(id)};
	}

	set.pfunc = function(){};
}

WorldStateShortcut.prototype.enter_archery_mode = function(){
	var state = this.state;

	if( !(state.wMode instanceof CombatMode) ) {
		state.warn.add_log("red", "You must be fighting somebody to shoot.");
		return;
	}

    var act = state.world.get_character( state.wMode.cActor );
    var wep_name = act.equipment.rhand;

    if( wep_name === "none" ){
		state.warn.add_log("red", "You have no weapon equipped.");
		return;
    }

	var tmp;
    if( (tmp = wep_name.search("_")) != -1 ){
        wep_name = wep_name.substring(0, tmp);
    } 
    var item = this.world.itemCache.get_item(wep_name);

    if( item.type !== "ranged" ){
		state.warn.add_log("red", "You do not have a ranged weapon equipped.");
		return;
    }

    state.enterSelectMode(function(sq, ch){
        if( !(ch !== "none" && sq.isInSight && sq.is_on_screen()) ){
        	state.warn.add_log("red", "Nobody is at that position.");
        	return;
        }

        var vic_obj = state.world.get_character(ch.name);
        if( vic_obj.allegiance === act.allegiance  ){   
            state.notif.add_log("WARNING","Somebody already occupies that space!");
            return false;
            //state.warn.add_log("red","You have now angered everyone in state town!");
            //state.world.switch_npc_allegiance_to_enemy();
        }                                   
        act.action_points-=4;
        state.wMode.cAP-=4;
        act.set_attack_sprite();
        state.world.soundCache.play_sound("scratch0");
        PROJ_ICY = state.world.add_projectile( new Projectile(act.name, [sq.x,sq.y], 
        	"bowproj", "bowproj", state.game.display, state.world, 1, function(){
            state.wMode.player_turn(act.name, "ranged", {victim:ch.name} );
        }));                           
            
    }, [[0,0]]);
}

WorldStateShortcut.prototype.enter_select_conversation_mode = function(){
	var state = this.state;

    var act = state.player.get_first();
    var ch2 = state.world.get_act_in_vicinity( act.name );
    if( ch2 != "none" ){
        state.mx = ch2.x;
        state.my = ch2.y;
    } else {
        state.mx = act.x;
        state.my = act.y;
    }

    state.enterSelectMode(function(sq, ch){
        if( ch.allegiance == "enemy"){
            state.warn.add_log("red", "This character is hostile to you!");
            return;
        }

        if( ch !== "none" && sq.isInSight && sq.is_on_screen() ){
            if(ch.isNPC){
                if( "d1" in ch.dialogue ){
                    var diag = state.getElement(DialoguePane);
                    diag.set_npc(ch);                         
                    state.showElement(DialoguePane);                       
                } else {
                    state.warn.add_log("green", "This person has nothing to say.");
                }
            }
        } else {
            state.warn.add_log("red", "Nobody is at that position.");
        }
    }, [[0,0]]);
    state.redraw = true;
}

WorldStateShortcut.prototype.handle_click_ui_elems = function(mouseX, mouseY){
	var ui_click = false;
	for( var i in this.state.uiElements ){
		elem = this.state.uiElements[i];

		//If the ui is disabled and the click is in the ui (not controls) then skip
		//the element
        if( this.state.disableUI && (mouseX < this.state.game.display.boffset 
        	|| (mouseX > 364 && mouseY < 188)) ){
            continue;
        } else if( this.state.disableWorldButtons && ( mouseX > 346) && (mouseY < 188) ){
            //If the world buttons are disabled and you click in that area then skip
            continue;
        }               
		if( elem.contains( mouseX, mouseY ) ){
			ui_click = true;
			if( elem instanceof VisionButtonPane ){ return };
            if( elem instanceof DControlButton || elem instanceof DiagControlButton ){
            	//Make sure the control buttons only work when you are in game
                if( this.state.UImode == "INGAME"){
                    elem.click(mouseX, mouseY);
                }
            } else {
			    elem.click(mouseX, mouseY);
            }
		}
	}
	return ui_click;
}

WorldStateShortcut.prototype.handle_click_world_buttons = function(mouseX, mouseY){
    for( var i in this.state.uiElements ){
        elem = this.state.uiElements[i];
        if( elem instanceof WorldButtonPane ){
            switch( elem.activeState ){
                case "INGAME": 
                	this.state.hideIrreleventUI(); this.state.UImode = "INGAME"; break;
                case "INVENTORY":   
                	this.state.hideExtraUIExcept( InventoryOverlay);
                    this.state.showElement(InventoryOverlay);  
                    this.state.UImode = "INVENTORY"; break;
                case "DARKMAGIC":   
                	this.state.hideExtraUIExcept( DarkMagicOverlay );
                    this.state.showElement(DarkMagicOverlay);  
                    this.state.UImode = "DARKMAGIC"; break;
                case "LIGHTMAGIC":  
                	this.state.hideExtraUIExcept( LightMagicOverlay );
                    this.state.showElement(LightMagicOverlay);
                    this.state.UImode = "LIGHTMAGIC"; break;
                case "SAVE":        
                    this.state.warn.add_log("red", "Saving game is currently disabled.");
                    elem.activeState = "INGAME";
                    elem.contains(mouseX, mouseY); break;                                         
                case "PARTYMAN":    
                	this.state.hideExtraUIExcept( PartyInfoOverlay );
                    this.state.showElement(PartyInfoOverlay);
                    this.state.UImode = "LOADGAME"; break;                           
                default: 
                	this.state.hideIrreleventUI(); this.state.UImode = "INGAME"; 
                    var yes=confirm("Are you certain you want quit to the menu screen?");
                    if( !yes ){
                        this.state.hideIrreleventUI();
                        this.state.UImode = "INGAME"; 
                        elem.contains( mouseX, mouseY ) 
                        elem.click(mouseX, mouseY);
                        return false;
                    }  
                    this.state.forceQuit = true;
                    this.state.wMode.stop = true;                 
                    this.state.game.change_state("MenuState",{});
                break;
            }
        }
    } 
}
