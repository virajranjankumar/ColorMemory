from django.contrib import admin

from .models import Score

class ScoreAdmin(admin.ModelAdmin):
	list_display = ('score', 'name', 'email', 'date')

admin.site.register(Score, ScoreAdmin)
