import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CoreLoadingScreenService } from '@core/services/loading-screen.service';
import { NgbAccordion } from '@ng-bootstrap/ng-bootstrap';
import { BaseMapComponent } from 'app/main/pages/_index';
import { ToastrService } from 'ngx-toastr';
import Point from 'ol/geom/Point';
import { Feature } from 'ol/index';
import { fromLonLat } from 'ol/proj';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { Subscription } from 'rxjs';
import { RaporlarComponent } from '../../../raporlar.component';
import { personelTakipValidator } from './personel-takip.validator';

@Component({
  selector: 'app-personel-takip',
  templateUrl: './personel-takip.component.html',
  styleUrls: ['./personel-takip.component.scss']
})

export class PersonelTakipComponent extends BaseMapComponent implements OnInit {
  @ViewChild('popup') private popupElement: ElementRef;
  @ViewChild('badgesContainer') badgesContainer: ElementRef;
  @ViewChild('tarihAccordion') tarihAccordion: NgbAccordion;

  private formValueChangeSubscription: Subscription;

  personelBazli: boolean = false;
  rotaCizilsinmi: boolean = false;
  now: Date = new Date();
  isPersonelEmpty: boolean = false;
  filterForm: FormGroup;
  kategoriler = [];
  koordinatlar = [];

  //#region get formcontrol values
  get baslangicTarihi() {
    return this.filterForm.get('baslangicTarihi');
  }

  get bitisTarihi() {
    return this.filterForm.get('bitisTarihi');
  }

  get formControlrol19() {
    return this.filterForm.get('formControlrol19')
  }

  get formControlrol20() {
    return this.filterForm.get('formControlrol20')
  }

  get formControlrol21() {
    return this.filterForm.get('formControlrol21')
  }
  get formControlrol22() {
    return this.filterForm.get('formControlrol22')
  }
  get formControlrol23() {
    return this.filterForm.get('formControlrol23')
  }
  get formControlrol24() {
    return this.filterForm.get('formControlrol24')
  }
  get formControlrol25() {
    return this.filterForm.get('formControlrol25')
  }
  get formControlrol26() {
    return this.filterForm.get('formControlrol26')
  }
  get formControlrol27() {
    return this.filterForm.get('formControlrol27')
  }
  get formControlrol28() {
    return this.filterForm.get('formControlrol28')
  }
  get formControlrol29() {
    return this.filterForm.get('formControlrol29')
  }
  get formControlrol30() {
    return this.filterForm.get('formControlrol30')
  }
  get formControlrol31() {
    return this.filterForm.get('formControlrol31')
  }
  get formControlrol32() {
    return this.filterForm.get('formControlrol32')
  }
  get formControlrol33() {
    return this.filterForm.get('formControlrol33')
  }
  get formControlrol34() {
    return this.filterForm.get('formControlrol34')
  }
  get formControlrol35() {
    return this.filterForm.get('formControlrol35')
  }
  get formControlrol36() {
    return this.filterForm.get('formControlrol36')
  }
  get formControlrol37() {
    return this.filterForm.get('formControlrol37')
  }
  get formControlrol38() {
    return this.filterForm.get('formControlrol38')
  }
  get formControlrol39() {
    return this.filterForm.get('formControlrol39')
  }
  get formControlrol40() {
    return this.filterForm.get('formControlrol40')
  }
  get formControlrol41() {
    return this.filterForm.get('formControlrol41')
  }
  get formControlrol43() {
    return this.filterForm.get('formControlrol43')
  }
  get formControlrol44() {
    return this.filterForm.get('formControlrol44')
  }
  //#endregion

  constructor(
    @Inject(RaporlarComponent) protected parent: RaporlarComponent,
    private renderer: Renderer2,
    protected spinnerService: CoreLoadingScreenService,
    protected toastr: ToastrService
  ) {
    super(spinnerService, toastr);
    this.parent.setContentHeader([{ name: 'DS Yönetim', isLink: false }, { name: 'Personel Takip', isLink: false }]);
  }

  ngOnInit(): void {
    this.initializeMap("ol-map-personel");


    const date = new Date();
    const datePrevHour = new Date((new Date().setHours(date.getHours() - 1)));

    this.filterForm = new FormGroup(
      {
        baslangicTarihi: new FormControl(datePrevHour),
        bitisTarihi: new FormControl(date),
        formControlrol19: new FormControl([]),
        formControlrol20: new FormControl([]),
        formControlrol21: new FormControl([]),
        formControlrol22: new FormControl([]),
        formControlrol23: new FormControl([]),
        formControlrol24: new FormControl([]),
        formControlrol25: new FormControl([]),
        formControlrol26: new FormControl([]),
        formControlrol27: new FormControl([]),
        formControlrol28: new FormControl([]),
        formControlrol29: new FormControl([]),
        formControlrol30: new FormControl([]),
        formControlrol31: new FormControl([]),
        formControlrol32: new FormControl([]),
        formControlrol33: new FormControl([]),
        formControlrol34: new FormControl([]),
        formControlrol35: new FormControl([]),
        formControlrol36: new FormControl([]),
        formControlrol37: new FormControl([]),
        formControlrol38: new FormControl([]),
        formControlrol39: new FormControl([]),
        formControlrol40: new FormControl([]),
        formControlrol41: new FormControl([]),
        formControlrol43: new FormControl([]),
        formControlrol44: new FormControl([]),
      },
      {
        validators: [personelTakipValidator.startHourEndHour('baslangicTarihi', 'bitisTarihi')]
      });


    // this.generateMarkers(this.dummyData);

    this.fetchKullanicilar();
  }


  fetchKullanicilar = () => {
    return this.apiService.kullaniciListele({
      firmaAd: "",
      firmaId: null,
      kullaniciAdi: "",
      ad: "",
      soyad: "",
      tCKimlikNo: "",
      email: "",
      mobilTelefon: "",
      sehirId: null,
      ilceId: null,
      rolId: null,
      uygunRoller: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 43, 44],
      aktif: true,
      PageSize: 9999,
    }).toPromise().then((r) => {
      const data = r.data.resultSet

      const catgorizedPersonel = data.reduce(function (r, current) {
        r["rol" + current.kullaniciFirmaRol.rol.id] = r["rol" + current.kullaniciFirmaRol.rol.id] || [];
        r["rol" + current.kullaniciFirmaRol.rol.id].push({ id: current.kullaniciId, ad: current.adSoyad, rol: current.kullaniciFirmaRol.rol.ad });
        return r
      }, [])

      this.kategoriler = Object.entries(catgorizedPersonel)
    });
  }

  generateMarkers(kullaniciData) {
    let uniqueColor = "#0989ff";
    let userList = '';

    this.koordinatlar = [];
    kullaniciData.forEach((kullanici, index) => {

      this.koordinatlar = [];

      const randomColor = () => {
        let n = (Math.random() * 0xfffff * 1000000).toString(16);
        let uniqueColor = '#' + n.slice(0, 6);
        return uniqueColor;
      }

      uniqueColor = randomColor();

      userList += `<div class="badge badge-primary" style="background-color:${uniqueColor}"><span style="font-size:10px"> ${kullanici.personel.kullaniciRolAd} - </span>  ${kullanici.personel.kullaniciAdSoyad} </div>`;

      kullanici.lokasyon.reverse().forEach((lokasyon, index) => {
        let unicStyle = new Style({
          text: new Text({
            text: "",
            fill: new Fill({
              color: "#ffffff",
            })
          }),
          image: new Circle({
            radius: 9,
            stroke: new Stroke({ color: !this.personelBazli ? 'white' : (index == 0 ? '#00a4f1' : index == +kullanici.lokasyon.length - 1 ? '#f62d52' : 'white'), width: 2 }),
            fill: new Fill({ color: uniqueColor }),
          },
          ),
        });

        const marker = new Feature({
          geometry: new Point(fromLonLat([lokasyon.boylam, lokasyon.enlem])),
          style: new Style(),
          ekData: {
            "html": `
              <p class="header" style="font-weight: bold">Personel Bilgi</p>
              <p class="info">
                ${kullanici.personel.kullaniciAdSoyad}</br>
                ${kullanici.personel.kullaniciRolAd}</br>
                ${new Date(lokasyon.tarih).toLocaleString("tr-TR")}</br>
              </p>
            `
          },
        });

        if (this.personelBazli) {
          unicStyle.setText(new Text({
            text: (index + 1).toString(),
            scale: 1.1,
            textAlign: 'center',
            textBaseline: 'middle',
            fill: new Fill({
              color: "#ffffff",
            })
          }));
        } else {
          unicStyle.setText(new Text({ text: "" }));
        }

        marker.setStyle(unicStyle);
        this.addMarker(marker);
        this.koordinatlar.push([lokasyon.boylam, lokasyon.enlem]);
      });

      if (this.rotaCizilsinmi) {
        this.drawRoute(this.koordinatlar, this.addAlpha(uniqueColor, 0.5));
      } else {
        this.vectorSource.clear();
      }

    });
    this.generateUserBadges(userList);
    this.panToCenter(this.koordinatlar);
  }

  generateUserBadges(list) {
    this.renderer.setProperty(this.badgesContainer.nativeElement, 'innerHTML', list)
  }

  ara() {
    if (this.filterForm.valid) {

      let kullaniciIdler = [];
      this.generateUserBadges([])
      const filterForm = Object.entries(this.filterForm.value);

      for (let i = 2; i < filterForm.length; i++) {
        let formName = filterForm[i][0];

        this[formName].value.forEach((item) => {
          kullaniciIdler.push(item);
        })
      }

      if (this.personelBazli && kullaniciIdler.length === 0) {
        this.isPersonelEmpty = true;
        return;
      }

      this.isPersonelEmpty = false;

      return this.apiService.kullaniciLokasyonListele({
        id: null,
        kullaniciIdler: this.personelBazli ? kullaniciIdler : [],
        enlem: null,
        boylam: null,
        baslangicTarihi: this.personelBazli ? this.baslangicTarihi.value : null,
        bitisTarihi: this.personelBazli ? this.bitisTarihi.value : null
      }).toPromise().then((r) => {
        this.clearMarkerLayer();

        const kullaniciLokasyonlar = r.data.reduce((results, personel) => {
          const p = results.find(q => q.personel?.kullaniciId === personel.kullaniciId);
          if (!p)
            results.push({ personel: personel, lokasyon: [{ enlem: personel.enlem, boylam: personel.boylam, tarih: personel.tarih }] });
          else
            p.lokasyon.push({ enlem: personel.enlem, boylam: personel.boylam, tarih: personel.tarih });
          return results;
        }, []);


        if (kullaniciLokasyonlar.length > 0) {
          this.generateMarkers(kullaniciLokasyonlar)
          this.attachPopup();
        } else {
          this.toastr.warning("Seçili personel/ler'e dair konum bilgisi bulunamadı.", 'Konum Bilgisi Yok!')
        }

        this.tarihAccordion.collapseAll();
        return {
          data: r.data,
        };
      });
    }
  }

  temizle() {
    const date = new Date();
    const datePrevHour = new Date((new Date().setHours(date.getHours() - 1)));

    this.baslangicTarihi.setValue(datePrevHour);
    this.bitisTarihi.setValue(date);
    this.clearMarkerLayer();

    this.personelBazli = false;
    this.rotaCizilsinmi = false;
    this.generateUserBadges('');

    const filterForm = Object.entries(this.filterForm.value);

    for (let i = 2; i < filterForm.length; i++) {
      let formName = filterForm[i][0];
      this[formName].setValue([]);
    }

    this.tarihAccordion.collapseAll()
  }

  onPersonelBazliChange() {
    if (!this.personelBazli) {
      this.rotaCizilsinmi = false;
    }

    if (this.personelBazli || this.rotaCizilsinmi) {
      this.tarihAccordion.expandAll()
    } else {
      this.tarihAccordion.collapseAll()
      this.rotaCizilsinmi = false;
    }
  }

  togglePersonelBazli() {
    this.personelBazli = !this.personelBazli;
  }

  toggleRota() {
    this.rotaCizilsinmi = !this.rotaCizilsinmi;
  }

  onRotaChange() {
    if (this.rotaCizilsinmi) {
      this.personelBazli = true;
    }
    this.onPersonelBazliChange();
  }

  ngOnDestroy(): void {
    this.formValueChangeSubscription?.unsubscribe();
    this.popupElement.nativeElement.remove();
  }
}