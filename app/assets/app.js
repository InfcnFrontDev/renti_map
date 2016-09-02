'use strict';

Vue.component('popover', {
   /* template: '<div id="popover" class="popover" transition="modal" style="position:absolute;top: 30%;left: 30%;"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',*/
     /*template: '<div id="popover" class="popover" transition="modal" style="position:absolute;top: 30%;left: 30%;;"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',*/
      template: '<div id="popover" class="popover" transition="modal" style="{ position: absolute, left:50%; top:50%; marginLeft: -135px, marginTop: -100px,}"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
    methods: {
        show: function (title, content) {
            /* $(this.$el).find('.popover-title').html(title);
            $(this.$el).find('.popover-content').html(content);
            console.log($(this.$el))
           var width = document.body.scrollWidth - 15;
            var height = document.body.scrollHeight - 15;

            var pwidth = $(this.$el).width();
            console.log(pwidth)
            var arrow = "left";
            if ((width - event.pageX) > pwidth) {
                arrow = "right";
            }

            var top = event.pageY - 40, left = event.pageX + 10;
            if (arrow == "left") {
                left -= pwidth + 20;
            }
            $(this.$el).attr("class", "popover " + arrow);
            $(this.$el).find(".arrow").css("top", "40px");

            $(this.$el).animate({"top": top + "px", "left": left + "px"});*/
            $(this.$el).find('.popover-title').html(title);
            $(this.$el).find('.popover-content').html(content);
            $(this.$el).css({'position': 'absolute', 'left':'50%', 'top':'50%', 'marginLeft': '-135px', 'marginTop': '-200px'});
            $(this.$el).show();
        },
        hide: function () {
            $(this.$el).hide();
        }
    }
});
// register modal component
Vue.component('rentimap', {
    template: '<div class="rentimap"><div class="svgmap"></div><popover v-ref:popover></popover></div>',
    props: ['map', "xuewei", "jingluo", "disease"],
    ready: function () {
        var $this = this;
        var $el = $this.$el;

        var width = document.body.scrollWidth - 15;
        var height = document.body.scrollHeight - 15;

        var animate = '<animate attributeName="stroke-width" attributeType="XML"	values="2;10;2"	begin="0s" dur="2s"	repeatCount="indefinite"/>'
            + '<animate attributeName="stroke-opacity" attributeType="CSS" values="1;0.6;1" begin="0s"	dur="2s" repeatCount="indefinite"/>';

        $(this.$el).width(width).height(height);


        $(this.$el).find(".svgmap").load('svg/' + this.map, function () {
            $('#svg').width(width).height(height);

            // svg缩放
            d3.select("svg").call(d3.behavior.zoom()
                .scaleExtent([0.5, 10])
                .translate([0, 0])
                .scale(1)
                .on('zoom', function () {
                    d3.select("#all").attr('transform', 'translate(' + d3.event.translate + ')' +
                        ' scale(' + d3.event.scale + ')');
                    $this.hidePopover();
                })
            );


            // new RentiMap('#mobile-svg', {
            //     map: "svg/xxxx.svg",
            //     jingluo: true,
            //     xuewei: true,
            //     jibing: '高血压'
            // });



            var $jingluo = $("#jingluo");
            var $xuewei = $("#xuewei");

            $xuewei.children().click(function () {
                var xwid = $(this).attr('id');
                var data = xuewei[xwid];

                var title = "<strong>穴位名称：</strong>" + data.name;
                var content = "<p><strong>国际编码：</strong>" + data.code + "</p>";
                content += "<p><strong>所属经络：</strong>" + (data.jl_name ? data.jl_name : "经外奇穴") + "</p>";
                content += "<p><strong>穴位主治：</strong>" + (data.zhu_zhi ? data.zhu_zhi : "") + "</p>";

                $this.showPopover(title, content);
            });

            $jingluo.children().click(function () {
                var jlid = $(this).attr('id');
                var data = jingluo[jlid];

                var title = "<strong>经络名称：</strong>" + data.name;
                var content = "<p><strong>循行：</strong>" + data.xun_xing + "</p>";
                content += "<p><strong>病候：</strong>" + data.bing_hou + "</p>";
                content += "<p><strong>功能：</strong>" + data.gong_neng + "</p>";

                $this.showPopover(title, content);

            });

            // 是否显示经络
            if ($this.jingluo == 'false' || $this.jingluo == '0') {
                $jingluo.children().hide();
            }
            // 是否显示穴位
            if ($this.xuewei == 'false' || $this.xuewei == '0') {
                $xuewei.children().hide();
            }
            // 高亮经络
            var disease = $this.disease;
            if (disease != null && highlights[disease] != null) {
                $jingluo.children().hide();
                var jls = highlights[disease];
                for (var i in jls) {
                    $jingluo.find('#' + jls[i]).show();
                    $jingluo.find('#' + jls[i]).children().html(animate);
                }
            }
        });

        window.onclick = function () {
            var ele = event.srcElement || event.target;
            var className = $(ele).attr('class');

            if ($(ele).parents('#jingluo').length > 0)
                return;

            var popover = document.getElementById("popover");
            var x = event.clientX;
            var y = event.clientY;
            var divx1 = popover.offsetLeft;
            var divy1 = popover.offsetTop;
            var divx2 = popover.offsetLeft + popover.offsetWidth;
            var divy2 = popover.offsetTop + popover.offsetHeight;
            if (x < divx1 || x > divx2 || y < divy1 || y > divy2) {
                $this.hidePopover();
            }
        };
    },
    methods: {
        "showPopover": function (title, content) {
            this.$refs.popover.show(title, content);
        },
        "hidePopover": function () {
            this.$refs.popover.hide();
        }
    }
});

new Vue({el: 'body'});


