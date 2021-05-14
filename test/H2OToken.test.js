const { assert } = require("chai");

const H2OToken = artifacts.require('H2OToken');

contract('H2OToken', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.h2o = await H2OToken.new({ from: minter });
    });


    it('mint', async () => {
        await this.h2o.mint(alice, 1000, { from: minter });
        assert.equal((await this.h2o.balanceOf(alice)).toString(), '1000');
    })
});
