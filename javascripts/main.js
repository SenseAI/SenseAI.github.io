$( document ).ready(function() {

  $('body').scrollspy({
      target: '.bs-docs-sidebar',
      offset: 40
  });
  $("#sidebar").affix({
      offset: {
        top: 200
      }
  });
  console.log("here")
})
