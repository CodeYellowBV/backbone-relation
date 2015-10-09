(function() {

    module('Backbone.Relation it should ');
    var model = null;
    var MAuthor = Backbone.Model.extend();
    var MEditor = Backbone.Model.extend();
    var CWriter = Backbone.Collection.extend();
    var MPost = Backbone.Model.extend({
        relations: {
                author: MAuthor,
                editor: MEditor,
                writers: CWriter
            },
    });

    test('create a new model', 1, function() {
        model = new Backbone.Model();

        deepEqual(model.relations, {}, 'with empty relations.');
    });

    test('create a new model with relations', 4, function() {
        var hasAuthor = false;
        var hasEditor = false;
        var hasWriters = false;
        var MPostProxy = MPost.extend();
        var mPost = null;

        mPost = new MPostProxy(null);

        hasAuthor = mPost.get('author') instanceof MAuthor;
        hasEditor = mPost.get('editor') instanceof MEditor;
        hasWriters = mPost.get('writers') instanceof CWriter;
        ok(hasAuthor && hasEditor && hasWriters, 'it should create relations those relations by default.');

        // Make sure that `options` takes precendence.
        mPost = new MPostProxy(null, {createRelations: false});
        hasAuthor = mPost.get('author') instanceof MAuthor;
        hasEditor = mPost.get('editor') instanceof MEditor;
        hasWriters = mPost.get('writers') instanceof CWriter;
        ok(!hasAuthor && !hasEditor && !hasWriters, 'it should not create relations if createRelations is set to false in the options argument.');

        MPostProxy = MPostProxy.extend({createRelations: false});
        mPost = new MPostProxy(null);
        hasAuthor = mPost.get('author') instanceof MAuthor;
        hasEditor = mPost.get('editor') instanceof MEditor;
        hasWriters = mPost.get('writers') instanceof CWriter;
        ok(!hasAuthor && !hasEditor && !hasWriters, 'it should not create relations if createRelations is set to false when extending the model.');

        // Make sure that `options` takes precendence.
        mPost = new MPostProxy(null, {createRelations: true});
        hasAuthor = mPost.get('author') instanceof MAuthor;
        hasEditor = mPost.get('editor') instanceof MEditor;
        hasWriters = mPost.get('writers') instanceof CWriter;
        ok(hasAuthor && hasEditor && hasWriters, 'it should create relations if createRelations is set to true in the options argument.');
    });

    test('create new model without options', 1, function() {
        var mPost = new MPost(null, {});
        ok(mPost.get('author') instanceof MAuthor, 'will create that relation if not created before.');
    });

    test('setting a related model', 4, function() {
        var MPostProxy = MPost.extend({createRelations: false});
        var mPost = new MPost();
        var authorAttributes = {id: 5, name: 'Burhan Zainuddin'};
        var mAuthor = new MAuthor({id: 6, name: 'AB Zainuddin'});

        equal(new MPost({author: {id: 1}}).get('author').get('id'), 1, 'using constructor.');

        mPost.set('author', {id: 1});
        equal(mPost.get('author').get('id'), 1, 'using key-value pairs.');

        mPost.set({author: authorAttributes});
        deepEqual(mPost.get('author').toJSON(), authorAttributes, 'using a hash.');

        mPost = new MPostProxy();
        mPost.set('author', null);
        ok(mPost.get('author') instanceof MAuthor, 'will create that relation if not created before.');
    });

    test('getting a related model using dot', 2, function() {
        var mPost = new MPost({
            post: new MPost({
                id: 2,
                author: {id: 6, name: 'AB Zainuddin'}
            }),
            author: {id: 5, name: 'Burhan Zainuddin'}
        });

        equal(mPost.dot('author.id'), 5, 'on a related attribute.');
        equal(mPost.dot('post.author.id'), 6, 'on a related related attribute.');
    });

  // test('setting a related model', 5, function() {
  //   var MPostProxy = MPost.extend({createRelations: false});
  //   var mPost = new MPost();
  //   var authorAttributes = {id: 5, name: 'Burhan Zainuddin'};
  //   var mAuthor = new MAuthor({id: 6, name: 'AB Zainuddin'});

  //   mPost.set('author', 5);
  //   equal(mPost.get('author').get('id'), 5, 'with a scalar will set the id.');

  //   mPost.set('author', authorAttributes);
  //   deepEqual(mPost.get('author').toJSON(), authorAttributes, 'with a hash will set the related model.');

  //   mPost.set('author', mAuthor);
  //   deepEqual(mPost.get('author').toJSON(), mAuthor.toJSON(), 'with a model will copy the attributes to the related model.');
  //   ok(mPost.get('author') !== mAuthor, 'with a model will not overwrite the related model.');

  //   mPost = new MPostProxy();
  //   mPost.set('author', null);
  //   ok(mPost.get('author') instanceof MAuthor, 'will create that relation if not created before.');
  // });

  // test('setting a related collection', 1, function() {
  //   var mPost = new MPost();
  //   var cWriter = new CWriter([
  //       {id: 5, name: 'Burhan Zainuddin'},
  //       {id: 6, name: 'AB Zainuddin'}
  //   ]);
  //   var cWriterOthers = new CWriter([
  //       {id: 7, name: 'Burhan Zainuddin'},
  //       {id: 8, name: 'AB Zainuddin'}
  //   ]);

  //   debugger;

  //   mPost.get('writers').set(cWriter);
  //   mPost.get('writers').set(cWriterOthers);
  //   console.log(mPost.get('writers').pluck('id'));
  //   equal(cWriter.length, 4, 'with a collection will append the given models.');
  // });
})();
