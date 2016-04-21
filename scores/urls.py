from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^create/', views.create, name='create'),
    url(r'^$', views.GameView.as_view(), name='game'),
]
