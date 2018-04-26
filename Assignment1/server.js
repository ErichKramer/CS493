/*Erich Kramer
 * CS493 Assignment one
 * Apache License
 */


/*
 * TODO: robust python test library
 * implement a reivews get so I can query a business
 *
 *
 *
 * */



//INCLUDES

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var port = process.env.PORT || 8000;
app.use(bodyParser.json());
app.use(express.static('public'));


//NOTE THAT THIS INFORMATION IS NOT MEANT TO BE USED
//IT IS ONLY FOR DEBUG/DEMO PURPOSES
//EVERYTHING IS STILL IN MEMORY
var users      = require('./users'); 
var businesses = require('./businesses');
var categories = require('./categories');   //dictionary of category : [subcategories] {[], []}
var users = {}; // dictionary of users, username maps to info

//attributes of business that are expected 
var buisAttr = ["user", "name", "address", "city", "state", "zipcode", "phone", 
    "category", "subcategory"];
var reviewAttr = ["user", "stars", "expense", "text" ];
var userAttr = ["username", "firstname", "lastname", "email"];
var photoAttr = ["user", "photo", "caption" ];

//Above attributes used here to validate
function isValidReq(req, attr){
    var valid = true; 


    for ( a of attr){
        valid = valid && req.body[a]; 
        if( !req.body[a]){
            console.log(a);
            console.log(req.body[a]);
        }
    }
    return valid && req.body;
}


function validCategory(cat, subcat){
    return categories[cat].includes(subcat);
}



/* BEGIN BUSINESS BLOCK
 * FUNCTIONS TO MODIFY BUSINESS
 * INFORMATION/STATE ON SERVER 
 * -GET ALL OR INDIVIDUAL
 * -POST NEW BUSINESS
 * -EDIT KNOWN BUSINESS
 * -DELETE EXISTING BUSINESS
 * */


//Top level link.
app.get('/', function (req, res, next) {
  res.status(200).send("Welcome! Please visit /businesses\n");
});

//get ALL businessses
app.get('/businesses', function(req, res, next){

    //Pagination and logic borrowed from Hessro
    //Like skidrow but more personable

    var size = Object.keys(businesses).length;

    var page = parseInt(req.query.page) || 1;
    var numPerPage = 10;
    var lastPage = Math.ceil(size / numPerPage);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;

    var start = (page -1) * numPerPage;
    var end = start + numPerPage;
    var pageBuis = (Object.entries(businesses)).slice(start, end);

    var links = {};
    if (page < lastPage) {
        links.nextPage = '/businesses?page=' + (page+1);
        links.lastPage = '/businesses?page=' + lastPage;
    }
    if (page >1){
        links.prevPage = '/businesses?page=' + (page-1);
        links.firstPage = '/businesses?page=1';
    }

    res.status(200).json({
        businesses: pageBuis,
        pageNumber: page,
        totalPages: lastPage,
        pageSize: numPerPage,
        totalCount: size,
        links: links
    });

});

//get a specific business
app.get('/businesses/:busiID', function( req, res, next){
    console.log(" -- req.params:" , req.params);
    var buisID = req.params.busiID;
    if(businesses[buisID]){
        res.status(200).json(businesses[buisID]);
    }else{
        next();
    }
});
 

//Send a business to the server, append to dictionary
app.post('/businesses', function(req, res, next) {
    console.log(" -- req.body:" , req.body);
    if ( isValidReq(req, buisAttr) ){
        var id = Object.keys(businesses).length;
        businesses[id] = req.body;
        businesses[id].reviews = {};    //instantiate reviews and photos
        businesses[id].photos = {};
        res.status(201).json({
            id:id,
            links: { 
                business: '/businesses/'+id
            }
        });
    }else{
        res.status(400).json({
            err: "Error in verification. Did you fill all fields?"
        });
    }
});

//edit a specific business
app.put('/businesses/:busiID', function(req, res, next){
    var id = req.params.busiID;
    if( businesses[id] ){
        if( isValidReq(req, buisAttr) ){
            business[id] = req.body;
            res.status(200).json({
                links: {
                    business: '/businesses/' + id
                }
            });

        } else{
            res.status(400).json({
                err: "Error in verification [put]. Required field not filled. "
            });
        }
    } else{
        next();
    }

});

//delete a specific business

app.delete('/businesses/:busiID', function(req, res, next){
    console.log(" -- req.params:", req.params);
    var id = req.params.busiID;
    if( businesses[id]){
        businesses[id] = null;
        res.status(204).end();
    }else{
        next();
    }
});


/*
 * BEGIN REVIEW FUNCTIONALITY SECTION
 * FUNCTIONS TO MODIFY REVIEWS
 * ALL REVIEWS MUST BE TIED TO A UNIQUE USER
 * AND TO A UNIQUE BUSINESS. 
 * -POST REVIEW
 * -PUT EDITED REVIEW
 * -DELETE EXISTING REIVEW
 * -REVIEWS ARE ONLY GOT FROM BUSINESSES
 * */


//takes a body containing a review object, review has user, star, expense and optional text
app.post('/businesses/:busiID/reviews', function(req,res,next){
    console.log(" -- req.body", req.body);
    console.log(" -- req.params", req.params);
    var id = req.params.busiID;
    var userID = req.body.user;

    if( !( isValidReq( req, reviewAttr) ) ){
        res.status(400).json({
            err: "Malformed review in req body. Did you fill all fields?"
        });
    }

    if( !businesses[id]){ 
        next();
    }

    var busi = businesses[id];
    console.log(busi, id);
    console.log(businesses['0']);
    if( busi.reviews[userID]){
        res.status(400).json({
            err: "That user has already submitted a review. Please POST for edits."
        });
    }

    var reviewID = busi.reviews.length;
    req.body['reviewid'] = reviewID;
    busi.reviews[userID] = req.body; //use username to map to a review

    res.status(201).json({
        reviewiID: reviewID,
        links: {
            reviews: '/businesses/' + id + '/reviews',
            reviewiID: '/businesses/' + id + '/reviews/' + reviewID
        }
    });


});

app.put('/businesses/:buisID/reviews/:revID',function(req,res,next){
    console.log(" -- req.body", req.body);
    console.log(" -- req.params", req.params);
    var id = req.params.busiID;
    var revID = req.params.revID;

    if( !businesses[id] || !businesses[id].reviews[revID] ){ 
        next();
    }
    var buis = businesses[id];
    if( isValidReq( req.body, reviewAttr) ){
        businesses[id].reviews[revID] = req.body;

        res.status(201).json({
            id:id,
            reviewID: revID,
            links: {
                businesses: '/businesses',
                reviews: '/businesses/' + id + '/reviews',
            }
        });
    } else{
        res.status(400).json({
            err: 'Malformed review recieved. Did you fill all fields?'
        });
    }


    //validate buisiness and review ID, validate user is owner of review
});

app.delete('/businesses/:busiID/reviews/:revID', function(req, res, next){
    console.log(" -- req.body", req.body);
    console.log(" -- req.params", req.params);
    var id = req.params.busiID;
    var reviewID = req.params.revID;

    if( businesses[id].reviews[reviewID]){
        businesses[id].reviews[reviewID] = null;
        res.status(204).end();
    }else{
        next();
    }
    //validate buisiness and review ID
    //then delete

});


/*
 * BEGIN USER SECTION
 * USERS MAY BE OWNERS OF BUSINESSES
 * USERS HAVE AN ADMIN FLAG WHICH MAY BE SET
 * MAY SUBMIT PHOTOS OR REVIEWS
 * MAY EDIT OR DELETE ANY INFORMATION THEY HAVE
 * CONTRIBUTED. PHOTOS OR REVIEWS OR BUSINESSES
 * USERS MUST HAVE ALL CONTENT DELETED BEFORE 
 * THEY MAY BE DELETED
 * USERS ARE CREATED WHEN THEY ADD A NEW OBJECT
 * -GET USERS, OR A SPECIFIC USER AND ALL THEIR OBJECTS
 * -POST, ADD A USER
 * -PUT EDIT USER INFORMATION
 * -DELETE REMOVE A USER WHICH HAS NO ASSOCIATED OBJECTS
 * 
 * */

//give all users
app.get('/users', function(req, res, next){
   var size = Object.keys(users).length;

    var page = parseInt(req.query.page) || 1;
    var numPerPage = 10;
    var lastPage = Math.ceil(size / numPerPage);
    page = page < 1 ? 1: page;
    page = page > lastPage ? lastPage : page;

    var start = (page -1) * numPerPage;
    var end = start + numPerPage;
    var pageUser = (Object.entries(users).slice(start, end));
    var links = {};
    if (page < lastPage){
        links.nextPage = '/users?page=' + (page+1);
        links.lastPage = '/users?page=' + (lastPage);
    }
    if ( page > 1){
        links.prevPage = '/users?page=' + (page+1);
        links.firstPage = '/users?page=1'
    }
    res.status(200).json({
        users: pageUser,
        pageNumber: page,
        totalPages: lastPage,
        pageSize: numPerPage,
        totalCount: size,
        links: links
    });

});

//get a single user
app.get('/users/:userID', function(req, res, next){
    console.log(" -- req.params:", req.params);
    var requestName = req.params.userID;

    if( users[requestName]){
        var photos = [];
        var reviews = [];
        var buis = [];
        for( b in Object.entries(businesses).map(x=>x[1]) ){
            var name = b.name;
            var reviews = b.reviews;

            if( b.reviews[requestName]){
                reviews.push( { name : b.reviews[requestName] } );
            }
            if( b.photos[requestName]){
                photos.push( { name: b.photos[requestName] } );
            }
            if( b.user == requestName){
                buis.push(b);
            }
        }

        var user = users[requestName];
        user.reviews = reviews;
        user.photos = photos;
        user.buisinesses = buis;
        res.status(200).json( user );

    }else{
        next();
    }

});

//add a user
app.post('/users', function(req, res, next){
    console.log(" -- req.body:", req.body);

    if( isValidReq( req.body, userAttr) ){
        users[req.body.username] = req.body;
        
        res.status(201).json({
            userID: req.body.username,
            links: {
                users: '/users',
                user: '/users/' + req.body.username
            }
        });
    }else{
        res.status(400).json({
            err: 'Malformed request [post]. Did you fill all fields?'
        });
    }

});

//edit a user that exists. 
app.put('/users/:userID', function(req, res, next){
    var userID = req.params.userID;

    if( users[userID] ){
        if (isValidReq(req.body, userAttr)){
            users[userID] = req.body;
            res.status(200).json({
                links: {
                    users: '/users',
                    user: '/users/' + userID
                }
            });

        }else{
            res.status(400).json({
                err: 'Malformed request [put]. Did you fill all fields?'
            });
        }
    }else{next();}
});

//delete a user (also delete their related businesses and info)
app.delete('/users/:userID', function(req, res, next){
    var userID = req.params.userID;
    if( users[userID]){
        users[userID] = null;
        res.status(204).end();
    }else{
        next();
    }
});


/*
 * BEGIN PHOTO SECTION
 * PHOTOS ARE ASSOCIATED WITH A USER AND A BUSINESS
 * PHOTOS ARE FOUND WHEN 
 * -POST A PHOTO TO A BUSINESS BY A USER
 * -PUT A PHOTO, MODIFY IT OR RELATED INFORMATION
 * -DELTE AN EXISTING PHOTO FOR A BUSINESS
 */

app.post('/businesses/:busiID/photos', function( req, res, next){
    console.log(" -- req.body", req.body); 
    var id = req.params.businessID;
    var userID = req.body.user;

    if( !businesses[id]){
        next();
    }

    if(isValidReq(req, photoAttr)){
        var photoObj = businesses[id].photos
        if( !photoObj[userID] ){
            photoObj[userID] = [];
        }
        
        req.body.ID = photoObj[userID].length;
        photoObj[userID].push(req.body);

        res.status(201).json({
            photoOwner: userID,
            photoid: req.body.ID,
            links: {
                businesses: '/businesses',
                business: '/businesses/' + id,
                photos: 'businesses/'+id+'/photos'
            }
        });
        
    }else{
        res.status(400).json({
            err:'Malformed request [post]. Did you fill all fields?'
        });
    }
});

app.put('/businesses/:busiID/photos', function(req, res, next){
    console.log(" -- req.body:", req.body);
    console.log(" -- req.params", req.params);
    var id = req.params.busiID;
    var photoID = parseInt(req.query.photoid);
    var userID = req.query.userID;
//photos are organized under {'username': [photo0, photo1, photo2] }
    if( isValidReq(req, photoAttr)){
        businesses[id].photos[userID][photoID] = req.body;
        
        res.status(201).json({
            businessID: id,
            photoID: photoID,
            links: {
                business: '/buisnesses' + id,
                photos: '/businesses/' + id + '/photos',
                reviews: '/businesses/' + id + '/reviews'
            }
        });
    }else{
        res.status(400).json({
            err: 'Malformed epxression [put]. Did you fill all fields?'
        });
    }
});

app.delete('/businesses/:busiID/photos', function(req, res, next){
    console.log(" -- req.body:", req.body);
    var id = req.params.busiID;
    var photoID = parseInt(req.query.photoid);
    //if undefined or bad value
    
    //if it looks gross it's because it is
    if(businesses[id].photos[req.body.user][photoID] ){
        businesses[id].photos[req.body.user][photoID] = null;
        res.status(204).end();
    } else{
        next();
    }

});



/* CATEGORY AND SUBCATEGORY
 * USERS WHICH ARE ADMIS MAY ADD CATEGORIES 
 * AND MAY ADD SUBCATEGORIES 
 * -GET PAGINATED CATEGORIES
 * -DELETE [ADMIN] CATEGORIES
 * -POST ADMIN 
 * -PUT ADMIN EDIT
 * 
 * */

app.get('/categories', function(req, res, next){

    var page = parseInt(req.query.page) || 1;
    var numPerPage = 10;
    var lastPage = Math.ceil(categories.length/numPerPage);
    page = page < 1 ? 1:page;
    page = page > lastPage ? lastPage : page;

    var start = (page-1) * numPerPage;
    var end = start + numPerPage;
    var pageCat = Object.entries(categories).slice(start, end);
    var links = {};
    if (page < lastPage){
        links.nextPage = '/categories?page=' + (page+1);
        links.lastPage = '/categories?page=' + lastPage;
    }
    if (page > 1){
        links.prevPage = '/categories?page=' + (page-1);
        links.firstPage = '/categories?page=1';
    }
    res.status(200).json({
        categories: pageCat,
        pageNumber: page,
        totalPages: lastPage,
        pageSize: numPerPage,
        totalCount: categories.length,
        links:links
    });


});

app.get('/categories/:catID', function(req, res,next) {
    var catID = req.params.catID;
    if( !categories[catID]){
        next();
    }
    res.status(200).json( categories[catID] );
});

//add a category or subcategory. affirm that category: subcategory is an option,
//adding category as necessary, subcategory alwyas with error if it already exists
app.post('/categories', function(req, res, next){
    console.log(' -- req.body', req.body);
    var catID = req.body.category;
    if( ! req.body.category || ! req.body.subcategory){
        res.status(400).json({
            err: 'Malformed expression [post]. Did you fill all fields?'
        });
    }
    if( !categories[catID]){
        categories[catID] = [];
    }
    if( !categories[catID].includes( req.body.subcategory) ){
        categories[catID].push(req.body.subcategory);
    }

    res.status(201).json({
        category: req.body.category,
        subcategory: req.body.subcategory,
        links: {
            categories: '/categories'
            businesses: '/businesses'
        }
    });


});

//edit a category
app.put('/categories/:catID', function(req, res, next){



});



//if no subcategory clear whole category
//if category and subcategory delete only subcategory
//if no category error
app.delete('/categories/:categoryid' function(req, res, next){


}



app.use('*', function(req, res, next){

    res.status(404).json({
        err: "Path: "+ req.url + " Does Not Exist. :("
    });
});

app.listen(port, function() {
  console.log("== Server is running on port", port);
});




