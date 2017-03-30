//Created by: Caio Lucena
var scripts = document.getElementsByTagName("script")
var currentScriptPath = scripts[scripts.length - 1].src;

angular.module('mapsFilter', []).component('myMap', {
    templateUrl: currentScriptPath.replace('maps.component.js', 'mapsFilter.template.html'),
    bindings: {},
    controller: function MapCtrl($rootScope, $scope, $http) {
        var ctrl = this;

        //Pega o caminho do arquivo para importar o arquivo de CSS
        ctrl.css = currentScriptPath.replace('maps.component.js', 'style.css');
        ctrl.config_json = currentScriptPath.replace('maps.component.js', 'config.json');

        ctrl.reload = _initialize;
        //Raio inicial possui o valor de 500 metros
        ctrl.raio = '500';

        //Filtros selecionados
        ctrl.filtro_selecionado = [];

        //Seleção de filtros para requisição
        ctrl.toggleSelection = function toggleSelection(locale) {
            var idx = ctrl.filtro_selecionado.indexOf(locale.tipo);
            if (idx > -1) {
                ctrl.filtro_selecionado.splice(idx, 1);
            } else {
                ctrl.filtro_selecionado.push(locale.tipo);
            }
            _initialize();
        };

        var infowindow = new google.maps.InfoWindow();

        function _initialize() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    var map = new google.maps.Map(document.getElementById('map'), {
                        center: pos,
                        zoom: ctrl.raio >= 2500 ? 14 : 15,
                        scrollwheel: false
                    });
                    map.setCenter(pos);
                    var request = {
                        location: pos,
                        radius: ctrl.raio,
                        types: ctrl.filtro_selecionado
                    };

                    var service = new google.maps.places.PlacesService(map);
                    service.nearbySearch(request, function(results, status) {
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            for (var i = 0; i < results.length; i++) {
                                _criarMarcacao(results[i], map);
                            }
                            $rootScope.$broadcast("locale-set", { resultados: results });
                        }
                    });
                }, function() {
                    handleLocationError(true, infoWindow, map.getCenter());
                });
            } else {
                handleLocationError(false, infoWindow, map.getCenter());
            }
        }


        function _criarMarcacao(place, mapa) {
            var placeLoc = place.geometry.location;
            var image = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            var marker = new google.maps.Marker({
                map: mapa,
                icon: image,
                position: place.geometry.location
            });

            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(place.name);
                infowindow.open(mapa, this);
            });
        }

        google.maps.event.addDomListener(window, 'load', _initialize);
        $(window).resize(function() {
            google.maps.event.trigger(map, "resize");
        });
        google.maps.event.trigger(map, "resize");

        $rootScope.$on("locale-set", function(event, args) {
            ctrl.lista = args.resultados;
            $scope.$apply();
            $scope.$digest();
        });

        $http.get(ctrl.config_json).then(function(data) {
            ctrl.lista_filtros = data.data.filtro;
            ctrl.lista_raios = data.data.raio;
        });
    }
});