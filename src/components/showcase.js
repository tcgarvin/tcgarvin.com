import React from 'react'
import PropTypes from 'prop-types'
import { Col } from 'react-bootstrap';

const Showcase = ({ children, title, imageUrl, link }) => (
  <Col xs={12} md={6}>
    <div className="showcase">
      {link ?  
        <a className="header clearfix" href={link}>
          <img src={imageUrl} alt=""></img>
          <div className="header-text">{title} </div>
        </a>
      :
        <div className="header clearfix">
          <img src={imageUrl} alt=""></img>
          <div className="header-text">
            {title}
            <span className="small"> (No Link)</span>
          </div>
        </div>
      }
      {children}
    </div>
  </Col>
)

Showcase.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  link: PropTypes.string
}

export default Showcase
