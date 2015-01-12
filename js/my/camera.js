define(['jquery', 'ramda', 'd3'], function($,R, d3){

	"use strict";
	
	var
	
		
	
		context,
		canvas,
		selfiecount = 0,
		showselfie,
		smallcenter = {x: 320+200, y:240+100},
		
		bigcenter   = {x:smallcenter.x - 50, y:smallcenter.y-50},
		
		smallr = 220, 
		
		bigr   = 220 + 220/3,
		
		hasGetUserMedia = function(){
		  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
					navigator.mozGetUserMedia || navigator.msGetUserMedia);
		},
		
		svg  = d3.select("#svg").append("g"),
		
		compressImage = function(canvas, size) {
			var compression = 1.0;
			while(compression > 0.01) {
				var dataURL = canvas.toDataURL('image/jpeg', compression);
				if (dataURL.length/1012 < size) return dataURL;
					if (compression <= 0.1) {
					compression -= 0.01;
				} else {
					compression -= 0.1;
				}
			}
			return null;
		},

		setup = function(){
			
			var video = document.getElementById("video");
			var videoObj = { "video": true };
			
			var errBack = function(error) {
				console.log("Video capture error: ", error.code); 
			};

			// Put video listeners into place
			if(navigator.getUserMedia) { // Standard
				navigator.getUserMedia(videoObj, function(stream) {
					video.src = stream;
					video.play();
				}, errBack);
			} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
				navigator.webkitGetUserMedia(videoObj, function(stream){
					video.src = window.webkitURL.createObjectURL(stream);
					video.play();
				}, errBack);
			}
			else if(navigator.mozGetUserMedia) { // Firefox-prefixed
				navigator.mozGetUserMedia(videoObj, function(stream){
					video.src = window.URL.createObjectURL(stream);
					video.play();
				}, errBack);
			}
			
			
			drawarcs();
			drawpanel();
			//context.fillStyle = "lightblue";
            //context.fillRect(20, 40, 50, 50);
		},
		
		linefunction = d3.svg.line()
						  .x(function(d) {return d.x;})
						  .y(function(d) {return d.y;})
						  .interpolate("linear"),
		
		drawbigcircle = function(){
			svg.append("circle")
				.attr("cx", bigcenter.x)
				.attr("cy", bigcenter.y)
				.attr("r", bigr)
				.style("stroke", "black")	
				.style("fill", "none")
				.style("stroke-width", 2)
		},
		
		showImage = function(i){
			console.log("showing image"+i);
			var m = window.sessionStorage.getItem("selfie"+i);
			console.log(m);
			if (m){
				d3.select("image.selfie")
				    .attr("xlink:href",m);
				    
				if (showselfie)
					clearTimeout(showselfie);
				
				showselfie = window.setTimeout(function(){
					d3.select("image.selfie")
					.attr("xlink:href", "");
				}, 4000);
			}
		},
		
		drawarcs = function(){	
						
			var wedges = svg.append("g")
						.attr("class", "wedges");
						
			var wedgeangle = 5 * Math.PI/180;
			var data = [];
			
			for (var i = 0; i < 72; i+=2){
				
				var a1 = wedgeangle * i;
				var a2 = a1 + wedgeangle;
				var xtra = 100;
				var p1 = {x:smallcenter.x+ (smallr * Math.cos(a1)), y:smallcenter.y+ -(smallr * Math.sin(a1))};
				
				
				var p2 = {x:smallcenter.x+ ((bigr + xtra) * Math.cos(a1)), y:smallcenter.y+ -((bigr + xtra) * Math.sin(a1))};
				var p3 = {x:smallcenter.x+ ((bigr + xtra) * Math.cos(a2)), y:smallcenter.y+ -((bigr + xtra) *Math.sin(a2))};
				var p4 = {x:smallcenter.x+ (smallr * Math.cos(a2)), y:smallcenter.y+ -(smallr * Math.sin(a2))};
				var linedata1 = [p1, p2, p3, p4];
				data.push(linedata1);
			}
		
			wedges.selectAll("wedge")
					.data(data)
					.enter()
					.append("path")
					.attr("d", function(d){return linefunction(d)})
					.attr("stroke", "none")
					.attr("fill", "green")
					.on("click", function(d,i){showImage(i)});
					
			/*		
			wedges.append("path")
					.attr("d", linefunction(linedata1))
					.attr("stroke", "none")
					.attr("fill", "green")
					.on("click", function(d,i){console.log("clicked " + i)});*/
				
		},
		
		
		drawpanel = function(){
			var panelwidth = $(window).width()/5;
			var buttonheight = $(window).height()/10;
			
			var panel = svg.append("rect")
							.attr("x",$(window).width()-panelwidth)
							.attr("y",0)
							.attr("width",panelwidth)
							.attr("height",$(window).height())
							.attr("fill", "#66b5a0")
			
			var button = svg.append("rect")
							.attr("x",$(window).width()-panelwidth)
							.attr("y", $(window).height()-buttonheight)
							.attr("width",panelwidth)
							.attr("height",buttonheight)
							.attr("fill", "#a1392d")
							.on("click", takepicture)
		},
		
		
		takepicture = function(){
			var canvas = document.getElementById("canvas");
			var context = canvas.getContext("2d");
			context.drawImage(video, 0, 0, 640, 480);
			//var dataURL = compressImage(canvas, 20);
 			var dataURL = canvas.toDataURL("image/jpeg", 1.0);
 
			if (dataURL == null) {
				alert("We couldn't compress the image small enough");
				return;
			}
			
			window.sessionStorage.setItem("selfie"+selfiecount++, dataURL)
			
			//channel.publish({
			//		channel : "photo",
			//		message : dataURL,
			//		error : function(error){console.log(error)}
			//});*/
		},
		
		init = function(){
			if (hasGetUserMedia()) {
		  		setup();
			} else {
		  		alert('getUserMedia() is not supported in your browser');
		  		return;
			}
		
			
			//$("#video").width( $(document).width());
			//$("#video").height( $(document).height());
			//subscribe();
			
			
			//document.getElementById("snap").addEventListener("click", function() {
			//	console.log("ok seen button press!");
			//	takepicture();
			//});
			
		}
	
	return{
		init: init
	}
	
});