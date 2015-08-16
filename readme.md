# backbone-relations

Backbone does not support relations by default. This is a simple package that adds relations to Backbone. If you want more features, check out http://backbonerelational.org/.

The idea is simple: you can define relations like you define defaults. A relation can be either a Model or a Collection and can attributes can be set recursively through the parent.

# Defining relations

You can define relations using the `relations` attribute. It can either be a hash or a function that returns a hash. There are a few different ways to define relations:

## Simple `{name: constructor}`

The simpelest form without any options. Example:

```
var MAuthor = Model.extend({
    relations: {
        // This is a simple relation where MUser is a Model.
        user: MUser,

        // Here we define an attribute which should be a collection.
        channels: CChannel,
    }
})
```

## Complex `{name: options}`

With this form you can add a bit more config options. These are the options at the moment:

| key | description|
| constructor | The constructor for the relation. This can either be a `Backbone.Model` or a `Backbone.Collection`.

Example:

```
var MAuthor = Model.extend({
    relations: {
        // Similar to channels, just another syntax. This is to support more complex configuration options.
        contacts: {constructor: CContact}
    }
})
```


# Setting related data

The most basic form of setting a related data is getting it first:

```
mAuthor.get('user').set('id', 17);
mAuthor.get('contacts').set([{id: 1}, {id: 2}]);
```

Another way of setting related data is using the attribute name on the parent. These lines do exactly the same:

```
mAuthor.get('user').set('id', 17);
mAuthor.set('user', {id: 17});
mAuthor.set({user: {id: 17}});
```


This implies that once a relation is set, it cannot be overridden with another value. If you do really want to set another instance for a relation, then first use `unset`:

```
mAuthor.unset('user');
mAuthor.set('user', mUser);
```


# Getting related data

You can use vanilla Backbone to get related data:

```
mAuther.get('user'); // -> Instance of MUser.
mAuther.get('user').get('id') // -> Get the id of the related user.
```

## Model.dot

Shorthand for getting nested attributes. Example:

```     
model
    .get('nestedModel1')
    .get('nestedCollection2')
    .get('nestedIdOfModel3')
    .get('foo');
```

can be written like:

```
model.dot('nestedModel1.nestedCollection2.nestedIdOfModel3.foo');
```

This depends on that the nested relation has a `get` function defined. That function is called each time a dot is found. If you try to use dot on a value that does not have the function `get` defined, it will return `undefined`:

Returns undefined because of `someString` is a string without a `get` function defined:

```
model.dot('nestedModel1.someString.foo.bar');
```

Returns undefined because of `object` is an object without a `get` function defined:

```
model.dot('nestedModel1.object.foo.bar');
```

Returns undefined because of `nonExistingModelOrCollection` is undefined and thus without a `get` function defined:

```
model.dot('nestedModel1.nonExistingModelOrCollection.foo.bar');
```

Returns undefined because of `nonExistingId` is  undefined and thus without a `get` function defined:

```
model.dot('nestedCollection1.nonExistingId.foo.bar');
```

It's impossible to retrieve attributes with a `.` in the name. You can use `get` instead:

```
model.dot('nestedModel1.nestedCollection2.nestedIdOfModel3').get('foo.bar');
```
