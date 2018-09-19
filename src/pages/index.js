import React from 'react'
import { Link } from 'gatsby'
import { withPrefix } from 'gatsby-link'

import Layout from '../components/layout'
//import TopThing from '../components/topthing'
import { Grid, Row, Col } from 'react-bootstrap';



const IndexPage = () => (
  <Layout pageTitle="Hello" linkHome={false}>
    <Grid>
      <Row>
        <Col xs={12} md={8} mdOffset={2}>
          <p>You've stumbled upon an experimental site that I've put up using <a href="https://www.gatsbyjs.org/">Gatsby</a> and <a href="https://www.netlify.com/">Netlify</a>.  You won't find much content, though there may be some tech demos here and there.</p>
          <h2 className="under-top=thing">About Me</h2>
          <p>I'm presently employed with <a href="https://www.pwc.com">PricewaterhouseCoopers</a>. Prior to that, I made my living writing <a href="https://www.ibm.com/us-en/marketplace/application-release-automation">DevOps tools</a> for IBM. I was also heavily involved in the creation of the <a href="http://protectus.com/sentry">Protectus Sentry</a>, a product I still love, use, and support.</p>
          <p>Non-code things I'm involved in include <a href="http://thefest.us">The FEST</a>, getting to know my lovely wife and son, being a studious Catholic, and riding the bus.</p>
          <p>I've also got a few <Link to="/code/">side projects and code spikes</Link> that I play around with.</p>
          <p>Test <a href={withPrefix("/html/blackjack.html")}>Blackjack</a></p>
        </Col>
      </Row>
    </Grid>
  </Layout>
)

export default IndexPage
