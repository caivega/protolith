/* jshint browser: true */
/* global app, React */
(function(){
"use strict";

app.view.SpriteSelector = React.createClass({ 
	displayName: "SpriteSelector",
	getInitialState: function(){
		return {enabled:false};
	},
	handleClick: function(sprite){
		if( this.state.enabled === false ){
			this.setState( {enabled:true} );
			setTimeout( function(){
				window.addEventListener("click", this.handleBlur);
			}.bind(this), 100);
		} else {
			if( sprite !== undefined ){
				app.npcmaker.set_state("currentnpc."+this.props.type, sprite, false );
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
		var sprites = null;
		var label = null;
		if( this.props.type === "sprite" ){
			sprites = app.display.actorsprites;
			label = React.createElement("div", {
				style:{ paddingBottom:"5px" },
				key:"label"
			}, "Select Sprite");
		} else {
			sprites = Object.keys( app.display.sprites ).filter( function( sprite ){
				return sprite.indexOf( "port_" ) > -1;
			});
			label = React.createElement("div", {
				style:{ paddingBottom:"5px" },
				key:"label"
			}, "Select Portrait");
		}
		var elems = null;
		var cont = null;
		var maxheight = (window.innerHeight - 50) * 0.5;

		if( this.state.enabled ){
			elems = sprites.map( function( sprite ){ 
				return React.createElement( SpriteSelectorItem, {
					sprite: sprite,
					handleClick: this.handleClick,
					key: sprite,
					type: this.props.type
				});
			}.bind(this));
			elems.unshift(label);
			cont = React.createElement("div", {
				className: "left-sprite-selector-open",
				style: {
					maxHeight: maxheight
				}
			}, elems);
		} else {
			elems = React.createElement( SpriteSelectorItem, {
				sprite: app.state.currentnpc[ this.props.type ],
				handleClick: this.handleClick,
				key: app.state.currentnpc[ this.props.type ],
				type: this.props.type
			});
			cont = React.createElement("div", {
				className: "left-sprite-selector"
			}, label, elems);
		}

		return React.createElement("div", {className:"left-sprite-selector-cont"}, cont);
	}
});

var SpriteSelectorItem = React.createClass({
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
	handleClick: function(sprite){
		this.props.handleClick(sprite);
	},
	componentDidUpdate: function(){
		if( this.props.sprite === "none" ){
			return;
		}
		if( app.display.has_sprite( this.props.sprite ) ){
			app.display.context = this.state.ctx;
			app.display.canvas = this.state.canvas;
			app.display.clear("white");
			app.display.draw_sprite_scaled( 
				this.props.sprite, 0, 0, 
				this.state.canvas.width, this.state.canvas.height
			);
			var cont = document.getElementById("left-sprite-"+this.props.sprite);
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
		var sprite = this.props.sprite;
		var selected = null;
		if( this.props.type === "sprite" ){
			selected = this.props.sprite === app.state.currentnpc.sprite;
		} else {
			selected = this.props.portrait === app.state.currentnpc.portrait;
		}
		var itemclass = "left-sprite-select-item";
		var image = null;
		if( app.display.sprites[ sprite ] ){
			image = React.createElement("div", {
				className: "left-sprite-select-item-pic",
				id: "left-sprite-"+sprite
			});
		} else {
			image = React.createElement("div", {
				className: "left-char-select-item-pic",
				id: "left-sprite-"+sprite
			}, sprite);	
		}

		return React.createElement("div", {
			className: itemclass+(selected?" "+itemclass+"-selected":""),
			onClick: this.handleClick.bind( this, sprite ),
			key: sprite
		}, 
			image		
		);
	},
});

})();