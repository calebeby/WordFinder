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
$(".searchbox").on('change keyup keydown paste keypress', function() {
  if (currentQuery != $(this).val()) {
    loadWord($(this).val());
  }
});
var switchWordTo = function(word) {
  currentQuery = word;
  $(".searchbox").val(word);
  loadWord(word);
}
var loadWord = function(query) {
  currentQuery = query;
  //similarWords
  $.ajax({
    url: 'https://api.datamuse.com/words?ml=' + query +"&max=10",
    type: 'get',
    dataType: 'json',
    cache: true,
    success: function(data) {
      var $list = [];
      $(data).each(function(index, value) {
        $list.push("<p>"+value.word+"</p>");
      });
      $(".similarWords .text").html($list);
    }
  });
  //rhymes
  $.ajax({
    url: 'https://api.datamuse.com/words?rel_rhy=' + query.split(" ").pop() +"&max=10",
    type: 'get',
    dataType: 'json',
    cache: true,
    success: function(data) {
      var $list = [];
      $(data).each(function(index, value) {
        $list.push("<p>"+value.word+"</p>");
      });
      $(".rhymes .text").html($list);
    }
  });
};
