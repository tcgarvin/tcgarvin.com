import React from 'react'
import { Link, withPrefix } from 'gatsby'
import { Grid, Row, Col } from 'react-bootstrap';

import Layout from '../components/layout'
import Showcase from '../components/showcase';
import Masonry from 'react-masonry-component';

const CodePage = () => (
  <Layout pageTitle="Things I've Done">
    <Grid>
      <Row>
        <Col xs={12}>
          <h2>Things I've Done</h2>
          <p>Time flies, and I try to remember how far I've come. You can browse some of my past and present projects here if you want. Some of them are closed-source, but I've linked to GitHub when possible.</p>
        </Col>
      </Row>
    </Grid>

    <div className="top-thing">
      <Grid>
        <Masonry
          className="row"
          options={{transitionDuration:0}}
        >
          <Showcase title="Protectus Sentry" imageUrl={withPrefix('/images/protectus-thumbnail.png')} link="https://protectus.com/sentry" >
            <p>Built this with my dad.  I did the (Python) web app, he did everything else, and we met in the middle, in MongoDB.</p>
            <p>There's something to be said for building a product from scratch, and really owning it.</p>
            <p>Dad died on October 29th, 2019.  On the first aniversary of his death, I've tried to remember him by open-sourcing some of our code.  <Link to="/trafcap">I put a few words together about it, too.</Link></p>
          </Showcase>
          <Showcase title="Dots" imageUrl="/images/ucd-thumbnail.png">
            <p>At UrbanCode, there was a period of time where we had a lot of trouble tracking work, especially around customer engagement. It's not that the data wasn't there, it's that the tools we had to navigate and understand that data were extremely limited.</p>
            <p>Dots was an experiment in data visualization that would scrape the several systems of record that we cared about, and provide intuitive visualizations for our most common questions.  (Typically, "What am I supposed to work on next", "How is everyone doing", "Is anyone falling behind", "Are there any emergency situations brewing", "Are customer situations staffed correctly", and that sort of thing.)</p>
            <p>This approach ended up being incredibly effective. The experiment was eventually subsumed into a <a href="https://youtu.be/CuDRyRD79Wc?t=65">new UrbanCode product offering.</a></p>
            <p>Now that Dots is dead, I think a lot about spinning it back up for use with generic spreadsheets.</p>
          </Showcase>
          <Showcase title="UrbanCode Deploy" imageUrl={withPrefix('/images/ucd-thumbnail.png')} link="https://developer.ibm.com/urbancode/">
            <p>My friend Matt pulled me onto this team a year or two after their acquisition by IBM. Java, SQL, JMS, Dojo -- a traditional stack.</p>
            <p>I had an opportunity to do just about everything you can do in a large enterprise product team.  From subsystem rewrites to on-site customer troubleshooting sessions to UX design.</p>
          </Showcase>
          <Showcase title="Visualization Talk" imageUrl="/images/vistalk-thumbnail.png" link="https://slides.com/timgarvin/boss-vis/fullscreen#/">
            <p>I had the distinct priviledge of presenting an introductory talk at CodeMash 2020 titled "How To Impress Your Boss with Interactive Visualziations".  In it, I gave an overview of how to approach data visualization in Python (stemming from the Jupyter ecosystem) and in Javascript (stemming from SVG).  Talked about Jupyter, Streamlit, D3, and ObservableHQ.</p>
            <p>The topic was far too broad -- I'll be sure to keep it narrower the next time I apply.  A good experience nonetheless.</p>
          </Showcase>
          <Showcase title="APAR Wizard" imageUrl="/images/ucd-thumbnail.png">
            <p> At IBM, tracking a product bug sometimes required records to be filed in several systems. I wrote a chrome extension to tie together the creation of a few of them.</p>
            <p> This tool saw excellent adoption in my team.  I like to think it saved weeks of developer time during its lifetime.</p>
          </Showcase>
          <Showcase title="Flag Animation" imageUrl="/images/hoc-thumbnail.png" link="http://bl.ocks.org/tcgarvin/6174df7cbdf860d22955">
            <p>Back when House of Cards was a big thing, I got a little excited about it and spent the day getting a d3-based flag animation just right.</p>
          </Showcase>
          <Showcase title="Blackjack Simulation" imageUrl="/images/blackjack-thumbnail.png" link={withPrefix("/html/blackjack.html")}>
            <p>Every few years I get into a blackjack rut. (Mentally, not financially) One year I scratched the itch by spiking out a blackjack simulation.</p>
          </Showcase>
          <Showcase title="Advent of Code" imageUrl="/images/github-thumbnail.png">
            <p>I've enjoyed participating in Advent of Code for the past few years.  It usually takes me ~100 hours for me to get through it, and is well worth the time to keep your algorithmic mind sharp</p>
            <ul>
              <li><a href="https://github.com/tcgarvin/adventOfCode2017">2017</a></li>
              <li><a href="https://github.com/tcgarvin/adventOfCode2018">2018</a> (Did not finish)</li>
              <li><a href="https://github.com/tcgarvin/adventOfCode2019">2019</a></li>
            </ul>
          </Showcase>
          <Showcase title="Wedding Website" imageUrl="/images/github-thumbnail.png" link="https://github.com/tcgarvin/ashleyandtim.us">
            <p>Like all good programers, I made my own wedding site.  Because I set it up with GitHub Pages, is actually still available, which is amazing to me</p>
          </Showcase>
          <Showcase title="Hashnav" imageUrl="/images/github-thumbnail.png" link="https://github.com/tcgarvin/hashnav">
            <p>Really old side project generating a force-directed layout between related hashtags.  Figured out which hashtags were related by using the free Twitter 1% firehose.</p>
            <p>Was pretty much just an excuse to learn Neo4J.</p>
          </Showcase>
        </Masonry>
      </Grid>
    </div>
  </Layout>
)

export default CodePage
