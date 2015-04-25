/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var Player = app.world.Player = function( state ){
	this.state = state;
	this.pcs = [];

	this.settings = {
		playspeed:100
	};

	//storage save location
	//username?
	//statistics?
};

Player.prototype.create_pc = function( pc ){
    var ch = new app.world.actor.Character({
        x: pc.xpos, 
        y: pc.ypos, 
        sprite: pc.sprite, 
        name: pc.name, 
        display: this.state.world.display, 
        world: this.state.world, 
        ai: this.state.world.ai, 
        stats: pc.stats,
        xp: 0,
        xptonextlevel: this.get_threshold_xp( pc.stats )
    });

    for( var i in pc.inventory ){
        var itemname = pc.inventory[i];
        if( !itemname ){
            continue;
        }
        if( itemname.search("_") == -1 ){
            itemname = itemname + "_" + this.state.random_id(10);
            pc.inventory[i] = itemname;
        }
        ch.add_item( itemname );
    }

    ch.equipment = pc.equip_table;

    for( var i in ch.equipment ){
        for( var j in ch.inventory ){
            var itemname = ch.inventory[j];
            var shortname = ch.inventory[j].substring( 0, itemname.search("_") );
            if( shortname == ch.equipment[i] && ch.equipment[i] != "none" ){
                ch.equipment[i] = itemname;
            }
        }
    }

    ch.isNPC = false;
    ch.allegiance = "ally";

    ch.lspells = pc.lspells;
    ch.dspells = pc.dspells;

    console.log("pc character made, xp: ", ch.xp, "xptonextlevel", ch.xptonextlevel );

    return ch;
};

Player.prototype.load_pcs = function( party ){
    for( var i in party ){
        var pc = this.create_pc( party[i] );
        this.pcs.push( pc );
    }
    console.log("PCS", this.pcs);
};

Player.prototype.load_settings = function( settings ){
    this.settings = settings;
};

Player.prototype.get_chars_visual = function(){
	var ret = [];
	if( this.mode === "combat" ){
        ret = ret.concat( this.get_chars_alive() );
	} else {
        ret.push( this.get_first() );
	}
	return ret;
};

Player.prototype.get_chars_alive = function(){
	var ret = [];
    for( var i in this.pcs ){
        if( this.pcs[i].isAlive ){
            ret.push( this.pcs[i] );
        }
    }
	return ret;
};

Player.prototype.get_not_first = function(){
    var ret = [];
    var first = this.get_first();
    for( var i in this.pcs ){
        if( this.pcs[i].isAlive && this.pcs[i] !== first ){
            ret.push( this.pcs[i] );
        }
    }
    return ret;
};

Player.prototype.get_pcs = function(){
	return this.pcs;
};

Player.prototype.change_mode = function(mode, world){
	this.mode = mode;
	if( mode === "combat" ){
		this.align_pcs(world);
	}
};

Player.prototype.get_first = function(){
    for( var i in this.pcs ){
        if( this.pcs[i].isAlive ){
            return this.pcs[i];
        }
    }
    return "none";
};

Player.prototype.align_pcs = function(world){

    var act = this.get_first();
    this.world = world;
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

    for( var i = 0; i < this.pcs.length; i++ ){
        var act2 = this.pcs[i];
        var pos = {x: act.x, y: act.y};
        if( i === 0 ){
            continue;
        } else if( i === 1 ) {
            pos = this.world.get_valid_pos( act.x+xoffs[i], act.y+yoffs[i] );
            if( pos === "none" ){
                pos = {x: act.x, y: act.y};
            }
        } else if( i === 2 ) {
            pos = this.world.get_valid_pos( act.x+xoffs[i], act.y+yoffs[i] );
            if( pos === "none" ){
                pos = {x: act.x, y: act.y};
            }
        }   else if( i === 3 ) {
            pos = this.world.get_valid_pos( act.x+xoffs[i], act.y+yoffs[i] );
            if( pos === "none" ){
                pos = {x: act.x, y: act.y};
            }
        }  else if( i === 4 ) {
            pos = this.world.get_valid_pos( act.x+xoffs[i], act.y+yoffs[i] );
            if( pos === "none" ){
                pos = {x: act.x, y: act.y};
            }
        }  else if( i === 5 ) {
            pos = this.world.get_valid_pos( act.x+xoffs[i], act.y+yoffs[i] );
            if( pos === "none" ){
                pos = {x: act.x, y: act.y};
            }
        } 

        act2.set(pos.x, pos.y);
        act2.change_direction(this.get_first().direction);
    }
};

Player.prototype.reorder_pc = function(oldindex, newindex){
    if( oldindex === newindex ){
        _remove_modal();
        return;
    }

    var first = this.get_first();
    var origx = first.x;
    var origy = first.y;

    if( newindex < 0 || newindex >= this.get_pcs().length ){
        console.error("ERROR, tried to reorder_pcs at an index that was not in range.",
            oldindex, newindex);
        _remove_modal.call(this);
        return;
    }

    var _remove_modal = function(){
        this.state.uistore.pcselected = newindex;
        this.state.uistore.modals.reorder.visible = false;
    }.bind(this);

    var pc = this.get_pcs()[oldindex];
    this.pcs.splice( oldindex, 1, this.pcs.splice( newindex, 1, pc)[0] );
    var newfirst = this.get_first();
    newfirst.set( origx, origy );
    
    this.state.wMode.init_actors();
    this.state.wMode.begin_round();
    _remove_modal();
};

Player.prototype.check_inventory_acquire = function( ch, item ){
    var totalweight = ch.get_inventory_weight() + item.weight;
    var maxweight = ch.get_max_carryable_weight();
    if( ch.inventory.length >= ch.MAXINVENTORYCOUNT ){
        console.log("WARNING", ch.name, "has more than", ch.MAXINVENTORYCOUNT,
            "items in his/her inventory.");
        this.state.notify( ch.name + "'s inventory is full.");
        this.state.hide_modal( this.state.uistore.modals.give );
        return true;
    } else if( totalweight > maxweight ){
        console.log("WARNING", "This item is too heavy for", ch.name, "to carry");
        this.state.notify( "This item is too heavy for "+ch.name+" ("+
            totalweight+" lbs / "+maxweight+" lbs).");
        this.state.hide_modal( this.state.uistore.modals.give );
        return true;
    }
    return false;
};

Player.prototype.transfer_item = function( ch1, ch2, itemname ){
    if( ch1 === ch2 ){
        this.state.hide_modal( this.state.uistore.modals.give );
        return;
    }

    var item = this.state.world.itemCache.get_item( itemname );
    if( item === undefined ) {
        console.error( "No item with name", itemname, "exists to transfer.");
        return;
    }

    if( this.check_inventory_acquire( ch2, item ) ){
        return;
    }

    ch1.remove_item_from_inventory( itemname );
    ch2.add_item_to_inventory( itemname );
    ch1.unequip_item( itemname );
    this.state.inter.hide_modal( this.state.uistore.modals.give );
};

Player.prototype.acquire_item = function( ch, itemname, tile ){
    var item = this.state.world.itemCache.get_item( itemname );
    if( item === undefined ) {
        console.error( "No item with name", itemname, "exists to acquire.");
        return;
    }

    if( this.check_inventory_acquire(ch, item) ){
        return;
    }

    console.log("REMOVE CONTENT");
    tile.remove_content( itemname );
    ch.add_item_to_inventory( itemname );
};

Player.prototype.get_threshold_xp = function( stats ){
    var lvl = app.world.actor.Character.prototype.get_level.call( {}, stats );
    return lvl*50;
};

Player.prototype.grant_xp = function( pc, xpamt ){
    var y = null;
    for( var i in this.pcs ){
        if( this.pcs[i] === pc ){
            y = true;
            break;
        } else {
            y = false;
        }
    }

    if( !y ){
        return;
    }

    xpamt = Math.round(xpamt);
    pc.xp += xpamt;

    this.state.world.add_text_particle( pc.x, pc.y, "+"+xpamt+" xp");

    if( pc.xp >= pc.xptonextlevel ){
        this.perform_levelup( pc );
    }
};

Player.prototype.perform_levelup = function( pc ){
    var overlay = this.state.UI.getElement( app.ui.LevelupOverlay );
    overlay.reset_with_char( pc );
    this.state.pause_combat();
};

})();