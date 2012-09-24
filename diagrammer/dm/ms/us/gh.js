(function($, dm, undefined) {

  dm.ms['gh'] = function(handler, options) {
    self = this;
	self.selected = null;
    this['menu'] = function(data, callback) {
      var items = [];

      for (var i in data) {
         if (!data[i]['private']) {
	    var name = data[i]['name'],
                pr = (data[i]['private']) ? "Private: ":"Public: ";
            items.push('<li class="diagramSelector" style="cursor:pointer;" id="'  + name +'" url="'+ data[i]['url'] +'">' + pr +  data[i]['full_name'] + '</li>');
         }
      }

      var innerHtml = items.join('');
      innerHtml = '<form>\
        <fieldset><div id="vp_main_menu34" style="scroll:auto;height:40px;"><ul>' + innerHtml + '</ul></div>\
        </fieldset></form>';
      $("<div id='vp_main_menu_3' title='Repository selection'></div>").appendTo('body');
      $(innerHtml).appendTo("#vp_main_menu_3");

      $( "#vp_main_menu_3" ).dialog({
        'autoOpen': true,

        'minWidth': 350,
        'modal': true,
        'buttons': {
          "Create": function() {
            var rep = self.selected;
			if (callback) 
			  callback(rep);
			
            $(this).dialog("close");
          },
          'Cancel': function() {
            $(this).dialog("close");
          }
        },

        close: function() {

        }
      });

      $(".diagramSelector").click(function() {
        self.selected = $(this).attr('url');
        $(".diagramSelector").css("background-color","#eee").css("color", "#000");
        $(this).css("background-color","#5D689A").css("color", "#fff");
      });
    };
  };

  dm.ms['gh'].prototype = {
      'options': {
        'image': "small",
        'url': "dm/ms/us/main.json",
        'id': "ListDiagramMenu"
      }
  };
})(jQuery, dm);

