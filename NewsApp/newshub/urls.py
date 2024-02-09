from django.urls import path
from .views import (Comment,
                    Reaction,
                    LandingPage,
                    CategoryPage,
                    SearchingPage,
                    AllNews,
                    GetNewsDetails,
                    AddVoting,
                    SubComment,
                    testfun)

urlpatterns = [
    path('comments/', Comment.as_view()),
    path('reaction/', Reaction.as_view()),
    path('voting/',AddVoting.as_view()),
    path('subcomment/',SubComment.as_view()),
    path('',LandingPage.as_view(),name='LandingPage'),
    path('category/',CategoryPage.as_view(),name='CategoryPage'),
    path('search/',SearchingPage.as_view(),name='SearchingPage'),
    path('latest/',AllNews.as_view(),name='AllNews'),
    path('details/',GetNewsDetails.as_view(),name='GetNewsDetails'),
    path('testfun',testfun)
]