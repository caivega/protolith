//chat.js by Benjamin Brown

chat = new chat();
function chat(){
	var magus = this;

	magus.init = init;
	magus.all_chat = all_chat;
	magus.toggle_chat = toggle_chat;
	magus.toggle_debug = toggle_debug;

	//chat ui elements
	magus.ui_actxt;//ac = all chat
	magus.ui_aclog;

	function init(){
		events();
	}

	//private for initialization only
	function events(){
		$("#all_chat_text").keypress(function(e){
			if(e.which == 13){
				all_chat( $(this).val())
				$(this).val("");
			}
		})		
	}

	function all_chat(msg){
		var div = "<b>"+ userLogin+"</b>: "+msg;
		log( div, "all_chat");
	}

	function toggle_chat(){
		var chbox = $("#ac_container");

		if( chbox.is(":visible") ){
			chbox.hide();
		} else {
			chbox.show();
		}
	}

	function toggle_debug(){
		var chbox = $("#debug_container");

		if( chbox.is(":visible") ){
			chbox.hide();
		} else {
			chbox.show();
		}
	}
}