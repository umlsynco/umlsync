/*
Class: common

Common diagram menu loader which based on JSON description
of diagram and it's components

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com).
  All rights reserved. 

URL:
  http://umlsync.org/about

Version:
  2.0.0 (2012-07-17)
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
	           onSelect: function(item) {
  			      if (item.click)
				    item.click(menuBuilder.currentElement, self.x, self.y);
				  //e.preventDefault();
                  menuBuilder['HideAll']();
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
			var $did = $("#" + menuBuilder.diagramId);
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


//    Common context menu for element for the diagram
//    One instance for each diagram

//    param  name - name of the context menu
//    param loader - common loader for components
//    param diagram.id - diagram unique DIV id 
//    diagram - the diagram class

	//@export:dm.ms.ContextMenuBuilder:plain
    dm.ms.ContextMenuBuilder = function(loader, diagram, dmb) {
        this.diagram = diagram;
        this.dmb = dmb;
        this.diagramId = diagram.euid;
        this.currentMenu = undefined;
        this.currentElement = undefined;
        this.loader = loader;
        this.menus = [];

        this.load = function(name) {
            if (this.menus[name] == undefined)
                dm.dm.loader.CreateContextMenu(name, this);
        }

        this.append = function(obj, id) {
            this.menus[id] = obj;
        }

        this.visit = function(element, x, y) {
            if (this.currentMenu != undefined) {
                this.currentMenu['Hide']();
                this.currentMenu = undefined;
                this.currentElement = undefined;
            }

            if (element.options.ctx_menu == undefined)
                return;

            this.currentMenu = this.menus[element.options.ctx_menu];
            this.currentElement = element;
            if (this.currentMenu != undefined)
                this.currentMenu['Show'](element, x, y); // TODO: relocate to element position  
        }

        this['HideAll'] = function() {
            if (this.currentMenu != undefined)
                this.currentMenu['Hide']();
            this.currentMenu = undefined;
            this.currentElement = undefined;
        };

        diagram.setMenuBuilder("context", this);
        // Ugly hacking to have context menu for all connectors
        this.load('connector');
    }

    //@print

    //Common element menu loader
	//@export:dm.ms.IconMenuBuilder:plain
    dm.ms.IconMenuBuilder = function(hmenus, diagram, dmb) {
        this.menus = [];
        this.diagram = diagram;
        this.currentMenu = undefined;
        this.currentElement = undefined;
        this.dmb = dmb;

        // Prepared the list of connectors for menus 
        for (var dd in hmenus) {
            this.menus[hmenus[dd]['id']] = [];
            for (var tt in hmenus[dd]['items']) {
                this.menus[hmenus[dd]['id']][hmenus[dd]['items'][tt]['el']] = [];
                var connectors = hmenus[dd]['items'][tt]['cs'];
                for (var cc in connectors) {
                    this.menus[hmenus[dd]['id']][hmenus[dd]['items'][tt]['el']][connectors[cc]['connector']] = connectors[cc]['icon'];
                }
            }     
        }

        this.load = function(menu_id) {
            // Check that menu type is defined
            // And that it was not load before

            if ((this.menus[menu_id] == undefined)
                    || ($("#" + this.diagram.euid + " .elmenu-" + menu_id).is("div")))
                return;

            // lets create the menu
            var menu_items = [];
            for (var c in this.menus[menu_id])       // element descriptor
                for (var r in this.menus[menu_id][c])  // connector descriptor
                    menu_items.push("<img src='" + dm.dm.loader.url + this.menus[menu_id][c][r] +"' id='" + r +"' title='"+ r + "' aux='" + c + "' style='padding:1px;'></img>");

            var cells = menu_items.join('');

            // Append menu to the diagram
            $("#" + this.diagram.euid).append("<div style='position:absolute;left:200px;z-index:19999998;' class='elmenu-" + menu_id +"'>" + cells + "</div>");

            // Hide the element
            $(' .elmenu-' + menu_id).css({opacity:"0"});

            var iconMenuBuilder = this;

            // Make it possible to click + drag images 
            // ==========================================================================
            //               THERE ARE TWO CALL's HERE FOR DRAGGABLE!!!!!
            //               IT IS NECESSARY TO JOIN THEM - OR DESCRIBE THE DIFFERENCE :)
            //               ONE FOR USUAL MENU AND ANOTHER ONE FOR SELF-CONNECTABLE ITEMS
            //               WHICH DOESN'T REQUIRE THE 2-nd ELEMENT
            $("#" + this.diagram.euid + " .elmenu-" + menu_id + " img").draggable({
                'appendTo': "#" + iconMenuBuilder.diagram.euid,
                'helper': function(event) {
                  // Use the double wrapper because of element's structrure
                  return $("<div id='ConnectionHelper_Border' style='border:solid black;border-width:1px;'>" + 
                    "<div id='ConnectionHelper' style='border:solid yellow;border-width:1px;'> [ x ]</div></div>");
                },
                'start': function(event) {
                  var tid = $(this).attr("aux");
                  var element = iconMenuBuilder.dmb.getElementById(tid),
                      lcon = iconMenuBuilder.dmb.getConnectorById(this.id);

                  if ((element != undefined) && (element.element != undefined))
                    dm.dm.loader.LoadElement(element.element);
                  if ((lcon != undefined) && (lcon['oneway'])) {
				      $.log("CONNECTOR: " + lcon.connector);
                      iconMenuBuilder.diagram.Connector(lcon.connector,
                           {'fromId': iconMenuBuilder.currentElement,
						    'toId': iconMenuBuilder.currentElement});
                    } else {
                       iconMenuBuilder.diagram.Connector(this.id, {'fromId': iconMenuBuilder.currentElement, 'toId': "ConnectionHelper"});
                    }
                },
                'drag': function(event) {iconMenuBuilder.diagram.draw();},
                'stop': function(event, ui) {
                  var tid = $(this).attr("aux"),
                      element = $.extend({}, iconMenuBuilder.dmb.getElementById(tid)),
                      lcon = iconMenuBuilder.dmb.getConnectorById(this.id);

                  if ((element != undefined) && ((lcon == undefined) || (!lcon['oneway']))) {
                    // Remove the temporary connector
                    iconMenuBuilder.diagram.removeConnector(iconMenuBuilder.currentElement, "ConnectionHelper", this.id);
                    element.pageX = ui.position.left;
                    element.pageY = ui.position.top;
                    var fromElement = iconMenuBuilder.refEl;
                    var thisid = this.id;
                    var handleConnector = function(toElement) {
                         iconMenuBuilder.diagram.Connector(thisid,
                             {'fromId': fromElement.euid, 'toId': toElement.euid},
                             function(connector) {
                               if (fromElement.dropHelper)
                                 fromElement.dropHelper(ui, connector);
                               if (toElement.dropHelper)
                                 toElement.dropHelper(ui, connector);
                               if (connector._updateEPoints)
                                 connector._updateEPoints(ui);
                         }); // Connector
                    };
                    // Create an element or get element which was drop on
                    var el = iconMenuBuilder.diagram._dropConnector(ui);
                    if (el != undefined) {
                      handleConnector(el);
                    }
                    else {
                       iconMenuBuilder.diagram.Element(element.type, element, handleConnector);
                    }
                }
            }})
            .mouseenter(function() {
                $("#" + diagram.euid + " .elmenu-" + menu_id).stop().animate({opacity:"1"});
            })
            .mouseleave(function() {$("#" + diagram.euid + " .elmenu-" + menu_id).animate({opacity:"0"});});
            this.menus[menu_id].loaded = true;
        }
        this['Enable'] = function(id, menu, el) {
            this.currentMenu = menu;
            this.currentElement = id;
            this.refEl = el;
            $(".elmenu-" + this.currentMenu).css({display:"block"});
        }
        this['Disable'] = function(id) {
            $(".elmenu-" + this.currentMenu).css({display:"none"});     
            this.currentMenu = undefined;
        }
        this['Show'] = function(id, x, y) {
            if (this.currentElement == id) {
                if (y == undefined) {
                    this.refEl = x;
                    x = undefined;

                }
                var $el = $('#'+ id + "_Border");
				var pz = $el.position(),
				    $did = $el.parent();
               var dpz = $did.offset();
			   var scrollTop = $did.scrollTop(),
                   scrollLeft = $did.scrollLeft();
                   x = x || pz.left + scrollLeft + 20;
                   y = y || pz.top  + scrollTop  - 20;

                $(".elmenu-" + this.currentMenu).stop().css("left", x).css("top", y).animate({opacity:"1"});
            }
        }
        this['Hide'] = function(id) {
            if (this.currentElement == id)
                $(".elmenu-" + this.currentMenu).stop().animate({opacity:"0"});
        };
        diagram.setMenuBuilder("icon", this);
    }

    //@print

    //Common diagram menu loader
    dm.ms['ds'] = dm.ms.ds;
    dm.dm.dmc = 0; // Diagram menus counter 
    dm.ms.ds['common'] = function(type, diagram, loader) {

        //elements counter
        this.ec = 0;
        this.loader = loader;
        this.menus = [];  //elmenu[state] [state] [connector]  = image;

        var diagramMenuBuilder = this;

        dm.dm.loader.LoadDiagramMenuData(type, function(json) {
            var euid = "element-menu-" + dm.dm.dmc,
			    ulid = "element-item-" + dm.dm.dmc;
            var innerHtml = "<div id='"+euid+"' class='toobox-item' style='padding-left:0;'><ul id='"+ulid+"' style='overflow:hidden;'>";
            dm.dm.dmc++;

            var ddata = json;
            var elements = ddata[0]['elements'],
            connectors = ddata[0]['connectors'],
            hmenus = ddata[0]['menus'];
            var items = [];

            diagramMenuBuilder.elements = [];
            diagramMenuBuilder.connectors = [];

            // Prepare the list of elements. Clickable left side menu 
            for (var d in elements) {
                // the list of elements
                diagramMenuBuilder.elements[elements[d].title] = elements[d];
                diagramMenuBuilder.elements[elements[d].title].editable = true;
/*
                var image = (elements[d]['image'][0]["small"]) ? "list-style-image:url(\'" +dm.dm.loader.url +  elements[d]['image'][0]["small"] + "\')" : "list-style-type:none";
                items.push('<li class="elementSelector" style="cursor:pointer;' + image
    + ';" id="'  + elements[d].description +'" imgpath="' + elements[d].image_path + '">' +
    elements[d].description + '</li>');
	//<li style="list-style:none;width:80%;border-top:1px solid black;border-bottom:1px solid #6B6B6B;height:1px;background-color:3px solid #888888;"></li>
*/
            }

            var self = this;

            // Prepare the list of connectors. Clickable left side menu 
            for (var d in connectors) {
                var desc = connectors[d].connector;
                if (connectors[d]['oneway'])
                    desc = connectors[d].title;

                diagramMenuBuilder.connectors[desc] = connectors[d];
                diagramMenuBuilder.connectors[desc].editable = true;
/*
                var image = (connectors[d]['image'][0]["small"]) ? "list-style-image:url(\'" + dm.dm.loader.url + connectors[d]['image'][0]["small"] + "\')" : "list-style-type:none";
                items.push('<li class="connectorSelector" style="cursor:pointer;' + image
    + ';" id="'  + connectors[d].connector +'">' +
    connectors[d].description + '</li>');
	//<li style="list-style:none;width:80%;border-top:1px solid black;border-bottom:1px solid #6B6B6B;height:1px;background-color:3px solid #888888;"></li>
	*/
            }

            //innerHtml += items.join('');
            innerHtml += "</ul></div>";
			

            // Append menu to diagram
            //$("#" + diagram.euid).append(innerHtml);
		
            // Identify the parrent class for diagram
            // TODO:   Prvide class reference as argument instead for diagram.id
            // var d1 = diagram.id;
            // var dd = $("#" + d1).parrent().get(0).id;
            // self.diagram = $("#" + dd).data(d1);
            // var diagram = self.diagram;

            // TODO: disable menu items if loader failed to load element or connector type
            diagram.setMenuBuilder("main", diagramMenuBuilder);

            diagramMenuBuilder.getElementById = function(id) {
                return diagramMenuBuilder.elements[id];
            }

            diagramMenuBuilder.getConnectorById = function(id) {
                return diagramMenuBuilder.connectors[id];
            }

            // Initialize the context menu for Element 
            // TODO: if not editable ? 
            // TODO: put both menu builders to the 
            var iconMenuBuilder = new dm.ms.IconMenuBuilder(hmenus, diagram, diagramMenuBuilder),
            ctxMenuBuilder = new dm.ms.ContextMenuBuilder(loader, diagram, diagramMenuBuilder);

            var fw = dm.dm.fw;
            if (!fw['ActivateDiagramMenu'](type)) {
                
                fw['CreateDiagramMenu'](type, innerHtml, function() { 
            $("#"+ulid).listmenu({
	           selector: "element-selector",
	           selectable: false,
			   path:"./",
	           data:elements,
	           onSelect: function(item) {
	             self.ec++;
                 var menus = [];
                 var fw = dm.dm.fw;
                 var diagram = fw.activeDiagram();
				 
                 var loadElement = diagramMenuBuilder.getElementById(item.title);

                 if (loadElement != undefined) {
				    if  (loadElement.menu != undefined)
                     iconMenuBuilder.load(item.title, loadElement);
                    if (diagram)
                      diagram.Element(loadElement.type, loadElement);
				 }
	           }
            });

			$("#"+ulid).listmenu({
	           selector: "connector-selector",
	           selectable: true,
			   path:"./",
	           data:connectors,
	           onSelect: function(item) {
	             alert("selected connector");
	           }
            });
              
/*			  $("#" + euid + " .elementSelector")
                   .hover(function() {$(this).addClass('hover');}, function() {$(this).removeClass('hover');})  
                   .click(function(){
                      
                   });

                   $("#" + euid + " .connectorSelector")
                   .hover(function() {$(this).addClass('hover');}, function() {$(this).removeClass('hover');})
                   .click(function(e){
                      $(this).addClass('selected');
                      var selConn = this.id;
                      e.stopPropagation();
                // TODO:  diagram.EnableConnectionHelper
                /*
      $("#" + diagram.id + " .us-element-border").draggable(
          {appendTo: "#" + diagram.id,
                    helper:function(event) {
                        return $("<div id='ConnectionHelper_Border' style='border:solid black;border-width:1px;'> <div id='ConnectionHelper' style='border:solid yellow;border-width:1px;'> [ x ]</div></div>");
                           },
                    start: function(event) {
                       // alert(this.euid);
                       var sel = this.euid;
                       sel = sel.substr(0, sel.length -7);
                       dm.dm.loader.Connector(selConn, {selected: sel, temporary: "ConnectionHelper"},
             {}, diagram);
                           },
                    drag: function(event) {
                       diagram.draw();
                    },
                    stop: function(event) {
                       var offset = $("#" + diagram.id).position();
                      var name = diagram.checkdrop((event.pageX - offset.left), (event.pageY -offset.top));

                      // Remove the temporary connector
                      var sel = this.euid;
                      sel = sel.substr(0, sel.length -7);
                      diagram.removeConnector(sel, "ConnectionHelper", selConn);

                      if (name != undefined)
                         dm.dm.loader.Connector(selConn, {selected: sel, temporary: name}, {}, diagram);                      
                      // Remove selection from menu item
                      $('.connectorSelector').removeClass('selected');
               // Enable DND for elements again
               $("#" + diagram.id + " .us-element-border").draggable( { helper : 'original', start:function(){},  stop:function(){}, drag:function(){



               diagram.draw();
       }} );

                      // Create an element or get element which was drop on
                      //

                      // Create connection with the created element ??/
                      // How to create connection if element should be lazy loaded, but the connector already loaded ???
                    }
          });*/
                // TODO: enable drag helper for connectors
                //dm.dm.loader.Connector(this.euid, self.options, {}, self.diagram);
//                    });
            
			
			}); // CreateDiagramMenu
            } // if !ActivateDiagramMenu
		});
    }
//@aspect
})(jQuery, dm);
