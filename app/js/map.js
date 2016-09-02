function loadMap() {

	// Create the SVG base canvas for the map.
    var width = document.body.scrollWidth, 
    	height = document.body.scrollHeight;
    	
    console.log("("+width+", "+height+")")
	
	var color = d3.scale.category20();

    // Add map projection + scaling
    var projection = d3.geo.azimuthal()
		.mode("equidistant")
		.origin([11.5, 11.5])
		.scale(width/0.8)
		.translate([width/2, height/2]);
		
	var t = projection.translate();
	var s = projection.scale();
	
	console.log(t);
		
    var path = d3.geo.path().projection(projection);

    var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.call(d3.behavior.zoom().on("zoom", redraw));
	
	var glegend = svg.append("g").attr("class", "glegend");
	
	var gall = svg.append("g");
				
	var glk = gall.append("g").attr("class", "glk");
	
	var gqg = gall.append("g").attr("class", "gqg");
	
	var gjl = gall.append("g").attr("class", "gjl");
	
	var gxw = gall.append("g").attr("class", "gxw");
	
	var sheets = {};
	var geojson = {};
	

	// 加载地图数据
	// Loading the second base layer of drainage basins.
    d3.json("data/front.json", function(error, json) { 
		console.log(json);
		geojson = json;
		draw(json);

		createLegend();
	});
	
	// 加载业务数据
	// Loading the second base layer of drainage basins.
    d3.json("data/sheets.json", function(error, json) { 
    	d3.map(json).forEach(function(i, d){
    		sheets[d.name] = {};
    		d3.map(d.data).forEach(function(i, d2){
    			sheets[d.name][d2.code] = d2;
        	});
    	});
    	sheets.data = json;
    	console.log(sheets);
    });
	
	
	
	function createLegend(){
		
		var layerMap = {
			"lunkuo":"轮廓", "qiguan":"器官", "jingluo":"经络", "xuewei":"穴位"
		};
		
		var i = 0;
		d3.map(layerMap).forEach(function(key, value){
			var legend = glegend.append("g")
				.attr("class", "legend")
				.attr("selected", "true")
				.attr("transform", "translate(0,"+ (i*30) +")")
				.on("click", function(){
					
					var disabled = d3.select(this).attr("disabled");
					if(disabled){
						d3.select(this).attr("disabled", undefined);
						d3.selectAll("."+key).style("display", "block");
					}else{
						d3.select(this).attr("disabled", "true");
						d3.selectAll("."+key).style("display", "none");
					}
				
				});
		
			legend.append("rect")
				.attr("x", "10")
				.attr("y", "10")
				.attr("width", "18")
				.attr("height", "18")
				.style("fill", color(i+1));
				
			legend.append("text")
				.attr("x", "35")
				.attr("y", "18")
				.attr("dy", ".35em")
				.style("fill", color(i+1))
				.text(layerMap[key]);
				
			i++;
		});
	}
	
	function draw( json ) {
		glk.selectAll("path")
			.data(topojson.feature(json, json.objects.front_lk).features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", "lunkuo")
			.style("stroke-width", projection.scale()/1500);
			
		gqg.selectAll("path")
			.data(topojson.feature(json, json.objects.front_qg).features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", "qiguan")
			.style("stroke-width", projection.scale()/1500);
			
		gjl.selectAll("path")
			.data(topojson.feature(json, json.objects.front_jl).features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", "jingluo")
			.attr("id", function(d){
				return d.properties.JlCode;
			})
			//.style("stroke", function(d,i) { return color(i); })
			.style("stroke-width", projection.scale()/2000)
//			.on("mouseover", mouseOverJl)
//			.on("mousemove", mouseMoveJl)
//			.on("mouseout", mouseOutJl)
			.on("click", clickJl);

		gxw.selectAll("circle")
			.data(json.objects.front_xw.geometries)
			.enter()
			.append("circle")
			.attr("class", "xuewei")
			.attr("id", function(d){
				return d.properties.XwCode;
			})
			.attr("cx", function(d) {return projection(d.coordinates)[0];})
			.attr("cy", function(d) {return projection(d.coordinates)[1];})
			.attr("r", projection.scale()/1500)
//			.on("mouseover", mouseOverXw)
//			.on("mousemove", mouseMoveXw)
//			.on("mouseout", mouseOutXw)
			.on("click", clickXw);
	}
	
	
	function redraw(e) {
		
	  	var sltnode = d3.select("[selected]").node();
	  	if(sltnode != null && sltnode.cx!=null){
	  		
		  	var cx = sltnode.cx.animVal.value;
		  	var cy = sltnode.cy.animVal.value;
		  	
		  	moveDialog(cx, cy);
		  	
	  	}
			
		// d3.event.translate (an array) stores the current translation from the parent SVG element
		// t (an array) stores the projection's default translation
		// we add the x and y vales in each array to determine the projection's new translation
		var tx = t[0] * d3.event.scale + d3.event.translate[0];
		var ty = t[1] * d3.event.scale + d3.event.translate[1];
		projection.translate([tx, ty]);
		
		// now we determine the projection's new scale, but there's a problem:
		// the map doesn't 'zoom onto the mouse point'
		projection.scale(s * d3.event.scale);
		
		
		// redraw the map
		glk.selectAll("path")
			.attr("d", path)
			.style("stroke-width", projection.scale()/1500);
		
		// redraw the map
		gqg.selectAll("path")
			.attr("d", path)
			.style("stroke-width", projection.scale()/1500);
		
		// redraw the x axis
		gjl.selectAll("path")
			.attr("d", path)
			.style("stroke-width", projection.scale()/1500);
		
		// redraw the y axis
		gxw.selectAll("circle")
			.attr("r", projection.scale()/1500)
			.attr("cx", function(d) {return projection(d.coordinates)[0];})
			.attr("cy", function(d) {return projection(d.coordinates)[1];})
    }
	
	function mouseOverJl(d, i){
		d3.select(this).style("stroke", "orange")
			.style("stroke-width", "5px"),
        tooltip.html("经络：" + sheets["jingluo"][d.properties.JlCode].name);
        return tooltip.transition()
            .duration(50)
            .style("opacity", 0.9);
    }

	function mouseOutJl(d, i){
		d3.select(this).style("stroke", color(i))
			.style("stroke-width", "")
		return tooltip.transition().style("opacity", 0);
	}

	function mouseMoveJl (d) {
			  return tooltip
				.style("top", (d3.event.pageY-10)+"px")
				.style("left", (d3.event.pageX+10)+"px");
	}
	
	function clickJl(d){
		d3.selectAll("*[selected]").attr("selected", undefined);
		d3.select(this).attr("selected", "true");
		
		
		var data = sheets["jingluo"][d.properties.JlCode];
		console.log(data);
		
		var title = "<strong>经络名称：</strong>" + data.name;
		var content = "<p><strong>循行：</strong>" + data.xun_xing + "</p>";
		content += "<p><strong>病候：</strong>" + data.bing_hou + "</p>";
		content += "<p><strong>功能：</strong>" + data.gong_neng + "</p>";
		showDialog(title, content);

	}
	
	function mouseOverXw(d, i){
		d3.select(this).style("stroke", "orange")
			.style("stroke-width", "5px"),
        tooltip.html("穴位：" + sheets["xuewei"][d.properties.XwCode].name);
        return tooltip.transition()
            .duration(50)
            .style("opacity", 0.9);
    }

	function mouseOutXw(d, i){
		d3.select(this).style("stroke", "")
			.style("stroke-width", "")
		return tooltip.transition().style("opacity", 0);
	}

	function mouseMoveXw (d) {
			  return tooltip
				.style("top", (d3.event.pageY-10)+"px")
				.style("left", (d3.event.pageX+10)+"px");
	}
	
	function clickXw(d){
		d3.selectAll("*[selected]").attr("selected", undefined);
		d3.select(this).attr("selected", "true");
		

		var data = sheets["xuewei"][d.properties.XwCode];
		console.log(data);
		
		var title = "<strong>穴位名称：</strong>" + data.name;
		var content = "<p><strong>国际编码：</strong>" + data.code + "</p>";
		content += "<p><strong>所属经络：</strong>" + (data.jl_name?data.jl_name:"经外奇穴") + "</p>";
		content += "<p><strong>穴位主治：</strong>" + (data.zhu_zhi?data.zhu_zhi:"") + "</p>";
		showDialog(title, content);
	}
	
	var dlgOpen = false;
	function showDialog(title, content){
		var popover = d3.select("#popover")
			.attr("class", "popover right");

		popover.select(".arrow").style("top", "40px");
		popover.select(".popover-title").html(title);
		popover.select(".popover-content").html(content);
		
		var top = d3.event.pageY-40;
			left = d3.event.pageX+10;
		if(!dlgOpen){
			popover.style("top", top + "px")
				.style("left", left + "px")
				.style("display", "block");
		}
		
		popover.transition().ease("circle")
			.style("top", top + "px")
			.style("left", left + "px")
		
		dlgOpen = true;
	}
	
	function moveDialog(cx, cy){
		var popover = d3.select("#popover");
		popover
			.style("top",  cy-40 + "px")
			.style("left", cx+10 + "px")
	}
	
	function hideDialog(){
		var popover = d3.select("#popover");
		popover.style("display", "none");
		dlgOpen = false;
	}
	
	
	window.onclick = function(){
		
		var ele = event.srcElement || event.target;
		var className = d3.select(ele).attr('class');
		
		if( className == "xuewei" || className == "jingluo") 
			return;
		
		var popover = document.getElementById("popover");
		var x=event.clientX;
        var y=event.clientY;  
        var divx1 = popover.offsetLeft;  
        var divy1 = popover.offsetTop;  
        var divx2 = popover.offsetLeft + popover.offsetWidth;  
        var divy2 = popover.offsetTop + popover.offsetHeight;
        if( x < divx1 || x > divx2 || y < divy1 || y > divy2 ){
        	hideDialog();
        }
	};
};
loadMap();
