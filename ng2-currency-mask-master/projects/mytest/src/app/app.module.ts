import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { AppComponent } from './app.component';
export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
    align: "right",
    allowNegative: true,
    decimal: ",",
    precision: 3,
    prefix: "",
    suffix: "",
    thousands: "."
};

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        CurrencyMaskModule,
        ReactiveFormsModule
    ],
    providers: [
        { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
