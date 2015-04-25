/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

app.maps = {};
var MapLoader = app.maps.MapLoader = function(){
    this.maps = {};

    this.npclist = [];
    this.npcListLoaded = false;

    this.totalmaps = 0;
    this.loaded_maps = 0;

    this.map_sources = [];

    this.map_sources.push("test");
    this.map_sources.push("test_level");
    this.totalmaps = this.map_sources.length;
	this.load_maps();

    this.load_npclist_disk("./maps/meta/Protolith.npc");
};

MapLoader.prototype.load_npclist_disk = function(src){
    var request = new XMLHttpRequest();
    request.open("GET", src, true);

    request.onreadystatechange = function() {
        if( request.readyState === 4 ){
            this.handle_loaded_npclist( request.responseText );
        }
    }.bind(this);
    request.send();
};

MapLoader.prototype.load_maps = function(){
    for( var i in this.map_sources ){
        this.load_map_disk(
            "./maps/json/"+this.map_sources[i]+".json", this.map_sources[i]
        );
    }
};

//load the terrain data asynchronously from the disk
MapLoader.prototype.load_map_disk = function(src, name){
    var captain = this;
    console.log("Loading a map from disk", src);

    var request = new XMLHttpRequest();
    request.open("GET", src, true);

    this.maps[name] = "none";
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            captain.loaded_maps++;
            try{
                captain.create_map( JSON.parse(request.responseText), name);
            }catch( e ){
                console.error(src, "is not a valid Protolith map.", request.responseText);
            }
        }
    };

    request.send();
};

MapLoader.prototype.create_map = function(map, name){
    var mapW = map.width;
    var mapH = map.height;

    function _get_layer(n){
        for( var i in map.layers ){
            if( map.layers[i].name.toLowerCase() === n.toLowerCase() ){
                return map.layers[i].objects || map.layers[i].data;
            }
        }
        return null;
    }

    this.maps[name] = {
        //These are satic variables that are read only and referenced frequently.
        name: name,
        terrain: this.load_terrain( _get_layer( "TERRAIN" ), mapW, mapH ),
        npcs: _get_layer( "NPC" ),
        nodes: _get_layer( "NODE" ),
        items: _get_layer( "ITEM" ),
        width: map.width,
        height: map.height,
        src:name,
        json:map,
        //These are dynamic variables that modify the state of the map and
        //they have all been initialized to their default values here.
        mode: "town",
        allegiance:"ally",
        map_explored_table: this.get_empty_MET(map),
        nodes_executed: [],
        dead_npcs: [],
    };
};

//Set the dynamic variables for all maps to their default values
MapLoader.prototype.reset = function(){
    for( var i in this.maps ){
        var map = this.maps[i];
        map.map_explored_table = this.get_empty_MET(this.maps[i]);
        map.nodes_executed = [];
        map.dead_npcs = [];
        map.mode = "town";
        map.allegiance = "ally";
    }
};

MapLoader.prototype.get_npc_by_name = function(name){
    for( var i in this.npclist ){
        if( this.npclist[i].name == name ){
            return this.npclist[i];
        }
    }

    return "none";
};

MapLoader.prototype.get_map_by_name = function(name){
    try{
        var ret = this.maps[name];
        if( ret){
            return ret;
        } else {  
            throw new Error("");
        }
    } catch( e ){
        console.error( "Error map '"+name+"' has not been loaded!", e.stack );
        return "none";
    }
};

MapLoader.prototype.load_terrain = function(arr, w, h){
    var terrain = [];
    for( var i = 0; i < w; i++ ){
        var tmp = [];
        for( var j = 0; j < h; j++ ){
            tmp.push( arr[j*w+i] );
        }
        terrain.push(tmp);
    }

    return terrain;
};


MapLoader.prototype.handle_loaded_npclist = function(json_str){
    try{
        this.npclist = JSON.parse( json_str );
    } catch( e ) {
        console.error( "Not a valid npc file." );     
    }
    this.npcListLoaded = true;
};

MapLoader.prototype.get_empty_MET = function(map){
    var map_explored_table = [];
    for( var i = 0; i < map.height; i++ ){
        map_explored_table.push([]);
        for( var j = 0; j < map.width; j++){
            map_explored_table[i].push(0);
        }
    }
    return map_explored_table;
};

MapLoader.prototype.get_METS = function(){
    var ret = {};

    for( var i in this.maps ){
        ret[this.maps[i].name] = this.maps[i].map_explored_table;
    }

    return ret;
};

MapLoader.prototype.get_NES = function(){
    var ret = {};

    for( var i in this.maps ){
        ret[this.maps[i].name] = this.maps[i].nodes_executed;
    }

    return ret;
};

MapLoader.prototype.get_map_params = function(name){
    for( var i in this.maps ){
        if( i === name ){
            return this.maps[i];
        }
    }

    console.error("Error map '"+name+"' has not been loaded!");
    return "none";
};

//var tmp = false;
MapLoader.prototype.is_ready = function(){
    var ret = {is_ready: false, max:this.totalmaps+1, curr:0};
    if( this.npcListLoaded === false ){
        return ret;
    }

    ret.curr++;

    for( var i in this.maps ){
        if( this.maps[i] === "none" || this.maps[i].nodes === "none" ){
            return ret;
        }
        ret.curr++;
    }

    ret.is_ready = true;// && tmp;
    return ret;
};

})();
