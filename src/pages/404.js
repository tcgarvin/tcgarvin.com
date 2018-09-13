import React from 'react'
import Layout from '../components/layout'
import { Grid, Row, Col } from 'react-bootstrap';

const NotFoundPage = () => (
  <Layout>
    <Grid>
      <Row>
        <Col xs={12} md={8} mdOffset={2}>
          <h1>I suck.</h1>
          <p>This page doesn't exist, and there's a good chance I don't even know.</p>
          <p>( You should tell me <a href="https://twitter.com/tcgarvin">@tcgarvin</a> )</p>
        </Col>
      </Row>
    </Grid>
  </Layout>
)

export default NotFoundPage
