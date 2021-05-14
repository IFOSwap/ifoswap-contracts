const { expectRevert, time } = require('@openzeppelin/test-helpers');
const H2OToken = artifacts.require('H2OToken');
const MasterChef = artifacts.require('MasterChef');
const SmartChef = artifacts.require('SmartChef');
const MockBEP20 = artifacts.require('libs/MockBEP20');

contract('SmartChef', ([alice, bob, carol, dev, fee, minter]) => {
  beforeEach(async () => {
    this.syrup = await MockBEP20.new('LPToken', 'LP1', '1000000', {
      from: minter,
    });
    this.rewardToken = await MockBEP20.new('LPToken2', 'LP2', '1000000', {
      from: minter,
    });
    this.chef = await SmartChef.new(this.syrup.address, this.rewardToken.address, '40', '310', '410', {
      from: minter,
    });
    await this.rewardToken.transfer(this.chef.address, '100000', { from: minter });
  });

  it('smart chef now', async () => {
    await this.syrup.transfer(bob, '1000', { from: minter });
    await this.syrup.transfer(carol, '1000', { from: minter });
    await this.syrup.transfer(alice, '1000', { from: minter });
    assert.equal((await this.syrup.balanceOf(bob)).toString(), '1000');

    await this.syrup.approve(this.chef.address, '1000', { from: bob });
    await this.syrup.approve(this.chef.address, '1000', { from: alice });
    await this.syrup.approve(this.chef.address, '1000', { from: carol });

    await this.chef.deposit('10', { from: bob });
    assert.equal(
      (await this.syrup.balanceOf(this.chef.address)).toString(),
      '10'
    );

    await time.advanceBlockTo('310');

    await this.chef.deposit('30', { from: alice });
    assert.equal(
      (await this.syrup.balanceOf(this.chef.address)).toString(),
      '40'
    );
    assert.equal(
      (await this.chef.pendingReward(bob, { from: bob })).toString(),
      '40'
    );

    await time.advanceBlockTo('312');
    assert.equal(
      (await this.chef.pendingReward(bob, { from: bob })).toString(),
      '50'
    );
    assert.equal(
      (await this.chef.pendingReward(alice, { from: alice })).toString(),
      '30'
    );

    await this.chef.deposit('40', { from: carol });
    assert.equal(
      (await this.syrup.balanceOf(this.chef.address)).toString(),
      '80'
    );
    await time.advanceBlockTo('314');
    //  bob 10, alice 30, carol 40
    assert.equal(
      (await this.chef.pendingReward(bob, { from: bob })).toString(),
      '65'
    );
    assert.equal(
      (await this.chef.pendingReward(alice, { from: alice })).toString(),
      '75'
    );
    assert.equal(
      (await this.chef.pendingReward(carol, { from: carol })).toString(),
      '20'
    );

    await this.chef.deposit('20', { from: alice }); // 305 bob 10, alice 50, carol 40
    await this.chef.deposit('30', { from: bob }); // 306  bob 40, alice 50, carol 40

    assert.equal(
      (await this.chef.pendingReward(bob, { from: bob })).toString(),
      '0'
    );
    assert.equal(
      (await this.chef.pendingReward(alice, { from: alice })).toString(),
      '20'
    );

    await time.advanceBlockTo('317');
    assert.equal(
      (await this.chef.pendingReward(bob, { from: bob })).toString(),
      '12'
    );
    assert.equal(
      (await this.chef.pendingReward(alice, { from: alice })).toString(),
      '35'
    );

    await this.chef.withdraw('20', { from: alice }); // 308 bob 40, alice 30, carol 40
    await this.chef.withdraw('30', { from: bob }); // 309  bob 10, alice 30, carol 40

    await time.advanceBlockTo('320');
    assert.equal(
      (await this.chef.pendingReward(bob, { from: bob })).toString(),
      '5'
    );
    assert.equal(
      (await this.chef.pendingReward(alice, { from: alice })).toString(),
      '26'
    );
    assert.equal(
      (await this.syrup.balanceOf(this.chef.address)).toString(),
      '80'
    );

    await time.advanceBlockTo('410');
    assert.equal(
      (await this.chef.pendingReward(bob, { from: bob })).toString(),
      '455'
    );
    assert.equal(
      (await this.chef.pendingReward(alice, { from: alice })).toString(),
      '1376'
    );
    assert.equal(
      (await this.chef.pendingReward(carol, { from: alice })).toString(),
      '1915'
    );

    await time.advanceBlockTo('430');
    assert.equal(
      (await this.chef.pendingReward(bob, { from: bob })).toString(),
      '455'
    );
    assert.equal(
      (await this.chef.pendingReward(alice, { from: alice })).toString(),
      '1376'
    );
    assert.equal(
      (await this.chef.pendingReward(carol, { from: alice })).toString(),
      '1915'
    );

    await this.chef.withdraw('10', { from: bob });
    await this.chef.withdraw('30', { from: alice });
    await expectRevert(this.chef.withdraw('50', { from: carol }), 'VM Exception while processing transaction: revert withdraw: not good');
    await this.chef.deposit('30', { from: carol });
    await time.advanceBlockTo('460');
    assert.equal(
      (await this.chef.pendingReward(bob, { from: bob })).toString(),
      '0'
    );
    assert.equal(
      (await this.chef.pendingReward(alice, { from: alice })).toString(),
      '0'
    );
    assert.equal(
      (await this.chef.pendingReward(carol, { from: alice })).toString(),
      '0'
    );
    await this.chef.withdraw('70', { from: carol });
    // assert.equal((await this.chef.addressLength()).toString(), '3');
  });

  it('try syrup', async () => {
    this.h2o = await H2OToken.new({ from: minter });
    this.lp1 = await MockBEP20.new('LPToken', 'LP1', '1000000', {
      from: minter,
    });
    this.chef = await MasterChef.new(
      this.h2o.address,
      dev,
      fee,
      '1000',
      '300',
      { from: minter }
    );
    await this.h2o.transferOwnership(this.chef.address, { from: minter });
    await this.lp1.transfer(bob, '2000', { from: minter });
    await this.lp1.transfer(alice, '2000', { from: minter });

    await this.lp1.approve(this.chef.address, '1000', { from: alice });
    await this.h2o.approve(this.chef.address, '1000', { from: alice });

    await this.chef.add('1000', this.lp1.address, 0, true, { from: minter });
    await this.chef.deposit(1, '20', { from: alice });
    await time.advanceBlockTo('500');
    await this.chef.deposit(1, '0', { from: alice });
    await this.chef.add('1000', this.lp1.address, 0, true, { from: minter });

    await this.chef.enterStaking('10', { from: alice });
    await time.advanceBlockTo('510');
    await this.chef.enterStaking('10', { from: alice });

    this.chef2RewardToken = await MockBEP20.new('LPToken2', 'LP2', '1000000', {
      from: minter,
    });
    this.chef2 = await SmartChef.new(this.syrup.address, this.chef2RewardToken.address, '40', '600', '800', {
      from: minter,
    });
    await this.syrup.transfer(alice, '2000', { from: minter });
    await this.syrup.approve(this.chef2.address, '10', { from: alice });
    await time.advanceBlockTo('590');
    this.chef2.deposit('10', { from: alice }); //520
    await time.advanceBlockTo('610');
    assert.equal(
      (await this.syrup.balanceOf(this.chef2.address)).toString(),
      '10'
    );
    assert.equal(
      (await this.chef2.pendingReward(alice, { from: alice })).toString(),
      '400'
    );
  });

  it('emergencyWithdraw', async () => {
    await this.syrup.transfer(alice, '1000', { from: minter });
    assert.equal((await this.syrup.balanceOf(alice)).toString(), '1000');

    await this.syrup.approve(this.chef.address, '1000', { from: alice });
    await this.chef.deposit('10', { from: alice });
    assert.equal((await this.syrup.balanceOf(alice)).toString(), '990');
    await this.chef.emergencyWithdraw({ from: alice });
    assert.equal((await this.syrup.balanceOf(alice)).toString(), '1000');
    assert.equal(
      (await this.chef.pendingReward(alice, { from: alice })).toString(),
      '0'
    );
  });
});
