import React from 'react'
import { withPrefix } from 'gatsby'
import { Grid, Row, Col } from 'react-bootstrap';

import Layout from '../components/layout'

const CodePage = () => (
  <Layout pageTitle="Mourning My Father by Open Sourcing Our Code">
    <Grid>
      <Row>
        <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
          <h1>Mourning My Father by Open Sourcing Our Code</h1>
          <img alt="Pete Garvin" width="100%" src={withPrefix("images/dad-compressed.jpg")}/>
          <p><em>Tl;dr: I miss my dad.  I published some of the code we wrote together.</em></p>

          <h3>Background</h3>
          <p>The phone call was short.  I asked how he was feeling, and if they had figured out what was going on yet. Dad evaded. They were still getting answers, he said. That was all I needed to hear.  I walked to the nearby park in the Fall air, sat on a bench under a remote tree, and lost my composure.</p>

          <p>Sobbing is a really weird sound. Gasps and sniffs, heaves, tears, borderline hyperventilation. It was strange hearing these sounds come from me, especially when I had nothing more than my gut to inform my fears. I'd heard it in his voice.</p> 

          <p>Everything was not alright. The world was ending.</p>

          <p>As I grew up, it always seemed a little irrational to me that my deepest terror was losing my dad. At 15 years old, then 20, 25, I never really heard anyone around me talking about how important their dads were to them, and besides, it’s natural that a son lose his father, rather than a father lose his son. Right? And yet, even after the birth of my own sons reoriented my hopes and fears, the only anxiety late at night that could consistently latch onto my mind and not let go was how much I couldn’t bear to lose Dad.  Now my literal nightmares materialized.</p>

          <p>Pete Garvin, my dad, died of cancer 4 weeks after that phone call.</p>

          <h2>My Motivations, In Brief</h2>
          <p>Before he fell ill, Dad and I would meet one evening a week at his office in Akron and work on little things around his company, <a href="https://www.protectus.com">Protectus LLC</a>.  I had helped him build the technology side of the company for a couple of years when I got out of school, and the weekly get together was a good way to exercise parts of my brain that my full-time jobs did not.  It wasn’t lost on me how privileged I was to spend so much time literally being paid to hang out with my own father.  When I look at my career so far, I can trace my success to 3 people.  Dad is at the top of that list.</p>

          <p>I want Dad to be here with me.  I want him to look over my shoulder at this stupid website and ask me why the site styling is light on dark.  I want to find a way to keep a part of him alive with me, just a little longer.</p> 
          <p>So, I’m trying to finalize our last project together.</p>

          <h2>The Project</h2>
          <p>Protectus was built around a product called <a href="https://www.protectus.com/sentry/">the Sentry</a>.  At its core, the Sentry is a combination network sensor and analytics engine.  It reads bytes off the wire, does some deep (and shallow) packet inspection, and dumps information into a local MongoDB database for post-hoc analysis.  Then there’s a web app that facilitates queries and reports.  I wrote the frontend right out of school, and Dad took responsibility for the ingest script.  We designed everything together, spent untold hours in front of the whiteboard diagramming, discussing, and deciding.</p>
          <br></br>

          <p>
          <img alt="Dad's whiteboard" width="100%" src={withPrefix("images/whiteboard-compressed.jpg")}/>
          <em><small>This is the last whiteboarding Dad and I did.  Notice the contributions for/by my son in the corner.  I can't bring myself to erase any of it.</small></em></p>

          <p>Neither of us were rockstar developers.  Dad’s coding style was informed by C code from the 80s and 90s, with lots of illegible variable names and clever routines that didn't always explain what they were doing.  My code architecture was overly clever and immature, abusing inheritance trees and creating all sorts of extranious abstractions that probably have not aged well.</p>

          <p>We did do some things right, and shipped new Sentry devices to all our existing customers with a year or two of my coming on board.</p>

          <p>The Sentry was not a big commercial success.  I left the company for IBM, and Dad eventually decided to shift cleanly from a product + services company to just a services company.  The Sentry stopped being the main event for the company, and began to be spoken of as just a tool in the toolbox.</p>

          <p>Part of the shift in the Sentry strategy was to open source core parts of the product.  We started with the ingest scripts.  This involved cleaning up the code a bit, and doing some careful git history surgery.  The idea was to publish not just the code, but ship a `pip install`-able module on PyPi.</p>

          <p>I’ve given up on shipping an installable Python module.  PF_RING dropped their repo for the version of Ubuntu we were using to build on Travis, and I don’t have the time or interest to keep the build running.  But I do want to share the code.</p>

          <p><a href="https://github.com/protectus/pfring-to-mongo">Here's the code.</a></p>

          <h2>Seeing Dad in the Code</h2>
          <p>In preparing the code to be released, I spent some time browsing git history and its contents.  At first I was caught off guard by how potent seeing his comments was.  It’s not like he left jokes around or anything, but this this codebase (including a lot that I’m not open sourcing today) has his heart and soul in it.</p>

<pre>
# Adding vlan id - PFG - April 2014
# No way of knowing how long the packet is so add vlan id after timestamp.
# If field after timestamp contains dots or colons, then it is a src (mac or ip).
# Otherwise, it must be a vlan id.
if pkt and not doc:
    # If no vlan id present
    if b'.' in pkt[1] or b':' in pkt[1]:
        if pkt[4] in pc.leaked_protos_to_ignore: return (), []
        msg = pkt[5]
        for i in range(6, len(pkt), 1):
            msg = msg + b" " + pkt[i]
            # Ensure msg length does not exceed Mongo's Index Key Limit
            if len(msg) > 512: 
                msg = msg[:512] + b'...'
                break
</pre>

https://github.com/protectus/pfring-to-mongo/blob/673415fb721e879f2b3aac9da52dd0454f29f111/trafcap/trafcapEthernetPacket.py#L268

          <p>Dad’s code could be incredibly, uh, organic.  It is exactly what you would expect from a solo C programmer certa 1990, which is basically what dad was.  He would write a passable algorithm the first time, and then tweaked it with if statements over time, resulting in code that was less and less maintainable.  Even though we were working in Python (which I think he really liked), his code structure was the good old C standby of “throw a bunch of functions into a file”.  The mess of code above started out more copacetically.</p>

<pre>
# Adding vlan id - PFG - April 2014
# No way of knowing how long the packet is so add vlan id after timestamp.
# If field after timestamp contains dots or colons, then it is a src (mac or ip).
# Otherwise, it must be a vlan id.
         
if pkt and not doc:
    # If no vlan id present
    if '.' in pkt[1] or ':' in pkt[1]:
        msg = pkt[5]
        for i in range(6, len(pkt), 1):
            msg = msg + " " + pkt[i]
</pre>

https://github.com/protectus/pfring-to-mongo/blob/821b42c5a8c68b0f2ca4b50773f391724eeea592/python/protectus-sentry/protectus_sentry/trafcap/trafcapEthernetPacket.py#L233

          <p>... Still not beautiful, and you have to know what pkt and doc are, because they’re definitely not self-documenting, but you know, better.</p>

          <p>And the stuff really worked. Dad understood better than most the value of simplicity in software architecture.  Even though our system was spread across several processes, and each process might interact directly with the database, a pattern that elicits shrieks of rage from most software designers I know, every interaction was well documented and the documentation strictly updated.  The flow of data was one-directional, and the state space was kept under tight control.  We were careful not to introduce too many dependencies.  The only frameworks we used were Debian Packaging, Pyramid, and BackboneJS.  Everything else was a library.  Though much of it was handwritten, the documentation was at least as good as any enterprise dev team I’ve ever encountered. (Though not as good as most open source projects I’ve seen)</p>

          <p>As we scaled the Sentry onto higher volume networks, Python started to groan a bit under the load.  I ported a bunch of his ingest code to Cython over a few months, and Lo, his “let’s code this like it’s C” approach fit really intuitively with Cython’s “let’s turn this into C” approach.</p>

          <p>You can’t buy the kind of startup experience I got working with Dad.  Every mistake I made, every design decision, I was the one who had to take responsibility with the repercussions, just because we were a two-man shop, and he trusted me.  I haven’t found that kind of learning environment anywhere else.</p>

          <p>Technical things I learned from or with Dad:
          <ul> 
            <li>Early on we recognized the value a monorepo could bring, years before anyone used that word</li>
            <li>I hammered together a CI/CD pipeline from batch scripts. We judged Jenkins to be more infrastructure than we needed</li>
            <li>Instead of local environments, we developed remotely on the same hardware that would actually host the code in production, sidestepping an entire class of deployment issues</li>
            <li>We maintained multiple release channels and used feature flags to let us quickly respond to customers who wanted more now, without endangering customers who were happy with stability</li>
            <li>We managed an entire fleet of machines with only a few hours a month to coordinate software upgrades</li>
          </ul>
          </p>

          <p><strong>More important yet</strong> was the concept working with Dad gave me that wearing lots of hats is fun.  If you're reading this because you're wondering if I'd be a good fit at your company, just know that I will probably not be happy doing only one kind of work.  With Dad, I:
          <ul>
            <li>Slung Code</li>
            <li>Administered a Xen VM farm</li>
            <li>Designed a product UI</li>
            <li>Obtained my GPEN certification and performed pen testing against clients (because we were a security company)</li>
            <li>Used my own product to monitor client networks for security incidents</li>
            <li>Solicited customer feedback to improve my product</li>
            <li>Designed implimented and shipped a marketing site (yes it's bad, but it's mine)</li>
            <li>Designed and chose chips for a custom form factor Ethernet tap, and worked with the hardware design firm to design and then test their prototypes</li>
          </ul>
          </p>

          <p><strong>Even more important yet</strong> were the non-work things Dad taught me.  But that's a little out of scope today.</p>

          <h2>I guess that’s all</h2>
          <p>When I was little, I wanted to be just like my dad. I’m still trying to be. It breaks my heart daily that my sons will not have the chance to know him.  I wish I could bring him back, but the best I can do is post some of his old code online.</p>

        </Col>
      </Row>
    </Grid>
  </Layout>
)

export default CodePage
