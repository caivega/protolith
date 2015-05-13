/* jshint browser: true */

(function(){
"use strict";

window.app = {};
window.app.view = {};
window.app.display = {};
window.app.world = {};

window.app.extend = function(superType) {
    var IntermediateConstructor = function() {};
    IntermediateConstructor.prototype = superType.prototype;
    return new IntermediateConstructor();
};

window.app.normalize = function(x, A, B, C, D){
    return C + (x-A)*(D-C)/(B-A);
};

})();