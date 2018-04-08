var resources = [];

function googleSignin(){
  if (!firebase.auth().currentUser) {
    var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/plus.login');
    firebase.auth().signInWithRedirect(provider);
  } else {
        firebase.auth().signOut();
  }
}

function googleSignout() {
   firebase.auth().signOut()
   .then(function() {
      console.log('Signout Succesful')
   }, function(error) {
      console.log('Signout Failed')  
   });
   loggedOut();
}

function loggedOut() {
  console.log("Logged out.");
  document.getElementById('div-login').style.display = "inline";
  document.getElementById('div-loggedin').style.display = "none";
    
  document.getElementById('btn-start').style.display = "inline";
  document.getElementById('btn-find').style.display = "none";
}

function loggedIn() {
  var current = window.location;
  
  if (document.getElementById('div-login') == null) {
    console.log("Still logged in.");
  } else { 
    console.log("Welcome. First Login.");
    document.getElementById('div-login').style.display = "none";
    document.getElementById('div-loggedin').style.display = "inline";
    
    document.getElementById('btn-start').style.display = "none";
    document.getElementById('btn-find').style.display = "inline";
  }
}

function postData(database, user_id) {
  var faves = [];
  var names = [];
  var user_resources = [];
  firebase.database().ref('users/' + user_id + '/faves/').once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var name = childSnapshot.key;
      var url = childSnapshot.val().url;
      faves.push(url);
      names.push(name);
    });

    firebase.database().ref(database).once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        resources.push(item);
    });
    
    var user_resources = [];
    for (i = 0; i < resources.length; i++) {
      var url = resources[i].url;
      var index = $.inArray(url, faves)
      if (index >= 0) {
        user_resources.push(resources[i]);
      }
    }
    
    // build bootstrap cards for each resource
    var rows = rowsRequired(user_resources);
    var containerHtml = "";
    var numResources = user_resources.length;
    var cardCounter = 0;
    var colCounter = 0;
    var rowCounter = 0;
    var startNewRow = true;

    // calculate number of empty cards required for last row
    var quotient = numResources / 3;
    var rounded = Math.floor(quotient);
    var subtracted = quotient - rounded;
    var determinant = Math.round(subtracted * 10) / 10;
    console.log(determinant);
    var one = false;
    var two = false;
    var three = false;

    // 1 col
    if (determinant == 0.3) {
      one = true;
    }
    // 2 cols
    else if (determinant == 0.7) {
      two = true;
    }
    // 3 cols
    else {
      three = true;
    }

    // each row = 3 cols/cards
    while (rowCounter < rows) {
      if (startNewRow) {
        containerHtml += "<br>";
        containerHtml += newRow();
        startNewRow = false;
      }
      // if three cols
      if (colCounter < 3 && three) {
        containerHtml += createCard(cardCounter);

        cardCounter++;
        colCounter++;

      }
      // if two cols
      else if (colCounter < 3 && one) {
        if ((colCounter == 1 && rowCounter == (rows - 1))
            || (colCounter == 2 && rowCounter == (rows - 1))) {
          containerHtml += '<div class="card" style="visibility: hidden;"></div>';

          cardCounter++;
          colCounter++;
        } else {
          containerHtml += createCard(cardCounter);

          cardCounter++;
          colCounter++;
        }
      }
      // if one col
      else if (colCounter < 3 && two) {
        if (colCounter == 2 && rowCounter == (rows - 1)) {
          containerHtml += '<div class="card" style="visibility: hidden;"></div>';

          cardCounter++;
          colCounter++;
        } else {
          containerHtml += createCard(cardCounter);

          cardCounter++;
          colCounter++;
        }
      }
      // row complete
      else {
        containerHtml += closeDiv();
        colCounter = 0;
        rowCounter++;
        startNewRow = true;
      }
    }
    
    // insert cards into container div
    document.getElementById('resource-container').innerHTML = containerHtml;
    
    // replace placeholder info
    for (i = 0; i < numResources; i++) {
      var title = user_resources[i].title;
      var description = user_resources[i].description;
      var url = user_resources[i].url;
      var image = user_resources[i].image;
      var category = user_resources[i].category;
      var name = names[i];
      var iconHtml = "";

      // wrap imgs with div and set min width
      if (category.length == 2) {
        iconHtml = '<br><img class="icon" rel="popover" src="img/free.png">\
          <img class="icon" rel="popover" src="img/'
            + category[1]
            + '.png">';
      } else if (category.length == 3) {
        iconHtml = '<br><img class="icon" rel="popover" src="img/free.png">\
        <img class="icon" rel="popover" src="img/'
            + category[1]
            + '.png">\
        <img class="icon" rel="popover" src="img/'
            + category[2]
            + '.png">';
      } else if (category.length == 4) {
        iconHtml = '<br><img class="icon" rel="popover" src="img/free.png">\
        <img class="icon" rel="popover" src="img/'
            + category[1]
            + '.png">\
        <img class="icon" rel="popover" src="img/'
            + category[2]
            + '.png">\
        <img class="icon" rel="popover" src="img/'
            + category[3]
            + '.png">';
      }

      var legendHtml = '<span class="badge" role="button" data-container="body"\
        data-toggle="popover" data-placement="right" data-trigger="hover"\
          data-html="true"\
          data-content="\
          <img src=\'img/free.png\'> - Free to use <br>\
          <img src=\'img/pay.png\'> - Pay to use <br>\
          <img src=\'img/game.png\'> - Game-based learning <br>\
          <img src=\'img/video.png\'> - Video-based lessons <br>\
          <img src=\'img/practice.png\'> - Good for coding practice <br>\
          <img src=\'img/cert.png\'> - Certifiable courses">\
          ? </span>';
      document.getElementById('title'
          + i).innerHTML = name
          + iconHtml + legendHtml;
      document.getElementById('text'
          + i).innerHTML = description;
      document.getElementById('url'
          + i).href = url;
      if (image === "") {
        image = "img/cat.png";
      }
      document.getElementById('img'
          + i).src = image;
      $(function() {
        $('[data-toggle="popover"]')
            .popover()
      });
    }
    
    });
  });
}

function rowsRequired(list) {
  // return num rows required
  var groups = Math.ceil((list.length) / 3);
  return groups;
}

function newRow() {
  // card deck layout: 3 col grid
  var rowHtml = '<div class="card-deck">';
  return rowHtml;
}

function closeDiv() {
  var close = "</div>";
  return close;
}

// build string of card html
function createCard(index) {
  var cardHtml = '<div class="card">\
    <img id="img'
      + index
      + '" class="card-img-top" src="img/cat.png" alt="Card image cap"\
      onload="">\
    <div class="card-body d-flex flex-column">\
      <h4 id="title'
      + index
      + '" class="card-title">Card title\
      </h4>\
      <p id="text'
      + index
      + '" class="card-text">Some quick example text</p>\
      <a id="url'
      + index
      + '" href="#" class="btn btn-primary btn-lg btn-block text-truncate mt-auto">Visit page</a>\
    </div>\
  </div>';

  return cardHtml;
}

function initApp() {  
  firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
    // Google API.
      var token = result.credential.accessToken;
    }
    // Signed-in user info.
    var user = result.user;
  }).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    // firebase.auth.AuthCredential type
    var credential = error.credential;
  });
  
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var photoUrl = user.photoURL;
      console.log('Logged in.');  
      loggedIn();
      document.getElementById('user-photo').src = photoUrl;
    } else {
      console.log('Logged out.');
    }

  });
  
  var user_id = firebase.auth().currentUser.displayName;
 
  postData('resources', user_id);
}

window.onload = function() {
  initApp();
};