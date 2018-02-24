import {ModuleWithProviders, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {EssentialSelectFilterPipe} from './essential-select/essential-select-filter.pipe';
import {EssentialSelectComponent} from './essential-select/essential-select.component';
import {FormsModule} from '@angular/forms';
import {EssentialSelectTruncatePipe} from './essential-select/essential-select-truncate.pipe';
import {EssentialSelectModuleConfig} from './essential-select/essential-select-config';

export * from './essential-select/essential-select-filter.pipe';
export * from './essential-select/filters/filter.models';
export * from './essential-select/filters/text-to-show.essential-filter';
export * from './essential-select/essential-select.component';
export * from './essential-select/essential-select.printable';
export * from './essential-select/essential-select.validator';
export * from './essential-select/essential-select-truncate.pipe';
export * from './essential-select/essential-select.settings';
export * from './essential-select/essential-select-config';

const DEFAULT_LANGUAGE = 'en-US';

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
    ],
    providers: [
        {provide: EssentialSelectModuleConfig, useValue: {} }]
})
export class EssentialSelectModule {

    static forRoot(config: EssentialSelectModuleConfig = {defaultLanguage: DEFAULT_LANGUAGE}): ModuleWithProviders {
        return {
            ngModule: EssentialSelectModule,
            providers: [
                {provide: EssentialSelectModuleConfig, useValue: config},
            ]
        };
    }

}
