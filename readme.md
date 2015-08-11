# backbone-relations

Backbone does not support relations by default. This is a simple package that adds relations to Backbone. If you want more features, check out http://backbonerelational.org/.

The idea is simple: you can define relations like you define defaults. A relation can be either a Model or a Collection and can attributes can be set recursively through the parent.

# Defining relations

There are several ways to define relations:


```
var MAuthor = Model.extend({
    // Defaults to true. If true, relations are also created when defaults are created.
    createRelations: true,
    defaults: {
        id: null,
        name: ''
    },
    relations: {
        // This is a simple relation where MUser is a Model.
        user: MUser,

        // Here we define an attribute which should be a collection.
        channels: CChannel,

        // Similar to above, just another syntax. This is to support more complex relations.
        contacts: {module: CContact}
    }
})
```

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

# Setting related data
If a relation is set, you cannot set it to another value. This means that the following all have no effect:

```
mAuthor.set('user', null);
mAuthor.set('user', 1);
mAuthor.set('user', 'foo');
```

If however you give a hash, these will be passed to the relation `set` method. The following two lines have identical behavior:

```
mAuthor.set('user', {id: 1, name: 'foo'});
mAuthor.get('user').set({id: 1, name: 'foo'});
```
