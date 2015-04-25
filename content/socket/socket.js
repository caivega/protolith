//socket.js by Benjamin Brown

var socket;

function createSocket(host){
	if(window.WebSocket)
		return new WebSocket(host);
	else if(window.MozWebSocket)
		return new MozWebSocket(host);
}

function start_socket(){
    var host = "ws://localhost:12345/";
    try{
        socket = createSocket(host);
        log('WebSocket - status '+socket.readyState, 'debug');
        socket.onopen    = function(msg){ 
            log("Welcome - status "+this.readyState, 'debug'); 
            cycle_ping();
        };
        socket.onmessage = function(msg){ 
            //log("Received ("+msg.data.length+" bytes): " + msg.data); 
            msg_handler(msg.data);
            //end_ping();
        };
        socket.onclose   = function(msg){ 
            log("Disconnected - status "+this.readyState, 'debug'); 
        };
    }
    catch(ex){ log(ex); } 
}

function send(msg){
    obj=JSON.stringify(msg);
    socket.send(obj);
}

function quit(){
    log("Goodbye!");
    socket.close();
    socket=null;
}

function msg_handler(msg){
    obj = jQuery.parseJSON( msg );

    key = obj["key"];
    switch(key){
        case "new_player":
            log("User: "+obj["login"]+" has logged in!", "debug");
            break;
        default: 
            end_ping();
    }
}

function login(){
	var obj = {new_user:userLogin, comp:company, url:top_url};
	send_to_server(obj);			
}