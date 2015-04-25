/* jshint browser: true */
/* global app */

(function(){
"use strict";

app.cutscenes = {};

var CutsceneLoader = app.cutscenes.CutsceneLoader = function(display){
	this.display = display;
	this.loaded = 0;
	this.loading = 0;
	
	this.cutscenes = [
		"test"
	];
};

CutsceneLoader.prototype.is_ready = function(){
	var isready = (this.loaded === this.loading && this.loaded !== 0);
	return {is_ready:isready,max:this.loading,curr:this.loaded};
};

CutsceneLoader.prototype.load_cutscene_meta = function(){
	var head = document.getElementsByTagName('head')[0];
	var scenes = this.cutscenes;
	for( var i in scenes ){
		this.loading++;
		var script= document.createElement('script');
		script.type= 'text/javascript';
		script.onload = function(){
			this.loaded++;
			if( this.loaded===this.loading ){
				this.load_cutscene_pics();
				this.load_cutscene_listfiles();
			}
		}.bind(this);
		script.src= './cutscenes/'+scenes[i]+"/"+scenes[i]+".js";
		head.appendChild(script);
	}
};

CutsceneLoader.prototype.load_cutscene_pics = function(){
	for( var i = 0; i < this.cutscenes.length; ++i ){
		var scene = window["CUTSCENE"+this.cutscenes[i]];
		var urlbegin = "./cutscenes/"+scene.name+"/layer";
		for( var j = 0; j < scene.numframes; j++ ){
			var url = urlbegin+(j+2)+".png";
			this.display.load_picture("CUTS"+scene.name+j,url);
		}
	}
};

CutsceneLoader.prototype.load_cutscene_listfiles = function(){
	var read_file = function(file, scene){
		this.loading++;
	    var rawFile = new XMLHttpRequest();
	    rawFile.open("GET", file, true);
	    rawFile.onreadystatechange = function (){
	        if(rawFile.readyState === 4){
                var t = rawFile.responseText;
				t = t.substr(t.search("{")).replace(/=/g,":")
					.replace(/( -- )[a-zA-z0-9 ]*/g,"")
					.replace(/pos/g,"\"pos\"")
					.replace(/size/g,"\"size\"")
					.replace(/\s/g,"")
					.replace(/\{([0-9]+),([0-9]+)\}/g, "[\"$1\",\"$2\"]");         
                scene.meta = JSON.parse(t.slice(0, t.length-2)+"}");
                this.loaded++;
	        }
	    }.bind(this);
	    rawFile.send(null);
	}.bind(this);

	for( var i = 0; i < this.cutscenes.length; ++i ){
		var scene = window["CUTSCENE"+this.cutscenes[i]];
		var url = "./cutscenes/"+scene.name+"/list.txt";
		read_file(url, scene);
	}
};

})();