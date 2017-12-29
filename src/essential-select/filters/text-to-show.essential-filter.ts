import {EssentialSelectFilteredItem, EssentialsSelectFilter} from './filter.models';

export class TextToShowEssentialFilter implements EssentialsSelectFilter {

  shouldByShown(requestedText: string, item: EssentialSelectFilteredItem, currentValue: any, userHasInputTextToSearchBeforeSelect: boolean): boolean {
    if (userHasInputTextToSearchBeforeSelect === false) {
      return true;
    }

    const result = item.textToShow.search(new RegExp(requestedText, 'i'));
    return result !== -1;
  }

}
