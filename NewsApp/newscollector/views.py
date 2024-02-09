from celery.schedules import crontab
from django.http import HttpResponseRedirect,HttpResponse
from django.contrib.admin.views.decorators import staff_member_required
from django_celery_beat.models import PeriodicTask, CrontabSchedule

from django.views import View
from django.contrib import messages

from .task import news_scrapper

@staff_member_required
def add_news_data(request):
    if request.user.is_superuser:
        news_scrapper.delay()
        messages.success(request, 'Data insertion started')
    else :
        messages.error(request, 'You dont have permission for this tasks')
    return HttpResponseRedirect('/admin')

    
@staff_member_required  
def data_insertion_schedule(request):
    if request.user.is_superuser:
        try:
            time=request.POST.get('Schedule_time').split(":")
            hour=int(time[0])
            minute=int(time[1])
            schedule, created = CrontabSchedule.objects.get_or_create(hour=hour,minute = minute)
            task = PeriodicTask.objects.create(crontab=schedule, name=f"{request.POST.get('Schedule_name')}", task='newscollector.task.news_scrapper')
            messages.success(request, 'Scheduler is saved')
        except Exception as e:
            messages.error(request, str(e))
    else:
        messages.error(request, 'You dont have permission for this tasks')
    return HttpResponseRedirect('/admin')
