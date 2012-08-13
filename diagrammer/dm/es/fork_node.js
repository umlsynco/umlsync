/**
   *  
   */
(function( $, dm, undefined ) {

dm.base.diagram("es.fork_node", dm.es.element, {
    options: {
        nameTemplate: "fork_node",
        color: 'black',
        size: 10,
        width: 20,
        height: 20
    },
    _create: function() {
       x = this.options.size / 4;
       y = this.options.size / 4;
       width = "100%";
       height = this.options.size / 2;
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="ElementResizeArea">\
                        <svg width="100%" height="' + this.options.size + '" version="1.1" xmlns="http://www.w3.org/2000/svg">\
    <rect x = "' + x + '" y = "' + y + '" width = "'+ width + '" height = "' + 
    height + '" transform = "scale(1, 0.5)" style="fill:' + 
    this.options.color + ';fill-opacity:' + this.options.opacity+';"/>\
                        </svg></div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);
