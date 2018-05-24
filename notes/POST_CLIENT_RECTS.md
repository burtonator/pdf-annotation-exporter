Subject: getClientBoundingRects returns incorrect values for x,y yet DOM tools shows the right value?

I really need your guys help with this.

I'm working on a proof of concept of screenshot-ing parts of the DOM within
PDFs (using PDF.js).

PDF.js is using canvas but I'm able to use the DOM explorer to click on the
element and properly see its width and height.

However offset(top,left,etc) and getClientBoundingRect do not show the actual
position of the element.

I know that both Firefox and Chrome can show the right x,y and width and height
because I can just use DOM explorer, click on the element and see that it
properly highlighted it.

The computed style is wrong and so are client bounding rects.

PDF.js uses CSS transforms on the element for some weird positioning tricks
so I think getClientBoundingRect isn't taking that into account?

How does Chrome/Firefox get the EXACT position?  If I just do whatever DOM
explorer is doing then I should be fine.

You would would REALLY help me out with this!

I attached a few screenshots to show what I mean.

https://imgur.com/MV79HOg

https://imgur.com/wbfj505