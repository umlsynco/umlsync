/**
  *  
  */
(function( $, dm, undefined ) {
dm.base.diagram("es.entity", dm.es.element, {
    options: {
        nameTemplate: "Entity"
    },
    _create: function() {
      var fields = '';
     for (i in this.options.fields) {
        fields += '<li class="us-entity-field"><a class="editablefield">' + this.options.fields[i] +'</a></li>';
     }
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-entity us-element-resizable-area">\
                        <div class="us-entity-head"><a class="editablefield">' + this.options.name + '</a></div>\
    <ul class="us-entityList" style="list-style-type:none; padding:0px;marign:0px;" >'
    +  fields + '</ul></div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    _update: function() {
       var p = $("#" + this.euid + "_Border").offset();
       this.options.pageX = p.left;
       this.options.pageY = p.top;
       this.options.width = $("#" + this.euid + "_Border").width();
       this.options.height = $("#" + this.euid + "_Border").height();

       this.options.name = $("#" + this.euid + " .us-entity-head .editablefield" ).html();
       this.options.fields = new Array();
       var self = this;
       
       $("#" + this.euid + " .us-entity-field .editablefield").each(function(i) {
         self.options.fields.push($(this).html());
       });
    },
    _init: function() {
     $("#" + this.euid + " .us-entityList").sortable();
    },
    addField: function(name, type, aux) {
      $('<li class="us-entity-field"><a class="editablefield">' + name + '   ' + type +'</a></li>').appendTo("#" + this.euid + " .us-entityList").find("a").editable();
      $("#" + this.euid + " .us-entityList").sortable("refresh");
      
    }
});
})(jQuery, dm);
