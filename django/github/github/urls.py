from django.conf import settings
from django.conf.urls.defaults import *
from django.conf.urls.static import static

from django.views.generic import RedirectView

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'', include('social_auth.urls')),
    url(r'^login/', RedirectView.as_view(url='/login/github/')),
    url(r'^$', 'editor.views.editor', name='editor.html'),
    url(r'^editor/', 'editor.views.editor2', name='editor.html'),
    url(r'^login-error/', 'editor.views.error', name='editor.html'),
    url(r'^export/', 'editor.views.export'),
    url(r'^github/(?P<path>.*)$', 'editor.views.open_path'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),

) + static(settings.IMAGES_URL, document_root=settings.IMAGES_ROOT)
