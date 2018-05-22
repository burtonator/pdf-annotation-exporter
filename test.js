function getAnnotations(page,type) {

    var clazz = type + "Annotation";

    var result = [];

    var annotationElements = page.querySelectorAll(".annotationLayer ." + clazz + ", .annotationLayer .popupAnnotation")

    for (var idx = 0; idx < annotationElements.length; ++idx) {

        var annotationElement = annotationElements[idx];

        if (annotationElement.getAttribute("class") === clazz) {

            var entry = { annotation: null, popup: null};
            entry.annotation = annotationElement;

            // now see if we have an associated popup by looking ahead to the
            // next annotation.

            var nextAnnotationElement = annotationElements[idx+1];

            if (nextAnnotationElement && nextAnnotationElement.getAttribute("class") === "popupAnnotation") {
                entry.popup = nextAnnotationElement;
            }

            result.push(entry);

        }

    }

    return result;

}

console.log("hjere at least");

var page = document.querySelectorAll(".page")[0];

var annotations = getAnnotations(page,"highlight")
console.log(annotations);


