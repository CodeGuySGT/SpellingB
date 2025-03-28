const admin = require('firebase-admin');
const { assert } = require('chai');
const { before, after, describe, it } = require('mocha');
const sinon = require('sinon');
const test = require('firebase-functions-test')();

describe('Cloud Functions', () => {

  // Declare admin stub
  let adminInitStub;

  // Declare imports
  let myFunctions;
  let myHelpers;

  // Declare helper function stubs
  let choosePangramStub;
  let shuffleSetStub; 
  let randomIntegerStub;
  let validWordsStub;

  before(() => {
    // Stub admin.initializeApp to be a dummy function that doesn't do anything.
    adminInitStub = sinon.stub(admin, 'initializeApp');

    // Require index.js and helper functions and save the exports inside their own namepsaces.
    myFunctions = require('../index.cjs');
    myHelpers = require('../helpers.cjs');

    // Initialize stubs for each helper function
    choosePangramStub = sinon.stub(myHelpers, 'choosePangram');
    shuffleSetStub = sinon.stub(myHelpers, 'shuffleSet'); 
    randomIntegerStub = sinon.stub(myHelpers, 'randomInteger'); 
    validWordsStub = sinon.stub(myHelpers, 'validWords');

    choosePangramStub.returns('subscribe');
    shuffleSetStub.returns(new Set(['s','u','b','c','r','i','e']));
    randomIntegerStub.returns(4);
    validWordsStub.returns(['beurre', 'bibberies', 'burrs', 'crib', 'suburbs', 'succubi', 'scrubbers']);
  });

  after(() => {
    // Restore stubs to original methods.
    adminInitStub.restore();
    choosePangramStub.restore();
    shuffleSetStub.restore();
    randomIntegerStub.restore();
    validWordsStub.restore();
    
    test.cleanup();
  });

  describe('getPangram', function () {
    it('Should return non-null JSON with non-null values', async function () {
        
      // Wrap function, call it, and save results to 'result' object
      const wrapped = test.wrap(myFunctions.getPangram);
      const result = await wrapped();

      // Test for null response and values
      assert(result !== null, 'Null response object');
      assert(result.pangram !== null, 'Null pangram');
      assert(result.anchorLetter !== null, 'Null anchor letter');
      assert(result.validWords !== null, 'Null valid words list');
    });

    it("Should return { letters: 'subcrie' } given shuffleSet() returns ['s','u','b','c','r','i','e']", async function () {
        
      // Wrap function, call it, and save results to 'result' object
      const wrapped = test.wrap(myFunctions.getPangram);
      const result = await wrapped();

      // Test for null response and values
      assert(result.letters == 'subcrie', 'Letter string malformed');
    });

    it("Should return { anchorLetter: 'r' } given letters value is 'subcrie", async function () {
        
      // Wrap function, call it, and save results to 'result' object
      const wrapped = test.wrap(myFunctions.getPangram);
      const result = await wrapped();

      // Test for null response and values
      assert(result !== null, 'Null response object');
      assert(result.pangram !== null, 'Null pangram');
      assert(result.anchorLetter !== null, 'Null anchor letter');
      assert(result.validWords !== null, 'Null valid words list');
    });
  });
})

describe('Helper Functions', () => {

  let myHelpers;

  beforeEach(() => {
    // Import helper functions and test file path from storage
    myHelpers = require('../helpers.cjs');
  });

  afterEach(() => {
    test.cleanup();
  });

  describe('shuffleSet', function () {

    // Testing for true random with uniform distribution would involve hundreds of tests and statistical analysis that's beyond the scope of
    // the function itself. It really just needs to scramble letters enough to feel random to users. Therefore, this test case tests that 
    // the shuffle function returns a set containing the same elements in a different order. Random chance will cause the test to fail on average
    // once in hundreds of septillions of runs. I can live with that.
    it('Should return a set containing the alphabet in a different order when passed a similar set in alphabetical order', async function () {

      let inputSet = new Set(['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']);

      // Create new set by shuffling input set 
      let resultSet = myHelpers.shuffleSet(inputSet);

      // Assert the two sets contain the same elements
      assert(inputSet.isSubsetOf(resultSet), 'Sets contain different elements');
      assert(inputSet.isSupersetOf(resultSet), 'Sets contain different elements');

      let areDifferent = false;
      let isDone = false;
      inputIter = inputSet.values();
      resultIter = resultSet.values();

      while (!isDone) {
        let obj1 = inputIter.next();
        let obj2 = resultIter.next();

        if (obj1.value !== obj2.value) {
          areDifferent = true;
          isDone = true;
        }

        if (obj1.done === true || obj2.done === true) isDone = true;
      }

      assert(areDifferent, 'Set elements not shuffled')
    })
  })

  describe('validWords', function () {

    let dlFileStub;

    const mockText = 
`beurre
bibberies
burrs
crib
suburbs
succubi
scrubbers
bribe
crier
ruby
scribe
aaaaaa
eeeeee`;

    before(() => {
      dlFileStub = sinon.stub(myHelpers, 'dlFile').resolves(mockText);
    })

    after(() => {
      dlFileStub.restore();
    })

    it('Should return all valid words based on inputs, and no others', async function () {

      const results = await myHelpers.validWords('subcrie', 'e');

      let resultsMap = new Set(results);

      assert(resultsMap.has('beurre'), 'Missing valid word: beurre');
      assert(resultsMap.has('bribe'), 'Missing valid word: bribe');
      assert(resultsMap.has('eeeeee'), 'Missing valid word: eeeeee');
      assert(!resultsMap.has('aaaaaa'), 'Invalid word found: aaaaaa');
      assert(!resultsMap.has('ruby'), 'Invalid word found: ruby');
      assert.strictEqual(resultsMap.size, 7, 'Incorrect word count (7 expected): ' + resultsMap.size);
    })
  })

  describe('choosePangram', function () {

    let randPangramLineStub;
    const mockText = 
`beurre
bibberies
burrs
crib
suburbs
succubi
scrubbers
bribe
crier
ruby
scribe
aaaaaa
eeeeee`

    before(() => {
      randPangramLineStub = sinon.stub(myHelpers, 'randPangramLine').returns(4);
      dlFileStub = sinon.stub(myHelpers, 'dlFile').resolves(mockText);
    });

    after(() => {
      randPangramLineStub.restore();
    });

    it("Should return a word at random from word list ('suburbs' with stubbing)", async function () {

      const result = await myHelpers.choosePangram();
      
      assert(result === 'suburbs', 'incorrect string returned: ' + result);
    });
  });
})
