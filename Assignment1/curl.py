#Erich Kramer
#CS493 Cloud Dev
#
#This script intended to test node.js server I am working on
#

import requests
import string
import random
import sys

base = "http://localhost:8000"

buisFields = ["user", "name", "address", "city", "state", "zipcode", "phone",\
    "category", "subcategory"]

reviewFields = ["user", "stars", "expense", "review" ]
userFields = ["username", "firstname", "lastname", "email"]

def randPost(link, fields, category=[], subcategory=[]):
    payload = {field: ''.join(random.choices( string.ascii_uppercase +\
            string.digits, k=8)) for field in fields }

    if (category and subcategory):
        #category must be specified, subcategory may be a list
        payload["category"] = category
        #if it's stupid, and it works, then it's not stupid
        if ( type(subcategory) == type([]) ):
            payload["subcategory"] = random.choice(subcategory)
        else:
            payload["subcategory"] = subcategory

    response = requests.post(link, json=payload) 

    print(response.text)
    print(response.status_code, response.reason)
    return response


if len(sys.argv) < 2:
    print("Usage: curl.py [number posts]")
    exit(1)
for _ in range(int(sys.argv[1])):
    randPost( base + "/businesses", buisFields, category="resturant", subcategory=["mexican"])



