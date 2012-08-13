from django.db import models
from django.contrib.auth.models import User

from djblets.util.fields import JSONField

# Views/sub-views model for User
# 
class DiagramsView(models.Model):
    owner = models.ForeignKey(User)         # Each user has it's own folders structure
    name = models.CharField(max_length=256)  # name of the folder.
    base_id = models.ForeignKey('self', blank=True, null=True)  # self reference to make a tree hierarchy. null is root folder

# The diagram descriptor
class Diagram(models.Model):
    owner = models.ForeignKey(User)         # owner of the diagram
    name = models.CharField(max_length=30)  # name of the diagram
    description = models.CharField(max_length=30)  # description of the diagram
    json = models.TextField() # JSON field of djbles is not applicable for it :(
    status = models.CharField(max_length=10)  # status w-work, r-review, p-published. This field is under discussion.
    viewid = models.ForeignKey(DiagramsView, null=True) # folder which contain this diagram


