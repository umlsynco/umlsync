/**
   *  
   */
(function( $, dm, undefined ) {

dm.base.diagram("es.node", dm.es.element, {
    options: {
        aux: "", // device or executable instance
        nameTemplate: "Node"
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-component us-element-resizable-area" style="border:0px;">\
    <table id="table_' + this.euid + '" style="width:100%;height:100%;border:1px solid black;border-collapse:collapse;border-spacing:0;">\
    <tr><td style="width:13px;height:14px;"></td>\
        <td></td>\
                            <td style="width:13px;height:14px;"></td>\
                        </tr>\
                        <tr>\
                            <td rowspan=2 colspan=2 style="border:1px solid black;">\
<a class="editablefield" style="text-align:left;position:relative;top:30%">&laquo;device&raquo;</a><br>\
<a class="editablefield" style="text-align:left;position:relative;top:30%">' + this.options.name + '</a>\
        </td>\
                            <td></td>\
                        </tr>\
                        <tr>\
                            <td width="13px"></td>\
                       </tr></table><img src="http://umlsync.org/sttaic/images/line45_lt.png" style="left:0px;top:0px;position:absolute;"></img>\
                       <img src="http://umlsync.org/sttaic/images/line45.png" style="right:0px;top:0px;position:absolute;"></img>\
                       <img src="http://umlsync.org/sttaic/images/line45_rb.png" style="right:0px;bottom:0px;position:absolute;"></img>\
                       </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
})(jQuery, dm);
