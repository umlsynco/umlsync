/*
Class: loader

Lazy load of diagrams, elements, connectors and it's menus:
// dm/ - diagram manager
// dm/ms - menus
// dm/ms/ctx - context menu
// dm/ms/ds - diagram's menu
// dm/ds - diagram classes folder
// dm/ds/diagram.js - base class for diagram, element and connector
// dm/ds/<type>.js - <type> of diagram class,package etc...
// dm/es/ - element classes folder
// dm/es/<type>.js - <type> of element image, class, artifact etc...
// dm/cs/<type>.js - <type> of connector aggragation, composition etc ...

// TBD:
// dm/ms/vp - main diagram load menu
// dm/hs/tabbed.js - tabs based diagram handler
// dm/hs/plain.js - handler to insert diagrams into the docuemnt (not implemented)

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2011 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  umlsync.org/about

Version:
  2.0.0 (2012-07-12)
 */
//@aspect
(function($, dm, undefined) {
    //@export:dm.base.loader:plain
    dm.base.loader = function(urlArg) {

        this.instance = null; 
     
        var createInstance = function() { 
            this.working = false;
 
            return {
            _addToLoadQueue: function(item) {
                var instance = dm.dm['loader'];
                if (!instance._loadQueue) {
                    instance.working = false;
                    instance._loadQueue = new Array();
                }
                instance._loadQueue.push(item);
                instance._process(false);
            },
            _process: function(isAjaxCallback) {
                var item = null;
                var instance = dm.dm['loader'];
                if (instance.working) {
                    return;
                }
                
                if ((isAjaxCallback && instance._loadQueue.length > 0) || (instance._loadQueue.length == 1 && !instance.working)) {
                    
                    instance.working = true;
                    item = instance._loadQueue.shift();
                    
                }

                if (item) {
                    var callback = item.callback,
                    data = item.data,
                    self = instance;

                    // Check that we still need to load data
                    // It is possible that previous item 
                    // loaded all necessary data yet.
                    if (item.precondition()) {
                        $.ajax({
                            'url': urlArg + item.url,
                            'dataType': "script",
                            'success': function(){
                            callback(data);
                            self.working = false;
                            self._process(true);
                        },
                        'error': function(){
                            // Do not call calback on failed
                            // callback(data);
                            alert("Failed to load: " + urlArg + item.url);
                            self.working = false;
                            self._process(true);
                        }
                        });
                    }
                    else {
                        callback(data);
                        self.working = false;
                        self._process(true); 
                    }
                } else {
                    instance.working = false;
                }
            },
            //@proexp
            'OnLoadComplete': function(callback2, options) {
                this._addToLoadQueue({
                    url: "",
                    precondition: function() { return false;},
                    callback: function(opt) { if (callback2) callback2(opt);},
                    data: options
                });
            },
            //@proexp
            'LoadMainMenuData': function(callback) {
                // There is no dependency on main menu load sequence
                // therefore it is possible to load is asynchronious
                $.ajax({
                      'url': urlArg + "dm/ms/us/main.json",
                      'dataType': 'json',
                      'success': function(data) {
                             if (callback)
                                 callback(data, urlArg);
                      },
                      'error': function(XMLHttpRequest, textStatus, errorThrown){
                           alert("Load the main menu description failed:" + textStatus + ":\n XHTTP"+ XMLHttpRequest+ "\n ERR:"+ errorThrown);
                      }
                });//ajax
            },
            //@proexp
            'LoadDiagramMenuData': function(type, callback) {
                // There is no dependency on main menu load sequence
                // therefore it is possible to load is asynchronious
				self.dmenus = self.dmenus || {};
				if (self.dmenus[type]) {
				  callback(self.dmenus[type]);
				  return;
				}

                $.ajax({
                      'url': urlArg + "/dm/ms/us/ds/" + type + "_with_menu.json",
                      'dataType': 'json',
                      'success': function(data) {
					         self.dmenus[type] = data;
                             if (callback)
                                 callback(data);
                      },
                      'error': function(XMLHttpRequest, textStatus, errorThrown){
                           alert("Load the diagram menu description failed:" + textStatus + ":\n XHTTP"+ XMLHttpRequest+ "\n ERR:"+ errorThrown);
                      }
                });//ajax
            },
            //@proexp
            'Menu': function(type, specific, options) {
                this._addToLoadQueue({
                    url: "/dm/ms/" + type + "/" + specific +".js", 
                    precondition: function() {
                    if ((dm.ms[type] == undefined)
                            || (dm.ms[type][specific] == undefined)) {
                        return true;
                    }
                    return false;
                },
                callback: function(opt) { 
                    return new dm.ms[type][specific](opt);
                },
                data: options
                });
            },
            //@proexp
            'CreateContextMenu': function(name, menuBuilder) {
                this._addToLoadQueue({
                    url: "./dm/ms/ctx/" + name + ".js",
                    precondition: function(options) {
                    if (dm.ms['ctx'][name] == undefined) {
                        return true;
                    }
                    return false;
                },
                callback: function(options) { 
                    return new dm.ms['ctx'][name](options);
                },
                data: menuBuilder
                });
            },
            //@no-export
            'CreateDiagramMenu': function(type, diagram, callback2) {
                var self2 = this;
                this._addToLoadQueue({
                    url: "dm/ms/ds/common.js",
                    precondition: function() {
                    if ((dm['dm'] == undefined)
                            || (dm['ms']['ds'] == undefined)
                            || (dm['ms']['ds']['common'] == undefined)) {
                        return true;
                    }
                    return false;
                },
                callback: function(data) {
                    var obj = new dm['ms']['ds']['common'](data, diagram, self2);
                    if (callback2 != undefined)
                        callback2(obj);
                },
                data:type
                });
            },
            //@proexp
            'Diagram': function(dName, dType, options, parrent, argCallback) {

                if ((dm['ds'] == undefined)
                        || (dm['ds']['diagram'] == undefined)) {
                    // it is secure because LazyLoad deal with queue
                    this._addToLoadQueue({
                        url: "./dm/ds/diagram.js",
                        precondition: function() {return true;},
                        callback:function(data) {},
                        data: null       
                    });
                }

                var self = this;
                options.loader = this;
                var opt = {},
                option = options || {};
                option['type'] = dName;
                option['base_type'] = dType;
                opt.options = options;
                opt.diagram = dName;
                opt.type = dType;
                opt.parrent = parrent;

                this._addToLoadQueue({
                    url:"/dm/ds/" + dType + ".js",
                    precondition: function() {
                    if ((dm['ds'] == undefined)
                            || (dm['ds'][dType] == undefined)) {
                        return true;
                    }
                    return false;
                },
                callback: function(data) {
                    var newdiagram = new dm['ds'][data.type](options, parrent);
                    $.log("NAME: " + parrent);
                    if (argCallback) {
                        argCallback(newdiagram);
                    }
                    self['CreateDiagramMenu'](opt.diagram, newdiagram);
                    return newdiagram;
                },
                data: opt
                });

                /*{
                    var newdiagram = new dm.ds[dType](options, jsonDesc, parrentId);
                    self.CreateDiagramMenu(dName, newdiagram);
                    return newdiagram;
             }*/
            },
            //@proexp
            'LoadElement': function(type) {

                if (dm['es'] == undefined) {
                    alert("You should create diagram instance first !!!");
                    return;
                }

                if (dm['es'][type] == undefined) {
                    // start element loading, but do not allocate it
                    this._addToLoadQueue({
                        url: "/dm/es/" + type + ".js",
                        precondition: function() {
                        if (dm['es'][type] == undefined) {
                            return true;
                        }
                        return false;
                    },
                    callback: function() {}
                    });
                }
            },
            //@proexp
            'Element': function(type, options, diagram, callback2) {

                if (dm['es'] == undefined) {
                    alert("You should create diagram instance first !!!");
                    return;
                }

                var opt = {};
                opt.options = options;
                opt.type = type;
                opt.diagram = diagram;
                this._addToLoadQueue({
                    url: "/dm/es/" + type + ".js",
                    precondition: function() {
                    if (dm['es'][type] == undefined) {
                        return true;
                    }
                    return false;
                },
                callback: function(o) { 
                    var e2 = new dm['es'][o.type](o.options, o.diagram);
                    if (callback2)
                        callback2(e2);
                },
                data:opt
                });
            },
            //@proexp
            'Connector': function(type, options, diagram, callback2) {

                if (dm.cs == undefined) {
                    alert("You should create diagram instance first !!!");
                    return;
                }

                var opt = {};
                opt.options = options;
                opt.type = type;
                opt.diagram = diagram;

                this._addToLoadQueue({
                    url: "./dm/cs/" + type + ".js",
                    precondition: function() {
                    if (dm['cs'][type] == undefined) {
                        return true;
                    }
                    return false;
                },
                callback: function(o) {
                    var e2 = new dm['cs'][o.type](o.options, o.diagram);
                    if (callback2 != undefined)
                        callback2(e2);
                },
                data: opt});
            }
            }; 
        };
        
        var getInstance = function() { 
            if (!this.instance) { 
                // create a instance 
                this.instance = createInstance(); 
                this.instance.url = urlArg; // Some reference in diagram's menu
                this.instance.working = false;
                // Global export
                dm['dm']['loader'] = this.instance;
            } 
     
            // return the instance of the singletonClass 
            return this.instance; 
        }
        return getInstance(); 
    };
    //@print
    dm['base']['loader'] = dm.base.loader;
//@aspect
})(jQuery, dm);

