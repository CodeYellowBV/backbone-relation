## 0.1.6
- Add `formatAttributes` method where you can provide a custom formatter for attributes before setting.

## 0.1.5
- Setting a relation in the constructor of a model now works.

## 0.1.4
- When setting a Backbone collection, use the models from this collection instead of adding the collection as a model. `mPost.set('writers', cWriter)` will use the same Writer collection instance and add those models to the writers collection.
- Add comments to methods to better describe what they do.

## 0.1.2
- When setting a Backbone model, use the attributes from this model instead of adding the model as an attribute. `mPost.set('author', mAuthor)` will use the same Author model instance.

## 0.1.1
- Fix bug where an empty options object on a model would prevent relations from being added.
