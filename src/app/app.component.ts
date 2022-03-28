import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Point from 'ol/geom/Point';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Feature, Map, Overlay, View } from 'ol/index';
import { toStringHDMS } from 'ol/coordinate';

import { Circle, Fill, Stroke, Style } from 'ol/style';
import { useGeographic } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { BaseMapComponent } from './base-map.component';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends BaseMapComponent implements OnInit {
  marker1: any;
  marker2: any;
  place = fromLonLat([32.866287, 39.925533]);
  place2 = fromLonLat([32.866287, 39.925533]);

  dummyData = [
    { coord: [32.493156, 37.874641], data: { name: "elon", surname: "alemdar", tel: "055345325" } },
    { coord: [32.866287, 39.925533], data: { name: "alperen", surname: "musk", tel: "052369897" } }
  ]

  dummyData2 = [
    [29.094715, 37.783333],
    [30.704044, 36.884804]
  ]

  constructor(
  ) {
    super()
  }

  ngOnInit(): void {

    super.ngOnInit();

    this.generateMarkers(this.dummyData);

    setTimeout(() => {
      // this.clearMarkerLayer()
    }, 2000);

  }


  generateMarkers(dummy) {
    dummy.forEach(data => {
      const marker = new Feature({
        geometry: new Point(fromLonLat(data.coord)),
        ornekData: data.data
      });

      console.log(marker)
      this.addMarker(marker);
    });
  }


}
