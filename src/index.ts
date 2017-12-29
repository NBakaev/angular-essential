import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EssentialSelectFilterPipe} from './essential-select/essential-select-filter.pipe';
import {EssentialSelectComponent} from './essential-select/essential-select.component';
import {FormsModule} from '@angular/forms';
import {EssentialSelectTruncatePipe} from './essential-select/essential-select-truncate.pipe';

export * from './essential-select/essential-select-filter.pipe';
export * from './essential-select/essential-select.component';
export * from './essential-select/essential-select.printable';
export * from './essential-select/essential-select.validator';
export * from './essential-select/essential-select-truncate.pipe';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    declarations: [
        EssentialSelectFilterPipe,
        EssentialSelectComponent,
        EssentialSelectTruncatePipe
    ], exports: [
        EssentialSelectComponent
    ]
})
export class EssentialSelectModule { }
