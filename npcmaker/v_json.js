/* jshint browser: true */
/* global app, React*/
(function(){
"use strict";

function _format_json(json){
	if( json === "false" || json === false ){
		return "false";
	}
	var cop = JSON.parse(JSON.stringify( json ));
	delete cop.inventory;
	delete cop.stats.dspells;
	delete cop.stats.lspells;
	delete cop.dspells;
	delete cop.lspells;
	if( Object.keys( cop.dialogue || {} ).length === 0 ){
		delete cop.dialogue;
	}
	var str = JSON.stringify( cop );
	var ret = "";
	var tabct = 0;
	var disablecomma = false;

	function gettabs(){
		var ret = "";
		for( var i = 0; i < tabct*2; ++i ) ret = ret + " ";
		return ret;
	}

	for( var i in str ){
		if( str[i] === "[" || str[i] === "{"){
			tabct++;
			ret = ret + str[i] + "\n" + gettabs(); 
		} else if( str[i] === "," && !disablecomma ){
			ret = ret + str[i] + "\n" + gettabs();
		} else if( str[i] === "]" || str[i] === "}" ){
			tabct--;
			ret = ret + "\n" + gettabs() + str[i]; 
		} else {
			if( str[i] === "\"" && str[i-1] != "\\" ){
				disablecomma = !disablecomma;
			}
			ret = ret + str[i];
		}
	}
	return ret;
}

app.view.JSONPane = React.createClass({
	displayName: "JSONPane",
	getInitialState: function(){
		var value = _format_json( app.state.currentnpc );
		return { value: value, valid:true, editing:false, npc:app.state.currentnpc };
	},
	handleChange: function(e){
		this.setState({ value:e.target.value });
	},
	handleBlur: function(){
		try{
			var npc = JSON.parse(this.state.value);
			var ind = app.npcmaker.get_index( app.state.currentnpc );
			if( ind > -1 ){
				app.npcmaker.set_state( "npclist."+ind, npc, false );
				app.npcmaker.reset_current();			
			}
			this.setState({valid:true});
		} catch( e ){
			this.setState({valid:false});
		}
		this.setState({editing:false});
	},
	handleFocus: function(){
		this.setState({ editing:true });
	},
	componentWillUpdate: function(){
		if( this.state.value === "false" ){
			var value = _format_json( app.state.currentnpc );
			this.state.value = value;
		} else if( this.state.npc.name !== app.state.currentnpc ){
			var value = _format_json( app.state.currentnpc );
			this.state.value = value;
			this.state.npc = app.state.currentnpc;
			this.state.valid = true;
		}
	},
	render: function(){
		var elems = null;
		if( app.state.currentnpc === false ){
			elems = React.createElement("div", {
				style:{
					padding:"5px"
				}
			}, "No npc data loaded.");
		} else if( !this.state.valid || this.state.editing ){
			elems = React.createElement("div", {
				style:{width:"96%", height:"96%", margin:"2%"},
			},
				React.createElement("textarea", {
					style:{width:"100%", height:"100%"},
					className: "right-textarea"+(this.state.valid?"":"-errors"),
					value: this.state.value,
					onChange: this.handleChange,
					onBlur: this.handleBlur,
					onFocus: this.handleFocus,
				})
			);
		} else {
			var value = _format_json( app.state.currentnpc );
			elems = React.createElement("div", {
				style:{width:"96%", height:"96%", margin:"2%"}
			},
				React.createElement("textarea", {
					style:{width:"100%", height:"100%"},
					value: value,
					onChange: this.handleChange,
					onBlur: this.handleBlur,
					onFocus: this.handleFocus
				})
			);

			if( this.state.valid ){
				this.state.value = value;
			}
		}
		return React.createElement("div", {className: "right-container"}, elems);
	}
});

})();