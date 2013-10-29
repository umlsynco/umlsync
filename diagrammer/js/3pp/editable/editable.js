(function($){
/*
 * Editable 1.3.3
 *
 * Copyright (c) 2009 Arash Karimzadeh (arashkarimzadeh.com)
 * Licensed under the MIT (MIT-LICENSE.txt)
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Date: Mar 02 2009
 */
$.fn.editable = function(options){
	var defaults = {
		onEdit: null,
		onSubmit: null,
		onCancel: null,
		onAutocomplete: null,
		editClass: null,
		submit: null,
		cancel: null,
		type: 'text', //text, textarea or select
		submitBy: 'blur', //blur,change,dblclick,click
		editBy: 'click',
		options: null
	}

	this.attr("tabindex", 1);
	
	if(options=='disable') {
        var opt = this.data('editable.options');
        opt.enabled = false;
        this.data('editable.options', opt);
		return this.unbind(this.data('editable.options').editBy,this.data('editable.options').toEditable);
    }
        
	if(options=='enable' && !this.data('editable.options').enabled) {
        var opt = this.data('editable.options');
        opt.enabled = true;
        this.data('editable.options', opt);
		return this.bind(this.data('editable.options').editBy,this.data('editable.options').toEditable);
    }
	if(options=='destroy')
		return  this.unbind(this.data('editable.options').editBy,this.data('editable.options').toEditable)
					.data('editable.previous',null)
					.data('editable.current',null)
					.data('editable.options',null);
	
    // do not apply editable twice
    if (this.data('editable.options'))
      return;

	var options = $.extend(defaults, options);
	
	options.toEditable = function(){
		$this = $(this);
		// Do not handle edit twice
		if ($this.children('input').length != 0) {
		  return;
		}

		$this.data('editable.current',$this.html());
		opts = $this.data('editable.options');
		$.editableFactory[opts.type].toEditable($this.empty(),opts);
		// Configure events,styles for changed content
		$this.data('editable.previous',$this.data('editable.current'))
			 .children()
				 .trigger('focus')
				 .addClass(opts.editClass);
		// Submit Event
		if(opts.submit){
			$('<button/>').appendTo($this)
						.html(opts.submit)
						.one('mouseup',function(){opts.toNonEditable($(this).parent(),true)});
		}else
			$this.one(opts.submitBy,function(e){
			opts.toNonEditable($(this),true)
			  $(this).children().unbind( opts.submitBy );
			})
				 .children()
				 	.one(opts.submitBy,function(e){
                        $(this).parent().unbind( opts.submitBy );
					    opts.toNonEditable($(this).parent(),(e.apply != undefined) ? e.apply: true)});
		// Cancel Event
		if(opts.cancel)
			$('<button/>').appendTo($this)
						.html(opts.cancel)
						.one('mouseup',function(){opts.toNonEditable($(this).parent(),false)});
		// Call User Function
		if($.isFunction(opts.onEdit))
			opts.onEdit.apply(	$this,
									[{
										current:$this.data('editable.current'),
										previous:$this.data('editable.previous')
									}]
								);

		// Call Auto complete option
		if($.isFunction(opts.onAutocomplete)) {
		  var list = opts.onAutocomplete.apply($this);
		  if (list) {
		    $this.children().autocomplete({source: list });
		  }
		}
	}
    
    function convert( str , noEmpy) {
      var c = {'<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;',
       '#':'&#035;' };
      var ret = str.replace( /[<>'"#]/g, function(s) {
         return c[s]; 
      } );
      if (ret == "" && noEmpy) {
        ret = "&nbsp;&nbsp;&nbsp;&nbsp;"
      }
      return ret;
    }
    
	options.toNonEditable = function($this,change){
		var opts = $this.data('editable.options');
		// Configure events,styles for changed content
		$this.one(opts.editBy,opts.toEditable)
			 .data( 'editable.current',
				    change 
						?$.editableFactory[opts.type].getValue($this,opts)
						:$this.data('editable.current')
					)
			 .html(
				    opts.type=='password'
				   		?'*****'
						:convert($this.data('editable.current'), true)
					);
		// Call User Function
		var func = null;
		if($.isFunction(opts.onSubmit)&&change==true)
			func = opts.onSubmit;
		else if($.isFunction(opts.onCancel)&&change==false)
			func = opts.onCancel;
		if(func!=null)
			func.apply($this,
						[{
							current:convert($this.data('editable.current')),
							previous:convert($this.data('editable.previous'))
						}]
					);
	}
    options.enabled = true;
	this.data('editable.options',options);
	return  this.one(options.editBy,options.toEditable);
}
$.editableFactory = {
	'text': {
		toEditable: function($this,options){
			$('<input/>').appendTo($this)
						 .val($this.data('editable.current'));
		},
		getValue: function($this,options){
		    var val = $this.children().val();
			return val;
		}
	},
	'password': {
		toEditable: function($this,options){
			$this.data('editable.current',$this.data('editable.password'));
			$this.data('editable.previous',$this.data('editable.password'));
			$('<input type="password"/>').appendTo($this)
										 .val($this.data('editable.current'));
		},
		getValue: function($this,options){
			$this.data('editable.password',$this.children().val());
			return $this.children().val();
		}
	},
	'textarea': {
		toEditable: function($this,options){
			$('<textarea/>').appendTo($this)
							.val($this.data('editable.current'));
		},
		getValue: function($this,options){
			return $this.children().val();
		}
	},
	'select': {
		toEditable: function($this,options){
			$select = $('<select/>').appendTo($this);
			$.each( options.options,
					function(key,value){
						$('<option/>').appendTo($select)
									.html(value)
									.attr('value',key);
					}
				   )
			$select.children().each(
				function(){
					var opt = $(this);
					if(opt.text()==$this.data('editable.current'))
						return opt.attr('selected', 'selected').text();
				}
			)
		},
		getValue: function($this,options){
			var item = null;
			$('select', $this).children().each(
				function(){
					if($(this).attr('selected'))
						return item = $(this).text();
				}
			)
			return item;
		}
	}
}
})(jQuery);