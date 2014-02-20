/*
Class: common

Common diagram menu loader which based on JSON description
of diagram and it's components

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2010-2014 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com).
  All rights reserved. 

URL:
  http://umlsync.org/about

 */


(function($, dm, undefined) {
  //
  // Unified context menu initializer for diagram elements:
  //
  // @param menuBuilder - the context menu builder
  //
  // @param options : id  - title of elment
  //                  uid - uniqie id of HTML element
  //
  // @param actions : title - menu title
  //                  click - on click handler with diagram element as argument
  //
  dm.ms.ctx['common'] = function(menuBuilder, options, actions) {
    this.options = options;  
    var menu = $('<ul id="' + options.uid + '" class="context-menu" ></ul>').hide().appendTo("#tabs");
    menuBuilder.append(this, options.id); // element Class Context append to diagram
    var self = this;

    $(menu).listmenu({
	    //
		// Items and handlers
		//
        data:actions,
		//
		// TODO: Some usless prefix ? 
		//
        urlPrefix: dm.dm.loader.getUrl(),
		//
		// On context menu item selct handler
		// 
        onSelect: function(item) {
          if (item.click)
            item.click(menuBuilder.currentElement, self.x, self.y);
          //e.preventDefault();
          menuBuilder['hideAll']();
        },
		//
		// Helper method for a menu extension
		// 
        onMouseEnter: function(item, evt) {
          if (item.mouseenter)
            item.mouseenter(menuBuilder.currentElement, evt);
        },
		//
		// Helper method for a menu extension
		// 
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

    this['show'] = function(element, x, y) {
      $(".context-menu").hide();
      //show element context menu
      var $did = $("#tabs");
      var pz = $did.offset();
      var scrollTop = 0;//$did.scrollTop(),
      scrollLeft = 0;//$did.scrollLeft();
      this.x = x - pz.left + scrollTop;
      this.y = y - pz.top + scrollLeft;



      //$("#" + menuBuilder.diagramId + " #" + options.uid).css({"left":x-pz.left, "top":y - pz.top}).show();
	  var ttt = "#tabs #" + this.options.uid;
	  var $ttt = $(ttt);
      $ttt.css({"left":x-pz.left + scrollLeft, "top":y - pz.top + scrollTop}).show();

	  var ctb = $("#context-toolbox");
      ctb.css({"left":x, "top":y-ctb.height() -10}).show();
    };

    this['hide'] = function() {
      $(".context-menu").hide();
      $("#" + menuBuilder.diagramId + " #" + options.uid).hide();
      $("#context-toolbox").hide();
    };
  };

  //
  // The context menu namespace
  //
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
      var mapping = {};
      mapping["class"] = {menu:"class"};
      mapping["connector"] = {menu:"connector"};
      mapping["sequence"] = {menu:"sequence"};

      this.config = mapping;
	};

    ContextMenuBuilder.prototype = {
	    //
		// The list of loaded menus
		// [{element.type, diagram.type} -> menu uid]
		//
        menus : [],
		//
		// Helper method to get the context menu uid
		// @param type  - the element type
		// @param dtype - the diagram type
		//
		_getMenuId: function(type, dtype) {
		  if (this.config[type]) {
		    return this.config[type].menu;
		  }
		  //
		  // The list of connectors.
		  // There is not special mapping for connectors for a while
		  //
		  if (["aggregation", "composition", "dependency",
		    "realization","generalization","association",
			"composition","anchor","llsequence","llselfcall",
			"nested"].indexOf(type) >= 0) {
		    return "connector";
		  }
		  return "default";
		},
		//
		// load the context menu handler (JS-handler)
		//
		load : function(type, diagram) {
		  this.diagram = diagram;
		  var name = this._getMenuId(type, diagram ? diagram.options.type : null);
		  if (this.menus[name] == undefined)
			dm.dm.loader.CreateContextMenu(name, this);
		},
		//
        // callback on the concreate menu creation
		//
		append : function(obj, id) {
		  this.menus[id] = obj;
		},
		//
        // click on element + coordinates
		//
		visit : function(element, x, y) {
		  if (this.currentMenu != undefined) {
			this.currentMenu['hide']();
			this.currentMenu = undefined;
			this.currentElement = undefined;
		  }

		  var name = this._getMenuId(element.options.type, this.diagram ? this.diagram.options.type : null);

		  // menu was not loaded or has some issues
		  if (this.menus[name] == undefined)
			return;

		  this.currentMenu = this.menus[name];
		  this.currentElement = element;
		  if (this.currentMenu != undefined)
			this.currentMenu['show'](element, x, y); // TODO: relocate to element position  
		},
        //
		// Hide all context menus
		//
		hideAll : function() {
		  if (this.currentMenu != undefined)
			this.currentMenu['hide']();
		  this.currentMenu = undefined;
		  this.currentElement = undefined;
		}
		};

		return getInstance();
  }


  //Common element menu loader
  dm.ms.IconMenuBuilder = function() {
  
	// singleton
	function getInstance() {
		dm.dm = dm.dm || {};
		if (!dm.dm['IconMenuBuilder']) {
		    
		var icon_menus = [
		  {"id":"us-class-menu",
		   "items": [
					{"element":{"type": "class"},
					 "connector":[
							{"type":"association",
							 "icon":"dm/icons/us/cs/class/class/association.png"
							},
							{"type":"aggregation",
							 "icon":"dm/icons/us/cs/class/class/aggregation.png"
							},
							{"type":"composition",
							 "icon":"dm/icons/us/cs/class/class/composition.png"
							},
							{"type":"selfassociation",
							 "icon":"dm/icons/us/cs/class/class/self-association.png"
							},
							{"type":"dependency",
							 "icon":"dm/icons/us/cs/class/class/dependency.png"
							},
							{"type":"realization",
							 "icon":"dm/icons/us/cs/class/class/realization.png"
							},
							{"type":"generalization",
							 "icon":"dm/icons/us/cs/class/class/generalization.png"
							},
							{"type":"nested",
							 "icon":"dm/icons/us/cs/class/class/nested.png"
							}
						  ]
					},
					{"element":{"type":"note"},
					 "connector":[
							{"type":"anchor",
							 "icon":"dm/icons/us/cs/diagram/anchor_with_note.gif"}
						  ]
					}
				 ]
		  },
		  {"id":"us-class-note-menu",
		   "items": [
					{"element":{"type":"class"},
					 "connector":[
							{"type":"anchor",
							 "icon":"dm/icons/us/cs/diagram/anchor_with_note.gif"}
						  ]
					},
					{"element":{"type":"note"},
					 "connector":[
							{"type":"anchor",
							 "icon":"dm/icons/us/cs/diagram/anchor_with_note.gif"}
						  ]
					}
				 ]
		  },
		  {"id":"us-component-note-menu",
		   "items": [
					{"element":{"type":"note"},
					 "connector":[
							{"type":"anchor",
							 "icon":"dm/icons/us/cs/diagram/anchor_with_note.gif"}
						  ]
					}
				 ]
		  },
		  {"id":"us-component-menu",
		   "items": [
					{"element":{"type":"component"},
					 "connector":[
							{"type":"association",
							 "icon":"dm/icons/us/cs/association.png"
							},
							{"type":"aggregation",
							 "icon":"dm/icons/us/cs/aggregation.png"
							},
							{"type":"composition",
							 "icon":"dm/icons/us/cs/composition.png"
							}
						  ]
					},
					{"element":{"type":"interface"},
					 "connector":[
							{"type":"association",
							 "icon":"dm/icons/us/cs/interface.png"
							}
						  ]
					},
					{"element":{"type":"empty"},
					 "connector":[
							{"type":"arc",
							 "icon":"dm/icons/us/cs/interface_required.png"
							}
						  ]
					},
					{"element":{"type":"port"},
					 "connector":[
							{"type":"association",
							 "icon":"dm/icons/us/cs/association.gif"
							}
						  ]
					},
					{"element":{"type":"note"},
					 "connector":[
							{"type":"anchor",
							 "icon":"dm/icons/us/cs/diagram/anchor_with_note.gif"}
						  ]
					}
				 ]
		  },
		  {"id":"us-package-menu",
		   "items": [
					{"element":{"type":"package"},
					 "connector":[
							{"type":"dependency",
							 "icon":"dm/icons/us/cs/dependency.png"
							},
							{"type":"access",
							 "icon":"dm/icons/us/cs/access.png"
							},
							{"type":"import",
							 "icon":"dm/icons/us/cs/import.png"
							},
							{"type":"generalization",
							 "icon":"dm/icons/us/cs/generalization.png"
							},
							{"type":"realization",
							 "icon":"dm/icons/us/cs/realization.png"
							},
							{"type":"dependency",
							 "icon":"dm/icons/us/cs/merge.png"
							},
							{"type":"nested",
							 "icon":"dm/icons/us/cs/nested.png"
							}
						  ]
					},
					{"element":{"type":"note"},
					 "connector":[
							{"type":"anchor",
							 "icon":"dm/icons/us/cs/diagram/anchor_with_note.gif"}
						  ]
					}
				 ]
		  },
		  {"id":"us-package-note-menu",
		   "items": [
					{"element":{"type":"note"},
					 "connector":[
							{"type":"anchor",
							 "icon":"dm/icons/us/cs/diagram/anchor_with_note.gif"}
						  ]
					}
				 ]
		  },
		  {"id":"us-objinstance-menu",
		   "items": [
					{"element":{"type":"objinstance"},
					 "connector":[
							{"type":"llsequence",
							 "icon":"dm/icons/us/cs/createobject.png"
							},
							{"type":"llreturn",
							 "icon":"dm/icons/us/cs/return.png"
							}
						  ]
					},
					{"element":{"type":"llport"},
					 "connector":[
							{"type":"llsequence",
							 "icon":"dm/icons/us/cs/sequence.png"
							},
							{"type":"llselfcall",
							 "icon":"dm/icons/us/cs/self-call.png"
							}
						  ]
					},
					{"element":{"type":"lldel"},
					 "connector":[
							{"type":"llsequence",
							 "icon":"dm/icons/us/cs/killobject.png"}
						  ]
					},
					{"element":{"type":"message"},
					 "connector":[
							{"type":"llsequence",
							 "icon":"dm/icons/us/cs/lostmessage.png"}
						  ]
					}
				 ]
		  },
		  {"id":"us-message-menu",
		   "items": [
					{"element":{"type":"objinstance"},
					 "connector":[
							{"type":"llsequence",
							 "icon":"dm/icons/us/cs/createobject.png"
							}
						  ]
					},
					{"element":{"type":"llport"},
					 "connector":[
							{"type":"llsequence",
							 "icon":"dm/icons/us/cs/sequence.png"
							}
						  ]
					}
				 ]
		  },
		  {"id":"us-sequence-note-menu",
		   "items": [
					{"element":{"type":"note"},
					 "connector":[
							{"type":"anchor",
							 "icon":"dm/icons/us/cs/diagram/anchor_with_note.gif"}
						  ]
					}
				 ]
		  }
		  ];
		var mapping_icons = {};
			mapping_icons["note"] = {};
			// Class diagram
			mapping_icons["class"] = {icon_menu:"us-class-menu"};
			mapping_icons["note"]["class"] = {icon_menu:"us-class-note-menu"};
			//Package diagram
			mapping_icons["package"] = {icon_menu:"us-package-menu"};
			mapping_icons["note"]["package"] = {icon_menu:"us-package-note-menu"};
			// Component diagram
			mapping_icons["component"] = {icon_menu:"us-component-menu"};
			mapping_icons["interface"] = {icon_menu:"us-component-menu"};
			mapping_icons["port"] = {icon_menu:"us-component-menu"};
			mapping_icons["empty"] = {icon_menu:"us-component-menu"};
			mapping_icons["note"]["component"] = {icon_menu:"us-component-note-menu"};
			// Sequence diagram
			mapping_icons["objinstance"] = {icon_menu:"us-objinstance-menu"};
			mapping_icons["llport"] = {icon_menu:"us-objinstance-menu"};
			mapping_icons["lldel"] = {icon_menu:"us-objinstance-menu"};
			mapping_icons["llalt"] = {icon_menu:"us-objinstance-menu"};
			mapping_icons["actor"] = {icon_menu:"us-objinstance-menu"};
			mapping_icons["note"]["sequence"] = {icon_menu:"us-sequence-note-menu"};

			// create a instance
			dm.dm['IconMenuBuilder'] = new IconMenuBuilder(icon_menus, mapping_icons);
		}

		// return the instance of the singletonClass
		return dm.dm['IconMenuBuilder'];
	}

	var IconMenuBuilder = function(hmenus, mapping) {
	  this.menus = mapping;
	  this.config = hmenus;
	};

	IconMenuBuilder.prototype = {
      //
	  // Helper method to get menu id
	  //
	  _getMenuId: function(type, dtype) {
	    if (!this.menus[type]) {
		  return null;
		}
		if (this.menus[type].icon_menu) {
		  return this.menus[type].icon_menu;
		}
		else if (this.menus[type][dtype] && this.menus[type][dtype].icon_menu) {
		  return this.menus[type][dtype].icon_menu
		}
		return null;
	  },
	  //
	  // Create an instance of menus element
	  //
      load : function(type, diagram) {
          var menu_id = this._getMenuId(type, diagram.options.type);
	      if (!menu_id) {
		    $.log("Error: There is no icon menu for " + type + " and diagram " + diagram.options.type);
			return;
		  }

          this.diagram = diagram;

		  //
		  // menu was loaded yet, do nothing
		  //
		  if ($(" .elmenu-" + menu_id).is("div")) {
			return menu_id;
		  }

		  //
		  // lets create the icon menu
		  //
		  var menu = null;
		  for (var gg in this.config) {
		    if (this.config[gg].id == menu_id) {
			  menu = this.config[gg].items;
			  break;
			}
		  }
		  // Exit if menu not available
		  if (!menu) {
		    return;
		  }

		  var menu_items = [];		  
		  for (var c in menu) {       // element descriptor
			for (var r in menu[c]["connector"])  // connector descriptor
			  menu_items.push("<img src='" + dm.dm.loader.url + menu[c]["connector"][r].icon +"' id='" + menu[c]["connector"][r].type +"' title='"+ menu[c]["connector"][r].type + "' aux='" + menu[c]["element"].type + "' style='padding:1px;'></img>");
	      }

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
		  
		  return menu_id;
	  },
	  //
	  // Enable menu showing for a diagram element.
	  // There are two use-cases for that:
	  //
      Enable : function(element) {
        this.currentMenu = this._getMenuId(element.options.type,
		                                   element.parrent.options.type);
		if (!this.currentMenu) {
		    $.log("Error: There is no icon menu for " + type + " and diagram " + diagram.options.type);
			return;
		}

        this.currentElement = element.euid;
        this.refEl = element;
		this.diagram = element.parrent;
		$("#tabs .elmenu-" + this.currentMenu + " img").draggable('option', 'appendTo', "#" + this.diagram.euid);
		
		// Allows to prevent menus showing of mouse over icons
		// on diagram change
        $(".elmenu-" + this.currentMenu).css({display:"block"});
      },
	  //
	  // Disable menu showing for a diagram element id.
	  //
      Disable : function(element) {
	    var menu_id = this.currentMenu;

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
      Show: function(element, x, y) {
        var menu_id = this.currentMenu;

		if (this.currentElement == element.euid) {
		    this.refEl = element;
			this.diagram = element.parrent;

			var $el = $('#'+ element.euid + "_Border");
			var pz = $el.position(),
			$did = $el.parent();
			var dpz = $did.offset();
			var scrollTop = $did.scrollTop(),
			scrollLeft = $did.scrollLeft();
			x = x || pz.left + 20;
			y = y || pz.top;

			$(".elmenu-" + menu_id).stop().css("left", x).css("top", y+30).animate({opacity:"1"});
		  }
	  },
	  //
	  // Hide menu on mouse exit from element
	  //
      Hide : function(element) {
        if (this.currentElement == element.euid)
          $(".elmenu-" + this.currentMenu).stop().animate({opacity:"0"});
      }
	};

    return getInstance();
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
      // Initialize the context menu for Elements of diagram 
      var iconMenuBuilder = new dm.ms.IconMenuBuilder(null),
        ctxMenuBuilder = new dm.ms.ContextMenuBuilder(loader);

	  // Setup menus
	  diagram.setMenuBuilder("context", ctxMenuBuilder);
	  diagram.setMenuBuilder("icon", iconMenuBuilder);
	  diagram.setMenuBuilder("main", dm.ms.ds[type]["main"]);
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

	  // JSON description was loaded, setup the menu builder for the diagram
	  dm.ms.ds[type] = {
	    main: diagramMenuBuilder
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
          //
          // Element selection menu
		  //
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

		  //
		  // Connector selection menu
		  //
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
