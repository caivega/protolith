/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var WorldLoader = app.world.WorldLoader = function( world ){
	this.world = world;
};

WorldLoader.prototype.add_tiles = function(state){
    for( var i = 0; i < this.world.params.width; i++ ){
        for( var j = 0; j < this.world.params.height; j++){
            var t = new app.world.actor.Tile(
                i, j, "tile_"+this.world.params.terrain[i][j], 
                this.world.params.terrain[i][j]+"", this.world.display, this.world
            );
            this.world.add_tile(t);
        }
    }

    console.log("NAME", this.world.name, state.game.map_loader
        .get_map_by_name(this.world.name) );

    this.world.map_explored_table = state.game.map_loader
        .get_map_by_name(this.world.name).map_explored_table;

    for( var i in this.world.tiles ){  
        var sq = this.world.tiles[i];
        sq.isExplored = 
            this.world.map_explored_table[sq.x][sq.y];
    } 
};

WorldLoader.prototype.add_items = function(){
    var items = this.world.params.items;
    for( var i in items ){
        var itemprops = items[i];

        itemprops.x = itemprops.x / this.world.tilew;
        itemprops.y = itemprops.y / this.world.tileh;

        var tile = this.world.get_tile( itemprops.x, itemprops.y );
        tile.add_item( itemprops.name );
    }
};

WorldLoader.prototype._npc_name_is_duplicate = function(npc){
    var npcs = this.world.params.npcs;
    var ctr = 0;
    for( var i in npcs ){
        if( npcs[i].name === npc.name ){
            if( ctr > 0 ){
                return true;
            } else {
                ctr++;
            }
        }
    }
    return false;
};

WorldLoader.prototype.add_characters = function(state){
    var npcs = [];
    if( this.world.params.npcs !== "none" ){
        for( var i in this.world.params.npcs ){
        	var npc = this.world.params.npcs[i];

        	if( npc.properties.name ){
        		npc.name = npc.properties.name;
        	}

            if( this._npc_name_is_duplicate( npc ) ){
                npc.name = npc.name + "_" + app.random_id(6);
            }

        	//Tiled 0.11 puts the x and y coord in pixel coords instead of grid coords.
        	npc.x = npc.x / this.world.tilew;
        	npc.y = npc.y / this.world.tileh;

            if( !app.inArr( npc.name, this.world.params.dead_npcs ) ){         
                npcs.push( npc );
            } else {
                console.log(
                    "Didn't add "+this.world.params.npcs[i].name+" because he is dead");
            }
        } 
    } 

    for( var i in npcs ){
    	var ch_name_obj = this.world.params.npcs[i];
    	var tmp_name = this.world.fix_actor_name(ch_name_obj.name);
    	var npc_obj = state.game.map_loader.get_npc_by_name(tmp_name);
    	//console.log("Adding npc", npc_obj );

    	if( npc_obj === "none" ){
    		console.log( "Map NPCS, npc_list", this.world.params.npcs, 
    			state.game.map_loader.npclist );
    		console.error("ERROR: No npc of name '"+ch_name_obj.name+"' exists.",
    			"Did you include the right *.npc file?");
    	} else if( !app.inArr( ch_name_obj.name, this.world.params.dead_npcs ) ) {
			this.add_npc(npc_obj, ch_name_obj.name, ch_name_obj.x, ch_name_obj.y, false);
		} else {
			this.add_npc(npc_obj, ch_name_obj.name, ch_name_obj.x, ch_name_obj.y, true);
		}	
    }

    var pcs = this.world.player.get_pcs();
    for( var i in pcs ){
    	pcs[i].calc_hpmp();
    	this.world.add_character( pcs[i] );
    }
};

WorldLoader.prototype.add_npc = function(npc_obj, name, x, y, isDead){
	if( npc_obj.sprite == "none" ){
		npc_obj.sprite = "green_fella";
	}

	if( npc_obj.combat_ai == "none" ){
		//need to add ai variables
	}

	if( npc_obj.town_ai == "none" ){
		//need to add ai variables
	}

	var ch = new app.world.actor.Character(
        x, y, npc_obj.sprite, name, 
		this.world.display, this.world, this.world.ai, npc_obj.stats
    );

	if( isDead ){
		ch.isDead = true;
		ch.isAlive = false;
		ch.isSuperDead = true;
		ch.x = 1;
		ch.y = 1;
	}

	ch.calc_hpmp();

	ch.dialogue = npc_obj.dialogue;

	if( "clonable" in npc_obj ){
		ch.clonable = npc_obj.clonable;
    }

	ch.ai_town = npc_obj.ai_town;
	ch.ai_combat = npc_obj.ai_combat; 

	if("portrait" in npc_obj ){
		ch.portrait = npc_obj.portrait;
    }

	for( var i in ch.lspells ){
		npc_obj.stats.lspells.push(ch.lspells[i]);
	}

	for( var i in ch.dspells ){
		npc_obj.stats.dspells.push(ch.dspells[i]);
	}

	ch.allegiance = npc_obj.allegiance;
	this.world.add_character( ch );
};

//DOES NOT ACTUALLY CREATE NODES This function executes all the nodes the need to be
//executed when the world is loaded
WorldLoader.prototype.add_nodes = function(){
	// var local_nodes_exec = state.game.map_loader
	// 	.get_map_by_name(this.world.name).nodes_executed;
	// var ln_param = state.params.maps_nodesexecuted[this.world.name];
	// var tmp_arr = ln_param.concat(ln_param, local_nodes_exec);
 
	// for( var i in ln_param ){
	// 	if( !inArr(ln_param[i], local_nodes_exec) ){
	// 		local_nodes_exec.push(ln_param[i]);
	// 	}
	// }
 	//Since some nodes depend on executed and disabled flags to be set before running
 	//correctly I have to loop through all the executed nodes twice: once to set the flags
 	//and once to perform the actions.  
  //   for( var i in local_nodes_exec ){
  //   	var node = this.world.get_node_by_name( local_nodes_exec[i] );
		// node.isExecuted = true;
		// if( (node.pers == "false") ){
		// 	node.isDisabled = true;
		// } 
  //   }
  //   for( var i in tmp_arr ){
  //   	var node = this.world.get_node_by_name( local_nodes_exec[i] );
  //   	node.perform_action_selective(true);
  //   }
};

})();