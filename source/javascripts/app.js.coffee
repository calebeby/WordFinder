# This is the main app file
#= require nprogress
#= require card
#= require annyang
#= require upup.min
#
# TODO: fix numDoneLoading
# TODO: When the searchbox is focused, then a suggestion is clicked,
#       switchWordTo() is called twice,
#       first for the suggestions being clicked,
#       and second for the searchbox being blurred.
#       This makes the suggestions come before they are done loading.
#
# TODO: make it so that older browsers get notification to update their browser,
#     via browser-update.org
#      or outdatedbrowser.com
# link to whatbrowser.org
#      or browsehappy.com
# TODO: add voice recognition via Annyang! @ talater.com/annyang
# 
# TODO: add offline support via upup @ talater.com/upup

#selectedSuggestion is the highlighted item of the suggestions list
selectedSuggestion = 0
originalSearchBoxValue = undefined
currentQuery = undefined
#oldQueries is an array holding the queries that the user has searched,
#  and is used for the suggestions box when the search is blank.
oldQueries = []
searchBox = document.getElementById 'searchbox'
#outerSearch is the wrapper for the searchBox and the suggestions
window.outerSearch = document.getElementById 'search-outer'
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
  vars[item] = object[item] for item of object
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
          #if it's an error, call error() with the error
          error xhr
  #send the request
  xhr.open 'GET', url, true
  xhr.send()

#this is called once every time a card finishes loading and displaying its output
#this will change the progress bar, and show the cards if it is the last one to load.
window.cardLoaded = () ->
    numDoneLoading++
    NProgress.set(numDoneLoading/window.cards.length)
    #if this is the last card to finish
    if numDoneLoading = cards.length
      #end the progress bar and show the cards.
      NProgress.done()
      showCards()

relatedWords = new ResultsCard 'Related Words', 'relatedWords', 'left', 'ul', 'https://api.datamuse.com/words?ml=^query&max=^limit'
definitions = new ResultsCard 'Definitions', 'definition', 'center', 'ol', 'https://api.pearson.com/v2/dictionaries/laad3/entries?headword=^query&limit=^limit'
soundsLike = new ResultsCard 'Similar Sounding Words', 'soundsLike', 'center', 'list', 'https://api.datamuse.com/words?sl=^query&max=^limit'
rhymes = new ResultsCard 'Rhyming Words', 'rhymes', 'right', 'ul', 'https://api.datamuse.com/words?rel_rhy=^query&max=^limit'

hideCards = () ->
  #fade out the cards and make them slide down
  (document.getElementsByTagName('main'))[0].style.opacity = 0
  (document.getElementsByTagName('main'))[0].style.top = '50px'

showCards = () ->
  #reset the cards to their original position
  (document.getElementsByTagName('main'))[0].removeAttribute 'style'

#switchWord updates the url, searchbox, and loads the results into the cards
switchWordTo = (query) ->
  #reset the number of cards that have loaded
  numDoneLoading = 0
  #scroll to the top of the page
  window.scrollTo 0, 0
  #if query is not blank
  if query isnt ''
    #replace + and %20 with space
    query = query.replace(/\+/g, ' ').replace(/%20/g, ' ')
    if query isnt currentQuery
      #start loading bar
      NProgress.start()
      #make searchbox match query
      searchBox.value = query
      #make url match query, but with + instead of space
      window.location.hash = 's=' + query.replace(/ /g, '+')
      if query in oldQueries
        oldQueries.splice oldQueries.indexOf(query), 1
      #add query to old queries list
      oldQueries.unshift query
      #load queries via class method
      rhymes.load query.split(' ').pop(), 10
      soundsLike.load query, 10
      relatedWords.load query, 10
      definitions.load query, 10
      #update currentQuery variable
      currentQuery = query
    else
      #query is the same as it was last time, so show the cards
      #instead of loading them all over again
      showCards()
  else
    #query is blank, so hide the cards
    hideCards()


#when the searchbox is blurred
searchBox.addEventListener 'blur', ->
  #remove focus class from search wrapper
  outerSearch.classList.remove 'focus'
  #update the search
  switchWordTo searchBox.value

#when the URL hash is changed
window.onhashchange = ->
  #update the search to whatever comes after s= in the hash
  switchWordTo window.location.hash.substring 3

#when the DOM is loaded
document.addEventListener 'DOMContentLoaded', ->
  UpUp.start({
    'content-url': 'offline.html'
  })
  #update the search to whatever comes after s= in the hash
  switchWordTo window.location.hash.substring 3
  #commands for annyang
  commands =
    'search (for) *query (please)': switchWordTo
    'look up *query (please)': switchWordTo
  #start annyang
  annyang.start()

#removes all the suggestions from the list
clearSuggestions = () ->
  #remove each element if it exists
  for element in outerSearch.getElementsByTagName 'a'
    outerSearch.removeChild element if element?
  #make sure there are no suggestions left
  #because ajax may have loaded them right after we got the links
  if outerSearch.getElementsByTagName('a')[0]?
    #if there are suggestions left, go back and clear them again
    clearSuggestions()
  return

refreshSuggestions = () ->
  #set the suggestion to the first suggestion, the searchbox
  selectedSuggestion = 0
  #update the list of suggestions
  #unless the searchbox is blank
  unless searchBox.value == ''
    #delete all suggestions links
    clearSuggestions()
    loadJSON({
      #get suggestions based on the value of the searchbox
      url: "https://api.datamuse.com/sug?s=#{searchBox.value}&max=10"
      word: searchBox.value
      success: (suggestions, vars) ->
        #make it so the word is accessible within this function
        @word = vars.word
        #delete all suggestions links again
        #  in case of something loaded right before
        clearSuggestions()
        #move suggestions array of objects to a new temp. variable
        _suggestions = suggestions
        #make a new array with only the words
        suggestions = []
        suggestions.push @word
        suggestions.push suggestionsObject.word for suggestionsObject in _suggestions
        #each suggestion
        for suggestion in suggestions
          #if it's different from what's in the searchbox
          #  and it applies to the current query
          if suggestion isnt searchBox.value and suggestions[0] == searchBox.value
            #create link
            newLink = document.createElement 'a'
            #add href
            newLink.setAttribute 'href', "#s='#{suggestion}'"
            #add text
            newLink.innerText = suggestion
            #append to outerSearch
            outerSearch.appendChild newLink
      })
  else
    #field is blank
    for oldQuery in oldQueries
      #create link
      newLink = document.createElement 'a'
      #add href
      newLink.setAttribute 'href', "#s='#{oldQuery}'"
      #add text
      newLink.innerText = oldQuery
      #add class so that it will have the history icon
      #  next to it
      newLink.classList.add 'old'
      #append to outerSearch
      outerSearch.appendChild newLink

searchBox.addEventListener 'keyup', (event) ->
  code = event.keyCode or event.which
  #if it's not an arrow key
  if !(code == 37 or code == 39 or code == 38 or code == 40)
    refreshSuggestions()

#When the searchbox is focused
searchBox.addEventListener 'focus', ->
  #add the class `focus` to the search wrapper
  outerSearch.classList.add 'focus'
  #make the searchbox the selected item from the suggestions list
  searchBox.classList.add 'selected'
  #hide all of the cards
  hideCards()
  refreshSuggestions()
#when the outer search is clicked
outerSearch.addEventListener 'mousedown', (event) ->
  #if it was a link that was clicked
  if event.target.tagName is 'A'
    #set the searchbox to the text of the clicked link
    searchBox.value = event.target.innerText
  return
searchbox.addEventListener 'keydown', (event) ->
  #if the enter or esc key is pressed
  if event.which is 13 or event.which is 27
    event.preventDefault()
    searchBox.blur()
  #if it's an up or down arrow
  if event.which == 38 or event.which == 40
    #don't move the cursor
    event.preventDefault()
    #the suggestions are all the children of outerSearch
    suggestions = document.querySelectorAll('#search-outer > input, #search-outer > a')
    #make the currently selected suggestion no longer selected
    suggestions[selectedSuggestion].classList.remove 'selected'
    #if the searchBox is selected,
    if selectedSuggestion == 0
      #save its current value to a variable
      originalSearchBoxValue = searchBox.value
    if event.which == 40
      #down arrow
      selectedSuggestion++
      if !suggestions[selectedSuggestion]?
        #none are found at the given index
        selectedSuggestion = 0
      suggestions[selectedSuggestion].classList.add 'selected'
    else if event.which == 38
      #up arrow
      selectedSuggestion--
      if !suggestions[selectedSuggestion]?
        #none are found at the given index
        #  so set it to the last item
        selectedSuggestion = suggestions.length - 1
      suggestions[selectedSuggestion].classList.add 'selected'
    #if one the suggestions is selected
    if document.querySelector('a.selected')?
      #update the search text to the current suggestion
      searchbox.value = document.querySelector('a.selected').innerText
    #if searchbox is selected
    if selectedSuggestion == 0
      #revert it to original value
      searchbox.value = originalSearchBoxValue

#if the `s` key is pressed
document.addEventListener 'keydown', (event) ->
  if (event.which == 83 or event.keyCode == 83 or window.event.keyCode == 83) and event.target.id != 'searchbox'
    event.preventDefault()
    #focus the searchbox
    searchbox.focus()
