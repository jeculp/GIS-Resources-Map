$(document).ready(function() {
    $( '.reloadhome' ).click(function() {
        location.reload();
    });
    
    console.log("88b           d88                                   88                                  88                  db         ");
    console.log("888b         d888                            ,d     ``                                  88                 d88b        ");
    console.log("88`8b       d8`88                            88                                         88                d8``8b       ");
    console.log("88 `8b     d8` 88  ,adPPYYba,  8b,dPPYba,  MM88MMM  88  88,dPYba,,adPYba,    ,adPPYba,  88               d8`  `8b      ");
    console.log("88  `8b   d8`  88  ``     `Y8  88P`    `8a   88     88  88P`   `88`    `8a  a8P_____88  88              d8YaaaaY8b     ");
    console.log("88   `8b d8`   88  ,adPPPPP88  88       d8   88     88  88      88      88  8PP```````  88             d8````````8b    ");
    console.log("88    `888`    88  88,    ,88  88b,   ,a8`   88,    88  88      88      88  `8b,   ,aa  88            d8`        `8b   ");
    console.log("88     `8`     88  ``8bbdP`Y8  88`YbbdP``    `Y888  88  88      88      88   ``Ybbd8``  88888888888  d8`          `8b  ");
    console.log("                               88                                                                                      ");
    console.log("                               88                                                                                      ");

    // global
    var ALL_CONTACTS = window.ALL_CONTACTS = [];
    var markerMap = {}; //Creates marker array to match with list ids
    var map = L.map('map').setView([36.745487, -119.553223], 6);
        map.options.minZoom = 6;

    function init() {
        $.ajax({
            type: "GET",
            url: "data/gis_contacts.csv",
            dataType: "text",
            success: function(data) {
                processData(data);
                createSearchHandler();
                setNavbarHandlers();
                setListItemHandlers();
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
            if (data[i] && data[i].display_name) {
                data[i].id = normalizeString(data[i].display_name);
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
    } // parseData()

    // Appends the items to the list
    function addChild(array,list) {

        for (var i = 0; i < array.length; i++){
            var listItem = document.createElement('li');
            var textnode = document.createElement('span');
            listItem.id = array[i].id;
            textnode.innerHTML = array[i].display_name
            listItem.appendChild(textnode);
            listItem.className = 'list-item';

            var name = (array[i].first_name.length > 0 && array[i].last_name.length > 0) ? '<p>Contact: ' + array[i].first_name + ' ' + array[i].last_name + '</p>' : '';
            var title = (array[i].title.length > 0) ? '<p>' + array[i].title + '</p>' : '';
            var dept = "";
            // var dept = (array[i].agency_department.length > 0) ? '<p>' + array[i].agency_department + '</p>' : '';
            var email = (array[i].email.length > 0) ? '<p><a href="mailto:' + array[i].email + '">' + array[i].email + '</a></p>' : '';
            var homepage = (array[i].homepage != undefined && array[i].homepage.length > 0) ? '<p><a target="_blank" href="' + array[i].homepage + '">Homepage</a></p>' : '';
            var gis = (array[i].gis_page != undefined && array[i].gis_page.length > 0) ? '<p><a target="_blank" href="' + array[i].gis_page + '">GIS page</a></p>' : '';
            var data = (array[i].data_page != undefined && array[i].data_page.length > 0) ? '<p><a target="_blank" href="' + array[i].data_page + '">Data page</a></p>' : '';
            var addcontact = (array[i].first_name.length == 0) ? '<p>This information out of date? <a href="https://docs.google.com/forms/d/1D_6IMIDp3e6xzMrgH06rnLaNkm-jgEwVOQ8Ro2y4AkY/viewform" target="_blank">Update here.</a></p>' : '<p>This information out of date? <a href="https://docs.google.com/forms/d/1D_6IMIDp3e6xzMrgH06rnLaNkm-jgEwVOQ8Ro2y4AkY/viewform" target="_blank">Update here.</a></p>';
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
            var totalData = div.innerHTML;
            div.className = 'item-info';
            if (totalData == '<p>This information out of date? <a href="https://docs.google.com/forms/d/1D_6IMIDp3e6xzMrgH06rnLaNkm-jgEwVOQ8Ro2y4AkY/viewform" target="_blank">Update here.</a></p>') {
                listItem.setAttribute("data-info", "no-data");
            } else {
                listItem.setAttribute("data-info", "has-data");
            }
            listItem.appendChild(div);
            document.getElementById(list).appendChild(listItem);
        }

    } // addChild()

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
        return d == 'null' ? '0' :
            '.7';
    }

    function mapInit(){
        //This loads the map

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



        var markerlayer = L.layerGroup().addTo(map);

        //Adds a layer with Incorporated Cities onto map, styling performed within
        var citysim = new L.geoJson.ajax("data/cities.geojson", {
            pointToLayer: function(feature, latlng) {

                for (var i=0; i<ALL_CONTACTS.length;i++){

                    if(ALL_CONTACTS[i].display_name == feature.properties["NAMELSAD"]){
                        var firstname = ALL_CONTACTS[i].first_name;
                        var lastname = ALL_CONTACTS[i].last_name;
                        var fullname = "<b>Name:</b> " + firstname + " " + lastname + "<br>";
                        var title = "<b>Title:</b> " + ALL_CONTACTS[i].title  + "<br>";
                        var agency_department = "<b>Agency:</b> " + ALL_CONTACTS[i].agency_department + "<br>";
                        var email = "<b>email:</b> " + ALL_CONTACTS[i].email + "<br>";
                        var phone = "<b>Phone:</b> " + ALL_CONTACTS[i].phone + "<br>";
                        var gisPage  = ALL_CONTACTS[i].gis_page;

                        if (gisPage == ""){
                            gisPage = "<b>GIS Page:</b> No GIS page available";
                        }else{
                            gisPage = "<b>GIS Page:</b> " + '<a target="_blank" href="' + gisPage + '">Link</a>';
                        }
                    }
                }


                var marker = new L.circleMarker(latlng, {
                    radius: 3,
                    weight: 0.0,
                    fillColor: '#47a3da',
                    fillOpacity: getcitycolor(feature.properties["GIS Page"]) //checks to see if data has webpage, returns nofill if no data
                }).bindPopup("<b>City:</b> " + feature.properties.NAMELSAD + "<br> " +
                    fullname +
                    title +
                    agency_department +
                    email +
                    phone +
                    gisPage + 
                    '<br>This information out of date?<br><a href="https://docs.google.com/forms/d/1D_6IMIDp3e6xzMrgH06rnLaNkm-jgEwVOQ8Ro2y4AkY/viewform" target="_blank">Update here.</a>');
                markerMap[normalizeString(feature.properties.NAMELSAD)] = marker;
                return marker;
            }
        }).addTo(markerlayer);
        }

    //function to change radius on zoom
    function changeRadius(rad) {
        $.each(markerMap, function (key, value){value.setRadius(rad/1.5)}); //takes current zoom and divides by number to return radius size
      }

    map.on('zoomend', function() {
    var currentZoom = map.getZoom();
    changeRadius(currentZoom);
    });


    function createSearchHandler() {
        $( "form.search" ).submit(function( event ) {
            event.preventDefault();

            var query = $('#list-search').val();
            var check, check_name;
            var results = [];
            var listItem, textnode;
            var checkListItemID;

            // clear sidebar
            resetAllSections();
            $('.group-list').addClass("visible-item");
            $('.list-item').addClass('hidden');

            // hide all the cateogry heads
            $("#federal-title").css("display","none");
            $("#state-title").css("display","none");
            $("#county-title").css("display","none");
            $("#city-title").css("display","none");
            $("#other-title").css("display","none");

            // hide no results
            $('#results .none').addClass('hide');

            // Arrays to show certain groups of categories
            var feds = [],
                states = [],
                counties = [],
                cities = [],
                usrgroups = [];

            if(query.length === 0) {
               } else {
                for(var i=0; i<ALL_CONTACTS.length; i++) {
                    check = ALL_CONTACTS[i];
                    if(check && check.display_name){
                        check_name = check.display_name;

                        if (normalizeString(check_name).indexOf(normalizeString(query)) > -1) {
                            checkListItemID = normalizeString(check_name);
                            // put it into the right array
                            if (check.type === "Federal") {
                                feds.push(checkListItemID);
                            } else if (check.type === "State") {
                                states.push(checkListItemID);
                            } else if (check.type === "County") {
                                counties.push(checkListItemID);
                            } else if (check.type === "City") {
                                cities.push(checkListItemID);
                            } else if (check.type === "Other") {
                                usrgroups.push(checkListItemID);
                            }
                        }
                    }
                }

                // loop through the groups of items, adding header if large enough
                // federal
                if (feds.length > 0) { 
                    $("#federal-title").css("display","block");
                    for (var i = 0; i < feds.length; i++) {
                        $("#"+feds[i]).removeClass('hidden');
                    }
                }
                // states
                if (states.length > 0) {
                    $("#state-title").css("display","block");
                    for (var i = 0; i < states.length; i++) {
                        $("#"+states[i]).removeClass('hidden');
                    }
                }
                // counties
                if (counties.length > 0) {
                    $("#county-title").css("display","block");
                    for (var i = 0; i < counties.length; i++) {
                        $("#"+counties[i]).removeClass('hidden');
                    }
                }
                // cities
                if (cities.length > 0) {
                    $("#city-title").css("display","block");
                    for (var i = 0; i < cities.length; i++) {
                        $("#"+cities[i]).removeClass('hidden');
                    }
                }
                // other
                if (usrgroups.length > 0) {
                    $("#other-title").css("display","block");
                    for (var i = 0; i < usrgroups.length; i++) {
                        $("#"+usrgroups[i]).removeClass('hidden');
                    }
                }
                // if all arrays 0, show "no results"
                if (feds.length === 0 && states.length === 0 && counties.length === 0 && cities.length === 0 && usrgroups.length === 0) {
                    $('#results .none').removeClass('hide');
                }
            }
        });
    }

    function normalizeString(inputString) {
        // lowercase & remove non-alphanumeric characters
        return inputString.toLowerCase().replace(/\W/g, '');
    }

    function setListItemHandlers() {
        $(".list-item").click(function (e) {

            if ($(e.target).is('a')) {
                return;
            }

            e.preventDefault();
            $(".item-info").removeClass("visible-item");
            $(this).children("div").addClass("visible-item");

            var $listItem = $(this);
            var $theList = $('#big-list');

            var itemHeight = $listItem.height();
            var itemTopOffset = $listItem.offset().top;
            var listHeight = $theList[0].scrollHeight; // includes overflow
            var listVisibleHeight = $theList.height(); // visible area only, excludes the hidden overflow

            // make listItem visible if it is hidden at the bottom of the #big-list
            if ( itemTopOffset > listVisibleHeight ) {
                $theList.scrollTop(listHeight - itemHeight);
            }

            //Matches list id to markermap array
            var markerId = $listItem.attr( 'id' );
            var marker = markerMap[markerId];

            if (marker && marker.getLatLng()) {
                marker.openPopup(marker.getLatLng()); //Opens popup
                map.setView(marker.getLatLng(),10); //Zooms to and centers map
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
        $('.list-item').removeClass('hidden');
        $('nav li').removeClass('active');
        $('#results-list').empty();
        $(".item-info").removeClass("visible-item");
        $('#big-list').scrollTop(0);
        $(".list-title").css("display","none");
    }

});


