pragma solidity 0.6.12;

import "./contracts/token/BEP20/BEP20.sol";

contract WETH is BEP20('Wrapped Ether', 'WETH') {
    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}