(function ($) {
    $.fn.extend({
        combomenu: function (data) {
		    var json = data.menu;
			var getHierarchy = function(subJson, id) {
			  var retVal = "", m = 0;
		      for (var i in subJson) {
			    var next = id + "_" + m;
				++m;
			    if (subJson[i].handler && $.isFunction(subJson[i].handler)) {
				  retVal += "<li id='"+next +"'><a href='#'>" + i + "</a></li>";
				} else {
				  retVal += "<li id='"+next +"'><a href='#'>" + i + "</a><ul>" + getHierarchy(subJson[i], next) + "</ul>";
				}
			  }
			  return retVal;
			};
		    var innerHtml = getHierarchy(json, data.prefix);
			$(innerHtml).appendTo(this);

			var activateHandler = function(subJson, id) {
			  var retVal = "", m = 0;
		      for (var i in subJson) {
			    var next = id + "_" + m;
				++m;
			    if (subJson[i].handler && $.isFunction(subJson[i].handler)) {
				  $("#" + next).click(subJson[i].handler, function(e) {e.data();});
				} else {
				  activateHandler(subJson[i], next);
				}
			  }
			};
			activateHandler(json, data.prefix);
			
            return this.each(function () {
                //add class .drop-down to all of the menus having drop-down items
                var menu = $(this);
                var timeoutInterval;
                if (!menu.hasClass('menu')) menu.addClass('menu');
                $("> li", menu).each(function () {
                    if ($(this).find("ul:first").length > 0)
                        $(this).addClass('pull-down');
                });

                $("> li ul li ul", menu).each(function () {
                    $(this).parent().addClass('right-menu');
                });
                $("li", menu).mouseenter(function () {
                    var isTopLevel = false;
                    //if its top level then add animation 
                    isTopLevel = $(this).parent().attr('class') === 'menu';
                    if (isTopLevel) {
                        clearTimeout(timeoutInterval);
                        var w = $(this).outerWidth();
                        // if ($(this).hasClass('pull-down')) w += 10;
                        var h = $(this).outerHeight();
                        var box = $('<div/>').addClass('box');
                        $('> li', menu).removeClass('selected');
                        $('>li div.box', menu).remove();
                        $('>li ul', menu).css('display', 'none').slideUp(0);
                        $(this).prepend(box);
                        $(this).addClass('selected');
                        box.stop(true, false).animate({ width: w, height: h }, 100, function () {
                            if ($(this).parent().find('ul:first').length == 0) {
                                timeoutInterval = setTimeout(function () {
                                    box.stop(true, false).animate({ height: '+=5' }, 300, function () {
                                        box.parent().find('ul:first').css('display', 'block').css('top', box.height()).stop(true, false).slideDown(100);
                                    });
                                }, 10);
                            }
                            else {

                                timeoutInterval = setTimeout(function () {
                                    box.stop(true, false).animate({ height: '+=0' }, 0, function () {
                                        box.parent().find('ul:first').css('display', 'block').css('top', box.height()).stop(true, false).slideDown(100);
                                    });
                                }, 10);
                            }
                        });
                    }
                    else {
                        $(this).find('ul:first').css('display','block').stop(true, false).slideDown(100);
                    }

                }).mouseleave(function () {
                    isTopLevel = $(this).parent().attr('class') === 'menu';
                    if (isTopLevel) {
                        $(this).parent().find('div.box').remove();
                    }
                    $(this).find('ul').slideUp(100, function () {

                        $(this).css('display', 'none');
                    });
                });

                $('> li > ul li a', menu).hover(function () {
                    $(this).parent().addClass('hover');
                }, function () {

                    $(this).parent().removeClass('hover');
                });

            });
        }
    });

    $.fn.extend({
        listmenu: function (options) {
			
		var items = [],
		    data = options.data,
			callback = options.onSelect;
		var urlPrefix= options.urlPrefix ? options.urlPrefix : "./",
       		self = this;
		var selector = (options.selector) ? "class='" + options.selector + "' " : "";
		var path = (options.path) ? options.path : "";

		for (var i in data) {
		    if (data[i]['hidden']) // hidden element
			  continue;
		    var name = data[i]['title'] || data[i]['full_name'] || (data[i]['owner'] != undefined ? data[i]['owner'] + "/" + data[i]['name'] : data[i]['name']);
			var image = (data[i]['icon'] != undefined) ? "list-style-image:url(\'"+urlPrefix + path + data[i]['icon'] + "\')" : "list-style-type:none";
			items.push('<li id="'+ i +'" '+ selector + ' style="cursor:pointer;' + image + ';" id="'  + data[i]['id'] +'"><a>' +
					name + '</a></li>');
		}

		var innerHtml = items.join('');
			
		$(innerHtml).appendTo(this);

          return this.each(function () {
                //add class .drop-down to all of the menus having drop-down items
                var menu = $(this);

                $('> li', menu).hover(function (evt) {
                  $(this).addClass('hover');
				  if (options.onMouseEnter) {
				    options.onMouseEnter(data[this.id], evt);
				  }
                },
				function (evt) {
                  $("> li", $(this).parent()).removeClass('hover');
				  if (options.onMouseLeave) {
				    options.onMouseLeave(data[this.id], evt);
				  }
                });
				
				var $selector = (options.selector) ? $('> .'+options.selector, menu) : $('> li', menu);
				var selectable = (options.selectable) ? true : false;
				$selector.click(data, function(e) {
				  if (selectable) {
				    $("> li ", $(this).parent()).removeClass('selected');
					$(this).addClass('selected');
				  }
				  if (callback) {
				     callback(e.data[this.id]);
				  }
				});
				

				
            });
        }
    });

})(jQuery);

