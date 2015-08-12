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


# Setting related model data

## Scalar

If a relation is set, you cannot set it to another value. If you try to set a related model to a scalar (`integer`, `string`, null, undefined), then the id of that model will be set:

```
mAuthor.set('user', null);  // -> mAuther.get('user').get('id') = null
mAuthor.set('user', 1);     // -> mAuther.get('user').get('id') = 1
mAuthor.set('user', 'foo'); // -> mAuther.get('user').get('id') = 'foo'
```

## Hash

If however you give a hash, these will be passed to the relation `set` method. The following two lines have identical behavior:

```
mAuthor.set('user', {id: 1, name: 'foo'});
mAuthor.get('user').set({id: 1, name: 'foo'});
```

## Backbone.Model

If a model is passed in, that model's attributes will be copied using `toJSON` and is actually no different from giving a hash. So, it will not replace the existing model with the given model:

```
mSomeModel = new Backbone.Model({id: 1, name: 'foo'});
mAuthor.set('user', mSomeModel);
mAuthor.get('user') === mSomeModel // -> false
```


# Setting related collection data

TODO

# Old

Every instance of MAuthor now has instances of MUser, CChannel and CContact. You can use it as follows:

```
var mAuthor = new MAuthor({
    id: 1,
    name: 'Burhan',
    user: {
        id: 1,
        name: 'my user name',
    },

    // Only the ids are specified, so three models of MChannel will be created by CChannel.
    channels: [1, 2, 3],

    // Here more detailed models of MContact will be created since more data is available.
    contacts: [
        {id: 1, name: 'Jeff', position: 'engineer'},
        {id: 2, name: 'Dean', position: 'tester'},
        {id: 3, name: 'James', position: 'spec'}
    ]
});

// Returns 'Burhan'.
mAuthor.get('name');

// Returns 'my user name'.
mAuthor.get('user').get('name');

// Sets the related user name to 'another user name'.
mAuthor.set('user', {name: 'another user name'});

// Returns 'another user name'.
mAuthor.get('user').get('name');                
```

## Setting an existing model

Upon creating a new model one of 2 things might happen:

- If no existing related model is given, a new model is created.
- If an existing related model is given, that model will be used.

Once a related model is created and set, it will never change into another instance.

```
var mAuthor = new MAuthor();

// Essentially we are doing the same as above, except with an existing model.
var mUser = new MUser({id: 17, name: 'copy'});
mAuthor.set('user', mUser);
mAuthor.get('user').get('name');                // 'copy'
mAuthor.get('user') === mUser;                  // false

mAuthor.get('channels').get(1);                 // Instance of MChannel.
mAuthor.get('contacts').get(1).get('name');     // 'Jeff'.

mAuthor.set('channels', [4]);
mAuthor.get('channels').toJSON();               // [{id: 4}]

mAuthor.set('channels', [5], {remove: false});
mAuthor.get('channels').toJSON();               // [{id: 4}, {id: 5}]

var cChannel = new CChannel([{id: 1}, {id: 2}, {id: 3}];
mAuthor.set('channels', cChannel);
mAuthor.get('channels').toJSON(cChannel);       // [{id: 1}, {id: 2}, {id: 3}]
mAuthor.get('channels') === cChannel;           // false
```
