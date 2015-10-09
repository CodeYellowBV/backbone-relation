## 0.1.2
- When setting a Backbone model, use the attributes from this model instead of adding the model as an attribute. `mPost.set('author', mAuthor)` will use the same Author model instance.

## 0.1.1
- Fix bug where an empty options object on a model would prevent relations from being added.
