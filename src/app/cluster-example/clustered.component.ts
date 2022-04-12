import { Component, ElementRef, EventEmitter, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CoreLoadingScreenService } from '@core/services/loading-screen.service';
import { BaseMapComponent } from 'app/main/pages/_index';
import { DxTagBoxComponent } from 'devextreme-angular';
import { ToastrService } from 'ngx-toastr';
import Point from 'ol/geom/Point';
import { Feature } from 'ol/index';
import { fromLonLat } from 'ol/proj';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { debounceTime, filter, switchMap } from 'rxjs/operators';
import { RaporlarComponent } from '../../../raporlar.component';

@Component({
  selector: 'app-makine-lokasyon',
  templateUrl: './makine-lokasyon.component.html',
  styleUrls: ['./makine-lokasyon.component.scss']
})
export class MakineLokasyonComponent extends BaseMapComponent implements OnInit {

  @ViewChild('popup') private popupElement: ElementRef;

  @ViewChild('uiFirma', { static: false }) tagBoxUiFirma: DxTagBoxComponent;
  @ViewChild('tagBoxRobotListesi', { static: false }) tagBoxRobotListesi: DxTagBoxComponent;
  @ViewChild('tagBoxSehirler', { static: false }) tagBoxSehirler: DxTagBoxComponent;
  @ViewChild('dxIlceSelect', { static: false }) tagBoxIlceler: DxTagBoxComponent;

  @ViewChild('badgesContainer') badgesContainer: ElementRef;

  private typeaheadFirmalar = new EventEmitter<string>();
  private typeAheadRobot = new EventEmitter<string>();

  filterForm: FormGroup;
  formSubmitAttempt: boolean = false;
  sehirler: SehirModel[];
  ilceler: any[] = [];
  ilceDisabled: boolean = true;
  robotListesi: MakineKurulumModel[] = [];
  firmalarSelected: FirmaModel[] = [];
  sahaPersonelleri = [];
  koordinatlar = [];

  get formControlSehirler() {
    return this.filterForm.get('formControlSehirler')
  }
  get formControlIlceler() {
    return this.filterForm.get('formControlIlceler')
  }
  get formControlRobotlar() {
    return this.filterForm.get('formControlRobotlar')
  }
  get formControlIpAdresi() {
    return this.filterForm.get('formControlIpAdresi')
  }
  get formControlUiFirmalar() {
    return this.filterForm.get('formControlUiFirmalar')
  }
  get formControlSahaPersoneli() {
    return this.filterForm.get('formControlSahaPersoneli')
  }

  constructor(
    @Inject(RaporlarComponent) protected parent: RaporlarComponent,
    private renderer: Renderer2,
    protected spinnerService: CoreLoadingScreenService,
    protected toastr: ToastrService
  ) {
    super(spinnerService, toastr);
    this.parent.setContentHeader([{ name: 'Yönetim', isLink: false }, { name: 'Makine Lokasyon', isLink: false }]);


    this.typeaheadFirmalar
      .pipe(
        debounceTime(300),
        filter(term => term.length > 3),
        switchMap((term) => {
          return this.apiService.firmaAra({
            GetAllData: true,
            PageSize: 10000,
            sehirId: 0,
            ilceId: 0,
            id: 0,
            ad: term,
            firmaTipList: [1, 8],
            ePosta: "",
            vergiNo: "",
            bayiBelgeNo: "",
            adres: "",
            aktif: true
          });
        })
      )
      .subscribe(
        (q) => {
          if (q.success) {
            const selected = this.tagBoxUiFirma.instance.option("selectedItems");
            this.firmalarSelected = [...q.data.resultSet, ...selected.filter(x => q.data.resultSet.map(y => y.id).indexOf(x.id) === -1)];
            this.setCaseSafeTagBoxControl(this.tagBoxUiFirma, this.firmalarSelected, 'ad');
          }
        },
        () => {
        });

    this.typeAheadRobot
      .pipe(
        debounceTime(300),
        filter(term => term.length > 3),
        switchMap((term) => {
          return this.apiService.makineKurulumPagedList({
            GetAllData: true,
            PageSize: 10000,
            aktif: true,
            makineAdi: " ",
          });
        })
      )
      .subscribe(
        (q) => {
          if (q.success) {
            const selected = this.tagBoxRobotListesi.instance.option("selectedItems");
            this.robotListesi = [...q.data.resultSet, ...selected.filter(x => q.data.resultSet.map(y => y.id).indexOf(x.id) === -1)];
            this.setCaseSafeTagBoxControl(this.tagBoxRobotListesi, this.robotListesi, 'makineAdi');
          }
        },
        () => {
        });
  }

  ngOnInit(): void {
    this.initializeMap("ol-map-makine", true);

    this.filterForm = new FormGroup(
      {
        formControlRobotlar: new FormControl([]),
        formControlIpAdresi: new FormControl([]),
        formControlUiFirmalar: new FormControl([]),
        formControlSehirler: new FormControl([]),
        formControlSahaPersoneli: new FormControl([]),
        formControlIlceler: new FormControl({ value: '', disabled: true }),
      });

    this.apiRequestService
      .newRequest(new ApiRequest(this.apService.sehirListele({ ulkeId: 212 }),
        (r: ApiResponseWithDataModel<SehirModel[]>) => {
          this.sehirler = r.data;
          this.setCaseSafeTagBoxControl(this.tagBoxSehirler, this.sehirler, 'ad');
        },
        (r) => {

        }))
      .call(false);
  }


  onFirmaInput(e) {
    const searchKey = e.component._$textEditorInputContainer[0].getElementsByTagName("input")[0].value.trim();

    this.typeaheadFirmalar.next(searchKey);
  }

  onRobotInput(e) {
    const searchKey = e.component._$textEditorInputContainer[0].getElementsByTagName("input")[0].value.trim();

    this.typeAheadRobot.next(searchKey);
  }

  onCityChange(e) {
    const selectedCities = e.value;
    this.formControlIlceler.setValue([]);

    if (selectedCities.length > 1 || selectedCities.length == 0) {
      this.formControlIlceler.disable();
    } else {
      this.apiRequestService.newRequest(new ApiRequest(this.apiService.ilceListele({ sehirId: +selectedCities[0] }),
        (r: ApiResponseWithDataModel<IlceModel[]>) => {
          this.ilceler = r.data;
          this.setCaseSafeTagBoxControl(this.tagBoxIlceler, this.ilceler, 'ad');
          this.formControlIlceler.enable();
        },
        (r) => {
          this.formControlIlceler.disable();
        }))
        .call(false);
    }
  }

  temizle = () => {
    this.clearMarkerLayer();
    this.clearClusterLayer();
    this.formControlIlceler.setValue([]);
    this.formControlSehirler.setValue([]);
    this.formControlIpAdresi.setValue([]);
    this.formControlRobotlar.setValue([]);
    this.formControlUiFirmalar.setValue([]);
  }

  ara = () => {
    this.clearMarkerLayer();
    this.clearClusterLayer();

    return this.apiService.makineKonumListele({
      makineIdler: this.formControlRobotlar.value,
      sehirIdler: this.formControlSehirler.value,
      ilceIdler: this.formControlIlceler.value,
      ipAdresler: this.formControlIpAdresi.value.length > 0 ? [this.formControlIpAdresi.value] : [],
      uretimMerkeziIdler: this.formControlUiFirmalar.value,
      sahaPersonelIdler: [],
    }).toPromise().then((r) => {
      const data = r.data;
      if (data.length > 0) {
        // this.generateMarkers(data);
        this.addClusterFeature(data);
      } else {
        this.toastr.warning("Seçili bilgilere dair robot bilgisi bulunamadı.", 'Robot Bilgisi Yok!')
      }
    });
  }

  onFormSubmitAttempt(val: boolean) {
    this.formSubmitAttempt = val;
  }
  dxClearSearchKey(e) {
    e.component._$textEditorInputContainer[0].getElementsByTagName("input")[0].value = "";
  }

  generateMarkers(makineDataList) {
    let uniqueColor = "#0989ff";
    let userList = '';

    this.koordinatlar = [];

    makineDataList.forEach((makine, index) => {

      const randomColor = () => {
        let n = (Math.random() * 0xfffff * 1000000).toString(16);
        let uniqueColor = '#' + n.slice(0, 6);
        return uniqueColor;
      }

      uniqueColor = randomColor();

      userList += `<div class="badge badge-primary" style="background-color:${uniqueColor}"><span style="font-size:10px">- </span>  ${makine.ilAdi} </div>`;

      let unicStyle = new Style({
        text: new Text({
          text: "",
          fill: new Fill({
            color: "#ffffff",
          })
        }),
        image: new Circle({
          radius: 9,
          stroke: new Stroke({ color: 'white' }),
          fill: new Fill({ color: uniqueColor }),
        }),
      });
      let marker;
      if (makine.lon) {
        marker = new Feature({
          geometry: new Point(fromLonLat([Number(makine.lon), Number(makine.lat)])),
          style: new Style(),
          ekData: {
            "html": `
            <p class="header bold">Robot Bilgi</p>
            <p class="info">
              <span class="bold">Üretim Merkezi</span>: ${makine.uretimMerkeziAdi}</br>
              <span class="bold">Ip Adresi:</span> ${makine.ipAdres}</br>
              <span class="bold">Robot Id:</span> ${makine.makineAdi}</br>
              <span class="bold">Kurulum Tarihi:</span> ${new Date(makine.kurulumTarihi).toLocaleString("tr-TR")}</br>
              ${makine.ilAdi}/${makine.ilceAdi}</br>
            </p>
          `
          },
        });
      } else {
        marker = new Feature({
          geometry: new Point(fromLonLat([31.084071 + index / 1000, 35.289067 + index / 10000])),
          style: new Style(),
          ekData: {
            "html": `
            <p class="header bold">Robot Bilgi</p>
            <p class="info">
              <span class="bold">Üretim Merkezi</span>: ${makine.uretimMerkeziAdi}</br>
              <span class="bold">Ip Adresi:</span> ${makine.ipAdres}</br>
              <span class="bold">Robot Id:</span> ${makine.makineAdi}</br>
              <span class="bold">Kurulum Tarihi:</span> ${new Date(makine.kurulumTarihi).toLocaleString("tr-TR")}</br>
              ${makine.ilAdi}/${makine.ilceAdi}</br>
            </p>
          `
          },
        });
        marker.setStyle(new Style({
          text: new Text({
            text: "?",
            fill: new Fill({
              color: "#ffffff",
            })
          }),
          image: new Circle({
            radius: 9,
            stroke: new Stroke({ color: 'white' }),
            fill: new Fill({ color: "#fc2c03" }),
          }),
        }));
      }

      this.addMarker(marker);

      if (makine.lon) {
        this.koordinatlar.push([Number(makine.lon), Number(makine.lat)]);
      }
    });
    // this.generateUserBadges(userList);
    this.panToCenter(this.koordinatlar);
  }

  generateUserBadges(list) {
    this.renderer.setProperty(this.badgesContainer.nativeElement, 'innerHTML', list)
  }

  ngOnDestroy(): void {
    this.typeaheadFirmalar?.unsubscribe();
    this.typeAheadRobot?.unsubscribe();

    this.popupElement.nativeElement.remove();
  }

}
