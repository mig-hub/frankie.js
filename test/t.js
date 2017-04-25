// Very simple test library
//
// <script type="text/javascript" src="t.js"></script>
// <script type="text/javascript">
//
//   T.tests.itAdds = function() {
//     this.assertEqual(3+4, 7);      
//   }
//
//   T.tests.itSubstracts = function() {
//     this.assertEqual(4-3, 1);      
//   }
//
//   T.run();
//
// </script>

// Namespace for the module
var T = {};

// Create 3 blocks for printing the result
T.errorsBlock = document.createElement('pre');
document.body.appendChild(T.errorsBlock);
T.scoreBlock = document.createElement('pre');
document.body.appendChild(T.scoreBlock);
T.fabBlock = document.createElement('pre');
T.fabBlock.style.color = 'green';
document.body.appendChild(T.fabBlock);

// Where tests have to be collected
T.tests = {};

// How to run the tests once they are in `T.tests` 
T.run = function() {

  // Init context
  // Context will be `this` inside each test
  var context = {
    assertions: 0, 
    assertionsPassed: 0,
    errors: []
  };

  // Context has the basic `assert` function
  context.assert = function(bool, message) {
    message = message || "Expected `true`";
    context.assertions = context.assertions+1;
    if (bool) {
      context.assertionsPassed = context.assertionsPassed+1;
    } else {
      context.errors.push({
        test: context.currentTest,
        message: message
      });
    }
  }

  // Context `assertEqual`
  context.assertEqual = function(got, expected, message) {
    context.assert(got===expected, message || 'Expected '+got+' to be '+expected);
  }

  // Context `assertMatch`
  context.assertMatch = function(got, regexp, message) {
    context.assert(!!got.match(regexp), message || 'Expected '+got+' to match '+regexp);
  }

  // Run each test in the context
  for (var k in T.tests) {
    context.currentTest = k;
    T.tests[k].apply(context, []);
  }

  // Report errors
  for (var i=0; i<context.errors.length; i++) {
    T.errorsBlock.innerHTML = T.errorsBlock.innerHTML + 'Error in '+context.errors[i].test+' : '+context.errors[i].message+'\n';
  }

  // Report score
  T.scoreBlock.innerHTML = 'Assertions Passed: '+context.assertionsPassed+' / '+context.assertions;

  // Message if all assertions are passed
  if (context.assertions===context.assertionsPassed) {
    T.fabBlock.innerHTML = 'FABULOUS!';
  }

}

