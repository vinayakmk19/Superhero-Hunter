const resultsContainer = document.getElementById('results'); // element to display results within
const searchTerm = document.getElementById('searchBar');
let typingTimer;                //timer identifier

// retrieve data from local storage
var storedCharactersArray = JSON.parse(localStorage.getItem("characters"));

// trigger function
searchTerm.addEventListener('keyup', async () => {
    removeAllChildNodes(resultsContainer);
    clearTimeout(typingTimer);

    if (searchTerm.value.length >= 3) {
        typingTimer = setTimeout(afterTyping, 800);
    }
});

// When user finishes typing
function afterTyping() {
    // fetch marvel api data
    getMarvelResponse(searchTerm.value);
}

// Clear previous search
function removeAllChildNodes(parent) {
    // console.log('Parent:: ', parent);
    document.querySelectorAll('.list-group-item').forEach(
        child => child.remove());
}

// Hit API and Fetch the matching characters
// you will also have to setup the referring domains on your marvel developer portal
var PRIV_KEY = "5f4a037ffe7383e93946dddb3b0abdf606c26dcc";
var PUBLIC_KEY = "37c83e5056be60ffc400095e1b27789c";

async function getMarvelResponse(searchTerm) {
    // you need a new ts every request                                                                                    
    var ts = new Date().getTime();
    var hash = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();
    // console.log(hash, " ", ts);
    try {
        const response = await fetch(`https://gateway.marvel.com/v1/public/characters?ts=${ts}&nameStartsWith=${searchTerm}&limit=6&apikey=${PUBLIC_KEY}&hash=${hash}`)
            .then(response => response.json()) // converting response to json
            .then(
                function (data) {
                    // to show the results on the page
                    if (data) {
                        // console.log("Inside if", typeof(data), data);
                        character = data;
                        showResults(data);
                    }
                    else
                        noResult();
                }
            );
    } catch (err) {
        console.log('Error:', err);
    }
};

// No results found
function noResult() {
    let ul = document.createElement("ul");
    ul.className = "list-group";

    let anchorTag = document.createElement('a');
    anchorTag.className = "list-group-item list-group-item-action small";
    anchorTag.href = "javascipt:void(0)";

    let span = document.createElement('span');
    span.innerHTML = "No match found!";

    ul.append(anchorTag);
    anchorTag.append(span);
    resultsContainer.append(ul)
}

// displaying results
function showResults(Data) {
    // console.log('inside show results!', typeof (Data), Data);

    let maxResultsToDisplay = 1;
    Data.data.results.map(superHero => {
        if (maxResultsToDisplay > 6) {
            return;
        }
        maxResultsToDisplay++;

        // 1. Create and Insert HTML
        let ul = document.createElement("ul");
        ul.className = "list-group";

        let li = document.createElement("li");
        li.className = "list-group-item";

        let anchorTag = document.createElement('a');
        anchorTag.className = "list-group-item list-group-item-action small";
        anchorTag.title = superHero.name;
        anchorTag.href = "InfoPage.html?id=" + superHero.id;

        //Main div
        let flexDiv = document.createElement('div');
        flexDiv.className = "d-flex";

        // Image div
        let imgContainer = document.createElement('div');

        let heroAvatar = document.createElement('img');
        heroAvatar.className = "img-fluid";
        heroAvatar.src = superHero.thumbnail.path + ".jpg";
        //  + superHero.thumbnail.extension;
        heroAvatar.alt = superHero.name + "'s thumbnail";
        heroAvatar.height = 30;
        heroAvatar.width = 50;

        // Name, id info div
        let infoContainer = document.createElement('div');
        infoContainer.className = "ml-3";

        let id = document.createElement('div');
        id.innerHTML = superHero.id;
        //  + `<icon class=" justify-content-end fa-solid fa-heart"</icon>`;
        // id.className = "d-flex justify-content-end";

        let characterName = document.createElement('div');
        characterName.innerHTML = superHero.name;
        characterName.className = "font-weight-bold";

        // Favourite heart container
        let heart = document.createElement('div');
        let Heart_anchorTag = document.createElement('a');
        Heart_anchorTag.dataset.id = superHero.id;
        Heart_anchorTag.title = "Favourite";
        Heart_anchorTag.href = "javascript:void(0);";
        Heart_anchorTag.id = "fav-btn";
        if (initialFavStatus(Heart_anchorTag)) {
            Heart_anchorTag.className = "text-danger ml-auto mt-2 fa-heart fa-lg fas";
        } else {
            Heart_anchorTag.className = "text-danger ml-auto mt-2 far fa-heart fa-lg";
        }

        let description = document.createElement('div');
        description.innerHTML = superHero.description;

        ul.append(anchorTag);
        // initialFavStatus(Heart_anchorTag);
        anchorTag.append(flexDiv);
        flexDiv.append(imgContainer, infoContainer, Heart_anchorTag);
        imgContainer.append(heroAvatar);
        infoContainer.append(characterName, id);

        resultsContainer.append(ul); // adds all superheroes cards to DOM

        // initialFavStatus(Heart_anchorTag);
        Heart_anchorTag.addEventListener('click', function (e) {
            favourite(this);
        });
    });
}


// Initial favourite status
function initialFavStatus(anchor) {
    if (storedCharactersArray == null) {
        return false;
    } else if (storedCharactersArray.length > 0) {
        if (isFavourite(anchor.dataset.id, storedCharactersArray)) {
            return true;
        }
    }
}

// Toggle favourite
function favourite(anchor) {
    // console.log("inside fav " + anchor.dataset.id, character);

    // check browser support for localStorage and sessionStorage
    if (typeof (Storage) == "undefined") {
        window.alert("Sorry! No Web Storage support..");
        return;
    }

    storedCharactersArray = JSON.parse(localStorage.getItem("characters"));
    let favIcon = anchor.classList;

    // Handle First favourite character case
    if (storedCharactersArray == null || storedCharactersArray.length == 0) {
        var characters = [];
        for (var key in character.data.results) {
            if (character.data.results[key].id == anchor.dataset.id) {
                console.log('Add to Favourite Condition :: ', character.data.results[key].id + ' == ' + anchor.dataset.id);
                characters.push(character.data.results[key]);
            }
        }
        // characters.push(character);
        // add to local storage
        localStorage.setItem("characters", JSON.stringify(characters));
        // change icon
        favIcon.remove("far");
        favIcon.add("fas");
        // alert message
        window.alert("Added to favourites.");
    } else {  // handle favourite characters exists
        // check if current character is already favourite
        if (isFavourite(anchor.dataset.id, storedCharactersArray)) {
            // remove from favourites
            if (confirm("Remove from favourites?")) {
                console.log('after confirm', character.data.results[0].id, anchor.dataset.id);
                let isRemoved = removeFromFavourite(anchor.dataset.id, storedCharactersArray);
                console.log(isRemoved);
                if (isRemoved) {
                    localStorage.setItem("characters", JSON.stringify(storedCharactersArray));
                    // change icon
                    favIcon.remove("fas");
                    favIcon.add("far");
                    // alert message
                    window.alert("Removed from favourites");
                } else {
                    window.alert("OOPS! Something went wrong!");
                }
            }

        } else { // current character is not a Favourite character hence "Add to favrourites"
            try {
                for (var key in character.data.results) {
                    if (character.data.results[key].id == anchor.dataset.id) {
                        console.log('Add to Favourite Condition :: ', character.data.results[key].id + ' == ' + anchor.dataset.id);
                        console.log(character.data.results[key]);
                        storedCharactersArray.push(character.data.results[key]);
                    }
                }
                // storedCharactersArray.push(character);
                // add to local storage
                localStorage.setItem("characters", JSON.stringify(storedCharactersArray));
                // change icon
                favIcon.remove("far");
                favIcon.add("fas");
                // alert message
                window.alert("Added to favourites");
            } catch (error) {
                window.alert("OOPS! Something went wrong!");
            }

        }
    }
}

// Check if character is already favourite
function isFavourite(characterId, storedCharactersArray) {
    for (let i = 0; i < storedCharactersArray.length; i++) {
        if (storedCharactersArray[i].id == characterId) {
            // console.log("isFavourite = TRUE");
            return true;
        }
    }
    return false;
}

// Remove character from the favourites
function removeFromFavourite(characterId, storedCharactersArray) {
    for (let i = 0; i < storedCharactersArray.length; i++) {
        // console.log('removeFromFavourite Condition :: ', storedCharactersArray[i].id + ' == ' + characterId);
        // console.log(storedCharactersArray[i].id == characterId);
        if (storedCharactersArray[i].id == characterId) {
            console.log("SPLICING");
            storedCharactersArray.splice(i, 1);
            return true;
        }
    }
    return false;
}