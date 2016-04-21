from __future__ import unicode_literals

from django.db import models

class Score(models.Model):
    name = models.CharField(max_length=80)
    email = models.EmailField()
    score = models.IntegerField(default=0, db_index=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "%s - %s" % (self.name, self.score)

    class Meta:
        ordering = ['-score']
