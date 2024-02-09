import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "news_app.settings")
app = Celery("news_app")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.conf.beat_schedule = {
    'send-mail-every-day-at-8': {
        'task': 'newscollector.task.news_scrapper',
        'schedule': crontab(hour=0,minute = 00)
        #'args': (2,)
    }   
}
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Resquest: {self.request!r}')