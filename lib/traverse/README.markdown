traverse
========

Traverse and transform objects by visiting every node on a recursive walk.

examples
========

transform negative numbers in-place
-----------------------------------

negative.js
    var Traverse = require('traverse');
    var obj = [ 5, 6, -3, [ 7, 8, -2, 1 ], { f : 10, g : -13 } ];
    
    Traverse(obj).forEach(function (x) {
        if (x < 0) this.update(x + 128);
    });
    
    console.dir(obj);

output
    [ 5, 6, 125, [ 7, 8, 126, 1 ], { f: 10, g: 115 } ]

collect leaf nodes
------------------

leaves.js
    var Traverse = require('traverse');

    var obj = {
        a : [1,2,3],
        b : 4,
        c : [5,6],
        d : { e : [7,8], f : 9 },
    };

    var leaves = Traverse(obj).reduce(function (acc, x) {
        if (this.isLeaf) acc.push(x);
        return acc;
    }, []);
    
    console.dir(leaves);

output
    [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]

context
=======

Each method that takes a callback has a context (its `this` object) with these
attributes:

this.node
---------

The present node on the recursive walk

this.path
---------

An array of string keys from the root to the present node

this.parent
-----------

The context of the node's parent.
This is `undefined` for the root node.

this.key
--------

The name of the key of the present node in its parent.
This is `undefined` for the root node.

this.isRoot, this.notRoot
-------------------------

Whether the present node is the root node

this.isLeaf, this.notLeaf
-------------------------

Whether or not the present node is a leaf node (has no children)

this.level
----------

Depth of the node within the traversal

this.circular
-------------

If the node equals one of its parents, the `circular` attribute is set to the
context of that parent and the traversal progresses no deeper.

this.update(value)
------------------

Set a new value for the present node.

this.remove()
-------------

Remove the current element from the output. If the node is in an Array it will
be spliced off. Otherwise it will be deleted from its parent.

this.delete()
-------------

Delete the current element from its parent in the output. Calls `delete` even on
Arrays.

this.before(fn)
---------------

Call this function before any of the children are traversed.

this.after(fn)
--------------

Call this function after any of the children are traversed.

this.pre(fn)
------------

Call this function before each of the children are traversed.

this.post(fn)
-------------

Call this function after each of the children are traversed.

methods
=======

.map(fn)
--------

Execute `fn` for each node in the object and return a new object with the
results of the walk. To update nodes in the result use `this.update(value)`.

.forEach(fn)
------------

Execute `fn` for each node in the object but unlike `.map()`, when
`this.update()` is called it updates the object in-place.

.reduce(fn, acc)
----------------

For each node in the object, perform a
[left-fold](http://en.wikipedia.org/wiki/Fold_(higher-order_function))
with the return value of `fn(acc, node)`.

If `acc` isn't specified, `acc` is set to the root object for the first step
and the root element is skipped.

.paths()
--------

Return an `Array` of every possible non-cyclic path in the object.
Paths are `Array`s of string keys.

.nodes()
--------

Return an `Array` of every node in the object.

.clone()
--------

Create a deep clone of the object.

installation
============

Using npm:
    npm install traverse

Or check out the repository and link your development copy:
    git clone http://github.com/substack/js-traverse.git
    cd js-traverse
    npm link .

You can test traverse with "expresso":http://github.com/visionmedia/expresso
(`npm install expresso`):
    js-traverse $ expresso
    
    100% wahoo, your stuff is not broken!

hash transforms
===============

This library formerly had a hash transformation component. It has been
[moved to the hashish package](https://github.com/substack/node-hashish).
