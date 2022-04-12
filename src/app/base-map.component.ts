import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CoreLoadingScreenService } from '@core/services/loading-screen.service';
import Polyline from 'ol/format/Polyline';
import { Feature, Map, Overlay, View } from 'ol/index';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import ol from 'ol';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { Point } from 'ol/geom';
import { ToastrService } from 'ngx-toastr';
import { DxTagBoxComponent } from 'devextreme-angular';
import Cluster from 'ol/source/Cluster';
import { Tile as TileLayer } from 'ol/layer';
import CircleStyle from 'ol/style/Circle';


@Component({
    template: ''
})

export abstract class BaseMapComponent implements OnInit {
    map: Map;
    popup: ElementRef;
    locations = [];
    markerLayer: VectorLayer<VectorSource>;
    popupOverlay: Overlay;
    features: any[] = [];
    markers: any[] = []

    vectorSource: VectorSource;
    clusterSource: Cluster;
    clusterLayer: VectorLayer<VectorSource>;
    view: View;

    url_osrm_nearest = '//router.project-osrm.org/nearest/v1/driving/';
    url_osrm_route = '//router.project-osrm.org/route/v1/foot/';

    constructor(
        protected spinnerService: CoreLoadingScreenService,
        protected toastr: ToastrService
    ) {

    }

    addClusterFeature(data) {
        const features = [];

        for (let i = 0; i < data.length; ++i) {
            features[i] = new Feature({
                geometry: new Point(fromLonLat([Number(data[i].lon), Number(data[i].lat)])),
                ekData: data[i].makineDsSeriNo + " - " + data[i].ilceAdi
            });
        }

        const clusterSource = new Cluster({
            distance: parseInt("100", 10),
            minDistance: parseInt("0", 10),
            source: new VectorSource({
                features: features,
            })
        });
        const styleCache = {};

        const clusterLayer = new VectorLayer({
            source: clusterSource,
            style: (feature) => {
                const size = feature.get('features').length;

                let style = styleCache[size];
                if (!style) {
                    style = new Style({
                        image: new CircleStyle({
                            radius: 10,
                            stroke: new Stroke({
                                color: '#fff',
                            }),
                            fill: new Fill({
                                color: '#3399CC',
                            }),
                        }),
                        text: new Text({
                            text: size.toString(),
                            fill: new Fill({
                                color: '#fff',
                            }),
                        }),
                    });
                    styleCache[size] = style;
                }
                return style;
            },
        })

        clusterLayer.set('name', 'cluster_layer');

        this.map.addLayer(clusterLayer);
    }

    initializeMap(target, isCluster = false) {
        this.vectorSource = new VectorSource({
            features: this.locations,
        });

        this.view = new View({
            center: fromLonLat([32.866287, 39.925533]),
            zoom: 6.5,
        });

        this.map = new Map({
            view: this.view,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: this.vectorSource,
                    style: new Style({
                        image: new Circle({
                            radius: 9,
                            fill: new Fill({ color: '#0989ff' }),
                        }),
                    }),
                })
            ],

            target: target
        });

        this.markerLayer = new VectorLayer({
            source: new VectorSource(),
            style: new Style({
                image: new Circle({
                    radius: 9,
                    stroke: new Stroke({ color: 'white', width: 2 }),
                    fill: new Fill({ color: '#0989ff' }),
                }),
            }),
        });
        this.map.addLayer(this.markerLayer);

        if (isCluster) {
            this.attachPopupToCluster()
        } else {
            this.attachPopup();
        }
    }

    attachPopup() {
        this.map.getOverlays();

        const container = document.getElementById('popup');
        const content = document.getElementById('popup-content');
        const closer = document.getElementById('popup-closer');

        this.popupOverlay = new Overlay({
            element: container,
            positioning: 'bottom-center',
            stopEvent: false,
            autoPan: {
                animation: {
                    duration: 250,
                },
            },
        });
        this.map.addOverlay(this.popupOverlay);

        //marker hover
        this.map.on('pointermove', (evt) => {
            this.popupOverlay.setPosition(undefined);
            this.map.getViewport().style.cursor = '';

            this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                let isPointType = feature.getProperties().geometry instanceof Point;
                if (isPointType) {
                    this.map.getViewport().style.cursor = 'pointer';

                    const coordinate = evt.coordinate;
                    const popData = feature.getProperties();

                    content.innerHTML = popData.ekData.html;

                    this.popupOverlay.setPosition(coordinate);
                }
            })
        });

        //marker click
        this.map.on('singleclick', (evt) => {
            this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                let isPointType = feature.getProperties().geometry instanceof Point;
                if (isPointType) {
                    const popData = feature.getProperties().ornekData;
                    // alert(`tıkladığın kişi, ${popData}`)
                }
            })
        });

        //popup close
        closer.onclick = () => {
            this.popupOverlay.setPosition(undefined);
            closer.blur();
            return false;
        };

    }

    attachPopupToCluster() {
        this.map.getOverlays();

        const container = document.getElementById('popup');
        const content = document.getElementById('popup-content');
        const closer = document.getElementById('popup-closer');

        this.popupOverlay = new Overlay({
            element: container,
            positioning: 'bottom-center',
            stopEvent: false,
            autoPan: {
                animation: {
                    duration: 250,
                },
            },
        });
        this.map.addOverlay(this.popupOverlay);

        //marker hover
        this.map.on('pointermove', (evt) => {
            this.popupOverlay.setPosition(undefined);
            this.map.getViewport().style.cursor = '';

            this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                if (feature) {
                    var coord = this.map.getCoordinateFromPixel(evt.pixel);
                    if (typeof feature.get('features') === 'undefined') {
                        content.innerHTML = `
                        <h5><b>Makine Bilgisi</b></h5>
                        <i><b>Bilgi Yok</b></i>
                        `;
                    } else {
                        var cfeatures = feature.get('features');
                        if (cfeatures.length > 1) {
                            content.innerHTML = `<h5><strong>Makinelerin Özet Bilgisi</strong></h5>`;
                            for (var i = 0; i < cfeatures.length; i++) {
                                if (i > 10) {
                                    content.innerHTML += `<div>
                                    <span style="font-weight:bold">${cfeatures.length - i} Adet Daha...</span>
                                    </div>`;
                                    break;
                                }
                                content.innerHTML += `<div>
                                <span>${cfeatures[i].get('ekData')}</span>
                                </div>`;
                            }
                        }
                        if (cfeatures.length == 1) {
                            content.innerHTML = `
                            <h5><strong>Makine Bilgisi</strong></h5>
                            <i><b>${cfeatures[0].get('ekData')}</b></i>
                            `
                        }
                    }
                    this.popupOverlay.setPosition(coord);
                } else {
                    this.popupOverlay.setPosition(undefined);
                }
            })
        });

        //marker click
        this.map.on('singleclick', (evt) => {
            this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                let isPointType = feature.getProperties().geometry instanceof Point;
                if (isPointType) {
                    const popData = feature.getProperties().ornekData;
                    // alert(`tıkladığın kişi, ${popData}`)
                }
            })
        });

        //popup close
        closer.onclick = () => {
            this.popupOverlay.setPosition(undefined);
            closer.blur();
            return false;
        };

    }

    ngOnInit(): void {
    }

    ngAfterViewInit() {
    }

    protected addMarker = (feature: Feature) => {
        this.markerLayer.getSource().addFeature(feature);
    }

    protected removeMarker = (feature: Feature) => {
        this.markerLayer.getSource().removeFeature(feature)
    }

    protected clearMarkerLayer = () => {
        this.markerLayer.getSource().clear();
    }

    protected clearClusterLayer = () => {
        this.map.getLayers().forEach(layer => {
            if (layer.get('name') && layer.get('name') == 'cluster_layer') {
                this.map.removeLayer(layer)
            }
        });
    }

    protected dateBoxToISO(date) {
        const tzoffset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date - tzoffset)).toISOString();

        return localISOTime;
    }

    bounce(t) {
        const s = 7.5625;
        const p = 2.75;
        let l;
        if (t < 1 / p) {
            l = s * t * t;
        } else {
            if (t < 2 / p) {
                t -= 1.5 / p;
                l = s * t * t + 0.75;
            } else {
                if (t < 2.5 / p) {
                    t -= 2.25 / p;
                    l = s * t * t + 0.9375;
                } else {
                    t -= 2.625 / p;
                    l = s * t * t + 0.984375;
                }
            }
        }
        return l;
    }

    panToCenter = (arr) => {
        let minX, maxX, minY, maxY;
        for (let i = 0; i < arr.length; i++) {
            minX = (arr[i][0] < minX || minX == null) ? arr[i][0] : minX;
            maxX = (arr[i][0] > maxX || maxX == null) ? arr[i][0] : maxX;
            minY = (arr[i][1] < minY || minY == null) ? arr[i][1] : minY;
            maxY = (arr[i][1] > maxY || maxY == null) ? arr[i][1] : maxY;
        }
        let centerCoordinates = [(minX + maxX) / 2, (minY + maxY) / 2];

        this.view.animate({
            center: fromLonLat(centerCoordinates),
            duration: 1800,
            zoom: 6.5 // TODO : optimum zoom hesaplanacak
        });
    }

    drawRoute(arr, lineColor) {
        let that = this;
        that.vectorSource.clear()

        arr.forEach((coordinates, index) => {

            if (index == arr.length - 1)
                return;

            fetch(this.url_osrm_route + coordinates[0] + ',' + coordinates[1] + ';' + arr[index + 1][0] + ',' + arr[index + 1][1]).then(function (r) {
                return r.json();
            }).then(function (json) {
                if (json.code !== 'Ok') {
                    //error fırlat
                }
                let styles = {
                    route: new Style({
                        stroke: new Stroke({
                            width: 6,
                            color: lineColor
                        })
                    })
                };
                var route = new Polyline({
                    factor: 1e5
                }).readGeometry(json.routes[0].geometry, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });
                var feature = new Feature({
                    type: 'route',
                    geometry: route
                });
                feature.setStyle(styles.route);
                that.vectorSource.addFeature(feature);
            });
        });
    }

    addAlpha = (color, opacity) => {
        // coerce values so ti is between 0 and 1.
        var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
        return color + _opacity.toString(16).toUpperCase();
    }

    protected setCaseSafeTagBoxControl(tagBox: DxTagBoxComponent, items: any[], defaultSearchExpr: string) {
        tagBox.searchExpr = ['searchTextLowercase', defaultSearchExpr];

        items.forEach(q => {
            q['searchTextLowercase'] = q[defaultSearchExpr]?.toLocaleLowerCase("tr-TR")
        });
    }
}
