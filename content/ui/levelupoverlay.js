/* jshint browser: true */
/* global app  */

(function(){
"use strict";

var LevelupOverlay = app.ui.LevelupOverlay = function(x, y, display, state){
	app.ui.UIElement.call(this, x, y, "MiniLavaPane", "lvlup", display, "none", "none");
    this.charname = "Adalais";

    this.centerx = this.display.dimx/2;
    this.centery = this.display.dimy/2;

    this.state = state;

    this.panew = this.display.images[this.sprite].width;
    this.paneh = this.display.images[this.sprite].height;

	this.continuebutton = null;                                        		  	                                        		  	    

	this.titletextparams = {
		color:"#DEDEDE",
		shadowcolor:"#121212",
		align: "center",
		size:20,
		font:"Bedrock"
	};

	this.normcol = "#FADEDE";
	this.lvlcol = "#AADEFF";
	this.normshadcol = "#783434";
	this.lvlshadcol = "#233478";

	this.stattextparams = {
		color:this.normcol,
		shadowcolor:this.normshadcol,
		shadowthickness:3,
		align: "left",
		size:16,
		font:"Monospace"
	};

	this.pc = null;
	this.pclvlanimctr = 0;
	this.framectr = 0;
	this.lvlfs = 7;

	//transition variables
	this.yoffset = 0;
	this.textxoffset = 0;

	//class-based growth rates
	this.rates = {
		"lancer":{
			"POW":{rate:0.5,max:3},
			"ACC":{rate:0.5,max:3},
			"FOR":{rate:0.6,max:3},
			"CON":{rate:0.7,max:3},
			"RES":{rate:0.7,max:3},
			"SPD":{rate:0.4,max:3},
			"EVA":{rate:0.3,max:3}
		},
		"legionaire":{
			"POW":{rate:0.9,max:3},
			"ACC":{rate:0.5,max:3},
			"FOR":{rate:0.3,max:6},
			"CON":{rate:0.2,max:7},
			"RES":{rate:0.2,max:7},
			"SPD":{rate:0.2,max:7},
			"EVA":{rate:0.2,max:7}
		},
		"magician":{
			"POW":{rate:0.6,max:4},
			"ACC":{rate:0.5,max:2},
			"FOR":{rate:0.2,max:1},
			"CON":{rate:0.2,max:2},
			"RES":{rate:0.8,max:3},
			"SPD":{rate:0.8,max:3},
			"EVA":{rate:0.2,max:3}
		},
		"archer":{
			"POW":{rate:0.2,max:6},
			"ACC":{rate:0.8,max:4},
			"FOR":{rate:0.6,max:2},
			"CON":{rate:0.5,max:3},
			"RES":{rate:0.5,max:3},
			"SPD":{rate:0.8,max:3},
			"EVA":{rate:0.7,max:5}
		}				
	};

	this.stats = {
		"POW":120,
		"ACC":100,
		"FOR":80,
		"CON":60,
		"RES":40,
		"SPD":20,
		"EVA":1
	};
	this.statincs = {};

	this.transitionstate = "zoomingin"; // || "zoomingout" || "statzoom" || "lvling"     
};

LevelupOverlay.prototype = app.extend(app.ui.UIElement); 

LevelupOverlay.prototype.reset_with_char = function(ch){
	this.pc = ch;
	this.pclvlanimctr = 0;
	this.framectr = 0;
	this.lvlfs = 7;	

	this.charname = ch.name;

	this.stats = {
		"POW":120,
		"ACC":100,
		"FOR":80,
		"CON":60,
		"RES":40,
		"SPD":20,
		"EVA":1
	};

	this.transitionstate = "zoomingin";
	this.textxoffset = 1000;
	this.yoffset = 1000;
	this.statincs = {};
};

LevelupOverlay.prototype.reset_gain_level = function(){
	this.stats = {
		"POW":120,
		"ACC":100,
		"FOR":80,
		"CON":60,
		"RES":40,
		"SPD":20,
		"EVA":1
	};	

	this.transitionstate = "lvling";
};

LevelupOverlay.prototype.transition = function(){
	if( this.transitionstate === "zoomingin" ){
		if( this.yoffset !== 0 ){
			this.yoffset = this.yoffset/1.2;
			if( this.yoffset < 5 ){
				this.yoffset = 0;
				this.transitionstate = "statzoom";
			}
		}
	} else if( this.transitionstate === "statzoom" ){
		if( this.textxoffset !== 0 ){
			this.textxoffset = this.textxoffset/1.2;
			if( this.textxoffset < 5 ){
				this.textxoffset = 0;
				this.transitionstate = "lvling";
			}
		}
	} else {

	}

};

LevelupOverlay.prototype.draw = function(){
	if( this.FLAG_isVisible === true ){

		this.transition();

		//Draw the background pane
		this.display.draw_sprite(this.sprite, 
			this.centerx - this.panew/2, this.centery - this.paneh/2 + this.yoffset);

		//Charname and title
		this.display.draw_text_params(this.charname, 
			this.centerx + 23, 53 + this.yoffset, this.titletextparams);
		this.display.draw_text_params("Stat Gain!", 
			this.centerx + 23, 73 + this.yoffset, this.titletextparams);

		if( this.pc === null ){
			return;
		}

		//pc sprite and animations
		this.display.draw_sprite( this.pc.sprite+"_lvl"+this.pclvlanimctr,
			this.centerx - this.panew/2 + 10, this.centery-this.paneh/2+5+this.yoffset); 
		if( this.framectr >= this.lvlfs ){
			this.framectr = 0;
			this.pclvlanimctr++;
			if( this.pclvlanimctr > 3 ){
				this.pclvlanimctr = 0;
			}
		} else {
			this.framectr++;
		}

		if( this.transitionstate !== "zoomingin"){
			this.draw_stat_text();
			this.continuebutton.draw();
		}
	}
};

LevelupOverlay.prototype.draw_stat_text = function(){
	var ymax = this.centery - this.paneh/2 + 62;
	var ctr = 0;
	for( var statname in this.stats ){
		var y = ymax + ctr*19; ctr++;
		var startx = this.centerx-76+this.textxoffset; 
		this.display.draw_text_params(statname, 
			startx, y, this.stattextparams);	

		this.display.draw_text_params(this.pc.stats[statname], 
			startx + 50, y, this.stattextparams);

		if( this.transitionstate === "statzoom" ){
			continue;
		}	

		if( this.stats[statname].length !== undefined ){
			var code = this.stats[statname];
			if( !( /_/.test(code) ) ){
				this.stattextparams.color = this.lvlcol;
				this.stattextparams.shadowcolor = this.lvlshadcol;
			}
			this.display.draw_text_params(code, 
				startx + 80, y, this.stattextparams);	
			this.stattextparams.color = this.normcol;
			this.stattextparams.shadowcolor = this.normshadcol;		
		} else {
			var code = 90+(this.stats[statname]%10);
			this.display.draw_text_params(String.fromCharCode(code), 
				startx + 80, y, this.stattextparams);				
		}
	
		if( this.stats[statname] === 200 ){
			this.stats[statname] = 201;
			this.gain_stat(statname);
		} else if( this.stats[statname].length === undefined ){
			this.stats[statname]++;
		}
	}
};

LevelupOverlay.prototype.gain_stat = function(statname){
	var chance = this.rates[ this.pc.combatclass ][ statname ].rate;
	var maxinc = this.rates[ this.pc.combatclass ][ statname ].max;
	var isincrease = (Math.random() < chance );

	if( isincrease ){
		var incamt = Math.floor(Math.random()*maxinc) + 1;
		this.stats[statname]= "+"+incamt+" = "+(parseInt(this.pc.stats[statname])+incamt);
		this.statincs[statname] = incamt;
	} else {
		this.stats[statname]= "+0 = "+this.pc.stats[statname];
	}
};

LevelupOverlay.prototype.apply_stat_gains = function(){
	for( var i in this.statincs ){
		this.pc.stats[i] += this.statincs[i];
	}

	this.pc.xp = this.pc.xp - this.pc.xptonextlevel;
	this.pc.xptonextlevel = 
		app.world.Player.prototype.get_threshold_xp.call( {}, this.pc.stats );
	this.pc.calc_hpmp();
};

LevelupOverlay.prototype.contains = function(x,y){
	if( this.continuebutton.contains( x, y )){
		this.continuebutton.click(x,y);
	}
	return false;
};

// function test(classs){
// 	lvl.pc["class"] = classs;
// 	lvl.pc.stats = {
//         POW:1,
//         ACC:1,
//         FOR:1,
//         CON:1,
//         RES:1,
//         SPD:1,
//         EVA:1,
//         curr_hp: 100,
//         curr_mp:20
//     }

// 	for( var i = 0; i < 50; ++i ){
// 		lvl.statincs = {};
// 		for( var j in lvl.stats ){
// 			lvl.gain_stat(j);
// 		}
// 		lvl.apply_stat_gains();
// 	}
// };

})();
