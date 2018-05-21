
# copy the full page and then clip it

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
