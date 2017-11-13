// connect to your Firebase application using your reference URL
var encoreReference = new Firebase("https://encore-610ad.firebaseio.com/");

//New way of calling firebase.
var database = firebase.database();
var trackReference = database.ref("/Playlist/").orderByChild('vote');


//Object to add songs to the database
function Song(name){
  this.name = name,
  this.vote = 0
}

$(document).ready(function () {

  //Declare variable before assigning timer value
  var clock;

  $('#setList-form').submit(function (event) {
    // by default a form submit reloads the DOM which will subsequently reload all our JS
    // to avoid this we preventDefault()
    event.preventDefault()

    // grab user message input
    var songName = $('#setListElement').val()

    // clear message input (for UX purposes)
    $('#setListElement').val('')

    // create a section for messages data in your db
    var songReference = encoreReference.child('Playlist');
    var thisSong = new Song(songName);
    // use the set method to save data to the messages
    songReference.push(thisSong);

  })

  // // on initialization of app (when document is ready) get fan messages
  //This name is wrong, becuase the function is related to the set list
  songClass.getSongs();

//
  $('#message-form').submit(function(event){
    event.preventDefault()
    var message = $('#message').val();

    $('#message').text('');
    var $messageListElement = $('<li>'+message+'</li>')
    $('#fanMessages').append($messageListElement);
  });

  //Back end functions

  $('#deleteLame').on('click',function(){
    console.log("Delete lame");
    deleteLameTracks();
  });


  function deleteLameTracks(){

    var limit = 3;
    var keyArray = []; //This will store the ids of elements we are going to remove

    //Delete
    trackReference.once('value',function(results){

      //Define number of elements in the object
      var count =0;
      results.forEach(function(child,i){
        count++;
      });

      //Add lower score elements id's to an array
      var index = 0;
      results.forEach(function(child){
        //if the element is not contained in the last elements of the list (the ones we want to keep), then add their key to array
        if(index<(count-limit)){
          let id = child.key;
          keyArray.push(id);
        }
        index++;

      });

      //for loop that eliminates from database all elements with the keys in the array
      keyArray.forEach(function(el,i){
        var songToDeleteReference = new Firebase('https://encore-610ad.firebaseio.com/Playlist/' + el);
        songToDeleteReference.remove();
      });

    });
  }

  //Button to take time and date elements from DOM
  $("#getDateTime").on("click", function() {

    var dateLimit = $('.date').val();
    var timeLimit = $('.time').val();
    console.log(timeLimit)
    const dateTime = new Date(dateLimit+"T"+timeLimit).getTime();

    console.log(dateTime)

    var timestamp = Math.floor(dateTime / 1000);

    console.log(timestamp);

    //Start countdown with setInterval method. We pass an anonymous functions as a parameter that will be
    //comparing the time entered with the current time. It stops the setInterval when the time is reached

    clock = setInterval(function(){
      var dateNow = Date.now();
      var stampNow = Math.floor(dateNow / 1000);

      if (stampNow>=timestamp){
        console.log("Delete");
        deleteLameTracks();

       //cancel the timer
        clearInterval(clock);
        //Display message to users
        alert("The Audience has chosen the Playlist!");

      } else{
         console.log("Not Yet");
      }

    },1000);

  });

});

//This is an Iffe - Immediately called Function expression
var songClass = (function () {
  function getSongs() {

    // retrieve messages data when .on() initially executes
    // and when its data updates
    trackReference.on('value', function(results){

      var $setListBoard = $('#setlist')
      var songArray = []

      //With forEach method instead of Leon's simple for loop the elements are ordered in the way speciied on the reference
      //specified in trackReference definition. Firebase never hands ordered data, you order it with forEach
      results.forEach(function(child){

        //Store the song name, votes and key of each object
        var songName = child.val().name
        var votes = child.val().vote //Has to be let, if var it's a mess with scope. var scopes to the neares function
        let songKey = child.key

        // create message element
        var $songListElement = $('<li></li>')

        // create delete element
        var $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>')

        $deleteElement.on('click', function (e) {
          var id = $(e.target.parentNode).data('id')
          console.log("clicked");
          deleteSong(id)
        })
        //By adding the event listener directly to the specific li, you avoid event listener propagation.

        // create up vote element
        var $upVoteElement = $('<i class="fa fa-thumbs-up pull-right"></i>')

        $upVoteElement.on('click', function (e) {
          var id = $(e.target.parentNode).data('id')
          console.log("Id modified = "+id+"with "+votes)
          updateSongVote(id, ++votes)
        })

        // create down vote element
        var $downVoteElement = $('<i class="fa fa-thumbs-down pull-right"></i>')

        $downVoteElement.on('click', function (e) {
          var id = $(e.target.parentNode).data('id')
          console.log("Id modified = "+id+"with "+votes)
          updateSongVote(id, --votes)
        })

        // add id as data attribute so we can refer to later for updating
        $songListElement.attr('data-id', songKey)

        //Try out new
        $songListElement.attr('vote-count',votes);

        // add message to li
        $songListElement.html(songName)

        // add delete element
        $songListElement.append($deleteElement)

        // add voting elements
        $songListElement.append($upVoteElement)
        $songListElement.append($downVoteElement)

        // show votes
        $songListElement.append('<div class="pull-right">' + votes + '</div>')

        // push element to array of messages
        songArray.push($songListElement)

      });


      // remove lis to avoid dupes
      $setListBoard.empty()

      //Add new li in reversed order (higher scores at the top)
      for (var i in songArray) {
        var l = songArray.length;
        //Invert order of appending. Load the last first so they go to the bottom
        $setListBoard.append(songArray[l-i-1])
      }

    })
  }


  function updateSongVote(id, vot) {
    // find message whose objectId is equal to the id we're searching with
    var songReference = new Firebase('https://encore-610ad.firebaseio.com/Playlist/' + id)

    // update votes property
    songReference.update({
      vote: vot
    })
  }

  function deleteSong(id) {
    // find message whose objectId is equal to the id we're searching with
    var songReference = new Firebase('https://encore-610ad.firebaseio.com/Playlist/' + id)

    songReference.remove();

    $("li").attr("data-id",id).remove();

      songClass.getSongs();
  }

  //returns the class
  return {
    getSongs: getSongs
  }


})();
