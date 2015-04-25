function WSButtonManager(state){
	this.state = state;
}

WSButtonManager.prototype.aButtonAction = function(){
	var state = this.state;
    var captain = state;
    var btn = state.getElement(AControlButton);
    var tmp;
    if(state.selVisible) {
        btn.msg = "Select";
        btn.action = function(){
            var ch = captain.world.get_character_by_position(captain.mx, captain.my);
            var sq = captain.world.get_square(captain.mx, captain.my);
            captain.onSelect(sq,ch);
            captain.exitSelectMode();            
            captain.redraw = true;    
        };
    } else if( state.allySelVisible ){
        btn.msg = "N/A";
        btn.action = function(){};
    } else if( state.getElement(DialoguePane).FLAG_isVisible ) {
        btn.msg = "Confirm";
        btn.action = function(){   
                var elem = captain.getElement(DialoguePane);
                elem.click(captain.mx, captain.my);
            };
    }  else if ( (tmp=state.world.is_near_tile_type( state.player.get_first().name, [27,33,42] ))
    				 !== false) {
        btn.msg = "Close";
        btn.action = function(){
            tmp.close_door();
            captain.redraw = true;  
        };
    } else if (state.wMode instanceof CombatMode){
    	var act = state.wMode.cactor;
    	var wep_name = act.equipment.rhand;
    	if( wep_name !== "none" ){
    		var tmp;
    		if( (tmp = wep_name.search("_")) != -1 ){
    			wep_name = wep_name.substring(0, tmp);
    		} 
    		var item = state.world.itemCache.get_item(wep_name);
    		if( item.type == "ranged" ){
    			btn.msg = "Shoot";
		        btn.action = function(){
		        	state.Shortcut.enter_archery_mode();
		        }
    		} else {
    			btn.msg = "";
		        btn.action = function(){};
    		}
    	} else {
    		btn.msg = "Punch";
	        btn.action = function(){};
	    }
    } else if( state.getElement(InventoryOverlay).FLAG_isVisible||
    			state.getElement(PickUpPane).FLAG_isVisible ||
    			state.getElement(DarkMagicOverlay).FLAG_isVisible ||
    			state.getElement(LightMagicOverlay).FLAG_isVisible){
        btn.msg = "";
        btn.action = function(){   
            };   	
    } else {
        btn.msg = "Talk";
        btn.action = function(){
			state.Shortcuit.enter_select_conversation_mode(); 
        };
    }

}

WSButtonManager.prototype.bButtonAction = function(){
	var state = this.state;
    var captain = state;
    var btn = state.getElement(AControlButton);

    if(state.selVisible || state.allySelVisible) {
        btn.msg = "Cancel";
        btn.action = function(){ 
            captain.exitSelectMode();
        };
    } else if( state.getElement(DialoguePane).FLAG_isVisible ) {
        btn.msg = "Previous";
        btn.action = function(){   
                var elem = captain.getElement(DialoguePane);
                elem.prev_message();
            };
    } else if( state.getElement(InventoryOverlay).FLAG_isVisible||
    			state.getElement(PickUpPane).FLAG_isVisible ||
    			state.getElement(DarkMagicOverlay).FLAG_isVisible ||
    			state.getElement(LightMagicOverlay).FLAG_isVisible){
        btn.msg = "";
        btn.action = function(){   
            };   	
    } else {
        if( state.wMode instanceof CombatMode )
            btn.msg = "End";
        else
            btn.msg = "Fight";
        btn.action = function(){
            captain.changeWMode();
            captain.resume();
            setTimeout(function(){
                captain.resume();
            }, 100);  
        };
    }    
}