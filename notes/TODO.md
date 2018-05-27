
- I have to rule out issues with the CANVAS before I fuck with the image URL
  data.  It could be that I'm just doing something wrong with the canvas or I
  have some other issue to deal with..

    - 

- FIXME: image and text issues:
    - my toDataURLHD still does not work. The changes are VERY subtle but they
      are there.

    - chrome LIES about the image being 100%... toDataURL might actually be working

    - the canvas we drawImage too might be the problem... I might need a better
      way to take snapshot of the screen...

       - https://github.com/mozilla/pdf.js/issues/7765
       - https://github.com/mozilla/pdf.js/issues/4252
       - https://bugs.chromium.org/p/chromium/issues/detail?id=7508#c83
       - https://stackoverflow.com/questions/40066166/canvas-text-rendering-blurry

       - http://wdobbie.com/pdf/

         - this is a webGL PDF.. see if I can use this technique to get perfect
           PDF text!!!

       - https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled


       - https://stackoverflow.com/questions/40066166/canvas-text-rendering-blurry/40074278

            - basically sub-pixel anti-aliasing doesn't work on canvas.  this
              demo shows it very well.

- - change imageResourcesPath to something reasonable... 



- fix the image fuzziness in output images.

    - create a side by side comparison with a second canvas and another img
    loaded from the second canvas ... and . also an image from teh primary
    canvas to see if it's just an issue of the data being copied.

- annotation-note.svg not loading because the images from the node packages
  are not in the path. Not sure the best solution here... specify 'base' or
  something

- do my OWN highlighting, don't let the pdf.js do it for me.  This way I can
  remove the issues with highlight color overlap when having two opacity regions
  on top of one another.  I think I just have to call the annotation extraction
  myself to get the regions and then do the highlight as a layered element I
  temporarily add and then remove.

- expand the highlight region into the elements that covers a smaller percentage of

- set it up to use docker

# Strategies around extracting the page as HTML that can be exported elsewhere

## Write some sort of 'canvas recorder'

Track which commands executed by chrome impacted the canvas at a specific region.

Then replay those commands in javascript via an embedded data URL encoding
HTML.

## copy the full page and then clip it

https://www.kirupa.com/html5/clipping_content_using_css.htm

This technique would require a huge amount of storage but it would work...

Try to just do it manually with a static HTML file...

Post to the reddit dev list fist asking for opinions on a solution?



https://stackoverflow.com/questions/23340610/how-to-create-easily-a-pdf-from-a-svg-with-jspdf

# convert directly to image
https://gist.github.com/ichord/9808444

- might not work because this code was 4 years old.

- ok.. canvas and PDF.js WILL work with toDataURL


var canvas = document.getElementsByTagName("canvas")[0]
canvas.toDataURL();

at 100% the image is 1020x1320
at 400% the image couldn't be rendered.. it went from 620k to 2.5MB


# This strategy will work

- use chrome headless
- render the page
- find every page
- then find the annotations on the page
- then get the canvas
- this will have the x,y coords and width+height of the selection.  This will
  allow us to convert it to an IMAGE. That's the first part.
- the SECOND part is harder... I need to convert it to text ... I will probably
  need to look at the HTML elements and their positionins and see where they
  are in the bounding box.

- it's using layers.. there's an annotation layer, a text layer, so I need to
  find the elements in that text layer... we can use offsetLeft, offsetTop,
  offsetWidth, and offsetHeight to extract the text properly.

- then, for the page marks, I can store them on the sides of the page.. and I can
  also keep notes this way.- I need to support using rectangle annotations to

- highlight figures I want to export too because I can't highlight them.

# Exporting raw HTML:

I might be able to duplicate the DOM, then remove everything else from it,
keeping JUST the nodes I need, then just calling outerHTML on that resulting,
pruned document.



- use something like this when creating my own annotations

https://github.com/Simonwep/selection
