var currentQuery;
var $cache = true;
var $allCards = ".soundsLike, .definition, .relatedWords, .rhymes"
var switchWordTo = function(query) {
  if (word != "") { //if it is not blank, load it
    $(".searchbox").val(query);
    loadWord(query);
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
        $list.push(value.word);
      });
      return $list;
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
        $list.push(value.word);
      });
      return $list;
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
        $list.push(value.word);
      });
      return $list;
    }
  });
}
var getDefinition = function(query, limit) {
  $.ajax({
    url: 'https://api.pearson.com/v2/dictionaries/ldoce5/entries?headword=' + query + "&limit=5",
    type: 'get',
    dataType: 'json',
    cache: true,
    success: function(data) {
      var $list;
      $list = [];
      $(data.results).each(function(index, value) {
        var partOfSpeech = value.part_of_speechcds
        $(value.senses).each(function(index, value) {
          $(value.definition).each(function(index, value) {
            $list.push({"partOfSpeech":partOfSpeech,"definition":value});
          })
        });
      });
    }
  });
}
var loadWord = function(query) {
  currentQuery = query;
  //slide down and out
  $($allCards).css({ marginTop:200, opacity:0 });
  var relatedWords = [];
  console.log(getRelatedWords(query, 10));
  $.each(getRelatedWords(query, 10), function(index, value) {
    console.log(value);
    relatedWords.push("<p><a href='#" + value + "'>" + value + "</a></p>");
    console.log(relatedWords);
  });
  $(".relatedWords").html(relatedWords).css({ marginTop:0, opacity:100 });
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
$(".searchbox").pressEnter(function(){
  loadWord($(".searchbox").val());
})
