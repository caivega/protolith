/* jshint browser: true */
/* global React, app, console */
(function(){
"use strict";

var node = null;
if( window.require ){
	node = {
		fs: window.require('fs'),
		gui: window.require('nw.gui'),
	};
}

app.main = function(){
	console.log("Begin Program");
	app.display = new app.display.Display(false, "../content/");
	app.npcmaker = new NPCMaker();
	if( node ){
		node.fs.readFile( "./protolithnpc.json", function( err, data ){
			var list = JSON.parse(data.toString());
			list = list.sort( function( a, b ){
				if( a.name < b.name ){
					return -1;
				} else {
					return 1;
				}
			});
			for( var i in list ){
				var dsets = list[i].dialogue;
				for( var j in dsets ){
					var dset = dsets[j];
					var newobj = {};
					if( dset.length !== undefined ){
						for( var k in dset ){
							newobj[ dset[k].key ] = dset[k];
						}
					}
					dsets[j] = newobj;
				}
			}
			app.npcmaker.set_state( "npclist", list );
			if( app.state.npclist.length > 0 ){
				app.npcmaker.reset_current();
			}
		});
	}
};

var NPCMaker = function(){
	this.state = {
		npclist: [],
		currentindex: 0,
		currentnpc: false,
		errors: [],
		dialogue: false,
		dialogueset: "d1",
		dialoguekey: "look",
		modal: false
	};
	app.state = this.state;
	this.reactelem = React.createElement(MainContainer);
	this.render();
};

NPCMaker.prototype.render = function(){
	React.render( 
		this.reactelem,
		document.getElementById("body")
	);
};

NPCMaker.prototype.resolve_path = function( path, obj ){
	obj = obj || window;
	if(path === '' || path === undefined){
		return obj;
	}
	if( !(path instanceof Array) ){
		path = path.split('.');
	}
	while( path.length > 0 ){
		var p = path.shift();
		if( p ){ obj = obj[p]; }
	}
	return obj;
};

NPCMaker.prototype.set_state = function(path, val, dontrender){
	var patharr = path.split(".");
	var parent = this.resolve_path(patharr.slice(0,-1).join("."), this.state);
	parent[ patharr.slice(-1).join(".") ] = val;
	if( !dontrender ){
		setTimeout( function(){
			this.render(); 
		}.bind(this),1);
	}
};

NPCMaker.prototype.reset_current = function(){
	this.set_state( "currentnpc", app.state.npclist[ this.state.currentindex ] ); 
};

NPCMaker.prototype.get_index = function(npc){
	for( var i in this.state.npclist ){
		if( this.state.npclist[i].name === npc.name ){
			return i;
		}
	}
	return -1;
};

var MainContainer = React.createClass({
	displayName: "MainContainer",
	render: function(){
		var dialogue = React.createElement(app.view.DialoguePane);
		var rightpane = React.createElement(app.view.JSONPane);
		var leftpane = React.createElement(app.view.DefinitionPane);
		var modal = app.state.modal || React.createElement("span");
		return React.createElement("div", null, modal, dialogue, leftpane, rightpane);
	}
});

})();