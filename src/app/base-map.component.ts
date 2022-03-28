import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { Feature, Map, Overlay, View } from 'ol/index';
import BaseVectorLayer from 'ol/layer/BaseVector';
import { toStringHDMS } from 'ol/coordinate';
import { fromLonLat, toLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

@Component({
    template: ''
})

export abstract class BaseMapComponent implements OnInit {
    map: Map;
    popup: ElementRef;
    locations = [];
    markerLayer: VectorLayer<VectorSource>;
    popupOverlay: Overlay;
    // @ViewChild('popup') private element: NgbPopover

    constructor(
    ) {
    }

    initializeMap() {
        this.map = new Map({
            view: new View({
                center: fromLonLat([32.866287, 39.925533]),
                zoom: 5,
            }),
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: new VectorSource({
                        features: this.locations,
                    }),
                    style: new Style({
                        image: new Circle({
                            radius: 9,
                            fill: new Fill({ color: 'red' }),
                        }),
                    }),
                }),
            ],

            target: 'ol-map'
        });


        this.markerLayer = new VectorLayer({
            source: new VectorSource(),
            style: new Style({
                text: new Text({
                    text: "ali",
                }),
                image: new Circle({
                    radius: 9,
                    stroke: new Stroke({ color: 'white', width: 2 }),
                    fill: new Fill({ color: '#0989ff' }),
                }),
            }),
        });
        this.map.addLayer(this.markerLayer);
        this.attachPopup()

    }

    attachPopup() {
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
                this.map.getViewport().style.cursor = 'pointer';

                const coordinate = evt.coordinate;
                const popData = feature.getProperties().ornekData;

                content.innerHTML = '<p>Personel:</p><code>'
                    + popData.name + " " + popData.surname + " " + popData.tel
                '</code>';

                this.popupOverlay.setPosition(coordinate);
            })
        });

        //marker click
        this.map.on('singleclick', (evt) => {
            this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                const popData = feature.getProperties().ornekData;
                alert(`tıkladığın kişi, ${popData}`)
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
        this.initializeMap();
    }

    ngAfterViewInit() {
    }


    abstract generateMarkers(dummy): void

    protected addMarker = (feature: Feature) => {
        this.markerLayer.getSource().addFeature(feature);
    }

    protected removeMarker = (feature: Feature) => {
        this.markerLayer.getSource().removeFeature(feature)
    }

    protected clearMarkerLayer = () => {
        this.markerLayer.getSource().clear();
    }
}
