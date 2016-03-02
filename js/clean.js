Waves.attach('.button.flat', 'waves-dark');
Waves.init();
var currentQuery;
var $cache = false;
var $allCards = ".soundsLike, .definition, .relatedWords, .rhymes"
var switchWordTo = function(query) {
  window.scrollTo(0, 0);
  if (query != "") { //if it is not blank
    query = query
    .split("+").join(" ")
    .split("%20").join(" ");
    if (query !== currentQuery) {
      $(".searchbox").val(query);
      loadWord(query);
      window.location.hash = query;
      currentQuery = query;
    } else { //the query is the same as it was last time, so show the data
      $($allCards).removeAttr("style");
    }
  } else { //is blank, so go to reset mode
    $($allCards).css({ marginTop:200, opacity:0, visibility:"hidden" });
  }
}
var goHome = function() {

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
        $list.push("<p><a href='#" + value.word + "'>" + value.word + "</a></p>");
      });
      if ($list.length > 0) {
        $(".relatedWords .text").html($list)
        $(".relatedWords").removeAttr("style");
      } else {
        $(".relatedWords .text").html("Can't find related words");
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
        $list.push("<a href='#" + value.word + "'>" + value.word + "</a>");
      });
      if ($list.length > 0) {
        $(".soundsLike .text").html("<p>" + $list.join(", ") + "</p>")
        $(".soundsLike").removeAttr("style");
      } else {
        $(".soundsLike .text").html("Can't find find similar-sounding words");
        $(".soundsLike").removeAttr("style");
      }
    }
  });
}
var getRhymingWords = function(query, limit) {
  $.ajax({
    url: 'https://api.datamuse.com/words?rel_rhy=' + query + "&max=" + limit,
    type: 'get',
    dataType: 'json',
    cache: $cache,
    success: function(data) {
      var $list = [];
      $(data).each(function(index, value) {
        $list.push("<p><a href='#" + value.word + "'>" + value.word + "</a></p>");
      });
      if ($list.length > 0) {
        $(".rhymes .text").html($list)
        $(".rhymes").removeAttr("style");
      } else {
        $(".rhymes .text").html("Can't find find rhyming words")
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
    cache: true,
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
        $(".definition").removeAttr("style");
      } else {
        $(".definition .text").html("Can't find definitions");
        $(".definition").removeAttr("style");
      }
    }
  });
}
var loadWord = function(query) {
  //slide down and out
  $($allCards).css({ marginTop:200, opacity:0, visibility:"hidden" });
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
    })
  });
};
$(".searchbox").focus(function() {
  $($allCards).css({ marginTop:200, opacity:0, visibility:"hidden" });
});
$(".searchbox").pressEnter(function() {
  $(this).blur();
});
$(".searchbox").blur(function() {
  switchWordTo($(".searchbox").val());
});
window.onhashchange = function() {
  switchWordTo(window.location.hash.substring(1));
};
$(".relatedWords .button").on("click", function(){
  $(".relatedWords").css({ marginTop:200, opacity:0, visibility:"hidden" });
  getRelatedWords(currentQuery, 50);
})
$(".definition .button").on("click", function(){
  $(".definition").css({ marginTop:200, opacity:0, visibility:"hidden" });
  getDefinition(currentQuery, 50);
})
$(".soundsLike .button").on("click", function(){
  $(".soundsLike").css({ marginTop:200, opacity:0, visibility:"hidden" });
  getSimilarSoundingWords(currentQuery, 50);
})
$(".rhymes .button").on("click", function(){
  $(".rhymes").css({ marginTop:200, opacity:0, visibility:"hidden" });
  getRhymingWords(currentQuery, 50);
})
$(document).ready(function() {
  switchWordTo(window.location.hash.substring(1));
});
