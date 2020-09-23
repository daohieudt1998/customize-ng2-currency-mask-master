import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'mytest';
    value = 0;
    formGroup: FormGroup;
    constructor(private fb: FormBuilder) {
    }

    ngOnInit() {
        this.createForm();
    }

    createForm() {
        this.formGroup = this.fb.group({
            age: [null],
        });
    }

    submit() {
        console.log(this.formGroup.getRawValue());
        // const input = document.getElementById('test') as HTMLInputElement;
        // input.focus();
        // input.setSelectionRange(0, 3);
    }


}
