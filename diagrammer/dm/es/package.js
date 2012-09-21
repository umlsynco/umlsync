/**
  *  
  */
//@aspect
(function( $, dm, undefined ) {
dm.base.diagram("es.package", dm.es.element, {
    'options': {
        'nameTemplate': "Package",
        'droppable': true,
        'acceptdrop': "package",
        'height_b': "60px"
    },
    '_update': function() {
       var p = $("#" + this.euid + "_Border").position();
       this.options.pageX = p.left;
       this.options.pageY = p.top;
       this.options.width = $("#" + this.euid + "_Border").width();
       this.options.height = $("#" + this.euid + "_Border").height();

       // Height of packet body. Width is the same for all part of element
       this.options.height_b = $("#" + this.euid + "_Border .UMLSyncPacketBody").height();
       this.options.name = $("#" + this.euid + " .UMLSyncPacketBody .editablefield" ).html();
       
       if (this._dropped) {
         this.options.dropped = new Array();
         for (i in this._dropped) {
           this.options.dropped.push(this.parrent.elements[this._dropped[i]].options.id);
         }
       }
    },
    '_create': function() {
      // HTML for class structure creation
      var aux = (this.options.aux != undefined) ? "<a>&lt&lt" + this.options.aux + "&gt&gt</a><br><b>" : "";
      this.innerHtml = '<div id="' + this.euid + '" class="UMLSyncPacket">\
                                <div class="UMLSyncPacketTab grElement"></div>\
            <div class="UMLSyncPacketBody ElementResizeArea grElement">'
            + aux + 
            '<a class="editablefield">'+ this.options.name + '</a></div>\
                                </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    '_init': function() {
      $('#' + this.euid  + '_Border')
         .css('width', this.options.width);

      $('#' + this.euid  + '_Border .UMLSyncPacketBody')
         .css('width', this.options.width);

      if (this.options['height_b'])
        $('#' + this.euid  + '_Border .UMLSyncPacketBody').
          css('height', this.options['height_b']);
          
      if (this.options.color) {
          $("#" + this.euid + " .UMLSyncPacketTab").css("background-color", this.options.color);
            $("#" + this.euid + " .UMLSyncPacketBody").css("background-color", this.options.color);
      }

      if (this.options["z-index"])
          this.element.css("z-index", this.options["z-index"]);
    },
    '_setOption': function( key, value ) {
        this.options[ key ] = value;
        if (key == "color") {
            $("#" + this.euid + " .UMLSyncPacketTab").css("background-color", value);
            $("#" + this.euid + " .UMLSyncPacketBody").css("background-color", value);
        } else if (key == "borderwidth") {
            $("#" + this.euid + " .UMLSyncPacketTab").css("border-width", value);
            $("#" + this.euid + " .UMLSyncPacketBody").css("border-width", value);
        } else if (key == "font-family") {
          $("#" + this.euid).css(key, value);
        } else if (key == "selected") {
          if (value)
           $('#' + this.euid +'_Border ' + ".ui-resizable-handle").css({'visibility':'visible'});
          else
           $('#' + this.euid +'_Border ' + ".ui-resizable-handle").css({'visibility':'hidden'});
        } if (key == "z-index") {
          $("#" + this.euid + '_Border ').css(key, value);
        }
        return this;
    }
});
//@aspect
})(jQuery, dm);
