Waves.attach('.button:not(.flat)', 'waves-light');
Waves.attach('.button.flat', 'waves-dark');
Waves.attach('button', 'waves-light');
Waves.init();
$(function() {
  var $textInput = 'input[type="color"], input[type="date"], input[type="datetime"], input[type="datetime-local"], input[type="email"], input[type="month"], input[type="number"], input[type="password"], input[type="search"], input[type="tel"], input[type="text"], input[type="time"], input[type="url"], input[type="week"],textarea';
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
$.ajax({
  url: 'https://api.datamuse.com/words?ml=ringing+in+the+ears',
  type: 'get',
  dataType: 'json',
  cache: true,
  success: function(data) {
    $(data).each(function(index, value) {
      console.log(value.word);
    });
  }
});

/*
$.getJSON('https://api.datamuse.com/words?ml=ringing+in+the+ears', function(data) {
  console.log(data);
});
*/
