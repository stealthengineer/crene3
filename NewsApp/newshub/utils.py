# from .serializers import NewsSerializer
import pandas as pd
from newscollector.documents import NewsDocument
from elasticsearch_dsl import Search
from django.db.models import F, Value, CharField,Count,Case, When
from .models import Comments,Reactions,Voting
import random
import pytz
from datetime import datetime

def insert_to_db(data):
    try:
        for each in data:
            NewsDocument(**each).save()
        msg = 'Data Inserted'
    except Exception as e:
        msg = str(e)

    return msg



def get_sub_comments_count(comments):
    return Comments.objects.filter(
                                    parent_comment__in = comments
                                ).values(
                                    'parent_comment'
                                ).annotate(
                                    sub_cmnt_count = Count('parent_comment')
                                ).values(
                                    'parent_comment',
                                    'sub_cmnt_count'
                                )


def get_voting_of_comments(comments):
    
    return Voting.objects.filter(
                                    comment__in = comments
                                ).values('comment'
                                ).annotate(
                                    true_count = Count(Case(When(in_favour=True, then=1))),
                                    false_count = Count(Case(When(in_favour=False, then=1))),
                                    difference = F('true_count') - F('false_count')
                                ).values(
                                    'comment',
                                    'difference'
                                )

def get_user_voting(comments,user_id):
    return Voting.objects.filter(
                                    comment__in = comments , user = user_id
                                ).values(
                                    'comment',
                                    'in_favour'
                                )

def additional_comment_info(comments,user_id = None):
    # try:
    if comments:
        sub_comments_count = pd.DataFrame(list(get_sub_comments_count(comments)))
        voting_of_comments = pd.DataFrame(list(get_voting_of_comments(comments)))
        df = pd.DataFrame(comments.values('id'))
        df.rename(columns={'id':'comment'},inplace=True)
        if not sub_comments_count.empty:
            sub_comments_count.rename(
                columns = {
                    'parent_comment':'comment'
                },
                inplace=True
            )
            df = pd.merge(sub_comments_count,df,on='comment',how='outer')
        if not voting_of_comments.empty:
            df = pd.merge(voting_of_comments,df,on='comment',how='outer')
        if user_id:
            user_votes = pd.DataFrame(list(get_user_voting(comments,user_id)))
            if not user_votes.empty:
                df = pd.merge(df,user_votes,on='comment',how='outer')
        return df.to_dict(orient='records')
    print()
    return []
    # except:
    #     return []


def get_comments_count(news_ids):
    return Comments.objects.filter(
                                    is_delete=False,
                                    news_id__in=news_ids,
                                    is_parent = True
                                ).values(
                                    'news_id'
                                ).annotate(
                                    cmnt_count = Count('id')
                                ).order_by(
                                    'news_id'
                                ).values(
                                    'news_id',
                                    'cmnt_count'
                                )
    
    
def get_reaction_count(news_ids):
    return Reactions.objects.filter(
                                    is_delete=False,
                                    news_id__in=news_ids
                                ).values(
                                    'news_id'
                                ).annotate(
                                    reaction_count = Count('id')
                                ).order_by(
                                    'news_id'
                                ).values(
                                    'news_id',
                                    'reaction_count'
                                )

#++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
def get_user_reaction(news_ids, user_id):
    return Reactions.objects.filter(
        is_delete=False,
        news_id__in=news_ids,
        user_id=user_id
    ).values(
        'news_id',
        'reaction_type'
    )



def get_categorised_data(category):
    search = Search(using='default', index='news')
    search = search.query('match', category=category)
    search = search.sort('-publishedAt')
    search = search[:15]
    response = search.execute()
    return response


def custom_pagination(search, page, page_size):
    try:
        total_count = search.count()
        if page_size < total_count:
            start_index = (page - 1) * page_size
            search = search.extra(size=page_size, from_=start_index)
        response = search.execute()
    except Exception as e:
        response = str(e)
        total_count = 0
    return response,total_count


def get_reaction_cmnt_count_and_user_reaction(news_ids,user_id=None):
    try:
        reaction = get_reaction_count(news_ids)
        cmnt = get_comments_count(news_ids)
        if user_id:
            user_reaction = get_user_reaction(news_ids,user_id)

        reaction_df = pd.DataFrame(reaction) if reaction.exists() else pd.DataFrame(columns=['news_id','reaction_count'])
        cmnt_df = pd.DataFrame(cmnt) if cmnt.exists() else pd.DataFrame(columns=['news_id','cmnt_count'])
        merged_df = pd.merge(reaction_df, cmnt_df, on='news_id', how='outer')
        if user_id:
            user_reaction_df = pd.DataFrame(user_reaction) if user_reaction.exists() else pd.DataFrame(columns=['news_id','user_reaction'])
            merged_df = pd.merge(merged_df, user_reaction_df, on='news_id', how='left')
    except:
        merged_df = pd.DataFrame()
    return merged_df



def timezone_converter(pub_date,time_zone):
    if time_zone and pub_date:

        ist_timezone = pytz.timezone('Asia/Kolkata')
        input_date_str = pub_date.rsplit(' ',1)[0]
        try:
            input_datetime_ist = datetime.strptime(input_date_str, '%Y-%m-%dT%H:%M:%S%z').replace(tzinfo=ist_timezone)
        except ValueError:
            pass
    
        try:
            input_datetime_ist = datetime.strptime(input_date_str, '%b %d, %Y %H:%M').replace(tzinfo=ist_timezone)
        except ValueError:
            pass
        
        ny_timezone = pytz.timezone(time_zone)
        output_datetime_ny = input_datetime_ist.astimezone(ny_timezone)
        return output_datetime_ny.strftime('%b %d, %Y %H:%M %Z')



def get_display_data(page,page_size,search,user_id=None):
    try:
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
            
            count_df = get_reaction_cmnt_count_and_user_reaction(df.news_id.to_list(),user_id)
            merged_df = pd.merge(df, count_df, on='news_id', how='left')
            merged_df[['reaction_count','cmnt_count']] = merged_df[['reaction_count','cmnt_count']].fillna(0)

            merged_df=merged_df.astype({'reaction_count':int,'cmnt_count':int})
            merged_df.fillna('NoData',inplace=True)
            data = merged_df.to_dict('records')
            return {'count':count,'data':data}
        else :
            return {'count':0,'data':[]}
    except :
        return {'count':0,'data':[]}
