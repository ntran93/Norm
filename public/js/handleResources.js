var localResources = [];
var resources = [];
var counter = 0;
var names = [];

var urls = [ {
	name : "Codecademy",
	url : "https://codecademy.com",
	category : [ "free", "pay", "practice" ]
}, {
	name : "Udemy",
	url : "https://udemy.com",
	category : [ "pay", "video", "cert" ]
}, {
	name : "Udacity",
	url : "https://udacity.com",
	category : [ "free", "pay", "video", "cert" ]
}, {
	name : "CodeFights",
	url : "https://codefights.com",
	category : [ "free", "game", "practice" ]
}, {
	name : "Checkio",
	url : "https://checkio.org",
	category : [ "free", "game", "practice" ]
}, {
	name : "Lynda",
	url : "https://lynda.com",
	category : [ "pay", "video", "cert" ]
}, {
	name : "Code Avengers",
	url : "https://codeavengers.com",
	category : [ "pay", "video", "practice" ]
}, {
	name : "Khan Academy",
	url : "https://khanacademy.org",
	category : [ "free", "video" ]
}, {
	name : "Code Wars",
	url : "https://codewars.com",
	category : [ "free", "practice" ]
} ];

var newUrls = [ {
	name : "Code Wars",
	url : "https://codewars.com",
	category : [ "free", "practice" ]
},{
	name : "Khan Academy",
	url : "https://khanacademy.org",
	category : [ "free", "video" ]
}];

function write() {
	// write new urls to firebase database
	for (i = 0; i < newUrls.length; i++) {
		getApiData(newUrls[i].url, ajaxCallback);
	}

}

function getApiData(target, callback) {
	// link preview API key
	var key = "5a78b8669a574b1ef7d0e1dc5ef444f75d5bdc591a9a7";

	// ajax call for site title, url, image URL & description
	$.ajax({
		url : "https://api.linkpreview.net",
		dataType : "jsonp",
		async : false,
		global : false,
		data : {
			q : target,
			key : key
		},
		success : callback
	});

}

function ajaxCallback(result) {
	// write data to firebase database
	var title = result.title;
	var url = result.url;
	var description = result.description;
	var image = result.image;
	var name = "";
	var category = [];

	var resource = {
		name : name,
		title : title,
		url : url,
		description : description,
		image : image,
		category : category
	};

	resources.push(resource);

	// all data loaded from API
	if (resources.length == newUrls.length) {
		for (i = 0; i < resources.length; i++) {
			title = resources[i].title;
			url = resources[i].url;
			description = resources[i].description;
			image = resources[i].image;

			var unmatched = true;
			var index = 0;
			while (unmatched && index < newUrls.length) {
				name = newUrls[index].name;
				category = newUrls[index].category;

				if (url.includes(name.toLowerCase())) {
					unmatched = false;
				} else {
					index++;
				}
			}

			firebase.database().ref('resources/' + name).set({
				url : url,
				title : title,
				description : description,
				image : image,
				category : category
			});

		}
		console.log("Success: Writing to database complete!");
	} else {
		console.log("Building resource list..");
	}
}

function getCatImg(category) {
	var html = "";
	if (category === 'free') {
		html = "img/free.png";
	} else if (category === 'pay') {
		html = "img/dollar.png";
	} else if (category === 'game') {
		html = "img/game.png";
	} else if (category === 'video') {
		html = "img/video.png";
	} else if (category === 'practice') {
		html = "img/keyboard.png";
	} else if (category === 'cert') {
		html = "img/cert.png";
	} else {
		console.log("No category image available for this category: "
				+ category);
	}

	return html;
}

// post info to search.html
function postData(database) {
	firebase
			.database()
			.ref(database)
			.once(
					'value',
					function(snapshot) {
						snapshot.forEach(function(childSnapshot) {
							var item = childSnapshot.val();
							localResources.push(item);
						});

						// build bootstrap cards for each resource
						var rows = rowsRequired(localResources);
						var containerHtml = "";
						var numResources = localResources.length;
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

						// load resources' names
						firebase
								.database()
								.ref('/resources/')
								.once(
										'value',
										function(snapshot) {
											snapshot.forEach(function(
													childSnapshot) {
												var parent = childSnapshot.key;
												names.push(parent);
											});

											// replace placeholder info
											for (i = 0; i < numResources; i++) {
												var title = localResources[i].title;
												var description = localResources[i].description;
												var url = localResources[i].url;
												var image = localResources[i].image;
												var category = localResources[i].category;
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
		<img id="icon'
			+ index
			+ '" class="heart" src="img/heart-icon.png" onclick="saveAsFav(this.id);">\
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

function saveAsFav(clicked_id) {
	// change heart colour
	var clicked_state = document.getElementById(clicked_id).src;
	if (clicked_state.includes("img/heart-icon.png")) {
		document.getElementById(clicked_id).src = "img/red-heart-icon.png";
	} else {
		document.getElementById(clicked_id).src = "img/heart-icon.png";
	}

	var user_id = firebase.auth().currentUser.displayName;
	// extract index number of favourited
	var resource_index = clicked_id.replace(/^\D+/g, '');
	var resources = [];
	var counter = 0;
	
	firebase.database().ref('resources').once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			// create array of resources to index
			var name = childSnapshot.key;
			var url = childSnapshot.val().url;
			var resource = {name : name, url : url, index : counter};
			resources.push(resource);
			counter++;
		});
		
		var current_faves = [];
		var new_fave = resources[resource_index];
		var new_url = new_fave.url;
		var new_name = new_fave.name;
		var exists = false;
		firebase.database().ref('users/' + user_id + '/faves/').once('value', function(snapshot) {
			snapshot.forEach(function(childSnapshot) {
				var name = childSnapshot.key;
				var url = childSnapshot.val().url;
				var index = childSnapshot.val().index;
				current_faves.push({name: name, url : url, index : index});
			});
			
			for (i = 0; i < current_faves.length; i++) {
				if (current_faves[i].name == new_name) {
					exists = true;
				}
			}
			
			if (exists) {
				console.log("This favourite already exists.");
			} else {
				current_faves.push(new_fave);
				for (i = 0; i < current_faves.length; i++) {
					var name = current_faves[i].name;
					var url = current_faves[i].url;
					var index = current_faves[i].index
					firebase.database().ref('users/' + user_id + '/faves/' + name).set({
						url : url,
						index : index
					});
					console.log("New favourite: " + new_fave + ' has been added!' );
				}
			}
		});
	});	
}

function getFaves(user_id) {
	var faves = [];
	firebase.database().ref('users/' + user_id + '/faves/').once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			var name = childSnapshot.key;
			var url = childSnapshot.val().url;
			var index = childSnapshot.val().index;
			
			document.getElementById('icon' + index).src = "img/red-heart-icon.png";
		});
	});
}

function initApp() {
	postData("resources");
	// write();
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			var photoUrl = user.photoURL;
			console.log('Logged in.');
			document.getElementById('user-photo').src = photoUrl;
		} else {
			console.log('Logged out.');
		}
	});
	
	var user_id = firebase.auth().currentUser.displayName;
	getFaves(user_id);
}

window.onload = function() {
	initApp();
};
