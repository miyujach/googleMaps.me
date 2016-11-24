(function ($) {
    /*
        var tab_localisation = [
             {
                 desc: "Toulouse",
                 lat: 43.6007,
                 lng: 1.432841
                 icon : "icon.png"
             },
             {
                 desc: "Paris",
                 lat: 48.858859,
                 lng: 2.347557,
                 icon : "icon.png"
             },
        ];

        google_Map("AIzaSyDkQdWdHJofyWARkL_UrGZbDsnirQTrw3s", "map", callback, {});
        function callback(gMap) {
            gMap.setMarkers(tab_localisation);
            console.debug(gMap);
        }  
        
    */
    "use strict";
    window.FastestWayGoogleMaps = function (apiKey, target, callback, options) {
        target = $(target)[0];

        var gMap = {
            map: {}, // Objet Google Maps
            infoWindows: {},
            markers: [],

            /**
             {
                lag: [float],
                lng: [float],
                mapTypeControl: [boolean],
                scrollwheel: [boolean],
                styles : [array], -- https://snazzymaps.com/
                zoom: [int],
             }
             */
            options: typeof options !== "undefined" ? options : {},


            //Ajouts des marqueurs à la carte
            setMarkers: function (locations, globalIcon) {
                var marker,
                    i,
                    options = {};


                for (i = 0; i < locations.length; i++) {
                    options = {
                        position: new google.maps.LatLng(locations[i].lat, locations[i].lng),
                        map: gMap.map
                    };

                    // Si l'icône globale est définie
                    if (typeof globalIcon !== "undefined") {
                        // Si un marqueur possède un icone, celui-ci est prioritaire
                        // sinon, c'est le marqueur global personnalisé qui est utilisé
                        options.icon = typeof locations[i].icon !== "undefined" ? locations[i].icon : globalIcon;
                    } else if (typeof locations[i].icon !== "undefined") {
                        // Sinon je vérifie que le marqueur ne possède pas un icone personnalisée
                        options.icon = locations[i].icon;
                    }

                    marker = new google.maps.Marker(options);

                    google.maps.event.addListener(marker, 'click', (function (marker, i) {
                        return function () {
                            gMap.infoWindows.setContent(locations[i].desc);
                            gMap.infoWindows.open(gMap.map, marker);
                        };
                    })(marker, i));
                    gMap.markers.push(marker);
                }
            },


            //Suppression des marqueurs de la carte
            removeMarkers: function () {
                for (var i = 0; i <= gMap.markers.length-1; i++) {
                    gMap.markers[i].setMap(null);
                }
            },


            //Recentrage de la carte
            setCenter: function(lat, lng){
                options.lat = lat;
                options.lng = lng;
                gMap.map.setCenter({lat: lat, lng: lng});
            },


            //Zoom sur la carte
            setZoom: function(zoom){
                options.zoom = zoom;
                gMap.map.setZoom(zoom);
            },


            //Création d'un itinéraire
            direction: function(start, destination, options){

                var direction = {
                    origin: start,
                    destination: destination,
                },
                    optionsFiltered = {},
                    defaultOptions = {};

                if( typeof options === "undefined" ){
                    defaultOptions = {
                        travelMode: google.maps.TravelMode.DRIVING,
                    };
                    options = defaultOptions;
                }else{
                    if(typeof options.travelMode === "undefined"){
                        defaultOptions = {
                            travelMode: google.maps.TravelMode.DRIVING
                        };
                        options = $.extend({}, defaultOptions, options);
                    }
                }

                console.log("options.provideRouteAlternatives :" + options.provideRouteAlternatives);


                //Si l'utilisateur choisi d'activer l'animation du trajet

                if(typeof options !== "undefined"){
                    if(options.hasOwnProperty('animateRoute')){
                        Object.keys(options).forEach(function(key, index) {
                            // key: the name of the object key
                            //console.debug("output : " + key+":"+options[key]+" -- ");
                            if(key !== "animateRoute" && key !== "fastestRoute" && key !== "shortestRoute"){
                                optionsFiltered[key] = options[key];

//                                if(typeof optionsFiltered !== "undefined"){
//                                    Object.keys(optionsFiltered).forEach(function(key, index) {
//                                         key: the name of the object key
//                                        console.debug("output optionsFiltered : " + key+":"+optionsFiltered[key]+" -- ");
//                                    });
//                                }
                            }
                        });

                        var settings = $.extend({}, direction, optionsFiltered);
                    }else{
                        var settings = $.extend({}, direction, options);
                    }
                }





                var directionsService = new google.maps.DirectionsService();

                directionsService.route(settings, function(result, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        if(typeof options !== "undefined" && typeof options.animateRoute !== "undefined"){
                            
                            var route_index = getIndexRoute(result);
                            setAnimatedRoute(result.routes[route_index].overview_path);
                                                        
                        }else{
                            setStaticRoute(result);
                        }
                    }

                    function getIndexRoute(result){
                        
                        var fastest = Number.MAX_VALUE,
                        fastest_index = Number.MAX_VALUE,
                        shortest = Number.MAX_VALUE,
                        shortest_index = Number.MAX_VALUE,
                        routesResponses = [];

                        
                        if (status === google.maps.DirectionsStatus.OK) {
                            routesResponses.push(result);
                        }
                        else {
                            window.alert('la requete "Direction a échoué : ' + status);
                        }
                        
                        routesResponses.forEach(function(res) {
                            res.routes.forEach(function(rou, index) {
                                console.log("distance of route " +index+": " , rou.legs[0].distance.value  * 0.001);
                                console.log("duration of route " +index+": " , rou.legs[0].duration.value / 3600);
                                if (rou.legs[0].distance.value < shortest){
                                    shortest = rou.legs[0].distance.value * 0.001;
                                    shortest_index = index;
                                }
                                if (rou.legs[0].duration.value < fastest){
                                    fastest = rou.legs[0].duration.value / 3600;
                                    fastest_index = index;
                                }

                            })
                        });
//                        console.log("shortest: ", shortest);
//                        console.log("fastest: ", fastest);


                        var index_route = null;
                        if(typeof options.fastestRoute !== "undefined" && typeof options.shortestRoute !== "undefined"){
                            if(options.fastestRoute === true) index_route = fastest_index;
                        }else if(typeof options.fastestRoute !== "undefined"){
                            if(options.fastestRoute === true) index_route = fastest_index;
                        }else if(typeof options.shortestRoute !== "undefined"){
                            if(options.shortestRoute === true) index_route = shortest_index;
                        }else{
                            index_route = shortest_index;
                        }
                        
                        
                        if(index_route === null){
                            index_route = shortest_index;
                        }
                        
                        return index_route;
                    }
                    
                    
                    function setStaticRoute(result){
                        directionsDisplay = new google.maps.DirectionsRenderer({
                            map: gMap.map,
                            directions: result,
                            routeIndex: getIndexRoute(result)
                        });
                    }
                    
                    

                    /*https://duncan99.wordpress.com/2015/01/22/animated-paths-with-google-maps/*/
                    function setAnimatedRoute(pathCoords) {
                        if(typeof options.animateRoute !== "undefined"){
                            var route = new google.maps.Polyline({
                                path: [],
                                geodesic : typeof options.animateRoute[0].geodesic !== "undefined" ? options.animateRoute[0].geodesic : true,
                                strokeColor: typeof options.animateRoute[0].strokeColor !== "undefined" ? options.animateRoute[0].strokeColor : '#0080ff',
                                strokeOpacity: typeof options.animateRoute[0].strokeOpacity !== "undefined" ? options.animateRoute[0].strokeOpacity : 0.5,
                                strokeWeight: typeof options.animateRoute[0].strokeWeight !== "undefined" ? options.animateRoute[0].strokeWeight : 3,
                                editable: typeof options.animateRoute[0].editable !== "undefined" ? options.animateRoute[0].editable : false,
                                map: gMap.map
                            });

                            var marker = new google.maps.Marker({map:gMap.map, icon: typeof options.animateRoute[0].icon !== "undefined" ? options.animateRoute[0].icon : ""});
                            var speed = typeof options.animateRoute[0].speed !== "undefined" ? options.animateRoute[0].speed : 1;


                            for (var i = 0; i < pathCoords.length; i++) {      
                                setTimeout(function(coords) {
                                    console.log("coords : "+coords)
                                    route.getPath().push(coords);

                                    marker.setPosition(coords);
                                    if(options.animateRoute[0].followMarker){
                                        gMap.map.panTo(coords);
                                    }
                                }, 100/speed * i, pathCoords[i]);
                            }
                        }
                    }
                });
            },
        };



        /**
         * Script d'initialisation
         */
        $.getScript( 'https://maps.googleapis.com/maps/api/js?key='+apiKey )
            .done(function( script, textStatus ) {
            console.log( textStatus );

            var settings = null,
                center = {},
                defaultOptions = {
                center: {lat:46.1860349, lng:2.6918861},
                zoom: 6,
                scrollwheel: true,
                mapTypeControl: false,
                travelMode: "walking",
                mapTypeId: "roadmap",
                styles : [],
            };
            

            if(typeof options !== "undefined"){
                settings = $.extend({}, defaultOptions, options);
                
                if(typeof gMap.options.lat !== "undefined") {center.lat = options.lat;}
                if(typeof gMap.options.lng !== "undefined") {center.lng = options.lng;}
            }else{
                settings = defaultOptions;
            }

            
//            if(typeof settings !== "undefined"){
//                Object.keys(settings).forEach(function(key, index) {
//                    console.debug("output : " + key+":"+settings[key]+" -- ");
//                });
//            }

            gMap.map = new google.maps.Map(target, settings);                

            gMap.infoWindows = new google.maps.InfoWindow();

            // Appelle le callback du index.html
            callback(gMap);

        })
            .fail(function( jqxhr, settings, exception ) {
            console.log( "Triggered ajaxError handler." );
        });


        /**
         * Méthodes 
         */

    };
}(jQuery));