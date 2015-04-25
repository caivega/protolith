
/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var SpecialNodeParser = app.maps.SpecialNodeParser = function(){};

SpecialNodeParser.prototype.parse_node = function(n, state, world){
	console.log("PARSE NODE", n);
    switch(n.type){                                                                                                                 
        default: 
        	console.error("ERROR, Returned a default node", n.name);
            return new SpecialNode( world.display, world, state, { 	name:"null",
																	xpos:"none",
																	ypos:"none",
                                                                    type:"default", 
                                                                    next:"none" }  );
    }
};

//Special nodes dictate changes to the world state that the player triggers
var SpecialNode = app.maps.SpecialNode = function(display, world, state, params){
	// this.name = params.name;
	// this.pers = params.pers;
	// this.xpos = params.xpos;
	// this.ypos = params.ypos;
	// this.next = params.next;

	for( var i in params ){
		this[i] = params[i];
	}

	this.x = parseInt(this.xpos);
	this.y = parseInt(this.ypos);

	this.hidden = true;
	this.isGlobal = false;

	this.world = world;
	this.display = display;
	this.state = state;

	this.isExecuted = false;
	this.isDisabled = false;

	this.type = "SpecialNode";

	//Display message
	//Display dialog
	//Play Sound
	//Play Animation
	//Change Terrain
	//Add/Remove Npc
	//Move player to position
	//Change Map
	//Stuff Done?
	//Player has special item?
};

//Determine if this node instance is a type of node
//which should not be re-executed each time you reenter the map.
SpecialNode.prototype.is_nonloadable = function(){
	// var nls = [
	// 	SpSingleNotification,
	// 	SpDoubleNotification,
	// 	SpSecretPassage,
	// 	SpTeleportTo,
	// 	SpAddLog
	// ];

	// var ret = false;

	// for( var i in nls ){
	// 	ret = ret || this instanceof nls[i];
	// }

	// return ret;
	return true;
};

SpecialNode.prototype.set_flags = function(){

};

SpecialNode.prototype.disable = function(){
	this.isDisabled = true;
};

SpecialNode.prototype.perform_action_selective = function(selective){

	if( this.isDisabled ){
		console.log("WARNING: Tried to execute a disabled node", this);
		return;
	}

	if( selective === true ){
    	if( !this.is_nonloadable() ){
    		this.perform_action(selective);
    	} else {
			this.isExecuted = true;
			if( (this.pers == "false") ){
				this.isDisabled = true;
			} 
    	}
	} else {
		this.perform_action(selective);
	}
};

SpecialNode.prototype.perform_action = function(selective){
	this.isExecuted = true;
	if( (this.pers === false) ){
		this.isDisabled = true;
	} 

	if( selective !== true ){ 
		var map = this.state.game.map_loader.get_map_by_name(this.world.name);
		if( !app.inArr(this.name, map.nodes_executed) ){
			map.nodes_executed.push(this.name);
			console.log("executed node pushed:", map.nodes_executed);
		}
	}

	this.call_next_node(this.next, selective);

};

SpecialNode.prototype.call_next_node = function(node_name, selective){
	if( node_name != "none" ){
		var lst = node_name.split("_");
		var actual_node_name = lst[0];//+"#"+lst[1];
		var node = this.world.get_node_by_name(actual_node_name);

		if( node == "none" ){
			console.log("ERROR: tried to call node '"+
				actual_node_name+"' that did not exist from node '"+this.name+"'.");
			return;
		}

		node.perform_action_selective(selective);

	}
};

})();