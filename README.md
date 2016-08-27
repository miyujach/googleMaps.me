# FastestWayGoogleMaps

FastestWayGoogleMaps vous propose de nombreuses méthodes dédiées à la personnalisation de carte google maps.


-   ajouter des trajets statiques / animées sur une carte
-   créer des marqueur simple / multiples sur une carte
-   etc


Vous pouvez aussi :
-   supprimer l'ensemble des marqueurs ajoutés sur la carte
-   zoomer / dezoomer
-   centrer la carte en spécifiant une latitude et longitude



et le tout avec une facilité incroyable.


### Librairie requise
FastestWayGoogleMaps à besoin pour fonctionner de la librairie jQuery v3.0.0.



### Installation
Pour utiliser FastestWayGoogleMaps, vous avez besoin de:
-   vous munir la clef API google maps
-   de spécifier la div sur laquelle vous souhaitez faire apparaitre la carte
-   C'est tout !


### Exemple de code
La fonction FastestWayGoogleMaps est composée de 4 arguments dont un optionel (options).

Une fois le plugin initialisé, vous devez écrire toutes vos fonctions dans la fonction de rappel (callback), voir ci-dessous.

```sh
FastestWayGoogleMaps("API key", "selecteur", callback, options);
```

```sh
FastestWayGoogleMaps("AIzaSyDkQdWdHJofyWARkL_UrGZbDsnirQTrw3s",
   "#map",
   callback,
   {
        zoom: 8,
        styles: styles,
        mapTypeId: 'roadmap',
        tilt: 45,   
   });
```

```sh
function callback(gMap) {
    gMap.setMarkers(tab_localisation);
    gMap.setZoom(9);
}
  
  
```sh
var tab_localisation = [
    {
        desc: "Toulouse",
        lat: 43.6007,
        lng: 1.432841
    },
    {
        desc: "Paris",
        lat: 48.858859,
        lng: 2.347557,
        icon: "marker.png"
    },
];
```

```sh
var styles = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]}];
```

 
   
```

Show what the library does as concisely as possible, developers should be able to figure out **how** your project solves their problem by looking at the code example. Make sure the API you are showing off is obvious, and that your code is short and concise.




### Fonctions disponibles dans la fonction de rappel (callback)

Ajout de marqueurs sur la carte
```sh
var tab_localisation = [
    {
        desc: "Toulouse",
        lat: 43.6007,
        lng: 1.432841
    },
    {
        desc: "Paris",
        lat: 48.858859,
        lng: 2.347557,
        icon: "marker.png"
    },
]
gMap.setMarkers(tab_localisation);
```

Suprimer les marqueurs de la carte
```sh
gMap.removeMarkers()
```

Zoom sur la carte (0 - 20)
```sh
gMap.setZoom(9);
```

Se centrer sur la carte (latitude, longitude)
```sh
gMap.setCenter(lat, lng);
```

Réaliser un trajet STATIQUE sur la carte
```sh
gMap.direction("Toulouse, Midi-Pyrénées",
           "Bordeaux, Gironde",
           {
                travelMode: google.maps.TravelMode.DRIVING,
                provideRouteAlternatives : true,
                optimizeWaypoints: true,
                waypoints: [
                    {
                        location:"Balma, Midi-Pyrénées",
                        stopover:false
                    }
                ],
            }
          );
```

Réaliser un trajet AVEC ANIMATION sur la carte
```sh
gMap.direction("Toulouse, Midi-Pyrénées",
           "Bordeaux, Gironde",
           {
                 animateRoute : [
                    {
                        speed: 3, 
                        followMarker: true,
                        strokeColor: 'red',
                        strokeOpacity: 0.5,
                        strokeWeight: 5,
                        editable: false,
                        icon : "http://maps.google.com/mapfiles/ms/micons/blue.png",
                    }
                ],
                travelMode: google.maps.TravelMode.DRIVING,
                provideRouteAlternatives : true,
                optimizeWaypoints: true,
                waypoints: [
                    {
                        location:"Balma, Midi-Pyrénées",
                        stopover:false
                    }
                ],
            }
          );
```


## Contributeur

Michael Jach
