
function isWithinBoxUsingOverlap() {

    // see if ANY percentage of the box is within the given region.



}

function computeOverlap(b0,b1) {

    // compute the overlap box
    point0 = {x: Math.max( b0.x, b1.x) }

    var x_overlap = Math.max(0, Math.min(b0[1].x, b1[1].x) - Math.max(b0[0].x, b1[0].x));
    var y_overlap = Math.max(0, Math.min(b0[1].y, b1[1].y) - Math.max(b0[0].y, b1[0].y));

    return x_overlap * y_overlap;

}

function test0() {

    var box0 = [ {x : 10, y: 10}, {x: 20, y: 20} ];
    var box1 = [ {x : 15, y: 15}, {x: 40, y: 40} ];

    var overlap = computeOverlap(box0, box1);
    console.log(overlap);

}

function test1() {

    var box0 = [ {x : 15, y: 15}, {x: 40, y: 40} ];
    var box1 = [ {x : 10, y: 10}, {x: 20, y: 20} ];

    var overlap = computeOverlap(box0, box1);
    console.log(overlap);

}

function test2() {

    var box0 = [ {x : 15, y: 15}, {x: 40, y: 40} ];
    var box1 = [ {x : 50, y: 50}, {x: 90, y: 90} ];

    var overlap = computeOverlap(box0, box1);
    console.log(overlap);

}


test0();
test1();
test2();