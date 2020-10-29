import React from 'react'
import { Grid, Row, Col } from 'react-bootstrap';

const Header = ({ linkHome, xs, xsOffset, md, mdOffset, lg, lgOffset }) => { 
  xs = xs || 12;
  md = md || xs;
  lg = lg || md;
  xsOffset = xsOffset || 0;
  mdOffset = mdOffset || xsOffset;
  lgOffset = lgOffset || mdOffset;
  
  return <div className="body-header">
    <Grid>
      <Row>
        <Col xs={xs} xsOffset={xsOffset} md={md} mdOffset={mdOffset} lg={lg} lgOffset={lgOffset}>
          {linkHome !== false && <a href="/">tcgarvin.com</a>}
        </Col>
      </Row>
    </Grid>
  </div>
}

export default Header
