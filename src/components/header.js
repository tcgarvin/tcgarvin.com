import React from 'react'

const Header = ({ linkHome }) => (
  <div class="body-header">
    {linkHome !== false && <a href="/">tcgarvin.com</a>}
  </div>
)

export default Header
