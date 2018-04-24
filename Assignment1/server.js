/*Erich Kramer
 * CS493 Assignment one
 * Apache License
 */

/* Todo: validate isValidReq, create framework for testing posts
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

var users      = require('./users'); 
var businesses = require('./businesses');
//categories and subcategories can be edited in categories.json
//here admins must modify them by hand
var categories = require('./categories');

//attributes of business that are expected 
var buisAttr = ["user", "name", "address", "city", "state", "zipcode", "phone", 
    "category", "subcategory"];
var reviewAttr = ["user", "stars", "expense", "review" ];
var userAttr = ["username", "firstname", "lastname", "email"];

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
  res.status(200).send("Please visit /businesses\n");
});

//get ALL businessses
app.get('/businesses', function(req, res, next){

    //Pagination and logic borrowed from Hessro
    //Like skidrow but more personable

    var size = Object.keys(businesses).length

    var page = parseInt(req.query.page) || 1;
    var numPerPage = 10;
    var lastPage = Math.ceil(size / numPerPage);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;

    var start = (page -1) * numPerPage;
    var end = start + numPerPage;
    var pageBuis = (Object.entries(businesses).map(x=>x[1])).slice(start, end);

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
 * */


/*
 * BEGIN USER SECTION
 * USERS MAY BE OWNERS OF BUSINESSES
 * MAY SUBMIT PHOTOS OR REVIEWS
 * MAY EDIT OR DELETE ANY INFORMATION THEY HAVE
 * CONTRIBUTED. PHOTOS OR REVIEWS OR BUSINESSES
 * USERS MUST HAVE ALL CONTENT DELETED BEFORE 
 * THEY MAY BE DELETED
 * USERS ARE CREATED WHEN THEY ADD A NEW OBJECT
 * -GET USERS, OR A SPECIFIC USER AND ALL THEIR OBJECTS
 * -PUT EDIT USER INFORMATION
 * -DELETE REMOVE A USER WHICH HAS NO ASSOCIATED OBJECTS
 *
 * */




/*
 * BEGIN PHOTO SECTION
 * PHOTOS ARE ASSOCIATED WITH A USER AND A BUSINESS
 * -GET PHOTOS WHICH EXIST UNDERNEATH A BUSINESS
 * -POST A PHOTO TO A BUSINESS BY A USER
 * -PUT A PHOTO, MODIFY IT OR RELATED INFORMATION
 * -DELTE AN EXISTING PHOTO FOR A BUSINESS
 *
 *
 */

   

//Catch bad request
app.use('*', function(req, res, next){
    res.status(404).json({
        err: "Path: "+ req.url + " Does Not Exist. :("
    });
});

app.listen(port, function() {
  console.log("== Server is running on port", port);
});




