/* jshint node: true */
"use strict";

var fs = require("fs");
var shell = require('child_process');

var read_file = function(){
	fs.readFile("./index.html", on_read_file);
};

var on_read_file = function(err, data){
	if( err ){
		console.error("ERROR "+err);
		return;
	}

	parse_file( data.toString() );
};

var parse_file = function( file ){
	var lines = file.split("\n");
	var scriptlinestart = '<script type="text/javascript" src="';
	var scriptlineend = '"></script>';

	var _is_script = function(line){
		return line.search( scriptlinestart ) === 0;
	};

	var _get_url = function(line){
		if( _is_script(line) ){
			return line.slice( 
				scriptlinestart.length, line.length - scriptlineend.length - 1
			);
		} else {
			return "";
		}
	};

	var urls = [];
	for( var i in lines ){
		urls.push( _get_url( lines[i] ) );
	}

	jshintfiles( urls.filter( function(url){ return url.length > 0; } ) );
};

var jshintfiles = function( urls ){
	var urls = urls.slice(0);
	var ctr = 0;

	var _nextfile = function(){
		var url = urls.shift();
		if( url ){
			ctr++;
			_jshintfile( url );
		} else {
			clearTimeout( timeoutid );
			console.log("Done linting", ctr, "files.");
		}
	};

	var _jshintfile = function(url){
		console.log( "node ..\\node_modules\\jshint\\bin\\jshint "+url );
		shell.exec(
			"node ..\\node_modules\\jshint\\bin\\jshint "+url, {
				cwd: __dirname
			},
			_onjshintfile
		);
	};

	var _onjshintfile = function(error, stdout, stderr){
	    console.log(stdout);
	    if( stderr ){
	    	console.log(stderr);
	    }
	    if( error !== null ){
	    	console.log('exec error: ' + error);
	    }
	    _nextfile();
	};

	_nextfile();
};

var timeoutid = setTimeout(function(){}, 10000);
read_file();

var ctr = 0;
while( true ){
	ctr ++;
	if( ctr === 100000 ){

		
		break;
	}
}