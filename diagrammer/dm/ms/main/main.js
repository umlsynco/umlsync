/*
Class: main

Main menu for diagram loading
jquery.tools.min.js is required

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012-2013 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  http://umlsync.org/about

Version:
  2.0.0 (2012-06-06)
*/


(function($, dm, undefined) {
dm = dm || {};
dm.ms = dm.ms || {};

/*
 * /param url - path to diagrams description JSON
 *     1. Load JSON from URL 
 *    2.  Create an innner HTML code
  *   3. Append to body
  *   4. Apply styles
  *   5. TODO:  How to destroy ?
  *   6. Handle errors
  */

dm.ms.main = function(options) {
   $.extend(true, this.options, options);
   // self options
   var so = this.options;

    /*/ 1. Load JSON from url
    $.ajax({
      url: this.options.url,
      dataType: 'json',
      success:   function(data) {
        var items = [];
  
       // position counter
       var pc = 0;
       for (d in data) {
         var pcx = pc % so.ratio_x,
         pcy = (pc - pcx) / so.ratio_x;

         // TODO: handle use case when we are getting more than 3x3 diagrams types
         if (pcy > so.ratio_y)
            break;

         items.push('<li style="position:absolute; width:' +
         so.image_width + 'px; left:' +
         ((so.image_width + so.image_marign) * pcx + 5) + 'px; top:' +
         ((so.image_height + so.image_marign) * pcy + 5) + 'px;">' +
         '<a href="#" ><img class="umlthumb" src="' +
         data[d].image[0][so.image] + 
         '" style="position:relative; width:' +
         so.image_width +'px;"></a></li>');
         pc++;
       } 

        innerHtml = items.join('');
        innerHtml = "<div id='overlay_test'><div><ul>" + innerHtml + "</ul></div></div>";
    
        $('body').append(innerHtml);
        $("#overlay_test").overlay({
          // custom top position
          top: 150,
          // some mask tweaks suitable for facebox-looking dialogs
          mask: {
            // you might also consider a "transparent" color for the mask
            color: '#',
            // load mask a little faster
            loadSpeed: 200,
            // very transparent
            opacity: 0.5
          },
          // disable this for modal dialog-type of overlays
          closeOnClick: true,
          // load it immediately after the construction
          load: true
        });
      },
      error: function(XMLHttpRequest, textStatus, errorThrown){
         // 6.  Handle Errors
         alert("appendAjax failed 2:" + textStatus + ":\n"+ XMLHttpRequest+ "\n"+ errorThrown);
      }
    });
    
   */ 
};

dm.ms.main.prototype = {
    options: {
        ratio_x: 3,
        ratio_y: 3,
        image: "medium",
        image_width: 160,
        image_height: 120,
        image_marign: 3,
        image_effect: "x2",
        url: "./dm/ms/main/main.json",
        id: "MainCreateDiagramMenu",
        parrentId: "body",
        
    },
};

})(jQuery, dm);
