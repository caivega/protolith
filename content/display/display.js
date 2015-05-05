/* jshint browser: true */
/* global app, console, window */

(function(){
"use strict";

var Sprite = function(img_name, X, Y, W, H){
    this.x = X;
    this.y = Y;
    this.w = W;
    this.h = H;
    this.name = img_name;
};

var jsonjoin = function( obj, val ){
    var ret = "";
    for( var i in obj ){
        ret += obj[i]+val;
    }
    return ret.slice( 0, ret.length - val.length );
};

var Display = app.display.Display = function(canvas_name){

    this.bxSize = 252;
    this.bySize = 288;
    this.boffset = 110;
    this.left = this.boffset;
    this.right = this.left + this.bxSize;

    this.dimx = 472;
    this.dimy = 288;

    this.id = canvas_name;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.dimx;
    this.canvas.height = this.dimy; 
    this.canvas.retinaResolutionEnabled = false;
    this.canvas.id = this.id;
    this.context = this.canvas.getContext("2d");
    this.canvas.onselectstart = function () { return false; };
    var wrap = document.getElementById("canvas_wrapper");
    if( wrap ){
        wrap.appendChild(this.canvas);
    } else {
        document.body.appendChild( this.canvas );
    }

    this.OnResizeCalled = function(){
        this.canvas.width = 800//window.innerWidth;
        this.canvas.height = 600//window.innerHeight;
        this.dimx = 800//window.innerWidth;
        this.dimy = 600//window.innerHeight;

        for( var i in this.textimages ){
            delete this.sprites[ this.textimages[i] ];
            delete this.images[ this.textimages[i] ];
        }

        this.textimages = [];

        if( window.oref ){
            window.oref.remake_ui();
        } 
    }.bind(this);

    this.OnResizeCalled();
    window.addEventListener("resize", this.OnResizeCalled, false);

    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0px";
    this.canvas.style.left = "0px";

    this.images = {};
    this.textimages = [];

    this.sprites = {};
    this.num_sprites = 0;
    this.loaded_sprites = 0;

    this.spritesheets = {};
    this.num_spritesheets = 0;
    this.loaded_spritesheets = 0;

    this.anims = [
	    "male_lancer", 
	    "male_archer", 
	    "male_legionaire", 
	    "female_legionaire", 
	    "female_archer", 
	    "female_lancer", 
	    "female_magician", 
	    "male_magician"
    ];

    this.init();
};

Display.prototype.resize_canvas = function(x, y){
    this.canvas.width = x;
    this.canvas.height = y;
};

Display.prototype.get_dims = function(){
    var canv_wid = parseInt(this.canvas.width);
    var canv_hgt = parseInt(this.canvas.height);
    var css_wid = parseFloat(this.canvas.style.width);
    var css_hgt = parseFloat(this.canvas.style.height);

    if( isNaN(css_wid) ){ css_wid = canv_wid; }
    if( isNaN(css_hgt) ){ css_hgt = canv_hgt; }

    return {canv_wid:canv_wid, canv_hgt:canv_hgt, css_wid:css_wid, css_hgt:css_hgt};
};

Display.prototype.load_terrain = function(num_tiles){
    var x = 0;
    var y = 0;

    for( var i = 0; i < num_tiles; i++){
        this.load_sprite_from_spritesheet("tile_"+(i+1), "terrain1", x, y, 28, 32);
        x++;
        if( x == 11 ){
            x = 0;
            y++;
        }
    }

    this.load_sprite_from_spritesheet("tile_"+(i+1), "terrain1", x, y, 28, 32);
};

Display.prototype.is_ready = function(){

    if( this.num_sprites == this.loaded_sprites && 
        this.num_spritesheets == this.loaded_spritesheets ){
        
        if( this.avg_loaded ){
            return {
                is_ready:true, 
                max: this.loaded_sprites+this.num_spritesheets, 
                curr: this.loaded_sprites+this.loaded_spritesheets};
        } else {
            for( var i in this.sprites ){
                var spr = this.sprites[i];
                this.sprites[i].avg = this.calc_avg_rgb( 
                    this.images[spr.name], spr.x, spr.y, spr.w, spr.h 
                    );
            }
            this.avg_loaded = true;
            return {
                is_ready:true, 
                max: this.loaded_sprites+this.num_spritesheets, 
                curr: this.loaded_sprites+this.loaded_spritesheets
            };
        }
    } else {
        return {
            is_ready:false, 
            max: this.loaded_sprites+this.num_spritesheets, 
            curr: this.loaded_sprites+this.loaded_spritesheets
        };
    }
};

//Clear the screen a color 'color'
Display.prototype.clear = function(color){
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = color;
    this.context.lineWidth = 0;        
    this.context.fill();        
};

Display.prototype.clear_screen = function(){
    this.context.clearRect(0, 0, this.dimx, this.dimy);
};

Display.prototype.clear_area = function(x, y, w, h){
    this.context.clearRect(x, y, w, h);
};

Display.prototype.draw_rect_sprite = function( x, y, w, h, col ){
	var sprite = "";
	if( col === app.ui.CleanUIElem.prototype.VERYDARKCOLOR ){
		sprite = "cleanverydarkcolor";
	} else if( col === app.ui.CleanUIElem.prototype.NEUTRALCOLOR )  {
		sprite = "cleanneutralcolor";
	} else if( col === app.ui.CleanUIElem.prototype.LIGHTCOLOR )  {
		sprite = "cleanlightcolor";
	} else if( col === "lightneutral" )  {
		sprite = "cleangradientlightneutral";
	} else if( col === app.ui.CleanUIElem.prototype.SELECTEDCOLOR )  {
		sprite = "cleanselectedcolor";
	} else {
		return;
	}

	this.draw_sprite_scaled( sprite, x, y, w, h );
};

//Draw a rectangle with width and height w, h at position (x,y)
Display.prototype.draw = function(x, y, w, h, col){
    if( col ) {
        this.context.fillStyle = col;
    } else {
        this.context.fillStyle = "black";
    }
    this.context.lineWidth = 1;        
    this.context.fillRect(x,y,w,h);   
};

Display.prototype.draw_rect_params = function( params ){
    this.context.beginPath();
    this.context.rect( params.x, params.y, params.width, params.height );
    this.context.fillStyle = params.color || "black";
    this.context.fill();
    if( params.bordercolor || params.borderwidth ){
        this.context.lineWidth = params.borderwidth || 2;
        this.context.strokeStyle = params.bordercolor || "black";
        this.context.stroke();
    }
};

Display.prototype.draw_horiz_gradient = function(x, y, w, h, col1, col2){
    var yval = y + y/2;
    var grd = this.context.createLinearGradient(x, yval, x + w, yval);
    grd.addColorStop(0, col1);
    grd.addColorStop(1, col2);
    this.context.fillStyle = grd;
    this.context.fillRect( x, y, w, h );
};

Display.prototype.draw_line = function(x1, y1, x2, y2, wid, color){
    if( wid ){
        this.context.lineWidth = 1; 
    } else {
        this.context.lineWidth = 1;
    }

    if( color ){
        this.context.strokeStyle=color;
    } else {
        this.context.strokeStyle='#111111';
    }

    this.context.lineWidth = 1;
    this.context.beginPath();
    this.context.moveTo((x1),(y1));
    this.context.lineTo((x2),(y2)); 
    this.context.stroke();       
};

Display.prototype.load_picture = function(name, url, w, h){
    this.num_sprites++;
    var imageObj = new Image();
    imageObj.onload = function() {
        this.loaded_sprites++;
        var s;
        if( w !== undefined ){
            s = new Sprite(name, 0, 0, w, h);
        }else{
            s = new Sprite(name, 0, 0, imageObj.width, imageObj.height);
        }
        this.sprites[name] = s;
        this.images[name] = imageObj;
    }.bind(this);   
    imageObj.src = url; 
};

Display.prototype.load_dataurl = function( name, canv, w, h ){
    this.textimages.push( name );
    var imageObj = canv;

    var s;
    if( w !== undefined ){
        s = new Sprite(name, 0, 0, w, h);
    }else{
        s = new Sprite(name, 0, 0, imageObj.width, imageObj.height);
    }

    this.sprites[name] = s;
    this.images[name] = imageObj;
};

Display.prototype.load_spritesheet = function(name, url){
    this.num_spritesheets++;
    var imageObj = new Image();
    imageObj.onload = function() {
        this.loaded_spritesheets++;
        this.images[name] = imageObj;
    }.bind(this);   
    imageObj.src = url; 
};

Display.prototype.load_sprite_from_spritesheet = function(name, ss_name, x, y, w, h){
    var spr = new Sprite(ss_name, x*w, y*h, w, h);
    this.sprites[name] = spr;            
};      

Display.prototype.load_actor_sprites = function(name, ss_name, x, y, w, h){
    var app = "";
    var yoff = 0;
    this.load_sprite_from_spritesheet(name, ss_name, x, y, w, h);
    for( var i = 0; i < 4; i++){
        switch(i){
            case 0: app = "dr"; break;
            case 1: app = "dl"; break;
            case 2: app = "ar"; break;
            case 3: app = "al"; break;
        }
        if( x+i > 10 ){
            yoff=1;
            x = -i;
        }
        this.load_sprite_from_spritesheet(name+"_"+app, ss_name, x+i, y+yoff, w, h);
    }
};

Display.prototype.load_actor_anim_sprites = function(name, ss_name, x, y, w, h){
    var yoff = 0;
    var postfixes = ["r0", "r1", "l0", "l1", "d0", "d1", "u0", "u1", "ra0", "ra1", "ra2",
                    "la0", "la1", "la2", "da0", "da1", "da2", "ua0", "ua1", "ua2",
                    "lvl0","lvl1","lvl2","lvl3"];
    for( var i = 0; i < postfixes.length;  ++i){
        var postfix = postfixes[i];
        if( x+i > 10 ){
            yoff++;
            x = -i;
        }

        this.load_sprite_from_spritesheet(name+"_"+postfix, ss_name, x+i, y+yoff, w, h);
        if( postfix == "d0"){
            this.load_sprite_from_spritesheet(name, ss_name, x+i, y+yoff, w, h);
        }
    }
};

Display.prototype.load_overlay_sprites = function(name, ss_name, x, y, w, h){
    var yoff = 0;
    this.load_sprite_from_spritesheet(name, ss_name, x, y, w, h);

    for( var i = 0; i < 4; i++){
        var app = "";
        switch(i){
            case 0: app = "u"; break;
            case 1: app = "r"; break;
            case 2: app = "d"; break;
            case 3: app = "l"; break;
        }
        if( x+i > 10 ){
            yoff=1;
            x = -i;
        }
        this.load_sprite_from_spritesheet(name+"_"+app, ss_name, x+i, y+yoff, w, h);
    }
};

Display.prototype.load_animoverlay_sprites = function(name, ss_name, x, y, w, h){
    this.load_sprite_from_spritesheet(name, ss_name, x, y, w, h);
    for( var i = 0; i < 9; i++){
        this.load_sprite_from_spritesheet(name+i, ss_name, x+i, y, w, h);
    }
};

Display.prototype.load_proj_sprites = function(name, ss_name, x, y, w, h){
    for( var i = 0; i < 4; i++ ){
        this.load_sprite_from_spritesheet(name+i, ss_name, x+i, y, w, h);
    }        
};

Display.prototype.is_sprite_animated = function(name){
	return app.inArr(name, this.anims);
};

Display.prototype.draw_sprite = function( name, x, y ){
    var spr;
    var img;

    spr = this.sprites[name];
    if( spr ) {
        img = this.images[spr.name];
    } else {
        console.error("ERROR sprite "+name+" has not been loaded!");
        return;
    }

    this.context.drawImage(img,spr.x,spr.y,spr.w,spr.h,(x),(y),spr.w,spr.h);
};

Display.prototype.draw_sprite_scaled = function( name, x, y, w, h ){
    var spr;
    var img;

    spr = this.sprites[name];
    if( spr ){
        img = this.images[spr.name];
    } else {
        console.log("ERROR sprite "+name);
        return;
    }
         
    this.context.drawImage(img, spr.x,spr.y,spr.w,spr.h,(x), (y), w, h); 
};

Display.prototype.draw_sprite_scaled_centered = function(name, x, y, w, h){
    this.draw_sprite_scaled( name, (x)-w/2,(y)-h/2, w, h );  
};

Display.prototype.draw_sprite_centered = function(name, x, y){
    var spr = this.sprites[name];
    if( !spr ){
        console.log("ERROR sprite "+name);
        return;
    }
    var w = spr.w;
    var h = spr.h;
    this.draw_sprite( name, (x)-w/2,(y)-h/2 );  
};

Display.prototype.calc_avg_rgb = function(imgEl, x, y, w, h) {
    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = h;
    width = canvas.width = w;

    context.drawImage(imgEl, x, y, w, h, 0, 0, w, h);
    data = context.getImageData(0, 0, width, height);
    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;
};

Display.prototype.get_text_pos = function(text, x, y, maxWidth, lineHeight, font){
    var words = text.split(' ');
    var line = '';

    this.context.textAlign = 'left';

    if( font !== undefined ){
        this.context.font  = font;
    } else {
        this.context.font = "normal 12px Georgia";
    }
    this.context.fillStyle = "#121212";

    var origx = x;

    var tmpx = x;
    var tmpy = y;

    var ret = [];

    var lines = 1;
    for(var n = 0; n < words.length; n++) {
        tmpy = y;
        var testLine = line + words[n] + ' ';
        var metrics = this.context.measureText(testLine);
        var testWidth = metrics.width;

        if(testWidth > maxWidth) {
            line = words[n] + ' ';
            y += lineHeight;
            lines++;
            tmpy = y;
            tmpx = origx;

            testLine = line;
            metrics = this.context.measureText(testLine);
            testWidth = metrics.width;            
        } else {
           line = testLine;
        }

        ret.push({word:words[n], x:tmpx, y:tmpy});  
        tmpx = origx + testWidth - 3;
      
    }
    return ret;
};

Display.prototype.set_context_params = function( context, params ){
    var align = params.align || "left";
    context.textAlign = align;
    var font = params.font || "Georgia";
    var size = params.size || "12";
    var style = params.style || "normal";
    context.font = style+" "+size+"px "+font;   
    var shadowcolor = params.shadowcolor || false;
    var shadowthickness = params.shadowthickness || 2;
    var color = params.color || "white";

    if( shadowcolor ){
        context.strokeStyle  = shadowcolor;
        context.lineWidth    = shadowthickness;
    } else {
        context.shadowBlur = 0;
        context.lineWidth = 1;
    }
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    context.fillStyle = color;
};

Display.prototype.wrap_text = function(text, x, y, params) {
    var words = text.split(' ');
    var line = ''; 

    this.set_context_params( this.context, params );

    var maxWidth = params.maxwidth || 100;
    var lineHeight = params.lineheight || 15;

    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = this.context.measureText(testLine);
        var testWidth = metrics.width;
        if(testWidth > maxWidth) {
            this.context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
           line = testLine;
        }
    }
    this.context.fillText(line, x, y);
};

Display.prototype.draw_text_to_context = function( id, text, params ){
    var canvas = document.createElement('canvas');
    var context = canvas.getContext("2d");
    this.set_context_params( context, params );
    context.textAlign = "left";
    context.textBaseline = "middle";
    var metrics = context.measureText(text);
    canvas.width = metrics.width + (params.size || 12);
    canvas.height = (params.size || 12 )*1.3;
    this.set_context_params( context, params );
    context.textAlign = "left";
    context.textBaseline = "middle";

    if( params.shadowcolor ){
        context.strokeText(text, 0, canvas.height/2);
    }

    context.fillText(text, 0, canvas.height/2);
    this.load_dataurl( id, canvas, canvas.width, canvas.height );
};

Display.prototype.draw_text_params = function( text, x, y, params ){
    var id = text + jsonjoin( params, "" );
    if( this.sprites[id] ){
        if( params.align === "left" ){
            this.draw_sprite( id, x, y );
        } else {
            this.draw_sprite_centered( id, x, y );
        }
    } else if( this.sprites[id] !== false ) {
        this.draw_text_to_context( id, text, params );
        this.draw_text_params( text, x, y, params );
    }
};

Display.prototype.init = function(){

    this.avg_loaded = false;

    this.load_picture("inner_border","display/images/inner_border.png", 252, 288);

    //UI Backgrounds
    this.load_picture("pclistpanebackground","display/images/ui/pclistpanebackground.png", 110, 175);
    this.load_picture("lcontrolsbackground","display/images/ui/lcontrolspane.png", 110, 113);
    this.load_picture("minimap","display/images/ui/minimap.png", 110, 113);
    this.load_picture("InventoryPane","display/images/ui/InventoryPanePlain.png", 252, 288);
    this.load_picture("InventoryPanePlain","display/images/ui/InventoryPanePlain.png", 252, 288);
    this.load_picture("DarkMagicPane","display/images/ui/DarkMagicPanePlain.png", 252, 288);
    this.load_picture("LightMagicPane","display/images/ui/LightMagicPanePlain.png", 252, 288);
    this.load_picture("SavePane","display/images/ui/SavePanePlain.png", 252, 288);
    this.load_picture("LoadPane","display/images/ui/LoadPanePlain.png", 252, 288);
    this.load_picture("PickUpPane","display/images/ui/PickUpPanePlain.png", 252, 288);
    this.load_picture("DialoguePane","display/images/ui/dg.png", 252, 288);
    this.load_picture("CreatePartyPane","display/images/ui/createParty.png", 472, 288);
    this.load_picture("MenuPane","display/images/ui/menu4.png", 472, 288);
    this.load_picture("BuyPane","display/images/ui/BuyPane.png", 252, 288);
    this.load_picture("EmptyPane","display/images/ui/menubackground.png", 252, 288);
    this.load_picture("LavaPane","display/images/ui/defaultbg.png", 252, 288);
    this.load_picture("MiniLavaPane","display/images/ui/minidefaultbg.png", 163, 216);

    this.load_picture("statDEF","display/images/ui/statDEF.png", 362, 168);
    this.load_picture("statPOW","display/images/ui/statPOW.png", 362, 168);
    this.load_picture("statEVA","display/images/ui/statEVA.png", 362, 168);
    this.load_picture("statSPD","display/images/ui/statSPD.png", 362, 168);
    this.load_picture("statCON","display/images/ui/statCON.png", 362, 168);
    this.load_picture("statACC","display/images/ui/statACC.png", 362, 168);

    this.load_picture("ProtolithPane","display/images/ui/Protolithlogo2.png", 800, 530);

    this.load_picture("DisabledUI","display/images/ui/disabled_ui_overlay.png", 110, 173);
    this.load_picture("PCStatOver","display/images/ui/pcstatover.png", 76, 140);
    this.load_picture("OnWhoButton","display/images/button/onWhoButton.png", 35, 24);

    this.load_spritesheet("dirbuttons","display/images/button/dirbuttons.png");
    this.load_sprite_from_spritesheet("dleft","dirbuttons", 0, 0, 35, 24);
    this.load_sprite_from_spritesheet("ddown","dirbuttons", 1, 0, 35, 24);
    this.load_sprite_from_spritesheet("dright","dirbuttons", 2, 0, 35, 24);
    this.load_sprite_from_spritesheet("dup","dirbuttons", 3, 0, 35, 24);
    this.load_sprite_from_spritesheet("dupright","dirbuttons", 4, 0, 35, 24);
    this.load_sprite_from_spritesheet("dupleft","dirbuttons", 5, 0, 35, 24);
    this.load_sprite_from_spritesheet("ddownleft","dirbuttons", 6, 0, 35, 24);
    this.load_sprite_from_spritesheet("ddownright","dirbuttons", 7, 0, 35, 24);

    //Button Controls
    this.load_picture("button-left","display/images/button/button-left.png", 38, 39);
    this.load_picture("button-right","display/images/button/button-right.png", 38, 39);
    this.load_picture("button-up","display/images/button/button-up.png", 38, 39);
    this.load_picture("button-down","display/images/button/button-down.png", 38, 39);
    this.load_picture("button-back","display/images/button/button-back.png", 38, 39);
    this.load_picture("button-downright","display/images/button/button-downright.png", 25, 25);
    this.load_picture("button-upright","display/images/button/button-upright.png", 25, 25);
    this.load_picture("button-downleft","display/images/button/button-downleft.png", 25, 25);
    this.load_picture("button-upleft","display/images/button/button-upleft.png", 25, 25);

    //class description images
    this.load_picture("classLegionaire","display/images/LegionaireClass.png", 50, 50);
    this.load_picture("classArcher","display/images/ArcherClass.png", 50, 50);
    this.load_picture("classMagician","display/images/MagicianClass.png", 50, 50);
    this.load_picture("classLancer","display/images/LancerClass.png", 50, 50);

    //gender description icons
    this.load_picture("iconMale","display/images/MaleIcon.png", 50, 50);
    this.load_picture("iconFemale","display/images/FemaleIcon.png", 50, 50);

    //this.load_picture("lcontrolsbackground","display/images/controlsall.png", 110, 113);

    this.load_picture("box","display/images/box.png", 28, 32);

    this.load_spritesheet("portraits","display/images/portraits.png");
    this.load_sprite_from_spritesheet("port_exclaim","portraits", 0, 0, 63, 63);
    this.load_sprite_from_spritesheet("port_girl","portraits", 1, 0, 63, 63);
    this.load_sprite_from_spritesheet("port_soldier","portraits", 2, 0, 63, 63);
    this.load_sprite_from_spritesheet("port_farmer","portraits", 3, 0, 63, 63);
    this.load_sprite_from_spritesheet("port_money","portraits", 4, 0, 63, 63);
    this.load_sprite_from_spritesheet("port_potion","portraits", 0, 1, 63, 63);
    this.load_sprite_from_spritesheet("port_bartender","portraits", 1, 1, 63, 63);
    this.load_sprite_from_spritesheet("port_hooded","portraits", 2, 1, 63, 63);
    this.load_sprite_from_spritesheet("port_tzit","portraits", 3, 1, 63, 63);
    this.load_sprite_from_spritesheet("port_priest","portraits", 4, 1, 63, 63);
    this.load_sprite_from_spritesheet("port_default","portraits", 0, 2, 63, 63);
    this.load_sprite_from_spritesheet("port_locked","portraits", 1, 2, 63, 63);
    this.load_sprite_from_spritesheet("port_sil","portraits", 2, 2, 63, 63);

    //Node icon buttons
    this.load_spritesheet("node_icons","display/images/node_icons.png");
    this.load_sprite_from_spritesheet("node_ChangeMap", "node_icons", 0, 0, 8, 8);
    this.load_sprite_from_spritesheet("node_SecretPassage", "node_icons", 1, 0, 8, 8);
    this.load_sprite_from_spritesheet("node_LockDoor", "node_icons", 2, 0, 8, 8);
    this.load_sprite_from_spritesheet("node_ShowNPC", "node_icons", 3, 0, 8, 8);
    this.load_sprite_from_spritesheet("node_TeleportNPC", "node_icons", 4, 0, 8, 8);
    this.load_sprite_from_spritesheet("node_TeleportTo", "node_icons", 5, 0, 8, 8);
    this.load_sprite_from_spritesheet("node_ChangeTile", "node_icons", 6, 0, 8, 8);
    this.load_sprite_from_spritesheet("node_StuffDone", "node_icons", 7, 0, 8, 8);
    this.load_sprite_from_spritesheet("node_HasItem", "node_icons", 8, 0, 8, 8);
    this.load_sprite_from_spritesheet("node_PlaySound", "node_icons", 9, 0, 8, 8);
    this.load_sprite_from_spritesheet("node_SingleNotification", "node_icons", 10, 0, 8, 8);
    this.load_sprite_from_spritesheet("node_DoubleNotification", "node_icons", 11, 0, 8, 8);
    this.load_sprite_from_spritesheet("node_DisableNode", "node_icons", 13, 0, 8, 8);

    //Inventory Buttons
    this.load_spritesheet("inventory_buttons","display/images/button/InventoryButtons.png");
    this.load_sprite_from_spritesheet("InvInformation", "inventory_buttons", 0, 0, 24, 18);
    this.load_sprite_from_spritesheet("InvDrop", "inventory_buttons", 1, 0, 24, 18);
    this.load_sprite_from_spritesheet("InvUse", "inventory_buttons", 2, 0, 24, 18);
    this.load_sprite_from_spritesheet("InvClose", "inventory_buttons", 3, 0, 24, 18);
    this.load_sprite_from_spritesheet("InvGive", "inventory_buttons", 4, 0, 24, 18);

    this.load_picture("CharacterButton","display/images/button/CharButton.png", 80, 32);
    this.load_picture("SingleNotif","display/images/ui/SingleNotif.png", 360, 247);

    this.load_spritesheet("StandardButtonSS","display/images/button/standard-button.png");
    this.load_sprite_from_spritesheet("StandardButtonUP", "StandardButtonSS", 0, 0, 88, 34);
    this.load_sprite_from_spritesheet("StandardButtonDOWN", "StandardButtonSS", 1, 0, 88, 34);
    this.load_sprite_from_spritesheet("StandardButton2UP", "StandardButtonSS", 2, 0, 112, 34);
    this.load_sprite_from_spritesheet("StandardButton2DOWN", "StandardButtonSS", 3, 0, 112, 34);

    this.load_spritesheet("ToggleButton","display/images/button/button-toggle.png");
    this.load_sprite_from_spritesheet("ToggleOff", "ToggleButton", 0, 0, 64, 32);
    this.load_sprite_from_spritesheet("ToggleOn", "ToggleButton", 1, 0, 64, 32);

    //Magic Screen Tabs
    this.load_spritesheet("mtabsUP","display/images/button/MagicTabUp.png");
    this.load_sprite_from_spritesheet("mtabsIUP", "mtabsUP", 0, 0, 42, 32);
    this.load_sprite_from_spritesheet("mtabsIIUP", "mtabsUP", 1, 0, 42, 32);
    this.load_sprite_from_spritesheet("mtabsIIIUP", "mtabsUP", 2, 0, 42, 32);
    this.load_sprite_from_spritesheet("mtabsIVUP", "mtabsUP", 3, 0, 42, 32);
    this.load_sprite_from_spritesheet("mtabsVUP", "mtabsUP", 4, 0, 42, 32);
    this.load_sprite_from_spritesheet("mtabsVIUP", "mtabsUP", 5, 0, 42, 32);
    this.load_spritesheet("mtabsDN","display/images/button/MagicTabDown.png");
    this.load_sprite_from_spritesheet("mtabsIDN", "mtabsDN", 0, 0, 42, 32);
    this.load_sprite_from_spritesheet("mtabsIIDN", "mtabsDN", 1, 0, 42, 32);
    this.load_sprite_from_spritesheet("mtabsIIIDN", "mtabsDN", 2, 0, 42, 32);
    this.load_sprite_from_spritesheet("mtabsIVDn", "mtabsDN", 3, 0, 42, 32);
    this.load_sprite_from_spritesheet("mtabsVDN", "mtabsDN", 4, 0, 42, 32);
    this.load_sprite_from_spritesheet("mtabsVIDN", "mtabsDN", 5, 0, 42, 32);

    //Fundamental Spell Icons
    this.load_spritesheet("spicons","display/images/button/spellicons.png");
    this.load_sprite_from_spritesheet("lspell0", "spicons", 0, 0, 48, 48);
    this.load_sprite_from_spritesheet("lspell1", "spicons", 1, 0, 48, 48);
    this.load_sprite_from_spritesheet("lspell2", "spicons", 2, 0, 48, 48);
    this.load_sprite_from_spritesheet("lspell3", "spicons", 3, 0, 48, 48);
    this.load_sprite_from_spritesheet("lspell4", "spicons", 4, 0, 48, 48);
    this.load_sprite_from_spritesheet("lspell5", "spicons", 5, 0, 48, 48);
    this.load_sprite_from_spritesheet("lspell6", "spicons", 0, 1, 48, 48);
    this.load_sprite_from_spritesheet("lspell7", "spicons", 1, 1, 48, 48);
    this.load_sprite_from_spritesheet("lspell8", "spicons", 2, 1, 48, 48);
    this.load_sprite_from_spritesheet("lspell9", "spicons", 3, 1, 48, 48);
    this.load_sprite_from_spritesheet("dspell0", "spicons", 4, 1, 48, 48);
    this.load_sprite_from_spritesheet("dspell1", "spicons", 5, 1, 48, 48);
    this.load_sprite_from_spritesheet("dspell2", "spicons", 0, 2, 48, 48);
    this.load_sprite_from_spritesheet("dspell3", "spicons", 1, 2, 48, 48);
    this.load_sprite_from_spritesheet("dspell4", "spicons", 2, 2, 48, 48);
    this.load_sprite_from_spritesheet("dspell5", "spicons", 3, 2, 48, 48);
    this.load_sprite_from_spritesheet("dspell6", "spicons", 4, 2, 48, 48);
    this.load_sprite_from_spritesheet("dspell7", "spicons", 5, 2, 48, 48);
    this.load_sprite_from_spritesheet("dspell8", "spicons", 0, 3, 48, 48);
    this.load_sprite_from_spritesheet("dspell9", "spicons", 1, 3, 48, 48); 
    this.load_sprite_from_spritesheet("spshaded", "spicons", 2, 3, 48, 48);   
    this.load_sprite_from_spritesheet("spselected", "spicons", 3, 3, 48, 48);      

    //First terrain images
    this.load_spritesheet("terrain1","display/images/Terrain1.png");
    this.load_terrain(121); 

    //Right side upper ui buttons
    this.load_spritesheet("ui_box_buttons","display/images/button/side_buttons.png");
    this.load_sprite_from_spritesheet("BDarkMagicU", "ui_box_buttons", 0, 0, 50, 50);
    this.load_sprite_from_spritesheet("BDarkMagicD", "ui_box_buttons", 1, 0, 50, 50);    
    this.load_sprite_from_spritesheet("BLightMagicU", "ui_box_buttons", 2, 0, 50, 50);
    this.load_sprite_from_spritesheet("BLightMagicD", "ui_box_buttons", 3, 0, 50, 50);    
    this.load_sprite_from_spritesheet("BTalkU", "ui_box_buttons", 4, 0, 50, 50);
    this.load_sprite_from_spritesheet("BTalkD", "ui_box_buttons", 5, 0, 50, 50); 
    this.load_sprite_from_spritesheet("BLookU", "ui_box_buttons", 0, 1, 50, 50);
    this.load_sprite_from_spritesheet("BLookD", "ui_box_buttons", 1, 1, 50, 50);
    this.load_sprite_from_spritesheet("BInvenU", "ui_box_buttons", 2, 1, 50, 50);
    this.load_sprite_from_spritesheet("BInvenD", "ui_box_buttons", 3, 1, 50, 50);      
    this.load_sprite_from_spritesheet("BPartyManU", "ui_box_buttons", 4, 1, 50, 50);
    this.load_sprite_from_spritesheet("BPartyManD", "ui_box_buttons", 5, 1, 50, 50);  
    this.load_sprite_from_spritesheet("BSaveU", "ui_box_buttons", 0, 2, 50, 50);
    this.load_sprite_from_spritesheet("BSaveD", "ui_box_buttons", 1, 2, 50, 50); 
    this.load_sprite_from_spritesheet("BLogoutU", "ui_box_buttons", 2, 2, 50, 50);
    this.load_sprite_from_spritesheet("BLogoutD", "ui_box_buttons", 3, 2, 50, 50);  
 
    // Node highlight borders
    this.load_spritesheet("nodes","display/images/node_bg.png"); 
    this.load_sprite_from_spritesheet("node_red", "nodes", 0, 0, 28, 32);
    this.load_sprite_from_spritesheet("node_orange", "nodes", 1, 0, 28, 32);
    this.load_sprite_from_spritesheet("node_yellow", "nodes", 2, 0, 28, 32);
    this.load_sprite_from_spritesheet("node_green", "nodes", 3, 0, 28, 32);
    this.load_sprite_from_spritesheet("node_blue", "nodes", 4, 0, 28, 32);
    this.load_sprite_from_spritesheet("node_purple", "nodes", 5, 0, 28, 32);
    this.load_sprite_from_spritesheet("node_rose", "nodes", 6, 0, 28, 32);
    this.load_sprite_from_spritesheet("node_lgreen", "nodes", 7, 0, 28, 32);

    this.load_spritesheet("p1","display/images/npc1.png");
    this.load_actor_sprites("electro_mage", "p1", 0, 0, 28, 32);
    this.load_actor_sprites("db_scout", "p1", 4, 0, 28, 32);
    this.load_actor_sprites("green_shirt", "p1", 8, 0, 28, 32);
    this.load_actor_sprites("old_woman", "p1", 1, 1, 28, 32);
    this.load_actor_sprites("the_lady", "p1", 5, 1, 28, 32);
    this.load_actor_sprites("rock_monster", "p1", 9, 1, 28, 32);
    this.load_actor_sprites("db_hammer", "p1", 2, 2, 28, 32);
    this.load_actor_sprites("mayor", "p1", 6, 2, 28, 32);
    this.load_actor_sprites("purple_chick", "p1", 10, 2, 28, 32);
    this.load_actor_sprites("db_bow", "p1", 3, 3, 28, 32);
    this.load_actor_sprites("db_commander", "p1", 7, 3, 28, 32);
    this.load_actor_sprites("db_doctor", "p1", 0, 4, 28, 32);
    this.load_actor_sprites("small_farmer", "p1", 4, 4, 28, 32);
    this.load_actor_sprites("musky_traveler", "p1", 8, 4, 28, 32);
    this.load_actor_sprites("large_farmer", "p1", 1, 5, 28, 32);
    this.load_actor_sprites("lcyan_chick", "p1", 5, 5, 28, 32);
    this.load_actor_sprites("db_dagger", "p1", 9, 5, 28, 32);
    this.load_actor_sprites("shame", "p1", 2, 6, 28, 32);
    this.load_actor_sprites("tzit_fighter", "p1", 6, 6, 28, 32);
    this.load_actor_sprites("tzit_mage", "p1", 10, 6, 28, 32);

    this.load_spritesheet("pcs","display/images/pcs.png");
    this.load_actor_sprites("green_fella", "pcs", 0, 0, 28, 32);
    this.load_actor_sprites("male_bowman", "pcs", 4, 0, 28, 32);
    this.load_actor_sprites("mr_stud", "pcs", 8, 0, 28, 32);
    this.load_actor_sprites("purple_dress", "pcs", 1, 1, 28, 32);
    this.load_actor_sprites("archerette", "pcs", 5, 1, 28, 32);
    this.load_actor_sprites("gunther", "pcs", 9, 1, 28, 32);
    this.load_actor_sprites("big_mage", "pcs", 2, 2, 28, 32);
    this.load_actor_sprites("javy", "pcs", 6, 2, 28, 32);
    this.load_actor_sprites("black_knight", "pcs", 10, 2, 28, 32);
    this.load_actor_sprites("rebecca", "pcs", 3, 3, 28, 32);
    this.load_actor_sprites("blood_priest", "pcs", 7, 3, 28, 32);

    this.load_spritesheet("pcs2","display/images/Players.png");
    this.load_actor_anim_sprites("male_lancer", "pcs2", 0, 0, 28, 32);
    this.load_actor_anim_sprites("male_archer", "pcs2", 2, 2, 28, 32);
    this.load_actor_anim_sprites("male_legionaire", "pcs2", 4, 4, 28, 32);
    this.load_actor_anim_sprites("female_legionaire", "pcs2", 6, 6, 28, 32);
    this.load_actor_anim_sprites("female_archer", "pcs2", 8, 8, 28, 32);
    this.load_actor_anim_sprites("female_lancer", "pcs2", 10, 10, 28, 32);
    this.load_actor_anim_sprites("female_magician", "pcs2", 1, 13, 28, 32);
    this.load_actor_anim_sprites("male_magician", "pcs2", 3, 15, 28, 32);

    //inventory item icons
    this.load_spritesheet("items1", "display/images/items1.png");
    this.load_sprite_from_spritesheet("knife",    "items1", 0, 0, 14, 14);
    this.load_sprite_from_spritesheet("sword",    "items1", 1, 0, 14, 14);
    this.load_sprite_from_spritesheet("shield",   "items1", 2, 0, 14, 14);
    this.load_sprite_from_spritesheet("shirt",    "items1", 3, 0, 14, 14);
    this.load_sprite_from_spritesheet("spear",    "items1", 4, 0, 14, 14);
    this.load_sprite_from_spritesheet("potion",   "items1", 5, 0, 14, 14);
    this.load_sprite_from_spritesheet("emerald",  "items1", 6, 0, 14, 14);
    this.load_sprite_from_spritesheet("wand",     "items1", 7, 0, 14, 14);
    this.load_sprite_from_spritesheet("rock",     "items1", 8, 0, 14, 14);
    this.load_sprite_from_spritesheet("pants",    "items1", 9, 0, 14, 14);
    this.load_sprite_from_spritesheet("gloves",   "items1",10, 0, 14, 14);
    this.load_sprite_from_spritesheet("boots",    "items1",11, 0, 14, 14);
    this.load_sprite_from_spritesheet("goldbag",  "items1",12, 0, 14, 14);
    this.load_sprite_from_spritesheet("axe",      "items1",13, 0, 14, 14);

    this.load_spritesheet("status", "display/images/status.png");
    this.load_sprite_from_spritesheet("se_poison_w","status", 0, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_poison_s","status", 1, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_burning_w","status", 2, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_burning_s","status", 3, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_feared_w","status", 4, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_feared_s","status", 5, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_bound_w","status", 6, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_bound_s","status", 7, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_frozen_w","status", 8, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_frozen_s","status", 9, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_hasted_w","status", 10, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_hasted_s","status", 11, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_shielded_w","status", 12, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_shielded_s","status", 13, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_cursed_w","status", 14, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_cursed_s","status", 15, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_blessed_w","status", 16, 0, 10, 10);
    this.load_sprite_from_spritesheet("se_blessed_s","status", 17, 0, 10, 10);

    this.load_spritesheet("damages","display/images/damaged.png");
    this.load_sprite_from_spritesheet("physd","damages", 0, 0, 28, 32);
    this.load_sprite_from_spritesheet("ranged","damages", 1, 0, 28, 32);
    this.load_sprite_from_spritesheet("poisond","damages", 2, 0, 28, 32);
    this.load_sprite_from_spritesheet("chaind","damages", 3, 0, 28, 32);
    this.load_sprite_from_spritesheet("fired","damages", 4, 0, 28, 32);
    this.load_sprite_from_spritesheet("death0","damages", 5, 0, 28, 32);
    this.load_sprite_from_spritesheet("death1","damages", 6, 0, 28, 32);
    this.load_sprite_from_spritesheet("death2","damages", 7, 0, 28, 32);
    this.load_sprite_from_spritesheet("death3","damages", 8, 0, 28, 32);
    this.load_sprite_from_spritesheet("blessd","damages", 9, 0, 28, 32);
    this.load_sprite_from_spritesheet("iced","damages", 10, 0, 28, 32);

    this.load_spritesheet("spells1", "display/images/spellanimations.png");
    this.load_animoverlay_sprites("fir","spells1", 0, 0, 28, 32);
    this.load_animoverlay_sprites("icy","spells1", 0, 1, 28, 32);
    this.load_animoverlay_sprites("mag","spells1", 0, 2, 28, 32);

    this.load_spritesheet("pj1", "display/images/projectiles.png");
    this.load_overlay_sprites("icyproj","pj1", 0, 0, 28, 32);
    this.load_overlay_sprites("firproj","pj1", 4, 0, 28, 32);
    this.load_overlay_sprites("zapproj","pj1", 8, 0, 28, 32);
    this.load_overlay_sprites("rotproj","pj1", 1, 1, 28, 32);
    this.load_overlay_sprites("bowproj","pj1", 5, 1, 28, 32);

    this.load_picture("cleanstatpill","display/images/cleanui/statpill.png", 68, 24);
    this.load_picture("cleanstatdecreasemod","display/images/cleanui/statdecreasemodifier.png", 40, 13);
    this.load_picture("cleanstatincreasemod","display/images/cleanui/statincreasemodifier.png", 40, 13);
    this.load_picture("cleanclosebutton","display/images/cleanui/closebutton.png", 48, 18);
    this.load_picture("cleanclosebuttonselected","display/images/cleanui/closebuttonselected.png", 48, 18);
    this.load_picture("cleangradientlightneutral","display/images/cleanui/gradientlightneutral.png", 64, 64);
    this.load_picture("cleanlightcolor","display/images/cleanui/lightcolor.png", 64, 64);
    this.load_picture("cleanverydarkcolor","display/images/cleanui/verydarkcolor.png", 64, 64);
    this.load_picture("cleanneutralcolor","display/images/cleanui/neutralcolor.png", 64, 64);
    this.load_picture("cleanselectedcolor","display/images/cleanui/selectedcolor.png", 64, 64);
    this.load_picture("cleancirclecontrol","display/images/cleanui/circlecontrol.png", 26, 26);
    this.load_picture("cleansquarecontrol","display/images/cleanui/squarecontrol.png", 26, 26);

    this.draw_rect = this.draw;
};

})();