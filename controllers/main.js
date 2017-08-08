/********************************************************
 *                      Main.js
 * This file sets the initial state for the web app
 * The controller files are responsible for the interactions
 * between the model and the view layers. Ideally, you will 
 * have a new controller for each HTML page.
 * 
 *******************************************************/

// Do stuff when the window loads
window.onload = function() {
    // Some listeners
  
    //var searchForm = document.getElementById("searchForm");
    //searchForm.addEventListener("onkeypress", searchImages)   // Searches field prior to keypress
    
    // Set initial images
    // var images = getImages();
    //console.log(images);
    //displayImages(images);
    
    // Wait for page to load
    $( document ).ready(loadPage());
    $('#showPage').click(showPage);
    $('#goToSplash').click(showSplash);
    
    var counter = 0;
};


$(document).ready(function(){
   
    $("#searchBtn").on("click", function(){
        searchFlickrExtras($("#searchBox").val())});
      
    $("#searchGeoBtn").on("click",function(){
        searchImagesGeo($("#searchLat").val(),$("#searchLong").val());
    });
    
     $("#Home").on("click",function(){
        $(".nav").children().removeClass("active");
        $("#Home").addClass("active");
        hideGeo();
    })
     $("#GeoSearch").on("click",function(){
        $(".nav").children().removeClass("active");
        $("#GeoSearch").addClass("active");
        showGeo();
    })
    
    $("#searchBox").keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            search($("#searchBox").val());
            $( "#results" ).focus();
        }
    });
})

// Splash Screen
function loadPage(){
    //$(splash).html("Page loaded. Click <a href='#' id='showPage'>HERE</a> to continue");
    showPage();
}

function showGeo(){
    $('#searchBox').addClass('hidden');
    $('#searchBtn').addClass('hidden');

    $('#searchLat').removeClass('hidden');
    $('#searchLong').removeClass('hidden');
    $('#searchGeoBtn').removeClass('hidden');
}


function hideGeo(){
    $('#searchBox').removeClass('hidden');
    $('#searchBtn').removeClass('hidden');

    $('#searchLat').addClass('hidden');
    $('#searchLong').addClass('hidden');
    $('#searchGeoBtn').addClass('hidden');
}

function showPage(){
    console.log("showpage");
    $('#splash').addClass('hidden');
    $('#body').removeClass('hidden');
    $('#nav').removeClass('hidden');
}
function showSplash(){
    console.log("showsplash");
    $('#splash').removeClass('hidden');
    $('#body').addClass('hidden');
    $('#nav').addClass('hidden');
}

// Search an array for keywords
function search(keyword, images){
    keyword.trim();
    keyword.toLowerCase();
    var results = [];
    for(var i=0; i < images.length; i++){
        if(images[i].title.toLowerCase().indexOf(keyword) !== -1){
            results.push(images[i]);
        }
    }
    
    return results;
}
// This function clears the body section
function clearGallery() {
    $('.pure-g').empty();
}


function searchFlickr(term){
      $(".sk-cube-grid").toggleClass("hidden");
      clearGallery();
    console.log("searchFlickr");
    console.log("tags="+term);
    var imgArr;
    var options = "";
   
    var method="flickr.photos.getRecent";
    if(term != ""){
        method = "flickr.photos.search";
    }
    //gold coast -28.034562, 153.410339
    
    var url = "https://api.flickr.com/services/rest/?method="+method+"&api_key=dc140afe3fd3a251c2fdf9dcd835be5c&tags=great%20barrier%20reef&safe_search=1&per_page=20&has_geo=1";
    console.log(url+"&format=json&jsoncallback=?");
    $.getJSON(url + "&format=json&jsoncallback=?", function(data){
        var results = (data);
        console.log(results);
        displayOutputFlickr(results);       
 
    });
}


/*  flickr search that gets the meta data tags in one query rather then individually querying for each photo.
    Each 
    Possible Extras tags as of 2017 are: description, license, date_upload, date_taken, owner_name, icon_server,
    original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq,
    url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o
    
    loops through pages to page limit to return additional results.
    
*/
function searchFlickrExtras(term){
    $(".sk-cube-grid").toggleClass("hidden");
    clearGallery();
    console.log("searchFlickrExtras");
    console.log("tags="+term);
    var tags = sanitizeInput(term);
   
    var request = {
        options: {
             safe_search:1, 
             media:'photos',
             content_type:1,
             page:1,
             per_page:100,
             text:sanitizeInput(term),
             //min_taken_date:'2017-01-01',
             //max_taken_date:'2017-12-31',
             //has_geo:1, 
             extras:"geo,date_taken,owner_name,tags,machine_tags,media,url_l",
        },
        api_key: "&api_key=dc140afe3fd3a251c2fdf9dcd835be5c",
        method: "method=flickr.photos.search",
        url: "https://api.flickr.com/services/rest/?",
    };
    if(request.options.text != ""){
        request.method = "method=flickr.photos.search";
    }else{
        request.method = "method=flickr.photos.getRecent";
    }
    request.url = request.url+""+request.method+request.api_key+concatOptions(request.options)+"&format=json&jsoncallback=?";
    console.log(request.url);
    var outputData="";
    ///var years ={17Start:"",}
    
    
    //it was discovered that you can only retrieve 4k items at once through pagination, so if you get more then that, the query needs to be split up by dates to below 4k in one go.
    //first off sort out the recursion to return all pages.
    // then deal with the 4k request problem
    $.getJSON(request.url, function(data){
        //see how many pages there are to loop through.
        var limiter = 20;
        console.log(data);
        if (data.hasOwnProperty("photos") && request.options.page < data.photos.pages && request.options.page <= limiter ) { //if response is valid and we are not on the last page.
         recursiveSearch(request);
        };
        //displayOutputFlickr(results);       
    }.bind({input:request}));
}

//keeps looping till counter is greater then the page count returned or limiter
function recursiveSearch(request){
    var limiter = 20;
    request.options.page++;
    request.url = request.url+""+request.method+request.api_key+concatOptions(request.options)+"&format=json&jsoncallback=?";
    console.log(request.url);
    $.getJSON(request.url, function(data){
        console.log(data);
        if (data.hasOwnProperty("photos") && request.options.page < data.photos.pages && request.options.page < limiter ) { //if response is valid and we are not on the last page.    
            recursiveSearch(request);
        }
    }.bind({input:request}));
//   }
//     if (data.hasProperty("photos")){ //if the request worked.
//         counter +=1;
//         storageJSON += data //store the results in the JSON file in some way
//         if (counter <=data.photos.pages && counter < limiter ){
//             $.getJSON(url, function(data){
//               recursiveSearch(url);
//             });
//         }
//     }
}
function searchFlickrGeo(lat, lon){
      $(".sk-cube-grid").toggleClass("hidden");
      clearGallery();
    console.log("searchFlickrGeo");
    var term = "";
    var imgArr;
    var api_key = "dc140afe3fd3a251c2fdf9dcd835be5c"
    var gc = "&lat=-28.034562&lon=153.410339";
        var bris = "&lat=-27.485279&lon=153.031311";
        var carins = "&lat=-16.932183&lon=145.791321";
    var method="flickr.photos.search";
    var url ="";
    var options = {
        per_page:20,
        min_taken_date:20170101,
        safe_search:1,
        has_geo:1, 
        lat:"",
        lon:"",
        radius:20,
        
    };
    console.log(lat);
    console.log(lon);
    //check that the input is correct
    if(lat =="" || lon =="" || lat == null || lon == null){
        
        displayError("Search not formated correctly, Please check the Geo Coordinates that were entered.");
        return 0;
    }else{
        options.lat=lat;
        options.lon=lon;
    }
    url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+api_key+'&tags=great%20barrier%20reef'+concatOptions(options)+"&format=json&jsoncallback=?";
    
    //var url = "https://api.flickr.com/services/rest/?method="+method+"&api_key=dc140afe3fd3a251c2fdf9dcd835be5c&safe_search=1&per_page=20&min_taken_date=20170101&has_geo=1"+carins+"&radius=20";
    console.log(url);
    $.getJSON(url, function(data){
        var results = (data);
        console.log(results);
        displayOutputFlickr(results);
        
    });
}

function searchInstagram(term){
    console.log("searchInstagram");
    console.log("term="+term);
    var imgArr;
    var method="flickr.photos.getRecent";
    if(term != ""){
        method = "flickr.photos.search";
    }
  
    var url = "https://api.instagram.com/v1/users/self/?access_token=5399513485.7bcc1f9.47279f18017646508ddc0a57cbcb69d3"
    //var url = "https://api.flickr.com/services/rest/?method="+method+"&api_key=dc140afe3fd3a251c2fdf9dcd835be5c&tags="+term+"&safe_search=1&per_page=20";
    var src;
    
    
    $.ajax({
        url: "https://api.instagram.com/v1/tags/coffee/media/recent?access_token=5399513485.7bcc1f9.47279f18017646508ddc0a57cbcb69d3&callback=callbackFunction",
        type: 'POST',
        success: function (result) {
            console.log(result);
        },
    
        error: function () {
            alert("error");
        }
    });
    /*
    $.getJSON(url, function(data){
        var results = (data);
        console.log(results);
        displayOutputFlickr(results);
    /*$.each(data.photos.photo, function(i,item){
        console.log(item);
        src = "http://farm"+ item.farm +".static.flickr.com/"+ item.server +"/"+ item.id +"_"+ item.secret +"_m.jpg";
        displayImg(item);
        console.log(src);
       // $("<img/>").attr("src", src).appendTo("#images");
        //if ( i == 3 ) return false;
      
    });*/
//});
    return imgArr;
    
}

function callbackFunction(response){
    console.log(response);
}

function displayImg(){
    
}

/*
function search(searchItem){
    console.log("Search");
   var term = {term:searchItem};
    var output = $("#results");
    output.empty();
    $(".sk-cube-grid").toggleClass("hidden");
    searchFlickr(searchItem);
    //searchInstagram(searchItem);

}
*/
function newSearch(e){
    debugger;
    console.log(e.text);
}
function displayOutputFlickr(data){
    var htmlOutput="";
    var output = $("#results");
    data.photos.photo.forEach(function(elem) {
         var method="flickr.photos.getInfo";
         var options = "&photo_id="+elem.id+"&secret="+elem.secret;
         var url = "https://api.flickr.com/services/rest/?method="+method+"&api_key=dc140afe3fd3a251c2fdf9dcd835be5c"+options;
         var details="";
         $.getJSON(url + "&format=json&jsoncallback=?", function(data){
             var link="";
             if (data != null){
                var results = (data);
                console.log(results);     
                link = results.photo.urls.url[0]._content;
             }
            var src = "https://farm"+ elem.farm +".static.flickr.com/"+ elem.server +"/"+ elem.id +"_"+ elem.secret +"_m.jpg";
            if(results.photo.hasOwnProperty("location")){
                details +=results.photo.location.region._content +"<br>"+results.photo.location.latitude+','+results.photo.location.longitude; 
            }
            var htmlOutput = '<div class="pure-u-1-3"><div class="gridBox"><a href="'+link+'"><img src="'+src+'" alt="'+results.photo.title._content+'"></a><p>'+JSON.stringify(results)+'</div></div>';
            $(".sk-cube-grid").addClass("hidden");
            $("#results").append(htmlOutput);
            
         });
        //console.log(elem.text);
    });
}



function twitterize(text){
    var output;
    if (typeof text == 'undefined'){
        console.log("undefined text");
        return output;
    }
    output = text.replace(/(#)\w+/g,function(v){return '<a class="twitLink" onclick="newSearch(this)">'+v+'</a>'});
    return output;
}

//turn a string location into a geo coordinates if possible. 
function getCoordinates(input, callback){
    const googleGeoKey = "AIzaSyCFqXtNa4VuhfJZ2YfWWfAKZm5QAFGTz8w";
    $.getJSON("https://maps.googleapis.com/maps/api/geocode/json?address="+location.name+"&key="+googleGeoKey+"", function(data){
             var link="";
             if (data != null){
                var results = (data);
                console.log(results);     
             }
            callback(response);        
    });
}


//concat an object of options for a url. use &option=value format.
function concatOptions(options){
    var output = "";
    $.each( options, function( key, value ) {
        output += "&"+key+"="+value;
    });
    return output;
}
    
function displayError(term){
    var htmlOutput="";
    var output = $("#results");
    $(".sk-cube-grid").addClass("hidden");
    htmlOutput += '<div class="pure-u-1-3"><div class="gridBox">' + term + '</div></div>';
    output.append(htmlOutput);
};


/*  sanitize the input for searching
    primarily remove spaces
*/
function sanitizeInput(input){
    var output="";
    var search = " ";
    output = input.replace(new RegExp(search, 'g'),"%20");
    return output;
}