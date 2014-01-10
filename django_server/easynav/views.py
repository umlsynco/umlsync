from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter
from django.http import HttpResponse
from django.shortcuts import render_to_response

from django.template.context import RequestContext

from django.template.loader import get_template
from django.template import Context
from django.utils import simplejson

from djblets.auth.util import login_required

import os
import bsddb

def browsing_tabs(request, filepath=None):
    t = get_template('base.html')
    html = t.render(Context({}))
    return HttpResponse(html)

@login_required
def dynamic_tree(request):
    t = get_template('dynamic_tree.html')
    html = t.render(Context({}))
    return render_to_response('dynamic_tree.html', RequestContext(request))

def viewer(request):
    t = get_template('viewer.html')
    html = t.render(Context({}))
    return render_to_response('viewer.html', RequestContext(request))


def db4_request(filepath):
  mydb = bsddb.btopen("databases/reviewboard/reviewboard.cl", 'r')
  mykeys = mydb.keys()
  respond = []
  for key in mykeys:
    s_key = key.rsplit('\x01')
    if s_key[2].find(filepath) > 0:
	    respond.append({'title':s_key[0], 'isLazy':'false'})

  return respond

def dynamic_tree_ajax(request):
    if "key" in request.GET:
	filepath = request.GET["key"]

    if filepath == "start":
      dlist = os.listdir('./')
      filepath = "."
    
    response = []

    if os.path.isfile('./' + filepath):
	    # Request the list of classes from db4 database
      filepath.replace('\x2F', '/')
      response = db4_request(filepath)
    else:
      #TODO: check that it is a directory and the path is acceptable (avoid "..")
      dlist = os.listdir('./' + filepath)
      for file in dlist:
	if os.path.isdir('./' + filepath + '/' + file):
          response.append({'title': file, 'isFolder':'true', 'isLazy': 'true' })
	else:
          response.append({'title': file, 'isLazy': 'true' })
###             {"title": "SubFolder 2", "isFolder": true, "isLazy": true }}
    json = simplejson.dumps(response)

    return HttpResponse(json, mimetype='application/json')

def browsing_file(request):
        if "key" in request.GET:
            filepath = request.GET["key"]
    	else :
	    filepath = "./views.py"

	vfile = open(filepath, 'r')
	lines = ""
        while 1:
	    line = vfile.readline()
	    if not line:
		break
	    lines += line
	return HttpResponse(highlight(lines, PythonLexer(), HtmlFormatter(linenos=True, cssclass="source")))
