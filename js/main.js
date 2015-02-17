$(document).ready(function() {
    console.log('document ready');

    // data with tabletop
    window.onload = function() {
        console.log('window onload');
        init()


    };
    var public_spreadsheet_url = 'https://docs.google.com/spreadsheet/pub?key=0AgDW4THnpFhkdExhY1hmeXpGc25CYXlOenRGVzZ6YUE&output=html';

    function init() {
        
        /*
        Tabletop.init({
            key: public_spreadsheet_url,
            callback: function(data, tabletop) {
                console.log("spreadsheet loaded");
                // console.log(data)
                parseData(data);




            },
            simpleSheet: true
        }); */
        $.ajax({
            type: "GET",
            url: "/data/gis_contacts.csv",
            dataType: "text",
            success: function(data) {processData(data);}
         });


    }


    function processData(data){

        console.log(data);
    }

    function parseData(data) {
        // log length of data
        console.log(data.length);   
             
        var federalArray = [];
        var stateArray = [];
        var countyArray = [];
        var cityArray = [];
        var otherArray = [];

        // loop through and append any federal agencies to federal list
        for (var i = 0; i < data.length; i++) {
            // federal
            if (data[i].type === "Federal") { 
                federalArray.push(data[i]);                
            } else if (data[i].type === "State") {
                stateArray.push(data[i]);
            } else if (data[i].type === "County") {
                countyArray.push(data[i]);
            } else if (data[i].type === "City") {
                cityArray.push(data[i]);
            } else if (data[i].type === "Other") {
                otherArray.push(data[i]);
            }
        }

        //alphabetize arrays & send to addChild function        
        sortArray(federalArray);
        sortArray(stateArray);
        sortArray(countyArray);
        sortArray(cityArray);
        sortArray(otherArray);
        
        addChild(federalArray,"federal-list");
        addChild(stateArray,"state-list");
        addChild(countyArray,"county-list");
        addChild(cityArray,"city-list");
        addChild(otherArray,"other-list");


        function sortArray(item){
            return item.sort(function(a,b){
                var nameA=a.displayname.toLowerCase(), nameB=b.displayname.toLowerCase();
                if (nameA < nameB){
                    return -1;
                }else if(nameA > nameB){
                    return 1;
                }else{
                    return 0;
                }
            });
        } // sortArray()

        // Appends the items to the list
        function addChild(array,list) {

            for (var i = 0; i < array.length; i++){
                var listItem = document.createElement('li');
                var textnode = document.createTextNode(array[i].displayname);
                listItem.appendChild(textnode);

                var name = (array[i].firstname.length > 0 && array[i].lastname.length > 0) ? '<p>Contact: ' + array[i].firstname + ' ' + array[i].lastname + '</p>' : '';
                var title = (array[i].title.length > 0) ? '<p>' + array[i].title + '</p>' : '';
                var dept = (array[i].agencydepartment.length > 0) ? '<p>' + array[i].agencydepartment + '</p>' : '';
                var email = (array[i].email.length > 0) ? '<p><a href="mailto:' + array[i].email + '">' + array[i].email + '</a></p>' : '';
                var homepage = (array[i].homepage.length > 0) ? '<p><a href="' + array[i].homepage + '">Homepage</a></p>' : '';
                var gis = (array[i].gispage.length > 0) ? '<p><a href="' + array[i].gispage + '">GIS page</a></p>' : '';
                var data = (array[i].datapage.length > 0) ? '<p><a href="' + array[i].datapage + '">Data page</a></p>' : '';
                // create the more info box
                var div = document.createElement('div');
                div.innerHTML = name +
                                title +
                                dept +
                                email +
                                homepage +
                                gis +
                                data;
                div.className = 'item-info';
                listItem.appendChild(div);
                document.getElementById(list).appendChild(listItem);
            }       
        } // addChild()

        // expand list items
        $(".visible-list li").click(function () {

            if ($(this).children("div").hasClass("visible-item")) {
                $(this).children("div").removeClass("visible-item");
            } else {
                // hide all 
                $(".visible-list li div").removeClass("visible-item");
                // but show this one
                $(this).children("div").addClass("visible-item");
            }
        });


    } // parseData()

  // map

    //This Controls the hover over feature functions
    function style(feature) {
        return {
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7,
            fillColor: '#47a3da'
        };
    }

    //Test Function for adding layer at fitBounds
    function zoomloadlayer() {
        map.addLayer(citysim);
    }

    //This loads the map
    var map = L.map('map')
        .setView([36.745487, -119.553223], 6);
    map.options.minZoom = 6;
    var stamenLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
    }).addTo(map).setOpacity(.75);

    var countylines = {
        "clickable": true,
        "color": "#47a3da",
        "fill": false,
        "dashArray": '3',
        "weight": .5,
        "opacity": 1,
        "fillOpacity": 0.2
    };

    var countysim = new L.geoJson.ajax("data/countysimple.geojson", {
        style: countylines,
    }).addTo(map);

    //Gets and returns colors for Cities that have a web page link in geojson file
    function getcitycolor(d) {
        var d = String(d);
        return d == 'null' ? '#C26263' :
            '#47a3da';
    }

    //Adds a layer with Incorporated Cities onto map, styling performed within
    var citysim = new L.geoJson.ajax("data/cities.geojson", {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 3,
                color: '#bb4c3c',
                weight: 0.0,
                fillColor: getcitycolor(feature.properties["GIS Page"]), //this passes an attribute from the json file to a function to return a specified color
                fillOpacity: .7
            }).bindPopup("<b>City:</b> " + feature.properties.name + "<br> " +
                "<b>Name:</b> " + feature.properties["First Name"] + " " + feature.properties["Last Name"] + "<br> " +
                "<b>Title:</b> " + feature.properties["Title"] + "<br> " +
                "<b>Agency:</b> " + feature.properties["Agency"] + "<br> " +
                "<b>email:</b> " + feature.properties["e-mail"] + "<br> " +
                "<b>Phone:</b> " + feature.properties["Phone"] + "<br> " +
                "<b>GIS Page:</b> " + '<a href="' + feature.properties["GIS Page"] + '">Link</a>');
        }
    }).addTo(map);

    console.log(citysim);

    map.addControl(new L.Control.Search({
        layer: citysim,
        propertyName: 'name',
        zoom: 11
    })); // This creates a control to search within the geojson

    var info = L.control();

    info.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function(props) {
        this._div.innerHTML = '<h4>Legend</h4><i style="background:#bb4c3c"></i><h4>City has no website</h4><i style="background:#47a3da"></i><h4>City has website</h4><br><h4>Click on topleft to search for a city!</h4>';
    };

    info.addTo(map);

    // expand lists
    $(".list-title").click(function () {
        // gets bit group from id
        var group = $(this).attr("id").substring(0,$(this).attr("id").indexOf("-"));
        // check if it already has visible class
        if ($("#"+group+"-list").hasClass("visible-list")) {
            $("#"+group+"-list").removeClass("visible-list")
        } else {
            // remove visible class from all
            $(".group-list").removeClass("visible-list");
            // add the class to the selected one
            $("#"+group+"-list").addClass("visible-list");
        }
    });




});