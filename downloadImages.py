import os
from os.path import exists
from sys import exit
from urllib.request import urlopen
from urllib.parse import urlencode
import json
import time

scrollImageFolder = './scrollimages/'
if not exists(scrollImageFolder):
    os.makedirs(scrollImageFolder)

mainImageFolder = './mainimages/'
if not exists(mainImageFolder):
    os.makedirs(mainImageFolder)


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


def downloadMainImage(id, file):
    url = "http://www.scrollsguide.com/app/low_res/{0}.png".format(id)
    print("Downloading Image-{0} to {1}".format(id, file))
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
    pathForScrollImage = "{0}{1}.png".format(scrollImageFolder, scroll['id'])
    pathForMainImage = "{0}{1}.png".format(mainImageFolder, scroll['image'])
    if exists(pathForScrollImage):
        print("Skipping Scroll-ID: {0} Name: {1}".format(scroll['id'], scroll['name']))
    else:
        print("Downloading ID: {0} Name: {1}".format(scroll['id'], scroll['name']))
        downloadScrollImage(scroll['name'], pathForScrollImage)
        time.sleep(5)
    if exists(pathForMainImage):
        print("Skipping Main-Image: {0} Name: {1}".format(scroll['image'], scroll['name']))
    else:
        print("Downloading Image-ID: {0} Name: {1}".format(scroll['image'], scroll['name']))
        downloadMainImage(scroll['image'], pathForMainImage)
        time.sleep(5)
