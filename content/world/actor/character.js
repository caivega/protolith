/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var Character = 
app.world.actor.Character = function(x, y, sprite, name, display, world, ai, stats){
	var p = null;
	if( typeof x === "object" ){
		p = x;
		app.world.actor.Actor.call(this, p.x, p.y, p.sprite, p.name, p.display, p.world);
	} else {
		p = {
			x:x, y:y, sprite:sprite, name:name, display:display,
			world:world, ai:ai, stats:stats
		};
		app.world.actor.Actor.call(this, x, y, sprite, name, display, world);
	}

	this.sprite = p.sprite;
    this.ai = p.ai;
    this.set_predef_stats( p.stats );

	this.stats = new app.world.actor.Stats();

    for( var i in p.stats ){
        this.stats[i] = p.stats[i];
    }

    this.portrait = "port_farmer";

	this.calc_hpmp();	

	this.xp = p.xp || 0;
	this.xptonextlevel = p.xptonextlevel || 100;
	this.lastdamagedby = null;

	this.combatclass = p.combatclass || "legionaire";

	this.lspells = [];
	this.dspells = [];

	this.is_animated = this.display.is_sprite_animated(this.sprite);
	this.frame = 0;
	this.maxframe = 0;
	this.frameskip = 4;	//val + 2 frames per cycle
	this.aframes = 0;
	this.loopmode = "last";
	this.holdframe = false;

	//walk variables
	this.is_between_tiles = false;
	this.walk_offsetx = 0;
	this.walk_offsety = 0;
	this.max_walk_frames = 16;	//actually does + 1 walking frames
	this.walk_frame = 0;
	this.walk_offset_distance = 1/this.max_walk_frames;
	this.last_x = 0; this.new_x = 0;
	this.last_y = 0; this.new_y = 0;

	this.isSuperDead = false;
    this.dropTier = 0;
    this.isAgitated = false;
    this.clonable = false;
    this.dialogue = {};
    this.ai_down = "none";
    this.ai_combat = "none";
    this.isNPC = true;
	this.direction = "r"; //right or left
	this.mode = (this.is_animated)?"":"d"; //attack or default
	this.isAlive = true;
	this.behavior  = "aggro_melee";
	this.allegiance = "ally";
    this.inventory = [];
    this.MAXINVENTORYCOUNT = 25;
    this.equipment = {
        "lhand":"none",
        "rhand":"Bronze Knife",
        "legs":"none",
        "head":"none",
        "body":"none",
        "hands":"none",
        "feet":"none",
        "arms":"none",
        "ammo":"none",
    };
    this.status_effects = [];

	this.animDelay = 0;
};

Character.prototype = new app.extend(app.world.actor.Actor);

Character.prototype.get_sprite = function(dir, frame){
	if( dir ){
		if( frame > 3 || frame < 0 ){
			return false;
		}
		return this.sprite + "_" + dir + this.mode + frame;
	} else {
		return this.sprite + "_" + this.direction + this.mode + this.frame;
	}
};

Character.prototype.draw = function(){
	var nspr;
	if( this.is_animated ){
		nspr = this.get_sprite();
		//if( animdebug )console.log(nspr);
		if( this.aframes > this.frameskip ){
			this.aframes = 0;
			if( !this.holdframe ){
				this.frame++;
			}
			if( this.frame > this.maxframe ){
				switch( this.loopmode ){
					case "last" : 
						this.frame = this.maxframe; this.holdframe = true; break;
					case "loop" : 
						this.frame = 0; break;
					case "first": 
						this.frame = 0; this.holdframe = true; break;
					default : this.frame = 0;
				}
			}
		} else {
			this.aframes++;
		}
	} else {
		nspr = this.sprite + "_" + this.mode + this.direction;	
	}

	if( this.sprite.search("death") > -1 ){
		nspr = this.sprite;
	}

	if( this.isVisible && this.is_on_screen() ){
	    this.display.draw_sprite_scaled(
	    	nspr, 
            this.world.grid_to_pixw(this.x)+this.walk_offsetx, 
            this.world.grid_to_pixh(this.y)+this.walk_offsety,
            this.world.gridw,
            this.world.gridh
		);   
	    //Comment this out to hide the HP display
	    this.display.draw_text_params(
	    	this.stats.curr_hp, 
	        this.world.grid_to_pixw(this.x)+this.world.gridw/2, 
	        this.world.grid_to_pixh(this.y), {
		        font:"Verdana",
		        color:"white",
		        align:"center",
		        size: app.ui.CleanUIElem.prototype.get_font_size.call( this, 9 ),
		        weight:"italic"
		    }
	    );   
	}

	if( this.mode == "a" ){
		this.animDelay--;
		if( this.animDelay <= 0 ){
			this.set_default_sprite();
		}
	}

	if( this.walk_frame === this.max_walk_frames ) {
		this.is_between_tiles = false;
		this.walk_offsety = 0;
		this.walk_offsetx = 0;
		this.walk_frame = 0;
		this.loopmode = "first";
		this.holdframe = true;
		this.frame = 0;
	} else if( this.is_between_tiles ) {
		if( this.walk_frame === this.max_walk_frames-1 ){
			this.is_between_tiles = false; //smooths the walking somewhat
		}
		this.walk_frame++;
		this.set_animation_walk_offset();
	}
};

Character.prototype.is_visible = function(){
	return this.world.get_tile( this.x, this.y ).isInSight;
};

Character.prototype.has_dialogue = function(){
	return this.dialogue.d1 !== undefined;
};

Character.prototype.set_animation_walk_offset = function(){
	this.walk_offsetx = this.world.gridw*(this.last_x - this.new_x)*
		(this.max_walk_frames-this.walk_frame)*this.walk_offset_distance;
	this.walk_offsety = this.world.gridh*(this.last_y - this.new_y)*
		(this.max_walk_frames-this.walk_frame)*this.walk_offset_distance;
};

Character.prototype.reset_anim_state = function(){
	this.frame = 0;
	this.aframes = 0;
	this.holdframe = false;
};

Character.prototype.set_attack_sprite = function(){
	if( this.is_animated ){
		this.mode = "a";
		this.maxframe = 2;
		this.loopmode = "last";
		this.reset_anim_state();
		this.animDelay = 30; 
	} else {
	    this.mode = "a"; 
	    this.animDelay = 15;  
	}
};

Character.prototype.set_default_sprite = function(){
	if( this.is_animated ){
		this.mode = "";
		this.maxframe = 1;
		this.loopmode = "first";
		this.reset_anim_state();
	} else {
		this.mode = "d";
	    this.world.forceDoubleDraw = true; 
	}
};

Character.prototype.item_is_equipped = function( itemname ){
	for( var i in this.equipment ){
		if( this.equipment[i] === itemname ){
			return i;
		}
	}
	return false;
};

Character.prototype.get_inventory_weight = function(){
	var sum = 0;
	for( var i in this.inventory ){
		var item = this.world.itemCache.get_item( this.inventory[i] );
		sum += item.weight;
	}
	return sum;
};

Character.prototype.get_max_carryable_weight = function(){
	return 150;
};

Character.prototype.equip_item = function( itemname, bodypart ){
	this.equipment[ bodypart ] = itemname;
};

Character.prototype.unequip_item = function( itemname ){
	for( var i in this.equipment ){
		if( this.equipment[i] === itemname ){
			this.equipment[i] = "none";
			return;
		}
	}
};

Character.prototype.add_item_to_inventory = function( itemname ){
	this.inventory.push( itemname );
};

Character.prototype.remove_item_from_inventory = function( itemname ){
	for( var i in this.inventory ){
		if( this.inventory[i] === itemname ){
			this.inventory.splice( i, 1 );
			return;
		}
	}
};

Character.prototype.walk_to_tile = function( fromx, fromy, newx, newy ){
	//walk variables
	this.is_between_tiles = true;
	this.last_x = fromx;
	this.last_y = fromy;
	this.new_x = newx;
	this.new_y = newy;
	this.walk_frame = 0;
	this.frame = 1;
	this.loopmode = "loop";	
	this.set_animation_walk_offset();
};

Character.prototype.change_direction = function( dir ){
	if( this.is_animated ){
		this.direction = dir;
	} else {
		if( dir == "u" ){
			dir = "r";
		}
		else if( dir == "d" ){
			dir = "l";
		}
		this.direction = dir;
	}
};

Character.prototype.do_next_action = function(world_instance){
    this.ai.do_next_action(this, world_instance);
};

Character.prototype.calc_hpmp = function(){
	var dummy = {
		cur:100,
		max:100,
	};

	var hp_obj = this.world !== "none" ?
		this.world.engine.calculate_hp_from_stats( this )
			:
		dummy;
	var mp_obj = this.world !== "none" ?
		this.world.engine.calculate_mp_from_stats( this )
			:
		dummy;

	this.stats.max_hp = hp_obj.max;
	this.stats.curr_hp = hp_obj.cur;
	this.stats.max_mp = mp_obj.max;
	this.stats.curr_mp = mp_obj.cur;
};

Character.prototype.get_final_stat = function(statname){
	var ret = {};
	var stat = parseInt(this.stats[statname]);

	if( stat === undefined ){
		console.log("WARNING: Actor does not have a '"+statname+"' stat!");
		ret.base = 1;
		ret.stat = 1;
		return ret;
	}

	ret.base = stat;
	ret.stat = stat;

	for( var i in this.equipment ){
		var item = this.world.itemCache.get_item(this.equipment[i]);
		if( item !== "none" ){
			if( item.equipStats[statname] !== 0 ){
				ret.stat += parseInt( item.equipStats[statname] );
				ret[i] = parseInt( item.equipStats[statname] );
			}
		}
	}

	for( var i in this.status_effects ){
		var se = this.status_effects[i];
		if( se.stats[statname] !== 0 ){
			ret.stat += parseInt(se.stats[statname]);
			ret[se.name] = parseInt(se.stats[statname]);
		}
	}

	return ret;
};

Character.prototype.get_stats = function(){
	return this.stats;
};

Character.prototype.set_stat = function(stat, num){
	this.stats[stat] = num;
};

Character.prototype.set_predef_stats = function(set){
	this.stats = new app.world.actor.Stats();
	for( var i in set ){
		this.stats[i] = set[i];
	}
};

Character.prototype.add_item = function(item){
    this.inventory.push( item );
};

Character.prototype.get_item = function(item_name){
    for( var i in this.inventory ){
        var thing = this.inventory[i];
        if( name == item_name ){
            return thing;
        }
    }

    return "none";
};

Character.prototype.apply_pre_effects = function(){
	for( var i in this.status_effects ){
		this.status_effects[i].apply_pre_turn_effect();
	}
};

Character.prototype.apply_post_effects = function( callback ){
	var call_next_effect = function(inde){
		this.status_effects[inde].apply_post_turn_effect(0, 0);
		this.status_effects[inde].decrement_effect();
		if( this.status_effects[inde].FLAG_remove ){
			this.status_effects.splice(inde,1);
			inde = inde - 1;
		}

		if( inde == this.status_effects.length - 1 ){
			this.call_after_animation( callback, "" );
		} else {
			this.call_after_animation( function(){
				call_next_effect(inde+1);
			}, "");
		}
	}.bind(this);
	if( this.status_effects.length > 0 ){
		call_next_effect(0);
	} else {
		callback();
	}
};

Character.prototype.add_status_effect = function(eff_const, att_name, state){
	var effect = null;
	switch( eff_const ){
		case "FEARED": 	
			effect = new app.world.FearedEffect(
				this.name, att_name, this.display, this.world, state
			);
			break; 
		case "POISONED": 	
			effect = new app.world.PoisonedEffect(
				this.name, att_name, this.display, this.world, state
			);
			break; 
		case "BURNING": 	
			effect = new app.world.BurningEffect(
				this.name, att_name, this.display, this.world, state
			);
			break; 
		case "BOUND": 	
			effect = new app.world.BoundEffect(
				this.name, att_name, this.display, this.world, state
			);
			break; 
		case "FROZEN": 	
			effect = new app.world.FrozenEffect(
				this.name, att_name, this.display, this.world, state
			);
			break; 
		case "CURSED":
			effect = new app.world.CursedEffect(
				this.name, att_name, this.display, this.world, state
			);
			break; 
		case "BLESSED": 	
			effect = new app.world.BlessedEffect(
				this.name, att_name, this.display, this.world, state
			);
			break; 
		case "HASTED": 	
			effect = new app.world.HastedEffect(
				this.name, att_name, this.display, this.world, state
			);
			break; 
		case "SHIELDED": 	
			effect = new app.world.ShieldedEffect(
				this.name, att_name, this.display, this.world, state
			);
			break; 
	}

	effect.id = eff_const;

	var tmp = this.has_status_effect( effect.name );
	if( tmp === "none" ){
		this.status_effects.push( effect );
	} else {
		if( tmp.effect.power > effect.power ){
			tmp.effect.decay_turn += 3;
		} else {
			this.status_effects.splice( tmp.ind, 1 );
			this.status_effects.push( effect );
		}
	}
};

Character.prototype.has_status_effect = function( effect_name ){
	for( var i in this.status_effects ){
		if( this.status_effects[i].name ==  effect_name ){
			return {ind: i, effect:this.status_effects[i]};
		}	
	}

	return "none";
};

Character.prototype.get_level = function(stats){
	var t = stats || this.stats;
	return parseInt(t.POW) + 
		parseInt(t.ACC) + 
		parseInt(t.FOR) + 
		parseInt(t.CON) + 
		parseInt(t.RES) + 
		parseInt(t.EVA) + 
		parseInt(t.SPD);
};

})();