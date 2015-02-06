  console.log("test")
  window.onload = function() { init() };
  var public_spreadsheet_url = 'https://docs.google.com/spreadsheet/pub?key=0AgDW4THnpFhkdExhY1hmeXpGc25CYXlOenRGVzZ6YUE&output=html';

  function init() {
    Tabletop.init( { key: public_spreadsheet_url,
                     callback: function(data, tabletop) { console.log(data) },
                     simpleSheet: true } );
  }