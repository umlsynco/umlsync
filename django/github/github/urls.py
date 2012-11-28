from django.conf.urls.defaults import *

# from django.views.generic.simple import redirect_to

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'', include('social_auth.urls')),
#    url(r'^login/$', redirect_to, {'url': 'login/github'}),
    # Examples:

    url(r'^$', 'editor.views.editor', name='editor.html'),
    url(r'^editor/', 'editor.views.editor2', name='editor.html'),
    url(r'^login-error/', 'editor.views.error', name='editor.html'),
    # url(r'^github/', include('github.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
