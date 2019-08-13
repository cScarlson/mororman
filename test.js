
var { Conductor } = require('@motorman/conductor');

var config = {
    root: './src',
    inclusions: '*/**/*.spec.js',
};
var conductor = new Conductor(config);

conductor
    // .subscribe( Conductor.events.EVENT_RUN_BEGIN, (e) => console.log('@CONDUCTOR start', e) )
    // .subscribe( Conductor.events.EVENT_TEST_PASS, (e) => console.log('@CONDUCTOR pass', e) )
    // .subscribe( Conductor.events.EVENT_TEST_FAIL, (e) => console.log('@CONDUCTOR fail', e) )
    // .subscribe( Conductor.events.EVENT_RUN_END, (e) => console.log('@CONDUCTOR end', e) )
    ;
conductor.files
    .then( (files) => conductor.drive() )
    // .then( (runner) => runner.addListener( Conductor.events.EVENT_RUN_END, (e) => console.log('@CONDUCTOR end again', e) ) )
    ;

