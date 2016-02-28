Waves.attach('.button:not(.flat)', 'waves-light');
Waves.attach('.button.flat', 'waves-dark');
Waves.attach('button', 'waves-light');
Waves.init();
var currentQuery;
var $textInput = 'input[type="color"], input[type="date"], input[type="datetime"], input[type="datetime-local"], input[type="email"], input[type="month"], input[type="number"], input[type="password"], input[type="search"], input[type="tel"], input[type="text"], input[type="time"], input[type="url"], input[type="week"],textarea';
$(function() {
  $($textInput).each(function() {
    if ($(this).val() === "") {
      $(this).addClass('empty');
    }
  });
  $($textInput).focus(function() {
    $(this).addClass('visited');
  });
  $($textInput).on('change keyup keydown paste keypress', function() {
    if ($(this).val() === '') {
      $($(this)).addClass('empty');
    } else {
      $($(this)).removeClass('empty');
    }
  });
});
var switchWordTo = function(word) {
  if (word != "") {
    currentQuery = word;
    $(".searchbox").val(word);
    loadWord(word);
  } else {
    $(".similarWords .text, .rhymes .text, .definition .text").empty();
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
  $(".definition, .similarWords, .rhymes").css({ marginTop:200, opacity:0 });
  //similarWords
  $.ajax({
    url: 'https://api.datamuse.com/words?ml=' + query + "&max=10",
    type: 'get',
    dataType: 'json',
    cache: true,
    success: function(data) {
      var $list = [];
      $(data).each(function(index, value) {
        $list.push("<p><a href='#" + value.word + "'>" + value.word + "</p>");
      });
      $(".similarWords .text").html($list);
      $(".similarWords").css({marginTop:0, opacity:100});
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
        $list.push("<p><a href='#" + value.word + "'>" + value.word + "</p>");
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
        var partOfSpeech = value.part_of_speech
        $(value.senses).each(function(index, value) {
          $(value.definition).each(function(index, value) {
            $list.push("<li><p><em>" + partOfSpeech + "</em> " + value + "</p></li>");
          })
        });
      });
      // TODO: fix the double running and two ol appearing
      $(".definition .text").html("<ol></ol>");
      $(".definition .text ol").html($list);
      $(".definition").css({marginTop:0, opacity:100});
    }
  });
};
$(document).ready(function() {
  var url = window.location.hash.substring(1)
  if (url != "") {
    switchWordTo(url);
  } else {
    $(".searchbox").addClass("startup");
    $(".definition, .similarWords, .rhymes").css({display:"none"});
  }
});
$(".searchbox").on("focus", function() {
  $(".definition, .similarWords, .rhymes").css({display:"block"});
  $(".definition, .similarWords, .rhymes").css({ marginTop:200, opacity:0 });
})
$(".searchbox").pressEnter(function() {
  $(this).blur();
});
$(".searchbox").blur(function(){
  if (currentQuery != $(this).val()) {
    window.location.hash = "#" + $(this).val();
  } else {
    $(".definition, .similarWords, .rhymes").css({ marginTop:0, opacity:100 });
  }
})
window.onhashchange = function() {
  switchWordTo(window.location.hash.substring(1));
};
