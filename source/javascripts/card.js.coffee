# 
# TODO: make something nice appear if there are not results for a card
#
class window.ResultsCard
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
    loadJSON {
      query: query
      url: @URLToLoad
      card: @card
      cardText: @cardText
      outputFormat: @outputFormat
      success: (data, vars) ->
        for i of vars
          this[i] = vars[i]
        @dataFormat = if data[0] and data[0].word then 'datamuse' else if data.results then 'pearson' else 'unrecognizable'
        switch @dataFormat
          when 'datamuse'
            results = []
            for i in data
              results.push "<a href='#s=#{i.word}'>#{i.word}</a>"
          when 'pearson'
            results = {}
            #if there are results
            if data.results[0]
              part_of_speech = undefined
              for i of data.results
                part_of_speech = data.results[i].part_of_speech
                if !results[part_of_speech]
                  results[part_of_speech] = []
                results[part_of_speech].push data.results[i].senses[0].definition
              for partofSpeech of results
                newdiv = document.createElement('section')
                newdiv.classList.add partofSpeech.replace(/\s+/g, '')
                title = document.createElement('h2')
                title.innerHTML = partofSpeech
                newdiv.appendChild title
                ol = document.createElement('ol')
                newdiv.appendChild ol
                console.log results[partofSpeech]
                for i in results[partofSpeech]
                  console.log i
                  li = document.createElement('li')
                  li.innerHTML = i
                  ol.appendChild li
                cardText.appendChild newdiv
            #no results
            else
              loadJSON {
                url: "https://www.googleapis.com/customsearch/v1?q=define%20#{query}&cx=016826248069333016431%3Axeckywfblsg&key=AIzaSyBnIMWEr80v00Fgq60OxByQJ5cMlj8auM8"
                success: (data) ->
                  console.log data.items
              }
        if results?
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
        cardLoaded()
      error: (xhr) ->
        console.error xhr
    }

