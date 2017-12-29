import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'essentialSelectTruncate'
})
export class EssentialSelectTruncatePipe implements PipeTransform{
  transform(value: string, limit: number): string {
    if (!value) {
      return '';
    }
    let answer: string = value;
    // console.log(value.length);
    // console.log(limit);
    if (value.length > limit) {
      answer = value.substr(0, limit - 3);
      answer += '...';
    }
    return answer;
  }
}
