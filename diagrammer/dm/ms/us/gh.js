//@aspect
(function($, dm, undefined) {

  dm.ms['gh'] = function(handler, options) {
    self = this;
	self.selected = null;
    this['menu'] = function(data, callback) {
      var items = [];

      for (var i in data) {
	    var name = data[i]['name'];
        items.push('<li class="diagramSelector" style="cursor:pointer;" id="'  + name +'">' + name + '</li>');
      }

      var innerHtml = items.join('');
      innerHtml = '<form>\
        <fieldset><div id="vp_main_menu34" style="scroll:auto;height:40px;"><ul>' + innerHtml + '</ul></div>\
        </fieldset></form>';
      $("<div id='vp_main_menu_3' title='Repository selection'></div>").appendTo('body');
      $(innerHtml).appendTo("#vp_main_menu_3");

      $( "#vp_main_menu_3" ).dialog({
        'autoOpen': true,
//        minHeight: 430,
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
        //FIXME: is this needed?
        close: function() {
          //allFields.val( "" ).removeClass( "ui-state-error" );
        }
      });

      $(".diagramSelector").click(function() {
        self.selected = this.id;
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
//@aspect
})(jQuery, dm);
