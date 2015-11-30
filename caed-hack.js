if (Meteor.isClient) {
  // counter starts at 0

  Template.hello.helpers({
    allSpeakers: function () {
      return Template.instance().allSpeakers.get();
    },
    results: function() {
      var results = Template.instance().results.get();
      return Template.instance().results.get();
    },
    fetching: function() {
      return Template.instance().fetching.get()
    },
    speaker_references: function() {
      console.log( this._source )
      return this._source.speaker_references.join(", ")
    }
  });

  Template.hello.events({
    'change #search-form, submit #search-form': function(e, tmpl) {
      switch( e.target.name ) {
        case "query":
          tmpl.query.set( e.target.value );
          break;
        case "speaker":
          var speakers = [];
          $('[name=speaker] :selected').each(function(i, e){
            speakers.push(e.value);
          });
          tmpl.speakers.set(speakers);
          break;
      }
    }
  });

  Template.hello.onCreated(function(){
    var instance = this;
    instance.query = new ReactiveVar(false);
    instance.speakers = new ReactiveVar([]);
    instance.allSpeakers = new ReactiveVar([]);
    instance.results = new ReactiveVar(false);
    instance.fetching = new ReactiveVar(false);
  });

  Template.hello.onRendered(function() {
    var instance = this;
    instance.autorun(function(){
      var speakers = instance.speakers.get();
      if( instance.query.get() ) {

        var s = _.map(speakers, function(speaker){
          return "speaker:" + speaker;
        }).join(", ");

        instance.fetching.set(true);
        console.log("fetching");
        HTTP.get("http://128.199.78.219:8383/api/search", { params: { query: instance.query.get(), "inner_query": s } }, function(error, result){
          // console.log( error, result );
          var res_json = JSON.parse(result.content);
          instance.results.set( res_json.hits.hits );
          var speakers = _.map(res_json.hits.hits, function(h){ return h._source.speakers });
          instance.allSpeakers.set( _.union( _.flatten( speakers ) ) );

          instance.fetching.set(false);
        });
      }
    });
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

  });
}
