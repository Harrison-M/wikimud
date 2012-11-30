var derby = require('derby'),
  app = derby.createApp(module),
  get = app.get,
  view = app.view,
  ready = app.ready,
  start = +new Date();

derby.use(require('../../ui'));


// ROUTES //

// Derby routes can be rendered on the client and the server
get('/:roomName?', function(page, model, params) {
  var roomName = params.roomName || 'home';

  // Subscribes the model to any updates on this room's object. Calls back
  // with a scoped model equivalent to:
  //   room = model.at('rooms.' + roomName)
  model.subscribe('rooms.' + roomName, 'users', 'links', function(err, room, users, links) {
    model.ref('_room', room);
    var linkIds = room.at('linkIds');

    userId = model.get('_userId');
    console.log(userId);
    model.ref('_user', users.at(userId));
    if(!users.get(userId))
    {
      users.set(userId, {name: "NewUser"});
    }

    model.refList('_links', 'links', linkIds);

    // setNull will set a value if the object is currently null or undefined
    room.setNull('welcome', 'Welcome to ' + roomName + '!');
    room.setNull('content', 'Room description goes here');

    // This value is set for when the page initially renders
    model.set('_timer', '0.0');
    // Reset the counter when visiting a new route client-side
    start = +new Date();

    // Render will use the model data as well as an optional context object
    page.render({
      roomName: roomName
    });
  });
});


// CONTROLLER FUNCTIONS //

ready(function(model) {
  var timer;

  // Functions on the app can be bound to DOM events using the "x-bind"
  // attribute in a template.
  this.stop = function() {
    // Any path name that starts with an underscore is private to the current
    // client. Nothing set under a private path is synced back to the server.
    model.set('_stopped', true);
    clearInterval(timer);
  };

  this.start = function() {
    model.set('_stopped', false);
    timer = setInterval(function() {
      model.set('_timer', (((+new Date()) - start) / 1000).toFixed(1));
    }, 100);
  };
  this.start();

  var newLink = model.at('_newLink');

  this.addLink = function() {
    if(!(linkText = view.escapeHtml(newLink.get())))
      return;

    //Blank out field
    newLink.set('');

    model.push('_links',{room: linkText});
  };

});
