var dm = {};
    dm.base = {};
    window['dm'] = dm;
	dm['base'] = dm.base;

(function($, dm, undefined){ 

	dm.base.diagram = function( name, base, prototype ) {
		var ns = name.split( "." ),
		fullName = ns[0] + "-" + ns[1],
		namespace = ns[ 0 ],
		name = ns[ 1 ];

		if ( !prototype ) {
			prototype = base;
			base = dm.base.DiagramElement;
		}

		dm [ namespace ] = dm [ namespace ] || {};
		dm [ namespace ][ name ] = function( options, parrent ) {
			// allow instantiation without initializing for simple inheritance
			if ( arguments.length ) {
				options = options || {};
				if (options['type'] == undefined)
					options['type'] = name;
				this._createDiagram( options, parrent);
			}
		};

		var basePrototype = new base();

		basePrototype.options = $.extend( true, {}, basePrototype.options );
		dm [ namespace ][ name ].prototype = $.extend( true, basePrototype, {
			'namespace': namespace,
			'diagramName': name,
			'diagramEventPrefix': dm[ namespace ][ name ].prototype.diagramEventPrefix || name,
			'diagramBaseClass': fullName
		}, prototype );
	};
	dm['base']['diagram'] = dm.base.diagram;

	dm.base.DiagramElement = function( options, parrent) {
		// allow instantiation without initializing for simple inheritance
		if ( arguments.length ) {
			this._createDiagram( options, parrent);
		}
	};

	dm.base.DiagramElement.prototype = {
	  'options': {
		  'editable': true,
		  'nameTemplate': 'base'
	  },
	  _createDiagram: function( options, parrent) {
		// extend the basic options
		this.options = $.extend( true, {}, this.options, options );
		this.parrent = parrent;
		this['parrent'] = this.parrent;
		//if (this['_create'] != undefined) {
		this._create();
		//}
	  },
	//@proexp
	_create: function() {},
	//@proexp
	_init: function() {}
	}
	
   dm['base']['DiagramElement'] = dm.base.DiagramElement;
   //dm.base.DiagramElement.prototype._create = dm.base.DiagramElement.prototype['_create'];
   dm.base.DiagramElement.prototype['_create'] = dm.base.DiagramElement.prototype._create;
   //dm['base']['DiagramElement'].prototype['_create'] = dm.base.DiagramElement.prototype._create;   
   

   dm.base.diagram("es.element", {
			'options': {
			drop: false,
			nameTemplate: 'Element',
			width: 140,
			height: 200,
			pageY: 140,
			pageX: 200,
			selected: false,
			area: "none"
		},
	destroy: function() {
				alert("Destroy !!!");
	},
		_create: function () {},
		_init: function () {}
	});

dm['es']['element'].prototype['_create'] = dm['es']['element'].prototype._create;
//dm['es']['element'].prototype._create = dm['es']['element'].prototype['_create'];
//dm['es']['element'].prototype['parrent'] = dm['es']['element'].prototype.parrent;   
/*
   dm.base.diagram("es.class", dm['es']['element'], {
			'options': {
			drop: false,
			nameTemplate: 'Element',
			width: 140,
			height: 200,
			pageY: 140,
			pageX: 200,
			selected: false,
			area: "none"
		},
	destroy: function() {
				alert("Destroy !!!");
	},
		_create: function () {
			// if parent element is undefined, do nothing
			// create element at possition which described in jsonDesc
			alert("Class !!!" + this.parrent);
		}
	});
//new dm['es']['class']({123, 123}, 
   dm['es']['class'].prototype['_create'] = dm['es']['class'].prototype._create;*/
//   dm['es']['class'].prototype['parrent'] = dm['es']['class'].prototype.parrent;   
})(jQuery, dm);