'use strict';

const im = require('imagemagick');

const inputPath = '/Users/jlorie/Downloads/test-images/input';
const outputPath = '/Users/jlorie/Downloads/test-images/output';
const width = 300; // output width in pixels

let args = [
  inputPath,
  '-filter',
  'Triangle',
  '-define',
  'filter:support=2',
  '-thumbnail',
  width,
  '-unsharp 0.25x0.25+8+0.065',
  '-dither None',
  '-posterize 136',
  '-quality 82',
  '-define jpeg:fancy-upsampling=off',
  '-define png:compression-filter=5',
  '-define png:compression-level=9',
  '-define png:compression-strategy=1',
  '-define png:exclude-chunk=all',
  '-interlace none',
  '-colorspace sRGB',
  '-strip',
  outputPath
];

im.convert(args, (err, stdout, stderr) => {
  if (err) {
    return console.info('==> Err: ', err);
  }

  console.info('==> stdout: ', stdout);
  console.info('==> stderr: ', stderr);
});
