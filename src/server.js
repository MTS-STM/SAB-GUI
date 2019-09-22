import express from 'express'
import http from 'http'
import cookieParser from 'cookie-parser'
import { getStoreCookie } from './cookies'
import { render } from '@jaredpalmer/after'
import { renderToString } from 'react-dom/server'
import routes from './routes'
import Document from './Document'
import path from 'path'
import { renderStylesToString } from 'emotion-server'
import bodyParser from 'body-parser'
import {
  getPrimarySubdomain,
  ensureLocation,
  setRavenContext,
  cspConfig,
} from './utils/serverUtils'
import gitHash from './utils/gitHash'

// eslint-disable-next-line security/detect-non-literal-require
const assets = require(process.env.RAZZLE_ASSETS_MANIFEST ||
  path.join(process.cwd(), 'build', 'assets.json'))

const server = express()
const helmet = require('helmet')
const apiHost = process.env.CONNECTION_STRING

server
  .use(helmet()) // sets security-focused headers: https://helmetjs.github.io/
  .use(helmet.frameguard({ action: 'deny' })) // Sets "X-Frame-Options: DENY".
  .use(helmet.contentSecurityPolicy({ directives: cspConfig }))
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR || './public'))
  .use(getPrimarySubdomain)
  .use(setRavenContext)
  .use(ensureLocation)
  .use(cookieParser())
  .use(bodyParser.urlencoded({ extended: false }))
  .get('/locations/:province', (req, res) => {
    let data = ''
    let province = req.params.province
    http
      .get(`${apiHost}/locationsbyprov/${province}`, resp => {
        // eslint-disable-next-line no-console
        console.log(`STATUS: ${resp.statusCode}`)
        // eslint-disable-next-line no-console
        console.log(`HEADERS: ${JSON.stringify(resp.headers)}`)
        resp.on('data', chunk => {
          data += chunk
          res.status(200).send(data)
        })
      })
      .on('error', err => {
        // eslint-disable-next-line no-console
        console.log(
          'Something went wrong when calling the API in locations/province: ' +
            err.message,
        )
      })
  })
  .get('/locations/:province/:city', (req, res) => {
    let data = ''
    let province = req.params.province
    let city = req.params.city || ''
    http
      .get(`${apiHost}/locationsbyprov/${province}/${city}`, resp => {
        // eslint-disable-next-line no-console
        console.log(`STATUS: ${resp.statusCode}`)
        // eslint-disable-next-line no-console
        console.log(`HEADERS: ${JSON.stringify(resp.headers)}`)
        resp.on('data', chunk => {
          data += chunk
          res.status(200).send(data)
        })
      })
      .on('error', err => {
        // eslint-disable-next-line no-console
        console.log(
          'Something went wrong when calling the API in locations/province/city: ' +
            err.message,
        )
      })
  })
  .get('/appointments/:locationID/:date', (req, res) => {
    let data = ''
    let locationID = req.params.locationID
    let date = req.params.date
    http
      .get(`${apiHost}/appointments/${locationID}/${date}`, resp => {
        // eslint-disable-next-line no-console
        console.log(`STATUS: ${resp.statusCode}`)
        // eslint-disable-next-line no-console
        console.log(`HEADERS: ${JSON.stringify(resp.headers)}`)
        resp.on('data', chunk => {
          data += chunk
          res.status(200).send(data)
        })
      })
      .on('error', err => {
        // eslint-disable-next-line no-console
        console.log(
          'Something went wrong when calling the API appointments/locationID/city:  ' +
            err.message,
        )
      })
  })
  .get('/clear', (req, res) => {
    let language = getStoreCookie(req.cookies, 'language') || 'en'
    res.clearCookie('store')
    res.redirect(`/cancel?language=${language}`)
  })
  .all('/*', async (req, res) => {
    const customRenderer = node => ({
      gitHashString: gitHash(),
      path: req.url,
      html: renderStylesToString(renderToString(node)),
    })
    try {
      const html = await render({
        req,
        res,
        routes,
        assets,
        customRenderer,
        document: Document,
      })

      return res.locals.redirect
        ? res.redirect(res.locals.redirect)
        : res.send(html)
    } catch (error) {
      console.log(error.message, error.stack) // eslint-disable-line no-console
      res.redirect('/error')
    }
  })

export default server
