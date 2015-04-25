/* jshint browser: true */
/* global window */

/* jshint ignore:start */
var oref;
window.keybutton = function(ev){
    oref.handleKeyDown(ev);
};

window.keybuttonup = function(ev){
    oref.handleKeyUp(ev);
};
/* jshint ignore:end */

(function(){
"use strict";
var app = window.app = {
	cutscenes:{},
	display:{},
	game:{},
	maps:{},
	save:{},
	sound:{},
	ui:{
		overlays:{},
		modals:{},
	},
	world:{
		actor:{},
		mode:{},
	}
};

Function.prototype.inherits = function( parentClassOrObject ){ 
	if( parentClassOrObject.constructor == Function ){ 
		//Normal Inheritance 
		/* jshint ignore:start */
		this.prototype = new parentClassOrObject;
		/* jshint ignore:end */
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} else { 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	} 
	return this;
} ;

app.extend = function(superType) {
    var IntermediateConstructor = function() {};
    IntermediateConstructor.prototype = superType.prototype;
    return new IntermediateConstructor();
};

app.random_id = function(len){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghigklmnopqrstufwxyz1234567890";
    for( var i = 0; i < len; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

app.normalize = function(x, A, B, C, D){
    return C + (x-A)*(D-C)/(B-A);
};

app.inArr = function(x, arr){
    for( var i in arr ){
        if( x == arr[i]){
            return true;
        }
    }
    return false;
};

})();