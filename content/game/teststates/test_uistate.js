/* jshint browser: true */
/* global app  */

(function(){
"use strict";

var TEST_IngameState = app.game.TEST_IngameState = function( game, params ){
	app.game.AbstractState.call(this, game);
	this.params = params;
	this.wstate = null;
};

TEST_IngameState.prototype = app.extend(app.game.AbstractState); 

TEST_IngameState.prototype.init = function(){
	this.wstate = this.game.Save.get_new_game_state( this.get_pc_info(), this.game );
	this.wstate.init( true );

	this.remake_ui();

	this.begin();
};

TEST_IngameState.prototype.remake_ui = function(){
	this.wstate.remake_ui();
};

TEST_IngameState.prototype.begin = function(){
	this.wstate.begin();
};

TEST_IngameState.prototype.draw = function(){
    this.wstate.draw( this.wMode );
};

TEST_IngameState.prototype.handleMouseClick = function(ev){
	this.wstate.handleMouseClick( ev );
};

TEST_IngameState.prototype.handleMouseUnclick = function(){
	this.wstate.handleMouseUnclick( );
};

TEST_IngameState.prototype.handleMouseMove = function(ev){
	this.wstate.handleMouseMove( ev );
};

TEST_IngameState.prototype.get_pc_info = function(){
	function _get_spells(){
		var ret = [];
		for( var i = 0; i < 7; i++ ){
			ret.push( [
				true,
				false,
				false,
				false,
				false,
				false,
				false
			] );
		}
		return ret;
	}

	var ids = ["POW", "ACC", "FOR", "CON", "RES", "SPD", "EVA"];
	var ret = {
		pc0:{stats:{}},
		pc1:{stats:{}},
		pc2:{stats:{}}
	};

	for( var i in ids ){
		ret.pc0.stats[ids[i]] = Math.floor( app.normalize( Math.random(), 0, 1, 1, 99 ) );
		ret.pc1.stats[ids[i]] = Math.floor( app.normalize( Math.random(), 0, 1, 1, 99 ) );
		ret.pc2.stats[ids[i]] = Math.floor( app.normalize( Math.random(), 0, 1, 1, 99 ) );
	}

	ret.pc0.lspells = _get_spells();
	ret.pc0.dspells = _get_spells();

	ret.pc0.stats.max_hp = 100;
	ret.pc0.stats.curr_hp = 100;
	ret.pc0.stats.max_mp = 20;
	ret.pc0.stats.curr_mp = 20;	

	ret.pc1.lspells = _get_spells();
	ret.pc1.dspells = _get_spells();

	ret.pc1.stats.max_hp = 100;
	ret.pc1.stats.curr_hp = 100;
	ret.pc1.stats.max_mp = 20;
	ret.pc1.stats.curr_mp = 20;	

	ret.pc2.lspells = _get_spells();
	ret.pc2.dspells = _get_spells();

	ret.pc2.stats.max_hp = 100;
	ret.pc2.stats.curr_hp = 100;
	ret.pc2.stats.max_mp = 20;
	ret.pc2.stats.curr_mp = 20;		

	ret.pc0.name = "Engleberton";
	ret.pc1.name = "Anschwertz";
	ret.pc2.name = "Adalais";

	ret.pc0.sprite = "male_legionaire";
	ret.pc1.sprite = "male_magician";
	ret.pc2.sprite = "female_archer";

	ret.pc0["class"]= "legionaire";
	ret.pc1["class"] = "magician";
	ret.pc2["class"] = "archer";

	return ret;
};

})();