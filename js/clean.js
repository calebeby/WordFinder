// TODO: fix it so that the more button can come up after clicking and going to another query
// TODO: cancel all requests if it is blank, or search box has been focused. (the problem was it was loading the dictionary, even after the search box had been pressed.)
// TODO: fix left and right arrows
Waves.attach('.button.flat', 'waves-dark');
Waves.init();
var currentQuery;
var oldQueries = [];
var $cache = false;
var $allCards = ".soundsLike, .definition, .relatedWords, .rhymes";
var searchBoxValue;
var selectedSuggestion;
var switchWordTo = function(query) {
  window.scrollTo(0, 0);
  if (query != "") { //if it is not blank
    query = query
      .split("+").join(" ")
      .split("%20").join(" ");
    if (query !== currentQuery) {
      $(".searchbox").val(query);
      loadWord(query);
      window.location.hash = "s=" + query;
      oldQueries.unshift(query);
      currentQuery = query;
    } else { //the query is the same as it was last time, so show the data
      $($allCards).removeAttr("style");
    }
  } else { //is blank, so go to reset mode
    $($allCards).css({
      marginTop: 200,
      opacity: 0,
      visibility: "hidden"
    });
  }
}
var getRelatedWords = function(query, limit) {
  $.ajax({
    url: 'https://api.datamuse.com/words?ml=' + query + "&max=" + limit,
    type: 'get',
    dataType: 'json',
    cache: $cache,
    success: function(data) {
      var $list = [];
      $(data).each(function(index, value) {
        $list.push("<p><a href='#s=" + value.word + "'>" + value.word + "</a></p>");
      });
      if ($list.length > 0) {
        $(".relatedWords .text").html($list)
      } else {
        $(".relatedWords .text").html("Can't find related words");
      }
      if ($(".searchbox").not(":focus")) {
        $(".relatedWords").removeAttr("style");
      }
    }
  });
}
var getSimilarSoundingWords = function(query, limit) {
  $.ajax({
    url: 'https://api.datamuse.com/words?sl=' + query + "&max=" + limit,
    type: 'get',
    dataType: 'json',
    cache: $cache,
    success: function(data) {
      var $list = [];
      $(data).each(function(index, value) {
        $list.push("<a href='#s=" + value.word + "'>" + value.word + "</a>");
      });
      if ($list.length > 0) {
        $(".soundsLike .text").html("<p>" + $list.join(", ") + "</p>")
      } else {
        $(".soundsLike .text").html("Can't find find similar-sounding words");
      }
      if ($(".searchbox").not(":focus")) {
        $(".soundsLike").removeAttr("style");
      }
    }
  });
}
var getRhymingWords = function(query, limit) {
  $.ajax({
    url: 'https://api.datamuse.com/words?rel_rhy=' + query.split(" ").pop() + "&max=" + limit,
    type: 'get',
    dataType: 'json',
    cache: $cache,
    success: function(data) {
      var $list = [];
      $(data).each(function(index, value) {
        $list.push("<p><a href='#s=" + value.word + "'>" + value.word + "</a></p>");
      });
      if ($list.length > 0) {
        $(".rhymes .text").html($list);
      } else {
        $(".rhymes .text").html("Can't find find rhyming words")
      }
      if ($(".searchbox").not(":focus")) {
        $(".rhymes").removeAttr("style");
      }
    }
  });
}
var getDefinition = function(query, limit) {
  $.ajax({
    url: 'https://api.pearson.com/v2/dictionaries/ldoce5/entries?headword=' + query + "&limit=" + limit,
    type: 'get',
    dataType: 'json',
    cache: $cache,
    success: function(data) {
      var $list;
      $list = [];
      //each result
      $(data.results).each(function(index, value) {
        //get part of speech
        var partOfSpeech = value.part_of_speech;
        $list.push("<li><p><em>" + partOfSpeech + "</em> " + value.senses[0].definition + "</p></li>");
      });
      if ($list.length > 0) {
        $(".definition .text").html("<ol></ol>");
        $(".definition .text ol").html($list);
      } else {
        $(".definition .text").html("Can't find definitions");
      }
      if ($(".searchbox").not(":focus")) {
        $(".definition").removeAttr("style");
      }
    }
  });
}
var loadWord = function(query) {
  //slide down and out
  $($allCards).css({
    marginTop: 200,
    opacity: 0,
    visibility: "hidden"
  });
  getRelatedWords(query, 10);
  getSimilarSoundingWords(query, 10);
  getRhymingWords(query, 10);
  getDefinition(query, 3);

}
$.fn.pressEnter = function(fn) {
  return this.each(function() {
    $(this).on('enterPress', fn);
    $(this).keyup(function(e) {
      if (e.keyCode == 13) {
        $(this).trigger("enterPress");
      }
    });
  });
};
$(".searchbox").focus(function() {
  $(".search-outer").addClass("focus");
  $(this).addClass("selected");
  $($allCards).css({
    marginTop: 200,
    opacity: 0,
    visibility: "hidden"
  });
});
$(".searchbox").on("focus keyup", function(event) {
  var code = (event.keyCode || event.which);
  if (!(code == 37 || code == 39 || code == 38 || code == 40)) { //if it's not an arrow key
    selectedSuggestion = 0;
    var empty = $(".searchbox").val() == "";
    $(".search-outer").find("a").remove();
    if (!empty) { //field is not blank
      $.ajax({ //load suggestions
        url: 'https://api.datamuse.com/sug?s=' + $(".searchbox").val() + "&max=10",
        type: 'get',
        dataType: 'json',
        cache: $cache,
        success: function(data) {
          var $list = [];
          $(data).each(function(index, value) {
            if (value.word != $(".searchbox").val()) { //if it's not in the search box
              $list.push("<a href='#s=" + value.word + "'>" + value.word + "</a>");
            }
          });
          $(".search-outer").append($list);
        }
      });
      /*
      $.ajax({ //load suggestions
        url: 'https://api.collinsdictionary.com/api/v1/dictionaries/english/search/didyoumean?start=0&entrynumber=3&page=1&limit=25&q=' + $(".searchbox").val(),
        type: 'get',
        dataType: 'json',
        cache: $cache,
        headers: {
          'host': '127.0.0.1:4000',
          'Accept': 'application/json',
          'accessKey': 'Jqvg9iAG0Wzpre5dNEB1Cl3Xmw9cFY4AQD9wqNmEPPCovxeHJDfLKTiKkWZgp42Q'
        },
        success: function(data) {
          var $list = [];
          $(data).each(function(index, value) {
            $list.push("<a href='#s=" + value.word + "'>" + value.word + "</a>");
          });
          $(".search-outer").append($list);
        }
      });
      */
    } else { //field is blank
      var queries = [];
      var link;
      $.each(oldQueries, function(index, value) {
        link = "<a href='#s=" + value + "'class='old'>" + value + "</a>"
        if ($.inArray(link, queries) === -1) { //if it's not in the list
          queries.push(link);
        }
      });
      $(".search-outer").append(queries);
    }
  }
});
$(".search-outer").on("mousedown", "a", function() {
  $(".searchbox").val($(this).html()).blur();
});
$(".searchbox").keydown(function(e) {
  if (event.which == 38 || event.which == 40) {
    event.preventDefault();
    var suggestion = $(".search-outer > * ");
    suggestion.eq(selectedSuggestion).addClass('selected');
    if (selectedSuggestion === 0) {
      searchBoxValue = $(".searchbox").val();
    }
    if (e.which === 40) { //down arrow
      suggestion.eq(selectedSuggestion).removeClass('selected');
      selectedSuggestion++;
      if (!suggestion.eq(selectedSuggestion).length) { //none are found at the given index
        selectedSuggestion = 0;
      }
      suggestion.eq(selectedSuggestion).addClass('selected');
    } else if (e.which === 38) { //up arrow
      suggestion.eq(selectedSuggestion).removeClass('selected');
      selectedSuggestion--;
      if (!suggestion.eq(selectedSuggestion).length) { //none are found at the given index
        selectedSuggestion = suggestion.length;
      }
      suggestion.eq(selectedSuggestion).addClass('selected');
    }
    if ($("a.selected").length > 0) { //one the suggestions is selected
      $(".searchbox").val($("a.selected").text());
    }
    if (selectedSuggestion === 0) { //searchbox is selected
      $(".searchbox").val(searchBoxValue); //revert it to original value
    }
  }
});
$(".searchbox").pressEnter(function() {
  $(this).blur();
});
$(".searchbox").blur(function() {
  $(".search-outer").removeClass("focus")
  switchWordTo($(".searchbox").val());
});
window.onhashchange = function() {
  switchWordTo(window.location.hash.substring(3));
};
$(".relatedWords .button").on("click", function() {
  $(".relatedWords .actions").remove();
  $(".relatedWords").css({
    marginTop: 200,
    opacity: 0,
    visibility: "hidden"
  });
  getRelatedWords(currentQuery, 100);
});
$(".definition .button").on("click", function() {
  $(".definition .actions").remove();
  $(".definition").css({
    marginTop: 200,
    opacity: 0,
    visibility: "hidden"
  });
  getDefinition(currentQuery, 10);
});
$(".soundsLike .button").on("click", function() {
  $(".soundsLike .actions").remove();
  $(".soundsLike").css({
    marginTop: 200,
    opacity: 0,
    visibility: "hidden"
  });
  getSimilarSoundingWords(currentQuery, 100);
});
$(".rhymes .button").on("click", function() {
  $(".rhymes .actions").remove();
  $(".rhymes").css({
    marginTop: 200,
    opacity: 0,
    visibility: "hidden"
  });
  getRhymingWords(currentQuery, 100);
});
$(document).keypress(function(e) {
  if ((e.which == 83 || e.keyCode == 83 || window.event.keyCode == 83) && $(".searchbox").not(":focus")) {
    $(".searchbox").focus();
  };
});
$(document).ready(function() {
  switchWordTo(window.location.hash.substring(3));
});
