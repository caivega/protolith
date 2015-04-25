/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var TIER0 = 0;
var TIER1 = 1;
var TIER2 = 2;
var TIER3 = 3;
var TIER4 = 4;
var TIER5 = 5;

var EquipStats = app.world.EquipStats = function(){
    this.POW = 0;
    this.ACC = 0;
    this.FOR = 0;
    this.CON = 0;
    this.RES = 0;
    this.SPD = 0;
    this.EVA = 0;

    this.pen = 0;
    this.rat = 0.0;
    this.BASE = 0;
};

var ItemCache = app.world.ItemCache = function(world, state){
    this.items = [];
    this.state = state;
    this.world = world;

    var tmp = new Item("Bronze Knife", "knife", world);
    tmp.description = "This is a simple, unassuming knife made from bronze. "+
        "(Bronze is considered the weakest of the metals for weapons)";
    tmp.equipTypes = ["rhand","lhand"];
    tmp.equipStats.POW = 2;
    tmp.equipStats.ACC = 1;
    tmp.equipStats.rat = 0.2;
    tmp.equipStats.pen = 0;
    tmp.equipStats.BASE = 3;
    this.items.push( tmp );

    var tmp = new Item("Bronze Sword", "sword", world);
    tmp.description = "This is a typical sword made out of bronze. "+
        "(Bronze is considered the weakest of the metals for weapons)";
    tmp.equipTypes = ["rhand","lhand"];
    tmp.equipStats.POW = 4;
    tmp.equipStats.ACC = -1;
    tmp.equipStats.rat = 0.6;
    tmp.equipStats.pen = 0;
    tmp.equipStats.BASE = 5;
    this.items.push( tmp );

    var tmp = new Item("Iron Sword", "sword", world);
    tmp.description = "This is a typical sword made out of iron. "+
        "(Iron is considered the second weakest of the metals for weapons)";
    tmp.equipTypes = ["rhand","lhand"];
    tmp.equipStats.POW = 10;
    tmp.equipStats.ACC = 5;
    tmp.equipStats.rat = 0.7;
    tmp.equipStats.pen = 0;
    tmp.equipStats.BASE = 10;
    this.items.push( tmp );

    var tmp = new Item("Oak Bow", "spear", world);
    tmp.description = "This is a standard bow that peasent hunters use to shoot "+
        "local wildlife.";
    tmp.equipTypes = ["rhand"];
    tmp.equipStats.POW = 5;
    tmp.equipStats.ACC = -1;
    tmp.equipStats.rat = 0.6;
    tmp.equipStats.pen = 3;
    tmp.equipStats.BASE = 3;
    tmp.type = "ranged";
    this.items.push( tmp );

    var tmp = new Item("Health Potion (weak)", "potion", world);
    tmp.description = "This bottle is full of a sickeningly brown liquid, and it "+
        "smells of burnt turnips, but you know you'll feel at least a little better"+
        " if you drink it.";
    tmp.on_use = function(user, victim){
        var amt = Math.round((Math.random()*10 + 1));
        if( victim.isDead ){
            this.state.warn.add_log("red", "This character is dead!");
            return;
        }
        victim.stats.curr_hp += amt;
        if( victim.stats.curr_hp > victim.stats.max_hp ){
            victim.stats.curr_hp = victim.stats.max_hp;
        }    
        this.world.soundCache.play_sound("gulp");    
        console.log("GAME: "+user.name+" uses "+this.name+" on "+victim.name);
        this.state.warn.add_log("red", this.name+" makes "+victim.name+" feel a little better");
    }.bind(this);
    this.items.push( tmp );

    var tmp = new Item("Health Potion (moderate)", "potion", world);
    tmp.description = "This bottle is full of a sickeningly brown liquid, and it "+
        "smells of burnt turnips, but you know you'll feel at least a little better"+
        " if you drink it.";
    tmp.on_use = function(user, victim){
        var amt = Math.round((Math.random()*20 + 10));
        if( victim.isDead ){
            this.state.warn.add_log("red", "This character is dead!");
            return;
        }     
        victim.stats.curr_hp += amt;
        if( victim.stats.curr_hp > victim.stats.max_hp ){
            victim.stats.curr_hp = victim.stats.max_hp;
        }
        this.world.soundCache.play_sound("gulp");
        console.log("GAME: "+user.name+" uses "+name+" on "+victim.name);
        this.state.warn.add_log(
            "red", this.name+" makes "+victim.name+" feel a little better"
        );
    }.bind(this);
    this.items.push( tmp );
  
    var tmp = new Item("Bag of Gold (weak)", "goldbag", world);
    tmp.description = "";
    tmp.on_acquire = function(user, name){
        var amt = Math.round((Math.random()*20 + 1));
        console.log(
            "GAME: "+user.name+" picks up "+name+" valued at "+amt+" gold pieces."
        );
    }.bind(this);
    this.items.push( tmp ); 

    var tmp = new Item("Bag of Gold (moderate)", "goldbag", world);
    tmp.description = "";
    tmp.on_acquire = function(user, name){
        var amt = Math.round((Math.random()*50 + 20));
        console.log(
            "GAME: "+user.name+" picks up "+name+" valued at "+amt+" gold pieces."
        );
    }.bind(this);
    this.items.push( tmp );  

    var tmp = new Item("Leather Boots", "boots", world);
    tmp.description = "The only redeeming quality of these ratty, old boots is that"+
        " they'll most likely prevent you from stubbing your toes on an oucropped root.";
    tmp.equipTypes = ["feet"];
    tmp.equipStats.CON = 1;
    this.items.push( tmp );  

    var tmp = new Item("Cloth Pants", "pants", world);
    tmp.description = "A pretty standard pair of pants.";
    tmp.equipTypes = ["legs"];
    tmp.equipStats.CON = 2;
    this.items.push( tmp );  

    var tmp = new Item("Cloth Shirt", "shirt", world);
    tmp.description = "A cloth shirt that any peasent would wear.";
    tmp.equipTypes = ["body"];
    tmp.equipStats.CON = 2;
    this.items.push( tmp ); 

    var tmp = new Item("Bronze Chain Vest", "shirt", world);
    tmp.description = "This is a typical chain vest made out of bronze.";
    tmp.equipTypes = ["rhand","lhand"];
    tmp.equipStats.CON = 5;
    tmp.equipStats.FOR = 3;
    this.items.push( tmp );    

    var tmp = new Item("Pebble", "rock", world);
    tmp.description = "This is just an igneous rock.  Why did you pick this up again?";
    tmp.equipTypes = [];
    this.items.push( tmp ); 

    var tmp = new Item("Wooden Shield", "shield", world);
    tmp.description = "In truth this is just a flat piece of wood, but somebody "+
        "strapped a handhold on one side of it.";
    tmp.equipTypes = ["lhand"];
    this.items.push( tmp );

    var tmp = new Item("Bronze Shield", "shield", world);
    tmp.description = "A simple sheet of bronze with a few dents in it.";
    tmp.equipTypes = ["lhand"];
    this.items.push( tmp );

    var tmp = new Item("Iron Shield", "shield", world);
    tmp.description = "A sturdy shield made of iron";
    tmp.equipStats.CON = 5;
    tmp.equipStats.FOR = 5;    
    tmp.equipTypes = ["lhand"];
    this.items.push( tmp );

    var tmp = new Item("Wooden Arrow", "axe", world);
    tmp.description = "A simple wooden arrow for hunting wildlife.";
    tmp.equipTypes = ["ammo"];
    this.items.push( tmp );    

    var tmp = new Item("Sword of Power", "sword", world);
    tmp.description = "A feint glow emanates from this sword.  You can sense it's"+
        " incredible power just by holding it.";
    tmp.equipTypes = ["rhand"];
    tmp.equipStats.POW = 80;
    tmp.equipStats.ACC = 50;
    tmp.equipStats.rat = 1.0;
    tmp.equipStats.pen = 10;
    tmp.equipStats.BASE = 25;
    tmp.tier = TIER5;
    this.items.push( tmp );                                    
};

ItemCache.prototype.get_item = function(item_name){
    var tmp;
    if( (tmp = item_name.search("_")) > -1 ){
        item_name = item_name.substring(0, tmp);
    }
    for( var i in this.items ){
        if( this.items[i].name == item_name ){
            return this.items[i];
        }
    }
    return "none";
};

ItemCache.prototype.get_drop = function(drop_tier){
    var bag = [];

    switch( drop_tier ){
        case TIER0: break;
        case TIER1: break;
        case TIER2: break; 
        case TIER3: break; 
        case TIER4: break; 
        case TIER5: break;  
    }

    for( var i in this.items ){
        if( this.items[i].tier <= drop_tier){
            bag.push( this.items[i].name );
        }
    }

    var ind = Math.floor( Math.random()*bag.length );

    return bag[ind]+"_"+app.random_id(10);
};

var Item = function(name, sprite, world){
    this.world = world;
    this.name = name;
    this.sprite = sprite;

    this.tier = TIER0;

    this.on_use = "none";
    this.on_acquire = "none";

    this.type = "none";
    this.weight = 10;
    this.equipTypes = [];
    this.equipStats = new EquipStats();  
    this.description = "There is no description currently available for this"+
        " droll item.  You should try imagining your own.";
    this.value = 10;
    this.stackable = false;
};

var ItemBronzeKnife = function(){
    Item.call(this, "Bronze Knife", "knife" );

    this.isEquipable = true;
    this.isUsable = true;
    this.equipType = "rhand";
    this.equipStats.POW = 1;

    return this;
};

ItemBronzeKnife.prototype = app.extend(Item);

})();