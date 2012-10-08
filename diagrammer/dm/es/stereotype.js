/**
  *  
  */
(function( $, dm, undefined ) {

dm.base.diagram("es.stereotype", dm['es']['element'], {
    options: {
        nameTemplate: 'Stereotype',
        width: '150px',
        height: '74px'
    },
    _getAux: function(aux) {
      var auxmap = [];
      auxmap["Class"] = "";
      auxmap["Interface"] = "interface";
      auxmap["Enumeration"] = "enum";
      auxmap["Primitive"] = "primitive";
      auxmap["ORM"] = "ORM";
      auxmap["ORMComponent"] = "ORMComponent";
      auxmap[undefined] = "";

      return auxmap[aux];      
    },
    addTaggedValue: function(desc, value) {
      $('<li><a class="editablefield attribute" >' + desc + ': ' + value + '</a></li>')
        .appendTo("#" + this.euid + " .ClassAttributes #sortable-atr").find("a").editable();
      $("#" + this.euid + " #sortable-atr").sortable("refresh");
    },
    _update: function() {
       var p = $("#" + this.euid + "_Border").position();

       this.options.pageX = p.left;
       this.options.pageY = p.top;
       this.options.width = $("#" + this.euid + "_Border").width();
       this.options.height = $("#" + this.euid + "_Border").height();

       // Height of attributes and operations. Width is the same for all components
       this.options.height_a = $("#" + this.euid + "_Border .ClassAttributes").height();
       this.options.height_o = $("#" + this.euid + "_Border .ClassOperations").height();

       this.options.name = "" + $("#" + this.euid + " .ClassName" ).html();
       this.options.aux = $("#" + this.euid + " .us-class-head .ClassAux" ).html();
       this.options.operations = new Array();
       this.options.attributes = new Array();
       var self = this;
       
       $("#" + this.euid + " .ClassOperations .operation").each(function(i) {
         self.options.operations.push($(this).html());
       });

       $("#" + this.euid + " .ClassAttributes .attribute").each(function(i) {
         self.options.attributes.push($(this).html());
       });
    },
    _create: function() {
       
       if (this.options.aux && (this.options.aux != "")) {
           this.aux = "&lt&lt " + this._getAux(this.options.aux) + " &gt&gt";
       } else {
        this.aux = "";
       }
       var operations = "",
           attributes = "";

        for (var i in this.options.operations) {
           operations += '<li><a class="editablefield operation">' + this.options.operations[i] + '</a></li>';
        }
    
        for (var i in this.options.attributes) {
           attributes += '<li><a class="editablefield attribute">' + this.options.attributes[i] +'</a></li>';
        }

      // HTML for class structure creation
      this.innerHtmlClassInfo = '\
        <div id="' + this.euid + '" class="us-class">\
        <div class="us-stereotype-header">\
        &lt;&lt;Stereotype&gt;&gt;<br>\
        <a class="editablefield ClassName">' + this.options.name + '</a><br>\
        <a class="editablefield ClassAux">'+ this.aux +'</a>\
        </div>\
        <div class="ClassAttributes"><ul id="sortable-atr">' +  attributes + '</ul></div>\
        <div class="ClassOperations ElementResizeArea"><ul id="sortable">' +  operations + '</ul></div>\
        </div>\
      ';
      $("#" + this.parrent.euid).append(this.innerHtmlClassInfo);

      this.element = $("#"  + this.euid);
    },
    _init: function() {
    if (this.options.height)
    $('#' + this.euid  + '_Border')
         .css('width', this.options.width).css('height', this.options.height);
    if (this.options.height_o)
      $('#' + this.euid  + '_Border .ClassOperations').css('height', this.options.height_o);

    if (this.options.height_a)
        $('#' + this.euid  + '_Border .ClassAttributes').css('height', this.options.height_a);
 
      if (this.parrent.options.editable) {
      
         var border = "#"+this.euid + "_Border";
         var self = this;
         // stop-function is a fix for attributes area which became not resizizable with black points after internal resize usage
         $("#"+this.euid + " .ClassAttributes").resizable({ handles: 's-l', alsoResize: border, stop: function(event, ui) { $("#"+self.euid + " .ClassAttributes").css({width:"100%"}); } });
         $("#"+this.euid + " .ClassOperations").resizable({ handles: 's-l', alsoResize: border });
         
         $("#" + this.euid + " #sortable").sortable().disableSelection();
         $("#" + this.euid + " #sortable-atr").sortable().disableSelection();
      }
    },
    getName: function() {
      this.options.name = "" + $("#" + this.euid + " .ClassName" ).html();
      return this.options.name;
    },
    getAux: function() {
      return $("#" + this.euid + " .us-class-head .ClassAux" ).html();
    },
    ec: 0
});



})(jQuery, dm);
