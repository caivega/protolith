/* jshint browser: true */
/* global app, buzz */

(function(){
"use strict";
	
app.sound = {};
var SoundCache = app.sound.SoundCache = function(game){

	this.game = game;

	this.sounds = {};

	this.totalsounds = 0;
	this.numloadedsounds = 0;

	//console.log("CAN PLAY WAV", buzz.isWAVSupported());
	//console.log("CAN PLAY OGG", buzz.isOGGSupported());

	this.init();
};

SoundCache.prototype.init = function(){

	// this.load_sound("allyspellhit", "wav");
	// this.load_sound("arrowhit", "wav");
	// this.load_sound("button", "wav");
	// this.load_sound("cast", "wav");
	// this.load_sound("castally", "wav");
	// this.load_sound("enemyspellhit", "wav");
	// this.load_sound("startcombat", "wav");
	// this.load_sound("exitcombat", "wav");
	// this.load_sound("explosion", "wav");
	// this.load_sound("footstep", "wav");
	// this.load_sound("getitem", "wav");
	// this.load_sound("notification", "wav");
	// this.load_sound("punch1", "wav");
	// this.load_sound("punch2", "wav");
	// this.load_sound("punch3", "wav");
	// this.load_sound("punch4", "wav");
	// this.load_sound("scratch0", "wav");
	// this.load_sound("dooropen", "wav");
	// this.load_sound("doorclose", "wav");
	// this.load_sound("miss", "wav");
	// this.load_sound("equip", "wav");
	// this.load_sound("humanfemaledeath", "wav");
	// this.load_sound("humanmaledeath", "wav");
	// this.load_sound("monsterdeath", "wav");
	// this.load_sound("bigmonsterdeath", "wav");
	// this.load_sound("blast", "wav");
	// this.load_sound("poison", "wav");
	// this.load_sound("gulp", "wav");

	// this.load_sound("ambient1", "ogg");
	// this.load_sound("protoliththeme", "ogg");

};

SoundCache.prototype.has_sound = function( name ){
	if( this.sounds[name] ){
		return true;
	}
	return false;
};

SoundCache.prototype.load_sound = function(name, ext){
	var captain = this;
	this.totalsounds++;
	this.sounds[name] = new buzz.sound("sound/sounds/"+name+"."+ext);
	this.sounds[name].bind("canplay", function() {
		captain.numloadedsounds++;
	});
};

SoundCache.prototype.play_sound = function(name){
	if( !this.has_sound( name ) ){
		return;
	}

	if( this.game.options.enableSounds ){
		this.sounds[name].setPercent(0);
		this.sounds[name].play();
	}
};

SoundCache.prototype.loop_sound = function(name){
	if( !this.has_sound( name ) ){
		return;
	}

	if( this.game.options.enableSounds && this.game.options.enableMusic ){
		this.sounds[name].loop().play().fadeIn();
	}
};

SoundCache.prototype.stop_loop = function(name){
	if( !this.has_sound( name ) ){
		return;
	}

	var captain = this;
	this.sounds[name].unloop().fadeOut(5000, function(){
		captain.sounds[name].stop();
	});
};

SoundCache.prototype.disable_music = function(){
	this.disableMusic = true;
};

SoundCache.prototype.enable_music = function(){
	this.disableMusic = false;
};

SoundCache.prototype.disable = function(){
	this.isEnabled = false;

	this.stop_all();
};

SoundCache.prototype.enable = function(){
	this.isEnabled = true;
};

SoundCache.prototype.stop_all = function(){
	for( var i in this.sounds ){
		this.sounds[i].stop();
	}
};

SoundCache.prototype.mute_all = function(){
	for( var i in this.sounds ){
		this.sounds[i].mute();
	}
};

SoundCache.prototype.unmute_all = function(){
	for( var i in this.sounds ){
		this.sounds[i].unmute();
	}
};

SoundCache.prototype.is_ready = function(){
	if( this.totalsounds === this.numloadedsounds && this.totalsounds !== 0 ){
		return {is_ready:true, max:this.totalsounds, curr:this.numloadedsounds};
	} else {
		return {is_ready:false, max:this.totalsounds, curr:this.numloadedsounds};
	}
};

})();