Project-Pizza
=============
Monies for Pizzas

Directions
=========
1. Open Terminal and clone this repository by running `git clone https://github.com/maptimeLA/Project-Pizza.git`
2. `cd Project-Pizza`
3. `python -m SimpleHTTPServer 8000`
4. Go to your browser and open `http://localhost:8000/`

Install gspread from GitHub
=========
1. `git clone https://github.com/burnash/gspread.git`
2. `cd gspread`
3. `python setup.py install`

Embedding Instructions
=========
To embed the map into your own website, you will only need to add one line of code:

`<iframe src="http://maptimela.github.io/Project-Pizza/" width="100%" height="700px" frameborder="0"></iframe>`

1.10.2015
=========
- Added v01 to test intial page
- county and city geojson test files used
- hover over features and zoom to feature added

1.21.2015
=========
- Added v02, removed v01
- Disabled hover over features and zoom to feature, to be enabled when additional layers are made.
- Incorporated city geojson
- This version tests the leaflet search plugin by stefanocudini
- So far it only searches the geojson containing cities, but each marker is a circleMarker where the color is styled according to whether the city has a website for their GIS dept or section.
- Test demo [here](http://maptimela.github.io/Project-Pizza)

1.23.2015
=========
- Updated files to reflect current demo [here](http://maptimela.github.io/Project-Pizza)

2.05.2015
=========
- Add [Tabletop.js](https://github.com/jsoma/tabletop) to connect Google Spreadsheet to page.
