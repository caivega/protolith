/* jshint browser: true */
/* global app, console */

(function(){
"use strict";

var OnScreenKeyboard = app.ui.OnScreenKeyboard = function( display, onconfirm, oncancel ){
	this.display = display;

	this.key0 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "0", "1"];
	this.key1 = ["a", "s", "d", "f", "g", "h", "j", "k", "l", "2", "3", "4"];
	this.key2 = ["z", "x", "c", "v", "b", "n", "m", "5", "6", "7", "8", "9"];

	this.keywidth = /*Math.floor*/(this.display.dimx/16);
	this.keyheight = /*Math.floor*/(this.display.dimx/16);

	this.top = this.display.dimy - 3*this.keyheight;
	this.left = 0;

	this.selected = "";
	this.seltimeoutid = 0;

	this.uppercasemode = false;

	this.inputstr = "";
	this.maxchars = 12;
	this.inputx = this.display.dimx/2.0;
	this.inputy = this.display.dimy/2.0 + 6;

	this.onconfirm = function(){ 
		this.texthandler.select("Confirm");
		if(typeof onconfirm === "function"){
			onconfirm(this.inputstr);
		}
	}.bind(this);
	this.oncancel = function(){ 
		this.texthandler.select("Cancel");
		if(typeof oncancel === "function"){
			oncancel(this.inputstr);
		}
	}.bind(this);

	this.texthandler = {
		delete_text:function(){
			this.select("Delete");
			var str = this.inputstr;
			if( this.inputstr.length > 1 ){
				this.inputstr = str.substring(0, str.length-1);
			} else if( str.length === 1 ){
				this.inputstr = "";
			}
		},
		add_text:function(key){
			this.select(key);
			if( this.inputstr.length < this.maxchars ){
				this.inputstr+=(this.uppercasemode?key.toUpperCase():key);
			}
		},
		select:	function(key){
			this.selected = key;
			clearTimeout( this.seltimeoutid );
			this.seltimeoutid = setTimeout(
				function(){ this.selected = ""; }.bind(this), 100
			);
		}
	};
};

OnScreenKeyboard.prototype.draw = function(){
	this.display.context.globalAlpha = 0.5;
	this.display.draw(0, 0, 472, 288, "black");
	this.display.context.globalAlpha = 1.0;

	var draw_key = function(text, x, y, w, h){
		var ox = w/2;
		var oy = h/2+6;

		var bgcol = "#AAAAAA";
		if( text === this.selected ){
			bgcol = "#888888";
		}

		this.display.draw(x, y, 
			w, h, "#555555");
		this.display.draw(x+2, y+2, 
			w-4, h-4, bgcol);

		this.display.draw_text(text, x+ox, y+oy, 
			"Verdana", "darkgreen", "14", "Normal", false);
	}.bind(this);

	var drawarray = function(arr){
		try{
		for( var i in arr ){
			var ch = (this.uppercasemode?arr[i].toUpperCase():arr[i]);
			draw_key(ch, x, y, this.keywidth, this.keyheight);
			x+=this.keywidth;
		}
		} catch(e) {
			console.error(e.stack);
		}
	}.bind(this);

	var x = this.left+2*this.keywidth;
	var y = this.top;
	drawarray(this.key0);

	x = this.left+2*this.keywidth;
	y = this.top+1*this.keyheight;
	drawarray(this.key1);

	x = this.left+2*this.keywidth;
	y = this.top+2*this.keyheight;
	drawarray(this.key2);

	draw_key("Case", this.left, this.top, 
		this.keywidth*2, this.keyheight);
	draw_key("Cancel", this.left, this.top+2*this.keyheight, 
		this.keywidth*2, this.keyheight);

	draw_key("Delete", this.left+14*this.keywidth, this.top, 
		this.keywidth*2, this.keyheight);
	draw_key("Confirm", this.left+14*this.keywidth, this.top+2*this.keyheight, 
		this.keywidth*2, this.keyheight);

	var boxx = this.inputx - 12*this.maxchars/2;
	var boxy = this.inputy - 14;
	var boxw = 12*this.maxchars;
	var boxh = 20;
	this.display.draw(boxx, boxy, 
		boxw, boxh, "#111111");
	this.display.draw(boxx+2, boxy+2, 
		boxw-4, boxh-4, "#FFFFFF");	
	this.display.draw_text(this.inputstr, this.inputx, this.inputy, 
		"Verdana", "green", "14", "Normal", false);
};

OnScreenKeyboard.prototype.keydown = function(ev){
	//shift
	if( ev.which === 16 ){
		this.texthandler.select("Case");
		this.uppercasemode = true;
	}

	//escape
	if( ev.which === 27 ){
		this.oncancel();
	}

	//enter
	if( ev.which === 13 ){
		this.onconfirm();
	}

	//backspace
	if( ev.which === 8 ){
	 	this.texthandler.delete_text();
	 }

	if( ev.which >= 48 && ev.which <= 90 ){
		var key = String.fromCharCode(ev.which).toLowerCase();
		this.texthandler.add_text(key);
	}
};

OnScreenKeyboard.prototype.keyup = function(ev){
	if( ev.which === 16 ){
		this.texthandler.select("Case");
		this.uppercasemode = false;
	}
};

OnScreenKeyboard.prototype.contains = function(x, y){
	if( x > this.left + 2*this.keywidth && x < this.left + 14*this.keywidth){
		if( y > this.top ){
			y = y - this.top;
			x = x - (this.left + 2*this.keywidth);
			var yind = Math.floor( y/this.keyheight );
			var xind = Math.floor( x/this.keywidth );
			var key = this["key"+yind][xind];
			this.texthandler.add_text(key);
		}
	} else if( x < this.left + 2*this.keywidth ){ //Touch is on the left side
		if( y > this.top && y < this.top + this.keyheight ){
			this.texthandler.select("Case");
			this.uppercasemode = !this.uppercasemode;
		}

		if( y > this.top + this.keyheight*2 && y < this.top + this.keyheight*3 ){
			this.texthandler.select("Cancel");
			this.oncancel(this.inputstr);
		}
	} else { //Touch is on the right side
		if( y > this.top && y < this.top + this.keyheight ){
			this.texthandler.delete_text();
		}

		if( y > this.top + this.keyheight*2 && y < this.top + this.keyheight*3 ){
			this.texthandler.select("Confirm");
			this.onconfirm(this.inputstr);
		}
	} 
};

})();