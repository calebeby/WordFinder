# This is the main app file
#= require nprogress
#= require card
#
# TODO: make .replace use global regex flag, so that it replaces all instances, instead of just one.
#
# TODO: add comments for nearly every line of code
#
# TODO: turn commented code into coffeescript without jQuery
#

currentQuery = undefined
#oldQueries is an array holding the queries that the user has searched,
#  and is used for the suggestions box when the search is blank.
oldQueries = []
searchBox = document.getElementById 'searchbox'
#outerSearch is the wrapper for the searchBox and the suggestions
outerSearch = document.getElementById 'search-outer'
#window.cards is an array of each card.
window.cards = []
#numDoneLoading is the number of cards that have finished loading since the last search
numDoneLoading = 0

#loadJSON loads a JSON object from the url property of the object parameter
#  and then calls the success() from the object with the parameter data
window.loadJSON = (object) ->
  #sets url, success, and error based on their corresponding properties in object
  {url, success, error} = object
  #vars is an object that will carry all the variables that will be passed into the child function
  vars = {}
  vars[item] = object[item] for item of object when item isnt 'url' and item isnt 'success' and item isnt 'error'
  xhr = new XMLHttpRequest
  xhr.onreadystatechange = ->
    if xhr.readyState == XMLHttpRequest.DONE
      if xhr.status == 200
        if success
          #when it finishes loading, it parses the JSON and calls success()
          #  with the JSON data and vars.
          success JSON.parse(xhr.responseText), vars
      else
        if error
          #if it's an error, call error() with the data
          error xhr
  #send the request
  xhr.open 'GET', url, true
  xhr.send()


window.cardLoaded = () ->
    numDoneLoading++
    NProgress.set(numDoneLoading/window.cards.length)
    if numDoneLoading = window.cards.length
      NProgress.done()
      showCards()

relatedWords = new resultsCard 'Related Words', 'relatedWords', 'left', 'ul', 'https://api.datamuse.com/words?ml=^query&max=^limit'
definitions = new resultsCard 'Definitions', 'definition', 'center', 'ol', 'https://api.pearson.com/v2/dictionaries/laad3/entries?headword=^query&limit=^limit'
soundsLike = new resultsCard 'Similar Sounding Words', 'soundsLike', 'center', 'list', 'https://api.datamuse.com/words?sl=^query&max=^limit'
rhymes = new resultsCard 'Rhyming Words', 'rhymes', 'right', 'ul', 'https://api.datamuse.com/words?rel_rhy=^query&max=^limit'

hideCards = () ->
  (document.getElementsByTagName('main'))[0].style.opacity = 0
  (document.getElementsByTagName('main'))[0].style.top = '10px'

showCards = () ->
  (document.getElementsByTagName('main'))[0].removeAttribute 'style'
switchWordTo = (query) ->
  window.scrollTo 0, 0
  if query isnt ''
    #query is not blank
    #replace + and %20 with space
    query = query.replace('+', ' ').replace('%20', ' ')
    if query isnt currentQuery
      #start loading bar
      NProgress.start()
      #make searchbox match query
      searchBox.value = query
      #make url match query, but with + instead of space
      window.location.hash = 's=' + query.replace(' ', '+')
      #add query to old queries list
      oldQueries.unshift query
      #load queries via class method
      rhymes.load query, 10
      soundsLike.load query, 10
      relatedWords.load query, 10
      definitions.load query, 10
      #update currentQuery variable
      currentQuery = query
    else
      #the query is the same as it was last time, so show the cards
      showCards()
  else
    #query is blank, so hide the cards
    hideCards()
searchBox.addEventListener 'focus', ->
  outerSearch.classList.add 'focus'
  searchBox.classList.add 'selected'
  hideCards()
searchBox.addEventListener 'blur', ->
  outerSearch.classList.remove 'focus'
  switchWordTo searchBox.value
window.onhashchange = ->
  switchWordTo window.location.hash.substring 3
document.addEventListener 'DOMContentLoaded', ->
  switchWordTo window.location.hash.substring 3

###
$('#searchbox').on 'focus keyup', (event) ->
  code = event.keyCode or event.which
  if !(code == 37 or code == 39 or code == 38 or code == 40)
    #if it's not an arrow key
    selectedSuggestion = 0
    empty = $('#searchbox').val() == ''
    $('.search-outer').find('a').remove()
    if !empty
      #field is not blank
      $.ajax
        url: 'https://api.datamuse.com/sug?s=' + $('#searchbox').val() + '&max=10'
        type: 'get'
        dataType: 'json'
        cache: $cache
        success: (data) ->
          $list = []
          $(data).each (index, value) ->
            if value.word != $('#searchbox').val()
              #if it's not in the search box
              $list.push '<a href=\'#s=' + value.word + '\'>' + value.word + '</a>'
            return
          $('.search-outer').append $list
          return
    else
      #field is blank
      queries = []
      link = undefined
      $.each oldQueries, (index, value) ->
        link = '<a href=\'#s=' + value + '\'class=\'old\'>' + value + '</a>'
        if $.inArray(link, queries) == -1
          #if it's not in the list
          queries.push link
        return
      $('.search-outer').append queries
  return
$('.search-outer').on 'mousedown', 'a', ->
  $('#searchbox').val($(this).html()).blur()
  return
$('#searchbox').keydown (e) ->
  if event.which == 38 or event.which == 40
    event.preventDefault()
    suggestion = $('.search-outer > * ')
    suggestion.eq(selectedSuggestion).addClass 'selected'
    if selectedSuggestion == 0
      searchBoxValue = $('#searchbox').val()
    if e.which == 40
      #down arrow
      suggestion.eq(selectedSuggestion).removeClass 'selected'
      selectedSuggestion++
      if !suggestion.eq(selectedSuggestion).length
        #none are found at the given index
        selectedSuggestion = 0
      suggestion.eq(selectedSuggestion).addClass 'selected'
    else if e.which == 38
      #up arrow
      suggestion.eq(selectedSuggestion).removeClass 'selected'
      selectedSuggestion--
      if !suggestion.eq(selectedSuggestion).length
        #none are found at the given index
        selectedSuggestion = suggestion.length
      suggestion.eq(selectedSuggestion).addClass 'selected'
    if $('a.selected').length > 0
      #one the suggestions is selected
      $('#searchbox').val $('a.selected').text()
    if selectedSuggestion == 0
      #searchbox is selected
      $('#searchbox').val searchBoxValue
      #revert it to original value
  return
$('#searchbox').pressEnter ->
  $(this).blur()
  return
$(document).keydown (e) ->
  if (e.which == 83 or e.keyCode == 83 or window.event.keyCode == 83) and event.target.id != 'searchbox'
    e.preventDefault()
    $('#searchbox').focus()
  if (e.which == 27 or e.keyCode == 27 or window.event.keyCode == 27) and event.target.id == 'searchbox'
    e.preventDefault()
    $('#searchbox').blur()
  return
###
