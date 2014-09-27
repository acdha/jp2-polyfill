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
* Upgrade to OpenJPEG 2.x, review Emscripten optimizations
* Use the image size to decode only the data needed (requires OpenJPEG 2)
* Use range requests to download only the required image size (requires OpenJPEG 2)
* Exposed API or data- attribute-driven controls?
* Support for WebP or JPEG XR
