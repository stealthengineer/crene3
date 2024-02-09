from .views import add_news_data,data_insertion_schedule
from django.urls import path

urlpatterns = [
    path('insert/', add_news_data, name='Insert_data'),
    path('schedule_insert/', data_insertion_schedule, name='Schedule_Insert'),
]