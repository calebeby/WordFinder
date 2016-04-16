class window.resultsCard
  constructor: (@title, ID, parentID, @outputFormat, @urlString) ->
    @card = document.createElement('div')
    document.getElementById(parentID).appendChild @card
    @card.id = ID
    @card.innerHTML = "<div class='title'>#{@title}</div>"
    window.cards.push this
  load: (query, limit) ->
    @cardText = @card.getElementsByClassName('text')[0]
    if @cardText?
      @card.removeChild @cardText
    @cardText = document.createElement('div')
    @cardText.classList.add 'text'
    @card.appendChild @cardText
    cardText = @card.getElementsByClassName('text')[0]
    @URLToLoad = @urlString.replace('^query', query).replace('^limit', limit)
    window.loadJSON {
      url: @URLToLoad
      card: @card
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
              newdiv.classList.add PartofSpeech.replace(/\s+/g, '')
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
        window.cardLoaded()
      error: (xhr) ->
        console.error xhr
      }

