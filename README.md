# SVG Deconstruct
An SVG deconstructor that splits an SVG file into its outermost groups,
such that a file is formed for each individual group.
If Inkscape was used, the individual files will be their layer names.

## Usage
```
svg-deconstruct [options] input.svg [input1.svg ...]
```

### Options
```
-f, --force-overwrite   force overwrite deconstructed SVGs
-o, --output-dir [dir]  specify an output directory
-n, --no-opt            do not optimise using SVGO
```

## Example
Given the SVG file `input.svg`
```html
<svg viewBox="0 0 16 9">
  <g id="polygons">
    <rect width="8" height="9" fill="#d74444" />
    <rect x="8" width="8" height="4.5" fill="#2b9e2b" />
    <rect x="8" y=4.5 width="8" height="4.5" fill="#2f2fad" />
  </g>
  <g id="circle">
    <circle cx="8" cy="4.5" r="1" fill="white" />
  </g>
</svg>
```

Running `svg-deconstruct input.svg` creates a folder `input`,
with the files

_`input/input-circle.svg`_
```html
<svg viewBox="0 0 16 9">
  <g id="circle">
    <circle cx="8" cy="4.5" r="1" fill="white"></circle>
  </g>
</svg>
```

_`input/input-polygons.svg`_
```html
<svg viewBox="0 0 16 9">
  <g id="polygons">
    <rect width="8" height="9" fill="#d74444"></rect>
    <rect x="8" width="8" height="4.5" fill="#2b9e2b"></rect>
    <rect x="8" y="4.5" width="8" height="4.5" fill="#2f2fad"></rect>
  </g>
</svg>
```

## SVG Optimisation
While not required, [SVGO](https://github.com/svg/svgo) is recommended (and your preference for its presence will be asked if svg-deconstruct is
installed via npm). The SVG files are automatically optimised with its
presence, and the optimisation configuration can be found in `svgo/svgo.json`.

## Credits
1. Configuration for SVG optimisation adapted from the
[SVGO example script](https://github.com/svg/svgo/blob/master/examples/test.js)

2. DOM rendering adapted from a gist by
[siddMahen](https://gist.github.com/siddMahen/1486071)
