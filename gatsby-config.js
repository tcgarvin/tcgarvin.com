const bootstrap = require("bootstrap-styl");

module.exports = {
  siteMetadata: {
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui'
      },
    },
    {
      resolve: 'gatsby-plugin-stylus',
      options: {
        use: [bootstrap()]
      }
    },
    {
      resolve: `gatsby-plugin-gtag`,
      options: {
        trackingId: `G-G2ZCNG9K9C`,
      },
    },
    'gatsby-plugin-offline'
  ],
}
