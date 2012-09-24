from django.contrib import admin
from easynav.diagramsview.models import Diagram 
from easynav.diagramsview.models import DiagramsView


class DiagramAdmin(admin.ModelAdmin):
  list_display = ('name', 'description', 'json', 'owner', "viewid")

class DiagramsViewAdmin(admin.ModelAdmin):
  list_display = ('name', "base_id", 'owner')


admin.site.register(Diagram, DiagramAdmin)
admin.site.register(DiagramsView, DiagramsViewAdmin)
