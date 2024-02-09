from decouple import config
from newscollector.utils import insert_to_db
import requests
import pandas as pd 
from elasticsearch_dsl import Search
from datetime import datetime,timedelta,date
from news_app.get_env_values import get_secret
import json


categories = json.loads(get_secret('MS_CATEGORY'))

def get_ms_data():
    ApiKey = get_secret('MEDIASTACK_KEY')
    url ="https://api.mediastack.com/v1/news?access_key={api_key}&categories={category}"
    scrap_data = list()
    for category in categories:
        try:
            response = requests.get(url.format(api_key=ApiKey,category=category))
            response.raise_for_status() 
            data = response.json()
            if data:
                if 'data' in data.keys:
                    df=pd.DataFrame(data['data'])
                    df.drop(['language','country'],inplace=True, axis=1)
                    df=df.rename(
                        columns={'url':'source_url',
                                'published_at':'publishedAt' 
                                }
                    )
                    df = remove_duplicate(df,category)
                    scrap_data.extend(df.to_dict(orient='records'))
        except Exception as e:
            print(e)
        status=insert_to_db(scrap_data)
        print(status)


def remove_duplicate(df,category):
    try:
        search = Search(using='default', index='news')
        search = search.query('match', category=category)
        search = search.sort('-publishedAt')
        search = search[:1]
        response = search.execute()
        if len(response) > 0:
            res = response[0].publishedAt
            df = df[(df['publishedAt'] > res) & (df['category'] == category)]
    except:
        pass
    return df