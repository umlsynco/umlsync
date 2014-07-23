from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'login.html'}),
    url(r'^branches/(?P<path>[0-9]*)$', 'umlsync.views.list_branches'),
    url(r'^list/(?P<path>.*)$', 'umlsync.views.list_content'),
    url(r'^status/(?P<path>.*)$', 'umlsync.views.list_status'),
    url(r'^open/(?P<path>.*)$', 'umlsync.views.open_content'),
    url(r'^save/(?P<path>.*)$', 'umlsync.views.save_content'),
    url(r'^remove/(?P<path>.*)$', 'umlsync.views.remove_content'),
    url(r'^revert/(?P<path>.*)$', 'umlsync.views.revert_content'),
    url(r'^$', 'umlsync.views.editor', name='editor.html'),
    # Examples:
    # url(r'^$', 'intranet.views.home', name='home'),
    # url(r'^intranet/', include('intranet.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
