// backbone-relation doesn't patch Backbone on it's own, so here we do it manually,
// so the unit tests use backbone-relation.
Backbone.Model = window['backbone-relation'].default;
