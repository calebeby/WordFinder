unless document.getElementById('overlay')?
  document.body.innerHTML += '<div id="overlay"></div>'
for dialogLink in document.querySelectorAll('[data-dialog]')
  dialogLink.addEventListener 'click', () ->
    dialog = document.getElementById dialogLink.getAttribute 'data-dialog'
    dialog.classList.add 'visible'
    overlay = document.getElementById 'overlay'
    overlay.classList.add 'visible'
    overlay.addEventListener 'click', () ->
      overlay.classList.remove 'visible'
      console.log dialog
      dialog.classList.remove 'visible'
