import { Pipe, PipeTransform } from '@angular/core';
import {EssentialSelectFilteredItem, EssentialsSelectFilter} from './filters/filter.models';
import {EssentialSelectComponent} from "./essential-select.component";

@Pipe({
  name: 'essentialSelectFilter'
})
export class EssentialSelectFilterPipe implements PipeTransform {

  /**
   *
   * @param {Array<any>} value - список всех значений доступных для выбора
   * @param arg1 текст для поиска введеный пользователем
   * @param {EssentialsSelectFilter} args2 сам фильтр- предикат по которому будет делаться отсев элементов
   * @param {boolean} useMultiSelect
   * @param essentialSelectComponent
   * @param userHasInputTextToSearchBeforeSelect
   * @returns {any}
   */
  transform(value: Array<any>, arg1: any, args2: EssentialsSelectFilter, useMultiSelect: boolean, essentialSelectComponent: EssentialSelectComponent,
            userHasInputTextToSearchBeforeSelect: boolean): any {

    return value.filter(x => {
      const item = new EssentialSelectFilteredItem();
      item.originalObject = x;

      // dynamically pass text function
      item.textToShow = essentialSelectComponent.printItemValue(item.originalObject);
      // TODO: multiselect breaks
      return args2.shouldByShown(arg1, item, essentialSelectComponent.internalValue, userHasInputTextToSearchBeforeSelect);
    });
  }

}
