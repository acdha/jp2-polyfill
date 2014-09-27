JPEG 2000 Polyfill
==================

Experiment to see how realistic it would be to offer JavaScript-decoded JP2 images for browsers without native
support.

Demo
----

The all-features demo: http://acdha.github.io/jp2-polyfill/demo.html

The large-image demo http://acdha.github.io/jp2-polyfill/large-image.html currently will not load from Github
Pages unless someone wants to update it with a JP2 file available on a server which sets CORS headers. Until
then, you can run it locally for testing and benchmarks:

1. ``curl -LO http://lcweb2.loc.gov/service/gmd/gmdvhs/gvhs/gvhs01/vhs00068.jp2``
2. ``python3 -m http.server`` or ``python -m python -m SimpleHTTPServer``
3. Open http://127.0.0.1:8000/large-image.html and see whether your browser breaks

Dependencies
------------

* A browser which supports <canvas>
* CSS `background-image` requires WebKit or Mozilla extensions – it's not clear that there's a way to render
  a canvas as a background-image in IE without doing something heinous like using a massive data: URL
* OpenJPEG via Emscripten: currently this is best tackled using https://github.com/kripken/j2k.js but work is
  needed to update that to OpenJPEG 2 and extend the interface to support some of the features below

Major TODO items
----------------

1. Support for anything other than 8-bit RGB images
2. Implement <picture> support
3. Improved compatibility with existing element styles
4. Upgrade to OpenJPEG 2.x, review Emscripten optimizations
5. Use the image size to decode only the data needed (requires OpenJPEG 2)
6. Use range requests to download only the required image size (requires OpenJPEG 2)
7. Exposed API or data- attribute-driven controls?
8. Support for WebP or JPEG XR

1, 4, 5, 6 would all benefit from creating a custom decompressor which would always decode to 8-bit RGBA and
can receive target output dimensions to allow decoding less data for downsampled images. This could be as
simple as forking ``opj_decompress`` since that could be developed and tested independently against the C
version first but there's an argument for directly exposing and using the library bindings to decode into the
canvas as early as possible to reduce memory usage.
