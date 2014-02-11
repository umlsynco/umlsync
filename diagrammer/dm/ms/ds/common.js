/*
Class: common

Common diagram menu loader which based on JSON description
of diagram and it's components

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2013 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com).
  All rights reserved. 

URL:
  http://umlsync.org/about

 */

//@aspect
(function($, dm, undefined) {
  dm.ms.ctx['common'] = function(menuBuilder, options, actions) {
    this.options = options;  
    var menu = $('<ul id="'+options.uid +'" class="context-menu" ></ul>').hide().appendTo("#" + menuBuilder.diagramId);
    menuBuilder.append(this, options.id); // element Class Context append to diagram
    var self = this;

    $(menu).listmenu({
      data:actions,
      urlPrefix: dm.dm.loader.getUrl(),
      onSelect: function(item) {
      if (item.click)
        item.click(menuBuilder.currentElement, self.x, self.y);
      //e.preventDefault();
      menuBuilder['HideAll']();
    },
    onMouseEnter: function(item, evt) {
      if (item.mouseenter)
        item.mouseenter(menuBuilder.currentElement, evt);
    },
    onMouseLeave: function(item, evt) {
      if (item.mouseleave)
        item.mouseleave(menuBuilder.currentElement, evt);
    }
    });

    /*
        $.each(actions, function(name, item_options) {
            var menuItem = $('<li><a href="#">'+name+'</a></li>');

            if (item_options.klass)
                menuItem.attr("class", item_options.klass);

            menuItem.appendTo(menu).bind('click', function(e) {
                item_options.click(menuBuilder.currentElement, self.x, self.y);
                e.preventDefault();
                menuBuilder['HideAll']();
                e.stopPropagation();
            }).hover(function(event) {
          $(this).addClass('hover');
            if(item_options.mouseenter) {
              item_options.mouseenter(menuBuilder.currentElement, event);
          }
        },
              function(event) { $(this).removeClass('hover');
          if(item_options.mouseleave) {
            item_options.mouseleave(menuBuilder.currentElement, event);
        }
      });
        });*/

    this['Show'] = function(element, x, y) {
      $(".context-menu").hide();
      //show element context menu
      var $did = $("#" + element.parrent.euid);
      var pz = $did.offset();
      var scrollTop = $did.scrollTop(),
      scrollLeft = $did.scrollLeft();
      this.x = x - pz.left + scrollTop;
      this.y = y - pz.top + scrollLeft;



      //$("#" + menuBuilder.diagramId + " #" + options.uid).css({"left":x-pz.left, "top":y - pz.top}).show();
      $("#" + menuBuilder.diagramId + " #" + options.uid).css({"left":x-pz.left + scrollLeft, "top":y - pz.top + scrollTop}).show();
      $("#context-toolbox").css({"left":x, "top":y-60}).show();
    };

    this['Hide'] = function() {
      $(".context-menu").hide();
      $("#" + menuBuilder.diagramId + " #" + options.uid).hide();
      $("#context-toolbox").hide();
    };
  };

  //@print
  dm.ms['ctx'] = dm.ms.ctx;


//Common context menu for element for the diagram
//One instance for each diagram

//param  name - name of the context menu
//param loader - common loader for components
//param diagram.id - diagram unique DIV id 
//diagram - the diagram class

  dm.ms.ContextMenuBuilder = function(loader) {
	// singleton
	function getInstance() {
		dm.dm = dm.dm || {};
		if (!dm.dm['ContextMenuBuilder']) {
			// create a instance
			dm.dm['ContextMenuBuilder'] = new ContextMenuBuilder(loader);
			// load the connector context mennu on initialization
		    dm.dm['ContextMenuBuilder'].load('connector');	
		}

		// return the instance of the singletonClass
		return dm.dm['ContextMenuBuilder'];
	}

	var ContextMenuBuilder = function(loader) {
	  this.loader = loader;
	  $(document).bind("us-ms-ctx", function(event, data) {
	  }, this);

	  $(document).bind("us-ms-ctx-load", function(event, data) {
	  }, this);
	};

	ContextMenuBuilder.prototype = {
        menus : [],
		// load the context menu JS
		load : function(name, diagram) {
		  this.diagram = diagram;
		  if (this.menus[name] == undefined)
			dm.dm.loader.CreateContextMenu(name, this);
		},
        // callback on creation
		append : function(obj, id) {
		  this.menus[id] = obj;
		},
        // click on element + coordinates
		visit : function(element, x, y) {
		  if (this.currentMenu != undefined) {
			this.currentMenu['Hide']();
			this.currentMenu = undefined;
			this.currentElement = undefined;
		  }

		  if (this.menus[element.options.type] == undefined)
			return;

		  this.currentMenu = this.menus[element.options.type] || this.menus['common'];
		  this.currentElement = element;
		  if (this.currentMenu != undefined)
			this.currentMenu['Show'](element, x, y); // TODO: relocate to element position  
		},
        //
		// Hide all context menus
		//
		HideAll : function() {
		  if (this.currentMenu != undefined)
			this.currentMenu['Hide']();
		  this.currentMenu = undefined;
		  this.currentElement = undefined;
		}
		};

		return getInstance();
  }


  //Common element menu loader
  dm.ms.IconMenuBuilder = function(hmenus) {
  
	// singleton
	function getInstance(hmenus) {
		dm.dm = dm.dm || {};
		if (!dm.dm['IconMenuBuilder']) {
			// create a instance
			dm.dm['IconMenuBuilder'] = new IconMenuBuilder(hmenus);
		}
		else {
		  dm.dm['IconMenuBuilder'].extendMenus(hmenus);
		}

		// return the instance of the singletonClass
		return dm.dm['IconMenuBuilder'];
	}

	var IconMenuBuilder = function(hmenus) {
	  this.extendMenus(hmenus);
	};

	IconMenuBuilder.prototype = {
       menus : [],
	   //
	   // extend the descriptions of icon menus
	   //
	   extendMenus : function(hmenus) {
         // Prepared the list of connectors for menus 
		for (var dd in hmenus) {
		  var menu = hmenus[dd];
		  this.menus[menu['id']] = [];
		  var items = menu['items'];
		  for (var tt in items) {
			this.menus[menu['id']][items[tt]['element']['type']] = [];
			var connectors = items[tt]['connector'];
			for (var cc in connectors) {
			  this.menus[menu['id']][items[tt]['element']['type']][connectors[cc]['type']] = connectors[cc]['icon'];
			}
		  }     
		}
	  },
	  //
	  // Create an instance of menus element
	  //
      load : function(type, diagram) {

          this.diagram = diagram;

		  // Check that menu type is defined
		  // And that it was not load before

		  var menu_id = "us-"+type+"-menu"
		  if ((this.menus[menu_id] == undefined)
			  || ($(" .elmenu-" + menu_id).is("div")))
			return;

		  // lets create the menu
		  var menu_items = [];
		  for (var c in this.menus[menu_id])       // element descriptor
			for (var r in this.menus[menu_id][c])  // connector descriptor
			  menu_items.push("<img src='" + dm.dm.loader.url + this.menus[menu_id][c][r] +"' id='" + r +"' title='"+ r + "' aux='" + c + "' style='padding:1px;'></img>");

		  var cells = menu_items.join('');

		  // Append menu to the diagram
		  $("#tabs").append("<div style='position:absolute;left:200px;z-index:19999998;' class='elmenu-" + menu_id +"'>" + cells + "</div>");

		  // Hide the element
		  $(' .elmenu-' + menu_id).css({opacity:"0"});

		  var iconMenuBuilder = this;

		  // Make it possible to click + drag images 
		  // ==========================================================================
		  //               THERE ARE TWO CALL's HERE FOR DRAGGABLE!!!!!
		  //               IT IS NECESSARY TO JOIN THEM - OR DESCRIBE THE DIFFERENCE :)
		  //               ONE FOR USUAL MENU AND ANOTHER ONE FOR SELF-CONNECTABLE ITEMS
		  //               WHICH DOESN'T REQUIRE THE 2-nd ELEMENT
		  var kl;
		  $("#tabs .elmenu-" + menu_id + " img").draggable({
			'appendTo': "#tabs",
			'helper': function(event) {
			   // Use the double wrapper because of element's structrure
			   return $("<div id='ConnectionHelper_Border' style='border:solid black;border-width:1px;'>" + 
			            "<div id='ConnectionHelper' style='border:solid yellow;border-width:1px;'> [ x ]</div></div>");
		    },
		    'start': function(event) {
			  if (iconMenuBuilder.diagram) {
				  var tid = $(this).attr("aux");
				  
				  var element = tid, //iconMenuBuilder.dmb.getElementById(tid),
				  lcon = this.id; //iconMenuBuilder.dmb.getConnectorById(this.id);

				  if (element != undefined)
					 dm.dm.loader.LoadElement(element);
	//			if ((lcon != undefined) && (lcon['oneway'])) {
		//		  $.log("CONNECTOR: " + lcon.connector);
			//	  iconMenuBuilder.diagram.Connector(lcon.connector,
				//	  {'fromId': iconMenuBuilder.currentElement,
					//'toId': iconMenuBuilder.currentElement});
	//			} else {
				  iconMenuBuilder.diagram.Connector(this.id, {'fromId': iconMenuBuilder.currentElement, 'toId': "ConnectionHelper"});
		//		}
			}
			else {
			  return false;
			}
		  },
		  'drag': function(event, ui) {
			if (iconMenuBuilder.diagram) {
			  iconMenuBuilder.diagram.draw();
			}
		  },
		  'stop': function(event, ui) {
  		    if (!iconMenuBuilder.diagram)
			  return false;

			var tid = $(this).attr("aux"),
			element = {type: tid}, //$.extend({}, iconMenuBuilder.dmb.getElementById(tid)),
			lcon = this.id;//iconMenuBuilder.dmb.getConnectorById(this.id);

			if ((element != undefined) && ((lcon == undefined) || (!lcon['oneway']))) {
			  // Remove the temporary connector
			  iconMenuBuilder.diagram.removeConnector(iconMenuBuilder.currentElement, "ConnectionHelper", this.id);
			  element.left = ui.position.left;
			  element.top = ui.position.top;
			  var fromElement = iconMenuBuilder.refEl;
			  var thisid = this.id;
			  var expected_type = element.type;

			  //
			  // Local helper method
			  //
			  var handleConnector = function(toElement, isElFound) {
				iconMenuBuilder.diagram.Connector(thisid,
					{'fromId': fromElement.euid, 'toId': toElement.euid},
					function(connector) {
					  if (fromElement.dropHelper)
						fromElement.dropHelper(ui, connector, {isElFound:true});
					  if (toElement.dropHelper)
						toElement.dropHelper(ui, connector, {isElFound:isElFound, expected:expected_type});
					  if (connector._updateEPoints)
						connector._updateEPoints(ui);
					}); // Connector
			  };
			  // Create an element or get element which was drop on
			  var el = iconMenuBuilder.diagram._dropConnector(ui);
			  if (el != undefined) {
				handleConnector(el, true);
			  }
			  else {
				iconMenuBuilder.diagram.Element(element.type, element, handleConnector);
			  }
			}
		  }})
		  .parent()
		  .mouseenter(function() {
			$(this).stop().animate({opacity:"1"});
		  })
		  .mouseleave(function() {$(this).stop().animate({opacity:"0"});});
	  },
	  //
	  // Enable menu showing for a diagram element.
	  // There are two use-cases for that:
	  //
      Enable : function(id, menu, el) {
        this.currentMenu = menu;
        this.currentElement = id;
		var menu_id = "us-" + menu + "-menu";
        this.refEl = el;
		this.diagram = el.parrent;
		$("#tabs .elmenu-" + menu_id + " img").draggable('option', 'appendTo', "#" + this.diagram.euid);
		
		// Allows to prevent menus showing of mouse over icons
		// on diagram change
        $(".elmenu-" + menu_id).css({display:"block"});
      },
	  //
	  // Disable menu showing for a diagram element id.
	  //
      Disable : function(id) {
	    var menu_id = "us-" + this.currentMenu + "-menu";

        // Allows to prevent menus showing of mouse over icons
		// on diagram change
		$(".elmenu-" + menu_id).css({display:"none"});

        // Prevent usage of icons over the wrong diagram		
		$("#tabs .elmenu-" + menu_id + " img").draggable('option', 'appendTo', "#tabs");
        this.currentMenu = undefined;
      },
	  //
	  // Show an icon menu on mouse enter to element
	  //
      Show: function(id, x, y) {
        var menu_id = "us-" + this.currentMenu + "-menu";

		if (this.currentElement == id) {
			if (y == undefined) {
			  this.refEl = x;
			  this.diagram = x.parrent;
			  x = undefined;
		    }
			var $el = $('#'+ id + "_Border");
			var pz = $el.position(),
			$did = $el.parent();
			var dpz = $did.offset();
			var scrollTop = $did.scrollTop(),
			scrollLeft = $did.scrollLeft();
			x = x || pz.left + 20;
			y = y || pz.top;

			$(".elmenu-" + menu_id).stop().css("left", x).css("top", y).animate({opacity:"1"});
		  }
	  },
	  //
	  // Hide menu on mouse exit from element
	  //
      Hide : function(id) {
        if (this.currentElement == id)
          $(".elmenu-us-" + this.currentMenu+"-menu").stop().animate({opacity:"0"});
      }
	};

    return getInstance(hmenus);
  }

  //
  //Common diagram menu namespace
  //
  dm.ms['ds'] = dm.ms.ds;
  // 
  // Diagram menus counter  - GLOBAL OBJECT
  //
  dm.dm.dmc = 0;
  
  //
  // COMMON functionality for the ACCORDION MENU and icon and context menu loading on diagram-type activation
  // STEPS:
  // 1. Load the diagram description menu (if not available)
  // 2. Initiate an element context menu and icon menu for all available elements
  // 3. Setup menus handlers for the accordion
  // 
  dm.ms.ds['common'] = function(type, diagram, loader) {
    //
    // Do nothing if menus was loaded before
	//
    if (dm.ms.ds[type]) {
      // Initialize the context menu for Element 
      var iconMenuBuilder = new dm.ms.IconMenuBuilder(null),
      ctxMenuBuilder = new dm.ms.ContextMenuBuilder(loader);

	  diagram.setMenuBuilder("context", ctxMenuBuilder);
	  diagram.setMenuBuilder("icon", iconMenuBuilder);
	  return;
	}

    //elements counter
    this.ec = 0;
    this.loader = loader;
    this.menus = [];  //elmenu[state] [state] [connector]  = image;

    var diagramMenuBuilder = this;
	
    // Load the JSON description of the 'type' diagram
    dm.dm.loader.LoadDiagramMenuData(type, function(json) {
	  // Do nothing in case of wrong JSON
	  if (!json || !json[0]) {
	    return;
	  }

	  var accept = json["diagram"] ? json["diagram"]["accept"]: undefined;
	  // JSON description was loaded, setup the menu builder for the diagram
	  dm.ms.ds[type] = {
	    main: diagramMenuBuilder,
		accept: accept
	  };
	
	  // Unique id's for the accordion menu
      var euid = "element-menu-" + dm.dm.dmc,
      ulid = "element-item-" + dm.dm.dmc;
      var innerHtml = "<div id='"+euid+"' class='toobox-item' style='padding-left:0;'><ul id='"+ulid+"' style='overflow:hidden;'>";

	  // Increase global counter
      dm.dm.dmc++;

      var ddata = json[0];
      var items = [];

      diagramMenuBuilder.elements = ddata['elements'];
      diagramMenuBuilder.connectors = ddata['connectors'];

      //innerHtml += items.join('');
      innerHtml += "</ul></div>";


      // TODO: disable menu items if loader failed to load element or connector type
      diagram.setMenuBuilder("main", diagramMenuBuilder);

      diagramMenuBuilder.getElementByKey = function(id, key) {
	    for (var v in diagramMenuBuilder.elements) {
		  if (diagramMenuBuilder.elements[v][key] == id) {
		    return diagramMenuBuilder.elements[v];
		  }
		}
        return null;
      }

      diagramMenuBuilder.getConnectorByKey = function(id, key) {
	    for (var v in diagramMenuBuilder.connectors) {
		  if (diagramMenuBuilder.connectors[v][key] == id) {
		    return diagramMenuBuilder.connectors[v];
		  }
		}
        return null;
      }

      // Initialize the context menu for Element 
      var iconMenuBuilder = new dm.ms.IconMenuBuilder(ddata['icon_menus']),
      ctxMenuBuilder = new dm.ms.ContextMenuBuilder(loader);

	  diagram.setMenuBuilder("context", ctxMenuBuilder);
	  diagram.setMenuBuilder("icon", iconMenuBuilder);

      var fw = dm.dm.fw;
		fw['CreateDiagramMenu'](type, innerHtml, function() { 
		  $("#"+ulid).listmenu({
			selector: "element-selector",
			urlPrefix: dm.dm.loader.getUrl(),
			selectable: false,
			path:"./",
			data: diagramMenuBuilder.elements,
			onSelect: function(item) {
			  self.ec++;
			  var menus = [];
			  var fw = dm.dm.fw;
			  var diagram = fw.getActiveDiagram();

			  if (diagram) {
			    diagram.setDropHelper();
			  }

			  if (item != undefined) {
			    // Load icon menu for a specific element type
			    iconMenuBuilder.load(item.type, diagram);
				// Create an Element on active diagram
			    if (diagram)
				  diagram.Element(item.type, item.options);
			  }
		    }
		  });

		  $("#"+ulid).listmenu({
			selector: "connector-selector",
			selectable: true,
			urlPrefix: dm.dm.loader.getUrl(),
			path:"./",
			data:diagramMenuBuilder.connectors,
			onSelect: function(item) {
			var selConn = item["type"];
			var fw = dm.dm.fw;
			var diagram = fw.getActiveDiagram();

			if (diagram) {
			  diagram.setDropHelper(selConn);
			}
		  }
		  });
        }); // CreateDiagramMenu
    });
  }
//@aspect
})(jQuery, dm);
