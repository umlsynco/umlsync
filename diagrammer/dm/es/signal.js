/**
   *  
   */
(function( $, dm, undefined ) {

dm.base.diagram("es.signal", dm.es.element, {
    options: {
      nameTemplate: "Signal",
      width:170,
      height:170
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="ElementResizeArea"> <div class="UMLSyncComponent2"></div>\
      <div id="' + this.euid + '_T" class="UMLSyncSignal Rhdtb1"></div>\
      <div id="' + this.euid + '_B" class="UMLSyncSignal2 Rhdtb"></div>\
      <div id="' + this.euid + '_B" class="UMLSyncSignal1 Rhdtb1"></div>\
      <div id="' + this.euid + '_B" class="UMLSyncSignal12 Rhdtb"></div>\
      </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    _init: function() {
      $('#' + this.euid  + '_Border')
         .css('width', this.options.width);

      $('#' + this.euid  + '_Border .UMLSyncComponent2')
         .css('width', this.options.width).css('height', this.options.height);

     var mm = this.options.height, nnn = (mm)/2;
     $("#" + this.euid).width(mm).height(mm);

      var self = this;
      $('#' + this.euid + "_Border").bind( "resize", function(event, ui) {
      
         var w1 = $("#" + this.id).width(),
             h1 = $("#" + this.id).height();
         var m1 = w1;
         if (w1 > h1 ) 
            m1 = h1;
         $("#" + this.id).width(m1).height(m1);
        
         var w = $("#" + self.euid + " .UMLSyncComponent2").width(),
             h = $("#" + self.euid + " .UMLSyncComponent2").height();
         var m = w;
         if (w > h ) 
            m = h;
         $("#" + self.euid+ " .UMLSyncComponent2").width(m).height(m);
         
         $("#" + self.euid+ " .Rhdtb").css("border-bottom-width", m/2);
         
         $("#" + self.euid+ " .Rhdtb1").css("border-top-width", m/2);
         
      });
    }
});
})(jQuery, dm);
