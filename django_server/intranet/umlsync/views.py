# Create your views here.

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
from django.shortcuts import render_to_response
from django.template.context import RequestContext

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.cache import cache

from django.contrib.auth.models import User

import json
import pysvn
import datetime
import base64

from django.conf import settings

from djutils.decorators import async

from umlsync.models import Branches, UserBranches
from intranet.svnbackend import get_pysvn_client

import posixpath
import datetime

def check_wc_branch(client, username, branch_name):
    try:
        br1 = Branches.objects.get(name=branch_name)
    except Branches.DoesNotExist:
        return False

    userpath = settings.SVN_WORKING_COPY_PATH + '/' + username + '/branches/' + branch_name

    try:
        userProfile = UserBranches.objects.get(branch = br1)
    except UserBranches.DoesNotExist:
        try:
            os.mkdir(userpath)
            if branch_name == 'trunk':
                client.checkout(url=settings.SVN_SERVER_URL + '/trunk/', path=userpath, depth=pysvn.depth.empty)
            else:
                client.checkout(url=settings.SVN_SERVER_URL + '/branches/' + branch_name, path=userpath, depth=pysvn.depth.empty)
            revision = client.info(userpath).revision.number
            userProfile = UserBranches(branch=br1, revision=revision, last_viewed_date=datetime.datetime.now(), last_modified_date=datetime.datetime.now())
            userProfile.save()
        except pysvn.ClientError, e:
            print str(e)
    return True

def load_wc_path(client, userpath, path):
    subpaths = path.split('/')
    try:
        ''' Check if path was loaded before == svn ls '''
        res = client.ls(userpath + path)
        return res
    except pysvn.ClientError:
        pass
    try:
        ''' Check if upper path was loaded before  == svn up . && svn ls '''
        client.update(userpath + path, depth=pysvn.depth.empty)
        res = client.ls(userpath + path)
        return res
    except pysvn.ClientError:
        pass

    ''' long path of svn up  '''
    for p in range(0, len(subpaths)):
        if subpaths[p]: 
            userpath = userpath + "/" + subpaths[p]
            try:
                ''' if it is not possible to ls the content, then load it '''
                client.ls(userpath)
            except pysvn.ClientError:
                client.update(path=userpath, depth=pysvn.depth.empty)

    return client.ls(userpath + path)

@async
def update_list_of_branches(client):
    try:
        url = settings.SVN_SERVER_URL + '/branches'
        print url
        result = client.list(url)
        for i, item in enumerate(result):
           path = item[0].get('path')
           bn = path[len(url):]
           if bn:
                bn = bn[1:]
                print bn
                try:
                    b = Branches.objects.get(name=bn)
                except Branches.DoesNotExist:
                    b = Branches(name=bn, kind='B')
                    b.save()
    except pysvn.ClientError, e:
        print str(e)
        print e.args

@login_required
@get_pysvn_client
def list_branches(request, client):

    step_num = 10
    item2 = int(request.GET.get('path', 0)) * step_num

    info = User.objects.get(username=request.user.username)
    print info.username

    branches = []
    """ Get list of branches from cache and schedule an update """
    
    b = Branches.objects.order_by('name').filter(kind='B')[item2: item2 + step_num]
    v = b.values()
    
    for i in v:
        branches.append(i.get('name'))

    return HttpResponse(json.dumps({'branches': branches, 'hasMore':len(branches) == step_num}), content_type="application/json")


@login_required
@get_pysvn_client
def list_content(request, client):
    path = posixpath.normpath(request.GET.get('path', ''))

    subpaths = path.split('/')
    branch_name = subpaths[0]
    if not branch_name:
        branch_name = subpaths[1]

    info = User.objects.get(username=request.user.username)

    if not check_wc_branch(client, info.username, branch_name):
        '''TODO: NOT POSSIBLE TO GET BRANCH INFO OR SOMETHING ELSE'''
        return HttpResponse(json.dumps({}), content_type="application/json")
    
    userpath = settings.SVN_WORKING_COPY_PATH + '/' + info.username + '/branches/'
    ''' not all paths are loaded '''
    results = []
    try:
        results = load_wc_path(client, userpath, path)
    except pysvn.ClientError:
        return HttpResponse(json.dumps({}), content_type="application/json")
    
    userpath = posixpath.normpath(userpath + path)
    folders = []
    
    ''' skip the first item because it is the same as path '''
    for i, item in enumerate(results):
       folder = item.get('name')
       isFolder = True
       if item.get('kind') == pysvn.node_kind.file:
           isFolder = False

       name = folder[len(userpath)+1:]
       folders.append({'title':name, 'isFolder':isFolder, 'isLazy':isFolder})

    ''' list of modified and updated files '''
    results = client.status(userpath,recurse=False)
    for i, item in enumerate(results):
       folder = item.get('path')
       if item.get('text_status') == pysvn.wc_status_kind.added:
            name = folder[len(userpath)+1:]
            folders.append({'title':name, 'isFolder':False, 'isLazy':False, 'addClass': 'dynatree-ico-added'})

    return HttpResponse(json.dumps(folders), content_type="application/json")

@login_required
@get_pysvn_client
def list_status(request, client):

    path = posixpath.normpath(request.GET.get('path', ''))

    subpaths = path.split('/')
    branch_name = subpaths[0]
    if not branch_name:
        branch_name = subpaths[1]

    info = User.objects.get(username=request.user.username)

    if not check_wc_branch(client, info.username, branch_name):
        print 'TODO: NOT POSSIBLE TO GET BRANCH INFO OR SOMETHING ELSE'
        return HttpResponse(json.dumps({}), content_type="application/json")

    userpath = settings.SVN_WORKING_COPY_PATH + '/' + info.username + '/branches/'
    ''' not all paths are loaded '''
    results = []
    try:
        results = load_wc_path(client, userpath, path)
    except pysvn.ClientError, r:
        print str(e)
        return HttpResponse(json.dumps({}), content_type="application/json")

    userpath = posixpath.normpath(userpath + path)

    ''' list of modified and updated files '''
    folders = []
    results = client.status(userpath)
    for item in results:
       folder = item.path
       if item.text_status == pysvn.wc_status_kind.added:
            name = folder[len(userpath)+1:]
            print name
            folders.append({'title':name, 'status':'added'})

       if item.get('text_status') == pysvn.wc_status_kind.conflicted:
            name = folder[len(userpath)+1:]
            folders.append({'title':name, 'status':'conflicted'})

       if item.get('text_status') == pysvn.wc_status_kind.modified:
            name = folder[len(userpath)+1:]
            folders.append({'title':name, 'status':'modified'})

       if item.get('text_status') == pysvn.wc_status_kind.deleted:
            name = folder[len(userpath)+1:]
            folders.append({'title':name, 'status':'deleted'})

       if item.get('text_status') == pysvn.wc_status_kind.unversioned:
            name = folder[len(userpath)+1:]
            folders.append({'title':name, 'status':'unversioned'})

    print folders

    return HttpResponse(json.dumps(folders), content_type="application/json")

@login_required
@get_pysvn_client
def open_content(request, client):
    path = posixpath.normpath(request.GET.get('path', ''))

    subpaths = path.split('/')
    branch_name = subpaths[0]
    if not branch_name:
        branch_name = subpaths[1]

    info = User.objects.get(username=request.user.username)

    if not check_wc_branch(client, info.username, branch_name):
        '''TODO: NOT POSSIBLE TO GET BRANCH INFO OR SOMETHING ELSE'''
        return HttpResponse(json.dumps({}), content_type="application/json")

    userpath = settings.SVN_WORKING_COPY_PATH + '/' + info.username + '/branches/'

    try:
        with open(userpath + path, 'r') as content_file:
            content = content_file.read()
        encoded = base64.b64encode(content)
        return HttpResponse(json.dumps({'encoding':'base64', 'content': encoded}), content_type="application/json")        
    except IOError:
        pass

    try:
        load_wc_path(client, userpath, path)
    except pysvn.ClientError:
        return HttpResponse(json.dumps({}), content_type="application/json")

    userpath = posixpath.normpath(userpath + path)

    with open(userpath, 'r') as content_file:
        content = content_file.read()
    
    encoded = base64.b64encode(content)
    return HttpResponse(json.dumps({'encoding':'base64', 'content': encoded}), content_type="application/json")


@login_required
@get_pysvn_client
def save_content(request, client):

    path = request.GET.get('path', '')
    content = request.GET.get('data', '')
    isNewOne = request.GET.get('isNewContent', '')
    print isNewOne

    subpaths = path.split('/')
    branch_name = subpaths[0]
    if not branch_name:
        branch_name = subpaths[1]

    info = User.objects.get(username=request.user.username)

    if not check_wc_branch(client, info.username, branch_name):
        '''TODO: NOT POSSIBLE TO GET BRANCH INFO OR SOMETHING ELSE'''
        return HttpResponse(json.dumps({}), content_type="application/json")

    userpath = settings.SVN_WORKING_COPY_PATH + '/' + info.username + '/branches/'

    try:
        f = file(userpath+path, 'w')
        f.write(content)
        f.close()
    except IOError:
        try:
            load_wc_path(client, userpath, path)
        except pysvn.ClientError:
            return HttpResponse(json.dumps({}), content_type="application/json")

        f = file(userpath+path, 'w')
        f.write(content)
        f.close()

    userpath = posixpath.normpath(userpath + path)

    if isNewOne == 'true':
        try:
           client.add(userpath)
        except pysvn.ClientError, e:
           print 'isNewOne not added: ' + str(e)

    return HttpResponse(json.dumps({}), content_type="application/json")


@login_required
@get_pysvn_client
def remove_content(request, client):

    path = request.GET.get('path', '')
    content = request.GET.get('data', '')

    subpaths = path.split('/')
    branch_name = subpaths[0]
    if not branch_name:
        branch_name = subpaths[1]

    info = User.objects.get(username=request.user.username)

    if not check_wc_branch(client, info.username, branch_name):
        '''TODO: NOT POSSIBLE TO GET BRANCH INFO OR SOMETHING ELSE'''
        return HttpResponse(json.dumps({}), content_type="application/json")

    userpath = settings.SVN_WORKING_COPY_PATH + '/' + info.username + '/branches/'
    userpath = posixpath.normpath(userpath + path)

    try:
        client.remove(userpath,force=True)
    except pysvn.ClientError, e:
        print 'Content was not removed: ' + str(e)

    return HttpResponse(json.dumps({}), content_type="application/json")

@login_required
@get_pysvn_client
def revert_content(request, client):

    path = request.GET.get('path', '')
    content = request.GET.get('data', '')

    subpaths = path.split('/')
    branch_name = subpaths[0]
    if not branch_name:
        branch_name = subpaths[1]

    info = User.objects.get(username=request.user.username)

    if not check_wc_branch(client, info.username, branch_name):
        '''TODO: NOT POSSIBLE TO GET BRANCH INFO OR SOMETHING ELSE'''
        return HttpResponse(json.dumps({}), content_type="application/json")

    userpath = settings.SVN_WORKING_COPY_PATH + '/' + info.username + '/branches/'
    userpath = posixpath.normpath(userpath + path)

    try:
        client.revert(userpath,recurse=True)
    except pysvn.ClientError, e:
        print 'Content was not reverted: ' + str(e)

    return HttpResponse(json.dumps({}), content_type="application/json")

@login_required
def editor(request, name='index.html'):
    t = get_template('editor.html')
    html = t.render(Context({}))
    return HttpResponse(html)
