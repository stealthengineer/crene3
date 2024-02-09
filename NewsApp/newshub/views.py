from django.shortcuts import render,redirect
from django.http import JsonResponse,HttpResponseRedirect,HttpResponse
from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import Count
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import F, Count, Q as db_Q
from elasticsearch_dsl import Q,Search
import pandas as pd
import numpy as np
import pytz
from datetime import date
from dateutil.relativedelta import relativedelta
from .models import Comments,Reactions,Voting
from django.urls import reverse

from decouple import config
from news_app.get_env_values import get_secret
from newscollector.documents import NewsDocument
from .utils import (get_display_data,
                    custom_pagination,
                    get_user_reaction,
                    get_comments_count, 
                    get_reaction_count,
                    timezone_converter,
                    additional_comment_info)



connection = get_secret('CONNECTION')
index = get_secret("INDEX")

@method_decorator(csrf_exempt, name='dispatch')
class Comment(View):
    def get(self,request,*args,**kwargs):
        news_id = request.GET.get('news_id')
        page_no=int(request.GET.get('page_no',1))
        if page_no: 
            comm = Comments.objects.filter(news_id = news_id,is_parent=True,is_delete=False).annotate(fav_count = Count("commnt_voteing__id", filter=db_Q(commnt_voteing__in_favour=True)),unfav_count=Count("commnt_voteing__id", filter=db_Q(commnt_voteing__in_favour=False))).annotate(count_diff=F('fav_count')-F('unfav_count')).order_by('-count_diff')
            p = Paginator(comm, 10)
            if page_no <= p.num_pages:
                page_comment = p.page(page_no).object_list.annotate(
                                                                usernames = F('user_id__username'),  
                                                                comments = F('text'),
                                                                cmnt_time = F('created_at'),                                              
                                                                ).values(
                                                                    'id',
                                                                    'usernames',
                                                                    'comments',
                                                                    'cmnt_time',
                                                                    'news_id'
                                                                )
                if request.user.is_authenticated:
                    data = additional_comment_info(p.page(page_no).object_list,request.user.id)

                else:
                    data = additional_comment_info(p.page(page_no).object_list)

                if data:
                    df = pd.DataFrame(list(page_comment))
                    additional_df = pd.DataFrame(data)
                    additional_df.rename(columns={'comment':'id'},inplace=True)
                    print(additional_df)
                    df = pd.merge(df,additional_df,on='id',how='outer')
                    df=df.replace(np.nan, '0')
                    return JsonResponse({'comments_list':df.to_dict(orient='records')})
                return JsonResponse({'comments_list':list(page_comment)})
            return JsonResponse({'comments_list':[]})
        return JsonResponse({'alert':'No page found'})
    

    def post(self,request,*args,**kwargs):
        if request.user.is_authenticated:
            user_id = request.user.id
            text = request.POST.get('text')
            news_id = request.POST.get('news_id')
            try:
                newcomnt=Comments.objects.create(
                                        user_id_id=user_id,
                                        text=text,
                                        news_id=news_id,
                                        is_delete=False
                                    )
                newcomnt.save()
                msg = 'Created Successfully'

            except Exception as e:
                msg = str(e)
            comment_count = Comments.objects.filter(is_delete=False,news_id=news_id,is_parent = True).count()
            return JsonResponse({'comment_count':comment_count,'username':request.user.username,'msg':msg,'commentid':newcomnt.id})
        else:
            return JsonResponse({'alert':'please login for comments'})
        
    def put(self,request,*args,**kwargs):
        comment_id=request.POST.get('comment_id')
        Reaction.objects.get(
                id = comment_id
            ).update(is_delete=True)
        msg = 'Deleted Successfully'
        return {'msg':msg}
        
    
@method_decorator(csrf_exempt, name='dispatch')
class Reaction(View):
    def get(self,request,*args,**kwargs):
        news_id = request.GET.get('news_id')
        reaction = dict(Reactions.objects.filter(
                                            is_delete=False,
                                            news_id=news_id
                                        ).values(
                                            'reaction_type'
                                        ).annotate(
                                            reaction_count = Count('id')
                                        ).order_by(
                                            'reaction_type'   
                                        ).values_list('reaction_type','reaction_count'))
        return JsonResponse(reaction)

    def post(self,request,*args,**kwargs):
        if request.user.is_authenticated:
            user_id = request.user.id
            reaction_type = request.POST.get('text')
            news_id = request.POST.get('news_id')
            user_reaction = Reactions.objects.filter(
                user_id=user_id,
                news_id=news_id
            )
            try:
                if user_reaction.exists():
                    user_reaction.update(reaction_type=reaction_type)
                    msg = {'Updated':'Sucess'}
                else:
                    Reactions.objects.create(
                                            user_id_id=user_id,
                                            reaction_type=reaction_type,
                                            news_id=news_id,
                                            is_delete=False
                                        )
                    msg = {'Created':'Sucess'}
            except Exception as e:
                msg = str(e)
            return JsonResponse(msg)
        else:
            return JsonResponse({'alert':'please login for reaction'})
    

    def put(self,request,*args,**kwargs):
        news_id = request.body.decode("utf-8").split('=')[1]
        if request.user.is_authenticated:
            user_id = request.user.id
            try:
                Reactions.objects.get(
                        user_id=user_id,
                        news_id = news_id
                    ).delete()
                msg = 'Deleted Successfully'
            except Exception as e:
                msg=str(e)
            return JsonResponse({'msg':msg})
        return JsonResponse({'alert':'User not login'})
        

@method_decorator(csrf_exempt, name='dispatch')
class SubComment(View):
    def get(self,request,*args,**kwargs):
        parent_comment = request.GET.get('parent_comment')
        sub_comments = Comments.objects.filter(parent_comment=parent_comment,is_parent=False,is_delete=False).annotate(fav_count = Count("commnt_voteing__id", filter=db_Q(commnt_voteing__in_favour=True)),unfav_count=Count("commnt_voteing__id", filter=db_Q(commnt_voteing__in_favour=False))).annotate(count_diff=F('fav_count')-F('unfav_count')).order_by('-count_diff')
 

        if request.user.is_authenticated:
            data = additional_comment_info(sub_comments,request.user.id)

        else:
            data = additional_comment_info(sub_comments)
        sub_comments = sub_comments.annotate(
                                    usernames = F('user_id__username'),  
                                    comments = F('text'),
                                    cmnt_time = F('created_at'),                                              
                                ).values(
                                    'usernames',
                                    'comments',
                                    'cmnt_time',
                                    'id'
                                )
        if data:
            df = pd.DataFrame(list(sub_comments))
            additional_df = pd.DataFrame(data)
            additional_df.rename(columns={'comment':'id'},inplace=True)
            print(additional_df)
            df = pd.merge(df,additional_df,on='id',how='outer')
            df=df.replace(np.nan, '0')
            return JsonResponse({'sub_comments':df.to_dict(orient='records'),'parent_comment':parent_comment})
        return JsonResponse({'sub_comments':list(sub_comments),'parent_comment':parent_comment})
    def post(self,request,*args,**kwargs):
        if request.user.is_authenticated:
            user_id = request.user.id
            text = request.POST.get('text')
            news_id = request.POST.get('news_id')
            parent_comment = request.POST.get('parent_comment')
            try:
                sub_comment=Comments.objects.create(
                                        user_id_id=user_id,
                                        text=text,
                                        news_id=news_id,
                                        parent_comment_id = parent_comment,
                                        is_delete=False,
                                        is_parent=False
                                    )
                sub_comment.save()
                sub_comment_count = Comments.objects.filter(is_delete=False,parent_comment=parent_comment,is_parent = False).count()
                return JsonResponse({'sub_cmnt_count':sub_comment_count,'msg':'CREATED','username':request.user.username,'sub_cmnt_id':sub_comment.id})
            except Exception as e:
                return JsonResponse({'alert':str(e)})
        return JsonResponse({'alert':'Please login'})


@method_decorator(csrf_exempt, name='dispatch')
class AddVoting(View):
    def post(self,request):
        if request.user.is_authenticated:
            comment = int(request.POST.get('comment'))
            in_favour  = request.POST.get('vote')
            user_id = request.user
            vote = Voting.objects.filter(user = user_id,
                               comment = int(comment))
            if in_favour == 'true':
                in_favour=True
            else:
                in_favour=False
            if vote.exists():
                if vote.first().in_favour == in_favour:
                    vote.delete()
                    return JsonResponse({'msg':'DELETED'})
                else:
                    vote.update(in_favour=in_favour)
                    return JsonResponse({'msg':'UPDATE'})
            new_vote = Voting(user=user_id,comment_id=comment,in_favour=in_favour)
            new_vote.save()
            return JsonResponse({'msg':'CREATED'})
        return JsonResponse({'alert':'Please login for vote'})
    


class CategoryPage(View):
    def get(self,request,*args, **kwargs):
        category = request.GET.get('category')
        page = int(request.GET.get('page',1))
        page_size = 80
        return_type = request.GET.get('type','')
        user_id=None
        if request.user.is_authenticated:
            user_id = request.user.id
        search = Search(using=connection, index=index)
        if category:
            if category == 'All':
                search = search.sort('-publishedAt')
            else:
                search = search.query('match', category=category) 
        if search:
            outcome=get_display_data(page,page_size,search,user_id)
            total_page = (int(outcome['count'])/16)+1
            if return_type == 'json':
                return JsonResponse(outcome['data'],safe=False)
            return render(request,'category.html',{"count":outcome['count'],'Categorydata':outcome['data'],'Category':category,'total_page':total_page,'page':page})
        return redirect(request.get_full_path())

class LandingPage(View):
    def get(self,request,*args, **kwargs):
        page = request.GET.get('page',1)
        page_size = 80
        user_id=None
        if request.user.is_authenticated:
            user_id = request.user.id
        search = Search(using=connection, index=index)
        search = search.sort('-publishedAt')
        Latestdata=get_display_data(page,page_size,search,user_id)
        search = search.query('match', category='trending')
        Trendingdata=get_display_data(page,page_size,search,user_id)
        return render(request,'index.html',{"count":Latestdata['count'],'Latestdata':Latestdata['data'],'Trendingdata':Trendingdata['data']})

class SearchingPage(View):
    def get(self,request,*args, **kwargs):
        q = request.GET.get('q')
        page = int(request.GET.get('page',1))
        page_size = 16
        return_type = request.GET.get('type','')
        time_zone=request.COOKIES.get("user_timezone",'America/New_York')
        search = Search(using=connection, index=index)
        if q:
            q = q.lower()
            qry =   Q('fuzzy', title={'value': q, 'fuzziness': 'AUTO'} ) | \
                Q('fuzzy', content={'value': q, 'fuzziness': 'AUTO'} ) | \
                Q('fuzzy', description={'value': q, 'fuzziness': 'AUTO'} )
            search = search.query(qry)
        else:
            search = search.sort('-publishedAt')
        response,count = custom_pagination(search,page,page_size)
        final_res = list(response.to_dict()['hits']['hits'])
        if final_res:
            df = pd.DataFrame(final_res)
            df.rename(columns={'_id': 'news_id'}, inplace=True)
            if '_source' in df.columns:
                data_df=pd.DataFrame(df['_source'].tolist())
                df = pd.concat([df, data_df], axis=1)
            cols = set(df.columns.to_list())
            unwanted_cols = {'_ignored','_index','_score','sort'}
            common_cols = unwanted_cols.intersection(cols)
            df.drop(common_cols,axis=1, inplace=True)
            df = df[['news_id','title','description','publishedAt','category']]
            df['publishedAt']=df['publishedAt'].apply(timezone_converter,time_zone=time_zone)
            df.fillna('default',inplace=True)
            data = df.to_dict(orient='records')
            if return_type == 'json':
                return JsonResponse(data,safe=False)
            total_page = (int(count)/16)+1
            return render(request,'search.html',{"count":count,'data':data,'query':q,'total_page':total_page,'page':page})
        messages.error(request, f'No result for {q}')
        return HttpResponseRedirect("/")


class AllNews(View):
    def get(self,request,*args, **kwargs):
        page = request.GET.get('page',1)
        page_size = 80
        user_id=None
        if request.user.is_authenticated:
            user_id = request.user.id
        search = Search(using=connection, index=index)
        search = search.sort('-publishedAt')
        outcome=get_display_data(page,page_size,search,user_id)
        total_page = int(outcome['count'])/28
        return render(request,'base.html',{"count":outcome['count'],'data':outcome['data'],'category': 'All','total_page':total_page,'page':page})


class GetNewsDetails(View):
    def get(self,request,*args,**kwargs):
        id = request.GET.get('id')
        try:
            data = NewsDocument.get(id=id)
        except:
            messages.error(request, 'This news not preset yet! ')
            return HttpResponseRedirect('/')   
        ny_timezone = pytz.timezone(request.COOKIES.get("user_timezone",'America/New_York'))
        comments_count = Comments.objects.filter(is_delete=False,news_id=id).count()
        reaction_count = Reactions.objects.filter(is_delete=False,news_id=id).count()
        reaction_type = None
        if request.user.is_authenticated:
            user_reaction = Reactions.objects.filter(is_delete=False,news_id=id).values_list('reaction_type', flat=True)
            if user_reaction.exists():
                reaction_type = user_reaction[0]
        res = {
            "title":data.title,
            "content":data.content,
            "publishedAt":data.publishedAt.astimezone(ny_timezone).strftime('%b %d, %Y %H:%M %Z'),
            "author":data.author,
            "description":data.description,
            "category":data.category,
            "reaction_count":reaction_count,
            "comments_count":comments_count,
            "news_id":id,
            "reaction_type":reaction_type
        }
        search = Search(using=connection, index=index)
        result = search.query('match', category=data.category)
        sub_data=get_display_data(1,7,result)
        return render(request,'postdetail.html',{'data':res,'sub_data':sub_data['data']})
    # data.publishedAt


def testfun(request):
    category = 'trending'
    search = Search(using='default', index='news')
    search = search.query('match', category=category)
    search = search.sort('-publishedAt')
    search = search[:1]
    response = search.execute()
    res = response[0].publishedAt
    print(type(res))
    return HttpResponse(res,type(res))
