import os
from bs4 import BeautifulSoup

def extract_search_data(file_path, limit=200):
    activities = []

    with open(file_path, 'r', encoding='utf-8') as file:
        file_content = file.read()
        soup = BeautifulSoup(file_content, 'html.parser')

        for item in soup.find_all('div')[:limit]:
            activity = {}
            title_tag = item.find('div')
            if title_tag:
                activity['title'] = title_tag.get_text(strip=True)

            link_tag = item.find('a', href=True)
            if link_tag:
                activity['link'] = link_tag['href']

            time_tag = item.find('time')
            if time_tag:
                activity['time'] = time_tag.get_text(strip=True)

            activities.append(activity)

    return activities

def extract_all_activities(directory, limit=50):
    all_activities = []
    for file_name in os.listdir(directory):
        if file_name.endswith('.html'):
            file_path = os.path.join(directory, file_name)
            activities = extract_search_data(file_path, limit)
            all_activities.extend(activities)
            if len(all_activities) >= limit:
                break
    return all_activities[:limit]
