import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  ActionSheetController,
  AlertController,
  ModalController,
} from "@ionic/angular";
import { of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { Coordinates, PlaceLocation } from "src/app/places/location.model";
import { environment } from "src/environments/environment";
import { MapModalComponent } from "../../map-modal/map-modal.component";
import { Plugins, Capacitor } from "@capacitor/core";

@Component({
  selector: "app-location-picker",
  templateUrl: "./location-picker.component.html",
  styleUrls: ["./location-picker.component.scss"],
})
export class LocationPickerComponent implements OnInit {
  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) {}

  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;
  selectedLocationImage: string;
  isLoading: boolean = false;

  ngOnInit() {}

  onPickLocation() {
    this.actionSheetCtrl
      .create({
        header: "Please, Choose",
        buttons: [
          {
            text: "Auto-Locate",
            handler: () => {
              this.locateUser();
            },
          },
          {
            text: "Pick on Map",
            handler: () => {
              this.openMap();
            },
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ],
      })
      .then((actionSheetEl) => {
        actionSheetEl.present();
      });
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable("Geolocation")) {
      this.showErrorAlert();
      return;
    }
    this.isLoading = true;
    Plugins.Geolocation.getCurrentPosition()
      .then((geoPosition) => {
        const coords: Coordinates = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude,
        };
        this.createPlace(coords.lat, coords.lng);
        this.isLoading = false;
      })
      .catch((err) => {
        console.log(err);
        this.showErrorAlert();
        this.isLoading = false;
      });
  }

  private showErrorAlert() {
    this.alertCtrl
      .create({
        header: "Could not fetch location",
        message: "Use the map",
        buttons: ["Okay"],
      })
      .then((el) => el.present());
  }

  private createPlace(lat: number, lng: number) {
    const pickedLocation: PlaceLocation = {
      lat: lat,
      lng: lng,
      address: null,
      staticMapImageUrl: null,
    };
    this.isLoading = true;
    this.getAdress(lat, lng)
      .pipe(
        switchMap((address) => {
          pickedLocation.address = address;
          return of(
            this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14)
          );
        })
      )
      .subscribe((staticMapImageUrl) => {
        pickedLocation.staticMapImageUrl = staticMapImageUrl;
        this.selectedLocationImage = staticMapImageUrl;
        this.isLoading = false;
        this.locationPick.emit(pickedLocation);
      });
  }

  private openMap() {
    this.modalCtrl
      .create({
        component: MapModalComponent,
      })
      .then((modalEl) => {
        modalEl.onDidDismiss().then((modalData) => {
          console.log(modalData.data);
          if (!modalData.data) {
            return;
          }
          /*           this.getAdress(modalData.data.lat, modalData.data.lng).subscribe(
          (address) => {
            console.log(address);
          }
        ); */
          const coords = {
            lat: modalData.data.lat,
            lng: modalData.data.lng,
          };

          this.createPlace(coords.lat, coords.lng);
        });
        modalEl.present();
      });
  }

  private getAdress(lat: number, lng: number) {
    return this.http
      .get<any>(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsApiKey}`
      )
      .pipe(
        tap((geoData) => {
          console.log(geoData);
        }),
        map((geoData: any) => {
          if (!geoData || !geoData.results || geoData.results.length == 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        })
      );
  }
  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=480x360&maptype=roadmap
    &markers=color:red%7Clabel:S%7C${lat},${lng}
    &key=${environment.googleMapsApiKey}`;
  }
}
