// $(document).ready(function () {
// Global Variables
var catID;
var newsData;
var charitySearch;
var searchQuery;
var selectedID;
var newsPage = 1;
var charPage = 1;
var isNews = true; // for the prev and next buttons - if true use for News. If False use for Charities

$("#articleDisplay").hide();
// news object & API
var newsFinder = {

    search: function (query) {
        searchQuery = query;
        // ------- NEWS API ---------
        var newsURL = 'https://newsapi.org/v2/everything?'; // everything
        newsURL += 'ap' + 'iK' + 'ey=e624' + 'c791383a' + '46cabe1b1' + '9e39ba150f4';
        newsURL += '&pageSize=6';
        newsURL += '&page=' + newsPage;
        newsURL += '&sortBy=publishedAt';
        newsURL += '&language=en';
        // Everything queries
        newsURL += '&q=' + query;
        // console.log('newsURL: ', newsURL);
        // news AJAX call
        $.ajax({
            url: newsURL,
            method: "GET"
        }).then(function (newsresponse) {
            // console.log("news AJAX: ", newsresponse);
            newsData = newsresponse; // save newsresponse to global variable newsData to be used later
            newsFinder.newsGenerator(newsresponse, query);
        });
    },

    searchHeadlines: function (query) {
        searchQuery = query;
        // ------- NEWS API ---------
        var newsURL = 'https://newsapi.org/v2/top-headlines?'; // TOP HEADLINES
        newsURL += 'ap' + 'iK' + 'ey=e624' + 'c791383a' + '46cabe1b1' + '9e39ba150f4';
        newsURL += '&pageSize=6';
        newsURL += '&sortBy=publishedAt';
        newsURL += '&language=en';
        // Top Headline Queries:
        newsURL += '&country=us';
        newsURL += '&category=' + query;

        // news AJAX call
        $.ajax({
            url: newsURL,
            method: "GET"
        }).then(function (newsresponse) {
            // console.log("news AJAX: ", newsresponse);
            newsData = newsresponse; // save newsresponse to global variable newsData to be used later
            newsFinder.newsGenerator(newsresponse, query);
        });
        // --------- /NEWS -----------
    },

    newsGenerator: function (response, query) {

        // clear results section
        $("#gridContainer").empty();
        for (i = 0; i < response.articles.length; i++) {
            $card = $("<div class='col-sm-3 news-card' data-article='" + i + "'>");
            var $img = $("<img class='card-img-top center-block'>").attr({ "src": response.articles[i].urlToImage });
            var date = " (" + moment(response.articles[i].publishedAt, moment.ISO_8601).format("MM/DD/YY") + ")";
            var $body = $("<div class='card-body'>");
            var $title = $("<div class='card-title'>").html(response.articles[i].title + date);
            var $descrip = $("<div class='card-text'>").html(response.articles[i].description);
            var $source = $("<div class='source'>").text(response.articles[i].source.name);
            $card.append($img, $body.append($title, $descrip, $source));
            $("#gridContainer").append($card);
        }
    },

    articleGenerator: function (item) {
        $("#articleDisplay").show();
        $("#articleContainer").empty();
        $(".news-card").hide();
        // display single article using item as an index to get info from newsData
        $articleContainer = $("#articleContainer");
        var article = newsData.articles[item];
        // console.log(article.urlToImage);
        var $article = $("<div class='col-sm-12' data-article='" + i + "'>");
        var $articleIMG = $("<img class='article-img-top'>").attr({ "src": article.urlToImage, "style": "text-align: center" });
        var $articleBody = $("<div class='card-body'>");
        var $articleTitle = $("<div class='card-title'>").html(article.title);
        var $articleContent = $("<div class='card-content'>").html(article.content);
        var $articleSource = $("<div class='source'>").text(article.source.name);

        $article.append($articleIMG, $articleBody.append($articleTitle, $articleContent, $articleSource));
        $articleContainer.append($article);

        // call the charities generator method
        charityNavigator.search(searchQuery);  // searchQuery is a Global Var
    },
};

// charity navigator object API https://charity.3scale.net/
var charityNavigator = {

    search: function (query) {
        var appID = "4d" + "d27455";
        var key = 'd86a03' + '7d4ea3f2785ab' + 'ba1684a1e4bfd'; // key
        var requestURL = "https://api.data.charitynavigator.org/v2/Organizations";
        requestURL += "?app_id=" + appID;
        requestURL += "&app_key=" + key;
        requestURL += "&pageSize=6";
        requestURL += "&pageNum=" + charPage;
        requestURL += "&rated=true";
        // requestURL += "&sort=RATING:DESC";
        requestURL += "&search=" + query;
        // console.log("Charity API URL: ", requestURL);
        // charity AJAX call
        $.ajax({
            url: requestURL,
            method: "GET"
        }).then(function (response) {
            // console.log("Charities Search: ", response);
            charityNavigator.charitiesGenerator(response);
        });
    },

    charitiesGenerator: function (items) {
        $charHolder = $("#charityHolder");
        $charHolder.empty();
        // create cards using for loop
        for (var i = 0; i < items.length; i++) {
            var $charities = $("<div class='col-sm-6 charity-card' data-charity='" + i + "'>");
            var $charitiesBody = $("<div class='card-body'>");
            var $charitiesName = $("<div class='card-title'>").html(items[i].charityName + "<br /><img src='" + items[i].currentRating.ratingImage.large + "'>");
            // if there is no URL then use Charity Navigator URL
            if (items[i].websiteURL === null) {
                var $charitiesURL = $("<a class='website' target='_blank'>").attr({ "href": items[i].charityNavigatorURL });
                var charityURL = items[i].charityNavigatorURL;
            } else {
                var $charitiesURL = $("<a class='website' target='_blank'>").attr({ "href": items[i].websiteURL });
                var charityURL = items[i].websiteURL;
            }
            var $charitiesAddress = $("<div class='card-content'>").html(items[i].mailingAddress.streetAddress1
                + " " + items[i].mailingAddress.city + ", " + items[i].mailingAddress.stateOrProvince
                + "<br />" + charityURL);
            $charities.append($charitiesURL.append($charitiesBody.append($charitiesName, $charitiesAddress)));
            $charHolder.append($charities);
        }
    },

    searchByCategory: function (id) {
        var appID = "4dd27455";
        var key = 'd86a037d4ea3f2785abba1684a1e4bfd'; // key
        var requestURL = "https://api.data.charitynavigator.org/v2/Organizations";
        requestURL += "?app_id=" + appID;
        requestURL += "&app_key=" + key;
        requestURL += "&pageSize=6";
        requestURL += "&pageNum=" + charPage;
        requestURL += "&rated=true";
        // requestURL += "&sort=RATING:DESC";
        requestURL += "&categoryID=" + id;
        // console.log('charURL CAT: ', requestURL);
        // charity AJAX call
        $.ajax({
            url: requestURL,
            method: "GET"
        }).then(function (response) {
            // console.log("Charities Search: ", response);
            charityNavigator.charitiesMainGenerator(response);
        });
    },

    // card generator when Charities dropdown is used.
    charitiesMainGenerator: function (items) {
        // clear results section
        $("#gridContainer").empty();
        // var $table = $("<table class='news'>");
        for (i = 0; i < items.length; i++) {
            $card = $("<div class='col-sm-3'>");
            // var $img = $("<img class='card-img-top center-block'>").attr({ "src": response.articles[i].urlToImage });
            var $charitiesBody = $("<div class='card-body'>");
            var $charitiesName = $("<div class='card-title'>").html(items[i].charityName + "<br /><img src='" + items[i].currentRating.ratingImage.large + "'>");
            var $mission = $("<div class='card-text'>").html(items[i].mission);
            var $charitiesAddress = $("<div class='card-content'>").text(items[i].mailingAddress.streetAddress1 + " " + items[i].mailingAddress.city + ", " + items[i].mailingAddress.stateOrProvince);
            // var $mission = $("<div class='source'>").text(response.articles[i].source.name);
            // if there is no URL then use Charity Navigator URL
            if (items[i].websiteURL === null) {
                var $charitiesURL = $("<a class='website' target='_blank'>").attr({ "href": items[i].charityNavigatorURL });
                $charitiesURL.text(items[i].charityNavigatorURL);
            } else {
                var $charitiesURL = $("<a class='website' target='_blank'>").attr({ "href": items[i].websiteURL });
                $charitiesURL.text(items[i].websiteURL);
            }
            $card.append($charitiesBody.append($charitiesName, $mission, $charitiesAddress, $charitiesURL));
            $("#gridContainer").append($card);
        }
    },
};

// --- EVENT LISTENERS ----

// News Dropdown listener
$(".dropdown-item").on("click", function (event) {
    event.preventDefault();
    newsPage = 1;
    isNews = true;
    // get value of 'this' selected dropdown
    selectedID = $(this).attr("id");
    catID = $(this).attr("value");
    // console.log("ID, CatID: ", selectedID, catID);
    newsFinder.search(selectedID); // Everything Search
    // newsFinder.searchHeadlines(selectedID); // Headlines by Category search
    clearElements();
    showFav();
    $("#addItem").val(selectedID); // send search item to favorites input text box.
});

// Charity Dropdown listener
$(".Charity-dropdown-item").on("click", function (event) {
    event.preventDefault();
    isNews = false; // for the prev and next buttons
    charPage = 1;
    selectedID = $(this).attr("id"); // get value of 'this' selected dropdown
    catID = $(this).attr("value");
    // console.log("CatID: ", catID);
    clearElements();
    showFav();
    charityNavigator.searchByCategory(catID);

    $("#addItem").val(selectedID); // send search item to favorites input text box.

});

// Search Button Listener
$("#searchBtn").on("click", function (event) {
    // event.preventDefault();
    var query = $("#searchItem").val().trim();
    // validatation conditional
    if (query !== '') {
        newsFinder.search(query);
        charityNavigator.search(query);
        $("#addItem").val(query);
        showFav();
        $("#artHolder").empty();
        $("#charHolder").empty();
        $("#articleDisplay").hide();
    }

});

// News Card Listener
$(document).on("click", ".news-card", function (event) {
    event.preventDefault();
    var articleNum = $(this).attr("data-article"); i
    // console.log(articleNum);

    clearFav();
    newsFinder.articleGenerator(articleNum);
    // charityNavigator.charitiesGenerator(articleNum);

});

// RETURN BUTTON listener
$(document).on("click", "#returnBtn", function (event) {
    event.preventDefault();
    showFav();
    $(".news-card").show();
    $("#artHolder").empty();
    $("#charHolder").empty();
    $("#articleDisplay").hide();
})

// Saved Favorites Button Listener
$(document).on("click", ".savedFavBtn", function (event) {
    event.preventDefault();
    var query = $(this).attr("data-item");
    // console.log("data-item: ", query);
    newsFinder.search(query);
    charityNavigator.search(query);
    clearElements();
});

// turn off ALL Form Submit events.
$("form").submit(function (event) {
    event.preventDefault();
});

// PREV and NEXT listeners
$("#previousBtn").on("click", function (event) {
    event.preventDefault();
    if (isNews) {
        if (newsPage > 1) {
            newsPage--;
            clearElements();
            newsFinder.search(selectedID);
        }
    } else {
        if (charPage > 1) {
            charPage--;
            clearElements();
            charityNavigator.searchByCategory(catID);
        }
    }


});

$("#nextBtn").on("click", function (event) {
    event.preventDefault();
    clearElements();
    if (isNews) {
        newsPage++;
        newsFinder.search(selectedID);
    } else {
        charPage++;
        charityNavigator.searchByCategory(catID);
    }



});

function clearElements() {
    $("#artHolder").empty();
    $("#charHolder").empty();
    $("#gridContainer").empty();
    $("#articleDisplay").hide();
};

function clearFav() {
    $("#sidebar").hide();
    $("#previousBtn").hide();
    $("#nextBtn").hide();
    $(".news-card").hide();
};

function showFav() {
    $("#previousBtn").show();
    $("#nextBtn").show();
    $("#sidebar").show();
    $(".news-card").show();
};

