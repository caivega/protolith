/* jshint browser: true */
/* global app, React */
(function(){
"use strict";

app.view.DialoguePane = React.createClass({
	displayName:"DialoguePane",
	handleClick: function(){
		app.npcmaker.set_state("dialogue", false);
	},
	render: function(){
		if( app.state.dialogue === false ){
			return React.createElement("span");
		}

		var close = React.createElement("div", {
			className: "negative-button",
			onClick: this.handleClick,
			style: {
				fontSize: "10px",
				position:"absolute",
				top:"2px",
				right:"2px"
			}
		},"X");

		var menubar = React.createElement(MenuBar);
		var menuset = React.createElement(MenuSet);
		var keyselect = React.createElement(KeySelect);

		var div = null;
		var npc = app.state.currentnpc;
		if( npc.dialogue && 
			npc.dialogue[ app.state.dialogueset ] && 
			npc.dialogue[ app.state.dialogueset ][ app.state.dialoguekey ] ){
			var div = React.createElement("div", {
				className: "dialogue-content"
			}, 
				React.createElement( KeyInput ),
				React.createElement( ActionInput ),
				React.createElement( ValTextarea )
			);
		} else {
			div = React.createElement("span");
		}

		return React.createElement("div", {
			className: "dialogue-pane"
		}, close, menubar, menuset, keyselect, div);
	}
});

var MenuBar = React.createClass({
	displayName: "MenuBar",
	handleClick: function(type){
		if( type === "newset" ){

		} else if( type === "delset" ){

		}
	},
	render: function(){
		var style = {
			marginLeft:"2px",
			marginRight:"2px"
		};
		var newset = React.createElement("div", {
			className: "positive-button",
			style:style,
			onClick: this.handleClick.bind(this,"newset")
		}, "New Set");
		var delset = React.createElement("div", {
			className: "negative-button",
			style:style,
			onClick: this.handleClick.bind(this,"delset")
		}, "Del Set");

		return React.createElement("div", {
			className: "left-menubar"
		}, newset, delset );
	}
});

var MenuSet = React.createClass({
	displayName: "MenuBar",
	handleClick: function(diag){
		app.npcmaker.set_state("dialogueset", diag);
	},
	render: function(){
		var style = {
			marginLeft:"2px",
			marginRight:"2px"
		};

		var elems = [];
		var npc = app.state.currentnpc;
		if( npc.dialogue && Object.keys(npc.dialogue).length > 0 ){
			elems = Object.keys( npc.dialogue ).map( function( diag, ind ){
				var selected = diag === app.state.dialogueset;
				style.backgroundColor = selected ? "#DDDDDD" : "white";
				return React.createElement("div", {
					className: "positive-button",
					style:style,
					onClick: this.handleClick.bind(this,diag),
					key: diag
				}, "Set "+(ind+1));
			}.bind(this));
		} else {
			elems = React.createElement("div", {
				style:{
					padding:"5px"
				}
			}, "This character has no dialogue.");
		}

		return React.createElement("div", {
			className: "left-menubar"
		}, elems );
	}
});

var KeySelect = React.createClass({
	displayName: "MenuBar",
	handleClick: function(key){
		app.npcmaker.set_state("dialoguekey", key);
	},
	render: function(){
		var elems = [];
		var npc = app.state.currentnpc;
		if( npc.dialogue && npc.dialogue[ app.state.dialogueset ]){
			var dset = npc.dialogue[ app.state.dialogueset ];
			elems = Object.keys(dset).sort(function(a,b){
				return a < b ? -1 : 1;
			}).map( function( key, ind ){
				var diag = dset[key];
				var selected = diag.key === app.state.dialoguekey;
				return React.createElement("div", {
					className: "positive-button",
					style:{
						backgroundColor: selected ? "#DDDDDD" : "#FAFAFA",
						display: "block",
						marginLeft: "3px",
						marginRight: "3px"
					},
					onClick: this.handleClick.bind(this, diag.key),
					key: diag.key + ind
				}, diag.key);
			}.bind(this));
		} else {
			elems = React.createElement("div");
		}

		return React.createElement("div", {
			className: "dialogue-keycolumn"
		}, elems );
	}
});

var KeyInput = React.createClass({
	displayName: "KeyInput",
	getInitialState: function(){
		return {value: app.state.dialoguekey};
	},
	handleChange: function(e){
		var npc = app.state.currentnpc;
		var newkey = e.target.value;
		var diag = npc.dialogue[ app.state.dialogueset ][ app.state.dialoguekey ];
		diag.key = newkey;
		delete npc.dialogue[ app.state.dialogueset ][ app.state.dialoguekey ];
		this.setState( {value:e.target.value} );
		app.npcmaker.set_state( 
			"currentnpc.dialogue."+app.state.dialogueset+"."+newkey, diag, false
		);
		app.npcmaker.set_state( "dialoguekey", newkey );
	},
	componentWillUpdate: function(){
		if( app.state.dialoguekey !== this.state.value ){
			this.state.value = app.state.dialoguekey;
		}
	},
	render: function(){
		return React.createElement("div", {
			style:{
				width:"100%",
				verticalAlign:"center"
			}
		},
			React.createElement("label", {
				style: {width:"60px", display:"inline-block"}
			}, "Key:"),	
			React.createElement("div", {
				style: {width:"40%", display:"inline-block"}
			},
				React.createElement("input", {
					value: this.state.value,
					className:"dialogue-keyinput",
					onChange: this.handleChange
				})
			)
		);
	}
});

var ActionInput = React.createClass({
	displayName: "ActionInput",
	getInitialState: function(){
		var npc = app.state.currentnpc;
		var diag = npc.dialogue[ app.state.dialogueset ][ app.state.dialoguekey ];
		return {value: diag.act};
	},
	handleChange: function(e){
		this.setState( {value:e.target.value} );
		app.npcmaker.set_state( 
			"currentnpc.dialogue."+app.state.dialogueset+"."+app.state.dialoguekey+".act",
			e.target.value
		);
	},
	componentWillUpdate: function(){
		var npc = app.state.currentnpc;
		var diag = npc.dialogue[ app.state.dialogueset ][ app.state.dialoguekey ];
		if( diag.act !== this.state.value ){
			this.state.value = diag.act;
		}
	},
	render: function(){
		var npc = app.state.currentnpc;
		var diag = npc.dialogue[ app.state.dialogueset ][ app.state.dialoguekey ];		
		return React.createElement("div", {
			style:{
				width:"100%"
			}
		},
			React.createElement("label", {
				style: {width:"60px", display:"inline-block"}
			}, "Action:"),	
			React.createElement("div", {
				style: {width:"40%", display:"inline-block"}
			},
				React.createElement("input", {
					value: this.state.value,
					className:"dialogue-keyinput",
					onChange: this.handleChange
				})
			),
			React.createElement("div", {
				style: {marginLeft:"5px",display:"inline-block"}
			}, "Chars: "+diag.val.length + ", Words: "+diag.val.split(" ").length)
		);
	}
});

var ValTextarea = React.createClass({
	displayName: "ValTextarea",
	getInitialState: function(){
		var npc = app.state.currentnpc;
		var diag = npc.dialogue[ app.state.dialogueset ][ app.state.dialoguekey ];
		return {value: diag.val};
	},
	handleChange: function(e){
		this.setState( {value:e.target.value} );
		app.npcmaker.set_state( 
			"currentnpc.dialogue."+app.state.dialogueset+"."+app.state.dialoguekey+".val",
			e.target.value
		);
	},
	componentWillUpdate: function(){
		var npc = app.state.currentnpc;
		var diag = npc.dialogue[ app.state.dialogueset ][ app.state.dialoguekey ];
		if( diag.val !== this.state.value ){
			this.state.value = diag.val;
		}
	},
	render: function(){
		var npc = app.state.currentnpc;
		var dset = npc.dialogue[ app.state.dialogueset ];
		var words = this.state.value.split(" ").map( function(word){
			var rawword = word.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase();
			if( dset[ rawword ] ){
				return "<b>" + word + "</b>";
			} else {
				return word;
			}
		});
		var text = words.join(" ");
		return React.createElement("div", {
			style: {width:"100%", height:"calc(100% - 50px"}
		}, 
			React.createElement(ContentEditable, {
				onChange:this.handleChange,
				html: text
			})
		);
	}
});

var ContentEditable = React.createClass({
	shouldComponentUpdate: function(nextProps){
		return nextProps.html !== this.getDOMNode().innerHTML;
	},
	componentDidUpdate: function(){
		if ( this.props.html !== this.getDOMNode().innerHTML ) {
		   this.getDOMNode().innerHTML = this.props.html;
		}
	},
	emitChange: function(){
		var html = this.getDOMNode().innerHTML;
		if (this.props.onChange && html !== this.lastHtml) {
		    this.props.onChange({
		        target: {
		            value: html
		        }
		    });
		}
		this.lastHtml = html;
	},
	render: function(){
		return React.createElement("div",{
			style:{
				width:"96%", 
				height:"96%", 
				marginTop:"2%", 
				backgroundColor:"white",
				border:"1px solid gray",
				fontFamily:"monospace",
				fontSize: "18px"
			},
			id:"contenteditable",
			onInput:this.emitChange,
			onBlur:this.emitChange,
			contentEditable:true,
			dangerouslySetInnerHTML:{__html: this.props.html}
		});
	}
});

})();