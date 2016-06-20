console.log('hello world')

// METADATA URL EXAMPLE
// http://openstates.org/api/v1/metadata/tx/?apikey=0e85724a8f924c6aba8bd576df364eb7

// LEGISLATOR URL EXAMPLE
// http://openstates.org/api/v1/legislators/?state=tx&apikey=0e85724a8f924c6aba8bd576df364eb7



// define some global variables
var legislatorsUrlRoot = "http://openstates.org/api/v1/legislators/",
    stateUrlRoot = "http://openstates.org/api/v1/metadata/",
    apiKey = "0e85724a8f924c6aba8bd576df364eb7",

    legislatorParams = {
        apikey: apiKey,
        per_page: 10
    },
    stateParams = {
        apikey: apiKey
    },
    containerNode = document.querySelector('#container')

var stateQuery = function(inputState) {

    legislatorParams.state = inputState

    // build the urls we need
    var legislatorsUrlFull = legislatorsUrlRoot + genParamString(legislatorParams)
    var stateUrlFull = stateUrlRoot + inputState + '/' + genParamString(stateParams)

    // request data from each url, store the promises that are returned
    var legislatorPromise = $.getJSON(legislatorsUrlFull)
    var statePromise = $.getJSON(stateUrlFull)

    // hand our functions over to the promise objects, so they 
    // can be invoked when the data is ready.
    statePromise.then(stateDataHandler)
    legislatorPromise.then(legislatorDataHandler)

    console.log(legislatorsUrlFull)
    console.log(stateUrlFull)
}


var genParamString = function(paramObject) {
    var outputString = '?'
    for (var key in paramObject) {
        console.log(key)
        outputString += key + '=' + paramObject[key] + '&'
        console.log(paramObject[key])
    }
    return outputString.substr(0, outputString.length - 1)
}


// define functions that will handle the data when it's ready. note that
// each of these functions takes a response object as input. that's because
// when the promise object invokes them, it will pass as input the response 
// to our request.
var stateDataHandler = function(responseObject) {

    console.log(responseObject)

    // build an html string
    var htmlString = ''
    var stateName = responseObject.name,
        legislatureName = responseObject.legislature_name,
        legislatureUrl = responseObject.legislature_url

    // htmlString += '<div id="leftCol">'
    htmlString += '<p class="stateName">state: ' + stateName + '</p>'
    htmlString += '<p class="legName">name: ' + legislatureName + '</p>'
    htmlString += '<a href="' + legislatureUrl + '">website</a>'
    // htmlString += '</div>'

    // write it into the container
    var leftContainer = document.querySelector("#leftCol")
    leftContainer.innerHTML = htmlString
}

var legislatorDataHandler = function(legislatorsArray) {
    // console.log('yooo we got some legislator data, i guess')
    // "full_name": "Dan Patrick",
    // "+district_address": " 11451 Katy Fwy, Suite 209\nHouston, TX 77079\n(713) 464-0282",
    // "photo_url": "http://www.legdir.legis.state.tx.us/FlashCardDocs/images/Senate/small/A1430.jpg",

    var htmlCards = ''
    for (var i = 0; i < 10; i++) {
        var legObject = legislatorsArray[i],
            name = legObject.full_name,
            addy = legObject['+district_address'],
            imgSrc = legObject.photo_url
        if (addy === undefined) {
            addy = "not listed"
        }
        // htmlCards += '<div id="rightCol">'
        htmlCards += 	'<div class="legCard">'
        htmlCards += 		'<div class="portrait">'
        htmlCards += 			'<img src="' + imgSrc + '">'
        htmlCards += 		'</div>'
        htmlCards += 		'<div class="legData">'
        htmlCards += 			'<h2 class="name">name: ' + name + '</h2>'
        htmlCards += 			'<p class="address">address: ' + addy + '</p>'
        htmlCards += 		'</div>'
        htmlCards += 	'</div>'
        // htmlCards += '</div>'

    }
    var rightContainer = document.querySelector('#rightCol')
    rightContainer.innerHTML = htmlCards
}


// s3 - We don't want just any key to set off our searchByState function, we want it to be the enter key!  Which has a keycode of 13.
function searchByState(eventObj) {
    if (eventObj.keyCode === 13) {
        // Stores our input value from the user.
        var userInput = searchBar.value
        console.log(userInput)
            // Creates a custom search query now with the userInput.

        // stateQuery(userInput)
        // UI enhancement, just clears out the search bar after it has taken and stored input. :]
        location.hash = "search/" + userInput
        searchBar.value = ''
    }
}

var StatesRouter = Backbone.Router.extend({
    routes: {
        //Keys here will written as strings, and will be our route names.
        "home": "showHomePage",
        //The values are functions, but Backbone will need to read them as strings in order to run them.
        "search/:state": "doStateSearch"

    },

    //Home View
    showHomePage: function() {
        containerNode.innerHTML = "<p>Welcome to State Legislator stats!  Enter a 2-letter state code in the search bar to get data on your state as well as a full list of the state's legislators.</p>"
    },

    //
    doStateSearch: function(stateCode) {
    	containerNode.innerHTML = '<div id="leftCol"></div><div id="rightCol"</div>'
        stateQuery(stateCode)
    }


})

//Create a new instance of the router.
var rtr = new StatesRouter()

//Tell backbone to start tracking history.  This allows us to use back and forward buttons in browser.
Backbone.history.start()

// s1 - Search bar functions,  We will first grab our DOM node which is the input bar. 
var searchBar = document.querySelector('input')

// s2 - Now we will add an event listener of keydown , and what it should do once that keydown event happens.
searchBar.addEventListener('keydown', searchByState)
