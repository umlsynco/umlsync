from django.db import models

# Create your models here.

class Branches(models.Model):
    KIND_CHOICES = (
        (u'T', u'trunk'),
        (u'B', u'branch'),
        (u'D', u'deadwood'),
        (u'R', u'release'),
        (u'G', u'tag'),
        (u'R', u'removed'),
    )
    kind = models.CharField(max_length=1, choices=KIND_CHOICES)
    name = models.CharField(max_length=100)

class UserBranches(models.Model):
    branch = models.ForeignKey(Branches)
    revision = models.IntegerField()
    last_viewed_date = models.DateField()
    last_modified_date = models.DateField()

"""
class UserSnippets(models.Model):
"""

