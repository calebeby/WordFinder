var ul, li;
function loadJSON(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}
var resultsCard = function(title, ID, parentID, outputFormat, urlString) {
    var card = document.createElement('div');
    this.urlString = urlString;
    this.outputFormat = outputFormat;
    this.card = card;
    document.getElementById(parentID).appendChild(card);
    card.id = ID;
    card.innerHTML = '<div class="title">' + title + '</div>';
};
resultsCard.prototype.load = function(query, limit) {
    var outputFormat = this.outputFormat;
    if(this.card.getElementsByClassName('text')[0]) {
        this.card.removeChild(document.getElementsByClassName('text')[0]);
    }
    var newText = document.createElement('div');
    var URLToLoad = this.urlString.replace('^query', query).replace('^limit', limit);
    var results;
    newText.classList.add('text');
    this.card.appendChild(newText);
    var card = this.card;
    loadJSON(URLToLoad,
        function(data) {
            if(data[0] && data[0].word) { //datamuse api format
                results = [];
                for (var i in data) {
                    results.push(data[i].word);
                }
                console.log(outputFormat);
                switch (outputFormat) {
                    case 'ul':
                        ul = document.createElement('ul');
                        for (var i in results) {
                            li = document.createElement('li');
                            li.appendChild(document.createTextNode(results[i]));
                            ul.appendChild(li);
                        }
                        card.getElementsByClassName('text')[0].appendChild(ul);
                        break;
                }
            } else if(data.results && data.results[0]) { //pearson api format
                results = {};
                var part_of_speech;
                for (var i in data.results) {
                    part_of_speech = data.results[i].part_of_speech;
                    if(!results[part_of_speech]) {
                        results[part_of_speech] = [];
                    }
                    results[part_of_speech].push(data.results[i].senses[0].definition);
                }
                var nouns = document.createElement('div');
                ul = document.createElement('ol');
                nouns.appendChild(ul);
                for (var item in results.noun) {
                    li = document.createElement('li');
                    li.innerHTML = results.noun[item];
                    ul.appendChild(li);
                }
                card.getElementsByClassName('text')[0].appendChild(nouns);
            } else {
                console.error("Unable to read data");
            }
            console.log(results);
        },
        function(xhr) {
            console.error(xhr);
        }
    );
};
var relatedWords = new resultsCard('Related Words', 'relatedWords', 'left', 'ul', 'https://api.datamuse.com/words?ml=^query&max=^limit');
relatedWords.load('hi', 10);
var definitions = new resultsCard('Definitions', 'definition', 'center', 'ol', 'https://api.pearson.com/v2/dictionaries/laad3/entries?headword=^query&limit=^limit');
definitions.load('dog', 15);
var soundsLike = new resultsCard('Similar Sounding Words', 'soundsLike', 'center', 'ul', 'https://api.datamuse.com/words?sl=^query&max=^limit');
soundsLike.load('hi', 10);
var rhymes = new resultsCard('Rhyming Words', 'rhymes', 'right', 'ul', 'https://api.datamuse.com/words?rel_rhy=^query&max=^limit');
rhymes.load('hi', 10);