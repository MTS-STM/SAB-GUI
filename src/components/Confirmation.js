import React from 'react'
import PropTypes from 'prop-types'
import styled from '@emotion/styled'
import { theme } from '../styles'
import { Trans, withI18n } from '@lingui/react'
import { SelectedDayList } from './SelectedDayList'
import { SummaryRow } from './SummaryRow'


const TableContainer = styled.div`
  margin: ${theme.spacing.lg} 0;

  h2 {
    font-size: ${theme.font.md};
    margin-top: 0;
  }
`

const Review = ({
  fullName,
  paperFileNumber,
  email,
  location,
  selectedDays,
  i18n,
}) => (
  <TableContainer>
    <SummaryRow
      summaryHeader={<Trans>Full name</Trans>}
      summaryBody={fullName}
      summaryLink={''}
      summaryLabel={''}
    />
    <SummaryRow
      summaryHeader={<Trans>Email</Trans>}
      summaryBody={email}
      summaryLink={''}
      summaryLabel={''}
    />
    <SummaryRow
      summaryHeader={<Trans>Paper file number</Trans>}
      summaryBody={paperFileNumber}
      summaryLink={''}
      summaryLabel={''}
    />

    <SummaryRow
      summaryHeader={<Trans>Location</Trans>}
      summaryBody={location}
      summaryLink={''}
      summaryLabel={''}
    />
    <SummaryRow
      summaryHeader={<Trans>Availability</Trans>}
      summaryBody={<SelectedDayList selectedDays={selectedDays} />}
      summaryLink={''}
      summaryLabel={''}
    />
  </TableContainer>
)

Review.propTypes = {
  fullName: PropTypes.string,
  paperFileNumber: PropTypes.string,
  email: PropTypes.string,
  location: PropTypes.string,
  selectedDays: PropTypes.array,
  i18n: PropTypes.object,
}

const ReviewI18n = withI18n()(Review)

export { ReviewI18n as default, SelectedDayList }