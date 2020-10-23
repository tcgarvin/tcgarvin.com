import React from 'react'
import { Grid, Row, Col } from 'react-bootstrap';

const Header = ({ linkHome }) => (
  <div class="body-header">
    <Grid>
      <Row>
        <Col xs={12}>
          {linkHome !== false && <a href="/">tcgarvin.com</a>}
        </Col>
      </Row>
    </Grid>
  </div>
)

export default Header
