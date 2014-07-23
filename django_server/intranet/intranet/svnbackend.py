from django.conf import settings
from django.contrib.auth.models import User
from django.conf import settings

import pysvn
import os


def get_pysvn_client(func):
    def inner(request, path):
        ''' get user info '''
        info = User.objects.get(username=request.user.username)
        ''' cache the request numbers '''
        password_counter = {info.username:0}
        ''' svn login method '''
        def get_login( realm, username2, may_save ):
            isSecondAttemption = password_counter[info.username] != 0
            password_counter[info.username] = 1
            if isSecondAttemption:
                return False, info.username, 'bublik', False
            else:
                return True, info.username, info.password, False
        ''' client authentication '''
        client = pysvn.Client()
        client.callback_get_login = get_login
        ''' call decorated method with client'''
        return func(request, client)
    return inner



class SvnBackend(object):
    """
    Authenticate user and create an instance
    """

    def authenticate(self, username=None, password=None):
        login_valid = self.check_password(username, password)
        if login_valid:
            try:
                user = User.objects.get(username=username)
                if password != user.password:
                    user.set_password(password)
                    user.save()
            except User.DoesNotExist:
                # Create a new user. Note that we can set password
                # to anything, because it won't be checked; the password
                # from settings.py will.
                user = User(username=username, password=password)
                user.save()

            """ Create user folder for checkout """
            if settings.SVN_WORKING_COPY_PATH:
                userpath = settings.SVN_WORKING_COPY_PATH + '/' + username;
                if not os.path.exists(userpath):
                    try:
                        os.mkdir(userpath)
                        os.mkdir(userpath + '/branches')
                        os.mkdir(userpath + '/snippets')
                    except OSError:
                        print "Something wrong with user working directory creation." """Already exists """
            return user
        return None

    def check_password(self, username, password):
       if not settings.SVN_SERVER_URL:
           return False

       password_counter = {username:0}

       def get_login( realm, username2, may_save ):
          isSeconAttemption = password_counter[username] != 0
          password_counter[username] = 1
          if isSeconAttemption:
              return False, username, 'bublik', False
          else:
              return True, username, password, False

       self.client = pysvn.Client()
       self.client.callback_get_login = get_login
       try:
           self.client.list(settings.SVN_SERVER_URL)
           return True
       except pysvn.ClientError, e:
           print str(e)
           print e.args
       return False

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
