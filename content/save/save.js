/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

app.save = {};
var SaveGame = app.save.SaveGame = function(){};

SaveGame.prototype.create_save = function(world, state){
	var masterobj = {};

	//GlobalNodes

	masterobj.party = [];
	for( var i in world.player.pcs ){
		var act = world.player.pcs[i];
		var obj = {
			xpos:act.x,
			ypos:act.y,
			name:act.name,
			stats:act.stats,
			inventory:[],
			sprite:act.sprite,
			equip_table:act.equipment,
			status_effects:[],
			isAlive:act.isAlive
		};
		for( var j in act.inventory ){
			obj.inventory.push(act.inventory[j]);
		}
		for( var j in act.status_effects ){
			var effect = act.status_effects[j];
			obj.status_effects.push({
				name:effect.name, 
				att_name:effect.att.name, 
				id:effect.id
			});
		}

		masterobj.party.push(obj);
	}

	//Alive npcs per map
	masterobj.maps_deadnpcs = {};
	for( var i in state.game.map_loader.maps ){
		var params = state.game.map_loader.maps[i];
		masterobj.maps_deadnpcs[params.name] = [];		
		for( var i in params.dead_npcs ){
			masterobj.maps_deadnpcs[params.name].push(params.dead_npcs[i]);
		}
	}	

	masterobj.gold = state.gold;
	masterobj.specialinventory = [];
	masterobj.currentmap = world.name;
	masterobj.visitedmaps = state.mapsVisited;
	masterobj.mode = "town";

	masterobj.maps_nodesexecuted = {};
	masterobj.maps_visibletiles = {};
	masterobj.maps_items = {};
	for( var i in state.game.map_loader.maps ){
		var params = state.game.map_loader.maps[i];
		masterobj.maps_nodesexecuted[params.name] = params.nodes_executed;
		masterobj.maps_visibletiles[params.name] = params.map_explored_table;	
		masterobj.maps_items[params.name] = params.items;	
	}

    masterobj.maps_visibletiles[world.name] = world.map_explored_table;
    masterobj.settings = {
    	playspeed:100
    };

	console.log("Save created", masterobj);

	return masterobj;
};

SaveGame.prototype.create_new_game = function(pc_info, game){
	var obj = {};

	obj.maps_nodesexecuted = game.map_loader.get_NES();
	obj.maps_visibletiles = game.map_loader.get_METS();
	obj.visitedmaps = [];
    obj.settings = {
    	playspeed:300
    };
	obj.currentmap = "test_level";
	obj.specialinventory = [];
	obj.gold = 0;
	obj.maps_deadnpcs = {};
	obj.mode = "town";
	for( var i in game.map_loader.maps ){
		var params = game.map_loader.maps[i];
		obj.maps_deadnpcs[params.name] = [];		
	}	
	obj.party = [{	
		equip_table:{
			"lhand":"none","rhand":"Sword of Power","legs":"Cloth Pants","head":"none",
			"body":"Cloth Shirt","hands":"none","feet":"Leather Boots",
			"arms":"none","ammo":"5#Wooden Arrow"
		}, 
		inventory: 	[ 
			"Sword of Power", 
			"Bronze Knife", 
			"Health Potion (weak)", 
			"Cloth Shirt", 
			"Leather Boots",
			"Cloth Pants",
			"Cloth Shirt",
			"Health Potion (weak)",
			"Health Potion (weak)"
		], 
		name: 		pc_info.pc0.name, 
		sprite: 	pc_info.pc0.sprite,
		stats: 		pc_info.pc0.stats,
		xpos: 		15,//11,
		ypos: 		12,//29,
		isAlive: 	true,
		lspells: 	pc_info.pc0.lspells,
		dspells: 	pc_info.pc0.dspells
	},{	
		equip_table:{
			"lhand":"none","rhand":"Sword of Power","legs":"Cloth Pants","head":"none",
			"body":"Cloth Shirt","hands":"none","feet":"Leather Boots",
			"arms":"none","ammo":"5#Wooden Arrow"
		}, 
		inventory: 	[
			"Sword of Power",
			"Bronze Knife", 
			"Health Potion (weak)", 
			"Leather Boots",
			"Cloth Pants",
			"Cloth Shirt",
			"Wooden Shield"
		], 
		name: 		pc_info.pc1.name, 
		sprite: 	pc_info.pc1.sprite,
		stats: 		pc_info.pc1.stats,
		xpos: 		13,
		ypos: 		2,
		isAlive: 	true,
		lspells: 	pc_info.pc1.lspells,
		dspells: 	pc_info.pc1.dspells
	},{	
		equip_table:{
			"lhand":"none","rhand":"none","legs":"Cloth Pants","head":"none",
			"body":"Cloth Shirt","hands":"none","feet":"Leather Boots",
			"arms":"none","ammo":"5#Wooden Arrow"
		}, 
		inventory: 	[
			"Sword of Power", 
			"Bronze Knife", 
			"Health Potion (weak)",
			"Leather Boots",
			"Cloth Pants",
			"Cloth Shirt"
		], 
		name: 		pc_info.pc2.name, 
		sprite: 	pc_info.pc2.sprite,
		stats: 		pc_info.pc2.stats,
		xpos: 		13,
		ypos: 		2,
		isAlive: 	true,
		lspells: 	pc_info.pc2.lspells,
		dspells: 	pc_info.pc2.dspells
	}];

	return obj;
};

SaveGame.prototype.write_save_disk = function(save, name){
	console.log("saving game", save, name);
	console.error("COULD NOT SAVE, NOT IMPLEMENTED");
};

SaveGame.prototype.handle_loaded_save = function(txt, game){
	txt = this.xor_str(txt);
	var master_obj = JSON.parse( txt ); 

	console.log("Loaded", master_obj);

	game.change_state("WorldState", master_obj);
};

SaveGame.prototype.load_new_game = function(pc_info, game){
	game.map_loader.reset();
	game.change_state("WorldState", this.create_new_game(pc_info, game));
};

SaveGame.prototype.get_new_game_state = function(pc_info, game){
	game.map_loader.reset();
	return new app.game.WorldState( game, this.create_new_game(pc_info, game));
};

SaveGame.prototype.load_save_disk = function(src, game){
    var request = new XMLHttpRequest();

    request.open("GET", src, true);

    request.onreadystatechange = function() {
		if (request.readyState == 4) {
			this.handle_loaded_save(request.responseText, game);
		}
    }.bind(this);
    request.send(); 
};

SaveGame.prototype.xor_str = function(str){
    var result = str;
    // for( var i = 0; i < str.length; i++ ){
    //     result = result + String.fromCharCode( (str.charCodeAt(i)^16)^32 );
    // }
    return result;
};

})();