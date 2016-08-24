(function() {
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

    window.google_Map = function(apiKey, target, callback, options) {
        var target = $(target)[0];

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
            setMarkers: function(locations, globalIcon) {
                var marker,
                    i;


                for (i = 0; i < locations.length; i++) {
                    var options = {
                        position: new google.maps.LatLng(locations[i].lat, locations[i].lng),
                        map: gMap.map
                    };

                    // Si l'icône globale est définie
                    if(typeof globalIcon !== "undefined") {
                        // Si un marqueur possède un icone, celui-ci est prioritaire
                        // sinon, c'est le marqueur global personnalisé qui est utilisé
                        options.icon = typeof locations[i].icon !== "undefined" ? locations[i].icon : globalIcon;
                    } else if(typeof locations[i].icon !== "undefined") {
                        // Sinon je vérifie que le marqueur ne possède pas un icone personnalisée
                        options.icon = locations[i].icon;
                    }

                    marker = new google.maps.Marker(options);

                    google.maps.event.addListener(marker, 'click', (function(marker, i) {
                        return function() {
                            gMap.infoWindows.setContent(locations[i].desc);
                            gMap.infoWindows.open(gMap.map, marker);
                        }
                    })(marker, i));
                    gMap.markers.push(marker);
                }
            },


            //Suppression des marqueurs de la carte
            removeMarkers: function(){
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
                };
                var optionsFiltered = {};

                //Si l'utilisateur choisi d'activer l'animation du trajet

                if(typeof options !== "undefined"){
                    if(options.hasOwnProperty('animateRoute')){
                        Object.keys(options).forEach(function(key, index) {
                            // key: the name of the object key
                            //console.debug("output : " + key+":"+options[key]+" -- ");
                            if(key !== "animateRoute"){

                                optionsFiltered[key] = options[key];

                                if(typeof optionsFiltered !== "undefined"){
                                    Object.keys(optionsFiltered).forEach(function(key, index) {
                                        // key: the name of the object key
                                        //console.debug("output optionsFiltered : " + key+":"+optionsFiltered[key]+" -- ");
                                    });
                                }
                            }
                        });

                        var settings = $.extend({}, direction, optionsFiltered);
                    }else{
                        if(typeof options !== "undefined"){
                            var settings = $.extend({}, direction, options);
                        }
                    }
                }





                var directionsService = new google.maps.DirectionsService();

                directionsService.route(settings, function(result, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        if(typeof options.animateRoute !== "undefined"){
                            setAnimatedRoute(result.routes[0].overview_path);
                        }else{
                            setStaticRoute(result);
                        }
                    }

                    function setStaticRoute(result){
                        var route = Number.POSITIVE_INFINITY,
                            shortest_route = 0,
                            index_route = 0;

                        console.log(route);

                        for (var i = 0; i < result.routes.length ; i++){
                            shortest_route = result.routes[i].legs[0].distance.value * 0.001;

                            console.debug("Route : " +  result.routes[i].legs[0].distance.value * 0.001);

                            if (route > shortest_route){
                                route = shortest_route;
                                index_route = i;
                            }
                        }

                        directionsDisplay = new google.maps.DirectionsRenderer({
                            map: gMap.map,
                            direction: result,
                            routeIndex: 0
                        });

                        directionsDisplay.setDirections(result);
                        directionsDisplay.setRouteIndex(index_route);
                    }

                    /*https://duncan99.wordpress.com/2015/01/22/animated-paths-with-google-maps/*/
                    function setAnimatedRoute(pathCoords) {
                        //alert("options.animateRoute[0].strokeWeight : " + options.animateRoute.strokeWeight);

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

                            
                            
                            
                            /**
                                WORK IN PROGRESS HERE
                                Rajouter des points dans les coordonnées afin de lisser le trajet
                            **/
                            
                            for (var i = 0; i < pathCoords.length; i++) {
                                console.log("Ligne "+i+ " : " + pathCoords[i].lat());
                                
                                if(i < pathCoords.length-1){
                                    var difference_coords_lat = pathCoords[i].lat() - pathCoords[i+1].lat();
                                }
                                
                                if( difference_coords_lat < 0){
                                    difference_coords_lat = -difference_coords_lat;
                                }
                                
                                var val_test = 0.0002;
                                if(difference_coords_lat > val_test){
                                    console.debug("Alerte : Entre la ligne "+i+" et la ligne suivante : La différence ("+difference_coords_lat+") et suppérieure à " + val_test);
                                }
                                
                                var difference_lat = pathCoords[i];
                            }
                            
                            /**
                                WORK IN PROGRESS HERE
                                Rajouter des points dans les coordonnées afin de lisser le trajet
                            **/

                            
                            
                            for (var i = 0; i < pathCoords.length; i++) {      
                                setTimeout(function(coords) {
                                    route.getPath().push(coords);

                                    marker.setPosition(coords);
                                    if(options.animateRoute[0].followMarker){
                                        gMap.map.panTo(coords);
                                    }
                                }, 1000/speed * i, pathCoords[i]);
                                
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

            var center = {};  
            if(typeof gMap.options.lat !== "undefined") {
                center.lat = options.lat;
            }else{
                center.lat = 46.132274;
            }

            if(typeof gMap.options.lng !== "undefined"){
                center.lng = options.lng;
            }else{
                center.lng = 3.3904325;
            }



            var defaultOptions = {
                center: {lat:46.1860349, lng:2.6918861},
                zoom: 6,
                scrollwheel: true,
                mapTypeControl: false,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                styles : [],
            };

            if(typeof options !== "undefined"){
                var settings = $.extend({}, defaultOptions, options);
            }
            if(typeof settings !== "undefined"){
                Object.keys(settings).forEach(function(key, index) {
                    // key: the name of the object key
                    console.debug("output : " + key+":"+settings[key]+" -- ");

                });
            }

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