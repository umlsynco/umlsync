from django.db import models

from django.contrib.auth.models import User

# Create your models here.

class CodeProject(models.Model):
  owner = models.ForeignKey(User)                   # owner is responsible for code projects update
  status = models.CharField(max_length=10)          # common status of project common/private/group & checking out/parsing/updating etc
  name = models.CharField(max_length=30)            # name of the project
  description = models.CharField(max_length=300)    # description of the project with url
  cm_system = models.URLField(max_length=256)       # Location of project in source control system 
  co_path = models.CharField(max_length=256)        # path on the local server to the checked outed version
  db_path = models.CharField(max_length=256)        # path on the local DB4 database storage
  cm_revision = models.DecimalField(max_digits=20, decimal_places=0)  # the latest checked outed revision
 
class DiagramProject(models.Model):
  owner = models.ForeignKey(User)                   # owner of project
  codeProject = models.ForeignKey(CodeProject, blank=True, null=True) # code project id
  name = models.CharField(max_length=30)            # name of diagram project
  description = models.CharField(max_length=300)    # description of the project with url
