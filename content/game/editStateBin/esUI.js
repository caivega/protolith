/*
	A place to partition the edit state ui
*/

var esUI = function( es ){

	//refrence to the edit state
	this.es = es;
	
}

esUI.prototype.init = function(){
	this.initRight();	
	this.initLeft();

	this.initNodeButtons();
}


esUI.prototype.initLeft = function(){

	var captain = this;

	//INDEX
	//MAP SELECTOR BOX
	//SAVE BUTTON
	//NEW NODE FRAME

	//MAP SELECTOR BOX
	var sel_str = "<select id='map_sel' style='width:98px;float:left'>";
	for( var name in this.es.game.map_loader.maps ){
		sel_str += "<option value='"+name+"'>"+name.substr(9)+"</option>";
	}
	sel_str+="</select>";
	$("#canvas_wrapper").append(sel_str);
	$("#map_sel").change( function(){
		var val = $(this).val();
		val = val.substring(9, val.length-4);

		captain.es.change_map(val);
		captain.es.draw_place(); 
	}); 

	//SAVE BUTTON
	var save_str = "<button id='save_button' style='background-color:#AA6666'>Save</button>";
	$("#canvas_wrapper").append(save_str);
	$("#save_button").live("click",function(){
		WriteFile(captain.es.params.xml, captain.es.params.name);
	});

    //NEW NODE FRAME
    var path = document.location.pathname;
    var dir = path.substring(0, path.lastIndexOf('/'));
    var fm_id = "fm"
    var fm_str = "<iframe width=460 height=385 id='"+fm_id+"' src='file://"+dir+"/game/editStateBin/editNodeFrame.html' style='position:absolute;left:820;top:10;z-index:99'> </iframe>";
	this.es.fm_id = fm_id;    
    $("#canvas_wrapper").append(fm_str);  
    $("#"+fm_id).hide();  
    $("#done_button").live("click",function(){
        $("#"+fm_id).hide();
    });

}

esUI.prototype.on_frame_load = function( func, id ){
	var captain = this;
	var frame = document.getElementById(id);
	if( (frame == null) ){
		setTimeout( function(){captain.on_frame_load( func, id) }, 150 );
	} else {
		console.log("GOt frame", id, frame.contentWindow)
		func(frame.contentWindow);
	}
}

esUI.prototype.initRight = function(){

	//INDEX
	//Node Selector
	//Show Node Edit tab
	//NPC edit button
	//Container holding the NPC and Node edit tabs
	//NPC selector inside NPC edit tab
	//EDIT NODE SELECTOR BOX
	//EDIT NODE BUTTON  
	//DELETE NODE BUTTON 
	//NODE SUMMARY DIV

	var fm_id = "fm";
	var captain = this;

	//Node selector
	$("#canvas_wrapper").append("<div id='nselect'></div>");
	$("#nselect").css({
		// left:'-530px',
		// top:'-44px',
	    borderStyle:'ridge',
	    borderColor:'#DADADA',
	    width:'190px',
	    height:'176px',
        "float":"left"
	});

   $("#canvas_wrapper").css({
        position:"relative",
        // top:"-400px",
        // left:"-1px"
   }); 

	//Show Node Edit tab
    $("#canvas_wrapper").append("<button id='show_nedit_button'> Nodes </button>");
    $("#show_nedit_button").css({
        position:'relative',
        width:'50px',
        height:'20px',
        //float:"left",
        zIndex:9
    });   
    $("#show_nedit_button").live("click", function(){
        $("#show_nedit_button").css({borderColor:'#DA33FF'});
        $("#show_npcedit_button").css({borderColor:'#DADADA'});
        $("#nedit").show(); 
        $("#npcedit").hide();        
    });  

    //Show NPC Edit tab
    $("#canvas_wrapper").append("&nbsp<button id='show_npcedit_button'> NPC </button>");
    $("#show_npcedit_button").css({
        //position:'relative',
        width:'50px',
        height:'20px',
        //float:"left"
    });  
    $("#show_npcedit_button").live("click", function(){
        $("#show_nedit_button").css({borderColor:'#DADADA'});
        $("#show_npcedit_button").css({borderColor:'#DA33FF'});        
        $("#nedit").hide(); 
        $("#npcedit").show();        
    });  
    $("#show_nedit_button").click();  	

    //NPC edit tab (ya its fucked up I don't want to fix it)
    $("#canvas_wrapper").append("<div id='edit_cont'></div>");
    $("#edit_cont").append("<div id='nedit'></div>");
    $("#edit_cont").css({
        // position:'absolute',
        // left:'472px',
        // top:'-3px',
        borderStyle:'ridge',
        borderColor:'#DADADA',
        width:'190px',
        height:'388px',
        "float":"left"
    });  
    $("#edit_cont").append("<div id='npcedit'></div>");
    $("#npcedit").css({
        display:'none',
        "float":"right"
    });  

    //NPC edit tab
    // $("#nedit").css({
    //     // position:'absolute',
    //     // left:'472px',
    //     // top:'-3px',
    //     float:right,
    //     borderStyle:'ridge',
    //     borderColor:'#DADADA',
    //     width:'180px',
    //     height:'288px'
    // });     

    //NPC selector inside NPC edit tab
    var sel_str = "<select id='npc_sel' style='width:98px;float:left'>";
    sel_str+="</select>";
    $("#npcedit").append(sel_str);
    $("#npc_sel").change( function(){
        var ind = $(this).val();
        var node = captain.es.world.get_character(ind);
        captain.es.active_npc = node.name;
        if( node.x >= 0 && node.y >= 0 ){
            captain.es.world.camX = node.x - 8;
            captain.es.world.camY = node.y - 4;
            if( captain.es.world.camX < 0 ){
                captain.es.world.camX = 0
            } else if ( captain.es.world.camY < 0 ){
                captain.es.world.camY = 0;
            }
            captain.es.draw_place();
        }
    });  

    //EDIT NODE SELECTOR BOX
    var sel_str = "<select id='node_sel' style='width:98px;float:left'>";
    sel_str+="</select>";
    $("#nedit").append(sel_str);
    $("#node_sel").change( function(){
        var ind = $(this).val();
        var node = captain.es.world.nodes[ind];
        if( node.x >= 0 && node.y >= 0 ){
            captain.es.world.camX = node.x - 8;
            captain.es.world.camY = node.y - 4;
            if( captain.es.world.camX < 0 ){
                captain.es.world.camX = 0;
            } 
            if( captain.es.world.camY < 0 ){
                captain.es.world.camY = 0;
            }

            captain.es.mx = node.x;
            captain.es.my = node.y;
        }
        captain.es.active_node = node;
        captain.es.set_node_summary();    
        captain.es.draw_place();    
    });  

    //EDIT NODE BUTTON     
    var save_str = "<button id='edit_button' style='background-color:#66AA66'>Edit</button>";
    $("#nedit").append(save_str);
    $("#edit_button").live("click",function(){
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        var node = captain.es.active_node;

        if( node == "" || node.name == "null" ){
            alert("You did not select a valid node!");
            return;
        }

        $("#"+node.type).click();

        frame.setTitle(node.type);
        frame.setProp(   "pers", "checked",node.pers);
        frame.setDefault("xpos", node.x);
        frame.setDefault("ypos", node.y);
        frame.setDefault("newx", node.newx);
        frame.setDefault("newy", node.newy);
        frame.setDefault("value1", node.val1);
        frame.setDefault("v1sel", node.val1);
        frame.setDefault("value2", node.val2);
        frame.setDefault("v2sel", node.val2);
        frame.setDefault("value3", node.val3);
        frame.setDefault("v3sel", node.val3);        
        frame.setDefault("next_node", node.next);

        frame.setDoneCancel(
            function(){
                var pers = frame.getChecked("pers");

                var xpos = frame.getVal("xpos");
                var ypos = frame.getVal("ypos");

                var newx = frame.getVal("newx");
                var newy = frame.getVal("newy");

                var val1 = frame.getVal("value1");
                var val2 = frame.getVal("value2");
                var val3 = frame.getVal("value3");

                var next = frame.getVal("next_node");

                val1 = val1.replace("#","_");
                val2 = val2.replace("#","_");
                val3 = val3.replace("#","_");
                next = next.replace("#","_");

                var ret = [pers,xpos,ypos,newx,newy,val1,val2,val3,next];
                parent.NODE_STR = ret.join("#");
                parent.NODE_NAME = frame.getHTML("title");

                captain.es.delete_node(node);
                captain.es.add_node();
                captain.es.replace_node_name(node.name, NODE_NAME);
                parent.closeThis( false );
            },
            function(){
                parent.closeThis( false );
            });
    });

    //DELETE NODE BUTTON     
    var save_str = "<button id='del_button' style='width:39px; background-color:#6666AA'>Del</button>";
    $("#nedit").append(save_str);
    $("#del_button").live("click",function(){
        var node = captain.es.active_node;
        if( node.name == "null" ){
            alert("You did not select an active node");
            return;
        }
        var r = confirm("Are you sure you wish to delete this node?\n\n "+node.name);
        if( r )
            captain.es.delete_node(node);
    });

    //NODE SUMMARY DIV
    var container = "<div id='node_summary' style='background-color:white'></div>";
    $("#nedit").append(container);
    var app = "<h3 id='name' style='display:inline'>Header</h3><br>";
    $("#node_summary").append(app);
    app = "Pst?: <div id='pers' style='display:inline'>false</div><br>";
    $("#node_summary").append(app);     
    app = "Xpos: <div id='xpos' style='display:inline'>none</div><br>";
    $("#node_summary").append(app); 
    app = "Ypos: <div id='ypos' style='display:inline'>none</div><br>";
    $("#node_summary").append(app); 
    app = "Newx: <div id='newx' style='display:inline'>none</div><br>";
    $("#node_summary").append(app);  
    app = "Newy: <div id='newy' style='display:inline'>none</div><br>";
    $("#node_summary").append(app);                        
    app = "Val1: <div id='val1' style='display:inline'>none</div><br>";
    $("#node_summary").append(app);
    app = "Val2: <div id='val2' style='display:inline'>none</div><br>";
    $("#node_summary").append(app);  
    app = "Val3: <div id='val3' style='display:inline'>none</div><br>";
    $("#node_summary").append(app);       
    app = "Next: <div id='next' style='display:inline'>none</div><br>";
    $("#node_summary").append(app);       

    this.es.set_node_selector();   

    //NPC EDITOR IFRAME
    var path = document.location.pathname;
    var dir = path.substring(0, path.lastIndexOf('/'));
    var fm_id2 = "fmNPC";
    var fm_str = "<iframe width=460 height=385 id='"+fm_id2+"' src='file://"+dir+"/game/editStateBin/editNPCFrame.html' style='position:absolute;left:820;top:10;z-index:99'> </iframe>";
	this.es.fm_idNPC = fm_id2;    
    $("#nselect").append(fm_str); 
    $("#"+fm_id2).hide();

    this.on_frame_load(function(frame){
    	frame.set_captain_ref(captain.es);
    }, "fnNPC");

    //EDIT NPC BUTTON     
    var editnpc_str = "<button id='editnpc_button' style='background-color:#66AA66'>Edit</button>";
    $("#npcedit").append(editnpc_str);
    $("#editnpc_button").live("click",function(){
        var act_name = captain.es.active_npc;
        if( act_name == "null" ){
            alert("You did not select an active NPC");
            return;
        }
        var act = captain.es.world.get_character( act_name );
        $("#fmNPC").show();
    });

    //NPC CREATE FRAME
    var path = document.location.pathname;
    var dir = path.substring(0, path.lastIndexOf('/'));
    var fm_id3 = "fmNPCCreate";
    var fm_str = "<iframe width=460 height=385 id='"+fm_id3+"' src='file://"+dir+"/game/editStateBin/createNPCFrame.html' style='overflow:hidden;position:absolute;left:820;top:10;z-index:99'> </iframe>";
    $("#nselect").append(fm_str); 
    $("#"+fm_id3).hide();

    this.on_frame_load(function(frame){
    	setTimeout(function(){
	    	var frame = document.getElementById("fmNPCCreate").contentWindow;
	    	frame.set_captain_ref(captain.es);
	        frame.prep();
	    	frame.set_choose_selector();
    	},1000);
    }, "fmNPCCreate");

    //CREATE NPC BUTTON     
    var save_str = "<button width=460 id='createnpc_button' style='width:39px; background-color:#AAAA66'>New</button>";
    $("#npcedit").append(save_str);
    $("#createnpc_button").live("click",function(){
        var frame = document.getElementById("fmNPCCreate").contentWindow;
        frame.show_sel_div();
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);        
        $("#fmNPCCreate").show();
        frame.prep();
        frame.set_choose_selector();        
    });

    $("#npcedit").append("<div id='npc_info' style=\"height: 263px; background-color:white\"></div>");

    var info_pane = '<div id="tmp_holder" style="position:relative;left:-2px;top:3px;">'+
        '<input disabled="true" size="10" style="margin-top:-5px" id="iname" value="Mr. Generic"> Name </input>'+ 
        '<input disabled="true" size="10" style="margin-top:-5px" id="isprite" value="none"> Sprite </input> '+
        '<input disabled="true" size="10" style="margin-top:-5px" id="idialogue" value=""> Dialogue </input> Edit </button>'+
        '<input disabled="true" size="10" style="margin-top:-5px" id="iai_combat" value="none"> Combat AI </input>'+
        '<input disabled="true" size="10" style="margin-top:-5px" id="iai_town" value="none"> Town AI </input>'+
        '<input disabled="true" size="10" style="margin-top:-5px" id="iinventory" value=""> Inventory </input>'+
        '<input disabled="true" size="10" style="margin-top:-5px" id="iallegiance" value="enemy" > Allegiance </input> </div>'+
        '<input size="2" id="iPOWinp" value="1" style="font-size:8px; display:inline; margin-top:-10px; margin-bottom:-10px " disabled="true"></input> POW <br>'+
        '<input size="2" id="iACCinp" value="1" style="font-size:8px; display:inline; margin-top:-10px; margin-bottom:-10px " disabled="true"></input> ACC <br>'+
        '<input size="2" id="iFORinp" value="1" style="font-size:8px; display:inline; margin-top:-10px; margin-bottom:-10px " disabled="true"></input> FOR <br>'+
        '<input size="2" id="iCONinp" value="1" style="font-size:8px; display:inline; margin-top:-10px; margin-bottom:-10px " disabled="true"></input> CON <br>'+
        '<input size="2" id="iRESinp" value="1" style="font-size:8px; display:inline; margin-top:-10px; margin-bottom:-10px " disabled="true"></input> RES <br>'+
        '<input size="2" id="iSPDinp" value="1" style="font-size:8px; display:inline; margin-top:-10px; margin-bottom:-10px " disabled="true"></input> SPD <br>'+
        '<input size="2" id="iEVAinp" value="1" style="font-size:8px; display:inline; margin-top:-10px; margin-bottom:-10px " disabled="true"></input> EVA <br>'+
        '<button id="mov_npc" style="position:relative;width:70px;left:100px;top:-90px;background-color:#6666AA;padding:8px"> Move   </button>'+
        '<button id="del_npc" style="position:relative;width:70px;left:30px;top:-50px;background-color:#AA6666;padding:8px"> Remove </button>';
    $("#npc_info").append(info_pane);

    $("#del_npc").live("click", function(){
        if( captain.es.active_npc == "" ){
            console.log("WARNING: No active npc to delete.");
            return;
        }
        var npc = captain.es.game.map_loader.get_npc_by_name( captain.es.world.fix_actor_name(captain.es.active_npc));
        var npc_char =  captain.es.world.get_character( captain.es.active_npc );

        var r = confirm("Are you sure you wish to delete this npc from this map?\n\n "+npc_char.name);
        if( r )
            captain.es.delete_npc(npc, npc_char.name, npc_char.x, npc_char.y);
    })

    $("#mov_npc").live("click", function(){
        if( captain.es.active_npc == "" ){
            console.log("WARNING: No active npc to move.");
            return;
        }
        console.log("Moving ", captain.es.active_npc);

        var npc = captain.es.game.map_loader.get_npc_by_name(captain.es.active_npc);
        var npc_char =  captain.es.world.get_character( captain.es.active_npc );

        captain.es.move_npc(npc_char.name, npc_char.x, npc_char.y, captain.es.mx, captain.es.my);
        npc_char.set( captain.es.mx, captain.es.my );

        captain.es.draw_place();
    })

    //$("#"+fm_id).hide();      
}

esUI.prototype.initNodeButtons = function(){

	var fm_id = "fm";
	var captain = this;

	//CHANGEMAP BUTTON
	var cm_str = "<button class='node_button' id='ChangeMap' style='float:left'>ChangeMap</button>";
	$("#nselect").append(cm_str);
	$("#ChangeMap").live("click",function(){
	    $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle("ChangeMap");
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        var values = [];
		for( var name in captain.es.game.map_loader.maps ){
			values.push(name.substring(9, name.length - 4));
		}
	    frame.setValSel("v1sel", values);
	    frame.setDefault("value1", values[0]);
	    frame.disableElem("value2");
        frame.disableElem("value3");

	    var nodes = captain.es.world.nodes;
	    var napp = [];
        napp.push("none");
	    for( var i in nodes ){
	    	var str = nodes[i].name;
        	if( str != "null" && str.search("_") < 0 )
        		napp.push(str);
	    }
	    frame.setValSel("next_node", napp);	
        frame.setDefault("next_node", "none");  	    
	});

	//STUFFDONE BUTTON
	var cm_str = "<button class='node_button' id='StuffDone' style='float:left'>StuffDone</button>";
	$("#nselect").append(cm_str);
	$("#StuffDone").live("click",function(){
	    $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle("StuffDone");
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        var values = [];
        values.push("none");
        for( var i in captain.es.world.nodes ){
        	var str = captain.es.world.nodes[i].name;
        	if( str != "null" && str.search("_") < 0 )
        		values.push(captain.es.world.nodes[i].name);
        }
	    frame.setValSel("v1sel", values);
	    frame.setDefault("value1", values[0]);
	    frame.setValSel("v2sel", values);
        frame.setDefault("value2", values[0]);
        frame.setValSel("v3sel", values); 
        frame.setDefault("value3", values[0]);       
	    //frame.disableElem("value2");
        //frame.disableElem("value3");
	    frame.disableElem("newx");
	    frame.disableElem("newy");

	    var nodes = captain.es.world.nodes;
	    var napp = [];
        napp.push("none");
	    for( var i in nodes ){
	    	var str = nodes[i].name;
        	if( str != "null" && str.search("_") < 0 )
        		napp.push(str);
	    }
	    frame.setValSel("next_node", napp);
        frame.setDefault("next_node", "none");           
	    //frame.setValSel("v2sel", ["a","b","c"]);        
	});	

	//SINGLENOTIFICATION BUTTON
	var cm_str = "<button class='node_button' id='SingleNotification' style='float:left'>SingleNotif</button>";
	$("#nselect").append(cm_str);
	$("#SingleNotification").live("click",function(){
	    $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle("SingleNotification");
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        var values = [];
	    frame.setValSel("v1sel", values);
	    frame.setValSel("v2sel", values);
	    frame.setDefault("value1", "Text goes here.");
	    frame.disableElem("value2");
        frame.disableElem("value3");
	    frame.disableElem("newx");
	    frame.disableElem("newy");

	    var nodes = captain.es.world.nodes;
	    var napp = [];
        napp.push("none");
	    for( var i in nodes ){
	    	var str = nodes[i].name;
        	if( str != "null" && str.search("_") < 0 )
        		napp.push(str);
	    }
	    frame.setValSel("next_node", napp);
        frame.setDefault("next_node", "none");    
	});	

    //DOUBLENOTIFICATION BUTTON
    var cm_str = "<button class='node_button' id='DoubleNotification' style='float:left'>DoubleNotif</button>";
    $("#nselect").append(cm_str);
    $("#DoubleNotification").live("click",function(){
        $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle("DoubleNotification");
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        var values = [];
        frame.setValSel("v1sel", values);
        frame.setValSel("v2sel", values);
        frame.setDefault("value1", "Text goes here.");
        frame.setDefault("value2", "Other text goes here.");
        frame.disableElem("value3");
        frame.disableElem("newx");
        frame.disableElem("newy");

        var nodes = captain.es.world.nodes;
        var napp = [];
        napp.push("none");
        for( var i in nodes ){
            var str = nodes[i].name;
            if( str != "null" && str.search("_") < 0 )
                napp.push(str);
        }
        frame.setValSel("next_node", napp);
        frame.setDefault("next_node", "none");    
    }); 

    //PLAY SOUND BUTTON
    var cm_str = "<button class='node_button' id='PlaySound' style='float:left'>PlaySound</button>";
    $("#nselect").append(cm_str);
    $("#PlaySound").live("click",function(){
        $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle("PlaySound");
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        var values = [];
        frame.setValSel("v1sel", values);
        frame.setValSel("v2sel", values);
        frame.setDefault("value1", "default.ogg");
        frame.disableElem("value2");
        frame.disableElem("value3");
        frame.disableElem("newx");
        frame.disableElem("newy");

        var nodes = captain.es.world.nodes;
        var napp = [];
        napp.push("none");
        for( var i in nodes ){
            var str = nodes[i].name;
            if( str != "null" && str.search("_") < 0 )
                napp.push(str);
        }
        frame.setValSel("next_node", napp);
        frame.setDefault("next_node", "none");    
    }); 

    //TELEPORTTO BUTTON
    var cm_str = "<button class='node_button' id='TeleportTo' style='float:left'>TeleportTo</button>";
    $("#nselect").append(cm_str);
    $("#TeleportTo").live("click",function(){
        $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle("TeleportTo");
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        frame.setDefault("newx", captain.es.mx);
        frame.setDefault("newy", captain.es.my);        
        var values = [];
        frame.setValSel("v1sel", values);
        frame.setValSel("v2sel", values);
        //frame.setDefault("value1", "Text goes here.");
        frame.disableElem("value1");
        frame.disableElem("value2");
        frame.disableElem("value3");
        //frame.disableElem("newx");
        //frame.disableElem("newy");

        var nodes = captain.es.world.nodes;
        var napp = [];
        napp.push("none");
        for( var i in nodes ){
            var str = nodes[i].name;
            if( str != "null" && str.search("_") < 0 )
                napp.push(str);
        }
        frame.setValSel("next_node", napp);
        frame.setDefault("next_node", "none");    
    }); 

    //TELEPORT NPC BUTTON
    var id_name = 'TeleportNPC';
    var cm_str = "<button class='node_button' id='"+id_name+"' style='float:left'>"+id_name+"</button>";
    $("#nselect").append(cm_str);
    $("#"+id_name).live("click",function(){
        var id_name2 = "TeleportNPC";
        $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle(id_name2);
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        frame.setDefault("newx", captain.es.mx);
        frame.setDefault("newy", captain.es.my);        
        var values = [];
        frame.setValSel("v2sel", values);
        for( var i in captain.es.world.characters ){
            if( captain.es.world.characters[i].allegiance != "player" )
                values.push(captain.es.world.characters[i].name);
        }
        if(values.length == 0 ){
            values.push("!NONPCS!");
        }
        frame.setValSel("v1sel", values);
        frame.setDefault("value1", values[0]);
        //frame.setDefault("value1", "Text goes here.");
        //frame.disableElem("value1");
        frame.disableElem("value2");
        frame.disableElem("value3");
        //frame.disableElem("newx");
        //frame.disableElem("newy");

        var nodes = captain.es.world.nodes;
        var napp = [];
        napp.push("none");
        for( var i in nodes ){
            var str = nodes[i].name;
            if( str != "null" && str.search("_") < 0 )
                napp.push(str);
        }
        frame.setValSel("next_node", napp);
        frame.setDefault("next_node", "none");    
    }); 

    //Create NPC
    var id_name = 'ShowNPC';
    var cm_str = "<button class='node_button' id='"+id_name+"' style='float:left'>"+id_name+"</button>";
    $("#nselect").append(cm_str);
    $("#"+id_name).live("click",function(){
        var id_name2 = "ShowNPC";
        $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle(id_name2);
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        frame.setDefault("newx", captain.es.mx);
        frame.setDefault("newy", captain.es.my);        
        var values = [];
        frame.setValSel("v2sel", values);
        for( var i in captain.es.world.characters ){
            if( captain.es.world.characters[i].allegiance != "player" )
                values.push(captain.es.world.characters[i].name);
        }
        if(values.length == 0 ){
            values.push("!NONPCS!");
        }
        frame.setValSel("v1sel", values);
        frame.setDefault("value1", values[0]);
        //frame.disableElem("value1");
        frame.disableElem("value2");
        frame.disableElem("value3");
        //frame.disableElem("newx");
        //frame.disableElem("newy");

        var nodes = captain.es.world.nodes;
        var napp = [];
        napp.push("none");
        for( var i in nodes ){
            var str = nodes[i].name;
            if( str != "null" && str.search("_") < 0 )
                napp.push(str);
        }
        frame.setValSel("next_node", napp);
        frame.setDefault("next_node", "none");    
    }); 

    //Change Tile
    var id_name = 'ChangeTile';
    var cm_str = "<button class='node_button' id='"+id_name+"' style='float:left'>"+id_name+"</button>";
    $("#nselect").append(cm_str);
    $("#"+id_name).live("click",function(){
        var id_name2 = "ChangeTile";
        $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle(id_name2);
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        frame.setDefault("newx", captain.es.mx);
        frame.setDefault("newy", captain.es.my);        
        var values = [];
        var sprites = [];
        frame.setValSel("v2sel", values);
        for( var i in captain.es.game.display.sprites ){
            if(i.substring(0,4) == "tile"){
                var spr = captain.es.game.display.sprites[i];              
                sprites.push(spr);
                values.push(i);
            }
        }
        var src = sprites[0].src;
        frame.addTileSelectorBox( sprites, src);

        frame.setValSel("v1sel", values);
        frame.setDefault("value1", values[0]);
        frame.setOptionHoverEvent("v1sel",function(){
            console.log($(this).val() );
        })
        //frame.disableElem("value1");
        frame.disableElem("value2");
        frame.disableElem("value3");
        //frame.disableElem("newx");
        //frame.disableElem("newy");

        var nodes = captain.es.world.nodes;
        var napp = [];
        napp.push("none");
        for( var i in nodes ){
            var str = nodes[i].name;
            if( str != "null" && str.search("_") < 0 )
                napp.push(str);
        }
        frame.setValSel("next_node", napp);
        frame.setDefault("next_node", "none");    
    }); 

    //SecretPassage
    var id_name = 'SecretPassage';
    var cm_str = "<button class='node_button' id='"+id_name+"' style='float:left'>"+id_name+"</button>";
    $("#nselect").append(cm_str);
    $("#"+id_name).live("click",function(){
        var id_name2 = "SecretPassage";
        $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle(id_name2);
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        frame.setDefault("newx", captain.es.mx);
        frame.setDefault("newy", captain.es.my);        
        var values = [];
        frame.setValSel("v2sel", values);
        frame.setValSel("v1sel", values);
        //frame.setDefault("value1", values[0]);
        frame.disableElem("value1");
        frame.disableElem("value2");
        frame.disableElem("value3");
        frame.disableElem("newx");
        frame.disableElem("newy");

        var nodes = captain.es.world.nodes;
        var napp = [];
        napp.push("none");
        for( var i in nodes ){
            var str = nodes[i].name;
            if( str != "null" && str.search("_") < 0 )
                napp.push(str);
        }
        frame.setValSel("next_node", napp);
        frame.setDefault("next_node", "none");    
    }); 

    //Character Has Item
    var id_name = 'HasItem';
    var cm_str = "<button class='node_button' id='"+id_name+"' style='float:left'>"+id_name+"</button>";
    $("#nselect").append(cm_str);
    $("#"+id_name).live("click",function(){
        var id_name = 'HasItem';
        var id_name2 = id_name;
        $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle(id_name2);
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        frame.setDefault("newx", captain.es.mx);
        frame.setDefault("newy", captain.es.my);        
        var values = [];
        frame.setValSel("v2sel", values);
        for( var i in captain.es.world.items ){
            values.push(i);
        }
        frame.setValSel("v1sel", values);
        frame.setDefault("value1", values[0]);
        //frame.disableElem("value1");
        //frame.disableElem("value2");
        frame.disableElem("value3");
        frame.disableElem("newx");
        frame.disableElem("newy");

        var nodes = captain.es.world.nodes;
        var napp = [];
        napp.push("none");
        for( var i in nodes ){
            var str = nodes[i].name;
            if( str != "null" && str.search("_") < 0 )
                napp.push(str);
        }
        frame.setValSel("next_node", napp);
        frame.setDefault("next_node", "none"); 
        frame.setValSel("v2sel", napp);
        frame.setDefault("value2", "none");            
    }); 

    //LockDoor
    var id_name = 'LockDoor';
    var cm_str = "<button class='node_button' id='"+id_name+"' style='float:left'>"+id_name+"</button>";
    $("#nselect").append(cm_str);
    $("#"+id_name).live("click",function(){
        var id_name2 = "LockDoor";
        $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle(id_name2);
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        frame.setDefault("newx", captain.es.mx);
        frame.setDefault("newy", captain.es.my);        
        var values = [];
        frame.setValSel("v2sel", values);
        for( var i = 0; i < 100; i++ ){
            values.push(i);
        }
        frame.setValSel("v1sel", values);
        frame.setDefault("value1", values[0]);
        //frame.disableElem("value1");
        frame.disableElem("value2");
        frame.disableElem("value3");
        frame.disableElem("newx");
        frame.disableElem("newy");

        var nodes = captain.es.world.nodes;
        var napp = [];
        napp.push("none");
        for( var i in nodes ){
            var str = nodes[i].name;
            if( str != "null" && str.search("_") < 0 ){
                napp.push(str);
            }
        }
        frame.setValSel("next_node", napp);
        frame.setDefault("next_node", "none");          
    }); 

    //Disable Node
    var id_name = 'DisableNode';
    var cm_str = "<button class='node_button' id='"+id_name+"' style='float:left'>"+id_name+"</button>";
    $("#nselect").append(cm_str);
    $("#"+id_name).live("click",function(){
        var id_name2 = "DisableNode";
        $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle(id_name2);
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        frame.setDefault("newx", captain.es.mx);
        frame.setDefault("newy", captain.es.my);        
        var values = [];
        frame.setValSel("v2sel", values);
        frame.setValSel("v1sel", values);
        //frame.disableElem("value1");
        frame.disableElem("value2");
        frame.disableElem("value3");
        frame.disableElem("newx");
        frame.disableElem("newy");

        var nodes = captain.es.world.nodes;
        var napp = [];
        napp.push("none");
        for( var i in nodes ){
            var str = nodes[i].name;
            if( str != "null" && str.search("_") < 0 ){
                napp.push(str);
            }
        }
        frame.setValSel("v1sel", napp);
        frame.setDefault("value1", napp[0]);
        frame.setValSel("next_node", napp);
        frame.setDefault("next_node", "none");          
    }); 

    //Add Log
    var id_name = 'AddLog';
    var cm_str = "<button class='node_button' id='"+id_name+"' style='float:left'>"+id_name+"</button>";
    $("#nselect").append(cm_str);
    $("#"+id_name).live("click",function(){
        var id_name2 = "AddLog";
        $("#fm").show();
        var frame = document.getElementById(fm_id).contentWindow;
        frame.prep();
        frame.setTitle(id_name2);
        frame.setDefault("xpos", captain.es.mx);
        frame.setDefault("ypos", captain.es.my);
        frame.setDefault("newx", captain.es.mx);
        frame.setDefault("newy", captain.es.my);        
        var values = [];
        frame.setValSel("v2sel", values);
        frame.setValSel("v1sel", values);
        //frame.disableElem("value1");
        frame.disableElem("value2");
        frame.disableElem("value3");
        frame.disableElem("newx");
        frame.disableElem("newy");

        var nodes = captain.es.world.nodes;
        var napp = [];
        napp.push("none");
        for( var i in nodes ){
            var str = nodes[i].name;
            if( str != "null" && str.search("_") < 0 ){
                napp.push(str);
            }
        }
        frame.setValSel("v1sel", []);
        frame.setDefault("value1", "Set text here");
        frame.setValSel("next_node", napp);
        frame.setDefault("next_node", "none");          
    }); 

    $(".node_button").css({
        height:"20px",
        width:"90px",
        backgroundColor:"white"
    })
}