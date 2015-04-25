function WSUIManager(state){
	this.state = state;
}

WSUIManager.prototype.addPersistantUI = function(){

	var state = this.state;
    var chars = this.state.world.characters;
    var pc_list = [];
    var en_list = [];

    for( var i in chars ){
        if( chars[i].isNPC ){
            en_list.push( chars[i].name );
        } else { 
            pc_list.push( chars[i].name );
        }
    }

    //PC list pane on the upper left
    state.uiElements.push( new PCListPane( 0, 0, 
                                        "pcListpane", 
                                        "PCLISTPANE", 
                                        state.game.display, 
                                        state.world,
                                        state,
                                        pc_list ) );

    //Controls on the bottom left
    state.uiElements.push( new CombatButtonsPane( 362, 0, 
                                        "combatButtonsPane",
                                        "COMBATBUTTONSSPANE",
                                        state.game.display,
                                        state.world,
                                        state ) );

    state.uiElements.push( new LeftControlsPane( 0, 175, 
                                        "leftControlsPane",
                                        "LCONTROLSPANE",
                                        state.game.display,
                                        state.world,
                                        state ) );

    state.uiElements.push( new DControlButton(36, 178, 
                                        "up-button",
                                        "UPBUTTON",
                                        state.game.display,
                                        state.world,
                                        state,
                                        "up" ) ); 

    state.uiElements.push( new DControlButton(36, 245, 
                                        "down-button",
                                        "DOWNBUTTON",
                                        state.game.display,
                                        state.world,
                                        state,
                                        "down" ) ); 

    state.uiElements.push( new DControlButton(3, 211, 
                                        "left-button",
                                        "LEFTBUTTON",
                                        state.game.display,
                                        state.world,
                                        state,
                                        "left" ) );  

    state.uiElements.push( new DControlButton(69, 211, 
                                        "right-button",
                                        "RIGHTBUTTON",
                                        state.game.display,
                                        state.world,
                                        state,
                                        "right" ) ); 

    state.uiElements.push( new DiagControlButton(80, 179, 
                                        "upright-button",
                                        "UPRIGHTBUTTON",
                                        state.game.display,
                                        state.world,
                                        state,
                                        "upright" ) );  

    state.uiElements.push( new DiagControlButton(80, 256, 
                                        "downright-button",
                                        "DOWNRIGHTBUTTON",
                                        state.game.display,
                                        state.world,
                                        state,
                                        "downright" ) );  

    state.uiElements.push( new DiagControlButton(5, 256, 
                                        "downleft-button",
                                        "DOWNLEFTBUTTON",
                                        state.game.display,
                                        state.world,
                                        state,
                                        "downleft" ) );  

    state.uiElements.push( new DiagControlButton(5, 179, 
                                        "upleft-button",
                                        "UPLEFTBUTTON",
                                        state.game.display,
                                        state.world,
                                        state,
                                        "upleft" ) );                                                                                                                            


    //A and B buttons on the bottom right

    state.uiElements.push( new RightControlsPane(362, 175, 
                                        "rightControlsPane",
                                        "RCONTROLSPANE",
                                        state.game.display,
                                        state.world,
                                        state ) );   

    state.uiElements.push( new BControlButton(378, 235, 
                                        "back-button",
                                        "BBUTTON",
                                        state.game.display,
                                        state.world,
                                        state) );   

    state.uiElements.push( new AControlButton(422, 192, 
                                        "back-button",
                                        "ABUTTON",
                                        state.game.display,
                                        state.world,
                                        state) );  

    //World Button Pane Background 

    state.uiElements.push( new WorldButtonPane(362, 2, 
                                        "asdf",
                                        "ABUTTONZ",
                                        state.game.display,
                                        state.world,
                                        state) );  

    //HIDDEN UI ELEMENTS

    //Stupid hack that might cost me later
    var wbp = state.uiElements[14];

    //console.log("loading ui", dmag_world_button, lmag_world_button);

    //Inventory Menu
    state.uiElements.push( new InventoryOverlay(0, 0, 
                                        "InventoryPane",
                                        "INVENTORY",
                                        state.game.display,
                                        state.world,
                                        state,
                                        pc_list) );   
    state.uiElements[state.uiElements.length-1].hide();

    state.uiElements.push( new DarkMagicOverlay(0, 0, 
                                        "DarkMagicPane",
                                        "DARKMAGIC",
                                        state.game.display,
                                        state.world,
                                        state,
                                        pc_list[0],
                                        wbp) );   
    state.uiElements[state.uiElements.length-1].hide(); 

    state.uiElements.push( new LightMagicOverlay(0, 0, 
                                        "LightMagicPane",
                                        "LIGHTMAGIC",
                                        state.game.display,
                                        state.world,
                                        state,
                                        pc_list[0],
                                        wbp) );   
    state.uiElements[state.uiElements.length-1].hide();  
   
    //state.uiElements[state.uiElements.length-1].hide(); 

    state.uiElements.push( new Minimap(0, 175,
                                        "minimap", 
                                        "VPANE2",
                                        state.game.display,
                                        state.world,
                                        state,
                                        110,
                                        113) );

    state.uiElements.push( new SingleNotification(55, 20,
                                        "SingleNotif", 
                                        "SINGNOT",
                                        state.game.display,
                                        state.world,
                                        state,
                                        "Just some defualt text. You need not worry. ",
                                        "none") );   
    state.uiElements[state.uiElements.length-1].hide();            

    state.uiElements.push( new LoadOverlay(state.game.display.boffset, 0, 
    	"pclistpanebackground", "name", state.game.display, state.game, state ) );
    state.uiElements[state.uiElements.length-1].hide();

    state.uiElements.push( new SaveOverlay(state.game.display.boffset, 0, 
    	"pclistpanebackground", "name", state.game.display, state.game, state ) );
    state.uiElements[state.uiElements.length-1].hide();

    state.uiElements.push( new DialoguePane(0, 0,
                                        "DialoguePane", 
                                        "DPANE",
                                        state.game.display,
                                        state.world,
                                        state) );   
    state.uiElements[state.uiElements.length-1].hide();  

    state.uiElements.push( new PickUpPane(0, 0,
                                        "PickUpPane", 
                                        "PUPANE",
                                        state.game.display,
                                        state.world,
                                        state) );   
    state.uiElements[state.uiElements.length-1].hide(); 
    state.pickup = state.uiElements[state.uiElements.length-1];

    state.uiElements.push( new PartyInfoOverlay(0, 0,
                                        "EmptyPane", 
                                        "PIPANE",
                                        state.game.display,
                                        state.world,
                                        state) );   
    state.uiElements[state.uiElements.length-1].hide(); 

    state.uiElements.push( new VisionButtonPane(state.game.display.boffset, 0,
                                        "none", 
                                        "VPANE",
                                        state.game.display,
                                        state.world,
                                        state) );   
    state.uiElements[state.uiElements.length-1].hide(); 
    state.pickup = state.uiElements[state.uiElements.length-1];

    state.uiElements.push( new LevelupOverlay( 0, 0, state.game.display, state ) );   
    state.uiElements[state.uiElements.length-1].hide(); 
}

WSUIManager.prototype.getElement = function(elemInstance){
    for( var i in this.state.uiElements ){
        var elem = this.state.uiElements[i];
        if( elem instanceof elemInstance ){
            return elem;
        }
    }  
}

WSUIManager.prototype.showElement = function(elemInstance){
    for( var i in this.state.uiElements ){
        var elem = this.state.uiElements[i];
        if( elem instanceof elemInstance ){
            elem.show();
            break;
        }
    }  
}

WSUIManager.prototype.hideElement = function(elemInstance){
    for( var i in this.state.uiElements ){
        var elem = this.state.uiElements[i];
        if( elem instanceof elemInstance ){
            elem.hide();
            break;
        }
    }  

    var act = this.state.world.get_character( this.state.world.active_char );
    this.state.world.set_camera( act.x-4, act.y-4 );
}

WSUIManager.prototype.hideIrreleventUI = function(){
    for( var i in this.state.uiElements ){
        var elem = this.state.uiElements[i];
        if( elem instanceof InventoryOverlay || 
            elem instanceof DarkMagicOverlay || 
            elem instanceof LightMagicOverlay || 
            elem instanceof LoadOverlay || 
            elem instanceof SaveOverlay ||
            elem instanceof PartyInfoOverlay){
            elem.hide();
        }
    }
}

WSUIManager.prototype.hideExtraUIExcept = function( exception ){
    for( var i in this.state.uiElements ){
        var elem = this.state.uiElements[i];
        if( elem instanceof InventoryOverlay || 
            elem instanceof DarkMagicOverlay || 
            elem instanceof LightMagicOverlay || 
            elem instanceof LoadOverlay || 
            elem instanceof SaveOverlay ||
            elem instanceof PartyInfoOverlay){
            if( !( elem instanceof exception) ){
                elem.hide();
            }
        }
    }
}

WSUIManager.prototype.setUIVariables = function(){
    var elem;
    for( var i in this.state.uiElements ){
        elem = this.state.uiElements[i];
        if( elem instanceof InventoryOverlay ){
            if( elem.active_pc != this.state.active_pc ){
                elem.current_window = "INVENTORY";
                elem.current_item = 0;
                elem.sprite = "InventoryPane";
                elem.active_pc = this.state.active_pc;
            }
        } else if( 	elem instanceof DarkMagicOverlay || 
        			elem instanceof LightMagicOverlay ){
            if( elem.active_pc != this.state.active_pc ){
                elem.active_pc = this.state.active_pc;
            }            
        } else if( elem instanceof PCListPane ) {
            if( this.state.wMode instanceof CombatMode ){
                if( this.state.wMode.current_turn == 0 ){
                    elem.active_pc = this.state.wMode.pcs[this.state.wMode.cInd];
                }
            } 
        } else if( elem instanceof PartyInfoOverlay ) {
            elem.active_pc_name = this.state.active_pc;     
        }
    }
}

WSUIManager.prototype.setStateVariables = function(){
    var elem;
    for( var i in this.state.uiElements ){
        elem = this.state.uiElements[i];
        if( elem instanceof PCListPane ){
            this.state.active_pc = elem.active_pc;
        }
    }
}

WSUIManager.prototype.draw_extra_ui = function(){
    if( this.state.disableUI ){
        this.state.game.display.draw_sprite ("DisabledUI", 
            0, 
            0); 
        this.state.game.display.draw_sprite ("DisabledUI", 
            364, 
            0);                             
    } else if( this.state.disableWorldButtons ){
        this.state.game.display.draw_sprite ("DisabledUI", 
            364, 
            0); 
    }

    if( this.state.selVisible ){
        for( var i in this.state.selTiles ){
        	var tx = this.state.mx+this.state.selTiles[i][0];
        	var ty = this.state.my+this.state.selTiles[i][1];
	        var act = this.state.world.get_character_by_position(tx,ty);

	        var wmx = this.state.world.grid_to_pixw(tx);
	        var wmy = this.state.world.grid_to_pixh(ty);
	        var sq = this.state.world.get_square(tx, ty); 
	        if( sq === "none" || sq == undefined )
            	return;

	        if( !(act === "none") && sq.isInSight && sq.is_on_screen() ){
	        	var name = act.name;
	        	var tmp;
	        	if( (tmp = name.search("_")) != -1 ){
	        		name = name.substring(0, tmp);
	        	}

			    this.state.game.display.context.font = "12px Verdanda";
			    var meas = this.state.game.display.context.measureText( name  );   
			    var wbox = meas.width;
			    var hbox = 12;
			    var xbox = Math.round(wmx+14 - meas.width/2);  
			    var ybox = wmy-11;	  
			              
	            Math.round(this.state.x - meas.width/2); 
	            this.state.game.display.draw_sprite ("node_blue", 
		            wmx, 
		            wmy);
	            this.state.game.display.draw(xbox-2, ybox-2, wbox+4, hbox+2, "black" );  
	            this.state.game.display.draw_text( name, wmx+14, wmy-1, 
	            	"", "#AABBEE", "");

	        } else if( sq.is_on_screen() ) {
	            this.state.game.display.draw_sprite ("node_rose", 
	                wmx, 
	                wmy);  
	        }
    	}
    } if( this.state.allySelVisible ){
        if( this.state.tanim_frame == this.state.tanim_frame_speed ){
            this.state.tanim++;
            if( this.state.tanim > 5 ){
                this.state.tanim = 0;
            }
            this.state.tanim_frame = 0;
        } else {
            this.state.tanim_frame++;
        }

        var tanim_arr = [
            "<     - ",
            "<    -  ",
            "<   -   ",
            "<  -    ",
            "< -     ",
            "<-      "
        ];

        for( var i in pc_list ){
            var off = (i)*25 + 32;
            this.state.game.display.draw_text_left( 
            	tanim_arr[(this.state.tanim)]+(parseInt(i)+1), 
            	152, off, "Verdanda", "20", "white", "bold", "black");            
        	this.state.whoButtons[i].draw();
        }
        this.state.redraw = true;
    }

    this.state.warn.draw();

    var cact = this.state.player.get_first();
    this.state.game.display.draw_text("( "+cact.x+", "+cact.y+" )", 
    	136, 15, "Verdanda", "#BB7777", "14", "normal", true);
}