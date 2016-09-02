(function () {
    'use strict';

    var RentiMap = function (element, options) {
        options = $.extend({}, defaults, options || {});

        var panZoom;

        var $popover = $('<div class="popover-box"><div class="popover" transition="modal"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div></div>');
        $(element).after($popover);

        var animate = '<animate attributeName="stroke-width" attributeType="XML"	values="2;10;2"	begin="0s" dur="2s"	repeatCount="indefinite"/>'
            + '<animate attributeName="stroke-opacity" attributeType="CSS" values="1;0.6;1" begin="0s"	dur="2s" repeatCount="indefinite"/>';

        $(element).load(options.map, function () {
            var $svg = $("#svg");
            $svg.attr('style', 'display: inline; width: inherit; min-width: inherit; max-width: inherit; height: inherit; min-height: inherit; max-height: inherit;');

            var eventsHandler = {
                haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
                init: function (options) {
                    var instance = options.instance,
                        initialScale = 1,
                        pannedX = 0,
                        pannedY = 0;
                    // Init Hammer
                    // Listen only for pointer and touch events
                    this.hammer = Hammer(options.svgElement, {
                        inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
                    });
                    // Enable pinch
                    this.hammer.get('pinch').set({
                        enable: true
                    });
                    // Handle double tap
                    this.hammer.on('doubletap', function (ev) {
                        instance.zoomIn()
                    });
                    // Handle pan
                    this.hammer.on('panstart panmove', function (ev) {
                        // On pan start reset panned variables
                        if (ev.type === 'panstart') {
                            pannedX = 0;
                            pannedY = 0;
                        }
                        // Pan only the difference
                        instance.panBy({
                            x: ev.deltaX - pannedX,
                            y: ev.deltaY - pannedY
                        });
                        pannedX = ev.deltaX;
                        pannedY = ev.deltaY;
                    });
                    // Handle pinch
                    this.hammer.on('pinchstart pinchmove', function (ev) {
                        // On pinch start remember initial zoom
                        if (ev.type === 'pinchstart') {
                            initialScale = instance.getZoom();
                            instance.zoom(initialScale * ev.scale);
                        }
                        instance.zoom(initialScale * ev.scale);
                    });
                    // Prevent moving the page on some devices when panning over SVG
                    options.svgElement.addEventListener('touchmove', function (e) {
                        e.preventDefault();
                    });
                },
                destroy: function () {
                    this.hammer.destroy()
                }
            };
            // Expose to window namespace for testing purposes
            panZoom = svgPanZoom("#svg", {
                zoomEnabled: true,
                panEnabled: true,
                controlIconsEnabled: false,
                zoomScaleSensitivity: 0.5,
                minZoom: 0.5,
                maxZoom: 20,
                fit: 1,
                center: 1,
                customEventsHandler: eventsHandler
            });


            var $jingluo = $("#jingluo");
            var $xuewei = $("#xuewei");

            function clickXuewei() {
                var xwid = $(this).attr('id');
                var data = xuewei[xwid];

                var title = "<strong>穴位名称：</strong>" + data.name;
                var content = "<p><strong>国际编码：</strong>" + data.code + "</p>";
                content += "<p><strong>所属经络：</strong>" + (data.jl_name ? data.jl_name : "经外奇穴") + "</p>";
                content += "<p><strong>穴位主治：</strong>" + (data.zhu_zhi ? data.zhu_zhi : "") + "</p>";

                showPopover(title, content);
            }

            //$xuewei.children().on("tap", clickXuewei);
            $xuewei.children().on("click", clickXuewei);

            function clickJingluo() {

                var jlid = $(this).attr('id');
                var data = jingluo[jlid];

                var title = "<strong>经络名称：</strong>" + data.name;
                var content = "<p><strong>循行：</strong>" + data.xun_xing + "</p>";
                content += "<p><strong>病候：</strong>" + data.bing_hou + "</p>";
                content += "<p><strong>功能：</strong>" + data.gong_neng + "</p>";

                showPopover(title, content);
            }

            //$jingluo.children().on("tap", clickJingluo);
            $jingluo.children().on("click", clickJingluo);

            // 是否显示经络
            if (!options.jingluo) {
                $jingluo.children().hide();
            }
            // 是否显示穴位
            if (!options.xuewei) {
                $xuewei.children().hide();
            }
            // 高亮经络
            var disease = options.disease;
            if (disease != null && highlights[disease] != null) {
                $jingluo.children().hide();
                var jls = highlights[disease];
                for (var i in jls) {
                    $jingluo.find('#' + jls[i]).show();
                    $jingluo.find('#' + jls[i]).children().html(animate);
                }
            }
        });

        function showPopover(title, content) {
            $popover.find('.popover-title').html(title);
            $popover.find('.popover-content').html(content);
            $popover.css('display', 'flex');
            //$popover.find(".popover").animate({width: "80%", height: "70%"}, "fast", "swing", function () {});
        }

        function hidePopover() {
//          $popover.find(".popover").animate({width: "0px", height: "0px"}, "fast", "swing", function () {
//              $popover.css('display', 'none');
//          });
			$popover.css('display', 'none');
        }

		function clickPopover() {
			hidePopover();
			return;
            var ele = event.srcElement || event.target;
            var className = $(ele).attr('class');

            if ($(ele).parents('#jingluo').length > 0)
                return;

            if ($(ele).parents('.popover').length == 0) {
                hidePopover();
            }
        }
		//$popover.on("tap",clickPopover);
		$popover.on("click",clickPopover);

    };

    var defaults = {
        map: 'svg/fudaye_front.svg',
        jingluo: true,
        xuewei: true,
        disease: '痴呆'
    };

    window.RentiMap = RentiMap;

})();