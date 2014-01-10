# Create your views here.
from easynav.diagramsview.models import Diagram, DiagramsView
from django.http import HttpResponse
from django.utils import simplejson

# throw DiagramsView.DoesntExist if path doesn't exist
def _get_diagrams_viewid(request, path):
	try :
		root_folder = DiagramsView.objects.filter(base_id=None, owner=request.user)[0:1].get()
	except DiagramsView.DoesNotExist:
		root_folder = DiagramsView.objects.create(name="root", base_id=None, owner=request.user)
		root_folder.save()

	if path == None :
		return root_folder

	key = root_folder
	path_items = path.rsplit("/")
	for i in path_items :
		print "loking for " + i
		v = DiagramsView.objects.filter(base_id=key, name=i, owner=request.user)[0:1].get()
		print "found"
		key = v
	return key

def save_diagram(request):
	print request.POST
	if 'diagram' in request.POST:
		items = request.POST['diagram']
		n = request.POST['name']
		p = None
		if 'path' in request.POST:
			p = request.POST['path']

		desc = request.POST['description']

		v = None
		key = None
		try :
			key = _get_diagrams_viewid(request, p)
		except DiagramsView.DoesNotExist:
			print "PATH doesn't exists"
			return HttpResponse("FAILED")

		try :
			d = Diagram.objects.get(name=n, owner=request.user, viewid=key)
		
			if items:
				d.json = items
			if desc:
				d.description = desc
		except Diagram.DoesNotExist:
			d = Diagram.objects.create(name=n, owner=request.user, description=desc, status='d', json=items, viewid=key)
		d.save()

	return HttpResponse("SAVED")

def new_diagram_folder(request):
	response = []
	if 'name' in request.GET:
		n = request.GET['name']
		p = None

		if 'path' in request.GET:
			p = request.GET['path']
		key = None
		try :
			key = _get_diagrams_viewid(request, p)
		except Diagram.DoesNotExist:
			return HttpResponse("{}", mimetype='application/json')

		try :
			v = DiagramsView.objects.get(name=n, base_id=key, owner=request.user)
		except DiagramsView.DoesNotExist:
			v = DiagramsView.objects.create(name=n, base_id=key, owner=request.user)
			v.save()

		response.append({'title': n, 'isLazy': 'true', 'isFolder': 'true', 'addClass':'folderclass' })

	json = simplejson.dumps(response)
	return HttpResponse(json, mimetype='application/json')

def get_user_diagram(request):
	response = []
	if 'name' in request.GET:
		n = request.GET['name']
		p = None

		if 'path' in request.GET:
			p = request.GET['path']

		try :
			key = _get_diagrams_viewid(request, p)
			d = Diagram.objects.get(name=n, viewid=key, owner=request.user)
			response = d.json;
		except Diagram.DoesNotExist:
			return HttpResponse("{}", mimetype='application/json')

	return HttpResponse(response, mimetype='application/json')

def remove_user_diagram(request):
	response = []
	if 'name' in request.GET:
		n = request.GET['name']
		p = None

		if 'path' in request.GET:
			p = request.GET['path']

		try :
			key = _get_diagrams_viewid(request, p)
			Diagram.objects.get(name=n, owner=request.user, viewid=key).delete()
		except Diagram.DoesNotExist:
			print "DIAGRAM DOESN't EXIST"

	return HttpResponse(response, mimetype='application/json')

def get_user_diagrams(request):
	response = []
	p = None
	if 'key' in request.GET:
		p = request.GET['key']
		if p == 'start':
			p = None

	print "Get 1"
	key = None
	try :
		key = _get_diagrams_viewid(request, p)
		print "Get 2"
	except DiagramsView.DoesNotExist:
		print "requested path doesn't exist"
		return HttpResponse("{}", mimetype='application/json')
	print "Get 3"

	try :
		print key
		udf = DiagramsView.objects.filter(owner=request.user, base_id=key)
		print "Get 4"
		print "Get 412"
		if udf != None:
			for r in udf:
				print "------------------------------>"
				response.append({'title': r.name, 'isFolder':'true', 'isLazy': 'true' })
	except DiagramsView.DoesNotExist :
		print "No folders in requested path"

	print "Get 5"
	user_diagrams = Diagram.objects.filter(owner=request.user, viewid=key)
	
	for r in user_diagrams:
	   response.append({'title': r.name, 'isLazy': 'false', 'addClass':'diagramclass' })
	json = simplejson.dumps(response)

	return HttpResponse(json, mimetype='application/json')
