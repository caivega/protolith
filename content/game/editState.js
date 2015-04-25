
function closeThis( saveThis ){
	$("#fm").hide()
    if( saveThis ){
   		document.onkeydown({ type : 'keypress', keyCode : 17, which : 17, preventDefault:function(){} });
   	} else {
   		document.onkeydown({ type : 'keypress', keyCode : 18, which : 18, preventDefault:function(){} });
   	}
   	//$(document).focus();
}

String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};

String.prototype.splice = function( index, howManyToDelete, stringToInsert ){
    var characterArray = this.split( "" );
    Array.prototype.splice.apply(
        characterArray,
        arguments
    );
     
    return( characterArray.join( "" ));
};

function WriteZip(data, filename){
    // var zip = new JSZip();

    // for( var i in data ){
    //     var obj = data[i];
    //     zip.file(obj.filename, obj.filedata);
    // }

    //WriteFile_generic( zip.generate(), "MYZIP.zip");

    var zip = new JSZip();
    zip.file("hello1.txt", "Hello First World\n");
    zip.file("hello2.txt", "Hello Second World\n");
    content = zip.generate();

    //zip.add("Hello.", "hello.txt");
    location.href="data:application/zip;base64," + content;

}

function LoadZip(filename){

    console.log("LOADZIP");

    var captain = this;
    var request = new XMLHttpRequest();
    request.open("GET", filename, true);

    request.onreadystatechange = function() {
        if (request.readyState == 4) {

            var zip = new JSZip(request.responseText);
            console.log("BEEF");
            console.log(zip);
            console.log(zip.file("hello1.txt"));
        //captain.handle_loaded_npclist(request.responseText);
        }
    }
    request.send(); 
}

var NODE_STR = "";
var NODE_NAME = "ChangeMap";

/**
	/class EditState
	/brief Abstract class for an game state
*/
var EditState = function(game, state_params){
	AbstractState.call(this, game);	

	this.display = this.game.display;
    this.display.resize_canvas(784, 576)
    this.tsqx = 28;
    this.tsqy = 18; 

    this.state_params = state_params;

	this.params;
    this.map_name;

    this.active_node = "";
    this.active_npc = "";

	this.tiles = [];
	this.pc_list = ["da"];

	this.isRunning = false;

	this.mx = 0;
	this.my = 0;

	this.hovX = 0;
	this.hovY = 0;

    this.ctr = 1;
    this.ctr2 = 1;

    this.fm_id = "fm";

    this.ui = new esUI(this);
}

EditState.prototype.init = function(){
	this.game.display.set_background('http://muftah.org/wp-content/uploads/2012/04/NileSatellite.jpg');

	var captain = this;

    //custom params so using this tool isnt really obnoxious
    this.change_map("TestWorld"); 
    $("#show_npcedit_button").click();

    this.ui.init();

	this.draw_place();
}

EditState.prototype.change_state = function( game, state ){
	game.State = state;
}

EditState.prototype.change_map = function( map ){
	this.params = this.game.map_loader.get_map_params( map );
    this.map_name = map;
	this.world = new World(this.game.display, this.game.map_loader.get_map_params( map ) );
	this.world.init(this);
    for( var i = 0; i < this.params.width; i++ ){
        for( var j = 0; j < this.params.height; j++){
            var t = new Tile(i, j, "tile_"+this.params.terrain[i][j], this.params.terrain[i][j]+"", this.game.display, this.world);
        	this.tiles.push(t);
        }
    }

    this.active_node = "";
    //$("#node_sel").html(sel_str);
    this.set_node_selector();

    console.log(this.game.map_loader.get_map_params( map ));
    this.set_node_summary();

    this.draw_place();
}

EditState.prototype.draw_place = function(){
	this.game.display.boffset = 0;
	for( var i in this.world.squares ){
		var t = this.world.squares[i];
		t.tsqx = this.tsqx;
		t.tsqy = this.tsqy; 
		t.draw();
	}

    var node_counts = {};
	for( var i in this.world.nodes ){
		var n = this.world.nodes[i];
        var str = n.name;

        if( str != "null" && str.search("_") < 0 ){ 
            if( node_counts[n.x+" "+n.y] == undefined ){
                node_counts[n.x+" "+n.y] = 0;
                this.game.display.draw_sprite ("node_lgreen", 
                    this.world.grid_to_pixw(n.x), 
                    this.world.grid_to_pixh(n.y));
            }          
            var node_icon_y_offset = 0;
            var node_icon_x_offset = 0;
            for( var j = 0; j < node_counts[n.x+" "+n.y]; j++ ){
                node_icon_y_offset++;
                if( node_icon_y_offset%4 == 0 && node_icon_y_offset != 0 ){
                    node_icon_y_offset = 0;
                    node_icon_x_offset++;
                }
            }
            this.game.display.draw_sprite ("node_"+n.type, 
                this.world.grid_to_pixw(n.x) + 8*node_icon_x_offset, 
                this.world.grid_to_pixh(n.y) + 8*node_icon_y_offset);  
            node_counts[n.x+" "+n.y] = node_counts[n.x+" "+n.y] + 1;          
        }
	}

    for( var i in this.world.characters ){
        if( this.world.characters[i].allegiance != "player" ){
            this.world.characters[i].tsqx = this.tsqx;
            this.world.characters[i].tsqy = this.tsqy;
            this.world.characters[i].draw();
            if( this.world.characters[i].name === this.active_npc ){
                this.game.display.draw_sprite ("node_red", 
                    this.world.grid_to_pixw(this.world.characters[i].x), 
                    this.world.grid_to_pixh(this.world.characters[i].y));                
            }
        }
    }

    this.game.display.draw_text("( "+this.hovX+", "+this.hovY+" )" , 30, 20, "Verdanda", "white", "14", "normal", true);
    this.game.display.draw_text("( "+this.mx+", "+this.my+" )" , 90, 20, "Verdanda", "#BB7777", "14", "normal", true);

	this.game.display.draw_sprite ("node_blue", 
        this.world.grid_to_pixw(this.mx), 
        this.world.grid_to_pixh(this.my));

	this.game.display.draw_sprite ("node_rose", 
        this.world.grid_to_pixw(this.hovX), 
        this.world.grid_to_pixh(this.hovY));        	
}

EditState.prototype.get_max_node_number = function(){
    var max = 0;
    for( var i in this.world.nodes ){
        var node = this.world.nodes[i];
        var node_name = this.world.snp.inverse_parse_node(node).name;
        var node_num = parseInt( node_name.split("#")[1] );
        if( node_num > max ){
            max = node_num;
        }
    }
    return max;
}

EditState.prototype.add_node = function(){
    NODE_NAME += "#"+(this.get_max_node_number()+1);
	var props = this.params.tree.map.layer.properties;
	if( !("properties" in this.params.tree.map.layer) ){
		this.params.tree.map.layer.properties = {property:[]};
	}
	props = this.params.tree.map.layer.properties;

	var obj = {};
	obj["-name"] = NODE_NAME;
	obj["-value"] = NODE_STR;
	props.property.push(obj);

	var str = '\n<property name="'+NODE_NAME+'" value="'+NODE_STR+'"/>';
	var start_index = this.params.xml.search('<property name="ANODE#0" value="false#0#0#0#0#none#none#none#none"/>') + 68;

    if( start_index < 50 ){
        console.log("ERROR! Could not find node adding starting point, no ANODE");
        return;
    }

    console.log("Node added", NODE_NAME, NODE_STR);

    this.game.map_loader.add_node_to_map(this.map_name, NODE_NAME, NODE_STR);

	this.params.xml = this.params.xml.insert(start_index, str);
    this.world.add_node( this.game.map_loader.parse_node( NODE_NAME, NODE_STR ), this );
    this.set_node_selector();
    //this.print_nodes();
}

EditState.prototype.delete_node = function(node){
    var info = this.world.snp.inverse_parse_node( node );
    var query_str = '<property name="'+info.name+'" value="'+info.str+'"/>';

    var ind = this.params.xml.search( query_str );

    if( ind < 50 ){
        console.log("ERROR: No node found to delete: ", query_str );
        this.print_nodes();
        return;
    }

    for( var i in this.world.nodes ){
        //console.log("comparing", this.world.nodes[
        if( this.world.nodes[i].name == info.name ){
            this.world.nodes.splice(i,1);
        }
    }

    if( this.world.nodes.length > 0 ){
        this.active_node = this.world.nodes[1];
    } else {
        this.active_node = "none";
    }

    this.params.xml = this.params.xml.splice(ind, query_str.length );
    this.game.map_loader.delete_node_from_map(this.map_name, node.name);

    this.set_node_selector();

    console.log("Node deleted", node.name);
    //this.print_nodes();
}

EditState.prototype.replace_node_name = function(node_name, new_node_name){
    node_name = node_name.replace("#","_");
    new_node_name = new_node_name.replace("#","_");
    for( var i in this.world.nodes ){
        var node = this.world.nodes[i];
        var node_str = this.world.snp.inverse_parse_node(node).str;
        if( node_str.search(node_name) > -1 ){
            for( var j in node ){
                if( typeof node[j] == "string" ){
                    node[j] = node[j].replace(node_name, new_node_name);
                }
            }
        }
    }

    this.params.xml.replace(node_name, new_node_name);
}

EditState.prototype.add_npc = function(npc, x, y){

    var npc_xml_str = '\n<object name="'+npc.name+'" type="NPC" gid="122" x="'+x+'" y="'+y+'"></object>';
    var start_index = this.params.xml.search('<objectgroup name="NPCS"') + 48;
    this.params.xml = this.params.xml.insert(start_index, npc_xml_str);

    this.world.add_npc( npc, npc.name, x, y );

    this.set_node_selector();
    this.active_npc = npc.name;
    this.set_npc_summary();
    $("#npc_sel").val(this.active_npc);
    this.draw_place();
}

EditState.prototype.move_npc = function(npcname, oldx, oldy, x, y){
    var npc = "none";
    var npcerr = "none";
    for( var i in this.params.npcs ){
        if( this.params.npcs[i].name == npcname &&
            this.params.npcs[i].x == oldx &&
            this.params.npcs[i].y == oldy){
            npc = this.params.npcs[i];
        }
        if( this.params.npcs[i].name == npcname ){
            npcerr = this.params.npcs[i];
        }
    }

    if( npc === "none" ){
        console.log("WARNING: No npc of name and pos '"+npcname+"' ("+oldx+","+oldy+") found to move.");
        
        if( !(npcerr === "none") ){
            console.log(" However an npc was found with the same name: ", npcerr); 
        }
        return;
    }

    npc.x = x;
    npc.y = y;

    var npc_xml_str = '<object name="'+npc.name+'" type="NPC" x="'+oldx+'" y="'+oldy+'"/>';
    var npc_xml_str2 ='<object name="'+npc.name+'" type="NPC" x="'+x+'" y="'+y+'"/>'; 
    var start_index = this.params.xml.search(npc_xml_str);

    if( start_index < 2 ){
        console.log("WARNING: Somehow the npc you are moving is not in the xml params.", npc_xml_str);
        console.log(this.params.xml);
        return;
    }

    this.params.xml = this.params.xml.replace(npc_xml_str, "\n"+npc_xml_str2);
}

EditState.prototype.delete_npc = function(npc, name, x, y){

    var npc_xml_str = '\n<object name="'+name+'" type="NPC" gid="122" x="'+x+'" y="'+y+'"></object>';
    var ind = this.params.xml.search(npc_xml_str);

    if( ind > -1 ){
        this.params.xml = this.params.xml.splice(ind, npc_xml_str.length );
        this.set_node_selector();

        for( var i in this.world.characters ){
            var act = this.world.characters[i];
            if( act.name == name && act.x == x && act.y == y ){
                this.world.characters.splice(i, 1);
                console.log("Npc deleted: ", name);
            }
        }
    } else {
        console.log("ERROR: No NPC found to delete.", npc_xml_str);
    }

    this.set_node_selector();
    this.draw_place();
}

EditState.prototype.set_node_selector = function(){
    var sel_str = "";
    for( var name in this.world.nodes ){
        if( (this.world.nodes[name].name != "null") ){
            sel_str += "<option value='"+name+"'>"+this.world.nodes[name].name+"</option>";
            if( this.active_node === "" ){
                this.active_node = this.world.nodes[name];
                this.ctr++;
            }
        }
    }
    $("#node_sel").html(sel_str);

    sel_str = "";
    var act;
    for( var name in this.world.characters ){
        act = this.world.characters[name]; 
        if( act.allegiance != "player" ){
            sel_str += "<option value='"+act.name+"'>"+act.name+"</option>";
            if( this.active_npc === "" ){
                this.active_npc = act.name;
                this.ctr2++;
            }
        }
    }
    $("#npc_sel").html(sel_str);

    this.set_node_summary();

}

EditState.prototype.set_node_summary = function(){
    if( this.active_node == "" ){
        this.active_node = {name:"None", pers:"false", newx:"None", newy: "None", xpos:"None", ypos:"None", val1:"None", val2:"None", val3:"None", next:"None"}
    } 

    $("#name").html(this.active_node.name);
    $("#pers").html(this.active_node.pers);
    $("#newx").html(this.active_node.newx);
    $("#newy").html(this.active_node.newy);
    $("#xpos").html(this.active_node.xpos);
    $("#ypos").html(this.active_node.ypos);
    $("#val1").html(this.active_node.val1);
    $("#val2").html(this.active_node.val2);
    $("#val3").html(this.active_node.val3);
    $("#next").html(this.active_node.next);
}

EditState.prototype.set_npc_summary = function(){
    var npc = "none";
    var captain = this;
    for( var i in captain.game.map_loader.npclist){
        var tmp = captain.game.map_loader.npclist[i];
        if( tmp.name == this.world.fix_actor_name(this.active_npc) ){
            npc = tmp;
            break;
        }
    }

    if( this.active_npc == "" || npc == undefined || npc == "none"  ){
        npc = {"name":"Mr. Generic","sprite":"none","dialogue":{},"ai_combat":"none","ai_town":"none","inventory":[],"dspells":[],"lspells":[],"stats":{"POW":1,"ACC":1,"FOR":1,"CON":1,"RES":1,"SPD":1,"EVA":1}}
    }     

    $("#iname").val( npc.name );
    $("#isprite").val( npc.sprite );
    $("#idialogue").val( npc.dialogue );
    $("#iai_combat").val( npc.ai_combat );
    $("#iai_town").val( npc.ai_town );
    $("#iinventory").val( npc.inventory );
    $("#iallegiance").val( npc.allegiance );

    $("#iPOWinp").val( npc.stats.POW );
    $("#iACCinp").val( npc.stats.ACC );
    $("#iFORinp").val( npc.stats.FOR );
    $("#iCONinp").val( npc.stats.CON );
    $("#iRESinp").val( npc.stats.RES );
    $("#iSPDinp").val( npc.stats.SPD );
    $("#iEVAinp").val( npc.stats.EVA );

    $("#info_pane").show();
}
/**
    Get a random id of letters, numbers, and symbols of the length specified
    @param len The lenght of the id
*/
EditState.prototype.random_id = function(len){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghigklmnopqrstufwxyz1234567890";
    for( var i = 0; i < len; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

EditState.prototype.hide_window = function(window_id){
    $("#"+window_id).hide();
}

EditState.prototype.print_nodes = function(){
    var start_index = this.params.xml.search('<property name="ANODE#0" value="0#0#0#0#none#none#none#none"/>') + 62;
    var end_index   = this.params.xml.search('<property name="ZNODE#0" value="0#0#0#0#none#none#none#none"/>');

    console.log("NODES", start_index, end_index, this.params.xml.substring(start_index, end_index) );
}

EditState.prototype.begin = function(){
	this.draw_map();
}

EditState.prototype.pause = function(){

}

EditState.prototype.resume = function(){
	this.draw_place();
}

EditState.prototype.destroy = function(){

}

EditState.prototype.handleKeyPress = function(ev){

    var cpk = [];
    cpk[ev.keyCode] = true;

    if (cpk[38]) {
        // UP ARROW
        this.world.camY--;
        ev.preventDefault();
    }
    if (cpk[40]) {
        // DOWN ARROW
        this.world.camY++;
        ev.preventDefault();
    } 
    if (cpk[37]) {
        // LEFT ARROW
		this.world.camX--;
        ev.preventDefault();
    } 
    if (cpk[39]) {
        // RIGHT ARROW
		this.world.camX++;
        ev.preventDefault();
    }
    if(cpk[17]) {
    	//RIGHT CTRL
    	this.add_node(NODE_STR);
    	//ev.preventDefault();
    }
    if(cpk[18]) {
    	//RIGHT CTRL
    	//ev.preventDefault();
    }

    if( this.world.camY < 0 )
        this.world.camY = 0;

    if( this.world.camX < 0 )
        this.world.camX = 0;

    if( this.world.camY > this.params.height-9 )
        this.world.camY = this.params.height-9;

    if( this.world.camX > this.params.width-16 )
        this.world.camX = this.params.width-16;

    this.draw_place();
}

EditState.prototype.handleMouseClick = function(ev, off){
    var mouseX = ev.clientX;
    var mouseY = ev.clientY;

    prevMouseX = mouseX;
    prevMouseY = mouseY;

    this.mx = this.world.pix_to_gridw(mouseX);
    this.my = this.world.pix_to_gridh(mouseY);

    this.ocamx = this.world.camX;
    this.ocamy = this.world.camY;

    var frame = document.getElementById(this.fm_id).contentWindow;
    frame.setDefault("xpos", this.mx);
    frame.setDefault("ypos", this.my);    

    var node = this.world.get_node_by_position(this.mx, this.my);
    if( node != "none" ){
        this.active_node = node;
        $("node_sel").val(node.name);
        this.set_node_summary();
        $("#show_nedit_button").click();
    }

    var act = this.world.get_character_by_position(this.mx, this.my);
    if( act != "none" ){
        this.active_npc = act.name;
        this.set_npc_summary();
        $("npc_sel").val(node.name);
        $("#npc_sel").val(this.active_npc);
        $("#show_npcedit_button").click();
    }

    this.draw_place();
}

var mctr = 1;
var prevMouseX = 0;
var prevMouseY = 0;
EditState.prototype.handleMouseMove = function(ev, off){
    var mouseX = ev.clientX;
    var mouseY = ev.clientY;

    this.hovX = this.world.pix_to_gridw(mouseX);
    this.hovY = this.world.pix_to_gridh(mouseY);

    if( this.game.mouseDown ){
    	if(mctr %2 == 0){
            this.diffX = Math.round((prevMouseX-mouseX)/this.world.gridw);
            this.diffY = Math.round((prevMouseY-mouseY)/this.world.gridh);
    		this.world.set_camera(this.ocamx + this.diffX, this.ocamy + this.diffY);
    		mctr = 1;
    	} else {
    		mctr++;
    	}

	    if( this.world.camY < 0 )
	        this.world.camY = 0;

	    if( this.world.camX < 0 )
	        this.world.camX = 0;

	    if( this.world.camY > this.params.height-this.tsqy )
	        this.world.camY = this.params.height-this.tsqy;

	    if( this.world.camX > this.params.width-this.tsqx )
	        this.world.camX = this.params.width-this.tsqx;
    }

    this.draw_place();
}


//Swell things are good Brad


