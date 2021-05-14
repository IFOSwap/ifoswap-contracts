pragma solidity 0.6.12;

import "./contracts/token/BEP20/BEP20.sol";

contract WBNB is BEP20('Wrapped BNB', 'WBNB') {
    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}