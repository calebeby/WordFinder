currentQuery = undefined
URLToLoad = undefined
loadJSON = (object) ->
  success = object.success
  error = object.error
  vars = {}
  vars[item] = object[item] for item of object when item isnt 'url' and item isnt 'success' and item isnt 'error'
  xhr = new XMLHttpRequest
  xhr.onreadystatechange = ->
    if xhr.readyState == XMLHttpRequest.DONE
      if xhr.status == 200
        if success
          success JSON.parse(xhr.responseText), vars
      else
        if error
          error xhr
    return
  xhr.open 'GET', object.url, true
  xhr.send()
  return

class resultsCard
  constructor: (@title, ID, parentID, @outputFormat, @urlString) ->
    @card = document.createElement('div')
    document.getElementById(parentID).appendChild @card
    @card.id = ID
    @card.innerHTML = "<div class='title'>#{@title}</div>"
  load: (query, limit) ->
    @cardText = @card.getElementsByClassName('text')[0]
    if @cardText?
      @card.removeChild cardText
    @cardText = document.createElement('div')
    @cardText.classList.add 'text'
    @card.appendChild @cardText
    cardText = @card.getElementsByClassName('text')[0]
    URLToLoad = @urlString.replace('^query', query).replace('^limit', limit)
    loadJSON {
      url: URLToLoad
      cardText: @card
      cardText: @cardText
      outputFormat: @outputFormat
      success: (data, vars) ->
        for i of vars
          this[i] = vars[i]
        @dataFormat = if data[0] and data[0].word then 'datamuse' else if data.results and data.results[0] then 'pearson' else 'unrecognizable'
        switch @dataFormat
          when 'datamuse'
            results = []
            for i in data
              results.push "<a href='#s=#{i.word}'>#{i.word}</a>"
          when 'pearson'
            results = {}
            part_of_speech = undefined
            for i of data.results
              part_of_speech = data.results[i].part_of_speech
              if !results[part_of_speech]
                results[part_of_speech] = []
              results[part_of_speech].push data.results[i].senses[0].definition
            for PartofSpeech of results
              newdiv = document.createElement('div')
              newdiv.classList.add PartofSpeech
              title = document.createElement('h2')
              title.innerHTML = PartofSpeech
              newdiv.appendChild title
              ol = document.createElement('ol')
              newdiv.appendChild ol
              i = 0
              while i < results[PartofSpeech].length
                li = document.createElement('li')
                li.innerHTML = results[PartofSpeech][i]
                ol.appendChild li
                i++
              cardText.appendChild newdiv
          else
            console.error "Unable to read data from #{URLToLoad}"
        switch @outputFormat
          when 'ul'
            ul = document.createElement('ul')
            for i in results
              li = document.createElement('li')
              li.innerHTML = i
              ul.appendChild li
            cardText.appendChild ul
          when 'list'
            p = document.createElement('p')
            p.innerHTML = results.join(', ')
            cardText.appendChild p
      error: (xhr) ->
        console.error xhr
      }
relatedWords = new resultsCard 'Related Words', 'relatedWords', 'left', 'ul', 'https://api.datamuse.com/words?ml=^query&max=^limit'
definitions = new resultsCard 'Definitions', 'definition', 'center', 'ol', 'https://api.pearson.com/v2/dictionaries/laad3/entries?headword=^query&limit=^limit'
soundsLike = new resultsCard 'Similar Sounding Words', 'soundsLike', 'center', 'list', 'https://api.datamuse.com/words?sl=^query&max=^limit'
rhymes = new resultsCard 'Rhyming Words', 'rhymes', 'right', 'ul', 'https://api.datamuse.com/words?rel_rhy=^query&max=^limit'

loadWord = (query) ->
  window.location.hash = 's=' + query
  rhymes.load query, 10
  soundsLike.load query, 10
  relatedWords.load query, 10
  definitions.load query, 10

loadWord 'hi'
