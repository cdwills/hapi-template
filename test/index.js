function strict(){
  "use strict";
}
// load up modules
import Hapi from 'hapi';
import Lab from 'lab';
import Code from 'code';

import { server } from '../index.js';

// BDD-ify
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

describe('routes', () => {
  it('root says hello', (done) => {
    let request = {
      method: 'GET',
      url: '/'
    };

    server.inject(request, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.equal("Hello!");
      done();
    });
  });
});
