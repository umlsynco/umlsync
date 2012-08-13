

(function( $, dm, undefined ) {
dm = dm || {};
dm.hs = dm.hs || {};
dm.hs.menu = dm.hs.menu || {};
dm.base = dm.base || {};
dm.base.menu = dm.base.menu  | {};
dm.base.menu.ds = dm.base.menu.ds || {};

dm.base.MenuHandler = function(options) {
   
}

dm.base.MenuHandler.prototype = {
   options : {
      // multi loading, support of 
      theme:'vp',
      llurl:'' // lazy load URL
   },
   _loadOrConfigure: function(list, type, theme) {
     if (theme == undefined)
        theme = this.theme;
     if (dm[base][menu][type][theme] == undefined) {
        // lazy load from: 
        $.getScript(this.options.llurl + "/dm/hs/menu/" + type + "_" + theme + ".js");
        dm.hs.menu[type + theme] = new dm[base][menu][type][theme](options, list);
     } else {
        dm.hs.menu[type + theme].configure(list);
     }

   },
   getDiagramsSelectorMenu: function(list, parent, theme) {
     _loadOrConfigure(list, parent, "ds", theme);
   },
   getElementsSelectorMenu: function(list, theme) {
     _loadOrConfigure(list, "es", theme);
   },
   getConnectorsSelectorMenu: function(list, theme) {
     _loadOrConfigure(list, "cs", theme);
   }
}

dm.hs.mh = new dm.base.MenuHandler({llurl:"http://localhost:8000/diagrams/"});

})(jQuery, dm);
