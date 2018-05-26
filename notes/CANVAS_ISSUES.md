tl;dr:

I'm trying to get a HIGH QUALITY image out of canvas.  toDataURL() is
attenuating the output.

Is there a way to get the raw canvas data and then generate my own PNG to
keep the quality high?

...

I have an HTML canvas I'm trying to convert to an high quality mirror image of
the source canvas.

The problem I have is that the output is attenuated compared to the original.

I'm using the toDataURL() method on the canvas to get the image.

Here are some screenshots...

screenshot from canvas toDataURL (blurry):

https://i.imgur.com/e7CUpza.png

raw screenshot from OS (crisp):

https://i.imgur.com/DaM4dQG.png

The difference is subtle but this is for archival purposes and I expect to be
reading using this for years so I want it perfect.

Additionally, the problems get worse depending on the size of the image.

I think the following might be causing the problem:

1.  toDataURL() seems to truncate the image if the canvas is large.

I've confirmed this by taking a large 2048x1024 canvas and calling toDataURL on
it and then I get back roughly an image that's half the size (in terms of
pixels).

This is probably 80% of the problem.

I suspect what's happening is that Chrome sees that the resulting URL is too
large (>3MB), then keeps resizing the image until it is < 3MB.

2.  There are some comments about toDataURL being 96DPI.  I don't know how that
could be an issue since it's pixels before AND after. Not sure why inches
would be involved.

3. I'm using PNG so compression shouldn't be the problem.  I tried jpeg and webp
with quality 1.0 with the same results.



