# backbone-relation

[![Build Status](https://travis-ci.org/CodeYellowBV/backbone-relation.svg?branch=master)](https://travis-ci.org/CodeYellowBV/backbone-relation)
[![Coverage Status](https://coveralls.io/repos/github/CodeYellowBV/backbone-relation/badge.svg?branch=master)](https://coveralls.io/github/CodeYellowBV/backbone-relation?branch=master)

Backbone does not support relations by default. This is a simple package that adds relations to Backbone.

The idea is simple: you can define relations like you define defaults. A relation can be either a Model or a Collection and attributes can be set recursively through the parent.

Why use this over [backbone-relational](http://backbonerelational.org/)?
We found backbone-relational too complex. Itʼs basically an ORM in the frontend. We didnʼt need that, hence this package.

## Defining relations

You can define relations using the `relations` attribute. It can either be a hash or a function that returns a hash. There are a few different ways to define relations:

### Simple

The simplest form without any options. Example:

```js
var MAuthor = Model.extend({
    relations: {
        // This is a simple relation where MUser is a Model.
        user: MUser,

        // Here we define an attribute which should be a collection.
        posts: CPost,
    }
})
```

### Advanced

With this form you can add a bit more configuration options. These are the options at the moment:

| Key | Description |
| --- | ----------- |
| `constructor` | The constructor for the relation. This can either be a `Backbone.Model` or a `Backbone.Collection`.

Example:

```js
var MAuthor = Model.extend({
    relations: {
        // Similar to posts, just another syntax. This supports more complex configuration options.
        contacts: {relationClass: CContact}
    }
})
```

## Setting related data

The most basic form of setting a related data is getting it first:

```js
mAuthor.get('user').set('id', 17);
mAuthor.get('contacts').set([{id: 1}, {id: 2}]);
```

Another way of setting related data is using the attribute name on the parent. These lines do exactly the same:

```js
mAuthor.get('user').set('id', 17);
mAuthor.set('user', {id: 17});
mAuthor.set({user: {id: 17}});
```

This implies that once a relation is set, it cannot be overridden with another value. If you do really want to set another instance for a relation, then first use `unset`:

```js
mAuthor.unset('user');
mAuthor.set('user', mUser);
```

## Getting related data

You can use vanilla Backbone to get related data:

```js
mAuther.get('user'); // -> Instance of MUser.
mAuther.get('user').get('id') // -> Get the id of the related user.
```

### Model.dot

Shorthand for getting nested attributes. Example:

```js
model
    .get('nestedModel1')
    .get('nestedCollection2')
    .get('nestedIdOfModel3')
    .get('foo');
```

can be written like:

```js
model.dot('nestedModel1.nestedCollection2.nestedIdOfModel3.foo');
```

This depends on that the nested relation has a `get` function defined. That function is called each time a dot is found. If you try to use `dot` on a value that does not have the function `get` defined, it will return `undefined`.

Returns `undefined` because of `someString` is a string without a `get` function defined:

```js
model.dot('nestedModel1.someString.foo.bar');
```

Returns `undefined` because of `object` is an object without a `get` function defined:

```js
model.dot('nestedModel1.object.foo.bar');
```

Returns `undefined` because of `nonExistingModelOrCollection` is `undefined` and thus without a `get` function defined:

```js
model.dot('nestedModel1.nonExistingModelOrCollection.foo.bar');
```

Returns `undefined` because of `nonExistingId` is `undefined` and thus without a `get` function defined:

```js
model.dot('nestedCollection1.nonExistingId.foo.bar');
```

Itʼs not possible to retrieve attributes with a `.` in the name. You can use `get` instead:

```js
model.dot('nestedModel1.nestedCollection2.nestedIdOfModel3').get('foo.bar');
```
