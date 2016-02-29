var currentQuery;
var $allCards = ".soundsLike, .definition, .relatedWords, .rhymes"
var switchWordTo = function(word) {
  if (word != "") {
    currentQuery = word;
    $(".searchbox").val(word);
    loadWord(word);
  } else {
    $(".relatedWords .text, .rhymes .text, .definition .text").empty();
  }
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
var loadWord = function(query) {
  currentQuery = query;
  $(".searchbox").removeClass("startup")
  $($allCards).css({ marginTop:200, opacity:0 });
  //relatedWords
  $.ajax({
    url: 'https://api.datamuse.com/words?ml=' + query + "&max=10",
    type: 'get',
    dataType: 'json',
    cache: true,
    success: function(data) {
      var $list = [];
      $(data).each(function(index, value) {
        $list.push("<p><a href='#" + value.word + "'>" + value.word + "</a></p>");
      });
      $(".relatedWords .text").html($list);
      $(".relatedWords").css({marginTop:0, opacity:100});
    }
  });
  //similar sounding
  $.ajax({
    url: 'https://api.datamuse.com/words?sl=' + query + "&max=15",
    type: 'get',
    dataType: 'json',
    cache: true,
    success: function(data) {
      var $list = [];
      $(data).each(function(index, value) {
        $list.push("<a href='#" + value.word + "'>" + value.word + "</a>");
      });
      $(".soundsLike .text").html("<p>" + $list.join(", ") + "</p>");
      $(".soundsLike").css({marginTop:"25px", opacity:100});
    }
  });
  $.ajax({
    url: 'https://api.datamuse.com/words?rel_rhy=' + query.split(" ").pop() + "&max=10",
    type: 'get',
    dataType: 'json',
    cache: true,
    success: function(data) {
      var $list = [];
      $(data).each(function(index, value) {
        $list.push("<p><a href='#" + value.word + "'>" + value.word + "</a></p>");
      });
      $(".rhymes .text").html($list);
      $(".rhymes").css({marginTop:0, opacity:100});
    }
  });
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
            $list.push("<li><p><em>" + partOfSpeech + "</em> " + value + "</p></li>");
          })
        });
      });
      $(".definition .text").html("<ol></ol>");
      $(".definition .text ol").html($list);
      $(".definition").css({marginTop:0, opacity:100});
    }
  });
};
$(document).ready(function() {
  var url = window.location.hash.substring(1).split("+").split("%20").join(" ");
  if (url != "") {
    switchWordTo(url);
  } else {
    $(".searchbox").addClass("startup");
    $(".row").css({display:"none"});
  }
});
$(".searchbox").on("focus", function() {
  $(".row").css({display:"block"});
  $($allCards).css({ marginTop:200, opacity:0 });
})
$(".searchbox").pressEnter(function() {
  $(this).blur();
$(document).ready(function() {
  var url = window.location.hash.substring(1).split("+").split("%20").join(" ");
  if (url != "") {
    switchWordTo(url);
  } else {
    $(".searchbox").addClass("startup");
    $(".row").css({display:"none"});
  }
});
$(".searchbox").on("focus", function() {
  $(".row").css({display:"block"});
});
$(".searchbox").blur(function(){
  if (currentQuery != $(this).val()) {
    window.location.hash = "#" + $(this).val();
  } else {
    $($allCards).css({ marginTop:0, opacity:100 });
    $(".soundsLike").css({ marginTop:"25px" });
  }
})
window.onhashchange = function() {
  switchWordTo(window.location.hash.substring(1).split("+").split("%20").join(" "));
};
