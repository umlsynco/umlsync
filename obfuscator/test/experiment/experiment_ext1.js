dm.base.diagram("es.package", dm['es']['element'], {
			'options': {
			'drop': false,
			'nameTemplate': 'package',
		},
	destroy: function() {
				alert("Destroy !!!");
	},
	_create: function () {
			// if parent element is undefined, do nothing
			// create element at possition which described in jsonDesc
			alert("Package !!! " + this.parrent + " NT:" + this.options.nameTemplate);
		}
	});