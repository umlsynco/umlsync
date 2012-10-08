/**
   *  
   */
(function( $, dm, undefined ) {

dm.base.diagram("es.diamond", dm.es.element, {
    options: {
      nameTemplate: "Diamond",
      width:30,
      height:30
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="is-diamond-w us-element-resizable-area">\
      <div id="' + this.euid + '_D" class="us-diamond"></div>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    _init: function() {
      $('#' + this.euid  + '_Border')
         .css('width', this.options.width);

      $('#' + this.euid  + '_Border .is-diamond-w')
         .css('width', this.options.width).css('height', this.options.height);

     var mm = this.options.height, nnn = (mm)/2;
     $("#" + this.euid).width(mm).height(mm);
     var ddd = (Math.sqrt(2) * mm)/ 2;
     $("#" + this.euid + "_D").width(ddd).height(ddd).css("left", nnn + 3).css("top", mm/3 + 1);


      var self = this;
      $('#' + this.euid + "_Border").bind( "resize", function(event, ui) {
      
         var w1 = $("#" + this.id).width(),
             h1 = $("#" + this.id).height();
         var m1 = w1;
         if (w1 > h1 ) 
            m1 = h1;
         $("#" + this.id).width(m1).height(m1);
        
         var w = $("#" + self.euid).width(),
             h = $("#" + self.euid).height();
         var m = w;
         if (w > h ) 
            m = h;
         $("#" + self.euid).width(m).height(m);
         var dd = (Math.sqrt(2) * m) / 2;
         $("#" + self.euid + "_D").width(dd).height(dd).css("left", (m/2) + 3).css("top", (m/3) + 1);
      });
    }
});
})(jQuery, dm);
