import Quadtree from '../../src/quadtree.js'
import { init, getCanvas } from '../../src/core.js'

// --------------------------------------------------
// quadtree
// --------------------------------------------------
describe('quadtree', () => {

  before(() => {
    if (!getCanvas()) {
      let canvas = document.createElement('canvas');
      canvas.width = canvas.height = 600;
      init(canvas);
    }
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {

    it('should create an initial bounding box', () => {
      let quadtree = Quadtree();

      expect(typeof quadtree.bounds).to.equal('object');
      expect(quadtree.bounds.x).to.equal(0);
      expect(quadtree.bounds.y).to.equal(0);
      expect(quadtree.bounds.width).to.equal(getCanvas().width);
      expect(quadtree.bounds.height).to.equal(getCanvas().height);
    });

    it('should allow you to set the maxDepth and maxObject counts', () => {
      let quadtree = Quadtree({
        maxDepth: 1,
        maxObjects: 10
      });

      expect(quadtree.maxDepth).to.equal(1);
      expect(quadtree.maxObjects).to.equal(10);
    });

  });





  // --------------------------------------------------
  // add
  // --------------------------------------------------
  describe('add', () => {
    let quadtree;

    beforeEach(() => {
      quadtree = Quadtree({
        maxObjects: 5,
        bounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }
      });
    });

    afterEach(() => {
      quadtree.clear();
    });

    it('should add an object to the quadtree', () => {
      quadtree.add({id: 1});

      expect(quadtree.objects.length).to.equal(1);
    });

    it('should take multiple objects and add them to the quadtree', () => {
      quadtree.add({id: 1}, {id: 2}, {id: 3});

      expect(quadtree.objects.length).to.equal(3);
    });

    it('should take an array of objects and add them to the quadtree', () => {
      quadtree.add([{id: 1}, {id: 2}], {id: 3});

      expect(quadtree.objects.length).to.equal(3);
    });

    it('should split the quadtree if there are too many objects', () => {
      for (let i = 0; i < 5; i++) {
        quadtree.add({id: i});
      }

      expect(quadtree.objects.length).to.equal(5);
      expect(quadtree.subnodes.length).to.equal(0);

      quadtree.add({id: 4});

      expect(quadtree.objects.length).to.equal(0);
      expect(quadtree.subnodes.length).to.equal(4);
    });

    it('should make each subnode 1/4 the size of the bounds when split', () => {
      for (let i = 0; i < 6; i++) {
        quadtree.add({id: i});
      }

      expect(quadtree.subnodes[0].bounds).to.eql({x: 0, y: 0, width: 50, height: 50});
      expect(quadtree.subnodes[1].bounds).to.eql({x: 50, y: 0, width: 50, height: 50});
      expect(quadtree.subnodes[2].bounds).to.eql({x: 0, y: 50, width: 50, height: 50});
      expect(quadtree.subnodes[3].bounds).to.eql({x: 50, y: 50, width: 50, height: 50});
    });

    it('should add split objects to their correct subnodes', () => {
      let subnode;
      let objects = [
        {id: 0, x: 15, y: 10, width: 10, height: 10}, // quadrant 0
        {id: 1, x: 30, y: 20, width: 10, height: 10}, // quadrant 0
        {id: 2, x: 45, y: 30, width: 10, height: 10}, // quadrant 0,1
        {id: 3, x: 60, y: 40, width: 10, height: 10}, // quadrant 1,3
        {id: 4, x: 75, y: 50, width: 10, height: 10}, // quadrant 3
        {id: 5, x: 90, y: 60, width: 10, height: 10}  // quadrant 3
      ];

      quadtree.add(objects);

      // quadrant 0
      subnode = quadtree.subnodes[0].objects;

      expect(subnode.length).to.equal(3);
      expect(subnode.indexOf(objects[0])).to.not.equal(-1);
      expect(subnode.indexOf(objects[1])).to.not.equal(-1);
      expect(subnode.indexOf(objects[2])).to.not.equal(-1);

      // quadrant 1
      subnode = quadtree.subnodes[1].objects;

      expect(subnode.length).to.equal(2);
      expect(subnode.indexOf(objects[2])).to.not.equal(-1);
      expect(subnode.indexOf(objects[3])).to.not.equal(-1);

      // quadrant 2
      subnode = quadtree.subnodes[2].objects;

      expect(subnode.length).to.equal(0);

      // quadrant 3
      subnode = quadtree.subnodes[3].objects;

      expect(subnode.length).to.equal(3);
      expect(subnode.indexOf(objects[3])).to.not.equal(-1);
      expect(subnode.indexOf(objects[4])).to.not.equal(-1);
      expect(subnode.indexOf(objects[5])).to.not.equal(-1);
    });

    it('should add an object to a subnode if the quadtree is already split', () => {
      for (let i = 0; i < 6; i++) {
        quadtree.add({id: i});
      }

      let object = {x: 10, y: 10, width: 10, height: 10};
      let subnode = quadtree.subnodes[0].objects;

      quadtree.add(object);

      expect(subnode.length).to.equal(1);
      expect(subnode[0]).to.equal(object);
    });

    it('shouldn\'t split a quadtree node twice after clearing', () => {
      // cause the tree to split
      for (let i = 0; i < 6; i++) {
        quadtree.add({id: i});
      }

      let subnodes = quadtree.subnodes;

      quadtree.clear();

      // cause to split again
      for (let i = 0; i < 6; i++) {
        quadtree.add({id: i});
      }

      // since splitting overrides the subnodes with new values this should
      // test that the subnodes were left alone after the 2nd split
      expect(quadtree.subnodes).to.equal(subnodes);
    });

  });





  // --------------------------------------------------
  // clear
  // --------------------------------------------------
  describe('clear', () => {
    let quadtree;

    beforeEach(() => {
      quadtree = Quadtree({
        maxObjects: 5,
        bounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }
      });
    });

    it('should clear all objects of the quadtree', () => {
      for (let i = 0; i < 4; i++) {
        quadtree.add({id: i, x: i*15, y: i*10, width: 10, height: 10});
      }

      quadtree.clear();

      expect(quadtree.objects.length).to.equal(0);
    });

    it('should clear all objects in subnodes of the quadtree', () => {
      for (let i = 0; i < 9; i++) {
        quadtree.add({id: i, x: i*10, y: i*10, width: 10, height: 10});
      }

      quadtree.clear();

      expect(quadtree.objects.length).to.equal(0);
      expect(quadtree.subnodes[0].objects.length).to.equal(0);
      expect(quadtree.subnodes[1].objects.length).to.equal(0);
      expect(quadtree.subnodes[2].objects.length).to.equal(0);
      expect(quadtree.subnodes[3].objects.length).to.equal(0);
    });

  });





  // --------------------------------------------------
  // get
  // --------------------------------------------------
  describe('get', () => {
    let quadtree;

    beforeEach(() => {
      quadtree = Quadtree({
        maxObjects: 5,
        bounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }
      });
    });

    afterEach(() => {
      quadtree.clear();
    });

    it('should return an object in the same node as the passed object', () => {
      let object = {x: 10, y: 10, width: 10, height: 10};

      quadtree.add(object);

      let getObjects = quadtree.get({x: 30, y: 30, width: 20, height: 20});

      expect(getObjects.length).to.equal(1);
      expect(getObjects[0]).to.equal(object);
    });

    it('should return all objects in multiple subnodes if the object intercepts multiple subnodes', () => {
      let objects = [
        {x: 10, y: 10, width: 10, height: 10},
        {x: 60, y: 10, width: 10, height: 10}
      ];

      quadtree.add(objects);

      let getObjects = quadtree.get({x: 45, y: 25, width: 20, height: 20});

      expect(getObjects.length).to.equal(2);
      expect(getObjects[0]).to.equal(objects[0]);
      expect(getObjects[1]).to.equal(objects[1]);
    });

    it('should return objects from leaf nodes', () => {
      let objects = [
        {x: 0, y: 0, width: 10, height: 10},
        {x: 10, y: 10, width: 10, height: 10},
        {x: 20, y: 20, width: 10, height: 10},
        {x: 30, y: 30, width: 10, height: 10},
        {x: 40, y: 40, width: 10, height: 10},
        {x: 50, y: 50, width: 10, height: 10},
        {x: 60, y: 10, width: 10, height: 10}
      ];

      quadtree.add(objects);

      let getObjects = quadtree.get({x: 5, y: 25, width: 20, height: 20});

      expect(getObjects.length).to.equal(5);
      expect(getObjects[0]).to.equal(objects[0]);
      expect(getObjects[1]).to.equal(objects[1]);
      expect(getObjects[2]).to.equal(objects[2]);
      expect(getObjects[3]).to.equal(objects[3]);
      expect(getObjects[4]).to.equal(objects[4]);
    });

  });

});