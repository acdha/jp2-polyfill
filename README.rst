JPEG 2000 Polyfill
==================

Experiment to see how realistic it would be to offer JavaScript-decoded JP2 images for browsers without native
support.

Dependencies:

* https://github.com/kripken/j2k.js

Major TODO items
----------------

* Support for anything other than 8-bit RGB images
* Implement <picture> support
* Improved compatibility with existing element styles
* Upgrade to OpenJPEG 2.x, Emscripten optimizations
* Exposed API or data- attribute-driven controls?
* Support for WebP or JPEG XR