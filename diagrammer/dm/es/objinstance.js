/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.objinstance", dm.es.element, {
    options: {
        nameTemplate: "Object",
        acceptdrop: "package",
        top_min: 40,
        height: 400,
        resizable_h: 'e-u,s-u,w-u,sw-u,se-u',
        axis: 'x'
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="ElementResizeArea">\
                        <div id="' + this.euid + '_NEXT" class="UMLSyncInstance grElement" style="height:40px;">\
                        <div><a class="editablefield Name">:' + this.options.name+ '</a></div></div></div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
      this.parrent.Connector("lifeline", {fromId: this.euid, toId: this.euid});
    },
    _init: function () {
      if (this.options.height)
        $('#' + this.euid)
         .css('width', this.options.width).css('height', this.options.height);

     if (this.options.top_min)
        $('#' + this.euid + "_Border")
         .css('top', this.options.top_min);
    },
    onDropComplete: function() {
      var element = $("#" + this.euid + "_Border"),
          e_left = element.position().left + element.width() / 2;

      for (i in this.options.dropped) {
        var e = $("#" + this.options.dropped[i] + "_Border"),
            w = e.width()/2;
        e.css("left", e_left - w);
      }
      this.parrent.draw();
    },
    onResizeComplete: function() {
      var element = $("#" + this.euid + "_Border"),
          e_left = element.position().left + element.width() / 2;

      for (i in this.options.dropped) {
        var e = $("#" + this.options.dropped[i] + "_Border"),
            w = e.width()/2;
        e.css("left", e_left - w);
      }
      this.parrent.draw();
    },
    _getDropHelper: function(ui, isFrom) {
      var element = $("#" + this.euid + "_Border"),
          wd2 = element.width() / 2,
          x_top = element.position().top + element.height();

      for (i in this.options.dropped) {
        var e = $("#" + this.options.dropped[i] + "_Border"),
            p = e.position(),
            h = e.height(),
            w = e.width()/2;
           if ((ui.position.left > p.left - wd2 + w) // Check all parrent element width
          && (ui.position.left < p.left - w + wd2)
          && (ui.position.top > p.top -10)
          && (ui.position.top < p.top + h + 10)) {

          if (ui.position.top < p.top) {
            e.css("top", p.top -10).css("height", h+10);
          }
          if (ui.position.top > p.top + h) {
            e.css("height", h+10);
          }

          return this.options.dropped[i];
        }
      }
      return undefined;
    },
    dropHelper: function(posUi, connector) {
         var p11 = $('#'+ this.euid + "_Border").position();
            var w = $('#'+ this.euid + "_Border").width();
         var par = this.parrent;
         var self = this;
         var con = connector;
         
         var dropped_euid = this._getDropHelper(posUi, con.from == self.euid);
         if (dropped_euid) {
           if (con.from == self.euid) {
            con.from = dropped_euid;
            con.options.fromId = dropped_euid;
           }
             if (con.toId == self.euid) {
            con.toId = dropped_euid;
            con.options.toId = dropped_euid;
           }
           self.parrent.draw();
         }
         else 
           par.Element("llport",
             {left: p11.left + w/2 - 5, top:  posUi.position.top, "menu":"vp-component-menu"},
                function(element) {
                  var ui = {};
                  ui.position = $("#" + element.euid+"_Border").position();
                  par._dropElement(element, ui);
                  // perform some action on completion
                  if (con.from == self.euid) {
                    con.from = element.euid;
                    con.options.fromId = element.euid;
                  }
                  if (con.toId == self.euid) {
                    con.toId = element.euid;
                    con.options.toId = element.euid;
                  }
                  self.parrent.draw();
             });
    },
    addMethod: function(md) {
        this.options.methods = this.options.methods || new Array();
        this.options.methods.push(md + "()");
    },
    getAutocomplete: function() {
        return this.options.methods;
    },
    getName: function() {
      this.options.name = "" + $("#" + this.euid + " .Name" ).html();
      return this.options.name;
    }
});

// Drag helper element
// It is part of objinstance but it
// is implemented as a separate element
// menu should be shared from objinstance
dm.base.diagram("es.llport", dm.es.element, {
    options: {
        nameTemplate: "LLPort",
        width: '15px',
        height: '40px',
        droppable: true,
        resizable_h: 'n-u,s-u',
        axis: 'y'
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="UMLSyncPort ElementResizeArea grElement">\
    </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    _init: function() {
      $('#' + this.euid  + '_Border')
         .css('width', this.options.width)
         .css('height', this.options.height)
         .css('left', this.options.left)
         .css('top', this.options.top);
      if (this.options["z-index"])
        this._setOption("z-index", this.options["z-index"]);
    },
    _setOption: function( key, value ) {
        this.options[ key ] = value;
        if (key == "color") {
            $("#" + this.euid).css("background-color", value);
        } else if (key == "borderwidth") {
          $("#" + this.euid).css("border-width", value);
        } else if (key == "font-family") {
          $.log("ff: " + value);
          $("#" + this.euid).css(key, value);
        } else if (key == "selected") {
          if (value)
           $('#' + this.euid +'_Border ' + ".ui-resizable-handle").css({'visibility':'visible'});
          else
           $('#' + this.euid +'_Border ' + ".ui-resizable-handle").css({'visibility':'hidden'});
        } else if (key == "z-index") {
          $("#" + this.euid + '_Border ').css(key, "10000000" + value);
        }

        return this;
    },
    getAutocomplete: function() {
      if (this.parrent) {
        var els = this.parrent.elements;
        for (i in els) {
            for (j in els[i]._dropped) {
                if ((els[i]._dropped[j] == this.euid)
                  && (els[i].getAutocomplete))
                  return els[i].getAutocomplete();
            }
        }
      }
        return null;
    },
    dropHelper: function(posUi, connector) {
        $.log("DROP HELPER LLPORT:" );
        var pos = $("#" + this.euid + "_Border").position(),
            h = $("#" + this.euid + "_Border").height(),
            pui = posUi.position;
            if (pos.top + h < pui.top)
              $("#" + this.euid + "_Border").height(pui.top - pos.top);
            else if (pos.top > pui.top)
              $("#" + this.euid + "_Border").css("top", pui.top).height(pos.top - pui.top + h);        
    }
});

})(jQuery, dm);
