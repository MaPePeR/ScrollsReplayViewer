import os
from os.path import exists
from sys import exit
from urllib.request import urlopen
from urllib.parse import urlencode
import json
import time

folder = './images/'
if not exists(folder):
    os.makedirs(folder)


def downloadScrollImage(name, file):
    url = "http://a.scrollsguide.com/image/screen?{0}".format(urlencode({"name": name}))
    print("Downloading {0} to {1}".format(url, file))
    req = urlopen(url)
    with open(file, 'wb') as fp:
        while True:
            chunk = req.read(1000)
            if not chunk:
                break
            fp.write(chunk)
    req.close()


request = urlopen("http://a.scrollsguide.com/scrolls?norules")
encoding = request.headers.get_content_charset()
scrollsData = request.readall().decode(encoding or "utf-8")
request.close()

scrollsData = json.loads(scrollsData)
print("Scrollsguide says: {0}".format(scrollsData['msg']))
if scrollsData['msg'] != 'success':
    exit(1)
scrollsData = scrollsData['data']

for scroll in scrollsData:
    pathForFile = "{0}{1}.png".format(folder, scroll['id'])
    if exists(pathForFile):
        print("Skipping ID: {0} Name: {1}".format(scroll['id'], scroll['name']))
    else:
        print("Downloading ID: {0} Name: {1}".format(scroll['id'], scroll['name']))
        downloadScrollImage(scroll['name'], pathForFile)
        time.sleep(10)
