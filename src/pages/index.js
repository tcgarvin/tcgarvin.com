import React from 'react'
import { Link } from 'gatsby'
import { withPrefix } from 'gatsby-link'

import Layout from '../components/layout'
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
          <p>You've stumbled upon my personal site.  There's not much content to be seen, aside from a listing of projects below.</p>
          <h2 className="under-top-thing">About Me</h2>
          <p>I'm a rapid prototyper at PwC. Prior to that, I made my living developing and brainstorming DevOps tools at IBM.  Straight out of school, my dad and I co-developed the <a href="http://protectus.com/sentry">Protectus Sentry</a>, a product that's still in the wild today.</p>
          <p>Non-code things I'm involved in include <a href="http://thefest.us">The FEST</a>, getting to know my lovely wife and two sons, being a studious Catholic, and riding the bus.</p>
          <h2>Things I've Done</h2>
          <p>Time has flown since I started out, and I've picked up a few things along the way. You can browse some of them on my <Link to="/code">Projects Page</Link>.</p>
        </Col>
      </Row>
    </Grid>
  </Layout>
)

export default IndexPage
