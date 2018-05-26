// all our unit tests...

var assert = chai.assert;
var expect = chai.expect;

chai.config.truncateThreshold = 0;

describe('test box overlap', function() {

    it('with top left overlap', function() {

        var child = [ {x : 10, y: 10}, {x: 20, y: 20} ];
        var parent = [ {x : 15, y: 15}, {x: 115, y: 115} ];

        var overlap = computeOverlap(child, parent);
        console.log(overlap)
        expect(overlap).to.deep.equal(
            {
                overlapX: { overlap: 5, childCoverage: 0.5, parentCoverage: 0.05 },
                overlapY: { overlap: 5, childCoverage: 0.5, parentCoverage: 0.05 },
                overlap: 5
            } );

    });


    it('with bottom right overlap', function() {

        var child = [ {x : 15, y: 15}, {x: 40, y: 40} ];
        var parent = [ {x : 10, y: 10}, {x: 20, y: 20} ];

        var overlap = computeOverlap(child, parent);
        expect(overlap).to.deep.equal(
            {
                overlapX: { overlap: 5, childCoverage: 0.2, parentCoverage: 0.5 },
                overlapY: { overlap: 5, childCoverage: 0.2, parentCoverage: 0.5 },
                overlap: 5
            } );

    });

    it('with no overlap', function() {

        var child = [ {x : 15, y: 15}, {x: 40, y: 40} ];
        var parent = [ {x : 50, y: 50}, {x: 90, y: 90} ];

        var overlap = computeOverlap(child, parent);
        expect(overlap).to.deep.equal(
            {
                overlapX: { overlap: 0, childCoverage: 0, parentCoverage: 0 },
                overlapY: { overlap: 0, childCoverage: 0, parentCoverage: 0 },
                overlap: 0
            });

    });

});

