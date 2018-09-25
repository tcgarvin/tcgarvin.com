import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import Header from './header'
import './layout.styl'

const Layout = ({ children, pageTitle, description, linkHome }) => {
  let title = pageTitle + " - tcgarvin.com";
  return <>
    <Helmet
      title={title}
      meta={[
        { name: 'viewport', content: 'width=device-width' },
        { name: 'description', content: description }
      ]}
    >
      <html lang="en" />
    </Helmet>
    <Header linkHome={linkHome}/>
    {children}
  </>;
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  pageTitle: PropTypes.string.isRequired,
  linkHome: PropTypes.bool
}

export default Layout
