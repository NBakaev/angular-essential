# Angular Essential Select
![https://badge.fury.io/js/angular-essential-select](https://badge.fury.io/js/angular-essential-select.svg) ![https://teamcity.nbakaev.com/viewType.html?buildTypeId=btN&guest=1](https://teamcity.nbakaev.com/app/rest/builds/buildType:AngularEssentialSelect_Build/statusIcon) 

Angular select component

![](https://nbakaev.com/demo/tech/essential-select-binary/es-select-img.png)

 - AOT compatible
 - Works with NgForms
 - Select one/multi options with a lot of customizations
 - Angular 5+
 - [Demo and examples](https://nbakaev.com/demo/tech/essential-select/#/demo_all)

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

Or you can force to use some language by default
`EssentialSelectModule.forRoot({forcedDefaultLanguage: "en-US"}),
`

## Versions

### ES 2.x.x
Targets Angular 5. Right now that version is on support only. There won't be any releases with new features - only with bugfixes.
NodeJS 8.11.1 is preferable.

### ES 3.x.x
 - Version 3 is the latest version and targets Angular 6
NodeJS 10.0.0 is preferable.

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

Development and snapshot build are available via [artifactory](https://artifactory.nbakaev.com/artifactory/webapp/#/artifacts/browse/tree/General/npm-local/angular-essential-select/-)

## License

MIT © [Nikita Bakaev](mailto:ya@nbakaev.ru)
