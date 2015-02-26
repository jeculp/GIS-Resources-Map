$(document).ready(function() {

    // global
    var ALL_CONTACTS = window.ALL_CONTACTS = [];

    function init() {
        $.ajax({
            type: "GET",
            url: "data/gis_contacts.csv",
            dataType: "text",
            success: function(data) {
                processData(data);
                createSearchHandler();
                setNavbarHandlers();
                mapInit();
            }
         });
    }

    init();

    function processData(data){

        var csvData = Papa.parse(data, {
            header: true
        });

        ALL_CONTACTS = csvData.data;
        parseData(csvData.data);
    }

    function parseData(data) {

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
                var nameA=a.display_name.toLowerCase(), nameB=b.display_name.toLowerCase();
                if (nameA < nameB){
                    return -1;
                }else if(nameA > nameB){
                    return 1;
                }else{
                    return 0;
                }
            });
        } // sortArray()


        ready();

    } // parseData()

    // Appends the items to the list
    function addChild(array,list) {

        for (var i = 0; i < array.length; i++){
            var listItem = document.createElement('li');
            var textnode = document.createTextNode(array[i].display_name);
            listItem.id = array[i].display_name; //Add id to li
            listItem.appendChild(textnode);
            listItem.className = 'list-item';

            var name = (array[i].first_name.length > 0 && array[i].last_name.length > 0) ? '<p>Contact: ' + array[i].firstname + ' ' + array[i].lastname + '</p>' : '';
            var title = (array[i].title.length > 0) ? '<p>' + array[i].title + '</p>' : '';
            var dept = "";
            // var dept = (array[i].agency_department.length > 0) ? '<p>' + array[i].agency_department + '</p>' : '';
            var email = (array[i].email.length > 0) ? '<p><a href="mailto:' + array[i].email + '">' + array[i].email + '</a></p>' : '';
            var homepage = (array[i].homepage != undefined && array[i].homepage.length > 0) ? '<p><a target="_blank" href="' + array[i].homepage + '">Homepage</a></p>' : '';
            var gis = (array[i].gis_page != undefined && array[i].gis_page.length > 0) ? '<p><a target="_blank" href="' + array[i].gis_page + '">GIS page</a></p>' : '';
            var data = (array[i].data_page != undefined && array[i].data_page.length > 0) ? '<p><a target="_blank" href="' + array[i].data_page + '">Data page</a></p>' : '';
            var addcontact = (array[i].first_name.length == 0) ? '<p>This information out of date? Click here!</p>' : '';
            // create the more info box
            var div = document.createElement('div');
            div.innerHTML = name +
                            title +
                            dept +
                            email +
                            homepage +
                            gis +
                            data +
                            addcontact;
            div.className = 'item-info';
            listItem.appendChild(div);
            document.getElementById(list).appendChild(listItem);
        }

    } // addChild()

    function ready() {
        // expand list items
        $(".list-item").click(function () {

            if ($(this).children("div").hasClass("visible-item")) {
                $(this).children("div").removeClass("visible-item");
            } else {
                // hide all
                $(".visible-list li div").removeClass("visible-item");
                // but show this one
                $(this).children("div").addClass("visible-item");
                
                //Matches list id to markermap array
                var markerId = $(this).attr( 'id' );
                var marker = markerMap[markerId];

                marker.openPopup(marker.getLatLng()); //Opens popup
                map.setView(marker.getLatLng(),10); //Zooms to and centers map 
                e.preventDefault()
            }
        });

    }



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

        //Gets and returns colors for Cities that have a web page link in geojson file
    function getcitycolor(d) {
        var d = String(d);
        return d == 'null' ? '#C26263' :
            '#47a3da';
    }
    
    function mapInit(){
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

        var markerMap = {}; //Creates marker array to match with list ids
        
        var markerlayer = L.layerGroup().addTo(map);
        
        //Adds a layer with Incorporated Cities onto map, styling performed within
        var citysim = new L.geoJson.ajax("data/cities.geojson", {
            pointToLayer: function(feature, latlng) {         
                
                for (var i=0; i<ALL_CONTACTS.length;i++){

                    if(ALL_CONTACTS[i].display_name == feature.properties["NAMELSAD"]){                        
                        var firstname = ALL_CONTACTS[i].first_name;
                        var lastname = ALL_CONTACTS[i].last_name;
                        var agency_department = ALL_CONTACTS[i].agency_department;
                        var email = ALL_CONTACTS[i].email;
                        var phone = ALL_CONTACTS[i].phone;
                        var gisPage  = ALL_CONTACTS[i].gis_page;
                    }
                }

                var marker = new L.circleMarker(latlng, {
                    radius: 3,
                    color: '#bb4c3c',
                    weight: 0.0,
                    fillColor: getcitycolor(feature.properties["GIS Page"]), //this passes an attribute from the json file to a function to return a specified color
                    fillOpacity: .7
                }).bindPopup("<b>City:</b> " + feature.properties.NAMELSAD + "<br> " +
                    "<b>Name:</b> " + firstname + " " + feature.properties["Last Name"] + "<br> " +
                    "<b>Title:</b> " + lastname + "<br> " +
                    "<b>Agency:</b> " + agency_department + "<br> " +
                    "<b>email:</b> " + email + "<br> " +
                    "<b>Phone:</b> " + phone + "<br> " +
                    "<b>GIS Page:</b> " + '<a target="_blank" href="' + gisPage + '">Link</a>');
                markerMap[feature.properties.NAMELSAD] = marker;
                return marker;
            }
        }).addTo(markerlayer);    
        
        var info = L.control();

        info.onAdd = function(map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        };

        // method that we will use to update the control based on feature properties passed
        info.update = function(props) {
            this._div.innerHTML = '<h4>Legend</h4><i style="background:#bb4c3c"></i><h4>City has no website</h4><i style="background:#47a3da"></i><h4>City has website</h4>';
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

    }

    function createSearchHandler() {
        $( "form.search" ).submit(function( event ) {
          event.preventDefault();

          var query = $('#list-search').val();
          var check, check_name;
          var results = [];
          var listItem, textnode;

          if(query.length === 0) {
            // do nothing here
          } else {
            for(var i=0; i<ALL_CONTACTS.length; i++) {
                check = ALL_CONTACTS[i];

                if(check && check.display_name){
                    check_name = check.display_name;

                    if (check_name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                        results.push(ALL_CONTACTS[i]);
                    }
                }
            }
          }

          // clear sidebar
          resetAllSections();

          if(results.length === 0) {
            $('#results .none').removeClass('hide');
          } else {

            for(var i=0; i<results.length; i++) {
                listItem = document.createElement('li');
                textnode = document.createTextNode(results[i].display_name);
                listItem.appendChild(textnode);
                listItem.className = 'list-item';
                document.getElementById('results-list').appendChild(listItem);
            }
          }

        });
    }

    function setNavbarHandlers() {
        $('nav li.federal').on('click', function(e){
            e.preventDefault();
            resetAllSections();
            $('#federal-title.list-title').addClass('active');
            $('#federal-list.group-list').addClass("visible-item");
            $('nav li.federal').addClass('active');
        });

        $('nav li.state').on('click', function(e){
            e.preventDefault();
            resetAllSections();
            $('#state-title.list-title').addClass('active');
            $('#state-list.group-list').addClass("visible-item");
            $('nav li.state').addClass('active');
        });

        $('nav li.county').on('click', function(e){
            e.preventDefault();
            resetAllSections();
            $('#county-title.list-title').addClass('active');
            $('#county-list.group-list').addClass("visible-item");
            $('nav li.county').addClass('active');
        });

        $('nav li.city').on('click', function(e){
            e.preventDefault();
            resetAllSections();
            $('#city-title.list-title').addClass('active');
            $('#city-list.group-list').addClass("visible-item");
            $('nav li.city').addClass('active');
        });

        $('nav li.other').on('click', function(e){
            e.preventDefault();
            resetAllSections();
            $('#other-title.list-title').addClass('active');
            $('#other-list.group-list').addClass("visible-item");
            $('nav li.other').addClass('active');
        });
    }

    function resetAllSections() {
        $('.list-title').removeClass('active');
        $('.group-list').removeClass('visible-item');
        $('nav li').removeClass('active');
        $('#results .none').addClass('hide');
        $('#results-list').empty();
    }

});
