(function() {
    QUnit.module('Backbone.Relation it should ');
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

    QUnit.test('add relations from a nested model', 2, function(assert) {
        var mPost = new MPost({
            author: {id: 5, name: 'Burhan Zainuddin'},
        });

        assert.ok(mPost.get('author') instanceof MAuthor);

        var MBlog = Backbone.Model.extend({
            relations: { post: MPost },
        });

        var mBlog = new MBlog({
            post: mPost,
        });

        // After adding mPost to a mBlog, the original mPost should still have its relations.
        assert.ok(mPost.get('author') instanceof MAuthor);
    });

    QUnit.test('create a new model', 1, function(assert) {
        model = new Backbone.Model();

        assert.deepEqual(model.relations, {}, 'with empty relations.');
    });

    QUnit.test('allow setting a custom attributes format', 1, function(assert) {
        var Model = Backbone.Model.extend({
            formatAttributes: function(attrs) {
                attrs.test = true;
                return attrs;
            }
        });
        model = new Model();

        assert.ok(model.get('test'), true);
    });

    QUnit.test('create a new model with relations', 4, function(assert) {
        var hasAuthor = false;
        var hasEditor = false;
        var hasWriters = false;
        var MPostProxy = MPost.extend();
        var mPost = null;

        mPost = new MPostProxy(null);

        hasAuthor = mPost.get('author') instanceof MAuthor;
        hasEditor = mPost.get('editor') instanceof MEditor;
        hasWriters = mPost.get('writers') instanceof CWriter;
        assert.ok(hasAuthor && hasEditor && hasWriters, 'it should create relations those relations by default.');

        // Make sure that `options` takes precendence.
        mPost = new MPostProxy(null, {createRelations: false});
        hasAuthor = mPost.get('author') instanceof MAuthor;
        hasEditor = mPost.get('editor') instanceof MEditor;
        hasWriters = mPost.get('writers') instanceof CWriter;
        assert.ok(!hasAuthor && !hasEditor && !hasWriters, 'it should not create relations if createRelations is set to false in the options argument.');

        MPostProxy = MPostProxy.extend({createRelations: false});
        mPost = new MPostProxy(null);
        hasAuthor = mPost.get('author') instanceof MAuthor;
        hasEditor = mPost.get('editor') instanceof MEditor;
        hasWriters = mPost.get('writers') instanceof CWriter;
        assert.ok(!hasAuthor && !hasEditor && !hasWriters, 'it should not create relations if createRelations is set to false when extending the model.');

        // Make sure that `options` takes precendence.
        mPost = new MPostProxy(null, {createRelations: true});
        hasAuthor = mPost.get('author') instanceof MAuthor;
        hasEditor = mPost.get('editor') instanceof MEditor;
        hasWriters = mPost.get('writers') instanceof CWriter;
        assert.ok(hasAuthor && hasEditor && hasWriters, 'it should create relations if createRelations is set to true in the options argument.');
    });

    QUnit.test('create new model without options', 1, function(assert) {
        var mPost = new MPost(null, {});
        assert.ok(mPost.get('author') instanceof MAuthor, 'will create that relation if not created before.');
    });

    QUnit.test('setting a related model', 4, function(assert) {
        var MPostProxy = MPost.extend({createRelations: false});
        var mPost = new MPost();
        var authorAttributes = {id: 5, name: 'Burhan Zainuddin'};
        var mAuthor = new MAuthor({id: 6, name: 'AB Zainuddin'});

        assert.equal(new MPost({author: {id: 1}}).get('author').get('id'), 1, 'using constructor.');

        mPost.set('author', {id: 1});
        assert.equal(mPost.get('author').get('id'), 1, 'using key-value pairs.');

        mPost.set({author: authorAttributes});

        assert.deepEqual(mPost.get('author').toJSON(), authorAttributes, 'using a hash.');

        mPost = new MPostProxy();
        mPost.set('author', null);
        assert.ok(mPost.get('author') instanceof MAuthor, 'will create that relation if not created before.');
    });

    QUnit.test('setting an existing model', 3, function(assert) {
        var mPost = new MPost();
        var mAuthorOriginal = mPost.get('author');
        var mAuthor = new MAuthor({id: 6, name: 'AB Zainuddin'});

        // Set already existing model in mPost.
        mPost.set({author: mAuthor});
        assert.ok(mPost.get('author') === mAuthorOriginal, 'use the existing model.');
        assert.deepEqual(mPost.get('author').toJSON(), {id: 6, name: 'AB Zainuddin'}, 'using a hash.');

        // Set not yet existing model.
        mPost = new MPost({author: mAuthor});
        assert.deepEqual(mPost.get('author').toJSON(), {id: 6, name: 'AB Zainuddin'}, 'using a hash.');
    });

    QUnit.test('getting a related model using dot', 4, function(assert) {
        var mPost = new MPost({
            post: new MPost({
                id: 2,
                author: {id: 6, name: 'AB Zainuddin'}
            }),
            author: {id: 5, name: 'Burhan Zainuddin'}
        });

        assert.strictEqual(mPost.dot('author.id'), 5, 'on a related attribute.');
        assert.strictEqual(mPost.dot('post.author.id'), 6, 'on a related related attribute.');
        assert.strictEqual(mPost.dot('post.nope.id'), undefined, 'on a not existing relation.');
        assert.strictEqual(mPost.dot(null), undefined, 'using a null value.');
    });

  // QUnit.test('setting a related model', 5, function() {
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

    QUnit.test('setting a related collection', 6, function(assert) {
        var mPost = new MPost();
        var cWriter = new CWriter([
            {id: 5, name: 'Burhan'},
            {id: 6, name: 'Zaico'}
        ]);
        var cWriterOthers = new CWriter([
            {id: 7, name: 'Kees'},
            {id: 8, name: 'SpaceK33z'}
        ]);
        var cWriterMoar = new CWriter([
            {id: 9, name: 'Jasper'},
            {id: 10, name: 'Japser'}
        ]);

        mPost.set('writers', cWriter);
        mPost.set('writers', cWriterOthers);
        assert.equal(mPost.get('writers').length, 2, 'with a collection will add / remove models.');
        assert.deepEqual(mPost.get('writers').pluck('id'), [7, 8], 'has correct ids.');
        mPost.set('writers', cWriterMoar, {remove: false});
        assert.equal(mPost.get('writers').length, 4, 'with remove:false will add models.');
        assert.deepEqual(mPost.get('writers').pluck('id'), [7, 8, 9, 10], 'has correct ids.');

        mPost.set('writers', [{id: 1, name: 'Peter'}, {id: 2, name: 'Sjamaan'}]);
        assert.deepEqual(mPost.get('writers').pluck('id'), [1, 2], 'with an array will have correct ids.');

        mPost = new MPost({
            writers: cWriterOthers,
        });
        assert.deepEqual(mPost.get('writers').pluck('id'), [7, 8], 'blaatschaap.');
    });

    QUnit.test('setting a related collection using an array', 2, function(assert) {
        var mPost = new MPost();
        var postData = {
            writers: [
                {id: 5, name: 'Burhan'},
            ]
        };

        mPost.set(postData);
        assert.equal(mPost.get('writers').length, 1, 'with a collection will add / remove models.');
        assert.equal(postData.writers.length, 1, 'ensure that original array is intact');
    });
})();
