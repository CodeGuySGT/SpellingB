const fs = require('node:fs');
const admin = require('firebase-admin');
const { assert } = require('chai');
const { before, after, describe, it } = require('mocha');
const sinon = require('sinon');
const test = require('firebase-functions-test')();

describe('Cloud Functions', () => {

  // Declare debug token
  let debugToken;

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

    // Read and store debug token at runtime
    const tokenPath = './secrets/debug_token.txt';
    try {
        debugToken = fs.readFileSync(tokenPath, 'utf-8').trim();
    } catch (error) {
        console.error('Error reading debug token:', error);
        throw error;
    }

    // Stub admin.initializeApp to be a dummy function that doesn't do anything.
    adminInitStub = sinon.stub(admin, 'initializeApp');

    // Require index.js and helper functions and save the exports inside a namespace called myFunctions.
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
    it('Returns valid pangram-related JSON', async function () {
        
      // Wrap function, call it, and save results to 'result' object
      const wrapped = test.wrap(myFunctions.getPangram);
      const result = await wrapped();

      // Test for null response -- WIP
      assert(result !== null, 'Null response object');
      assert(result.pangram !== null, 'Null pangram')
    });
  });
  
})