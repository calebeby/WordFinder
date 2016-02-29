var currentQuery;
var $cache = true;
var $allCards = ".soundsLike, .definition, .relatedWords, .rhymes"
var switchWordTo = function(query) {
  if (query != "") { //if it is not blank, load it
    $(".searchbox").val(query);
    loadWord(query);
    window.location.hash = query;
  } else { //is blank, so go to reset mode

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
      $(".relatedWords .text").html($list)
      $(".relatedWords").css({ marginTop:0, opacity:100 });
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
      $(".soundsLike .text").html("<p>" + $list.join(", ") + "</p>")
      $(".soundsLike").css({ marginTop:0, opacity:100 });
      console.log("up to date");
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
      $(".rhymes .text").html($list)
      $(".rhymes").css({ marginTop:0, opacity:100 });
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
      console.log(data);
      $(data.results).each(function(index, value) {
        var partOfSpeech = value.part_of_speech
        $(value.senses).each(function(index, value) {
          $(value.definition).each(function(index, value) {
            $list.push("<li><p><em>" + partOfSpeech + "</em> " + value.word + "</p></li>");
          })
        });
      });
      $(".definition .text").html("<ol></ol>");
      $(".definition .text ol").html($list);
      $(".definition").css({marginTop:0, opacity:100});
    }
  });
}
var loadWord = function(query) {
  currentQuery = query;
  //slide down and out
  $($allCards).css({ marginTop:200, opacity:0 });
  getRelatedWords(query, 10);
  getSimilarSoundingWords(query, 10);
  getRhymingWords(query, 10);
  getDefinition(query, 10);

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
$(".searchbox").pressEnter(function() {
  $(this).blur();
});
$(".searchbox").blur(function() {
  loadWord($(".searchbox").val());
})
window.onhashchange = function() {
  switchWordTo(window.location.hash.substring(1)
    .split("+").join(" ")
    .split("%20").join(" ")
  );
};
