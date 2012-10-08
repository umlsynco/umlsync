/**
   *  
   */
(function( $, dm, undefined ) {

dm.base.diagram("es.decision_node", dm.es.element, {
    options: {
        nameTemplate: "decision_node",
        back_color: 'black',
        color: 'blue',
        size: 10,
        width: 20,
        height: 20
    },
    _create: function() {
       x = this.options.size / 4;
       y = this.options.size / 4;
       width = this.options.size / 2;
       height = this.options.size / 2;
       x_b = this.options.size / 4;
       y_b = this.options.size / 4;
       width_b = this.options.size / 2;
       height_b = this.options.size / 2;
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-element-resizable-area us-venn">\
                        <svg width="' + this.options.size + '" height="' + this.options.size + '" version="1.1" xmlns="http://www.w3.org/2000/svg">\
    <g trasform="scale(1,3)">\
    <rect x = "' + x_b + '" y = "' + y_b + '" width = "'+ width_b + '" height = "' + 
    height_b + '" transform = "scale(0.5, 1) rotate(-45 ' + width_b + ' ' + height_b +')" style="fill:' + 
    this.options.back_color + ';fill-opacity:' + this.options.opacity+';"/>\
    <rect x = "' + x + '" y = "' + y + '" width = "'+ width + '" height = "' + 
    height + '" transform = "scale(0.5, 1) rotate(-45 ' + width + ' ' + height +')" style="fill:' + 
    this.options.color + ';fill-opacity:' + this.options.opacity+';"/>\
    /g>\
                        </svg></div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);
