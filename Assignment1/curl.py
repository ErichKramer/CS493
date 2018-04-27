#Erich Kramer
#CS493 Cloud Dev
#
#This script intended to test node.js server I am working on
#
import pdb
import requests
import json
import string
import random
import sys

base = "http://localhost:8000"


reviewFields = ["user", "stars", "expense", "review" ]
userFields = ["username", "firstname", "lastname", "email"]

#saved = []

def getBuis():
    return requests.get( base + "/businesses")

def randPost(link, fields, category=[], subcategory=[]):
    payload = {field: ''.join(random.choices( string.ascii_uppercase +\
            string.digits, k=8)) for field in fields }
    print(link)
    if (category and subcategory):
        #category must be specified, subcategory may be a list
        payload["category"] = category
        #if it's stupid, and it works, then it's not stupid
        if ( type(subcategory) == type([]) ):
            payload["subcategory"] = random.choice(subcategory)
        else:
            payload["subcategory"] = subcategory
    print("Payload:", payload)
    response = requests.post(link, json=payload) 
    #saved.append(payload)
    print(response.text)
    print(response.status_code, response.reason)
    return response



def randString(l=6):
    return ''.join( random.choices( string.ascii_uppercase \
            + string.digits, k=l))

def randDict(fields=[]):
    resDict = {}
    for f in fields:
        resDict[f] = randString()
    return resDict

def getURL(URL, silent=False):
    response = requests.get(URL)
    if( not silent):
        print(response.text)
    return response

def postURL(URL, payload=None):
    return requests.post(URL, json=payload)

def putURL(URL, payload=None):
    return requests.put(URL, json=payload)

def deleteURL(URL, payload=None):
    return requests.delete(URL, json=payload)





def businessesTest():
    buisFields = ["user", "name", "address", "city", "state", "zipcode", "phone",\
        "category", "subcategory"]
    
    #get
    print("Testing Businesses GET /businesses")
    print(getURL( base+ "/businesses", silent=True))  

    #getID
    print("Testing get, specified ID")
    print( getURL( base+ "/businesses/"+ '0', silent=True) )

    #put
    print("Testing put URL")
    print(putURL(base+"/businesses/" + '0', payload=randDict(buisFields) ))

    #post
    print("Testing post to business")
    
    print(postURL( base + "/businesses" , payload=randDict(buisFields) ) )
    #pdb.set_trace()
    
    #delete
    print("Testing delete business")
    print(deleteURL( base+ "/businesses/"+'0') ) 

    return


def userTest():
    userFields = ["username", "firstname", "lastname", "email"]
    #get
    print("Testing User GET /users")
    print(getURL( base+"/users", silent=True) )

    #post
    print("Testing user POST /users")
    tmp = randDict(userFields)
    tmp['username'] = "Default"
    print(postURL( base+ "/users", payload=tmp) )

    #getID
    print("Testing get USER specified ID")
    print(getURL(base+"/user/"+"Default", silent=True ) )

    #put
    print("Testing PUT user ID")
    tmp = randDict(userFields)
    print(putURL(base+"/users/"+ "Default", payload=tmp ) )


    #delete

    return


def categoriesTest():
    #get
    #getID
    #put
    #post
    #delete
    return

def photoTest():
    #put
    #post
    #delete
    return

def reviewTest():
    reviewFields = ["user", "stars", "expense", "text"]
    #get
    #put
    #post
    #delete
    return










if __name__ == "__main__":
    input("Begin Businesses check")
    businessesTest()
    input("Begin User check")
    userTest()
    input("Begin Categories check")
    categoriesTest()
    input("Begin Photo Test")
    photoTest()
    input("Begin review test")
    reviewTest()

