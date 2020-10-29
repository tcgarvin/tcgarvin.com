import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import Header from './header'
import './layout.styl'

const Layout = ({ children, pageTitle, description, linkHome, hXs, hXsOffset, hMd, hMdOffset, hLg, hLgOffset}) => {
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
    <Header linkHome={linkHome} xs={hXs} xsOffset={hXsOffset} md={hMd} mdOffset={hMdOffset} lg={hLg} lgOffset={hLgOffset}/>
    {children}
  </>;
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  pageTitle: PropTypes.string.isRequired,
  linkHome: PropTypes.bool
}

export default Layout
