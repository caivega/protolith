/* jshint browser: true */

(function(){
"use strict";

/* jshint ignore: start */

var extend = app.extend;
var UIElement = app.ui.UIElement;

var CreateOverlay = app.ui.CreateOverlay = function(x, y, sprite, name, display, game){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");

	var captain = this;
	this.game = game;

	this.pc_stats = {};

	this.helpvisible = false;

	this.sub_elements.push( new ChooseGraphicPane 	(0, 0, 		"blarg1", "choosegraphicpane", display, this) );
	this.sub_elements[this.sub_elements.length-1].hide();
	this.sub_elements.push( new PCInformationPane 	(0, 0, 		"blarg2", "pcinformationpane", display, this) );
	//this.sub_elements[this.sub_elements.length-1].hide();
	this.sub_elements.push( new PickTraitPane     	(0, 0, 		"blarg3", "picktraitpane",	   display, this) );
	this.sub_elements[this.sub_elements.length-1].hide();
	this.sub_elements.push( new InputNamePane     	(0, 0, 		"blarg7", "inputnamepane",     display, this) );
	this.sub_elements[this.sub_elements.length-1].hide();	
    this.sub_elements.push( new Textarea		 	(30, 30, 	"blarg4", "titletitletitleti", display,
                                        		  	"Create Party", "Georgia", "20", "#EFEFEF", false) ); 
    this.sub_elements.push( new Border			 	(6,  40, 	"blarg5", "borderborderborde", display,
                                        		  	170, 40, 4, "#DEDEDE") ); 
    this.sub_elements.push( new Border			 	(170,6, 	"blarg6", "borderborderbordr", display,
                                        		  	170, 40, 4, "#DEDEDE") );    
	this.sub_elements.push( new cButton	(382, 10,"StandardButtonUP", "donebutton", display,
                                		  	80, 30, "Done!", function(){ captain.game.State.isOn = false; captain.start_game(); }, game) ); 	                                        		  	                                        		  	    
	this.sub_elements.push( new cButton	(302, 10,"StandardButtonUP", "done", display,
                                		  	80, 30, "Stats?", function(){ captain.helpvisible = true; captain.sub_elements[captain.sub_elements.length-1].show(); }) ); 
	this.sub_elements.push( new cButton	(222, 10,"StandardButtonUP", "done", display,
                                		  	80, 30, "Menu", function(){ captain.game.State.isOn = false; captain.game.change_state("MenuState",{}); }) ); 
	this.sub_elements.push( new HelpScreen( 0, 0, "StandardButtonUP", "done", display, this ) );  
	this.sub_elements[this.sub_elements.length-1].hide();                               		  		                                		  		
};

CreateOverlay.prototype = extend(UIElement); 

CreateOverlay.prototype.draw = function(){
	if( this.FLAG_isVisible == true ){
		this.display.draw_sprite(this.sprite, this.x, this.y);

		for( var i in this.sub_elements ){
			this.sub_elements[i].draw();
		}		
	}	
};

CreateOverlay.prototype.contains = function(x, y){
	for( var i in this.sub_elements ){
		var elem = this.sub_elements[i];
		if( this.helpvisible){
			if( elem instanceof HelpScreen ){
				if( elem.FLAG_isVisible && elem.contains(x, y) ){
					elem.click(x, y);
				}	
				break;
			}
		} else {
			if( elem.FLAG_isVisible && elem.contains(x, y) ){
				elem.click(x, y);
			}	
		}		

	}

	return false;
};

CreateOverlay.prototype.start_game = function(){
	var captain = this;
	this.isOn = false;
	setTimeout(function(){
		var myState = captain.game.State;
		var wState = captain.game.Save.get_new_game_state( captain.sub_elements[1].get_pc_info(), captain.game );
		wState.init(true);
		//captain.game.Save.load_new_game( captain.sub_elements[1].get_pc_info(), captain.game);
		captain.game.change_state("FadeState", {state2:wState, state1: myState});
	},50);
};

var ChooseGraphicPane = function(x, y, sprite, name, display, parent){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");

	var captain = this;
	this.parent = parent;
	this.active_pc = 0;	

	this.classoptions = ["Legionaire", "Lancer", "Archer", "Magician"];
	this.gender = "Female";// || Male;
	this["class"] = "Lancer";
	this.sprite = "female_lancer";
	this.descriptions = {
		Lancer:"Trained in the use of two-handed and pole-based weapons, a lancer"+
			" provides a good defensive option for any group. Lancers get a bonus to"+
			" CON and RES due to their defensive nature, but they suffer in EVA and SPD"+
			" because their weapons so often tend to be unweildy. Lancers cannot use"+
			" one-handed weapons as effectively as other classes, but they can make"+
			" good use of any armor.",
		Legionaire:"'High risk and high reward' is the motto of a Legionaire."+
			" Legionaires gain a massive bonus to power, but suffer in every other stat"+
			" except ACC. They can weild any weapon and wear any armor, however their"+
			" health tends to be lower than other classes.",
		Magician:"Choosing to focus on the art of magic in combat, a magician's greatest"+
			" asset is a large store of mana. Magicians get bonuses to RES and SPD"+
			" in addition to a slight bonus to POW, but suffer in FOR and CON."+
			" Magicians get no bonuses to the damage they deal with weapons (although"+
			" they can weild any weapon), but they can wear any"+
			" armor.",
		Archer:"A good archer prefers dancing around fights with quick feet rather than"+
			" brawling blow to blow. Archers gain a bonuses to ACC, SPD, and EVA, but"+
			" lack in POW and RES. Archers can use ranged weapons with double the hit"+
			" rate, but typically are not strong enough to use two-handed weapons"+
			" properly. Archers cannot wear heavy armor without a pentaly to their hit"+
			" rate."    
	}

	var female = new pButton (350, 50,"StandardButtonUP", "femalebutton", display,
        25, 25, "iconFemale", 
        function(){ 
        	captain.gender = "Female";
        	captain.sprite = captain.gender.toLowerCase()+"_"+captain["class"].toLowerCase();
    }); this.female = female;

	var male = new pButton (350, 85,"StandardButtonUP", "malebutton", display,
        25, 25, "iconMale", 
        function(){ 
        	captain.gender = "Male";
        	captain.sprite = captain.gender.toLowerCase()+"_"+captain["class"].toLowerCase();
    }); this.male = male;

	var lancer = new pButton (25, 60,"StandardButtonUP", "lancerbutton", display,
        55, 55, "classLancer", 
        function(){ 
        	captain["class"] = "Lancer";
        	captain.sprite = captain.gender.toLowerCase()+"_lancer";
    }); this.lancer = lancer;

	var legionaire = new pButton (100, 60,"StandardButtonUP", "legionairebutton", display,
        55, 55, "classLegionaire", 
        function(){ 
        	captain["class"] = "Legionaire";
        	captain.sprite = captain.gender.toLowerCase()+"_legionaire";
    }); this.legionaire = legionaire;

	var magician = new pButton (175, 60,"StandardButtonUP", "magicianbutton", display,
        55, 55, "classMagician", 
        function(){ 
        	captain["class"] = "Magician";
        	captain.sprite = captain.gender.toLowerCase()+"_magician";
    }); this.magician = magician;

	var archer = new pButton (250, 60,"StandardButtonUP", "archerbutton", display,
        55, 55, "classArcher", 
        function(){ 
        	captain["class"] = "Archer";
        	captain.sprite = captain.gender.toLowerCase()+"_archer";
    }); this.archer = archer;

	var confirm = new cButton (350, 245,"StandardButtonUP", "cdonebutton", display,
        80, 30, "Confirm", 
        function(){ 
        	var pb = captain.parent
        		.sub_elements[1].get_textarea(captain.active_pc+"graph");
        	captain.parent
        		.sub_elements[1]["_"+captain.active_pc+"_sprite"] = captain.sprite;
        	captain.parent
        		.sub_elements[1]["_"+captain.active_pc+"_class"] = captain["class"];
        	captain.parent
        		.sub_elements[1]["_"+captain.active_pc+"_gender"] = captain.gender;	
        	pb.image_sprite = captain.sprite;
        	captain.parent.hide_sub_element("choosegraphicpane");
		    //had to setTimeout here because the click was registering on this pane
		    //then on the pane that contained it as it was shown.
		    setTimeout(function(){
		        captain.parent.show_sub_element("pcinformationpane");   
		    }, 100);
        }); 
	var cancel = new cButton (40, 245,"StandardButtonUP", "ccancelbutton", display,
        80, 30, "Cancel", 
        function(){ 
		    //had to setTimeout here because the click was registering on this pane
		    //then on the pane that contained it as it was shown.
		    captain.parent.hide_sub_element("choosegraphicpane");
		    setTimeout(function(){
		        captain.parent.show_sub_element("pcinformationpane");   
		    }, 100);
        }); 
	this.description = new TextareaW(25,140, "sidk", "didk2", display, "Once upon a ti"+
		"me there was a man who sat next to a tree.  He had a book with him and he opene"+
		"d up the tome and read from it...", 420, 16, "Bedrock");
	
	this.sub_elements.push( confirm, cancel, this.description, legionaire, lancer,
		archer, magician, male, female ); 

	this.gradind = 0;
	this.graddir = 1;
	this.fs = 5;
	this.f = 0;
	this.grads = [
		"#FDD800",
		"#F0CB00",
		"#DEBB00",
		"#BEA000",
		"#AA8F00",
		"#8D7600"
	];
};

ChooseGraphicPane.prototype = extend(UIElement); 

ChooseGraphicPane.prototype.draw = function(){
	if( this.FLAG_isVisible ){
		this.description.text = this.descriptions[this["class"]];
		this.display.draw(15, 125, 446-10, 114-10, "#ABABAB");

		var iconselected = this["class"].toLowerCase();
		var icon = this[iconselected];
		var giconselected = this.gender.toLowerCase();
		var gicon = this[giconselected];
		this.display.draw(icon.x-3, icon.y-3, 61, 61, this.grads[this.gradind]);
		this.display.draw(gicon.x-2, gicon.y-2, 29, 29, this.grads[this.gradind]);

	    this.display.draw_text_left( "Female", 
	        this.female.x+40, 
	        this.female.y+20, 
	        "Verdana", 
	        16,
	        "white", 
	        "normal");

	    this.display.draw_text_left( "Male", 
	        this.male.x+40, 
	        this.male.y+20, 
	        "Verdana", 
	        16,
	        "white", 
	        "normal");

		if( this.f === this.fs ){
			this.gradind += this.graddir;
			if( this.gradind === this.grads.length - 1 || this.gradind === 0 ) 
				this.graddir = -this.graddir;
			this.f = 0;
		} else {
			this.f++;
		}

		for( var i in this.sub_elements ){
			this.sub_elements[i].draw();
		}
	}
};

ChooseGraphicPane.prototype.show = function(){
	UIElement.prototype.show.call(this);
	for( var i in this.sub_elements ){
		this.sub_elements[i].show();
	}
	var captain = this;
};

ChooseGraphicPane.prototype.contains = function(x, y){
	if( !this.FLAG_isVisible ){
		return false;
	}

	for( var i in this.sub_elements){
		var elem = this.sub_elements[i];
		
		if( elem.contains(x, y) ){
			elem.click(x, y);
		}
	}

	return false;
};

var InputNamePane = function(x, y, sprite, name, display, parent){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");

	var captain = this;
	this.parent = parent;
	this.active_pc = 0;

	this.submit = function(val){
		captain.parent.show_sub_element("pcinformationpane");
		if( val.length <= 10 && val.length > 0 ){
			for( var i in captain.parent.sub_elements ){
				var elem = captain.parent.sub_elements[i];
				if( elem instanceof PCInformationPane ){
					elem["_"+captain.active_pc+"_name"] = val;
					var tx = elem.get_textarea("names"+captain.active_pc);
					tx.text = val;
				}
			}
        }

		Game.prototype.keyboard = null;

        captain.parent.hide_sub_element("inputnamepane");
        captain.parent.game.State.update(false);        
	}

	// this.sub_elements.push( new TextInput(Math.floor(472/3), 120, "none", "nameinput", display, parent, function(val){ captain.submit(val); }) );
	// this.sub_elements.push( new cButton	(Math.floor(472/3) + 40, 170,"StandardButtonUP", "options", display,
 //                                		  	80, 30, "Submit", function(){ captain.submit(captain.display.input._value); }) ); 


};

InputNamePane.prototype = extend(UIElement); 

InputNamePane.prototype.draw = function(){
	if( this.FLAG_isVisible ){
		for( var i in this.sub_elements ){
			this.sub_elements[i].draw();
		}
	}
};

InputNamePane.prototype.show = function(){
	UIElement.prototype.show.call(this);
	for( var i in this.sub_elements ){
		this.sub_elements[i].show();
	}
	var captain = this;

	Game.prototype.keyboard = new OnScreenKeyboard(this.display, 
		function(val){ captain.submit(val); },
		function(val){ captain.submit(""); } 
	);
	Game.prototype.keyboard.maxchars = 11;
};

InputNamePane.prototype.contains = function(x, y){
	if( !this.FLAG_isVisible ){
		return false;
	}

	for( var i in this.sub_elements){
		var elem = this.sub_elements[i];
		
		if( elem.contains(x, y) ){
			elem.click(x, y);
		}
	}

	return false;
};

var PCInformationPane = function(x, y, sprite, name, display, parent){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");

	this.parent = parent;

	this._0_statsleft = 30;
	this._1_statsleft = 30;
	this._2_statsleft = 30;

	this._0_sprite = "female_lancer";
	this._1_sprite = "female_archer";
	this._2_sprite = "male_magician";

	this._0_name = "Kyoko";
	this._1_name = "Annette";
	this._2_name = "Starswirl";

	this._0_class = "Lancer";
	this._1_class = "Archer";
	this._2_class = "Magician";

	this._0_gender = "Female";
	this._1_gender = "Female";
	this._2_gender = "Male";

	var captain = this;

	var ypositions = 		[145+5, 165+5, 185+5, 205+5, 225+5, 245+5, 265+5];
	var xpositions = 		[15-4, 175-4, 335-4];
	var bplusxpositions = 	[122-5, 282-5, 442-5];
	var bminuxpositions = 	[100-5, 260-5, 420-5];
	var stats = 		["POW: 1", "ACC: 1", "FOR: 1", "CON: 1", "RES: 1", "SPD: 1", "EVA: 1"];
	var ids = 			["POW", "ACC", "FOR", "CON", "RES", "SPD", "EVA"];
	var colors = 		["#8F1B1B","#AD6615","#696845","#0B520D","#2F3175","#7A2B78","#0D8A8C"]

	var captain = this;

	for( var i in xpositions ){
		for( var j in ypositions ){
    		this.sub_elements.push( new Textarea	(xpositions[i], ypositions[j], 	"physd", i+ids[j], display,
                                        		  	stats[j], "monospace", "16", colors[j], false) ); 
    		var minubutton = new cButton(	bminuxpositions[i], 
    									 	ypositions[j]-15,
    									 	"StandardButtonUP", 
    									 	i+";"+ids[j]+";button"+ids[j], 
    									 	display,
		                                	20, 20, "-", 
		                                	function(buttonref){
		                                		var tmp = buttonref.name.split(";");
		                                		var stat = tmp[1];
		                                		var pc = tmp[0];

		                                		var newnum = parseInt(captain.get_stat_num(pc+stat)) - 1;
		                                		if( newnum < 1 ){
		                                			newnum = 1;
		                                		} else {
			                                		captain[["", pc, "statsleft"].join("_")]++;
			                                	}

		                                		captain.set_stat(pc+stat, newnum );

		                                		var txarea = captain.get_textarea("points"+pc);
		                                		txarea.text = "Points: "+captain[["", pc, "statsleft"].join("_")];
		                                	}); 
			this.sub_elements.push( minubutton ); 
			var plusbutton = new cButton(	bplusxpositions[i], 
											ypositions[j]-15,
											"StandardButtonUP", 
											i+";"+ids[j]+";button"+ids[j], 
											display,
		                                	20, 20, "+", 
		                                	function(buttonref){
		                                		var tmp = buttonref.name.split(";");
		                                		var stat = tmp[1];
		                                		var pc = tmp[0];

		                                		var newnum = parseInt(captain.get_stat_num(pc+stat)) + 1;
		                                		if( newnum > 99 ){
		                                			newnum = 99;
		                                		}

		                                		captain[["", pc, "statsleft"].join("_")]--;
		                                		if( captain[["", pc, "statsleft"].join("_")] < 0 ){
		                                			newnum = parseInt(captain.get_stat_num(pc+stat));
		                                			captain[["", pc, "statsleft"].join("_")] = 0;
		                                		}

		                                		captain.set_stat(pc+stat, newnum );

		                                		var txarea = captain.get_textarea("points"+pc);
		                                		txarea.text = "Points: "+captain[["", pc, "statsleft"].join("_")];
		                                	}) 
			this.sub_elements.push( plusbutton ); 			                                		  		                                        		  		
    	}
    }  

    //pc0 buttons on the left
	this.sub_elements.push( new Textarea(16, 121+5, 	"physd", "points0", display,
                                		  	"Points: "+this._0_statsleft, "Georgia" , "12", "#001122", false) ); 
	this.sub_elements.push( new cButton	(91, 42+5,"StandardButtonUP", "0names", display,
                                		  	50, 27, "Name", function(){ captain.parent.show_sub_element("inputnamepane");
                                		  								captain.parent.sub_elements[3].active_pc = 0;
                                		  								captain.parent.hide_sub_element("pcinformationpane"); }) ); 	
	this.sub_elements.push( new cButton	(91, 71+5,"StandardButtonUP", "0rands", display,
                                		  	50, 27, "Class", function(){ captain.parent.show_sub_element("choosegraphicpane");
                                		  										captain.parent.sub_elements[0].active_pc = 0;
                                		  										captain.parent.sub_elements[0].gender = captain._0_gender;
                                		  										captain.parent.sub_elements[0]["class"] = captain._0_class;
                                		  										captain.parent.sub_elements[0].sprite = captain._0_sprite;
		                                		  								captain.parent.hide_sub_element("pcinformationpane"); }) ); 	
	this.sub_elements.push( new cButton	(91, 100+5,"StandardButtonUP", "0trait", display,
                                		  	50, 27, "Reset", function(){ captain.def_stats(0, true)}) ); 	
	this.sub_elements.push( new pButton	(29, 72,"StandardButtonUP", "0graph", display,
                                		  	34, 35, this._0_sprite, function(){	 }) ); 	
	this.sub_elements.push( new Textarea(45, 67, 	"physd", "names0", display,
                                		  	this._0_name, "monospace" , "14", "#FEFEFE", true) ); 

	//pc1 buttons in the middle
	this.sub_elements.push( new Textarea(175, 121+5, 	"physd", "points1", display,
                                		  	"Points: "+this._1_statsleft, "Georgia" , "12", "#001122", false) );
	this.sub_elements.push( new cButton	(251, 42+5,"StandardButtonUP", "1names", display,
                                		  	50, 27, "Name", function(){ captain.parent.show_sub_element("inputnamepane");
                                		  								captain.parent.sub_elements[3].active_pc = 1;
                                		  								captain.parent.hide_sub_element("pcinformationpane"); }) ); 	                                		  	 
	this.sub_elements.push( new cButton	(251, 71+5,"StandardButtonUP", "1rands", display,
                                		  	50, 27, "Class", function(){ captain.parent.show_sub_element("choosegraphicpane");
                                		  										captain.parent.sub_elements[0].active_pc = 1;
                                		  										captain.parent.sub_elements[0].gender = captain._1_gender;
                                		  										captain.parent.sub_elements[0]["class"] = captain._1_class;
                                		  										captain.parent.sub_elements[0].sprite = captain._1_sprite;
		                                		  								captain.parent.hide_sub_element("pcinformationpane");}) ); 	
	this.sub_elements.push( new cButton	(251, 100+5,"StandardButtonUP", "1trait", display,
                                		  	50, 27, "Reset", function(){ captain.def_stats(1, true);}) ); 
 	this.sub_elements.push( new pButton	(189, 72,"StandardButtonUP", "1graph", display,
                                		  	34, 35, this._1_sprite, function(){	 }) ); 
	this.sub_elements.push( new Textarea(204, 67, 	"physd", "names1", display,
                                		  	this._1_name, "monospace" , "14", "#FEFEFE", true) );                                 		  		
                                		  	                               		  		
	//pc2 buttons on the right
	this.sub_elements.push( new Textarea(337, 121+5, 	"physd", "points2", display,
                                		  	"Points: "+this._2_statsleft, "Georgia" , "12", "#001122", false) ); 
	this.sub_elements.push( new cButton	(411, 42+5,"StandardButtonUP", "2names", display,
                                		  	50, 27, "Name", function(){ captain.parent.show_sub_element("inputnamepane");
                                		  								captain.parent.sub_elements[3].active_pc = 2;
                                		  								captain.parent.hide_sub_element("pcinformationpane"); }) ); 		
	this.sub_elements.push( new cButton	(411, 71+5,"StandardButtonUP", "2rands", display,
                                		  	50, 27, "Class", function(){ captain.parent.show_sub_element("choosegraphicpane");
                                		  										captain.parent.sub_elements[0].active_pc = 2; 
                                		  										captain.parent.sub_elements[0].gender = captain._2_gender;
                                		  										captain.parent.sub_elements[0]["class"]= captain._2_class;
                                		  										captain.parent.sub_elements[0].sprite = captain._2_sprite;                               		  	
		                                		  								captain.parent.hide_sub_element("pcinformationpane"); }) ); 	
	this.sub_elements.push( new cButton	(411, 100+5,"StandardButtonUP", "2trait", display,
                                		  	50, 27, "Reset", function(){ captain.def_stats(2, true); }) ); 	
 	this.sub_elements.push( new pButton	(349, 72,"StandardButtonUP", "2graph", display,
                                		  	34, 35, this._2_sprite, function(){	 }) );  
	this.sub_elements.push( new Textarea(366, 67, 	"physd", "names2", display,
                                		  	this._2_name, "monospace" , "14", "#FEFEFE", true) );                                 		  		                                		  		

	captain.def_stats(0, false);
	captain.def_stats(1, false);
	captain.def_stats(2, false);
};

PCInformationPane.prototype = extend(UIElement); 

PCInformationPane.prototype.get_pc_info = function(){
	var ids = 			["POW", "ACC", "FOR", "CON", "RES", "SPD", "EVA"];
	var ret = {
		pc0:{stats:{}},
		pc1:{stats:{}},
		pc2:{stats:{}}
	};

	for( var i in ids ){
		ret.pc0.stats[ids[i]] = parseInt(this.extract_stat(this.get_textarea("0"+ids[i])));
		ret.pc1.stats[ids[i]] = parseInt(this.extract_stat(this.get_textarea("1"+ids[i])));
		ret.pc2.stats[ids[i]] = parseInt(this.extract_stat(this.get_textarea("2"+ids[i])));
	}

	ret.pc0.stats.lspells = ["l0", "l1", "l4", "l6", "l7"];
	ret.pc0.stats.dspells = ["d0", "d1", "d2", "d3", "d6"];

	ret.pc0.stats.max_hp = 100;
	ret.pc0.stats.curr_hp = 100;
	ret.pc0.stats.max_mp = 20;
	ret.pc0.stats.curr_mp = 20;	

	ret.pc1.stats.lspells = ["l0", "l1", "l4", "l6", "l7"];
	ret.pc1.stats.dspells = ["d0", "d1", "d2", "d3", "d6"];

	ret.pc1.stats.max_hp = 100;
	ret.pc1.stats.curr_hp = 100;
	ret.pc1.stats.max_mp = 20;
	ret.pc1.stats.curr_mp = 20;	

	ret.pc2.stats.lspells = ["l0", "l1", "l4", "l6", "l7"];
	ret.pc2.stats.dspells = ["d0", "d1", "d2", "d3", "d6"];

	ret.pc2.stats.max_hp = 100;
	ret.pc2.stats.curr_hp = 100;
	ret.pc2.stats.max_mp = 20;
	ret.pc2.stats.curr_mp = 20;		

	ret.pc0.name = this._0_name;
	ret.pc1.name = this._1_name;
	ret.pc2.name = this._2_name;

	ret.pc0.sprite = this._0_sprite;
	ret.pc1.sprite = this._1_sprite;
	ret.pc2.sprite = this._2_sprite;

	ret.pc0["class"]= this._0_class;
	ret.pc1["class"] = this._1_class;
	ret.pc2["class"] = this._2_class;

	return ret;
};

PCInformationPane.prototype.def_stats = function(pc, isreset){
	var captain = this;
	var ids = 			["POW", "ACC", "FOR", "CON", "RES", "SPD", "EVA"];
	ids.sort( function(){return (Math.round(Math.random())-0.5); });
	var last = ids[ids.length-1];
	var stat_var = ["", pc, "statsleft"].join("_");
	captain[stat_var] = 0;

	var pre = {};

	if( pc == 0 ) {
		pre.POW = 10; pre.ACC = 5; pre.FOR = 10; pre.CON = 3; pre.RES = 1; pre.SPD = 3; pre.EVA = 3;
	} else if( pc == 2 ) {
		pre.POW = 12; pre.ACC = 7; pre.FOR = 5; pre.CON = 8; pre.RES = 5; pre.SPD = 8; pre.EVA = 5;
	} else {
		pre.POW = 15; pre.ACC = 5; pre.FOR = 5; pre.CON = 3; pre.RES = 5; pre.SPD = 3; pre.EVA = 5;
	}

	for( var i in pre ){
		if( isreset ){
			this.set_stat(pc+i, 0);
		} else {
			this.set_stat(pc+i, pre[i]);
		}
	}

	if( isreset ) captain[stat_var] = 30;

	var txarea = captain.get_textarea("points"+pc);
	txarea.text = "Points: "+captain[stat_var];	
};

PCInformationPane.prototype.change_class = function(pc){
	var captain = this;

	var classes = ["lancer","legionaire","archer","magician"];

	var txarea = captain.get_textarea("points"+pc);
	txarea.text = "Points: "+captain[stat_var];	
};

PCInformationPane.prototype.get_textarea = function(name){
	for( var i in this.sub_elements ){
		if( this.sub_elements[i].name == name ){
			return this.sub_elements[i];
		}
	}
	return "none";
};

PCInformationPane.prototype.extract_stat = function(elem){
	return elem.text.substring(5, elem.text.length);
};

PCInformationPane.prototype.set_stat = function(name, new_stat_num){
	var elem = this.get_stat_elem(name);
	var stat_num = this.extract_stat(elem);

	elem.text = name.substring(1,4)+": "+new_stat_num;
};

PCInformationPane.prototype.get_stat_num = function(name){
	for( var i in this.sub_elements ){
		var elem = this.sub_elements[i];
		if( elem.name == name ){
			return this.extract_stat(elem);
		}	
	}
	return "none";
};

PCInformationPane.prototype.get_stat_elem = function(name){
	for( var i in this.sub_elements ){
		var elem = this.sub_elements[i];
		if( elem.name == name ){
			return elem;
		}	
	}
	return "none";
};

PCInformationPane.prototype.contains = function(x, y){
	if( !this.FLAG_isVisible ){
		return false;
	}

	for( var i in this.sub_elements){
		var elem = this.sub_elements[i];
		
		if( elem.contains(x, y) ){
			elem.click(x, y);
		}
	}

	return false;
};

PCInformationPane.prototype.draw = function(){

	if( this.FLAG_isVisible != true ){
		return;
	}

	this.display.draw_sprite("PCStatOver", 8, 	135);
	this.display.draw_sprite("PCStatOver", 168, 135);
	this.display.draw_sprite("PCStatOver", 328, 135);

	for( var i in this.sub_elements ){
		this.sub_elements[i].draw();
	}
};

var PickTraitPane = function(x, y, sprite, name, display, parent){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");
};

PickTraitPane.prototype = extend(UIElement); 

var PCTypeTabs = function(x, y, sprite, name, display, parent){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");
};

PCTypeTabs.prototype = extend(UIElement); 

var Border = function(x, y, sprite, name, display, x2, y2, wid, color){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");
	this.x1 = x;
	this.y1 = y;
	this.x2 = x2;
	this.y2 = y2;
	this.wid = wid;
	this.color = color;
};

Border.prototype = extend(UIElement); 

Border.prototype.draw = function(){
	if( this.FLAG_isVisible )
		this.display.draw_line(this.x1, this.y1, this.x2, this.y2, this.wid, this.color);
};

var TextInput = function(x, y, sprite, name, display, parent, onsubmit){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");
	this.parent = parent;
	this.onsubmit = onsubmit;
};

TextInput.prototype = extend(UIElement); 

TextInput.prototype.draw = function(){
	this.display.input.render();  
};

TextInput.prototype.show = function(){
	UIElement.prototype.show.call(this);
    var captain = this;
    this.inp = true;
    this.display.input._x = this.x;
    this.display.input._y = this.y;
    this.display.input._onkeydown = function(ev){
        if( ev.keyCode == 13 ){
            captain.submit();
        }
    }
    this.display.input._onfocus = function(ev){
    } 
    this.display.input._onblur = function(ev){
    }         
    this.display.input.focus();
    setTimeout(function(){
        captain.display.input.focus()
        captain.display.input._value = "";
        captain.display.input.render();
    },10);
};

TextInput.prototype.hide = function(){
	this.FLAG_isVisible = false;
    this.display.input._x = -1000;
}

TextInput.prototype.submit = function(){
	var captain = this;
    this.onsubmit(captain.display.input._value);
};

var Textarea = function(x, y, sprite, name, display, text, font, size, color, centered, shadowed){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");
	this.text = text;
	this.font = font;
	this.size = size;
	this.color = color;
	this.centered = centered;
	this.shadowed = shadowed || false;
};

Textarea.prototype = extend(UIElement); 

Textarea.prototype.draw = function(){
	if( this.FLAG_isVisible ){
		if( !this.centered ){
		    this.display.draw_text_left( this.text, 
		        this.x, 
		        this.y, 
		        this.font, 
		        this.size,
		        this.color, 
		        "normal");
		} else {
			if( this.shadowed )
				this.display.draw_text(this.text, this.x, this.y, this.font, this.color, this.size, "Normal", true);
			else
			    this.display.draw_text( this.text, 
			        this.x, 
			        this.y, 
			        this.font, 
			        this.color,
			        this.size, 
			        "normal");
	    } 
	}
};

var TextareaW = function(x, y, sprite, name, display, text, wid, linhgt, font){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");
	this.text = text;
	this.font = font;
	this.wid = wid;
	this.linhgt = linhgt;
};

TextareaW.prototype = extend(UIElement); 

TextareaW.prototype.draw = function(){
	if( this.FLAG_isVisible ){
		this.display.wrap_text(this.text, this.x, this.y, this.wid, 14, this.font);
	}
};

var cButton = function(x, y, sprite, name, display, wid, hgt, text, onclick, game){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");

	if( game ) this.game = game;

	this.text = text;
	this.onclick = onclick;
	this.wid = wid;
	this.hgt = hgt;
};

cButton.prototype = extend(UIElement); 

cButton.prototype.draw = function(){
	if( this.FLAG_isVisible ){
		this.display.draw_sprite_scaled(this.sprite, this.x, this.y, this.wid, this.hgt );
		this.display.draw_text(this.text, this.x+this.wid/2, this.y+this.hgt*0.691, "Georgia", "#113366", "12", "Bold", true);
	}
};

cButton.prototype.click = function(x,y){
	var captain = this;
	if( "soundCache" in this.__proto__ )
		this.__proto__.soundCache.play_sound("button");

	if( this.name == "donebutton" ) captain.game.State.isOn = false;

	this.sprite="StandardButtonDOWN";
	setTimeout(function(){captain.sprite="StandardButtonUP";captain.onclick(captain);}, 150);	

};

cButton.prototype.contains = function(x, y){
	if( this.FLAG_isVisible == false ){
		return false;
	}

	// y = y + 15;
	// x = x + 12;
	// 
	//console.log("mouse coord:", x, y, " button coord:", this.x, this.y);	

	var widx = this.wid + this.x;
	var widy = this.hgt + this.y;

	if( x >= this.x && y >= this.y && x < widx && y < widy ){
		return true;
	} else {
		return false;
	}
};

var pButton = function(x, y, sprite, name, display, wid, hgt, image_sprite, onclick){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");

	this.image_sprite = image_sprite;
	this.onclick = onclick;
	this.wid = wid;
	this.hgt = hgt;

	this.is_animated = false;
	this.anim_frames = [];
	this.frame_speed = 10;
	this.cframe = 0;
	this.csprite = 0;
};

pButton.prototype = extend(UIElement); 

pButton.prototype.draw = function(){
	if( this.FLAG_isVisible ){

		this.display.draw_sprite_scaled(this.sprite, this.x, this.y, this.wid, this.hgt );
		if( this.is_animated ){
			this.display.draw_sprite_scaled(this.image_sprite+this.anim_frames[this.csprite], this.x+this.wid*0.06, this.y+this.hgt*0.06, this.wid-8, this.hgt-3 );
			this.cframe++;
			if( this.cframe == this.frame_speed ){
				this.csprite++;
				this.cframe = 0;
				if( this.csprite >= this.anim_frames.length ){
					this.csprite = 0;
				}
			}
		} else {
			this.display.draw_sprite_scaled(this.image_sprite, this.x+this.wid*0.06, this.y+this.hgt*0.06, this.wid-8, this.hgt-3 );
		}
	}
};

pButton.prototype.click = function(x,y){
	var captain = this;
	this.sprite="StandardButtonDOWN";
	setTimeout(function(){captain.sprite="StandardButtonUP"}, 50);	
	this.onclick(this);
};

pButton.prototype.contains = function(x, y){
	if( this.FLAG_isVisible == false ){
		return false;
	}

	var widx = this.wid + this.x;
	var widy = this.hgt + this.y;

	if( x >= this.x && y >= this.y && x < widx && y < widy ){
		return true;
	} else {
		return false;
	}
};

var WhoButton = function(x, y, sprite, name, display, onclick){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");
	this.onclick = onclick;
};

WhoButton.prototype = extend(UIElement); 

WhoButton.prototype.draw = function(){
	if( this.FLAG_isVisible ){
		this.display.draw_sprite(this.sprite, this.x, this.y);
	}
};

WhoButton.prototype.click = function(x,y){
	var captain = this;
	captain.onclick(this);
};

WhoButton.prototype.contains = function(x, y){
	if( this.FLAG_isVisible == false ){
		return false;
	}

	var widx = 35 + this.x;
	var widy = 24 + this.y;

	if( x >= this.x && y >= this.y && x < widx && y < widy ){
		return true;
	} else {
		return false;
	}
};

var HelpScreen = function(x, y, sprite, name, display, main){
	UIElement.call(this, x, y, sprite, name, display, "none", "none");

	this.main = main;
	var captain = this;

	this.sub_elements.push( new cButton	(382, 233,"StandardButtonUP", "done", display,
                                		  	80, 30, "Back", function(){ captain.hide(); captain.main.helpvisible = false;}) ); 

    this.sub_elements.push( new cButton (12, -50+60, 	"StandardButtonUP", "titletitletitleti", display,
                                    		  	60, 25, "POW", function(){ captain.show_description("POW"); }) ); 
    this.sub_elements.push( new cButton (12, -50+90, 	"StandardButtonUP", "titletitletitleti", display,
                                    		  	60, 25, "ACC", function(){ captain.show_description("ACC"); }) ); 
    this.sub_elements.push( new cButton (12, -50+120, 	"StandardButtonUP", "titletitletitleti", display,
                                    		  	60, 25, "FOR", function(){ captain.show_description("FOR"); }) ); 
    this.sub_elements.push( new cButton (12, -50+150, 	"StandardButtonUP", "titletitletitleti", display,
                                    		  	60, 25, "CON", function(){ captain.show_description("CON"); }) ); 
    this.sub_elements.push( new cButton (12, -50+180, 	"StandardButtonUP", "titletitletitleti", display,
                                    		  	60, 25, "RES", function(){ captain.show_description("RES"); }) ); 
    this.sub_elements.push( new cButton (12, -50+210, 	"StandardButtonUP", "titletitletitleti", display,
                                    		  	60, 25, "SPD", function(){ captain.show_description("SPD"); }) ); 
    this.sub_elements.push( new cButton (12, -50+240, 	"StandardButtonUP", "titletitletitleti", display,
                                    		  	60, 25, "EVA", function(){ captain.show_description("EVA"); }) ); 

    //x, y, sprite, name, display, text, wid, linhgt, font

    this.txarea = new TextareaW(25, 230, "idk", "idk2", display, "Once upon a time there was a man who sat next to a tree.  He had a book with him and he opened up the tome and read from it...", 350, 16, "Bedrock");
    this.image = "statDEF"; 

    this.show_description("POW");

    this.sub_elements.push(this.txarea);                                   		  	                                    		  	                                    		  	                                    		  	                                    		  	    
};

HelpScreen.prototype = extend(UIElement); 

HelpScreen.prototype.show_description = function( statname ){
	if( statname == "POW" ){
		this.image = "statPOW"; 
		this.txarea.text = "Power - A measure of how much strength a character has both physically and magically.  More power will give a character higher damage in melee combat and more effective spells.";
	} else if( statname == "ACC" ){
		this.image = "statACC"; 
		this.txarea.text = "Accuracy - A measure of how focused a character is during combat.  Accuracy will allow a character to hit critical spots on an enemy more often and give more chance of hitting evasive enemies."; 
	} else if( statname == "FOR" ){
		this.image = "statDEF"; 
		this.txarea.text = "Fortitude - A measure of a character's bravery faced with a combat situation.  This stat determines the majority of a character's health pool.";
	} else if( statname == "CON" ){
		this.image = "statCON"; 
		this.txarea.text = "Constitution - A measure of how much a character is resistant to pain.  This stat determines some of a character's health as well as grants a character natural armor against damage.";
	} else if( statname == "RES" ){
		this.image = "statDEF"; 
		this.txarea.text = "Resistance - A measure of a character's capability to overcome the adverse effects of magic.  A character with high resistance will take less damage from magical attacks.";
	} else if( statname == "SPD" ){
		this.image = "statSPD"; 
		this.txarea.text = "Speed - A measure of how fast a character is.  Characters with high speed can do multiple actions in combat instead of just one.";
	} else {
		this.image = "statEVA"; 
		this.txarea.text = "Evasion - A measure of how tricky a character is to hit.  A character with high evasion will be able to dodge both physical attacks and magical attacks.";
	}

};

HelpScreen.prototype.draw = function(){
	if( this.FLAG_isVisible ){
		//this.display.draw_sprite("SingleNotif", 55, 20);
		
		this.display.draw(5, 5, 472-10, 288-10, "grey");
		this.display.draw(25-5, 217, 354, 62, "#ABABAB");
		for( var i in this.sub_elements ){
			this.sub_elements[i].draw();
		}

		this.display.draw(90-5, 30-5, 362+10, 168+10, "#232323");
		this.display.draw_sprite(this.image, 90, 30 ); 
	}
};

HelpScreen.prototype.click = function(x,y){
	var captain = this;
};

HelpScreen.prototype.contains = function(x, y){
	if( this.FLAG_isVisible == false ){
		return false;
	}

	for( var i in this.sub_elements ){
		if( this.sub_elements[i].contains(x, y) ){
			this.sub_elements[i].click(x, y);
		}
	}
};

/* jshint ignore: end */

})();