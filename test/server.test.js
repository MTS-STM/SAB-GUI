/**
 * @jest-environment node
 */

import request from 'supertest'
import server from '../src/server'

describe('Server Side Rendering', () => {
  // it('renders the landing page at /', async () => {
  //   let response = await request(server).get('/')
  //   expect(response.text).toMatch(
  //     /Requesting a new appointment will cancel your current one./,
  //   )
  // })

  it('renders the register page at /register', async () => {
    let response = await request(server).get('/register')
    expect(response.text).toMatch(/Email/)
  })

  it('renders the calendar page at /calendar', async () => {
    let response = await request(server).get('/calendar')
    expect(response.text).toMatch(
      /Make sure you stay available on the day you selected/,
    )
  })

  xit('renders a reassuring confirmation message at /confirmation', async () => {
    let response = await request(server).get('/confirmation')
    expect(response.text).toMatch('Thank you! Your request has been received.')
  })

  it('has xss protection', async () => {
    let response = await request(server).get('/')
    expect(response.header['x-xss-protection']).toEqual('1; mode=block')
  })

  it('has nosniff enabled', async () => {
    let response = await request(server).get('/')
    expect(response.header['x-content-type-options']).toEqual('nosniff')
  })

  it('has frame protection', async () => {
    let response = await request(server).get('/')
    expect(response.header['x-frame-options']).toEqual('DENY')
  })

  it('has an HSTS header', async () => {
    let response = await request(server).get('/')
    expect(response.header['strict-transport-security']).toEqual(
      'max-age=15552000; includeSubDomains',
    )
  })

  xit('has our expected Content Security Policy', async () => {
    let response = await request(server).get('/')
    expect(response.header['content-security-policy']).toEqual(
      "default-src 'self'; font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https://www.google-analytics.com; " +
        "script-src 'self' https://cdn.ravenjs.com https://www.google-analytics.com 'unsafe-inline'; " +
        "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
    )
  })

  it('doesn’t let on it’s an express app', async () => {
    let response = await request(server).get('/')
    expect(response.header['x-powered-by']).toBeUndefined()
  })
})
