/*
Class: vp

Main menu for diagram loading in a Visual-Paradigm style

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  http://umlsync.org

Version:
  2.0.0 (2012-07-17)
 */

//@aspect
(function($, dm, undefined) {

	dm.ms['dg'] = function(handler, options) {
		this.handler = handler;
		this.selected = "class";

		// list of modal dialogs
		this.dialogs = new Array();
		// status of modal dialogs
		this.status = new Array();
	};


	dm.ms['dg'].prototype = {
			'options': {
		'image': "small",
		'id': "ListDiagramMenu"
	},
	'Activate': function(name) {
		if (!name)
			return;
		this.status[name] = true; // active dialog. It is possible to activate dialog before it's creation. in that case it will be shown on creation.
		$( "#" + name ).dialog( "open" );
	},
	'NewDiagramDialog':function(data) {

		var innerHtml = '<form>\
			<fieldset><div id="selectable-list" style="scroll:auto;height:40px;"><ul id="diagram-menu"></ul></div>\
			<p><label class="left" for="name">Name:</label><span class="left2"><input id="VP_inputselector" type="text" value="/Untitled" maxlength="256" pattern="[a-zA-Z ]{5,}" name="name"/></span>\
			</p></fieldset></form>';
			$("<div id='new-diagram-dialog' title='Creating new diagram'></div>").appendTo('body');
			$(innerHtml).appendTo("#new-diagram-dialog");

            var self = this;
            $("#diagram-menu").listmenu({
	           selector: "diagram-selector",
	           selectable: true,
	           data:data,
	           onSelect: function(item) {
	             self.selected = item.id;
                 var val = $("#new-diagram-dialog input").val();
                 $("#new-diagram-dialog input").val(val.substr(0, val.lastIndexOf('/') + 1) + item.id + "Diagram"); 
	           }
            });

			$( "#new-diagram-dialog" ).dialog({
				'autoOpen': true,
				'minWidth': 350,
				'modal': true,
				'buttons': {
				"Create": function() {
				var diagram_name = $("#new-diagram-dialog input").val(),
				fullname = diagram_name;
				if (diagram_name != '') {
					if (!self.handler['checkDiagramName'](diagram_name)) {
						diagram_name += "(2)";
					}
					var sp = diagram_name.split("/");
					if (sp.length > 1)
						diagram_name = sp[sp.length-1];
					self.handler['addDiagram']("base", self.selected, diagram_name, {'fullname': fullname, 'viewid': $("#vp_main_menu select").val()});
				}
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

			$("#new-diagram-dialog select").change(function() {
				var folder = handler.views[$(this).val()].active || "/";
				var val = $("#new-diagram-dialog input").val();
				val.substr(val.lastIndexOf('/'))
				$("#new-diagram-dialog input").val(folder + val.substr(val.lastIndexOf('/')));
			});

			$("#new-diagram-dialog .diagramSelector").click(function() {
				self.selected = this.id;
				$(".diagramSelector").removeClass('selected');

				$(this).addClass('selected');

				var val = $("#new-diagram-dialog input").val();
				$("#new-diagram-dialog input").val(val.substr(0, val.lastIndexOf('/') + 1) + this.id + "Diagram"); 
				//  $("#vp_main_menu .finish").css("background-color","#5D689A").css("cursor","pointer");
			}).hover(function () {
                    $(this).addClass('hover');
                }, function () {
                    $(this).removeClass('hover');
            });
	},
	'SelectRepoDialog': function(data, callback) {
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
			<fieldset><div id="selectable-list" style="scroll:auto;height:40px;"><ul>' + innerHtml + '</ul></div>\
			</fieldset></form>';
			$("<div id='repo-selection-dialog' title='Repository selection'></div>").appendTo('body');
			$(innerHtml).appendTo("#repo-selection-dialog");

			$( "#repo-selection-dialog" ).dialog({
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
	},
	'SaveDiagramDialog':function(){

	},
	'NewProject': function() {
		var innerHtml = '<p class="validateTips">All form fields are required.</p>\
			<form>\
			<fieldset>\
			<label for="name">Name</label>\
			<input type="text" name="name" id="name" class="text ui-widget-content ui-corner-all" />\
			<label for="description">Description</label>\
			<input type="textarea" name="description" id="description" value="" class="text ui-widget-content ui-corner-all" />\
			</fieldset>\
			</form>';

			$('<div id="new-project-dialog" title="Create new project"></div>').appendTo('body');
			$(innerHtml).appendTo("#new-project-dialog");
			$("#new-project-dialog").dialog({
				autoOpen: false,
				height: 250,
				width: 350,
				modal: true,
				buttons: {
				"Create a new project": function() {
				var ch = $("#" + viewId + " #tree").dynatree("getTree").getRoot().getChildren();
				for (i in ch) {
					if (ch[i].data.title == "Projects") {
						ch[i].addChild({title: $("#name").val(), isFolder:true, tooltip: $("#description").val()});
						break;
					}
				}
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
			},
			close: function() {
				//allFields.val( "" ).removeClass( "ui-state-error" );
			}
			});
	},
	'CommitDataDialog':function(data, callback){

	}
	};
//	@aspect
})(jQuery, dm);
