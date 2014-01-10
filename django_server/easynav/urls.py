from django.conf.urls.defaults import patterns, include, url
#from django.contrib.auth.views import login

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^navigator$', 'easynav.views.dynamic_tree', name='dynamic-tree'),
    url(r'^viewer$', 'easynav.views.viewer', name='dynamic-tree'),
    url(r'^vm/getviews$', 'easynav.viewmanager.views.getViews', name='get-list'),
    url(r'^proxy/(?P<path>.*)$', 'easynav.viewmanager.views.proxy_to', {'target_url': 'http://umlsynch.googlecode.com/svn/trunk/%20umlsynch/'}),
#Diagrams view with "DV" uid
    url(r'^vm/dv/save$', 'easynav.diagramsview.views.save_diagram', name='save_diagram'),
    url(r'^vm/dv/getlist$', 'easynav.diagramsview.views.get_user_diagrams', name='get_user_diagrams'),
    url(r'^vm/dv/getcapabilities$', 'easynav.codeprojects.views.getCapabilities', name='view-capabilities'),
    url(r'^vm/dv/getdiagram$', 'easynav.diagramsview.views.get_user_diagram', name='get_user_diagram'),
    url(r'^vm/dv/removediagram$', 'easynav.diagramsview.views.remove_user_diagram', name='remove_user_diagram'),
    url(r'^vm/dv/newfolder$', 'easynav.diagramsview.views.new_diagram_folder', name='new_diagram_folder'),
#Code project view with "CP" uid
    url(r'^navigator/$', 'easynav.codeprojects.views.dynamic_tree_ajax', name='dynamic-tree'),
    url(r'^vm/cp/getcapabilities$', 'easynav.codeprojects.views.getCapabilities', name='view-capabilities'),
    url(r'^vm/cp/save$', 'easynav.codeprojects.views.saveFile', name='save_diagram'),
    url(r'^vm/cp/getlist$', 'easynav.codeprojects.views.dynamic_tree_ajax', name='get_user_diagrams'),
    url(r'^vm/cp/getdiagram$', 'easynav.codeprojects.views.getFile', name='get_user_diagram'),
    url(r'^vm/cp/remove$', 'easynav.codeprojects.views.RemoveContent', name='remove_user_diagram'),
    url(r'^vm/cp/newfolder$', 'easynav.codeprojects.views.newFolder', name='new_diagram_folder'),
    url(r'^vm/cp/open$','easynav.codeprojects.views.browsing_file', name='file-path'),
#code project forms for projects managment
	#url(r'^newproject$', 'easynav.codeprojects.views.newproject_form', name='newproject_form'),
#    url(r'^newproject-diagram-only$', 'easynav.codeprojects.views.newproject_diagram_only_form', name='newproject_diagram_only_form'),
    #url(r'^newproject-diagram$', 'easynav.codeprojects.views.newproject_diagram_form', name='newproject_diagram_form'),
    #url(r'^newproject-diagram-and-code$', 'easynav.codeprojects.views.newproject_diagram_and_code_form', name='newproject_diagram_and_code_form'),
#code project forms for index database access
    url(r'^vm/cp/db/class/methods/$', 'easynav.codeprojects.views.class_methods_ajax', name='class-methods'),
    url(r'^vm/cp/db/class/getbase/$', 'easynav.codeprojects.views.class_getbase_ajax', name='class-base'),
    url(r'^vm/cp/db/class/realization/$', 'easynav.codeprojects.views.class_getrealization_ajax', name='class-realization'),
    url(r'^accounts/login/$', 'django.contrib.auth.views.login', {'template_name': 'accounts/login.html'}),

    # Review request detail
    #url(r'^open/(?P<file-path>[A-Za-z0-9_\-\.]+)$','browser.views.hello', name='file-path'),
    url(r'^tabs$','easynav.views.browsing_tabs', name='file-path'),
    url(r'^editor/$','easynav.codeprojects.views.browsing_file', name='file-path'),
    # url(r'^browser/', include('browser.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)

# Main includes
urlpatterns += patterns('',
    (r'^account/', include('easynav.accounts.urls')),
)
