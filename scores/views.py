from django.http import JsonResponse
from django.views.generic.base import TemplateView
from .models import Score

class GameView(TemplateView):
    template_name = "index.html"
     
def create(request):
    name = request.GET.get('name')
    email = request.GET.get('email')
    score = request.GET.get('score')
    response = {'rank': 0}

    if name and email and score:
        Score.objects.create(name=name, email=email, score=score)
        response['rank'] = Score.objects.filter(score__gte=score).count()

    response['scores'] = list(Score.objects.values('name', 'score').all()[:3])
    json = JsonResponse(response, safe=False)
    json['Access-Control-Allow-Origin'] = '*'
    return json
