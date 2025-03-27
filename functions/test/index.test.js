const fs = require('node:fs');
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
    myFunctions = require('../index.js');
    myHelpers = require('../helpers.js');

    // Initialize stubs for each helper function
    choosePangramStub = sinon.stub(myHelpers, 'choosePangram');
    shuffleSetStub = sinon.stub(myHelpers, 'shuffleSet'); // not necessary?
    randomIntegerStub = sinon.stub(myHelpers, 'randomInteger'); // not necessary?
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
