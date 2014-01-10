from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter
from django.http import HttpResponse
from django.shortcuts import render_to_response

from django.template.loader import get_template
from django.template import Context
from django.utils import simplejson

from django.core.context_processors import csrf
from django.http import HttpResponseRedirect

import os
import bsddb
import shutil

from easynav.codeprojects.models import CodeProject

def getCapabilities(request):
	respond = []
	# There are two view are registered for the current moment in project
	# TODO: think about not hardcoded way for view registration
	respond.append({'id':'cp', 'title': 'Project', 'description':'View for source code navigation and diagrams managment.', 'isdefault':'true'})
	respond.append({'id':'dv', 'title': 'Diagrams', 'description':'View for diagrams managment.', 'isdefault':'true'})

	json = simplejson.dumps(respond)

	return HttpResponse(json, mimetype='application/json')

def newFolder(request):
	response = []
	if 'name' in request.GET:
		name = request.GET['name']
		path = None
		project = None

		if 'path' in request.GET:
			path = request.GET['path']
		if 'project' in request.GET:
			project = request.GET['project']

		key = _createFolder(project, path, name)

		response.append({'title': key, 'isLazy': 'true', 'isFolder': 'true', 'addClass':'folderclass' })

	json = simplejson.dumps(response)
	return HttpResponse(json, mimetype='application/json')

def saveFile(request):
	if 'diagram' in request.POST:
		items = request.POST['diagram']
		path = None
		if 'path' in request.POST:
			path = request.POST['path']
		project = None
		if 'project' in request.POST:
			project = request.POST['project']

		desc = request.POST['description']
		cp = CodeProject.objects.filter(name=project)[0]
		path.replace('\x2F', '/')
		response = ""
		ffilepath = cp.co_path + path + ".umlsync"
		if os.path.isfile(ffilepath):
			f = open(ffilepath, 'w')
			f.write(items);
		if not os.path.exists(ffilepath):
			f = open(ffilepath, 'wc')
			f.write(items);

	return HttpResponse("SAVED")

def getFile(request):
	path = None
	if 'path' in request.GET:
		path = request.GET['path']
	project = None
	if 'project' in request.GET:
		project = request.GET['project']
	print path
	print project
	cp = CodeProject.objects.filter(name=project)[0]
	path.replace('\x2F', '/')
	response = ""
	ffilepath = cp.co_path + path
	if os.path.isfile(ffilepath):
		vfile = open(ffilepath, 'r')
		lines = ""
		while 1:
			line = vfile.readline()
			if not line:
				break
			lines += line
		print lines
		return HttpResponse(lines, mimetype='application/json')

	return HttpResponse({}, mimetype='application/json')

def RemoveContent(request):
	response = []
	if 'path' in request.GET:
		path = request.GET['path']
		project = None

		if 'project' in request.GET:
			project = request.GET['project']

		cp = CodeProject.objects.filter(name=project)[0]
		path.replace('\x2F', '/')
		response = ""
		ffilepath = cp.co_path + path
		if os.path.isdir(ffilepath):
			shutil.rmtree(ffilepath)
		if os.path.isfile(ffilepath):
			os.remove(ffilepath)

	return HttpResponse({}, mimetype='application/json')

def _createFolder(project, path, name):
	
	cp = CodeProject.objects.filter(name=project)[0]
	path.replace('\x2F', '/')
	response = ""
	ffilepath = cp.co_path + path
	if os.path.isdir(ffilepath):
		dir = ffilepath + '/' + name
		if not os.path.exists(dir):
			os.makedirs(dir)
			response = name
	
	return response

def browsing_tabs(request, filepath=None):
	t = get_template('base.html')
	html = t.render(Context({}))
	return HttpResponse(html)

def dynamic_tree(request):
	t = get_template('dynamic_tree.html')
	html = t.render(Context({}))
	return HttpResponse(html)

def db4_file_classes_request(filepath, path_to_db4):
  mydb = bsddb.btopen(path_to_db4 + ".cl", 'r')
  mykeys = mydb.keys()
  respond = []
  for key, val in mydb.iteritems():
	s_key = key.rsplit('\x01')
	s_val = val.rsplit('\x01')
	if s_key[2].find(filepath) >= 0:
		respond.append({'title':s_key[0], 'isLazy':'false', 'addClass':'iconclass'})

  return respond

def db4_class_update(classname, path_to_db4):
	mydb = bsddb.btopen(path_to_db4 + ".md", 'r')
	mykeys = mydb.keys()
	respond = []
	for key in mykeys:
		s_key = key.rsplit('\x01')
		if s_key[0] == classname:
			if s_key[1] != "throw":
				m = mydb.set_location(key)
				m1 = m[1].rsplit('\x01')
				respond.append({'md':s_key[1], 'attr':m1[1], 'ret':m1[2], 'args':m1[3]})

	return respond

def db4_class_update2(classname, path_to_db4):
	mydb = bsddb.btopen(path_to_db4 + ".fil", 'r')
	mykeys = mydb.keys()
	respond = []
	for key in mykeys:
		s_key = key.rsplit('\x01')
		if s_key[2] == classname:
			if s_key[4] == "md\x00":
				respond.append({'mi':s_key[3]})
	mydb.close()
	return respond

def db4_class_inheritances(classname, isBase, path_to_db4):
  mydb = bsddb.btopen(path_to_db4 + ".in", 'r')
  mykeys = mydb.keys()
  respond = []

  if isBase:
	for key in mykeys:
	  s_key = key.rsplit('\x01')
	  if s_key[1] == classname:
		  respond.append({'title':s_key[0]})
  else:
	for key in mykeys:
	  s_key = key.rsplit('\x01')
	  if s_key[0] == classname:
		  respond.append({'title':s_key[1]})

  return respond

def class_getbase_ajax(request):
	if "key" in request.GET:
		classname = request.GET["key"]
	if "project" in request.GET:
		project = request.GET["project"]

	cp = CodeProject.objects.filter(name=project)[0]

	response = db4_class_inheritances(classname, False, cp.db_path + "/"+project)

	json = simplejson.dumps(response)

	return HttpResponse(json, mimetype='application/json')

def class_getrealization_ajax(request):
	if "key" in request.GET:
		classname = request.GET["key"]
	if "project" in request.GET:
		project = request.GET["project"]

	cp = CodeProject.objects.filter(name=project)[0]

	response = db4_class_inheritances(classname, True, cp.db_path + "/"+project)

	json = simplejson.dumps(response)

	return HttpResponse(json, mimetype='application/json')


def class_methods_ajax(request):
	if "key" in request.GET:
		classname = request.GET["key"]
	if "project" in request.GET:
		project = request.GET["project"]

	cp = CodeProject.objects.filter(name=project)[0]

	response = db4_class_update(classname, cp.db_path + "/"+project)

	json = simplejson.dumps(response)

	return HttpResponse(json, mimetype='application/json')


def dynamic_tree_ajax(request):
	if "key" in request.GET:
		filepath = request.GET["key"]

	if "project" in request.GET:
		project = request.GET["project"]
	print project + "/" + filepath
	cp = CodeProject.objects.filter(name=project)[0]
	if filepath == "start":
	  filepath = ""
	
	response = []
	ffilepath = cp.co_path + filepath
	print "PATH: " + ffilepath
	if os.path.isfile(ffilepath):
	  # Request the list of classes from db4 database
	  filepath.replace('\x2F', '/')
	  print "is file : " + cp.db_path + project
	  response = db4_file_classes_request(filepath, cp.db_path + project)
	else:
		print "NOT FILE !!!"
		#TODO: check that it is a directory and the path is acceptable (avoid "..")
		dlist = os.listdir(ffilepath)
		for file in dlist:
			if os.path.isdir(ffilepath + '/' + file):
				if ((file != ".svn") and (file != "SNDB4")):
					response.append({'title': file, 'isFolder':'true', 'isLazy': 'true' })
			else:
				if file.lower().endswith(".umlsync"):
					response.append({'title': file, 'isLazy': 'true' , 'addClass': 'diagramclass'})
				else:
					response.append({'title': file, 'isLazy': 'true' , 'addClass': 'sourcecode'})
###			 {"title": "SubFolder 2", "isFolder": true, "isLazy": true }}
	json = simplejson.dumps(response)

	return HttpResponse(json, mimetype='application/json')

def browsing_file(request):
	if "key" in request.GET:
		filepath = request.GET["key"]
	if "project" in request.GET:
		project = request.GET["project"]

	cp = CodeProject.objects.filter(name=project)[0]

	vfile = open(cp.co_path + "/" + filepath, 'r')
	lines = ""
	while 1:
		line = vfile.readline()
		if not line:
			break
		lines += line

	return HttpResponse("<div style='overflow:scroll;'>" + highlight(lines, PythonLexer(), HtmlFormatter(linenos=True, cssclass="source")) + "</div>")
