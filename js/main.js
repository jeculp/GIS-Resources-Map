$(document).ready(function() {

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
                data[i].id = data[i].display_name.replace(/\s+/g, '');
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
            listItem.id = array[i].id;
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
        $(".list-item").click(function (e) {
            e.preventDefault();

            if ($(this).children("div").hasClass("visible-item")) {
                $(this).children("div").removeClass("visible-item");
            } else {
                // hide all
                $(".visible-list li div").removeClass("visible-item");
                // but show this one
                $(this).children("div").addClass("visible-item");

                //Matches list id to markermap array
                var markerId = $(this).attr( 'id' );
                console.log(markerId);
                var marker = markerMap[markerId];

                if (marker && marker.getLatLng()) {
                    marker.openPopup(marker.getLatLng()); //Opens popup
                    map.setView(marker.getLatLng(),10); //Zooms to and centers map
                }
            }
        });

    }



        // expand list items
var searchclick = $(".list-item").click(function () {

            if ($(this).children("div").hasClass("visible-item")) {
                $(this).children("div").removeClass("visible-item");
            } else {
                // hide all
                $(".visible-list li div").removeClass("visible-item");
                // but show this one
                $(this).children("div").addClass("visible-item");

                //Matches list id to markermap array
                var markerId = $(this).attr( 'id' );
                console.log(markerId);
                var marker = markerMap[markerId];

                marker.openPopup(marker.getLatLng()); //Opens popup
                map.setView(marker.getLatLng(),10); //Zooms to and centers map
                e.preventDefault()
            }
        });



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
                        var title = ALL_CONTACTS[i].title;
                        var agency_department = ALL_CONTACTS[i].agency_department;
                        var email = ALL_CONTACTS[i].email;
                        var phone = ALL_CONTACTS[i].phone;
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
                    color: '#bb4c3c',
                    weight: 0.0,
                    fillColor: getcitycolor(feature.properties["GIS Page"]), //this passes an attribute from the json file to a function to return a specified color
                    fillOpacity: .7
                }).bindPopup("<b>City:</b> " + feature.properties.NAMELSAD + "<br> " +
                    "<b>Name:</b> " + firstname + " " + lastname + "<br> " +
                    "<b>Title:</b> " + title + "<br> " +
                    "<b>Agency:</b> " + agency_department + "<br> " +
                    "<b>email:</b> " + email + "<br> " +
                    "<b>Phone:</b> " + phone + "<br> " +
                    gisPage);
                markerMap[feature.properties.NAMELSAD] = marker;
                return marker;
            }
        }).addTo(markerlayer);
    }

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

            if(query.length === 0) {
              // do nothing here
            } else {
                for(var i=0; i<ALL_CONTACTS.length; i++) {
                    check = ALL_CONTACTS[i];

                    if(check && check.display_name){
                        check_name = check.display_name;

                        if (check_name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                            checkListItemID = check_name.replace(/\s+/g, '');
                            $('#' + checkListItemID).removeClass('hidden');
                        }
                    }
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
        $('.list-item').removeClass('hidden');
        $('nav li').removeClass('active');
        $('#results .none').addClass('hide');
        $('#results-list').empty();
    }

});
