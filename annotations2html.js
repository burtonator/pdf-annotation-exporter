// convert an annotations json export to html for debug (and other) purposes

fs = require('fs')

fs.readFile('example.json.txt', 'utf8', function (err,data) {

    if (err) {
        return console.log(err);
    }

    var obj = JSON.parse(data)

    obj.pages.forEach(function(page) {

        page.annotations.forEach(function(annotation) {

            console.log(`<img src="%s">`, annotation.image);

            console.log("<hr>");

        } );

        console.log("<hr>");

    });


});