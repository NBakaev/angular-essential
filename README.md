# Angular Essential Select
Select component

 - AOT compatible
 - Works with NgForms
 - Select one/multi options with a lot of customizations
 - Angular 5+
 - [Demo and examples](https://nbakaev.com/demo/tech/essential-select/#/demo_all)
 - https://www.npmjs.com/package/angular-essential-select

## Installation

To install this library, run:

```bash
$ npm install angular-essential-select --save
```

and then import EssentialSelectModule in your Angular `AppModule`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {EssentialSelectModule} from 'angular-essential-select';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    EssentialSelectModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```


## Development

To generate all `*.js`, `*.d.ts` and `*.metadata.json` files:

```bash
$ npm run build
```

```bash
$ npm run build:watch
```

To lint all `*.ts` files:

```bash
$ npm run lint
```

## License

MIT © [Nikita Bakaev](mailto:ya@nbakaev.ru)
