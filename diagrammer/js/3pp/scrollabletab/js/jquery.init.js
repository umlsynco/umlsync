var $tabs;

//For debugging - shortcut
function d(m){console.log(m)}

$(function(){
	//To get the random tabs label with variable length for testing the calculations			
	var keywords = ["Just a tab label","Long string","Short","Very very long string","tab","New tab","This is a new tab"]
	
	$tabs = $("#tabs").tabs({
        scrollable: true
    });

	
	//Add new tab using jQuery ui tabs method
	$('#addUiTab').click(function(){
		var label = keywords[Math.floor(Math.random()*keywords.length)]
		content = 'This is the content for the '+label+'<br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque hendrerit vulputate porttitor. Fusce purus leo, faucibus a sagittis congue, molestie tempus felis. Donec convallis semper enim, varius sagittis eros imperdiet in. Vivamus semper sem at metus mattis a aliquam neque ornare. Proin sed semper lacus.';
		rnd = 'tab-' + Math.floor(Math.random()*10000);
		//d($tabs);
		$tabs
			.append('<div id="'+rnd+'">'+content+'</div>')
			.tabs('add','#'+rnd,label)
		
		setTimeout(function(){
			$tabs.append(jQuery('#'+rnd));
		},1000)
		
		
		return false;
	});
	
	$('#removeTab').click(function(){
		$tabs.tabs('select',$tabs.tabs('length')-1);
		$tabs.tabs('remove',$tabs.tabs('length')-1);
		return false;
	});


});