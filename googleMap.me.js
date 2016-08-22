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


            // Ajouts des marqueurs à la carte
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


            /**
            * Description for direction : Définition d'un trajet par l'utilisateur
            * @private
            * @method direction
            * @param {Object} start : Départ du trajet
            * @param {Object} destination : Arrivée du trajet
            * @param {Object} options : Options supplémentaires du trajet
            * @return {Object} description
            */
            direction: function(start, destination, animateRoute, options){
                /**
                {
                    travelMode: [string],
                    provideRouteAlternatives: [boolean],
                }
                */

                var direction = {
                    origin: start,
                    destination: destination,
                };

                if(typeof options !== "undefined"){
                    var settings = $.extend({}, direction, options);
                }
                if(typeof settings !== "undefined"){
                    Object.keys(settings).forEach(function(key, index) {
                        // key: the name of the object key
                        console.debug(key+":"+settings[key]+" -- ");
                    });
                }


                var directionsService = new google.maps.DirectionsService();

                directionsService.route(settings, function(result, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        if(typeof animateRoute !== "undefined"){
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

                    function setAnimatedRoute(pathCoords) {
                        var route = new google.maps.Polyline({
                            path: [],
                            geodesic : typeof animateRoute.geodesic !== "undefined" ? animateRoute.geodesic : true,
                            strokeColor: typeof animateRoute.strokeColor !== "undefined" ? animateRoute.strokeColor : '#0080ff',
                            strokeOpacity: typeof animateRoute.strokeOpacity !== "undefined" ? animateRoute.strokeOpacity : 0.5,
                            strokeWeight: typeof animateRoute.strokeWeight !== "undefined" ? animateRoute.strokeWeight : 3,
                            editable: typeof animateRoute.editable !== "undefined" ? animateRoute.editable : false,
                            map: gMap.map
                        });

                        var marker = new google.maps.Marker({map:gMap.map, icon: typeof animateRoute.icon !== "undefined" ? animateRoute.icon : ""});
                        var speed = typeof animateRoute.speed !== "undefined" ? animateRoute.speed : 1;
                        
                        
                        for (var i = 0; i < pathCoords.length; i++) {                
                            setTimeout(function(coords) {
                                route.getPath().push(coords);
                                
                                marker.setPosition(coords);
                                if(animateRoute.followMarker){
                                    gMap.map.panTo(coords);
                                }
                                
                            }, 100/speed * i, pathCoords[i]);
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


            gMap.map = new google.maps.Map(target, {
                center: center,
                zoom: typeof gMap.options.zoom !== "undefined" ? gMap.options.zoom : 7,
                scrollwheel : typeof gMap.options.scrollwheel !== "undefined" ? gMap.options.scrollwheel : true,
                mapTypeControl : typeof gMap.options.mapTypeControl !== "undefined" ? gMap.options.mapTypeControl : false,
                mapTypeId: typeof gMap.options.MapTypeId !== "undefined" ? gMap.options.MapTypeId : google.maps.MapTypeId.ROADMAP,
                styles : typeof gMap.options.styles !== "undefined" ? gMap.options.styles : [],


            });                
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