
(function( $, dm, undefined ) {

dm.base.menu.ds.vp = function (options, list, parent) {
   this.list = list;
   if (parent == undefined) {
      parent = 'body';
   }
   this.parent = parent;
   this.configure = function(list) {
      $.extend(this.list, list);
      
   }
   
   this._init = function(list) {
      var owner = $(this.parent).append("<div style='{width:45px, position:fixed, left: -30px, top:30%}'></div>");
      for( l in list) {
         owner.append("<img src='" + l.img_s + "'></img>");
      }
   };
}

})(jQuery, dm);