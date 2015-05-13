/* jshint browser: true */
/* global app */

(function(){
"use strict";

var CombatEngine = app.world.CombatEngine = function(world, state, wmode){
	this.world = world;
	this.state = state;
	this.wmode = wmode;
};

CombatEngine.prototype.did_it_hit = function(vic_EVA, att_ACC){
    return Math.floor( Math.random()*vic_EVA ) < 
        (Math.floor( Math.random()*att_ACC + att_ACC/2));
};

CombatEngine.prototype.calculate_phys_damage = 
    function(base_damage, w_stats, att_POW, vic_FOR){

    var vari = 5;
    var v = Math.floor((Math.random()*(vari)));
    var total_raw_damage = Math.floor( 
        att_POW*0.25 + (v+base_damage) + (w_stats.rat*att_POW)
    );

    var sub = vic_FOR - w_stats.pen;
    if( sub < 1 ){
        sub = 1;
    }
    var mitigated = Math.floor( total_raw_damage*( app.normalize( sub, 1, 120, 0, 1 ) ) );
    var final_damage = total_raw_damage - mitigated;

    if( final_damage < 0){
        final_damage = 0;
    }

    return final_damage;
};

CombatEngine.prototype.show_particle = function( p ){
    this.wmode.actionlist.push( function(){
        this.world.add_particle( p );
    }.bind(this));
};

CombatEngine.prototype.action_attack = function(attacker, victim){
    var att = this.world.get_character(attacker);
    var vic = this.world.get_character(victim);

    var a_stats = att.get_stats();
    var v_stats = vic.get_stats();

    this.cDamageType = "physical";

    var rhweapon = this.world.itemCache.get_item(
        att.equipment.rhand.substring( 0, att.equipment.rhand.search("_") ));
    var lhweapon = this.world.itemCache.get_item(
        att.equipment.lhand.substring( 0, att.equipment.lhand.search("_") ));

    var w_stats1 = null;
    var w_stats2 = null;
    if( rhweapon !== "none" ){
        w_stats1 = rhweapon.equipStats;
    } else {
        w_stats1 = new app.world.EquipStats();
    }
    if( lhweapon !== "none" ){
        w_stats2 = lhweapon.equipStats;
    } else {
        w_stats2 = new app.world.EquipStats();
    }

    var att_ACC1 = parseInt(a_stats.ACC) + parseInt(w_stats1.ACC);
    var att_POW1 = parseInt(a_stats.POW) + parseInt(w_stats1.POW);

    // var att_ACC2 = parseInt(a_stats.ACC) + parseInt(w_stats2.ACC);
    // var att_POW2 = parseInt(a_stats.POW) + parseInt(w_stats2.POW);

    var vic_EVA = parseInt(v_stats.EVA);
    var vic_FOR = parseInt(v_stats.FOR);

    var base_damage = w_stats1.BASE;
    var final_damage = this.calculate_phys_damage(base_damage, w_stats1, att_POW1, vic_FOR);

    var msgact2 = victim;
    var tmp2;
    if( (tmp2 = msgact2.search("_")) != -1 ){
        msgact2 = msgact2.substring(0, tmp2);
    }  

    //this.state.notif.add_log("COMBAT", "----> "+final_damage+" to "+msgact2);
    v_stats.curr_hp -= final_damage; 
    this.regulate_all_health();

    if( final_damage === 0 ){
        final_damage = "No Damage!";
    }

    if( !this.did_it_hit(vic_EVA, att_ACC1) ){
        final_damage = final_damage/4;
    }

    att.set_attack_sprite();
    if( rhweapon.type == "ranged" ){
        if( final_damage > 0 ){
            this.world.soundCache.play_sound("arrowhit");
        } else {
            this.world.soundCache.play_sound("miss");
        }
        var p = new app.world.actor.DamageIndicator( this.world, {
            target: vic,
            value: final_damage,
            sprite: "ranged",
            isstatic: true
        });
    	this.show_particle( p );  
    } else {
        var punch = Math.floor( Math.random()*4 ) + 1;
        if( final_damage > 0 ){
            this.world.soundCache.play_sound("punch"+punch);
        } else  {
            this.world.soundCache.play_sound("miss");
        }

        var p = new app.world.actor.DamageIndicator( this.world, {
            target: vic,
            value: final_damage,
            sprite: "physd",
            isstatic: true
        });
        this.show_particle( p ); 
    }  

    vic.lastdamagedby = att;

    this.cDamage = final_damage;
    return final_damage;
};

CombatEngine.prototype.action_magic = function(attacker, victims, spell_name){
    //this.state.notif.add_log("COMBAT",attacker+" casts "+spell_name+":");
    this.world.sm.cast_spell( attacker, victims, spell_name );
    this.regulate_all_health();
    return 0;    
};

CombatEngine.prototype.kill_character = function(act_name){
    this.cDeath = act_name;
    var vic = this.world.get_character(act_name);
    vic.kill();   

    var death_spr_num = Math.floor(Math.random()*4);

    var sq = this.world.get_tile(vic.x, vic.y);
    sq.remove_content(vic.name);

    var drop = this.world.itemCache.get_drop( vic.dropTier );
    if( drop !== "none" ){
        sq.add_content( drop );
    }

    vic.sprite = "death"+death_spr_num;
    var msgact2 = act_name;
    var tmp2 = msgact2.search("_");
    if( tmp2 !== -1 ){
        msgact2 = msgact2.substring(0, tmp2);
    }
    //this.state.notif.add_log("COMBAT",msgact2+" is dead!");
    this.world.soundCache.play_sound("humanmaledeath");

    this.grant_xp_for_kill(vic.lastdamagedby, vic);
};

CombatEngine.prototype.grant_xp_for_kill = function(to, from){
    if( to === null ){
        return;
    }

    var tolevel = to.get_level();
    var fromlevel = from.get_level();
    var diff = fromlevel - tolevel;

    var xpgained = fromlevel;
    //if the attacker had a higher level
    if( diff < 0 ){
        diff = Math.abs( diff );
        xpgained = xpgained  - diff/2;
        if( xpgained < 1 ){
            xpgained = 1;
        }
    } else {
        xpgained = xpgained + (diff*2);
    }

    this.state.player.grant_xp( to, xpgained );
};

CombatEngine.prototype.regulate_all_health = function(){
    var gonnors = [];

    for( var i in this.wmode.pcs ){
        var act = this.world.get_character( this.wmode.pcs[i] );

        var stats = act.get_stats();
        var max_hp = act.get_stats().max_hp;
        var curr_hp = act.get_stats().curr_hp;

        if( curr_hp < 0 ){
            gonnors.push( this.wmode.pcs[i] );
        }

        if( curr_hp > max_hp ){
            stats.curr_hp = max_hp;
        }
    }

    for( var i in this.wmode.npcs ){
        var act = this.world.get_character( this.wmode.npcs[i] );

        var stats = act.get_stats();
        var max_hp = act.get_stats().max_hp;
        var curr_hp = act.get_stats().curr_hp;

        if( curr_hp < 0 && !act.isDead ){
            gonnors.push( this.wmode.npcs[i] );
        }

        if( curr_hp > max_hp ){
            stats.curr_hp = max_hp;
        }
    }

    for( var i in gonnors ){
        this.kill_character( gonnors[i] );
    }
};

CombatEngine.prototype.determine_victims = function(/*attacker_name, gx, gy, spell*/){
    // var sq;
    // var victim = "";
    // var area = [];
    // var victims = [];
    // var cast_type = spell.ct;
    // for( var i = 0; i < spell.a.length; i++ ){
    //     area = spell.a[i];
    //     sq = this.world.get_tile(gx+area[0], gy+area[1]);
    //     if( cast_type === CAST_TARGET ){
    //         victim = sq.has_enemy_character( attacker_name );
    //     } else if( cast_type === CAST_ALLY ){
    //         victim = sq.has_ally_character( attacker_name );
    //     } else if( cast_type === CAST_ANYONE ){
    //         victim = sq.has_character( );
    //     }

    //     if( victim.length > 1 && victim != "blocked!" && victim != "none"){
    //         victims.push(victim);     
    //     }               
    // }

    // return victims;
    return [];
};

CombatEngine.prototype.calculate_hp_from_stats = function(act){
    var stats = act.stats;
    var x = parseInt(stats.CON);
    var z = parseInt(stats.FOR);

    for( var i in act.equipment ){
        var tmp;
        var name=act.equipment[i];
        if( (tmp=act.equipment[i].search("_")) > -1 ){
            name = name.substring(0,tmp);
        }

        var item = this.world.itemCache.get_item( name );
        if( item != "none" ){
            x += parseInt(item.equipStats.CON);
            z += parseInt(item.equipStats.FOR);
        }
    }

    var max = 5+parseInt(x)+Math.round( (25.5*z*Math.sqrt(z))/(parseInt(z) + 1)  );
    var mult = app.normalize( stats.curr_hp, 0, stats.max_hp, 0, 1);
    var cur = Math.round( max*mult );
    var ret = {max: max, cur: cur};
    //If the character had 99 FOR and 99 CON, he would have 350 health and be a bauss
    return ret;
};

CombatEngine.prototype.calculate_mp_from_stats = function(act){
    var stats = act.stats;
    var x = parseInt(stats.POW); 

    for( var i in act.equipment ){
        var tmp;
        var name=act.equipment[i];
        if( (tmp=act.equipment[i].search("_")) > -1 ){
            name = name.substring(0,tmp);
        }
        var item = this.world.itemCache.get_item( name );
        if( item != "none" ){
            x += parseInt(item.equipStats.POW);
        }
    }

    var max = 9 + Math.round(Math.log(x)*Math.sqrt(x/2));
    var mult = app.normalize( stats.curr_mp, 0, stats.max_mp, 0, 1);
    var cur = Math.round( max*mult );
    if( isNaN(cur) ){
        cur = 1;
    }
    var ret = {max: max, cur: cur};

    return ret; 
};

})();