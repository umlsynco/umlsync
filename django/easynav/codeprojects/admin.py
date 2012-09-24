from django.contrib import admin
from easynav.codeprojects.models import CodeProject,DiagramProject


class CodeProjectAdmin(admin.ModelAdmin):
  list_display = ('name', 'description')

class DiagramProjectAdmin(admin.ModelAdmin):
	list_display = ('name', 'description')

admin.site.register(CodeProject, CodeProjectAdmin)
admin.site.register(DiagramProject, DiagramProjectAdmin)
