// all our unit tests...

var assert = chai.assert;    // Using Assert style

describe('test box overlap', function() {

    it('with top left overlap', function() {
        // Test implementation goes here

        var child = [ {x : 10, y: 10}, {x: 20, y: 20} ];
        var parent = [ {x : 15, y: 15}, {x: 40, y: 40} ];

        var overlap = computeOverlap(child, parent);
        assert.equal(overlap, 25);

    });


    it('with bottom right overlap', function() {
        // Test implementation goes here

        var child = [ {x : 15, y: 15}, {x: 40, y: 40} ];
        var parent = [ {x : 10, y: 10}, {x: 20, y: 20} ];

        var overlap = computeOverlap(child, parent);
        assert.equal(overlap, 25);

    });

    it('with no overlap', function() {
        // Test implementation goes here


        var child = [ {x : 15, y: 15}, {x: 40, y: 40} ];
        var parent = [ {x : 50, y: 50}, {x: 90, y: 90} ];

        var overlap = computeOverlap(child, parent);
        assert.equal(overlap, 0);

    });

});

