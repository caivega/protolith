/* jshint browser: true */
/* global app, React */
(function(){
"use strict";

app.view.DefinitionPane = React.createClass({
	displayName: "DefinitionPane",
	render: function(){
		var elems = null;
		if( app.state.currentnpc === false ){
			elems = React.createElement("div", {
				style:{
					padding:"5px"
				}
			}, "No npc data loaded.");
		} else {
			elems = [
				React.createElement( "div", {
					key: "left-top",
					className: "left-top-container"
				}, 
					React.createElement( MenuBar ),
					React.createElement( ErrorPane ),
					React.createElement( CharacterSelector )
				),
				React.createElement( "div", {
					key: "left-mid",
					className: "left-mid-container"
				},
					React.createElement( "div", {
						className: "left-mid-top-container"
					}, 
						React.createElement( NameInput ),
						React.createElement( "div", {
							className: "left-npc-ai"
						}, 
							React.createElement( AISelector, {aitype:"ai_town"} ),
							React.createElement( AISelector, {aitype:"ai_combat"} )
						),
						React.createElement( "div", {
							className: "left-npc-clonealleg"
						}, 
							React.createElement( ClonableCheckbox ),
							React.createElement( AllegianceSelector )
						),
						React.createElement( "div", {
							className: "left-npc-spriteportrait"
						}, 
							React.createElement( app.view.SpriteSelector, {
								type:"sprite"
							}),
							React.createElement( app.view.SpriteSelector, {
								type:"portrait"
							})
						)
					),
					React.createElement( StatsList )
				)
			];
		}
		return React.createElement("div", { className: "left-container" }, elems );
	}
});
var MenuBar = React.createClass({
	displayName: "MenuBar",
	handleClick: function(type){
		if( app.state.dialogue || app.state.modal ){
			return;
		}
		if( type === "new" ){

		} else if( type === "del" ){

		} else if( type === "dialogue" ){
			app.npcmaker.set_state("dialogue", true);
		}
	},
	render: function(){
		var style = {
			marginLeft:"2px",
			marginRight:"2px"
		};
		var newcharbutton = React.createElement("div", {
			className: "positive-button",
			style:style,
			onClick: this.handleClick.bind(this,"new")
		}, "New Character");
		var deletecharbutton = React.createElement("div", {
			className: "negative-button",
			style:style,
			onClick: this.handleClick.bind(this,"del")
		}, "Del Character");
		var editdialoguebutton = React.createElement("div", {
			className: "positive-button",
			style:style,
			onClick: this.handleClick.bind(this,"dialogue")
		}, "Edit Dialogue");

		return React.createElement("div", {
			className: "left-menubar"
		}, newcharbutton, deletecharbutton, editdialoguebutton );
	}
});
var ErrorPane = React.createClass({ 
	displayName: "ErrorPane",
	render: function(){
		return React.createElement("div", {className:"left-error-pane"});
	}
});
var CharacterSelector = React.createClass({ 
	displayName: "CharacterSelector",
	getInitialState: function(){
		return {enabled:false};
	},
	handleClick: function(ind){
		if( app.state.dialogue || app.state.modal ){
			return;
		}
		if( this.state.enabled === false ){
			this.setState( {enabled:true} );
			setTimeout( function(){
				window.addEventListener("click", this.handleBlur);
			}.bind(this), 100);
		} else {
			if( ind !== undefined ){
				app.npcmaker.set_state("currentindex", ind, false );
				app.npcmaker.reset_current();	
			}
			this.setState( {enabled:false} );
			window.removeEventListener("click", this.handleBlur);
		}
	},
	handleBlur: function(){
		if( this.state.enabled ){
			setTimeout( function(){
				this.setState({ enabled: false });
			}.bind(this), 10);
			window.removeEventListener("click", this.handleBlur);
		}
	},
	render: function(){
		var npcs = app.state.npclist;
		var elems = null;
		var cont = null;
		var maxheight = (window.innerHeight - 50) * 0.9;
		if( this.state.enabled ){
			elems = npcs.map( function( npc, ind ){ 
				if( ind === app.state.currentindex ){
					return null;
				}
				return React.createElement( CharacterSelectorItem, {
					npc: npc,
					ind: ind,
					handleClick: this.handleClick,
					key: npc.name
				});
			}.bind(this) ).filter( function( npc ){
				if( npc ){
					return true;
				}
			});
			var npc = app.state.currentnpc;
			elems.unshift(
				React.createElement( CharacterSelectorItem, {
					npc: npc,
					ind: app.state.currentindex,
					handleClick: this.handleClick,
					key: npc.name
				})
			);
			cont = React.createElement("div", {
				className: "left-char-selector-open",
				style: {
					maxHeight: maxheight
				}
			}, elems);
		} else {
			var npc = app.state.currentnpc;
			elems = React.createElement( CharacterSelectorItem, {
				npc: npc,
				ind: app.state.currentindex,
				handleClick: this.handleClick
			});
			cont = React.createElement("div", {
				className: "left-char-selector"
			}, elems);
		}

		return React.createElement("div", {className:"left-char-selector-cont"}, cont);
	}
});
var CharacterSelectorItem = React.createClass({
	displayName: "CharacterSelectorItem",
	getInitialState: function(){
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		canvas.width = 28;
		canvas.height = 32;
		return {
			canvas: canvas,
			ctx: ctx
		};
	},
	handleClick: function(ind){
		this.props.handleClick(ind);
	},
	componentDidUpdate: function(){
		if( this.props.npc.sprite === "none" ){
			return;
		}
		if( app.display.has_sprite( this.props.npc.sprite ) ){
			app.display.context = this.state.ctx;
			app.display.canvas = this.state.canvas;
			app.display.clear("white");
			app.display.draw_sprite_scaled( 
				this.props.npc.sprite, 0, 0, 
				this.state.canvas.width, this.state.canvas.height
			);
			var cont = document.getElementById("left-char-"+this.props.npc.name);
			if( cont ){
				cont.innerHTML = "";
				cont.appendChild( this.state.canvas );
			}
		} else {
			setTimeout( this.componentDidUpdate.bind(this), 500 );
		}
	},
	componentDidMount: function(){
		this.componentDidUpdate();
	},
	render: function(){
		var npc = this.props.npc; var ind = this.props.ind;
		var selected = app.state.currentindex === ind;
		var itemclass = "left-char-select-item";
		var image = null;
		if( app.display.sprites[ npc.sprite ] ){
			image = React.createElement("div", {
				className: "left-char-select-item-pic",
				id: "left-char-"+npc.name
			});
		} else {
			image = React.createElement("div", {
				className: "left-char-select-item-pic",
				id: "left-char-"+npc.name
			}, npc.sprite);	
		}

		return React.createElement("div", {
			className: itemclass+(selected?" "+itemclass+"-selected":""),
			onClick: this.handleClick.bind( this, ind ),
			key: npc.name
		}, 
			React.createElement("div", {
				className: "left-char-select-item-name"
			}, npc.name),
			image		
		);
	},
});
var NameInput = React.createClass({ 
	displayName: "NameInput",
	getInitialState: function(){
		var npc = app.state.currentnpc; 
		return { value: npc.name };
	},
	handleChange: function(e){
		app.npcmaker.set_state( "currentnpc.name", e.target.value, false );
		this.setState({value:e.target.value});
	},
	componentWillUpdate: function(){
		if( app.state.currentnpc.name !== this.state.name ){
			this.state.value = app.state.currentnpc.name;
		}
	},
	render: function(){
		var cont = React.createElement("div", {
			style: {width:"70%", marginLeft:"10%"}
		}, 
			React.createElement("div", {
				style: {width:"30%", display:"inline-block"},
				value: this.state.value,
			}, "Name:"),
			React.createElement("input", {
				style: {width:"70%"},
				value: this.state.value,
				onChange: this.handleChange
			})
		);

		return React.createElement("div", {className:"left-npc-name"}, cont);
	}
});
var AISelector = React.createClass({ 
	displayName: "AISelector",
	handleChange: function(e){
		app.npcmaker.set_state( "currentnpc."+this.props.aitype, e.target.value );
	},
	render: function(){
		var behaviors = null;
		if( this.props.aitype === "ai_combat" ){
			behaviors = app.world.AI.prototype.COMBATBEHAVIORS;
		} else {
			behaviors = app.world.AI.prototype.TOWNBEHAVIORS;
		}
		var options = behaviors.map( function( behavior ){
			return React.createElement("option", {
				key: behavior,
				value: behavior
			}, behavior);
		});
		var select = React.createElement("select", {
			style:{width:"100%"},
			value: app.state.currentnpc[ this.props.aitype ],
			onChange: this.handleChange
		}, options);
		var labeltext = "Town AI";
		if( this.props.aitype === "ai_combat" ){
			labeltext = "Combat AI";
		}
		var label = React.createElement("div", {
			style:{width:"100%", textAlign:"center"}
		}, labeltext);
		return React.createElement("div", {
			style:{
				width: "50%",
				display: "inline-block"
			}
		}, label, select);
	}
});
var ClonableCheckbox = React.createClass({ 
	displayName: "ClonableCheckbox",
	handleChange: function(e){
		app.npcmaker.set_state( "currentnpc.clonable", e.target.checked );
	},
	render: function(){
		return React.createElement("div", {
			style:{
				width: "50%",
				display: "inline-block",
				'float':"left",
				marginTop:"10px"
			}
		},
			React.createElement("div", {
				style:{
					display:"inline-block"
				}
			}, "Clonable"),
			React.createElement("input", {
				type: "checkbox",
				onChange: this.handleChange,
				checked: app.state.currentnpc.clonable,
				style:{
					verticalAlign:"text-top"
				}
			})
		);
	}
});
var AllegianceSelector = React.createClass({ 
	displayName: "AllegianceSelector",
	handleChange: function(e){
		app.npcmaker.set_state( "currentnpc.allegiance", e.target.value );
	},
	render: function(){
		var options = [
			React.createElement("option", {
				key: "ally",
				value: "ally"
			}, "Ally"),
			React.createElement("option", {
				key: "enemy",
				value: "enemy"
			}, "Enemy"),
		];
		var select = React.createElement("select",{
			value: app.state.currentnpc.allegiance,
			style: {width:"100%"},
			onChange: this.handleChange
		}, options);
		var label = React.createElement("div", {
			style: {
				width:"100%",
				display:"inline-block"
			}
		}, "Allegiance");

		return React.createElement("div", {
			style:{
				width: "50%",
				'float': "right"
			}
		}, label, select);
	}
});

var StatsList = React.createClass({ 
	displayName: "StatsList",
	getInitialState: function(){
		return { stats:["POW","ACC","FOR","CON","RES", "SPD", "EVA"] };
	},
	render: function(){
		var elems = this.state.stats.map( function( stat ){
			return React.createElement( StatsListItem, {
				stat: stat,
				key: stat
			});
		});
		return React.createElement("div", {
			className:"left-statslist"
		}, elems);
	}
});

var StatsListItem = React.createClass({ 
	displayName: "StatsListItem",
	handleChange: function(){

	},
	render: function(){
		var npc = app.state.currentnpc;
		var stat = React.createElement("div", {
			style:{
				display:"inline-block",
				width:"50%"
			}
		}, this.props.stat);
		var cont = React.createElement("div", {
			style:{
				display:"inline-block",
				width:"50%"
			}
		}, 
			React.createElement("input", {
				value: npc.stats[ this.props.stat ],
				style:{
					width: "50px"
				},
				onChange: this.handleChange
			})
		);

		return React.createElement("div", {
		}, stat, cont);
	}
});

//dialogue
// NewDialogueSetButton
// DeleteDialogueSetButton
// NewDialogueKeyButton
// DeleteDialogueKeyButton
// dialogue set
// - dialogue key
// - dialogue text
// - dialogue action

})();