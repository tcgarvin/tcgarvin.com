import React from 'react'
import { Link } from 'gatsby'
import { withPrefix } from 'gatsby-link'

import Layout from '../components/layout'
//import TopThing from '../components/topthing'
import { Grid, Row, Col } from 'react-bootstrap';



const IndexPage = () => (
  <Layout
    pageTitle="Hello"
    description="Personal site of Tim Garvin"
    linkHome={false}
  >
    <div className="top-thing">
      <Grid>
        <Row>
          <Col xs={5} sm={6} className="text-right">
            <img alt="Tim" className="userpic" src={withPrefix("images/me.jpg")}/>
          </Col>
          <Col xs={7} sm={6} className="text-left">
            <h1>Hello,<br/>I'm Tim<span className="hidden-xs">.</span></h1>
          </Col>
        </Row>
      </Grid>
    </div>
    <Grid>
      <Row>
        <Col xs={12} md={8} mdOffset={2}>
          <p>You've stumbled upon an experimental site that I've put up using <a href="https://www.gatsbyjs.org/">Gatsby</a> and <a href="https://www.netlify.com/">Netlify</a>.  You won't find much content, though there may be some tech demos here and there.</p>
          <h2 className="under-top=thing">About Me</h2>
          <p>I'm a rapid prototyper at PricewaterhouseCoopers. Prior to that, I made my living writing DevOps tools at IBM. I was also heavily involved in the creation of the <a href="http://protectus.com/sentry">Protectus Sentry</a>, a product I still love, use, and support.</p>
          <p>Non-code things I'm involved in include <a href="http://thefest.us">The FEST</a>, getting to know my lovely wife and son, being a studious Catholic, and riding the bus.</p>
          <p>Check out some <Link to="/code/">side projects and code spikes</Link> that I play around with.</p>
        </Col>
      </Row>
    </Grid>
  </Layout>
)

export default IndexPage
