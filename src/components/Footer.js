import React from 'react'
import PropTypes from 'prop-types'
import { Trans, withI18n } from '@lingui/react'
import CanadaWordmark from '../assets/CanadaWordmark.svg'
import styled from '@emotion/styled'
import { css } from 'emotion'
import {
  theme,
  horizontalPadding,
  mediaQuery,
  visuallyhiddenMobileMedium,
} from '../styles'
import Language from './Language'
import { NavLink } from 'react-router-dom'
import Landscape from '../assets/landscape .png'

const footer = css`
  ${horizontalPadding};
  background-color: ${theme.colour.white};
  padding-top: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  position: relative;
  font-size: ${theme.font.md};

  .svg-container {
    width: 150px;
    height: 40px;
    padding-top: ${theme.spacing.xs};
    margin-bottom: ${theme.spacing.sm};

    ${mediaQuery.md(css`
      width: 100px;
      height: 25px;
      padding-top: 0;
      margin-bottom: 0;
    `)};

    ${mediaQuery.sm(css`
      width: 80px;
      height: 18px;
      padding-top: ${theme.spacing.xs};
      margin-bottom: ${theme.spacing.xs};
    `)};

    ${mediaQuery.xs(css`
      width: 70px;
      height: 15px;
      padding-top: ${theme.spacing.xs};
      margin-bottom: ${theme.spacing.xs};
    `)};

  ${mediaQuery.md(css`
    align-items: center;
  `)};

  ${mediaQuery.sm(css`
    padding-top: ${theme.spacing.md};
    padding-bottom: ${theme.spacing.lg};
  `)};
`

const bottomLinks = css`
  margin-top: ${theme.spacing.md};
  font-size: ${theme.font.sm};

  display: inline-block;
  column-count: 5;

  > * {
    margin-right: ${theme.spacing.md};

    ${mediaQuery.md(css`
      margin-right: ${theme.spacing.md};

      font-size: ${theme.font.xs};
    `)};

    ${mediaQuery.sm(css`
      margin-bottom: ${theme.spacing.xs};
      font-size: ${theme.font.xs};
      column-count: 1;
    `)};
  }

  a {
    color: ${theme.colour.black};
  }

  a:nth-of-type(2) {
    color: ${theme.colour.black};
  }

  ${mediaQuery.md(css`
    display: flex;
    margin-top: ${theme.spacing.sm};
    font-size: ${theme.font.xs};
  `)};

  ${mediaQuery.sm(css`
    margin-top: ${theme.spacing.sm};
  `)};
`

const TopBar = styled.hr(
  {
    height: '160px',
    border: 'none',
    margin: 0,
    backgroundImage: `url(${Landscape})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right',
    backgroundColor: '#27374a',
  },
  props => ({ background: props.background }),
)

const Footer = ({ contact = true, topBarBackground, i18n }) => (
  <div>
    {topBarBackground ? <TopBar background={topBarBackground} /> : ''}
    <footer id="footer" className={footer}>
      <div>
        <ul className={bottomLinks}>
          <li>
            {' '}
            <a href={'https://www.canada.ca/en/government/about.html'}>
              <Trans>About</Trans>
              <Language
                render={language =>
                  language === 'fr' ? null : (
                    <span className={visuallyhiddenMobileMedium}>
                      {' '}
                      Canada.ca
                    </span>
                  )
                }
              />
            </a>
          </li>

          <li>
            {' '}
            <a href={'https://www.canada.ca/en/social.html'}>
              <Trans>Social</Trans>
              <Language
                render={language =>
                  language === 'fr' ? null : (
                    <span className={visuallyhiddenMobileMedium}> media</span>
                  )
                }
              />
            </a>
          </li>

          <li>
            {' '}
            <a href={'https://www.canada.ca/en/mobile.html'}>
              <Trans>Mobile</Trans>
              <Language
                render={language =>
                  language === 'fr' ? null : (
                    <span className={visuallyhiddenMobileMedium}>
                      {' '}
                      applications
                    </span>
                  )
                }
              />
            </a>
          </li>

          <li>
            {' '}
            <a href={i18n._('https://digital.canada.ca/legal/terms/')}>
              <Trans>Terms</Trans>
              <Language
                render={language =>
                  language === 'fr' ? null : (
                    <span className={visuallyhiddenMobileMedium}>
                      {' '}
                      and Conditions
                    </span>
                  )
                }
              />
            </a>
          </li>

          <li>
            {' '}
            <NavLink to="/privacy">
              <Trans>Privacy</Trans>
            </NavLink>{' '}
          </li>
        </ul>
      </div>

      <div className="svg-container">
        <Language
          render={language => (
            <img
              src={CanadaWordmark}
              alt={
                language === 'en'
                  ? 'Symbol of the Government of Canada'
                  : 'Symbole du gouvernement du Canada'
              }
            />
          )}
        />
      </div>
    </footer>
  </div>
)

Footer.propTypes = {
  topBarBackground: PropTypes.string,
  i18n: PropTypes.object,
  contact: PropTypes.bool,
}

const FooterI18n = withI18n()(Footer)

export { FooterI18n as default, Footer as FooterBase }
