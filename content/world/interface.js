/* jshint browser: true */
/* global app  */

(function(){
"use strict";

var Interface = app.world.Interface = function(state){
	this.state = state;
	this.uistore = this.state.uistore;
};

Interface.prototype.turn_all_modals_off = function(){
    for( var i in this.uistore.modals ){
        this.uistore.modals[i].visible = false;
    }
};

Interface.prototype.is_modal_visible = function(){
    for( var i in this.uistore.modals ){
        if( this.uistore.modals[i].visible ){
            return true;
        }
    }
    return false;
};

Interface.prototype.show_modal = function( storemodal ){
    storemodal.animating = true;
    storemodal.visible = true;
};

Interface.prototype.hide_modal = function( storemodal ){
    storemodal.animating = true;
    storemodal.visible = false;
};

Interface.prototype.show_menu = function( name ){
    this.uistore.prevstate = this.uistore.menustate;
    this.uistore.menustate = name;
    this.uistore.menus.beginanimation = true;
    this.uistore.menus.animating = true;
};

Interface.prototype.hide_menu = function(){
    this.uistore.prevstate = this.uistore.menustate;
    this.uistore.menustate = "none";
    this.uistore.menus.beginanimation = true;
    this.uistore.menus.animating = true;
    this.turn_all_modals_off();
};

Interface.prototype.set_currentitem = function( itemname ){
    var item = this.state.world.itemCache.get_item( itemname );
    this.uistore.currentitem = item;
    this.uistore.currentitemname = itemname;
};

Interface.prototype.unset_currentitem = function(){
    this.uistore.currentitem = null;
    this.uistore.currentitmname = "none";
};

Interface.prototype.notify = function(text){
    this.uistore.notification.message = text;
    this.uistore.notification.frames = 250;
};

Interface.prototype.update_location_variables = function(){
    this.update_nearby_items( this.state.wMode.cactor );
    this.determine_button_actions();
};

Interface.prototype.update_nearby_items = function( pc ){
    this.uistore.menus.pickup.nearbyitems = this.state.world.get_nearby_items( pc.name );
};

Interface.prototype.determine_button_actions = function(){
    this.uistore.actionbuttons.a.action = "Talk";
    if( this.state.wMode instanceof app.world.mode.TownMode ){
    	this.uistore.actionbuttons.b.action = "Fight";
    } else {
    	this.uistore.actionbuttons.b.action = "Sheath";
    }
};

Interface.prototype.enable_select = function(func){
	this.uistore.select.visible = true;
	this.uistore.select.onselect = func;
};

Interface.prototype.disable_select = function(){
	this.uistore.select.visible = false;
};

Interface.prototype.add_animation = function(anim){
    this.uistore.animations.push( anim );
};

//These are re-bound in world state to have it's 'this' context
Interface.prototype.actionfuncs = {
	talk: function(){
		if( this.uistore.select.visible === false ){
			this.enable_select( function(x,y){
                var ch = this.state.world.get_character_by_position(x,y);
                this.state.wMode.talk(ch);
            }.bind(this) );
		} else {
            this.disable_select();
        }
		return 1000;
	}, fight: function(){
		this.state.toggle_wmode();
		return 700;
	}, sheath: function(){
		this.state.toggle_wmode();
		return 1000;
	}, none: function(){ return 100; }
};

Interface.prototype.handle_action = function(){
	var a = this.uistore.actionbuttons.a;
	var b = this.uistore.actionbuttons.b;

    if( a.pressed && !a.disabled ){
    	var d = this.state.actionfuncs[ a.action.toLowerCase() ]();
    	a.disabled = true;
    	setTimeout( function(){
    		a.disabled = false;
    	}, d);
    } else if( b.pressed && !b.disabled ){
    	var d = this.state.actionfuncs[ b.action.toLowerCase() ]();
    	b.disabled = true;
       	setTimeout( function(){
    		b.disabled = false;
    	}, d);
    }
};

})();