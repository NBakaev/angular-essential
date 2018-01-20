import {Pipe, PipeTransform} from '@angular/core';
import {EssentialSelectComponent} from "./essential-select.component";

@Pipe({
  name: 'essentialSelectTruncate'
})
export class EssentialSelectTruncatePipe implements PipeTransform{
  transform(value: string, es: EssentialSelectComponent): string {
    if (!value) {
      return '';
    }
    let answer: string = value;
    // console.log(value.length);
    // console.log(limit);

    // es.pipeNumber++;

    es.findPlaceholderLength(answer);

    if (es.isOpenEditable()){
      return value;
    }

    if (value.length > es.limit) {
      answer = value.substr(0, es.limit - 3);
      answer += '...';
    }
    return answer;
  }
}
