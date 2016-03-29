var resultsCard = function(title, ID, parentID, urlString) {
    var card = document.createElement("div");
    this.urlString = urlString;
    this.card = card;
    document.getElementById(parentID).appendChild(card);
    card.id = ID;
    card.innerHTML = "<div class='title'>" + title + "</div>";
};
resultsCard.prototype.load = function(query) {
    if(document.getElementsByClassName("text")[0]) {
        this.card.removeChild(document.getElementsByClassName("text")[0]);
    }
    var newText = document.createElement("div");
    newText.innerHTML = this.urlString.replace("^query", query);
};
var relatedWords = new resultsCard("Related Words", "relatedWords", "left", "https://api.datamuse.com/words?ml=^query&max=^limit");
relatedWords.load("hi");