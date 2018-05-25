- add some debugging options here so that when we're paging through, we can
  stop or just load the first page so we can trace what's happening.

- TODO:
    - now merge the thinking behind index.html and index-singlepage.html and

        - create a singlepage viewer object
        - manually call render with the singlepage settings but use my
          per page handling logic from before
        - set it up so that I don't always have to destroy


- I'm totally stuck now

    - I can't figure out how to make index-singlepage change to the next page
    - I can't figure out how to makd index2 just display ONE page...


https://github.com/mozilla/pdf.js/issues/5765

https://github.com/mozilla/pdf.js/blob/d08895d6591b8b3233676a2ffa6a2c294cb70df7/web/pdf_viewer.js#L127-L158

https://stackoverflow.com/questions/31615248/pdf-js-changing-current-page-number-programmatically
