import { Component } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  map!: L.Map;

  constructor() { }
  //ngOnInit() {
  //}

  ionViewDidEnter() {
    this.map = L.map('mapId').setView([-7.795306981776558, 110.36868749980938], 12);

    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(this.map);

    const basemap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 20,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		});

		const basemap1 = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
			maxZoom: 20,
			attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		});
    const basemap2 = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; <a href="https://opentopomap.org/about.html">OpenTopoMap</a> contributors'
    });

		basemap.addTo(this.map);

    L.marker([-7.795306981776558, 110.36868749980938]).addTo(this.map)
    .bindPopup('SV')
    .openPopup();

    /* Control Layer */
		var baseMaps = {
      "OpenStreetMap": basemap,
      "CyclOSM": basemap1,
      "OpenTopo": basemap2
    };
  
    L.control.layers(baseMaps, ).addTo(this.map);


  }
}