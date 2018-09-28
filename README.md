# less-plugin-trim-font-face

[![npm version](https://badge.fury.io/js/less-plugin-trim-font-face.svg)](https://badge.fury.io/js/less-plugin-trim-font-face)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

Trim useless formats in `@font-face` of Less files. Compatible with Less v2 and v3.

# Promgrammatic usage

```javascript
const TrimFontFace = require('less-plugin-trim-font-face')

less.render('You less source', {
    plugins: [
        new TrimFontFace({
            'iconfont': ['woff']
        })
    ]
})
```

It will trim useless font formats but `woff` if `font-family` is `iconfont` in `@font-face` directives.

For example. If your less source like:

```less
@font-face {
  font-family: "iconfont";
  src: url('/fonts/iconfont.eot?t=1522658144332');
  src: url('/fonts/iconfont.eot?t=1522658144332#iefix') format('embedded-opentype'),
    url('/fonts/iconfont.woff') format('woff'),
    url('iconfont.ttf?t=1522658144332') format('truetype'),
    url('iconfont.svg?t=1522658144332#iconfont') format('svg');
}
```

You will get output:

```less
@font-face {
  font-family: "iconfont";
  src: url('/fonts/iconfont.woff') format('woff');
}
```

***

MIT
