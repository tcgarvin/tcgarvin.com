import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
//import TopThing from '../components/topthing'
import { Grid, Row, Col } from 'react-bootstrap';



const IndexPage = () => (
  <Layout linkHome={false}>
    <Grid>
      <Row>
        <Col xs={12} md={8} mdOffset={2}>
          <p>You've stumbled upon an experimental site that I've put up using <a href="https://www.gatsbyjs.org/">Gatsby</a>.  You won't find much content, though there may be some tech demos here and there.</p>
        </Col>
      </Row>
    </Grid>
    
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <Link to="/page-2/">Go to page 2</Link>
  </Layout>
)

export default IndexPage
