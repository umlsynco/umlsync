/*!
 * jQuery UI Tab Scroll Plugin V 1.0
 * http://riteshsblog.blogspot.com/
 *
 * Copyright 2011, Ritesh Jha
 * Code Licensed Apache License 2.0
 * Date: Thu Sep 1 2011
 */

(function($){  
    $.fn.scrolltab = function(options) {  
         
        var settings = {
            ulid: 'tabUl',
            leftId:'left',
            rightId:'right',
            visibleTab:0, 
            totalTab:0
        };  
         
        return this.each(function(){
            var options = $.extend(settings, options); 
            options.tabWidth = 0;
            options.maxLeft = 0;
            options.totalTab = 0;
            
            $tabs = $(this),
            $tabUL = $('#'+options.ulid);
            $left = $('#'+options.leftId);
            $right = $('#'+options.rightId);
            
            $tabUL.css('width',$tabs.width());
            
            /*tab slider*/
            $left.click(function() {
                if($tabUL.position().left > (options.maxLeft)){
                    $left.hide();
                    $tabUL.animate({
                        left: '-='+options.tabWidth
                        },300, function(){
                        $tabs.trigger('showArrow'); 
                    });
                }
            });
                    
            $right.click(function() {
                if($tabUL.position().left < 0){
                    $right.hide();
                    $tabUL.animate({
                        left: '+='+options.tabWidth
                        } ,300, function(){
                        $tabs.trigger('showArrow'); 
                    });
                }
            });
            
            //if tab closed
            $tabs.find("span.ui-icon-close" ).live( "click", function() {
                var index = $( "li", $tabs ).index( $( this ).parent() );
                $tabs.tabs( "remove", index );
                //update totalTab
                options.totalTab = $('li', $tabUL).length;
                
                $tabs.trigger('tabMaxLeft');
                
                if($tabUL.position().left < 0){
                    $tabUL.css('width', ($tabUL.width() - options.tabWidth) + 'px');
                    $right.trigger('click');
                }else if($tabUL.position().left > (options.maxLeft)){
                    $tabUL.css('width', ($tabUL.width() - options.tabWidth) + 'px');
                    $left.trigger('click');
                }
                
                if(options.totalTab <= 0){
                    $tabs.css('visibility','hidden');
                }
            });
            
            //bind event
            $tabs.bind('addTab',function(event,id,title){
                var tabid = '#tabs-'+id;
                $tabs.tabs('add', tabid, title);
                //increase totalTab
                options.totalTab = $('li', $tabUL).length;
                //add width in ul
                if(options.visibleTab == 0){ //calculate number of visible tab
                    options.tabWidth = $("li", $tabUL).outerWidth(true);
                    options.visibleTab = Math.floor($tabs.width()/options.tabWidth);
                }

                //add width in tab ul
                if(options.totalTab > options.visibleTab){
                    var cuiwidth = $tabUL.width();
                    $tabUL.css('width', (cuiwidth + options.tabWidth) + 'px');
                    $tabs.trigger('tabMaxLeft');
                    $tabs.trigger('selectTab',[options.totalTab - 1 ]);
                }else{
                    $tabs.tabs('select', (options.totalTab - 1));
                }
            });
            
            $tabs.bind('tabMaxLeft', function(){
                var extraTabs = options.totalTab - options.visibleTab;
                options.maxLeft = -(extraTabs * options.tabWidth);
            });
            
            $tabs.bind('selectTab', function(event, index){
                $tabs.tabs('select', index);
                index++;
                var currentleftPos = $tabUL.position().left;
                var tabHiddenLeft = Math.round(Math.abs(currentleftPos)/options.tabWidth);
                if(tabHiddenLeft >= index){
                    var rigtAnimate = (tabHiddenLeft - index +1 ) * options.tabWidth;
                    $tabUL.animate({
                        left: '+='+rigtAnimate
                        },300, function() {
                        $tabs.trigger('showArrow'); 
                    });
                }else{
                    var tabonleft = tabHiddenLeft + options.visibleTab;
                    var tabHiddenRight = options.totalTab - tabHiddenLeft - options.visibleTab;

                    if(tabHiddenRight > 0 && index > tabonleft){
                        var rightIndex = (index - tabonleft);
                        var leftAnimate = rightIndex * options.tabWidth;
                        $tabUL.animate({
                            left: '-='+leftAnimate
                            },300, function(){
                            $tabs.trigger('showArrow'); 
                        });
                        
                    }
                }
                       
            });
            
            $tabs.bind('showArrow', function(){
                var currentleftPos = $tabUL.position().left;
                var tabHiddenLeft = Math.round(Math.abs(currentleftPos)/options.tabWidth);
                var tabonleft = tabHiddenLeft + options.visibleTab;
                var tabHiddenRight = options.totalTab - tabHiddenLeft - options.visibleTab;
                
                if(tabHiddenLeft > 0){
                    $right.show();
                }else{
                    $right.hide();
                }
                
                if(tabHiddenRight > 0){
                    $left.show();
                }else{
                    $left.hide();
                }
            });
            
        });// return part
    };  //function body end
})(jQuery);  


