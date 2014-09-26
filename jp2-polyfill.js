/* global console, openjpeg */

(function () {
    'use strict';

    var renderEvent = new Event('jp2-polyfill-render');

    function loadOpenJPEG() {
        var s = document.createElement('script');

        if (s.addEventListener) {
            s.addEventListener('load', initPolyfill, false);
        } else if (s.readyState) {
            // IE 10 and worse:
            s.onreadystatechange = function () {
                if (s.readyState == 'loaded' || s.readyState == 'complete') {
                    initPolyfill();
                }
            };
        }

        s.src = 'external/openjpeg.js';

        var firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(s, firstScript);
    }

    function initPolyfill() {
        console.log('JPEG-2000 polyfill loading');

        updateImageTags();
        updateBackgroundImages();

        console.log('JPEG-2000 polyfill complete');
    }

    function updateImageTags() {
        var imgs = document.querySelectorAll('img');
        for (var i = 0; i < imgs.length; i++) {
            var img = imgs[i];

            // TODO: simply require a data- attribute or src ends with .jp2/j2k?

            if (img.complete && img.naturalWidth !== undefined && img.naturalWidth > 0) {
                console.log('Skipping loaded', img);
                continue;
            }

            var canvas = createCanvasFromUrl(img.src);
            canvas.id = img.id;
            canvas.className = img.className;

            if (img.attributes.style) {
                canvas.setAttribute('style', img.attributes.style.value);
            }

            if (img.style.display) {
                canvas.style.display = img.style.display;
            } else {
                canvas.style.display = 'inline';
            }

            // FIXME: copy computed styles or punt outright?

            // img.parentNode.insertBefore(canvas, img.nextSibling);
            img.parentNode.replaceChild(canvas, img);
        }
    }

    function createCanvasFromUrl(src) {
        var canvas = document.createElement('canvas'),
            xhr = new XMLHttpRequest(),
            fileType = (src.indexOf('.j2k') > -1) ? 'j2k' : 'jp2';

        xhr.open('GET', src);
        xhr.responseType = 'arraybuffer';
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) {
                return;
            }

            if (xhr.status !== 200 && xhr.status !== 0) {
                throw "Unable to load image data: XHR status " + xhr.status + " for " + src;
            }

            var bytes = new Uint8Array(xhr.response),
                imageRGB, imageRGBA,
                startTime, endTime;

            startTime = Date.now();
            imageRGB = openjpeg(bytes, fileType);
            endTime = Date.now();
            console.log('Decode of %s took %dms', src, endTime - startTime);

            canvas.width = imageRGB.width;
            canvas.height = imageRGB.height;

            var ctx = canvas.getContext('2d');

            var pixelsPerChannel = imageRGB.width * imageRGB.height;
            imageRGBA = ctx.createImageData(imageRGB.width, imageRGB.height);

            // FIXME: handle alpha channel
            // FIXME: handle different color depths and layouts

            var i = 0, j = 0;
            while (i < imageRGBA.data.length && j < pixelsPerChannel) {
                imageRGBA.data[i] = imageRGB.data[j]; // R
                imageRGBA.data[i + 1] = imageRGB.data[j + pixelsPerChannel]; // G
                imageRGBA.data[i + 2] = imageRGB.data[j + (2 * pixelsPerChannel)]; // B
                imageRGBA.data[i + 3] = 255; // A

                // Next pixel
                i += 4;
                j += 1;
            }

            ctx.putImageData(imageRGBA, 0, 0);

            canvas.dispatchEvent(renderEvent);
        };

        xhr.send(null);
        return canvas;
    }

    function updateBackgroundImages() {
        // There's no efficient way to do this without using something like a class to opt-in
        // and scanning every element seems a bit wasteful
        var elements = document.querySelectorAll('.jp2-background-image');

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i],
                url = window.getComputedStyle(element, false).backgroundImage.slice(4, -1);

            url = url.replace(/^(['"])(.+)\1$/, '$2');

            var canvas = createCanvasFromUrl(url);

            // The element must be in the DOM to render but it can be hidden:
            canvas.style.display = 'none';
            document.body.appendChild(canvas);

            var id = 'jp2-polyfill-' + i;

            if ('getCSSCanvasContext' in document) {
                element.style.backgroundImage = '-webkit-canvas(' + id + ')';
                canvas.addEventListener('jp2-polyfill-render', function () {
                    var ctx = document.getCSSCanvasContext('2d', id, canvas.width, canvas.height);
                    ctx.drawImage(canvas, 0, 0);
                });
            } else {
                canvas.id = id;
                element.style.backgroundImage = '-moz-element(#' + id + ')';
            }
        }
    }

    // There's no standard way to detect the image formats supported by the current browser
    // so we'll create a test image and

    var img = new Image();
    img.onerror = img.load = function () {
        if (!img.width || img.width === 0) {
            console.log('Polyfill appears to be necessary:', img.width, img.height);
            loadOpenJPEG();
        }
    };

    // This is a 4px image because OpenJPEG does not appear to support 1px:
    img.src = 'data:image/jp2;base64,AAAADGpQICANCocKAAAAFGZ0eXBqcDIgAAAAAGpwMiAAAAAtanAyaAAAABZpaGRyAAAABAAAAAQAAw8HAAAAAAAPY29scgEAAAAAABAAAABpanAyY/9P/1EALwAAAAAABAAAAAQAAAAAAAAAAAAAAAQAAAAEAAAAAAAAAAAAAw8BAQ8BAQ8BAf9SAAwAAAABAQAEBAAB/1wABECA/5AACgAAAAAAGAAB/5PP/BAQFABcr4CA/9k=';
})();

