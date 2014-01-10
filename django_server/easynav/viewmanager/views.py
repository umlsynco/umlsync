# Create your views here.

from django.http import HttpResponse
from django.utils import simplejson
import mimetypes
import urllib2

def proxy_to(request, path, target_url):

	url = '%s%s' % (target_url, path)
	if request.META.has_key('QUERY_STRING'):
		url += '?' + request.META['QUERY_STRING']
	try:
		proxied_request = urllib2.urlopen(url)
		status_code = proxied_request.code
		mimetype = proxied_request.headers.typeheader or mimetypes.guess_type(url)
		content = proxied_request.read()
	except urllib2.HTTPError as e:
		print "Exception"
		print e.msg
		return HttpResponse(e.msg, status=e.code, mimetype='text/plain')
	else:
		print content
		return HttpResponse(content, status=status_code, mimetype='application/json')


def getViews(request):
	respond = []
	# There are two view are registered for the current moment in project
	# TODO: think about not hardcoded way for view registration
	respond.append({'id':'cp', 'title': 'Project', 'description':'View for source code navigation and diagrams managment.', 'isdefault':'true'})
	respond.append({'id':'dv', 'title': 'Diagrams', 'description':'View for diagrams managment.', 'isdefault':'true'})

	json = simplejson.dumps(respond)

	return HttpResponse(json, mimetype='application/json')
