import os
import re

from django.core.servers.basehttp import FileWrapper

from django.http import HttpResponse
from django.shortcuts import render_to_response

from django.template.loader import get_template
from django.template import Context

from django.utils.http import urlquote

from django.contrib.auth import BACKEND_SESSION_KEY
from django.contrib.auth.models import AnonymousUser
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template.context import RequestContext

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.cache import cache

from social_auth.models import UserSocialAuth
from social_auth.views import complete as social_complete
from social_auth.utils import setting
from social_auth.backends.contrib.github import GithubBackend

from export.json_to_svg import CustomJSONtoSVGConverter


@login_required
def editor(request, name='index.html'):
    # FIXME: remove hardcoded urls
    redirect_url = urlquote("http://localhost:8000/editor/?viewer=asdnkkl12e1inmasdnln12x123x123mm;asd000")
    return render_to_response('index.html',
                              {'redirect_url': redirect_url},
                              RequestContext(request))

@login_required
def editor22(request, name='index.html'):
    t = get_template('editor.html')
    html = t.render(Context({}))
    return HttpResponse(html)


def error(request, name='index.html'):
    t = get_template('500.html')
    html = t.render(Context({}))
    return HttpResponse(html)


def export(request):
    contents = request.GET.get('contents', '')
    filename = "exported.svg"
    converter = CustomJSONtoSVGConverter()
    converter.load_data(contents)
    converter.dump(filename)
    wrapper = FileWrapper(file(filename))
    response = HttpResponse(wrapper, content_type='text/plain')
    response['Content-Disposition'] = 'attachment; filename=%s' % (filename)
    response['Content-Length'] = os.path.getsize(filename)
    return response

def get_referer_view(request, default=None):
    referer = request.META.get('HTTP_REFERER')
    if not referer:
        return default

    print('Server NAME : ')
    print(request.META.get('SERVER_NAME'))
    if referer[0] != request.META.get('SERVER_NAME'):
        return default
    referer = u'/' + u'/'.join(referer[1:])
    return referer

def serve_file(request, filename):
    fullname = filename
    try:
        f = file(fullname, "rb")
    except Exception, e:
        return page_not_found(request, template_name='404.html')
    try:
        wrapper = FileWrapper(f)
        response = HttpResponse(wrapper, mimetype='image/gif')
        response['Content-Length'] = os.path.getsize(fullname)
        response['Content-Disposition'] = 'attachment; filename={0}'.format(filename)
        return response
    except Exception, e:
        return page_not_found(request, template_name='500.html')

def open_path_or_image(request, *args, **kwargs):
    if get_referer_view(request) != None:
        return serve_file(request, '/home/evgeny/Projects/GH8/umlsync/www.github.com/umlsync_files/octocat-spinner-64.gif')
    else:
        return open_path(request, *args, **kwargs)

@login_required
def open_path(request, *args, **kwargs):
    auth_response = kwargs.get('auth_response')
    path = kwargs.get('path')
    print('PATH IS :')
    print(path)
    if auth_response:
        return auth_response
    return render_to_response('editor.html',
                              {"path": path,
                              'warning': request.method == 'GET',
                               'access_token': get_access_token(request.user)},
                              RequestContext(request))


def is_complete_authentication(request):
    return request.user.is_authenticated() and \
        GithubBackend.__name__ in request.session.get(BACKEND_SESSION_KEY, '')


def get_access_token(user):
    key = str(user.id)
    access_token = cache.get(key)

    # If cache is empty read the database
    if access_token is None:
        try:
            social_user = user.social_user if hasattr(user, 'social_user') \
                else UserSocialAuth.objects.get(user=user.id,
                                                provider=GithubBackend.name)
        except UserSocialAuth.DoesNotExist:
            return None

        if social_user.extra_data:
            access_token = social_user.extra_data.get('access_token')
            expires = social_user.extra_data.get('expires')

            cache.set(key, access_token,
                      int(expires) if expires is not None else 0)

    return access_token


# Facebook decorator to setup environment
def facebook_decorator(func):
    def wrapper(request, *args, **kwargs):
        user = request.user

        # User must me logged via FB backend in order to ensure
        # we talk about the same person
        if not is_complete_authentication(request):
            try:
                user = social_complete(request, GithubBackend.name)
            except ValueError:
                pass  # no matter if failed

        # Not recommended way for FB, but something we need to be aware of
        if isinstance(user, HttpResponse):
            kwargs.update({'auth_response': user})
        # Need to re-check the completion
        else:
            if is_complete_authentication(request):
                kwargs.update({'access_token': get_access_token(request.user)})
            else:
                request.user = AnonymousUser()

        return func(request, *args, **kwargs)

    return wrapper


@login_required
@csrf_exempt
@facebook_decorator
def editor2(request, *args, **kwargs):
    # If there is a ready response just return it. Not recommended though.
    auth_response = kwargs.get('auth_response')
    if auth_response:
        return auth_response

    if request.GET.get('viewer'):
        return render_to_response('viewer.html',
                                  {'warning': request.method == 'GET',
                                   'access_token':
                                   get_access_token(request.user)},
                                  RequestContext(request))

    return render_to_response('editor.html',
                              {'warning': request.method == 'GET',
                               'access_token': get_access_token(request.user)},
                              RequestContext(request))
